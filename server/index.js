import express from 'express';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tables, publicRead, boolCols, ddl } from './schema.js';

const PORT = Number(process.env.PORT || 8080);
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) console.warn('[server] JWT_SECRET not set; sessions reset on restart');

const dbUrl =
  process.env.MYSQL_URL ||
  process.env.DATABASE_URL ||
  'mysql://root:root@127.0.0.1:3306/railway';

const pool = mysql.createPool({
  uri: dbUrl,
  connectionLimit: 10,
  charset: 'utf8mb4',
  timezone: 'Z',
  typeCast(field, next) {
    if (field.type === 'DATE') return field.string();
    if (field.type === 'TINY' && field.length === 1) {
      const v = field.string();
      return v === null ? null : v === '1';
    }
    return next();
  },
});

async function init() {
  const fatal = new Set(['ER_ACCESS_DENIED_ERROR', 'ER_ACCESS_DENIED_NO_PASSWORD_ERROR', 'ER_BAD_DB_ERROR', 'ER_DBACCESS_DENIED_ERROR']);
  for (let i = 0; ; i++) {
    try { await pool.query('SELECT 1'); break; }
    catch (e) {
      if (fatal.has(e.code)) {
        console.error(`[server] MySQL menolak koneksi (${e.code}): ${e.message}`);
        console.error('[server] Periksa MYSQL_URL di .env. Untuk dev lokal jalankan: npm run db:local');
        throw e;
      }
      if (i >= 30) throw e;
      console.log(`[server] waiting for MySQL (${e.code})...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  for (const s of ddl()) await pool.query(s);
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [ADMIN_EMAIL]);
    if (rows.length) await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [hash, ADMIN_EMAIL]);
    else await pool.query('INSERT INTO users (id, name, email, password_hash) VALUES (?,?,?,?)', [crypto.randomUUID(), 'Admin', ADMIN_EMAIL, hash]);
    console.log('[server] admin user ready:', ADMIN_EMAIL);
  } else {
    console.warn('[server] ADMIN_EMAIL/ADMIN_PASSWORD not set; no admin login available');
  }
}

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '2mb' }));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => {
  console.error(e);
  res.status(e.status || 500).json({ error: e.status ? e.message : 'Internal server error' });
});

function authUser(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  try { return jwt.verify(h.slice(7), JWT_SECRET); } catch { return null; }
}
const requireAdmin = (req, res, next) => {
  const u = authUser(req);
  if (!u || u.role !== 'admin') return res.status(401).json({ error: 'Unauthorized' });
  req.user = u;
  next();
};

// ---- auth ----
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
function tooManyAttempts(key) {
  const now = Date.now();
  const list = (loginAttempts.get(key) || []).filter((t) => now - t < LOGIN_WINDOW_MS);
  if (list.length >= LOGIN_MAX_ATTEMPTS) return true;
  list.push(now);
  loginAttempts.set(key, list);
  return false;
}

app.post('/api/auth/login', wrap(async (req, res) => {
  const { email, password } = req.body || {};
  const key = String(email || '').trim().toLowerCase() || 'anonymous';
  if (tooManyAttempts(key)) {
    return res.status(429).json({ error: 'Terlalu banyak percobaan login. Coba lagi beberapa menit.' });
  }
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email || '']);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(String(password || ''), u.password_hash))) {
    return res.status(401).json({ error: 'Email atau password salah.' });
  }
  loginAttempts.delete(key);
  const user = { id: u.id, email: u.email, name: u.name, role: u.role };
  res.json({ token: jwt.sign(user, JWT_SECRET, { expiresIn: '7d' }), user });
}));
app.get('/api/auth/me', (req, res) => {
  const u = authUser(req);
  if (!u) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ user: { id: u.id, email: u.email, name: u.name }, isAdmin: u.role === 'admin' });
});

// ---- generic table API ----
function tableOf(req) {
  const t = req.params.table;
  if (!Object.hasOwn(tables, t)) throw Object.assign(new Error('Unknown table'), { status: 404 });
  return t;
}
const colsOf = (t) => new Set(['id', 'created_at', 'updated_at', ...Object.keys(tables[t])]);

app.get('/api/t/:table', wrap(async (req, res) => {
  const t = tableOf(req);
  const cols = colsOf(t);
  const admin = authUser(req)?.role === 'admin';
  // Tabel tanpa aturan baca publik bersifat tertutup untuk pengunjung.
  if (!admin && !Object.hasOwn(publicRead, t)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const where = [];
  const args = [];
  for (const [k, v] of Object.entries(req.query)) {
    if (!k.startsWith('eq.')) continue;
    const c = k.slice(3);
    if (!cols.has(c)) throw Object.assign(new Error('Bad column'), { status: 400 });
    where.push(`\`${c}\` = ?`);
    args.push(v === 'true' ? 1 : v === 'false' ? 0 : v);
  }
  if (!admin && publicRead[t]) where.push(publicRead[t]);
  let sql = `SELECT * FROM \`${t}\``;
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  if (req.query.order) {
    const [c, dir] = String(req.query.order).split('.');
    if (!cols.has(c)) throw Object.assign(new Error('Bad column'), { status: 400 });
    sql += ` ORDER BY \`${c}\` ${dir === 'asc' ? 'ASC' : 'DESC'}`;
  }
  const [rows] = await pool.query(sql, args);
  res.json(rows);
}));

function cleanBody(t, body, isCreate) {
  const cols = colsOf(t);
  const out = {};
  for (const [k, v] of Object.entries(body || {})) {
    if (['id', 'created_at', 'updated_at'].includes(k) || !cols.has(k) || v === undefined) continue;
    out[k] = boolCols.has(k) ? (v ? 1 : 0) : v === '' ? null : v;
  }
  return out;
}
async function fetchOne(t, id) {
  const [rows] = await pool.query(`SELECT * FROM \`${t}\` WHERE id = ?`, [id]);
  return rows[0];
}

app.post('/api/t/:table', wrap(async (req, res) => {
  const t = tableOf(req);
  const admin = authUser(req)?.role === 'admin';
  let data = cleanBody(t, req.body, true);
  if (!admin) {
    if (t !== 'guestbooks') return res.status(401).json({ error: 'Unauthorized' });
    const text = (v) => (typeof v === 'string' ? v.trim() : '');
    const name = text(data.name);
    const message = text(data.message);
    const email = text(data.email) || null;
    if (!name) return res.status(400).json({ error: 'Nama wajib diisi.' });
    if (!message) return res.status(400).json({ error: 'Pesan wajib diisi.' });
    if (name.length > 255) return res.status(400).json({ error: 'Nama maksimal 255 karakter.' });
    if (message.length > 2000) return res.status(400).json({ error: 'Pesan maksimal 2000 karakter.' });
    if (email && (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return res.status(400).json({ error: 'Format email tidak valid.' });
    }
    data = { name, email, message, is_approved: 0, ip_address: req.ip };
  }
  const id = crypto.randomUUID();
  const keys = Object.keys(data);
  await pool.query(
    `INSERT INTO \`${t}\` (id${keys.map((k) => `, \`${k}\``).join('')}) VALUES (?${keys.map(() => ',?').join('')})`,
    [id, ...keys.map((k) => data[k])],
  );
  res.status(201).json(await fetchOne(t, id));
}));

app.patch('/api/t/:table/:id', requireAdmin, wrap(async (req, res) => {
  const t = tableOf(req);
  const data = cleanBody(t, req.body, false);
  const keys = Object.keys(data);
  if (keys.length) {
    await pool.query(`UPDATE \`${t}\` SET ${keys.map((k) => `\`${k}\` = ?`).join(', ')} WHERE id = ?`, [...keys.map((k) => data[k]), req.params.id]);
  }
  const row = await fetchOne(t, req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
}));

app.delete('/api/t/:table/:id', requireAdmin, wrap(async (req, res) => {
  const t = tableOf(req);
  await pool.query(`DELETE FROM \`${t}\` WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
}));

// ---- file storage (kept in MySQL, so it lives on the MySQL volume) ----
const safePath = (p) => {
  const n = path.posix.normalize(String(p || '')).replace(/^\/+/, '');
  if (!n || n.startsWith('..') || n.length > 500) throw Object.assign(new Error('Bad path'), { status: 400 });
  return n;
};
app.post('/api/storage', requireAdmin, upload.single('file'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const p = safePath(req.body.path);
  await pool.query(
    'REPLACE INTO files (path, mime, data) VALUES (?,?,?)',
    [p, req.file.mimetype || 'application/octet-stream', req.file.buffer],
  );
  res.status(201).json({ path: p });
}));
app.delete('/api/storage', requireAdmin, wrap(async (req, res) => {
  const paths = [].concat(req.body?.paths || []).map(safePath);
  if (paths.length) await pool.query('DELETE FROM files WHERE path IN (?)', [paths]);
  res.json({ ok: true });
}));
app.get('/uploads/*splat', wrap(async (req, res) => {
  const p = safePath(decodeURIComponent(req.path.replace(/^\/uploads\//, '')));
  const [rows] = await pool.query('SELECT mime, data FROM files WHERE path = ?', [p]);
  if (!rows.length) return res.status(404).end();
  res.set('Content-Type', rows[0].mime);
  res.set('Cache-Control', 'public, max-age=3600');
  res.set('X-Content-Type-Options', 'nosniff');
  res.send(rows[0].data);
}));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

app.get('/healthz', (_req, res) => res.send('ok'));

// ---- static SPA ----
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'build');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*splat', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

init().then(() => app.listen(PORT, '0.0.0.0', () => console.log(`[server] listening on :${PORT}`)))
  .catch((e) => { console.error('[server] init failed', e); process.exit(1); });

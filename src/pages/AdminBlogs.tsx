import { useState } from 'react';
import { useBlogs } from '../hooks/useBlogs';
import { Plus, Trash2, Edit3, Image } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { getPublicUrl } from '../hooks/useStorage';
import { useFilePreview } from '../hooks/useFilePreview';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import type { Blog } from '../hooks/useBlogs';

const AdminBlogs = () => {
  const { blogs, loading, createBlog, updateBlog, deleteBlog } = useBlogs();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmThumbnail, setConfirmThumbnail] = useState<string | undefined>(undefined);

  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    thumbnail: '',
    thumbnailFile: null as File | null,
    published_at: new Date().toISOString().split('T')[0],
    is_published: true,
  });

  const isEdit = editId !== null;
  const localPreview = useFilePreview(form.thumbnailFile);
  const previewUrl = localPreview || (form.thumbnail ? getPublicUrl(form.thumbnail) : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && editId) {
      await updateBlog(editId, {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt || null,
        published_at: form.published_at || null,
        is_published: form.is_published,
        thumbnailFile: form.thumbnailFile ?? undefined,
        removeImage: !form.thumbnailFile && !form.thumbnail ? true : undefined,
        thumbnail: form.thumbnailFile ? undefined : (form.thumbnail || null),
      });
      setEditId(null);
    } else {
      await createBlog({
        title: form.title,
        content: form.content,
        excerpt: form.excerpt || null,
        published_at: form.published_at || null,
        is_published: form.is_published,
        thumbnailFile: form.thumbnailFile ?? undefined,
      });
    }
    setForm({ title: '', content: '', excerpt: '', thumbnail: '', thumbnailFile: null, published_at: new Date().toISOString().split('T')[0], is_published: true });
    setOpen(false);
  };

  const handleEdit = (blog: Blog) => {
    setEditId(blog.id);
    setForm({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt ?? '',
      thumbnail: blog.thumbnail ?? '',
      thumbnailFile: null,
      published_at: blog.published_at ?? new Date().toISOString().split('T')[0],
      is_published: blog.is_published,
    });
    setOpen(true);
  };

  const handleDelete = (id: string, thumbnail?: string) => {
    setConfirmId(id);
    setConfirmThumbnail(thumbnail);
    setConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Blogs</h2>
        <Button onClick={() => { setEditId(null); setForm({ title: '', content: '', excerpt: '', thumbnail: '', thumbnailFile: null, published_at: new Date().toISOString().split('T')[0], is_published: true }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Tulis Artikel
        </Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-white/10 text-left">
            <tr>
              <th className="p-4">Thumbnail</th>
              <th className="p-4">Judul</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">Memuat...</td></tr>
            ) : blogs.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">Belum ada artikel.</td></tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog.id} className="border-t border-slate-200 dark:border-white/10">
                  <td className="p-4">
                    {blog.thumbnail ? (
                      <img src={getPublicUrl(blog.thumbnail)} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-200 dark:bg-white/10 rounded-lg flex items-center justify-center text-slate-400"><Image className="w-6 h-6" /></div>
                    )}
                  </td>
                  <td className="p-4 font-bold">{blog.title}</td>
                  <td className="p-4 text-slate-500">{blog.published_at ?? '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${blog.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {blog.is_published ? 'Publish' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(blog)} className="text-amber-500 hover:bg-amber-500/10">
                      <Edit3 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(blog.id, blog.thumbnail ?? undefined)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Hapus
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={isEdit ? 'Edit Artikel' : 'Tulis Artikel'}
      >
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <Input label="Judul Artikel" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Konten Artikel" rows="10" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          <Textarea label="Excerpt / Ringkasan (opsional)" rows="3" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          <div>
            <label className="block text-sm font-semibold mb-2">Thumbnail (opsional)</label>
            {previewUrl && (
              <div className="mb-3">
                <img src={previewUrl} alt="preview" className="w-40 rounded-xl mb-2" />
                {isEdit && form.thumbnail && !form.thumbnailFile && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, thumbnail: '', thumbnailFile: null })}
                    className="text-xs text-red-500 hover:text-red-600 underline"
                  >
                    Hapus gambar saat ini
                  </button>
                )}
              </div>
            )}
            <label className="block text-sm font-semibold mb-2">Pilih Gambar Baru</label>
            <input
              id="file-input-blog"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) setForm({ ...form, thumbnailFile: e.target.files[0] });
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none transition"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Tanggal Terbit" type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="w-5 h-5 rounded text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-sm font-semibold">Publish sekarang</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">{isEdit ? 'Update' : 'Simpan'}</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1">Batal</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (confirmId) {
            deleteBlog(confirmId, confirmThumbnail);
            setConfirmOpen(false);
          }
        }}
        title="Hapus Artikel"
        message="Apakah Anda yakin ingin menghapus artikel ini?"
      />
    </div>
  );
};

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#111827] shadow-2xl border border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>}
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

function X() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}

export default AdminBlogs;

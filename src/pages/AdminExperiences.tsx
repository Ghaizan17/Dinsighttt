import { useState } from 'react';
import { useExperiences } from '../hooks/useExperiences';
import { Plus, Trash2, Edit3, Image } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { getPublicUrl } from '../hooks/useStorage';
import { useFilePreview } from '../hooks/useFilePreview';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import type { Experience } from '../hooks/useExperiences';

const AdminExperiences = () => {
  const { experiences, loading, createExperience, updateExperience, deleteExperience } = useExperiences();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmImage, setConfirmImage] = useState<string | undefined>(undefined);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    position: '',
    organization: '',
    period: '',
    description: '',
    image: '',
    imageFile: null as File | null,
    is_active: true,
  });

  const isEdit = editId !== null;
  const localPreview = useFilePreview(form.imageFile);
  const previewUrl = localPreview || (form.image ? getPublicUrl(form.image) : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (isEdit && editId) {
        await updateExperience(editId, {
          position: form.position,
          organization: form.organization,
          period: form.period,
          description: form.description || null,
          is_active: form.is_active,
          imageFile: form.imageFile ?? undefined,
          removeImage: !form.imageFile && !form.image ? true : undefined,
          image: form.imageFile ? undefined : (form.image || null),
        });
      } else {
        await createExperience({
          position: form.position,
          organization: form.organization,
          period: form.period,
          description: form.description || null,
          is_active: form.is_active,
          imageFile: form.imageFile ?? undefined,
        });
      }

      setEditId(null);
      setForm({ position: '', organization: '', period: '', description: '', image: '', imageFile: null, is_active: true });
      setOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (exp: Experience) => {
    setEditId(exp.id);
    setFormError(null);
    setForm({
      position: exp.position,
      organization: exp.organization,
      period: exp.period,
      description: exp.description ?? '',
      image: exp.image ?? '',
      imageFile: null,
      is_active: exp.is_active,
    });
    setOpen(true);
  };

  const handleDelete = (id: string, image?: string) => {
    setConfirmId(id);
    setConfirmImage(image);
    setConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Experiences</h2>
        <Button onClick={() => { setEditId(null); setFormError(null); setForm({ position: '', organization: '', period: '', description: '', image: '', imageFile: null, is_active: true }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Experience
        </Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-white/10 text-left">
            <tr>
              <th className="p-4">Posisi</th>
              <th className="p-4">Instansi</th>
              <th className="p-4">Periode</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">Memuat...</td></tr>
            ) : experiences.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">Belum ada data.</td></tr>
            ) : (
              experiences.map((exp) => (
                <tr key={exp.id} className="border-t border-slate-200 dark:border-white/10">
                  <td className="p-4 font-bold">{exp.position}</td>
                  <td className="p-4">{exp.organization}</td>
                  <td className="p-4 text-slate-500">{exp.period}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${exp.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {exp.is_active ? 'Aktif' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(exp)} className="text-amber-500 hover:bg-amber-500/10">
                      <Edit3 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(exp.id, exp.image ?? undefined)}>
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
        title={isEdit ? 'Edit Experience' : 'Tambah Experience'}
      >
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
              <i className="fa-solid fa-circle-exclamation mr-2" />
              {formError}
            </div>
          )}

          <Input label="Posisi / Kegiatan" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required placeholder="Contoh: Web Developer Intern" />
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Nama Instansi" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} required />
            <Input label="Periode" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} required placeholder="Jul 2023 - Des 2023" />
          </div>
          <Textarea label="Deskripsi" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <label className="block text-sm font-semibold mb-2">Gambar (opsional)</label>
            {previewUrl && (
              <div className="mb-3">
                <img src={previewUrl} alt="preview" className="w-40 h-40 object-cover rounded-xl mb-2" />
                {isEdit && form.image && !form.imageFile && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: '', imageFile: null })}
                    className="text-xs text-red-500 hover:text-red-600 underline"
                  >
                    Hapus gambar saat ini
                  </button>
                )}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) setForm({ ...form, imageFile: e.target.files[0] });
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 cursor-pointer"
            />
            {form.imageFile && (
              <p className="mt-1 text-xs text-cyan-500">
                File dipilih: {form.imageFile.name} ({(form.imageFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-5 h-5 rounded text-cyan-500 focus:ring-cyan-500"
            />
            <label className="text-sm text-slate-700 dark:text-slate-300">Tampilkan di Website</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={submitting || loading} className="flex-1">
              {submitting ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
            </Button>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="flex-1">Batal</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (confirmId) {
            deleteExperience(confirmId, confirmImage);
            setConfirmOpen(false);
          }
        }}
        title="Hapus Experience"
        message="Apakah Anda yakin ingin menghapus data ini?"
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

export default AdminExperiences;

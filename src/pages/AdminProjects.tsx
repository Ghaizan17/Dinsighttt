import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { Plus, Trash2, Edit3, Image, Link as LinkIcon } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { getPublicUrl } from '../hooks/useStorage';
import { useFilePreview } from '../hooks/useFilePreview';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import type { Project } from '../hooks/useProjects';

const AdminProjects = () => {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmImage, setConfirmImage] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    demo_link: '',
    repo_link: '',
    tech_stack: '',
    image: '',
    imageFile: null as File | null,
  });

  const isEdit = editId !== null;
  const localPreview = useFilePreview(form.imageFile);
  const previewUrl = localPreview || (form.image ? getPublicUrl(form.image) : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const result = isEdit && editId
        ? await updateProject(editId, {
            title: form.title,
            description: form.description,
            demo_link: form.demo_link || null,
            repo_link: form.repo_link || null,
            tech_stack: form.tech_stack || null,
            imageFile: form.imageFile ?? undefined,
            removeImage: !form.imageFile && !form.image ? true : undefined,
            image: form.imageFile ? undefined : (form.image || null),
          })
        : await createProject({
            title: form.title,
            description: form.description,
            demo_link: form.demo_link || null,
            repo_link: form.repo_link || null,
            tech_stack: form.tech_stack || null,
            imageFile: form.imageFile ?? undefined,
          });

      if (result.error) {
        setFormError(typeof result.error === 'string' ? result.error : (result.error as { message: string }).message);
        return;
      }

      setEditId(null);
      setForm({ title: '', description: '', demo_link: '', repo_link: '', tech_stack: '', image: '', imageFile: null });
      setOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditId(project.id);
    setForm({
      title: project.title,
      description: project.description,
      demo_link: project.demo_link ?? '',
      repo_link: project.repo_link ?? '',
      tech_stack: project.tech_stack ?? '',
      image: project.image ?? '',
      imageFile: null,
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
        <h2 className="text-2xl font-black">Projects</h2>
        <Button onClick={() => { setEditId(null); setForm({ title: '', description: '', demo_link: '', repo_link: '', tech_stack: '', image: '', imageFile: null }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Project
        </Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-white/10 text-left">
            <tr>
              <th className="p-4">Gambar</th>
              <th className="p-4">Judul</th>
              <th className="p-4">Tech Stack</th>
              <th className="p-4">Demo</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">Memuat...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">Belum ada project.</td></tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="border-t border-slate-200 dark:border-white/10">
                  <td className="p-4">
                    {project.image ? (
                      <img src={getPublicUrl(project.image)} alt={project.title} className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-200 dark:bg-white/10 rounded-lg flex items-center justify-center text-slate-400"><Image className="w-6 h-6" /></div>
                    )}
                  </td>
                  <td className="p-4 font-bold">{project.title}</td>
                  <td className="p-4 text-slate-500">{project.tech_stack ?? '-'}</td>
                  <td className="p-4">
                    {project.demo_link ? (
                      <a href={project.demo_link} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline flex items-center gap-1">
                        Buka <LinkIcon className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(project)} className="text-amber-500 hover:bg-amber-500/10">
                      <Edit3 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(project.id, project.image ?? undefined)}>
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
        title={isEdit ? 'Edit Project' : 'Tambah Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
              <i className="fa-solid fa-circle-exclamation mr-2" />
              {formError}
            </div>
          )}
          <Input label="Judul Project" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Deskripsi" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div>
            <label className="block text-sm font-semibold mb-2">Gambar Project</label>
            {previewUrl && (
              <div className="mb-3">
                <img src={previewUrl} alt="preview" className="w-32 h-32 object-cover rounded-xl mb-2" />
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
            {isEdit && form.image && !form.imageFile && (
              <p className="text-xs text-slate-500 mt-1">Biarkan kosong untuk tetap menggunakan gambar saat ini.</p>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Link Demo" type="url" value={form.demo_link} onChange={(e) => setForm({ ...form, demo_link: e.target.value })} placeholder="https://demo.example.com" />
            <Input label="Link Repo" type="url" value={form.repo_link} onChange={(e) => setForm({ ...form, repo_link: e.target.value })} placeholder="https://github.com/user/repo" />
          </div>
          <Input label="Tech Stack" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} placeholder="Laravel, Tailwind, MySQL" />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={submitting || loading} className="flex-1">{submitting ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1">Batal</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (confirmId) {
            deleteProject(confirmId, confirmImage);
            setConfirmOpen(false);
          }
        }}
        title="Hapus Project"
        message="Apakah Anda yakin ingin menghapus project ini?"
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

export default AdminProjects;

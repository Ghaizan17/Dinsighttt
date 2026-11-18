import { useState } from 'react';
import { useSkills } from '../hooks/useSkills';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import type { Skill } from '../hooks/useSkills';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Design', 'Tools', 'Soft Skill', 'Technical'];

const AdminSkills = () => {
  const { skills, loading, createSkill, updateSkill, deleteSkill } = useSkills();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    icon: 'fa-solid fa-code',
    percentage: 80,
    category: 'Technical',
  });

  const isEdit = editId !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && editId) {
      await updateSkill(editId, {
        title: form.title,
        icon: form.icon,
        percentage: form.percentage,
        category: form.category,
      });
      setEditId(null);
    } else {
      await createSkill({
        title: form.title,
        icon: form.icon,
        percentage: form.percentage,
        category: form.category,
      });
    }
    setForm({ title: '', icon: 'fa-solid fa-code', percentage: 80, category: 'Technical' });
    setOpen(false);
  };

  const handleEdit = (skill: Skill) => {
    setEditId(skill.id);
    setForm({ title: skill.title, icon: skill.icon ?? 'fa-solid fa-code', percentage: skill.percentage, category: skill.category ?? 'Technical' });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Skills</h2>
        <Button onClick={() => { setEditId(null); setForm({ title: '', icon: 'fa-solid fa-code', percentage: 80, category: 'Technical' }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Skill
        </Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-white/10 text-left">
            <tr>
              <th className="p-4">Icon</th>
              <th className="p-4">Nama Skill</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Persentase</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">Memuat...</td></tr>
            ) : skills.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">Belum ada skill.</td></tr>
            ) : (
              skills.map((skill) => (
                <tr key={skill.id} className="border-t border-slate-200 dark:border-white/10">
                  <td className="p-4">
                    <i className={`${skill.icon ?? 'fa-solid fa-code'} text-xl text-cyan-500`} />
                  </td>
                  <td className="p-4 font-bold">{skill.title}</td>
                  <td className="p-4 text-slate-500">{skill.category}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${skill.percentage}%` }} />
                      </div>
                      <span className="font-bold">{skill.percentage}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(skill)} className="text-amber-500 hover:bg-amber-500/10">
                      <Edit3 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(skill.id)}>
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
        title={isEdit ? 'Edit Skill' : 'Tambah Skill'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Skill" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Contoh: Laravel" />
          <Input label="Class Icon (Font Awesome)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} required placeholder="fa-brands fa-laravel" />
          <Select label="Kategori" options={CATEGORIES.map((c) => ({ value: c, label: c }))} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <Input label="Persentase Penguasaan (%)" type="number" min="0" max="100" value={String(form.percentage)} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} required />
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
            deleteSkill(confirmId);
            setConfirmOpen(false);
          }
        }}
        title="Hapus Skill"
        message="Apakah Anda yakin ingin menghapus skill ini?"
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

export default AdminSkills;

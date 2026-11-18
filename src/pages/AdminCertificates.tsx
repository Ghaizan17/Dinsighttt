import { useState } from 'react';
import { useCertificates } from '../hooks/useCertificates';
import { Plus, Trash2, Edit3, Image } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getPublicUrl } from '../hooks/useStorage';
import { useFilePreview } from '../hooks/useFilePreview';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import type { Certificate } from '../hooks/useCertificates';

const AdminCertificates = () => {
  const { certificates, loading, createCertificate, updateCertificate, deleteCertificate } = useCertificates();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmImage, setConfirmImage] = useState<string | undefined>(undefined);

  const [form, setForm] = useState({
    name: '',
    issuer: '',
    issued_date: '',
    image: '',
    imageFile: null as File | null,
    credential_url: '',
  });

  const isEdit = editId !== null;
  const localPreview = useFilePreview(form.imageFile);
  const previewUrl = localPreview || (form.image ? getPublicUrl(form.image) : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && editId) {
      await updateCertificate(editId, {
        name: form.name,
        issuer: form.issuer,
        issued_date: form.issued_date || null,
        credential_url: form.credential_url || null,
        imageFile: form.imageFile ?? undefined,
        removeImage: !form.imageFile && !form.image ? true : undefined,
        image: form.imageFile ? undefined : (form.image || null),
      });
      setEditId(null);
    } else {
      await createCertificate({
        name: form.name,
        issuer: form.issuer,
        issued_date: form.issued_date || null,
        credential_url: form.credential_url || null,
        imageFile: form.imageFile ?? undefined,
      });
    }
    setForm({ name: '', issuer: '', issued_date: '', image: '', imageFile: null, credential_url: '' });
    setOpen(false);
  };

  const handleEdit = (cert: Certificate) => {
    setEditId(cert.id);
    setForm({
      name: cert.name,
      issuer: cert.issuer,
      issued_date: cert.issued_date ?? '',
      image: cert.image ?? '',
      imageFile: null,
      credential_url: cert.credential_url ?? '',
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
        <h2 className="text-2xl font-black">Certificates</h2>
        <Button onClick={() => { setEditId(null); setForm({ name: '', issuer: '', issued_date: '', image: '', imageFile: null, credential_url: '' }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Sertifikat
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-10 text-center text-slate-400">Memuat...</div>
        ) : certificates.length === 0 ? (
          <div className="col-span-full p-10 text-center text-slate-400">Belum ada sertifikat.</div>
        ) : (
          certificates.map((cert) => (
            <div key={cert.id} className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden">
              {cert.image ? (
                <img src={getPublicUrl(cert.image)} alt={cert.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-400 text-5xl"><Image className="w-10 h-10" /></div>
              )}
              <div className="p-4">
                <p className="text-xs text-cyan-500 font-semibold">{cert.issuer}</p>
                <h3 className="font-bold mt-1 line-clamp-2">{cert.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{cert.issued_date ?? '-'}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(cert)} className="flex-1 text-amber-500 hover:bg-amber-500/10">
                    <Edit3 className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(cert.id, cert.image ?? undefined)} className="flex-1">
                    <Trash2 className="w-4 h-4 mr-1" /> Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={isEdit ? 'Edit Sertifikat' : 'Tambah Sertifikat'}
      >
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <Input label="Nama Sertifikat" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Penerbit" value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} required />
            <Input label="Tanggal Terbit" type="date" value={form.issued_date} onChange={(e) => setForm({ ...form, issued_date: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Foto Sertifikat (opsional)</label>
            {previewUrl && (
              <div className="mb-3">
                <img src={previewUrl} alt="preview" className="w-40 rounded-xl mb-2" />
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
            <label className="block text-sm font-semibold mb-2">Pilih Gambar Baru</label>
            <input
              id="file-input-cert"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) setForm({ ...form, imageFile: e.target.files[0] });
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none transition"
            />
          </div>
          <Input label="URL Verifikasi" type="url" value={form.credential_url} onChange={(e) => setForm({ ...form, credential_url: e.target.value })} placeholder="https://..." />
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
            deleteCertificate(confirmId, confirmImage);
            setConfirmOpen(false);
          }
        }}
        title="Hapus Sertifikat"
        message="Apakah Anda yakin ingin menghapus sertifikat ini?"
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

export default AdminCertificates;

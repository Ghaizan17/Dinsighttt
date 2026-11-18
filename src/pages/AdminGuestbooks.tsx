import { useState } from 'react';
import { useGuestbooks } from '../hooks/useGuestbooks';
import { Trash2, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import type { Guestbook } from '../hooks/useGuestbooks';

const AdminGuestbooks = () => {
  const { guestbooks, loading, approveGuestbook, deleteGuestbook } = useGuestbooks();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Guestbook</h2>

      <div className="space-y-4">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Memuat...</div>
        ) : guestbooks.length === 0 ? (
          <div className="p-10 text-center text-slate-400 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
            Belum ada pesan dari pengunjung.
          </div>
        ) : (
          guestbooks.map((gb) => (
            <div key={gb.id} className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs">
                      {gb.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{gb.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {gb.email ?? 'email tidak diisi'} • {new Date(gb.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-slate-700 dark:text-slate-300">{gb.message}</p>
                  {!gb.is_approved && (
                    <p className="mt-2 text-xs text-amber-500 font-semibold flex items-center gap-1">
                      <i className="fa-solid fa-clock" /> Menunggu persetujuan
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {!gb.is_approved && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => approveGuestbook(gb.id)}
                      className="text-green-600 hover:bg-green-500/10"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Setujui
                    </Button>
                  )}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(gb.id)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (confirmId) {
            deleteGuestbook(confirmId);
            setConfirmOpen(false);
          }
        }}
        title="Hapus Pesan"
        message="Apakah Anda yakin ingin menghapus pesan ini?"
      />
    </div>
  );
};

export default AdminGuestbooks;

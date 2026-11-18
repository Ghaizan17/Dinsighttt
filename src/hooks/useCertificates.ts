import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { stripUploadFields } from '../lib/validations';

export type Certificate = Database['public']['Tables']['certificates']['Row'];
export type CertificateInsert = Database['public']['Tables']['certificates']['Insert'];
export type CertificateUpdate = Database['public']['Tables']['certificates']['Update'];

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('certificates')
      .select('*')
      .order('issued_date', { ascending: false });
    if (err) setError(err.message);
    else setCertificates(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const createCertificate = useCallback(
    async (payload: CertificateInsert & { imageFile?: File; removeImage?: boolean }) => {
      const { imageFile, removeImage } = payload;
      const dbPayload = stripUploadFields(payload);

      let imagePath = dbPayload.image as string | undefined;
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
        const { error: uploadErr } = await supabase.storage
          .from('public')
          .upload(`certificates/${fileName}`, imageFile);
        if (uploadErr) return { error: uploadErr.message };
        imagePath = `certificates/${fileName}`;
      } else if (removeImage && dbPayload.image) {
        await supabase.storage.from('public').remove([dbPayload.image]);
        imagePath = undefined;
      }

      const { data, error } = await supabase
        .from('certificates')
        .insert({ ...dbPayload, image: imagePath })
        .select()
        .single();
      if (!error) await fetchCertificates();
      return { data, error };
    },
    [fetchCertificates],
  );

  const updateCertificate = useCallback(
    async (
      id: string,
      payload: CertificateUpdate & { imageFile?: File; removeImage?: boolean },
    ) => {
      const { imageFile, removeImage } = payload;
      const dbPayload = stripUploadFields(payload);

      let imagePath = dbPayload.image as string | null | undefined;

      // Hapus file lama di server bila gambar diganti atau dihapus.
      if (removeImage || imageFile) {
        const { data: current } = await supabase
          .from('certificates')
          .select('image')
          .eq('id', id)
          .single();
        const oldPath = (current as { image?: string | null } | null)?.image;
        if (oldPath) await supabase.storage.from('public').remove([oldPath]);
        if (removeImage) imagePath = null;
      }
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
        const { error: uploadErr } = await supabase.storage
          .from('public')
          .upload(`certificates/${fileName}`, imageFile);
        if (uploadErr) return { error: uploadErr.message };
        imagePath = `certificates/${fileName}`;
      }

      const { data, error } = await supabase
        .from('certificates')
        .update({ ...dbPayload, image: imagePath })
        .eq('id', id)
        .select()
        .single();
      if (!error) await fetchCertificates();
      return { data, error };
    },
    [fetchCertificates],
  );

  const deleteCertificate = useCallback(
    async (id: string, image?: string) => {
      if (image) {
        await supabase.storage.from('public').remove([image]);
      }
      const { error } = await supabase.from('certificates').delete().eq('id', id);
      if (!error) await fetchCertificates();
      return { error };
    },
    [fetchCertificates],
  );

  return {
    certificates,
    loading,
    error,
    refetch: fetchCertificates,
    createCertificate,
    updateCertificate,
    deleteCertificate,
  };
}

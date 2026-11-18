import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { stripUploadFields } from '../lib/validations';

export type About = Database['public']['Tables']['abouts']['Row'];
export type AboutInsert = Database['public']['Tables']['abouts']['Insert'];
export type AboutUpdate = Database['public']['Tables']['abouts']['Update'];

export function useAbout() {
  const [abouts, setAbouts] = useState<About[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAbouts = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('abouts')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setAbouts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAbouts();
  }, [fetchAbouts]);

  const createAbout = useCallback(
    async (payload: AboutInsert & { photoFile?: File }) => {
      const { photoFile } = payload;
      const dbPayload = stripUploadFields(payload);

      let photoPath = dbPayload.photo as string | undefined;
      if (photoFile) {
        const fileName = `${Date.now()}-${photoFile.name.replace(/\s+/g, '_')}`;
        const { error: uploadErr } = await supabase.storage
          .from('public')
          .upload(`abouts/${fileName}`, photoFile);
        if (uploadErr) return { error: uploadErr.message };
        photoPath = `abouts/${fileName}`;
      }

      const { data, error } = await supabase
        .from('abouts')
        .insert({ ...dbPayload, photo: photoPath })
        .select()
        .single();
      if (!error) await fetchAbouts();
      return { data, error };
    },
    [fetchAbouts],
  );

  const updateAbout = useCallback(
    async (
      id: string,
      payload: AboutUpdate & { photoFile?: File; removeImage?: boolean },
    ) => {
      const { photoFile, removeImage } = payload;
      const dbPayload = stripUploadFields(payload);

      let photoPath = dbPayload.photo as string | null | undefined;

      // Hapus file lama di server bila gambar diganti atau dihapus.
      if (removeImage || photoFile) {
        const { data: current } = await supabase
          .from('abouts')
          .select('photo')
          .eq('id', id)
          .single();
        const oldPath = (current as { photo?: string | null } | null)?.photo;
        if (oldPath) await supabase.storage.from('public').remove([oldPath]);
        if (removeImage) photoPath = null;
      }
      if (photoFile) {
        const fileName = `${Date.now()}-${photoFile.name.replace(/\s+/g, '_')}`;
        const { error: uploadErr } = await supabase.storage
          .from('public')
          .upload(`abouts/${fileName}`, photoFile);
        if (uploadErr) return { error: uploadErr.message };
        photoPath = `abouts/${fileName}`;
      }

      const { data, error } = await supabase
        .from('abouts')
        .update({ ...dbPayload, photo: photoPath })
        .eq('id', id)
        .select()
        .single();
      if (!error) await fetchAbouts();
      return { data, error };
    },
    [fetchAbouts],
  );

  const deleteAbout = useCallback(
    async (id: string, photo?: string) => {
      if (photo) {
        await supabase.storage.from('public').remove([photo]);
      }
      const { error } = await supabase.from('abouts').delete().eq('id', id);
      if (!error) await fetchAbouts();
      return { error };
    },
    [fetchAbouts],
  );

  return { abouts, loading, error, refetch: fetchAbouts, createAbout, updateAbout, deleteAbout };
}

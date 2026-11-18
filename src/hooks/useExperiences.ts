import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { stripUploadFields } from '../lib/validations';

export type Experience = Database['public']['Tables']['experiences']['Row'];
export type ExperienceInsert = Database['public']['Tables']['experiences']['Insert'];
export type ExperienceUpdate = Database['public']['Tables']['experiences']['Update'];

export function useExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('experiences')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setExperiences(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const createExperience = useCallback(
    async (payload: ExperienceInsert & { imageFile?: File; removeImage?: boolean }) => {
      const { imageFile, removeImage } = payload;
      const dbPayload = stripUploadFields(payload);

      let imagePath = dbPayload.image as string | undefined;
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
        const { error: uploadErr } = await supabase.storage
          .from('public')
          .upload(`experiences/${fileName}`, imageFile);
        if (uploadErr) return { error: uploadErr.message };
        imagePath = `experiences/${fileName}`;
      } else if (removeImage && dbPayload.image) {
        await supabase.storage.from('public').remove([dbPayload.image]);
        imagePath = undefined;
      }

      const { data, error } = await supabase
        .from('experiences')
        .insert({ ...dbPayload, image: imagePath })
        .select()
        .single();
      if (!error) await fetchExperiences();
      return { data, error };
    },
    [fetchExperiences],
  );

  const updateExperience = useCallback(
    async (
      id: string,
      payload: ExperienceUpdate & { imageFile?: File; removeImage?: boolean },
    ) => {
      const { imageFile, removeImage } = payload;
      const dbPayload = stripUploadFields(payload);

      let imagePath = dbPayload.image as string | null | undefined;

      // Hapus file lama di server bila gambar diganti atau dihapus.
      if (removeImage || imageFile) {
        const { data: current } = await supabase
          .from('experiences')
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
          .upload(`experiences/${fileName}`, imageFile);
        if (uploadErr) return { error: uploadErr.message };
        imagePath = `experiences/${fileName}`;
      }

      const { data, error } = await supabase
        .from('experiences')
        .update({ ...dbPayload, image: imagePath })
        .eq('id', id)
        .select()
        .single();
      if (!error) await fetchExperiences();
      return { data, error };
    },
    [fetchExperiences],
  );

  const deleteExperience = useCallback(
    async (id: string, image?: string) => {
      if (image) {
        await supabase.storage.from('public').remove([image]);
      }
      const { error } = await supabase.from('experiences').delete().eq('id', id);
      if (!error) await fetchExperiences();
      return { error };
    },
    [fetchExperiences],
  );

  return {
    experiences,
    loading,
    error,
    refetch: fetchExperiences,
    createExperience,
    updateExperience,
    deleteExperience,
  };
}

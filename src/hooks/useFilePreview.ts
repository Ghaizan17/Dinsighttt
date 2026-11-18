import { useEffect, useState } from 'react';

/**
 * Membuat URL preview lokal (blob) untuk file yang baru dipilih,
 * supaya gambar langsung terlihat sebelum di-upload ke server.
 * URL blob otomatis dibersihkan saat file berganti / komponen dilepas.
 */
export function useFilePreview(file: File | null | undefined): string {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!file) {
      setUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}

export default useFilePreview;

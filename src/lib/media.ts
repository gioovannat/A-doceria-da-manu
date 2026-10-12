import { supabase } from './supabase';

const BUCKET = 'site-media';
const MAX_BYTES = 5 * 1024 * 1024;
const INSPIRATION_MAX_BYTES = 4 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function uploadSiteImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Conecte o Supabase antes de enviar imagens.');
  if (!ACCEPTED_TYPES.has(file.type)) throw new Error('Formato inválido. Envie JPG, PNG ou WEBP.');
  if (file.size > MAX_BYTES) throw new Error('A imagem deve ter no máximo 5 MB.');

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const objectPath = `uploads/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function uploadInspirationImage(file: File): Promise<string> {
  if (!ACCEPTED_TYPES.has(file.type)) throw new Error('Formato inválido. Envie JPG, PNG ou WEBP.');
  if (file.size > INSPIRATION_MAX_BYTES) throw new Error('A imagem deve ter no máximo 4 MB.');

  const response = await fetch('/api/inspiration-image', {
    method: 'POST',
    headers: { 'content-type': file.type },
    body: file,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || typeof payload.url !== 'string') {
    throw new Error(payload.error || 'Não foi possível enviar a imagem de referência.');
  }
  return payload.url;
}

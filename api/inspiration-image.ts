import { createClient } from '@supabase/supabase-js';
import { createHash, randomUUID } from 'node:crypto';

export const config = { runtime: 'nodejs' };

const MAX_BYTES = 4 * 1024 * 1024;
const WINDOW_SECONDS = 10 * 60;
const MAX_UPLOADS_PER_WINDOW = 4;
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return new Response('Service unavailable', { status: 503 });

  try {
    const contentType = request.headers.get('content-type')?.split(';')[0] || '';
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (!EXTENSIONS[contentType] || contentLength > MAX_BYTES) {
      return Response.json({ error: 'Envie uma imagem JPG, PNG ou WEBP de até 4 MB.' }, { status: 400 });
    }

    const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const ipHash = createHash('sha256').update(`inspiration:${clientIp(request)}`).digest('hex');
    const { data: permitted, error: limitError } = await admin.rpc('take_rate_limit', {
      p_key: ipHash,
      p_window_seconds: WINDOW_SECONDS,
      p_max_requests: MAX_UPLOADS_PER_WINDOW,
    });
    if (limitError) throw limitError;
    if (!permitted) return Response.json({ error: 'Muitas imagens enviadas. Tente novamente em alguns minutos.' }, { status: 429 });

    const bytes = new Uint8Array(await request.arrayBuffer());
    if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) {
      return Response.json({ error: 'Envie uma imagem JPG, PNG ou WEBP de até 4 MB.' }, { status: 400 });
    }

    const objectPath = `inspirations/${randomUUID()}.${EXTENSIONS[contentType]}`;
    const { error: uploadError } = await admin.storage.from('site-media').upload(objectPath, bytes, {
      contentType,
      cacheControl: '31536000',
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data } = admin.storage.from('site-media').getPublicUrl(objectPath);
    return Response.json({ url: data.publicUrl }, { status: 201 });
  } catch {
    return Response.json({ error: 'Não foi possível enviar a imagem de referência.' }, { status: 400 });
  }
}

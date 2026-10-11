import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

export const config = { runtime: 'nodejs' };

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 8;

function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return new Response('Service unavailable', { status: 503 });

  try {
    const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const ipHash = createHash('sha256').update(clientIp(request)).digest('hex');
    const { data: permitted, error: limitError } = await admin.rpc('take_rate_limit', {
      p_key: ipHash, p_window_seconds: WINDOW_MS / 1000, p_max_requests: MAX_REQUESTS_PER_WINDOW,
    });
    if (limitError) throw limitError;
    if (!permitted) return Response.json({ error: 'Muitas solicitações. Tente novamente em alguns minutos.' }, { status: 429 });
    const payload = await request.json();
    if (!payload || typeof payload.product_name !== 'string' || payload.product_name.length > 160) {
      return Response.json({ error: 'Pedido inválido.' }, { status: 400 });
    }
    const safePayload = {
      id: typeof payload.id === 'string' ? payload.id.slice(0, 80) : crypto.randomUUID(),
      product_name: payload.product_name.slice(0, 160),
      batter: typeof payload.batter === 'string' ? payload.batter.slice(0, 160) : null,
      quantity: typeof payload.quantity === 'string' ? payload.quantity.slice(0, 100) : null,
      flavors: Array.isArray(payload.flavors) ? payload.flavors.filter((item: unknown) => typeof item === 'string').slice(0, 10) : [],
      packaging: typeof payload.packaging === 'string' ? payload.packaging.slice(0, 160) : null,
      addons: Array.isArray(payload.addons) ? payload.addons.filter((item: unknown) => typeof item === 'string').slice(0, 10) : [],
      date: typeof payload.date === 'string' ? payload.date.slice(0, 100) : null,
      delivery_type: typeof payload.delivery_type === 'string' ? payload.delivery_type.slice(0, 160) : null,
      location: typeof payload.location === 'string' ? payload.location.slice(0, 300) : null,
      notes: typeof payload.notes === 'string' ? payload.notes.slice(0, 2000) : null,
      inspiration_photo: typeof payload.inspiration_photo === 'string' ? payload.inspiration_photo.slice(0, 255) : null,
      estimated_total: Number.isFinite(Number(payload.estimated_total)) ? Number(payload.estimated_total) : 0,
      formatted_message: typeof payload.formatted_message === 'string' ? payload.formatted_message.slice(0, 5000) : null,
    };
    const { error } = await admin.from('order_events').insert(safePayload);
    if (error) throw error;
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: 'Não foi possível registrar o pedido.' }, { status: 400 });
  }
}

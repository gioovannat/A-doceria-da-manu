import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';

export const config = { runtime: 'nodejs' };

const WINDOW_SECONDS = 10 * 60;
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_BODY_BYTES = 12 * 1024;
const RESPONSE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

function clientIp(request: Request): string {
  return request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

function response(payload: Record<string, unknown>, status: number): Response {
  return Response.json(payload, { status, headers: RESPONSE_HEADERS });
}

function sameSiteRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    const requestOrigin = new URL(request.url).origin;
    const configuredSiteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL;
    const configuredOrigin = configuredSiteUrl ? new URL(configuredSiteUrl).origin : null;
    return origin === requestOrigin || origin === configuredOrigin;
  } catch {
    return false;
  }
}

function text(value: unknown, maxLength: number): string | null {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) || null : null;
}

function textList(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: RESPONSE_HEADERS });
  if (!sameSiteRequest(request)) return response({ error: 'Origem não permitida.' }, 403);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return response({ error: 'Formato de solicitação inválido.' }, 415);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (!Number.isFinite(contentLength) || contentLength > MAX_BODY_BYTES) {
    return response({ error: 'Solicitação muito grande.' }, 413);
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return response({ error: 'Serviço indisponível.' }, 503);

  try {
    const rawPayload = await request.text();
    if (new TextEncoder().encode(rawPayload).byteLength > MAX_BODY_BYTES) {
      return response({ error: 'Solicitação muito grande.' }, 413);
    }
    const payload = JSON.parse(rawPayload);
    const productName = text(payload?.product_name, 160);
    const customerName = text(payload?.customer_name, 160);
    const estimatedTotal = Number(payload?.estimated_total);
    if (!productName || !customerName || !Number.isFinite(estimatedTotal) || estimatedTotal < 0 || estimatedTotal > 100000) {
      return response({ error: 'Pedido inválido.' }, 400);
    }

    const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const ipHash = createHmac('sha256', serviceRoleKey).update(`orders:${clientIp(request)}`).digest('hex');
    const { data: permitted, error: limitError } = await admin.rpc('take_rate_limit', {
      p_key: ipHash, p_window_seconds: WINDOW_SECONDS, p_max_requests: MAX_REQUESTS_PER_WINDOW,
    });
    if (limitError) throw limitError;
    if (!permitted) return response({ error: 'Muitas solicitações. Tente novamente em alguns minutos.' }, 429);

    const safePayload = {
      id: crypto.randomUUID(),
      customer_name: customerName,
      product_name: productName,
      batter: text(payload.batter, 160),
      quantity: text(payload.quantity, 100),
      flavors: textList(payload.flavors, 10, 160),
      packaging: text(payload.packaging, 160),
      addons: textList(payload.addons, 10, 160),
      date: text(payload.date, 100),
      delivery_type: text(payload.delivery_type, 160),
      location: text(payload.location, 300),
      notes: text(payload.notes, 2000),
      estimated_total: estimatedTotal,
      formatted_message: text(payload.formatted_message, 5000),
    };
    const { error } = await admin.from('order_events').insert(safePayload);
    if (error) throw error;
    return response({ ok: true }, 201);
  } catch {
    return response({ error: 'Não foi possível registrar o pedido.' }, 400);
  }
}

import { store } from './store';

/**
 * Central WhatsApp URL Generator
 * Formats clean international phone numbers and URL encodes message parameters safely.
 */
export function generateWhatsAppUrl(customMessage?: string): string {
  const currentSettings = store.getPublished().settings;
  const rawNumber = currentSettings?.whatsapp_number || '5598991171456';
  const cleanNumber = rawNumber.replace(/\D/g, '');

  const messageText = customMessage || currentSettings?.whatsapp_default_message || 'Olá, Manu! Gostaria de consultar a disponibilidade e fazer um pedido.';

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 13) {
    // 55 98 99117-1456
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  }
  if (cleaned.length === 11) {
    // (98) 99117-1456
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

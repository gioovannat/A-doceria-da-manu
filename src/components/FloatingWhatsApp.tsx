import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { store } from '../lib/store';
import { generateWhatsAppUrl } from '../lib/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);
  const settings = store.getPublished().settings;

  const whatsappUrl = generateWhatsAppUrl(
    settings.whatsapp_default_message || 'Olá, Manu! Gostaria de tirar uma dúvida sobre as encomendas.'
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-lg border border-[#FAD0DE] animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-left">
            <p className="text-xs font-bold text-[#3D1E26] leading-tight">Precisa de um bolo especial?</p>
            <p className="text-[11px] text-[#7A505D] leading-tight">Fale direto com a Manu no WhatsApp</p>
          </div>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-[#9E7381] hover:text-[#3D1E26] p-0.5 ml-1 rounded-full cursor-pointer"
            aria-label="Fechar dica"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="animate-whatsapp-pulse w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        aria-label="Abrir conversa no WhatsApp com A Doceria da Manu"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
      </a>
    </div>
  );
};

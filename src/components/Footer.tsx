import React from 'react';
import { Logo } from './Logo';
import { Instagram, MessageCircle, MapPin, Clock } from 'lucide-react';
import { AppDatabase } from '../types';
import { store } from '../lib/store';
import { generateWhatsAppUrl } from '../lib/whatsapp';

interface FooterProps {
  data?: AppDatabase;
}

export const Footer: React.FC<FooterProps> = ({ data }) => {
  const currentData = data || store.getPublished();
  const { settings, home, business_hours } = currentData;
  const whatsappUrl = generateWhatsAppUrl();

  const weekdayHours = business_hours.find((b) => b.weekday === 'segunda');
  const weekendHours = business_hours.find((b) => b.weekday === 'domingo');

  return (
    <footer className="bg-[#FFF0F4] border-t border-[#FCD2DF] pt-16 pb-12 text-[#643E49]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#FAD6E2] text-left">
          
          {/* Column 1: Brand & Regional Identity */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <Logo size="lg" customLogoUrl={home.logo_url} />

            <p className="mt-4 text-xs sm:text-sm text-[#734A56] leading-relaxed max-w-sm">
              {settings.institutional_text}
            </p>

            {/* Regional authority signal & Address */}
            <div className="mt-4 flex items-start gap-2.5 text-xs text-[#8C2348] font-medium bg-white/80 p-3.5 rounded-2xl border border-[#FAD0DE] shadow-2xs">
              <MapPin className="w-4 h-4 text-[#D81E5B] shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-[#3D1E26] mb-0.5">Atelier & Retiradas:</span>
                <span className="text-[#643E49] leading-relaxed block">{settings.address}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D1E26] mb-4">
              Navegação Rápida
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#cardapio" className="hover:text-[#D81E5B] transition-colors">
                  Cardápio & Especialidades
                </a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-[#D81E5B] transition-colors">
                  Sobre a Confeiteira
                </a>
              </li>
              <li>
                <a href="#cursos" className="hover:text-[#D81E5B] transition-colors">
                  Planilha & Gestão Lucrativa
                </a>
              </li>
              <li>
                <a href="#orientacoes" className="hover:text-[#D81E5B] transition-colors">
                  Orientações & Cuidados
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#D81E5B] transition-colors">
                  Dúvidas Frequentes (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Especialidades em Alta (SEO Keywords) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D1E26] mb-4">
              Mais Pedidos
            </h4>
            <ul className="space-y-2.5 text-xs text-[#734A56]">
              {currentData.specialties.slice(0, 6).map((sp) => (
                <li key={sp.id}>{sp.title}</li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D1E26] mb-4">
              Atendimento & Encomendas
            </h4>
            
            <div className="space-y-3.5 text-xs sm:text-sm">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[#25D366] hover:text-[#20ba5a] font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp: {settings.whatsapp_display}</span>
              </a>

              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[#D81E5B] hover:text-[#B8134B] font-semibold transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span>{settings.instagram_handle}</span>
              </a>

              <div className="pt-2 border-t border-[#FCD2DF]/80">
                <div className="flex items-start gap-2.5 text-[#734A56] text-xs">
                  <Clock className="w-4 h-4 text-[#E05A2B] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    {weekdayHours && weekdayHours.is_open && (
                      <p className="text-[#3D1E26]">
                        <strong className="font-semibold">Segunda a Sábado:</strong> {weekdayHours.open_time} às {weekdayHours.close_time}
                      </p>
                    )}
                    {weekendHours && weekendHours.is_open && (
                      <p className="text-[#3D1E26]">
                        <strong className="font-semibold">Domingos e Feriados:</strong> {weekendHours.open_time} às {weekendHours.close_time}
                      </p>
                    )}
                    <p className="text-[11px] text-[#A03554] font-medium pt-0.5 leading-snug">
                      {settings.status_custom_message || 'Encomendas sob medida com antecedência mínima.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center text-center text-xs text-[#8C5D6C]">
          <p>{settings.copyright}</p>
        </div>

      </div>
    </footer>
  );
};

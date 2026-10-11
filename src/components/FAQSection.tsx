import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';
import { AppDatabase } from '../types';
import { store } from '../lib/store';
import { generateWhatsAppUrl } from '../lib/whatsapp';

interface FAQSectionProps {
  data?: AppDatabase;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ data }) => {
  const currentData = data || store.getPublished();
  const { faqs, settings } = currentData;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const activeFaqs = faqs.filter((f) => f.active);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-24 bg-[#FFF8FA] scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E05A2B] uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tire Suas Dúvidas</span>
          </div>

          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#3B1D25] tracking-tight mb-4"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Dúvidas Frequentes
          </h2>

          <p className="text-base text-[#6B4651]">
            Respostas diretas sobre prazos, retiradas no atelier, conservação e formas de pagamento.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5 text-left">
          {activeFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-[#FAD0DE] overflow-hidden transition-all duration-200 shadow-2xs"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden focus-visible:bg-[#FFF5F8]"
                  aria-expanded={isOpen}
                >
                  <span 
                    className={`text-base font-semibold transition-colors ${
                      isOpen ? 'text-[#D81E5B]' : 'text-[#3D1E26]'
                    }`}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#8C5D6C] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#D81E5B]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-[#66434D] leading-relaxed border-t border-[#FEEBF0] bg-[#FFFDFC]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions? */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-white border border-[#FAD6E2]">
          <p className="text-sm font-semibold text-[#3D1E26] mb-1">
            Não encontrou a resposta que procurava?
          </p>
          <p className="text-xs text-[#7A505D] mb-4">
            Estamos online para ajudar com seu pedido personalizado.
          </p>
          <a
            href={generateWhatsAppUrl("Olá, Manu! Tenho uma dúvida sobre as encomendas.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Falar no WhatsApp Agora</span>
          </a>
        </div>

      </div>
    </section>
  );
};

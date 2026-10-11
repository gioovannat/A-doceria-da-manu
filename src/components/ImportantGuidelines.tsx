import React from 'react';
import { 
  Cake, 
  Car, 
  Calendar, 
  Sparkles, 
  Snowflake, 
  Sun, 
  Store, 
  AlertTriangle, 
  Box, 
  Heart, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { AppDatabase } from '../types';
import { store } from '../lib/store';

interface ImportantGuidelinesProps {
  data?: AppDatabase;
}

export const ImportantGuidelines: React.FC<ImportantGuidelinesProps> = ({ data }) => {
  const currentData = data || store.getPublished();
  const { policies } = currentData;

  const badgeIcons = {
    green: <CheckCircle2 className="w-4 h-4" />,
    amber: <RotateCcw className="w-4 h-4" />,
    rose: <XCircle className="w-4 h-4" />,
  };

  const badgeStyles = {
    green: 'bg-[#EAF7EE] text-[#1E9E49]',
    amber: 'bg-[#FEF6E6] text-[#D9822B]',
    rose: 'bg-[#FDECEE] text-[#D81E5B]',
  };

  return (
    <section id="orientacoes" className="py-20 md:py-28 bg-gradient-to-b from-[#FFF5F8] via-[#FFF8FA] to-[#FFF5F8] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#FFF0F5] border border-[#FAD0DE] text-[#B8134B] text-xs font-bold uppercase tracking-wider mb-3">
            Cuidados & Transporte
          </div>

          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#3B1D25] tracking-tight mb-4"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Orientações & Cuidados Importantes
          </h2>

          <p className="text-sm sm:text-base text-[#6B4651] leading-relaxed">
            Leia com atenção para garantir a melhor experiência, integridade e frescor da sua sobremesa artesanal.
          </p>
        </div>

        {/* Top 2 Cards: Conservação & Retirada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 text-left">
          
          {/* Card 1: Cuidados */}
          <div className="bg-white rounded-3xl border border-[#FAD2DF] p-7 sm:p-9 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F5] border border-[#F9C7D7] flex items-center justify-center text-[#D81E5B] shrink-0 shadow-2xs">
                  <Cake className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E05A2B] block">
                    Conservação & Detalhes
                  </span>
                  <h3 
                    className="text-xl sm:text-2xl font-bold text-[#3B1D25]"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    Sobre Nossos Doces & Cuidados
                  </h3>
                </div>
              </div>

              <ul className="space-y-5 text-xs sm:text-sm text-[#66434D] leading-relaxed">
                {policies.care_guidelines.map((guide, idx) => (
                  <li key={idx} className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-lg bg-[#FFF2F6] flex items-center justify-center text-[#D81E5B] shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>{guide}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-[#FEE7EF]">
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#FFF5F8] border border-[#FAD6E2] text-xs text-[#8C1B40] font-medium">
                <Heart className="w-4 h-4 text-[#D81E5B] shrink-0 fill-[#D81E5B]/20" />
                <span>Elaborados com ingredientes nobres e sem conservantes artificiais.</span>
              </div>
            </div>
          </div>

          {/* Card 2: Transporte & Retirada */}
          <div className="bg-white rounded-3xl border border-[#FAD2DF] p-7 sm:p-9 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F5] border border-[#F9C7D7] flex items-center justify-center text-[#D81E5B] shrink-0 shadow-2xs">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E05A2B] block">
                    Logística & Retirada
                  </span>
                  <h3 
                    className="text-xl sm:text-2xl font-bold text-[#3B1D25]"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    Avisos sobre a Retirada & Transporte
                  </h3>
                </div>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-[#66434D] leading-relaxed">
                {policies.transport_guidelines.map((trans, idx) => {
                  const isWarning = trans.toLowerCase().includes('moto') || trans.toLowerCase().includes('aviso');
                  return (
                    <li 
                      key={idx} 
                      className={`flex items-start gap-3.5 ${
                        isWarning ? 'bg-[#FFF2E9] p-3 rounded-2xl border border-[#FED7C3]' : ''
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isWarning ? 'bg-[#FFEDE0] text-[#E05A2B]' : 'bg-[#FFF2F6] text-[#D81E5B]'
                      }`}>
                        {isWarning ? <AlertTriangle className="w-4 h-4 text-[#D9381E]" /> : <Box className="w-4 h-4" />}
                      </div>
                      <div className={isWarning ? 'text-[#842A16] font-medium' : ''}>
                        {trans}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-[#FEE7EF]">
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#FFF5F8] border border-[#FAD6E2] text-xs text-[#8C1B40] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Segurança garantida para seu momento especial brilhar.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Card 3: Política de cancelamento */}
        <div className="bg-white rounded-3xl border border-[#FAD2DF] p-7 sm:p-9 shadow-xs hover:shadow-md transition-shadow text-left">
          <div className="flex items-center gap-3.5 mb-7">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F5] border border-[#F9C7D7] flex items-center justify-center text-[#D81E5B] shrink-0 shadow-2xs">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E05A2B] block">
                Termos & Condições
              </span>
              <h3 
                className="text-xl sm:text-2xl font-bold text-[#3B1D25]"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Política de cancelamento
              </h3>
            </div>
          </div>

          <div className="space-y-3.5 mb-6">
            {policies.cancellation_rules.map((rule) => {
              const colorKey = rule.badge_color || 'green';
              return (
                <div key={rule.id} className="flex items-start sm:items-center gap-3.5 p-4 rounded-2xl bg-[#FFF5F8] border border-[#FAD7E4]">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${badgeStyles[colorKey]}`}>
                    {badgeIcons[colorKey]}
                  </div>
                  <p className="text-xs sm:text-sm text-[#5C3A44] leading-relaxed">
                    <strong className="text-[#3D1E26] font-semibold">{rule.rule_title}: </strong>
                    {rule.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-[#FFEBF1] border border-[#F8BFD2] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#D81E5B] shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-[#82183B]">
              {policies.payment_terms || 'Transparência e respeito para garantir a excelência na preparação de cada encomenda.'}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

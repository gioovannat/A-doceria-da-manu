import React from 'react';
import { MessageCircle, Sparkles, Heart, ArrowDown, Award, ShieldCheck, Check } from 'lucide-react';
import { AppDatabase } from '../types';
import { store } from '../lib/store';
import { generateWhatsAppUrl } from '../lib/whatsapp';

interface HeroProps {
  onOpenOrderModal?: () => void;
  data?: AppDatabase;
}

export const Hero: React.FC<HeroProps> = ({ onOpenOrderModal, data }) => {
  const currentData = data || store.getPublished();
  const { home, benefits, settings } = currentData;
  const whatsappUrl = generateWhatsAppUrl(settings.whatsapp_default_message);

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-b from-[#FFF0F4] via-[#FFF5F8] to-[#FFF0F4]">
      {/* Background glow circle */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-[#FDE3EC]/60 via-[#FCE9EE]/30 to-[#FCE3EC]/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Slogan, Subtitle, CTA and Local Trust */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Strategic H1 for SEO */}
            <h1 className="text-xs uppercase tracking-widest font-bold text-[#E05A2B] mb-2 opacity-90">
              {home.hero_top_badge}
            </h1>

            {/* Main Catchphrase / Slogan */}
            <h2 
              className="text-3xl sm:text-5xl lg:text-[54px] font-bold text-[#3D1E26] leading-[1.15] tracking-tight mb-5"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {home.hero_title}{" "}
              <span className="text-[#D81E5B] italic font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {home.hero_highlight_text}
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#6C4752] max-w-xl leading-relaxed mb-8">
              {home.hero_subtitle}
            </p>

            {/* Action Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="animate-whatsapp-pulse inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 active:scale-98 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>{home.hero_cta_text}</span>
              </a>

              <a
                href={home.hero_secondary_cta_link || '#cardapio'}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-white hover:bg-[#FFF0F4] border border-[#F7C6D6] text-[#A81B4B] text-sm font-semibold shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#E05A2B]" />
                <span>{home.hero_secondary_cta_text}</span>
              </a>
            </div>

            {/* Dynamic Hero Stats */}
            {home.hero_stats && home.hero_stats.length > 0 && (
              <div className="mt-10 pt-7 border-t border-[#FCD7E3] w-full grid grid-cols-3 gap-4 text-left">
                {home.hero_stats.map((stat, i) => (
                  <div key={stat.id || i}>
                    <span className="block text-xl sm:text-2xl font-bold text-[#A81B4B]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                      {stat.number}
                    </span>
                    <span className="text-xs text-[#7B535F] font-medium leading-tight block mt-0.5">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Right Column: Floating Cake Highlight */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-[420px] aspect-square">
              
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FCD4E2] to-[#FFEBF2] blur-xl scale-95 -z-10" />

              <div className={`${home.hero_animation_active ? 'animate-float' : ''} relative w-full h-full p-3.5 rounded-full bg-white/70 backdrop-blur-xs border-2 border-[#F9C2D4] shadow-xl`}>
                <img
                  src={home.hero_main_image}
                  alt={home.logo_alt}
                  className="w-full h-full object-cover rounded-full shadow-inner"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />

                {/* Floating Tag 1: Top Right */}
                <div className="absolute -top-3 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#FAD0DE] shadow-md flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E05A2B] animate-ping" />
                  <span className="text-xs font-semibold text-[#8B1A40]">
                    Agenda Aberta
                  </span>
                </div>

                {/* Floating Tag 2: Bottom Left */}
                <div className="absolute -bottom-2 -left-2 sm:-left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#FAD0DE] shadow-md flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-[#D81E5B] fill-[#D81E5B]" />
                  <div>
                    <p className="text-[11px] font-bold text-[#44212A] leading-tight">Feito com Amor</p>
                    <p className="text-[10px] text-[#8C5D6C] leading-tight">Ingredientes Nobres</p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Faixa de Benefícios / Diferenciais (Requirement 8) */}
        {benefits && benefits.filter(b => b.active).length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#FCD7E3]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.filter(b => b.active).map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-white/90 border border-[#FAD0DE] shadow-2xs flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] border border-[#F8BFD2] flex items-center justify-center text-[#D81E5B] shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#3D1E26] leading-tight">
                      {b.title}
                    </h4>
                    {b.description && (
                      <p className="text-[11px] text-[#7A505D] mt-1 leading-snug">
                        {b.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bolo Destaque da Semana (Requirement 15) */}
        {home.featured_cake?.active && (
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FFF0F5] via-[#FFEBF2] to-[#FFF0F5] border border-[#F8BFD2] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white border-2 border-white shadow-md shrink-0">
                <img
                  src={home.featured_cake.image}
                  alt={home.featured_cake.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#B8134B] bg-white px-2.5 py-0.5 rounded-full border border-[#FAD0DE] mb-1.5">
                  {home.featured_cake.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#3D1E26]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                  {home.featured_cake.title}
                </h3>
                <p className="text-xs text-[#6B4651] max-w-md mt-1">
                  {home.featured_cake.description}
                </p>
                <p className="text-xs font-bold text-[#D81E5B] mt-1.5">
                  {home.featured_cake.price_display}
                </p>
              </div>
            </div>

            <a
              href={generateWhatsAppUrl(`Olá, Manu! Gostaria de encomendar o ${home.featured_cake.title} (${home.featured_cake.badge}).`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{home.featured_cake.cta_text || 'Quero este bolo'}</span>
            </a>
          </div>
        )}

      </div>

      {/* Section Divider Scroll indicator */}
      <div className="max-w-7xl mx-auto px-4 mt-12 flex justify-center">
        <a 
          href="#cardapio" 
          className="inline-flex items-center gap-1.5 text-xs text-[#9B5C70] hover:text-[#D81E5B] transition-colors font-medium py-2"
        >
          <span>Conheça nossas especialidades</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </a>
      </div>
    </section>
  );
};

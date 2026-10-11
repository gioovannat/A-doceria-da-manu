import React from 'react';
import { Instagram, Award, Heart, CheckCircle2, MapPin } from 'lucide-react';
import { AppDatabase } from '../types';
import { store } from '../lib/store';

interface AboutChefProps {
  data?: AppDatabase;
}

export const AboutChef: React.FC<AboutChefProps> = ({ data }) => {
  const currentData = data || store.getPublished();
  const { chef, settings } = currentData;

  return (
    <section id="sobre" className="py-20 md:py-28 bg-[#FFF2F6] scroll-mt-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Chef Image Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-3 rounded-4xl bg-gradient-to-tr from-[#F8BFD2] to-[#FCE1EB] rotate-2 -z-10" />

              <div className="rounded-3xl overflow-hidden border-2 border-white shadow-xl bg-white aspect-3/4">
                <img
                  src={chef.photo}
                  alt={`${chef.name}, ${chef.role}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Floating Authority Badge */}
              <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#FAD0DE] shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF0F4] border border-[#F8BFD2] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-[#D81E5B]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#3D1E26]">{chef.name}</p>
                  <p className="text-[11px] text-[#8C5D6C] font-medium">{chef.role}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Text & Authority Story Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E05A2B] uppercase tracking-wider mb-2">
              <Heart className="w-3.5 h-3.5 fill-[#E05A2B]" />
              <span>Autoridade e Conexão</span>
            </div>

            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#3B1D25] tracking-tight mb-6"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Sobre a Confeiteira
            </h2>

            <div className="space-y-4 text-base sm:text-lg text-[#66434D] leading-relaxed">
              {chef.main_story.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Regional Authority Paragraph */}
            {chef.coverage_region && (
              <div className="mt-6 p-4.5 rounded-2xl bg-white/90 border border-[#FAD2DE] flex items-start gap-3 w-full">
                <MapPin className="w-5 h-5 text-[#D81E5B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#3D1E26]">
                    {chef.coverage_region}
                  </p>
                  <p className="text-xs text-[#7A535E] mt-0.5">
                    Encomendas programadas com entregas seguras ou retirada pontual em nosso ateliê gastronômico.
                  </p>
                </div>
              </div>
            )}

            {/* Checkpoints */}
            {chef.checkpoints && chef.checkpoints.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full text-xs sm:text-sm text-[#5C3944] font-medium">
                {chef.checkpoints.map((cp, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                    <span>{cp}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Social CTA Button */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white hover:bg-[#FFF0F4] border border-[#F8B4C9] text-[#D81E5B] text-sm font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>Conheça mais no Instagram</span>
              </a>

              <a
                href="#cursos"
                className="text-xs sm:text-sm text-[#7F4E5D] hover:text-[#D81E5B] font-semibold underline underline-offset-4"
              >
                Ver cursos com a Manu →
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

import React from 'react';
import { 
  ArrowRight,
  TrendingUp,
  Calculator,
  Clock,
  BarChart3,
  Wallet,
  Lock,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { AppDatabase } from '../types';
import { store } from '../lib/store';

interface CoursesSectionProps {
  data?: AppDatabase;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({ data }) => {
  const currentData = data || store.getPublished();
  const { courses } = currentData;
  const activeCourses = courses.filter((c) => c.active);

  if (activeCourses.length === 0) return null;

  return (
    <section id="cursos" className="py-20 md:py-28 bg-[#FFF8FA] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF0F4] border border-[#FAD0DE] text-[11px] font-bold text-[#E05A2B] uppercase tracking-wider mb-3">
            Gestão & Confeitaria Lucrativa
          </div>

          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#3B1D25] tracking-tight mb-4"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Domine as Finanças da sua Confeitaria
          </h2>

          <p className="text-sm sm:text-base text-[#6B4651] leading-relaxed">
            Saiba exatamente quanto cobrar por seus produtos, quanto cada produto gera de lucro, padronize suas receitas, saiba o valor de sua hora trabalhada e muito mais de uma forma prática e fácil.
          </p>
        </div>

        {/* Courses Cards */}
        <div className="space-y-8">
          {activeCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl sm:rounded-[36px] border border-[#FAD6E2] p-6 sm:p-10 lg:p-12 shadow-sm"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                
                {/* Left Column: Image with Badge */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-[#FAD0DE] bg-[#FFF2F6] aspect-square">
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-4 left-4 bg-[#B8134B] text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                      {course.badge}
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-[#FFF4F0] border border-[#FED7C8] flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FFE4D6] flex items-center justify-center text-[#E05A2B] shrink-0">
                      <TrendingUp className="w-4 h-4 text-[#C8451B]" />
                    </div>
                    <p className="text-xs sm:text-[13px] text-[#7A3620] leading-snug">
                      <strong className="font-bold text-[#A72B0A]">Chega de perder dinheiro:</strong> saiba exatamente seu lucro por fatia, cento e encomenda com precisão absoluta.
                    </p>
                  </div>
                </div>

                {/* Right Column: Details & Benefits */}
                <div className="lg:col-span-7 flex flex-col text-left">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2E8] border border-[#FED5C2] text-[#B84E1A] text-xs font-semibold">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#E05A2B]" />
                      {course.platform}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F5] border border-[#FAD0DE] text-[#B8134B] text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-[#D81E5B]" />
                      {course.price}
                    </span>
                  </div>

                  <h3 
                    className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#3B1D25] leading-tight mb-3"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    {course.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#6B4651] leading-relaxed mb-6">
                    {course.description}
                  </p>

                  {/* What you get box */}
                  <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FFF6F9] border border-[#FAD6E4] mb-8">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#A0294C] block mb-4">
                      O que você terá em mãos:
                    </span>

                    <ul className="space-y-3.5 text-xs sm:text-[13px] text-[#5C3642] leading-relaxed">
                      {course.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-lg bg-[#FFE6EF] flex items-center justify-center text-[#D81E5B] shrink-0 mt-0.5">
                            <Calculator className="w-3.5 h-3.5" />
                          </div>
                          <div>{b}</div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Call to action & trust badge */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <a
                      href={course.checkout_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#B8134B] hover:bg-[#990D3C] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      <span>Faça seu pedido</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>

                    <div className="flex items-center gap-2 text-xs text-[#7A505D]">
                      <Lock className="w-3.5 h-3.5 text-[#B8134B]" />
                      <span>Compra 100% segura & envio imediato</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

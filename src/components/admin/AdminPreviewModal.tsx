import React, { useState } from 'react';
import { AppDatabase } from '../../types';
import { Modal } from '../ui/Modal';
import { Monitor, Tablet, Smartphone, X } from 'lucide-react';
import { Hero } from '../Hero';
import { Specialties } from '../Specialties';
import { AboutChef } from '../AboutChef';
import { CoursesSection } from '../CoursesSection';
import { ImportantGuidelines } from '../ImportantGuidelines';
import { FAQSection } from '../FAQSection';
import { Footer } from '../Footer';
import { Navbar } from '../Navbar';

interface AdminPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftData: AppDatabase;
}

export const AdminPreviewModal: React.FC<AdminPreviewModalProps> = ({
  isOpen,
  onClose,
  draftData,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const viewportWidthClass = {
    desktop: 'w-full max-w-6xl',
    tablet: 'w-[768px]',
    mobile: 'w-[390px]',
  }[viewport];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Preview Control Bar */}
      <div className="h-16 bg-[#2B151C] border-b border-[#4D2833] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FAD0DE] bg-[#D81E5B]/40 px-2.5 py-1 rounded-lg">
            Modo Pré-visualização
          </span>
          <span className="text-xs text-white/80 hidden sm:inline">
            Renderizando os dados atuais do rascunho em tempo real
          </span>
        </div>

        {/* Viewport switchers */}
        <div className="flex items-center gap-1 bg-[#3D1E26] p-1 rounded-xl border border-[#5E2F3D]">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewport === 'desktop' ? 'bg-[#D81E5B] text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
            title="Desktop (1280px+)"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewport === 'tablet' ? 'bg-[#D81E5B] text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
            title="Tablet (768px)"
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewport === 'mobile' ? 'bg-[#D81E5B] text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
            title="Mobile (390px)"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Fechar pré-visualização"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Preview Stage Container */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-[#1F0E14]/90">
        <div
          className={`${viewportWidthClass} bg-[#FFF3F6] min-h-full rounded-2xl shadow-2xl overflow-y-auto transition-all duration-300 border border-[#FAD0DE] text-[#3D262B] relative`}
        >
          {/* Header Preview */}
          <Navbar data={draftData} onOpenOrderModal={() => {}} isPreviewMode={true} />

          <main>
            <Hero data={draftData} onOpenOrderModal={() => {}} />
            <Specialties data={draftData} onSelectItemForOrder={() => {}} />
            <AboutChef data={draftData} />
            <CoursesSection data={draftData} />
            <ImportantGuidelines data={draftData} />
            <FAQSection data={draftData} />
          </main>

          <Footer data={draftData} />
        </div>
      </div>
    </div>
  );
};

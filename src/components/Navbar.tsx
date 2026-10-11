import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Instagram, MessageCircle, Menu, X, Store } from 'lucide-react';
import { AppDatabase, AtelierStatus } from '../types';
import { store } from '../lib/store';
import { generateWhatsAppUrl } from '../lib/whatsapp';

interface NavbarProps {
  onOpenOrderModal: () => void;
  data?: AppDatabase;
  isPreviewMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOrderModal, data, isPreviewMode = false }) => {
  const currentData = data || store.getPublished();
  const { settings, home } = currentData;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isPreviewMode) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPreviewMode]);

  const navLinks = [
    { label: 'Cardápio', href: '#cardapio' },
    { label: 'Sobre a Manu', href: '#sobre' },
    { label: 'Gestão Lucrativa', href: '#cursos' },
    { label: 'Orientações', href: '#orientacoes' },
    { label: 'Dúvidas', href: '#faq' },
  ];

  const statusBadges: Record<AtelierStatus, { label: string; color: string }> = {
    aberto: { label: 'Ateliê Aberto', color: 'bg-emerald-500' },
    fechado: { label: 'Ateliê Fechado', color: 'bg-rose-500' },
    somente_encomendas: { label: 'Sob Encomenda', color: 'bg-amber-500' },
    agenda_lotada: { label: 'Agenda Lotada', color: 'bg-purple-500' },
    pronta_entrega: { label: 'Pronta Entrega', color: 'bg-blue-500' },
  };

  const statusInfo = statusBadges[settings.atelier_status] || statusBadges.aberto;

  return (
    <header 
      className={`${isPreviewMode ? 'relative' : 'fixed top-0 left-0 right-0'} z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#FFF3F6]/95 backdrop-blur-md shadow-xs border-b border-[#FCE3EB] py-2 sm:py-2.5' 
          : 'bg-[#FFF3F6]/85 backdrop-blur-xs py-3 sm:py-3.5 border-b border-[#FEE7EE]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark with dynamic logo */}
        <div className="flex items-center gap-3">
          <a 
            href="#" 
            className="group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#D81E5B] rounded-lg transition-transform active:scale-98"
            aria-label={`${settings.company_name} - Página Inicial`}
          >
            <Logo size="md" customLogoUrl={home.logo_url} />
          </a>

          {/* Live Atelier Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-[#FAD0DE] text-[11px] font-bold text-[#3D1E26] shadow-2xs">
            <span className={`w-2 h-2 rounded-full ${statusInfo.color} animate-pulse`} />
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#6B4651]">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative py-1 hover:text-[#D81E5B] transition-colors focus:outline-hidden focus-visible:text-[#D81E5B]"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D81E5B] rounded-full transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary Actions (Instagram + CTA WhatsApp) */}
        <div className="flex items-center gap-3">
          <a
            href={settings.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full text-[#A13A5C] hover:text-[#D81E5B] hover:bg-[#FDE7EE] transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#D81E5B]"
            title={`Siga ${settings.instagram_handle} no Instagram`}
            aria-label="Instagram da Doceria da Manu"
          >
            <Instagram className="w-5 h-5" />
          </a>

          <button
            onClick={onOpenOrderModal}
            className="hidden sm:inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold tracking-wide shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Pedir Agora</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#733B4C] hover:text-[#D81E5B] rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#D81E5B]"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFF3F6] border-b border-[#FCE0E9] px-6 py-5 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#643E49] hover:text-[#D81E5B] py-2 border-b border-[#FEEBF0] last:border-none"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenOrderModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#25D366] text-white text-sm font-semibold shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Faça seu pedido via WhatsApp</span>
              </button>
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-[#F5BCCF] text-[#D81E5B] text-sm font-medium hover:bg-[#FDE9F0]"
              >
                <Instagram className="w-4 h-4" />
                <span>{settings.instagram_handle}</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

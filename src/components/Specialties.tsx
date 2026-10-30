import React, { useState } from 'react';
import { Sparkles, MessageCircle, Heart, Users, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AppDatabase } from '../types';
import { store } from '../lib/store';
import { generateWhatsAppUrl } from '../lib/whatsapp';

interface SpecialtiesProps {
  onSelectItemForOrder: (itemName: string, itemCategory?: string) => void;
  data?: AppDatabase;
}

export const Specialties: React.FC<SpecialtiesProps> = ({ onSelectItemForOrder, data }) => {
  const currentData = data || store.getPublished();
  const { specialties, products } = currentData;
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [galleryViewer, setGalleryViewer] = useState<{ images: string[]; index: number; title: string } | null>(null);

  const categories = [
    { id: 'all', label: 'Todos os Itens' },
    { id: 'bolos', label: 'Bolos Decorados' },
    { id: 'bento', label: 'Bentô Cakes' },
    { id: 'kits', label: 'Kits Festa' },
    { id: 'doces', label: 'Doces & Brigadeiros' },
    { id: 'salgados', label: 'Salgados' },
    { id: 'escola', label: 'Festa na Escola' },
  ];

  // The public menu is product-driven. `specialties` remains as optional
  // editorial enrichment for legacy products, while every active product is
  // rendered even when it shares a category with another one.
  const activeSpecialties = products
    .filter((product) => product.active)
    .map((product) => {
      const specialty = specialties.find(
        (item) => item.id === product.id || (item.slug && product.slug && item.slug === product.slug)
      );

      return {
        id: product.id,
        category: product.category,
        slug: product.slug,
        title: product.name,
        subtitle: product.card_subtitle || specialty?.subtitle || product.short_description || product.minimum_notice,
        description: product.full_description,
        image: product.main_image,
        serves: product.unit,
        badge: product.badge,
        seoTag: product.card_tag || specialty?.seoTag || '',
        startingPrice: product.starting_price_display,
        highlights: (product.card_highlights || specialty?.highlights || []).filter(Boolean),
        gallery: Array.from(new Set([product.main_image, ...(product.gallery || [])].filter(Boolean))),
        sort_order: product.sort_order,
        active: product.active,
        featured: product.featured,
      };
    })
    .sort((a, b) => a.sort_order - b.sort_order);
  const filteredItems = activeSpecialties
    .filter((item) => activeCategory === 'all' || item.category === activeCategory)
    .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }));

  const changeGalleryImage = (direction: -1 | 1) => {
    setGalleryViewer((current) => current && ({
      ...current,
      index: (current.index + direction + current.images.length) % current.images.length,
    }));
  };

  return (
    <section id="cardapio" className="py-20 md:py-28 bg-[#FFF8FA] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E05A2B] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cardápio Exclusivo</span>
          </div>

          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#3B1D25] tracking-tight mb-4"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            O que oferecemos
          </h2>

          <p className="text-base text-[#6B4651] leading-relaxed">
            Cada doce é preparado artesanalmente com ingredientes nobres, equilíbrio perfeito de açúcar e técnicas de decoração que tornam seu evento inesquecível.
          </p>

          {/* Interactive Filter Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#FFF0F4] rounded-2xl max-w-2xl mx-auto border border-[#FAD2DE]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-white text-[#D81E5B] shadow-xs border border-[#F6BDD1]'
                    : 'text-[#7B535F] hover:text-[#D81E5B] hover:bg-white/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2 or 3 Columns Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#FCE1EB] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Image Frame with Smooth Scale Hover */}
              <button
                type="button"
                onClick={() => setGalleryViewer({ images: item.gallery, index: 0, title: item.title })}
                className="relative aspect-4/3 w-full overflow-hidden bg-[#FFF0F4] text-left cursor-zoom-in"
                aria-label={`Ampliar fotos de ${item.title}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-106"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />

                {/* Badge */}
                {item.badge && (
                  <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-xl text-[11px] font-bold text-[#A81B4B] border border-[#FAD0DE] shadow-xs">
                    {item.badge}
                  </div>
                )}

                {/* Starting Price Overlay */}
                <div className="absolute bottom-3 left-3.5 bg-[#3D1E26]/85 backdrop-blur-xs px-3 py-1 rounded-xl text-xs font-semibold text-white">
                  {item.startingPrice}
                </div>
              </button>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#8C5D6C] font-medium mb-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#D81E5B]" />
                      {item.serves}
                    </span>
                    {item.seoTag && (
                      <>
                        <span>·</span>
                        <span>{item.seoTag}</span>
                      </>
                    )}
                  </div>

                  <h3 
                    className="text-xl font-bold text-[#3D1E26] group-hover:text-[#D81E5B] transition-colors mb-1.5"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#E05A2B] font-semibold mb-3">
                    {item.subtitle}
                  </p>

                  <p className="text-sm text-[#6C4752] leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Highlights checklist */}
                  {item.highlights && item.highlights.length > 0 && (
                    <ul className="space-y-1.5 mb-6 text-xs text-[#5E3B46]">
                      {item.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Action CTA */}
                <div className="pt-4 border-t border-[#FEE7EF] flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectItemForOrder(item.title, item.category)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#FFF0F5] hover:bg-[#D81E5B] text-[#A81B4B] hover:text-white font-semibold text-xs tracking-wide border border-[#FAD0DE] hover:border-[#D81E5B] transition-all duration-200 cursor-pointer shadow-2xs group-hover:bg-[#D81E5B] group-hover:text-white"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Encomendar {item.title}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {galleryViewer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2D111A]/85 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label={`Fotos de ${galleryViewer.title}`}>
            <button
              type="button"
              onClick={() => setGalleryViewer(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white text-[#3D1E26] flex items-center justify-center hover:bg-[#FFF0F4] transition-colors cursor-pointer"
              aria-label="Fechar fotos"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full max-w-5xl">
              <img
                src={galleryViewer.images[galleryViewer.index]}
                alt={`${galleryViewer.title} — foto ${galleryViewer.index + 1}`}
                className="max-h-[80vh] w-full object-contain rounded-3xl bg-white shadow-2xl"
                referrerPolicy="no-referrer"
              />

              {galleryViewer.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => changeGalleryImage(-1)}
                    className="absolute left-2 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-[#D81E5B] flex items-center justify-center shadow-lg hover:bg-[#FFF0F4] transition-colors cursor-pointer"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => changeGalleryImage(1)}
                    className="absolute right-2 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-[#D81E5B] flex items-center justify-center shadow-lg hover:bg-[#FFF0F4] transition-colors cursor-pointer"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <p className="mt-3 text-center text-xs font-bold text-white">
                    {galleryViewer.index + 1} de {galleryViewer.images.length}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Custom Order Callout Bar */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FFF0F4] via-[#FFEBF1] to-[#FFF0F4] border border-[#F8C8D8] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#F6BCCF] flex items-center justify-center shrink-0 shadow-xs">
              <Heart className="w-6 h-6 text-[#D81E5B]" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-[#3D1E26]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                Procurando um tema ou bolo personalizado do Pinterest?
              </h4>
              <p className="text-xs sm:text-sm text-[#734A56]">
                Envie suas fotos de inspiração. Recriamos com a identidade afetiva da Manu.
              </p>
            </div>
          </div>

          <a
            href={generateWhatsAppUrl("Olá, Manu! Tenho uma ideia personalizada de bolo e gostaria de um orçamento.")}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Enviar Minha Ideia no WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};

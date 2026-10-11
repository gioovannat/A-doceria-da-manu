import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Specialties } from './components/Specialties';
import { AboutChef } from './components/AboutChef';
import { CoursesSection } from './components/CoursesSection';
import { ImportantGuidelines } from './components/ImportantGuidelines';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { OrderModal } from './components/OrderModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { ToastProvider } from './components/ui/Toast';
import { router } from './lib/router';
import { store } from './lib/store';
import { auth } from './lib/auth';
import { isAdminRoute, isLoginRoute } from './config/admin';
import { AppDatabase } from './types';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(router.getPath());
  const [publishedData, setPublishedData] = useState<AppDatabase>(store.getPublished());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(auth.isAuthenticated());

  // Interactive modal on public site
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedItemForOrder, setSelectedItemForOrder] = useState<string>('');
  const [selectedFlavorForOrder, setSelectedFlavorForOrder] = useState<string>('');

  useEffect(() => {
    const unsubRouter = router.subscribe((path) => setCurrentPath(path));
    const unsubStore = store.subscribe(() => setPublishedData(store.getPublished()));
    const unsubAuth = auth.subscribe(() => setIsAuthenticated(auth.isAuthenticated()));

    return () => {
      unsubRouter();
      unsubStore();
      unsubAuth();
    };
  }, []);

  const handleOpenOrderModal = () => {
    setSelectedItemForOrder(publishedData.products[0]?.name || 'Bolo Decorado');
    setSelectedFlavorForOrder(publishedData.flavors[0]?.name || 'Ninho com Morangos Frescos');
    setIsOrderModalOpen(true);
  };

  const handleSelectItemForOrder = (itemName: string, itemCategory?: string) => {
    const categoryAliases: Record<string, string[]> = {
      bolos: ['bolos', 'bolo'],
      bento: ['bento'],
      kits: ['kits', 'kit'],
      doces: ['doces', 'brigadeiros'],
      salgados: ['salgados'],
      escola: ['escola'],
    };
    const normalizedItemName = itemName.trim().toLowerCase();
    const selectedProduct = publishedData.products.find((product) => {
      if (product.name.trim().toLowerCase() === normalizedItemName || product.slug === normalizedItemName) {
        return true;
      }

      return itemCategory
        ? (categoryAliases[itemCategory] || [itemCategory]).some((alias) =>
            product.category.toLowerCase().includes(alias),
          )
        : false;
    });

    setSelectedItemForOrder(selectedProduct?.name || itemName);
    setIsOrderModalOpen(true);
  };

  // =======================================================================
  // 1. ÁREA ADMINISTRATIVA (ROTA PROTEGIDA & TOTALMENTE SEPARADA)
  // =======================================================================
  if (isAdminRoute(currentPath)) {
    // Tela de login administrativo
    if (isLoginRoute(currentPath) || !isAuthenticated) {
      return (
        <ToastProvider>
          <AdminLogin />
        </ToastProvider>
      );
    }

    // Painel administrativo autenticado
    return (
      <ToastProvider>
        <AdminLayout />
      </ToastProvider>
    );
  }

  // =======================================================================
  // 2. ÁREA PÚBLICA (VISITANTES - SEM NENHUM LINK OU RASTRO DO ADMIN)
  // =======================================================================
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FFF3F6] text-[#3D262B] flex flex-col font-sans selection:bg-[#F3C5D3] selection:text-[#9A1747]">
        {/* Header Fixo */}
        <Navbar onOpenOrderModal={handleOpenOrderModal} data={publishedData} />

        {/* Main Content Sections */}
        <main className="flex-1">
          {/* Hero Section com Imagem Flutuante & CTA WhatsApp */}
          <Hero onOpenOrderModal={handleOpenOrderModal} data={publishedData} />

          {/* Nossas Especialidades (Menu em Grid) */}
          <Specialties onSelectItemForOrder={handleSelectItemForOrder} data={publishedData} />

          {/* Sobre a Confeiteira */}
          <AboutChef data={publishedData} />

          {/* Cursos & Gestão Financeira */}
          <CoursesSection data={publishedData} />

          {/* Orientações & Cuidados Importantes */}
          <ImportantGuidelines data={publishedData} />

          {/* Dúvidas Frequentes (FAQ Estruturado) */}
          <FAQSection data={publishedData} />
        </main>

        {/* Rodapé com Informações Oficiais */}
        <Footer data={publishedData} />

        {/* Simulador de Pedido / Orçamento */}
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          initialItem={selectedItemForOrder}
          initialFlavor={selectedFlavorForOrder}
          data={publishedData}
        />

        {/* Floating WhatsApp Action Button */}
        <FloatingWhatsApp />
      </div>
    </ToastProvider>
  );
}

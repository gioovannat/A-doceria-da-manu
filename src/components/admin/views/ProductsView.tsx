import React, { useState, useEffect } from 'react';
import { AppDatabase, Product, ProductVariation, Flavor, PackagingOption, Addon, CakeBatter } from '../../../types';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Switch } from '../../ui/Switch';
import { Badge } from '../../ui/Badge';
import { Modal } from '../../ui/Modal';
import { ImageUploader } from '../../ui/ImageUploader';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { 
  Cake, 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  DollarSign, 
  Box, 
  Check, 
  Layers, 
  Gift,
  ArrowRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../../ui/Toast';

interface ProductsViewProps {
  data: AppDatabase;
  onChange: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ data, onChange }) => {
  const { success } = useToast();

  // Active product being edited
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productActiveTab, setProductActiveTab] = useState<'geral' | 'massas' | 'variacoes' | 'sabores' | 'embalagens' | 'adicionais'>('geral');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const categoryLabels: Record<string, string> = {
    bolos: 'Bolos Decorados',
    bento: 'Bentô Cakes',
    kits: 'Kits Festa',
    doces: 'Doces Gourmet',
    salgados: 'Salgados Artesanais',
    escola: 'Festa na Escola',
  };

  // Sub-items temporary forms inside the product modal
  const [newBatter, setNewBatter] = useState({ name: '', description: '', additional_price: 0 });
  const [newVariation, setNewVariation] = useState({ name: '', description: '', price: 0, unit: 'unidade', lead_time: '48h' });
  const [newFlavor, setNewFlavor] = useState({ name: '', description: '', additional_price: 0 });
  const [newPackaging, setNewPackaging] = useState({ name: '', description: '', additional_price: 0, is_required: false });
  const [newAddon, setNewAddon] = useState({ name: '', description: '', price: 15, unit: 'unidade', image: '' });
  const [editingBatter, setEditingBatter] = useState<CakeBatter | null>(null);
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null);
  const [editingFlavor, setEditingFlavor] = useState<Flavor | null>(null);
  const [editingPackaging, setEditingPackaging] = useState<PackagingOption | null>(null);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);

  // Modal exclusivo de gerenciamento de massas para todos os bolos
  const [isBattersModalOpen, setIsBattersModalOpen] = useState(false);
  const [customBattersList, setCustomBattersList] = useState<CakeBatter[]>([]);
  const [newGlobalBatter, setNewGlobalBatter] = useState({ name: '', description: '', additional_price: 0 });
  const [editingGlobalBatter, setEditingGlobalBatter] = useState<CakeBatter | null>(null);

  // Carrega a lista consolidada de massas cadastradas no cardápio
  useEffect(() => {
    const list: CakeBatter[] = [];
    const seen = new Set<string>();
    for (const p of data.products) {
      if (p.batters) {
        for (const b of p.batters) {
          const key = b.name.trim().toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            list.push(b);
          }
        }
      }
    }
    if (list.length > 0) {
      setCustomBattersList(list);
    }
  }, [data.products]);

  const handleAddGlobalBatter = () => {
    if (!newGlobalBatter.name.trim()) return;
    const item: CakeBatter = {
      id: 'bat-' + Date.now(),
      name: newGlobalBatter.name.trim(),
      description: newGlobalBatter.description,
      additional_price: Number(newGlobalBatter.additional_price) || 0,
      active: true,
    };
    setCustomBattersList((prev) => [...prev, item]);
    setNewGlobalBatter({ name: '', description: '', additional_price: 0 });
  };

  const handleRemoveGlobalBatter = (id: string) => {
    setCustomBattersList((prev) => prev.filter(b => b.id !== id));
  };

  const handleSaveGlobalBatter = () => {
    if (!editingGlobalBatter || !editingGlobalBatter.name.trim()) return;
    setCustomBattersList((prev) => prev.map((b) =>
      b.id === editingGlobalBatter.id ? { ...editingGlobalBatter, name: editingGlobalBatter.name.trim() } : b
    ));
    setEditingGlobalBatter(null);
  };

  const handleSaveAllBatters = () => {
    onChange((prev) => {
      const updatedProducts = prev.products.map((p) => {
        // Atualiza em bolos, bentos, kits ou itens que usam massa
        if (p.category === 'bolos' || p.category === 'bento' || p.category === 'kits' || p.requires_batter) {
          return { ...p, batters: customBattersList };
        }
        return p;
      });
      return {
        ...prev,
        products: updatedProducts,
      };
    });
    setIsBattersModalOpen(false);
    success('Massas salvas e sincronizadas! Elas já aparecem na página do visitante em "Monte seu Pedido".');
  };

  // ----------------------------------------------------------------------
  // Product handlers
  // ----------------------------------------------------------------------
  const handleOpenEditProduct = (prod: Product, initialTab: 'geral' | 'massas' | 'variacoes' | 'sabores' | 'embalagens' | 'adicionais' = 'geral') => {
    // Ensure all sub-arrays exist
    setEditingProduct({
      ...prod,
      batters: prod.batters || (prod.category === 'bolos' || prod.category === 'bento' ? [
        { id: 'bat-1', name: 'Massa Amanteigada de Baunilha', description: 'Estruturada, leve e aveludada', additional_price: 0, active: true },
        { id: 'bat-2', name: 'Massa de Chocolate 50% Cacau', description: 'Úmida e marcante com cacau nobre', additional_price: 0, active: true },
        { id: 'bat-3', name: 'Massa Red Velvet Veludo', description: 'Aveludada e macia', additional_price: 5, active: true },
      ] : []),
      variations: prod.variations || [],
      flavors: prod.flavors || [],
      packaging: prod.packaging || [],
      addons: prod.addons || [],
    });
    setProductActiveTab(initialTab);
  };

  const handleCreateNewProduct = () => {
    const newProd: Product = {
      id: 'prod-' + Date.now(),
      name: '',
      slug: '',
      full_description: '',
      category: 'bolos',
      main_image: data.home.hero_main_image,
      gallery: [],
      starting_price: 100,
      starting_price_display: 'R$ 100,00',
      unit: 'unidade',
      minimum_notice: '48h',
      badge: 'Novidade',
      active: true,
      featured: false,
      sort_order: data.products.length + 1,
      batters: [
        { id: 'bat-1', name: 'Massa Amanteigada de Baunilha', description: 'Estruturada, fofinha e com sabor aveludado', additional_price: 0, active: true },
        { id: 'bat-2', name: 'Massa de Chocolate 50% Cacau', description: 'Massa úmida e marcante com cacau nobre', additional_price: 0, active: true },
        { id: 'bat-3', name: 'Massa Red Velvet Veludo', description: 'Coloração rubi marcante e textura ultra macia', additional_price: 5, active: true },
      ],
      variations: [],
      flavors: [],
      packaging: [
        { id: 'pack-' + Date.now(), name: 'Caixa de Transporte Padrão', description: 'Embalagem segura e reforçada', additional_price: 0, is_required: true, active: true }
      ],
      addons: [],
    };
    setEditingProduct(newProd);
    setProductActiveTab('geral');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    onChange((prev) => {
      // Produtos são identificados pelo próprio id/slug, não pela categoria.
      // Isso permite cadastrar vários produtos em uma mesma categoria.
      const productIndex = prev.products.findIndex(
        (p) => p.id === editingProduct.id || (editingProduct.slug && p.slug === editingProduct.slug)
      );
      let updatedProducts = [...prev.products];
      if (productIndex >= 0) {
        updatedProducts[productIndex] = editingProduct;
      } else {
        updatedProducts.push(editingProduct);
      }

      // Mantém o registro legado de especialidade sincronizado somente quando
      // ele representa este mesmo produto.
      const specialtyIndex = prev.specialties.findIndex(
        (s) => s.id === editingProduct.id || (editingProduct.slug && s.slug === editingProduct.slug)
      );

      let updatedSpecialties = [...prev.specialties];
      if (specialtyIndex >= 0) {
        const existingSpec = updatedSpecialties[specialtyIndex];
        updatedSpecialties[specialtyIndex] = {
          ...existingSpec,
          title: editingProduct.name,
          slug: editingProduct.slug,
          description: editingProduct.full_description,
          image: editingProduct.main_image,
          badge: editingProduct.badge,
          startingPrice: editingProduct.starting_price_display,
          serves: editingProduct.unit,
          active: editingProduct.active,
          featured: editingProduct.featured,
        };
      }

      return {
        ...prev,
        products: updatedProducts,
        specialties: updatedSpecialties,
      };
    });

    success('Produto atualizado com sucesso!');
    setEditingProduct(null);
  };

  const handleDuplicateProduct = (prod: Product) => {
    const duplicated: Product = {
      ...prod,
      id: 'prod-' + Date.now(),
      name: `${prod.name} (Cópia)`,
      slug: `${prod.slug}-copia`,
      sort_order: data.products.length + 1,
      batters: prod.batters?.map(b => ({ ...b, id: 'bat-' + Date.now() + Math.random().toString(36).substr(2, 4) })),
      variations: prod.variations?.map(v => ({ ...v, id: 'var-' + Date.now() + Math.random().toString(36).substr(2, 4) })),
      flavors: prod.flavors?.map(f => ({ ...f, id: 'flav-' + Date.now() + Math.random().toString(36).substr(2, 4) })),
      packaging: prod.packaging?.map(p => ({ ...p, id: 'pack-' + Date.now() + Math.random().toString(36).substr(2, 4) })),
      addons: prod.addons?.map(a => ({ ...a, id: 'add-' + Date.now() + Math.random().toString(36).substr(2, 4) })),
    };
    onChange((prev) => ({
      ...prev,
      products: [...prev.products, duplicated],
    }));
    success('Produto e todas as suas particularidades duplicados!');
  };

  const confirmDeleteProduct = () => {
    if (!productToDelete) return;
    onChange((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productToDelete.id),
      specialties: prev.specialties.filter((s) => s.id !== productToDelete.id && s.slug !== productToDelete.slug),
    }));
    success('Produto excluído com sucesso!');
    setProductToDelete(null);
  };

  // ----------------------------------------------------------------------
  // Sub-items manipulation inside active editingProduct
  // ----------------------------------------------------------------------
  const handleAddBatterToProduct = () => {
    if (!editingProduct || !newBatter.name.trim()) return;
    const item: CakeBatter = {
      id: 'bat-' + Date.now(),
      name: newBatter.name.trim(),
      description: newBatter.description,
      additional_price: Number(newBatter.additional_price) || 0,
      active: true,
    };
    setEditingProduct({
      ...editingProduct,
      batters: [...(editingProduct.batters || []), item],
    });
    setNewBatter({ name: '', description: '', additional_price: 0 });
    success('Tipo de massa adicionado a este bolo!');
  };

  const handleRemoveBatterFromProduct = (id: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      batters: editingProduct.batters?.filter((b) => b.id !== id) || [],
    });
  };

  const handleSaveBatter = () => {
    if (!editingProduct || !editingBatter || !editingBatter.name.trim()) return;
    setEditingProduct({
      ...editingProduct,
      batters: editingProduct.batters?.map((b) =>
        b.id === editingBatter.id ? { ...editingBatter, name: editingBatter.name.trim() } : b
      ) || [],
    });
    setEditingBatter(null);
    success('Massa atualizada. Salve as configurações do produto para publicar.');
  };

  const handleAddVariationToProduct = () => {
    if (!editingProduct || !newVariation.name.trim()) return;
    const item: ProductVariation = {
      id: 'var-' + Date.now(),
      product_id: editingProduct.id,
      name: newVariation.name.trim(),
      description: newVariation.description,
      price: Number(newVariation.price) || 0,
      unit: newVariation.unit || 'unidade',
      lead_time: newVariation.lead_time || '48h',
      active: true,
    };
    setEditingProduct({
      ...editingProduct,
      variations: [...(editingProduct.variations || []), item],
    });
    setNewVariation({ name: '', description: '', price: 0, unit: 'unidade', lead_time: '48h' });
    success('Variação adicionada ao produto!');
  };

  const handleRemoveVariationFromProduct = (id: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      variations: editingProduct.variations?.filter((v) => v.id !== id) || [],
    });
  };

  const handleSaveVariation = () => {
    if (!editingProduct || !editingVariation || !editingVariation.name.trim()) return;
    setEditingProduct({
      ...editingProduct,
      variations: editingProduct.variations?.map((v) =>
        v.id === editingVariation.id ? { ...editingVariation, name: editingVariation.name.trim() } : v
      ) || [],
    });
    setEditingVariation(null);
    success('Tamanho atualizado. Salve as configurações do produto para publicar.');
  };

  const handleAddFlavorToProduct = () => {
    if (!editingProduct || !newFlavor.name.trim()) return;
    const item: Flavor = {
      id: 'flav-' + Date.now(),
      name: newFlavor.name.trim(),
      description: newFlavor.description,
      additional_price: Number(newFlavor.additional_price) || 0,
      active: true,
    };
    setEditingProduct({
      ...editingProduct,
      flavors: [...(editingProduct.flavors || []), item],
    });
    setNewFlavor({ name: '', description: '', additional_price: 0 });
    success('Sabor adicionado exclusivamente para este produto!');
  };

  const handleRemoveFlavorFromProduct = (id: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      flavors: editingProduct.flavors?.filter((f) => f.id !== id) || [],
    });
  };

  const handleSaveFlavor = () => {
    if (!editingProduct || !editingFlavor || !editingFlavor.name.trim()) return;
    setEditingProduct({
      ...editingProduct,
      flavors: editingProduct.flavors?.map((flavor) =>
        flavor.id === editingFlavor.id ? { ...editingFlavor, name: editingFlavor.name.trim() } : flavor
      ) || [],
    });
    setEditingFlavor(null);
    success('Recheio atualizado. Salve as configurações do produto para publicar.');
  };

  const handleAddPackagingToProduct = () => {
    if (!editingProduct || !newPackaging.name.trim()) return;
    const item: PackagingOption = {
      id: 'pack-' + Date.now(),
      name: newPackaging.name.trim(),
      description: newPackaging.description,
      additional_price: Number(newPackaging.additional_price) || 0,
      is_required: newPackaging.is_required,
      active: true,
    };
    setEditingProduct({
      ...editingProduct,
      packaging: [...(editingProduct.packaging || []), item],
    });
    setNewPackaging({ name: '', description: '', additional_price: 0, is_required: false });
    success('Embalagem adicionada a este produto!');
  };

  const handleRemovePackagingFromProduct = (id: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      packaging: editingProduct.packaging?.filter((p) => p.id !== id) || [],
    });
  };

  const handleSavePackaging = () => {
    if (!editingProduct || !editingPackaging || !editingPackaging.name.trim()) return;
    setEditingProduct({
      ...editingProduct,
      packaging: editingProduct.packaging?.map((packaging) =>
        packaging.id === editingPackaging.id ? { ...editingPackaging, name: editingPackaging.name.trim() } : packaging
      ) || [],
    });
    setEditingPackaging(null);
    success('Embalagem atualizada. Salve as configurações do produto para publicar.');
  };

  const handleAddAddonToProduct = () => {
    if (!editingProduct || !newAddon.name.trim()) return;
    const item: Addon = {
      id: 'add-' + Date.now(),
      name: newAddon.name.trim(),
      description: newAddon.description,
      price: Number(newAddon.price) || 0,
      unit: newAddon.unit || 'unidade',
      image: newAddon.image || undefined,
      active: true,
    };
    setEditingProduct({
      ...editingProduct,
      addons: [...(editingProduct.addons || []), item],
    });
    setNewAddon({ name: '', description: '', price: 15, unit: 'unidade', image: '' });
    success('Adicional vinculado exclusivamente a este produto!');
  };

  const handleRemoveAddonFromProduct = (id: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      addons: editingProduct.addons?.filter((a) => a.id !== id) || [],
    });
  };

  const handleSaveAddon = () => {
    if (!editingProduct || !editingAddon || !editingAddon.name.trim()) return;
    setEditingProduct({
      ...editingProduct,
      addons: editingProduct.addons?.map((addon) =>
        addon.id === editingAddon.id ? { ...editingAddon, name: editingAddon.name.trim() } : addon
      ) || [],
    });
    setEditingAddon(null);
    success('Adicional atualizado. Salve as configurações do produto para publicar.');
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Banner explicativo */}
      <div className="p-4 rounded-2xl bg-[#FFF0F5] border border-[#FAD0DE] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#D81E5B] shrink-0 mt-0.5" />
        <div className="text-xs text-[#6B4651] leading-relaxed">
          <strong className="text-[#3D1E26] font-bold">Configurações Particulares por Produto:</strong> Agora os <strong>sabores e recheios</strong>, <strong>opções de embalagem</strong>, <strong>adicionais/opcionais</strong> e <strong>tamanhos/variações</strong> são configurados individualmente dentro de cada produto. Assim, os docinhos têm seus próprios brigadeiros, o bentô tem suas lancheiras exclusivas e os bolos decorados têm seus topos e recheios específicos.
        </div>
      </div>

      {/* Header com Ação */}
      <Card
        title="Produtos & Cardápio Completo"
        subtitle="Gerencie todos os itens comercializados e clique em cada um para personalizar seus recheios, embalagens e adicionais."
        headerAction={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={<Cake className="w-4 h-4 text-[#D81E5B]" />}
              onClick={() => setIsBattersModalOpen(true)}
            >
              Configurar Massas dos Bolos
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleCreateNewProduct}
            >
              Criar Novo Produto
            </Button>
          </div>
        }
      >
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-2 border-b border-[#FAD0DE]/60">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategoryFilter === 'all'
                ? 'bg-[#D81E5B] text-white shadow-xs'
                : 'bg-white text-[#7B535F] hover:bg-[#FFF0F4] border border-[#FAD0DE]'
            }`}
          >
            Todos ({data.products.length})
          </button>
          {Object.entries(categoryLabels).map(([catKey, catLabel]) => {
            const count = data.products.filter((p) => p.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategoryFilter(catKey)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategoryFilter === catKey
                    ? 'bg-[#D81E5B] text-white shadow-xs'
                    : 'bg-white text-[#7B535F] hover:bg-[#FFF0F4] border border-[#FAD0DE]'
                }`}
              >
                <span>{catLabel}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategoryFilter === catKey ? 'bg-white/30 text-white' : 'bg-[#FFF0F4] text-[#D81E5B]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {data.products
            .filter((p) => selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter)
            .map((prod) => {
            const numBatters = prod.batters?.length || 0;
            const numVariations = prod.variations?.length || 0;
            const numFlavors = prod.flavors?.length || 0;
            const numPackaging = prod.packaging?.length || 0;
            const numAddons = prod.addons?.length || 0;
            const isCakeCategory = prod.category === 'bolos' || prod.category === 'bento';

            return (
              <div
                key={prod.id}
                className={`flex flex-col bg-white rounded-3xl border transition-all overflow-hidden ${
                  prod.active ? 'border-[#FAD0DE] shadow-xs hover:shadow-md' : 'border-gray-200 opacity-60 bg-gray-50'
                }`}
              >
                {/* Imagem e Badges */}
                <div className="relative aspect-16/9 overflow-hidden bg-[#FFF2F6]">
                  <img
                    src={prod.main_image}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <Badge variant={prod.active ? 'emerald' : 'gray'}>
                      {prod.active ? 'Ativo' : 'Pausado'}
                    </Badge>
                    {prod.badge && <Badge variant="pink">{prod.badge}</Badge>}
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 bg-black/80 px-2.5 py-1 rounded-lg text-white font-bold text-xs">
                    {prod.starting_price_display || `R$ ${prod.starting_price}`}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#E05A2B] uppercase tracking-wider bg-[#FFF2F6] px-2 py-0.5 rounded-md border border-[#FAD0DE]/60">
                        {categoryLabels[prod.category] || prod.category}
                      </span>
                      <span className="text-[11px] text-[#7A505D]">{prod.minimum_notice}</span>
                    </div>

                    <h4 className="text-lg font-bold text-[#3D1E26]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                      {prod.name}
                    </h4>

                    <p className="text-xs text-[#6B4651] line-clamp-2 mt-1 mb-3 leading-relaxed">
                      {prod.full_description}
                    </p>

                    {/* Regras obrigatórias do produto */}
                    {(prod.requires_batter || (prod.min_flavors && prod.min_flavors > 0) || (prod.min_addons && prod.min_addons > 0)) && (
                      <div className="flex flex-wrap gap-1.5 mb-3.5">
                        {prod.requires_batter && <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#FFF0F4] text-[#B8134B] px-2 py-0.5 rounded-md border border-[#FAD0DE]"><Check className="w-3 h-3 text-[#D81E5B]" /> Massa Obrigatória</span>}
                        {(prod.min_flavors ?? 0) > 0 && <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#FFF0F4] text-[#B8134B] px-2 py-0.5 rounded-md border border-[#FAD0DE]"><Check className="w-3 h-3 text-[#D81E5B]" /> {prod.min_flavors} {prod.min_flavors === 1 ? 'Recheio Obrigatório' : 'Recheios Obrigatórios'}</span>}
                        {(prod.min_addons ?? 0) > 0 && <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#FFF0F4] text-[#B8134B] px-2 py-0.5 rounded-md border border-[#FAD0DE]"><Check className="w-3 h-3 text-[#D81E5B]" /> Mín. {prod.min_addons} Adicional</span>}
                      </div>
                    )}

                    {/* Botões de acesso rápido às particularidades do produto */}
                    <div className={`grid gap-2 mb-4 ${isCakeCategory ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                      
                      {/* Massas exclusivo para bolos ou se configurado */}
                      {(isCakeCategory || numBatters > 0) && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(prod, 'massas')}
                          className="p-2 rounded-xl bg-[#FFF9FB] hover:bg-[#FFF0F4] border border-[#FAD0DE] text-left transition-colors cursor-pointer group"
                        >
                          <span className="block text-[10px] font-bold text-[#7A505D] uppercase">Massas</span>
                          <span className="text-xs font-bold text-[#D81E5B] flex items-center gap-1">
                            <Cake className="w-3 h-3" />
                            {numBatters} opções
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditProduct(prod, 'variacoes')}
                        className="p-2 rounded-xl bg-[#FFF9FB] hover:bg-[#FFF0F4] border border-[#FAD0DE] text-left transition-colors cursor-pointer group"
                      >
                        <span className="block text-[10px] font-bold text-[#7A505D] uppercase">Tamanhos</span>
                        <span className="text-xs font-bold text-[#D81E5B] flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {numVariations} opções
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditProduct(prod, 'sabores')}
                        className="p-2 rounded-xl bg-[#FFF9FB] hover:bg-[#FFF0F4] border border-[#FAD0DE] text-left transition-colors cursor-pointer group"
                      >
                        <span className="block text-[10px] font-bold text-[#7A505D] uppercase">Recheios</span>
                        <span className="text-xs font-bold text-[#D81E5B] flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {numFlavors} sabores
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditProduct(prod, 'embalagens')}
                        className="p-2 rounded-xl bg-[#FFF9FB] hover:bg-[#FFF0F4] border border-[#FAD0DE] text-left transition-colors cursor-pointer group"
                      >
                        <span className="block text-[10px] font-bold text-[#7A505D] uppercase">Embalagens</span>
                        <span className="text-xs font-bold text-[#D81E5B] flex items-center gap-1">
                          <Box className="w-3 h-3" />
                          {numPackaging} opções
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditProduct(prod, 'adicionais')}
                        className="p-2 rounded-xl bg-[#FFF9FB] hover:bg-[#FFF0F4] border border-[#FAD0DE] text-left transition-colors cursor-pointer group"
                      >
                        <span className="block text-[10px] font-bold text-[#7A505D] uppercase">Adicionais</span>
                        <span className="text-xs font-bold text-[#D81E5B] flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          {numAddons} itens
                        </span>
                      </button>

                    </div>
                  </div>

                  {/* Ações */}
                  <div className="pt-3 border-t border-[#FEE7EF] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<Edit3 className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenEditProduct(prod, 'geral')}
                      >
                        Configurar Produto
                      </Button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateProduct(prod)}
                        className="p-2 text-[#7A505D] hover:text-[#D81E5B] hover:bg-[#FFF0F4] rounded-xl cursor-pointer"
                        title="Duplicar Produto com todas as opções"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setProductToDelete(prod)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer"
                      title="Excluir Produto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ================================================================== */}
      {/* MODAL DE EDIÇÃO INTEGRADA DO PRODUTO (COM ABAS INTERNAS)           */}
      {/* ================================================================== */}
      {editingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          title={editingProduct.name ? `Configurar: ${editingProduct.name}` : 'Criar Novo Produto'}
          subtitle="Edite dados gerais, massas, tamanhos, recheios permitidos, embalagens e adicionais particulares deste item."
          size="xl"
        >
          {/* Navegação de Abas internas do Produto */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FFF0F4] rounded-2xl border border-[#FAD0DE] mb-6 overflow-x-auto">
            {[
              { id: 'geral', label: '1. Dados Gerais', icon: <Cake className="w-4 h-4" /> },
              ...(editingProduct.category === 'bolos' || editingProduct.category === 'bento' || (editingProduct.batters && editingProduct.batters.length > 0) ? [
                { id: 'massas', label: `2. Massas (${editingProduct.batters?.length || 0})`, icon: <Cake className="w-4 h-4 text-[#D81E5B]" /> }
              ] : []),
              { id: 'variacoes', label: `Tamanhos (${editingProduct.variations?.length || 0})`, icon: <Layers className="w-4 h-4" /> },
              { id: 'sabores', label: `Recheios (${editingProduct.flavors?.length || 0})`, icon: <Sparkles className="w-4 h-4" /> },
              { id: 'embalagens', label: `Embalagens (${editingProduct.packaging?.length || 0})`, icon: <Box className="w-4 h-4" /> },
              { id: 'adicionais', label: `Adicionais (${editingProduct.addons?.length || 0})`, icon: <Gift className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setProductActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  productActiveTab === tab.id
                    ? 'bg-[#D81E5B] text-white shadow-xs'
                    : 'text-[#6B4651] hover:text-[#D81E5B] hover:bg-white/60'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-6">
            
            {/* ------------------------------------------------------------ */}
            {/* ABA 1: DADOS GERAIS DO PRODUTO                                */}
            {/* ------------------------------------------------------------ */}
            {productActiveTab === 'geral' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome do Produto"
                    required
                    value={editingProduct.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                      setEditingProduct({ ...editingProduct, name, slug });
                    }}
                    placeholder="Ex: Bolo Vintage Heart Cake"
                  />

                  <Input
                    label="Slug (URL amigável)"
                    required
                    value={editingProduct.slug}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Categoria"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    options={[
                      { value: 'bolos', label: 'Bolos Decorados' },
                      { value: 'bento', label: 'Bentô Cakes' },
                      { value: 'kits', label: 'Kits Festa' },
                      { value: 'doces', label: 'Doces Gourmet' },
                      { value: 'salgados', label: 'Salgados Artesanais' },
                      { value: 'escola', label: 'Festa na Escola' },
                    ]}
                  />

                  <Input
                    label="Preço Inicial (Numérico)"
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.starting_price}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditingProduct({
                        ...editingProduct,
                        starting_price: val,
                        starting_price_display: `R$ ${val.toFixed(2).replace('.', ',')}`,
                      });
                    }}
                  />

                  <Input
                    label="Texto de Exibição do Preço"
                    value={editingProduct.starting_price_display}
                    onChange={(e) => setEditingProduct({ ...editingProduct, starting_price_display: e.target.value })}
                    placeholder="A partir de R$ 130"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Rendimento / Unidade"
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    placeholder="Ex: 15 a 20 fatias, cento..."
                  />

                  <Input
                    label="Prazo Mínimo de Encomenda"
                    value={editingProduct.minimum_notice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minimum_notice: e.target.value })}
                    placeholder="48h a 72h"
                  />

                  <Input
                    label="Selo em Destaque (Badge)"
                    value={editingProduct.badge}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    placeholder="Mais Pedido, Tendência..."
                  />
                </div>

                <Textarea
                  label="Descrição do Produto"
                  rows={3}
                  value={editingProduct.full_description || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingProduct({
                      ...editingProduct,
                      full_description: val,
                    });
                  }}
                  placeholder="Descreva a massa, os recheios, a cobertura e os detalhes especiais deste produto..."
                />

                <ImageUploader
                  label="Foto Principal do Produto"
                  value={editingProduct.main_image}
                  onChange={(url) => setEditingProduct({ ...editingProduct, main_image: url })}
                />

                <div className="pt-2">
                  <Switch
                    label="Produto Ativo no Cardápio Público"
                    checked={editingProduct.active}
                    onChange={(chk) => setEditingProduct({ ...editingProduct, active: chk })}
                  />
                </div>

                {/* REGRAS DE MONTAGEM E PAGAMENTO DO PRODUTO */}
                <div className="p-4 rounded-2xl bg-[#FFF8FA] border border-[#FAD0DE] space-y-3 mt-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D81E5B]" />
                    <h5 className="text-xs font-bold text-[#3D1E26] uppercase tracking-wider">
                      Regras de Montagem & Pagamento no Site
                    </h5>
                  </div>
                  <p className="text-[11px] text-[#7A505D] leading-relaxed">
                    Defina as exigências de montagem para o cliente (ex: escolha obrigatória de massa, 2 tipos de recheio e no mínimo 1 adicional). O conjunto de tudo selecionado é contabilizado no pedido final do cliente.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-white rounded-xl border border-[#FAD0DE] space-y-1">
                      <label className="text-[11px] font-bold text-[#3D1E26] block">
                        Massa Obrigatória?
                      </label>
                      <select
                        value={editingProduct.requires_batter ? 'sim' : 'nao'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, requires_batter: e.target.value === 'sim' })}
                        className="w-full text-xs p-2 rounded-lg border border-[#FAD0DE] bg-[#FFFDFC]"
                      >
                        <option value="sim">Sim (1 Massa Obrigatória)</option>
                        <option value="nao">Não (Opcional / Padrão)</option>
                      </select>
                      <span className="text-[10px] text-[#8C5D6C] block">Cliente deve escolher o tipo de massa</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#FAD0DE] space-y-1">
                      <label className="text-[11px] font-bold text-[#3D1E26] block">
                        Quantidade de Recheios
                      </label>
                      <select
                        value={editingProduct.min_flavors ?? (editingProduct.category === 'bolos' ? 2 : 1)}
                        onChange={(e) => {
                          const count = Number(e.target.value);
                          setEditingProduct({ ...editingProduct, min_flavors: count, max_flavors: count });
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-[#FAD0DE] bg-[#FFFDFC]"
                      >
                        <option value="0">Nenhum recheio</option>
                        <option value="1">1 Recheio Obrigatório</option>
                        <option value="2">2 Recheios Obrigatórios</option>
                        <option value="3">3 Recheios Obrigatórios</option>
                      </select>
                      <span className="text-[10px] text-[#8C5D6C] block">Ex: 2 tipos de recheio para bolo decorado</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#FAD0DE] space-y-1">
                      <label className="text-[11px] font-bold text-[#3D1E26] block">
                        Mínimo de Adicionais
                      </label>
                      <select
                        value={editingProduct.min_addons ?? (editingProduct.category === 'bolos' ? 1 : 0)}
                        onChange={(e) => {
                          const count = parseInt(e.target.value) || 0;
                          setEditingProduct({ ...editingProduct, min_addons: count });
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-[#FAD0DE] bg-[#FFFDFC]"
                      >
                        <option value="0">0 (Opcional)</option>
                        <option value="1">No mínimo 1 adicional obrigatório</option>
                        <option value="2">No mínimo 2 adicionais obrigatórios</option>
                      </select>
                      <span className="text-[10px] text-[#8C5D6C] block">Ex: Topo de bolo, velas, frutas</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FFF0F4] text-[11px] text-[#B8134B] font-medium flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>O valor final soma: Tamanho do Bolo + Massa + 2 Recheios + Embalagem + Adicionais selecionados!</span>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* ABA: MASSAS DO BOLO (TIPOS DE MASSA)                         */}
            {/* ------------------------------------------------------------ */}
            {productActiveTab === 'massas' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#3D1E26]">Tipos de Massa do Bolo</h4>
                    <p className="text-xs text-[#7A505D]">
                      Cadastre os tipos de massa disponíveis para este bolo (ex: Amanteigada de Baunilha, Chocolate 50% Cacau, Red Velvet Veludo).
                    </p>
                  </div>
                </div>

                {/* Lista de massas cadastradas */}
                <div className="space-y-2.5">
                  {(editingProduct.batters || []).length === 0 ? (
                    <div className="text-xs text-[#8C5D6C] py-4 text-center bg-[#FFF8FA] rounded-2xl border border-[#FAD0DE]">
                      Nenhuma massa cadastrada ainda para este bolo. Adicione abaixo os tipos de massa permitidos.
                    </div>
                  ) : (
                    editingProduct.batters?.map((bat) => (
                      <div
                        key={bat.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#FAD0DE] flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#3D1E26]">{bat.name}</span>
                            {bat.additional_price && bat.additional_price > 0 ? (
                              <span className="text-[11px] font-bold text-[#D81E5B]">
                                +R$ {bat.additional_price.toFixed(2)}
                              </span>
                            ) : (
                              <Badge variant="emerald" size="sm">Sem acréscimo</Badge>
                            )}
                          </div>
                          {bat.description && <p className="text-[11px] text-[#7A505D] mt-0.5">{bat.description}</p>}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingBatter({ ...bat })}
                            className="p-1.5 text-[#D81E5B] hover:bg-[#FFF0F4] rounded-lg cursor-pointer"
                            title="Editar tipo de massa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveBatterFromProduct(bat.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Remover tipo de massa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulário para adicionar nova massa */}
                <div className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE] space-y-3">
                  <h5 className="text-xs font-bold text-[#B8134B] uppercase tracking-wider">
                    Cadastrar Novo Tipo de Massa para {editingProduct.name || 'este bolo'}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Nome da Massa (ex: Baunilha Amanteigada, Red Velvet)"
                      value={newBatter.name}
                      onChange={(e) => setNewBatter({ ...newBatter, name: e.target.value })}
                    />
                    <Input
                      placeholder="Acréscimo de Preço (R$, ex: 0 ou 5)"
                      type="number"
                      step="0.5"
                      value={newBatter.additional_price || ''}
                      onChange={(e) => setNewBatter({ ...newBatter, additional_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <Input
                    placeholder="Descrição (ex: Massa estruturada, fofa e com aroma aveludado)"
                    value={newBatter.description}
                    onChange={(e) => setNewBatter({ ...newBatter, description: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={handleAddBatterToProduct}
                  >
                    Adicionar Tipo de Massa ao Bolo
                  </Button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* ABA 2: VARIAÇÕES & TAMANHOS DESTE PRODUTO                    */}
            {/* ------------------------------------------------------------ */}
            {productActiveTab === 'variacoes' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#3D1E26]">Tamanhos & Variações Disponíveis</h4>
                    <p className="text-xs text-[#7A505D]">Defina as medidas ou porções deste produto (ex: Pequeno, Médio, Grande).</p>
                  </div>
                </div>

                {/* Lista de variações cadastradas */}
                <div className="space-y-2.5">
                  {(editingProduct.variations || []).length === 0 ? (
                    <p className="text-xs text-[#8C5D6C] py-4 text-center bg-[#FFF8FA] rounded-2xl border border-[#FAD0DE]">
                      Nenhuma variação cadastrada ainda. O produto usará seu preço base inicial.
                    </p>
                  ) : (
                    editingProduct.variations?.map((v) => (
                      <div
                        key={v.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#FAD0DE] flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-[#3D1E26]">{v.name}</h5>
                            <span className="text-xs font-bold text-[#25D366]">R$ {v.price.toFixed(2)}</span>
                          </div>
                          {v.description && <p className="text-[11px] text-[#7A505D] mt-0.5">{v.description}</p>}
                          <span className="text-[10px] text-[#8C5D6C]">Prazo: {v.lead_time}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingVariation({ ...v })}
                            className="p-1.5 text-[#D81E5B] hover:bg-[#FFF0F4] rounded-lg cursor-pointer"
                            title="Editar tamanho"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariationFromProduct(v.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Excluir tamanho"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulário para adicionar nova variação */}
                <div className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE] space-y-3">
                  <h5 className="text-xs font-bold text-[#B8134B] uppercase tracking-wider">
                    Adicionar Novo Tamanho / Variação
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      placeholder="Nome (ex: Médio 25 fatias)"
                      value={newVariation.name}
                      onChange={(e) => setNewVariation({ ...newVariation, name: e.target.value })}
                    />
                    <Input
                      placeholder="Preço (R$)"
                      type="number"
                      step="1"
                      value={newVariation.price || ''}
                      onChange={(e) => setNewVariation({ ...newVariation, price: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      placeholder="Prazo (ex: 48h)"
                      value={newVariation.lead_time}
                      onChange={(e) => setNewVariation({ ...newVariation, lead_time: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Descrição complementar (ex: Diâmetro 18cm x 12cm de altura)"
                    value={newVariation.description}
                    onChange={(e) => setNewVariation({ ...newVariation, description: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={handleAddVariationToProduct}
                  >
                    Vincular Tamanho ao Produto
                  </Button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* ABA 3: SABORES & RECHEIOS PARTICULARES DESTE PRODUTO         */}
            {/* ------------------------------------------------------------ */}
            {productActiveTab === 'sabores' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#3D1E26]">Sabores & Recheios Deste Produto</h4>
                    <p className="text-xs text-[#7A505D]">
                      Apenas estes sabores aparecerão quando o cliente escolher <strong>{editingProduct.name || 'este produto'}</strong>.
                    </p>
                  </div>
                </div>

                {/* Lista de sabores do produto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(editingProduct.flavors || []).length === 0 ? (
                    <div className="sm:col-span-2 text-xs text-[#8C5D6C] py-4 text-center bg-[#FFF8FA] rounded-2xl border border-[#FAD0DE]">
                      Nenhum sabor particular adicionado para este produto ainda.
                    </div>
                  ) : (
                    editingProduct.flavors?.map((fl) => (
                      <div
                        key={fl.id}
                        className="p-3 rounded-2xl bg-white border border-[#FAD0DE] flex items-start justify-between gap-2 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#3D1E26]">{fl.name}</span>
                            {fl.additional_price > 0 ? (
                              <span className="text-[11px] font-bold text-[#D81E5B]">
                                +R$ {fl.additional_price.toFixed(2)}
                              </span>
                            ) : (
                              <Badge variant="emerald" size="sm">Incluso</Badge>
                            )}
                          </div>
                          {fl.description && <p className="text-[11px] text-[#7A505D] mt-0.5">{fl.description}</p>}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingFlavor({ ...fl })}
                            className="p-1 text-[#D81E5B] hover:bg-[#FFF0F4] rounded-lg cursor-pointer"
                            title="Editar recheio"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFlavorFromProduct(fl.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Excluir recheio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulário para adicionar sabor */}
                <div className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE] space-y-3">
                  <h5 className="text-xs font-bold text-[#B8134B] uppercase tracking-wider">
                    Cadastrar Novo Sabor para {editingProduct.name || 'este produto'}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Nome do Sabor (ex: Ninho com Nutella)"
                      value={newFlavor.name}
                      onChange={(e) => setNewFlavor({ ...newFlavor, name: e.target.value })}
                    />
                    <Input
                      placeholder="Preço Adicional (R$, ex: 0 ou 10)"
                      type="number"
                      step="0.5"
                      value={newFlavor.additional_price || ''}
                      onChange={(e) => setNewFlavor({ ...newFlavor, additional_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <Input
                    placeholder="Descrição dos ingredientes ou textura"
                    value={newFlavor.description}
                    onChange={(e) => setNewFlavor({ ...newFlavor, description: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={handleAddFlavorToProduct}
                  >
                    Adicionar Sabor a Este Produto
                  </Button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* ABA 4: EMBALAGENS DESTE PRODUTO                              */}
            {/* ------------------------------------------------------------ */}
            {productActiveTab === 'embalagens' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#3D1E26]">Opções de Embalagem para Este Produto</h4>
                    <p className="text-xs text-[#7A505D]">
                      Exemplos: Caixa de transporte segura com visor, Caixa cartonada luxo, Sacola presente.
                    </p>
                  </div>
                </div>

                {/* Lista de embalagens do produto */}
                <div className="space-y-2.5">
                  {(editingProduct.packaging || []).length === 0 ? (
                    <p className="text-xs text-[#8C5D6C] py-4 text-center bg-[#FFF8FA] rounded-2xl border border-[#FAD0DE]">
                      Nenhuma opção de embalagem cadastrada para este produto.
                    </p>
                  ) : (
                    editingProduct.packaging?.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#FAD0DE] flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#3D1E26]">{p.name}</span>
                            {p.is_required && <Badge variant="blue">Obrigatório</Badge>}
                            <span className="text-xs font-bold text-[#B8134B]">
                              {p.additional_price === 0 ? 'Incluso' : `+ R$ ${p.additional_price.toFixed(2)}`}
                            </span>
                          </div>
                          {p.description && <p className="text-[11px] text-[#7A505D] mt-0.5">{p.description}</p>}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingPackaging({ ...p })}
                            className="p-1.5 text-[#D81E5B] hover:bg-[#FFF0F4] rounded-lg cursor-pointer"
                            title="Editar embalagem"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePackagingFromProduct(p.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Excluir embalagem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulário para adicionar embalagem */}
                <div className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE] space-y-3">
                  <h5 className="text-xs font-bold text-[#B8134B] uppercase tracking-wider">
                    Nova Embalagem para {editingProduct.name || 'este produto'}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Nome (ex: Caixa Cartonada Luxo com Fita)"
                      value={newPackaging.name}
                      onChange={(e) => setNewPackaging({ ...newPackaging, name: e.target.value })}
                    />
                    <Input
                      placeholder="Preço Adicional (ex: 25)"
                      type="number"
                      step="1"
                      value={newPackaging.additional_price || ''}
                      onChange={(e) => setNewPackaging({ ...newPackaging, additional_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <Input
                    placeholder="Descrição da embalagem (ex: Acabamento rígido e visor transparente)"
                    value={newPackaging.description}
                    onChange={(e) => setNewPackaging({ ...newPackaging, description: e.target.value })}
                  />
                  <div className="pt-1">
                    <Switch
                      label="Embalagem Obrigatória (Padrão de Transporte)"
                      checked={newPackaging.is_required}
                      onChange={(chk) => setNewPackaging({ ...newPackaging, is_required: chk })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={handleAddPackagingToProduct}
                  >
                    Vincular Embalagem ao Produto
                  </Button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* ABA 5: ADICIONAIS & OPCIONAIS DESTE PRODUTO                  */}
            {/* ------------------------------------------------------------ */}
            {productActiveTab === 'adicionais' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#3D1E26]">Adicionais & Opcionais Deste Produto</h4>
                    <p className="text-xs text-[#7A505D]">
                      Itens extras como topos com nome/idade, velas especiais, folha de ouro ou frutas no topo.
                    </p>
                  </div>
                </div>

                {/* Lista de adicionais do produto */}
                <div className="space-y-2.5">
                  {(editingProduct.addons || []).length === 0 ? (
                    <p className="text-xs text-[#8C5D6C] py-4 text-center bg-[#FFF8FA] rounded-2xl border border-[#FAD0DE]">
                      Nenhum adicional específico cadastrado para este produto.
                    </p>
                  ) : (
                    editingProduct.addons?.map((a) => (
                      <div
                        key={a.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#FAD0DE] flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {a.image && (
                            <img src={a.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-[#FAD0DE] shrink-0" />
                          )}
                          <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#3D1E26]">{a.name}</span>
                            <span className="text-xs font-bold text-[#D81E5B]">
                              + R$ {a.price.toFixed(2)} /{a.unit}
                            </span>
                          </div>
                          {a.description && <p className="text-[11px] text-[#7A505D] mt-0.5">{a.description}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingAddon({ ...a })}
                            className="p-1.5 text-[#D81E5B] hover:bg-[#FFF0F4] rounded-lg cursor-pointer"
                            title="Editar adicional"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveAddonFromProduct(a.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Excluir adicional"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulário para adicionar adicional */}
                <div className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE] space-y-3">
                  <h5 className="text-xs font-bold text-[#B8134B] uppercase tracking-wider">
                    Novo Adicional para {editingProduct.name || 'este produto'}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      placeholder="Nome (ex: Topo de Bolo Personalizado)"
                      value={newAddon.name}
                      onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                    />
                    <Input
                      placeholder="Preço (R$)"
                      type="number"
                      step="1"
                      value={newAddon.price || ''}
                      onChange={(e) => setNewAddon({ ...newAddon, price: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      placeholder="Unidade (ex: unidade, kit)"
                      value={newAddon.unit}
                      onChange={(e) => setNewAddon({ ...newAddon, unit: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Descrição do adicional (ex: Nome e idade em acrílico ou papelaria)"
                    value={newAddon.description}
                    onChange={(e) => setNewAddon({ ...newAddon, description: e.target.value })}
                  />
                  <ImageUploader
                    label="Foto de exemplo (opcional)"
                    value={newAddon.image}
                    onChange={(image) => setNewAddon({ ...newAddon, image })}
                    aspectRatio="square"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={handleAddAddonToProduct}
                  >
                    Vincular Adicional ao Produto
                  </Button>
                </div>
              </div>
            )}

            {/* Rodapé de Ações do Modal */}
            <div className="flex items-center justify-between pt-5 border-t border-[#FEE7EF]">
              <div className="flex items-center gap-2 text-xs text-[#7A505D]">
                <span>Total de opções:</span>
                <span className="font-bold text-[#3D1E26]">
                  {(editingProduct.batters?.length || 0) > 0 ? `${editingProduct.batters?.length} massas · ` : ''}
                  {editingProduct.variations?.length || 0} tamanhos · {editingProduct.flavors?.length || 0} sabores · {editingProduct.packaging?.length || 0} embalagens · {editingProduct.addons?.length || 0} adicionais
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                  Fechar
                </Button>
                <Button type="submit" variant="primary">
                  Salvar Todas as Configurações
                </Button>
              </div>
            </div>

          </form>
        </Modal>
      )}

      {editingAddon && (
        <Modal
          isOpen={true}
          onClose={() => setEditingAddon(null)}
          title={`Editar adicional: ${editingAddon.name}`}
          subtitle="Altere os dados e a foto de exemplo deste item."
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Nome"
                value={editingAddon.name}
                onChange={(e) => setEditingAddon({ ...editingAddon, name: e.target.value })}
              />
              <Input
                label="Preço (R$)"
                type="number"
                step="1"
                value={editingAddon.price || ''}
                onChange={(e) => setEditingAddon({ ...editingAddon, price: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Unidade"
                value={editingAddon.unit}
                onChange={(e) => setEditingAddon({ ...editingAddon, unit: e.target.value })}
              />
            </div>
            <Input
              label="Descrição"
              value={editingAddon.description}
              onChange={(e) => setEditingAddon({ ...editingAddon, description: e.target.value })}
            />
            <ImageUploader
              label="Foto de exemplo (opcional)"
              value={editingAddon.image || ''}
              onChange={(image) => setEditingAddon({ ...editingAddon, image: image || undefined })}
              aspectRatio="square"
            />
            <div className="flex justify-end gap-3 pt-3 border-t border-[#FEE7EF]">
              <Button type="button" variant="outline" onClick={() => setEditingAddon(null)}>Cancelar</Button>
              <Button type="button" variant="primary" onClick={handleSaveAddon}>Salvar alteração</Button>
            </div>
          </div>
        </Modal>
      )}

      {editingBatter && (
        <Modal isOpen={true} onClose={() => setEditingBatter(null)} title={`Editar massa: ${editingBatter.name}`} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nome" value={editingBatter.name} onChange={(e) => setEditingBatter({ ...editingBatter, name: e.target.value })} />
              <Input label="Acréscimo de preço (R$)" type="number" step="0.5" value={editingBatter.additional_price || ''} onChange={(e) => setEditingBatter({ ...editingBatter, additional_price: parseFloat(e.target.value) || 0 })} />
            </div>
            <Input label="Descrição" value={editingBatter.description || ''} onChange={(e) => setEditingBatter({ ...editingBatter, description: e.target.value })} />
            <div className="flex justify-end gap-3 pt-3 border-t border-[#FEE7EF]">
              <Button type="button" variant="outline" onClick={() => setEditingBatter(null)}>Cancelar</Button>
              <Button type="button" variant="primary" onClick={handleSaveBatter}>Salvar alteração</Button>
            </div>
          </div>
        </Modal>
      )}

      {editingVariation && (
        <Modal isOpen={true} onClose={() => setEditingVariation(null)} title={`Editar tamanho: ${editingVariation.name}`} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Nome" value={editingVariation.name} onChange={(e) => setEditingVariation({ ...editingVariation, name: e.target.value })} />
              <Input label="Preço (R$)" type="number" step="1" value={editingVariation.price || ''} onChange={(e) => setEditingVariation({ ...editingVariation, price: parseFloat(e.target.value) || 0 })} />
              <Input label="Prazo" value={editingVariation.lead_time} onChange={(e) => setEditingVariation({ ...editingVariation, lead_time: e.target.value })} />
            </div>
            <Input label="Descrição" value={editingVariation.description || ''} onChange={(e) => setEditingVariation({ ...editingVariation, description: e.target.value })} />
            <div className="flex justify-end gap-3 pt-3 border-t border-[#FEE7EF]">
              <Button type="button" variant="outline" onClick={() => setEditingVariation(null)}>Cancelar</Button>
              <Button type="button" variant="primary" onClick={handleSaveVariation}>Salvar alteração</Button>
            </div>
          </div>
        </Modal>
      )}

      {editingFlavor && (
        <Modal isOpen={true} onClose={() => setEditingFlavor(null)} title={`Editar recheio: ${editingFlavor.name}`} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nome" value={editingFlavor.name} onChange={(e) => setEditingFlavor({ ...editingFlavor, name: e.target.value })} />
              <Input label="Acréscimo de preço (R$)" type="number" step="0.5" value={editingFlavor.additional_price || ''} onChange={(e) => setEditingFlavor({ ...editingFlavor, additional_price: parseFloat(e.target.value) || 0 })} />
            </div>
            <Input label="Descrição" value={editingFlavor.description || ''} onChange={(e) => setEditingFlavor({ ...editingFlavor, description: e.target.value })} />
            <div className="flex justify-end gap-3 pt-3 border-t border-[#FEE7EF]">
              <Button type="button" variant="outline" onClick={() => setEditingFlavor(null)}>Cancelar</Button>
              <Button type="button" variant="primary" onClick={handleSaveFlavor}>Salvar alteração</Button>
            </div>
          </div>
        </Modal>
      )}

      {editingPackaging && (
        <Modal isOpen={true} onClose={() => setEditingPackaging(null)} title={`Editar embalagem: ${editingPackaging.name}`} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nome" value={editingPackaging.name} onChange={(e) => setEditingPackaging({ ...editingPackaging, name: e.target.value })} />
              <Input label="Acréscimo de preço (R$)" type="number" step="1" value={editingPackaging.additional_price || ''} onChange={(e) => setEditingPackaging({ ...editingPackaging, additional_price: parseFloat(e.target.value) || 0 })} />
            </div>
            <Input label="Descrição" value={editingPackaging.description || ''} onChange={(e) => setEditingPackaging({ ...editingPackaging, description: e.target.value })} />
            <Switch label="Embalagem obrigatória" checked={editingPackaging.is_required} onChange={(is_required) => setEditingPackaging({ ...editingPackaging, is_required })} />
            <div className="flex justify-end gap-3 pt-3 border-t border-[#FEE7EF]">
              <Button type="button" variant="outline" onClick={() => setEditingPackaging(null)}>Cancelar</Button>
              <Button type="button" variant="primary" onClick={handleSavePackaging}>Salvar alteração</Button>
            </div>
          </div>
        </Modal>
      )}

      {editingGlobalBatter && (
        <Modal isOpen={true} onClose={() => setEditingGlobalBatter(null)} title={`Editar massa: ${editingGlobalBatter.name}`} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nome" value={editingGlobalBatter.name} onChange={(e) => setEditingGlobalBatter({ ...editingGlobalBatter, name: e.target.value })} />
              <Input label="Acréscimo de preço (R$)" type="number" step="0.5" value={editingGlobalBatter.additional_price || ''} onChange={(e) => setEditingGlobalBatter({ ...editingGlobalBatter, additional_price: parseFloat(e.target.value) || 0 })} />
            </div>
            <Input label="Descrição" value={editingGlobalBatter.description || ''} onChange={(e) => setEditingGlobalBatter({ ...editingGlobalBatter, description: e.target.value })} />
            <div className="flex justify-end gap-3 pt-3 border-t border-[#FEE7EF]">
              <Button type="button" variant="outline" onClick={() => setEditingGlobalBatter(null)}>Cancelar</Button>
              <Button type="button" variant="primary" onClick={handleSaveGlobalBatter}>Salvar alteração</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL GERAL DE CONFIGURAÇÃO DE MASSAS */}
      {isBattersModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsBattersModalOpen(false)}
          title="Configuração de Massas dos Bolos"
          size="lg"
        >
          <div className="space-y-5 text-left p-1">
            <div className="p-3.5 rounded-2xl bg-[#FFF0F4] border border-[#FAD0DE] text-xs text-[#7A505D] leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#D81E5B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#3D1E26] block font-bold">Sincronização Automática com o Site:</strong>
                Todas as opções de massas cadastradas ou modificadas aqui aparecem na página pública do visitante na seção <strong>"Monte seu Pedido"</strong> para todos os bolos.
              </div>
            </div>

            {/* Lista das massas atualmente na lista */}
            <div>
              <label className="text-xs font-bold text-[#3D1E26] uppercase tracking-wider block mb-2">
                Tipos de Massas Atualmente Cadastrados ({customBattersList.length})
              </label>

              {customBattersList.length === 0 ? (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 text-center">
                  Nenhuma massa cadastrada. Adicione uma nova massa abaixo.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {customBattersList.map((bat) => (
                    <div
                      key={bat.id}
                      className="p-3 rounded-xl bg-white border border-[#FAD0DE] flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#3D1E26]">{bat.name}</span>
                          {bat.additional_price && bat.additional_price > 0 ? (
                            <span className="text-[10px] font-bold text-[#D81E5B] bg-[#FFF0F4] px-1.5 py-0.5 rounded-md">
                              +R$ {bat.additional_price.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                              Inclusa (Sem acréscimo)
                            </span>
                          )}
                        </div>
                        {bat.description && (
                          <p className="text-[11px] text-[#7A505D] mt-0.5">{bat.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingGlobalBatter({ ...bat })}
                          className="p-1.5 text-[#D81E5B] hover:bg-[#FFF0F4] rounded-lg cursor-pointer transition-colors"
                          title="Editar massa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveGlobalBatter(bat.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Remover massa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulário de adicionar nova massa */}
            <div className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE] space-y-3">
              <h5 className="text-xs font-bold text-[#B8134B] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Adicionar Novo Tipo de Massa
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Nome da Massa"
                  placeholder="Ex: Massa Amanteigada de Baunilha, Red Velvet, Cenoura..."
                  value={newGlobalBatter.name}
                  onChange={(e) => setNewGlobalBatter({ ...newGlobalBatter, name: e.target.value })}
                />
                <Input
                  label="Acréscimo de Preço (R$)"
                  placeholder="0 para inclusa ou valor extra (ex: 5.00)"
                  type="number"
                  step="0.5"
                  value={newGlobalBatter.additional_price || ''}
                  onChange={(e) => setNewGlobalBatter({ ...newGlobalBatter, additional_price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <Input
                label="Descrição / Detalhes da Massa"
                placeholder="Ex: Massa estruturada, aromática, molhadinha e com aroma de fava de baunilha"
                value={newGlobalBatter.description}
                onChange={(e) => setNewGlobalBatter({ ...newGlobalBatter, description: e.target.value })}
              />

              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddGlobalBatter}
              >
                Incluir na Lista de Massas
              </Button>
            </div>

            {/* Rodapé de Ações */}
            <div className="flex items-center justify-between pt-4 border-t border-[#FEE7EF]">
              <span className="text-xs text-[#7A505D]">
                {customBattersList.length} massa{customBattersList.length !== 1 ? 's' : ''} pronta{customBattersList.length !== 1 ? 's' : ''} para salvar
              </span>

              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={() => setIsBattersModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" variant="primary" onClick={handleSaveAllBatters}>
                  Salvar e Publicar no Site
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      {productToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setProductToDelete(null)}
          onConfirm={confirmDeleteProduct}
          title="Excluir Produto?"
          description={`Tem certeza que deseja remover o produto "${productToDelete.name}" e todas as suas configurações particulares de sabores, tamanhos e embalagens?`}
          confirmLabel="Sim, Excluir Produto"
          isDestructive={true}
        />
      )}

    </div>
  );
};

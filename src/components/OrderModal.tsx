import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Sparkles, Check, Calendar, Cake, Heart, Box, Gift, Layers, AlertCircle, Info } from 'lucide-react';
import { store } from '../lib/store';
import { AppDatabase, Product, Flavor, PackagingOption, Addon, ProductVariation, CakeBatter } from '../types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: string;
  initialFlavor?: string;
  data?: AppDatabase;
}

const sortByName = <T extends { name: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

const UNIT_ORDER_RULES: Record<string, { minimumQuantity: number; unitsInInitialPrice: number; singularUnit: string; pluralUnit: string }> = {
  cupcakes: { minimumQuantity: 5, unitsInInitialPrice: 5, singularUnit: 'unidade', pluralUnit: 'unidades' },
  'brownie-recheado': { minimumQuantity: 1, unitsInInitialPrice: 1, singularUnit: 'unidade', pluralUnit: 'unidades' },
  'brownie-no-palito': { minimumQuantity: 1, unitsInInitialPrice: 1, singularUnit: 'unidade', pluralUnit: 'unidades' },
  'mini-neked-redondo': { minimumQuantity: 1, unitsInInitialPrice: 1, singularUnit: 'unidade', pluralUnit: 'unidades' },
  'bolo-de-corte': { minimumQuantity: 1, unitsInInitialPrice: 1, singularUnit: 'kg', pluralUnit: 'kg' },
  'festinha-na-escola': { minimumQuantity: 10, unitsInInitialPrice: 1, singularUnit: 'kit', pluralUnit: 'kits' },
  'marmita-completa': { minimumQuantity: 10, unitsInInitialPrice: 1, singularUnit: 'marmita', pluralUnit: 'marmitas' },
  'fatia-na-marmita': { minimumQuantity: 10, unitsInInitialPrice: 1, singularUnit: 'marmita', pluralUnit: 'marmitas' },
};

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  initialItem = '',
  initialFlavor = '',
  data,
}) => {
  const currentData = data || store.getPublished();
  const { products, flavors, packaging, addons, settings } = currentData;

  // Lista de produtos únicos sem duplicidade de ID ou nome
  const uniqueProducts: Product[] = React.useMemo(() => {
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const result: Product[] = [];

    for (const p of products) {
      if (!p.active) continue;
      const idKey = p.id?.trim().toLowerCase();
      const nameKey = p.name?.trim().toLowerCase();

      if (idKey && seenIds.has(idKey)) continue;
      if (nameKey && seenNames.has(nameKey)) continue;

      if (idKey) seenIds.add(idKey);
      if (nameKey) seenNames.add(nameKey);
      result.push(p);
    }
    return sortByName(result);
  }, [products]);

  const [category, setCategory] = useState<string>(() => {
    if (initialItem) return initialItem;
    return uniqueProducts[0]?.name || products[0]?.name || 'Bolo Vintage Heart Cake';
  });
  const [batter, setBatter] = useState<string>('');
  const [flavor1, setFlavor1] = useState<string>('');
  const [flavor2, setFlavor2] = useState<string>('');
  const [flavor3, setFlavor3] = useState<string>('');
  const [selectedSalgadoFlavors, setSelectedSalgadoFlavors] = useState<string[]>([]);
  const [selectedPack, setSelectedPack] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [servings, setServings] = useState<string>('');
  const [unitQuantity, setUnitQuantity] = useState(1);
  const [date, setDate] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [acceptedPaymentTerms, setAcceptedPaymentTerms] = useState(false);
  const [deliveryType] = useState<'retirada'>('retirada');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Find the selected product object
  const selectedProductObj: Product | undefined = products.find((p) => p.name === category)
    || uniqueProducts.find((p) => p.name === category || p.category === category)
    || uniqueProducts[0];
  const unitOrderRule = UNIT_ORDER_RULES[selectedProductObj?.slug || ''];
  const isUnitOrder = Boolean(unitOrderRule);
  const minUnitQuantity = unitOrderRule?.minimumQuantity || 1;
  const quantityText = `${unitQuantity} ${unitQuantity === 1 ? unitOrderRule?.singularUnit || 'unidade' : unitOrderRule?.pluralUnit || 'unidades'}`;

  // Explicit empty lists mean that the corresponding step was removed in the panel.
  const availableBatters: CakeBatter[] = React.useMemo(() => {
    if (Array.isArray(selectedProductObj?.batters)) {
      return sortByName(selectedProductObj.batters.filter(b => b.active));
    }

    // 2. Se for um produto de bolo, festa ou personalizado, busca todas as massas configuradas no painel de gestão
    const cakeProduct = products.find(
      (p) => (p.category === 'bolos' || p.category === 'bento' || p.requires_batter) && p.batters && p.batters.length > 0
    ) || products.find((p) => p.batters && p.batters.length > 0);

    return cakeProduct?.batters ? sortByName(cakeProduct.batters.filter(b => b.active)) : [];
  }, [selectedProductObj, products]);

  const availableFlavors: Flavor[] = sortByName(Array.isArray(selectedProductObj?.flavors)
    ? selectedProductObj.flavors.filter(f => f.active)
    : flavors.filter(f => f.active));

  const availablePackaging: PackagingOption[] = sortByName(Array.isArray(selectedProductObj?.packaging)
    ? selectedProductObj.packaging.filter(p => p.active)
    : packaging.filter(p => p.active));

  const availableAddons: Addon[] = sortByName((Array.isArray(selectedProductObj?.addons)
    ? selectedProductObj.addons.filter(a => a.active)
    : addons.filter(a => a.active)).map((addon) => ({
      ...addon,
      image: addon.image || addons.find((globalAddon) =>
        globalAddon.name.trim().toLowerCase() === addon.name.trim().toLowerCase()
      )?.image,
    })));

  const availableVariations: ProductVariation[] = sortByName(Array.isArray(selectedProductObj?.variations)
    ? selectedProductObj.variations.filter(v => v.active)
    : []);

  // Rules determination
  const isBento = selectedProductObj?.category === 'bento';
  const isDecoratedCake = selectedProductObj?.category === 'bolos';
  const isCake = isDecoratedCake || isBento || Boolean(selectedProductObj?.requires_batter);
  
  // Detecção de Salgados Artesanais
  const isSalgados = selectedProductObj?.category === 'salgados' || 
    selectedProductObj?.id === 'salgados-artesanais' ||
    selectedProductObj?.slug === 'salgados-artesanais' ||
    selectedProductObj?.name.toLowerCase().includes('salgado') ||
    category.toLowerCase().includes('salgado');

  // Permitir anexar foto de inspiração somente para: Bolos decorados, Kit Festa ou Festa na Escola
  const allowsInspirationPhoto = Boolean(
    isDecoratedCake ||
    isBento ||
    selectedProductObj?.category === 'bolos' ||
    selectedProductObj?.category === 'bento' ||
    selectedProductObj?.category === 'kits' ||
    selectedProductObj?.category === 'escola' ||
    /bolo|bento|kit|escola/i.test(selectedProductObj?.category || '') ||
    /bolo|bento|kit|festa na escola/i.test(selectedProductObj?.name || '') ||
    /bolo|bento|kit|festa na escola/i.test(category)
  );

  // Requisitos específicos por tipo de produto:
  // - Bentô Cake: 1 massa obrigatoriamente, 1 recheio obrigatoriamente, min 1 adicional obrigatoriamente
  // - Bolo Decorado: 1 massa obrigatoriamente, 2 recheios obrigatoriamente, min 1 adicional obrigatoriamente
  // - Salgados Artesanais: recheio/sabor em caixa de seleção obrigatório, sem limite de quantidade
  const requiresBatter = !isSalgados && (selectedProductObj?.requires_batter ?? (isCake && availableBatters.length > 0)) && availableBatters.length > 0;
  const requiredFlavorCount = !isSalgados
    ? (selectedProductObj?.min_flavors ?? (isDecoratedCake && !isBento && availableFlavors.length >= 2 ? 2 : availableFlavors.length > 0 ? 1 : 0))
    : 0;
  const requiresFlavors = requiredFlavorCount > 0 && availableFlavors.length > 0;
  const requires2Flavors = requiresFlavors && requiredFlavorCount >= 2;
  const requires3Flavors = requiresFlavors && requiredFlavorCount >= 3;
  const minAddons = selectedProductObj?.min_addons ?? (isCake ? 1 : 0);

  // Synchronize options when category changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialItem) {
      const normalized = initialItem.trim().toLowerCase();
      const match = uniqueProducts.find(
        (p) =>
          p.name.trim().toLowerCase() === normalized ||
          p.slug.toLowerCase() === normalized ||
          p.id.toLowerCase() === normalized ||
          p.category.toLowerCase() === normalized ||
          p.name.toLowerCase().includes(normalized) ||
          normalized.includes(p.name.toLowerCase())
      ) || products.find(
        (p) =>
          p.name.trim().toLowerCase() === normalized ||
          p.slug.toLowerCase() === normalized ||
          p.id.toLowerCase() === normalized ||
          p.category.toLowerCase() === normalized ||
          p.name.toLowerCase().includes(normalized) ||
          normalized.includes(p.name.toLowerCase())
      );
      if (match) {
        setCategory(match.name);
      } else {
        setCategory(initialItem);
      }
    }
  }, [isOpen, initialItem, uniqueProducts, products]);

  useEffect(() => {
    if (!isOpen) return;

    setValidationError(null);

    // 1. Batter sync (somente se aplicável)
    if (requiresBatter) {
      const batterExists = availableBatters.some(b => b.name === batter);
      if (!batterExists) {
        setBatter(availableBatters[0]?.name || '');
      }
    } else {
      setBatter('');
    }

    // 2. Flavors sync
    if (isSalgados) {
      // Salgados artesanais: caixa de seleção múltipla (sem limite, mínimo 1 obrigatório)
      if (availableFlavors.length > 0) {
        setSelectedSalgadoFlavors((prev) => {
          const valid = prev.filter(name => availableFlavors.some(f => f.name === name));
          if (valid.length > 0) return valid;
          // Pré-seleciona os 2 primeiros sabores como sugestão inicial prática
          return availableFlavors.slice(0, 2).map(f => f.name);
        });
      }
    } else if (requiresFlavors) {
      const flav1Exists = availableFlavors.some(f => f.name === flavor1);
      if (!flav1Exists) {
        setFlavor1(initialFlavor || availableFlavors[0]?.name || '');
      }

      if (requires2Flavors) {
        const flav2Exists = availableFlavors.some(f => f.name === flavor2);
        if (!flav2Exists) {
          // Default to 2nd flavor if exists, otherwise same as 1st
          setFlavor2(availableFlavors[1]?.name || availableFlavors[0]?.name || '');
        }
      }

      if (requires3Flavors) {
        const flav3Exists = availableFlavors.some(f => f.name === flavor3);
        if (!flav3Exists) {
          setFlavor3(availableFlavors[2]?.name || availableFlavors[0]?.name || '');
        }
      }
    }

    // 3. Packaging sync
    if (availablePackaging.length > 0) {
      const packExists = availablePackaging.some(p => p.name === selectedPack);
      if (!packExists) {
        setSelectedPack(availablePackaging[0]?.name || '');
      }
    } else {
      setSelectedPack('');
    }

    // 4. Variations sync
    if (isUnitOrder) {
      setServings('');
    } else if (availableVariations.length > 0) {
      const varExists = availableVariations.some(v => v.name === servings);
      if (!varExists) {
        setServings(availableVariations[0]?.name || '');
      }
    } else setServings('');

    // 5. Remove selections that no longer exist and set the required default.
    setSelectedAddons((previous) => {
      const valid = previous.filter((name) => availableAddons.some((addon) => addon.name === name));
      return minAddons > 0 && valid.length === 0 && availableAddons.length > 0
        ? [availableAddons[0].name]
        : valid;
    });
  }, [category, isOpen, requiresBatter, requiresFlavors, requires2Flavors, requires3Flavors, minAddons, isSalgados, isUnitOrder, availableBatters, availableFlavors, availablePackaging, availableVariations, availableAddons]);

  useEffect(() => {
    if (isOpen && isUnitOrder) setUnitQuantity(minUnitQuantity);
  }, [category, isOpen, isUnitOrder, minUnitQuantity]);

  useEffect(() => {
    if (!isOpen) setAcceptedPaymentTerms(false);
  }, [isOpen]);

  if (!isOpen) return null;

  // Selected item objects for pricing
  const selectedVariationObj = availableVariations.find((v) => v.name === servings);
  const selectedBatterObj = availableBatters.find((b) => b.name === batter);
  const selectedFlavor1Obj = availableFlavors.find((f) => f.name === flavor1);
  const selectedFlavor2Obj = availableFlavors.find((f) => f.name === flavor2);
  const selectedFlavor3Obj = availableFlavors.find((f) => f.name === flavor3);
  const selectedPackagingObj = availablePackaging.find((p) => p.name === selectedPack);

  // Price calculation - CONTABILIZAÇÃO COMPLETA DE TUDO
  const initialPrice = selectedProductObj?.starting_price || 130;
  const pricePerUnit = initialPrice / (unitOrderRule?.unitsInInitialPrice || 1);
  const basePrice = isUnitOrder
    ? pricePerUnit * unitQuantity
    : (selectedVariationObj?.price || initialPrice);

  const batterExtra = selectedBatterObj?.additional_price || 0;
  const flavor1Extra = !isSalgados ? (selectedFlavor1Obj?.additional_price || 0) : 0;
  const flavor2Extra = (!isSalgados && requires2Flavors) ? (selectedFlavor2Obj?.additional_price || 0) : 0;
  const flavor3Extra = (!isSalgados && requires3Flavors) ? (selectedFlavor3Obj?.additional_price || 0) : 0;
  
  // Salgados extras (caso algum sabor especial tenha preço adicional)
  const salgadosFlavorsExtra = isSalgados
    ? selectedSalgadoFlavors.reduce((acc, fName) => {
        const item = availableFlavors.find((f) => f.name === fName);
        return acc + (item?.additional_price || 0);
      }, 0)
    : 0;

  const packagingExtra = selectedPackagingObj?.additional_price || 0;
  const addonTotal = (addon: Addon) => {
    const isPersonalizedSticker = /adesivo\s+personalizado/i.test(addon.name);
    return addon.price * (isUnitOrder && isPersonalizedSticker ? unitQuantity : 1);
  };
  const addonsExtra = selectedAddons.reduce((acc, addName) => {
    const item = availableAddons.find((a) => a.name === addName);
    return acc + (item ? addonTotal(item) : 0);
  }, 0);

  // Contabilização de todo o conjunto no pedido final
  const estimatedTotal = basePrice + batterExtra + flavor1Extra + flavor2Extra + flavor3Extra + salgadosFlavorsExtra + packagingExtra + addonsExtra;

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!customerName.trim()) {
      setValidationError('Informe seu nome para enviar o pedido.');
      return;
    }

    // Validações obrigatórias
    if (isSalgados) {
      if (selectedSalgadoFlavors.length === 0) {
        setValidationError('Por favor, selecione obrigatoriamente pelo menos 1 opção de sabor para os seus salgados artesanais na caixa de seleção (sem limite máximo).');
        return;
      }
    } else {
      if (requiresBatter && (!batter || batter.trim() === '')) {
        setValidationError('Por favor, selecione obrigatoriamente o tipo de massa do seu bolo.');
        return;
      }

      const requiredFlavors = [flavor1, flavor2, flavor3].slice(0, requiredFlavorCount);
      if (requiresFlavors && requiredFlavors.some((flavor) => !flavor.trim())) {
        setValidationError(`Por favor, selecione obrigatoriamente ${requiredFlavorCount} ${requiredFlavorCount === 1 ? 'recheio' : 'tipos de recheio'}.`);
        return;
      }
    }

    if (minAddons > 0 && selectedAddons.length < minAddons) {
      setValidationError(`Por favor, selecione no mínimo ${minAddons} adicional/opcional para compor o seu bolo (ex: topo de bolo personalizado, morangos, confeitos ou velas).`);
      return;
    }

    if (!acceptedPaymentTerms) {
      setValidationError('Confirme que está ciente de que o pedido só é confirmado após o pagamento de 50% do valor dos itens.');
      return;
    }

    const depositAmount = estimatedTotal / 2;
    const remainingAmount = estimatedTotal - depositAmount;

    const formattedMessage = 
      `*NOVO PEDIDO — A DOCERIA DA MANU*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Olá, ${settings.short_name}! Gostaria de verificar a disponibilidade para este pedido.\n\n` +
      `*CLIENTE*\n👤 ${customerName.trim()}\n\n` +
      `*PRODUTO*\n` +
      `🎂 ${category}\n` +
      (isUnitOrder
        ? `👥 Quantidade: ${quantityText} (R$ ${basePrice.toFixed(2).replace('.', ',')})\n`
        : `👥 Tamanho / porção: ${servings || 'Padrão'} (R$ ${basePrice.toFixed(2).replace('.', ',')})\n`) +
      (batter && !isSalgados ? `🍰 Massa: ${batter} ${batterExtra > 0 ? `(+R$ ${batterExtra.toFixed(2).replace('.', ',')})` : '(inclusa)'}\n` : '') +
      (isSalgados
        ? `🥟 Sabores: ${selectedSalgadoFlavors.join(', ')} ${salgadosFlavorsExtra > 0 ? `(+R$ ${salgadosFlavorsExtra.toFixed(2).replace('.', ',')})` : '(inclusos)'}\n`
        : requires3Flavors
          ? `🍓 1º recheio: ${flavor1} ${flavor1Extra > 0 ? `(+R$ ${flavor1Extra.toFixed(2).replace('.', ',')})` : '(incluso)'}\n` +
            `🍫 2º recheio: ${flavor2} ${flavor2Extra > 0 ? `(+R$ ${flavor2Extra.toFixed(2).replace('.', ',')})` : '(incluso)'}\n` +
            `🍰 3º recheio: ${flavor3} ${flavor3Extra > 0 ? `(+R$ ${flavor3Extra.toFixed(2).replace('.', ',')})` : '(incluso)'}\n`
          : requires2Flavors
          ? `🍓 1º recheio: ${flavor1} ${flavor1Extra > 0 ? `(+R$ ${flavor1Extra.toFixed(2).replace('.', ',')})` : '(incluso)'}\n` +
            `🍫 2º recheio: ${flavor2} ${flavor2Extra > 0 ? `(+R$ ${flavor2Extra.toFixed(2).replace('.', ',')})` : '(incluso)'}\n`
          : (requiresFlavors && flavor1 ? `🍓 Recheio / sabor: ${flavor1 || 'Padrão'} ${flavor1Extra > 0 ? `(+R$ ${flavor1Extra.toFixed(2).replace('.', ',')})` : '(incluso)'}\n` : '')
      ) +
      `📦 Embalagem: ${selectedPack || 'Padrão'} ${packagingExtra > 0 ? `(+R$ ${packagingExtra.toFixed(2).replace('.', ',')})` : '(inclusa)'}\n` +
      (selectedAddons.length > 0 ? `✨ Adicionais: ${selectedAddons.join(', ')} (+R$ ${addonsExtra.toFixed(2).replace('.', ',')})\n` : '') +
      `\n*AGENDA E RECEBIMENTO*\n` +
      `📅 Data do evento: ${date || 'A combinar'}\n` +
      `🚚 Retirada no ateliê ou envio por Uber Flash / 99 Entregas\n` +
      (notes ? `📝 Detalhes: ${notes}\n` : '') +
      `\n━━━━━━━━━━━━━━━━━━━━\n` +
      `*RESUMO DE VALORES*\n` +
      `💰 Total estimado: *R$ ${estimatedTotal.toFixed(2).replace('.', ',')}*\n` +
      `✅ Sinal para confirmar (50%): *R$ ${depositAmount.toFixed(2).replace('.', ',')}*\n` +
      `Saldo na retirada/entrega: R$ ${remainingAmount.toFixed(2).replace('.', ',')}\n\n` +
      `☑️ Cliente ciente: o pedido só é confirmado após o pagamento de 50% do valor dos itens.\n\n` +
      `_Pode confirmar a disponibilidade para esta data?_`;

    // Record order in store
    store.recordOrder({
      customer_name: customerName.trim(),
      product_name: category,
      batter: !isSalgados ? batter : undefined,
      quantity: isUnitOrder ? quantityText : servings,
      flavors: isSalgados ? selectedSalgadoFlavors : [flavor1, flavor2, flavor3].slice(0, requiresFlavors ? requiredFlavorCount : 0),
      packaging: selectedPack,
      addons: selectedAddons,
      date: date || 'A combinar',
      delivery_type: 'Retirada no Ateliê',
      location: 'Ateliê (Retirada própria ou Uber Flash / 99 Entregas)',
      notes: notes,
      estimated_total: estimatedTotal,
      formatted_message: formattedMessage,
    });

    const targetUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(targetUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full h-[100dvh] max-w-none bg-white shadow-2xl overflow-hidden flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#FFF0F4] via-[#FFEBF1] to-[#FFF0F4] p-5 sm:p-6 border-b border-[#FAD6E2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#F8B4C9] flex items-center justify-center text-[#D81E5B] shadow-2xs">
              <Cake className="w-5 h-5" />
            </div>
            <div>
              <h3 
                className="text-xl font-bold text-[#3D1E26]"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Monte seu Pedido
              </h3>
              <p className="text-xs text-[#7A505D]">
                Personalize os sabores, tamanhos e opcionais exclusivos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#7B535F] hover:text-[#D81E5B] hover:bg-white/80 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSendWhatsApp} className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* Mensagem de Erro de Validação se houver */}
          {validationError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs leading-relaxed animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Atenção aos requisitos do pedido:</strong>
                <span>{validationError}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#3D1E26] mb-1.5 uppercase tracking-wider">
              Seu nome <span className="text-[#D81E5B]">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Como podemos te chamar?"
              required
              maxLength={120}
              className="w-full px-4 py-2.5 rounded-xl border border-[#FAD0DE] bg-[#FFFDFC] text-[#3D1E26] font-medium focus:outline-hidden focus:border-[#D81E5B] focus:ring-1 focus:ring-[#D81E5B]"
            />
          </div>

          {/* 1. Item Category (Produto) */}
          <div>
            <label className="block text-xs font-bold text-[#3D1E26] mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>1. Escolha o Produto</span>
              {isBento ? (
                <span className="text-[10px] text-[#D81E5B] font-semibold">
                  1 Massa + 1 Recheio + Mín. 1 Adicional
                </span>
              ) : isCake ? (
                <span className="text-[10px] text-[#D81E5B] font-semibold">
                  1 Massa + 2 Recheios + Mín. 1 Adicional
                </span>
              ) : isSalgados ? (
                <span className="text-[10px] text-[#D81E5B] font-semibold">
                  Caixa de Seleção de Sabores (Sem Limite)
                </span>
              ) : null}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#FAD0DE] bg-[#FFFDFC] text-[#3D1E26] font-medium focus:outline-hidden focus:border-[#D81E5B] focus:ring-1 focus:ring-[#D81E5B] cursor-pointer"
            >
              {uniqueProducts.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.starting_price_display || `a partir de R$ ${p.starting_price}`})
                </option>
              ))}
              <option value="Outro pedido personalizado">Outro pedido personalizado sob medida</option>
            </select>
          </div>

          {/* 2. Tipo de Massa do Bolo (OBRIGATÓRIO SOMENTE PARA BOLOS) */}
          {requiresBatter && (
            <div className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE] space-y-2">
              <label className="block text-xs font-bold text-[#3D1E26] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Cake className="w-3.5 h-3.5 text-[#D81E5B]" />
                  2. Tipo de Massa do Bolo
                </span>
                <span className="text-[10px] font-extrabold uppercase bg-[#FFF0F4] text-[#B8134B] border border-[#FAD0DE] px-2 py-0.5 rounded-full">
                  * Escolha Obrigatória
                </span>
              </label>
              <p className="text-[11px] text-[#7A505D]">
                Selecione a massa artesanal que será a base do seu bolo:
              </p>
              <select
                value={batter}
                required
                onChange={(e) => setBatter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#FAD0DE] bg-white text-[#3D1E26] font-medium focus:outline-hidden focus:border-[#D81E5B] cursor-pointer"
              >
                {availableBatters.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} {b.additional_price && b.additional_price > 0 ? `(+R$ ${b.additional_price.toFixed(2)})` : '(Inclusa)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. RECHEIO / SABORES */}
          {/* CASO A: SALGADOS ARTESANAIS -> CAIXA DE SELEÇÃO OBRIGATÓRIA SEM LIMITE */}
          {isSalgados ? (
            <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${
              selectedSalgadoFlavors.length === 0
                ? 'bg-rose-50/70 border-rose-300'
                : 'bg-[#FFF9FB] border-[#FAD0DE]'
            }`}>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#3D1E26] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D81E5B]" />
                  2. Recheio / Sabores dos Salgados
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase bg-[#FFF0F4] text-[#B8134B] border border-[#FAD0DE] px-2 py-0.5 rounded-full">
                    * Escolha Obrigatória
                  </span>
                  <span className="text-[10px] font-bold text-[#25D366] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Sem Limite de Sabores
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#7A505D]">
                <span>Marque todas as opções de sabores que deseja no seu pedido (mínimo 1, sem limite máximo):</span>
                <span className="font-semibold text-[#D81E5B] shrink-0 ml-2">
                  {selectedSalgadoFlavors.length} selecionado{selectedSalgadoFlavors.length !== 1 ? 's' : ''}
                </span>
              </div>

              {selectedSalgadoFlavors.length === 0 && (
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Por favor, selecione pelo menos 1 sabor na caixa abaixo. Você pode marcar quantos quiser!</span>
                </div>
              )}

              {/* Caixa de seleção com múltiplas opções sem limite */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {availableFlavors.map((flavor) => {
                  const isChecked = selectedSalgadoFlavors.includes(flavor.name);
                  return (
                    <label
                      key={flavor.id}
                      className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-3 cursor-pointer transition-all duration-150 select-none ${
                        isChecked
                          ? 'bg-[#FFF0F4] border-[#D81E5B] text-[#3D1E26] shadow-2xs'
                          : 'bg-white border-[#FAD0DE] text-[#6B4651] hover:border-[#D81E5B]/60 hover:bg-[#FFFDFC]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedSalgadoFlavors((prev) =>
                            isChecked
                              ? prev.filter((name) => name !== flavor.name)
                              : [...prev, flavor.name]
                          );
                        }}
                        className="mt-0.5 w-4 h-4 rounded text-[#D81E5B] accent-[#D81E5B] border-[#FAD0DE] focus:ring-0 cursor-pointer shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-semibold ${isChecked ? 'text-[#D81E5B]' : 'text-[#3D1E26]'}`}>
                            {flavor.name}
                          </span>
                          {flavor.additional_price > 0 && (
                            <span className="text-[10px] font-bold text-[#D81E5B] bg-[#FFF0F4] px-1.5 py-0.5 rounded-md shrink-0">
                              +R$ {flavor.additional_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {flavor.description && (
                          <p className="text-[10px] text-[#7A505D] mt-0.5 leading-tight line-clamp-2">
                            {flavor.description}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            /* CASO B: BOLOS, KITS E OUTROS PRODUTOS */
            requiresFlavors && (
              <div className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#3D1E26] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D81E5B]" />
                    3. {requires2Flavors ? `Sabores & Recheios (${requiredFlavorCount} Tipos Obrigatórios)` : 'Recheio / Sabor'}
                  </label>
                  <span className="text-[10px] font-extrabold uppercase bg-[#FFF0F4] text-[#B8134B] border border-[#FAD0DE] px-2 py-0.5 rounded-full">
                    {requires2Flavors ? `* ${requiredFlavorCount} Recheios Obrigatórios` : '* Obrigatório'}
                  </span>
                </div>

                {requires2Flavors ? (
                  <>
                    <p className="text-[11px] text-[#7A505D]">
                      Escolha os {requiredFlavorCount} tipos de recheio abaixo:
                    </p>

                    <div className={`grid grid-cols-1 ${requires3Flavors ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 pt-1`}>
                      <div>
                        <span className="text-[11px] font-bold text-[#3D1E26] mb-1 block">
                          1º Recheio (Camada 1):
                        </span>
                        <select
                          value={flavor1}
                          required
                          onChange={(e) => setFlavor1(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#FAD0DE] bg-white text-[#3D1E26] font-medium focus:outline-hidden focus:border-[#D81E5B] cursor-pointer text-xs"
                        >
                          {availableFlavors.map((f) => (
                            <option key={f.id} value={f.name}>
                              {f.name} {f.additional_price > 0 ? `(+R$ ${f.additional_price.toFixed(2)})` : '(Incluso)'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-[#3D1E26] mb-1 block">
                          2º Recheio (Camada 2):
                        </span>
                        <select
                          value={flavor2}
                          required
                          onChange={(e) => setFlavor2(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#FAD0DE] bg-white text-[#3D1E26] font-medium focus:outline-hidden focus:border-[#D81E5B] cursor-pointer text-xs"
                        >
                          {availableFlavors.map((f) => (
                            <option key={f.id} value={f.name}>
                              {f.name} {f.additional_price > 0 ? `(+R$ ${f.additional_price.toFixed(2)})` : '(Incluso)'}
                            </option>
                          ))}
                        </select>
                      </div>
                      {requires3Flavors && (
                        <div>
                          <span className="text-[11px] font-bold text-[#3D1E26] mb-1 block">
                            3º Recheio (Camada 3):
                          </span>
                          <select
                            value={flavor3}
                            required
                            onChange={(e) => setFlavor3(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#FAD0DE] bg-white text-[#3D1E26] font-medium focus:outline-hidden focus:border-[#D81E5B] cursor-pointer text-xs"
                          >
                            {availableFlavors.map((f) => (
                              <option key={f.id} value={f.name}>
                                {f.name} {f.additional_price > 0 ? `(+R$ ${f.additional_price.toFixed(2)})` : '(Incluso)'}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <select
                    value={flavor1}
                    required
                    onChange={(e) => setFlavor1(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#FAD0DE] bg-white text-[#3D1E26] font-medium focus:outline-hidden focus:border-[#D81E5B] cursor-pointer"
                  >
                    {availableFlavors.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name} {f.additional_price > 0 ? `(+R$ ${f.additional_price.toFixed(2)})` : '(Incluso)'}
                      </option>
                    ))}
                    <option value="Quero sugestão personalizada da Manu">Quero sugestão personalizada da Manu</option>
                  </select>
                )}
              </div>
            )
          )}

          {/* 4. Tamanho / Variação ou Fatias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isUnitOrder ? (
            <div>
              <label className="block text-xs font-bold text-[#3D1E26] mb-1.5 uppercase tracking-wider">
                4. Quantidade{unitOrderRule?.singularUnit === 'kg' ? ' (kg)' : ''}
              </label>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#FAD0DE] bg-[#FFFDFC] px-3 py-2.5">
                <div className="flex items-center rounded-lg border border-[#FAD0DE] overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setUnitQuantity((quantity) => Math.max(minUnitQuantity, quantity - 1))}
                    disabled={unitQuantity <= minUnitQuantity}
                    className="w-9 h-8 text-lg font-bold text-[#D81E5B] hover:bg-[#FFF0F4] disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <output className="w-10 text-center text-sm font-bold text-[#3D1E26]" aria-live="polite">
                    {unitQuantity}
                  </output>
                  <button
                    type="button"
                    onClick={() => setUnitQuantity((quantity) => quantity + 1)}
                    className="w-9 h-8 text-lg font-bold text-[#D81E5B] hover:bg-[#FFF0F4]"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-bold text-[#D81E5B] whitespace-nowrap">
                  R$ {basePrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-[11px] text-[#7A505D] mt-1.5">
                R$ {pricePerUnit.toFixed(2).replace('.', ',')} por {unitOrderRule?.singularUnit || 'unidade'}{minUnitQuantity > 1 ? ` · mínimo ${minUnitQuantity} ${unitOrderRule?.pluralUnit || 'unidades'}` : ''}
              </p>
            </div>
            ) : availableVariations.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#3D1E26] mb-1.5 uppercase tracking-wider">
                {isSalgados ? '3. Quantidade / Cento' : '4. Tamanho / Opção'}
              </label>
              <select
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#FAD0DE] bg-[#FFFDFC] text-[#3D1E26] font-medium focus:outline-hidden focus:border-[#D81E5B] cursor-pointer"
              >
                {availableVariations.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name} (R$ {v.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            )}

            <div className={availableVariations.length > 0 ? '' : 'sm:col-span-2'}>
              <label className="block text-xs font-bold text-[#3D1E26] mb-1.5 uppercase tracking-wider">
                {isSalgados ? '4. Data desejada' : '5. Data desejada'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#FAD0DE] bg-[#FFFDFC] text-[#3D1E26] font-medium focus:outline-hidden focus:border-[#D81E5B]"
              />
            </div>
          </div>

          {/* 5. Embalagem */}
          {availablePackaging.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#3D1E26] mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>{isSalgados ? '5. Embalagem' : '6. Opção de Embalagem'}</span>
                <span className="text-[10px] text-[#D81E5B] font-normal">Para {category}</span>
              </label>
              <select
                value={selectedPack}
                onChange={(e) => setSelectedPack(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#FAD0DE] bg-[#FFFDFC] text-[#3D1E26] font-medium focus:outline-hidden focus:border-[#D81E5B] cursor-pointer"
              >
                {availablePackaging.map((pack) => (
                  <option key={pack.id} value={pack.name}>
                    {pack.name} {pack.additional_price > 0 ? `(+R$ ${pack.additional_price.toFixed(2)})` : '(Incluso)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 6. Adicionais & Opcionais */}
          {availableAddons.length > 0 && (
            <div className={`p-4 rounded-2xl border space-y-2.5 transition-colors ${
              minAddons > 0 && selectedAddons.length < minAddons 
                ? 'bg-rose-50/70 border-rose-300' 
                : 'bg-[#FFF9FB] border-[#FAD0DE]'
            }`}>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#3D1E26] uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-[#D81E5B]" />
                  {isSalgados ? '6. Molhos & Adicionais' : '7. Adicionais & Opcionais'}
                </label>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  minAddons > 0 && selectedAddons.length < minAddons
                    ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                    : 'bg-[#FFF0F4] text-[#B8134B] border-[#FAD0DE]'
                }`}>
                  {minAddons > 0 ? `* Mínimo ${minAddons} Obrigatório` : 'Opcional'}
                </span>
              </div>

              <p className="text-[11px] text-[#7A505D]">
                {minAddons > 0 
                  ? 'Escolha pelo menos 1 item para complementar e personalizar a decoração do bolo:'
                  : 'Personalize ainda mais seu pedido com itens extras:'}
              </p>

              {minAddons > 0 && selectedAddons.length < minAddons && (
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Selecione pelo menos 1 adicional abaixo para habilitar o fechamento do pedido.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {availableAddons.map((add) => {
                  const isChecked = selectedAddons.includes(add.name);
                  return (
                    <button
                      key={add.id}
                      type="button"
                      onClick={() => {
                        setSelectedAddons((prev) =>
                          isChecked ? prev.filter((a) => a !== add.name) : [...prev, add.name]
                        );
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-[#FFF0F4] border-[#D81E5B] text-[#D81E5B] shadow-2xs font-semibold'
                          : 'bg-white border-[#FAD0DE] text-[#6B4651] hover:border-[#D81E5B]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Check className={`w-3.5 h-3.5 ${isChecked ? 'opacity-100 text-[#D81E5B]' : 'opacity-0'}`} />
                        {add.image && (
                          <img
                            src={add.image}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover shrink-0 border border-[#FAD0DE]"
                          />
                        )}
                        <span className="text-left">{add.name}</span>
                      </div>
                      <span className="font-bold">+R${addonTotal(add)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. FORMA DE RECEBIMENTO: CONFIGURADA SOMENTE PARA RETIRADA NO ATELIÊ */}
          <div className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE] space-y-2.5">
            <label className="block text-xs font-bold text-[#3D1E26] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-[#D81E5B]" />
                {isSalgados ? '7. Forma de Recebimento' : '8. Forma de Recebimento'}
              </span>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" /> Somente Retirada no Ateliê
              </span>
            </label>

            <div className="p-3.5 rounded-xl bg-white border border-[#FAD0DE] flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#FFF0F4] border border-[#F8B4C9] flex items-center justify-center text-[#D81E5B] shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-[#3D1E26] flex items-center gap-2">
                  <span>Retirada no Ateliê da Manu</span>
                </div>
                <p className="text-[11px] text-[#5E3B46] leading-relaxed">
                  <strong>Observação importante:</strong> O cliente pode vir buscar pessoalmente no Ateliê ou solicitar e pagar o envio por conta própria via aplicativo (<span className="text-[#D81E5B] font-semibold">Uber Flash / 99 Entregas</span>).
                </p>
                <p className="text-[10px] text-[#8C5D6C] pt-0.5">
                  • Endereço detalhado e instruções de retirada serão enviados na confirmação do pedido pelo WhatsApp.
                </p>
              </div>
            </div>
          </div>

          {/* 8. DETALHES, CORES OU FRASE PARA O PEDIDO (COM OPÇÃO DE FOTO DE INSPIRAÇÃO SOMENTE PARA BOLOS, KITS E FESTA NA ESCOLA) */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#3D1E26] mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>{isSalgados ? '8. Detalhes ou observações para o pedido' : '9. Detalhes, cores ou frase para o pedido'}</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isSalgados
                    ? "Ex: Ponto de fritura, preferência de horário, etc..."
                    : "Ex: Escrita 'Feliz Aniversário Luiza', paleta de cores rosa e dourado, referência que vi no Instagram..."
                }
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#FAD0DE] bg-[#FFFDFC] text-[#3D1E26] placeholder-[#9E7381] focus:outline-hidden focus:border-[#D81E5B]"
              />
            </div>

            {/* LEMBRETE DE FOTO DE INSPIRAÇÃO: SOMENTE PARA PRODUTOS PERSONALIZÁVEIS */}
            {allowsInspirationPhoto && (
              <div className="p-3.5 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE]">
                <p className="text-[11px] leading-relaxed text-[#7A505D]">
                  <strong className="text-[#D81E5B]">Foto de inspiração:</strong> após abrir a conversa, envie pelo WhatsApp as fotos de referência, paleta de cores ou decoração desejada para a Manu analisar o seu modelo.
                </p>
              </div>
            )}
          </div>

          <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
            acceptedPaymentTerms ? 'bg-emerald-50 border-emerald-200' : 'bg-[#FFF9FB] border-[#FAD0DE] hover:bg-[#FFF5F8]'
          }`}>
            <input
              type="checkbox"
              checked={acceptedPaymentTerms}
              onChange={(e) => setAcceptedPaymentTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#D81E5B] shrink-0"
              required
            />
            <span className="text-[11px] leading-relaxed text-[#5B3642]">
              Estou ciente de que <strong>o pedido só é confirmado após o pagamento de 50% do valor dos itens</strong>.
            </span>
          </label>

          {/* ============================================================= */}
          {/* EXTRATO DE CONTABILIZAÇÃO COMPLETA DO PEDIDO                   */}
          {/* ============================================================= */}
          <div className="p-4 rounded-2xl bg-[#FFF5F8] border border-[#FAD0DE] space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#FAD0DE]">
              <span className="text-xs font-extrabold text-[#3D1E26] uppercase tracking-wider">
                Discriminação do Pedido:
              </span>
              <span className="text-[11px] text-[#7A505D]">
                Tudo contabilizado
              </span>
            </div>

            <div className="space-y-1 text-xs text-[#6B4651]">
              <div className="flex justify-between">
                <span>• {isUnitOrder ? `Quantidade (${quantityText})` : `Base / Tamanho (${servings || 'Padrão'})`}:</span>
                <span className="font-semibold text-[#3D1E26]">R$ {basePrice.toFixed(2)}</span>
              </div>

              {!isSalgados && batter && (
                <div className="flex justify-between">
                  <span>• Massa ({batter}):</span>
                  <span className="font-semibold text-[#3D1E26]">
                    {batterExtra > 0 ? `+ R$ ${batterExtra.toFixed(2)}` : 'Inclusa'}
                  </span>
                </div>
              )}

              {isSalgados ? (
                <div className="flex justify-between">
                  <span>• Sabores Salgados ({selectedSalgadoFlavors.length} selecionado{selectedSalgadoFlavors.length !== 1 ? 's' : ''}):</span>
                  <span className="font-semibold text-[#3D1E26]">
                    {salgadosFlavorsExtra > 0 ? `+ R$ ${salgadosFlavorsExtra.toFixed(2)}` : 'Inclusos'}
                  </span>
                </div>
              ) : requires3Flavors ? (
                <>
                  <div className="flex justify-between">
                    <span>• 1º Recheio ({flavor1 || 'Não selecionado'}):</span>
                    <span className="font-semibold text-[#3D1E26]">{flavor1Extra > 0 ? `+ R$ ${flavor1Extra.toFixed(2)}` : 'Incluso'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• 2º Recheio ({flavor2 || 'Não selecionado'}):</span>
                    <span className="font-semibold text-[#3D1E26]">{flavor2Extra > 0 ? `+ R$ ${flavor2Extra.toFixed(2)}` : 'Incluso'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• 3º Recheio ({flavor3 || 'Não selecionado'}):</span>
                    <span className="font-semibold text-[#3D1E26]">{flavor3Extra > 0 ? `+ R$ ${flavor3Extra.toFixed(2)}` : 'Incluso'}</span>
                  </div>
                </>
              ) : requires2Flavors ? (
                <>
                  <div className="flex justify-between">
                    <span>• 1º Recheio ({flavor1 || 'Não selecionado'}):</span>
                    <span className="font-semibold text-[#3D1E26]">
                      {flavor1Extra > 0 ? `+ R$ ${flavor1Extra.toFixed(2)}` : 'Incluso'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• 2º Recheio ({flavor2 || 'Não selecionado'}):</span>
                    <span className="font-semibold text-[#3D1E26]">
                      {flavor2Extra > 0 ? `+ R$ ${flavor2Extra.toFixed(2)}` : 'Incluso'}
                    </span>
                  </div>
                </>
              ) : (
                requiresFlavors && flavor1 && (
                  <div className="flex justify-between">
                    <span>• Recheio ({flavor1}):</span>
                    <span className="font-semibold text-[#3D1E26]">
                      {flavor1Extra > 0 ? `+ R$ ${flavor1Extra.toFixed(2)}` : 'Incluso'}
                    </span>
                  </div>
                )
              )}

              {selectedPack && (
                <div className="flex justify-between">
                  <span>• Embalagem ({selectedPack}):</span>
                  <span className="font-semibold text-[#3D1E26]">
                    {packagingExtra > 0 ? `+ R$ ${packagingExtra.toFixed(2)}` : 'Inclusa'}
                  </span>
                </div>
              )}

              {availableAddons.length > 0 && (
                <div className="flex justify-between">
                  <span>• Adicionais ({selectedAddons.length} selecionado{selectedAddons.length !== 1 ? 's' : ''}):</span>
                  <span className="font-semibold text-[#3D1E26]">
                    {addonsExtra > 0 ? `+ R$ ${addonsExtra.toFixed(2)}` : 'R$ 0,00'}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[11px] pt-1 text-[#8C5D6C]">
                <span>• Modalidade de Entrega:</span>
                <span className="font-medium text-[#3D1E26]">Retirada no Ateliê (ou Uber/99)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#FAD0DE] flex items-center justify-between">
              <span className="text-xs font-bold text-[#3D1E26]">TOTAL FINAL CONTABILIZADO:</span>
              <span className="text-lg font-extrabold text-[#D81E5B]">
                R$ {estimatedTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Action button: Send to WhatsApp */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Enviar Pedido para o WhatsApp</span>
            </button>
            <p className="text-[11px] text-[#8C5D6C] text-center mt-2">
              Mensagem formatada e pronta para envio no WhatsApp!
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};


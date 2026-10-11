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

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  initialItem = '',
  initialFlavor = '',
  data,
}) => {
  const currentData = data || store.getPublished();
  const { products, flavors, packaging, addons, settings } = currentData;

  const [category, setCategory] = useState<string>(initialItem || products[0]?.name || 'Bolo Vintage Heart Cake');
  const [batter, setBatter] = useState<string>('');
  const [flavor1, setFlavor1] = useState<string>('');
  const [flavor2, setFlavor2] = useState<string>('');
  const [selectedPack, setSelectedPack] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [servings, setServings] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<'entrega' | 'retirada'>('retirada');
  const [location, setLocation] = useState<string>('Paço do Lumiar');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Find the selected product object
  const selectedProductObj: Product | undefined = products.find((p) => p.name === category);

  // Dynamic options strictly derived from the selected product
  const availableBatters: CakeBatter[] = (selectedProductObj?.batters && selectedProductObj.batters.length > 0)
    ? selectedProductObj.batters.filter(b => b.active)
    : [];

  const availableFlavors: Flavor[] = (selectedProductObj?.flavors && selectedProductObj.flavors.length > 0)
    ? selectedProductObj.flavors.filter(f => f.active)
    : flavors.filter(f => f.active);

  const availablePackaging: PackagingOption[] = (selectedProductObj?.packaging && selectedProductObj.packaging.length > 0)
    ? selectedProductObj.packaging.filter(p => p.active)
    : packaging.filter(p => p.active);

  const availableAddons: Addon[] = (selectedProductObj?.addons && selectedProductObj.addons.length > 0)
    ? selectedProductObj.addons.filter(a => a.active)
    : addons.filter(a => a.active);

  const availableVariations: ProductVariation[] = (selectedProductObj?.variations && selectedProductObj.variations.length > 0)
    ? selectedProductObj.variations.filter(v => v.active)
    : [];

  // Rules determination
  const isCake = selectedProductObj?.category === 'bolos' || selectedProductObj?.requires_batter;
  const requiresBatter = selectedProductObj?.requires_batter ?? (isCake && availableBatters.length > 0);
  const requires2Flavors = (selectedProductObj?.min_flavors === 2) || (isCake && availableFlavors.length >= 2);
  const minAddons = selectedProductObj?.min_addons ?? (isCake ? 1 : 0);

  // Synchronize options when category changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    setValidationError(null);

    // 1. Batter sync
    if (availableBatters.length > 0) {
      const batterExists = availableBatters.some(b => b.name === batter);
      if (!batterExists) {
        setBatter(availableBatters[0]?.name || '');
      }
    } else {
      setBatter('');
    }

    // 2. Flavors sync
    if (availableFlavors.length > 0) {
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
    }

    // 3. Packaging sync
    if (availablePackaging.length > 0) {
      const packExists = availablePackaging.some(p => p.name === selectedPack);
      if (!packExists) {
        setSelectedPack(availablePackaging[0]?.name || '');
      }
    }

    // 4. Variations sync
    if (availableVariations.length > 0) {
      const varExists = availableVariations.some(v => v.name === servings);
      if (!varExists) {
        setServings(availableVariations[0]?.name || '');
      }
    } else {
      if (!servings) setServings('15 a 20 fatias');
    }

  }, [category, isOpen, requires2Flavors, minAddons]);

  if (!isOpen) return null;

  // Selected item objects for pricing
  const selectedVariationObj = availableVariations.find((v) => v.name === servings);
  const selectedBatterObj = availableBatters.find((b) => b.name === batter);
  const selectedFlavor1Obj = availableFlavors.find((f) => f.name === flavor1);
  const selectedFlavor2Obj = availableFlavors.find((f) => f.name === flavor2);
  const selectedPackagingObj = availablePackaging.find((p) => p.name === selectedPack);

  // Price calculation - CONTABILIZAÇÃO COMPLETA DE TUDO
  const basePrice = selectedVariationObj?.price 
    ? selectedVariationObj.price 
    : (selectedProductObj?.starting_price || 130);

  const batterExtra = selectedBatterObj?.additional_price || 0;
  const flavor1Extra = selectedFlavor1Obj?.additional_price || 0;
  const flavor2Extra = requires2Flavors ? (selectedFlavor2Obj?.additional_price || 0) : 0;
  const packagingExtra = selectedPackagingObj?.additional_price || 0;
  const addonsExtra = selectedAddons.reduce((acc, addName) => {
    const item = availableAddons.find((a) => a.name === addName);
    return acc + (item?.price || 0);
  }, 0);

  // Contabilização de todo o conjunto no pedido final
  const estimatedTotal = basePrice + batterExtra + flavor1Extra + flavor2Extra + packagingExtra + addonsExtra;

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validações obrigatórias
    if (requiresBatter && (!batter || batter.trim() === '')) {
      setValidationError('Por favor, selecione obrigatoriamente o tipo de massa do seu bolo.');
      return;
    }

    if (requires2Flavors && (!flavor1 || !flavor2 || flavor1.trim() === '' || flavor2.trim() === '')) {
      setValidationError('Por favor, selecione obrigatoriamente os 2 tipos de recheio para o seu bolo decorado.');
      return;
    }

    if (minAddons > 0 && selectedAddons.length < minAddons) {
      setValidationError(`Por favor, selecione no mínimo ${minAddons} adicional/opcional para compor o seu bolo (ex: topo de bolo personalizado, morangos, confeitos ou velas).`);
      return;
    }

    const formattedMessage = 
      `*Olá, ${settings.short_name}! Gostaria de solicitar um pedido:*\n\n` +
      `🎂 *Item desejado:* ${category}\n` +
      `👥 *Tamanho / Porção:* ${servings || 'Padrão'} (R$ ${basePrice.toFixed(2)})\n` +
      (batter ? `🍰 *Tipo de Massa (Obrigatório):* ${batter} ${batterExtra > 0 ? `(+R$ ${batterExtra.toFixed(2)})` : '(Inclusa)'}\n` : '') +
      (requires2Flavors 
        ? `🍓 *1º Recheio (Obrigatório):* ${flavor1} ${flavor1Extra > 0 ? `(+R$ ${flavor1Extra.toFixed(2)})` : '(Incluso)'}\n` +
          `🍫 *2º Recheio (Obrigatório):* ${flavor2} ${flavor2Extra > 0 ? `(+R$ ${flavor2Extra.toFixed(2)})` : '(Incluso)'}\n`
        : `🍓 *Recheio / Sabor:* ${flavor1 || 'Padrão'} ${flavor1Extra > 0 ? `(+R$ ${flavor1Extra.toFixed(2)})` : ''}\n`
      ) +
      `📦 *Embalagem:* ${selectedPack || 'Padrão'} ${packagingExtra > 0 ? `(+R$ ${packagingExtra.toFixed(2)})` : '(Inclusa)'}\n` +
      `✨ *Adicionais (Obrigatório mín. 1):* ${selectedAddons.join(', ')} (+R$ ${addonsExtra.toFixed(2)})\n` +
      `📅 *Data do evento:* ${date || 'A combinar'}\n` +
      `🚚 *Modalidade:* ${deliveryType === 'entrega' ? `Entrega em ${location}` : 'Retirada no Ateliê'}\n` +
      (notes ? `📝 *Observações/Tema:* ${notes}\n` : '') +
      `\n═════════════════════════\n` +
      `💰 *VALOR TOTAL CONTABILIZADO:* R$ ${estimatedTotal.toFixed(2).replace('.', ',')}\n` +
      `═════════════════════════\n\n` +
      `_Poderia me confirmar a disponibilidade na agenda para esta data?_`;

    // Record order in store
    store.recordOrder({
      product_name: category,
      batter: batter,
      quantity: servings,
      flavors: requires2Flavors ? [flavor1, flavor2] : [flavor1],
      packaging: selectedPack,
      addons: selectedAddons,
      date: date || 'A combinar',
      delivery_type: deliveryType,
      location: deliveryType === 'entrega' ? location : 'Ateliê',
      notes: notes,
      estimated_total: estimatedTotal,
      formatted_message: formattedMessage,
    });

    const targetUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(targetUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#FAD0DE] overflow-hidden max-h-[92vh] flex flex-col text-left"
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
                Personalize a massa, os recheios e os opcionais exclusivos
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
                <strong className="font-bold block">Atenção aos requisitos do bolo:</strong>
                <span>{validationError}</span>
              </div>
            </div>
          )}

          {/* 1. Item Category (Produto) */}
          <div>
            <label className="block text-xs font-bold text-[#3D1E26] mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>1. Escolha o Produto</span>
              {isCake && (
                <span className="text-[10px] text-[#D81E5B] font-semibold">
                  Massa + Recheio + Mín. 1 Adicional
                </span>
              )}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#FAD0DE] bg-[#FFFDFC] text-[#3D1E26] font-medium focus:outline-hidden focus:border-[#D81E5B] focus:ring-1 focus:ring-[#D81E5B] cursor-pointer"
            >
              {products.filter(p => p.active).map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.starting_price_display || `a partir de R$ ${p.starting_price}`})
                </option>
              ))}
              <option value="Outro pedido personalizado">Outro pedido personalizado sob medida</option>
            </select>
          </div>

          {/* 2. Tipo de Massa do Bolo (OBRIGATÓRIO) */}
          {availableBatters.length > 0 && (
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

          {/* 3. Recheios do Bolo (2 TIPOS OBRIGATORIAMENTE OU 1 TIPO) */}
          {availableFlavors.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE] space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#3D1E26] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D81E5B]" />
                  3. {requires2Flavors ? 'Sabores & Recheios (2 Tipos Obrigatórios)' : 'Recheio / Sabor (Obrigatório)'}
                </label>
                <span className="text-[10px] font-extrabold uppercase bg-[#FFF0F4] text-[#B8134B] border border-[#FAD0DE] px-2 py-0.5 rounded-full">
                  {requires2Flavors ? '* 2 Recheios Obrigatórios' : '* Obrigatório'}
                </span>
              </div>

              {requires2Flavors ? (
                <>
                  <p className="text-[11px] text-[#7A505D]">
                    Os bolos decorados levam 2 camadas generosas de recheio. Escolha os 2 tipos abaixo (podem ser sabores diferentes ou o mesmo sabor nas duas camadas):
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
          )}

          {/* 4. Tamanho / Variação ou Fatias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D1E26] mb-1.5 uppercase tracking-wider">
                4. Tamanho / Opção
              </label>
              {availableVariations.length > 0 ? (
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
              ) : (
                <select
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#FAD0DE] bg-[#FFFDFC] text-[#3D1E26] font-medium focus:outline-hidden focus:border-[#D81E5B] cursor-pointer"
                >
                  <option value="Bentô (2 a 4 pessoas)">Bentô Cake (2 a 4 pessoas)</option>
                  <option value="15 fatias (Pequeno)">15 fatias (Pequeno)</option>
                  <option value="20 a 25 fatias (Médio)">20 a 25 fatias (Médio)</option>
                  <option value="30 a 40 fatias (Grande)">30 a 40 fatias (Grande)</option>
                  <option value="Kit 10 pessoas">Kit Festa 10 pessoas</option>
                  <option value="Kit 20 pessoas">Kit Festa 20 pessoas</option>
                  <option value="Kit 30+ pessoas">Kit Festa 30+ pessoas</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D1E26] mb-1.5 uppercase tracking-wider">
                5. Data desejada
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#FAD0DE] bg-[#FFFDFC] text-[#3D1E26] font-medium focus:outline-hidden focus:border-[#D81E5B]"
              />
            </div>
          </div>

          {/* 5. Packaging (Particular do produto selecionado) */}
          {availablePackaging.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#3D1E26] mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>6. Opção de Embalagem</span>
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

          {/* 6. Adicionais & Opcionais (NO MÍNIMO 1 OBRIGATÓRIO PARA BOLO) */}
          {availableAddons.length > 0 && (
            <div className={`p-4 rounded-2xl border space-y-2.5 transition-colors ${
              minAddons > 0 && selectedAddons.length < minAddons 
                ? 'bg-rose-50/70 border-rose-300' 
                : 'bg-[#FFF9FB] border-[#FAD0DE]'
            }`}>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#3D1E26] uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-[#D81E5B]" />
                  7. Adicionais & Opcionais
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
                      <div className="flex items-center gap-1.5">
                        <Check className={`w-3.5 h-3.5 ${isChecked ? 'opacity-100 text-[#D81E5B]' : 'opacity-0'}`} />
                        <span>{add.name}</span>
                      </div>
                      <span className="font-bold">+R${add.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. Forma de Recebimento */}
          <div>
            <label className="block text-xs font-bold text-[#3D1E26] mb-1.5 uppercase tracking-wider">
              8. Forma de recebimento
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('retirada')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  deliveryType === 'retirada'
                    ? 'bg-[#FFF0F4] border-[#D81E5B] text-[#D81E5B]'
                    : 'border-[#FAD0DE] text-[#6B4651] bg-white'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${deliveryType === 'retirada' ? 'opacity-100' : 'opacity-0'}`} />
                <span>Retirada no Ateliê</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('entrega')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  deliveryType === 'entrega'
                    ? 'bg-[#FFF0F4] border-[#D81E5B] text-[#D81E5B]'
                    : 'border-[#FAD0DE] text-[#6B4651] bg-white'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${deliveryType === 'entrega' ? 'opacity-100' : 'opacity-0'}`} />
                <span>Entrega em Domicílio</span>
              </button>
            </div>

            {deliveryType === 'entrega' && (
              <div className="mt-2.5">
                <input
                  type="text"
                  placeholder="Bairro / Cidade (ex: Maiobão, Paço do Lumiar, Calhau...)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#FAD0DE] bg-[#FFFDFC] text-[#3D1E26] placeholder-[#9E7381] focus:outline-hidden focus:border-[#D81E5B]"
                />
              </div>
            )}
          </div>

          {/* 8. Theme / Notes */}
          <div>
            <label className="block text-xs font-bold text-[#3D1E26] mb-1.5 uppercase tracking-wider">
              9. Detalhes, cores ou frase para o pedido
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Escrita 'Feliz Aniversário Luiza', paleta de cores rosa e dourado, referência que vi no Instagram..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#FAD0DE] bg-[#FFFDFC] text-[#3D1E26] placeholder-[#9E7381] focus:outline-hidden focus:border-[#D81E5B]"
            />
          </div>

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
                <span>• Base / Tamanho ({servings || 'Padrão'}):</span>
                <span className="font-semibold text-[#3D1E26]">R$ {basePrice.toFixed(2)}</span>
              </div>

              {batter && (
                <div className="flex justify-between">
                  <span>• Massa ({batter}):</span>
                  <span className="font-semibold text-[#3D1E26]">
                    {batterExtra > 0 ? `+ R$ ${batterExtra.toFixed(2)}` : 'Inclusa'}
                  </span>
                </div>
              )}

              {requires2Flavors ? (
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
                flavor1 && (
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

              <div className="flex justify-between">
                <span>• Adicionais ({selectedAddons.length} selecionado{selectedAddons.length !== 1 ? 's' : ''}):</span>
                <span className="font-semibold text-[#3D1E26]">
                  {addonsExtra > 0 ? `+ R$ ${addonsExtra.toFixed(2)}` : 'R$ 0,00'}
                </span>
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
              Mensagem formatada com massa, 2 recheios e adicionais pronta para envio!
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

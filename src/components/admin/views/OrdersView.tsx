import React, { useState } from 'react';
import { Addon, AppDatabase, OrderEvent } from '../../../types';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Textarea } from '../../ui/Textarea';
import { MessageCircle, Calendar, DollarSign, Send, Trash2, CheckCircle2, User, MapPin, Check } from 'lucide-react';
import { generateWhatsAppUrl } from '../../../lib/whatsapp';
import { useToast } from '../../ui/Toast';

interface OrdersViewProps {
  data: AppDatabase;
  onChange: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

const ADDONS_SOLD_BY_UNIT = new Set([
  'lacinho de cetim',
  'cerejas com glitter',
  'cerejas',
  'globo espelhado 3cm',
  'apliques de chocolate (15uni)',
  'apliques de chocolate (15 uni)',
  'kg extra',
]);

const normalizedAddonName = (name: string) =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');

const isAddonSoldByUnit = (addon: Addon) => ADDONS_SOLD_BY_UNIT.has(normalizedAddonName(addon.name));

export const OrdersView: React.FC<OrdersViewProps> = ({ data, onChange }) => {
  const { orders, products, flavors, packaging, addons, settings } = data;
  const { success } = useToast();

  // Internal Quote Simulator
  const [clientName, setClientName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.name || '');
  const [selectedBatter, setSelectedBatter] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState(flavors[0]?.name || '');
  const [selectedFlavor2, setSelectedFlavor2] = useState(flavors[1]?.name || flavors[0]?.name || '');
  const [selectedPackaging, setSelectedPackaging] = useState(packaging[0]?.name || '');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});
  const [customNotes, setCustomNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState('Retirada no Ateliê');
  const [date, setDate] = useState('');

  // Calculate quick estimate
  const currentProd = products.find((p) => p.name === selectedProduct);
  const isCakeProd = currentProd?.category === 'bolos' || currentProd?.requires_batter;
  const prodBatters = currentProd?.batters || [];
  const prodFlavors = (currentProd?.flavors && currentProd.flavors.length > 0) ? currentProd.flavors : flavors;
  const prodPackaging = (currentProd?.packaging && currentProd.packaging.length > 0) ? currentProd.packaging : packaging;
  const prodAddons = (Array.isArray(currentProd?.addons) ? currentProd.addons : addons).filter((addon) => addon.active);

  const currentBatter = prodBatters.find((b) => b.name === selectedBatter);
  const currentFlav1 = prodFlavors.find((f) => f.name === selectedFlavor);
  const currentFlav2 = prodFlavors.find((f) => f.name === selectedFlavor2);
  const currentPack = prodPackaging.find((p) => p.name === selectedPackaging);

  const basePrice = currentProd?.starting_price || 0;
  const batterPrice = currentBatter?.additional_price || 0;
  const flavPrice1 = currentFlav1?.additional_price || 0;
  const flavPrice2 = isCakeProd ? (currentFlav2?.additional_price || 0) : 0;
  const packPrice = currentPack?.additional_price || 0;
  const addonTotal = (addon: Addon) => Number(addon.price || 0) * (isAddonSoldByUnit(addon) ? (addonQuantities[addon.id] || 1) : 1);
  const addonsPrice = selectedAddons.reduce((acc, addName) => {
    const item = prodAddons.find((a) => a.name === addName);
    return acc + (item ? addonTotal(item) : 0);
  }, 0);
  const selectedAddonDetails = selectedAddons.map((addName) => {
    const item = prodAddons.find((addon) => addon.name === addName);
    if (!item || !isAddonSoldByUnit(item)) return addName;
    const quantity = addonQuantities[item.id] || 1;
    return `${addName} (${quantity} ${quantity === 1 ? 'unidade' : 'unidades'})`;
  });

  const estimatedTotal = basePrice + batterPrice + flavPrice1 + flavPrice2 + packPrice + addonsPrice;

  const handleGenerateQuoteMessage = () => {
    const message = 
      `Olá, ${clientName || 'Cliente'}! Segue a prévia do seu orçamento da *${settings.company_name}*:\n\n` +
      `🎂 *Item:* ${selectedProduct}\n` +
      (selectedBatter ? `🍰 *Tipo de Massa (Obrigatório):* ${selectedBatter}\n` : '') +
      (isCakeProd
        ? `🍓 *1º Recheio (Obrigatório):* ${selectedFlavor}\n` +
          `🍫 *2º Recheio (Obrigatório):* ${selectedFlavor2}\n`
        : `🍓 *Recheio:* ${selectedFlavor}\n`
      ) +
      `📦 *Embalagem:* ${selectedPackaging}\n` +
      (selectedAddons.length > 0 ? `✨ *Adicionais:* ${selectedAddonDetails.join(', ')}\n` : '') +
      `📅 *Data desejada:* ${date || 'A combinar'}\n` +
      `🚚 *Modalidade:* ${deliveryType}\n` +
      (customNotes ? `📝 *Observações:* ${customNotes}\n` : '') +
      `\n💰 *Valor Total Contabilizado:* R$ ${estimatedTotal.toFixed(2).replace('.', ',')}\n\n` +
      `_Podemos confirmar a reserva da data com o sinal de 50%?_`;

    const url = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    // Also record event
    const newEvent: OrderEvent = {
      id: 'ord-' + Date.now(),
      created_at: new Date().toISOString(),
      customer_name: clientName || 'Orçamento WhatsApp',
      product_name: selectedProduct,
      batter: selectedBatter,
      quantity: '1',
      flavors: isCakeProd ? [selectedFlavor, selectedFlavor2] : [selectedFlavor],
      packaging: selectedPackaging,
      addons: selectedAddonDetails,
      date: date || 'A combinar',
      delivery_type: deliveryType,
      notes: customNotes,
      estimated_total: estimatedTotal,
      formatted_message: message,
    };

    onChange((prev) => ({
      ...prev,
      orders: [newEvent, ...prev.orders],
    }));

    success('Orçamento gerado e aberto no WhatsApp!');
  };

  const handleClearHistory = () => {
    onChange((prev) => ({
      ...prev,
      orders: [],
    }));
    success('Histórico limpo!');
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* 1. Gerador de Orçamentos Profissional (Para a Manu) */}
      <Card
        title="Gerador Rápido de Orçamentos para WhatsApp"
        subtitle="Monte uma cotação em segundos com cálculo exato de adicionais e envie para o cliente."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Nome do Cliente"
              placeholder="Ex: Mariana Silva"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              icon={<User className="w-4 h-4" />}
            />

            <Select
              label="Produto Desejado"
              value={selectedProduct}
              onChange={(e) => {
                const prodName = e.target.value;
                setSelectedProduct(prodName);
                setSelectedAddons([]);
                setAddonQuantities({});
                const p = products.find(x => x.name === prodName);
                if (p?.batters && p.batters.length > 0) setSelectedBatter(p.batters[0].name);
                if (p?.flavors && p.flavors.length > 1) setSelectedFlavor2(p.flavors[1].name);
              }}
              options={products.map((p) => ({ value: p.name, label: `${p.name} (R$ ${p.starting_price})` }))}
            />

            {prodBatters.length > 0 ? (
              <Select
                label="Massa do Bolo (Obrigatória)"
                value={selectedBatter}
                onChange={(e) => setSelectedBatter(e.target.value)}
                options={prodBatters.map((b) => ({
                  value: b.name,
                  label: b.additional_price && b.additional_price > 0 ? `${b.name} (+R$ ${b.additional_price})` : `${b.name} (Inclusa)`,
                }))}
              />
            ) : (
              <Select
                label="Sabor de Recheio"
                value={selectedFlavor}
                onChange={(e) => setSelectedFlavor(e.target.value)}
                options={prodFlavors.map((f) => ({
                  value: f.name,
                  label: f.additional_price > 0 ? `${f.name} (+R$ ${f.additional_price})` : f.name,
                }))}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {prodBatters.length > 0 ? (
              <>
                <Select
                  label="1º Recheio (Obrigatório)"
                  value={selectedFlavor}
                  onChange={(e) => setSelectedFlavor(e.target.value)}
                  options={prodFlavors.map((f) => ({
                    value: f.name,
                    label: f.additional_price > 0 ? `${f.name} (+R$ ${f.additional_price})` : f.name,
                  }))}
                />
                <Select
                  label="2º Recheio (Obrigatório)"
                  value={selectedFlavor2}
                  onChange={(e) => setSelectedFlavor2(e.target.value)}
                  options={prodFlavors.map((f) => ({
                    value: f.name,
                    label: f.additional_price > 0 ? `${f.name} (+R$ ${f.additional_price})` : f.name,
                  }))}
                />
              </>
            ) : null}

            <Select
              label="Tipo de Embalagem"
              value={selectedPackaging}
              onChange={(e) => setSelectedPackaging(e.target.value)}
              options={prodPackaging.map((pack) => ({
                value: pack.name,
                label: pack.additional_price > 0 ? `${pack.name} (+R$ ${pack.additional_price})` : pack.name,
              }))}
            />

            <Input
              label="Data do Evento"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <Select
              label="Forma de Recebimento"
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value)}
              options={[
                { value: 'Retirada no Ateliê (Cliente retira ou Uber Flash/99)', label: 'Retirada no Ateliê (Cliente busca ou Uber Flash / 99)' },
                { value: 'Retirada presencial no Ateliê', label: 'Retirada presencial pelo cliente' },
                { value: 'Envio Uber Flash / 99 Entregas (Pago pelo cliente)', label: 'Envio Uber Flash / 99 Entregas' },
              ]}
            />
          </div>

          {/* Adicionais checkboxes */}
          <div className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE] space-y-2.5">
            <label className="text-xs font-bold text-[#3D1E26] uppercase tracking-wider block mb-2">
              Adicionais & Opcionais
            </label>
            <p className="text-[11px] text-[#7A505D]">Selecione os adicionais cadastrados para este produto. Itens vendidos por unidade exibem a quantidade automaticamente.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {prodAddons.map((add) => {
                const isChecked = selectedAddons.includes(add.name);
                const isSoldByUnit = isAddonSoldByUnit(add);
                const addonQuantity = addonQuantities[add.id] || 1;
                return (
                  <div
                    key={add.id}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-colors ${
                      isChecked
                        ? 'bg-[#FFF0F4] border-[#D81E5B] text-[#D81E5B] shadow-2xs font-semibold'
                        : 'bg-white border-[#FAD0DE] text-[#6B4651] hover:border-[#D81E5B]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddons((prev) => isChecked ? prev.filter((name) => name !== add.name) : [...prev, add.name]);
                        if (isChecked) {
                          setAddonQuantities((prev) => {
                            const { [add.id]: _, ...remaining } = prev;
                            return remaining;
                          });
                        } else if (isSoldByUnit) {
                          setAddonQuantities((prev) => ({ ...prev, [add.id]: prev[add.id] || 1 }));
                        }
                      }}
                      className="flex-1 min-w-0 flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <Check className={`w-3.5 h-3.5 shrink-0 ${isChecked ? 'opacity-100 text-[#D81E5B]' : 'opacity-0'}`} />
                      {add.image && <img src={add.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 border border-[#FAD0DE]" />}
                      <span>{add.name}</span>
                    </button>
                    <div className="ml-2 shrink-0 text-right">
                      <span className="font-bold block">+R$ {addonTotal(add).toFixed(2).replace('.', ',')}</span>
                      {isChecked && isSoldByUnit && (
                        <div className="mt-1.5 flex items-center rounded-lg border border-[#FAD0DE] bg-white overflow-hidden">
                          <button type="button" onClick={() => setAddonQuantities((prev) => ({ ...prev, [add.id]: Math.max(1, addonQuantity - 1) }))} disabled={addonQuantity <= 1} className="w-7 h-6 text-base font-bold text-[#D81E5B] hover:bg-[#FFF0F4] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer" aria-label={`Diminuir quantidade de ${add.name}`}>−</button>
                          <output className="w-7 text-center text-[11px] font-bold text-[#3D1E26]" aria-label={`Quantidade de ${add.name}`}>{addonQuantity}</output>
                          <button type="button" onClick={() => setAddonQuantities((prev) => ({ ...prev, [add.id]: addonQuantity + 1 }))} className="w-7 h-6 text-base font-bold text-[#D81E5B] hover:bg-[#FFF0F4] cursor-pointer" aria-label={`Aumentar quantidade de ${add.name}`}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Textarea
            label="Detalhes / Frase do Bolo"
            rows={2}
            placeholder="Ex: Escrita '30 anos da Mari', laços vermelhos estilo vintage..."
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
          />

          {/* Estimated Total & Action */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF0F4] to-[#FFEBF1] border border-[#FAD6E2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#7A505D]">Total Calculado:</p>
              <h3 className="text-2xl font-bold text-[#D81E5B]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                R$ {estimatedTotal.toFixed(2).replace('.', ',')}
              </h3>
            </div>

            <Button
              type="button"
              variant="success"
              size="lg"
              icon={<MessageCircle className="w-5 h-5 fill-white" />}
              onClick={handleGenerateQuoteMessage}
            >
              Enviar Mensagem Formatada no WhatsApp
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Histórico de Pedidos e Simulações */}
      <Card
        title="Histórico de Pedidos & Simulações"
        subtitle="Registros das solicitações enviadas através do simulador público do site."
        headerAction={
          orders.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-700"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={handleClearHistory}
            >
              Limpar Histórico
            </Button>
          )
        }
      >
        {orders.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#8C5D6C]">
            <p>Nenhum pedido simulado no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-white border border-[#FAD0DE] shadow-2xs space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#3D1E26]">{ord.product_name}</span>
                    <Badge variant="pink">{ord.delivery_type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#7A505D]">
                    <span className="font-bold text-[#25D366]">R$ {ord.estimated_total.toFixed(2)}</span>
                    <span>·</span>
                    <span>{new Date(ord.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                <div className="text-xs text-[#6B4651] space-y-1">
                  <p><strong>Recheios / Sabores:</strong> {ord.flavors?.join(', ') || 'Não especificado'}</p>
                  {ord.packaging && <p><strong>Embalagem:</strong> {ord.packaging}</p>}
                  {ord.notes && <p><strong>Observações:</strong> {ord.notes}</p>}
                  {ord.inspiration_photo && (
                    <p className="text-[#D81E5B] font-semibold flex items-center gap-1.5 pt-0.5">
                      <span>📸 Foto de Inspiração:</span>
                      <span className="font-normal text-[#3D1E26]">{ord.inspiration_photo}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
};

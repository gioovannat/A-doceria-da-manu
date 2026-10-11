import React, { useState } from 'react';
import { AppDatabase, SpecialtyItem } from '../../../types';
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
import { Plus, Edit3, Trash2, ArrowUp, ArrowDown, Copy, Layers, Users, Check } from 'lucide-react';
import { useToast } from '../../ui/Toast';

interface SpecialtiesViewProps {
  data: AppDatabase;
  onChange: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

export const SpecialtiesView: React.FC<SpecialtiesViewProps> = ({ data, onChange }) => {
  const { specialties } = data;
  const { success } = useToast();
  const [editingSpecialty, setEditingSpecialty] = useState<SpecialtyItem | null>(null);
  const [specialtyToDelete, setSpecialtyToDelete] = useState<SpecialtyItem | null>(null);
  const [newHighlight, setNewHighlight] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpecialty) return;

    onChange((prev) => {
      const exists = prev.specialties.some((s) => s.id === editingSpecialty.id);
      const updatedSpecialties = exists
        ? prev.specialties.map((s) => (s.id === editingSpecialty.id ? editingSpecialty : s))
        : [...prev.specialties, editingSpecialty];

      // Sincronização direta com o catálogo de produtos:
      // Se já existir um produto correspondente (por id, categoria, slug ou nome), atualiza os dados dele;
      // Caso seja uma especialidade nova, cria automaticamente um produto no catálogo sem duplicações.
      const productIndex = prev.products.findIndex(
        (p) => p.id === editingSpecialty.id || p.category === editingSpecialty.category || p.slug === editingSpecialty.slug || p.name.toLowerCase() === editingSpecialty.title.toLowerCase()
      );

      let updatedProducts = [...prev.products];
      if (productIndex >= 0) {
        const existingProd = updatedProducts[productIndex];
        updatedProducts[productIndex] = {
          ...existingProd,
          name: editingSpecialty.title,
          slug: editingSpecialty.slug,
          full_description: editingSpecialty.description,
          category: editingSpecialty.category,
          main_image: editingSpecialty.image,
          unit: editingSpecialty.serves,
          badge: editingSpecialty.badge,
          starting_price_display: editingSpecialty.startingPrice,
          active: editingSpecialty.active,
          featured: editingSpecialty.featured,
        };
      } else {
        // Criação de novo produto no catálogo a partir da nova especialidade cadastrada
        const parsedPrice = parseFloat(editingSpecialty.startingPrice.replace(/[^0-9,.]/g, '').replace(',', '.')) || 100;
        const newProduct: any = {
          id: editingSpecialty.id,
          name: editingSpecialty.title,
          slug: editingSpecialty.slug,
          full_description: editingSpecialty.description,
          category: editingSpecialty.category,
          main_image: editingSpecialty.image,
          gallery: [editingSpecialty.image],
          starting_price: parsedPrice,
          starting_price_display: editingSpecialty.startingPrice,
          unit: editingSpecialty.serves,
          minimum_notice: '48h',
          badge: editingSpecialty.badge || 'Especial',
          active: editingSpecialty.active,
          featured: editingSpecialty.featured,
          sort_order: updatedProducts.length + 1,
          requires_batter: editingSpecialty.category === 'bolos' || editingSpecialty.category === 'bento',
          min_flavors: editingSpecialty.category === 'bolos' ? 2 : 1,
          max_flavors: editingSpecialty.category === 'bolos' ? 2 : 1,
          min_addons: (editingSpecialty.category === 'bolos' || editingSpecialty.category === 'bento') ? 1 : 0,
          batters: editingSpecialty.category === 'bolos' || editingSpecialty.category === 'bento' ? [
            { id: 'bat-1', name: 'Massa Amanteigada de Baunilha', description: 'Estruturada, leve e aveludada', additional_price: 0, active: true },
            { id: 'bat-2', name: 'Massa de Chocolate 50% Cacau', description: 'Úmida e marcante com cacau nobre', additional_price: 0, active: true },
          ] : [],
          variations: [],
          flavors: [
            { id: 'flav-1', name: 'Ninho com Morangos Frescos', description: 'Recheio cremoso clássico', additional_price: 0, active: true },
            { id: 'flav-2', name: 'Brigadeiro Belga 54%', description: 'Chocolate nobre', additional_price: 0, active: true },
          ],
          packaging: [
            { id: 'pack-1', name: 'Embalagem Segura de Transporte', description: 'Caixa reforçada', additional_price: 0, is_required: true, active: true }
          ],
          addons: [
            { id: 'add-1', name: 'Topo Personalizado com Nome', description: 'Papelaria afetiva', price: 20, unit: 'unidade', active: true }
          ]
        };
        updatedProducts.push(newProduct);
      }

      return {
        ...prev,
        specialties: updatedSpecialties,
        products: updatedProducts,
      };
    });

    success('Especialidade salva e sincronizada no Catálogo de Produtos!');
    setEditingSpecialty(null);
  };

  const handleCreateNew = () => {
    const newItem: SpecialtyItem = {
      id: 'spec-' + Date.now(),
      category: 'bolos',
      slug: 'nova-especialidade',
      title: 'Nova Especialidade',
      subtitle: 'Sob encomenda para festas',
      description: 'Descrição detalhada dos diferenciais e acabamentos artesanais.',
      image: data.home.hero_main_image,
      serves: 'A partir de 15 fatias',
      badge: 'Exclusivo',
      seoTag: 'Bolos decorados em Paço do Lumiar',
      startingPrice: 'A partir de R$ 100',
      highlights: ['Feito sob medida', 'Ingredientes frescos', 'Decoração personalizada'],
      sort_order: specialties.length + 1,
      active: true,
      featured: true,
    };
    setEditingSpecialty(newItem);
  };

  const handleDuplicate = (item: SpecialtyItem) => {
    const duplicated: SpecialtyItem = {
      ...item,
      id: 'spec-' + Date.now(),
      title: `${item.title} (Cópia)`,
      slug: `${item.slug}-copia`,
      sort_order: specialties.length + 1,
    };
    onChange((prev) => ({
      ...prev,
      specialties: [...prev.specialties, duplicated],
    }));
    success('Especialidade duplicada!');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= specialties.length) return;
    onChange((prev) => {
      const copy = [...prev.specialties];
      const temp = copy[index];
      copy[index] = copy[newIdx];
      copy[newIdx] = temp;
      return {
        ...prev,
        specialties: copy.map((s, i) => ({ ...s, sort_order: i + 1 })),
      };
    });
  };

  const confirmDelete = () => {
    if (!specialtyToDelete) return;
    onChange((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s.id !== specialtyToDelete.id),
    }));
    success('Especialidade excluída!');
    setSpecialtyToDelete(null);
  };

  return (
    <div className="space-y-6 text-left">
      <Card
        title="Gerenciamento de Especialidades"
        subtitle="Os cartões de apresentação com filtros por categoria na seção 'O que oferecemos'."
        headerAction={
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateNew}
          >
            Adicionar Especialidade
          </Button>
        }
      >
        <div className="space-y-4">
          {specialties.map((item, index) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                item.active ? 'bg-white border-[#FAD0DE] shadow-2xs' : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Reorder arrows */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-[#9E7381] hover:text-[#D81E5B] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === specialties.length - 1}
                    className="p-1 text-[#9E7381] hover:text-[#D81E5B] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FFF2F6] border border-[#FAD0DE] shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-bold text-[#3D1E26]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                      {item.title}
                    </h4>
                    <Badge variant={item.active ? 'emerald' : 'gray'}>
                      {item.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="pink">{item.badge}</Badge>
                  </div>
                  <p className="text-xs text-[#E05A2B] font-semibold">{item.subtitle}</p>
                  <p className="text-[11px] text-[#7A505D] mt-0.5">{item.serves} · {item.startingPrice}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                  onClick={() => setEditingSpecialty({ ...item })}
                >
                  Editar
                </Button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(item)}
                  className="p-2 text-[#7A505D] hover:text-[#D81E5B] hover:bg-[#FFF0F4] rounded-xl cursor-pointer"
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSpecialtyToDelete(item)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* MODAL: EDITAR ESPECIALIDADE */}
      {editingSpecialty && (
        <Modal
          isOpen={true}
          onClose={() => setEditingSpecialty(null)}
          title={`Editar Especialidade: ${editingSpecialty.title}`}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Título da Especialidade"
                required
                value={editingSpecialty.title}
                onChange={(e) => setEditingSpecialty({ ...editingSpecialty, title: e.target.value })}
              />

              <Input
                label="Subtítulo Descritivo"
                value={editingSpecialty.subtitle}
                onChange={(e) => setEditingSpecialty({ ...editingSpecialty, subtitle: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Categoria (Filtro)"
                value={editingSpecialty.category}
                onChange={(e) => setEditingSpecialty({ ...editingSpecialty, category: e.target.value })}
                options={[
                  { value: 'bolos', label: 'Bolos Decorados' },
                  { value: 'bento', label: 'Bentô Cakes' },
                  { value: 'kits', label: 'Kits Festa' },
                  { value: 'doces', label: 'Doces & Brigadeiros' },
                  { value: 'salgados', label: 'Salgados Artesanais' },
                  { value: 'escola', label: 'Festa na Escola' },
                ]}
              />

              <Input
                label="Rendimento / Porções"
                value={editingSpecialty.serves}
                onChange={(e) => setEditingSpecialty({ ...editingSpecialty, serves: e.target.value })}
                placeholder="Ex: A partir de 15 fatias"
              />

              <Input
                label="Preço Inicial Exibido"
                value={editingSpecialty.startingPrice}
                onChange={(e) => setEditingSpecialty({ ...editingSpecialty, startingPrice: e.target.value })}
                placeholder="A partir de R$ 130"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Selo em Destaque (Badge)"
                value={editingSpecialty.badge}
                onChange={(e) => setEditingSpecialty({ ...editingSpecialty, badge: e.target.value })}
                placeholder="Mais Pedido"
              />

              <Input
                label="Tag SEO Local"
                value={editingSpecialty.seoTag}
                onChange={(e) => setEditingSpecialty({ ...editingSpecialty, seoTag: e.target.value })}
                placeholder="Bolos decorados sob encomenda"
              />
            </div>

            <Textarea
              label="Descrição Detalhada"
              rows={3}
              required
              value={editingSpecialty.description}
              onChange={(e) => setEditingSpecialty({ ...editingSpecialty, description: e.target.value })}
            />

            {/* Highlights List */}
            <div>
              <label className="text-xs font-bold text-[#3D1E26] uppercase tracking-wider block mb-2">
                Destaques em Tópicos (Checklist)
              </label>
              <div className="space-y-2 mb-3">
                {editingSpecialty.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#FFF8FA] p-2 rounded-xl border border-[#FAD0DE]">
                    <Check className="w-3.5 h-3.5 text-[#25D366]" />
                    <span className="text-xs text-[#3D1E26] flex-1">{h}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...editingSpecialty.highlights];
                        copy.splice(i, 1);
                        setEditingSpecialty({ ...editingSpecialty, highlights: copy });
                      }}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Novo tópico (ex: Massas amanteigadas fofinhas)"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!newHighlight.trim()) return;
                    setEditingSpecialty({
                      ...editingSpecialty,
                      highlights: [...editingSpecialty.highlights, newHighlight.trim()],
                    });
                    setNewHighlight('');
                  }}
                >
                  Adicionar
                </Button>
              </div>
            </div>

            <ImageUploader
              label="Foto da Especialidade"
              value={editingSpecialty.image}
              onChange={(url) => setEditingSpecialty({ ...editingSpecialty, image: url })}
            />

            <div className="flex items-center justify-between pt-4 border-t border-[#FEE7EF]">
              <Switch
                label="Ativo no Site"
                checked={editingSpecialty.active}
                onChange={(chk) => setEditingSpecialty({ ...editingSpecialty, active: chk })}
              />

              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={() => setEditingSpecialty(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Salvar Especialidade
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* CONFIRM DELETE */}
      {specialtyToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setSpecialtyToDelete(null)}
          onConfirm={confirmDelete}
          title="Excluir Especialidade"
          description={`Deseja excluir "${specialtyToDelete.title}"? O cartão não aparecerá mais no cardápio.`}
          confirmLabel="Excluir"
          isDestructive={true}
        />
      )}

    </div>
  );
};

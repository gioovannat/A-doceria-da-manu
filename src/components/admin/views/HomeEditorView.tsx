import React, { useState } from 'react';
import { AppDatabase, BenefitItem } from '../../../types';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Button } from '../../ui/Button';
import { Switch } from '../../ui/Switch';
import { ImageUploader } from '../../ui/ImageUploader';
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Image, Check, Heart, Cake } from 'lucide-react';
import { useToast } from '../../ui/Toast';

interface HomeEditorViewProps {
  data: AppDatabase;
  onChange: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

export const HomeEditorView: React.FC<HomeEditorViewProps> = ({ data, onChange }) => {
  const { home, benefits } = data;
  const { success } = useToast();

  const handleUpdateHome = (field: keyof typeof home, value: any) => {
    onChange((prev) => ({
      ...prev,
      home: {
        ...prev.home,
        [field]: value,
      },
    }));
  };

  const handleUpdateFeatured = (field: string, value: any) => {
    onChange((prev) => ({
      ...prev,
      home: {
        ...prev.home,
        featured_cake: {
          ...prev.home.featured_cake,
          [field]: value,
        },
      },
    }));
  };

  const handleUpdateStat = (index: number, field: 'number' | 'label', val: string) => {
    onChange((prev) => {
      const stats = [...prev.home.hero_stats];
      stats[index] = { ...stats[index], [field]: val };
      return {
        ...prev,
        home: {
          ...prev.home,
          hero_stats: stats,
        },
      };
    });
  };

  // Benefits handlers
  const handleAddBenefit = () => {
    const newBenefit: BenefitItem = {
      id: 'ben-' + Date.now(),
      icon: 'Sparkles',
      title: 'Novo Diferencial',
      description: 'Descrição do benefício oferecido aos clientes',
      sort_order: benefits.length + 1,
      active: true,
    };
    onChange((prev) => ({
      ...prev,
      benefits: [...prev.benefits, newBenefit],
    }));
    success('Diferencial adicionado!');
  };

  const handleUpdateBenefit = (id: string, field: keyof BenefitItem, val: any) => {
    onChange((prev) => ({
      ...prev,
      benefits: prev.benefits.map((b) => (b.id === id ? { ...b, [field]: val } : b)),
    }));
  };

  const handleRemoveBenefit = (id: string) => {
    onChange((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((b) => b.id !== id),
    }));
  };

  const handleMoveBenefit = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= benefits.length) return;
    onChange((prev) => {
      const copy = [...prev.benefits];
      const temp = copy[index];
      copy[index] = copy[newIdx];
      copy[newIdx] = temp;
      return {
        ...prev,
        benefits: copy.map((b, i) => ({ ...b, sort_order: i + 1 })),
      };
    });
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* 1. Logotipo Oficial */}
      <Card
        title="Logomarca Oficial"
        subtitle="A imagem que aparece no cabeçalho fixo e no rodapé do site."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <ImageUploader
            label="Imagem do Logo"
            value={home.logo_url}
            onChange={(url) => handleUpdateHome('logo_url', url)}
            aspectRatio="auto"
          />
          <div className="space-y-4">
            <Input
              label="Texto Alternativo (Alt)"
              value={home.logo_alt}
              onChange={(e) => handleUpdateHome('logo_alt', e.target.value)}
              helperText="Importante para acessibilidade e SEO do Google"
            />
            <div className="p-4 rounded-2xl bg-[#FFF5F8] border border-[#FAD0DE] text-xs text-[#7A505D] leading-relaxed">
              Dica: O logo recomendado é horizontal com fundo transparente ou branco para casar perfeitamente com a paleta do site.
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Seção Hero (Capa Principal) */}
      <Card
        title="Hero Principal (Capa do Site)"
        subtitle="O primeiro impacto visual que o visitante vê ao abrir a página."
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Pequeno Selo Superior (H1 / Eyebrow)"
              value={home.hero_top_badge}
              onChange={(e) => handleUpdateHome('hero_top_badge', e.target.value)}
              placeholder="A Doceria da Manu | Bolos Decorados e Doces Artesanais"
            />

            <div className="flex items-center pt-6">
              <Switch
                label="Ativar Animação Flutuante do Bolo"
                description="Efeito de respiração suave na foto de destaque da capa"
                checked={home.hero_animation_active}
                onChange={(chk) => handleUpdateHome('hero_animation_active', chk)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Título Principal (Início)"
              value={home.hero_title}
              onChange={(e) => handleUpdateHome('hero_title', e.target.value)}
              placeholder="Delicadeza, intenção e beleza nos detalhes"
            />

            <Input
              label="Trecho em Destaque Cursivo (Final do Slogan)"
              value={home.hero_highlight_text}
              onChange={(e) => handleUpdateHome('hero_highlight_text', e.target.value)}
              placeholder="seja qual for sua vibe."
              helperText="Este trecho recebe estilo itálico e a cor rosa nobre de assinatura."
            />
          </div>

          <Textarea
            label="Subtítulo / Parágrafo de Apresentação"
            rows={3}
            value={home.hero_subtitle}
            onChange={(e) => handleUpdateHome('hero_subtitle', e.target.value)}
            placeholder="Transformamos açúcar em arte para celebrar os momentos mais especiais da sua vida..."
          />

          {/* Botões de Ação do Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE]">
            <Input
              label="Texto do Botão WhatsApp (CTA)"
              value={home.hero_cta_text}
              onChange={(e) => handleUpdateHome('hero_cta_text', e.target.value)}
            />

            <Input
              label="Texto do Botão Secundário"
              value={home.hero_secondary_cta_text}
              onChange={(e) => handleUpdateHome('hero_secondary_cta_text', e.target.value)}
            />

            <Input
              label="Link do Botão Secundário"
              value={home.hero_secondary_cta_link}
              onChange={(e) => handleUpdateHome('hero_secondary_cta_link', e.target.value)}
              placeholder="#cardapio"
            />
          </div>

          {/* Imagem do Hero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader
              label="Foto Principal do Bolo da Capa"
              value={home.hero_main_image}
              onChange={(url) => handleUpdateHome('hero_main_image', url)}
              aspectRatio="square"
            />

            <div className="space-y-4">
              <label className="text-xs font-bold text-[#3D1E26] uppercase tracking-wider block">
                Números & Selos Rápidos do Hero
              </label>
              {home.hero_stats.map((stat, idx) => (
                <div key={stat.id || idx} className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Ex: 100%"
                    value={stat.number}
                    onChange={(e) => handleUpdateStat(idx, 'number', e.target.value)}
                  />
                  <Input
                    placeholder="Ex: Artesanal & Fresco"
                    value={stat.label}
                    onChange={(e) => handleUpdateStat(idx, 'label', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Faixa de Benefícios / Diferenciais */}
      <Card
        title="Faixa de Benefícios & Diferenciais"
        subtitle="Destaques artesanais exibidos logo abaixo da apresentação."
        headerAction={
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleAddBenefit}
          >
            Adicionar Benefício
          </Button>
        }
      >
        <div className="space-y-3">
          {benefits.map((ben, index) => (
            <div
              key={ben.id}
              className={`p-4 rounded-2xl border transition-all ${
                ben.active ? 'bg-white border-[#FAD0DE]' : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveBenefit(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-[#9E7381] hover:text-[#D81E5B] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveBenefit(index, 'down')}
                    disabled={index === benefits.length - 1}
                    className="p-1 text-[#9E7381] hover:text-[#D81E5B] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="sm:col-span-4">
                  <Input
                    value={ben.title}
                    onChange={(e) => handleUpdateBenefit(ben.id, 'title', e.target.value)}
                    placeholder="Título do Benefício"
                  />
                </div>

                <div className="sm:col-span-5">
                  <Input
                    value={ben.description || ''}
                    onChange={(e) => handleUpdateBenefit(ben.id, 'description', e.target.value)}
                    placeholder="Descrição breve"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-end gap-3">
                  <Switch
                    checked={ben.active}
                    onChange={(chk) => handleUpdateBenefit(ben.id, 'active', chk)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(ben.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Bolo Destaque da Semana */}
      <Card
        title="Destaque da Semana"
        subtitle="Bloco promocional de alta conversão para impulsionar pedidos do bolo mais procurado."
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#FEE7EF]">
            <div>
              <p className="text-xs font-bold text-[#3D1E26]">Exibir Destaque da Semana no Site?</p>
              <p className="text-[11px] text-[#7A505D]">Você pode desativar temporariamente quando a agenda desse item fechar.</p>
            </div>
            <Switch
              checked={home.featured_cake.active}
              onChange={(chk) => handleUpdateFeatured('active', chk)}
            />
          </div>

          {home.featured_cake.active && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <Input
                  label="Selo / Badge"
                  value={home.featured_cake.badge}
                  onChange={(e) => handleUpdateFeatured('badge', e.target.value)}
                  placeholder="Destaque da Semana"
                />

                <Input
                  label="Título do Bolo"
                  value={home.featured_cake.title}
                  onChange={(e) => handleUpdateFeatured('title', e.target.value)}
                  placeholder="Bolo Vintage Lambeth"
                />

                <Input
                  label="Preço em Destaque"
                  value={home.featured_cake.price_display}
                  onChange={(e) => handleUpdateFeatured('price_display', e.target.value)}
                  placeholder="A partir de R$ 145"
                />

                <Textarea
                  label="Descrição Sedutora"
                  rows={2}
                  value={home.featured_cake.description}
                  onChange={(e) => handleUpdateFeatured('description', e.target.value)}
                />

                <Input
                  label="Texto do Botão CTA"
                  value={home.featured_cake.cta_text}
                  onChange={(e) => handleUpdateFeatured('cta_text', e.target.value)}
                  placeholder="Quero este bolo"
                />
              </div>

              <div>
                <ImageUploader
                  label="Foto do Bolo em Destaque"
                  value={home.featured_cake.image}
                  onChange={(url) => handleUpdateFeatured('image', url)}
                  aspectRatio="square"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

    </div>
  );
};

import React from 'react';
import { AppDatabase, AtelierStatus } from '../../../types';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { 
  Cake, 
  Sparkles, 
  MessageCircle, 
  Clock, 
  Store, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { isSupabaseConfigured } from '../../../lib/supabase';

interface OverviewViewProps {
  data: AppDatabase;
  onUpdateSettings: (updater: (prev: AppDatabase) => AppDatabase) => void;
  onNavigateTab: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  data,
  onUpdateSettings,
  onNavigateTab,
}) => {
  const activeProducts = data.products.filter(p => p.active).length;
  const activeSpecialties = data.specialties.filter(s => s.active).length;
  const totalOrders = data.orders.length;
  const totalFlavors = data.products.reduce((acc, p) => acc + (p.flavors?.filter(f => f.active).length || 0), 0);

  const handleStatusChange = (status: AtelierStatus) => {
    onUpdateSettings((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        atelier_status: status,
      },
    }));
  };

  const statusDescriptions: Record<AtelierStatus, { label: string; badge: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple'; desc: string }> = {
    aberto: { label: 'Ateliê Aberto', badge: 'emerald', desc: 'Ateliê funcionando normalmente para encomendas e retiradas.' },
    fechado: { label: 'Ateliê Fechado', badge: 'rose', desc: 'Ateliê temporariamente fechado por recesso ou folga.' },
    somente_encomendas: { label: 'Somente Encomendas', badge: 'amber', desc: 'Sem pronta entrega. Aceitando apenas encomendas programadas.' },
    agenda_lotada: { label: 'Agenda Lotada', badge: 'purple', desc: 'Capacidade máxima atingida para o período.' },
    pronta_entrega: { label: 'Pronta Entrega Disponível', badge: 'blue', desc: 'Temos bentôs ou fatias disponíveis para retirada imediata!' },
  };

  const currentStatusInfo = statusDescriptions[data.settings.atelier_status] || statusDescriptions.aberto;

  return (
    <div className="space-y-8 text-left">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#FFF0F4] via-[#FFEBF1] to-[#FFF0F4] rounded-3xl p-6 sm:p-8 border border-[#FAD6E2] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[11px] font-bold text-[#D81E5B] border border-[#FAD0DE] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Painel de Controle Central</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3D1E26]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Olá, Manu! Seja bem-vinda ao seu Atelier Virtual
          </h1>
          <p className="text-xs sm:text-sm text-[#6B4651] mt-1.5 max-w-2xl leading-relaxed">
            Aqui você gerencia todo o cardápio, sabores, fotos, horários de atendimento e textos do site sem precisar alterar nenhuma linha de código.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Button
            variant="primary"
            size="md"
            icon={<Cake className="w-4 h-4" />}
            onClick={() => onNavigateTab('produtos')}
          >
            Novo Produto
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => onNavigateTab('inicio')}
          >
            Editar Início
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <Card className="hover:border-[#D81E5B] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7A505D]">Produtos Ativos</p>
              <h3 className="text-3xl font-bold text-[#3D1E26] mt-1" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                {activeProducts}
              </h3>
              <p className="text-[11px] text-[#8C5D6C] mt-1">no cardápio público</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] border border-[#FAD0DE] flex items-center justify-center text-[#D81E5B]">
              <Cake className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-[#D81E5B] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7A505D]">Especialidades</p>
              <h3 className="text-3xl font-bold text-[#3D1E26] mt-1" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                {activeSpecialties}
              </h3>
              <p className="text-[11px] text-[#8C5D6C] mt-1">categorias destacadas</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] border border-[#FAD0DE] flex items-center justify-center text-[#D81E5B]">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-[#D81E5B] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7A505D]">Sabores Cadastrados</p>
              <h3 className="text-3xl font-bold text-[#3D1E26] mt-1" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                {totalFlavors}
              </h3>
              <p className="text-[11px] text-[#8C5D6C] mt-1">opções de recheios</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] border border-[#FAD0DE] flex items-center justify-center text-[#D81E5B]">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-[#D81E5B] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7A505D]">Pedidos Simulados</p>
              <h3 className="text-3xl font-bold text-[#3D1E26] mt-1" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                {totalOrders}
              </h3>
              <p className="text-[11px] text-[#8C5D6C] mt-1">enviados via WhatsApp</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <MessageCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

      </div>

      {/* Atelier Status Fast Switcher */}
      <Card 
        title="Status do Ateliê em Tempo Real" 
        subtitle="Essa indicação aparece imediatamente no topo e no rodapé do site para todos os visitantes."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFF5F8] border border-[#FAD0DE]">
            <Store className="w-5 h-5 text-[#D81E5B] shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#3D1E26]">Status Atual:</span>
                <Badge variant={currentStatusInfo.badge}>{currentStatusInfo.label}</Badge>
              </div>
              <p className="text-xs text-[#7A505D] mt-0.5">{currentStatusInfo.desc}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
            {(Object.keys(statusDescriptions) as AtelierStatus[]).map((st) => {
              const info = statusDescriptions[st];
              const isSelected = data.settings.atelier_status === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-[#D81E5B] text-white border-[#D81E5B] shadow-sm'
                      : 'bg-white hover:bg-[#FFF0F4] text-[#6B4651] border-[#FAD0DE]'
                  }`}
                >
                  <span className="leading-tight">{info.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Quick Navigation Cards & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Module Shortcuts */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-bold text-[#3D1E26]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Acesso Rápido aos Módulos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <button
              onClick={() => onNavigateTab('inicio')}
              className="p-5 rounded-2xl bg-white border border-[#FAD0DE] hover:border-[#D81E5B] hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] border border-[#FAD0DE] flex items-center justify-center text-[#D81E5B] mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#3D1E26] group-hover:text-[#D81E5B] transition-colors">
                Editar Página Inicial
              </h4>
              <p className="text-xs text-[#7A505D] mt-1">
                Slogan, imagens da capa, selos, faixas e bolo destaque.
              </p>
            </button>

            <button
              onClick={() => onNavigateTab('produtos')}
              className="p-5 rounded-2xl bg-white border border-[#FAD0DE] hover:border-[#D81E5B] hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] border border-[#FAD0DE] flex items-center justify-center text-[#D81E5B] mb-3 group-hover:scale-105 transition-transform">
                <Cake className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#3D1E26] group-hover:text-[#D81E5B] transition-colors">
                Produtos & Cardápio
              </h4>
              <p className="text-xs text-[#7A505D] mt-1">
                Preços, variações, recheios, embalagens e adicionais.
              </p>
            </button>

            <button
              onClick={() => onNavigateTab('produtos')}
              className="p-5 rounded-2xl bg-white border border-[#FAD0DE] hover:border-[#D81E5B] hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] border border-[#FAD0DE] flex items-center justify-center text-[#D81E5B] mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#3D1E26] group-hover:text-[#D81E5B] transition-colors">
                Destaques do Cardápio
              </h4>
              <p className="text-xs text-[#7A505D] mt-1">
                Produtos em destaque, porções e fotos dos cartões.
              </p>
            </button>

            <button
              onClick={() => onNavigateTab('configuracoes')}
              className="p-5 rounded-2xl bg-white border border-[#FAD0DE] hover:border-[#D81E5B] hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] border border-[#FAD0DE] flex items-center justify-center text-[#D81E5B] mb-3 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#3D1E26] group-hover:text-[#D81E5B] transition-colors">
                WhatsApp, SEO & Loja
              </h4>
              <p className="text-xs text-[#7A505D] mt-1">
                Número do WhatsApp, endereço, redes e metatags do Google.
              </p>
            </button>

          </div>
        </div>

        {/* Right: Integration status & Recent simulator orders */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-bold text-[#3D1E26]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Conexão e Infraestrutura
          </h2>

          <Card>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#FEE7EF]">
                <span className="font-semibold text-[#6B4651]">Banco de Dados Supabase:</span>
                <Badge variant={isSupabaseConfigured ? 'emerald' : 'amber'}>
                  {isSupabaseConfigured ? 'Conectado' : 'Pronto p/ Conectar'}
                </Badge>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#FEE7EF]">
                <span className="font-semibold text-[#6B4651]">Sessão Administrativa:</span>
                <span className="font-bold text-[#3D1E26]">Autenticada (Admin)</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#FEE7EF]">
                <span className="font-semibold text-[#6B4651]">Última Publicação:</span>
                <span className="text-[#8C5D6C]">
                  {data.published_at ? new Date(data.published_at).toLocaleString('pt-BR') : 'Inicial'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FFF5F8] border border-[#FAD0DE] text-[11px] text-[#7A505D] leading-relaxed">
                💡 <strong className="text-[#3D1E26]">Dica do Atelier:</strong> Edite tudo à vontade. As alterações são salvas como rascunho e só vão para o ar quando você clicar em <strong>"Publicar no Site"</strong>.
              </div>
            </div>
          </Card>

          {/* Recent Orders peek */}
          <Card title="Últimos Pedidos Simulados" headerAction={
            <button
              onClick={() => onNavigateTab('pedidos')}
              className="text-xs font-bold text-[#D81E5B] hover:underline cursor-pointer"
            >
              Ver todos →
            </button>
          }>
            {data.orders.length === 0 ? (
              <p className="text-xs text-[#8C5D6C] text-center py-4">Nenhum pedido registrado ainda.</p>
            ) : (
              <div className="space-y-2.5">
                {data.orders.slice(0, 3).map((ord) => (
                  <div key={ord.id} className="p-3 rounded-xl bg-[#FFF9FB] border border-[#FAD0DE] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#3D1E26]">{ord.product_name}</p>
                      <p className="text-[11px] text-[#7A505D]">
                        {ord.customer_name || 'Cliente do Site'} · R$ {ord.estimated_total.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#8C5D6C]">
                      {new Date(ord.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>

      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Logo } from '../Logo';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { auth } from '../../lib/auth';
import { store } from '../../lib/store';
import { router } from '../../lib/router';
import { ADMIN_ROUTES } from '../../config/admin';
import { AppDatabase, UserProfile } from '../../types';
import { 
  LayoutDashboard, 
  Sparkles, 
  Cake, 
  Layers, 
  GraduationCap, 
  UserCheck, 
  Clock, 
  ShieldAlert, 
  HelpCircle, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Eye, 
  Save, 
  Send, 
  Store,
  Menu,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { OverviewView } from './views/OverviewView';
import { HomeEditorView } from './views/HomeEditorView';
import { ProductsView } from './views/ProductsView';
import { SpecialtiesView } from './views/SpecialtiesView';
import { CoursesView } from './views/CoursesView';
import { AboutView } from './views/AboutView';
import { HoursView } from './views/HoursView';
import { PoliciesView } from './views/PoliciesView';
import { FaqView } from './views/FaqView';
import { OrdersView } from './views/OrdersView';
import { SettingsView } from './views/SettingsView';
import { AdminPreviewModal } from './AdminPreviewModal';
import { useToast } from '../ui/Toast';

export const AdminLayout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(auth.getUser());
  const [draftData, setDraftData] = useState<AppDatabase>(store.getDraft());
  const [activeTab, setActiveTab] = useState<string>('visao-geral');
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { success, error, info } = useToast();

  useEffect(() => {
    const unsubAuth = auth.subscribe((u) => setCurrentUser(u));
    const unsubStore = store.subscribe(() => {
      setDraftData(store.getDraft());
    });
    return () => {
      unsubAuth();
      unsubStore();
    };
  }, []);

  // Update working state
  const handleUpdateDraft = (updater: (prev: AppDatabase) => AppDatabase) => {
    setDraftData((prev) => {
      const updated = updater(prev);
      setHasUnsavedEdits(true);
      return updated;
    });
  };

  // Save changes to draft
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    const ok = await store.saveDraft(() => draftData);
    setIsSavingDraft(false);
    if (ok) {
      setHasUnsavedEdits(false);
      success('Rascunho salvo com sucesso no banco de dados!');
    } else {
      error(store.getErrorMessage() || 'Erro ao salvar rascunho.');
    }
  };

  // Publish draft to public website
  const handlePublish = async () => {
    setIsPublishing(true);
    // Ensure draft is saved first
    await store.saveDraft(() => draftData);
    const ok = await store.publishDraft(currentUser?.name || 'Administrador');
    setIsPublishing(false);
    if (ok) {
      setHasUnsavedEdits(false);
      success('Alterações publicadas com sucesso! O site já está exibindo a nova versão.');
    } else {
      error(store.getErrorMessage() || 'Erro ao publicar no site.');
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    router.navigate(ADMIN_ROUTES.LOGIN);
  };

  const navItems = [
    { id: 'visao-geral', label: 'Visão Geral', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'inicio', label: 'Editar Início', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'produtos', label: 'Produtos & Cardápio', icon: <Cake className="w-4 h-4" /> },
    { id: 'especialidades', label: 'Especialidades', icon: <Layers className="w-4 h-4" /> },
    { id: 'cursos', label: 'Cursos & Gestão', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'sobre', label: 'Sobre a Manu', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'horarios', label: 'Horários & Retiradas', icon: <Clock className="w-4 h-4" /> },
    { id: 'politicas', label: 'Políticas & Avisos', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'duvidas', label: 'Dúvidas (FAQ)', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'pedidos', label: 'Pedidos WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'configuracoes', label: 'Configurações & SEO', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FFF5F8] text-[#3D262B] flex flex-col font-sans">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#FAD6E2] shadow-2xs h-16 px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left: Brand Wordmark & Menu Trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#7A505D] hover:text-[#D81E5B] rounded-xl hover:bg-[#FFF0F4] cursor-pointer"
            aria-label="Alternar Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="hidden sm:inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#B8134B] bg-[#FFF0F5] px-2 py-0.5 rounded-lg border border-[#FAD0DE]">
              Gestão
            </span>
          </div>
        </div>

        {/* Center: Unsaved edits / Publish status */}
        <div className="hidden md:flex items-center gap-3">
          {hasUnsavedEdits ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Alterações não salvas</span>
            </span>
          ) : store.hasPendingPublish() ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rascunho pronto para publicar</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Site 100% atualizado</span>
            </span>
          )}
        </div>

        {/* Right: Actions (Save Draft, Publish, Preview, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            size="sm"
            variant="outline"
            icon={<Eye className="w-4 h-4 text-[#D81E5B]" />}
            onClick={() => setShowPreviewModal(true)}
            title="Ver como o site fica nos dispositivos"
          >
            <span className="hidden sm:inline">Pré-visualizar</span>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            loading={isSavingDraft}
            icon={<Save className="w-4 h-4" />}
            onClick={handleSaveDraft}
            title="Salvar alterações no rascunho sem mudar o site"
          >
            <span className="hidden sm:inline">Salvar Rascunho</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            loading={isPublishing}
            icon={<Send className="w-4 h-4" />}
            onClick={handlePublish}
            title="Tornar as alterações visíveis no site público"
          >
            <span>Publicar</span>
          </Button>

          {/* User profile dropdown peek */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-[#FEE7EF]">
            <img
              src={currentUser?.avatar_url || '/chef-manu.jpg'}
              alt={currentUser?.name || 'Admin'}
              className="w-8 h-8 rounded-full object-cover border border-[#FAD0DE]"
            />
            <div className="text-left">
              <p className="text-xs font-bold text-[#3D1E26] leading-none">{currentUser?.name?.split(' ')[0]}</p>
              <Badge variant="purple" size="sm" className="mt-0.5">
                {currentUser?.role || 'admin'}
              </Badge>
            </div>
          </div>

          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2 text-[#7A505D] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            title="Encerrar Sessão"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* Main Panel Body with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white rounded-3xl border border-[#FAD6E2] shadow-xs p-3 shrink-0 h-fit sticky top-22">
          <div className="p-3 mb-2 flex items-center gap-3 bg-[#FFF5F8] rounded-2xl border border-[#FAD0DE]">
            <img
              src={currentUser?.avatar_url || '/chef-manu.jpg'}
              alt={currentUser?.name || 'Admin'}
              className="w-10 h-10 rounded-full object-cover border border-[#F8BFD2]"
            />
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-[#3D1E26] truncate">{currentUser?.name}</p>
              <p className="text-[11px] text-[#7A505D] truncate">{currentUser?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#D81E5B] text-white shadow-xs'
                      : 'text-[#6B4651] hover:text-[#D81E5B] hover:bg-[#FFF0F4]'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-[#9E7381]'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-white h-full shadow-2xl p-4 flex flex-col justify-between z-10 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#FEE7EF] mb-4">
                  <Logo size="sm" />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-[#7A505D] hover:text-[#D81E5B] rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                        activeTab === item.id
                          ? 'bg-[#D81E5B] text-white'
                          : 'text-[#6B4651] hover:bg-[#FFF0F4]'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-[#FEE7EF]">
                <Button
                  variant="ghost"
                  className="w-full text-red-600 justify-start"
                  icon={<LogOut className="w-4 h-4" />}
                  onClick={handleSignOut}
                >
                  Sair do Painel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0 pb-16 lg:pb-8">
          {activeTab === 'visao-geral' && (
            <OverviewView
              data={draftData}
              onUpdateSettings={handleUpdateDraft}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'inicio' && (
            <HomeEditorView data={draftData} onChange={handleUpdateDraft} />
          )}

          {activeTab === 'produtos' && (
            <ProductsView data={draftData} onChange={handleUpdateDraft} />
          )}

          {activeTab === 'especialidades' && (
            <SpecialtiesView data={draftData} onChange={handleUpdateDraft} />
          )}

          {activeTab === 'cursos' && (
            <CoursesView data={draftData} onChange={handleUpdateDraft} />
          )}

          {activeTab === 'sobre' && (
            <AboutView data={draftData} onChange={handleUpdateDraft} />
          )}

          {activeTab === 'horarios' && (
            <HoursView data={draftData} onChange={handleUpdateDraft} />
          )}

          {activeTab === 'politicas' && (
            <PoliciesView data={draftData} onChange={handleUpdateDraft} />
          )}

          {activeTab === 'duvidas' && (
            <FaqView data={draftData} onChange={handleUpdateDraft} />
          )}

          {activeTab === 'pedidos' && (
            <OrdersView data={draftData} onChange={handleUpdateDraft} />
          )}

          {activeTab === 'configuracoes' && (
            <SettingsView data={draftData} onChange={handleUpdateDraft} />
          )}
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar (Requirement 33) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#FAD6E2] py-2 px-3 flex items-center justify-around shadow-lg">
        {[
          { id: 'visao-geral', label: 'Início', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'produtos', label: 'Catálogo', icon: <Cake className="w-5 h-5" /> },
          { id: 'especialidades', label: 'Espec.', icon: <Layers className="w-5 h-5" /> },
          { id: 'pedidos', label: 'Pedidos', icon: <MessageSquare className="w-5 h-5" /> },
          { id: 'configuracoes', label: 'Ajustes', icon: <Settings className="w-5 h-5" /> },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold cursor-pointer transition-colors ${
              activeTab === item.id ? 'text-[#D81E5B]' : 'text-[#8C5D6C] hover:text-[#D81E5B]'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Live Preview Modal */}
      <AdminPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        draftData={draftData}
      />

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setShowExitConfirm(false)}
          onConfirm={handleSignOut}
          title="Encerrar Sessão?"
          description={
            hasUnsavedEdits
              ? 'Atenção: Existem alterações que ainda não foram salvas como rascunho. Deseja realmente sair e descartar as edições não salvas?'
              : 'Deseja sair da área administrativa da Doceria da Manu?'
          }
          confirmLabel="Sim, Sair"
          isDestructive={hasUnsavedEdits}
        />
      )}

    </div>
  );
};

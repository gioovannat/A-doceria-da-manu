import React, { useEffect, useState } from 'react';
import { AppDatabase, UserProfile } from '../../../types';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Button } from '../../ui/Button';
import { ImageUploader } from '../../ui/ImageUploader';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Store, Globe, Share2, Download, Upload, RotateCcw, CheckCircle2 } from 'lucide-react';
import { store } from '../../../lib/store';
import { auth } from '../../../lib/auth';
import { useToast } from '../../ui/Toast';

interface SettingsViewProps {
  data: AppDatabase;
  onChange: (updater: (prev: AppDatabase) => AppDatabase) => void;
  currentUser: UserProfile | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ data, onChange, currentUser }) => {
  const { settings } = data;
  const { success, error } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar_url || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setProfileName(currentUser?.name || '');
    setProfileAvatar(currentUser?.avatar_url || '');
  }, [currentUser]);

  const handleSaveProfile = async () => {
    const name = profileName.trim();
    if (!name) {
      error('Informe o nome do usuário.');
      return;
    }

    setIsSavingProfile(true);
    const result = await auth.updateCurrentProfile({ name, avatar_url: profileAvatar || null });
    setIsSavingProfile(false);
    if (result.success) success('Perfil atualizado com sucesso!');
    else error(result.error || 'Não foi possível atualizar o perfil.');
  };

  const handleUpdate = (field: keyof typeof settings, val: any) => {
    onChange((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: val,
      },
    }));
  };

  const handleUpdateSeo = (field: keyof typeof settings.seo, val: any) => {
    onChange((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        seo: {
          ...prev.settings.seo,
          [field]: val,
        },
      },
    }));
  };

  // Export database JSON
  const handleExportBackup = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `backup_doceria_manu_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    success('Backup exportado com sucesso!');
  };

  // Import database JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings && parsed.products) {
          onChange(() => parsed);
          success('Dados importados com sucesso!');
        } else {
          error('Arquivo inválido.');
        }
      } catch {
        error('Falha ao decodificar JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToFactory = () => {
    store.resetToFactory();
    success('Dados restaurados ao padrão original!');
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-8 text-left">
      <Card
        title="Perfil do Usuário"
        subtitle="Altere o nome e a foto exibidos no painel de gestão."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <Input
              label="Nome do Usuário"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Seu nome"
            />
            <Input
              label="E-mail da Conta"
              value={currentUser?.email || ''}
              disabled
              helperText="O e-mail de acesso não é alterado nesta seção."
            />
            <Button type="button" onClick={handleSaveProfile} loading={isSavingProfile}>
              Salvar Perfil
            </Button>
          </div>
          <ImageUploader
            label="Foto de Perfil"
            value={profileAvatar}
            onChange={setProfileAvatar}
            aspectRatio="square"
          />
        </div>
      </Card>
      
      {/* 1. Dados Comerciais & Atendimento */}
      <Card
        title="Dados da Confeitaria & Contatos"
        subtitle="Informações oficiais que aparecem no rodapé, cabeçalho e links de atendimento."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Razão Social / Nome da Empresa"
              value={settings.company_name}
              onChange={(e) => handleUpdate('company_name', e.target.value)}
            />

            <Input
              label="Nome Fantasia Curto"
              value={settings.short_name}
              onChange={(e) => handleUpdate('short_name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Número do WhatsApp (Com DDI e DDD)"
              value={settings.whatsapp_number}
              onChange={(e) => handleUpdate('whatsapp_number', e.target.value.replace(/\D/g, ''))}
              helperText="Ex: 5598991171456 (apenas dígitos)"
            />

            <Input
              label="Exibição Visual do Telefone"
              value={settings.whatsapp_display}
              onChange={(e) => handleUpdate('whatsapp_display', e.target.value)}
              placeholder="+55 98 9117-1456"
            />

            <Input
              label="E-mail de Contato"
              type="email"
              value={settings.email}
              onChange={(e) => handleUpdate('email', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Link Completo do Instagram"
              value={settings.instagram}
              onChange={(e) => handleUpdate('instagram', e.target.value)}
            />

            <Input
              label="Perfil do Instagram (Handle)"
              value={settings.instagram_handle}
              onChange={(e) => handleUpdate('instagram_handle', e.target.value)}
              placeholder="@adoceriadamanu"
            />
          </div>

          <Textarea
            label="Mensagem Padrão do WhatsApp"
            rows={2}
            value={settings.whatsapp_default_message}
            onChange={(e) => handleUpdate('whatsapp_default_message', e.target.value)}
            helperText="Texto que já vem pré-preenchido quando o cliente clica nos botões flutuantes ou de contato."
          />
        </div>
      </Card>

      {/* 2. Endereço e Localização */}
      <Card
        title="Localização & Atendimento Regional (SEO Local)"
        subtitle="Endereço físico do atelier e cidades atendidas para posicionamento no Google."
      >
        <div className="space-y-4">
          <Input
            label="Endereço Completo do Ateliê"
            value={settings.address}
            onChange={(e) => handleUpdate('address', e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Bairro"
              value={settings.neighborhood}
              onChange={(e) => handleUpdate('neighborhood', e.target.value)}
            />

            <Input
              label="Cidade"
              value={settings.city}
              onChange={(e) => handleUpdate('city', e.target.value)}
            />

            <Input
              label="Estado (UF)"
              value={settings.state}
              onChange={(e) => handleUpdate('state', e.target.value)}
            />
          </div>

          <Input
            label="Cidades e Regiões Atendidas (separadas por vírgula)"
            value={settings.area_served.join(', ')}
            onChange={(e) => {
              const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
              handleUpdate('area_served', list);
            }}
          />
        </div>
      </Card>

      {/* 3. SEO & Redes Sociais (Meta Tags & OpenGraph) */}
      <Card
        title="Otimização para Mecanismos de Busca (SEO & Google)"
        subtitle="Alimenta as meta tags, cards do WhatsApp e pré-visualização ao compartilhar links."
      >
        <div className="space-y-4">
          <Input
            label="Título da Página (SEO Title)"
            value={settings.seo.title}
            onChange={(e) => handleUpdateSeo('title', e.target.value)}
            helperText="Recomendado entre 50 e 60 caracteres."
          />

          <Textarea
            label="Descrição para o Google (Meta Description)"
            rows={3}
            value={settings.seo.description}
            onChange={(e) => handleUpdateSeo('description', e.target.value)}
            helperText="Recomendado entre 130 e 160 caracteres."
          />

          <Input
            label="Palavras-Chave (Keywords separadas por vírgula)"
            value={settings.seo.keywords.join(', ')}
            onChange={(e) => {
              const kw = e.target.value.split(',').map((k) => k.trim()).filter(Boolean);
              handleUpdateSeo('keywords', kw);
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-4">
              <Input
                label="Título para Compartilhamento (Open Graph)"
                value={settings.seo.og_title}
                onChange={(e) => handleUpdateSeo('og_title', e.target.value)}
              />

              <Textarea
                label="Descrição no WhatsApp/Facebook (Open Graph)"
                rows={2}
                value={settings.seo.og_description}
                onChange={(e) => handleUpdateSeo('og_description', e.target.value)}
              />

              <Input
                label="URL Canônica"
                value={settings.seo.canonical}
                onChange={(e) => handleUpdateSeo('canonical', e.target.value)}
              />
            </div>

            <div>
              <ImageUploader
                label="Imagem do Card Social (OG Image)"
                value={settings.seo.og_image}
                onChange={(url) => handleUpdateSeo('og_image', url)}
                aspectRatio="video"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Backup, Exportação e Restauração */}
      <Card
        title="Backup & Restauração de Dados"
        subtitle="Exporte todo o cardápio e configurações para guardar em segurança no seu computador."
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="button"
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportBackup}
          >
            Baixar Backup (JSON)
          </Button>

          <label className="inline-flex items-center justify-center font-semibold rounded-xl text-sm px-4 py-2.5 gap-2 bg-white hover:bg-[#FFF5F8] text-[#3D1E26] border border-[#E5CAD3] hover:border-[#D81E5B] cursor-pointer">
            <Upload className="w-4 h-4 text-[#D81E5B]" />
            <span>Restaurar Backup (JSON)</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportBackup}
            />
          </label>

          <Button
            type="button"
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={() => setShowResetConfirm(true)}
          >
            Restaurar Padrão de Fábrica
          </Button>
        </div>
      </Card>

      {showResetConfirm && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={handleResetToFactory}
          title="Restaurar Padrão de Fábrica?"
          description="Isso redefinirá todos os produtos, preços e textos para o modelo original do site. Certifique-se de salvar um backup se desejar manter os dados atuais."
          confirmLabel="Restaurar Tudo"
          isDestructive={true}
        />
      )}

    </div>
  );
};

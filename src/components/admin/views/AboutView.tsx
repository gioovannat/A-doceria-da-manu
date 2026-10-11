import React, { useState } from 'react';
import { AppDatabase } from '../../../types';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Button } from '../../ui/Button';
import { ImageUploader } from '../../ui/ImageUploader';
import { Plus, Trash2, CheckCircle2, Award, Heart } from 'lucide-react';
import { useToast } from '../../ui/Toast';

interface AboutViewProps {
  data: AppDatabase;
  onChange: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ data, onChange }) => {
  const { chef } = data;
  const { success } = useToast();
  const [newCheckpoint, setNewCheckpoint] = useState('');

  const handleUpdateChef = (field: keyof typeof chef, val: any) => {
    onChange((prev) => ({
      ...prev,
      chef: {
        ...prev.chef,
        [field]: val,
      },
    }));
  };

  const handleUpdateStoryParagraph = (index: number, val: string) => {
    onChange((prev) => {
      const copy = [...prev.chef.main_story];
      copy[index] = val;
      return {
        ...prev,
        chef: {
          ...prev.chef,
          main_story: copy,
        },
      };
    });
  };

  const handleAddStoryParagraph = () => {
    onChange((prev) => ({
      ...prev,
      chef: {
        ...prev.chef,
        main_story: [...prev.chef.main_story, 'Novo parágrafo de história...'],
      },
    }));
  };

  const handleRemoveStoryParagraph = (index: number) => {
    onChange((prev) => {
      const copy = [...prev.chef.main_story];
      copy.splice(index, 1);
      return {
        ...prev,
        chef: {
          ...prev.chef,
          main_story: copy,
        },
      };
    });
  };

  return (
    <div className="space-y-6 text-left">
      <Card
        title="Perfil & História da Confeiteira"
        subtitle="Construção de autoridade afetiva, credibilidade gastronômica e conexão com as clientes."
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                label="Nome Completo / Artístico"
                value={chef.name}
                onChange={(e) => handleUpdateChef('name', e.target.value)}
                placeholder="Emanuelly Santos (Manu)"
              />

              <Input
                label="Cargo / Título Profissional"
                value={chef.role}
                onChange={(e) => handleUpdateChef('role', e.target.value)}
                placeholder="Chef Pâtissière & Educadora"
              />

              <Input
                label="Experiência / Marca de Autoridade"
                value={chef.experience_years}
                onChange={(e) => handleUpdateChef('experience_years', e.target.value)}
                placeholder="+5 anos transformando festas"
              />

              <Input
                label="Região de Atendimento Local (SEO)"
                value={chef.coverage_region}
                onChange={(e) => handleUpdateChef('coverage_region', e.target.value)}
                placeholder="Atendendo com excelência toda a região de Paço do Lumiar e Grande São Luís."
              />
            </div>

            <div>
              <ImageUploader
                label="Foto Profissional da Manu"
                value={chef.photo}
                onChange={(url) => handleUpdateChef('photo', url)}
                aspectRatio="portrait"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#FEE7EF]">
            <Input
              label="Frase de Destaque / Lema de Assinatura"
              value={chef.highlight_quote}
              onChange={(e) => handleUpdateChef('highlight_quote', e.target.value)}
              placeholder="Açúcar, técnica e muito amor para transformar celebrações em memórias afetivas eternas."
            />
          </div>

          {/* Parágrafos da História */}
          <div className="pt-4 border-t border-[#FEE7EF] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#3D1E26]">Parágrafos da Biografia Afetiva</h4>
                <p className="text-xs text-[#7A505D]">Conte a história do atelier, o propósito com os doces e a escolha de ingredientes.</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddStoryParagraph}
              >
                Adicionar Parágrafo
              </Button>
            </div>

            <div className="space-y-3">
              {chef.main_story.map((para, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="flex-1">
                    <Textarea
                      rows={3}
                      value={para}
                      onChange={(e) => handleUpdateStoryParagraph(idx, e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStoryParagraph(idx)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer mt-1"
                    title="Remover parágrafo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Checkpoints de Conquistas */}
          <div className="pt-4 border-t border-[#FEE7EF] space-y-3">
            <h4 className="text-sm font-bold text-[#3D1E26]">Conquistas e Selos de Confiança (Checkpoints)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {chef.checkpoints.map((cp, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#FFF8FA] p-2.5 rounded-xl border border-[#FAD0DE]">
                  <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span className="text-xs text-[#3D1E26] flex-1">{cp}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = [...chef.checkpoints];
                      copy.splice(idx, 1);
                      handleUpdateChef('checkpoints', copy);
                    }}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Input
                placeholder="Nova conquista (ex: +2.000 clientes satisfeitos)"
                value={newCheckpoint}
                onChange={(e) => setNewCheckpoint(e.target.value)}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (!newCheckpoint.trim()) return;
                  handleUpdateChef('checkpoints', [...chef.checkpoints, newCheckpoint.trim()]);
                  setNewCheckpoint('');
                }}
              >
                Adicionar
              </Button>
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
};

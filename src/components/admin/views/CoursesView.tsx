import React, { useState } from 'react';
import { AppDatabase, Course } from '../../../types';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Button } from '../../ui/Button';
import { Switch } from '../../ui/Switch';
import { ImageUploader } from '../../ui/ImageUploader';
import { Modal } from '../../ui/Modal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Plus, Edit3, Trash2, ExternalLink, Check, FileSpreadsheet } from 'lucide-react';
import { useToast } from '../../ui/Toast';

interface CoursesViewProps {
  data: AppDatabase;
  onChange: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ data, onChange }) => {
  const { courses } = data;
  const { success } = useToast();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [newBenefit, setNewBenefit] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    onChange((prev) => {
      const exists = prev.courses.some((c) => c.id === editingCourse.id);
      const updated = exists
        ? prev.courses.map((c) => (c.id === editingCourse.id ? editingCourse : c))
        : [...prev.courses, editingCourse];
      return { ...prev, courses: updated };
    });

    success('Curso / Material salvo!');
    setEditingCourse(null);
  };

  const handleCreateNew = () => {
    const newCourse: Course = {
      id: 'course-' + Date.now(),
      title: 'Novo Curso ou Planilha',
      badge: 'Lançamento',
      image: data.courses[0]?.image || data.home.hero_main_image,
      description: 'Aprenda métodos práticos para acelerar sua confeitaria.',
      price: 'R$ 97,00',
      benefits: ['Acesso vitalício', 'Planilhas prontas para download', 'Suporte tiradúvidas'],
      platform: 'Hotmart / Eduzz / Kiwify',
      checkout_link: 'https://wa.me/5598991171456',
      active: true,
      sort_order: courses.length + 1,
    };
    setEditingCourse(newCourse);
  };

  const confirmDelete = () => {
    if (!courseToDelete) return;
    onChange((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.id !== courseToDelete.id),
    }));
    success('Material removido!');
    setCourseToDelete(null);
  };

  return (
    <div className="space-y-6 text-left">
      <Card
        title="Cursos, Planilhas & Educação Financeira"
        subtitle="Área dedicada à venda de conhecimento, mentorias, planilhas e cursos online da Manu."
        headerAction={
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateNew}
          >
            Adicionar Curso / Material
          </Button>
        }
      >
        <div className="space-y-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col lg:flex-row items-start gap-6 ${
                course.active ? 'bg-white border-[#FAD0DE] shadow-xs' : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="w-full lg:w-48 aspect-square rounded-2xl overflow-hidden bg-[#FFF2F6] border border-[#FAD0DE] shrink-0">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#B8134B] text-white font-bold uppercase">
                    {course.badge}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#FFF2E8] border border-[#FED5C2] text-[#B84E1A] font-semibold">
                    {course.platform}
                  </span>
                  <span className="text-xs font-bold text-[#25D366]">
                    {course.price}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#3D1E26]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                  {course.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#6B4651] leading-relaxed">
                  {course.description}
                </p>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8134B] block">
                    Benefícios Inclusos:
                  </span>
                  {course.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#5C3642]">
                      <Check className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#FEE7EF] flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={course.checkout_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#D81E5B] hover:underline font-semibold"
                  >
                    <span>Ver link de checkout / WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                      onClick={() => setEditingCourse({ ...course })}
                    >
                      Editar
                    </Button>
                    <button
                      type="button"
                      onClick={() => setCourseToDelete(course)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* MODAL: EDITAR CURSO */}
      {editingCourse && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCourse(null)}
          title="Editar Material Educativo"
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Título do Curso ou Planilha"
              required
              value={editingCourse.title}
              onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Selo em Destaque"
                value={editingCourse.badge}
                onChange={(e) => setEditingCourse({ ...editingCourse, badge: e.target.value })}
                placeholder="Planilha Pronta"
              />

              <Input
                label="Plataforma de Hospedagem"
                value={editingCourse.platform}
                onChange={(e) => setEditingCourse({ ...editingCourse, platform: e.target.value })}
                placeholder="Hotmart, Eduzz, Kiwify, Excel"
              />

              <Input
                label="Preço de Venda"
                value={editingCourse.price}
                onChange={(e) => setEditingCourse({ ...editingCourse, price: e.target.value })}
                placeholder="R$ 67,00 (Vitalício)"
              />
            </div>

            <Textarea
              label="Descrição Completa da Oferta"
              rows={3}
              value={editingCourse.description}
              onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
            />

            <Input
              label="Link de Checkout Direto (Hotmart / Eduzz / Kiwify / WhatsApp)"
              required
              value={editingCourse.checkout_link}
              onChange={(e) => setEditingCourse({ ...editingCourse, checkout_link: e.target.value })}
              placeholder="https://pay.hotmart.com/... ou link de WhatsApp"
            />

            {/* Benefits List */}
            <div>
              <label className="text-xs font-bold text-[#3D1E26] uppercase tracking-wider block mb-2">
                O que a aluna terá em mãos (Tópicos)
              </label>
              <div className="space-y-2 mb-3">
                {editingCourse.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#FFF8FA] p-2 rounded-xl border border-[#FAD0DE]">
                    <Check className="w-3.5 h-3.5 text-[#25D366]" />
                    <span className="text-xs text-[#3D1E26] flex-1">{b}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...editingCourse.benefits];
                        copy.splice(i, 1);
                        setEditingCourse({ ...editingCourse, benefits: copy });
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
                  placeholder="Novo benefício (ex: Simulador de margem de lucro)"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!newBenefit.trim()) return;
                    setEditingCourse({
                      ...editingCourse,
                      benefits: [...editingCourse.benefits, newBenefit.trim()],
                    });
                    setNewBenefit('');
                  }}
                >
                  Adicionar
                </Button>
              </div>
            </div>

            <ImageUploader
              label="Capa da Planilha / Curso"
              value={editingCourse.image}
              onChange={(url) => setEditingCourse({ ...editingCourse, image: url })}
            />

            <div className="flex items-center justify-between pt-4 border-t border-[#FEE7EF]">
              <Switch
                label="Material Ativo no Site"
                checked={editingCourse.active}
                onChange={(chk) => setEditingCourse({ ...editingCourse, active: chk })}
              />

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingCourse(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Salvar Material
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* CONFIRM DELETE */}
      {courseToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setCourseToDelete(null)}
          onConfirm={confirmDelete}
          title="Excluir Material"
          description={`Deseja excluir "${courseToDelete.title}"?`}
          confirmLabel="Excluir"
          isDestructive={true}
        />
      )}
    </div>
  );
};

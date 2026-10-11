import React, { useState } from 'react';
import { AppDatabase, FAQItem } from '../../../types';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Button } from '../../ui/Button';
import { Switch } from '../../ui/Switch';
import { Modal } from '../../ui/Modal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Plus, Edit3, Trash2, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import { useToast } from '../../ui/Toast';

interface FaqViewProps {
  data: AppDatabase;
  onChange: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

export const FaqView: React.FC<FaqViewProps> = ({ data, onChange }) => {
  const { faqs } = data;
  const { success } = useToast();
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FAQItem | null>(null);

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    onChange((prev) => {
      const exists = prev.faqs.some((f) => f.id === editingFaq.id);
      const updated = exists
        ? prev.faqs.map((f) => (f.id === editingFaq.id ? editingFaq : f))
        : [...prev.faqs, editingFaq];
      return { ...prev, faqs: updated };
    });

    success('Pergunta salva com sucesso!');
    setEditingFaq(null);
  };

  const handleCreateNew = () => {
    const newFaq: FAQItem = {
      id: 'faq-' + Date.now(),
      question: '',
      answer: '',
      sort_order: faqs.length + 1,
      active: true,
    };
    setEditingFaq(newFaq);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= faqs.length) return;
    onChange((prev) => {
      const copy = [...prev.faqs];
      const temp = copy[index];
      copy[index] = copy[newIdx];
      copy[newIdx] = temp;
      return {
        ...prev,
        faqs: copy.map((f, i) => ({ ...f, sort_order: i + 1 })),
      };
    });
  };

  const confirmDelete = () => {
    if (!faqToDelete) return;
    onChange((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== faqToDelete.id),
    }));
    success('Pergunta removida!');
    setFaqToDelete(null);
  };

  return (
    <div className="space-y-6 text-left">
      <Card
        title="Dúvidas Frequentes (FAQ Estruturado)"
        subtitle="Perguntas e respostas que ajudam os clientes e otimizam o SEO do Google através do Schema.org."
        headerAction={
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateNew}
          >
            Nova Pergunta
          </Button>
        }
      >
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                faq.active ? 'bg-white border-[#FAD0DE] shadow-2xs' : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="flex flex-col items-center pt-1">
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
                    disabled={index === faqs.length - 1}
                    className="p-1 text-[#9E7381] hover:text-[#D81E5B] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#3D1E26] mb-1">
                    {faq.question}
                  </h4>
                  <p className="text-xs text-[#6B4651] line-clamp-2 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                  onClick={() => setEditingFaq({ ...faq })}
                >
                  Editar
                </Button>
                <button
                  type="button"
                  onClick={() => setFaqToDelete(faq)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* MODAL EDIT FAQ */}
      {editingFaq && (
        <Modal
          isOpen={true}
          onClose={() => setEditingFaq(null)}
          title="Editar Pergunta Frequente"
          size="md"
        >
          <form onSubmit={handleSaveFaq} className="space-y-4">
            <Input
              label="Pergunta"
              required
              value={editingFaq.question}
              onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
              placeholder="Ex: Como funciona o pagamento?"
            />

            <Textarea
              label="Resposta Detalhada"
              rows={4}
              required
              value={editingFaq.answer}
              onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
              placeholder="Explique com carinho e clareza..."
            />

            <div className="flex items-center justify-between pt-3 border-t border-[#FEE7EF]">
              <Switch
                label="Ativa no Site"
                checked={editingFaq.active}
                onChange={(chk) => setEditingFaq({ ...editingFaq, active: chk })}
              />

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingFaq(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Salvar
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* CONFIRM DELETE */}
      {faqToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setFaqToDelete(null)}
          onConfirm={confirmDelete}
          title="Excluir Pergunta"
          description={`Deseja remover a pergunta "${faqToDelete.question}"?`}
          confirmLabel="Excluir"
          isDestructive={true}
        />
      )}
    </div>
  );
};

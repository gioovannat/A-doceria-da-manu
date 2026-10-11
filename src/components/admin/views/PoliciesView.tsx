import React, { useState } from 'react';
import { AppDatabase, CancellationRule } from '../../../types';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Button } from '../../ui/Button';
import { Plus, Trash2, Calendar, ShieldCheck, Car, AlertTriangle } from 'lucide-react';
import { useToast } from '../../ui/Toast';

interface PoliciesViewProps {
  data: AppDatabase;
  onChange: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({ data, onChange }) => {
  const { policies } = data;
  const { success } = useToast();
  const [newCareGuide, setNewCareGuide] = useState('');
  const [newTransportGuide, setNewTransportGuide] = useState('');

  const handleUpdateRule = (id: string, field: keyof CancellationRule, val: any) => {
    onChange((prev) => ({
      ...prev,
      policies: {
        ...prev.policies,
        cancellation_rules: prev.policies.cancellation_rules.map((r) =>
          r.id === id ? { ...r, [field]: val } : r
        ),
      },
    }));
  };

  const handleUpdatePolicyField = (field: keyof typeof policies, val: any) => {
    onChange((prev) => ({
      ...prev,
      policies: {
        ...prev.policies,
        [field]: val,
      },
    }));
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Política de Cancelamento */}
      <Card
        title="Política de Cancelamento & Reembolso"
        subtitle="Regras transparentes de devolução e retenção de sinal conforme o prazo prévio."
      >
        <div className="space-y-4">
          {policies.cancellation_rules.map((rule) => (
            <div
              key={rule.id}
              className="p-5 rounded-2xl bg-[#FFF8FA] border border-[#FAD0DE] space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Prazo de Antecedência"
                  value={rule.days_range}
                  onChange={(e) => handleUpdateRule(rule.id, 'days_range', e.target.value)}
                  placeholder="Ex: 8 dias ou mais"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Título da Regra"
                    value={rule.rule_title}
                    onChange={(e) => handleUpdateRule(rule.id, 'rule_title', e.target.value)}
                    placeholder="Cancelamento com 8 dias ou mais antes"
                  />
                </div>
              </div>

              <Textarea
                label="Condição e Devolução"
                rows={2}
                value={rule.description}
                onChange={(e) => handleUpdateRule(rule.id, 'description', e.target.value)}
                placeholder="100% dos valores devolvidos..."
              />
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Cuidados e Conservação dos Doces */}
      <Card
        title="Orientações de Conservação & Cuidados"
        subtitle="Recomendações de temperatura, refrigeração e consumo."
      >
        <div className="space-y-3">
          {policies.care_guidelines.map((guide, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <Textarea
                rows={2}
                value={guide}
                onChange={(e) => {
                  const copy = [...policies.care_guidelines];
                  copy[idx] = e.target.value;
                  handleUpdatePolicyField('care_guidelines', copy);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const copy = [...policies.care_guidelines];
                  copy.splice(idx, 1);
                  handleUpdatePolicyField('care_guidelines', copy);
                }}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer mt-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder="Nova orientação de conservação..."
              value={newCareGuide}
              onChange={(e) => setNewCareGuide(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (!newCareGuide.trim()) return;
                handleUpdatePolicyField('care_guidelines', [...policies.care_guidelines, newCareGuide.trim()]);
                setNewCareGuide('');
              }}
            >
              Adicionar
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Avisos sobre Transporte e Retirada */}
      <Card
        title="Instruções de Transporte & Retirada"
        subtitle="Orientações cruciais como 'Evite motos', 'Ar-condicionado ligado' e 'Superfície plana'."
      >
        <div className="space-y-3">
          {policies.transport_guidelines.map((guide, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <Textarea
                rows={2}
                value={guide}
                onChange={(e) => {
                  const copy = [...policies.transport_guidelines];
                  copy[idx] = e.target.value;
                  handleUpdatePolicyField('transport_guidelines', copy);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const copy = [...policies.transport_guidelines];
                  copy.splice(idx, 1);
                  handleUpdatePolicyField('transport_guidelines', copy);
                }}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer mt-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder="Nova instrução de transporte..."
              value={newTransportGuide}
              onChange={(e) => setNewTransportGuide(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (!newTransportGuide.trim()) return;
                handleUpdatePolicyField('transport_guidelines', [...policies.transport_guidelines, newTransportGuide.trim()]);
                setNewTransportGuide('');
              }}
            >
              Adicionar
            </Button>
          </div>
        </div>
      </Card>

      {/* 4. Termos de Pagamento */}
      <Card
        title="Termos de Pagamento & Reserva"
        subtitle="Pix, cartões de crédito e percentual de sinal para confirmação."
      >
        <Textarea
          rows={3}
          label="Texto Oficial de Pagamentos"
          value={policies.payment_terms}
          onChange={(e) => handleUpdatePolicyField('payment_terms', e.target.value)}
        />
      </Card>

    </div>
  );
};

import React, { useState } from 'react';
import { AppDatabase, BusinessHours, PickupWindow, AtelierStatus } from '../../../types';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Switch } from '../../ui/Switch';
import { Badge } from '../../ui/Badge';
import { Plus, Trash2, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../ui/Toast';

interface HoursViewProps {
  data: AppDatabase;
  onChange: (updater: (prev: AppDatabase) => AppDatabase) => void;
}

export const HoursView: React.FC<HoursViewProps> = ({ data, onChange }) => {
  const { business_hours, pickup_windows, settings } = data;
  const { success } = useToast();
  const [newWindowLabel, setNewWindowLabel] = useState('');
  const [newWindowRange, setNewWindowRange] = useState('');

  const handleUpdateHour = (weekday: string, field: keyof BusinessHours, val: any) => {
    onChange((prev) => ({
      ...prev,
      business_hours: prev.business_hours.map((bh) =>
        bh.weekday === weekday ? { ...bh, [field]: val } : bh
      ),
    }));
  };

  const handleAddPickupWindow = () => {
    if (!newWindowLabel || !newWindowRange) return;
    const newWin: PickupWindow = {
      id: 'win-' + Date.now(),
      label: newWindowLabel,
      time_range: newWindowRange,
      active: true,
    };
    onChange((prev) => ({
      ...prev,
      pickup_windows: [...prev.pickup_windows, newWin],
    }));
    setNewWindowLabel('');
    setNewWindowRange('');
    success('Janela de retirada adicionada!');
  };

  const handleRemovePickupWindow = (id: string) => {
    onChange((prev) => ({
      ...prev,
      pickup_windows: prev.pickup_windows.filter((w) => w.id !== id),
    }));
  };

  const handleStatusChange = (st: AtelierStatus) => {
    onChange((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        atelier_status: st,
      },
    }));
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Status do Ateliê */}
      <Card
        title="Status Operacional do Ateliê"
        subtitle="Controle se a loja está recebendo pedidos, com agenda lotada ou com pronta entrega ativa."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { id: 'aberto', label: 'Ateliê Aberto', badge: 'emerald' },
              { id: 'fechado', label: 'Ateliê Fechado', badge: 'rose' },
              { id: 'somente_encomendas', label: 'Somente Encomendas', badge: 'amber' },
              { id: 'agenda_lotada', label: 'Agenda Lotada', badge: 'purple' },
              { id: 'pronta_entrega', label: 'Pronta Entrega', badge: 'blue' },
            ].map((st) => {
              const isSelected = settings.atelier_status === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStatusChange(st.id as AtelierStatus)}
                  className={`p-4 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                    isSelected
                      ? 'bg-[#D81E5B] text-white border-[#D81E5B] shadow-sm'
                      : 'bg-white hover:bg-[#FFF0F4] text-[#6B4651] border-[#FAD0DE]'
                  }`}
                >
                  <span>{st.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>

          <Input
            label="Mensagem de Aviso Complementar (Opcional)"
            value={settings.status_custom_message}
            onChange={(e) => {
              const val = e.target.value;
              onChange((prev) => ({
                ...prev,
                settings: { ...prev.settings, status_custom_message: val },
              }));
            }}
            placeholder="Ex: Agenda de sábado fechada. Aceitando pedidos a partir de terça!"
          />
        </div>
      </Card>

      {/* 2. Horários de Atendimento */}
      <Card
        title="Horários de Atendimento da Semana"
        subtitle="Define os dias em que o atelier responde no WhatsApp e produz encomendas."
      >
        <div className="divide-y divide-[#FEE7EF]">
          {business_hours.map((bh) => (
            <div key={bh.weekday} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4 w-44">
                <Switch
                  checked={bh.is_open}
                  onChange={(chk) => handleUpdateHour(bh.weekday, 'is_open', chk)}
                />
                <span className={`text-xs sm:text-sm font-bold ${bh.is_open ? 'text-[#3D1E26]' : 'text-gray-400'}`}>
                  {bh.day_label}
                </span>
              </div>

              {bh.is_open ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#7A505D]">Abertura:</span>
                    <input
                      type="time"
                      value={bh.open_time}
                      onChange={(e) => handleUpdateHour(bh.weekday, 'open_time', e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-[#FAD0DE] text-xs font-semibold text-[#3D1E26] bg-white"
                    />
                  </div>
                  <span className="text-xs text-[#8C5D6C]">às</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#7A505D]">Fechamento:</span>
                    <input
                      type="time"
                      value={bh.close_time}
                      onChange={(e) => handleUpdateHour(bh.weekday, 'close_time', e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-[#FAD0DE] text-xs font-semibold text-[#3D1E26] bg-white"
                    />
                  </div>
                </div>
              ) : (
                <Badge variant="gray">Fechado ao público</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Janelas de Retirada */}
      <Card
        title="Janelas Programadas de Retirada no Ateliê"
        subtitle="Horários combinados para clientes ou motoristas de aplicativo retirarem os bolos no ateliê."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {pickup_windows.map((win) => (
              <div
                key={win.id}
                className="p-4 rounded-2xl bg-white border border-[#FAD0DE] flex items-center justify-between shadow-2xs"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#3D1E26]">{win.label}</h4>
                  <p className="text-xs text-[#D81E5B] font-semibold mt-0.5">{win.time_range}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePickupWindow(win.id)}
                  className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FAD0DE] flex flex-col sm:flex-row items-end gap-3 pt-4">
            <div className="w-full sm:w-1/3">
              <Input
                label="Identificação da Janela"
                placeholder="Ex: Turno Noturno"
                value={newWindowLabel}
                onChange={(e) => setNewWindowLabel(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-1/2">
              <Input
                label="Faixa de Horário"
                placeholder="Ex: 18:30 às 20:00"
                value={newWindowRange}
                onChange={(e) => setNewWindowRange(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddPickupWindow}
            >
              Adicionar
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
};

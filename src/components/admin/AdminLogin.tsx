import React, { useState } from 'react';
import { Logo } from '../Logo';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { auth } from '../../lib/auth';
import { router } from '../../lib/router';
import { ADMIN_ROUTES } from '../../config/admin';
import { Lock, Mail, KeyRound, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await auth.signIn(email, password);
      if (result.success) {
        router.navigate(ADMIN_ROUTES.DASHBOARD);
      } else {
        setError(result.error || 'Credenciais inválidas.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao efetuar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F4] via-[#FFF8FA] to-[#FCE6EE] flex items-center justify-center p-4">
      {/* Background aesthetic blur bubbles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FAD0DE]/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFE3EC]/60 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#FAD0DE] text-left">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="md" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F5] border border-[#FAD0DE] text-[11px] font-bold text-[#B8134B] uppercase tracking-wider mt-4">
            <Lock className="w-3.5 h-3.5" />
            <span>Gestão Interna do Atelier</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#3D1E26] mt-3" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Acesso Administrativo
          </h2>
          <p className="text-xs text-[#7A505D] mt-1 max-w-xs">
            Painel exclusivo para controle do cardápio, encomendas e conteúdo oficial.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4.5">
          <Input
            label="E-mail de Acesso"
            type="email"
            required
            placeholder="admin@adoceriadamanu.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Senha"
            type="password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<KeyRound className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            loading={loading}
          >
            Acessar Painel
          </Button>
        </form>

      </div>
    </div>
  );
};

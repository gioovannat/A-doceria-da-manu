# A Doceria da Manu — Confeitaria Artesanal & Painel Administrativo

Este repositório contém a aplicação web completa da **A Doceria da Manu**, integrando:
1. **Site Público de Alta Conversão:** Landing page gastronômica elegante, rápida e otimizada para SEO local em Paço do Lumiar e Grande São Luís.
2. **Painel Administrativo Privado:** Área de gestão isolada e protegida para controle completo do cardápio, produtos, sabores, preços, imagens, horários, políticas e orçamentos do WhatsApp, sem necessidade de editar código.

---

## 🔒 Arquitetura de Segurança & Separação de Rotas

- **Área Pública (`/`):** Acessível a todos os visitantes. **Não contém links, botões ou referências ao painel**.
- **Área Administrativa (Configurável via `VITE_ADMIN_BASE_PATH`):**
  - Rota padrão: `/atelier-gestao`
  - Login administrativo: `/atelier-gestao/acesso`
  - Rotas internas: `/atelier-gestao/produtos`, `/atelier-gestao/inicio`, etc.
  - **Proteção Real:** Redirecionamento e bloqueio server/client-side para usuários não autenticados.

---

## 🚀 Como Iniciar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/adoceria-da-manu.git
cd adoceria-da-manu
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

### 4. Executar em desenvolvimento
```bash
npm run dev
```
Acesse o site público em: `http://localhost:3000`  
Acesse o painel administrativo em: `http://localhost:3000/atelier-gestao`

---

## 🗄️ Integração com Supabase

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. Anote a **URL do Projeto** e a chave **anon public**.

### 2. Executar o Script SQL do Banco
1. No painel do Supabase, vá em **SQL Editor**.
2. Abra o arquivo localizado em `supabase/schema.sql` deste projeto.
3. Cole e execute o script. Ele criará:
   - Tabela `profiles` com controle de papéis (`admin`, `editor`).
   - Tabela `site_content` para separação de **Rascunho** e **Publicado**.
   - Tabelas de `products`, `specialties`, `flavors`, `packaging_options`, `addons`, `courses`, `business_hours`, `pickup_windows`, `faqs`, `order_events` e `publish_history`.
   - **Row Level Security (RLS)** ativado em todas as tabelas.

### 3. Criar o Primeiro Usuário Administrador
No Supabase:
1. Vá em **Authentication** > **Users** > **Add User** (ou crie via tela de login após conectar).
2. Cadastre o e-mail: `admin@adoceriadamanu.com.br` e defina uma senha forte.
3. No **SQL Editor**, vincule o papel de admin ao usuário criado:
```sql
INSERT INTO public.profiles (id, email, name, role)
SELECT id, email, 'Emanuelly Santos (Manu)', 'admin'
FROM auth.users
WHERE email = 'admin@adoceriadamanu.com.br'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

## 🌐 Deploy na Vercel

1. Envie o projeto para o GitHub:
```bash
git add .
git commit -m "feat: Painel administrativo completo da Doceria da Manu"
git push origin main
```
2. Na [Vercel](https://vercel.com), clique em **New Project** e importe o repositório.
3. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua chave pública anon
   - `VITE_ADMIN_BASE_PATH` = `/atelier-gestao` (ou o caminho privativo escolhido)
   - `NEXT_PUBLIC_SITE_URL` = `https://www.adoceriadamanu.com.br`
4. Clique em **Deploy**. O arquivo `vercel.json` já configurou os rewrites automáticos para rotas SPA.

---

## 📋 Funcionalidades do Painel

- **Rascunho vs Publicação:** Altere preços, textos e fotos salvando rascunhos com segurança. As mudanças só vão para o ar após clicar em **"Publicar no Site"**.
- **Pré-visualização Integrada:** Veja em tempo real a aparência no **Desktop**, **Tablet** e **Mobile** antes de publicar.
- **Gerenciador de Sabores & Adicionais:** Crie novos recheios, topos de bolo personalizados e embalagens de luxo.
- **Status do Ateliê em Tempo Real:** Alterne entre *Ateliê Aberto*, *Somente Encomendas*, *Agenda Lotada* e *Pronta Entrega*.
- **Gerador de Orçamentos para WhatsApp:** Calcule itens e envie mensagens profissionais formatadas instantaneamente.
- **Backup Completo:** Baixe ou restaure backups em JSON a qualquer momento.

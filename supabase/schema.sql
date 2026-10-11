-- ========================================================================
-- BANCO DE DADOS COMPLETO - A DOCERIA DA MANU
-- Supabase PostgreSQL Schema com Row Level Security (RLS) e Triggers
-- ========================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA: PROFILES (Perfis e Roles de Usuários Administrativos)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para atualizar profiles.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. TABELA: SITE_CONTENT (Documento mestre de Publicação e Rascunho)
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY CHECK (id IN ('published_main', 'draft_main')),
  content JSONB NOT NULL,
  published_at TIMESTAMPTZ,
  published_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA: SPECIALTIES (Especialidades e Cartões de Destaque)
CREATE TABLE IF NOT EXISTS public.specialties (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  mobile_image TEXT,
  serves TEXT,
  badge TEXT,
  seo_tag TEXT,
  starting_price TEXT NOT NULL,
  highlights TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA: PRODUCTS (Catálogo de Produtos)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT,
  category TEXT NOT NULL,
  main_image TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}',
  starting_price NUMERIC(10,2) NOT NULL,
  starting_price_display TEXT,
  unit TEXT DEFAULT 'unidade',
  minimum_notice TEXT DEFAULT '48h',
  badge TEXT,
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA: PRODUCT_VARIATIONS (Variações e Tamanhos de Produto)
CREATE TABLE IF NOT EXISTS public.product_variations (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  image TEXT,
  lead_time TEXT DEFAULT '48h',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA: FLAVORS (Sabores e Recheios)
CREATE TABLE IF NOT EXISTS public.flavors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  additional_price NUMERIC(10,2) DEFAULT 0.00,
  category TEXT DEFAULT 'Geral',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABELA: PACKAGING_OPTIONS (Embalagens)
CREATE TABLE IF NOT EXISTS public.packaging_options (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  additional_price NUMERIC(10,2) DEFAULT 0.00,
  image TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABELA: ADDONS (Adicionais e Opcionais)
CREATE TABLE IF NOT EXISTS public.addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  unit TEXT DEFAULT 'unidade',
  image TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABELA: COURSES (Cursos e Planilhas Educativas)
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  badge TEXT,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL,
  benefits TEXT[] DEFAULT '{}',
  platform TEXT NOT NULL,
  checkout_link TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABELA: BUSINESS_HOURS (Horários de Funcionamento)
CREATE TABLE IF NOT EXISTS public.business_hours (
  weekday TEXT PRIMARY KEY CHECK (weekday IN ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo')),
  day_label TEXT NOT NULL,
  is_open BOOLEAN DEFAULT TRUE,
  open_time TIME DEFAULT '09:00',
  close_time TIME DEFAULT '19:00'
);

-- 12. TABELA: PICKUP_WINDOWS (Janelas de Retirada)
CREATE TABLE IF NOT EXISTS public.pickup_windows (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  time_range TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- 13. TABELA: FAQS (Dúvidas Frequentes)
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. TABELA: PUBLISH_HISTORY (Auditoria de Publicações)
CREATE TABLE IF NOT EXISTS public.publish_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  published_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  summary TEXT
);

-- 15. TABELA: ORDER_EVENTS (Log de Pedidos e Orçamentos Simulados)
CREATE TABLE IF NOT EXISTS public.order_events (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  product_name TEXT NOT NULL,
  variation TEXT,
  quantity TEXT,
  flavors TEXT[] DEFAULT '{}',
  packaging TEXT,
  addons TEXT[] DEFAULT '{}',
  date TEXT,
  delivery_type TEXT,
  location TEXT,
  notes TEXT,
  estimated_total NUMERIC(10,2) DEFAULT 0.00,
  formatted_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) - SEGURANÇA POR PAPÉIS
-- ========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packaging_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publish_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para checar se o usuário atual é admin ou editor
CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Regras para PROFILES
CREATE POLICY "Usuários autenticados podem ver seu próprio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin_or_editor());

CREATE POLICY "Admins podem gerenciar perfis"
ON public.profiles FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Regras para SITE_CONTENT
-- Visitantes públicos só podem ler 'published_main'
CREATE POLICY "Público pode ler conteúdo publicado"
ON public.site_content FOR SELECT
USING (id = 'published_main');

-- Usuários administrativos podem ler e alterar tudo
CREATE POLICY "Admins podem gerenciar site_content"
ON public.site_content FOR ALL
USING (public.is_admin_or_editor());

-- 3. Regras para PRODUTOS, ESPECIALIDADES, ETC.
-- Público pode ver itens ativos
CREATE POLICY "Público lê produtos ativos"
ON public.products FOR SELECT
USING (active = TRUE);

CREATE POLICY "Admins gerenciam produtos"
ON public.products FOR ALL
USING (public.is_admin_or_editor());

-- Specialties
CREATE POLICY "Público lê especialidades ativas"
ON public.specialties FOR SELECT
USING (active = TRUE);

CREATE POLICY "Admins gerenciam especialidades"
ON public.specialties FOR ALL
USING (public.is_admin_or_editor());

-- Cursos
CREATE POLICY "Público lê cursos ativos"
ON public.courses FOR SELECT
USING (active = TRUE);

CREATE POLICY "Admins gerenciam cursos"
ON public.courses FOR ALL
USING (public.is_admin_or_editor());

-- Flavors, Packaging, Addons
CREATE POLICY "Público lê sabores ativos" ON public.flavors FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins gerenciam sabores" ON public.flavors FOR ALL USING (public.is_admin_or_editor());

CREATE POLICY "Público lê embalagens ativas" ON public.packaging_options FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins gerenciam embalagens" ON public.packaging_options FOR ALL USING (public.is_admin_or_editor());

CREATE POLICY "Público lê adicionais ativos" ON public.addons FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins gerenciam adicionais" ON public.addons FOR ALL USING (public.is_admin_or_editor());

-- Horários e FAQ
CREATE POLICY "Público lê horários" ON public.business_hours FOR SELECT USING (TRUE);
CREATE POLICY "Admins gerenciam horários" ON public.business_hours FOR ALL USING (public.is_admin_or_editor());

CREATE POLICY "Público lê faqs ativas" ON public.faqs FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins gerenciam faqs" ON public.faqs FOR ALL USING (public.is_admin_or_editor());

-- Pedidos (Order Events)
-- Qualquer visitante pode inserir registro de pedido simulado
CREATE POLICY "Visitantes podem registrar pedido"
ON public.order_events FOR INSERT
WITH CHECK (TRUE);

-- Somente admins podem listar ou ler pedidos
CREATE POLICY "Admins leem e gerenciam pedidos"
ON public.order_events FOR SELECT
USING (public.is_admin_or_editor());

# A Doceria da Manu

Site Vite/React com painel privado em `/atelier-gestao`, Supabase Auth, banco de conteúdo, Storage para imagens e atualização em tempo real. O layout visual original foi preservado.

## Segurança aplicada

- O frontend usa somente a chave **publishable/anon** do Supabase; a `SUPABASE_SERVICE_ROLE_KEY` existe apenas na Function da Vercel.
- Não há senha mestre, login local ou privilégio baseado em `user_metadata` no código.
- RLS restringe a área pública a `published_main`; perfis `admin` e `editor` controlam o conteúdo, e apenas `admin` administra perfis.
- Imagens são enviadas para o bucket `site-media`; os arquivos têm nomes UUID, tamanho máximo de 5 MB e tipos JPG/PNG/WebP.
- Publicações atualizam as páginas abertas via Supabase Realtime.
- `POST /api/orders` aceita somente JSON do mesmo site, valida e limita o corpo da requisição e aplica limite persistente de 5 pedidos por IP (HMAC do IP) a cada 10 minutos antes de gravar com a chave de servidor.
- Funções de autorização do banco ficam em um esquema interno; os RPCs públicos não podem chamar verificações de papel nem o limitador.
- Cabeçalhos de segurança, Content Security Policy e HTTPS estrito são enviados pela Vercel. O visitante recebe um aviso de consentimento para cookies e armazenamento local essenciais.

## Configuração do Supabase

1. Crie um projeto Supabase e, no SQL Editor, execute [a migração](supabase/migrations/20261011000000_secure_site_backend.sql).
2. Em Authentication → Users, crie a conta do administrador com uma senha forte.
3. No SQL Editor, atribua o perfil à conta criada (substitua o e-mail):

```sql
insert into public.profiles (id, email, name, role)
select id, email, 'Emanuelly Santos (Manu)', 'admin'
from auth.users
where email = 'admin@adoceriadamanu.com.br'
on conflict (id) do update set role = excluded.role, name = excluded.name;
```

4. Em Database → Replication/Pipelines, confirme que `site_content` está habilitada para Realtime. A migração tenta incluí-la automaticamente.
5. Copie `.env.example` para `.env.local`, preencha as variáveis e rode `npm install` seguido de `npm run dev`.

## Deploy Vercel

1. Envie o repositório ao GitHub sem arquivos `.env*` reais.
2. Importe-o na Vercel e configure `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_ADMIN_BASE_PATH`, `VITE_SITE_URL`, `SITE_URL`, `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
3. Habilite a proteção/rate limiting da Vercel para `/api/orders` como segunda camada contra abuso.

O Vercel constrói a SPA e atende a Function em `api/orders.ts`; `vercel.json` preserva os rewrites para as rotas do painel.

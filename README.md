# Anup PDV Cloud

SaaS multiempresa de PDV desenvolvido pela Anup Solutions para operação de vendas, delivery, estoque, financeiro, usuários, assinaturas e suporte.

## Stack

- React + TypeScript + Vite
- TailwindCSS + shadcn/ui
- Supabase Auth, Edge Functions, PostgreSQL e RLS
- Cloudinary para imagens
- GitHub Pages para deploy estático do frontend

## Rodar Localmente

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

3. Configure as variáveis:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key
```

4. Rode o app:

```bash
npm run dev
```

## Segurança das Chaves

Use no frontend somente a chave pública/publishable do Supabase:

```env
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Nunca coloque `service_role`, `sb_secret_*`, token de banco, senha do Postgres ou credencial Mercado Pago secreta em arquivos versionados, GitHub Pages ou código React. Chaves secretas devem ficar em Edge Functions, variáveis seguras do Supabase ou secrets do GitHub Actions quando usadas em ambiente backend.

## Criar as Tabelas no Supabase

O schema fica em `supabase/migrations/`. A ordem correta é a ordem cronológica dos arquivos:

1. `20260402201000_858a110c-8bf7-44e4-9dc1-2a9ddd15605e.sql`
2. `20260406153432_c4351578-4b9f-431a-a819-af48d49f5754.sql`
3. `20260406153727_12ecc4be-bbdf-4030-9e86-d4ae79794eb2.sql`
4. `20260508120000_anup_pdv_cloud_multi_tenant.sql`

### Opção A: Supabase Dashboard

1. Acesse o projeto no Supabase.
2. Entre em `SQL Editor`.
3. Abra cada arquivo de migration na ordem acima.
4. Cole o conteúdo no editor.
5. Execute e confirme que não houve erro antes de passar para o próximo arquivo.

Essa opção é a mais simples quando você ainda não configurou o Supabase CLI.

### Opção B: Supabase CLI

1. Instale e autentique o Supabase CLI.
2. Vincule este repositório ao projeto:

```bash
supabase link --project-ref SEU_PROJECT_REF
```

3. Aplique as migrations:

```bash
supabase db push
```

4. Gere novamente os tipos TypeScript, se necessário:

```bash
supabase gen types typescript --project-id SEU_PROJECT_REF > src/integrations/supabase/types.ts
```

## Estrutura Multiempresa

Toda tabela operacional deve possuir `company_id`. As principais estruturas são:

- `companies`: empresas/clientes do SaaS.
- `company_users` e `company_members`: vínculo de usuários com empresas.
- `employees`: operadores internos da empresa para seleção no PDV.
- `products`: produtos e estoque.
- `orders`, `order_items`, `order_payments`: vendas, itens e pagamentos.
- `cash_registers`, `cash_sessions`, `transactions`: caixa e movimentações.
- `customers`: clientes, cashback e fiado.
- `stock_movements`: entradas e saídas de estoque.
- `saas_subscriptions`, `saas_payments`: assinatura mensal do SaaS.
- `support_tickets`: chamados de suporte Anup.

As policies RLS isolam dados por empresa usando `company_id` e as funções:

- `can_access_company`
- `has_company_access`
- `has_company_admin_access`
- `is_anup_admin`

## Deploy no GitHub Pages

O deploy está configurado em:

```text
.github/workflows/deploy-pages.yml
```

Ao fazer push na branch `main`, o GitHub Actions:

1. Instala dependências.
2. Roda testes.
3. Faz build.
4. Publica `dist` na branch `gh-pages`.

URL pública:

```text
https://gjesus27.github.io/anup-pdv/
```

## Comandos Úteis

```bash
npm run dev
npm run build
npm test
npm run lint
```

## Responsabilidade Técnica

Este projeto é produto da Anup Solutions. A arquitetura, interface e documentação devem manter a identidade Anup PDV Cloud em todos os pontos públicos do repositório.

-- Anup PDV Cloud: multi-tenant SaaS foundation.
-- Every tenant-owned table includes company_id and RLS policies scoped by memberships.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.app_role as enum ('admin', 'manager', 'cashier', 'delivery_person');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'blocked', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade_name text,
  document text,
  logo_url text,
  primary_color text default '#1E3A8A',
  secondary_color text default '#10B981',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'cashier',
  permissions jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique(company_id, user_id)
);

create table if not exists public.saas_subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  status public.subscription_status not null default 'trialing',
  monthly_amount numeric(12,2) not null default 49.90,
  current_period_end date not null default (current_date + interval '30 days')::date,
  mercado_pago_customer_id text,
  mercado_pago_preapproval_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.saas_payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subscription_id uuid references public.saas_subscriptions(id) on delete set null,
  amount numeric(12,2) not null,
  method text not null,
  status text not null,
  mercado_pago_payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  category text,
  sku text,
  barcode text,
  image_url text,
  price numeric(12,2) not null default 0,
  cost_price numeric(12,2) not null default 0,
  stock_quantity numeric(12,3) not null default 0,
  min_stock_quantity numeric(12,3) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  cashback_balance numeric(12,2) not null default 0,
  credit_limit numeric(12,2) not null default 0,
  credit_balance numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  channel text not null default 'pos',
  status text not null default 'open',
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  quantity numeric(12,3) not null default 1,
  unit_price numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0
);

create table if not exists public.order_payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  method text not null,
  amount numeric(12,2) not null,
  change_amount numeric(12,2) not null default 0,
  status text not null default 'approved',
  created_at timestamptz not null default now()
);

create table if not exists public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  opened_by uuid references auth.users(id),
  closed_by uuid references auth.users(id),
  opening_amount numeric(12,2) not null default 0,
  closing_amount numeric(12,2),
  status text not null default 'open',
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  type text not null,
  quantity numeric(12,3) not null,
  reason text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  opened_by uuid references auth.users(id),
  subject text not null,
  description text,
  status text not null default 'open',
  priority text not null default 'normal',
  assigned_team text,
  created_at timestamptz not null default now()
);

create or replace function public.is_anup_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'anup_admin', false);
$$;

create or replace function public.has_company_access(target_company_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select public.is_anup_admin()
    or exists (
      select 1
      from public.company_members cm
      where cm.company_id = target_company_id
        and cm.user_id = auth.uid()
        and cm.status = 'active'
    );
$$;

create or replace function public.has_company_admin_access(target_company_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select public.is_anup_admin()
    or exists (
      select 1
      from public.company_members cm
      where cm.company_id = target_company_id
        and cm.user_id = auth.uid()
        and cm.role in ('admin', 'manager')
        and cm.status = 'active'
    );
$$;

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.saas_subscriptions enable row level security;
alter table public.saas_payments enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_payments enable row level security;
alter table public.cash_sessions enable row level security;
alter table public.stock_movements enable row level security;
alter table public.support_tickets enable row level security;

do $$ declare t text;
begin
  foreach t in array array[
    'saas_subscriptions','saas_payments','products','customers','orders',
    'order_items','order_payments','cash_sessions','stock_movements','support_tickets'
  ] loop
    execute format('drop policy if exists "%1$s tenant select" on public.%1$I', t);
    execute format('drop policy if exists "%1$s tenant insert" on public.%1$I', t);
    execute format('drop policy if exists "%1$s tenant update" on public.%1$I', t);
    execute format('drop policy if exists "%1$s tenant delete" on public.%1$I', t);
    execute format('create policy "%1$s tenant select" on public.%1$I for select using (public.has_company_access(company_id))', t);
    execute format('create policy "%1$s tenant insert" on public.%1$I for insert with check (public.has_company_access(company_id))', t);
    execute format('create policy "%1$s tenant update" on public.%1$I for update using (public.has_company_access(company_id)) with check (public.has_company_access(company_id))', t);
    execute format('create policy "%1$s tenant delete" on public.%1$I for delete using (public.has_company_admin_access(company_id))', t);
  end loop;
end $$;

drop policy if exists "companies visible by tenant" on public.companies;
create policy "companies visible by tenant" on public.companies
for select using (public.is_anup_admin() or public.has_company_access(id));

drop policy if exists "companies managed by anup" on public.companies;
create policy "companies managed by anup" on public.companies
for all using (public.is_anup_admin()) with check (public.is_anup_admin());

drop policy if exists "members visible by tenant admins" on public.company_members;
create policy "members visible by tenant admins" on public.company_members
for select using (public.has_company_access(company_id));

drop policy if exists "members managed by tenant admins" on public.company_members;
create policy "members managed by tenant admins" on public.company_members
for all using (public.has_company_admin_access(company_id)) with check (public.has_company_admin_access(company_id));

create index if not exists idx_company_members_company_user on public.company_members(company_id, user_id);
create index if not exists idx_products_company_category on public.products(company_id, category);
create index if not exists idx_orders_company_created_at on public.orders(company_id, created_at desc);
create index if not exists idx_order_items_company_order on public.order_items(company_id, order_id);
create index if not exists idx_order_payments_company_order on public.order_payments(company_id, order_id);
create index if not exists idx_customers_company_phone on public.customers(company_id, phone);
create index if not exists idx_stock_movements_company_product on public.stock_movements(company_id, product_id, created_at desc);
create index if not exists idx_support_tickets_company_status on public.support_tickets(company_id, status);

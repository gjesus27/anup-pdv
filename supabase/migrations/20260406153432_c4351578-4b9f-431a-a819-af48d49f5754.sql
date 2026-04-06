CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trade_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'cashier',
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON public.company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON public.company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_users_updated_at ON public.company_users;
CREATE TRIGGER update_company_users_updated_at
BEFORE UPDATE ON public.company_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.cash_registers ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.delivery_routes ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON public.orders(company_id);
CREATE INDEX IF NOT EXISTS idx_order_items_company_id ON public.order_items(company_id);
CREATE INDEX IF NOT EXISTS idx_cash_registers_company_id ON public.cash_registers(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON public.transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_delivery_routes_company_id ON public.delivery_routes(company_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_company_id ON public.accounts_payable(company_id);

CREATE OR REPLACE FUNCTION public.can_access_company(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_id IS NULL OR _company_id IS NULL THEN false
    WHEN public.has_role(_user_id, 'admin'::public.app_role) THEN true
    ELSE EXISTS (
      SELECT 1
      FROM public.company_users cu
      JOIN public.companies c ON c.id = cu.company_id
      WHERE cu.user_id = _user_id
        AND cu.company_id = _company_id
        AND cu.status = 'active'
        AND c.status = 'active'
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.can_access_company(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_company(UUID, UUID) TO authenticated;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or ANUP admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile or ANUP admins view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Users can view accessible companies" ON public.companies;
CREATE POLICY "Users can view accessible companies"
ON public.companies
FOR SELECT
TO authenticated
USING (public.can_access_company(auth.uid(), id));

DROP POLICY IF EXISTS "ANUP admins can manage companies" ON public.companies;
CREATE POLICY "ANUP admins can manage companies"
ON public.companies
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Users can view own company access" ON public.company_users;
CREATE POLICY "Users can view own company access"
ON public.company_users
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "ANUP admins can manage company access" ON public.company_users;
CREATE POLICY "ANUP admins can manage company access"
ON public.company_users
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Authenticated can view accounts payable" ON public.accounts_payable;
DROP POLICY IF EXISTS "Authenticated users can view company accounts payable" ON public.accounts_payable;
CREATE POLICY "Authenticated users can view company accounts payable"
ON public.accounts_payable
FOR SELECT
TO authenticated
USING (public.can_access_company(auth.uid(), company_id));

DROP POLICY IF EXISTS "Admins and managers can manage accounts payable" ON public.accounts_payable;
DROP POLICY IF EXISTS "Admins and managers can manage company accounts payable" ON public.accounts_payable;
CREATE POLICY "Admins and managers can manage company accounts payable"
ON public.accounts_payable
FOR ALL
TO authenticated
USING (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
  )
)
WITH CHECK (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Authenticated can view cash registers" ON public.cash_registers;
DROP POLICY IF EXISTS "Authenticated users can view company cash registers" ON public.cash_registers;
CREATE POLICY "Authenticated users can view company cash registers"
ON public.cash_registers
FOR SELECT
TO authenticated
USING (public.can_access_company(auth.uid(), company_id));

DROP POLICY IF EXISTS "Cashiers and above can manage cash registers" ON public.cash_registers;
DROP POLICY IF EXISTS "Cashiers and above can manage company cash registers" ON public.cash_registers;
CREATE POLICY "Cashiers and above can manage company cash registers"
ON public.cash_registers
FOR ALL
TO authenticated
USING (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'cashier'::public.app_role)
  )
)
WITH CHECK (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'cashier'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Authenticated can view delivery routes" ON public.delivery_routes;
DROP POLICY IF EXISTS "Authenticated users can view company delivery routes" ON public.delivery_routes;
CREATE POLICY "Authenticated users can view company delivery routes"
ON public.delivery_routes
FOR SELECT
TO authenticated
USING (public.can_access_company(auth.uid(), company_id));

DROP POLICY IF EXISTS "Delivery and above can manage routes" ON public.delivery_routes;
DROP POLICY IF EXISTS "Delivery and above can manage company routes" ON public.delivery_routes;
CREATE POLICY "Delivery and above can manage company routes"
ON public.delivery_routes
FOR ALL
TO authenticated
USING (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'delivery_person'::public.app_role)
  )
)
WITH CHECK (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'delivery_person'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Authenticated can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can view company order items" ON public.order_items;
CREATE POLICY "Authenticated users can view company order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (public.can_access_company(auth.uid(), company_id));

DROP POLICY IF EXISTS "Cashiers and above can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Cashiers and above can manage company order items" ON public.order_items;
CREATE POLICY "Cashiers and above can manage company order items"
ON public.order_items
FOR ALL
TO authenticated
USING (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'cashier'::public.app_role)
  )
)
WITH CHECK (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'cashier'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Authenticated can view orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view company orders" ON public.orders;
CREATE POLICY "Authenticated users can view company orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.can_access_company(auth.uid(), company_id));

DROP POLICY IF EXISTS "Cashiers and above can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Cashiers and above can manage company orders" ON public.orders;
CREATE POLICY "Cashiers and above can manage company orders"
ON public.orders
FOR ALL
TO authenticated
USING (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'cashier'::public.app_role)
  )
)
WITH CHECK (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'cashier'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Anyone authenticated can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view company products" ON public.products;
CREATE POLICY "Authenticated users can view company products"
ON public.products
FOR SELECT
TO authenticated
USING (public.can_access_company(auth.uid(), company_id));

DROP POLICY IF EXISTS "Admins and managers can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins and managers can manage company products" ON public.products;
CREATE POLICY "Admins and managers can manage company products"
ON public.products
FOR ALL
TO authenticated
USING (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
  )
)
WITH CHECK (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Authenticated can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can view company transactions" ON public.transactions;
CREATE POLICY "Authenticated users can view company transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (public.can_access_company(auth.uid(), company_id));

DROP POLICY IF EXISTS "Cashiers and above can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "Cashiers and above can manage company transactions" ON public.transactions;
CREATE POLICY "Cashiers and above can manage company transactions"
ON public.transactions
FOR ALL
TO authenticated
USING (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'cashier'::public.app_role)
  )
)
WITH CHECK (
  public.can_access_company(auth.uid(), company_id)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'cashier'::public.app_role)
  )
);
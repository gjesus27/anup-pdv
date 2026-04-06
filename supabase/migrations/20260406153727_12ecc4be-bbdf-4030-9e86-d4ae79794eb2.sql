-- Employees: no direct client access (password_hash protection)
-- All employee operations go through edge functions with service role
CREATE POLICY "No direct employee access"
ON public.employees
FOR SELECT
TO authenticated
USING (false);

CREATE POLICY "ANUP admins can manage employees"
ON public.employees
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
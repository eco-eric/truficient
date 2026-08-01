DROP POLICY IF EXISTS "Admins and managers manage suppliers" ON public.crm_suppliers;
DROP POLICY IF EXISTS "Authenticated users can view suppliers" ON public.crm_suppliers;
DROP POLICY IF EXISTS "crm_suppliers_select" ON public.crm_suppliers;
DROP POLICY IF EXISTS "crm_suppliers_insert" ON public.crm_suppliers;
DROP POLICY IF EXISTS "crm_suppliers_update" ON public.crm_suppliers;
DROP POLICY IF EXISTS "crm_suppliers_delete" ON public.crm_suppliers;

CREATE POLICY "crm_suppliers_select" ON public.crm_suppliers
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE POLICY "crm_suppliers_insert" ON public.crm_suppliers
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE POLICY "crm_suppliers_update" ON public.crm_suppliers
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE POLICY "crm_suppliers_delete" ON public.crm_suppliers
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));
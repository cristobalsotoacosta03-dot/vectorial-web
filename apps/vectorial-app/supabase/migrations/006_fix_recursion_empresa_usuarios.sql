-- ═══════════════════════════════════════════════════════════════════════════
--  VECTORIAL — Migración 006: corrige recursión infinita en RLS de
--  empresa_usuarios (bug real de 001_empresas_auth.sql, detectado probando
--  el flujo de onboarding: "infinite recursion detected in policy for
--  relation empresa_usuarios", Postgres 42P17).
--
--  Causa: la policy "admin_gestiona_membresias" consultaba empresa_usuarios
--  directamente dentro de su propia condición USING, lo que vuelve a
--  disparar RLS sobre empresa_usuarios (incluida esta misma policy) de
--  forma recursiva. 001 ya había creado my_admin_empresa_ids()
--  (SECURITY DEFINER, no sujeta a RLS) precisamente para evitar esto, pero
--  la policy no llegó a usarla. Aquí se corrige para que la use.
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "admin_gestiona_membresias" ON empresa_usuarios;

CREATE POLICY "admin_gestiona_membresias" ON empresa_usuarios FOR ALL
  USING (empresa_id IN (SELECT my_admin_empresa_ids()));

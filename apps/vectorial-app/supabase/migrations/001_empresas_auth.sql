-- ═══════════════════════════════════════════════════════════════════════════
--  VECTORIAL — Migración 001: Empresas + Auth + multi-tenant
--  Ejecuta en: Supabase Dashboard → SQL Editor → New Query
--  Requisito: ninguno (primera migración del esquema multi-tenant)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. TABLA EMPRESAS (el tenant) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS empresas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  cif         TEXT,
  plan        TEXT DEFAULT 'starter'
              CHECK (plan IN ('starter', 'professional', 'enterprise')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. TABLA PROFILES (espejo 1:1 de auth.users) ────────────────────────────
-- No se pueden añadir columnas directamente a auth.users, de ahí este espejo.
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      TEXT,
  email       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. TABLA EMPRESA_USUARIOS (membresía usuario ↔ empresa con rol) ────────
CREATE TABLE IF NOT EXISTS empresa_usuarios (
  empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol         TEXT NOT NULL DEFAULT 'member'
              CHECK (rol IN ('owner', 'admin', 'member')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (empresa_id, user_id)
);

-- ── 4. TRIGGER: crear profile automáticamente al hacer signup ─────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 5. FUNCIÓN HELPER PARA RLS (evita recursión al consultar empresa_usuarios
--      desde su propia policy) ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION my_empresa_ids()
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT empresa_id FROM empresa_usuarios WHERE user_id = auth.uid();
$$;

-- Variante para policies que necesitan distinguir rol (p.ej. gestionar
-- membresías solo si eres owner/admin de esa empresa). Se mantiene separada
-- de my_empresa_ids() para no filtrar por rol en el resto de tablas, donde
-- cualquier miembro (member/admin/owner) debe poder leer/escribir.
CREATE OR REPLACE FUNCTION my_admin_empresa_ids()
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT empresa_id FROM empresa_usuarios
  WHERE user_id = auth.uid() AND rol IN ('owner', 'admin');
$$;

-- ── 6. RPC: crear empresa + owner de forma atómica (onboarding) ───────────
-- No se puede crear la empresa en el trigger de signup porque en ese
-- momento aún no conocemos el nombre de la empresa (se pide en el
-- formulario de onboarding, un paso posterior al alta de auth.users).
CREATE OR REPLACE FUNCTION create_empresa_and_owner(nombre_empresa TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nueva_empresa_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para crear una empresa';
  END IF;

  INSERT INTO empresas (nombre) VALUES (nombre_empresa) RETURNING id INTO nueva_empresa_id;
  INSERT INTO empresa_usuarios (empresa_id, user_id, rol) VALUES (nueva_empresa_id, auth.uid(), 'owner');

  RETURN nueva_empresa_id;
END;
$$;

-- ── 7. RLS de las tablas de este bloque ─────────────────────────────────────
ALTER TABLE empresas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresa_usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ver_empresas_propias" ON empresas FOR SELECT
  USING (id IN (SELECT my_empresa_ids()));
CREATE POLICY "actualizar_empresas_propias" ON empresas FOR UPDATE
  USING (id IN (SELECT my_empresa_ids())) WITH CHECK (id IN (SELECT my_empresa_ids()));
-- No hay policy de INSERT directa: la creación de empresas pasa siempre por
-- create_empresa_and_owner() (SECURITY DEFINER), nunca por INSERT libre.

CREATE POLICY "ver_profile_propio" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "actualizar_profile_propio" ON profiles FOR UPDATE
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "ver_membresias_de_mis_empresas" ON empresa_usuarios FOR SELECT
  USING (empresa_id IN (SELECT my_empresa_ids()));
CREATE POLICY "admin_gestiona_membresias" ON empresa_usuarios FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM empresa_usuarios
      WHERE user_id = auth.uid() AND rol IN ('owner', 'admin')
    )
  );

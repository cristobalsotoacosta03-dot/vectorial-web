-- ═══════════════════════════════════════════════════════════════════════════
--  VECTORIAL — Migración 002: obras / presupuestos / materiales multi-tenant
--  Requisito: 001_empresas_auth.sql ejecutado.
--  Nota: escrita originalmente asumiendo que `obras` y `materiales` ya
--  existían en el proyecto Supabase de entonces (creadas por
--  SUPABASE_SETUP.sql). Al reejecutar contra un proyecto Supabase nuevo,
--  esas tablas no existen — por eso esta versión crea primero la base
--  (mismo esquema que SUPABASE_SETUP.sql, sin la policy de acceso público
--  ni los datos de ejemplo, que aquí no aplican) antes de añadir empresa_id.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 0. Función compartida para triggers *_updated_at ───────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ── 1. OBRAS: crear si no existe, añadir empresa_id ────────────────────────
CREATE TABLE IF NOT EXISTS obras (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT NOT NULL,
  cliente      TEXT,
  direccion    TEXT,
  estado       TEXT DEFAULT 'activa'
               CHECK (estado IN ('activa', 'pausada', 'finalizada')),
  fecha_inicio DATE,
  fecha_fin    DATE,
  descripcion  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS obras_updated_at ON obras;
CREATE TRIGGER obras_updated_at
  BEFORE UPDATE ON obras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE obras ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
ALTER TABLE obras ALTER COLUMN empresa_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_obras_empresa_id ON obras(empresa_id);

-- ── 2. PRESUPUESTOS (no existía aún: se crea ya con obra_id FK real) ───────
CREATE TABLE IF NOT EXISTS presupuestos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id   UUID NOT NULL REFERENCES empresas(id),
  obra_id      UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  numero       TEXT UNIQUE,
  fecha        DATE DEFAULT CURRENT_DATE,
  importe_base NUMERIC(12,2) NOT NULL,
  margen_pct   NUMERIC(5,2)  DEFAULT 18,
  estado       TEXT DEFAULT 'borrador'
               CHECK (estado IN ('borrador', 'enviado', 'aceptado', 'rechazado')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_presupuestos_empresa_id ON presupuestos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_obra_id    ON presupuestos(obra_id);

CREATE TRIGGER presupuestos_updated_at
  BEFORE UPDATE ON presupuestos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 3. MATERIALES: crear si no existe, añadir empresa_id ───────────────────
CREATE TABLE IF NOT EXISTS materiales (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         TEXT NOT NULL,
  categoria      TEXT,
  subcategoria   TEXT,
  unidad         TEXT,
  precio_ref     NUMERIC(10,2),
  normativa      TEXT,
  descripcion    TEXT,
  notas_tecnicas TEXT,
  tags           TEXT[],
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE materiales ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
ALTER TABLE materiales ALTER COLUMN empresa_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_materiales_empresa_id ON materiales(empresa_id);

-- ═══════════════════════════════════════════════════════════════════════════
--  VECTORIAL — Migración 002: obras / presupuestos / materiales multi-tenant
--  Requisito: 001_empresas_auth.sql ejecutado.
--  Nota: en el momento de escribir esto, `obras` y `materiales` ya existían
--  en producción (creadas por SUPABASE_SETUP.sql) pero vacías (0 filas), y
--  `presupuestos` no existía todavía — por eso aquí se crea ya con obra_id
--  como FK real desde el principio, sin necesidad de backfill de texto.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. OBRAS: añadir empresa_id (tabla ya existente, sin filas) ────────────
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

-- ── 3. MATERIALES: añadir empresa_id (tabla ya existente, sin filas) ───────
ALTER TABLE materiales ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
ALTER TABLE materiales ALTER COLUMN empresa_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_materiales_empresa_id ON materiales(empresa_id);

-- ═══════════════════════════════════════════════════════════════════════════
--  VECTORIAL — Migración 003: operarios + partidas_obra multi-tenant
--  Requisito: 001_empresas_auth.sql y 002_obras_presupuestos_materiales.sql
--  Sustituye a supabase/OPERARIOS_TABLE.sql y PARTIDAS_OBRA_TABLE.sql
--  legacy (que nunca se llegaron a ejecutar contra la base de datos real).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. OPERARIOS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS operarios (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id   UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre       TEXT NOT NULL,
  especialidad TEXT,
  categoria    TEXT DEFAULT 'oficial'
               CHECK (categoria IN ('oficial', 'peon', 'encargado', 'subcontrata')),
  telefono     TEXT,
  email        TEXT,
  tarifa_hora  NUMERIC(8,2),
  activo       BOOLEAN DEFAULT true,
  notas        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operarios_empresa_id ON operarios(empresa_id);

-- ── 2. PARTIDAS_OBRA ────────────────────────────────────────────────────────
-- Desglose de costes reales por obra (materiales + mano de obra).
-- Para mano de obra: cantidad = horas trabajadas, precio_unitario = tarifa/h.
CREATE TABLE IF NOT EXISTS partidas_obra (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  obra_id         UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  descripcion     TEXT NOT NULL,
  tipo            TEXT DEFAULT 'material'
                  CHECK (tipo IN ('material', 'mano_obra', 'subcontrata', 'otros')),
  unidad          TEXT DEFAULT 'ud',
  cantidad        NUMERIC(10,3) NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(10,2) NOT NULL DEFAULT 0,
  margen_pct      NUMERIC(5,2)  DEFAULT 0,
  operario_id     UUID REFERENCES operarios(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partidas_obra_empresa_id ON partidas_obra(empresa_id);
CREATE INDEX IF NOT EXISTS idx_partidas_obra_obra_id    ON partidas_obra(obra_id);
CREATE INDEX IF NOT EXISTS idx_partidas_obra_tipo       ON partidas_obra(tipo);

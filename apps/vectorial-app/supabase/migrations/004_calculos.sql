-- ═══════════════════════════════════════════════════════════════════════════
--  VECTORIAL — Migración 004: historial de cálculos (reemplaza useCalculos.js
--  localStorage-only por persistencia real ligada a empresa/obra/presupuesto)
--  Requisito: 001_empresas_auth.sql y 002_obras_presupuestos_materiales.sql
--  Nota: NO afecta a vectorial-web/calculationStore.js, que sigue siendo el
--  store local del sandbox público y anónimo — no requiere login.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS calculos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id     UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  obra_id        UUID REFERENCES obras(id) ON DELETE SET NULL,
  presupuesto_id UUID REFERENCES presupuestos(id) ON DELETE SET NULL,
  tipo           TEXT NOT NULL CHECK (tipo IN ('glp', 'tuberias', 'acs', 'conversor')),
  titulo         TEXT NOT NULL,
  campos         JSONB NOT NULL,
  nota           TEXT,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calculos_empresa_id ON calculos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_calculos_obra_id    ON calculos(obra_id);

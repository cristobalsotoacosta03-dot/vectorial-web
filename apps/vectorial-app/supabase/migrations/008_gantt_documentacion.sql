-- ═══════════════════════════════════════════════════════════════════════════
--  VECTORIAL — Migración 008: planificación Gantt y documentación de obra
--  (Fase 4.2 y 4.3 del roadmap — Gestión Avanzada)
--  Requisito: 001_empresas_auth.sql .. 007_proveedores_certificaciones.sql
--  ejecutadas.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. TAREAS_OBRA — planificación tipo Gantt ───────────────────────────────
CREATE TABLE IF NOT EXISTS tareas_obra (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id     UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  obra_id        UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  nombre         TEXT NOT NULL,
  fecha_inicio   DATE NOT NULL,
  fecha_fin      DATE NOT NULL CHECK (fecha_fin >= fecha_inicio),
  progreso_pct   NUMERIC(5,2) DEFAULT 0 CHECK (progreso_pct >= 0 AND progreso_pct <= 100),
  hito           BOOLEAN DEFAULT false,
  responsable    TEXT,
  dependencia_id UUID REFERENCES tareas_obra(id) ON DELETE SET NULL,
  orden          INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tareas_obra_empresa_id ON tareas_obra(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tareas_obra_obra_id    ON tareas_obra(obra_id);

-- ── 2. DOCUMENTOS_OBRA — memoria técnica / plan de calidad / est. seguridad ─
-- Un único registro por (obra, tipo): el contenido se guarda como borrador
-- editable en JSONB y se formatea a documento imprimible en el cliente.
CREATE TABLE IF NOT EXISTS documentos_obra (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  obra_id    UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  tipo       TEXT NOT NULL CHECK (tipo IN ('memoria', 'calidad', 'seguridad')),
  contenido  JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (obra_id, tipo)
);

CREATE INDEX IF NOT EXISTS idx_documentos_obra_empresa_id ON documentos_obra(empresa_id);
CREATE INDEX IF NOT EXISTS idx_documentos_obra_obra_id    ON documentos_obra(obra_id);

DROP TRIGGER IF EXISTS documentos_obra_updated_at ON documentos_obra;
CREATE TRIGGER documentos_obra_updated_at
  BEFORE UPDATE ON documentos_obra
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 3. RLS — mismo patrón que 005_rls_tablas_negocio.sql / 007 ─────────────
ALTER TABLE tareas_obra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miembros_gestionan_tareas_obra" ON tareas_obra FOR ALL
  USING (empresa_id IN (SELECT my_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT my_empresa_ids()));

ALTER TABLE documentos_obra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miembros_gestionan_documentos_obra" ON documentos_obra FOR ALL
  USING (empresa_id IN (SELECT my_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT my_empresa_ids()));

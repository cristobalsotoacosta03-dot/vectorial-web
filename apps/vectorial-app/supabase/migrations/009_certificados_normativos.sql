-- ═══════════════════════════════════════════════════════════════════════════
--  VECTORIAL — Migración 009: certificados normativos (OCA, industria,
--  municipal) por obra — distinto de certificaciones_obra (007), que es el
--  acta de avance/facturación. Aquí se registra el trámite administrativo:
--  quién lo emite, cuándo vence, y el enlace al documento.
--  Requisito: 001_empresas_auth.sql .. 008_gantt_documentacion.sql ejecutadas.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS certificados_normativos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id        UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  obra_id           UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  nombre            TEXT NOT NULL,
  tipo              TEXT NOT NULL DEFAULT 'oca'
                    CHECK (tipo IN ('oca', 'industria', 'municipal', 'otro')),
  fecha_solicitud   DATE,
  fecha_vencimiento DATE,
  documento_url     TEXT,
  estado            TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'en_tramite', 'aprobada', 'rechazada')),
  notas             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificados_normativos_empresa_id ON certificados_normativos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_certificados_normativos_obra_id    ON certificados_normativos(obra_id);

ALTER TABLE certificados_normativos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miembros_gestionan_certificados_normativos" ON certificados_normativos FOR ALL
  USING (empresa_id IN (SELECT my_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT my_empresa_ids()));

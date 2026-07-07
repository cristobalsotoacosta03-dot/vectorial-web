-- ═══════════════════════════════════════════════════════════════════════════
--  GestiObra — Tabla PARTIDAS_OBRA + Vista RENTABILIDAD
--  Ejecuta en: Supabase Dashboard → SQL Editor → New Query
--  Requisito previo: SUPABASE_SETUP.sql + OPERARIOS_TABLE.sql ejecutados
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. TABLA PARTIDAS_OBRA ────────────────────────────────────────────────
-- Desglose de costes reales por obra (materiales + mano de obra).
-- Para mano de obra: cantidad = horas trabajadas, precio_unitario = tarifa/h.
CREATE TABLE IF NOT EXISTS partidas_obra (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE partidas_obra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso publico partidas_obra"
  ON partidas_obra FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_partidas_obra_obra_id ON partidas_obra(obra_id);
CREATE INDEX IF NOT EXISTS idx_partidas_obra_tipo    ON partidas_obra(tipo);

-- ── 2. VISTA v_rentabilidad_obras ─────────────────────────────────────────
-- Query optimizada que calcula ingresos/costes/beneficio server-side.
-- ingresos = suma de presupuestos ACEPTADOS con margen aplicado.
-- costes   = suma de partidas_obra (cantidad × precio_unitario).
-- Join presupuestos→obras por obra_nombre (campo de texto actual).
CREATE OR REPLACE VIEW v_rentabilidad_obras AS
SELECT
  o.id,
  o.nombre,
  o.cliente,
  o.estado,
  o.fecha_inicio,
  o.fecha_fin,

  COALESCE(
    SUM(CASE WHEN p.estado = 'aceptado'
             THEN p.importe_base * (1 + p.margen_pct / 100.0) END
    ), 0
  )::NUMERIC(14,2) AS ingresos,

  COALESCE(
    SUM(pa.cantidad * pa.precio_unitario), 0
  )::NUMERIC(14,2) AS costes,

  (
    COALESCE(SUM(CASE WHEN p.estado = 'aceptado'
                      THEN p.importe_base * (1 + p.margen_pct / 100.0) END), 0) -
    COALESCE(SUM(pa.cantidad * pa.precio_unitario), 0)
  )::NUMERIC(14,2) AS beneficio,

  CASE
    WHEN COALESCE(SUM(CASE WHEN p.estado = 'aceptado'
                           THEN p.importe_base * (1 + p.margen_pct / 100.0) END), 0) = 0
    THEN NULL
    ELSE ROUND(
      (
        COALESCE(SUM(CASE WHEN p.estado = 'aceptado'
                          THEN p.importe_base * (1 + p.margen_pct / 100.0) END), 0) -
        COALESCE(SUM(pa.cantidad * pa.precio_unitario), 0)
      ) /
      COALESCE(SUM(CASE WHEN p.estado = 'aceptado'
                        THEN p.importe_base * (1 + p.margen_pct / 100.0) END), 0) * 100,
      2
    )
  END AS margen_pct,

  COUNT(DISTINCT pa.id)::INT AS num_partidas

FROM obras o
LEFT JOIN presupuestos  p  ON p.obra_nombre = o.nombre
LEFT JOIN partidas_obra pa ON pa.obra_id    = o.id
WHERE o.estado IN ('activa', 'finalizada')
GROUP BY o.id, o.nombre, o.cliente, o.estado, o.fecha_inicio, o.fecha_fin;

-- La vista es accesible vía REST igual que una tabla.
-- Supabase la expone en: /rest/v1/v_rentabilidad_obras

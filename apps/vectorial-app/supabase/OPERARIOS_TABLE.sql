-- ═══════════════════════════════════════════════════════════════════════════
--  GestiObra — Tabla OPERARIOS
--  Ejecuta esto en: Supabase Dashboard → SQL Editor → New Query
--  ANTES de esto asegúrate de haber ejecutado SUPABASE_SETUP.sql
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS operarios (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- RLS — acceso público (igual que el resto de tablas)
ALTER TABLE operarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso publico operarios" ON operarios FOR ALL USING (true) WITH CHECK (true);

-- Datos de ejemplo
INSERT INTO operarios (nombre, especialidad, categoria, telefono, tarifa_hora) VALUES
  ('Juan García López',   'Instalaciones de gas',   'oficial',   '612 345 678', 28.00),
  ('María Torres Ruiz',   'Climatización HVAC',     'oficial',   '623 456 789', 30.00),
  ('Carlos Martín Soto',  'Fontanería ACS',         'encargado', '634 567 890', 32.00),
  ('Ana Fernández Gil',   'Electricidad REBT',      'peon',      '645 678 901', 18.50),
  ('Pedro Romero Vega',   'Obra civil y soldadura', 'oficial',   '656 789 012', 26.00)
ON CONFLICT DO NOTHING;

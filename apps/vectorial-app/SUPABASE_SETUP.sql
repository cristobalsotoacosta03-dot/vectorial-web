-- ═══════════════════════════════════════════════════════════════════════════
--  GestiObra — Script de configuración Supabase
--  Pega este contenido en: Supabase Dashboard → SQL Editor → New Query
--  Ejecuta el script completo de una vez.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. TABLA OBRAS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS obras (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  cliente     TEXT,
  direccion   TEXT,
  estado      TEXT DEFAULT 'activa'
              CHECK (estado IN ('activa', 'pausada', 'finalizada')),
  fecha_inicio DATE,
  fecha_fin    DATE,
  descripcion  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. TABLA PRESUPUESTOS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS presupuestos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero       TEXT UNIQUE,
  obra_nombre  TEXT,
  fecha        DATE DEFAULT CURRENT_DATE,
  importe_base NUMERIC(12,2) NOT NULL,
  margen_pct   NUMERIC(5,2)  DEFAULT 18,
  estado       TEXT DEFAULT 'borrador'
               CHECK (estado IN ('borrador', 'enviado', 'aceptado', 'rechazado')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. TABLA MATERIALES (catálogo técnico en BD) ────────────────────────────
CREATE TABLE IF NOT EXISTS materiales (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  categoria     TEXT,
  subcategoria  TEXT,
  unidad        TEXT,
  precio_ref    NUMERIC(10,2),
  normativa     TEXT,
  descripcion   TEXT,
  notas_tecnicas TEXT,
  tags          TEXT[],
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. ROW LEVEL SECURITY ───────────────────────────────────────────────────
-- Para el prototipo, acceso público. En producción añade auth.uid().
ALTER TABLE obras         ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso publico obras"        ON obras        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso publico presupuestos" ON presupuestos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso publico materiales"   ON materiales   FOR ALL USING (true) WITH CHECK (true);

-- ── 5. TRIGGER updated_at en obras ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER obras_updated_at
  BEFORE UPDATE ON obras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 6. DATOS INICIALES (obras de ejemplo) ──────────────────────────────────
INSERT INTO obras (nombre, cliente, direccion, estado, fecha_inicio, fecha_fin, descripcion) VALUES
  ('Instalación HVAC — Edificio Omega',         'Inversiones Omega S.L.',  'C/ Gran Vía 45, Madrid',         'activa',    '2026-03-10', '2026-08-30', 'Instalación completa de sistema HVAC centralizado para edificio de oficinas de 8 plantas.'),
  ('Renovación fontanería — Hotel Mirasol',     'Hotel Mirasol S.A.',      'Av. del Mar 12, Barcelona',      'activa',    '2026-04-01', '2026-07-15', 'Sustitución completa de red ACS/AF en todas las plantas del hotel.'),
  ('Climatización — Nave Industrial Sector 7',  'LogiTrans Corp.',         'Polígono Norte, Nave 7, Zaragoza','pausada',   '2026-01-15', '2026-09-30', 'Climatización industrial con 4 unidades roof-top 40kW. Pausada por licencia municipal.'),
  ('Mantenimiento calderas — Las Torres',       'Comunidad Las Torres',    'C/ Roble 3, Valencia',           'finalizada','2025-11-01', '2026-02-28', 'Revisión y mantenimiento anual de sala de calderas según RITE.')
ON CONFLICT DO NOTHING;

-- ── 7. DATOS INICIALES (presupuestos de ejemplo) ───────────────────────────
INSERT INTO presupuestos (numero, obra_nombre, fecha, importe_base, margen_pct, estado) VALUES
  ('PRES-2026-001', 'Instalación HVAC — Edificio Omega',        '2026-03-05', 45000.00, 18, 'aceptado'),
  ('PRES-2026-002', 'Renovación fontanería — Hotel Mirasol',    '2026-03-20', 12500.00, 22, 'enviado'),
  ('PRES-2026-003', 'Climatización — Nave Industrial Sector 7', '2026-01-10', 78000.00, 15, 'borrador'),
  ('PRES-2026-004', 'Mantenimiento calderas — Las Torres',      '2025-10-20',  8200.00, 20, 'aceptado'),
  ('PRES-2026-005', 'Renovación fontanería — Hotel Mirasol',    '2026-04-15',  3800.00, 25, 'rechazado')
ON CONFLICT DO NOTHING;

-- ── FIN DEL SCRIPT ──────────────────────────────────────────────────────────
-- Tras ejecutar:
-- 1. Ve a Settings → API en Supabase y copia la URL y la anon key.
-- 2. Crea el archivo .env en la raíz de gestiobra (copia .env.example).
-- 3. Pega tus credenciales en .env.
-- 4. Descomenta el bloque en src/lib/supabase.js.
-- 5. Desde tu terminal Windows en la carpeta gestiobra:
--       npm install @supabase/supabase-js
-- 6. npm run dev — ¡ya tienes datos reales!

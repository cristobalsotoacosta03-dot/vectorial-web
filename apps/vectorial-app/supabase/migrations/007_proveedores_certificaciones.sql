-- ═══════════════════════════════════════════════════════════════════════════
--  VECTORIAL — Migración 007: proveedores, comparación de ofertas y
--  certificaciones de obra (Fase 4.1 del roadmap — Gestión Avanzada)
--  Requisito: 001_empresas_auth.sql .. 006_fix_recursion_empresa_usuarios.sql
--  ejecutadas.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. PROVEEDORES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proveedores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre     TEXT NOT NULL,
  cif        TEXT,
  contacto   TEXT,
  telefono   TEXT,
  email      TEXT,
  notas      TEXT,
  activo     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proveedores_empresa_id ON proveedores(empresa_id);

DROP TRIGGER IF EXISTS proveedores_updated_at ON proveedores;
CREATE TRIGGER proveedores_updated_at
  BEFORE UPDATE ON proveedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 2. PRECIOS_PROVEEDOR — comparación de ofertas por material ─────────────
-- Cada fila es el precio que un proveedor concreto ofrece para un material
-- en una fecha dada. El material se identifica por nombre libre (igual que
-- partidas_obra.descripcion) en vez de una FK a `materiales`, porque esa
-- tabla no tiene aún catálogo cargado ni UI que la alimente — el catálogo
-- técnico que usa la app (Catalogo.jsx) es estático en el bundle.
CREATE TABLE IF NOT EXISTS precios_proveedor (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id     UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  material_nombre TEXT NOT NULL,
  proveedor_id   UUID NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  precio         NUMERIC(10,2) NOT NULL,
  unidad         TEXT DEFAULT 'ud',
  fecha          DATE DEFAULT CURRENT_DATE,
  plazo_dias     INTEGER,
  notas          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_precios_proveedor_empresa_id   ON precios_proveedor(empresa_id);
CREATE INDEX IF NOT EXISTS idx_precios_proveedor_proveedor_id ON precios_proveedor(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_precios_proveedor_material     ON precios_proveedor(lower(material_nombre));

-- ── 3. CERTIFICACIONES_OBRA — avance de obra e importes certificados ───────
CREATE TABLE IF NOT EXISTS certificaciones_obra (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id          UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  obra_id             UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  numero              TEXT,
  fecha               DATE DEFAULT CURRENT_DATE,
  pct_avance          NUMERIC(5,2) NOT NULL CHECK (pct_avance >= 0 AND pct_avance <= 100),
  importe_certificado NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado              TEXT DEFAULT 'borrador'
                      CHECK (estado IN ('borrador', 'emitida', 'pagada')),
  notas               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificaciones_obra_empresa_id ON certificaciones_obra(empresa_id);
CREATE INDEX IF NOT EXISTS idx_certificaciones_obra_obra_id    ON certificaciones_obra(obra_id);

-- ── 4. RLS — mismo patrón que 005_rls_tablas_negocio.sql ───────────────────
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miembros_gestionan_proveedores" ON proveedores FOR ALL
  USING (empresa_id IN (SELECT my_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT my_empresa_ids()));

ALTER TABLE precios_proveedor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miembros_gestionan_precios_proveedor" ON precios_proveedor FOR ALL
  USING (empresa_id IN (SELECT my_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT my_empresa_ids()));

ALTER TABLE certificaciones_obra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miembros_gestionan_certificaciones_obra" ON certificaciones_obra FOR ALL
  USING (empresa_id IN (SELECT my_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT my_empresa_ids()));

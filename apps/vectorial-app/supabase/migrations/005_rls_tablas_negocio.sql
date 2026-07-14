-- ═══════════════════════════════════════════════════════════════════════════
--  VECTORIAL — Migración 005: RLS para las tablas de negocio multi-tenant
--  Requisito: 001_empresas_auth.sql, 002_obras_presupuestos_materiales.sql,
--  003_operarios_partidas_obra.sql y 004_calculos.sql ejecutadas.
--
--  Motivo: 002/003/004 crean obras/presupuestos/materiales/operarios/
--  partidas_obra/calculos con empresa_id NOT NULL pero nunca activan RLS
--  ni añaden policies. Sin esto, con la anon key cualquier usuario
--  autenticado (o incluso anónimo, según el grant) puede leer y escribir
--  las filas de CUALQUIER empresa — el aislamiento multi-tenant solo
--  existiría en el filtrado del cliente, no en la base de datos.
--
--  Regla de acceso: cualquier miembro de la empresa (member/admin/owner,
--  ver my_empresa_ids() en 001) puede leer y escribir los datos de negocio
--  de su empresa. No se distingue por rol en estas tablas — solo
--  empresa_usuarios y empresas restringen por rol.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── OBRAS ────────────────────────────────────────────────────────────────
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miembros_gestionan_obras" ON obras FOR ALL
  USING (empresa_id IN (SELECT my_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT my_empresa_ids()));

-- ── PRESUPUESTOS ─────────────────────────────────────────────────────────
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miembros_gestionan_presupuestos" ON presupuestos FOR ALL
  USING (empresa_id IN (SELECT my_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT my_empresa_ids()));

-- ── MATERIALES ───────────────────────────────────────────────────────────
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miembros_gestionan_materiales" ON materiales FOR ALL
  USING (empresa_id IN (SELECT my_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT my_empresa_ids()));

-- ── OPERARIOS ────────────────────────────────────────────────────────────
ALTER TABLE operarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miembros_gestionan_operarios" ON operarios FOR ALL
  USING (empresa_id IN (SELECT my_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT my_empresa_ids()));

-- ── PARTIDAS_OBRA ────────────────────────────────────────────────────────
ALTER TABLE partidas_obra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miembros_gestionan_partidas_obra" ON partidas_obra FOR ALL
  USING (empresa_id IN (SELECT my_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT my_empresa_ids()));

-- ── CALCULOS ─────────────────────────────────────────────────────────────
ALTER TABLE calculos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miembros_gestionan_calculos" ON calculos FOR ALL
  USING (empresa_id IN (SELECT my_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT my_empresa_ids()));

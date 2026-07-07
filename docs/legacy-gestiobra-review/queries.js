// Queries optimizadas de rentabilidad — usan la vista v_rentabilidad_obras
// definida en PARTIDAS_OBRA_TABLE.sql (server-side join + cálculo en Postgres).
import { supabase, conexionActiva } from './db-client'
import { rentabilidadObra } from '../utils/calculo-rentabilidad'
import { OBRAS_MOCK, PRESUPUESTOS_MOCK } from '../data/mocks'

// ── QUERY PRINCIPAL ───────────────────────────────────────────────────────────
/**
 * Resumen de rentabilidad de todas las obras activas y finalizadas.
 * En modo real → consulta la vista `v_rentabilidad_obras` (Postgres calcula todo).
 * En modo demo → calcula client-side con datos mock.
 *
 * @returns {Promise<{ data: Array, error: object|null }>}
 * data[i]: { id, nombre, cliente, estado, fecha_inicio, fecha_fin,
 *            ingresos, costes, beneficio, margen_pct, num_partidas,
 *            semaforo, rentable }
 */
export async function queryResumenRentabilidad() {
  if (!conexionActiva) return _resumenDesdeMock()

  const { data, error } = await supabase
    .from('v_rentabilidad_obras')
    .select('*')
    .order('estado')
    .order('nombre')

  if (error) {
    console.error('[queries] v_rentabilidad_obras:', error)
    return _resumenDesdeMock()
  }

  // La vista ya entrega ingresos/costes/beneficio/margen_pct calculados en Postgres.
  // Añadimos semaforo y rentable client-side (no requieren I/O).
  const { semaforoRentabilidad } = await import('../utils/calculo-rentabilidad.js')
  return {
    data: data.map(fila => ({
      ...fila,
      semaforo: semaforoRentabilidad(fila.margen_pct),
      rentable: fila.margen_pct !== null && fila.margen_pct > 0,
    })),
    error: null,
  }
}

// ── DESGLOSE DE UNA OBRA ──────────────────────────────────────────────────────
/**
 * Detalle completo de costes e ingresos de una obra concreta.
 * Útil para la vista de detalle de obra.
 *
 * @param {string} obraId — UUID de la obra
 * @returns {Promise<{ data: object, error: object|null }>}
 */
export async function queryDesgloseCostesObra(obraId) {
  if (!conexionActiva) return { data: null, error: { message: 'Modo demo: sin detalle por obra' } }

  const [
    { data: obra,         error: e1 },
    { data: presupuestos, error: e2 },
    { data: partidas,     error: e3 },
  ] = await Promise.all([
    supabase.from('obras').select('*').eq('id', obraId).single(),
    supabase.from('presupuestos').select('*').order('fecha', { ascending: false }),
    supabase.from('partidas_obra')
      .select('*, operarios(nombre, especialidad, tarifa_hora)')
      .eq('obra_id', obraId)
      .order('tipo')
      .order('created_at'),
  ])

  const error = e1 || e2 || e3
  if (error) return { data: null, error }

  const presupuestosObra = (presupuestos || []).filter(p => p.obra_nombre === obra?.nombre)
  const rentabilidad     = rentabilidadObra({ presupuestosObra, partidas: partidas || [] })

  return {
    data: { obra, presupuestosObra, partidas: partidas || [], rentabilidad },
    error: null,
  }
}

// ── PARTIDAS DE UNA OBRA ──────────────────────────────────────────────────────
/**
 * Lista de partidas de una obra (materiales + mano de obra).
 * Incluye datos del operario si la partida es de tipo mano_obra.
 *
 * @param {string} obraId
 */
export async function queryPartidasObra(obraId) {
  if (!conexionActiva) return { data: [], error: null }

  return supabase
    .from('partidas_obra')
    .select('*, operarios(id, nombre, especialidad, tarifa_hora)')
    .eq('obra_id', obraId)
    .order('tipo')
    .order('created_at')
}

// ── RANKING DE OBRAS POR RENTABILIDAD ─────────────────────────────────────────
/**
 * Top N obras por margen de beneficio (descendente).
 * Solo obras con presupuesto aceptado (margen_pct no nulo).
 *
 * @param {number} limite — número máximo de resultados (default 5)
 */
export async function queryTopObrasPorRentabilidad(limite = 5) {
  if (!conexionActiva) return { data: [], error: null }

  return supabase
    .from('v_rentabilidad_obras')
    .select('id, nombre, cliente, estado, ingresos, costes, beneficio, margen_pct')
    .not('margen_pct', 'is', null)
    .order('margen_pct', { ascending: false })
    .limit(limite)
}

// ── FALLBACK MOCK ─────────────────────────────────────────────────────────────
function _resumenDesdeMock() {
  const obras = OBRAS_MOCK.filter(o => o.estado === 'activa' || o.estado === 'finalizada')
  const data  = obras.map(obra => {
    const presupuestosObra = PRESUPUESTOS_MOCK.filter(p => p.obra_nombre === obra.nombre)
    const resultado        = rentabilidadObra({ presupuestosObra, partidas: [] })
    return { ...obra, ...resultado, num_partidas: 0 }
  })
  return { data, error: null }
}

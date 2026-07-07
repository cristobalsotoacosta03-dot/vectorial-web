// ── Módulo de cálculo de rentabilidad — funciones puras (sin I/O) ─────────────
// Todas las funciones reciben datos ya cargados y devuelven resultados numéricos.

/**
 * Suma coste total de una lista de partidas.
 * partida: { cantidad: number, precio_unitario: number }
 */
export function costeTotalPartidas(partidas = []) {
  return partidas.reduce(
    (sum, p) => sum + Number(p.cantidad) * Number(p.precio_unitario),
    0
  )
}

/**
 * Coste desglosado por tipo de partida.
 * Devuelve { material, mano_obra, subcontrata, otros }
 */
export function costesPorTipo(partidas = []) {
  return partidas.reduce(
    (acc, p) => {
      const tipo = p.tipo || 'material'
      acc[tipo] = (acc[tipo] || 0) + Number(p.cantidad) * Number(p.precio_unitario)
      return acc
    },
    { material: 0, mano_obra: 0, subcontrata: 0, otros: 0 }
  )
}

/**
 * Ingresos totales de una obra: suma de presupuestos ACEPTADOS con margen.
 * presupuesto: { estado: string, importe_base: number, margen_pct: number }
 */
export function ingresosTotalesObra(presupuestosObra = []) {
  return presupuestosObra
    .filter(p => p.estado === 'aceptado')
    .reduce(
      (sum, p) => sum + Number(p.importe_base) * (1 + Number(p.margen_pct) / 100),
      0
    )
}

/**
 * Margen de beneficio porcentual: (ingresos - costes) / ingresos × 100.
 * Devuelve null si no hay ingresos (evita división por cero).
 */
export function margenBeneficio(ingresos, costes) {
  if (!ingresos) return null
  return ((ingresos - costes) / ingresos) * 100
}

/**
 * Coste de mano de obra a partir de asignaciones de operarios.
 * asignacion: { horas: number, tarifa_hora: number }
 * Útil cuando los datos vienen de la tabla operarios (join externo).
 */
export function costeManoObraOperarios(asignaciones = []) {
  return asignaciones.reduce(
    (sum, a) => sum + Number(a.horas) * Number(a.tarifa_hora),
    0
  )
}

/**
 * Cálculo completo de rentabilidad de una obra.
 * @param {object} params
 * @param {Array}  params.presupuestosObra  — presupuestos de esta obra
 * @param {Array}  params.partidas          — partidas_obra de esta obra
 * @returns {{ ingresos, costes, desglose, beneficio, margen_pct, semaforo, rentable }}
 */
export function rentabilidadObra({ presupuestosObra = [], partidas = [] }) {
  const ingresos = ingresosTotalesObra(presupuestosObra)
  const desglose = costesPorTipo(partidas)
  const costes   = costeTotalPartidas(partidas)
  const beneficio = ingresos - costes
  const margen   = margenBeneficio(ingresos, costes)

  return {
    ingresos,
    costes,
    desglose,
    beneficio,
    margen_pct: margen !== null ? Number(margen.toFixed(2)) : null,
    semaforo:   semaforoRentabilidad(margen),
    rentable:   margen !== null && margen > 0,
  }
}

/**
 * Clasifica la rentabilidad por semáforo de color.
 * @returns {'optimo'|'aceptable'|'ajustado'|'perdida'|'sin_datos'}
 */
export function semaforoRentabilidad(margen_pct) {
  if (margen_pct === null || margen_pct === undefined) return 'sin_datos'
  if (margen_pct >= 20)  return 'optimo'     // verde  ≥ 20%
  if (margen_pct >= 10)  return 'aceptable'  // amarillo 10–19%
  if (margen_pct >= 0)   return 'ajustado'   // naranja  0–9%
  return 'perdida'                            // rojo < 0%
}

// Colores Tailwind por semáforo — usados en la UI de rentabilidad
export const SEMAFORO_CLASES = {
  optimo:    { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Óptimo'    },
  aceptable: { bg: 'bg-yellow-100',  text: 'text-yellow-700',  label: 'Aceptable' },
  ajustado:  { bg: 'bg-orange-100',  text: 'text-orange-700',  label: 'Ajustado'  },
  perdida:   { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Pérdida'   },
  sin_datos: { bg: 'bg-slate-100',   text: 'text-slate-500',   label: 'Sin datos' },
}

/**
 * Formatea un importe en euros (ES-es).
 */
export function formatEuros(valor) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(valor ?? 0)
}

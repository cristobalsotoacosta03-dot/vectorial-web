import { describe, it, expect } from 'vitest'
import {
  costeTotalPartidas,
  costesPorTipo,
  ingresosTotalesObra,
  margenBeneficio,
  costeManoObraOperarios,
  rentabilidadObra,
  semaforoRentabilidad,
} from './calculo-rentabilidad.js'

// ── Fixtures ──────────────────────────────────────────────────────────────────
const PARTIDAS_HVAC = [
  { tipo: 'material',  descripcion: 'Tubería Cu Ø22', cantidad: 50,  precio_unitario: 8.40  }, // 420
  { tipo: 'material',  descripcion: 'Codo 90° Cu',    cantidad: 20,  precio_unitario: 1.80  }, // 36
  { tipo: 'mano_obra', descripcion: 'Oficial gas',    cantidad: 24,  precio_unitario: 28.00 }, // 672
  { tipo: 'mano_obra', descripcion: 'Peón',           cantidad: 12,  precio_unitario: 18.50 }, // 222
]
// Total: 1350

const PRESUPUESTOS_HVAC = [
  { estado: 'aceptado', importe_base: 45000, margen_pct: 18 }, // 53100
  { estado: 'borrador', importe_base:  5000, margen_pct: 20 }, // excluido
  { estado: 'aceptado', importe_base:  8000, margen_pct: 15 }, // 9200
]
// Ingresos: 62300

// ── costeTotalPartidas ────────────────────────────────────────────────────────
describe('costeTotalPartidas', () => {
  it('suma cantidad × precio_unitario de todas las partidas', () => {
    expect(costeTotalPartidas(PARTIDAS_HVAC)).toBeCloseTo(1350, 2)
  })

  it('devuelve 0 con lista vacía', () => {
    expect(costeTotalPartidas([])).toBe(0)
  })

  it('convierte strings a número correctamente', () => {
    const partidas = [{ cantidad: '3', precio_unitario: '10.5' }]
    expect(costeTotalPartidas(partidas)).toBeCloseTo(31.5, 2)
  })
})

// ── costesPorTipo ─────────────────────────────────────────────────────────────
describe('costesPorTipo', () => {
  it('separa materiales y mano de obra', () => {
    const { material, mano_obra } = costesPorTipo(PARTIDAS_HVAC)
    expect(material).toBeCloseTo(456, 2)    // 420 + 36
    expect(mano_obra).toBeCloseTo(894, 2)   // 672 + 222
  })

  it('devuelve todos los tipos en 0 con lista vacía', () => {
    const desglose = costesPorTipo([])
    expect(desglose.material).toBe(0)
    expect(desglose.mano_obra).toBe(0)
    expect(desglose.subcontrata).toBe(0)
    expect(desglose.otros).toBe(0)
  })
})

// ── ingresosTotalesObra ───────────────────────────────────────────────────────
describe('ingresosTotalesObra', () => {
  it('suma solo presupuestos aceptados con margen', () => {
    // 45000×1.18 + 8000×1.15 = 53100 + 9200 = 62300
    expect(ingresosTotalesObra(PRESUPUESTOS_HVAC)).toBeCloseTo(62300, 2)
  })

  it('excluye estados distintos de aceptado', () => {
    const soloRechazados = [{ estado: 'rechazado', importe_base: 10000, margen_pct: 20 }]
    expect(ingresosTotalesObra(soloRechazados)).toBe(0)
  })

  it('devuelve 0 con lista vacía', () => {
    expect(ingresosTotalesObra([])).toBe(0)
  })
})

// ── margenBeneficio ───────────────────────────────────────────────────────────
describe('margenBeneficio', () => {
  it('calcula (ingresos - costes) / ingresos × 100', () => {
    // (62300 - 1350) / 62300 × 100 ≈ 97.83%
    expect(margenBeneficio(62300, 1350)).toBeCloseTo(97.83, 1)
  })

  it('devuelve null cuando ingresos es 0 (sin datos)', () => {
    expect(margenBeneficio(0, 500)).toBeNull()
  })

  it('devuelve null cuando ingresos es undefined', () => {
    expect(margenBeneficio(undefined, 100)).toBeNull()
  })

  it('devuelve negativo cuando costes > ingresos (pérdida)', () => {
    expect(margenBeneficio(1000, 1500)).toBeCloseTo(-50, 1)
  })
})

// ── costeManoObraOperarios ────────────────────────────────────────────────────
describe('costeManoObraOperarios', () => {
  it('suma horas × tarifa_hora', () => {
    const asignaciones = [
      { horas: 8, tarifa_hora: 28.00 },  // 224
      { horas: 4, tarifa_hora: 18.50 },  // 74
    ]
    expect(costeManoObraOperarios(asignaciones)).toBeCloseTo(298, 2)
  })

  it('devuelve 0 con lista vacía', () => {
    expect(costeManoObraOperarios([])).toBe(0)
  })
})

// ── rentabilidadObra ──────────────────────────────────────────────────────────
describe('rentabilidadObra', () => {
  it('calcula el resultado completo de una obra con datos reales', () => {
    const resultado = rentabilidadObra({
      presupuestosObra: PRESUPUESTOS_HVAC,
      partidas: PARTIDAS_HVAC,
    })
    expect(resultado.ingresos).toBeCloseTo(62300, 2)
    expect(resultado.costes).toBeCloseTo(1350, 2)
    expect(resultado.beneficio).toBeCloseTo(60950, 2)
    expect(resultado.margen_pct).toBeCloseTo(97.83, 1)
    expect(resultado.rentable).toBe(true)
    expect(resultado.semaforo).toBe('optimo')
  })

  it('marca como sin_datos cuando no hay presupuestos aceptados', () => {
    const resultado = rentabilidadObra({
      presupuestosObra: [{ estado: 'borrador', importe_base: 5000, margen_pct: 18 }],
      partidas: PARTIDAS_HVAC,
    })
    expect(resultado.ingresos).toBe(0)
    expect(resultado.margen_pct).toBeNull()
    expect(resultado.semaforo).toBe('sin_datos')
    expect(resultado.rentable).toBe(false)
  })

  it('funciona con arrays vacíos (obra sin datos)', () => {
    const resultado = rentabilidadObra({ presupuestosObra: [], partidas: [] })
    expect(resultado.ingresos).toBe(0)
    expect(resultado.costes).toBe(0)
    expect(resultado.beneficio).toBe(0)
    expect(resultado.margen_pct).toBeNull()
  })
})

// ── semaforoRentabilidad ──────────────────────────────────────────────────────
describe('semaforoRentabilidad', () => {
  it('optimo para margen >= 20%', () => {
    expect(semaforoRentabilidad(20)).toBe('optimo')
    expect(semaforoRentabilidad(35)).toBe('optimo')
  })
  it('aceptable para 10% <= margen < 20%', () => {
    expect(semaforoRentabilidad(10)).toBe('aceptable')
    expect(semaforoRentabilidad(19.9)).toBe('aceptable')
  })
  it('ajustado para 0% <= margen < 10%', () => {
    expect(semaforoRentabilidad(0)).toBe('ajustado')
    expect(semaforoRentabilidad(9.9)).toBe('ajustado')
  })
  it('perdida para margen < 0%', () => {
    expect(semaforoRentabilidad(-1)).toBe('perdida')
    expect(semaforoRentabilidad(-50)).toBe('perdida')
  })
  it('sin_datos cuando margen es null o undefined', () => {
    expect(semaforoRentabilidad(null)).toBe('sin_datos')
    expect(semaforoRentabilidad(undefined)).toBe('sin_datos')
  })
})

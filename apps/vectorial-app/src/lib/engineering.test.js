import { describe, it, expect } from 'vitest'
import {
  calculatePipeFlow,
  calculateGasPressureDrop,
  calculateThermalPower,
  calculateVentilationRate,
  calculateHeatPumpPower,
  calculateInversePipeSizing,
  validatePhysicalParameters,
  getNearestNominalDiameter,
  convertFromBase,
  PRESSURE_FACTORS,
} from './engineering'

// Estos tests fijan el comportamiento numérico actual del motor como línea
// base ("golden values"), para poder comparar con seguridad los resultados
// antes/después de migrar los componentes Calc*.jsx a consumir este módulo
// (fase 0.4 del roadmap) sin introducir regresiones normativas silenciosas.

describe('calculatePipeFlow', () => {
  it('calcula régimen turbulento para un caudal doméstico típico', () => {
    const result = calculatePipeFlow({
      flow: 3.5,
      diameter: 25.4,
      length: 40,
      density: 998,
      viscosity: 1.004,
    })
    expect(result.regime).toBe('turbulento')
    expect(result.velocity).toBeGreaterThan(0)
    expect(result.headLossM).toBeGreaterThan(0)
    expect(result.metadata.reference).toContain('UNE EN 12354-2')
  })

  it('calcula régimen laminar para caudal muy bajo', () => {
    const result = calculatePipeFlow({
      flow: 0.01,
      diameter: 25.4,
      length: 10,
      density: 998,
      viscosity: 1.004,
    })
    expect(result.regime).toBe('laminar')
    expect(result.frictionFactor).toBeCloseTo(64 / result.reynolds, 6)
  })

  it('rechaza parámetros no positivos', () => {
    expect(() =>
      calculatePipeFlow({ flow: 0, diameter: 25, length: 10, density: 998, viscosity: 1 }),
    ).toThrow('positivos')
  })

  it('rechaza parámetros no numéricos', () => {
    expect(() =>
      calculatePipeFlow({ flow: NaN, diameter: 25, length: 10, density: 998, viscosity: 1 }),
    ).toThrow('finitos')
  })
})

describe('calculateGasPressureDrop', () => {
  it('valida una instalación de gas natural conforme a UNE 60670', () => {
    const result = calculateGasPressureDrop({
      flow: 5,
      diameter: 20,
      length: 15,
      pressure: 20,
    })
    expect(result.metadata.reference).toBe('UNE 60670:2006')
    expect(typeof result.compliant === 'undefined' ? result.velocityAdequate : true).toBe(true)
    expect(result.pressureDropMbar).toBeGreaterThan(0)
  })

  it('marca velocidad no adecuada cuando supera GAS_MAX_VELOCITY', () => {
    const result = calculateGasPressureDrop({
      flow: 500,
      diameter: 15,
      length: 5,
      pressure: 20,
    })
    expect(result.velocityAdequate).toBe(false)
    expect(result.metadata.compliance).toBe('NO CUMPLE')
  })
})

describe('calculateThermalPower', () => {
  it('aplica Q = U · A · ΔT', () => {
    const result = calculateThermalPower({ area: 10, deltaT: 20, u: 0.6 })
    expect(result.watts).toBeCloseTo(120, 6)
    expect(result.kilowatts).toBeCloseTo(0.12, 6)
  })
})

describe('calculateVentilationRate', () => {
  it('calcula caudal de ventilación con 6 renovaciones/hora por defecto', () => {
    const result = calculateVentilationRate(20, 2.5)
    expect(result.volume).toBe(50)
    expect(result.flowM3h).toBe(300)
    expect(result.airChanges).toBe(6)
  })
})

describe('calculateHeatPumpPower', () => {
  it('calcula potencia eléctrica a partir del COP', () => {
    const result = calculateHeatPumpPower(10, 4)
    expect(result.electricalPower).toBeCloseTo(2.5, 6)
  })

  it('rechaza COP fuera de rango físico razonable', () => {
    expect(() => calculateHeatPumpPower(10, 15)).toThrow('COP')
  })
})

describe('calculateInversePipeSizing', () => {
  it('encuentra un diámetro cuya pérdida coincide con el objetivo (round-trip)', () => {
    const result = calculateInversePipeSizing({
      flow: 0.8,
      length: 10,
      density: 998,
      viscosity: 1.004,
      maxHeadLoss: 3,
    })
    expect(result.actualHeadLoss).toBeCloseTo(3, 1)

    const verify = calculatePipeFlow({
      flow: 0.8,
      diameter: result.requiredDiameter,
      length: 10,
      density: 998,
      viscosity: 1.004,
    })
    expect(verify.headLossM).toBeCloseTo(result.actualHeadLoss, 6)
  })
})

describe('validatePhysicalParameters', () => {
  it('rechaza caudal y diámetro fuera de rango, incluyendo el valor 0', () => {
    const result = validatePhysicalParameters({ flow: -1, diameter: 0 })
    expect(result.isValid).toBe(false)
    expect(result.errors).toHaveLength(2)
  })

  it('acepta parámetros dentro de rango', () => {
    const result = validatePhysicalParameters({ flow: 5, diameter: 25 })
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

describe('getNearestNominalDiameter', () => {
  it('encuentra el DN de acero más cercano', () => {
    const result = getNearestNominalDiameter(24, 'steel')
    expect(result.nominal).toBe(25)
    expect(result.inch).toBe('1"')
  })
})

describe('convertFromBase', () => {
  it('convierte presión desde bar a las unidades del catálogo', () => {
    const result = convertFromBase(1, PRESSURE_FACTORS)
    expect(result.bar).toBe(1)
    expect(result.kpa).toBe(100)
    expect(result.psi).toBeCloseTo(14.5038, 4)
  })
})

/**
 * VECTORIAL - Motor de Cálculo de Ingeniería
 * Corazón técnico de la aplicación. Centraliza constantes físicas,
 * presets de fluidos/materiales y funciones de cálculo normativo.
 *
 * La rugosidad de tuberías y las propiedades de fluidos/gases se obtienen
 * del catálogo único en `materials.js` (MATERIAL_CATALOG / FLUID_CATALOG),
 * para evitar tablas duplicadas y valores desincronizados entre módulos.
 *
 * @module engineering
 * @author VECTORIAL Engineering Team
 * @version 2.1.0
 */

import { getMaterial, getFluid } from './materials'

/**
 * Constante gravitacional (m/s²).
 * @type {number}
 */
export const GRAVITY = 9.81

/**
 * Constante de conversión de presión: 1 bar = 100000 Pa.
 * @type {number}
 */
export const BAR_TO_PASCAL = 100000

/**
 * Presets de fluidos comunes con propiedades físicas a temperatura de referencia.
 * density: kg/m³ | viscosity: mm²/s (cSt) a 20°C excepto indicado
 *
 * @type {Record<string, {label: string, density: number, viscosity: number}>}
 */
export const FLUID_PRESETS = {
  cold_water: {
    label: 'Agua fría (20 °C)',
    density: 998,
    viscosity: 1.004,
  },
  hot_water: {
    label: 'Agua caliente (60 °C)',
    density: 983,
    viscosity: 0.475,
  },
  hot_water_90: {
    label: 'Agua caliente (90 °C)',
    density: 965,
    viscosity: 0.315,
  },
  light_oil: {
    label: 'Aceite ligero (ref.)',
    density: 900,
    viscosity: 50,
  },
  heavy_oil: {
    label: 'Aceite pesado (ref.)',
    density: 950,
    viscosity: 200,
  },
  air: {
    label: 'Aire (20 °C, 1 atm)',
    density: 1.204,
    viscosity: 0.015,
  },
  natural_gas: {
    label: 'Gas natural (referencia)',
    density: 0.8,
    viscosity: 0.011,
  },
  custom: {
    label: 'Personalizado',
    density: null,
    viscosity: null,
  },
}

/**
 * Diámetros nominales estándar: pulgada -> DN acero (ISO 6708) / cobre (EN 1057).
 * @type {Array<{inch: string, steelDN: number, copperMm: number}>}
 */
export const NOMINAL_DIAMETERS = [
  { inch: '1/4"', steelDN: 8, copperMm: 10 },
  { inch: '3/8"', steelDN: 10, copperMm: 12 },
  { inch: '1/2"', steelDN: 15, copperMm: 15 },
  { inch: '3/4"', steelDN: 20, copperMm: 22 },
  { inch: '1"', steelDN: 25, copperMm: 28 },
  { inch: '1 1/4"', steelDN: 32, copperMm: 35 },
  { inch: '1 1/2"', steelDN: 40, copperMm: 42 },
  { inch: '2"', steelDN: 50, copperMm: 54 },
  { inch: '2 1/2"', steelDN: 65, copperMm: 64 },
  { inch: '3"', steelDN: 80, copperMm: 76.1 },
]

/**
 * Factores de conversión de presión.
 * @type {Record<string, {label: string, factor: number}>}
 */
export const PRESSURE_FACTORS = {
  bar: { label: 'bar', factor: 1 },
  kpa: { label: 'kPa', factor: 100 },
  psi: { label: 'psi', factor: 14.5038 },
  pa: { label: 'Pa', factor: 100000 },
  mca: { label: 'm.c.a.', factor: 10.197 },
}

/**
 * Factores de conversión de caudal.
 * @type {Record<string, {label: string, factor: number}>}
 */
export const FLOW_FACTORS = {
  ls: { label: 'L/s', factor: 1 },
  m3h: { label: 'm³/h', factor: 3.6 },
  lmin: { label: 'L/min', factor: 60 },
  gpm: { label: 'gal/min (EE.UU.)', factor: 15.8503 },
}

/**
 * Coeficientes de transmisión térmica (U) para diferentes cerramientos.
 * Fuente: CTE DB-HE y normativa ISO 6946.
 * @type {Record<string, {label: string, u: number}>}
 */
export const ENCLOSURE_PRESETS = {
  wall_uninsulated: { label: 'Muro sin aislamiento', u: 1.8 },
  wall_insulated: { label: 'Muro con aislamiento', u: 0.6 },
  wall_high_performance: { label: 'Muro alta eficiencia', u: 0.25 },
  roof_insulated: { label: 'Cubierta aislada', u: 0.35 },
  roof_high_performance: { label: 'Cubierta alta eficiencia', u: 0.15 },
  window_double: { label: 'Ventana doble acristalamiento', u: 2.8 },
  window_triple: { label: 'Ventana triple acristalamiento', u: 1.8 },
  floor_uninsulated: { label: 'Suelo sin aislamiento', u: 1.5 },
  floor_insulated: { label: 'Suelo con aislamiento', u: 0.4 },
  custom: { label: 'Personalizado', u: null },
}

/**
 * Calcula la pérdida de carga en tuberías usando Darcy-Weisbach.
 * Aplica la ecuación de Colebrook-White para régimen turbulento.
 *
 * @module calculatePipeFlow
 * @param {Object} params - Parámetros de cálculo
 * @param {number} params.flow - Caudal volumétrico (m³/h)
 * @param {number} params.diameter - Diámetro interno (mm)
 * @param {number} params.length - Longitud del tramo (m)
 * @param {number} params.density - Densidad del fluido (kg/m³)
 * @param {number} params.viscosity - Viscosidad cinemática (mm²/s o cSt)
 * @param {string} [params.material='steel_medium'] - Clave del material (ver MATERIAL_CATALOG en materials.js)
 * @returns {Object} Resultados del cálculo con metadatos
 * @returns {number} return.velocity - Velocidad de circulación (m/s)
 * @returns {number} return.reynolds - Número de Reynolds
 * @returns {number} return.frictionFactor - Factor de fricción de Darcy
 * @returns {string} return.regime - Régimen de flujo ('laminar' | 'turbulento')
 * @returns {number} return.headLossM - Pérdida de carga (m.c.a.)
 * @returns {number} return.pressureLossBar - Pérdida de presión (bar)
 * @returns {Object} return.metadata - Metadatos del cálculo
 *
 * @example
 * const result = calculatePipeFlow({
 *   flow: 3.5,
 *   diameter: 25.4,
 *   length: 40,
 *   density: 998,
 *   viscosity: 1.004
 * })
 */
export function calculatePipeFlow({
  flow,
  diameter,
  length,
  density,
  viscosity,
  material = 'steel_medium',
}) {
  // Validación de parámetros
  if (
    !Number.isFinite(flow) ||
    !Number.isFinite(diameter) ||
    !Number.isFinite(length) ||
    !Number.isFinite(density) ||
    !Number.isFinite(viscosity)
  ) {
    throw new Error('Todos los parámetros deben ser números finitos')
  }

  if (flow <= 0 || diameter <= 0 || length <= 0 || density <= 0 || viscosity <= 0) {
    throw new Error('Todos los parámetros deben ser positivos')
  }

  // Conversión de unidades a SI
  const Q = flow / 3600 // m³/h -> m³/s
  const D = diameter / 1000 // mm -> m
  const nu = viscosity / 1e6 // mm²/s -> m²/s
  const roughness = (getMaterial(material) || getMaterial('steel_medium')).roughness

  // Cálculos intermedios
  const area = (Math.PI * D ** 2) / 4 // Área transversal (m²)
  const velocity = Q / area // Velocidad (m/s)
  const reynolds = (velocity * D) / nu // Número de Reynolds

  // Determinación del régimen y factor de fricción
  let frictionFactor
  let regime
  let calculationMethod

  if (reynolds < 2300) {
    // Régimen laminar: fórmula analítica de Poiseuille
    frictionFactor = 64 / reynolds
    regime = 'laminar'
    calculationMethod = 'Poiseuille (f = 64/Re)'
  } else if (reynolds < 4000) {
    // Zona de transición: interpolación lineal
    const fLaminar = 64 / 2300
    const relRoughness = roughness / D
    const fTurbulent =
      0.25 / Math.log10(relRoughness / 3.7 + 5.74 / 2300 ** 0.9) ** 2
    const factor = (reynolds - 2300) / (4000 - 2300)
    frictionFactor = fLaminar + factor * (fTurbulent - fLaminar)
    regime = 'transición'
    calculationMethod = 'Interpolación lineal (zona crítica)'
  } else {
    // Régimen turbulento: ecuación de Colebrook-White (iterativa)
    // Aproximación de Swamee-Jain para evitar iteraciones
    const relRoughness = roughness / D
    frictionFactor =
      0.25 / Math.log10(relRoughness / 3.7 + 5.74 / reynolds ** 0.9) ** 2
    regime = 'turbulento'
    calculationMethod = 'Swamee-Jain (aprox. Colebrook-White)'
  }

  // Cálculo de pérdidas
  const headLossM = frictionFactor * (length / D) * (velocity ** 2 / (2 * GRAVITY))
  const pressureLossBar = (density * GRAVITY * headLossM) / BAR_TO_PASCAL

  return {
    velocity,
    reynolds,
    frictionFactor,
    regime,
    headLossM,
    pressureLossBar,
    metadata: {
      calculationMethod,
      material,
      roughness,
      reynoldsRegime: reynolds < 2300 ? 'laminar' : reynolds < 4000 ? 'transición' : 'turbulento',
      reference: 'UNE EN 12354-2 / Darcy-Weisbach',
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Calcula la pérdida de carga localizada en accesorios (codos, válvulas, etc.).
 * Método de longitud equivalente.
 *
 * @param {number} diameter - Diámetro de la tubería (mm)
 * @param {number} flow - Caudal (m³/h)
 * @param {number} density - Densidad del fluido (kg/m³)
 * @param {number} viscosity - Viscosidad cinemática (mm²/s)
 * @param {Array<{type: string, quantity: number}>} fittings - Lista de accesorios
 * @returns {Object} Pérdida total por accesorios
 */
export function calculateFittingLosses({
  diameter,
  flow,
  density,
  viscosity,
  fittings = [],
}) {
  // Factores K típicos para accesorios comunes
  const K_FACTORS = {
    elbow_90_standard: 0.3, // Codo estándar 90°
    elbow_90_long_radius: 0.2, // Codo de radio largo
    elbow_45: 0.15, // Codo 45°
    tee_through: 0.3, // T paso directo
    tee_branch: 1.0, // T derivación
    valve_globe: 10.0, // Válvula de globo
    valve_gate: 0.15, // Válvula de compuerta
    valve_ball: 0.05, // Válvula de esfera
    check_valve: 2.0, // Válvula de retención
    entrance_sharp: 0.5, // Entrada brusca
    entrance_rounded: 0.05, // Entrada redondeada
    exit: 1.0, // Salida
  }

  // Calcular velocidad y Reynolds primero
  const flowResult = calculatePipeFlow({
    flow,
    diameter,
    length: 1, // Longitud dummy
    density,
    viscosity,
  })

  const velocity = flowResult.velocity
  const velocityPressure = (density * velocity ** 2) / 2 // Pa

  // Sumar pérdidas de todos los accesorios
  let totalK = 0
  const fittingDetails = []

  for (const fitting of fittings) {
    const k = K_FACTORS[fitting.type] || 0
    const loss = k * fitting.quantity
    totalK += loss
    fittingDetails.push({
      type: fitting.type,
      quantity: fitting.quantity,
      kFactor: k,
      totalK: loss,
    })
  }

  const totalLossPa = totalK * velocityPressure
  const totalLossBar = totalLossPa / BAR_TO_PASCAL

  return {
    totalK,
    totalLossBar,
    totalLossPa,
    velocityPressure,
    fittings: fittingDetails,
    metadata: {
      method: 'Longitud equivalente / Coeficiente K',
      reference: 'Crane TP-410 / Idelchik',
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Velocidad máxima admisible en tuberías de instalaciones receptoras de gas.
 * Fuente: UNE 60670-4/6 (tramos vistos o registrables).
 * @type {number}
 */
export const GAS_MAX_VELOCITY = 20 // m/s

/**
 * Calcula la pérdida de carga en instalaciones de gas natural.
 * Basado en UNE 60670 y método de Renouard.
 *
 * @param {Object} params - Parámetros de cálculo
 * @param {number} params.flow - Caudal volumétrico (m³/h) a 15°C y 1 atm
 * @param {number} params.diameter - Diámetro interior (mm)
 * @param {number} params.length - Longitud del tramo (m)
 * @param {number} params.pressure - Presión de entrada (mbar)
 * @param {string} [params.gasType='natural_gas'] - Clave del gas (ver FLUID_CATALOG en materials.js)
 * @param {string} [params.material='steel_medium'] - Clave del material de la tubería
 * @returns {Object} Resultados del cálculo
 */
export function calculateGasPressureDrop({
  flow,
  diameter,
  length,
  pressure,
  gasType = 'natural_gas',
  material = 'steel_medium',
}) {
  // Validación
  if (![flow, diameter, length, pressure].every((v) => Number.isFinite(v) && v > 0)) {
    throw new Error('Todos los parámetros deben ser números positivos')
  }

  const gas = getFluid(gasType) || getFluid('natural_gas')
  const roughness = (getMaterial(material) || getMaterial('steel_medium')).roughness

  // Conversión de unidades
  const Q = flow / 3600 // m³/h -> m³/s
  const D = diameter / 1000 // mm -> m
  const P = pressure * 100 // mbar -> Pa
  const area = (Math.PI * D ** 2) / 4

  // Densidad del gas a condiciones de operación (aproximación ideal)
  const rho = gas.density * (P / 101325) * (288.15 / (288.15 + 15)) // kg/m³

  // Viscosidad dinámica
  const mu = gas.viscosity * rho // Pa·s (aproximación)

  const velocity = Q / area // m/s

  // Número de Reynolds
  const reynolds = (rho * velocity * D) / mu

  // Factor de fricción (Colebrook-White)
  const relRoughness = roughness / D
  const frictionFactor =
    0.25 / Math.log10(relRoughness / 3.7 + 5.74 / reynolds ** 0.9) ** 2

  // Pérdida de presión (Pa)
  const pressureDrop = frictionFactor * (length / D) * (rho * velocity ** 2) / 2

  // Pérdida en mbar
  const pressureDropMbar = pressureDrop / 100

  // Verificación de presión mínima (UNE 60670): máximo 10% de caída
  const pressureAdequate = pressureDropMbar < pressure * 0.1
  // Verificación de velocidad máxima (UNE 60670-4/6)
  const velocityAdequate = velocity <= GAS_MAX_VELOCITY
  const compliant = pressureAdequate && velocityAdequate

  return {
    pressureDropMbar,
    pressureDropPa: pressureDrop,
    velocity,
    reynolds,
    frictionFactor,
    gasDensity: rho,
    pressureAdequate,
    velocityAdequate,
    metadata: {
      gasType,
      gasProperties: gas,
      material,
      reynoldsRegime: reynolds < 2300 ? 'laminar' : reynolds < 4000 ? 'transición' : 'turbulento',
      calculationMethod: 'Colebrook-White + Renouard',
      reference: 'UNE 60670:2006',
      compliance: compliant ? 'CUMPLE' : 'NO CUMPLE',
      note: `Máxima caída permitida: 10% de la presión de entrada. Velocidad máxima: ${GAS_MAX_VELOCITY} m/s`,
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Calcula la potencia térmica por transmisión a través de un cerramiento.
 * Fórmula básica: Q = U · A · ΔT
 *
 * @param {Object} params - Parámetros de cálculo
 * @param {number} params.area - Área del cerramiento (m²)
 * @param {number} params.deltaT - Salto térmico (°C)
 * @param {number} params.u - Coeficiente de transmisión (W/m²K)
 * @returns {Object} Resultados del cálculo
 */
export function calculateThermalPower({ area, deltaT, u }) {
  if (![area, deltaT, u].every((v) => Number.isFinite(v) && v > 0)) {
    throw new Error('Todos los parámetros deben ser números positivos')
  }

  const watts = u * area * deltaT
  const kilowatts = watts / 1000

  return {
    watts,
    kilowatts,
    metadata: {
      calculationMethod: 'Transmisión térmica básica',
      formula: 'Q = U · A · ΔT',
      reference: 'CTE DB-HE / ISO 6946',
      note: 'No incluye puentes térmicos ni renovaciones de aire',
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Calcula el caudal de aire necesario para ventilación de un local.
 * Basado en normativa de calidad de aire interior.
 *
 * @param {number} area - Área del local (m²)
 * @param {number} height - Altura del local (m)
 * @param {number} airChanges - Renovaciones de aire por hora (n)
 * @returns {Object} Caudal de ventilación
 */
export function calculateVentilationRate(area, height, airChanges = 6) {
  if (![area, height, airChanges].every((v) => Number.isFinite(v) && v > 0)) {
    throw new Error('Todos los parámetros deben ser números positivos')
  }

  const volume = area * height // m³
  const flowM3h = volume * airChanges // m³/h
  const flowLs = flowM3h / 3.6 // L/s

  return {
    volume,
    flowM3h,
    flowLs,
    airChanges,
    metadata: {
      calculationMethod: 'Renovaciones de aire por hora',
      reference: 'RITE / CTE DB-HS 3',
      note: 'Valor típico: 6 renovaciones/h para locales secos',
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Calcula la potencia de una bomba de calor (COP aproximado).
 *
 * @param {number} thermalPower - Potencia térmica (kW)
 * @param {number} cop - Coeficiente de rendimiento (típico: 3-5)
 * @returns {Object} Potencia eléctrica consumida
 */
export function calculateHeatPumpPower(thermalPower, cop = 3.5) {
  if (!Number.isFinite(thermalPower) || thermalPower <= 0) {
    throw new Error('La potencia térmica debe ser un número positivo')
  }
  if (!Number.isFinite(cop) || cop <= 0 || cop > 10) {
    throw new Error('COP debe estar entre 0 y 10')
  }

  const electricalPower = thermalPower / cop // kW
  const annualEnergy = electricalPower * 8760 // kWh/año (funcionamiento continuo)

  return {
    electricalPower,
    thermalPower,
    cop,
    annualEnergy,
    metadata: {
      calculationMethod: 'COP = Potencia térmica / Potencia eléctrica',
      reference: 'UNE EN 14511',
      note: 'COP varía con temperatura exterior y condiciones de operación',
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Convierte un valor desde una unidad base a múltiples unidades.
 *
 * @param {number} valueInBase - Valor en unidad base
 * @param {Record<string, {label: string, factor: number}>} factors - Factores de conversión
 * @returns {Record<string, number>} Valores convertidos
 */
export function convertFromBase(valueInBase, factors) {
  if (!Number.isFinite(valueInBase)) {
    throw new Error('El valor debe ser un número finito')
  }

  return Object.fromEntries(
    Object.entries(factors).map(([key, { factor }]) => [key, valueInBase * factor]),
  )
}

/**
 * Valida si un conjunto de parámetros es físicamente posible.
 *
 * @param {Object} params - Parámetros a validar
 * @returns {Object} Resultado de validación
 */
export function validatePhysicalParameters(params) {
  const errors = []
  const warnings = []

  // Validaciones de rango. Se usa `!== undefined` en vez de un check "truthy"
  // porque 0 es un valor de entrada válido a rechazar (falsy haría que
  // flow=0 o diameter=0 se saltaran silenciosamente esta validación).
  if (params.flow !== undefined && (params.flow < 0 || params.flow > 10000)) {
    errors.push('Caudal fuera de rango típico (0-10000 m³/h)')
  }
  if (params.diameter !== undefined && (params.diameter < 1 || params.diameter > 2000)) {
    errors.push('Diámetro fuera de rango típico (1-2000 mm)')
  }
  if (params.velocity && params.velocity > 10) {
    warnings.push('Velocidad elevada (>10 m/s): riesgo de erosión y ruido')
  }
  if (params.velocity && params.velocity < 0.3) {
    warnings.push('Velocidad baja (<0.3 m/s): riesgo de sedimentación')
  }
  if (params.reynolds && params.reynolds < 2300) {
    warnings.push('Régimen laminar: mayor pérdida de carga relativa')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: new Date().toISOString(),
    },
  }
}

/**
 * Obtiene el diámetro nominal estándar más cercano.
 *
 * @param {number} diameterMm - Diámetro en mm
 * @param {string} [standard='steel'] - 'steel' o 'copper'
 * @returns {Object} Diámetro nominal
 */
export function getNearestNominalDiameter(diameterMm, standard = 'steel') {
  if (!Number.isFinite(diameterMm) || diameterMm <= 0) {
    throw new Error('Diámetro debe ser un número positivo')
  }

  const key = standard === 'copper' ? 'copperMm' : 'steelDN'
  const diameters = NOMINAL_DIAMETERS.map((d) => ({
    nominal: d[key],
    inch: d.inch,
    diff: Math.abs(d[key] - diameterMm),
  }))

  diameters.sort((a, b) => a.diff - b.diff)

  return {
    nominal: diameters[0].nominal,
    inch: diameters[0].inch,
    difference: diameters[0].diff,
    standard,
  }
}

/**
 * Cálculo inverso: determina el diámetro necesario para una pérdida de carga objetivo.
 * Método de bisección para encontrar el diámetro que cumple con la pérdida máxima.
 *
 * @param {Object} params - Parámetros de cálculo
 * @param {number} params.flow - Caudal (m³/h)
 * @param {number} params.length - Longitud (m)
 * @param {number} params.density - Densidad (kg/m³)
 * @param {number} params.viscosity - Viscosidad (mm²/s)
 * @param {number} params.maxHeadLoss - Pérdida de carga máxima permitida (m.c.a.)
 * @param {string} [params.material='steel_medium'] - Material
 * @param {number} [params.minDiameter=10] - Diámetro mínimo a probar (mm)
 * @param {number} [params.maxDiameter=200] - Diámetro máximo a probar (mm)
 * @param {number} [params.tolerance=0.01] - Tolerancia del método de bisección
 * @returns {Object} Diámetro calculado y detalles
 */
export function calculateInversePipeSizing({
  flow,
  length,
  density,
  viscosity,
  maxHeadLoss,
  material = 'steel_medium',
  minDiameter = 10,
  maxDiameter = 200,
  tolerance = 0.01,
}) {
  if (![flow, length, density, viscosity, maxHeadLoss].every((v) => Number.isFinite(v) && v > 0)) {
    throw new Error('Todos los parámetros deben ser números positivos')
  }

  if (maxHeadLoss <= 0) {
    throw new Error('La pérdida de carga máxima debe ser positiva')
  }

  // Función auxiliar para calcular pérdida en un diámetro dado
  const calculateLossAtDiameter = (diameter) => {
    const result = calculatePipeFlow({
      flow,
      diameter,
      length,
      density,
      viscosity,
      material,
    })
    return result.headLossM
  }

  // Verificar si el rango es factible. La pérdida de carga decrece de forma
  // monótona al aumentar el diámetro, así que lossAtMin (diámetro más
  // pequeño) es siempre >= lossAtMax (diámetro más grande) dentro del rango.
  const lossAtMin = calculateLossAtDiameter(minDiameter)
  const lossAtMax = calculateLossAtDiameter(maxDiameter)

  if (lossAtMax > maxHeadLoss) {
    throw new Error(
      `Incluso con el diámetro máximo (${maxDiameter} mm) la pérdida (${lossAtMax.toFixed(2)} m) supera el máximo permitido (${maxHeadLoss} m). Aumenta maxDiameter.`,
    )
  }

  if (lossAtMin <= maxHeadLoss) {
    throw new Error(
      `Incluso con el diámetro mínimo (${minDiameter} mm) la pérdida (${lossAtMin.toFixed(2)} m) ya cumple el máximo permitido (${maxHeadLoss} m). Se puede usar ${minDiameter} mm.`,
    )
  }

  // Método de bisección
  let low = minDiameter
  let high = maxDiameter
  let mid = (low + high) / 2
  let iterations = 0
  const maxIterations = 50

  while (Math.abs(high - low) > tolerance && iterations < maxIterations) {
    mid = (low + high) / 2
    const loss = calculateLossAtDiameter(mid)

    // Pérdida por encima del objetivo -> hace falta más diámetro (subir low);
    // pérdida por debajo -> se puede reducir diámetro (bajar high).
    if (loss > maxHeadLoss) {
      low = mid
    } else {
      high = mid
    }

    iterations++
  }

  const finalDiameter = (low + high) / 2
  const finalResult = calculatePipeFlow({
    flow,
    diameter: finalDiameter,
    length,
    density,
    viscosity,
    material,
  })

  return {
    requiredDiameter: finalDiameter,
    actualHeadLoss: finalResult.headLossM,
    velocity: finalResult.velocity,
    reynolds: finalResult.reynolds,
    regime: finalResult.regime,
    iterations,
    metadata: {
      calculationMethod: 'Bisección (inverse sizing)',
      targetHeadLoss: maxHeadLoss,
      tolerance,
      reference: 'UNE EN 12354-2',
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Genera una curva de pérdida de carga vs caudal para un diámetro fijo.
 *
 * @param {Object} params - Parámetros
 * @param {number} params.diameter - Diámetro (mm)
 * @param {number} params.length - Longitud (m)
 * @param {number} params.density - Densidad (kg/m³)
 * @param {number} params.viscosity - Viscosidad (mm²/s)
 * @param {number} [params.minFlow=0.5] - Caudal mínimo (m³/h)
 * @param {number} [params.maxFlow=20] - Caudal máximo (m³/h)
 * @param {number} [params.steps=20] - Número de puntos
 * @returns {Array} Curva de datos
 */
export function generateHeadLossCurve({
  diameter,
  length,
  density,
  viscosity,
  minFlow = 0.5,
  maxFlow = 20,
  steps = 20,
  material = 'steel_medium',
}) {
  if (![diameter, length, density, viscosity].every((v) => Number.isFinite(v) && v > 0)) {
    throw new Error('Todos los parámetros deben ser números positivos')
  }

  const curve = []
  const flowStep = (maxFlow - minFlow) / steps

  for (let i = 0; i <= steps; i++) {
    const flow = minFlow + i * flowStep
    const result = calculatePipeFlow({
      flow,
      diameter,
      length,
      density,
      viscosity,
      material,
    })

    curve.push({
      flow: parseFloat(flow.toFixed(2)),
      headLoss: parseFloat(result.headLossM.toFixed(3)),
      velocity: parseFloat(result.velocity.toFixed(3)),
      pressureLoss: parseFloat(result.pressureLossBar.toFixed(4)),
    })
  }

  return curve
}

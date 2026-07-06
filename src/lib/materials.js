/**
 * VECTORIAL - Catálogo Dinámico de Materiales
 * Sistema de selección de materiales con propiedades técnicas normalizadas.
 *
 * @module materials
 * @author VECTORIAL Engineering Team
 * @version 2.0.0
 */

// ============================================================================
// CATÁLOGO DE TUBERÍAS - ACERO
// ============================================================================

/**
 * Tuberías de acero negro según UNE EN 10255 (serie media).
 * Incluye diámetros nominales, espesores y diámetros interiores.
 *
 * @type {Array<{dn: number, inch: string, od: number, thickness: number, id: number, weight: number}>}
 */
export const STEEL_PIPE_MEDIUM_SERIES = [
  { dn: 6, inch: '1/8"', od: 10.2, thickness: 2.0, id: 6.2, weight: 0.39 },
  { dn: 8, inch: '1/4"', od: 13.5, thickness: 2.3, id: 8.9, weight: 0.62 },
  { dn: 10, inch: '3/8"', od: 17.2, thickness: 2.3, id: 12.6, weight: 0.82 },
  { dn: 15, inch: '1/2"', od: 21.3, thickness: 2.8, id: 15.7, weight: 1.22 },
  { dn: 20, inch: '3/4"', od: 26.9, thickness: 2.8, id: 21.3, weight: 1.63 },
  { dn: 25, inch: '1"', od: 33.7, thickness: 3.2, id: 27.3, weight: 2.34 },
  { dn: 32, inch: '1 1/4"', od: 42.4, thickness: 3.2, id: 36.0, weight: 3.00 },
  { dn: 40, inch: '1 1/2"', od: 48.3, thickness: 3.2, id: 41.9, weight: 3.48 },
  { dn: 50, inch: '2"', od: 60.3, thickness: 3.6, id: 53.1, weight: 4.95 },
  { dn: 65, inch: '2 1/2"', od: 76.1, thickness: 3.6, id: 68.9, weight: 6.29 },
  { dn: 80, inch: '3"', od: 88.9, thickness: 4.0, id: 80.9, weight: 8.18 },
  { dn: 100, inch: '4"', od: 114.3, thickness: 4.5, id: 105.3, weight: 11.86 },
]

/**
 * Tuberías de cobre según UNE EN 1057.
 *
 * @type {Array<{dn: number, inch: string, od: number, thickness: number, id: number}>}
 */
export const COPPER_PIPE_STANDARD = [
  { dn: 8, inch: '1/4"', od: 10, thickness: 0.6, id: 8.8 },
  { dn: 10, inch: '3/8"', od: 12, thickness: 0.7, id: 10.6 },
  { dn: 15, inch: '1/2"', od: 15, thickness: 0.8, id: 13.4 },
  { dn: 18, inch: '5/8"', od: 18, thickness: 0.8, id: 16.4 },
  { dn: 22, inch: '3/4"', od: 22, thickness: 0.9, id: 20.2 },
  { dn: 28, inch: '1"', od: 28, thickness: 1.0, id: 26.0 },
  { dn: 35, inch: '1 1/4"', od: 35, thickness: 1.2, id: 32.6 },
  { dn: 42, inch: '1 1/2"', od: 42, thickness: 1.2, id: 39.6 },
  { dn: 54, inch: '2"', od: 54, thickness: 1.5, id: 51.0 },
  { dn: 64, inch: '2 1/2"', od: 64, thickness: 1.8, id: 60.4 },
  { dn: 76, inch: '3"', od: 76, thickness: 2.0, id: 72.0 },
]

/**
 * Tuberías de PVC según UNE EN 1452.
 *
 * @type {Array<{dn: number, inch: string, od: number, thickness: number, id: number}>}
 */
export const PVC_PIPE_STANDARD = [
  { dn: 20, inch: '1/2"', od: 25, thickness: 1.5, id: 22.0 },
  { dn: 25, inch: '3/4"', od: 32, thickness: 1.9, id: 28.2 },
  { dn: 32, inch: '1"', od: 40, thickness: 2.4, id: 35.2 },
  { dn: 40, inch: '1 1/4"', od: 50, thickness: 3.0, id: 44.0 },
  { dn: 50, inch: '1 1/2"', od: 63, thickness: 3.8, id: 55.4 },
  { dn: 63, inch: '2"', od: 75, thickness: 4.5, id: 66.0 },
  { dn: 75, inch: '2 1/2"', od: 90, thickness: 5.4, id: 79.2 },
  { dn: 90, inch: '3"', od: 110, thickness: 6.6, id: 96.8 },
]

// ============================================================================
// CATÁLOGO DE MATERIALES CON RUGOSIDAD
// ============================================================================

/**
 * Catálogo completo de materiales con propiedades normalizadas.
 * Cada material incluye rugosidad, tipo y catálogo de tuberías disponible.
 *
 * @type {Record<string, {name: string, roughness: number, type: string, catalog: Array, standard: string}>}
 */
export const MATERIAL_CATALOG = {
  steel_medium: {
    name: 'Acero negro - Serie media (UNE EN 10255)',
    roughness: 0.000045,
    type: 'steel',
    standard: 'UNE EN 10255',
    catalog: STEEL_PIPE_MEDIUM_SERIES,
    color: '#94a3b8',
  },
  steel_heavy: {
    name: 'Acero negro - Serie pesada (UNE EN 10255)',
    roughness: 0.000045,
    type: 'steel',
    standard: 'UNE EN 10255',
    catalog: STEEL_PIPE_MEDIUM_SERIES, // Mismo catálogo, diferente espesor en obra
    color: '#64748b',
  },
  steel_used: {
    name: 'Acero usado/incrustado',
    roughness: 0.00015,
    type: 'steel',
    standard: 'Estimado',
    catalog: STEEL_PIPE_MEDIUM_SERIES,
    color: '#475569',
  },
  copper: {
    name: 'Cobre - UNE EN 1057',
    roughness: 0.0000015,
    type: 'copper',
    standard: 'UNE EN 1057',
    catalog: COPPER_PIPE_STANDARD,
    color: '#f59e0b',
  },
  pvc: {
    name: 'PVC - UNE EN 1452',
    roughness: 0.0000015,
    type: 'plastic',
    standard: 'UNE EN 1452',
    catalog: PVC_PIPE_STANDARD,
    color: '#10b981',
  },
  pp_r: {
    name: 'Polipropileno (PP-R) - UNE EN ISO 15874',
    roughness: 0.0000015,
    type: 'plastic',
    standard: 'UNE EN ISO 15874',
    catalog: PVC_PIPE_STANDARD, // Usar mismo catálogo como referencia
    color: '#3b82f6',
  },
  stainless_steel: {
    name: 'Acero inoxidable - UNE EN 10312',
    roughness: 0.0000015,
    type: 'steel',
    standard: 'UNE EN 10312',
    catalog: STEEL_PIPE_MEDIUM_SERIES,
    color: '#e2e8f0',
  },
  galvanized_steel: {
    name: 'Acero galvanizado',
    roughness: 0.00015,
    type: 'steel',
    standard: 'UNE EN 10240',
    catalog: STEEL_PIPE_MEDIUM_SERIES,
    color: '#a1a1aa',
  },
  cast_iron: {
    name: 'Fundición',
    roughness: 0.00026,
    type: 'steel',
    standard: 'UNE EN 545',
    catalog: STEEL_PIPE_MEDIUM_SERIES,
    color: '#57534e',
  },
}

// ============================================================================
// CATÁLOGO DE FLUIDOS
// ============================================================================

/**
 * Catálogo completo de fluidos con propiedades físicas.
 *
 * @type {Record<string, {name: string, density: number, viscosity: number, temperature: number, category: string}>}
 */
export const FLUID_CATALOG = {
  water_cold: {
    name: 'Agua fría',
    density: 998,
    viscosity: 1.004,
    temperature: 20,
    category: 'water',
  },
  water_hot_60: {
    name: 'Agua caliente (60°C)',
    density: 983,
    viscosity: 0.475,
    temperature: 60,
    category: 'water',
  },
  water_hot_90: {
    name: 'Agua caliente (90°C)',
    density: 965,
    viscosity: 0.315,
    temperature: 90,
    category: 'water',
  },
  water_glycol_30: {
    name: 'Agua + glicol 30%',
    density: 1040,
    viscosity: 3.5,
    temperature: 20,
    category: 'water',
  },
  water_glycol_50: {
    name: 'Agua + glicol 50%',
    density: 1080,
    viscosity: 7.5,
    temperature: 20,
    category: 'water',
  },
  oil_light: {
    name: 'Aceite ligero',
    density: 900,
    viscosity: 50,
    temperature: 20,
    category: 'oil',
  },
  oil_heavy: {
    name: 'Aceite pesado',
    density: 950,
    viscosity: 200,
    temperature: 20,
    category: 'oil',
  },
  air: {
    name: 'Aire',
    density: 1.204,
    viscosity: 0.015,
    temperature: 20,
    category: 'gas',
  },
  natural_gas: {
    name: 'Gas natural',
    density: 0.8,
    viscosity: 0.011,
    temperature: 15,
    category: 'gas',
    calorificValue: 10.0,
  },
  propane: {
    name: 'Propano',
    density: 2.02,
    viscosity: 0.008,
    temperature: 15,
    category: 'gas',
    calorificValue: 25.89,
  },
  butane: {
    name: 'Butano',
    density: 2.48,
    viscosity: 0.008,
    temperature: 15,
    category: 'gas',
    calorificValue: 33.06,
  },
}

// ============================================================================
// CATÁLOGO DE CERRAMIENTOS
// ============================================================================

/**
 * Catálogo de cerramientos con propiedades térmicas.
 * Fuente: CTE DB-HE, ISO 6946.
 *
 * @type {Record<string, {name: string, uValue: number, category: string, description: string}>}
 */
export const ENCLOSURE_CATALOG = {
  wall_uninsulated: {
    name: 'Muro de fábrica sin aislamiento',
    uValue: 1.8,
    category: 'wall',
    description: 'Fábrica de ladrillo hueco doble, sin aislamiento',
  },
  wall_insulated: {
    name: 'Muro con aislamiento',
    uValue: 0.6,
    category: 'wall',
    description: 'Fábrica con cámara de aire y aislamiento (EPS, lana de roca)',
  },
  wall_high_performance: {
    name: 'Muro alta eficiencia',
    uValue: 0.25,
    category: 'wall',
    description: 'Cerramiento con aislamiento de alta densidad',
  },
  wall_passive: {
    name: 'Muro estándar Passivhaus',
    uValue: 0.15,
    category: 'wall',
    description: 'Estándar Passivhaus (U ≤ 0.15 W/m²K)',
  },
  roof_uninsulated: {
    name: 'Cubierta sin aislamiento',
    uValue: 2.5,
    category: 'roof',
    description: 'Cubierta plana o inclinada sin aislamiento',
  },
  roof_insulated: {
    name: 'Cubierta aislada',
    uValue: 0.35,
    category: 'roof',
    description: 'Cubierta con aislamiento térmico',
  },
  roof_high_performance: {
    name: 'Cubierta alta eficiencia',
    uValue: 0.15,
    category: 'roof',
    description: 'Cubierta con aislamiento de alta eficiencia',
  },
  floor_uninsulated: {
    name: 'Suelo sin aislamiento',
    uValue: 1.5,
    category: 'floor',
    description: 'Forjado sanitario sin aislamiento',
  },
  floor_insulated: {
    name: 'Suelo con aislamiento',
    uValue: 0.4,
    category: 'floor',
    description: 'Forjado con aislamiento inferior',
  },
  window_double: {
    name: 'Ventana doble acristalamiento',
    uValue: 2.8,
    category: 'window',
    description: 'Vidrio doble estándar (4-12-4)',
  },
  window_triple: {
    name: 'Ventana triple acristalamiento',
    uValue: 1.8,
    category: 'window',
    description: 'Vidrio triple bajo emisivo',
  },
  window_passive: {
    name: 'Ventana Passivhaus',
    uValue: 0.8,
    category: 'window',
    description: 'Certificación Passivhaus (U ≤ 0.8 W/m²K)',
  },
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Obtiene un material por su clave.
 *
 * @param {string} materialKey - Clave del material
 * @returns {Object|null} Datos del material
 */
export function getMaterial(materialKey) {
  return MATERIAL_CATALOG[materialKey] || null
}

/**
 * Obtiene un fluido por su clave.
 *
 * @param {string} fluidKey - Clave del fluido
 * @returns {Object|null} Datos del fluido
 */
export function getFluid(fluidKey) {
  return FLUID_CATALOG[fluidKey] || null
}

/**
 * Obtiene un cerramiento por su clave.
 *
 * @param {string} enclosureKey - Clave del cerramiento
 * @returns {Object|null} Datos del cerramiento
 */
export function getEnclosure(enclosureKey) {
  return ENCLOSURE_CATALOG[enclosureKey] || null
}

/**
 * Busca tuberías por DN en un catálogo.
 *
 * @param {string} materialKey - Clave del material
 * @param {number} dn - Diámetro nominal buscado
 * @returns {Object|null} Tubería encontrada
 */
export function findPipeByDN(materialKey, dn) {
  const material = getMaterial(materialKey)
  if (!material) return null

  return material.catalog.find((pipe) => pipe.dn === dn) || null
}

/**
 * Busca la tubería de diámetro interior más cercano.
 *
 * @param {string} materialKey - Clave del material
 * @param {number} targetId - Diámetro interior objetivo (mm)
 * @returns {Object|null} Tubería más cercana
 */
export function findClosestPipeByID(materialKey, targetId) {
  const material = getMaterial(materialKey)
  if (!material) return null

  let closest = null
  let minDiff = Infinity

  for (const pipe of material.catalog) {
    const diff = Math.abs(pipe.id - targetId)
    if (diff < minDiff) {
      minDiff = diff
      closest = pipe
    }
  }

  return closest ? { ...closest, difference: minDiff } : null
}

/**
 * Obtiene todos los materiales de un tipo.
 *
 * @param {string} type - Tipo de material ('steel', 'copper', 'plastic')
 * @returns {Array} Lista de materiales
 */
export function getMaterialsByType(type) {
  return Object.entries(MATERIAL_CATALOG)
    .filter(([_, material]) => material.type === type)
    .map(([key, material]) => ({ key, ...material }))
}

/**
 * Obtiene todos los fluidos de una categoría.
 *
 * @param {string} category - Categoría ('water', 'oil', 'gas')
 * @returns {Array} Lista de fluidos
 */
export function getFluidsByCategory(category) {
  return Object.entries(FLUID_CATALOG)
    .filter(([_, fluid]) => fluid.category === category)
    .map(([key, fluid]) => ({ key, ...fluid }))
}

/**
 * Obtiene todos los cerramientos de una categoría.
 *
 * @param {string} category - Categoría ('wall', 'roof', 'floor', 'window')
 * @returns {Array} Lista de cerramientos
 */
export function getEnclosuresByCategory(category) {
  return Object.entries(ENCLOSURE_CATALOG)
    .filter(([_, enclosure]) => enclosure.category === category)
    .map(([key, enclosure]) => ({ key, ...enclosure }))
}
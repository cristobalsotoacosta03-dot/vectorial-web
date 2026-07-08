/**
 * VECTORIAL - Estimación preliminar de materiales (Bill of Materials).
 *
 * IMPORTANTE — alcance de la estimación: sin un plano isométrico o trazado
 * real de la instalación, el número exacto de codos, tés y soportes no puede
 * derivarse solo de la longitud y el diámetro de un tramo. Esta función
 * produce una estimación de nivel de anteproyecto (conceptual estimate),
 * útil para presupuestar u ordenar material con margen, NO un recuento de
 * obra. Debe validarse siempre contra el trazado real antes de compra.
 *
 * @module bom
 */

import { getMaterial } from './materials'

/**
 * Separación máxima orientativa entre soportes/abrazaderas según el
 * diámetro interior de la tubería. Valores de referencia habituales en
 * guías de instalación (CTE DB-HS4 / prácticas de fontanería y gas para
 * tubería metálica horizontal); en vertical o para plástico la separación
 * real puede ser menor.
 *
 * @type {Array<{maxDiameter: number, spacingM: number}>}
 */
const SUPPORT_SPACING_TABLE = [
  { maxDiameter: 20, spacingM: 1.2 },
  { maxDiameter: 32, spacingM: 1.8 },
  { maxDiameter: 50, spacingM: 2.4 },
  { maxDiameter: 80, spacingM: 3.0 },
  { maxDiameter: 125, spacingM: 3.5 },
  { maxDiameter: Infinity, spacingM: 4.0 },
]

/**
 * Longitud comercial estándar de barra de tubería (m), usada para estimar
 * el número de uniones/manguitos por corte de barra.
 * @type {number}
 */
const STANDARD_BAR_LENGTH_M = 6

function getSupportSpacing(diameterMm) {
  return SUPPORT_SPACING_TABLE.find((bracket) => diameterMm <= bracket.maxDiameter).spacingM
}

/**
 * Estima el listado preliminar de materiales (BOM) para un tramo recto de
 * tubería, a partir de su longitud y diámetro.
 *
 * @param {Object} params
 * @param {number} params.length - Longitud del tramo (m)
 * @param {number} params.diameter - Diámetro interior (mm)
 * @param {string} [params.material='steel_medium'] - Clave del material (MATERIAL_CATALOG)
 * @param {number|null} [params.estimatedElbows=null] - Nº de codos si se conoce el trazado real;
 *   si es null, se estima asumiendo un cambio de dirección cada `elbowFrequencyM` metros
 * @param {number} [params.elbowFrequencyM=8] - Metros asumidos entre cambios de dirección (solo si estimatedElbows es null)
 * @returns {Object} Estimación de materiales con metadatos de trazabilidad
 */
export function estimateBillOfMaterials({
  length,
  diameter,
  material = 'steel_medium',
  estimatedElbows = null,
  elbowFrequencyM = 8,
}) {
  if (!Number.isFinite(length) || length <= 0) {
    throw new Error('La longitud debe ser un número positivo')
  }
  if (!Number.isFinite(diameter) || diameter <= 0) {
    throw new Error('El diámetro debe ser un número positivo')
  }

  const materialData = getMaterial(material) || getMaterial('steel_medium')

  const spacingM = getSupportSpacing(diameter)
  const supports = Math.max(2, Math.ceil(length / spacingM) + 1)

  const elbows90 =
    estimatedElbows ?? Math.max(2, Math.round(length / elbowFrequencyM))

  // Bridas: se asume un par por conexión a equipo/válvula, aproximando una
  // conexión intermedia cada 15 m de tramo accesible.
  const flangePairs = Math.max(1, Math.ceil(length / 15))
  const flanges = flangePairs * 2

  // Manguitos/uniones por corte de barra comercial (6 m habituales).
  const couplings = Math.max(0, Math.ceil(length / STANDARD_BAR_LENGTH_M) - 1)

  return {
    material: materialData.name,
    items: [
      {
        key: 'supports',
        label: 'Soportes / abrazaderas',
        quantity: supports,
        note: `Separación estimada: ${spacingM} m`,
      },
      {
        key: 'elbows90',
        label: 'Codos 90°',
        quantity: elbows90,
        note:
          estimatedElbows !== null
            ? 'Según trazado indicado'
            : `Estimación conceptual: 1 cada ~${elbowFrequencyM} m`,
      },
      {
        key: 'flanges',
        label: 'Bridas (pares)',
        quantity: flangePairs,
        note: `${flanges} unidades — 1 par cada ~15 m de tramo accesible`,
      },
      {
        key: 'couplings',
        label: 'Manguitos de unión',
        quantity: couplings,
        note: `Barra comercial de ${STANDARD_BAR_LENGTH_M} m`,
      },
    ],
    metadata: {
      estimationLevel: 'anteproyecto',
      warning:
        'Estimación preliminar orientativa. No sustituye un recuento sobre plano isométrico real.',
      reference: 'CTE DB-HS4 (orientativo) / prácticas habituales de instalación',
      timestamp: new Date().toISOString(),
    },
  }
}

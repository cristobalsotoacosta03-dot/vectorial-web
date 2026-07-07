/**
 * VECTORIAL - Utilidades de exportación/importación de proyecto.
 *
 * @module exportUtils
 */

import { getCalculations, replaceAllCalculations } from './calculationStore'
import { getProjectMeta, setProjectMeta } from './projectMeta'

const PROJECT_FILE_VERSION = 1

function downloadJSON(payload, filenameBase) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filenameBase}-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Exporta los datos de un único cálculo (inputs, resultados, metadatos, BOM)
 * a un fichero JSON descargable.
 *
 * @param {Object} calculationData - Datos del cálculo ({ inputs, results, metadata, bom? })
 * @param {string} [filename='vectorial-calculo'] - Nombre base del fichero (sin extensión)
 */
export function exportCalculationToJSON(calculationData, filename = 'vectorial-calculo') {
  if (!calculationData) {
    throw new Error('No hay datos de cálculo que exportar')
  }

  downloadJSON(
    {
      exportedAt: new Date().toISOString(),
      generator: 'VECTORIAL Engineering Sandbox',
      ...calculationData,
    },
    filename,
  )
}

/**
 * Exporta el proyecto completo: todos los cálculos guardados en el
 * Dashboard, sus notas de campo y los datos de cabecera (autor, obra,
 * cliente, fecha). Pensado para llevarse el trabajo de obra a la oficina.
 */
export function exportProjectToJSON() {
  downloadJSON(
    {
      fileVersion: PROJECT_FILE_VERSION,
      exportedAt: new Date().toISOString(),
      generator: 'VECTORIAL Engineering Sandbox',
      projectMeta: getProjectMeta(),
      calculations: getCalculations(),
    },
    'vectorial-proyecto',
  )
}

/**
 * Valida que una entrada de cálculo tenga la forma mínima esperada, para no
 * restaurar basura desde un fichero manipulado o de otra procedencia.
 *
 * @param {*} entry
 * @returns {boolean}
 */
function isValidCalculationEntry(entry) {
  return (
    entry !== null &&
    typeof entry === 'object' &&
    typeof entry.id === 'string' &&
    typeof entry.type === 'string' &&
    entry.calculationData !== null &&
    typeof entry.calculationData === 'object'
  )
}

/**
 * Importa un proyecto exportado con `exportProjectToJSON`, restaurando el
 * historial de cálculos y los datos de cabecera. Nunca lanza una excepción:
 * cualquier fallo (JSON corrupto, formato inesperado) se devuelve como
 * `{ success: false, error }` para que la UI pueda avisar sin romperse.
 *
 * @param {string} rawText - Contenido del fichero .json seleccionado
 * @returns {{success: true, imported: number, skipped: number} | {success: false, error: string}}
 */
export function importProjectFromJSON(rawText) {
  let data
  try {
    data = JSON.parse(rawText)
  } catch {
    return { success: false, error: 'El archivo no es un JSON válido.' }
  }

  if (!data || typeof data !== 'object' || !Array.isArray(data.calculations)) {
    return {
      success: false,
      error: 'El archivo no tiene el formato de un proyecto VECTORIAL (falta "calculations").',
    }
  }

  const validEntries = data.calculations.filter(isValidCalculationEntry)
  const skipped = data.calculations.length - validEntries.length

  replaceAllCalculations(validEntries)

  if (data.projectMeta && typeof data.projectMeta === 'object') {
    setProjectMeta(data.projectMeta)
  }

  return { success: true, imported: validEntries.length, skipped }
}

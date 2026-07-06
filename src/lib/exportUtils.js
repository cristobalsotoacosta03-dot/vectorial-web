/**
 * VECTORIAL - Utilidades de exportación de resultados de cálculo.
 *
 * @module exportUtils
 */

/**
 * Exporta los datos de un cálculo (inputs, resultados y metadatos) a un
 * fichero JSON descargable, para que el resultado sea persistente y
 * pueda re-importarse o adjuntarse a un expediente.
 *
 * @param {Object} calculationData - Datos del cálculo ({ inputs, results, metadata, bom? })
 * @param {string} [filename='vectorial-calculo'] - Nombre base del fichero (sin extensión)
 */
export function exportCalculationToJSON(calculationData, filename = 'vectorial-calculo') {
  if (!calculationData) {
    throw new Error('No hay datos de cálculo que exportar')
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    generator: 'VECTORIAL Engineering Sandbox',
    ...calculationData,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

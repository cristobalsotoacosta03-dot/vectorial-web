/**
 * VECTORIAL - Almacén de cálculos de la sesión (Dashboard de Proyecto).
 * Persiste en localStorage para sobrevivir a recargas de página, y notifica
 * a los suscriptores (componentes React) cuando cambia el listado.
 *
 * @module calculationStore
 */

const STORAGE_KEY = 'vectorial_calculation_history'

const listeners = new Set()

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Almacenamiento no disponible (privado/lleno): la sesión sigue
    // funcionando en memoria a través de los listeners, aunque no persista.
  }
  listeners.forEach((listener) => listener(entries))
}

/**
 * Reemplaza el listado completo de cálculos (usado al importar un proyecto).
 * No valida el contenido — la validación de forma vive en exportUtils.js,
 * que es quien conoce el formato del fichero de proyecto.
 *
 * @param {Array<Object>} entries
 */
export function replaceAllCalculations(entries) {
  writeAll(Array.isArray(entries) ? entries : [])
}

/**
 * Guarda un cálculo en el dashboard de la sesión.
 *
 * @param {Object} entry - Datos del cálculo
 * @param {string} entry.type - Tipo de cálculo ('pipe_flow' | 'gas' | 'thermal')
 * @param {string} entry.title - Título descriptivo para mostrar en el listado
 * @param {Object} entry.calculationData - Payload completo ({ inputs, results, metadata })
 * @returns {Object} La entrada guardada, con id y timestamp asignados
 */
export function saveCalculation(entry) {
  const saved = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
    note: '',
    ...entry,
  }
  const entries = [saved, ...readAll()]
  writeAll(entries)
  return saved
}

/**
 * Actualiza la nota de campo de un cálculo guardado (p. ej. "Ojo: trazado
 * modificado por columna"). Pensada para anotaciones tomadas en obra.
 *
 * @param {string} id
 * @param {string} note
 */
export function updateCalculationNote(id, note) {
  writeAll(readAll().map((entry) => (entry.id === id ? { ...entry, note } : entry)))
}

/**
 * Devuelve todos los cálculos guardados en la sesión, más recientes primero.
 * @returns {Array<Object>}
 */
export function getCalculations() {
  return readAll()
}

/**
 * Elimina un cálculo guardado por id.
 * @param {string} id
 */
export function removeCalculation(id) {
  writeAll(readAll().filter((entry) => entry.id !== id))
}

/**
 * Vacía el dashboard de la sesión.
 */
export function clearCalculations() {
  writeAll([])
}

/**
 * Suscribe un listener a cambios en el almacén. Devuelve una función para
 * cancelar la suscripción.
 *
 * @param {(entries: Array<Object>) => void} listener
 * @returns {() => void}
 */
export function subscribeToCalculations(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

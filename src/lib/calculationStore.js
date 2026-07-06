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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  listeners.forEach((listener) => listener(entries))
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
    ...entry,
  }
  const entries = [saved, ...readAll()]
  writeAll(entries)
  return saved
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

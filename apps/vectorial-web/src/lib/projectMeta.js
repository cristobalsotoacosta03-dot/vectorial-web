/**
 * VECTORIAL - Datos de cabecera del proyecto (Autor, ID de Obra, Cliente,
 * Fecha). Persisten en localStorage durante toda la sesión y se incrustan
 * en cada Informe Técnico, para no tener que repetirlos cálculo a cálculo.
 *
 * @module projectMeta
 */

const STORAGE_KEY = 'vectorial_project_meta'

const DEFAULT_META = {
  author: '',
  projectId: '',
  client: '',
  date: '',
}

const listeners = new Set()

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_META }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_META, ...parsed }
  } catch {
    return { ...DEFAULT_META }
  }
}

/**
 * Devuelve los datos de cabecera actuales del proyecto.
 * @returns {{author: string, projectId: string, client: string, date: string}}
 */
export function getProjectMeta() {
  return read()
}

/**
 * Actualiza (parcialmente) los datos de cabecera del proyecto.
 * @param {Partial<{author: string, projectId: string, client: string, date: string}>} partial
 */
export function setProjectMeta(partial) {
  const next = { ...read(), ...partial }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Almacenamiento no disponible (privado/lleno): se mantiene en memoria
    // para esta sesión a través de los listeners, aunque no sobreviva a un reload.
  }
  listeners.forEach((listener) => listener(next))
}

/**
 * Suscribe un listener a cambios en los datos de cabecera.
 * @param {(meta: object) => void} listener
 * @returns {() => void} función para cancelar la suscripción
 */
export function subscribeToProjectMeta(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

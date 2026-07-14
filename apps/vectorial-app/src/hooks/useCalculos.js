import { useState, useEffect } from 'react'

const KEY   = 'vectorial_calculos_v1'
const EMPTY = { glp: [], tuberias: [], acs: [] }

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || EMPTY }
  catch { return EMPTY }
}

export function useCalculos() {
  const [calculos, setCalculos] = useState(read)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(calculos))
  }, [calculos])

  /**
   * Guarda un cálculo.
   * @param {string} tipo    'glp' | 'tuberias' | 'acs'
   * @param {string} obraId  id de la obra (puede ser null)
   * @param {string} obraNombre
   * @param {Array}  campos  [{ label, valor }]
   */
  function guardar(tipo, obraId, obraNombre, campos) {
    const item = {
      id:         String(Date.now()),
      fecha:      new Date().toISOString().slice(0, 10),
      obraId:     obraId || null,
      obraNombre: obraNombre || 'Sin obra asignada',
      campos,
    }
    setCalculos(prev => ({
      ...prev,
      [tipo]: [item, ...(prev[tipo] || [])].slice(0, 50),
    }))
    return item.id
  }

  function eliminar(tipo, id) {
    setCalculos(prev => ({
      ...prev,
      [tipo]: prev[tipo].filter(c => c.id !== id),
    }))
  }

  function limpiar(tipo) {
    setCalculos(prev => ({ ...prev, [tipo]: [] }))
  }

  const total = Object.values(calculos).reduce((s, arr) => s + arr.length, 0)

  return { calculos, guardar, eliminar, limpiar, total }
}

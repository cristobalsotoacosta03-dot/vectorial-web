import { useState, useEffect } from 'react'

const KEY = 'vectorial_partidas_v1'

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} }
  catch { return {} }
}

/**
 * Gestiona el desglose de materiales (partidas) de una obra concreta.
 * Cada partida: { id, descripcion, unidad, cantidad, precio_unitario, margen_pct }
 */
export function usePartidas(obraId) {
  const [todas, setTodas] = useState(readAll)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(todas))
  }, [todas])

  const partidas = obraId ? (todas[obraId] || []) : []

  function addPartida(data) {
    if (!obraId) return
    const nueva = {
      id:             String(Date.now()),
      descripcion:    data.descripcion    || '',
      unidad:         data.unidad         || 'ud',
      cantidad:       parseFloat(data.cantidad)       || 1,
      precio_unitario:parseFloat(data.precio_unitario)|| 0,
      margen_pct:     parseFloat(data.margen_pct)     || 20,
    }
    setTodas(prev => ({
      ...prev,
      [obraId]: [nueva, ...(prev[obraId] || [])],
    }))
  }

  function removePartida(id) {
    setTodas(prev => ({
      ...prev,
      [obraId]: (prev[obraId] || []).filter(p => p.id !== id),
    }))
  }

  function updatePartida(id, data) {
    setTodas(prev => ({
      ...prev,
      [obraId]: (prev[obraId] || []).map(p => p.id === id ? { ...p, ...data } : p),
    }))
  }

  // ── KPIs derivados ──────────────────────────────────────────────────────
  const totalCoste  = partidas.reduce((s, p) => s + p.cantidad * p.precio_unitario, 0)
  const totalVenta  = partidas.reduce((s, p) => s + p.cantidad * p.precio_unitario * (1 + p.margen_pct / 100), 0)
  const beneficio   = totalVenta - totalCoste
  const margenMedio = partidas.length
    ? partidas.reduce((s, p) => s + p.margen_pct, 0) / partidas.length
    : 0

  return {
    partidas, addPartida, removePartida, updatePartida,
    kpi: { totalCoste, totalVenta, beneficio, margenMedio },
  }
}

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const KEY = 'vectorial_partidas_v1'

function readLocal() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} }
  catch { return {} }
}

function writeLocal(todas) {
  localStorage.setItem(KEY, JSON.stringify(todas))
}

/**
 * Gestiona el desglose de materiales (partidas) de una obra concreta.
 * Respaldado por la tabla `partidas_obra` de Supabase; si no hay sesión o
 * falla la conexión, cae a localStorage para que la app siga siendo usable
 * en modo demo (mismo patrón que useObras/usePresupuestos).
 */
export function usePartidas(obraId) {
  const { empresaId } = useAuth()
  const [partidas, setPartidas] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modoDemo, setModoDemo] = useState(false)

  const cargar = useCallback(async () => {
    if (!obraId) { setPartidas([]); setLoading(false); return }
    setLoading(true)
    try {
      if (!supabase || !empresaId) {
        setPartidas(readLocal()[obraId] || [])
        setModoDemo(true)
        return
      }
      const { data, error } = await supabase
        .from('partidas_obra')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('obra_id', obraId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setPartidas(readLocal()[obraId] || [])
        setModoDemo(true)
      } else {
        setPartidas(data || [])
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setPartidas(readLocal()[obraId] || [])
      setModoDemo(true)
    } finally {
      setLoading(false)
    }
  }, [obraId, empresaId])

  useEffect(() => { cargar() }, [cargar])

  async function addPartida(data) {
    if (!obraId) return
    const nueva = {
      descripcion:     data.descripcion || '',
      unidad:          data.unidad || 'ud',
      cantidad:        parseFloat(data.cantidad) || 1,
      precio_unitario: parseFloat(data.precio_unitario) || 0,
      margen_pct:      parseFloat(data.margen_pct) || 20,
      tipo:            data.tipo || 'material',
    }

    if (!supabase || !empresaId) {
      const conId = { ...nueva, id: String(Date.now()) }
      const todas = readLocal()
      todas[obraId] = [conId, ...(todas[obraId] || [])]
      writeLocal(todas)
      setPartidas(todas[obraId])
      return
    }

    const payload = { ...nueva, empresa_id: empresaId, obra_id: obraId }
    const { data: creada, error } = await supabase.from('partidas_obra').insert([payload]).select().single()
    if (error) { console.error('Supabase error:', error); return }
    setPartidas(prev => [creada, ...prev])
  }

  async function removePartida(id) {
    if (!supabase || !empresaId) {
      const todas = readLocal()
      todas[obraId] = (todas[obraId] || []).filter(p => p.id !== id)
      writeLocal(todas)
      setPartidas(todas[obraId])
      return
    }
    await supabase.from('partidas_obra').delete().eq('id', id)
    setPartidas(prev => prev.filter(p => p.id !== id))
  }

  async function updatePartida(id, data) {
    if (!supabase || !empresaId) {
      const todas = readLocal()
      todas[obraId] = (todas[obraId] || []).map(p => p.id === id ? { ...p, ...data } : p)
      writeLocal(todas)
      setPartidas(todas[obraId])
      return
    }
    const { data: actualizada, error } = await supabase.from('partidas_obra').update(data).eq('id', id).select().single()
    if (error) { console.error('Supabase error:', error); return }
    setPartidas(prev => prev.map(p => p.id === id ? actualizada : p))
  }

  // ── KPIs derivados ──────────────────────────────────────────────────────
  const totalCoste  = partidas.reduce((s, p) => s + p.cantidad * p.precio_unitario, 0)
  const totalVenta  = partidas.reduce((s, p) => s + p.cantidad * p.precio_unitario * (1 + p.margen_pct / 100), 0)
  const beneficio   = totalVenta - totalCoste
  const margenMedio = partidas.length
    ? partidas.reduce((s, p) => s + p.margen_pct, 0) / partidas.length
    : 0

  return {
    partidas, loading, modoDemo, addPartida, removePartida, updatePartida, recargar: cargar,
    kpi: { totalCoste, totalVenta, beneficio, margenMedio },
  }
}

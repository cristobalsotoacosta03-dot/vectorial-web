import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { TAREAS_OBRA_MOCK } from '../data/mocks'

const msPorDia = 1000 * 60 * 60 * 24
const dias = (a, b) => Math.round((new Date(b) - new Date(a)) / msPorDia)

/**
 * Planificación tipo Gantt de una obra: tareas con fechas, dependencias,
 * hitos y % de avance individual.
 */
export function useTareasObra(obraId) {
  const { empresaId } = useAuth()
  const [todas, setTodas]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modoDemo, setModoDemo] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      if (!supabase || !empresaId) {
        setTodas(TAREAS_OBRA_MOCK)
        setModoDemo(true)
        return
      }
      const { data, error } = await supabase
        .from('tareas_obra')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('orden', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        setTodas(TAREAS_OBRA_MOCK)
        setModoDemo(true)
      } else {
        setTodas(data || [])
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setTodas(TAREAS_OBRA_MOCK)
      setModoDemo(true)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => { cargar() }, [cargar])

  const tareas = (obraId ? todas.filter(t => t.obra_id === obraId) : [])
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || (a.fecha_inicio < b.fecha_inicio ? -1 : 1))

  async function addTarea(data) {
    if (!obraId) return { success: false, error: 'Selecciona una obra primero' }
    if (new Date(data.fecha_fin) < new Date(data.fecha_inicio)) {
      return { success: false, error: 'La fecha de fin no puede ser anterior a la de inicio' }
    }

    const nueva = {
      obra_id: obraId,
      nombre: data.nombre,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      progreso_pct: parseFloat(data.progreso_pct) || 0,
      hito: !!data.hito,
      responsable: data.responsable || null,
      dependencia_id: data.dependencia_id || null,
      orden: tareas.length + 1,
    }

    if (!supabase || !empresaId) {
      setTodas(prev => [...prev, { ...nueva, id: String(Date.now()) }])
      return { success: true }
    }

    const { data: creada, error } = await supabase.from('tareas_obra')
      .insert([{ ...nueva, empresa_id: empresaId }]).select().single()
    if (error) return { success: false, error: error.message }
    setTodas(prev => [...prev, creada])
    return { success: true }
  }

  async function updateTarea(id, data) {
    if (!supabase || !empresaId) {
      setTodas(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
      return
    }
    const { data: actualizada, error } = await supabase.from('tareas_obra').update(data).eq('id', id).select().single()
    if (error) { console.error('Supabase error:', error); return }
    setTodas(prev => prev.map(t => t.id === id ? actualizada : t))
  }

  async function removeTarea(id) {
    if (!supabase || !empresaId) {
      setTodas(prev => prev.filter(t => t.id !== id))
      return
    }
    await supabase.from('tareas_obra').delete().eq('id', id)
    setTodas(prev => prev.filter(t => t.id !== id))
  }

  // ── Rango temporal y avance ponderado ───────────────────────────────────
  const rango = tareas.length
    ? {
        inicio: tareas.reduce((min, t) => (t.fecha_inicio < min ? t.fecha_inicio : min), tareas[0].fecha_inicio),
        fin: tareas.reduce((max, t) => (t.fecha_fin > max ? t.fecha_fin : max), tareas[0].fecha_fin),
      }
    : null

  const duracionTotal = tareas.reduce((s, t) => s + Math.max(dias(t.fecha_inicio, t.fecha_fin), 1), 0)
  const avancePonderado = duracionTotal
    ? tareas.reduce((s, t) => s + Math.max(dias(t.fecha_inicio, t.fecha_fin), 1) * Number(t.progreso_pct), 0) / duracionTotal
    : 0

  return {
    tareas, loading, modoDemo, addTarea, updateTarea, removeTarea, recargar: cargar,
    kpi: { rango, avancePonderado, numTareas: tareas.length, numHitos: tareas.filter(t => t.hito).length },
  }
}

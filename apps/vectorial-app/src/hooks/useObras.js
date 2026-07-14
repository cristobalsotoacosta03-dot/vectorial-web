import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { OBRAS_MOCK } from '../data/mocks'

export function useObras() {
  const { empresaId } = useAuth()
  const [obras, setObras] = useState([])
  const [loading, setLoading] = useState(true)
  const [modoDemo, setModoDemo] = useState(false)
  const [error, setError] = useState(null)

  const cargarObras = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!supabase || !empresaId) {
        setObras(OBRAS_MOCK)
        setModoDemo(true)
        return
      }
      const { data, error: supabaseError } = await supabase
        .from('obras')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        setError(supabaseError.message || 'Error al conectar con la base de datos')
        setObras(OBRAS_MOCK)
        setModoDemo(true)
      } else {
        setObras(data || [])
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setError(err?.message || 'Error inesperado al cargar las obras')
      setObras(OBRAS_MOCK)
      setModoDemo(true)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => {
    cargarObras()
  }, [cargarObras])

  async function addObra(obraData) {
    if (!supabase || !empresaId) {
      setObras(prev => [{ ...obraData, id: String(Date.now()) }, ...prev])
      return { success: true }
    }
    // Las columnas fecha_inicio/fecha_fin son DATE: Postgres rechaza '' (solo
    // acepta una fecha válida o NULL), así que un campo de fecha vacío en el
    // formulario debe enviarse como null, no como cadena vacía.
    const payload = {
      ...obraData,
      fecha_inicio: obraData.fecha_inicio || null,
      fecha_fin: obraData.fecha_fin || null,
      empresa_id: empresaId,
    }
    const { data, error } = await supabase.from('obras').insert([payload]).select().single()
    if (error) return { success: false, error: error.message }
    setObras(prev => [data, ...prev])
    return { success: true }
  }

  // KPIs derivados
  const activas    = obras.filter(o => o.estado === 'activa').length
  const pausadas   = obras.filter(o => o.estado === 'pausada').length
  const finalizadas = obras.filter(o => o.estado === 'finalizada').length

  return { obras, loading, modoDemo, error, addObra, recargar: cargarObras, kpi: { activas, pausadas, finalizadas } }
}

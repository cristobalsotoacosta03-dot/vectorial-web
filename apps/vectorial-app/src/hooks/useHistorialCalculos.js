import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CALCULOS_MOCK } from '../data/mocks'

/**
 * Historial persistente de cálculos guardados desde las calculadoras
 * (ExportCalculo). Usa la tabla `calculos` (migración 004_calculos.sql),
 * con fallback a mock/localStorage cuando no hay sesión/Supabase.
 */
export function useHistorialCalculos() {
  const { empresaId } = useAuth()
  const [calculos, setCalculos] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modoDemo, setModoDemo] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      if (!supabase || !empresaId) {
        setCalculos(CALCULOS_MOCK)
        setModoDemo(true)
        return
      }
      const { data, error } = await supabase
        .from('calculos')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setCalculos(CALCULOS_MOCK)
        setModoDemo(true)
      } else {
        setCalculos(data || [])
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setCalculos(CALCULOS_MOCK)
      setModoDemo(true)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => { cargar() }, [cargar])

  /**
   * Guarda un cálculo.
   * @param {string} tipo    'glp' | 'tuberias' | 'acs' | 'conversor'
   * @param {string} titulo
   * @param {string} obraId  id de la obra (puede ser null)
   * @param {string} obraNombre
   * @param {Array}  campos  [{ label, valor }]
   */
  async function guardar(tipo, titulo, obraId, obraNombre, campos) {
    if (!supabase || !empresaId) {
      const nuevo = {
        id: String(Date.now()),
        tipo, titulo, campos,
        obra_id: obraId || null,
        obra_nombre: obraNombre || 'Sin obra asignada',
        created_at: new Date().toISOString(),
      }
      setCalculos(prev => [nuevo, ...prev])
      return { success: true, id: nuevo.id }
    }

    const payload = {
      empresa_id: empresaId,
      obra_id: obraId || null,
      tipo, titulo, campos,
    }
    const { data, error } = await supabase.from('calculos').insert([payload]).select().single()
    if (error) return { success: false, error: error.message }
    setCalculos(prev => [{ ...data, obra_nombre: obraNombre || 'Sin obra asignada' }, ...prev])
    return { success: true, id: data.id }
  }

  async function eliminar(id) {
    if (!supabase || !empresaId) {
      setCalculos(prev => prev.filter(c => c.id !== id))
      return
    }
    await supabase.from('calculos').delete().eq('id', id)
    setCalculos(prev => prev.filter(c => c.id !== id))
  }

  return { calculos, loading, modoDemo, guardar, eliminar, recargar: cargar }
}

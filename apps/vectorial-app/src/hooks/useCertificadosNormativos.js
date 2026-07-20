import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CERTIFICADOS_NORMATIVOS_MOCK } from '../data/mocks'

const TIPOS = ['oca', 'industria', 'municipal', 'otro']
const ESTADOS = ['pendiente', 'en_tramite', 'aprobada', 'rechazada']

/**
 * Certificados/trámites normativos de una obra (OCA, industria, municipal):
 * distinto de useCertificaciones (avance/facturación) — aquí se sigue el
 * estado del trámite administrativo y su fecha de vencimiento.
 */
export function useCertificadosNormativos(obraId) {
  const { empresaId } = useAuth()
  const [todos, setTodos]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modoDemo, setModoDemo] = useState(false)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!supabase || !empresaId) {
        setTodos(CERTIFICADOS_NORMATIVOS_MOCK)
        setModoDemo(true)
        return
      }
      const { data, error: supabaseError } = await supabase
        .from('certificados_normativos')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('fecha_vencimiento', { ascending: true, nullsFirst: false })

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        setError(supabaseError.message || 'Error al conectar con la base de datos')
        setTodos(CERTIFICADOS_NORMATIVOS_MOCK)
        setModoDemo(true)
      } else {
        setTodos(data || [])
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setError(err?.message || 'Error inesperado al cargar certificados')
      setTodos(CERTIFICADOS_NORMATIVOS_MOCK)
      setModoDemo(true)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => { cargar() }, [cargar])

  const certificados = obraId ? todos.filter(c => c.obra_id === obraId) : []

  async function addCertificado(data) {
    if (!obraId) return { success: false, error: 'Selecciona una obra primero' }

    if (!supabase || !empresaId) {
      const nuevo = {
        id: String(Date.now()),
        obra_id: obraId,
        nombre: data.nombre,
        tipo: data.tipo || 'oca',
        fecha_solicitud: data.fecha_solicitud || null,
        fecha_vencimiento: data.fecha_vencimiento || null,
        documento_url: data.documento_url || null,
        estado: data.estado || 'pendiente',
        notas: data.notas || '',
      }
      setTodos(prev => [...prev, nuevo])
      return { success: true }
    }

    const payload = {
      empresa_id: empresaId,
      obra_id: obraId,
      nombre: data.nombre,
      tipo: data.tipo || 'oca',
      fecha_solicitud: data.fecha_solicitud || null,
      fecha_vencimiento: data.fecha_vencimiento || null,
      documento_url: data.documento_url || null,
      estado: data.estado || 'pendiente',
      notas: data.notas || null,
    }
    const { data: nuevo, error } = await supabase.from('certificados_normativos').insert([payload]).select().single()
    if (error) return { success: false, error: error.message }
    setTodos(prev => [...prev, nuevo])
    return { success: true }
  }

  async function updateCertificado(id, data) {
    if (!supabase || !empresaId) {
      setTodos(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
      return { success: true }
    }
    const { data: actualizado, error } = await supabase.from('certificados_normativos').update(data).eq('id', id).select().single()
    if (error) return { success: false, error: error.message }
    setTodos(prev => prev.map(c => c.id === id ? actualizado : c))
    return { success: true }
  }

  async function removeCertificado(id) {
    if (!supabase || !empresaId) {
      setTodos(prev => prev.filter(c => c.id !== id))
      return
    }
    await supabase.from('certificados_normativos').delete().eq('id', id)
    setTodos(prev => prev.filter(c => c.id !== id))
  }

  const hoy = new Date().toISOString().slice(0, 10)
  const proximosVencer = certificados.filter(c => c.fecha_vencimiento && c.fecha_vencimiento >= hoy && c.fecha_vencimiento <= addDias(hoy, 30)).length
  const vencidos = certificados.filter(c => c.fecha_vencimiento && c.fecha_vencimiento < hoy && c.estado !== 'aprobada').length

  return {
    certificados, loading, modoDemo, error,
    addCertificado, updateCertificado, removeCertificado, recargar: cargar,
    kpi: { total: certificados.length, proximosVencer, vencidos },
    TIPOS, ESTADOS,
  }
}

function addDias(iso, dias) {
  const d = new Date(iso)
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

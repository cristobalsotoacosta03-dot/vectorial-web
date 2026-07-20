import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CERTIFICACIONES_MOCK } from '../data/mocks'

const ESTADOS = ['borrador', 'emitida', 'pagada']

/**
 * Gestiona las certificaciones de avance de una obra concreta: % de obra
 * ejecutada e importe certificado en cada corte, con su histórico.
 */
export function useCertificaciones(obraId) {
  const { empresaId } = useAuth()
  const [todas, setTodas]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modoDemo, setModoDemo] = useState(false)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!supabase || !empresaId) {
        setTodas(CERTIFICACIONES_MOCK)
        setModoDemo(true)
        return
      }
      const { data, error: supabaseError } = await supabase
        .from('certificaciones_obra')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('fecha', { ascending: true })

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        setError(supabaseError.message || 'Error al conectar con la base de datos')
        setTodas(CERTIFICACIONES_MOCK)
        setModoDemo(true)
      } else {
        setTodas(data || [])
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setError(err?.message || 'Error inesperado al cargar certificaciones')
      setTodas(CERTIFICACIONES_MOCK)
      setModoDemo(true)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => { cargar() }, [cargar])

  const certificaciones = obraId ? todas.filter(c => c.obra_id === obraId) : []

  async function addCertificacion(data) {
    if (!obraId) return { success: false, error: 'Selecciona una obra primero' }
    const numero = `CERT-${String(certificaciones.length + 1).padStart(2, '0')}`

    if (!supabase || !empresaId) {
      const nueva = {
        id: String(Date.now()),
        obra_id: obraId,
        numero,
        fecha: data.fecha || new Date().toISOString().slice(0, 10),
        pct_avance: parseFloat(data.pct_avance),
        importe_certificado: parseFloat(data.importe_certificado),
        estado: data.estado || 'borrador',
        notas: data.notas || '',
      }
      setTodas(prev => [...prev, nueva])
      return { success: true }
    }

    const payload = {
      empresa_id: empresaId,
      obra_id: obraId,
      numero,
      fecha: data.fecha || new Date().toISOString().slice(0, 10),
      pct_avance: parseFloat(data.pct_avance),
      importe_certificado: parseFloat(data.importe_certificado),
      estado: data.estado || 'borrador',
      notas: data.notas || null,
    }
    const { data: nueva, error } = await supabase.from('certificaciones_obra').insert([payload]).select().single()
    if (error) return { success: false, error: error.message }
    setTodas(prev => [...prev, nueva])
    return { success: true }
  }

  async function removeCertificacion(id) {
    if (!supabase || !empresaId) {
      setTodas(prev => prev.filter(c => c.id !== id))
      return
    }
    await supabase.from('certificaciones_obra').delete().eq('id', id)
    setTodas(prev => prev.filter(c => c.id !== id))
  }

  // KPIs derivados
  const ultima = certificaciones.length
    ? certificaciones.reduce((a, b) => (a.fecha > b.fecha ? a : b))
    : null
  const totalCertificado = certificaciones.reduce((s, c) => s + Number(c.importe_certificado), 0)

  return {
    certificaciones, loading, modoDemo, error, addCertificacion, removeCertificacion, recargar: cargar,
    kpi: { pctActual: ultima?.pct_avance ?? 0, totalCertificado, numCertificaciones: certificaciones.length },
    ESTADOS,
  }
}

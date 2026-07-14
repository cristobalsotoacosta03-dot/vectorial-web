import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { PRESUPUESTOS_MOCK } from '../data/mocks'

const calcTotal = (base, pct) => Number(base) * (1 + Number(pct) / 100)

export function usePresupuestos() {
  const { empresaId } = useAuth()
  const [presupuestos, setPresupuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modoDemo, setModoDemo] = useState(false)
  const [error, setError] = useState(null)
  const [nextNum, setNextNum] = useState(6)

  const cargarPresupuestos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!supabase || !empresaId) {
        setPresupuestos(PRESUPUESTOS_MOCK)
        setModoDemo(true)
        return
      }
      // La tabla real no guarda el nombre de la obra, solo obra_id (FK) —
      // se trae vía join para no tener que tocar el resto de la UI, que
      // sigue leyendo p.obra_nombre.
      const { data, error: supabaseError } = await supabase
        .from('presupuestos')
        .select('*, obras(nombre)')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        setError(supabaseError.message || 'Error al conectar con la base de datos')
        setPresupuestos(PRESUPUESTOS_MOCK)
        setModoDemo(true)
      } else {
        setPresupuestos((data || []).map(p => ({ ...p, obra_nombre: p.obras?.nombre ?? '—' })))
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setError(err?.message || 'Error inesperado al cargar los presupuestos')
      setPresupuestos(PRESUPUESTOS_MOCK)
      setModoDemo(true)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => {
    cargarPresupuestos()
  }, [cargarPresupuestos])

  async function addPresupuesto(formData) {
    const numero = `PRES-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`
    setNextNum(n => n + 1)

    if (!supabase || !empresaId) {
      const nuevo = {
        numero,
        obra_nombre: formData.obra_nombre,
        fecha: formData.fecha || new Date().toISOString().slice(0, 10),
        importe_base: parseFloat(formData.importe_base),
        margen_pct: parseFloat(formData.margen_pct),
        estado: formData.estado,
      }
      setPresupuestos(prev => [{ ...nuevo, id: String(Date.now()) }, ...prev])
      return { success: true }
    }

    const nuevo = {
      empresa_id: empresaId,
      obra_id: formData.obra_id,
      numero,
      fecha: formData.fecha || new Date().toISOString().slice(0, 10),
      importe_base: parseFloat(formData.importe_base),
      margen_pct: parseFloat(formData.margen_pct),
      estado: formData.estado,
    }
    const { data, error } = await supabase.from('presupuestos').insert([nuevo]).select('*, obras(nombre)').single()
    if (error) return { success: false, error: error.message }
    setPresupuestos(prev => [{ ...data, obra_nombre: data.obras?.nombre ?? '—' }, ...prev])
    return { success: true }
  }

  // KPIs derivados
  const pendientes  = presupuestos.filter(p => p.estado === 'enviado').length
  const aceptados   = presupuestos.filter(p => p.estado === 'aceptado')
  const totalAcept  = aceptados.reduce((acc, p) => acc + calcTotal(p.importe_base, p.margen_pct), 0)
  const margenMedio = presupuestos.length
    ? presupuestos.reduce((acc, p) => acc + Number(p.margen_pct), 0) / presupuestos.length
    : 0

  return {
    presupuestos, loading, modoDemo, error, addPresupuesto, calcTotal, recargar: cargarPresupuestos,
    kpi: { pendientes, totalAcept, margenMedio, numAceptados: aceptados.length },
  }
}

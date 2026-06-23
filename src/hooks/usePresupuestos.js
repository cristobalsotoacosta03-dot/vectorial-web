import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { PRESUPUESTOS_MOCK } from '../data/mocks'

const calcTotal = (base, pct) => Number(base) * (1 + Number(pct) / 100)

export function usePresupuestos() {
  const [presupuestos, setPresupuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modoDemo, setModoDemo] = useState(false)
  const [error, setError] = useState(null)
  const [nextNum, setNextNum] = useState(6)

  const cargarPresupuestos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!supabase) {
        setPresupuestos(PRESUPUESTOS_MOCK)
        setModoDemo(true)
        return
      }
      const { data, error: supabaseError } = await supabase
        .from('presupuestos')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        setError(supabaseError.message || 'Error al conectar con la base de datos')
        setPresupuestos(PRESUPUESTOS_MOCK)
        setModoDemo(true)
      } else {
        setPresupuestos(data || [])
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setError(err?.message || 'Error inesperado al cargar los presupuestos')
      setPresupuestos(PRESUPUESTOS_MOCK)
      setModoDemo(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarPresupuestos()
  }, [cargarPresupuestos])

  async function addPresupuesto(formData) {
    const numero = `PRES-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`
    setNextNum(n => n + 1)
    const nuevo = {
      numero,
      obra_nombre: formData.obra_nombre,
      fecha: formData.fecha || new Date().toISOString().slice(0, 10),
      importe_base: parseFloat(formData.importe_base),
      margen_pct: parseFloat(formData.margen_pct),
      estado: formData.estado,
    }
    if (!supabase) {
      setPresupuestos(prev => [{ ...nuevo, id: String(Date.now()) }, ...prev])
      return
    }
    const { data, error } = await supabase.from('presupuestos').insert([nuevo]).select().single()
    if (!error && data) setPresupuestos(prev => [data, ...prev])
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

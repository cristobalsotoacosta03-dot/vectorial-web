import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { PROVEEDORES_MOCK, PRECIOS_PROVEEDOR_MOCK } from '../data/mocks'

/**
 * Gestiona proveedores y sus ofertas de precio por material, para poder
 * comparar qué proveedor ofrece mejor precio/plazo para un mismo material.
 */
export function useProveedores() {
  const { empresaId } = useAuth()
  const [proveedores, setProveedores] = useState([])
  const [precios, setPrecios]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [modoDemo, setModoDemo]       = useState(false)
  const [error, setError]             = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!supabase || !empresaId) {
        setProveedores(PROVEEDORES_MOCK)
        setPrecios(PRECIOS_PROVEEDOR_MOCK)
        setModoDemo(true)
        return
      }
      const [resProveedores, resPrecios] = await Promise.all([
        supabase.from('proveedores').select('*').eq('empresa_id', empresaId).order('nombre'),
        supabase.from('precios_proveedor').select('*').eq('empresa_id', empresaId).order('fecha', { ascending: false }),
      ])

      if (resProveedores.error || resPrecios.error) {
        const supabaseError = resProveedores.error || resPrecios.error
        console.error('Supabase error:', supabaseError)
        setError(supabaseError.message || 'Error al conectar con la base de datos')
        setProveedores(PROVEEDORES_MOCK)
        setPrecios(PRECIOS_PROVEEDOR_MOCK)
        setModoDemo(true)
      } else {
        setProveedores(resProveedores.data || [])
        setPrecios(resPrecios.data || [])
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setError(err?.message || 'Error inesperado al cargar proveedores')
      setProveedores(PROVEEDORES_MOCK)
      setPrecios(PRECIOS_PROVEEDOR_MOCK)
      setModoDemo(true)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => { cargar() }, [cargar])

  async function addProveedor(data) {
    if (!supabase || !empresaId) {
      setProveedores(prev => [...prev, { ...data, id: String(Date.now()), activo: true }])
      return { success: true }
    }
    const payload = { ...data, empresa_id: empresaId }
    const { data: nuevo, error } = await supabase.from('proveedores').insert([payload]).select().single()
    if (error) return { success: false, error: error.message }
    setProveedores(prev => [...prev, nuevo])
    return { success: true }
  }

  async function addOferta(data) {
    if (!supabase || !empresaId) {
      const nueva = { ...data, id: String(Date.now()), fecha: data.fecha || new Date().toISOString().slice(0, 10) }
      setPrecios(prev => [nueva, ...prev])
      return { success: true }
    }
    const payload = {
      empresa_id: empresaId,
      material_nombre: data.material_nombre,
      proveedor_id: data.proveedor_id,
      precio: parseFloat(data.precio),
      unidad: data.unidad || 'ud',
      fecha: data.fecha || new Date().toISOString().slice(0, 10),
      plazo_dias: data.plazo_dias ? parseInt(data.plazo_dias, 10) : null,
      notas: data.notas || null,
    }
    const { data: nueva, error } = await supabase.from('precios_proveedor').insert([payload]).select().single()
    if (error) return { success: false, error: error.message }
    setPrecios(prev => [nueva, ...prev])
    return { success: true }
  }

  async function removeOferta(id) {
    if (!supabase || !empresaId) {
      setPrecios(prev => prev.filter(p => p.id !== id))
      return
    }
    await supabase.from('precios_proveedor').delete().eq('id', id)
    setPrecios(prev => prev.filter(p => p.id !== id))
  }

  // Materiales únicos con ofertas registradas, para el selector de comparación
  const materialesConOfertas = [...new Set(precios.map(p => p.material_nombre))].sort()

  function comparativaPorMaterial(materialNombre) {
    const ofertas = precios
      .filter(p => p.material_nombre === materialNombre)
      .map(p => ({ ...p, proveedor: proveedores.find(pr => pr.id === p.proveedor_id) }))
      .sort((a, b) => a.precio - b.precio)
    return ofertas
  }

  return {
    proveedores, precios, loading, modoDemo, error,
    addProveedor, addOferta, removeOferta, recargar: cargar,
    materialesConOfertas, comparativaPorMaterial,
  }
}

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const KEY = 'vectorial_documentos_obra_v1'

function readLocal() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} }
  catch { return {} }
}

function writeLocal(todos) {
  localStorage.setItem(KEY, JSON.stringify(todos))
}

/**
 * Borrador editable de un documento de obra (memoria técnica, plan de
 * calidad o estudio de seguridad). Un único registro por (obra, tipo),
 * guardado como JSONB en `documentos_obra`. Cae a localStorage si no hay
 * sesión o falla Supabase, igual que el resto de hooks de la app.
 */
export function useDocumentoObra(obraId, tipo) {
  const { empresaId } = useAuth()
  const [contenido, setContenido] = useState({})
  const [loading, setLoading]     = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [modoDemo, setModoDemo]   = useState(false)

  const localKey = obraId ? `${obraId}:${tipo}` : null

  const cargar = useCallback(async () => {
    if (!obraId) { setContenido({}); setLoading(false); return }
    setLoading(true)
    try {
      if (!supabase || !empresaId) {
        setContenido(readLocal()[localKey] || {})
        setModoDemo(true)
        return
      }
      const { data, error } = await supabase
        .from('documentos_obra')
        .select('contenido')
        .eq('empresa_id', empresaId)
        .eq('obra_id', obraId)
        .eq('tipo', tipo)
        .maybeSingle()

      if (error) {
        console.error('Supabase error:', error)
        setContenido(readLocal()[localKey] || {})
        setModoDemo(true)
      } else {
        setContenido(data?.contenido || {})
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setContenido(readLocal()[localKey] || {})
      setModoDemo(true)
    } finally {
      setLoading(false)
    }
  }, [obraId, tipo, empresaId, localKey])

  useEffect(() => { cargar() }, [cargar])

  async function guardar(nuevoContenido) {
    setContenido(nuevoContenido)
    setGuardando(true)
    try {
      if (!supabase || !empresaId) {
        const todos = readLocal()
        todos[localKey] = nuevoContenido
        writeLocal(todos)
        return { success: true }
      }
      const { error } = await supabase.from('documentos_obra')
        .upsert(
          { empresa_id: empresaId, obra_id: obraId, tipo, contenido: nuevoContenido },
          { onConflict: 'obra_id,tipo' }
        )
      if (error) return { success: false, error: error.message }
      return { success: true }
    } finally {
      setGuardando(false)
    }
  }

  return { contenido, loading, guardando, modoDemo, guardar, recargar: cargar }
}

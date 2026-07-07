import { useState, useEffect, useCallback } from 'react'
import { conexionActiva, dbMateriales } from '../lib/db-client'
import { CATALOGO_TECNICO } from '../data/catalogo-tecnico'

// Adapta el catálogo estático al shape de la tabla materiales de Supabase
function adaptarCatalogo(items) {
  return items.map(item => ({
    id:             String(item.id),
    nombre:         item.nombre,
    categoria:      item.cat,
    subcategoria:   item.subcat,
    unidad:         item.unidad,
    precio_ref:     item.precio,
    normativa:      item.normativa,
    descripcion:    item.desc,
    notas_tecnicas: item.notas,
    tags:           item.tags || [],
  }))
}

export function useMateriales(filtros = {}) {
  const [materiales, setMateriales] = useState([])
  const [loading, setLoading] = useState(true)
  const [modoDemo, setModoDemo] = useState(false)

  const cargar = useCallback(() => {
    if (!conexionActiva) {
      setMateriales(adaptarCatalogo(CATALOGO_TECNICO))
      setModoDemo(true)
      setLoading(false)
      return
    }
    setLoading(true)
    dbMateriales.listar(filtros).then(({ data, error }) => {
      if (error) {
        console.error('[materiales] listar:', error)
        setMateriales(adaptarCatalogo(CATALOGO_TECNICO))
        setModoDemo(true)
      } else {
        setMateriales(data || [])
      }
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.categoria, filtros.busqueda])

  useEffect(() => { cargar() }, [cargar])

  async function addMaterial(data) {
    if (!conexionActiva) {
      setMateriales(prev => [{ ...data, id: String(Date.now()) }, ...prev])
      return
    }
    const { data: nuevo, error } = await dbMateriales.insertar(data)
    if (!error && nuevo) setMateriales(prev => [nuevo, ...prev])
  }

  async function updateMaterial(id, cambios) {
    if (!conexionActiva) {
      setMateriales(prev => prev.map(m => m.id === id ? { ...m, ...cambios } : m))
      return
    }
    const { data, error } = await dbMateriales.actualizar(id, cambios)
    if (!error && data) setMateriales(prev => prev.map(m => m.id === id ? data : m))
  }

  async function deleteMaterial(id) {
    if (!conexionActiva) {
      setMateriales(prev => prev.filter(m => m.id !== id))
      return
    }
    const { error } = await dbMateriales.eliminar(id)
    if (!error) setMateriales(prev => prev.filter(m => m.id !== id))
  }

  return { materiales, loading, modoDemo, addMaterial, updateMaterial, deleteMaterial }
}

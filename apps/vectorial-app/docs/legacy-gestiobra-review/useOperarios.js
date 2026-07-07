import { useState, useEffect } from 'react'
import { conexionActiva, dbOperarios } from '../lib/db-client'
import { OPERARIOS_MOCK } from '../data/mocks'

export function useOperarios(soloActivos = true) {
  const [operarios, setOperarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modoDemo, setModoDemo] = useState(false)

  useEffect(() => {
    if (!conexionActiva) {
      setOperarios(OPERARIOS_MOCK)
      setModoDemo(true)
      setLoading(false)
      return
    }
    dbOperarios.listar(soloActivos).then(({ data, error }) => {
      if (error) { console.error('[operarios] listar:', error); setOperarios(OPERARIOS_MOCK); setModoDemo(true) }
      else setOperarios(data || [])
      setLoading(false)
    })
  }, [soloActivos])

  async function addOperario(data) {
    if (!conexionActiva) {
      setOperarios(prev => [{ ...data, id: String(Date.now()), activo: true }, ...prev])
      return
    }
    const { data: nuevo, error } = await dbOperarios.insertar({ ...data, activo: true })
    if (!error && nuevo) setOperarios(prev => [nuevo, ...prev])
  }

  async function updateOperario(id, cambios) {
    if (!conexionActiva) {
      setOperarios(prev => prev.map(o => o.id === id ? { ...o, ...cambios } : o))
      return
    }
    const { data, error } = await dbOperarios.actualizar(id, cambios)
    if (!error && data) setOperarios(prev => prev.map(o => o.id === id ? data : o))
  }

  // Baja lógica: marca inactivo en lugar de borrar físicamente
  function deleteOperario(id) {
    return updateOperario(id, { activo: false })
  }

  const porCategoria = operarios.reduce((acc, o) => {
    acc[o.categoria] = (acc[o.categoria] || 0) + 1
    return acc
  }, {})
  const tarifaMedia = operarios.length
    ? operarios.reduce((s, o) => s + Number(o.tarifa_hora || 0), 0) / operarios.length
    : 0

  return {
    operarios, loading, modoDemo,
    addOperario, updateOperario, deleteOperario,
    kpi: { porCategoria, tarifaMedia },
  }
}

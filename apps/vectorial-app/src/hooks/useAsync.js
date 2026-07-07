import { useState, useCallback } from 'react'

/**
 * Hook genérico para operaciones asíncronas con manejo de errores.
 * Proporciona estados: loading, error, data.
 */
export function useAsync(asyncFn, deps = []) {
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [data, setData]       = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFn(...args)
      setData(result)
      return result
    } catch (err) {
      const mensaje = err?.message || 'Error desconocido al cargar los datos'
      setError(mensaje)
      console.error('useAsync error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, deps)

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])

  return { loading, error, data, execute, reset }
}

/**
 * Hook para peticiones fetch con manejo de errores amigable.
 */
export function useFetch(url, opciones = {}) {
  return useAsync(async () => {
    const respuesta = await fetch(url, opciones)
    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: No se pudo cargar ${url}`)
    }
    return await respuesta.json()
  }, [url, JSON.stringify(opciones)])
}
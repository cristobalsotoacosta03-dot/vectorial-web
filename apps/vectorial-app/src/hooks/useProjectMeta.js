import { useEffect, useState } from 'react'
import { getProjectMeta, subscribeToProjectMeta } from '../lib/projectMeta'

/**
 * Hook de estado global sobre los datos de cabecera del proyecto (Autor,
 * ID de Obra, Cliente, Fecha), compartidos entre el formulario del Dashboard
 * y todos los Informes Técnicos.
 *
 * @returns {{author: string, projectId: string, client: string, date: string}}
 */
export function useProjectMeta() {
  const [meta, setMeta] = useState(() => getProjectMeta())

  useEffect(() => subscribeToProjectMeta(setMeta), [])

  return meta
}

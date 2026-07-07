import { useEffect, useState } from 'react'
import { getCalculations, subscribeToCalculations } from '../lib/calculationStore'

/**
 * Hook de estado global sobre el historial de cálculos guardados: cualquier
 * componente que lo use se re-renderiza automáticamente en cuanto se guarda,
 * edita o elimina un cálculo en cualquier otro componente — sin recargar la
 * página y sin pasar props entre el Dashboard y los informes.
 *
 * @returns {Array<Object>} Cálculos guardados, más recientes primero
 */
export function useCalculationHistory() {
  const [entries, setEntries] = useState(() => getCalculations())

  useEffect(() => subscribeToCalculations(setEntries), [])

  return entries
}

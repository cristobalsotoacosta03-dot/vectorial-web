import { useNavigate } from 'react-router-dom'
import { Layers } from 'lucide-react'

/**
 * Botón que abre la Librería de Componentes filtrada para volver directamente
 * a esta calculadora con el componente elegido ya prellenado en el formulario.
 */
export default function BuscarComponenteButton({ calculadoraId, className = '' }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate('/componentes', { state: { retorno: calculadoraId } })}
      className={`flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/30 bg-primary-50 dark:bg-primary-500/10 px-3 py-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors ${className}`}
    >
      <Layers size={13} /> Buscar componente
    </button>
  )
}

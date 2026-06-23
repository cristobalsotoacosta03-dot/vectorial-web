/**
 * Componente reutilizable para mostrar errores de carga de forma amigable.
 */
export default function ErrorMessage({ 
  error, 
  onRetry, 
  titulo = 'Error al cargar datos',
  mensaje = 'No se pudieron cargar los datos. Por favor, inténtalo de nuevo.'
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{titulo}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{mensaje}</p>
      
      {error && (
        <details className="mb-6 text-left max-w-md w-full">
          <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 font-medium">
            Ver detalles técnicos
          </summary>
          <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-red-600 font-mono break-all">{error}</p>
          </div>
        </details>
      )}

      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 transition-colors shadow-sm"
          >
            Reintentar
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors"
        >
          Recargar página
        </button>
      </div>
    </div>
  )
}
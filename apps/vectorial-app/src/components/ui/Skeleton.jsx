const VARIANTS = {
  text:        'rounded-md h-4',
  circular:    'rounded-full',
  rectangular: 'rounded-xl',
}

function Piece({ variant, width, height, className }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      style={{ width, height }}
      className={`block animate-pulse bg-slate-200 dark:bg-slate-800 ${VARIANTS[variant]} ${className}`}
    />
  )
}

/**
 * Placeholder de carga que imita la forma del contenido real, para reducir
 * la sensación de espera frente a un spinner genérico.
 * variant: 'text' | 'circular' | 'rectangular'
 * count: repite la pieza N veces en columna (solo 'text')
 */
export default function Skeleton({ variant = 'text', width = '100%', height, count = 1, className = '' }) {
  if (count > 1) {
    return (
      <div className="space-y-2" role="status" aria-label="Cargando">
        {Array.from({ length: count }).map((_, i) => (
          <Piece key={i} variant={variant} width={i === count - 1 ? '60%' : width} height={height} className={className} />
        ))}
      </div>
    )
  }
  return <Piece variant={variant} width={width} height={height} className={className} />
}

/** Tarjeta KPI (icono + número + etiqueta), para grids de estadísticas. */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={60} height={18} />
      </div>
      <Skeleton variant="text" width="50%" height={28} className="mb-2" />
      <Skeleton variant="text" width="70%" height={14} />
    </div>
  )
}

/** Fila de tabla genérica, para listas mientras cargan desde Supabase. */
export function SkeletonRow({ columns = 4, className = '' }) {
  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${className}`}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" height={14} className={i === 0 ? 'w-1/3' : 'flex-1'} />
      ))}
    </div>
  )
}

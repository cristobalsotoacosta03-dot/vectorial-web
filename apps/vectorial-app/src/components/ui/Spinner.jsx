const SIZES = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-9 h-9 border-[3px]' }

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={`inline-block rounded-full border-current border-t-transparent animate-spin ${SIZES[size]} ${className}`}
    />
  )
}

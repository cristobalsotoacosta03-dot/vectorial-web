const VARIANTS = {
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  error:   'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400',
}

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  )
}

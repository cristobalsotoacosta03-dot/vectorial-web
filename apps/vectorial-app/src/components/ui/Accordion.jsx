import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * Panel expandible individual. Úsalo suelto o varios seguidos para un
 * acordeón — cada uno controla su propio estado abierto/cerrado.
 */
export default function Accordion({ title, children, defaultOpen = false, className = '' }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {title}
        <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 py-3 bg-white dark:bg-slate-900">
          {children}
        </div>
      )}
    </div>
  )
}

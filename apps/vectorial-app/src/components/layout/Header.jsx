import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Home, Building2, FileText, Package, BookOpen, Calculator, PenTool, User, CreditCard, Settings } from 'lucide-react'
import Modal from '../ui/Modal'

const DESTINOS = [
  { to: '/',             label: 'Inicio',                      icon: Home },
  { to: '/obras',        label: 'Obras',                       icon: Building2 },
  { to: '/presupuestos', label: 'Presupuestos',                icon: FileText },
  { to: '/materiales',   label: 'Materiales',                  icon: Package },
  { to: '/catalogo',     label: 'Catálogo técnico',            icon: BookOpen },
  { to: '/calculadoras', label: 'Calculadoras',                icon: Calculator },
  { to: '/planos',       label: 'Editor de planos',            icon: PenTool },
  { to: '/perfil',       label: 'Mi Perfil',                   icon: User },
  { to: '/billing',      label: 'Facturación / Suscripción',   icon: CreditCard },
  { to: '/ajustes',      label: 'Ajustes',                     icon: Settings },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return DESTINOS
    return DESTINOS.filter(d => d.label.toLowerCase().includes(q))
  }, [query])

  function ir(to) {
    navigate(to)
    setOpen(false)
  }

  return (
    <header className="h-16 flex items-center gap-4 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
      <button
        onClick={() => setOpen(true)}
        className="flex-1 max-w-sm flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
      >
        <Search size={16} />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="hidden sm:inline text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">Ctrl K</kbd>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Buscar">
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ir a obras, presupuestos, calculadoras..."
          className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {resultados.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">Sin resultados</p>
          )}
          {resultados.map(d => {
            const Icon = d.icon
            return (
              <button
                key={d.to}
                onClick={() => ir(d.to)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <Icon size={16} />
                {d.label}
              </button>
            )
          })}
        </div>
      </Modal>
    </header>
  )
}

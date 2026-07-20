import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Menu, Printer, Home, Building2, FolderOpen, FileText, Package, Layers, Calculator, PenTool, Truck, ClipboardCheck, GanttChartSquare, FileBadge, History, User, CreditCard, Settings } from 'lucide-react'
import Modal from '../ui/Modal'
import { useObras } from '../../hooks/useObras'
import { usePresupuestos } from '../../hooks/usePresupuestos'

const GRUPOS = [
  {
    label: 'Navegación',
    destinos: [
      { to: '/',             label: 'Inicio',                      icon: Home },
      { to: '/calculadoras', label: 'Calculadoras',                icon: Calculator },
      { to: '/historial',    label: 'Historial de cálculos',       icon: History },
      { to: '/componentes',  label: 'Componentes técnicos',        icon: Layers },
      { to: '/planos',       label: 'Editor de planos',            icon: PenTool },
    ],
  },
  {
    label: 'Gestión',
    destinos: [
      { to: '/obras',        label: 'Obras',                       icon: Building2 },
      { to: '/proyectos',    label: 'Mis Proyectos',               icon: FolderOpen },
      { to: '/presupuestos', label: 'Presupuestos',                icon: FileText },
      { to: '/materiales',   label: 'Materiales',                  icon: Package },
      { to: '/proveedores',  label: 'Proveedores',                 icon: Truck },
      { to: '/certificaciones', label: 'Certificaciones',          icon: ClipboardCheck },
      { to: '/gantt',        label: 'Planificación',               icon: GanttChartSquare },
      { to: '/documentacion', label: 'Documentación',               icon: FileBadge },
    ],
  },
  {
    label: 'Cuenta',
    destinos: [
      { to: '/perfil',       label: 'Mi Perfil',                   icon: User },
      { to: '/billing',      label: 'Facturación / Suscripción',   icon: CreditCard },
      { to: '/ajustes',      label: 'Ajustes',                     icon: Settings },
    ],
  },
]

export default function Header({ onOpenMobileMenu }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()
  const { obras } = useObras()
  const { presupuestos } = usePresupuestos()
  const listRef = useRef(null)

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

  useEffect(() => { setActiveIndex(0) }, [query])

  const grupos = useMemo(() => {
    const q = query.trim().toLowerCase()

    const gruposDestinos = GRUPOS.map(g => ({
      label: g.label,
      items: (q ? g.destinos.filter(d => d.label.toLowerCase().includes(q)) : g.destinos)
        .map(d => ({ ...d, subtitle: null })),
    })).filter(g => g.items.length > 0)

    if (!q) return gruposDestinos

    const obrasMatch = obras
      .filter(o => o.nombre?.toLowerCase().includes(q) || o.cliente?.toLowerCase().includes(q))
      .slice(0, 5)
      .map(o => ({ to: '/obras', label: o.nombre, subtitle: `Obra · ${o.cliente || ''}`, icon: Building2 }))

    const presMatch = presupuestos
      .filter(p => p.numero?.toLowerCase().includes(q) || p.obra_nombre?.toLowerCase().includes(q))
      .slice(0, 5)
      .map(p => ({ to: '/presupuestos', label: p.numero, subtitle: `Presupuesto · ${p.obra_nombre || ''}`, icon: FileText }))

    const gruposDatos = []
    if (obrasMatch.length) gruposDatos.push({ label: 'Obras', items: obrasMatch })
    if (presMatch.length) gruposDatos.push({ label: 'Presupuestos', items: presMatch })

    return [...gruposDatos, ...gruposDestinos]
  }, [query, obras, presupuestos])

  // Lista plana para poder navegar con flechas independientemente del agrupado visual
  const planos = useMemo(() => grupos.flatMap(g => g.items), [grupos])

  function ir(to) {
    navigate(to)
    setOpen(false)
  }

  function onKeyDownInput(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, planos.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = planos[activeIndex]
      if (item) ir(item.to)
    }
  }

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  let contador = -1

  return (
    <header data-print-hide className="h-16 flex items-center gap-3 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
      <button
        onClick={onOpenMobileMenu}
        aria-label="Abrir menú"
        className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
      >
        <Menu size={20} />
      </button>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 max-w-sm flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
      >
        <Search size={16} />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="hidden sm:inline text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">Ctrl K</kbd>
      </button>
      <button
        onClick={() => window.print()}
        aria-label="Imprimir página"
        title="Imprimir página (vista optimizada)"
        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-slate-200 transition-colors shrink-0"
      >
        <Printer size={18} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Buscar">
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKeyDownInput}
          placeholder="Ir a obras, presupuestos, calculadoras..."
          className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
        <div ref={listRef} className="space-y-3 max-h-72 overflow-y-auto">
          {planos.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">Sin resultados</p>
          )}
          {grupos.map(g => (
            <div key={g.label}>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-3 mb-1">{g.label}</p>
              <div className="space-y-0.5">
                {g.items.map(d => {
                  contador += 1
                  const idx = contador
                  const Icon = d.icon
                  return (
                    <button
                      key={`${d.to}-${d.label}`}
                      data-idx={idx}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => ir(d.to)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        idx === activeIndex ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span className="flex-1 text-left truncate">{d.label}</span>
                      {d.subtitle && <span className="text-xs text-slate-400 shrink-0">{d.subtitle}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><kbd className="font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">↑↓</kbd> navegar</span>
          <span className="flex items-center gap-1"><kbd className="font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Enter</kbd> abrir</span>
          <span className="flex items-center gap-1"><kbd className="font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Esc</kbd> cerrar</span>
        </div>
      </Modal>
    </header>
  )
}

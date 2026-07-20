import { useState, useMemo } from 'react'
import { Search, History, Trash2, Eye, Flame, Gauge, Droplets, RefreshCw } from 'lucide-react'
import { useHistorialCalculos } from '../hooks/useHistorialCalculos'
import { useObras } from '../hooks/useObras'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'

const TIPO_CFG = {
  glp:       { label: 'GLP',       icon: Flame,     color: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400' },
  tuberias:  { label: 'Tuberías',  icon: Gauge,     color: 'text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-400' },
  acs:       { label: 'ACS',       icon: Droplets,  color: 'text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400' },
  conversor: { label: 'Conversor', icon: RefreshCw, color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400' },
}

const fmtFecha = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Historial() {
  const { calculos, loading, modoDemo, eliminar } = useHistorialCalculos()
  const { obras } = useObras()
  const [query, setQuery] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [detalle, setDetalle] = useState(null)

  const obraNombre = (c) => c.obra_nombre || obras.find(o => o.id === c.obra_id)?.nombre || 'Sin obra asignada'

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    return calculos
      .filter(c => tipo === 'todos' || c.tipo === tipo)
      .filter(c => !q || c.titulo.toLowerCase().includes(q) || obraNombre(c).toLowerCase().includes(q))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  }, [calculos, query, tipo, obras])

  async function handleEliminar(id) {
    await eliminar(id)
    setDetalle(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Historial de cálculos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Cálculos guardados desde las calculadoras — {calculos.length} en total</p>
        </div>
        {modoDemo && <Badge variant="warning">Modo Demo</Badge>}
      </div>

      {/* Búsqueda + filtro por tipo */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por título u obra..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['todos', 'glp', 'tuberias', 'acs', 'conversor'].map(t => (
            <button key={t} onClick={() => setTipo(t)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                tipo === t
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}>
              {t === 'todos' ? 'Todos' : TIPO_CFG[t].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton width={50} height={20} className="rounded-full" />
              </div>
              <Skeleton width="80%" height={16} />
              <Skeleton width="50%" height={12} />
            </Card>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <History size={36} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium text-slate-600 dark:text-slate-300">
            {calculos.length === 0 ? 'Todavía no has guardado ningún cálculo' : 'Ningún cálculo coincide con la búsqueda'}
          </p>
          {calculos.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">Guarda un cálculo desde cualquier calculadora con el botón "Guardar cálculo" o Ctrl/Cmd+S</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(c => {
            const cfg = TIPO_CFG[c.tipo] || TIPO_CFG.glp
            const Icon = cfg.icon
            return (
              <Card key={c.id} className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <Badge variant="neutral">{cfg.label}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">{c.titulo}</h3>
                  <p className="text-xs text-slate-400 mt-1 truncate">{obraNombre(c)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{fmtFecha(c.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setDetalle(c)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <Eye size={14} /> Ver detalle
                  </button>
                  <button onClick={() => handleEliminar(c.id)} aria-label="Eliminar"
                    className="text-slate-300 hover:text-red-500 transition-colors p-1.5">
                    <Trash2 size={15} />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detalle del cálculo */}
      <Modal open={!!detalle} onClose={() => setDetalle(null)} title={detalle?.titulo}>
        {detalle && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{obraNombre(detalle)}</span>
              <span>·</span>
              <span>{fmtFecha(detalle.created_at)}</span>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {(detalle.campos || []).map((c, i) => (
                <div key={i} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{c.label}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 text-right">{c.valor}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              Vista de solo lectura del cálculo guardado — para modificar los parámetros, vuelve a abrir la calculadora correspondiente y guarda un nuevo cálculo.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}

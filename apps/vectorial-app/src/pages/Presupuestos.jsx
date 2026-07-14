import { useState, useMemo } from 'react'
import { Search, X, Plus, FileText } from 'lucide-react'
import { usePresupuestos } from '../hooks/usePresupuestos'
import { useObras } from '../hooks/useObras'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'

const ESTADO_CFG = {
  borrador:  { label: 'Borrador',  variant: 'neutral' },
  enviado:   { label: 'Enviado',   variant: 'primary' },
  aceptado:  { label: 'Aceptado',  variant: 'success' },
  rechazado: { label: 'Rechazado', variant: 'error'   },
}

const fmt = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtPct = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const FORM_VACIO = { obra_id: '', fecha: '', importe_base: '', margen_pct: 18, estado: 'borrador' }

export default function Presupuestos() {
  const { presupuestos, loading, modoDemo, addPresupuesto, calcTotal, kpi } = usePresupuestos()
  const { obras } = useObras()
  const { notify } = useToast()
  const [query, setQuery]         = useState('')
  const [mostrarForm, setForm]    = useState(false)
  const [form, setFormData]       = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)

  const lista = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return presupuestos
    return presupuestos.filter(p =>
      p.numero?.toLowerCase().includes(q) || p.obra_nombre?.toLowerCase().includes(q)
    )
  }, [presupuestos, query])

  const previewTotal = form.importe_base
    ? calcTotal(parseFloat(form.importe_base) || 0, parseFloat(form.margen_pct) || 0)
    : null

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)
    const obraSeleccionada = obras.find(o => o.id === form.obra_id)
    const res = await addPresupuesto({ ...form, obra_nombre: obraSeleccionada?.nombre })
    setGuardando(false)
    if (res?.success === false) {
      notify(res.error || 'No se pudo guardar el presupuesto', { type: 'error' })
      return
    }
    notify('Presupuesto guardado correctamente', { type: 'success' })
    setFormData(FORM_VACIO)
    setForm(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
      <Spinner /> Cargando presupuestos...
    </div>
  )

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Presupuestos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Aceptado: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{fmt(kpi.totalAcept)} €</span>
            <span className="mx-2 text-slate-300 dark:text-slate-700">·</span>
            Margen medio: <span className="font-semibold text-amber-600 dark:text-amber-400">{fmtPct(kpi.margenMedio)}%</span>
            <span className="mx-2 text-slate-300 dark:text-slate-700">·</span>
            {kpi.pendientes} pendiente{kpi.pendientes !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {modoDemo && <Badge variant="warning">Modo Demo</Badge>}
          <Button onClick={() => setForm(!mostrarForm)} icon={mostrarForm ? <X size={16} /> : <Plus size={16} />}>
            {mostrarForm ? 'Cancelar' : 'Nuevo presupuesto'}
          </Button>
        </div>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <Card className="p-6 mb-6 !border-primary-100 dark:!border-primary-500/20">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4">Nuevo presupuesto</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Obra vinculada *</label>
              <select required value={form.obra_id} onChange={e => setFormData(f => ({...f, obra_id: e.target.value}))}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                <option value="" disabled>Selecciona una obra…</option>
                {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
            </div>
            <Input label="Fecha" type="date" value={form.fecha}
              onChange={e => setFormData(f => ({...f, fecha: e.target.value}))} />
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Estado</label>
              <select value={form.estado} onChange={e => setFormData(f => ({...f, estado: e.target.value}))}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                {Object.entries(ESTADO_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <Input label="Importe base (€) *" required type="number" min="0" step="0.01" value={form.importe_base}
              onChange={e => setFormData(f => ({...f, importe_base: e.target.value}))} placeholder="0.00" />
            <Input label="Margen comercial (%)" type="number" min="0" max="100" step="0.5" value={form.margen_pct}
              onChange={e => setFormData(f => ({...f, margen_pct: e.target.value}))} />

            {previewTotal !== null && (
              <div className="md:col-span-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-4 py-3">
                <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Total con margen: </span>
                <span className="text-xl font-bold text-emerald-800 dark:text-emerald-300">{fmt(previewTotal)} €</span>
                <span className="text-emerald-600 dark:text-emerald-500 text-sm ml-2">(+{form.margen_pct}%)</span>
              </div>
            )}

            <div className="md:col-span-2 flex justify-end gap-3 mt-1">
              <Button type="button" variant="ghost" onClick={() => { setForm(false); setFormData(FORM_VACIO) }}>Cancelar</Button>
              <Button type="submit" loading={guardando}>Guardar presupuesto</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Búsqueda */}
      <div className="relative max-w-sm mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por número u obra..."
          className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
      </div>

      {/* Tabla */}
      {lista.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <FileText size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium text-slate-600 dark:text-slate-300">No hay presupuestos que coincidan</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                {['Número','Obra','Fecha','Base €','Margen','Total €','Estado'].map((h,i) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide ${
                    i >= 3 ? 'text-right' : 'text-left'
                  } ${i === 6 ? 'text-center' : ''} ${[2,4].includes(i) ? 'hidden md:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lista.map(p => {
                const est = ESTADO_CFG[p.estado]
                const total = calcTotal(p.importe_base, p.margen_pct)
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300 font-medium">{p.numero}</td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate">{p.obra_nombre}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 hidden md:table-cell">{p.fecha}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600 dark:text-slate-300">{fmt(p.importe_base)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-400 dark:text-slate-500 hidden md:table-cell">{p.margen_pct}%</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-800 dark:text-slate-100">{fmt(total)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant={est.variant}>{est.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

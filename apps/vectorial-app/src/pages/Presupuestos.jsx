import { useState, useMemo } from 'react'
import { Search, X, Plus, FileText } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts'
import { usePresupuestos } from '../hooks/usePresupuestos'
import { useObras } from '../hooks/useObras'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { SkeletonCard, SkeletonRow } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'

const ESTADO_CFG = {
  borrador:  { label: 'Borrador',  variant: 'neutral', color: '#94a3b8' },
  enviado:   { label: 'Enviado',   variant: 'primary', color: '#0066cc' },
  aceptado:  { label: 'Aceptado',  variant: 'success', color: '#10b981' },
  rechazado: { label: 'Rechazado', variant: 'error',   color: '#ef4444' },
}

const fmt = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtPct = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const FORM_VACIO = { obra_id: '', fecha: '', importe_base: '', margen_pct: 18, estado: 'borrador' }
const inicioMes = new Date().toISOString().slice(0, 7)

export default function Presupuestos() {
  const { presupuestos, loading, modoDemo, addPresupuesto, calcTotal, kpi } = usePresupuestos()
  const { obras } = useObras()
  const { notify } = useToast()
  const [query, setQuery]         = useState('')
  const [ordenImporte, setOrdenImporte] = useState(null) // null | 'asc' | 'desc'
  const [mostrarForm, setForm]    = useState(false)
  const [form, setFormData]       = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)

  const lista = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtrados = q
      ? presupuestos.filter(p => p.numero?.toLowerCase().includes(q) || p.obra_nombre?.toLowerCase().includes(q))
      : presupuestos
    if (!ordenImporte) return filtrados
    return [...filtrados].sort((a, b) => {
      const ta = calcTotal(a.importe_base, a.margen_pct)
      const tb = calcTotal(b.importe_base, b.margen_pct)
      return ordenImporte === 'asc' ? ta - tb : tb - ta
    })
  }, [presupuestos, query, ordenImporte, calcTotal])

  // Resumen superior
  const resumen = useMemo(() => {
    const totales = presupuestos.map(p => calcTotal(p.importe_base, p.margen_pct))
    const total = totales.reduce((s, n) => s + n, 0)
    const masAlto = totales.length ? Math.max(...totales) : 0
    const promedio = totales.length ? total / totales.length : 0
    const esteMes = presupuestos.filter(p => p.fecha?.slice(0, 7) === inicioMes).length
    return { numTotal: presupuestos.length, promedio, masAlto, esteMes }
  }, [presupuestos, calcTotal])

  // Distribución por estado
  const distribucionEstado = useMemo(() => {
    return Object.keys(ESTADO_CFG)
      .map(estado => ({
        estado,
        label: ESTADO_CFG[estado].label,
        color: ESTADO_CFG[estado].color,
        importe: presupuestos.filter(p => p.estado === estado).reduce((s, p) => s + calcTotal(p.importe_base, p.margen_pct), 0),
        count: presupuestos.filter(p => p.estado === estado).length,
      }))
      .filter(d => d.count > 0)
  }, [presupuestos, calcTotal])

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
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <Card className="overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} columns={5} className="border-b border-slate-100 dark:border-slate-800 last:border-0" />)}
      </Card>
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

      {/* Resumen + distribución por estado */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 grid grid-cols-2 gap-4">
          <Card className="p-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total presupuestos</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{resumen.numTotal}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Este mes</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{resumen.esteMes}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Presupuesto promedio</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{fmt(resumen.promedio)} €</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Presupuesto más alto</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{fmt(resumen.masAlto)} €</p>
          </Card>
        </div>
        <Card className="lg:col-span-2 p-5">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Distribución por estado</p>
          {distribucionEstado.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos todavía</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={distribucionEstado} dataKey="importe" nameKey="label" innerRadius={35} outerRadius={60} paddingAngle={2}>
                  {distribucionEstado.map(d => <Cell key={d.estado} fill={d.color} />)}
                </Pie>
                <ChartTooltip formatter={(v, n, p) => [`${fmt(v)} € (${p.payload.count})`, p.payload.label]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
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
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Número</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Obra</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Fecha</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Base €</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Beneficio</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <button onClick={() => setOrdenImporte(o => o === 'desc' ? 'asc' : 'desc')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Total € {ordenImporte === 'asc' ? '↑' : ordenImporte === 'desc' ? '↓' : ''}
                  </button>
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lista.map(p => {
                const est = ESTADO_CFG[p.estado]
                const total = calcTotal(p.importe_base, p.margen_pct)
                const beneficio = total - Number(p.importe_base)
                const margen = Number(p.margen_pct)
                const colorBeneficio = margen > 20 ? 'text-emerald-600 dark:text-emerald-400' : margen >= 10 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300 font-medium">{p.numero}</td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate">{p.obra_nombre}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 hidden md:table-cell">{p.fecha}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600 dark:text-slate-300">{fmt(p.importe_base)}</td>
                    <td className={`px-5 py-3.5 text-right font-semibold hidden md:table-cell ${colorBeneficio}`}>{fmt(beneficio)} € <span className="text-xs opacity-70">({fmtPct(margen)}%)</span></td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-800 dark:text-slate-100">{fmt(total)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant={est.variant}>{est.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </Card>
      )}
    </div>
  )
}

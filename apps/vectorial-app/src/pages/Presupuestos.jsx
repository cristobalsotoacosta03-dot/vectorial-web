import { useState } from 'react'
import { usePresupuestos } from '../hooks/usePresupuestos'
import { OBRAS_MOCK } from '../data/mocks'

const ESTADO_CFG = {
  borrador:  { label: 'Borrador',   cls: 'bg-slate-100 text-slate-500'    },
  enviado:   { label: 'Enviado',    cls: 'bg-blue-100 text-blue-700'      },
  aceptado:  { label: 'Aceptado',   cls: 'bg-emerald-100 text-emerald-700'},
  rechazado: { label: 'Rechazado',  cls: 'bg-red-100 text-red-600'        },
}

const fmt = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtPct = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const FORM_VACIO = { obra_nombre: OBRAS_MOCK[0].nombre, fecha: '', importe_base: '', margen_pct: 18, estado: 'borrador' }

export default function Presupuestos() {
  const { presupuestos, loading, modoDemo, addPresupuesto, calcTotal, kpi } = usePresupuestos()
  const [mostrarForm, setForm]    = useState(false)
  const [form, setFormData]       = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)

  const previewTotal = form.importe_base
    ? calcTotal(parseFloat(form.importe_base) || 0, parseFloat(form.margen_pct) || 0)
    : null

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)
    await addPresupuesto(form)
    setFormData(FORM_VACIO)
    setForm(false)
    setGuardando(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-slate-400">
      <span className="text-4xl animate-spin mr-4">⚙️</span> Cargando presupuestos...
    </div>
  )

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Presupuestos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Aceptado: <span className="font-semibold text-emerald-700">{fmt(kpi.totalAcept)} €</span>
            <span className="mx-2 text-slate-300">·</span>
            Margen medio: <span className="font-semibold text-amber-600">{fmtPct(kpi.margenMedio)}%</span>
            <span className="mx-2 text-slate-300">·</span>
            {kpi.pendientes} pendiente{kpi.pendientes !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {modoDemo && <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Modo Demo</span>}
          <button onClick={() => setForm(!mostrarForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            {mostrarForm ? '✕ Cancelar' : '+ Nuevo presupuesto'}
          </button>
        </div>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Nuevo presupuesto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Obra vinculada *</label>
              <select required value={form.obra_nombre} onChange={e => setFormData(f => ({...f, obra_nombre: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                {OBRAS_MOCK.map(o => <option key={o.id} value={o.nombre}>{o.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setFormData(f => ({...f, fecha: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Estado</label>
              <select value={form.estado} onChange={e => setFormData(f => ({...f, estado: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                {Object.entries(ESTADO_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Importe base (€) *</label>
              <input required type="number" min="0" step="0.01" value={form.importe_base}
                onChange={e => setFormData(f => ({...f, importe_base: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Margen comercial (%)</label>
              <input type="number" min="0" max="100" step="0.5" value={form.margen_pct}
                onChange={e => setFormData(f => ({...f, margen_pct: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          {previewTotal !== null && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <span className="text-sm text-emerald-700 font-medium">Total con margen: </span>
              <span className="text-xl font-bold text-emerald-800">{fmt(previewTotal)} €</span>
              <span className="text-emerald-600 text-sm ml-2">(+{form.margen_pct}%)</span>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => { setForm(false); setFormData(FORM_VACIO) }}
              className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100">Cancelar</button>
            <button type="submit" disabled={guardando}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
              {guardando ? 'Guardando...' : 'Guardar presupuesto'}
            </button>
          </div>
        </form>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Número','Obra','Fecha','Base €','Margen','Total €','Estado'].map((h,i) => (
                <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${
                  i >= 3 ? 'text-right' : 'text-left'
                } ${i === 6 ? 'text-center' : ''} ${[2,4].includes(i) ? 'hidden md:table-cell' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {presupuestos.map(p => {
              const est = ESTADO_CFG[p.estado]
              const total = calcTotal(p.importe_base, p.margen_pct)
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600 font-medium">{p.numero}</td>
                  <td className="px-5 py-3.5 text-slate-700 max-w-xs truncate">{p.obra_nombre}</td>
                  <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">{p.fecha}</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">{fmt(p.importe_base)}</td>
                  <td className="px-5 py-3.5 text-right text-slate-400 hidden md:table-cell">{p.margen_pct}%</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-800">{fmt(total)}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`${est.cls} text-xs font-semibold px-2.5 py-1 rounded-full`}>{est.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

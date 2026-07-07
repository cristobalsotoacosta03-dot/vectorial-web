import { useState } from 'react'
import { useObras } from '../hooks/useObras'
import { usePartidas } from '../hooks/usePartidas'

const fmt    = n => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtPct = n => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const UNIDADES = ['ud', 'm', 'm²', 'm³', 'ml', 'kg', 'L', 'h', 'dia', 'mes', 'lote', 'pa']

const EMPTY_FORM = { descripcion: '', unidad: 'm', cantidad: 1, precio_unitario: '', margen_pct: 20 }

function exportarPresupuesto(obraNombre, partidas, kpi) {
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const rows  = partidas.map(p => {
    const pv   = p.precio_unitario * (1 + p.margen_pct / 100)
    const tot  = p.cantidad * pv
    return `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;font-size:13px">${p.descripcion}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:13px">${p.cantidad}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:13px">${p.unidad}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px">${fmt(pv)} €</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;font-weight:600">${fmt(tot)} €</td>
    </tr>`
  }).join('')
  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Presupuesto — ${obraNombre}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;max-width:860px;margin:0 auto;padding:32px;color:#1e293b}
.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:3px solid #1e40af;margin-bottom:24px}
.logo{font-size:24px;font-weight:800;color:#1e40af}.logo span{color:#0ea5e9}
.meta{text-align:right;font-size:12px;color:#94a3b8;line-height:1.7}
h2{font-size:20px;margin-bottom:4px}.obra{font-size:13px;color:#6366f1;margin-bottom:20px;font-weight:600}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
thead{background:#1e40af;color:white}
th{padding:10px 10px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.05em}
.totals{background:#f8fafc;border-top:2px solid #1e40af;padding:16px 20px}
.totals tr td{padding:5px 10px;font-size:13px}
.total-final{font-size:16px;font-weight:700;color:#1e40af}
.footer{margin-top:24px;font-size:11px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:12px}
.print-btn{display:block;margin:24px auto 0;background:#1e40af;color:white;border:none;padding:12px 28px;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit}
@media print{.print-btn{display:none!important}}
</style></head>
<body>
<div class="header">
  <div><div class="logo">Gesti<span>Obra</span></div><div style="font-size:12px;color:#94a3b8;margin-top:3px">Gestión profesional de instalaciones</div></div>
  <div class="meta"><div><strong>Fecha:</strong> ${fecha}</div><div><strong>Núm. presupuesto:</strong> PRES-${Date.now().toString().slice(-6)}</div></div>
</div>
<h2>Desglose de materiales y partidas</h2>
<div class="obra">📂 Obra: ${obraNombre}</div>
<table>
  <thead><tr><th>Descripción / Partida</th><th style="text-align:center">Cant.</th><th style="text-align:center">Ud.</th><th style="text-align:right">P. unitario</th><th style="text-align:right">Total</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot>
    <tr style="background:#f8fafc;border-top:2px solid #e2e8f0">
      <td colspan="4" style="padding:8px 10px;font-size:12px;color:#64748b">SUBTOTAL COSTE</td>
      <td style="padding:8px 10px;text-align:right;font-size:13px">${fmt(kpi.totalCoste)} €</td>
    </tr>
    <tr style="background:#f8fafc">
      <td colspan="4" style="padding:8px 10px;font-size:12px;color:#64748b">MARGEN MEDIO</td>
      <td style="padding:8px 10px;text-align:right;font-size:13px">${fmtPct(kpi.margenMedio)} %</td>
    </tr>
    <tr style="background:#eff6ff;border-top:2px solid #1e40af">
      <td colspan="4" style="padding:10px 10px;font-size:14px;font-weight:700;color:#1e40af">TOTAL PRESUPUESTO (IVA no incl.)</td>
      <td style="padding:10px 10px;text-align:right;font-size:16px;font-weight:700;color:#1e40af">${fmt(kpi.totalVenta)} €</td>
    </tr>
  </tfoot>
</table>
<div class="footer">Presupuesto orientativo · IVA no incluido · Válido 30 días desde la fecha de emisión · GestiObra</div>
<button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
</body></html>`
  const w = window.open('', '_blank', 'width=900,height=750,scrollbars=yes')
  if (w) { w.document.write(html); w.document.close() }
}

// ── Componente ─────────────────────────────────────────────────────────────

export default function Materiales({ selectedObraId, setSelectedObraId }) {
  const { obras } = useObras()
  const obraSel   = obras.find(o => o.id === selectedObraId) || null
  const { partidas, addPartida, removePartida, kpi } = usePartidas(selectedObraId)

  const [form, setForm]   = useState(EMPTY_FORM)
  const [show, setShow]   = useState(false)
  const [editId, setEditId] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleAdd(e) {
    e.preventDefault()
    if (!selectedObraId || !form.descripcion || !form.precio_unitario) return
    addPartida(form)
    setForm(EMPTY_FORM)
    setShow(false)
  }

  const precioVenta = p => p.precio_unitario * (1 + p.margen_pct / 100)
  const totalLinea  = p => precioVenta(p) * p.cantidad

  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>🧱</span> Materiales y Presupuesto
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Desglose de partidas por obra · cálculo automático de márgenes</p>
        </div>
        {obraSel && (
          <button onClick={() => exportarPresupuesto(obraSel.nombre, partidas, kpi)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
            🖨️ Exportar presupuesto
          </button>
        )}
      </div>

      {/* Selector de obra */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">📂 Selecciona la obra</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {obras.map(o => (
            <button key={o.id} onClick={() => setSelectedObraId(o.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all shrink-0 ${selectedObraId === o.id ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-blue-50'}`}>
              <span className={`w-2 h-2 rounded-full ${selectedObraId === o.id ? 'bg-white' : o.estado === 'activa' ? 'bg-emerald-500' : o.estado === 'pausada' ? 'bg-amber-400' : 'bg-slate-400'}`} />
              <span className="max-w-[160px] truncate">{o.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {!selectedObraId && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">📂</p>
          <p className="text-slate-600 font-semibold">Selecciona una obra para ver o añadir sus materiales</p>
          <p className="text-slate-400 text-sm mt-1">Los datos se guardan automáticamente por obra</p>
        </div>
      )}

      {selectedObraId && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ['Partidas', partidas.length,        '',  'bg-slate-100 text-slate-600 w-10 h-10 rounded-xl flex items-center justify-center text-xl', '🧱'],
              ['Total coste', kpi.totalCoste,      '€', 'bg-rose-100 text-rose-600 w-10 h-10 rounded-xl flex items-center justify-center text-xl', '💸'],
              ['Total venta', kpi.totalVenta,      '€', 'bg-violet-100 text-violet-600 w-10 h-10 rounded-xl flex items-center justify-center text-xl', '💰'],
              ['Beneficio',   kpi.beneficio,       '€', 'bg-emerald-100 text-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center text-xl', '📈'],
            ].map(([label, val, unit, cls, ico]) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <span className={cls}>{ico}</span>
                <p className="text-2xl font-bold text-slate-800 mt-3">
                  {label === 'Partidas' ? val : fmt(val)}
                  {unit && <span className="text-base text-slate-400 font-normal ml-1">{unit}</span>}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">{label}</p>
                {label === 'Beneficio' && kpi.totalVenta > 0 && (
                  <p className="text-xs text-emerald-600 mt-1 font-semibold">
                    {fmtPct(kpi.margenMedio)} % margen medio
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Tabla de partidas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-700">Partidas — {obraSel?.nombre}</h2>
              <button onClick={() => setShow(s => !s)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                {show ? '✕ Cancelar' : '+ Añadir partida'}
              </button>
            </div>

            {/* Formulario inline */}
            {show && (
              <form onSubmit={handleAdd} className="bg-blue-50 border-b border-blue-100 p-5">
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción *</label>
                    <input value={form.descripcion} onChange={e => set('descripcion', e.target.value)} required
                      placeholder="Ej: Tubería cobre 22×1 R250"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Unidad</label>
                    <select value={form.unidad} onChange={e => set('unidad', e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                      {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Cantidad</label>
                    <input type="number" min="0.01" step="any" value={form.cantidad} onChange={e => set('cantidad', e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">P. unitario (€) *</label>
                    <input type="number" min="0" step="0.01" value={form.precio_unitario} onChange={e => set('precio_unitario', e.target.value)} required
                      placeholder="0,00"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Margen (%)</label>
                    <input type="number" min="0" max="999" step="0.5" value={form.margen_pct} onChange={e => set('margen_pct', e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <button type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                    Añadir partida
                  </button>
                  {form.precio_unitario && (
                    <p className="text-sm text-slate-600">
                      Total línea: <span className="font-bold text-slate-800">
                        {fmt(parseFloat(form.cantidad || 0) * parseFloat(form.precio_unitario || 0) * (1 + parseFloat(form.margen_pct || 0) / 100))} €
                      </span>
                    </p>
                  )}
                </div>
              </form>
            )}

            {/* Lista de partidas */}
            {partidas.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-3xl mb-2">🧱</p>
                <p className="font-medium">Sin partidas todavía</p>
                <p className="text-sm mt-1">Añade materiales para calcular el presupuesto</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descripción</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cant.</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ud.</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">P. coste</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mg %</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">P. venta</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {partidas.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-slate-800">{p.descripcion}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{p.cantidad}</td>
                          <td className="px-4 py-3 text-center text-slate-500">{p.unidad}</td>
                          <td className="px-4 py-3 text-right text-slate-500">{fmt(p.precio_unitario)} €</td>
                          <td className="px-4 py-3 text-right">
                            <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-xs font-semibold">{p.margen_pct} %</span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-700 font-medium">{fmt(precioVenta(p))} €</td>
                          <td className="px-5 py-3 text-right font-bold text-slate-800">{fmt(totalLinea(p))} €</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => removePartida(p.id)} className="text-slate-300 hover:text-red-500 transition-colors text-lg leading-none">×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totales */}
                <div className="border-t-2 border-slate-200 bg-slate-50 px-6 py-4">
                  <div className="flex justify-end gap-8 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Total coste</p>
                      <p className="font-bold text-slate-700 text-base">{fmt(kpi.totalCoste)} €</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Beneficio</p>
                      <p className="font-bold text-emerald-600 text-base">+{fmt(kpi.beneficio)} €</p>
                    </div>
                    <div className="text-right bg-blue-600 text-white rounded-xl px-5 py-2">
                      <p className="text-xs text-blue-100 uppercase tracking-wide">Total venta (sin IVA)</p>
                      <p className="font-bold text-xl">{fmt(kpi.totalVenta)} €</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

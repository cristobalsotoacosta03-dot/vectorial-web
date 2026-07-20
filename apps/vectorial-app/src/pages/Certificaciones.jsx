import { useState } from 'react'
import { Plus, X, ClipboardCheck, Trash2, Printer, FileCheck, AlertTriangle, Link as LinkIcon } from 'lucide-react'
import { useObras } from '../hooks/useObras'
import { useCertificaciones } from '../hooks/useCertificaciones'
import { useCertificadosNormativos } from '../hooks/useCertificadosNormativos'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'

const fmt = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtPct = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const ESTADO_CFG = {
  borrador: { label: 'Borrador', variant: 'neutral' },
  emitida:  { label: 'Emitida',  variant: 'primary' },
  pagada:   { label: 'Pagada',   variant: 'success' },
}

const TIPO_NORM_CFG = {
  oca:       { label: 'OCA' },
  industria: { label: 'Industria' },
  municipal: { label: 'Municipal' },
  otro:      { label: 'Otro' },
}

const ESTADO_NORM_CFG = {
  pendiente:   { label: 'Pendiente',   variant: 'neutral' },
  en_tramite:  { label: 'En trámite',  variant: 'primary' },
  aprobada:    { label: 'Aprobada',    variant: 'success' },
  rechazada:   { label: 'Rechazada',   variant: 'error'   },
}

const FORM_VACIO = { fecha: '', pct_avance: '', importe_certificado: '', estado: 'borrador', notas: '' }
const FORM_NORM_VACIO = { nombre: '', tipo: 'oca', fecha_solicitud: '', fecha_vencimiento: '', documento_url: '', estado: 'pendiente', notas: '' }

const hoy = new Date().toISOString().slice(0, 10)
const vencePronto = (c) => c.fecha_vencimiento && c.fecha_vencimiento >= hoy && c.fecha_vencimiento <= new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
const estaVencido  = (c) => c.fecha_vencimiento && c.fecha_vencimiento < hoy && c.estado !== 'aprobada'

function imprimirActa(obraNombre, cert) {
  const fecha = new Date(cert.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Certificación ${cert.numero} — ${obraNombre}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;max-width:760px;margin:0 auto;padding:32px;color:#1e293b}
.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:3px solid #1e40af;margin-bottom:24px}
.logo{font-size:24px;font-weight:800;color:#1e40af}
.meta{text-align:right;font-size:12px;color:#94a3b8;line-height:1.7}
h2{font-size:20px;margin-bottom:4px}.obra{font-size:13px;color:#6366f1;margin-bottom:24px;font-weight:600}
.box{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
.stat{background:#f8fafc;border-radius:10px;padding:16px 20px}
.stat .label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em}
.stat .value{font-size:24px;font-weight:700;color:#1e40af;margin-top:4px}
.notas{font-size:13px;color:#475569;line-height:1.6;background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:24px}
.footer{margin-top:24px;font-size:11px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:12px}
.print-btn{display:block;margin:24px auto 0;background:#1e40af;color:white;border:none;padding:12px 28px;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit}
@media print{.print-btn{display:none!important}}
</style></head><body>
<div class="header">
  <div><div class="logo">Vectorial</div><div style="font-size:12px;color:#94a3b8;margin-top:3px">Certificación de avance de obra</div></div>
  <div class="meta"><div><strong>Fecha:</strong> ${fecha}</div><div><strong>Núm.:</strong> ${cert.numero}</div></div>
</div>
<h2>Certificación de obra</h2>
<div class="obra">Obra: ${obraNombre}</div>
<div class="box">
  <div class="stat"><div class="label">Avance certificado</div><div class="value">${fmtPct(cert.pct_avance)} %</div></div>
  <div class="stat"><div class="label">Importe certificado</div><div class="value">${fmt(cert.importe_certificado)} €</div></div>
</div>
${cert.notas ? `<div class="notas"><strong>Notas:</strong> ${cert.notas}</div>` : ''}
<div class="footer">Documento generado por Vectorial · IVA no incluido</div>
<button class="print-btn" onclick="window.print()">Imprimir / Guardar como PDF</button>
</body></html>`
  const w = window.open('', '_blank', 'width=800,height=700,scrollbars=yes')
  if (w) { w.document.write(html); w.document.close() }
}

export default function Certificaciones({ selectedObraId, setSelectedObraId }) {
  const { obras } = useObras()
  const obraSel = obras.find(o => o.id === selectedObraId) || null
  const { certificaciones, loading, modoDemo, addCertificacion, removeCertificacion, kpi, ESTADOS } = useCertificaciones(selectedObraId)
  const {
    certificados: normativos, loading: loadingNorm, modoDemo: modoDemoNorm,
    addCertificado, updateCertificado, removeCertificado, kpi: kpiNorm, TIPOS, ESTADOS: ESTADOS_NORM,
  } = useCertificadosNormativos(selectedObraId)
  const { notify } = useToast()

  const [modo, setModo] = useState('avance')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)

  const [mostrarFormNorm, setMostrarFormNorm] = useState(false)
  const [formNorm, setFormNorm] = useState(FORM_NORM_VACIO)
  const [guardandoNorm, setGuardandoNorm] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)
    const res = await addCertificacion(form)
    setGuardando(false)
    if (res?.success === false) {
      notify(res.error || 'No se pudo guardar la certificación', { type: 'error' })
      return
    }
    notify('Certificación registrada correctamente', { type: 'success' })
    setForm(FORM_VACIO)
    setMostrarForm(false)
  }

  async function handleSubmitNorm(e) {
    e.preventDefault()
    setGuardandoNorm(true)
    const res = await addCertificado(formNorm)
    setGuardandoNorm(false)
    if (res?.success === false) {
      notify(res.error || 'No se pudo guardar el certificado', { type: 'error' })
      return
    }
    notify('Certificado registrado correctamente', { type: 'success' })
    setFormNorm(FORM_NORM_VACIO)
    setMostrarFormNorm(false)
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Certificaciones</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {modo === 'avance' ? 'Avance de obra e importes certificados por corte' : 'Trámites de certificación normativa (OCA, industria, municipal)'}
          </p>
        </div>
        {(modo === 'avance' ? modoDemo : modoDemoNorm) && <Badge variant="warning">Modo Demo</Badge>}
      </div>

      {/* Selector de tipo de certificación */}
      <div className="flex gap-2">
        {[['avance', 'Avance de obra', ClipboardCheck], ['normativos', 'Certificados normativos', FileCheck]].map(([id, label, Icon]) => (
          <button key={id} onClick={() => setModo(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${modo === id ? 'bg-primary-500 text-white border-primary-500 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-primary-50 dark:hover:bg-slate-700'}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Selector de obra */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Selecciona la obra</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {obras.map(o => (
            <button key={o.id} onClick={() => setSelectedObraId(o.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                selectedObraId === o.id
                  ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-primary-50 dark:hover:bg-slate-700'
              }`}>
              <span className={`w-2 h-2 rounded-full ${selectedObraId === o.id ? 'bg-white' : o.estado === 'activa' ? 'bg-emerald-500' : o.estado === 'pausada' ? 'bg-amber-400' : 'bg-slate-400'}`} />
              <span className="max-w-[160px] truncate">{o.nombre}</span>
            </button>
          ))}
        </div>
      </Card>

      {!selectedObraId && (
        <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center">
          <ClipboardCheck size={36} className="mx-auto mb-3 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-300 font-semibold">Selecciona una obra para ver sus certificaciones</p>
        </div>
      )}

      {selectedObraId && modo === 'avance' && loading && (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
          <Spinner /> Cargando certificaciones...
        </div>
      )}

      {selectedObraId && modo === 'avance' && !loading && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Avance actual</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">{fmtPct(kpi.pctActual)} %</p>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(kpi.pctActual, 100)}%` }} />
              </div>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total certificado</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{fmt(kpi.totalCertificado)} €</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Certificaciones emitidas</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{kpi.numCertificaciones}</p>
            </Card>
          </div>

          {/* Tabla / formulario */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-semibold text-slate-700 dark:text-slate-300">Histórico — {obraSel?.nombre}</h2>
              <Button size="sm" onClick={() => setMostrarForm(s => !s)} icon={mostrarForm ? <X size={16} /> : <Plus size={16} />}>
                {mostrarForm ? 'Cancelar' : 'Nueva certificación'}
              </Button>
            </div>

            {mostrarForm && (
              <form onSubmit={handleSubmit} className="bg-primary-50/50 dark:bg-primary-500/5 border-b border-primary-100 dark:border-primary-500/10 p-5 grid grid-cols-1 md:grid-cols-5 gap-3">
                <Input label="Fecha" type="date" value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
                <Input label="Avance (%) *" required type="number" min="0" max="100" step="0.5" value={form.pct_avance}
                  onChange={e => setForm(f => ({ ...f, pct_avance: e.target.value }))} placeholder="0" />
                <Input label="Importe certificado (€) *" required type="number" min="0" step="0.01" value={form.importe_certificado}
                  onChange={e => setForm(f => ({ ...f, importe_certificado: e.target.value }))} placeholder="0.00" />
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Estado</label>
                  <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                    {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_CFG[e].label}</option>)}
                  </select>
                </div>
                <Input label="Notas" value={form.notas}
                  onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Trabajos incluidos…" />
                <div className="md:col-span-5 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => { setMostrarForm(false); setForm(FORM_VACIO) }}>Cancelar</Button>
                  <Button type="submit" loading={guardando}>Guardar certificación</Button>
                </div>
              </form>
            )}

            {certificaciones.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <ClipboardCheck size={36} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium text-slate-600 dark:text-slate-300">Sin certificaciones todavía</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                      {['Núm.', 'Fecha', 'Avance', 'Importe €', 'Estado', ''].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[...certificaciones].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).map(c => {
                      const est = ESTADO_CFG[c.estado]
                      return (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300 font-medium">{c.numero}</td>
                          <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{c.fecha}</td>
                          <td className="px-5 py-3.5 font-semibold text-primary-600 dark:text-primary-400">{fmtPct(c.pct_avance)} %</td>
                          <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-100">{fmt(c.importe_certificado)}</td>
                          <td className="px-5 py-3.5"><Badge variant={est.variant}>{est.label}</Badge></td>
                          <td className="px-5 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <button onClick={() => imprimirActa(obraSel?.nombre ?? '', c)} className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" aria-label="Imprimir acta">
                                <Printer size={15} />
                              </button>
                              <button onClick={() => removeCertificacion(c.id)} className="text-slate-300 hover:text-red-500 transition-colors" aria-label="Eliminar">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* ─── Certificados normativos ─── */}
      {selectedObraId && modo === 'normativos' && loadingNorm && (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
          <Spinner /> Cargando certificados...
        </div>
      )}

      {selectedObraId && modo === 'normativos' && !loadingNorm && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total certificados</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{kpiNorm.total}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Vencen en 30 días</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{kpiNorm.proximosVencer}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Vencidos</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{kpiNorm.vencidos}</p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-semibold text-slate-700 dark:text-slate-300">Trámites — {obraSel?.nombre}</h2>
              <Button size="sm" onClick={() => setMostrarFormNorm(s => !s)} icon={mostrarFormNorm ? <X size={16} /> : <Plus size={16} />}>
                {mostrarFormNorm ? 'Cancelar' : 'Nuevo certificado'}
              </Button>
            </div>

            {mostrarFormNorm && (
              <form onSubmit={handleSubmitNorm} className="bg-primary-50/50 dark:bg-primary-500/5 border-b border-primary-100 dark:border-primary-500/10 p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Input label="Nombre / instalación *" required value={formNorm.nombre}
                    onChange={e => setFormNorm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Certificado OCA — climatización" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tipo</label>
                  <select value={formNorm.tipo} onChange={e => setFormNorm(f => ({ ...f, tipo: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                    {TIPOS.map(t => <option key={t} value={t}>{TIPO_NORM_CFG[t].label}</option>)}
                  </select>
                </div>
                <Input label="Fecha solicitud" type="date" value={formNorm.fecha_solicitud}
                  onChange={e => setFormNorm(f => ({ ...f, fecha_solicitud: e.target.value }))} />
                <Input label="Fecha vencimiento" type="date" value={formNorm.fecha_vencimiento}
                  onChange={e => setFormNorm(f => ({ ...f, fecha_vencimiento: e.target.value }))} />
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Estado</label>
                  <select value={formNorm.estado} onChange={e => setFormNorm(f => ({ ...f, estado: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                    {ESTADOS_NORM.map(e => <option key={e} value={e}>{ESTADO_NORM_CFG[e].label}</option>)}
                  </select>
                </div>
                <Input label="Enlace al documento" value={formNorm.documento_url}
                  onChange={e => setFormNorm(f => ({ ...f, documento_url: e.target.value }))} placeholder="https://..." />
                <div className="md:col-span-3">
                  <Input label="Notas" value={formNorm.notas}
                    onChange={e => setFormNorm(f => ({ ...f, notas: e.target.value }))} placeholder="Observaciones del trámite..." />
                </div>
                <div className="md:col-span-3 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => { setMostrarFormNorm(false); setFormNorm(FORM_NORM_VACIO) }}>Cancelar</Button>
                  <Button type="submit" loading={guardandoNorm}>Guardar certificado</Button>
                </div>
              </form>
            )}

            {normativos.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <FileCheck size={36} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium text-slate-600 dark:text-slate-300">Sin certificados normativos todavía</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                      {['Nombre', 'Tipo', 'Vencimiento', 'Estado', ''].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[...normativos].sort((a, b) => (a.fecha_vencimiento || '9999') < (b.fecha_vencimiento || '9999') ? -1 : 1).map(c => {
                      const est = ESTADO_NORM_CFG[c.estado]
                      const vencido = estaVencido(c)
                      const pronto = !vencido && vencePronto(c)
                      return (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium max-w-xs truncate">
                            <div className="flex items-center gap-2">
                              {c.nombre}
                              {c.documento_url && (
                                <a href={c.documento_url} target="_blank" rel="noopener noreferrer" aria-label="Ver documento" className="text-slate-400 hover:text-primary-600">
                                  <LinkIcon size={13} />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{TIPO_NORM_CFG[c.tipo]?.label}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 ${vencido ? 'text-red-600 font-semibold' : pronto ? 'text-amber-600 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                              {(vencido || pronto) && <AlertTriangle size={13} />}
                              {c.fecha_vencimiento || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <select value={c.estado} onChange={e => updateCertificado(c.id, { estado: e.target.value })}
                              className={`text-xs font-semibold border-0 rounded-full px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500/40 ${est.variant === 'success' ? 'bg-emerald-100 text-emerald-700' : est.variant === 'primary' ? 'bg-primary-50 text-primary-700' : est.variant === 'error' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                              {ESTADOS_NORM.map(e => <option key={e} value={e}>{ESTADO_NORM_CFG[e].label}</option>)}
                            </select>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <button onClick={() => removeCertificado(c.id)} className="text-slate-300 hover:text-red-500 transition-colors" aria-label="Eliminar">
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

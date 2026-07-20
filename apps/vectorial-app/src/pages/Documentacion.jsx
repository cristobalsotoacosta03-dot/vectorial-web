import { useState, useEffect } from 'react'
import { FileBadge, Printer, Save } from 'lucide-react'
import { useObras } from '../hooks/useObras'
import { useDocumentoObra } from '../hooks/useDocumentoObra'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Tabs from '../components/ui/Tabs'
import Spinner from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'

const DOCS = {
  memoria: {
    label: 'Memoria técnica',
    titulo: 'Memoria Técnica de Instalación',
    campos: [
      { key: 'descripcion', label: 'Descripción de la instalación', placeholder: 'Objeto de la instalación, alcance de los trabajos, ubicación...' },
      { key: 'normativa', label: 'Normativa de aplicación', placeholder: 'RITE, RIGLO, UNE-EN 1057, CTE DB-HE...' },
      { key: 'calculos', label: 'Cálculos justificativos', placeholder: 'Resumen de los cálculos que justifican el dimensionado (caudales, secciones, potencias)...' },
      { key: 'planos', label: 'Planos y esquemas de referencia', placeholder: 'Relación de planos que acompañan a esta memoria...' },
    ],
  },
  calidad: {
    label: 'Plan de calidad',
    titulo: 'Plan de Control de Calidad',
    campos: [
      { key: 'puntos_inspeccion', label: 'Puntos de inspección', placeholder: 'Puntos de parada e inspección durante la ejecución (PPI)...' },
      { key: 'ensayos', label: 'Ensayos a realizar', placeholder: 'Pruebas de presión, estanqueidad, aislamiento, funcionamiento...' },
      { key: 'criterios_aceptacion', label: 'Criterios de aceptación', placeholder: 'Tolerancias y criterios que determinan la aceptación de cada partida...' },
    ],
  },
  seguridad: {
    label: 'Est. de seguridad',
    titulo: 'Estudio Básico de Seguridad y Salud',
    campos: [
      { key: 'riesgos', label: 'Riesgos identificados', placeholder: 'Riesgos propios de la instalación: caídas, cortes, quemaduras, atmósferas explosivas...' },
      { key: 'medidas_preventivas', label: 'Medidas preventivas', placeholder: 'Medidas de prevención y protección colectiva adoptadas...' },
      { key: 'epis', label: 'Equipos de protección individual (EPI)', placeholder: 'Guantes, gafas, calzado de seguridad, protección respiratoria...' },
    ],
  },
}

function imprimirDocumento(obraNombre, tipo, contenido) {
  const cfg = DOCS[tipo]
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const secciones = cfg.campos.map(c => `
    <h3>${c.label}</h3>
    <p>${(contenido[c.key] || '—').replace(/\n/g, '<br>')}</p>
  `).join('')
  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>${cfg.titulo} — ${obraNombre}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;max-width:800px;margin:0 auto;padding:32px;color:#1e293b;line-height:1.6}
.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:3px solid #1e40af;margin-bottom:24px}
.logo{font-size:24px;font-weight:800;color:#1e40af}
.meta{text-align:right;font-size:12px;color:#94a3b8;line-height:1.7}
h2{font-size:20px;margin-bottom:4px}.obra{font-size:13px;color:#6366f1;margin-bottom:24px;font-weight:600}
h3{font-size:14px;color:#1e40af;margin-top:20px;margin-bottom:6px;text-transform:uppercase;letter-spacing:.03em}
p{font-size:13px;color:#334155;white-space:pre-wrap}
.footer{margin-top:32px;font-size:11px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:12px}
.print-btn{display:block;margin:28px auto 0;background:#1e40af;color:white;border:none;padding:12px 28px;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit}
@media print{.print-btn{display:none!important}}
</style></head><body>
<div class="header">
  <div><div class="logo">Vectorial</div><div style="font-size:12px;color:#94a3b8;margin-top:3px">${cfg.titulo}</div></div>
  <div class="meta"><div><strong>Fecha:</strong> ${fecha}</div></div>
</div>
<h2>${cfg.titulo}</h2>
<div class="obra">Obra: ${obraNombre}</div>
${secciones}
<div class="footer">Documento generado por Vectorial · Borrador sujeto a revisión técnica</div>
<button class="print-btn" onclick="window.print()">Imprimir / Guardar como PDF</button>
</body></html>`
  const w = window.open('', '_blank', 'width=860,height=760,scrollbars=yes')
  if (w) { w.document.write(html); w.document.close() }
}

function DocumentoForm({ obraId, obraNombre, tipo }) {
  const { contenido, loading, guardando, guardar } = useDocumentoObra(obraId, tipo)
  const { notify } = useToast()
  const [draft, setDraft] = useState(contenido)
  const cfg = DOCS[tipo]

  useEffect(() => { setDraft(contenido) }, [contenido])

  async function handleGuardar() {
    const res = await guardar(draft)
    if (res?.success === false) notify(res.error || 'No se pudo guardar el documento', { type: 'error' })
    else notify('Documento guardado', { type: 'success' })
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
      <Spinner /> Cargando documento...
    </div>
  )

  return (
    <div className="space-y-4">
      {cfg.campos.map(c => (
        <div key={c.key}>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{c.label}</label>
          <textarea rows={4} value={draft[c.key] || ''} placeholder={c.placeholder}
            onChange={e => setDraft(d => ({ ...d, [c.key]: e.target.value }))}
            className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-y" />
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-1">
        <Button variant="secondary" onClick={handleGuardar} loading={guardando} icon={<Save size={15} />}>Guardar borrador</Button>
        <Button onClick={() => imprimirDocumento(obraNombre, tipo, draft)} icon={<Printer size={15} />}>Generar documento</Button>
      </div>
    </div>
  )
}

export default function Documentacion({ selectedObraId, setSelectedObraId }) {
  const { obras } = useObras()
  const obraSel = obras.find(o => o.id === selectedObraId) || null
  const [tab, setTab] = useState('memoria')

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Documentación</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Memoria técnica, plan de calidad y estudio de seguridad por obra</p>
        </div>
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

      {!selectedObraId ? (
        <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center">
          <FileBadge size={36} className="mx-auto mb-3 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-300 font-semibold">Selecciona una obra para generar su documentación</p>
        </div>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300">{obraSel?.nombre}</h2>
            <Badge variant="neutral">{DOCS[tab].titulo}</Badge>
          </div>

          <Tabs
            tabs={Object.entries(DOCS).map(([key, v]) => ({ value: key, label: v.label }))}
            value={tab}
            onChange={setTab}
          />

          <div className="mt-5">
            <DocumentoForm key={`${selectedObraId}-${tab}`} obraId={selectedObraId} obraNombre={obraSel?.nombre ?? ''} tipo={tab} />
          </div>
        </Card>
      )}
    </div>
  )
}

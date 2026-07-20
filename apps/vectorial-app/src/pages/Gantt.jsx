import { useState, useRef, useMemo } from 'react'
import { Plus, X, GanttChartSquare, Trash2, Flag, Download } from 'lucide-react'
import { useObras } from '../hooks/useObras'
import { useTareasObra } from '../hooks/useTareasObra'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'

const fmtPct = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const msPorDia = 1000 * 60 * 60 * 24
const dias = (a, b) => Math.round((new Date(b) - new Date(a)) / msPorDia)

const FORM_VACIO = { nombre: '', fecha_inicio: '', fecha_fin: '', progreso_pct: 0, hito: false, responsable: '', dependencia_id: '' }

function marcasMensuales(inicio, fin) {
  const marcas = []
  const cursor = new Date(inicio)
  cursor.setDate(1)
  const finDate = new Date(fin)
  while (cursor <= finDate) {
    marcas.push({ fecha: cursor.toISOString().slice(0, 10), label: `${MESES[cursor.getMonth()]} ${cursor.getFullYear()}` })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return marcas
}

export default function Gantt({ selectedObraId, setSelectedObraId }) {
  const { obras } = useObras()
  const obraSel = obras.find(o => o.id === selectedObraId) || null
  const { tareas, loading, modoDemo, addTarea, removeTarea, updateTarea, kpi } = useTareasObra(selectedObraId)
  const { notify } = useToast()
  const timelineRef = useRef(null)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [exportando, setExportando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)
    const res = await addTarea(form)
    setGuardando(false)
    if (res?.success === false) {
      notify(res.error || 'No se pudo guardar la tarea', { type: 'error' })
      return
    }
    notify('Tarea añadida a la planificación', { type: 'success' })
    setForm(FORM_VACIO)
    setMostrarForm(false)
  }

  async function handleExportar() {
    if (!timelineRef.current) return
    setExportando(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(timelineRef.current, { backgroundColor: '#ffffff', scale: 2 })
      const link = document.createElement('a')
      link.download = `gantt-${(obraSel?.nombre || 'obra').replace(/\s+/g, '_')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error(err)
      notify('No se pudo exportar la imagen', { type: 'error' })
    } finally {
      setExportando(false)
    }
  }

  const marcas = useMemo(() => (kpi.rango ? marcasMensuales(kpi.rango.inicio, kpi.rango.fin) : []), [kpi.rango])
  const totalDiasRango = kpi.rango ? Math.max(dias(kpi.rango.inicio, kpi.rango.fin), 1) : 1

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Planificación (Gantt)</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Tareas, hitos y avance por obra</p>
        </div>
        {modoDemo && <Badge variant="warning">Modo Demo</Badge>}
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
          <GanttChartSquare size={36} className="mx-auto mb-3 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-300 font-semibold">Selecciona una obra para ver su planificación</p>
        </div>
      )}

      {selectedObraId && loading && (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
          <Spinner /> Cargando planificación...
        </div>
      )}

      {selectedObraId && !loading && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Avance ponderado</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">{fmtPct(kpi.avancePonderado)} %</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tareas</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{kpi.numTareas}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Hitos</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{kpi.numHitos}</p>
            </Card>
          </div>

          {/* Formulario + acciones */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700 dark:text-slate-300">Tareas — {obraSel?.nombre}</h2>
              <div className="flex gap-2">
                {tareas.length > 0 && (
                  <Button size="sm" variant="secondary" onClick={handleExportar} loading={exportando} icon={<Download size={15} />}>
                    Exportar PNG
                  </Button>
                )}
                <Button size="sm" onClick={() => setMostrarForm(s => !s)} icon={mostrarForm ? <X size={16} /> : <Plus size={16} />}>
                  {mostrarForm ? 'Cancelar' : 'Nueva tarea'}
                </Button>
              </div>
            </div>

            {mostrarForm && (
              <form onSubmit={handleSubmit} className="bg-primary-50/50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/10 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="md:col-span-3">
                  <Input label="Nombre de la tarea *" required value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Montaje de red de distribución" />
                </div>
                <Input label="Fecha inicio *" required type="date" value={form.fecha_inicio}
                  onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} />
                <Input label="Fecha fin *" required type="date" value={form.fecha_fin}
                  onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))} />
                <Input label="Progreso (%)" type="number" min="0" max="100" step="5" value={form.progreso_pct}
                  onChange={e => setForm(f => ({ ...f, progreso_pct: e.target.value }))} />
                <Input label="Responsable" value={form.responsable}
                  onChange={e => setForm(f => ({ ...f, responsable: e.target.value }))} placeholder="Equipo / persona" />
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Depende de</label>
                  <select value={form.dependencia_id} onChange={e => setForm(f => ({ ...f, dependencia_id: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                    <option value="">Ninguna</option>
                    {tareas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mt-1">
                  <input type="checkbox" checked={form.hito} onChange={e => setForm(f => ({ ...f, hito: e.target.checked }))}
                    className="rounded border-slate-300 text-primary-500 focus:ring-primary-500/40" />
                  Marcar como hito
                </label>
                <div className="md:col-span-3 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => { setMostrarForm(false); setForm(FORM_VACIO) }}>Cancelar</Button>
                  <Button type="submit" loading={guardando}>Añadir tarea</Button>
                </div>
              </form>
            )}

            {tareas.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <GanttChartSquare size={36} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium text-slate-600 dark:text-slate-300">Sin tareas planificadas todavía</p>
              </div>
            ) : (
              <div ref={timelineRef} className="bg-white dark:bg-slate-900 rounded-xl overflow-x-auto p-2">
                <div className="min-w-[720px]">
                  {/* Escala de meses */}
                  <div className="flex border-b border-slate-200 dark:border-slate-800 mb-2 pl-48">
                    {marcas.map(m => (
                      <div key={m.fecha} className="flex-1 text-center text-xs font-medium text-slate-400 dark:text-slate-500 pb-2 capitalize">
                        {m.label}
                      </div>
                    ))}
                  </div>

                  {/* Filas de tareas */}
                  <div className="space-y-2">
                    {tareas.map(t => {
                      const offsetPct = (dias(kpi.rango.inicio, t.fecha_inicio) / totalDiasRango) * 100
                      const widthPct = Math.max((dias(t.fecha_inicio, t.fecha_fin) / totalDiasRango) * 100, 1.2)
                      return (
                        <div key={t.id} className="flex items-center gap-3 group">
                          <div className="w-48 shrink-0 pr-2">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate flex items-center gap-1.5">
                              {t.hito && <Flag size={12} className="text-accent shrink-0" />}
                              {t.nombre}
                            </p>
                            {t.responsable && <p className="text-xs text-slate-400 truncate">{t.responsable}</p>}
                          </div>
                          <div className="relative flex-1 h-7 bg-slate-50 dark:bg-slate-800/60 rounded-md">
                            <div
                              className={`absolute top-0.5 bottom-0.5 rounded-md ${t.hito ? 'bg-accent' : 'bg-primary-500'} flex items-center overflow-hidden`}
                              style={{ left: `${offsetPct}%`, width: `${widthPct}%` }}
                            >
                              <div className="h-full bg-white/30" style={{ width: `${t.progreso_pct}%` }} />
                            </div>
                          </div>
                          <div className="w-14 shrink-0 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {fmtPct(t.progreso_pct)}%
                          </div>
                          <button onClick={() => removeTarea(t.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all shrink-0" aria-label="Eliminar tarea">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

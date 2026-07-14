import { useState, useMemo } from 'react'
import { Search, X, Plus, User, MapPin, Calendar, Building2 } from 'lucide-react'
import { useObras } from '../hooks/useObras'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'

const ESTADO_CFG = {
  activa:     { label: 'Activa',     variant: 'success' },
  pausada:    { label: 'Pausada',    variant: 'warning' },
  finalizada: { label: 'Finalizada', variant: 'neutral' },
}

const FILTROS = ['todas', 'activa', 'pausada', 'finalizada']
const FORM_VACIO = { nombre:'', cliente:'', direccion:'', estado:'activa', fecha_inicio:'', fecha_fin:'', descripcion:'' }

export default function Obras() {
  const { obras, loading, modoDemo, addObra, kpi } = useObras()
  const { notify } = useToast()
  const [filtro, setFiltro]       = useState('todas')
  const [query, setQuery]         = useState('')
  const [mostrarForm, setForm]    = useState(false)
  const [form, setFormData]       = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)

  const lista = useMemo(() => {
    const q = query.trim().toLowerCase()
    return obras
      .filter(o => filtro === 'todas' || o.estado === filtro)
      .filter(o => !q || o.nombre.toLowerCase().includes(q) || o.cliente?.toLowerCase().includes(q))
  }, [obras, filtro, query])

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)
    const res = await addObra(form)
    setGuardando(false)
    if (res?.success === false) {
      notify(res.error || 'No se pudo guardar la obra', { type: 'error' })
      return
    }
    notify('Obra guardada correctamente', { type: 'success' })
    setFormData(FORM_VACIO)
    setForm(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
      <Spinner /> Cargando obras...
    </div>
  )

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Obras</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{kpi.activas} activas · {kpi.pausadas} pausadas · {kpi.finalizadas} finalizadas</p>
        </div>
        <div className="flex items-center gap-3">
          {modoDemo && <Badge variant="warning">Modo Demo</Badge>}
          <Button onClick={() => setForm(!mostrarForm)} icon={mostrarForm ? <X size={16} /> : <Plus size={16} />}>
            {mostrarForm ? 'Cancelar' : 'Nueva obra'}
          </Button>
        </div>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <Card className="p-6 mb-6 !border-primary-100 dark:!border-primary-500/20">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4">Nueva obra</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label="Nombre de la obra *" required value={form.nombre}
                onChange={e => setFormData(f => ({...f, nombre: e.target.value}))}
                placeholder="Ej: Instalación HVAC — Edificio Central" />
            </div>
            <Input label="Cliente *" required value={form.cliente}
              onChange={e => setFormData(f => ({...f, cliente: e.target.value}))}
              placeholder="Nombre del cliente" />
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Estado</label>
              <select value={form.estado} onChange={e => setFormData(f => ({...f, estado: e.target.value}))}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                <option value="activa">Activa</option>
                <option value="pausada">Pausada</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
            <Input label="Dirección" value={form.direccion}
              onChange={e => setFormData(f => ({...f, direccion: e.target.value}))}
              placeholder="C/ Ejemplo 1, Ciudad" />
            <Input label="Fecha inicio" type="date" value={form.fecha_inicio}
              onChange={e => setFormData(f => ({...f, fecha_inicio: e.target.value}))} />
            <Input label="Fecha fin estimada" type="date" value={form.fecha_fin}
              onChange={e => setFormData(f => ({...f, fecha_fin: e.target.value}))} />
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Descripción</label>
              <textarea rows={2} value={form.descripcion} onChange={e => setFormData(f => ({...f, descripcion: e.target.value}))}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-none"
                placeholder="Descripción breve de los trabajos..." />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-1">
              <Button type="button" variant="ghost" onClick={() => { setForm(false); setFormData(FORM_VACIO) }}>Cancelar</Button>
              <Button type="submit" loading={guardando}>Guardar obra</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Búsqueda + filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre o cliente..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                filtro === f ? 'bg-primary-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}>
              {f === 'todas' ? `Todas (${obras.length})` : `${ESTADO_CFG[f]?.label} (${obras.filter(o=>o.estado===f).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Listado */}
      {lista.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Building2 size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium text-slate-600 dark:text-slate-300">No hay obras que coincidan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lista.map(obra => {
            const est = ESTADO_CFG[obra.estado]
            return (
              <Card key={obra.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">{obra.nombre}</h3>
                  <Badge variant={est.variant}>{est.label}</Badge>
                </div>
                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-1.5"><User size={13} /> {obra.cliente}</p>
                  {obra.direccion && <p className="flex items-center gap-1.5"><MapPin size={13} /> {obra.direccion}</p>}
                  {(obra.fecha_inicio || obra.fecha_fin) && (
                    <p className="flex items-center gap-1.5"><Calendar size={13} /> {obra.fecha_inicio} → {obra.fecha_fin}</p>
                  )}
                  {obra.descripcion && <p className="text-slate-400 dark:text-slate-500 pt-1 line-clamp-2">{obra.descripcion}</p>}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

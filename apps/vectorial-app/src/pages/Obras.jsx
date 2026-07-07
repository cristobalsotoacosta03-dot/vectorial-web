import { useState } from 'react'
import { useObras } from '../hooks/useObras'

const ESTADO_CFG = {
  activa:    { label: 'Activa',    cls: 'bg-emerald-100 text-emerald-700' },
  pausada:   { label: 'Pausada',   cls: 'bg-amber-100 text-amber-700'    },
  finalizada:{ label: 'Finalizada',cls: 'bg-slate-100 text-slate-500'    },
}

const FILTROS = ['todas', 'activa', 'pausada', 'finalizada']
const FORM_VACIO = { nombre:'', cliente:'', direccion:'', estado:'activa', fecha_inicio:'', fecha_fin:'', descripcion:'' }

export default function Obras() {
  const { obras, loading, modoDemo, addObra, kpi } = useObras()
  const [filtro, setFiltro]       = useState('todas')
  const [mostrarForm, setForm]    = useState(false)
  const [form, setFormData]       = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)

  const lista = filtro === 'todas' ? obras : obras.filter(o => o.estado === filtro)

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)
    await addObra(form)
    setFormData(FORM_VACIO)
    setForm(false)
    setGuardando(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-slate-400">
      <span className="text-4xl animate-spin mr-4">⚙️</span> Cargando obras...
    </div>
  )

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Obras</h1>
          <p className="text-slate-500 text-sm mt-0.5">{kpi.activas} activas · {kpi.pausadas} pausadas · {kpi.finalizadas} finalizadas</p>
        </div>
        <div className="flex items-center gap-3">
          {modoDemo && <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Modo Demo</span>}
          <button onClick={() => setForm(!mostrarForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            {mostrarForm ? '✕ Cancelar' : '+ Nueva obra'}
          </button>
        </div>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Nueva obra</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Nombre de la obra *</label>
              <input required value={form.nombre} onChange={e => setFormData(f => ({...f, nombre: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Ej: Instalación HVAC — Edificio Central" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Cliente *</label>
              <input required value={form.cliente} onChange={e => setFormData(f => ({...f, cliente: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Nombre del cliente" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Estado</label>
              <select value={form.estado} onChange={e => setFormData(f => ({...f, estado: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                <option value="activa">Activa</option>
                <option value="pausada">Pausada</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Dirección</label>
              <input value={form.direccion} onChange={e => setFormData(f => ({...f, direccion: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="C/ Ejemplo 1, Ciudad" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Fecha inicio</label>
              <input type="date" value={form.fecha_inicio} onChange={e => setFormData(f => ({...f, fecha_inicio: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Fecha fin estimada</label>
              <input type="date" value={form.fecha_fin} onChange={e => setFormData(f => ({...f, fecha_fin: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Descripción</label>
              <textarea rows={2} value={form.descripcion} onChange={e => setFormData(f => ({...f, descripcion: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                placeholder="Descripción breve de los trabajos..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => { setForm(false); setFormData(FORM_VACIO) }}
              className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100">Cancelar</button>
            <button type="submit" disabled={guardando}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
              {guardando ? 'Guardando...' : 'Guardar obra'}
            </button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTROS.map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filtro === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}>
            {f === 'todas' ? `Todas (${obras.length})` : `${ESTADO_CFG[f]?.label} (${obras.filter(o=>o.estado===f).length})`}
          </button>
        ))}
      </div>

      {/* Listado */}
      {lista.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-4xl mb-3">🏗️</p>
          <p className="font-medium text-slate-600">No hay obras en este estado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lista.map(obra => {
            const est = ESTADO_CFG[obra.estado]
            return (
              <div key={obra.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-slate-800 text-sm leading-snug">{obra.nombre}</h3>
                  <span className={`${est.cls} text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap`}>{est.label}</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-500">
                  <p>👤 {obra.cliente}</p>
                  {obra.direccion && <p>📍 {obra.direccion}</p>}
                  {(obra.fecha_inicio || obra.fecha_fin) && (
                    <p>📅 {obra.fecha_inicio} → {obra.fecha_fin}</p>
                  )}
                  {obra.descripcion && <p className="text-slate-400 pt-1 line-clamp-2">{obra.descripcion}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

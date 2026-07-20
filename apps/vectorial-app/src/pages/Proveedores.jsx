import { useState } from 'react'
import { Search, X, Plus, Truck, Trophy, Trash2 } from 'lucide-react'
import { useProveedores } from '../hooks/useProveedores'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'

const fmt = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const FORM_PROVEEDOR_VACIO = { nombre: '', cif: '', contacto: '', telefono: '', email: '', notas: '' }
const FORM_OFERTA_VACIO = { material_nombre: '', proveedor_id: '', precio: '', unidad: 'ud', plazo_dias: '', notas: '' }

export default function Proveedores() {
  const {
    proveedores, precios, loading, modoDemo, addProveedor, addOferta, removeOferta,
    materialesConOfertas, comparativaPorMaterial,
  } = useProveedores()
  const { notify } = useToast()

  const [query, setQuery] = useState('')
  const [mostrarFormProveedor, setMostrarFormProveedor] = useState(false)
  const [formProveedor, setFormProveedor] = useState(FORM_PROVEEDOR_VACIO)
  const [guardandoProveedor, setGuardandoProveedor] = useState(false)

  const [mostrarFormOferta, setMostrarFormOferta] = useState(false)
  const [formOferta, setFormOferta] = useState(FORM_OFERTA_VACIO)
  const [guardandoOferta, setGuardandoOferta] = useState(false)
  const [materialComparado, setMaterialComparado] = useState(null)

  const listaProveedores = proveedores.filter(p =>
    !query.trim() || p.nombre.toLowerCase().includes(query.trim().toLowerCase())
  )

  async function handleSubmitProveedor(e) {
    e.preventDefault()
    setGuardandoProveedor(true)
    const res = await addProveedor(formProveedor)
    setGuardandoProveedor(false)
    if (res?.success === false) {
      notify(res.error || 'No se pudo guardar el proveedor', { type: 'error' })
      return
    }
    notify('Proveedor guardado correctamente', { type: 'success' })
    setFormProveedor(FORM_PROVEEDOR_VACIO)
    setMostrarFormProveedor(false)
  }

  async function handleSubmitOferta(e) {
    e.preventDefault()
    setGuardandoOferta(true)
    const res = await addOferta(formOferta)
    setGuardandoOferta(false)
    if (res?.success === false) {
      notify(res.error || 'No se pudo guardar la oferta', { type: 'error' })
      return
    }
    notify('Oferta registrada correctamente', { type: 'success' })
    setMaterialComparado(formOferta.material_nombre)
    setFormOferta(FORM_OFERTA_VACIO)
    setMostrarFormOferta(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
      <Spinner /> Cargando proveedores...
    </div>
  )

  const comparativa = materialComparado ? comparativaPorMaterial(materialComparado) : []

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Proveedores</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {proveedores.length} proveedor{proveedores.length !== 1 ? 'es' : ''} · {precios.length} oferta{precios.length !== 1 ? 's' : ''} registrada{precios.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {modoDemo && <Badge variant="warning">Modo Demo</Badge>}
          <Button variant="secondary" onClick={() => setMostrarFormOferta(!mostrarFormOferta)} icon={mostrarFormOferta ? <X size={16} /> : <Plus size={16} />}>
            {mostrarFormOferta ? 'Cancelar' : 'Registrar oferta'}
          </Button>
          <Button onClick={() => setMostrarFormProveedor(!mostrarFormProveedor)} icon={mostrarFormProveedor ? <X size={16} /> : <Plus size={16} />}>
            {mostrarFormProveedor ? 'Cancelar' : 'Nuevo proveedor'}
          </Button>
        </div>
      </div>

      {/* Formulario nuevo proveedor */}
      {mostrarFormProveedor && (
        <Card className="p-6 !border-primary-100 dark:!border-primary-500/20">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4">Nuevo proveedor</h2>
          <form onSubmit={handleSubmitProveedor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre *" required value={formProveedor.nombre}
              onChange={e => setFormProveedor(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Saltoki Distribución" />
            <Input label="CIF" value={formProveedor.cif}
              onChange={e => setFormProveedor(f => ({ ...f, cif: e.target.value }))} />
            <Input label="Persona de contacto" value={formProveedor.contacto}
              onChange={e => setFormProveedor(f => ({ ...f, contacto: e.target.value }))} />
            <Input label="Teléfono" value={formProveedor.telefono}
              onChange={e => setFormProveedor(f => ({ ...f, telefono: e.target.value }))} />
            <Input label="Email" type="email" value={formProveedor.email}
              onChange={e => setFormProveedor(f => ({ ...f, email: e.target.value }))} />
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Notas</label>
              <textarea rows={2} value={formProveedor.notas} onChange={e => setFormProveedor(f => ({ ...f, notas: e.target.value }))}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-none" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-1">
              <Button type="button" variant="ghost" onClick={() => { setMostrarFormProveedor(false); setFormProveedor(FORM_PROVEEDOR_VACIO) }}>Cancelar</Button>
              <Button type="submit" loading={guardandoProveedor}>Guardar proveedor</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Formulario nueva oferta */}
      {mostrarFormOferta && (
        <Card className="p-6 !border-primary-100 dark:!border-primary-500/20">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4">Registrar oferta de precio</h2>
          {proveedores.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Da de alta al menos un proveedor antes de registrar ofertas.</p>
          ) : (
            <form onSubmit={handleSubmitOferta} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input label="Material *" required value={formOferta.material_nombre}
                  onChange={e => setFormOferta(f => ({ ...f, material_nombre: e.target.value }))}
                  placeholder="Ej: Tubería cobre 22×1 R250" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Proveedor *</label>
                <select required value={formOferta.proveedor_id} onChange={e => setFormOferta(f => ({ ...f, proveedor_id: e.target.value }))}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                  <option value="" disabled>Selecciona…</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <Input label="Precio (€) *" required type="number" min="0" step="0.01" value={formOferta.precio}
                onChange={e => setFormOferta(f => ({ ...f, precio: e.target.value }))} placeholder="0.00" />
              <Input label="Unidad" value={formOferta.unidad}
                onChange={e => setFormOferta(f => ({ ...f, unidad: e.target.value }))} placeholder="ud, ml, kg…" />
              <Input label="Plazo entrega (días)" type="number" min="0" value={formOferta.plazo_dias}
                onChange={e => setFormOferta(f => ({ ...f, plazo_dias: e.target.value }))} />
              <div className="md:col-span-3 flex justify-end gap-3 mt-1">
                <Button type="button" variant="ghost" onClick={() => { setMostrarFormOferta(false); setFormOferta(FORM_OFERTA_VACIO) }}>Cancelar</Button>
                <Button type="submit" loading={guardandoOferta}>Guardar oferta</Button>
              </div>
            </form>
          )}
        </Card>
      )}

      {/* Comparativa de ofertas */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4">Comparación de ofertas</h2>
        {materialesConOfertas.length === 0 ? (
          <p className="text-sm text-slate-400">Aún no hay ofertas registradas para comparar.</p>
        ) : (
          <>
            <div className="max-w-sm mb-4">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Material</label>
              <select value={materialComparado || ''} onChange={e => setMaterialComparado(e.target.value || null)}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                <option value="">Selecciona un material…</option>
                {materialesConOfertas.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {materialComparado && (
              comparativa.length === 0 ? (
                <p className="text-sm text-slate-400">Sin ofertas para este material.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                        {['Proveedor', 'Precio', 'Ud.', 'Plazo', 'Fecha', ''].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {comparativa.map((oferta, i) => (
                        <tr key={oferta.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${i === 0 ? 'bg-emerald-50/60 dark:bg-emerald-500/5' : ''}`}>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                            {i === 0 && <Trophy size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                            {oferta.proveedor?.nombre ?? '—'}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">{fmt(oferta.precio)} €</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{oferta.unidad}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{oferta.plazo_dias != null ? `${oferta.plazo_dias} d` : '—'}</td>
                          <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{oferta.fecha}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => removeOferta(oferta.id)} className="text-slate-300 hover:text-red-500 transition-colors" aria-label="Eliminar oferta">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </Card>

      {/* Búsqueda proveedores */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar proveedor..."
          className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
      </div>

      {/* Listado de proveedores */}
      {listaProveedores.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Truck size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium text-slate-600 dark:text-slate-300">No hay proveedores que coincidan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listaProveedores.map(p => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{p.nombre}</h3>
                {p.cif && <span className="text-xs text-slate-400 font-mono">{p.cif}</span>}
              </div>
              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                {p.contacto && <p>{p.contacto}</p>}
                {p.telefono && <p>{p.telefono}</p>}
                {p.email && <p>{p.email}</p>}
                {p.notas && <p className="text-slate-400 dark:text-slate-500 pt-1">{p.notas}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

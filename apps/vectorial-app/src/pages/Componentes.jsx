import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Search, X, Layers, List, LayoutGrid, Star, ArrowLeft, Calculator,
  Flame, Snowflake, Zap, Droplets, HardHat, Wind,
} from 'lucide-react'
import { CATALOGO_TECNICO, CATEGORIAS_BIBLIA, CALC_LABELS, buscarEnCatalogo } from '../data/catalogo-tecnico'
import Tabs from '../components/ui/Tabs'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'

const FAVORITOS_KEY = 'vectorial_componentes_favoritos'

const CATEGORIA_ICONOS = { gas: Flame, clima: Snowflake, elec: Zap, font: Droplets, civil: HardHat, vent: Wind }

const COLOR_CAT = {
  gas:   { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', actBg: 'bg-orange-50 border-orange-300' },
  clima: { bg: 'bg-cyan-100',   text: 'text-cyan-700',   border: 'border-cyan-200',   dot: 'bg-cyan-500',   actBg: 'bg-cyan-50 border-cyan-300'   },
  elec:  { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500', actBg: 'bg-yellow-50 border-yellow-300' },
  font:  { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500',   actBg: 'bg-blue-50 border-blue-300'   },
  civil: { bg: 'bg-stone-100',  text: 'text-stone-700',  border: 'border-stone-200',  dot: 'bg-stone-500',  actBg: 'bg-stone-50 border-stone-300' },
  vent:  { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500',   actBg: 'bg-teal-50 border-teal-300'   },
}

const ORDENES = [
  { id: 'categoria', label: 'Categoría' },
  { id: 'nombre',    label: 'Nombre (A-Z)' },
  { id: 'normativa', label: 'Normativa' },
]

function readFavoritos() {
  try { return new Set(JSON.parse(localStorage.getItem(FAVORITOS_KEY)) || []) }
  catch { return new Set() }
}

// Convierte una clave de especificación (p.ej. "diametro_mm") en una etiqueta legible
function labelEspec(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b(mm|cm|m2|m3|kw|kv|ka|ma|bar|pa|db|c)\b/gi, m => m.toUpperCase())
    .replace(/^./, c => c.toUpperCase())
}

export default function Componentes() {
  const navigate = useNavigate()
  const location = useLocation()
  const retorno = location.state?.retorno // id de calculadora a la que volver, si venimos de "Buscar componente"

  const [busqueda, setBusqueda]   = useState('')
  const [catActiva, setCatActiva] = useState(null)
  const [seleccionado, setSelec]  = useState(null)
  const [vista, setVista]         = useState('tabla')
  const [orden, setOrden]         = useState('categoria')
  const [soloFavoritos, setSoloFavoritos] = useState(false)
  const [favoritos, setFavoritos] = useState(readFavoritos)

  useEffect(() => {
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify([...favoritos]))
  }, [favoritos])

  function toggleFavorito(id) {
    setFavoritos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const resultados = useMemo(() => {
    let items = buscarEnCatalogo(busqueda, catActiva)
    if (soloFavoritos) items = items.filter(i => favoritos.has(i.id))
    const ordenadas = [...items].sort((a, b) => {
      if (orden === 'nombre') return a.nombre.localeCompare(b.nombre)
      if (orden === 'normativa') return a.normativa.localeCompare(b.normativa)
      return a.categoria.localeCompare(b.categoria) || a.subcategoria.localeCompare(b.subcategoria)
    })
    return ordenadas
  }, [busqueda, catActiva, soloFavoritos, favoritos, orden])

  const subcats = useMemo(() => [...new Set(resultados.map(i => i.subcategoria))], [resultados])

  function handleCat(id) {
    setCatActiva(prev => prev === id ? null : id)
    setSelec(null)
  }

  // Vuelve a la calculadora de origen con el componente seleccionado prellenado
  function usarEnCalculo(item, calcId) {
    navigate('/calculadoras', { state: { tab: calcId, componente: item } })
  }

  return (
    <div>
      {/* ── CABECERA ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 w-9 h-9 rounded-xl flex items-center justify-center">
            <Layers size={20} />
          </span>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Componentes Técnicos</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {CATALOGO_TECNICO.length} componentes de ingeniería · Gas · Climatización · Electricidad · Fontanería · Obra Civil · Ventilación
        </p>
      </div>

      {/* ── Banner de retorno a calculadora ── */}
      {retorno && (
        <div className="flex items-center gap-3 bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 rounded-xl px-4 py-3 mb-5">
          <Calculator size={18} className="text-primary-600 dark:text-primary-400 shrink-0" />
          <p className="text-sm text-primary-700 dark:text-primary-300 flex-1">
            Selecciona un componente para usarlo en <strong>{CALC_LABELS[retorno] || retorno}</strong>
          </p>
          <button onClick={() => navigate('/calculadoras', { state: { tab: retorno } })}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline shrink-0">
            <ArrowLeft size={14} /> Volver sin seleccionar
          </button>
        </div>
      )}

      {/* ── BARRA DE BÚSQUEDA ── */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setSelec(null) }}
          placeholder="Buscar por material, normativa (RITE, UNE, REBT, ITC), diámetro, aplicación..."
          className="w-full pl-11 pr-10 py-3 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
        />
        {busqueda && (
          <button onClick={() => { setBusqueda(''); setSelec(null) }} aria-label="Limpiar búsqueda"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── FILTROS CATEGORÍA ── */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          onClick={() => { setCatActiva(null); setSelec(null) }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            !catActiva ? 'bg-slate-800 text-white border-slate-800' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          Todas ({CATALOGO_TECNICO.length})
        </button>
        {CATEGORIAS_BIBLIA.map(cat => {
          const c = COLOR_CAT[cat.id]
          const Icon = CATEGORIA_ICONOS[cat.id]
          const count = CATALOGO_TECNICO.filter(i => i.categoria === cat.id).length
          const activo = catActiva === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => handleCat(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activo ? `${c.actBg} ${c.text} ${c.border}` : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {Icon && <Icon size={14} />}
              <span>{cat.label}</span>
              <span className={activo ? c.text : 'text-slate-400'}>({count})</span>
            </button>
          )
        })}
        <button
          onClick={() => setSoloFavoritos(s => !s)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            soloFavoritos ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Star size={14} className={soloFavoritos ? 'fill-amber-400 text-amber-400' : ''} />
          Favoritos ({favoritos.size})
        </button>
      </div>

      {/* ── Orden + vista ── */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          Ordenar por
          <select value={orden} onChange={e => setOrden(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/40">
            {ORDENES.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </label>
        <div className="flex gap-1">
          {[['tabla', List], ['cards', LayoutGrid]].map(([v, Icon]) => (
            <button key={v} onClick={() => setVista(v)} aria-label={v === 'tabla' ? 'Vista tabla' : 'Vista tarjetas'}
              className={`p-2 rounded-xl border transition-colors ${
                vista === v ? 'bg-slate-800 text-white border-slate-800' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
              }`}>
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* Resultado count */}
      <p className="text-xs text-slate-400 mb-3">
        {resultados.length} de {CATALOGO_TECNICO.length} componentes
        {busqueda && <span className="ml-1">para "<span className="font-medium text-slate-600 dark:text-slate-300">{busqueda}</span>"</span>}
      </p>

      {resultados.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="Prueba con otro término: normativa, diámetro, material o aplicación."
        />
      ) : vista === 'tabla' ? (
        /* ── VISTA TABLA ── */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {subcats.map(subcat => {
            const items = resultados.filter(i => i.subcategoria === subcat)
            const catId = items[0]?.categoria
            const c = COLOR_CAT[catId] || {}
            return (
              <div key={subcat}>
                <div className={`flex items-center gap-2 px-5 py-2 border-b ${c.border || 'border-slate-200'} ${c.bg || 'bg-slate-50'}`}>
                  <span className={`w-2 h-2 rounded-full ${c.dot || 'bg-slate-400'}`} />
                  <span className={`text-xs font-bold uppercase tracking-wide ${c.text || 'text-slate-600'}`}>{subcat}</span>
                  <span className={`text-xs ${c.text || 'text-slate-400'} opacity-70 ml-1`}>({items.length})</span>
                </div>
                {items.map(item => (
                  <ItemRow key={item.id} item={item} c={c} abierto={seleccionado === item.id}
                    onToggle={() => setSelec(seleccionado === item.id ? null : item.id)}
                    favorito={favoritos.has(item.id)} onFavorito={() => toggleFavorito(item.id)}
                    retorno={retorno} onUsar={usarEnCalculo} onTag={tag => { setBusqueda(tag); setSelec(null) }} />
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        /* ── VISTA TARJETAS ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {resultados.map(item => {
            const c = COLOR_CAT[item.categoria] || {}
            return (
              <ItemCard key={item.id} item={item} c={c} abierto={seleccionado === item.id}
                onToggle={() => setSelec(seleccionado === item.id ? null : item.id)}
                favorito={favoritos.has(item.id)} onFavorito={() => toggleFavorito(item.id)}
                retorno={retorno} onUsar={usarEnCalculo} />
            )
          })}
        </div>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-6">
        Referencia técnica orientativa · Verificar siempre contra la ficha homologada del fabricante y la normativa vigente
      </p>
    </div>
  )
}

// ── Ficha técnica expandida (especificaciones / aplicaciones / notas) ──────
function FichaTecnica({ item, retorno, onUsar, onTag }) {
  const [tab, setTab] = useState('specs')
  const specs = Object.entries(item.especificaciones || {})

  const tabs = [
    { value: 'specs', label: 'Especificaciones' },
    { value: 'apps',  label: 'Aplicaciones' },
    { value: 'notas', label: 'Notas de instalación' },
  ]

  return (
    <div>
      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-3" />

      {tab === 'specs' && (
        specs.length === 0 ? (
          <p className="text-sm text-slate-400">Sin especificaciones estructuradas para este componente.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {specs.map(([key, val]) => (
              <div key={key} className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-0.5">{labelEspec(key)}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{String(val)}</p>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'apps' && (
        <div className="flex flex-wrap gap-1.5">
          {(item.aplicaciones || []).length === 0
            ? <p className="text-sm text-slate-400">Sin aplicaciones registradas.</p>
            : item.aplicaciones.map(a => <Badge key={a} variant="primary">{a}</Badge>)}
        </div>
      )}

      {tab === 'notas' && (
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{item.notas}</p>
      )}

      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
          {retorno ? 'Usar aquí' : 'Usar en cálculo'}
        </span>
        {(item.calculos_relacionados || []).length === 0 && (
          <span className="text-xs text-slate-400">Sin calculadora asociada</span>
        )}
        {retorno
          ? (item.calculos_relacionados || []).includes(retorno) && (
              <button onClick={() => onUsar(item, retorno)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-primary-500 text-white px-3 py-1.5 rounded-lg hover:bg-primary-600 transition-colors">
                <Calculator size={13} /> Usar en {CALC_LABELS[retorno]}
              </button>
            )
          : (item.calculos_relacionados || []).map(calcId => (
              <button key={calcId} onClick={() => onUsar(item, calcId)}
                className="flex items-center gap-1.5 text-xs font-medium bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/30 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors">
                <Calculator size={13} /> {CALC_LABELS[calcId] || calcId}
              </button>
            ))
        }
      </div>

      {item.tags?.length > 0 && onTag && (
        <div className="mt-3 flex flex-wrap gap-1">
          {item.tags.map(tag => (
            <button key={tag} onClick={() => onTag(tag)}
              className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full transition-colors">
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ItemRow({ item, c, abierto, onToggle, favorito, onFavorito, retorno, onUsar, onTag }) {
  const puedeUsarAqui = retorno && (item.calculos_relacionados || []).includes(retorno)
  return (
    <div>
      <div className={`w-full flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${abierto ? 'bg-blue-50 dark:bg-primary-500/10' : ''}`}>
        <button onClick={onFavorito} aria-label="Favorito" className="shrink-0">
          <Star size={15} className={favorito ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'} />
        </button>
        <button onClick={onToggle} className="flex-1 flex items-center gap-4 text-left min-w-0">
          <span className="text-slate-800 dark:text-slate-100 text-sm font-medium flex-1 min-w-0 truncate">{item.nombre}</span>
          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded hidden lg:block whitespace-nowrap">{item.normativa}</span>
          <span className="text-slate-300 dark:text-slate-600 text-xs">{abierto ? '▲' : '▼'}</span>
        </button>
        {puedeUsarAqui && (
          <button onClick={() => onUsar(item, retorno)}
            className="shrink-0 flex items-center gap-1 text-xs font-semibold bg-primary-500 text-white px-2.5 py-1 rounded-lg hover:bg-primary-600 transition-colors">
            <Calculator size={12} /> Usar
          </button>
        )}
      </div>
      {abierto && (
        <div className={`px-5 py-4 ${c.bg || 'bg-slate-50'} dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800`}>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{item.desc}</p>
          <FichaTecnica item={item} retorno={retorno} onUsar={onUsar} onTag={onTag} />
        </div>
      )}
    </div>
  )
}

function ItemCard({ item, c, abierto, onToggle, favorito, onFavorito, retorno, onUsar }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-4 transition-all hover:shadow-md ${
      abierto ? 'border-blue-300 dark:border-primary-500/40 ring-2 ring-blue-100 dark:ring-primary-500/10' : 'border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`${c.bg} ${c.text} text-xs font-medium px-2 py-0.5 rounded-full`}>{item.subcategoria}</span>
        <button onClick={onFavorito} aria-label="Favorito">
          <Star size={16} className={favorito ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'} />
        </button>
      </div>
      <button onClick={onToggle} className="text-left w-full">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1 leading-snug">{item.nombre}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.desc}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">{item.normativa}</span>
          <span className="text-xs text-primary-500">{abierto ? 'Cerrar ▲' : 'Ver detalle ▼'}</span>
        </div>
      </button>
      {abierto && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <FichaTecnica item={item} retorno={retorno} onUsar={onUsar} />
        </div>
      )}
    </div>
  )
}

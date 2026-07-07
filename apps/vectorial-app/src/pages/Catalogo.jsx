import { useState, useMemo } from 'react'
import { CATALOGO_TECNICO, CATEGORIAS_BIBLIA, buscarEnCatalogo } from '../data/catalogo-tecnico'

const fmt = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const COLOR_CAT = {
  gas:   { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', btn: 'bg-orange-500 text-white', actBg: 'bg-orange-50 border-orange-300' },
  clima: { bg: 'bg-cyan-100',   text: 'text-cyan-700',   border: 'border-cyan-200',   dot: 'bg-cyan-500',   btn: 'bg-cyan-500 text-white',   actBg: 'bg-cyan-50 border-cyan-300'   },
  elec:  { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500', btn: 'bg-yellow-500 text-white', actBg: 'bg-yellow-50 border-yellow-300' },
  font:  { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500',   btn: 'bg-blue-500 text-white',   actBg: 'bg-blue-50 border-blue-300'   },
  civil: { bg: 'bg-stone-100',  text: 'text-stone-700',  border: 'border-stone-200',  dot: 'bg-stone-500',  btn: 'bg-stone-600 text-white',  actBg: 'bg-stone-50 border-stone-300' },
  vent:  { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500',   btn: 'bg-teal-500 text-white',   actBg: 'bg-teal-50 border-teal-300'   },
}

export default function Catalogo() {
  const [busqueda, setBusqueda]   = useState('')
  const [catActiva, setCatActiva] = useState(null)   // null = todas
  const [seleccionado, setSelec]  = useState(null)
  const [vista, setVista]         = useState('tabla') // 'tabla' | 'cards'

  const resultados = useMemo(
    () => buscarEnCatalogo(busqueda, catActiva),
    [busqueda, catActiva]
  )

  // Subcategorías únicas dentro de los resultados
  const subcats = useMemo(() => [...new Set(resultados.map(i => i.subcat))], [resultados])

  function handleCat(id) {
    setCatActiva(prev => prev === id ? null : id)
    setSelec(null)
  }

  const itemSelec = seleccionado ? CATALOGO_TECNICO.find(i => i.id === seleccionado) : null

  return (
    <div>
      {/* ── CABECERA ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">📚</span>
          <h1 className="text-2xl font-bold text-slate-800">Biblia del Instalador</h1>
        </div>
        <p className="text-slate-500 text-sm">
          {CATALOGO_TECNICO.length} referencias técnicas · Gas · Climatización · Electricidad · Fontanería · Obra Civil · Ventilación
        </p>
      </div>

      {/* ── BARRA DE BÚSQUEDA ── */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          type="text"
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setSelec(null) }}
          placeholder="Buscar por material, normativa (RITE, UNE, REBT, ITC), diámetro, aplicación..."
          className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
        />
        {busqueda && (
          <button onClick={() => { setBusqueda(''); setSelec(null) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg">✕</button>
        )}
      </div>

      {/* ── FILTROS CATEGORÍA ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setCatActiva(null); setSelec(null) }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            !catActiva ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Todas ({CATALOGO_TECNICO.length})
        </button>
        {CATEGORIAS_BIBLIA.map(cat => {
          const c = COLOR_CAT[cat.id]
          const count = CATALOGO_TECNICO.filter(i => i.cat === cat.id).length
          const activo = catActiva === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => handleCat(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activo ? `${c.actBg} ${c.text} ${c.border}` : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{cat.icono}</span>
              <span>{cat.label}</span>
              <span className={`ml-1 ${activo ? c.text : 'text-slate-400'}`}>({count})</span>
            </button>
          )
        })}
        <div className="ml-auto flex gap-1">
          {['tabla', 'cards'].map(v => (
            <button key={v} onClick={() => setVista(v)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                vista === v ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200'
              }`}>
              {v === 'tabla' ? '≡ Tabla' : '⊞ Tarjetas'}
            </button>
          ))}
        </div>
      </div>

      {/* Resultado count */}
      <p className="text-xs text-slate-400 mb-3">
        {resultados.length} de {CATALOGO_TECNICO.length} referencias
        {busqueda && <span className="ml-1">para "<span className="font-medium text-slate-600">{busqueda}</span>"</span>}
      </p>

      {resultados.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-3">🔍</p>
          <p className="font-semibold text-slate-600">Sin resultados</p>
          <p className="text-sm mt-1">Prueba con otro término: normativa, diámetro, material...</p>
        </div>
      ) : vista === 'tabla' ? (
        /* ── VISTA TABLA ── */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {subcats.map(subcat => {
            const items = resultados.filter(i => i.subcat === subcat)
            const catId = items[0]?.cat
            const c = COLOR_CAT[catId] || {}
            return (
              <div key={subcat}>
                {/* Subcategoría header */}
                <div className={`flex items-center gap-2 px-5 py-2 border-b ${c.border || 'border-slate-200'} ${c.bg || 'bg-slate-50'}`}>
                  <span className={`w-2 h-2 rounded-full ${c.dot || 'bg-slate-400'}`} />
                  <span className={`text-xs font-bold uppercase tracking-wide ${c.text || 'text-slate-600'}`}>{subcat}</span>
                  <span className={`text-xs ${c.text || 'text-slate-400'} opacity-70 ml-1`}>({items.length})</span>
                </div>
                {items.map(item => (
                  <div key={item.id}>
                    <button
                      onClick={() => setSelec(seleccionado === item.id ? null : item.id)}
                      className={`w-full flex items-center gap-4 px-5 py-3 text-left border-b border-slate-100 transition-colors hover:bg-slate-50 ${seleccionado === item.id ? 'bg-blue-50' : ''}`}
                    >
                      <span className="text-slate-800 text-sm font-medium flex-1 min-w-0 truncate">{item.nombre}</span>
                      <span className={`${c.bg} ${c.text} text-xs px-2 py-0.5 rounded-full whitespace-nowrap hidden md:block`}>{item.unidad}</span>
                      <span className="text-slate-700 font-semibold text-sm whitespace-nowrap">{fmt(item.precio)} €</span>
                      <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded hidden lg:block whitespace-nowrap">{item.normativa}</span>
                      <span className="text-slate-300 text-xs">{seleccionado === item.id ? '▲' : '▼'}</span>
                    </button>

                    {/* Detalle expandible */}
                    {seleccionado === item.id && (
                      <div className={`px-5 py-4 ${c.bg || 'bg-slate-50'} border-b border-slate-200`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2 space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Descripción técnica</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{item.desc}</p>
                            </div>
                            {item.notas && (
                              <div className={`${c.bg} border ${c.border} rounded-xl p-3`}>
                                <p className="text-xs font-bold uppercase tracking-wide mb-1 ${c.text}">📌 Notas de instalación</p>
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{item.notas}</p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-3">
                            <div className="bg-white rounded-xl p-3 border border-slate-200">
                              <p className="text-xs text-slate-400 mb-1">Normativa principal</p>
                              <p className="font-mono text-xs font-bold text-slate-700">{item.normativa}</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-slate-200">
                              <p className="text-xs text-slate-400 mb-1">Precio de referencia</p>
                              <p className="text-lg font-bold text-slate-800">{fmt(item.precio)} <span className="text-sm font-normal text-slate-400">€/{item.unidad}</span></p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-slate-200">
                              <p className="text-xs text-slate-400 mb-2">Etiquetas</p>
                              <div className="flex flex-wrap gap-1">
                                {item.tags.map(tag => (
                                  <button key={tag} onClick={() => { setBusqueda(tag); setSelec(null) }}
                                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full transition-colors">
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        /* ── VISTA TARJETAS ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {resultados.map(item => {
            const c = COLOR_CAT[item.cat] || {}
            return (
              <div key={item.id}
                onClick={() => setSelec(seleccionado === item.id ? null : item.id)}
                className={`bg-white rounded-2xl border shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                  seleccionado === item.id ? `border-blue-300 ring-2 ring-blue-100` : 'border-slate-200'
                }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`${c.bg} ${c.text} text-xs font-medium px-2 py-0.5 rounded-full`}>{item.subcat}</span>
                  <span className="text-slate-500 font-semibold text-sm whitespace-nowrap">{fmt(item.precio)} €/{item.unidad}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-1 leading-snug">{item.nombre}</p>
                <p className="text-xs text-slate-500 line-clamp-2">{item.desc}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{item.normativa}</span>
                  <span className="text-xs text-blue-500">{seleccionado === item.id ? 'Cerrar ▲' : 'Ver detalle ▼'}</span>
                </div>
                {seleccionado === item.id && (
                  <div className={`mt-3 pt-3 border-t border-slate-100 ${c.bg} rounded-xl p-3`}>
                    <p className="text-xs text-slate-700 leading-relaxed">{item.notas}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center mt-6">
        Precios orientativos de referencia · Datos técnicos según normativa vigente
      </p>
    </div>
  )
}

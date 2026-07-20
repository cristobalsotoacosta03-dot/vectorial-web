import { useState, useMemo, useEffect } from 'react'
import { Search, Copy, Check } from 'lucide-react'
import { validarNumero } from '../lib/validation'

// ── Conversiones ───────────────────────────────────────────────────────────

const PRESION_UNITS = [
  { id: 'bar',    label: 'bar',     to_pa: 1e5             },
  { id: 'mbar',   label: 'mbar',    to_pa: 100             },
  { id: 'pa',     label: 'Pa',      to_pa: 1               },
  { id: 'kpa',    label: 'kPa',     to_pa: 1e3             },
  { id: 'mmh2o',  label: 'mmH₂O',   to_pa: 9.80665         },
  { id: 'mmhg',   label: 'mmHg',    to_pa: 133.322         },
  { id: 'psi',    label: 'psi',     to_pa: 6894.76         },
  { id: 'atm',    label: 'atm',     to_pa: 101325          },
]

const POTENCIA_UNITS = [
  { id: 'kw',     label: 'kW',      to_kw: 1               },
  { id: 'w',      label: 'W',       to_kw: 0.001           },
  { id: 'kcalh',  label: 'kcal/h',  to_kw: 1/860           },
  { id: 'btuh',   label: 'BTU/h',   to_kw: 1/3412.14       },
  { id: 'cv',     label: 'CV (hp)', to_kw: 0.7355          },
  { id: 'frigoriash', label: 'frig/h', to_kw: -1/860       }, // negativo = frío
]

const LONGITUD_UNITS = [
  { id: 'mm',  label: 'mm',   to_m: 0.001    },
  { id: 'cm',  label: 'cm',   to_m: 0.01     },
  { id: 'm',   label: 'm',    to_m: 1        },
  { id: 'km',  label: 'km',   to_m: 1000     },
  { id: 'in',  label: 'in',   to_m: 0.0254   },
  { id: 'ft',  label: 'ft',   to_m: 0.3048   },
  { id: 'yd',  label: 'yd',   to_m: 0.9144   },
]

// Densidades de gas a condiciones normales (0°C, 1 atm) en kg/Nm³
const GASES_DENS = [
  { id: 'propano',   label: 'Propano (C₃H₈)',   rho: 2.005 },
  { id: 'butano',    label: 'Butano (C₄H₁₀)',   rho: 2.703 },
  { id: 'gas_n',     label: 'Gas natural',       rho: 0.845 },
  { id: 'aire',      label: 'Aire',              rho: 1.293 },
  { id: 'h2',        label: 'Hidrógeno (H₂)',    rho: 0.090 },
]

const TEMPERATURA_UNITS = [
  { id: 'c', label: '°C' },
  { id: 'f', label: '°F' },
  { id: 'k', label: 'K'  },
]

function convertPa(valor, deUnidad) {
  const u = PRESION_UNITS.find(u => u.id === deUnidad)
  if (!u) return {}
  const pa = parseFloat(valor) * u.to_pa
  const result = {}
  PRESION_UNITS.forEach(u2 => { result[u2.id] = pa / u2.to_pa })
  return result
}

function convertKW(valor, deUnidad) {
  const u = POTENCIA_UNITS.find(u => u.id === deUnidad)
  if (!u) return {}
  const kw = parseFloat(valor) * Math.abs(u.to_kw)
  const result = {}
  POTENCIA_UNITS.forEach(u2 => { result[u2.id] = kw / Math.abs(u2.to_kw) })
  return result
}

function convertM(valor, deUnidad) {
  const u = LONGITUD_UNITS.find(u => u.id === deUnidad)
  if (!u) return {}
  const m = parseFloat(valor) * u.to_m
  const result = {}
  LONGITUD_UNITS.forEach(u2 => { result[u2.id] = m / u2.to_m })
  return result
}

// La temperatura no es una conversión multiplicativa (hay desplazamiento de
// origen), así que se pasa siempre por Celsius como unidad intermedia.
function convertTemp(valor, deUnidad) {
  const v = parseFloat(valor)
  if (isNaN(v)) return {}
  let c
  if (deUnidad === 'f') c = (v - 32) * 5 / 9
  else if (deUnidad === 'k') c = v - 273.15
  else c = v
  return { c, f: c * 9 / 5 + 32, k: c + 273.15 }
}

function convertCaudal(valor, gas) {
  const g   = GASES_DENS.find(g => g.id === gas)
  const m3h = parseFloat(valor) || 0
  const rho = g ? g.rho : 1
  return {
    m3h,
    lh:    m3h * 1000,
    lmin:  m3h * 1000 / 60,
    ls:    m3h * 1000 / 3600,
    kgh:   m3h * rho,
    kgmin: m3h * rho / 60,
    nm3h:  m3h, // a 0 °C, ya es Nm³/h si la entrada es a condiciones normales
  }
}

const CATEGORIAS = [
  { id: 'presion',     label: '🔵 Presión',        sub: 'bar · Pa · mmH₂O',      unidades: PRESION_UNITS },
  { id: 'potencia',    label: '🟠 Potencia térmica', sub: 'kW · kcal/h · BTU/h',   unidades: POTENCIA_UNITS },
  { id: 'longitud',    label: '🟣 Longitud',        sub: 'm · mm · in · ft',       unidades: LONGITUD_UNITS },
  { id: 'temperatura', label: '🔴 Temperatura',     sub: '°C · °F · K',            unidades: TEMPERATURA_UNITS },
  { id: 'caudal',      label: '🟢 Caudal gas',      sub: 'm³/h · kg/h · L/min',    unidades: GASES_DENS },
]

// ── Componente ─────────────────────────────────────────────────────────────

const fmtN = (n, dec = 4) => {
  if (!isFinite(n) || isNaN(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1000) return n.toLocaleString('es-ES', { maximumFractionDigits: 2 })
  if (abs >= 10)   return n.toLocaleString('es-ES', { maximumFractionDigits: 3 })
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: dec })
}

function CopyButton({ texto }) {
  const [copiado, setCopiado] = useState(false)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(texto).then(() => {
          setCopiado(true)
          setTimeout(() => setCopiado(false), 1500)
        }).catch(() => {})
      }}
      aria-label="Copiar valor"
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-black/10"
    >
      {copiado ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )
}

export default function ConversorUnidades() {
  const [tab, setTab] = useState('presion')
  const [busqueda, setBusqueda] = useState('')
  const [recientes, setRecientes] = useState([])

  // Presión
  const [pVal,  setPVal]  = useState(1)
  const [pUnit, setPUnit] = useState('bar')
  const presRes = useMemo(() => convertPa(pVal, pUnit), [pVal, pUnit])
  const errP = validarNumero(pVal, { requerido: true, label: 'El valor' })

  // Potencia
  const [poVal,  setPoVal]  = useState(1)
  const [poUnit, setPoUnit] = useState('kw')
  const poRes = useMemo(() => convertKW(poVal, poUnit), [poVal, poUnit])
  const errPo = validarNumero(poVal, { requerido: true, label: 'El valor' })

  // Longitud
  const [lVal,  setLVal]  = useState(1)
  const [lUnit, setLUnit] = useState('m')
  const lRes = useMemo(() => convertM(lVal, lUnit), [lVal, lUnit])
  const errL = validarNumero(lVal, { requerido: true, label: 'El valor' })

  // Temperatura
  const [tVal,  setTVal]  = useState(20)
  const [tUnit, setTUnit] = useState('c')
  const tRes = useMemo(() => convertTemp(tVal, tUnit), [tVal, tUnit])
  const errT = validarNumero(tVal, { requerido: true, label: 'El valor' })

  // Caudal gas
  const [cVal,  setCVal]  = useState(10)
  const [cGas,  setCGas]  = useState('propano')
  const cRes = useMemo(() => convertCaudal(cVal, cGas), [cVal, cGas])
  const errC = validarNumero(cVal, { min: 0, label: 'El caudal' })

  // ── Búsqueda: filtra categorías por nombre o por etiqueta de unidad ────────
  const categoriasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return CATEGORIAS
    return CATEGORIAS.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.unidades.some(u => u.label.toLowerCase().includes(q))
    )
  }, [busqueda])

  useEffect(() => {
    if (categoriasFiltradas.length && !categoriasFiltradas.some(c => c.id === tab)) {
      setTab(categoriasFiltradas[0].id)
    }
  }, [categoriasFiltradas, tab])

  function registrarReciente(entry) {
    setRecientes(prev => [entry, ...prev.filter(r => r.texto !== entry.texto)].slice(0, 6))
  }

  return (
    <div className="space-y-5">
      {/* Búsqueda de unidad */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar unidad (psi, BTU, mmHg, ft...)"
          className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
      </div>

      {/* Recientes */}
      {recientes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide self-center mr-1">Recientes:</span>
          {recientes.map((r, i) => (
            <button key={i} onClick={r.aplicar}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              {r.texto}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      {categoriasFiltradas.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">Ninguna categoría contiene esa unidad</p>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {categoriasFiltradas.map(c => (
            <button key={c.id} onClick={() => setTab(c.id)}
              className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl border text-sm font-semibold transition-all text-left ${tab === c.id ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
              <div>{c.label}</div>
              <div className={`text-xs font-normal mt-0.5 ${tab === c.id ? 'text-slate-300' : 'text-slate-400'}`}>{c.sub}</div>
            </button>
          ))}
        </div>
      )}

      {/* ─── Presión ─── */}
      {tab === 'presion' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex gap-3 mb-1">
            <input type="number" value={pVal} onChange={e => setPVal(e.target.value)} step="any"
              aria-invalid={!!errP}
              className={`flex-1 border rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 transition-colors ${errP ? 'border-red-300 bg-red-50/60 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-400'}`} />
            <select value={pUnit} onChange={e => setPUnit(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {PRESION_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
          {errP && <p className="text-xs text-red-600 font-medium mb-4">{errP}</p>}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${errP ? '' : 'mt-6'}`}>
            {PRESION_UNITS.map(u => (
              <div key={u.id} onClick={() => {
                  setPVal(parseFloat((presRes[u.id] || 0).toPrecision(6))); setPUnit(u.id)
                  registrarReciente({ texto: `${fmtN(presRes[u.id], 4)} ${u.label}`, aplicar: () => { setTab('presion'); setPVal(parseFloat((presRes[u.id] || 0).toPrecision(6))); setPUnit(u.id) } })
                }}
                className={`group relative p-3 rounded-xl border cursor-pointer transition-all ${pUnit === u.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'}`}>
                <CopyButton texto={String(fmtN(presRes[u.id], 4))} />
                <p className={`text-lg font-bold truncate ${pUnit === u.id ? 'text-white' : 'text-slate-800'}`}>{fmtN(presRes[u.id], 4)}</p>
                <p className={`text-xs mt-0.5 font-medium ${pUnit === u.id ? 'text-blue-100' : 'text-slate-400'}`}>{u.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">Haz clic en cualquier unidad para convertir desde ella · 1 bar = 100.000 Pa = 10.197 mmH₂O = 750,06 mmHg</p>
        </div>
      )}

      {/* ─── Potencia térmica ─── */}
      {tab === 'potencia' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex gap-3 mb-1">
            <input type="number" value={poVal} onChange={e => setPoVal(e.target.value)} step="any"
              aria-invalid={!!errPo}
              className={`flex-1 border rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 transition-colors ${errPo ? 'border-red-300 bg-red-50/60 focus:ring-red-400' : 'border-slate-200 focus:ring-orange-400'}`} />
            <select value={poUnit} onChange={e => setPoUnit(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              {POTENCIA_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
          {errPo && <p className="text-xs text-red-600 font-medium mb-4">{errPo}</p>}
          <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${errPo ? '' : 'mt-6'}`}>
            {POTENCIA_UNITS.map(u => (
              <div key={u.id} onClick={() => {
                  setPoVal(parseFloat((poRes[u.id] || 0).toPrecision(6))); setPoUnit(u.id)
                  registrarReciente({ texto: `${fmtN(poRes[u.id], 3)} ${u.label}`, aplicar: () => { setTab('potencia'); setPoVal(parseFloat((poRes[u.id] || 0).toPrecision(6))); setPoUnit(u.id) } })
                }}
                className={`group relative p-3 rounded-xl border cursor-pointer transition-all ${poUnit === u.id ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-50 border-slate-200 hover:bg-orange-50 hover:border-orange-300'}`}>
                <CopyButton texto={String(fmtN(poRes[u.id], 3))} />
                <p className={`text-lg font-bold truncate ${poUnit === u.id ? 'text-white' : 'text-slate-800'}`}>{fmtN(poRes[u.id], 3)}</p>
                <p className={`text-xs mt-0.5 font-medium ${poUnit === u.id ? 'text-orange-100' : 'text-slate-400'}`}>{u.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700">
            <span className="font-bold">Factores clave: </span>
            1 kW = 860 kcal/h = 3.412 BTU/h = 1,36 CV · 1 frigoría/h = 1 kcal/h de frío
          </div>
        </div>
      )}

      {/* ─── Longitud ─── */}
      {tab === 'longitud' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex gap-3 mb-1">
            <input type="number" value={lVal} onChange={e => setLVal(e.target.value)} step="any"
              aria-invalid={!!errL}
              className={`flex-1 border rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 transition-colors ${errL ? 'border-red-300 bg-red-50/60 focus:ring-red-400' : 'border-slate-200 focus:ring-violet-400'}`} />
            <select value={lUnit} onChange={e => setLUnit(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
              {LONGITUD_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
          {errL && <p className="text-xs text-red-600 font-medium mb-4">{errL}</p>}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${errL ? '' : 'mt-6'}`}>
            {LONGITUD_UNITS.map(u => (
              <div key={u.id} onClick={() => {
                  setLVal(parseFloat((lRes[u.id] || 0).toPrecision(6))); setLUnit(u.id)
                  registrarReciente({ texto: `${fmtN(lRes[u.id], 4)} ${u.label}`, aplicar: () => { setTab('longitud'); setLVal(parseFloat((lRes[u.id] || 0).toPrecision(6))); setLUnit(u.id) } })
                }}
                className={`group relative p-3 rounded-xl border cursor-pointer transition-all ${lUnit === u.id ? 'bg-violet-600 border-violet-600 text-white' : 'bg-slate-50 border-slate-200 hover:bg-violet-50 hover:border-violet-300'}`}>
                <CopyButton texto={String(fmtN(lRes[u.id], 4))} />
                <p className={`text-lg font-bold truncate ${lUnit === u.id ? 'text-white' : 'text-slate-800'}`}>{fmtN(lRes[u.id], 4)}</p>
                <p className={`text-xs mt-0.5 font-medium ${lUnit === u.id ? 'text-violet-100' : 'text-slate-400'}`}>{u.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Temperatura ─── */}
      {tab === 'temperatura' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex gap-3 mb-1">
            <input type="number" value={tVal} onChange={e => setTVal(e.target.value)} step="any"
              aria-invalid={!!errT}
              className={`flex-1 border rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 transition-colors ${errT ? 'border-red-300 bg-red-50/60 focus:ring-red-400' : 'border-slate-200 focus:ring-red-400'}`} />
            <select value={tUnit} onChange={e => setTUnit(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
              {TEMPERATURA_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
          {errT && <p className="text-xs text-red-600 font-medium mb-4">{errT}</p>}
          <div className={`grid grid-cols-3 gap-3 ${errT ? '' : 'mt-6'}`}>
            {TEMPERATURA_UNITS.map(u => (
              <div key={u.id} onClick={() => {
                  setTVal(parseFloat((tRes[u.id] ?? 0).toPrecision(6))); setTUnit(u.id)
                  registrarReciente({ texto: `${fmtN(tRes[u.id], 2)} ${u.label}`, aplicar: () => { setTab('temperatura'); setTVal(parseFloat((tRes[u.id] ?? 0).toPrecision(6))); setTUnit(u.id) } })
                }}
                className={`group relative p-3 rounded-xl border cursor-pointer transition-all ${tUnit === u.id ? 'bg-red-500 border-red-500 text-white' : 'bg-slate-50 border-slate-200 hover:bg-red-50 hover:border-red-300'}`}>
                <CopyButton texto={String(fmtN(tRes[u.id], 2))} />
                <p className={`text-lg font-bold truncate ${tUnit === u.id ? 'text-white' : 'text-slate-800'}`}>{fmtN(tRes[u.id], 2)}</p>
                <p className={`text-xs mt-0.5 font-medium ${tUnit === u.id ? 'text-red-100' : 'text-slate-400'}`}>{u.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">°F = °C × 9/5 + 32 · K = °C + 273,15</p>
        </div>
      )}

      {/* ─── Caudal gas ─── */}
      {tab === 'caudal' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Caudal en m³/h (condiciones normales 0 °C · 1 atm)</label>
              <input type="number" value={cVal} onChange={e => setCVal(e.target.value)} step="any"
                aria-invalid={!!errC}
                className={`w-full border rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 transition-colors ${errC ? 'border-red-300 bg-red-50/60 focus:ring-red-400' : 'border-slate-200 focus:ring-green-400'}`} />
              {errC && <p className="text-xs text-red-600 font-medium mt-1">{errC}</p>}
            </div>
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gas / fluido</label>
              <select value={cGas} onChange={e => setCGas(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 h-[50px]">
                {GASES_DENS.map(g => <option key={g.id} value={g.id}>{g.label} ({g.rho} kg/Nm³)</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {[
              ['m³/h',  cRes.m3h,   'Metros cúbicos / hora'],
              ['L/h',   cRes.lh,    'Litros / hora'],
              ['L/min', cRes.lmin,  'Litros / minuto'],
              ['L/s',   cRes.ls,    'Litros / segundo'],
              ['kg/h',  cRes.kgh,   'Kilogramos / hora'],
              ['kg/min',cRes.kgmin, 'Kilogramos / minuto'],
            ].map(([unit, val, desc]) => (
              <div key={unit} className="group relative bg-slate-50 border border-slate-200 rounded-xl p-3">
                <CopyButton texto={String(fmtN(val, 3))} />
                <p className="text-xl font-bold text-slate-800">{fmtN(val, 3)}</p>
                <p className="text-sm font-semibold text-green-600 mt-0.5">{unit}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Densidad {GASES_DENS.find(g => g.id === cGas)?.label}: {GASES_DENS.find(g => g.id === cGas)?.rho} kg/Nm³ a 0 °C y 1 atm
          </p>
        </div>
      )}
    </div>
  )
}

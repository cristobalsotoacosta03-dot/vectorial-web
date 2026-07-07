import { useState, useMemo } from 'react'

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

// Densidades de gas a condiciones normales (0°C, 1 atm) en kg/Nm³
const GASES_DENS = [
  { id: 'propano',   label: 'Propano (C₃H₈)',   rho: 2.005 },
  { id: 'butano',    label: 'Butano (C₄H₁₀)',   rho: 2.703 },
  { id: 'gas_n',     label: 'Gas natural',       rho: 0.845 },
  { id: 'aire',      label: 'Aire',              rho: 1.293 },
  { id: 'h2',        label: 'Hidrógeno (H₂)',    rho: 0.090 },
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

// ── Componente ─────────────────────────────────────────────────────────────

const fmtN = (n, dec = 4) => {
  if (!isFinite(n) || isNaN(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1000) return n.toLocaleString('es-ES', { maximumFractionDigits: 2 })
  if (abs >= 10)   return n.toLocaleString('es-ES', { maximumFractionDigits: 3 })
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: dec })
}

export default function ConversorUnidades() {
  const [tab, setTab] = useState('presion')

  // Presión
  const [pVal,  setPVal]  = useState(1)
  const [pUnit, setPUnit] = useState('bar')
  const presRes = useMemo(() => convertPa(pVal, pUnit), [pVal, pUnit])

  // Potencia
  const [poVal,  setPoVal]  = useState(1)
  const [poUnit, setPoUnit] = useState('kw')
  const poRes = useMemo(() => convertKW(poVal, poUnit), [poVal, poUnit])

  // Caudal gas
  const [cVal,  setCVal]  = useState(10)
  const [cGas,  setCGas]  = useState('propano')
  const cRes = useMemo(() => convertCaudal(cVal, cGas), [cVal, cGas])

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2">
        {[
          ['presion',  '🔵 Presión',       'bar · Pa · mmH₂O'],
          ['potencia', '🟠 Potencia térmica','kW · kcal/h · BTU/h'],
          ['caudal',   '🟢 Caudal gas',    'm³/h · kg/h · L/min'],
        ].map(([id, label, sub]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 px-4 py-3 rounded-xl border text-sm font-semibold transition-all text-left ${tab === id ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
            <div>{label}</div>
            <div className={`text-xs font-normal mt-0.5 ${tab === id ? 'text-slate-300' : 'text-slate-400'}`}>{sub}</div>
          </button>
        ))}
      </div>

      {/* ─── Presión ─── */}
      {tab === 'presion' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex gap-3 mb-6">
            <input type="number" value={pVal} onChange={e => setPVal(e.target.value)} step="any"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <select value={pUnit} onChange={e => setPUnit(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {PRESION_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESION_UNITS.map(u => (
              <div key={u.id} onClick={() => { setPVal(parseFloat((presRes[u.id] || 0).toPrecision(6))); setPUnit(u.id) }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${pUnit === u.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'}`}>
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
          <div className="flex gap-3 mb-6">
            <input type="number" value={poVal} onChange={e => setPoVal(e.target.value)} step="any"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <select value={poUnit} onChange={e => setPoUnit(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              {POTENCIA_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {POTENCIA_UNITS.map(u => (
              <div key={u.id} onClick={() => { setPoVal(parseFloat((poRes[u.id] || 0).toPrecision(6))); setPoUnit(u.id) }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${poUnit === u.id ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-50 border-slate-200 hover:bg-orange-50 hover:border-orange-300'}`}>
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

      {/* ─── Caudal gas ─── */}
      {tab === 'caudal' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Caudal en m³/h (condiciones normales 0 °C · 1 atm)</label>
              <input type="number" value={cVal} onChange={e => setCVal(e.target.value)} step="any"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-400" />
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
              <div key={unit} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
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

import { useState, useMemo } from 'react'
import ExportCalculo from './ExportCalculo'

// ── Demanda ACS por tipo de uso — CTE DB-HE4 Tabla 4.1 ─────────────────────
const USOS_ACS = [
  { id: 'vivienda',   label: 'Vivienda unifamiliar',      demanda: 28,  unidad: 'persona',   icono: '🏠' },
  { id: 'piso',       label: 'Piso / apartamento',        demanda: 22,  unidad: 'persona',   icono: '🏢' },
  { id: 'hotel5',     label: 'Hotel 5★',                  demanda: 69,  unidad: 'plaza',     icono: '⭐' },
  { id: 'hotel4',     label: 'Hotel 4★',                  demanda: 55,  unidad: 'plaza',     icono: '🏨' },
  { id: 'hotel3',     label: 'Hotel 3★',                  demanda: 41,  unidad: 'plaza',     icono: '🏩' },
  { id: 'hostal',     label: 'Hostal / pensión',          demanda: 34,  unidad: 'plaza',     icono: '🛏️' },
  { id: 'hospital',   label: 'Hospital / clínica',        demanda: 55,  unidad: 'cama',      icono: '🏥' },
  { id: 'residencia', label: 'Residencia de mayores',     demanda: 55,  unidad: 'persona',   icono: '👴' },
  { id: 'escuela',    label: 'Escuela / colegio',         demanda: 21,  unidad: 'alumno',    icono: '🎓' },
  { id: 'vestuario',  label: 'Vestuario / gimnasio',      demanda: 21,  unidad: 'usuario',   icono: '🏋️' },
  { id: 'camping',    label: 'Camping',                   demanda: 40,  unidad: 'persona',   icono: '⛺' },
  { id: 'restaurante',label: 'Restaurante',               demanda: 8,   unidad: 'cubierto',  icono: '🍽️' },
  { id: 'oficina',    label: 'Oficina',                   demanda: 2,   unidad: 'trabajador',icono: '💼' },
]

// ── Factores de inercia por sistema — RITE IT 1.2.4.6 ─────────────────────
const SISTEMAS_INERCIA = [
  { id: 'calefaccion',   label: 'Calefacción convencional',   fMin: 10, fRec: 12, fMax: 15, color: 'red'    },
  { id: 'aerotermia',    label: 'Aerotermia / Bomba de calor',fMin: 15, fRec: 18, fMax: 20, color: 'emerald'},
  { id: 'enfriadora',    label: 'Enfriadora / Climatización', fMin: 5,  fRec: 8,  fMax: 10, color: 'blue'   },
  { id: 'combinado',     label: 'Sistema combinado cal.+ref.', fMin: 15, fRec: 17, fMax: 20, color: 'violet' },
]

// ── Cálculo ACS ────────────────────────────────────────────────────────────
function calcACS({ uso, ocupacion, T_acs, T_red }) {
  const u = USOS_ACS.find(x => x.id === uso) || USOS_ACS[0]
  const N   = parseFloat(ocupacion)
  const dT_ref  = 60 - 10  // referencia CTE HE4
  const dT_real = T_acs - T_red
  // Corregir demanda a temperatura real
  const demanda_ref  = u.demanda * N          // L/día a 60 °C
  const demanda_real = demanda_ref * dT_ref / dT_real  // L/día a T_acs
  // Volumen acumulador (25 % demanda diaria — criterio conservador RITE)
  const V_acum = demanda_real * 0.25
  // Potencia caldera: recalentar en 6 h (factor seguridad 1.2)
  const P_kW   = (demanda_real * 1.163 * dT_real) / (6 * 1000) * 1.2
  // Caudal punta: 20 % demanda en 1 h (por RITE)
  const Q_punta = (demanda_real * 0.20)
  return { u, demanda_ref, demanda_real, V_acum, P_kW, Q_punta, dT_real }
}

// ── Cálculo inercia ────────────────────────────────────────────────────────
function calcInercia({ sistema, potencia }) {
  const s  = SISTEMAS_INERCIA.find(x => x.id === sistema) || SISTEMAS_INERCIA[0]
  const P  = parseFloat(potencia)
  const V_min = P * s.fMin
  const V_rec = P * s.fRec
  const V_max = P * s.fMax
  // Fórmula física: t_min = 5 min, ΔT = 5 °C (protección compresor)
  const V_fisico = (P * 1000 * 300) / (4186 * 5) / 1  // en litros
  return { s, V_min, V_rec, V_max, V_fisico }
}

// ── Componente ─────────────────────────────────────────────────────────────
export default function CalcACS({ obraId, obraNombre }) {
  const [modo, setModo] = useState('acumulador')

  // ACS
  const [acsForm, setAcsForm] = useState({ uso: 'vivienda', ocupacion: 4, T_acs: 60, T_red: 12 })
  const rACS = useMemo(() => calcACS(acsForm), [acsForm])

  // Inercia
  const [inForm, setInForm] = useState({ sistema: 'calefaccion', potencia: 30 })
  const rIn = useMemo(() => calcInercia(inForm), [inForm])

  const setA = (k, v) => setAcsForm(f => ({ ...f, [k]: v }))
  const setI = (k, v) => setInForm(f => ({ ...f, [k]: v }))
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })
  const fmtD = n => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

  return (
    <div className="space-y-6">
      {/* Selector de modo */}
      <div className="flex gap-2">
        {[['acumulador','💧 Acumulador ACS','CTE HE-4 · RITE'],['inercia','⚡ Depósito de inercia','RITE IT 1.2.4.6']].map(([v, l, n]) => (
          <button key={v} onClick={() => setModo(v)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${modo === v ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-teal-50'}`}>
            <span>{l}</span>
            <span className="text-xs font-normal opacity-70 hidden sm:inline">— {n}</span>
          </button>
        ))}
      </div>

      {/* ─────────────── MODO ACUMULADOR ACS ─────────────── */}
      {modo === 'acumulador' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
              <span className="bg-teal-100 text-teal-500 w-10 h-10 rounded-xl flex items-center justify-center text-xl">💧</span>
              <div>
                <h2 className="font-bold text-slate-800">Dimensionado de acumulador ACS</h2>
                <p className="text-xs text-slate-400">CTE DB-HE4 Tabla 4.1 · RITE IT 1.1.4.3.3</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Tipo de uso / edificio</label>
              <select value={acsForm.uso} onChange={e => setA('uso', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                {USOS_ACS.map(u => (
                  <option key={u.id} value={u.id}>{u.icono} {u.label} — {u.demanda} L/{u.unidad}·día (a 60 °C)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Ocupación ({rACS.u.unidad}s)
              </label>
              <input type="number" min="1" step="1" value={acsForm.ocupacion}
                onChange={e => setA('ocupacion', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">T. acumulación (°C)</label>
                <input type="number" min="45" max="70" value={acsForm.T_acs}
                  onChange={e => setA('T_acs', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">T. red fría (°C)</label>
                <input type="number" min="5" max="25" value={acsForm.T_red}
                  onChange={e => setA('T_red', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent" />
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-700">
              <span className="font-bold">Base normativa: </span>
              CTE DB-HE4 Tabla 4.1 · RITE IT 1.1.4.3.3 · Demanda corregida a {acsForm.T_acs} °C · Factor seg. 1,2
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-teal-100 text-xs font-semibold uppercase tracking-wider mb-4">Resultados de dimensionado ACS</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{fmt(rACS.V_acum)}<span className="text-lg font-normal ml-0.5">L</span></p>
                  <p className="text-teal-100 text-xs mt-1">Volumen acumulador</p>
                </div>
                <div className="text-center border-l border-teal-400/40">
                  <p className="text-3xl font-bold">{fmtD(rACS.P_kW)}<span className="text-lg font-normal ml-0.5">kW</span></p>
                  <p className="text-teal-100 text-xs mt-1">Potencia mínima caldera</p>
                </div>
              </div>
              <div className="pt-4 border-t border-teal-400/30 grid grid-cols-3 gap-3 text-xs text-teal-100">
                <div className="text-center">
                  <p className="font-bold text-white text-base">{fmt(rACS.demanda_ref)} L</p>
                  <p>Demanda diaria (60 °C)</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-white text-base">{fmt(rACS.demanda_real)} L</p>
                  <p>Demanda corregida ({acsForm.T_acs} °C)</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-white text-base">{fmt(rACS.Q_punta)} L/h</p>
                  <p>Caudal punta (20 %)</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Demandas por uso — CTE DB-HE4</p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {USOS_ACS.slice(0, 8).map(u => (
                  <div key={u.id} className={`flex justify-between p-1.5 rounded-lg ${acsForm.uso === u.id ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-500'}`}>
                    <span>{u.icono} {u.label}</span>
                    <span className="font-bold ml-2">{u.demanda} L</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── MODO INERCIA ─────────────── */}
      {modo === 'inercia' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
              <span className="bg-violet-100 text-violet-500 w-10 h-10 rounded-xl flex items-center justify-center text-xl">⚡</span>
              <div>
                <h2 className="font-bold text-slate-800">Depósito de inercia</h2>
                <p className="text-xs text-slate-400">RITE IT 1.2.4.6 · Protección compresor mín. 5 min</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Tipo de sistema</label>
              <div className="space-y-2">
                {SISTEMAS_INERCIA.map(s => (
                  <button key={s.id} onClick={() => setI('sistema', s.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${inForm.sistema === s.id ? 'bg-violet-50 border-violet-400 text-violet-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">{s.label}</span>
                      <span className="text-xs text-slate-400">{s.fMin}–{s.fMax} L/kW</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Potencia de la instalación (kW)</label>
              <input type="number" min="1" step="1" value={inForm.potencia}
                onChange={e => setI('potencia', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent" />
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-xs text-violet-700">
              <span className="font-bold">Base normativa: </span>
              RITE IT 1.2.4.6 · t_min = 5 min a potencia nominal · ΔT ≥ 5 °C de utilidad
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-violet-100 text-xs font-semibold uppercase tracking-wider mb-4">Volumen de inercia recomendado</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{fmt(rIn.V_min)}<span className="text-sm font-normal ml-0.5">L</span></p>
                  <p className="text-violet-100 text-xs mt-1">Mínimo</p>
                </div>
                <div className="text-center border-x border-violet-400/40">
                  <p className="text-3xl font-bold">{fmt(rIn.V_rec)}<span className="text-sm font-normal ml-0.5">L</span></p>
                  <p className="text-violet-100 text-xs mt-1">Recomendado</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{fmt(rIn.V_max)}<span className="text-sm font-normal ml-0.5">L</span></p>
                  <p className="text-violet-100 text-xs mt-1">Máximo</p>
                </div>
              </div>
              <div className="pt-4 border-t border-violet-400/30 flex gap-6 text-xs text-violet-100">
                <span>Factor: {rIn.s.fMin}–{rIn.s.fMax} L/kW</span>
                <span>Cálculo físico (5 min): {fmt(rIn.V_fisico)} L</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">
                Factores RITE por tipo de sistema
              </p>
              <div className="space-y-2">
                {SISTEMAS_INERCIA.map(s => (
                  <div key={s.id} className={`flex justify-between items-center text-xs p-2 rounded-lg ${inForm.sistema === s.id ? 'bg-violet-50 font-semibold text-violet-700' : 'text-slate-500'}`}>
                    <span>{s.label}</span>
                    <span className="font-bold">{s.fMin}–{s.fMax} L/kW</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
                <span className="font-semibold">Fórmula física: </span>
                V = P(kW) × 1.000 × t(s) / (4.186 × ΔT) ÷ 1.000 litros<br/>
                Con t = 300 s y ΔT = 5 °C → <span className="font-bold">V ≈ P × 14,3 L/kW</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Export ── */}
      <ExportCalculo
        tipo={modo === 'acumulador' ? 'acs' : 'acs'}
        titulo={modo === 'acumulador' ? 'Dimensionado Acumulador ACS' : 'Depósito de Inercia'}
        campos={modo === 'acumulador' ? [
          { label: 'Tipo de uso',               valor: rACS.u.label },
          { label: `Ocupación (${rACS.u.unidad}s)`, valor: String(acsForm.ocupacion) },
          { label: 'T. acumulación ACS',        valor: `${acsForm.T_acs} °C` },
          { label: 'T. red fría',               valor: `${acsForm.T_red} °C` },
          { label: 'Demanda diaria (60 °C ref.)',valor: `${fmt(rACS.demanda_ref)} L/día` },
          { label: 'Demanda corregida',          valor: `${fmt(rACS.demanda_real)} L/día` },
          { label: 'Volumen acumulador',         valor: `${fmt(rACS.V_acum)} L` },
          { label: 'Potencia mínima caldera',    valor: `${rACS.P_kW.toFixed(1)} kW` },
          { label: 'Caudal punta (20 %)',        valor: `${fmt(rACS.Q_punta)} L/h` },
          { label: 'Normativa',                  valor: 'CTE DB-HE4 Tabla 4.1 · RITE IT 1.1.4.3.3' },
        ] : [
          { label: 'Sistema',                    valor: rIn.s.label },
          { label: 'Potencia instalación',       valor: `${inForm.potencia} kW` },
          { label: 'Factor (rango)',              valor: `${rIn.s.fMin}–${rIn.s.fMax} L/kW` },
          { label: 'Volumen mínimo',             valor: `${fmt(rIn.V_min)} L` },
          { label: 'Volumen recomendado',        valor: `${fmt(rIn.V_rec)} L` },
          { label: 'Volumen máximo',             valor: `${fmt(rIn.V_max)} L` },
          { label: 'Cálculo físico (5 min)',     valor: `${fmt(rIn.V_fisico)} L` },
          { label: 'Normativa',                  valor: 'RITE IT 1.2.4.6' },
        ]}
        obraId={obraId}
        obraNombre={obraNombre}
      />
    </div>
  )
}

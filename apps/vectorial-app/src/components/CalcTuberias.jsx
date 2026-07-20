import { useState, useMemo, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, ReferenceDot, ResponsiveContainer, CartesianGrid } from 'recharts'
import ExportCalculo from './ExportCalculo'
import BuscarComponenteButton from './BuscarComponenteButton'
import { validarNumero } from '../lib/validation'

// ── Tablas de referencia ───────────────────────────────────────────────────

// UNE-EN 1057 — Cobre: diámetro exterior × espesor mínimo (normal / alta presión / gas)
const COBRE = [
  { de: 10,   di: 8.8,  e_r250: 0.6, e_r220: 0.8,  label: '10 × 1' },
  { de: 12,   di: 10.8, e_r250: 0.6, e_r220: 0.8,  label: '12 × 1' },
  { de: 15,   di: 13.6, e_r250: 0.7, e_r220: 1.0,  label: '15 × 1' },
  { de: 18,   di: 16.4, e_r250: 0.8, e_r220: 1.0,  label: '18 × 1' },
  { de: 22,   di: 20.2, e_r250: 0.9, e_r220: 1.0,  label: '22 × 1' },
  { de: 28,   di: 26.2, e_r250: 0.9, e_r220: 1.2,  label: '28 × 1' },
  { de: 35,   di: 32.6, e_r250: 1.2, e_r220: 1.5,  label: '35 × 1,5' },
  { de: 42,   di: 39.6, e_r250: 1.2, e_r220: 1.5,  label: '42 × 1,5' },
  { de: 54,   di: 51.0, e_r250: 1.5, e_r220: 1.5,  label: '54 × 1,5' },
  { de: 66.7, di: 63.7, e_r250: 1.5, e_r220: 2.0,  label: '66,7 × 2' },
  { de: 76.1, di: 73.1, e_r250: 1.5, e_r220: 2.0,  label: '76,1 × 2' },
  { de: 88.9, di: 84.9, e_r250: 2.0, e_r220: 2.0,  label: '88,9 × 2' },
  { de: 108,  di: 104,  e_r250: 2.0, e_r220: 2.5,  label: '108 × 2,5' },
]

// Acero DIN 2440 — diámetros nominales interiores aproximados
const ACERO = [
  { dn: 'DN 15 (½")',  di: 16.1, de: 21.3, label: 'DN 15 (½")' },
  { dn: 'DN 20 (¾")',  di: 21.6, de: 26.9, label: 'DN 20 (¾")' },
  { dn: 'DN 25 (1")',  di: 27.2, de: 33.7, label: 'DN 25 (1")' },
  { dn: 'DN 32 (1¼")', di: 36.0, de: 42.4, label: 'DN 32 (1¼")' },
  { dn: 'DN 40 (1½")', di: 41.8, de: 48.3, label: 'DN 40 (1½")' },
  { dn: 'DN 50 (2")',  di: 53.1, de: 60.3, label: 'DN 50 (2")' },
  { dn: 'DN 65 (2½")', di: 68.9, de: 76.1, label: 'DN 65 (2½")' },
  { dn: 'DN 80 (3")',  di: 80.8, de: 88.9, label: 'DN 80 (3")' },
  { dn: 'DN 100 (4")', di: 105.3, de: 114.3, label: 'DN 100 (4")' },
]

// PPR PN20 — diámetros exteriores / interiores (SDR 6)
const PPR = [
  { de: 20,  di: 13.4, label: 'DE 20 (di 13,4)' },
  { de: 25,  di: 16.6, label: 'DE 25 (di 16,6)' },
  { de: 32,  di: 21.2, label: 'DE 32 (di 21,2)' },
  { de: 40,  di: 26.6, label: 'DE 40 (di 26,6)' },
  { de: 50,  di: 33.4, label: 'DE 50 (di 33,4)' },
  { de: 63,  di: 42.0, label: 'DE 63 (di 42,0)' },
  { de: 75,  di: 50.0, label: 'DE 75 (di 50,0)' },
  { de: 90,  di: 60.0, label: 'DE 90 (di 60,0)' },
  { de: 110, di: 73.4, label: 'DE 110 (di 73,4)' },
]

// Velocidades máximas recomendadas (m/s)
const V_MAX = {
  acs_impulsion:  1.5,
  acs_retorno:    1.0,
  calefaccion:    1.5,
  gas_bp:         8.0,
  gas_mp:        20.0,
  af:             2.0,
}

// Propiedades del fluido
const FLUIDOS = {
  acs:         { label: 'ACS (60 °C)',          rho: 983,  nu: 0.478e-6, vmax: 1.5,  color: 'orange' },
  calefaccion: { label: 'Calefacción (80 °C)',   rho: 972,  nu: 0.364e-6, vmax: 1.5,  color: 'red'    },
  af:          { label: 'Agua fría (20 °C)',      rho: 998,  nu: 1.004e-6, vmax: 2.0,  color: 'blue'   },
  gas_bp:      { label: 'Gas BP (< 50 mbar)',    rho: 0.73, nu: 15e-6,   vmax: 8.0,  color: 'amber'  },
  gas_mp:      { label: 'Gas MP (50–4 bar)',     rho: 0.73, nu: 15e-6,   vmax: 20.0, color: 'orange' },
}

// Diámetros interiores en función del material seleccionado
const getDiams = (mat) => {
  if (mat === 'cobre') return COBRE.map(c => ({ di: c.di, label: c.label, ref: c }))
  if (mat === 'acero') return ACERO.map(a => ({ di: a.di, label: a.label, ref: a }))
  if (mat === 'ppr')   return PPR.map(p   => ({ di: p.di, label: p.label, ref: p }))
  return []
}

function calcular({ material, fluido, caudal_lh, longitud, di_mm }) {
  const f  = FLUIDOS[fluido]
  const Q  = parseFloat(caudal_lh) / 3600000  // L/h → m³/s
  const D  = parseFloat(di_mm) / 1000          // mm → m
  const A  = Math.PI * D * D / 4
  const v  = Q / A                              // m/s
  const Re = (v * D) / f.nu
  // Blasius (4000–100000), Laminar (<2000), transición estimada
  let lambda
  if (Re < 2300) lambda = 64 / Math.max(Re, 1)
  else lambda = 0.3164 / Math.pow(Math.max(Re, 4000), 0.25)

  const dP_m    = lambda * (1 / D) * (f.rho * v * v / 2)  // Pa/m
  const dP_tot  = dP_m * parseFloat(longitud)               // Pa total
  const dP_mbar = dP_m / 100                                // Pa/m → mbar/m

  const ok_v    = v <= f.vmax
  const flujo   = Re < 2300 ? 'Laminar' : Re < 4000 ? 'Transición' : 'Turbulento'

  return { v, Re, lambda, dP_m, dP_tot, dP_mbar, ok_v, flujo }
}

// ── Componente ─────────────────────────────────────────────────────────────
export default function CalcTuberias({ obraId, obraNombre, calculadoraId = 'tuberias', componente }) {
  const [material, setMaterial] = useState('cobre')
  const [fluido,   setFluido]   = useState('acs')
  const [form, setForm] = useState({ caudal_lh: 500, longitud: 20 })
  const [diIdx, setDiIdx] = useState(4)  // índice en el array getDiams

  const diams = useMemo(() => getDiams(material), [material])
  const diSel = diams[Math.min(diIdx, diams.length - 1)] || diams[0]

  // Prellenado desde una tubería seleccionada en la Librería de Componentes
  useEffect(() => {
    if (!componente || componente.tipo !== 'tuberia') return
    const mat = (componente.especificaciones?.material || '').toLowerCase()
    const nuevoMaterial = mat.includes('cobre') ? 'cobre' : mat.includes('acero') ? 'acero' : null
    if (!nuevoMaterial) return // PE/multicapa no tienen equivalente en esta calculadora
    setMaterial(nuevoMaterial)
    const diametroObjetivo = componente.especificaciones?.diametro_mm
    if (diametroObjetivo) {
      const lista = getDiams(nuevoMaterial)
      let mejorIdx = 0, mejorDist = Infinity
      lista.forEach((d, i) => {
        const de = d.ref?.de ?? d.di
        const dist = Math.abs(de - diametroObjetivo)
        if (dist < mejorDist) { mejorDist = dist; mejorIdx = i }
      })
      setDiIdx(mejorIdx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componente])

  const r = useMemo(() => {
    if (!diSel) return null
    return calcular({ material, fluido, caudal_lh: form.caudal_lh, longitud: form.longitud, di_mm: diSel.di })
  }, [material, fluido, form, diSel])

  const f = FLUIDOS[fluido]
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const fmtV = n => n.toFixed(2)
  const fmtP = n => n.toFixed(1)
  const fmtBig = n => n.toLocaleString('es-ES', { maximumFractionDigits: 0 })

  const errores = useMemo(() => ({
    caudal_lh: validarNumero(form.caudal_lh, { min: 1, label: 'El caudal' }),
    longitud:  validarNumero(form.longitud,  { min: 0.1, label: 'La longitud del tramo' }),
  }), [form])
  const hayErrores = Object.values(errores).some(Boolean)
  const errClass = err => `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${err ? 'border-red-300 bg-red-50/60 focus:ring-red-400' : 'border-slate-200 focus:ring-sky-400'}`

  // Curva de pérdida de carga unitaria frente al caudal, para el diámetro y
  // fluido seleccionados — sitúa el punto de trabajo actual sobre la curva.
  const curvaPerdida = useMemo(() => {
    if (!diSel) return []
    const puntos = []
    const base = Math.max(parseFloat(form.caudal_lh) || 500, 100)
    for (let i = 1; i <= 10; i++) {
      const q = Math.round(base * i / 5)
      const c = calcular({ material, fluido, caudal_lh: q, longitud: form.longitud, di_mm: diSel.di })
      puntos.push({ caudal: q, perdida: Number(c.dP_m.toFixed(2)) })
    }
    return puntos
  }, [material, fluido, form.caudal_lh, form.longitud, diSel])

  const camposExport = useMemo(() => r && diSel ? [
    { label: 'Material',                     valor: { cobre: 'Cobre (UNE-EN 1057)', acero: 'Acero DIN 2440', ppr: 'PPR PN20' }[material] },
    { label: 'Diámetro',                     valor: diSel.label },
    { label: 'Diámetro interior',            valor: `${diSel.di} mm` },
    { label: 'Fluido',                       valor: FLUIDOS[fluido]?.label },
    { label: 'Caudal',                       valor: `${form.caudal_lh} L/h` },
    { label: 'Longitud tramo',               valor: `${form.longitud} m` },
    { label: 'Velocidad',                    valor: `${fmtV(r.v)} m/s — ${r.ok_v ? '✓ Dentro del límite' : '⚠ Excede límite'}` },
    { label: 'Número de Reynolds',           valor: fmtBig(r.Re) },
    { label: 'Régimen de flujo',             valor: r.flujo },
    { label: 'Coef. de fricción (λ)',        valor: r.lambda.toFixed(4) },
    { label: 'Pérdida carga unitaria',       valor: `${fmtP(r.dP_m)} Pa/m  (${fmtP(r.dP_mbar)} mbar/m)` },
    { label: 'Pérdida carga total tramo',    valor: `${fmtBig(r.dP_tot)} Pa` },
    ...(material === 'cobre' && diSel.ref ? [
      { label: 'Espesor UNE-EN 1057 R250 (ACS/cal.)', valor: `${diSel.ref.e_r250} mm` },
      { label: 'Espesor UNE-EN 1057 R220 (Gas/AP)',   valor: `${diSel.ref.e_r220} mm` },
    ] : []),
    { label: 'Normativa aplicada', valor: 'Darcy-Weisbach · UNE-EN 1057:2010+A1 · RITE IT 1.3.4.2.1' },
  ] : [], [r, diSel, material, fluido, form])

  return (
    <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Panel entrada ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-sky-100 text-sky-500 w-10 h-10 rounded-xl flex items-center justify-center text-xl">⚙️</span>
            <div>
              <h2 className="font-bold text-slate-800">Dimensionado de tuberías</h2>
              <p className="text-xs text-slate-400">Darcy-Weisbach · UNE-EN 1057 · RITE IT 1.3.4.2.1</p>
            </div>
          </div>
          <BuscarComponenteButton calculadoraId={calculadoraId} className="shrink-0" />
        </div>

        {componente && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-xs text-sky-700">
            {componente.tipo === 'tuberia'
              ? <>Material y diámetro prellenados desde <strong>{componente.nombre}</strong></>
              : <><strong>{componente.nombre}</strong> no es una tubería — no se ha prellenado ningún campo.</>}
          </div>
        )}

        {/* Material */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Material</label>
          <div className="flex gap-2">
            {[['cobre','🟤 Cobre'],['acero','⚫ Acero'],['ppr','⚪ PPR']].map(([v, l]) => (
              <button key={v} onClick={() => { setMaterial(v); setDiIdx(0) }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${material === v ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-sky-50'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Fluido */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Fluido</label>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(FLUIDOS).map(([v, info]) => (
              <button key={v} onClick={() => setFluido(v)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-left ${fluido === v ? 'bg-sky-50 border-sky-400 text-sky-700' : 'bg-white text-slate-500 border-slate-200 hover:bg-sky-50'}`}>
                {info.label}
              </button>
            ))}
          </div>
        </div>

        {/* Diámetro interior */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">
            Diámetro {material === 'cobre' ? '(exterior × espesor UNE-EN 1057)' : material === 'acero' ? '(DN)' : '(DE × espesor PPR PN20)'}
          </label>
          <select value={diIdx} onChange={e => setDiIdx(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
            {diams.map((d, i) => (
              <option key={i} value={i}>{d.label} — di {d.di} mm</option>
            ))}
          </select>
        </div>

        {/* Caudal y longitud */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Caudal (L/h)</label>
            <input type="number" min="1" step="10" value={form.caudal_lh}
              onChange={e => set('caudal_lh', e.target.value)}
              aria-invalid={!!errores.caudal_lh}
              className={errClass(errores.caudal_lh)} />
            {errores.caudal_lh && <p className="text-[11px] mt-1 text-red-600 font-medium">{errores.caudal_lh}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Longitud tramo (m)</label>
            <input type="number" min="0.1" step="1" value={form.longitud}
              onChange={e => set('longitud', e.target.value)}
              aria-invalid={!!errores.longitud}
              className={errClass(errores.longitud)} />
            {errores.longitud && <p className="text-[11px] mt-1 text-red-600 font-medium">{errores.longitud}</p>}
          </div>
        </div>
      </div>

      {/* ── Panel resultados ── */}
      {r && (
        <div className="space-y-4">
          {hayErrores && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-medium">
              Corrige los campos marcados en rojo — los resultados no son fiables hasta entonces.
            </div>
          )}
          {/* Velocidad — resultado principal */}
          <div className={`rounded-2xl p-6 text-white shadow-lg ${r.ok_v ? 'bg-gradient-to-br from-sky-500 to-blue-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-4">Resultados hidráulicos</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{fmtV(r.v)}<span className="text-lg font-normal ml-1">m/s</span></p>
                <p className={`text-xs mt-1 font-semibold ${r.ok_v ? 'text-blue-100' : 'text-red-100'}`}>
                  {r.ok_v ? '✓ Velocidad OK' : `⚠ Excede ${f.vmax} m/s`}
                </p>
              </div>
              <div className="text-center border-x border-blue-400/40">
                <p className="text-2xl font-bold">{fmtP(r.dP_m)}<span className="text-sm font-normal ml-1">Pa/m</span></p>
                <p className="text-blue-100 text-xs mt-1">Pérdida unidad</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{fmtBig(r.dP_tot)}<span className="text-sm font-normal ml-1">Pa</span></p>
                <p className="text-blue-100 text-xs mt-1">ΔP total tramo</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-400/30 flex gap-6 text-xs text-blue-100">
              <span>Re = {fmtBig(r.Re)}</span>
              <span>λ = {r.lambda.toFixed(4)}</span>
              <span>Régimen: {r.flujo}</span>
              <span>{fmtP(r.dP_mbar)} mbar/m</span>
            </div>
          </div>

          {/* Curva pérdida de carga vs caudal */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Pérdida de carga unitaria vs. caudal — {diSel?.label}</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={curvaPerdida} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="caudal" tick={{ fontSize: 11 }} unit=" L/h" />
                <YAxis tick={{ fontSize: 11 }} unit=" Pa/m" width={70} />
                <ChartTooltip formatter={v => [`${v} Pa/m`, 'Pérdida de carga']} labelFormatter={q => `${q} L/h`} />
                <ReferenceDot x={Number(form.caudal_lh)} y={r.dP_m} r={4} fill="#0284c7" stroke="white" strokeWidth={1.5} />
                <Line type="monotone" dataKey="perdida" stroke="#0284c7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla de espesores UNE-EN 1057 (solo cobre) */}
          {material === 'cobre' && diSel?.ref && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">
                UNE-EN 1057 — Espesores mínimos para {diSel.label}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-xl font-bold text-slate-700">{diSel.ref.e_r250}<span className="text-sm font-normal ml-1">mm</span></p>
                  <p className="text-xs text-slate-500 mt-1">R250 — ACS / Calefacción / AF</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xl font-bold text-amber-700">{diSel.ref.e_r220}<span className="text-sm font-normal ml-1">mm</span></p>
                  <p className="text-xs text-slate-500 mt-1">R220 — Gas / Alta presión</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Diámetro exterior: {diSel.ref.de} mm · Diámetro interior: {diSel.ref.di} mm · UNE-EN 1057:2010+A1:2010
              </p>
            </div>
          )}

          {/* Velocidades máximas de referencia */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Velocidades máximas recomendadas</h3>
            <div className="space-y-2">
              {[
                ['ACS impulsión',     '≤ 1,5 m/s',  fluido === 'acs',         r.v <= 1.5 && fluido === 'acs'],
                ['ACS retorno',       '≤ 1,0 m/s',  false,                    false],
                ['Calefacción',       '≤ 1,5 m/s',  fluido === 'calefaccion', r.v <= 1.5 && fluido === 'calefaccion'],
                ['Agua fría (AF)',    '≤ 2,0 m/s',  fluido === 'af',          r.v <= 2.0 && fluido === 'af'],
                ['Gas baja presión',  '≤ 8 m/s',    fluido === 'gas_bp',      r.v <= 8.0 && fluido === 'gas_bp'],
                ['Gas media presión', '≤ 20 m/s',   fluido === 'gas_mp',      r.v <= 20.0 && fluido === 'gas_mp'],
              ].map(([label, val, active, ok]) => (
                <div key={label} className={`flex justify-between items-center text-xs py-1.5 px-2 rounded-lg ${active ? 'bg-sky-50 font-semibold' : ''}`}>
                  <span className={active ? 'text-sky-700' : 'text-slate-500'}>{label}</span>
                  <span className={active ? (ok ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold') : 'text-slate-400'}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    {r && <ExportCalculo tipo="tuberias" titulo="Dimensionado de Tubería" campos={camposExport} obraId={obraId} obraNombre={obraNombre} />}
  </div>
  )
}

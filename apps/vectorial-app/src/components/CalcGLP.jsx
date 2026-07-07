import { useState, useMemo } from 'react'
import ExportCalculo from './ExportCalculo'

// ── Constantes ─────────────────────────────────────────────────────────────
const DENSIDADES = { propano: 0.508, butano: 0.580, propano_aire: 0.510 }

const COMERCIALES = [
  { vol: 1000, label: '1.000 L' }, { vol: 2000, label: '2.000 L' },
  { vol: 2450, label: '2.450 L' }, { vol: 4000, label: '4.000 L' },
  { vol: 5000, label: '5.000 L' }, { vol: 10000, label: '10.000 L' },
  { vol: 20000, label: '20.000 L' }, { vol: 50000, label: '50.000 L' },
  { vol: 100000, label: '100.000 L' },
]

// Distancias de seguridad — RIGLO (RD 919/2006) Apéndice 1
const DIST_AEREO = [
  { max: 1000,     edificios: 3,  propiedad: 1,   captaciones: 3,  fosos: 3  },
  { max: 5000,     edificios: 5,  propiedad: 2,   captaciones: 5,  fosos: 5  },
  { max: 10000,    edificios: 7,  propiedad: 3,   captaciones: 7,  fosos: 7  },
  { max: 50000,    edificios: 10, propiedad: 5,   captaciones: 10, fosos: 10 },
  { max: Infinity, edificios: 15, propiedad: 8,   captaciones: 15, fosos: 15 },
]
const DIST_ENTERRADO = [
  { max: 5000,     edificios: 1, propiedad: 0.4, captaciones: 3, fosos: 1 },
  { max: 10000,    edificios: 3, propiedad: 1,   captaciones: 3, fosos: 3 },
  { max: 50000,    edificios: 5, propiedad: 2,   captaciones: 5, fosos: 5 },
  { max: Infinity, edificios: 8, propiedad: 3,   captaciones: 8, fosos: 8 },
]

function calcular({ consumo, autonomia, tipo, fluido }) {
  const dens     = DENSIDADES[fluido] || 0.508
  const V_neta   = (parseFloat(consumo) * parseFloat(autonomia)) / dens
  const V_geom   = V_neta / 0.85  // factor de llenado máx. 85 %
  const comercial = COMERCIALES.find(c => c.vol >= V_geom) || COMERCIALES[COMERCIALES.length - 1]
  const tabla    = tipo === 'aereo' ? DIST_AEREO : DIST_ENTERRADO
  const dist     = tabla.find(d => comercial.vol <= d.max)
  return { V_neta, V_geom, comercial, dist }
}

// ── Componente ─────────────────────────────────────────────────────────────
export default function CalcGLP({ obraId, obraNombre }) {
  const [form, setForm] = useState({ consumo: 10, autonomia: 15, tipo: 'aereo', fluido: 'propano' })
  const r = useMemo(() => calcular(form), [form])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })
  const fmtD = n => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

  const camposExport = useMemo(() => [
    { label: 'Fluido GLP',                    valor: { propano: 'Propano', butano: 'Butano', propano_aire: 'Propano-Aire' }[form.fluido] },
    { label: 'Tipo de depósito',              valor: form.tipo === 'aereo' ? 'Aéreo' : 'Enterrado' },
    { label: 'Consumo diario',                valor: `${form.consumo} kg/día` },
    { label: 'Autonomía requerida',           valor: `${form.autonomia} días` },
    { label: 'Densidad fluido',               valor: `${(DENSIDADES[form.fluido]||0.508).toFixed(3)} kg/L` },
    { label: 'Volumen neto GLP',              valor: `${fmt(r.V_neta)} L` },
    { label: 'Volumen geométrico (85 %)',     valor: `${fmt(r.V_geom)} L` },
    { label: 'Capacidad comercial mínima',    valor: r.comercial.label },
    ...(r.dist ? [
      { label: 'Dist. mín. edificios habitados', valor: `${fmtD(r.dist.edificios)} m` },
      { label: 'Dist. mín. línea propiedad',     valor: `${fmtD(r.dist.propiedad)} m` },
      { label: 'Dist. mín. captaciones agua',    valor: `${fmtD(r.dist.captaciones)} m` },
      { label: 'Dist. mín. fosos / sumideros',   valor: `${fmtD(r.dist.fosos)} m` },
    ] : []),
    { label: 'Normativa aplicada', valor: 'RIGLO (RD 919/2006) · ITC-ICG-04 · UNE 60.250 · f. llenado 85 %' },
  ], [form, r])

  return (
    <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Panel entrada ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="bg-orange-100 text-orange-500 w-10 h-10 rounded-xl flex items-center justify-center text-xl">🔥</span>
          <div>
            <h2 className="font-bold text-slate-800">Datos de la instalación GLP</h2>
            <p className="text-xs text-slate-400">RIGLO · ITC-ICG-04 · RD 919/2006</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Consumo diario (kg/día)</label>
            <input type="number" min="0.1" step="0.5" value={form.consumo}
              onChange={e => set('consumo', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Autonomía deseada (días)</label>
            <input type="number" min="1" max="180" value={form.autonomia}
              onChange={e => set('autonomia', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Tipo de gas</label>
          <div className="flex flex-wrap gap-2">
            {[['propano','Propano — ρ 0,508 kg/L'],['butano','Butano — ρ 0,580 kg/L'],['propano_aire','Propano-Aire — ρ 0,510 kg/L']].map(([v, l]) => (
              <button key={v} onClick={() => set('fluido', v)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${form.fluido === v ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-orange-50'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Tipo de depósito</label>
          <div className="grid grid-cols-2 gap-2">
            {[['aereo','🌿 Aéreo','Tabla 1 RIGLO'], ['enterrado','⛏️ Enterrado','Tabla 2 RIGLO — dist. reducidas']].map(([v, l, d]) => (
              <button key={v} onClick={() => set('tipo', v)}
                className={`text-left p-3 rounded-xl border transition-all ${form.tipo === v ? 'bg-orange-50 border-orange-400 text-orange-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                <div className="text-sm font-semibold">{l}</div>
                <div className="text-xs text-slate-400 mt-0.5">{d}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700">
          <span className="font-bold">Base normativa: </span>
          RIGLO (RD 919/2006) · ITC-ICG-04 · Factor de llenado máx. 85 % · UNE 60.250
        </div>
      </div>

      {/* ── Panel resultados ── */}
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider mb-4">Resultado del dimensionado</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{fmt(r.V_neta)}<span className="text-base font-normal ml-0.5">L</span></p>
              <p className="text-orange-100 text-xs mt-1">Volumen neto GLP</p>
            </div>
            <div className="text-center border-x border-orange-400/40">
              <p className="text-2xl font-bold">{fmt(r.V_geom)}<span className="text-base font-normal ml-0.5">L</span></p>
              <p className="text-orange-100 text-xs mt-1">Vol. geométrico (85 %)</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{r.comercial.label}</p>
              <p className="text-orange-100 text-xs mt-1">Capacidad comercial</p>
            </div>
          </div>
        </div>

        {r.dist && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="text-base">⚠️</span>
              Distancias mínimas de seguridad ({form.tipo === 'aereo' ? 'aéreo' : 'enterrado'}) — {r.comercial.label}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Edificios habitados', r.dist.edificios, 'bg-red-50 border-red-200 text-red-600'],
                ['Línea de propiedad', r.dist.propiedad, 'bg-orange-50 border-orange-200 text-orange-600'],
                ['Captaciones de agua', r.dist.captaciones, 'bg-blue-50 border-blue-200 text-blue-600'],
                ['Fosos / sumideros', r.dist.fosos, 'bg-slate-50 border-slate-200 text-slate-600'],
              ].map(([label, val, cls]) => (
                <div key={label} className={`rounded-xl border p-3 ${cls.split(' ').slice(0,2).join(' ')}`}>
                  <p className={`text-2xl font-bold ${cls.split(' ')[2]}`}>{fmtD(val)}<span className="text-sm font-normal ml-1">m</span></p>
                  <p className="text-xs text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">RIGLO Apéndice 1 · Depósito {r.comercial.label} · {form.tipo === 'aereo' ? 'Tabla 1 — Aéreos' : 'Tabla 2 — Enterrados'}</p>
          </div>
        )}

        {/* Tabla de referencia comerciales */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Capacidades comerciales estándar</p>
          <div className="flex flex-wrap gap-1.5">
            {COMERCIALES.map(c => (
              <span key={c.vol} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${c.vol === r.comercial.vol ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
    <ExportCalculo tipo="glp" titulo="Dimensionado Depósito GLP" campos={camposExport} obraId={obraId} obraNombre={obraNombre} />
    </div>
  )
}

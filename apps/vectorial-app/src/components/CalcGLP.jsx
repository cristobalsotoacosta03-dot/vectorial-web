import { useState, useMemo, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, ReferenceLine, ReferenceDot, ResponsiveContainer, CartesianGrid } from 'recharts'
import ExportCalculo from './ExportCalculo'
import BuscarComponenteButton from './BuscarComponenteButton'
import { validarNumero } from '../lib/validation'

// ── Constantes ─────────────────────────────────────────────────────────────
// temp_ref: temperatura de referencia del fluido licuado usada solo para la
// corrección orientativa de vaporización (no es el punto de ebullición exacto
// a presión de servicio, sino un valor típico de trabajo en depósito).
const FLUIDOS = {
  propano:      { label: 'Propano — ρ 0,508 kg/L',      dens: 0.508, temp_ref: -42   },
  butano:       { label: 'Butano — ρ 0,580 kg/L',       dens: 0.580, temp_ref: -0.5  },
  propano_aire: { label: 'Propano-Aire — ρ 0,510 kg/L', dens: 0.510, temp_ref: -40   },
}

// Capacidades comerciales estándar con dimensiones y superficie de
// vaporización ORIENTATIVAS (estimadas por semejanza geométrica a partir de
// un depósito de 2.450 L de referencia). Sirven para un predimensionado
// rápido — antes de proyecto ejecutivo hay que verificar los valores reales
// contra la ficha técnica homologada del fabricante concreto.
const COMERCIALES = [
  { vol: 1000,    label: '1.000 L',    diametro: 900,  longitud: 2100,  superficie: 1.5  },
  { vol: 2000,    label: '2.000 L',    diametro: 1100, longitud: 2600,  superficie: 2.4  },
  { vol: 2450,    label: '2.450 L',    diametro: 1200, longitud: 2800,  superficie: 2.8  },
  { vol: 4000,    label: '4.000 L',    diametro: 1400, longitud: 3300,  superficie: 3.9  },
  { vol: 5000,    label: '5.000 L',    diametro: 1500, longitud: 3600,  superficie: 4.5  },
  { vol: 10000,   label: '10.000 L',   diametro: 1900, longitud: 4500,  superficie: 7.2  },
  { vol: 20000,   label: '20.000 L',   diametro: 2400, longitud: 4400,  superficie: 11.4 },
  { vol: 50000,   label: '50.000 L',   diametro: 2800, longitud: 8100,  superficie: 21.0 },
  { vol: 100000,  label: '100.000 L',  diametro: 3000, longitud: 14200, superficie: 33.0 },
]

// Caudal específico de vaporización natural/forzada (kg/h por m² de
// superficie del depósito). Valores orientativos habituales en fichas de
// fabricante — la vaporización real depende del nivel de llenado, el viento
// y la temperatura, y debe verificarse con el nomograma del fabricante.
const QSI_NATURAL = 1.8
const QSI_FORZADA = 4.5

// Distancias mínimas de seguridad — UNE 60250:2008 "Tabla de distancias"
// (norma a la que remite íntegramente la ITC-ICG 03 del RD 919/2006 para la
// clasificación y las distancias; el reglamento no las publica él mismo).
// Categorías según la suma de volúmenes geométricos nominales (m³).
// Do = distancia desde orificios · Dp = distancia desde paredes.
// Referencia 1: espacio libre alrededor del depósito.
// Referencia 2: distancia al cerramiento/vallado.
// Referencia 3: distancia a muros o paredes ciegas RF-120 (permite reducir
//   las referencias 4 y 5 hasta un 50 % si se usan como pantalla).
// Referencia 4: límites de propiedad, aberturas de edificios, vías públicas,
//   sótanos, alcantarillas o desagües.
// Referencia 5: aberturas de edificios de uso público (docente, sanitario,
//   culto, espectáculos, centros comerciales) y estaciones de servicio.
const DIST_AEREO = [
  { id: 'A-5',    maxM3: 5,        ref1: 0.6, ref2: 1.25, ref3: 0.6,  ref4Do: 3.0,  ref4Dp: 2.0,  ref5: 6  },
  { id: 'A-13',   maxM3: 13,       ref1: 0.6, ref2: 1.25, ref3: 0.6,  ref4Do: 5.0,  ref4Dp: 3.0,  ref5: 10 },
  { id: 'A-35',   maxM3: 35,       ref1: 1.0, ref2: 1.25, ref3: 1.0,  ref4Do: 7.5,  ref4Dp: 5.0,  ref5: 15 },
  { id: 'A-60',   maxM3: 60,       ref1: 1.0, ref2: 2.0,  ref3: 3.0,  ref4Do: 8.5,  ref4Dp: 6.5,  ref5: 17 },
  { id: 'A-120',  maxM3: 120,      ref1: 1.0, ref2: 3.0,  ref3: 5.0,  ref4Do: 10.0, ref4Dp: 7.5,  ref5: 20 },
  { id: 'A-500',  maxM3: 500,      ref1: 1.0, ref2: 5.0,  ref3: 5.0,  ref4Do: 15.0, ref4Dp: 10.0, ref5: 30 },
  { id: 'A-2000', maxM3: 2000,     ref1: 2.0, ref2: 15.0, ref3: 10.0, ref4Do: 30.0, ref4Dp: 20.0, ref5: 60 },
]
const DIST_ENTERRADO = [
  { id: 'E-5',    maxM3: 5,   ref1: 0.8, ref2: 1.5, ref3: 0.8, ref4Do: 1.5,  ref5: 3  },
  { id: 'E-13',   maxM3: 13,  ref1: 0.8, ref2: 2.5, ref3: 1.0, ref4Do: 3.0,  ref5: 6  },
  { id: 'E-60',   maxM3: 60,  ref1: 0.8, ref2: 3.5, ref3: 1.5, ref4Do: 4.0,  ref5: 8  },
  { id: 'E-120',  maxM3: 120, ref1: 0.8, ref2: 5.0, ref3: 2.5, ref4Do: 5.0,  ref5: 10 },
  { id: 'E-500',  maxM3: 500, ref1: 0.8, ref2: 7.5, ref3: 5.0, ref4Do: 10.0, ref5: 20 },
]

// Vaporización disponible de un depósito según su superficie y régimen
// (natural / forzada con serpentín), corregida por temperatura ambiente.
// Corrección lineal simplificada orientativa — no sustituye al nomograma
// específico del fabricante (no existe una única constante Qsi válida para
// todos los depósitos y condiciones; depende de presión de servicio, nivel
// de llenado y viento).
function calcularVaporizacion({ superficie, tipoVaporizacion, tempAmbiente, tempRef }) {
  const qsiBase = tipoVaporizacion === 'forzada' ? QSI_FORZADA : QSI_NATURAL
  const deltaT = tempAmbiente - tempRef
  const factorTemp = Math.max(0.5, Math.min(1.5, deltaT / 50))
  const qsiCorregido = qsiBase * factorTemp
  return {
    qsiBase,
    qsiCorregido,
    factorTemp,
    vaporizacionMax: superficie * qsiCorregido,
  }
}

function calcular({ consumo, consumoPunta, autonomia, tipo, fluido, tipoVaporizacion, tempAmbiente }) {
  const { dens, temp_ref: tempRef } = FLUIDOS[fluido] || FLUIDOS.propano

  // 1. Volumen de almacenamiento — a partir del consumo diario y la autonomía
  const V_neta = (parseFloat(consumo) * parseFloat(autonomia)) / dens
  const V_geom = V_neta / 0.85 // factor de llenado máx. 85 %
  const comercial = COMERCIALES.find(c => c.vol >= V_geom) || COMERCIALES[COMERCIALES.length - 1]

  // 2. Vaporización — se verifica contra el CONSUMO PUNTA (kg/h), no contra
  // el consumo diario (kg/día): son magnitudes distintas y no comparables.
  const punta = parseFloat(consumoPunta) || 0
  const vaporizacion = calcularVaporizacion({
    superficie: comercial.superficie, tipoVaporizacion, tempAmbiente, tempRef,
  })
  const vaporizacionSuficiente = vaporizacion.vaporizacionMax >= punta

  // 3. Si la vaporización natural no basta, evaluar forzada y, si tampoco,
  // el siguiente depósito comercial que sí la cubra.
  let recomendacion = null
  if (!vaporizacionSuficiente && tipoVaporizacion === 'natural') {
    const forzada = calcularVaporizacion({ superficie: comercial.superficie, tipoVaporizacion: 'forzada', tempAmbiente, tempRef })
    if (forzada.vaporizacionMax >= punta) {
      recomendacion = { tipo: 'forzada', mensaje: 'Vaporización natural insuficiente para la punta indicada. Con vaporizador/serpentín (forzada) sí cubre la demanda.' }
    } else {
      const mayor = COMERCIALES.find(c => {
        const v = calcularVaporizacion({ superficie: c.superficie, tipoVaporizacion: 'forzada', tempAmbiente, tempRef })
        return c.vol >= comercial.vol && v.vaporizacionMax >= punta
      })
      recomendacion = mayor
        ? { tipo: 'mayor_deposito', mensaje: `Ni siquiera con vaporización forzada este depósito cubre la punta. Depósito mínimo recomendado: ${mayor.label}.`, deposito: mayor }
        : { tipo: 'sin_solucion', mensaje: 'La punta indicada supera la vaporización disponible en la gama estándar. Valorar batería de depósitos o vaporizador externo.' }
    }
  } else if (!vaporizacionSuficiente) {
    // ya está en forzada y sigue sin bastar
    const mayor = COMERCIALES.find(c => {
      const v = calcularVaporizacion({ superficie: c.superficie, tipoVaporizacion: 'forzada', tempAmbiente, tempRef })
      return c.vol >= comercial.vol && v.vaporizacionMax >= punta
    })
    recomendacion = mayor
      ? { tipo: 'mayor_deposito', mensaje: `Vaporización forzada insuficiente para la punta indicada. Depósito mínimo recomendado: ${mayor.label}.`, deposito: mayor }
      : { tipo: 'sin_solucion', mensaje: 'La punta indicada supera la vaporización disponible en la gama estándar. Valorar batería de depósitos o vaporizador externo.' }
  }

  // 4. Clasificación UNE 60250 y distancias — por el volumen NOMINAL del
  // depósito comercial seleccionado (así se clasifica la instalación según
  // la norma), no por el volumen calculado antes de redondear.
  const volM3 = comercial.vol / 1000
  const tabla = tipo === 'aereo' ? DIST_AEREO : DIST_ENTERRADO
  const dist = tabla.find(d => volM3 <= d.maxM3) || tabla[tabla.length - 1]

  return { V_neta, V_geom, comercial, dist, vaporizacion, vaporizacionSuficiente, recomendacion, puntaKgH: punta }
}

// ── Componente ─────────────────────────────────────────────────────────────
export default function CalcGLP({ obraId, obraNombre, calculadoraId = 'glp', componente }) {
  const [form, setForm] = useState({
    consumo: 10, consumoPunta: 4, autonomia: 15, tipo: 'aereo', fluido: 'propano',
    tipoVaporizacion: 'natural', tempAmbiente: 15,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Prellenado desde un depósito seleccionado en la Librería de Componentes
  useEffect(() => {
    if (!componente) return
    const instalacion = (componente.especificaciones?.instalacion || '').toLowerCase()
    if (instalacion.includes('enterrado')) set('tipo', 'enterrado')
    else if (instalacion.includes('aéreo') || instalacion.includes('aereo')) set('tipo', 'aereo')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componente])

  const r = useMemo(() => calcular(form), [form])
  const fmt = n => Number(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })
  const fmtD = n => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

  const errores = useMemo(() => ({
    consumo:      validarNumero(form.consumo,      { min: 0.1, label: 'El consumo diario' }),
    consumoPunta: validarNumero(form.consumoPunta,  { min: 0,   label: 'El consumo punta' }),
    autonomia:    validarNumero(form.autonomia,     { min: 1, max: 180, label: 'La autonomía' }),
    tempAmbiente: validarNumero(form.tempAmbiente,  { min: -20, max: 45, label: 'La temperatura ambiente' }),
  }), [form])
  const hayErrores = Object.values(errores).some(Boolean)
  const errClass = err => `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${err ? 'border-red-300 bg-red-50/60 focus:ring-red-400' : 'border-slate-200 focus:ring-orange-400'}`

  // Curva de vaporización disponible frente a la temperatura ambiente, para
  // visualizar el margen del depósito seleccionado en todo el rango de diseño.
  const curvaVaporizacion = useMemo(() => {
    const { dens, temp_ref: tempRef } = FLUIDOS[form.fluido] || FLUIDOS.propano
    const puntos = []
    for (let t = -20; t <= 45; t += 5) {
      const v = calcularVaporizacion({ superficie: r.comercial.superficie, tipoVaporizacion: form.tipoVaporizacion, tempAmbiente: t, tempRef })
      puntos.push({ temp: t, vaporizacion: Number(v.vaporizacionMax.toFixed(2)) })
    }
    return puntos
  }, [form.fluido, form.tipoVaporizacion, r.comercial])

  const camposExport = useMemo(() => [
    { label: 'Fluido GLP',                    valor: FLUIDOS[form.fluido]?.label.split(' — ')[0] },
    { label: 'Tipo de depósito',              valor: form.tipo === 'aereo' ? 'Aéreo' : 'Enterrado' },
    { label: 'Consumo diario',                valor: `${form.consumo} kg/día` },
    { label: 'Consumo punta',                 valor: `${form.consumoPunta} kg/h` },
    { label: 'Autonomía requerida',           valor: `${form.autonomia} días` },
    { label: 'Densidad fluido',               valor: `${(FLUIDOS[form.fluido]?.dens || 0.508).toFixed(3)} kg/L` },
    { label: 'Volumen neto GLP',              valor: `${fmt(r.V_neta)} L` },
    { label: 'Volumen geométrico (85 %)',     valor: `${fmt(r.V_geom)} L` },
    { label: 'Capacidad comercial mínima',    valor: r.comercial.label },
    { label: 'Superficie depósito',           valor: `${fmtD(r.comercial.superficie)} m²` },
    { label: 'Régimen de vaporización',       valor: form.tipoVaporizacion === 'forzada' ? 'Forzada (serpentín)' : 'Natural' },
    { label: 'Qsi corregido',                 valor: `${fmtD(r.vaporizacion.qsiCorregido)} kg/h·m²` },
    { label: 'Vaporización máxima disponible', valor: `${fmtD(r.vaporizacion.vaporizacionMax)} kg/h` },
    { label: 'Vaporización suficiente',       valor: r.vaporizacionSuficiente ? 'Sí' : 'No' },
    ...(r.dist ? [
      { label: 'Categoría UNE 60250',              valor: r.dist.id },
      { label: 'Dist. mín. propiedad/edificios',    valor: `${fmtD(r.dist.ref4Do)} m (Do)${r.dist.ref4Dp != null ? ` / ${fmtD(r.dist.ref4Dp)} m (Dp)` : ''}` },
      { label: 'Dist. mín. edificios uso público',  valor: `${fmtD(r.dist.ref5)} m` },
      { label: 'Dist. mín. cerramiento/vallado',    valor: `${fmtD(r.dist.ref2)} m` },
      { label: 'Espacio libre alrededor depósito',  valor: `${fmtD(r.dist.ref1)} m` },
    ] : []),
    { label: 'Normativa aplicada', valor: 'RD 919/2006 · ITC-ICG 03 · UNE 60250:2008 · f. llenado máx. 85 %' },
  ], [form, r])

  return (
    <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Panel entrada ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-orange-100 text-orange-500 w-10 h-10 rounded-xl flex items-center justify-center text-xl">🔥</span>
            <div>
              <h2 className="font-bold text-slate-800">Datos de la instalación GLP</h2>
              <p className="text-xs text-slate-400">RD 919/2006 · ITC-ICG 03 · UNE 60250:2008</p>
            </div>
          </div>
          <BuscarComponenteButton calculadoraId={calculadoraId} className="shrink-0" />
        </div>

        {componente && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-xs text-orange-700">
            Tipo de depósito prellenado desde <strong>{componente.nombre}</strong>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Consumo diario (kg/día)</label>
            <input type="number" min="0.1" step="0.5" value={form.consumo}
              onChange={e => set('consumo', e.target.value)}
              aria-invalid={!!errores.consumo}
              className={errClass(errores.consumo)} />
            <p className={`text-[11px] mt-1 ${errores.consumo ? 'text-red-600 font-medium' : 'text-slate-400'}`}>{errores.consumo || 'Para dimensionar el volumen del depósito'}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Consumo punta (kg/h)</label>
            <input type="number" min="0" step="0.1" value={form.consumoPunta}
              onChange={e => set('consumoPunta', e.target.value)}
              aria-invalid={!!errores.consumoPunta}
              className={errClass(errores.consumoPunta)} />
            <p className={`text-[11px] mt-1 ${errores.consumoPunta ? 'text-red-600 font-medium' : 'text-slate-400'}`}>{errores.consumoPunta || 'Suma de consumos simultáneos máximos, para verificar vaporización'}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Autonomía deseada (días)</label>
          <input type="number" min="1" max="180" value={form.autonomia}
            onChange={e => set('autonomia', e.target.value)}
            aria-invalid={!!errores.autonomia}
            className={errClass(errores.autonomia)} />
          {errores.autonomia && <p className="text-[11px] mt-1 text-red-600 font-medium">{errores.autonomia}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Tipo de gas</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(FLUIDOS).map(([v, f]) => (
              <button key={v} onClick={() => set('fluido', v)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${form.fluido === v ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-orange-50'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Tipo de depósito</label>
          <div className="grid grid-cols-2 gap-2">
            {[['aereo','🌿 Aéreo','Categorías A-5 a A-2000'], ['enterrado','⛏️ Enterrado','Categorías E-5 a E-500 — dist. reducidas']].map(([v, l, d]) => (
              <button key={v} onClick={() => set('tipo', v)}
                className={`text-left p-3 rounded-xl border transition-all ${form.tipo === v ? 'bg-orange-50 border-orange-400 text-orange-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                <div className="text-sm font-semibold">{l}</div>
                <div className="text-xs text-slate-400 mt-0.5">{d}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Régimen de vaporización</label>
          <div className="grid grid-cols-2 gap-2">
            {[['natural','Natural','Superficie del depósito'], ['forzada','Forzada','Con vaporizador / serpentín']].map(([v, l, d]) => (
              <button key={v} onClick={() => set('tipoVaporizacion', v)}
                className={`text-left p-3 rounded-xl border transition-all ${form.tipoVaporizacion === v ? 'bg-orange-50 border-orange-400 text-orange-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                <div className="text-sm font-semibold">{l}</div>
                <div className="text-xs text-slate-400 mt-0.5">{d}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Temperatura ambiente de diseño (°C)</label>
          <input type="number" min="-20" max="45" step="1" value={form.tempAmbiente}
            onChange={e => set('tempAmbiente', e.target.value)}
            aria-invalid={!!errores.tempAmbiente}
            className={errClass(errores.tempAmbiente)} />
          <p className={`text-[11px] mt-1 ${errores.tempAmbiente ? 'text-red-600 font-medium' : 'text-slate-400'}`}>{errores.tempAmbiente || 'Temperatura mínima esperada en el emplazamiento — a menor temperatura, menor vaporización'}</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700">
          <span className="font-bold">Base normativa: </span>
          RD 919/2006 · ITC-ICG 03 (clasificación y distancias remitidas a UNE 60250:2008) · Factor de llenado máx. 85 %
        </div>
      </div>

      {/* ── Panel resultados ── */}
      <div className="space-y-4">
        {hayErrores && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-medium">
            Corrige los campos marcados en rojo — los resultados no son fiables hasta entonces.
          </div>
        )}
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

        {/* Vaporización */}
        <div className={`rounded-2xl border shadow-sm p-6 ${r.vaporizacionSuficiente ? 'bg-white border-slate-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="text-base">💨</span> Vaporización
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-lg font-bold text-slate-800">{fmtD(r.comercial.superficie)}<span className="text-sm font-normal ml-1">m²</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Superficie depósito</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-lg font-bold text-slate-800">{fmtD(r.vaporizacion.qsiCorregido)}<span className="text-sm font-normal ml-1">kg/h·m²</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Qsi corregido ({form.tipoVaporizacion})</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-lg font-bold text-slate-800">{fmtD(r.vaporizacion.vaporizacionMax)}<span className="text-sm font-normal ml-1">kg/h</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Vaporización máxima</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-lg font-bold text-slate-800">{fmtD(r.puntaKgH)}<span className="text-sm font-normal ml-1">kg/h</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Consumo punta requerido</p>
            </div>
          </div>
          <div className={`rounded-lg px-3 py-2 text-xs font-semibold ${r.vaporizacionSuficiente ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-300'}`}>
            {r.vaporizacionSuficiente
              ? `✅ Cumple — margen ${fmtD(((r.vaporizacion.vaporizacionMax - r.puntaKgH) / (r.puntaKgH || 1)) * 100)} %`
              : `⚠️ Vaporización insuficiente para la punta indicada`}
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Vaporización disponible según temperatura ambiente</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={curvaVaporizacion} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="temp" tick={{ fontSize: 11 }} unit="°C" />
                <YAxis tick={{ fontSize: 11 }} unit=" kg/h" width={70} />
                <ChartTooltip formatter={v => [`${v} kg/h`, 'Vaporización']} labelFormatter={t => `${t} °C`} />
                <ReferenceLine y={r.puntaKgH} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'Punta requerida', position: 'insideTopRight', fontSize: 10, fill: '#dc2626' }} />
                <ReferenceDot x={Number(form.tempAmbiente)} y={r.vaporizacion.vaporizacionMax} r={4} fill="#f97316" stroke="white" strokeWidth={1.5} />
                <Line type="monotone" dataKey="vaporizacion" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {r.recomendacion && (
            <p className="text-xs text-red-700 mt-2">{r.recomendacion.mensaje}</p>
          )}
        </div>

        {/* Depósito seleccionado */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Depósito seleccionado — {r.comercial.label}</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-sm font-bold text-slate-800">{r.comercial.diametro} mm</p>
              <p className="text-[11px] text-slate-400">Diámetro</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{r.comercial.longitud} mm</p>
              <p className="text-[11px] text-slate-400">Longitud</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{fmtD(r.comercial.superficie)} m²</p>
              <p className="text-[11px] text-slate-400">Superficie</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Dimensiones orientativas por semejanza geométrica — verificar contra la ficha técnica homologada del fabricante concreto antes del proyecto ejecutivo.</p>
        </div>

        {r.dist && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="text-base">⚠️</span>
              Distancias mínimas — categoría {r.dist.id} ({form.tipo === 'aereo' ? 'aéreo' : 'enterrado'})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-3 bg-red-50 border-red-200 text-red-600">
                <p className="text-xl font-bold">
                  {fmtD(r.dist.ref4Do)}<span className="text-sm font-normal ml-1">m</span>
                  {r.dist.ref4Dp != null && <span className="text-sm font-normal text-red-400"> (Do) / {fmtD(r.dist.ref4Dp)} m (Dp)</span>}
                </p>
                <p className="text-xs text-slate-500 mt-1">Límite de propiedad, aberturas de edificios, vías públicas, sótanos y desagües</p>
              </div>
              <div className="rounded-xl border p-3 bg-orange-50 border-orange-200 text-orange-600">
                <p className="text-xl font-bold">{fmtD(r.dist.ref5)}<span className="text-sm font-normal ml-1">m</span></p>
                <p className="text-xs text-slate-500 mt-1">Edificios de uso público (docente, sanitario, culto, comercial, estaciones de servicio)</p>
              </div>
              <div className="rounded-xl border p-3 bg-blue-50 border-blue-200 text-blue-600">
                <p className="text-xl font-bold">{fmtD(r.dist.ref2)}<span className="text-sm font-normal ml-1">m</span></p>
                <p className="text-xs text-slate-500 mt-1">Cerramiento / vallado de la estación de GLP</p>
              </div>
              <div className="rounded-xl border p-3 bg-slate-50 border-slate-200 text-slate-600">
                <p className="text-xl font-bold">{fmtD(r.dist.ref1)}<span className="text-sm font-normal ml-1">m</span></p>
                <p className="text-xs text-slate-500 mt-1">Espacio libre alrededor de la proyección del depósito</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              UNE 60250:2008 — Cuadro de distancias, categoría {r.dist.id} · Do = desde orificios, Dp = desde paredes.
              Con muros ciegos RF-120 (dist. {fmtD(r.dist.ref3)} m) las distancias a propiedad y a edificios de uso público pueden reducirse hasta un 50 %.
            </p>
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

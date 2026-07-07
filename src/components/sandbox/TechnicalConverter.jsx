import { useMemo, useState } from 'react'
import ToolHeader from './ToolHeader'
import {
  FLOW_FACTORS,
  NOMINAL_DIAMETERS,
  PRESSURE_FACTORS,
  convertFromBase,
} from '../../lib/engineering'
import { inputClass, labelClass } from '../../lib/uiConstants'

function ResultRow({ label, value, unit }) {
  return (
    <div className="flex items-baseline justify-between border-b border-white/5 py-2 last:border-b-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-mono text-lg tabular-nums text-white">
        {value} <span className="text-sm text-slate-500">{unit}</span>
      </span>
    </div>
  )
}

function PressureConverter() {
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState('bar')

  const results = useMemo(() => {
    const numeric = parseFloat(value)
    if (!Number.isFinite(numeric)) return null
    const valueInBase = numeric / PRESSURE_FACTORS[unit].factor
    return convertFromBase(valueInBase, PRESSURE_FACTORS)
  }, [value, unit])

  return (
    <div>
      <h4 className="font-heading text-base font-semibold text-white">Presión</h4>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          type="number"
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="ej. 3.5"
          className={inputClass}
        />
        <select
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
          className={`${inputClass} sm:w-32`}
        >
          {Object.entries(PRESSURE_FACTORS).map(([key, item]) => (
            <option key={key} value={key} className="bg-slate-950">
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="glass-panel mt-4 rounded-2xl border border-white/5 bg-navy-900/40 p-4">
        <ResultRow label="bar" value={results ? results.bar.toFixed(3) : '—'} unit="bar" />
        <ResultRow label="kPa" value={results ? results.kpa.toFixed(2) : '—'} unit="kPa" />
        <ResultRow label="psi" value={results ? results.psi.toFixed(2) : '—'} unit="psi" />
      </div>
    </div>
  )
}

function FlowConverter() {
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState('m3h')

  const results = useMemo(() => {
    const numeric = parseFloat(value)
    if (!Number.isFinite(numeric)) return null
    const valueInBase = numeric / FLOW_FACTORS[unit].factor
    return convertFromBase(valueInBase, FLOW_FACTORS)
  }, [value, unit])

  return (
    <div>
      <h4 className="font-heading text-base font-semibold text-white">Caudal</h4>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          type="number"
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="ej. 12.6"
          className={inputClass}
        />
        <select
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
          className={`${inputClass} sm:w-32`}
        >
          {Object.entries(FLOW_FACTORS).map(([key, item]) => (
            <option key={key} value={key} className="bg-slate-950">
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="glass-panel mt-4 rounded-2xl border border-white/5 bg-navy-900/40 p-4">
        <ResultRow label="L/s" value={results ? results.ls.toFixed(3) : '—'} unit="L/s" />
        <ResultRow label="m³/h" value={results ? results.m3h.toFixed(3) : '—'} unit="m³/h" />
      </div>
    </div>
  )
}

function DiameterConverter() {
  const [index, setIndex] = useState(4)
  const active = NOMINAL_DIAMETERS[index]

  return (
    <div>
      <h4 className="font-heading text-base font-semibold text-white">
        Diámetros nominales
      </h4>
      <div className="mt-3">
        <label htmlFor="nominal-size" className={labelClass}>
          Tamaño nominal
        </label>
        <select
          id="nominal-size"
          value={index}
          onChange={(event) => setIndex(Number(event.target.value))}
          className={inputClass}
        >
          {NOMINAL_DIAMETERS.map((item, i) => (
            <option key={item.inch} value={i} className="bg-slate-950">
              {item.inch}
            </option>
          ))}
        </select>
      </div>
      <div className="glass-panel mt-4 rounded-2xl border border-white/5 bg-navy-900/40 p-4">
        <ResultRow label="Acero (DN)" value={active.steelDN} unit="mm" />
        <ResultRow label="Cobre (Ø nominal)" value={active.copperMm} unit="mm" />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Tabla de referencia orientativa (series ISO 6708 / EN 1057).
      </p>
    </div>
  )
}

function TechnicalConverter() {
  return (
    <div>
      <ToolHeader
        icon="⇄"
        title="Equivalencias"
        description="Conversión técnica instantánea entre las unidades más habituales en obra."
      />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <PressureConverter />
        <FlowConverter />
        <div className="sm:col-span-2">
          <DiameterConverter />
        </div>
      </div>
    </div>
  )
}

export default TechnicalConverter

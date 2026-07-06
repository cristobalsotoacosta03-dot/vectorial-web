import { useMemo, useState } from 'react'
import ToolHeader from './ToolHeader'

const conversions = {
  inch_mm: {
    label: 'Pulgadas (") → Milímetros (mm)',
    fromUnit: '"',
    toUnit: 'mm',
    convert: (value) => value * 25.4,
  },
  bar_pa: {
    label: 'Bar → Pascal (Pa)',
    fromUnit: 'bar',
    toUnit: 'Pa',
    convert: (value) => value * 100000,
  },
  lmin_m3h: {
    label: 'Caudal: L/min → m³/h',
    fromUnit: 'L/min',
    toUnit: 'm³/h',
    convert: (value) => value * 0.06,
  },
}

function UnitConverter() {
  const [type, setType] = useState('inch_mm')
  const [value, setValue] = useState('')

  const active = conversions[type]

  const result = useMemo(() => {
    const numeric = parseFloat(value)
    if (!Number.isFinite(numeric)) return null
    return active.convert(numeric)
  }, [value, active])

  return (
    <div>
      <ToolHeader
        icon="🔁"
        title="Equivalencias Técnicas"
        description="Convierte al instante entre las unidades que más usas en obra."
      />

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 text-left">
          <label
            htmlFor="conversion-type"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Conversión
          </label>
          <select
            id="conversion-type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          >
            {Object.entries(conversions).map(([key, item]) => (
              <option key={key} value={key} className="bg-slate-950">
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 text-left">
          <label
            htmlFor="conversion-value"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Valor en {active.fromUnit}
          </label>
          <input
            id="conversion-value"
            type="number"
            step="any"
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
        <p className="text-sm font-medium text-slate-400">Resultado</p>
        <p className="font-heading mt-1 text-2xl font-bold text-white">
          {result !== null
            ? `${result.toLocaleString('es-ES', { maximumFractionDigits: 3 })} ${active.toUnit}`
            : `— ${active.toUnit}`}
        </p>
      </div>
    </div>
  )
}

export default UnitConverter

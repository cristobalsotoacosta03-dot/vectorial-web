import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ToolHeader from './ToolHeader'
import { ENCLOSURE_PRESETS, calculateThermalPower } from '../../lib/engineering'
import { inputClass, labelClass } from '../../lib/uiConstants'
import InfoTooltip from './InfoTooltip'
import TechnicalReport from './TechnicalReport'

function ThermalSizing() {
  const [area, setArea] = useState('')
  const [deltaT, setDeltaT] = useState('')
  const [enclosureKey, setEnclosureKey] = useState('wall_insulated')
  const [u, setU] = useState(ENCLOSURE_PRESETS.wall_insulated.u)
  const [result, setResult] = useState(null)
  const [showReport, setShowReport] = useState(false)

  const handleEnclosureChange = (event) => {
    const key = event.target.value
    setEnclosureKey(key)
    setU(ENCLOSURE_PRESETS[key].u ?? '')
  }

  const handleCalculate = (event) => {
    event.preventDefault()
    const areaValue = parseFloat(area)
    const deltaTValue = parseFloat(deltaT)
    const uValue = parseFloat(u)

    if (
      [areaValue, deltaTValue, uValue].some(
        (value) => !Number.isFinite(value) || value <= 0,
      )
    ) {
      return
    }

    setResult(calculateThermalPower({ area: areaValue, deltaT: deltaTValue, u: uValue }))
  }

  return (
    <div>
      <ToolHeader
        icon="🌡️"
        title="Dimensionado"
        description="Potencia térmica básica por transmisión: Q = U · A · ΔT."
      />

      <form onSubmit={handleCalculate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="text-left">
          <label htmlFor="area" className={labelClass}>
            Área (m²)
          </label>
          <input
            id="area"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            placeholder="ej. 18.5"
            className={inputClass}
          />
        </div>

        <div className="text-left">
          <label htmlFor="delta-t" className={labelClass}>
            Salto térmico ΔT (°C)
          </label>
          <input
            id="delta-t"
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            value={deltaT}
            onChange={(event) => setDeltaT(event.target.value)}
            placeholder="ej. 20"
            className={inputClass}
          />
        </div>

        <div className="text-left">
          <label htmlFor="enclosure" className={labelClass}>
            Tipo de cerramiento
            <InfoTooltip text="Coeficientes U de referencia según CTE DB-HE e ISO 6946." />
          </label>
          <select
            id="enclosure"
            value={enclosureKey}
            onChange={handleEnclosureChange}
            className={inputClass}
          >
            {Object.entries(ENCLOSURE_PRESETS).map(([key, preset]) => (
              <option key={key} value={key} className="bg-slate-950">
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-left">
          <label htmlFor="u-value" className={labelClass}>
            Coeficiente U (W/m²K)
          </label>
          <input
            id="u-value"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={u}
            onChange={(event) => {
              setEnclosureKey('custom')
              setU(event.target.value)
            }}
            placeholder="ej. 0.6"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="glass-panel sm:col-span-2 rounded-2xl bg-orange-500 px-8 py-3 text-base font-semibold text-white shadow-xl shadow-orange-500/20 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-orange-400 hover:shadow-orange-500/40"
        >
          Calcular
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            key={result.watts}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="glass-panel mt-6 rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-left"
          >
            <p className="text-sm font-medium text-slate-400">Potencia térmica estimada</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">
              {result.kilowatts.toFixed(2)}{' '}
              <span className="text-base text-slate-500">kW</span>
              <span className="ml-3 text-base text-slate-500">
                ({result.watts.toFixed(0)} W)
              </span>
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Cálculo de transmisión básico (Q = U·A·ΔT). No incluye
              renovaciones de aire ni puentes térmicos.
            </p>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowReport(!showReport)}
                className="glass-panel px-6 py-3 rounded-xl text-sm font-semibold text-orange-400 border border-orange-500/30 hover:bg-orange-500/10 transition-all"
              >
                {showReport ? 'Ocultar Informe' : '📄 Generar Informe Técnico'}
              </button>
            </div>

            <AnimatePresence>
              {showReport && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <TechnicalReport
                    type="thermal"
                    calculationData={{
                      inputs: {
                        area: parseFloat(area),
                        deltaT: parseFloat(deltaT),
                        u: parseFloat(u),
                      },
                      results: result,
                      metadata: result.metadata,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ThermalSizing

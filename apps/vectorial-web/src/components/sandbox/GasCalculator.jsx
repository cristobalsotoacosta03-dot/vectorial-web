import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ToolHeader from './ToolHeader'
import {
  FLUID_PRESETS,
  GAS_MAX_VELOCITY,
  calculateGasPressureDrop,
  validatePhysicalParameters,
} from 'vectorial-app/lib/engineering'
import { MATERIAL_CATALOG } from 'vectorial-app/lib/materials'
import { estimateBillOfMaterials } from 'vectorial-app/lib/bom'
import { inputClass, labelClass, getInputClass } from 'vectorial-app/lib/uiConstants'
import InfoTooltip from './InfoTooltip'
import TechnicalReport from './TechnicalReport'

/**
 * Calculadora de instalaciones de gas natural.
 * Cumplimiento: UNE 60670:2006
 *
 * @component
 * @author VECTORIAL Engineering Team
 * @version 2.0.0
 */
function GasCalculator() {
  const [flow, setFlow] = useState('')
  const [diameter, setDiameter] = useState('')
  const [length, setLength] = useState('')
  const [pressure, setPressure] = useState('')
  const [gasType, setGasType] = useState('natural_gas')
  const [materialKey, setMaterialKey] = useState('steel_medium')
  const [result, setResult] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])
  const [showReport, setShowReport] = useState(false)

  const bom = useMemo(() => {
    const diameterValue = parseFloat(diameter)
    const lengthValue = parseFloat(length)
    if (!Number.isFinite(diameterValue) || !Number.isFinite(lengthValue) || diameterValue <= 0 || lengthValue <= 0) {
      return null
    }
    return estimateBillOfMaterials({ length: lengthValue, diameter: diameterValue, material: materialKey })
  }, [diameter, length, materialKey])

  const diameterRange = useMemo(() => {
    const catalog = MATERIAL_CATALOG[materialKey]?.catalog
    if (!catalog?.length) return null
    const ids = catalog.map((pipe) => pipe.id)
    return { min: Math.min(...ids), max: Math.max(...ids) }
  }, [materialKey])

  const diameterStatus = useMemo(() => {
    if (!diameter || !diameterRange) return 'ok'
    const value = parseFloat(diameter)
    if (!Number.isFinite(value) || value <= 0) return 'error'
    if (value < diameterRange.min || value > diameterRange.max) return 'warning'
    return 'ok'
  }, [diameter, diameterRange])

  const pressureStatus = useMemo(() => {
    if (!pressure) return 'ok'
    const value = parseFloat(pressure)
    return Number.isFinite(value) && value > 0 ? 'ok' : 'error'
  }, [pressure])

  const handleCalculate = (event) => {
    event.preventDefault()
    setValidationErrors([])

    const flowValue = parseFloat(flow)
    const diameterValue = parseFloat(diameter)
    const lengthValue = parseFloat(length)
    const pressureValue = parseFloat(pressure)

    // Validación básica de entrada
    const basicValidation = validatePhysicalParameters({
      flow: flowValue,
      diameter: diameterValue,
      length: lengthValue,
      pressure: pressureValue,
    })

    if (!basicValidation.isValid) {
      setValidationErrors(basicValidation.errors)
      return
    }

    try {
      const calculationResult = calculateGasPressureDrop({
        flow: flowValue,
        diameter: diameterValue,
        length: lengthValue,
        pressure: pressureValue,
        gasType,
        material: materialKey,
      })

      // Validación específica de resultados
      const resultValidation = validatePhysicalParameters({
        velocity: calculationResult.velocity,
        reynolds: calculationResult.reynolds,
      })

      if (resultValidation.warnings.length > 0) {
        // Mostrar advertencias pero permitir el resultado
        console.warn('Advertencias de validación:', resultValidation.warnings)
      }

      setResult(calculationResult)
    } catch (error) {
      setValidationErrors([error.message])
      setResult(null)
    }
  }

  const getComplianceColor = (compliance) => {
    return compliance === 'CUMPLE'
      ? 'text-green-400 border-green-500/30 bg-green-500/10'
      : 'text-red-400 border-red-500/30 bg-red-500/10'
  }

  return (
    <div>
      <ToolHeader
        icon="GAS"
        title="Instalaciones de Gas"
        description="Cálculo de pérdida de carga en tuberías de gas según UNE 60670:2006."
      />

      <form onSubmit={handleCalculate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="text-left">
          <label htmlFor="gas-type" className={labelClass}>
            Tipo de gas
            <InfoTooltip text="Densidad y viscosidad de referencia a 15°C / 1 atm, según UNE 60670 (gas natural, propano, butano)." />
          </label>
          <select
            id="gas-type"
            value={gasType}
            onChange={(event) => setGasType(event.target.value)}
            className={inputClass}
          >
            {Object.entries(FLUID_PRESETS).map(([key, preset]) => {
              if (!['natural_gas', 'propane', 'butane'].includes(key)) return null
              return (
                <option key={key} value={key} className="bg-slate-950">
                  {preset.label}
                </option>
              )
            })}
          </select>
        </div>

        <div className="text-left">
          <label htmlFor="material" className={labelClass}>
            Material de tubería
            <InfoTooltip text="Rugosidad interna usada en el cálculo de pérdida de carga (Colebrook-White) según el material seleccionado." />
          </label>
          <select
            id="material"
            value={materialKey}
            onChange={(event) => setMaterialKey(event.target.value)}
            className={inputClass}
          >
            {Object.entries(MATERIAL_CATALOG).map(([key, mat]) => (
              <option key={key} value={key} className="bg-slate-950">
                {mat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-left">
          <label htmlFor="flow" className={labelClass}>
            Caudal (m³/h) a 15°C y 1 atm
          </label>
          <input
            id="flow"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={flow}
            onChange={(event) => setFlow(event.target.value)}
            placeholder="ej. 10"
            className={inputClass}
          />
        </div>

        <div className="text-left">
          <label htmlFor="diameter" className={labelClass}>
            Diámetro interior (mm)
          </label>
          <input
            id="diameter"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={diameter}
            onChange={(event) => setDiameter(event.target.value)}
            placeholder="ej. 28"
            className={getInputClass(diameterStatus)}
          />
          {diameterStatus === 'warning' && diameterRange && (
            <p className="mt-1 text-xs text-orange-400">
              Fuera de gama comercial ({diameterRange.min}–{diameterRange.max} mm) para el material seleccionado.
            </p>
          )}
          {diameterStatus === 'error' && (
            <p className="mt-1 text-xs text-red-400">Introducir un diámetro mayor que cero.</p>
          )}
        </div>

        <div className="text-left">
          <label htmlFor="length" className={labelClass}>
            Longitud del tramo (m)
          </label>
          <input
            id="length"
            type="number"
            min="0"
            step="1"
            inputMode="decimal"
            value={length}
            onChange={(event) => setLength(event.target.value)}
            placeholder="ej. 15"
            className={inputClass}
          />
        </div>

        <div className="text-left sm:col-span-2">
          <label htmlFor="pressure" className={labelClass}>
            Presión de entrada (mbar)
            <InfoTooltip text="La caída de presión admisible según UNE 60670 es del 10% de esta presión de entrada." />
          </label>
          <input
            id="pressure"
            type="number"
            min="0"
            step="1"
            inputMode="decimal"
            value={pressure}
            onChange={(event) => setPressure(event.target.value)}
            placeholder="ej. 25"
            className={getInputClass(pressureStatus)}
          />
          {pressureStatus === 'error' && (
            <p className="mt-1 text-xs text-red-400">Introducir una presión mayor que cero.</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            Presión nominal de la acometida en milibares
          </p>
        </div>

        <button
          type="submit"
          className="sm:col-span-2 glass-panel rounded-2xl bg-orange-500 px-8 py-3 text-base font-semibold text-white shadow-xl shadow-orange-500/20 transition-all duration-100 ease-in-out hover:scale-105 hover:bg-orange-400 hover:shadow-orange-500/40"
        >
          Calcular pérdida de carga
        </button>
      </form>

      {/* Errores de validación */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10"
          >
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-400">Error de validación</p>
                <ul className="mt-1 text-sm text-red-300 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resultados */}
      <AnimatePresence>
        {result && (
          <motion.div
            key={result.pressureDropMbar}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-6 space-y-4"
          >
            {/* Indicador de cumplimiento */}
            <div
              className={`
                p-4 rounded-xl border-2 font-semibold text-center
                ${getComplianceColor(result.metadata.compliance)}
              `}
            >
              <div className="text-lg">{result.metadata.compliance}</div>
              <div className="text-xs mt-1 opacity-80">
                Caída de presión: {(result.pressureDropMbar * 100) / parseFloat(pressure)}% del
                total
              </div>
            </div>

            {/* Resultados principales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-left">
                <p className="text-sm font-medium text-slate-400 tracking-wide">
                  Pérdida de presión
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">
                  {result.pressureDropMbar.toFixed(2)}{' '}
                  <span className="text-base text-slate-500">mbar</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {result.pressureDropPa.toFixed(1)} Pa
                </p>
              </div>

              <div
                className={`glass-panel rounded-2xl border p-6 text-left ${
                  result.velocityAdequate
                    ? 'border-white/5 bg-navy-900/40'
                    : 'border-red-500/30 bg-red-500/10'
                }`}
              >
                <p className="text-sm font-medium text-slate-400 tracking-wide">Velocidad</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">
                  {result.velocity.toFixed(2)} <span className="text-base text-slate-500">m/s</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Máximo UNE 60670: {GAS_MAX_VELOCITY} m/s
                </p>
              </div>

              <div className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-left">
                <p className="text-sm font-medium text-slate-400 tracking-wide">
                  Número de Reynolds
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">
                  {result.reynolds.toFixed(0)}
                </p>
                <p className="mt-1 text-xs text-slate-500 capitalize">
                  Régimen: {result.metadata.reynoldsRegime}
                </p>
              </div>
            </div>

            {/* Detalles técnicos */}
            <div className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-left">
              <p className="text-sm font-medium text-slate-400 mb-3">Parámetros de cálculo</p>
              <dl className="grid grid-cols-2 gap-y-2 font-mono text-sm tabular-nums text-slate-300 sm:grid-cols-4">
                <dt className="text-slate-500">Densidad gas</dt>
                <dd>{result.gasDensity.toFixed(3)} kg/m³</dd>
                <dt className="text-slate-500">Factor f</dt>
                <dd>{result.frictionFactor.toFixed(4)}</dd>
                <dt className="text-slate-500">Método</dt>
                <dd className="col-span-3 text-xs">{result.metadata.calculationMethod}</dd>
              </dl>

              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500">
                  <strong>Normativa:</strong> {result.metadata.reference}
                </p>
                <p className="text-xs text-slate-500 mt-1">{result.metadata.note}</p>
              </div>
            </div>

            {/* Estimación de materiales (BOM) */}
            {bom && (
              <div className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-left">
                <p className="text-sm font-medium text-slate-400 mb-3">
                  Estimación de materiales (BOM){' '}
                  <InfoTooltip text="Estimación de anteproyecto: soportes, codos, bridas y manguitos según longitud y diámetro. Validar siempre contra el trazado real." />
                </p>
                <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  {bom.items.map((item) => (
                    <div key={item.key} className="flex items-baseline justify-between border-b border-white/5 py-1.5 last:border-0">
                      <dt className="text-slate-400">{item.label}</dt>
                      <dd className="font-mono text-white">
                        {item.quantity} <span className="text-xs text-slate-500">— {item.note}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-amber-500">{bom.metadata.warning}</p>
              </div>
            )}

            {/* Botón de informe técnico */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowReport(!showReport)}
                className="glass-panel px-6 py-3 rounded-xl text-sm font-semibold text-orange-400 border border-orange-500/30 hover:bg-orange-500/10 transition-all"
              >
                {showReport ? 'Ocultar informe' : 'Generar informe'}
              </button>
            </div>

            <AnimatePresence>
              {showReport && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TechnicalReport
                    type="gas"
                    calculationData={{
                      inputs: {
                        flow: parseFloat(flow),
                        diameter: parseFloat(diameter),
                        length: parseFloat(length),
                        pressure: parseFloat(pressure),
                        gasType: FLUID_PRESETS[gasType]?.label ?? gasType,
                        material: MATERIAL_CATALOG[materialKey]?.name ?? materialKey,
                      },
                      results: result,
                      metadata: result.metadata,
                      bom,
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

export default GasCalculator
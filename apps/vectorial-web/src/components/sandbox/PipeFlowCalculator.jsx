import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ToolHeader from './ToolHeader'
import HeadLossChart from './HeadLossChart'
import TechnicalReport from './TechnicalReport'
import { FLUID_PRESETS, calculatePipeFlow, calculateInversePipeSizing, validatePhysicalParameters } from 'vectorial-app/lib/engineering'
import { MATERIAL_CATALOG, getMaterial } from 'vectorial-app/lib/materials'
import { estimateBillOfMaterials } from 'vectorial-app/lib/bom'
import { inputClass, labelClass, getInputClass } from 'vectorial-app/lib/uiConstants'
import InfoTooltip from './InfoTooltip'

function PipeFlowCalculator() {
  const [flow, setFlow] = useState('')
  const [diameter, setDiameter] = useState('')
  const [length, setLength] = useState('')
  const [materialKey, setMaterialKey] = useState('steel_medium')
  const [fluidKey, setFluidKey] = useState('cold_water')
  const [density, setDensity] = useState(FLUID_PRESETS.cold_water.density)
  const [viscosity, setViscosity] = useState(FLUID_PRESETS.cold_water.viscosity)
  const [result, setResult] = useState(null)
  const [inverseResult, setInverseResult] = useState(null)
  const [maxHeadLoss, setMaxHeadLoss] = useState('')
  const [calculationMode, setCalculationMode] = useState('direct') // 'direct' | 'inverse'
  const [showReport, setShowReport] = useState(false)
  const [inverseError, setInverseError] = useState('')
  const [validationErrors, setValidationErrors] = useState([])

  const selectedMaterial = useMemo(() => getMaterial(materialKey), [materialKey])

  const diameterRange = useMemo(() => {
    if (!selectedMaterial?.catalog?.length) return null
    const ids = selectedMaterial.catalog.map((pipe) => pipe.id)
    return { min: Math.min(...ids), max: Math.max(...ids) }
  }, [selectedMaterial])

  const diameterStatus = useMemo(() => {
    if (!diameter || !diameterRange) return 'ok'
    const value = parseFloat(diameter)
    if (!Number.isFinite(value) || value <= 0) return 'error'
    if (value < diameterRange.min || value > diameterRange.max) return 'warning'
    return 'ok'
  }, [diameter, diameterRange])

  const flowStatus = useMemo(() => {
    if (!flow) return 'ok'
    const value = parseFloat(flow)
    return Number.isFinite(value) && value > 0 ? 'ok' : 'error'
  }, [flow])

  const bom = useMemo(() => {
    const diameterValue = parseFloat(diameter)
    const lengthValue = parseFloat(length)
    if (!Number.isFinite(diameterValue) || !Number.isFinite(lengthValue) || diameterValue <= 0 || lengthValue <= 0) {
      return null
    }
    return estimateBillOfMaterials({ length: lengthValue, diameter: diameterValue, material: materialKey })
  }, [diameter, length, materialKey])

  const handleMaterialChange = (event) => {
    const key = event.target.value
    setMaterialKey(key)
    const material = getMaterial(key)
    if (material && material.catalog.length > 0) {
      // Auto-seleccionar el primer diámetro del catálogo
      setDiameter(material.catalog[0].id.toString())
    }
  }

  const handleFluidChange = (event) => {
    const key = event.target.value
    setFluidKey(key)
    const preset = FLUID_PRESETS[key]
    setDensity(preset.density ?? '')
    setViscosity(preset.viscosity ?? '')
  }

  const handleCalculate = (event) => {
    event.preventDefault()
    setValidationErrors([])

    const flowValue = parseFloat(flow)
    const diameterValue = parseFloat(diameter)
    const lengthValue = parseFloat(length)
    const densityValue = parseFloat(density)
    const viscosityValue = parseFloat(viscosity)

    if (
      [flowValue, diameterValue, lengthValue, densityValue, viscosityValue].some(
        (value) => !Number.isFinite(value) || value <= 0,
      )
    ) {
      return
    }

    // Validación de rango físico (evita aceptar diámetros/caudales fuera de
    // todo rango realista, p.ej. 0.001 mm, que no lanzan excepción en el
    // motor pero producen resultados sin sentido de ingeniería).
    const basicValidation = validatePhysicalParameters({
      flow: flowValue,
      diameter: diameterValue,
    })

    if (!basicValidation.isValid) {
      setValidationErrors(basicValidation.errors)
      setResult(null)
      return
    }

    try {
      setResult(
        calculatePipeFlow({
          flow: flowValue,
          diameter: diameterValue,
          length: lengthValue,
          density: densityValue,
          viscosity: viscosityValue,
          material: materialKey,
        }),
      )
      setInverseResult(null)
    } catch (error) {
      setValidationErrors([error.message])
      setResult(null)
    }
  }

  const handleInverseCalculate = (event) => {
    event.preventDefault()
    const flowValue = parseFloat(flow)
    const lengthValue = parseFloat(length)
    const densityValue = parseFloat(density)
    const viscosityValue = parseFloat(viscosity)
    const maxHeadLossValue = parseFloat(maxHeadLoss)

    if (
      [flowValue, lengthValue, densityValue, viscosityValue, maxHeadLossValue].some(
        (value) => !Number.isFinite(value) || value <= 0,
      )
    ) {
      return
    }

    try {
      const inverse = calculateInversePipeSizing({
        flow: flowValue,
        length: lengthValue,
        density: densityValue,
        viscosity: viscosityValue,
        maxHeadLoss: maxHeadLossValue,
        material: materialKey,
        minDiameter: 10,
        maxDiameter: 200,
      })
      setInverseResult(inverse)
      setDiameter(inverse.requiredDiameter.toFixed(1))
      setResult(null)
      setInverseError('')
    } catch (error) {
      setInverseError(error.message)
      setInverseResult(null)
    }
  }

  return (
    <div>
      <ToolHeader
        icon="H₂O"
        title="Fluidos y Tuberías"
        description="Pérdida de carga (Darcy-Weisbach) y velocidad de circulación en conducciones."
      />

      {/* Selector de modo de cálculo */}
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setCalculationMode('direct')}
          className={`
            flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all
            ${
              calculationMode === 'direct'
                ? 'bg-orange-500 text-white'
                : 'glass-panel text-slate-400 hover:text-slate-200'
            }
          `}
        >
          Cálculo Directo
        </button>
        <button
          type="button"
          onClick={() => setCalculationMode('inverse')}
          className={`
            flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all
            ${
              calculationMode === 'inverse'
                ? 'bg-orange-500 text-white'
                : 'glass-panel text-slate-400 hover:text-slate-200'
            }
          `}
        >
          Cálculo Inverso
        </button>
      </div>

      {calculationMode === 'direct' ? (
        <form onSubmit={handleCalculate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="text-left">
            <label htmlFor="material" className={labelClass}>
              Material de tubería
              <InfoTooltip text="Rugosidad y diámetros normalizados según UNE EN 10255 (acero), UNE EN 1057 (cobre) y UNE EN 1452 (PVC)." />
            </label>
            <select
              id="material"
              value={materialKey}
              onChange={handleMaterialChange}
              className={inputClass}
            >
              {Object.entries(MATERIAL_CATALOG).map(([key, material]) => (
                <option key={key} value={key} className="bg-slate-950">
                  {material.name}
                </option>
              ))}
            </select>
            {selectedMaterial && (
              <p className="mt-1 text-xs text-slate-500">
                Rugosidad: {selectedMaterial.roughness}m | {selectedMaterial.standard}
              </p>
            )}
          </div>

          <div className="text-left">
            <label htmlFor="flow" className={labelClass}>
              Caudal (m³/h)
            </label>
          <input
            id="flow"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={flow}
            onChange={(event) => setFlow(event.target.value)}
            placeholder="ej. 3.5"
            className={getInputClass(flowStatus)}
          />
          {flowStatus === 'error' && (
            <p className="mt-1 text-xs text-red-400">Introducir un caudal mayor que cero.</p>
          )}
        </div>

        <div className="text-left">
          <label htmlFor="diameter" className={labelClass}>
            Diámetro interior (mm)
          </label>
          <input
            id="diameter"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={diameter}
            onChange={(event) => setDiameter(event.target.value)}
            placeholder="ej. 25.4"
            className={getInputClass(diameterStatus)}
          />
          {diameterStatus === 'warning' && diameterRange && (
            <p className="mt-1 text-xs text-orange-400">
              Fuera de gama comercial para {selectedMaterial.name} ({diameterRange.min}–{diameterRange.max} mm). Verifique el material o el diámetro.
            </p>
          )}
          {diameterStatus === 'error' && (
            <p className="mt-1 text-xs text-red-400">Introducir un diámetro mayor que cero.</p>
          )}
          {selectedMaterial && (
            <select
              value={diameter}
              onChange={(event) => setDiameter(event.target.value)}
              className="mt-2 text-xs"
            >
              <option value="">Seleccionar del catálogo...</option>
              {selectedMaterial.catalog.map((pipe) => (
                <option key={pipe.dn} value={pipe.id} className="bg-slate-950">
                  DN{pipe.dn} - {pipe.inch} (ID: {pipe.id}mm)
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="text-left">
          <label htmlFor="length" className={labelClass}>
            Longitud (m)
          </label>
          <input
            id="length"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={length}
            onChange={(event) => setLength(event.target.value)}
            placeholder="ej. 40"
            className={inputClass}
          />
        </div>

        <div className="text-left">
          <label htmlFor="fluid" className={labelClass}>
            Fluido
          </label>
          <select
            id="fluid"
            value={fluidKey}
            onChange={handleFluidChange}
            className={inputClass}
          >
            {Object.entries(FLUID_PRESETS).map(([key, preset]) => (
              <option key={key} value={key} className="bg-slate-950">
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-left">
          <label htmlFor="density" className={labelClass}>
            Densidad (kg/m³)
          </label>
          <input
            id="density"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={density}
            onChange={(event) => {
              setFluidKey('custom')
              setDensity(event.target.value)
            }}
            placeholder="ej. 998"
            className={inputClass}
          />
        </div>

        <div className="text-left">
          <label htmlFor="viscosity" className={labelClass}>
            Viscosidad cinemática (mm²/s)
          </label>
          <input
            id="viscosity"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={viscosity}
            onChange={(event) => {
              setFluidKey('custom')
              setViscosity(event.target.value)
            }}
            placeholder="ej. 1.0"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="glass-panel sm:col-span-2 rounded-2xl bg-orange-500 px-8 py-3 text-base font-semibold text-white shadow-xl shadow-orange-500/20 transition-all duration-100 ease-in-out hover:scale-105 hover:bg-orange-400 hover:shadow-orange-500/40"
        >
          Calcular
        </button>
      </form>
      ) : (
        <form onSubmit={handleInverseCalculate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="text-left">
            <label htmlFor="material" className={labelClass}>
              Material de tubería
              <InfoTooltip text="Rugosidad y diámetros normalizados según UNE EN 10255 (acero), UNE EN 1057 (cobre) y UNE EN 1452 (PVC)." />
            </label>
            <select
              id="material"
              value={materialKey}
              onChange={handleMaterialChange}
              className={inputClass}
            >
              {Object.entries(MATERIAL_CATALOG).map(([key, material]) => (
                <option key={key} value={key} className="bg-slate-950">
                  {material.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-left">
            <label htmlFor="flow" className={labelClass}>
              Caudal (m³/h)
            </label>
            <input
              id="flow"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={flow}
              onChange={(event) => setFlow(event.target.value)}
              placeholder="ej. 3.5"
              className={inputClass}
            />
          </div>

          <div className="text-left">
            <label htmlFor="length" className={labelClass}>
              Longitud (m)
            </label>
            <input
              id="length"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={length}
              onChange={(event) => setLength(event.target.value)}
              placeholder="ej. 40"
              className={inputClass}
            />
          </div>

          <div className="text-left">
            <label htmlFor="max-head-loss" className={labelClass}>
              Pérdida máxima admisible (m.c.a.)
            </label>
            <input
              id="max-head-loss"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={maxHeadLoss}
              onChange={(event) => setMaxHeadLoss(event.target.value)}
              placeholder="ej. 2.5"
              className={inputClass}
            />
          </div>

          <div className="text-left">
            <label htmlFor="density" className={labelClass}>
              Densidad (kg/m³)
            </label>
            <input
              id="density"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={density}
              onChange={(event) => {
                setFluidKey('custom')
                setDensity(event.target.value)
              }}
              placeholder="ej. 998"
              className={inputClass}
            />
          </div>

          <div className="text-left">
            <label htmlFor="viscosity" className={labelClass}>
              Viscosidad (mm²/s)
            </label>
            <input
              id="viscosity"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={viscosity}
              onChange={(event) => {
                setFluidKey('custom')
                setViscosity(event.target.value)
              }}
              placeholder="ej. 1.0"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="sm:col-span-2 glass-panel rounded-2xl bg-orange-500 px-8 py-3 text-base font-semibold text-white shadow-xl shadow-orange-500/20 transition-all duration-100 ease-in-out hover:scale-105 hover:bg-orange-400 hover:shadow-orange-500/40"
          >
            Calcular diámetro requerido
          </button>
        </form>
      )}

      {inverseError && (
        <div className="mt-6 border border-red-500/40 bg-red-500/10 p-4 text-left">
          <p className="text-sm font-semibold text-red-400">Error de cálculo</p>
          <p className="mt-1 text-sm text-red-300">{inverseError}</p>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mt-6 border border-red-500/40 bg-red-500/10 p-4 text-left">
          <p className="text-sm font-semibold text-red-400">Error de validación</p>
          <ul className="mt-1 text-sm text-red-300 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            key={result.velocity}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-6 space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-left">
                <p className="text-sm font-medium text-slate-400 tracking-wide">Velocidad</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">
                  {result.velocity.toFixed(3)} <span className="text-base text-slate-500">m/s</span>
                </p>
              </div>
              <div className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-left">
                <p className="text-sm font-medium text-slate-400 tracking-wide">Pérdida de carga</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">
                  {result.pressureLossBar.toFixed(4)}{' '}
                  <span className="text-base text-slate-500">bar</span>
                </p>
              </div>
            </div>

            <div className="glass-panel sm:col-span-2 rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-left">
              <p className="text-sm font-medium text-slate-400 mb-3">Detalle del cálculo</p>
              <dl className="grid grid-cols-2 gap-y-2 font-mono text-sm tabular-nums text-slate-300 sm:grid-cols-4">
                <dt className="text-slate-500">Re</dt>
                <dd>{result.reynolds.toFixed(0)}</dd>
                <dt className="text-slate-500">Régimen</dt>
                <dd className="capitalize">{result.regime}</dd>
                <dt className="text-slate-500">f</dt>
                <dd>{result.frictionFactor.toFixed(4)}</dd>
                <dt className="text-slate-500">h_f</dt>
                <dd>{result.headLossM.toFixed(3)} m</dd>
                <dt className="text-slate-500">Material</dt>
                <dd className="col-span-3">{selectedMaterial?.name || 'Acero comercial'}</dd>
              </dl>
              <p className="mt-4 text-xs text-slate-500">
                {result.metadata.calculationMethod}. {result.metadata.reference}
              </p>
            </div>

            {/* Gráfico de curva característica */}
            <div className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6">
              <p className="text-sm font-medium text-slate-400 mb-4">Curva característica del tramo</p>
              <HeadLossChart
                diameter={parseFloat(diameter)}
                length={parseFloat(length)}
                density={parseFloat(density)}
                viscosity={parseFloat(viscosity)}
                material={materialKey}
              />
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

            {/* Informe técnico */}
            <AnimatePresence>
              {showReport && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TechnicalReport
                    type="pipe_flow"
                    calculationData={{
                      inputs: {
                        flow: parseFloat(flow),
                        diameter: parseFloat(diameter),
                        length: parseFloat(length),
                        density: parseFloat(density),
                        viscosity: parseFloat(viscosity),
                        material: selectedMaterial?.name,
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

      {/* Resultado del cálculo inverso */}
      <AnimatePresence>
        {inverseResult && (
          <motion.div
            key="inverse-result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-6 space-y-4"
          >
            <div className="glass-panel rounded-2xl border-2 border-orange-500/30 bg-orange-500/10 p-6">
              <p className="text-sm font-medium text-orange-400 mb-2">Diámetro requerido</p>
              <p className="font-mono text-3xl font-semibold text-white">
                {inverseResult.requiredDiameter.toFixed(1)}{' '}
                <span className="text-lg text-slate-400">mm</span>
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Pérdida real: {inverseResult.actualHeadLoss.toFixed(3)} m.c.a. (objetivo: {maxHeadLoss} m.c.a.)
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-left">
                <p className="text-sm font-medium text-slate-400 tracking-wide">Velocidad resultante</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">
                  {inverseResult.velocity.toFixed(3)} <span className="text-base text-slate-500">m/s</span>
                </p>
              </div>
              <div className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-left">
                <p className="text-sm font-medium text-slate-400 tracking-wide">Régimen de flujo</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white capitalize">
                  {inverseResult.regime}
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6">
              <p className="text-sm font-medium text-slate-400 mb-2">Información del cálculo</p>
              <p className="text-xs text-slate-500">
                Método: {inverseResult.metadata.calculationMethod} | Iteraciones: {inverseResult.iterations}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {inverseResult.metadata.reference}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PipeFlowCalculator

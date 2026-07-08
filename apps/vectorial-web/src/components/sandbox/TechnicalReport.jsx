import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { exportCalculationToJSON } from 'vectorial-app/lib/exportUtils'
import { saveCalculation } from 'vectorial-app/lib/calculationStore'
import { useCalculationHistory } from 'vectorial-app/hooks/useCalculationHistory'
import { useProjectMeta } from 'vectorial-app/hooks/useProjectMeta'

/**
 * Configuración de presentación por tipo de informe: qué campos de
 * `inputs`/`results` mostrar, con qué etiqueta, unidad y precisión.
 * Añadir un nuevo tipo de informe es extender este objeto — el resto del
 * componente es genérico.
 *
 * @type {Record<string, {title: string, reference: string, inputFields: Array, resultFields: Array}>}
 */
const REPORT_CONFIGS = {
  pipe_flow: {
    title: 'Informe de Cálculo Hidráulico - Pérdida de Carga en Tuberías',
    reference: 'UNE EN 12354-2 / Darcy-Weisbach',
    inputFields: [
      { key: 'flow', label: 'Caudal', unit: 'm³/h' },
      { key: 'diameter', label: 'Diámetro', unit: 'mm' },
      { key: 'length', label: 'Longitud', unit: 'm' },
      { key: 'density', label: 'Densidad', unit: 'kg/m³' },
      { key: 'viscosity', label: 'Viscosidad', unit: 'mm²/s' },
      { key: 'material', label: 'Material', unit: '' },
    ],
    resultFields: [
      { key: 'velocity', label: 'Velocidad', unit: 'm/s', decimals: 3 },
      { key: 'pressureLossBar', label: 'Pérdida de carga', unit: 'bar', decimals: 4 },
      { key: 'headLossM', label: 'Pérdida (m.c.a.)', unit: 'm', decimals: 3 },
      { key: 'reynolds', label: 'Número de Reynolds', unit: '', decimals: 0 },
    ],
  },
  gas: {
    title: 'Informe de Cálculo de Instalación de Gas',
    reference: 'UNE 60670:2006',
    inputFields: [
      { key: 'flow', label: 'Caudal', unit: 'm³/h' },
      { key: 'diameter', label: 'Diámetro', unit: 'mm' },
      { key: 'length', label: 'Longitud', unit: 'm' },
      { key: 'pressure', label: 'Presión de entrada', unit: 'mbar' },
      { key: 'gasType', label: 'Tipo de gas', unit: '' },
      { key: 'material', label: 'Material', unit: '' },
    ],
    resultFields: [
      { key: 'velocity', label: 'Velocidad', unit: 'm/s', decimals: 2 },
      { key: 'pressureDropMbar', label: 'Pérdida de presión', unit: 'mbar', decimals: 2 },
      { key: 'reynolds', label: 'Número de Reynolds', unit: '', decimals: 0 },
    ],
  },
  thermal: {
    title: 'Informe de Cálculo Térmico',
    reference: 'CTE DB-HE / ISO 6946',
    inputFields: [
      { key: 'area', label: 'Área', unit: 'm²' },
      { key: 'deltaT', label: 'Salto térmico ΔT', unit: '°C' },
      { key: 'u', label: 'Coeficiente U', unit: 'W/m²K' },
    ],
    resultFields: [
      { key: 'kilowatts', label: 'Potencia térmica', unit: 'kW', decimals: 2 },
      { key: 'watts', label: 'Potencia térmica', unit: 'W', decimals: 0 },
    ],
  },
}

function formatValue(value, decimals) {
  if (typeof value !== 'number') return value
  return decimals != null ? value.toFixed(decimals) : value
}

/**
 * Componente de generación de informe técnico.
 * Crea una vista optimizada para impresión/PDF con todos los datos del
 * cálculo, y permite exportarlo a JSON o guardarlo en el Dashboard de
 * Proyecto de la sesión. Genérico para cualquier tipo definido en
 * REPORT_CONFIGS.
 *
 * @component
 * @author VECTORIAL Engineering Team
 * @version 2.2.0
 */
function TechnicalReport({ calculationData, type = 'pipe_flow' }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const projectMeta = useProjectMeta()
  const savedCalculations = useCalculationHistory()

  const projectBomTotals = useMemo(() => {
    const totals = new Map()
    for (const entry of savedCalculations) {
      const bom = entry.calculationData?.bom
      if (!bom) continue
      for (const item of bom.items) {
        const existing = totals.get(item.key)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          totals.set(item.key, { label: item.label, quantity: item.quantity })
        }
      }
    }
    return Array.from(totals.values())
  }, [savedCalculations])

  if (!calculationData) return null

  const config = REPORT_CONFIGS[type] ?? REPORT_CONFIGS.pipe_flow

  const handlePrint = () => {
    setIsGenerating(true)
    setTimeout(() => {
      window.print()
      setIsGenerating(false)
    }, 100)
  }

  const handleExportJSON = () => {
    exportCalculationToJSON(calculationData, `vectorial-${type}`)
  }

  const handleSaveToDashboard = () => {
    saveCalculation({ type, title: config.title, calculationData })
    setSavedMessage('Guardado en el Dashboard de Proyecto')
    setTimeout(() => setSavedMessage(''), 2500)
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-white">Informe Técnico</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSaveToDashboard}
            className="glass-panel px-4 py-2 rounded-xl text-sm font-semibold text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-all"
          >
            Guardar en Dashboard
          </button>
          <button
            onClick={handleExportJSON}
            className="glass-panel px-4 py-2 rounded-xl text-sm font-semibold text-green-400 border border-green-500/30 hover:bg-green-500/10 transition-all"
          >
            Exportar JSON
          </button>
          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="glass-panel px-4 py-2 rounded-xl text-sm font-semibold text-orange-400 border border-orange-500/30 hover:bg-orange-500/10 transition-all disabled:opacity-50"
          >
            {isGenerating ? 'Generando...' : 'Imprimir'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {savedMessage && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 text-xs font-medium text-blue-400"
          >
            {savedMessage}
          </motion.p>
        )}
      </AnimatePresence>

      <div
        id="vectorial-print-report"
        className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6 print:shadow-none print:border-0"
      >
        {/* Encabezado del informe */}
        <div className="border-b border-white/10 pb-4 mb-4">
          <div className="hidden print:flex items-center gap-2 mb-3">
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
              <circle cx="16" cy="16" r="10" fill="none" stroke="#1A365D" strokeWidth="2" />
              <path
                d="M16 10v6h4c1.105 0 2 .895 2 2s-.895 2-2 2h-4v2h4c2.206 0 4-1.794 4-4s-1.794-4-4-4h-4V10h4z"
                fill="#1A365D"
              />
            </svg>
            <span className="text-lg font-bold" style={{ color: '#1A365D' }}>
              VEC<span style={{ color: '#f97316' }}>TORIAL</span>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 print:text-black">{config.title}</h2>
          <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-400 print:text-slate-700">
            <div>
              <p>Generado por: VECTORIAL - Motor de Cálculo de Ingeniería</p>
              <p>
                Fecha:{' '}
                {new Date().toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="mt-2 sm:mt-0 text-right">
              <p>Referencia: {config.reference}</p>
              <p>Versión: 2.3.0</p>
            </div>
          </div>

          {(projectMeta.author || projectMeta.projectId || projectMeta.client || projectMeta.date) && (
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-xs text-slate-400 print:text-slate-700 sm:grid-cols-4">
              {projectMeta.projectId && (
                <p>
                  <span className="text-slate-500">ID de Obra:</span> {projectMeta.projectId}
                </p>
              )}
              {projectMeta.client && (
                <p>
                  <span className="text-slate-500">Cliente:</span> {projectMeta.client}
                </p>
              )}
              {projectMeta.author && (
                <p>
                  <span className="text-slate-500">Autor:</span> {projectMeta.author}
                </p>
              )}
              {projectMeta.date && (
                <p>
                  <span className="text-slate-500">Fecha ref.:</span> {projectMeta.date}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Datos de entrada */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 print:text-black">
            <span className="w-1 h-5 bg-orange-500 rounded"></span>
            Datos de Entrada
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {config.inputFields.map(
              (field) =>
                calculationData.inputs?.[field.key] != null && (
                  <div key={field.key} className="glass-panel rounded-lg p-3 bg-navy-900/30 print:bg-transparent print:border print:border-slate-300">
                    <p className="text-xs text-slate-500">{field.label}</p>
                    <p className="font-mono text-white print:text-black">
                      {calculationData.inputs[field.key]} {field.unit}
                    </p>
                  </div>
                ),
            )}
          </div>
        </div>

        {/* Resultados principales */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 print:text-black">
            <span className="w-1 h-5 bg-orange-500 rounded"></span>
            Resultados
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {config.resultFields.map(
              (field) =>
                calculationData.results?.[field.key] != null && (
                  <div key={field.key} className="glass-panel rounded-lg p-3 bg-navy-900/30 print:bg-transparent print:border print:border-slate-300">
                    <p className="text-xs text-slate-500">{field.label}</p>
                    <p className="font-mono text-white text-lg print:text-black">
                      {formatValue(calculationData.results[field.key], field.decimals)} {field.unit}
                    </p>
                  </div>
                ),
            )}
          </div>
        </div>

        {/* Estimación de materiales (BOM), si el cálculo la incluye */}
        {calculationData.bom && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 print:text-black">
              <span className="w-1 h-5 bg-orange-500 rounded"></span>
              Estimación de Materiales (BOM)
            </h3>
            <div className="glass-panel rounded-lg p-4 bg-navy-900/30 print:bg-transparent print:border print:border-slate-300 text-sm">
              <table className="w-full text-left">
                <tbody>
                  {calculationData.bom.items.map((item) => (
                    <tr key={item.key} className="border-b border-white/5 last:border-0 print:border-slate-200">
                      <td className="py-1 text-slate-300 print:text-black">{item.label}</td>
                      <td className="py-1 text-right font-mono text-white print:text-black">{item.quantity}</td>
                      <td className="py-1 pl-3 text-xs text-slate-500 print:text-slate-600">{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-amber-500">{calculationData.bom.metadata.warning}</p>
            </div>
          </div>
        )}

        {/* Detalles técnicos */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 print:text-black">
            <span className="w-1 h-5 bg-orange-500 rounded"></span>
            Detalles Técnicos
          </h3>
          <div className="glass-panel rounded-lg p-4 bg-navy-900/30 print:bg-transparent print:border print:border-slate-300 text-xs font-mono">
            <div className="grid grid-cols-2 gap-2">
              {calculationData.results?.regime && (
                <>
                  <div>
                    <span className="text-slate-500">Régimen:</span>
                    <span className="text-white print:text-black ml-2 capitalize">{calculationData.results.regime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Factor f:</span>
                    <span className="text-white print:text-black ml-2">{calculationData.results.frictionFactor.toFixed(4)}</span>
                  </div>
                </>
              )}
              {calculationData.metadata && (
                <>
                  <div className="col-span-2 mt-2">
                    <span className="text-slate-500">Método:</span>
                    <span className="text-white print:text-black ml-2">{calculationData.metadata.calculationMethod}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Referencia:</span>
                    <span className="text-white print:text-black ml-2">{calculationData.metadata.reference}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Fórmula aplicada */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 print:text-black">
            <span className="w-1 h-5 bg-orange-500 rounded"></span>
            Fórmula Aplicada
          </h3>
          <div className="glass-panel rounded-lg p-4 bg-navy-900/30 print:bg-transparent print:border print:border-slate-300 font-mono text-sm">
            <p className="text-slate-300 print:text-black">
              {type === 'pipe_flow' && (
                <>
                  <span className="text-orange-400 print:text-orange-700">h_f = f · (L/D) · (v²/2g)</span>
                  <br />
                  <span className="text-xs text-slate-500 mt-1 block">
                    Donde: h_f = pérdida de carga, f = factor de fricción, L = longitud, D = diámetro, v = velocidad, g = gravedad
                  </span>
                </>
              )}
              {type === 'gas' && (
                <>
                  <span className="text-orange-400 print:text-orange-700">ΔP = f · (L/D) · (ρ·v²/2)</span>
                  <br />
                  <span className="text-xs text-slate-500 mt-1 block">
                    Ecuación de Darcy-Weisbach para fluidos compresibles
                  </span>
                </>
              )}
              {type === 'thermal' && (
                <>
                  <span className="text-orange-400 print:text-orange-700">Q = U · A · ΔT</span>
                  <br />
                  <span className="text-xs text-slate-500 mt-1 block">
                    Donde: Q = potencia térmica, U = coeficiente de transmisión, A = área, ΔT = salto térmico
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Observaciones */}
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 print:text-black">
            <span className="w-1 h-5 bg-orange-500 rounded"></span>
            Observaciones
          </h3>
          <div className="text-xs text-slate-400 print:text-slate-700 space-y-2">
            <p>• Este informe ha sido generado automáticamente por el sistema VECTORIAL.</p>
            <p>• Los cálculos se basan en normativa vigente y deben ser verificados por personal cualificado.</p>
            <p>• Se recomienda validar los resultados con condiciones específicas de la instalación.</p>
            <p>• Para más información, consultar la documentación técnica de VECTORIAL.</p>
          </div>
        </div>

        {/* BOM total del proyecto (todos los cálculos guardados en el Dashboard) */}
        {projectBomTotals.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2 print:text-black">
              <span className="w-1 h-5 bg-orange-500 rounded"></span>
              BOM Total del Proyecto
            </h3>
            <p className="mb-3 text-xs text-slate-500 print:text-slate-600">
              Suma de materiales de los {savedCalculations.length} cálculo(s) guardados en el Dashboard de esta sesión.
            </p>
            <div className="glass-panel rounded-lg p-4 bg-navy-900/30 print:bg-transparent print:border print:border-slate-300 text-sm">
              <table className="w-full text-left">
                <tbody>
                  {projectBomTotals.map((item) => (
                    <tr key={item.label} className="border-b border-white/5 last:border-0 print:border-slate-200">
                      <td className="py-1 text-slate-300 print:text-black">{item.label}</td>
                      <td className="py-1 text-right font-mono text-white print:text-black">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pie de página */}
        <div className="border-t border-white/10 mt-6 pt-4 text-center text-xs text-slate-500 print:text-slate-600">
          <p>VECTORIAL © 2026 - Motor de Cálculo de Ingeniería v2.3.0</p>
          <p className="mt-1">Documento generado el {new Date().toLocaleString('es-ES')}</p>
        </div>
      </div>
    </div>
  )
}

export default TechnicalReport

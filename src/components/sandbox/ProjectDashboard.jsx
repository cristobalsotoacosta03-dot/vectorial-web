import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ToolHeader from './ToolHeader'
import TechnicalReport from './TechnicalReport'
import { exportCalculationToJSON } from '../../lib/exportUtils'
import {
  clearCalculations,
  getCalculations,
  removeCalculation,
  subscribeToCalculations,
} from '../../lib/calculationStore'

const TYPE_LABELS = {
  pipe_flow: 'Fluidos y Tuberías',
  gas: 'Instalaciones de Gas',
  thermal: 'Termotécnica',
}

/**
 * Dashboard de Proyecto: lista los cálculos guardados durante la sesión
 * (persistidos en localStorage) para poder revisarlos, exportarlos o
 * imprimirlos sin tener que repetir la entrada de datos.
 *
 * @component
 */
function ProjectDashboard() {
  const [entries, setEntries] = useState(() => getCalculations())
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => subscribeToCalculations(setEntries), [])

  const handleClear = () => {
    if (entries.length === 0) return
    if (window.confirm('¿Vaciar todos los cálculos guardados de esta sesión?')) {
      clearCalculations()
    }
  }

  return (
    <div>
      <ToolHeader
        icon="📊"
        title="Dashboard de Proyecto"
        description="Cálculos guardados en esta sesión, listos para consultar, exportar o imprimir."
      />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {entries.length} {entries.length === 1 ? 'cálculo guardado' : 'cálculos guardados'}
        </p>
        <button
          type="button"
          onClick={handleClear}
          disabled={entries.length === 0}
          className="glass-panel px-4 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Vaciar Dashboard
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-10 text-center text-sm text-slate-500">
          Todavía no hay cálculos guardados. Usa "💾 Guardar en Dashboard" desde el
          Informe Técnico de cualquier calculadora.
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{entry.title}</p>
                    <p className="text-xs text-slate-500">
                      {TYPE_LABELS[entry.type] ?? entry.type} ·{' '}
                      {new Date(entry.savedAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      className="glass-panel px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-400 border border-orange-500/30 hover:bg-orange-500/10 transition-all"
                    >
                      {expandedId === entry.id ? 'Ocultar' : 'Ver informe'}
                    </button>
                    <button
                      type="button"
                      onClick={() => exportCalculationToJSON(entry.calculationData, `vectorial-${entry.type}`)}
                      className="glass-panel px-3 py-1.5 rounded-lg text-xs font-semibold text-green-400 border border-green-500/30 hover:bg-green-500/10 transition-all"
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCalculation(entry.id)}
                      className="glass-panel px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === entry.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-white/5 p-4"
                    >
                      <TechnicalReport type={entry.type} calculationData={entry.calculationData} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default ProjectDashboard

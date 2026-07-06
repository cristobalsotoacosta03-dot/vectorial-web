import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ToolHeader from './ToolHeader'

function PressureLossCalculator() {
  const [flow, setFlow] = useState('')
  const [diameter, setDiameter] = useState('')
  const [result, setResult] = useState(null)

  const handleCalculate = (event) => {
    event.preventDefault()
    const flowValue = parseFloat(flow)
    const diameterValue = parseFloat(diameter)
    if (
      !Number.isFinite(flowValue) ||
      !Number.isFinite(diameterValue) ||
      flowValue <= 0 ||
      diameterValue <= 0
    ) {
      return
    }

    const lossPer100m = (flowValue ** 1.85 / diameterValue ** 4.87) * 1.2e7
    setResult(lossPer100m)
  }

  return (
    <div>
      <ToolHeader
        icon="📉"
        title="Pérdida de Carga (Placeholder)"
        description="Introduce caudal y diámetro para ver una estimación simplificada."
      />

      <form
        onSubmit={handleCalculate}
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1 text-left">
          <label
            htmlFor="flow"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Caudal (L/min)
          </label>
          <input
            id="flow"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={flow}
            onChange={(event) => setFlow(event.target.value)}
            placeholder="Ej. 20"
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
        </div>
        <div className="flex-1 text-left">
          <label
            htmlFor="diameter"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Diámetro (mm)
          </label>
          <input
            id="diameter"
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            value={diameter}
            onChange={(event) => setDiameter(event.target.value)}
            placeholder="Ej. 20"
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
        </div>
        <button
          type="submit"
          className="rounded-2xl bg-orange-500 px-8 py-3 text-base font-semibold text-white shadow-xl shadow-orange-500/20 transition-all duration-300 hover:scale-105 hover:bg-orange-400 hover:shadow-orange-500/40"
        >
          Calcular
        </button>
      </form>

      <AnimatePresence>
        {result !== null && (
          <motion.div
            key={result}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-left"
          >
            <p className="text-sm font-medium text-slate-400">
              Pérdida de carga estimada
            </p>
            <p className="font-heading mt-1 text-2xl font-bold text-white">
              {result.toLocaleString('es-ES', { maximumFractionDigits: 2 })}{' '}
              m.c.a. / 100 m
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Estimación simplificada (placeholder). El motor completo de la
              App aplica la normativa vigente y el catálogo real de
              materiales.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PressureLossCalculator

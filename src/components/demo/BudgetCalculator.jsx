import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ToolHeader from './ToolHeader'

const PRICE_PER_METER = 24.5
const HOURS_PER_METER = 0.35
const REFERENCE_METERS = 80

function BudgetCalculator() {
  const [meters, setMeters] = useState('')
  const [result, setResult] = useState(null)

  const handleCalculate = (event) => {
    event.preventDefault()
    const value = parseFloat(meters)
    if (!Number.isFinite(value) || value <= 0) return

    setResult({
      budget: value * PRICE_PER_METER,
      hours: value * HOURS_PER_METER,
      percentage: Math.min(100, (value / REFERENCE_METERS) * 100),
    })
  }

  return (
    <div>
      <ToolHeader
        icon="🧮"
        title="Calculadora de Presupuesto"
        description="Estima el coste y el tiempo de instalación a partir de los metros lineales de tubería."
      />

      <form
        onSubmit={handleCalculate}
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1 text-left">
          <label
            htmlFor="meters"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Metros de tubería
          </label>
          <input
            id="meters"
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            value={meters}
            onChange={(event) => setMeters(event.target.value)}
            placeholder="Ej. 45"
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
        {result && (
          <motion.div
            key={`${result.budget}-${result.hours}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-left"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="text-sm font-medium text-slate-400">
                Presupuesto técnico estimado
              </p>
              <p className="font-heading text-2xl font-bold text-white">
                {result.budget.toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              ≈ {result.hours.toFixed(1)} horas de instalación estimadas
            </p>

            <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${result.percentage}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
            className="mt-6"
          >
            <a
              href="#acceder"
              className="inline-block rounded-2xl bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-orange-500/20 transition-all duration-300 hover:scale-105 hover:bg-orange-400 hover:shadow-orange-500/40"
            >
              Obtén tu presupuesto técnico completo en la App
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BudgetCalculator

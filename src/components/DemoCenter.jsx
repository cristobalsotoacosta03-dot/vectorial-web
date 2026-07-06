import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BudgetCalculator from './demo/BudgetCalculator'
import UnitConverter from './demo/UnitConverter'
import PressureLossCalculator from './demo/PressureLossCalculator'

const tabs = [
  {
    id: 'budget',
    label: 'Calculadora de Presupuesto',
    Component: BudgetCalculator,
  },
  {
    id: 'units',
    label: 'Equivalencias Técnicas',
    Component: UnitConverter,
  },
  {
    id: 'pressure',
    label: 'Pérdida de Carga',
    Component: PressureLossCalculator,
  },
]

function DemoCenter() {
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.Component

  return (
    <section id="demo" className="relative">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Prueba GestiObra en acción
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Tres herramientas técnicas, la misma precisión que en la App.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex flex-col gap-1 border-b border-white/10 p-3 sm:flex-row">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="demo-tab-pill"
                    className="absolute inset-0 rounded-xl border border-orange-500/30 bg-orange-500/15"
                    transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                  />
                )}
                <span className="relative">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {ActiveComponent && <ActiveComponent />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DemoCenter

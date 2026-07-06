import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PipeFlowCalculator from './sandbox/PipeFlowCalculator'
import TechnicalConverter from './sandbox/TechnicalConverter'
import ThermalSizing from './sandbox/ThermalSizing'

const tabs = [
  { id: 'fluids', label: 'Fluidos y Tuberías', Component: PipeFlowCalculator },
  { id: 'units', label: 'Equivalencias', Component: TechnicalConverter },
  { id: 'thermal', label: 'Dimensionado', Component: ThermalSizing },
]

function EngineeringSandbox() {
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.Component

  return (
    <section id="demo" className="relative">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
            Engineering Sandbox
          </h2>
          <p className="mt-4 text-lg text-slate-400 tracking-wide">
            El motor de cálculo de VECTORIAL, en bruto. Sin comerciales, solo
            fórmulas.
          </p>
        </div>

        <div className="glass-panel rounded-3xl border border-white/5 bg-navy-900/40 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex flex-col gap-1 border-b border-white/5 p-3 sm:flex-row">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ease-in-out ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="sandbox-tab-pill"
                    className="absolute inset-0 rounded-xl border border-navy-700/50 bg-navy-800/30"
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

export default EngineeringSandbox

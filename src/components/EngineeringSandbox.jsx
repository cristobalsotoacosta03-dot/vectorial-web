// MODO MAESTRO INGENIERO ACTIVADO: Motor de cálculo normativo
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PipeFlowCalculator from './sandbox/PipeFlowCalculator'
import TechnicalConverter from './sandbox/TechnicalConverter'
import ThermalSizing from './sandbox/ThermalSizing'
import GasCalculator from './sandbox/GasCalculator'
import ProjectDashboard from './sandbox/ProjectDashboard'

const tabs = [
  {
    id: 'fluids',
    label: 'Fluidos y Tuberías',
    Component: PipeFlowCalculator,
    icon: '🌊',
    description: 'Hidráulica: pérdida de carga, velocidad y régimen de flujo',
  },
  {
    id: 'gas',
    label: 'Instalaciones de Gas',
    Component: GasCalculator,
    icon: '🔥',
    description: 'UNE 60670: dimensionado de gas natural, propano y butano',
  },
  {
    id: 'thermal',
    label: 'Termotécnica',
    Component: ThermalSizing,
    icon: '🌡️',
    description: 'Transmisión térmica, ventilación y bombas de calor',
  },
  {
    id: 'units',
    label: 'Equivalencias',
    Component: TechnicalConverter,
    icon: '⚙️',
    description: 'Conversor de unidades técnicas normalizado',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    Component: ProjectDashboard,
    icon: '📊',
    description: 'Cálculos guardados en esta sesión de proyecto',
  },
]

function EngineeringSandbox() {
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.Component

  return (
    <section id="demo" className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Header técnico */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs font-semibold text-orange-400 tracking-wider uppercase">
              Motor de Cálculo Activo
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Engineering Sandbox
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Herramientas de cálculo normativo para ingeniería de instalaciones.
            Metodología rigurosa, resultados trazables.
          </p>
        </div>

        {/* Sistema de Cards técnicas */}
        <div className="glass-panel rounded-3xl border border-white/5 bg-navy-900/40 shadow-2xl shadow-black/40 backdrop-blur-xl overflow-hidden">
          {/* Navegación por tabs responsive */}
          <div className="border-b border-white/5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-white/5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-4 py-4 sm:py-5 text-left transition-all duration-300
                    ${
                      activeTab === tab.id
                        ? 'bg-navy-800/50 text-white'
                        : 'bg-navy-900/20 text-slate-400 hover:text-slate-200 hover:bg-navy-800/30'
                    }
                  `}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 border-b-2 border-orange-500"
                      transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                    />
                  )}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl sm:text-3xl leading-none">{tab.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-semibold tracking-wide">
                        {tab.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 hidden sm:block line-clamp-1">
                        {tab.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contenido de la calculadora activa */}
          <div className="p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="min-h-[400px]"
              >
                {ActiveComponent && <ActiveComponent />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer informativo */}
          <div className="border-t border-white/5 px-4 sm:px-6 lg:px-8 py-4 bg-navy-900/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Cálculos basados en normativa vigente. Verificar condiciones específicas de
                  instalación.
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Sistema operativo
                </span>
                <span>v2.0.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="glass-panel rounded-xl border border-white/5 bg-navy-900/20 p-4">
            <div className="text-2xl font-bold text-white font-mono">3+</div>
            <div className="text-xs text-slate-400 mt-1">Normativas implementadas</div>
          </div>
          <div className="glass-panel rounded-xl border border-white/5 bg-navy-900/20 p-4">
            <div className="text-2xl font-bold text-white font-mono">100%</div>
            <div className="text-xs text-slate-400 mt-1">Trazabilidad normativa</div>
          </div>
          <div className="glass-panel rounded-xl border border-white/5 bg-navy-900/20 p-4">
            <div className="text-2xl font-bold text-white font-mono">0</div>
            <div className="text-xs text-slate-400 mt-1">Dependencias externas</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EngineeringSandbox

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PipeFlowCalculator from './sandbox/PipeFlowCalculator'
import TechnicalConverter from './sandbox/TechnicalConverter'
import ThermalSizing from './sandbox/ThermalSizing'
import GasCalculator from './sandbox/GasCalculator'
import ProjectDashboard from './sandbox/ProjectDashboard'
import ToolErrorBoundary from './sandbox/ToolErrorBoundary'
import QuickReferencePanel from './sandbox/QuickReferencePanel'

const tabs = [
  {
    id: 'fluids',
    label: 'Fluidos y Tuberías',
    Component: PipeFlowCalculator,
    glyph: 'H₂O',
    description: 'Pérdida de carga, velocidad y régimen de flujo',
  },
  {
    id: 'gas',
    label: 'Instalaciones de Gas',
    Component: GasCalculator,
    glyph: 'GAS',
    description: 'UNE 60670: dimensionado de gas natural, propano y butano',
  },
  {
    id: 'thermal',
    label: 'Termotécnica',
    Component: ThermalSizing,
    glyph: 'ΔT',
    description: 'Transmisión térmica, ventilación y bombas de calor',
  },
  {
    id: 'units',
    label: 'Equivalencias',
    Component: TechnicalConverter,
    glyph: '⇄',
    description: 'Conversor de unidades técnicas normalizado',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    Component: ProjectDashboard,
    glyph: '≡',
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-orange-500/40 bg-navy-900/60 mb-6 font-mono">
            <span className="h-2 w-2 bg-orange-500"></span>
            <span className="text-xs font-semibold text-orange-400 tracking-wider uppercase">
              Motor de cálculo — en línea
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Sala de Cálculo
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Herramientas de cálculo normativo para instalaciones. Introducir datos,
            verificar norma, generar informe.
          </p>
        </div>

        {/* Sistema de Cards técnicas */}
        <div className="glass-panel border border-white/10 bg-navy-900/60 shadow-2xl shadow-black/40 overflow-hidden">
          {/* Navegación por tabs responsive */}
          <div className="border-b border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-4 py-4 sm:py-5 text-left transition-colors duration-100
                    ${
                      activeTab === tab.id
                        ? 'bg-navy-800 text-white'
                        : 'bg-navy-900/60 text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
                    }
                  `}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 border-b-2 border-orange-500"
                      transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
                    />
                  )}
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold leading-none text-orange-500 pt-0.5">
                      {tab.glyph}
                    </span>
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="min-h-[400px]"
              >
                {ActiveComponent && (
                  <ToolErrorBoundary>
                    <ActiveComponent />
                  </ToolErrorBoundary>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer informativo */}
          <div className="border-t border-white/10 px-4 sm:px-6 lg:px-8 py-4 bg-navy-900/40">
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
                  Cálculo según normativa vigente. Comprobar siempre las condiciones reales de
                  la instalación.
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500"></span>
                  Sistema operativo
                </span>
                <span>v2.3.0</span>
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

      <QuickReferencePanel />
    </section>
  )
}

export default EngineeringSandbox

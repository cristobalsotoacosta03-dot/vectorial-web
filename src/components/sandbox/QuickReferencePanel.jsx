import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MATERIAL_CATALOG, FLUID_CATALOG } from '../../lib/materials'

/**
 * Panel flotante de "Cálculo Rápido de Referencia": rugosidades de
 * materiales y densidades/viscosidades de fluidos, leídas directamente de
 * los catálogos únicos de `materials.js` (nunca se duplican valores aquí),
 * para consultarlas sin salir de la calculadora ni abrir el código fuente.
 *
 * @component
 */
function QuickReferencePanel() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-6 right-6 z-40 border border-orange-500/50 bg-navy-900 px-4 py-3 font-mono text-xs font-bold text-orange-400 shadow-lg shadow-black/40 hover:bg-navy-800 transition-colors duration-100"
        aria-expanded={open}
      >
        REF
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.15 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-navy-950 p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Referencia Rápida</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors duration-100"
                >
                  Cerrar
                </button>
              </div>

              <section className="mb-6">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-400">
                  Materiales — rugosidad
                </h4>
                <table className="w-full text-left text-xs">
                  <tbody>
                    {Object.values(MATERIAL_CATALOG).map((material) => (
                      <tr key={material.name} className="border-b border-white/5">
                        <td className="py-1.5 pr-2 text-slate-300">{material.name}</td>
                        <td className="py-1.5 text-right font-mono text-white">{material.roughness} m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-400">
                  Fluidos y gases — densidad / viscosidad
                </h4>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="py-1.5 pr-2 font-medium">Fluido</th>
                      <th className="py-1.5 pr-2 text-right font-medium">ρ (kg/m³)</th>
                      <th className="py-1.5 text-right font-medium">ν (mm²/s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(FLUID_CATALOG).map((fluid) => (
                      <tr key={fluid.name} className="border-b border-white/5">
                        <td className="py-1.5 pr-2 text-slate-300">{fluid.name}</td>
                        <td className="py-1.5 pr-2 text-right font-mono text-white">{fluid.density}</td>
                        <td className="py-1.5 text-right font-mono text-white">{fluid.viscosity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <p className="mt-6 text-xs text-slate-500">
                Valores tomados de los catálogos únicos del motor de cálculo
                (src/lib/materials.js) — siempre sincronizados con lo que
                usan las calculadoras.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default QuickReferencePanel

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ToolHeader from './ToolHeader'
import TechnicalReport from './TechnicalReport'
import { exportCalculationToJSON, exportProjectToJSON, importProjectFromJSON } from '../../lib/exportUtils'
import { clearCalculations, removeCalculation, updateCalculationNote } from '../../lib/calculationStore'
import { setProjectMeta } from '../../lib/projectMeta'
import { useCalculationHistory } from '../../hooks/useCalculationHistory'
import { useProjectMeta } from '../../hooks/useProjectMeta'

const TYPE_LABELS = {
  pipe_flow: 'Fluidos y Tuberías',
  gas: 'Instalaciones de Gas',
  thermal: 'Termotécnica',
}

const metaFieldClass =
  'glass-panel w-full border border-white/10 bg-navy-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-colors duration-100'

/**
 * Formulario de cabecera del proyecto (Autor, ID de Obra, Cliente, Fecha).
 * Persiste durante toda la sesión y se incrusta en cada Informe Técnico.
 *
 * @component
 */
function ProjectMetaForm() {
  const meta = useProjectMeta()

  return (
    <div className="glass-panel mb-6 border border-white/10 bg-navy-900/40 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Datos de cabecera del proyecto
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="meta-author" className="mb-1 block text-xs text-slate-500">
            Autor
          </label>
          <input
            id="meta-author"
            type="text"
            value={meta.author}
            onChange={(event) => setProjectMeta({ author: event.target.value })}
            placeholder="Ingeniero responsable"
            className={metaFieldClass}
          />
        </div>
        <div>
          <label htmlFor="meta-project-id" className="mb-1 block text-xs text-slate-500">
            ID de Obra
          </label>
          <input
            id="meta-project-id"
            type="text"
            value={meta.projectId}
            onChange={(event) => setProjectMeta({ projectId: event.target.value })}
            placeholder="Ej. 2026-0346"
            className={metaFieldClass}
          />
        </div>
        <div>
          <label htmlFor="meta-client" className="mb-1 block text-xs text-slate-500">
            Cliente
          </label>
          <input
            id="meta-client"
            type="text"
            value={meta.client}
            onChange={(event) => setProjectMeta({ client: event.target.value })}
            placeholder="Nombre del cliente"
            className={metaFieldClass}
          />
        </div>
        <div>
          <label htmlFor="meta-date" className="mb-1 block text-xs text-slate-500">
            Fecha de referencia
          </label>
          <input
            id="meta-date"
            type="date"
            value={meta.date}
            onChange={(event) => setProjectMeta({ date: event.target.value })}
            className={metaFieldClass}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Dashboard de Proyecto: lista los cálculos guardados durante la sesión
 * (persistidos en localStorage) para poder revisarlos, exportarlos o
 * imprimirlos sin tener que repetir la entrada de datos. Permite exportar
 * o importar el proyecto completo (cálculos + notas + cabecera) como un
 * único fichero JSON, para llevar el trabajo de obra al PC de oficina.
 *
 * @component
 */
function ProjectDashboard() {
  const entries = useCalculationHistory()
  const [expandedId, setExpandedId] = useState(null)
  const [importMessage, setImportMessage] = useState(null) // { type: 'success' | 'error', text }
  const fileInputRef = useRef(null)

  const handleClear = () => {
    if (entries.length === 0) return
    if (window.confirm('¿Vaciar todos los cálculos guardados de esta sesión?')) {
      clearCalculations()
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // permite reimportar el mismo fichero dos veces seguidas
    if (!file) return

    if (
      entries.length > 0 &&
      !window.confirm(
        `Vas a importar un proyecto. Esto reemplazará los ${entries.length} cálculo(s) guardados actualmente. ¿Continuar?`,
      )
    ) {
      return
    }

    try {
      const text = await file.text()
      const result = importProjectFromJSON(text)
      if (result.success) {
        const skippedNote = result.skipped > 0 ? ` (${result.skipped} descartado(s) por formato inválido)` : ''
        setImportMessage({
          type: 'success',
          text: `Proyecto importado: ${result.imported} cálculo(s) restaurado(s)${skippedNote}.`,
        })
      } else {
        setImportMessage({ type: 'error', text: result.error })
      }
    } catch {
      setImportMessage({ type: 'error', text: 'No se pudo leer el archivo seleccionado.' })
    }
  }

  return (
    <div>
      <ToolHeader
        icon="≡"
        title="Dashboard de Proyecto"
        description="Cálculos guardados en esta sesión, listos para consultar, exportar o imprimir."
      />

      <ProjectMetaForm />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {entries.length} {entries.length === 1 ? 'cálculo guardado' : 'cálculos guardados'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportProjectToJSON}
            disabled={entries.length === 0}
            className="glass-panel px-4 py-2 text-sm font-semibold text-green-400 border border-green-500/30 hover:bg-green-500/10 transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Exportar proyecto completo
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className="glass-panel px-4 py-2 text-sm font-semibold text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-colors duration-100"
          >
            Importar proyecto
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleClear}
            disabled={entries.length === 0}
            className="glass-panel px-4 py-2 text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Vaciar Dashboard
          </button>
        </div>
      </div>

      <AnimatePresence>
        {importMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 border p-3 text-sm ${
              importMessage.type === 'success'
                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                : 'border-red-500/40 bg-red-500/10 text-red-400'
            }`}
          >
            {importMessage.text}
            <button
              type="button"
              onClick={() => setImportMessage(null)}
              className="ml-3 underline decoration-dotted underline-offset-2"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length === 0 ? (
        <div className="glass-panel border border-white/5 bg-navy-900/40 p-10 text-center text-sm text-slate-500">
          Todavía no hay cálculos guardados. Usa "Guardar en Dashboard" desde el
          Informe Técnico de cualquier calculadora, o importa un proyecto existente.
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
                className="glass-panel border border-white/5 bg-navy-900/40 overflow-hidden"
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
                      className="glass-panel px-3 py-1.5 text-xs font-semibold text-orange-400 border border-orange-500/30 hover:bg-orange-500/10 transition-colors duration-100"
                    >
                      {expandedId === entry.id ? 'Ocultar' : 'Ver informe'}
                    </button>
                    <button
                      type="button"
                      onClick={() => exportCalculationToJSON(entry.calculationData, `vectorial-${entry.type}`)}
                      className="glass-panel px-3 py-1.5 text-xs font-semibold text-green-400 border border-green-500/30 hover:bg-green-500/10 transition-colors duration-100"
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCalculation(entry.id)}
                      className="glass-panel px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors duration-100"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <label htmlFor={`note-${entry.id}`} className="mb-1 block text-xs font-medium text-slate-500">
                    Nota de campo
                  </label>
                  <textarea
                    id={`note-${entry.id}`}
                    value={entry.note ?? ''}
                    onChange={(event) => updateCalculationNote(entry.id, event.target.value)}
                    placeholder="Ej.: Ojo — trazado modificado por columna en obra."
                    rows={2}
                    className="glass-panel w-full border border-white/10 bg-navy-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-colors duration-100"
                  />
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

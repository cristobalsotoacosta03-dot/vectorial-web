import { createContext, useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info }
const STYLES = {
  success: 'border-emerald-200 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400',
  error:   'border-red-200 text-red-600 dark:border-red-500/30 dark:text-red-400',
  warning: 'border-amber-200 text-amber-700 dark:border-amber-500/30 dark:text-amber-400',
  info:    'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const notify = useCallback((message, { type = 'info', duration = 4000 } = {}) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    if (duration) setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ notify, dismiss }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
          <AnimatePresence>
            {toasts.map(t => {
              const Icon = ICONS[t.type] ?? Info
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  role="status"
                  className={`pointer-events-auto flex items-start gap-2.5 bg-white dark:bg-slate-900 border rounded-xl shadow-lg px-4 py-3 ${STYLES[t.type]}`}
                >
                  <Icon size={18} className="shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 dark:text-slate-200 flex-1">{t.message}</p>
                  <button onClick={() => dismiss(t.id)} aria-label="Cerrar notificación" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={16} />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}

import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'
import ErrorBoundary from '../ErrorBoundary'
import SubscriptionGate from '../SubscriptionGate'

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          <SubscriptionGate>
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </ErrorBoundary>
          </SubscriptionGate>
        </main>

        <footer className="py-6 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-slate-800">
          Vectorial — Prototipo v0.2 · RITE · RIGLO · UNE-EN 1057 · CTE DB-HE4
        </footer>
      </div>
    </div>
  )
}

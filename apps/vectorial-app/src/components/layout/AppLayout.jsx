import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import ErrorBoundary from '../ErrorBoundary'
import SubscriptionGate from '../SubscriptionGate'

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          <SubscriptionGate>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </SubscriptionGate>
        </main>

        <footer className="py-6 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-slate-800">
          GestiObra — Prototipo v0.2 · RITE · RIGLO · UNE-EN 1057 · CTE DB-HE4
        </footer>
      </div>
    </div>
  )
}

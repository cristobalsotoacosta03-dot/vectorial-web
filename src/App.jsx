import { useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard    from './pages/Dashboard'
import Obras        from './pages/Obras'
import Presupuestos from './pages/Presupuestos'
import Catalogo     from './pages/Catalogo'
import Calculadoras from './pages/Calculadoras'
import Materiales   from './pages/Materiales'
import './index.css'

const NAV = [
  { id: 'dashboard',    label: 'Inicio'       },
  { id: 'obras',        label: 'Obras'        },
  { id: 'presupuestos', label: 'Presupuestos' },
  { id: 'materiales',   label: '🧱 Materiales' },
  { id: 'catalogo',     label: 'Catálogo'     },
  { id: 'calculadoras', label: '🧮 Calcular'   },
]

export default function App() {
  const [page,            setPage]            = useState('dashboard')
  // Estado global de obra seleccionada — compartido entre Dashboard, Materiales y Calculadoras
  const [selectedObraId,  setSelectedObraId]  = useState(null)

  // Función de navegación con soporte opcional para cambiar la obra al mismo tiempo
  function navigate(pageId, obraId) {
    setPage(pageId)
    if (obraId !== undefined) setSelectedObraId(obraId)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              G
            </div>
            <span className="text-lg font-bold text-slate-800">GestiObra</span>
          </button>

          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  page === id
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <ErrorBoundary>
          {page === 'dashboard'    && <Dashboard    navigate={navigate} selectedObraId={selectedObraId} setSelectedObraId={setSelectedObraId} />}
          {page === 'obras'        && <Obras        navigate={navigate} />}
          {page === 'presupuestos' && <Presupuestos navigate={navigate} />}
          {page === 'materiales'   && <Materiales   navigate={navigate} selectedObraId={selectedObraId} setSelectedObraId={setSelectedObraId} />}
          {page === 'catalogo'     && <Catalogo     navigate={navigate} />}
          {page === 'calculadoras' && <Calculadoras navigate={navigate} selectedObraId={selectedObraId} />}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 text-center text-xs text-slate-400 border-t border-slate-200">
        GestiObra — Prototipo v0.2 · RITE · RIGLO · UNE-EN 1057 · CTE DB-HE4
      </footer>
    </div>
  )
}

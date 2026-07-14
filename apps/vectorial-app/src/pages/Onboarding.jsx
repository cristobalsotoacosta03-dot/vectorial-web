import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Onboarding() {
  const { session, empresaId, loading, crearEmpresa, signOut } = useAuth()
  const navigate = useNavigate()
  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  if (empresaId) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await crearEmpresa(nombreEmpresa)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || 'No se pudo crear la empresa')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Crea tu empresa</h1>
        <p className="text-sm text-slate-500 mb-6">Todas tus obras, presupuestos y materiales se organizan bajo tu empresa.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Nombre de la empresa</label>
            <input required value={nombreEmpresa} onChange={e => setNombreEmpresa(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Ej: Instalaciones Pérez S.L." />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}

          <button type="submit" disabled={enviando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            {enviando ? 'Creando...' : 'Crear empresa y continuar'}
          </button>
        </form>

        <button onClick={signOut} className="w-full text-sm text-slate-400 hover:text-slate-600 mt-4">
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

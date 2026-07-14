import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RequireAuth() {
  const { session, empresaId, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <span className="text-4xl animate-spin">⚙️</span>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!empresaId) return <Navigate to="/onboarding" replace />

  return <Outlet />
}

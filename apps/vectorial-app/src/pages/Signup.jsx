import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [confirmacionPendiente, setConfirmacionPendiente] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const data = await signUp(email, password, nombre)
      if (data.session) {
        navigate('/onboarding', { replace: true })
      } else {
        setConfirmacionPendiente(true)
      }
    } catch (err) {
      setError(err?.message || 'No se pudo crear la cuenta')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">V</div>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Vectorial</span>
        </div>

        {confirmacionPendiente ? (
          <>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Revisa tu correo</h1>
            <p className="text-sm text-slate-500 mb-6">
              Te hemos enviado un enlace de confirmación a <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>.
              Confírmalo y luego inicia sesión.
            </p>
            <Link to="/login" className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Ir a iniciar sesión
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Crea tu cuenta</h1>
            <p className="text-sm text-slate-500 mb-6">Después podrás crear la empresa desde la que trabajas.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tu nombre</label>
                <input required value={nombre} onChange={e => setNombre(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Nombre y apellidos" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                <input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="tu@empresa.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Contraseña</label>
                <input required type="password" minLength={6} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Mínimo 6 caracteres" />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={enviando}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <p className="text-sm text-slate-500 mt-6 text-center">
              ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 font-medium hover:underline">Inicia sesión</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

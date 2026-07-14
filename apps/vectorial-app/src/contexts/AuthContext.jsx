import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [empresaId, setEmpresaId] = useState(null)
  const [empresaNombre, setEmpresaNombre] = useState(null)
  const [loading, setLoading] = useState(true)

  const cargarEmpresa = useCallback(async (userId) => {
    if (!supabase || !userId) {
      setEmpresaId(null)
      setEmpresaNombre(null)
      return
    }
    const { data, error } = await supabase
      .from('empresa_usuarios')
      .select('empresa_id, empresas(nombre)')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      setEmpresaId(data.empresa_id)
      setEmpresaNombre(data.empresas?.nombre ?? null)
    } else {
      setEmpresaId(null)
      setEmpresaNombre(null)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let activo = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!activo) return
      setSession(data.session ?? null)
      if (data.session?.user) await cargarEmpresa(data.session.user.id)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!activo) return
      setSession(newSession)
      if (newSession?.user) await cargarEmpresa(newSession.user.id)
      else {
        setEmpresaId(null)
        setEmpresaNombre(null)
      }
    })

    return () => {
      activo = false
      subscription.subscription.unsubscribe()
    }
  }, [cargarEmpresa])

  async function signIn(email, password) {
    if (!supabase) throw new Error('Supabase no está configurado en este entorno')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password, nombre) {
    if (!supabase) throw new Error('Supabase no está configurado en este entorno')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (nombre && data.user) {
      await supabase.from('profiles').update({ nombre }).eq('id', data.user.id)
    }
    return data
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  async function crearEmpresa(nombreEmpresa) {
    if (!supabase) throw new Error('Supabase no está configurado en este entorno')
    const { data, error } = await supabase.rpc('create_empresa_and_owner', { nombre_empresa: nombreEmpresa })
    if (error) throw error
    await cargarEmpresa(session?.user?.id)
    return data
  }

  const value = {
    session,
    user: session?.user ?? null,
    empresaId,
    empresaNombre,
    loading,
    signIn,
    signUp,
    signOut,
    crearEmpresa,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

// Motor de acceso a datos — CRUD centralizado con RLS awareness
import { supabase } from './supabase'

export { supabase }

// false = modo demo (sin credenciales o BD no alcanzable)
export const conexionActiva = supabase !== null

// ── OBRAS ──────────────────────────────────────────────────────────────────
export const dbObras = {
  listar:     ()         => supabase.from('obras').select('*').order('created_at', { ascending: false }),
  insertar:   (data)     => supabase.from('obras').insert([data]).select().single(),
  actualizar: (id, data) => supabase.from('obras').update(data).eq('id', id).select().single(),
  eliminar:   (id)       => supabase.from('obras').delete().eq('id', id),
}

// ── PRESUPUESTOS ───────────────────────────────────────────────────────────
export const dbPresupuestos = {
  listar:     ()         => supabase.from('presupuestos').select('*').order('created_at', { ascending: false }),
  insertar:   (data)     => supabase.from('presupuestos').insert([data]).select().single(),
  actualizar: (id, data) => supabase.from('presupuestos').update(data).eq('id', id).select().single(),
  eliminar:   (id)       => supabase.from('presupuestos').delete().eq('id', id),
}

// ── MATERIALES ─────────────────────────────────────────────────────────────
export const dbMateriales = {
  listar: (filtros = {}) => {
    let q = supabase.from('materiales').select('*').order('categoria').order('nombre')
    if (filtros.categoria) q = q.eq('categoria', filtros.categoria)
    if (filtros.busqueda)  q = q.ilike('nombre', `%${filtros.busqueda}%`)
    return q
  },
  insertar:   (data)     => supabase.from('materiales').insert([data]).select().single(),
  actualizar: (id, data) => supabase.from('materiales').update(data).eq('id', id).select().single(),
  eliminar:   (id)       => supabase.from('materiales').delete().eq('id', id),
}

// ── OPERARIOS ──────────────────────────────────────────────────────────────
export const dbOperarios = {
  listar: (soloActivos = true) => {
    let q = supabase.from('operarios').select('*').order('nombre')
    if (soloActivos) q = q.eq('activo', true)
    return q
  },
  insertar:   (data)     => supabase.from('operarios').insert([data]).select().single(),
  actualizar: (id, data) => supabase.from('operarios').update(data).eq('id', id).select().single(),
  eliminar:   (id)       => supabase.from('operarios').delete().eq('id', id),
}

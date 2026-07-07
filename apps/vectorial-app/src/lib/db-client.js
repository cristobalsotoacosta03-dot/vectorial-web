// ─────────────────────────────────────────────────────────
//  GestiObra — Cliente Supabase (db-client.js)
//  Inicializa el cliente de Supabase con las variables de entorno
// ─────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

// Leer variables de entorno (definidas en .env)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar que las variables existan
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '❌ Error: Faltan variables de entorno de Supabase.\n' +
    '   Asegúrate de que el archivo .env contiene:\n' +
    '   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co\n' +
    '   VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui'
  )
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Log de conexión exitosa (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('✅ Cliente Supabase inicializado correctamente')
  console.log(`   URL: ${SUPABASE_URL}`)
}
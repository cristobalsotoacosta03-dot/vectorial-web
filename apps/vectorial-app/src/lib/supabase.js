// ─────────────────────────────────────────────────────────
//  GestiObra — Cliente Supabase
//  Pasos para activar la conexión real:
//  1. Desde tu terminal Windows, en la carpeta gestiobra:
//       npm install @supabase/supabase-js
//  2. Crea un archivo .env en la raíz del proyecto con:
//       VITE_SUPABASE_URL=https://xxxx.supabase.co
//       VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
//  3. Descomenta el bloque de abajo y borra el export mock.
// ─────────────────────────────────────────────────────────

// import { createClient } from '@supabase/supabase-js'
//
// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
//
// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Mock temporal — se reemplaza por el bloque de arriba
export const supabase = null

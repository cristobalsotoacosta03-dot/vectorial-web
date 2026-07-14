import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Sin variables de entorno (p.ej. en un entorno sin .env.local configurado)
// la app cae a modo demo: los hooks detectan `supabase === null` y sirven
// los mocks de src/data/mocks en su lugar.
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

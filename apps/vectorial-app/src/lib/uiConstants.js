/**
 * VECTORIAL - Clases de UI compartidas para formularios técnicos.
 * Única fuente de verdad para el estilo de inputs y labels, antes duplicado
 * literalmente en cada componente de src/components/sandbox.
 *
 * Consumido EXCLUSIVAMENTE por vectorial-web (landing/sandbox) vía el export
 * `./lib/uiConstants` de package.json. El sistema de diseño del producto real
 * (vectorial-app) es Tailwind clásico + `dark:` (ver src/hooks/useTheme.js) —
 * no usar `glass-panel`/`navy-*` en componentes de vectorial-app.
 *
 * @module uiConstants
 */

export const inputClass =
  'glass-panel w-full border border-white/10 bg-navy-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-colors duration-100'

export const inputWarningClass =
  'glass-panel w-full border-2 border-orange-500/70 bg-navy-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-colors duration-100'

export const inputErrorClass =
  'glass-panel w-full border-2 border-red-500/70 bg-navy-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-colors duration-100'

export const labelClass = 'mb-2 block text-sm font-medium text-slate-300 tracking-wide'

export const selectClass = `${inputClass} cursor-pointer`

/**
 * Devuelve la clase de input correspondiente a un estado de validación
 * ("Input-Safe": el usuario ve el aviso mientras escribe, no solo al calcular).
 *
 * @param {'ok'|'warning'|'error'} status
 * @returns {string}
 */
export function getInputClass(status) {
  if (status === 'error') return inputErrorClass
  if (status === 'warning') return inputWarningClass
  return inputClass
}

/**
 * VECTORIAL - Clases de UI compartidas para formularios técnicos.
 * Única fuente de verdad para el estilo Navy/Slate de inputs y labels,
 * antes duplicado literalmente en cada componente de src/components/sandbox.
 *
 * @module uiConstants
 */

export const inputClass =
  'glass-panel w-full rounded-xl border border-white/5 bg-navy-900/40 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30'

export const labelClass = 'mb-2 block text-sm font-medium text-slate-300 tracking-wide'

export const selectClass = `${inputClass} cursor-pointer`

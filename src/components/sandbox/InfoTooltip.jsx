/**
 * Icono de información con tooltip nativo (atributo title).
 * Se usa junto a los labels de campos cuyo valor depende de una norma
 * concreta (UNE, CTE, RITE...), para dejar trazabilidad normativa visible
 * sin depender de una librería de tooltips.
 *
 * @component
 * @param {Object} props
 * @param {string} props.text - Texto explicativo (referencia normativa)
 */
function InfoTooltip({ text }) {
  return (
    <span
      title={text}
      tabIndex={0}
      className="ml-1.5 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-slate-600 text-[10px] font-semibold text-slate-400 align-middle hover:border-orange-400 hover:text-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/50"
      aria-label={text}
    >
      i
    </span>
  )
}

export default InfoTooltip

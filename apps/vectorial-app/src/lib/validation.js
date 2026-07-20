// ─── Validación de formularios en tiempo real ──────────────────────────────
// Reglas ligeras para campos numéricos de las calculadoras: comprueban rango,
// obligatoriedad y comparación entre campos (p.ej. temperaturas), y devuelven
// un mensaje de error listo para mostrar bajo el input o null si es válido.

export function validarNumero(valor, { min, max, requerido = true, label = 'Valor' } = {}) {
  if (valor === '' || valor === null || valor === undefined) {
    return requerido ? `${label} es obligatorio` : null
  }
  const n = Number(valor)
  if (Number.isNaN(n)) return `${label} debe ser un número`
  if (min !== undefined && n < min) return `${label} debe ser ≥ ${min}`
  if (max !== undefined && n > max) return `${label} debe ser ≤ ${max}`
  return null
}

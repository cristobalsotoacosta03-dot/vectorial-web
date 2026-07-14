// Catálogo de símbolos técnicos del editor 2D. No son símbolos normalizados
// UNE-EN 60617/UNE 100030 al detalle (eso exigiría una librería vectorial
// dedicada) — son glifos geométricos simples pero reconocibles, pensados
// para anotar planos y esquemas de principio rápidamente.
export const SIMBOLOS = [
  { id: 'caldera',    label: 'Caldera',            categoria: 'Equipos' },
  { id: 'bomba',      label: 'Bomba',              categoria: 'Equipos' },
  { id: 'deposito',   label: 'Depósito/Acumulador',categoria: 'Equipos' },
  { id: 'intercambiador', label: 'Intercambiador', categoria: 'Equipos' },
  { id: 'valvula_compuerta', label: 'Válvula de compuerta', categoria: 'Válvulas' },
  { id: 'valvula_esfera',    label: 'Válvula de esfera',    categoria: 'Válvulas' },
  { id: 'valvula_retencion', label: 'Válvula de retención', categoria: 'Válvulas' },
  { id: 'cuadro_electrico', label: 'Cuadro eléctrico', categoria: 'Eléctrico' },
  { id: 'enchufe',    label: 'Toma de corriente',  categoria: 'Eléctrico' },
  { id: 'luminaria',  label: 'Luminaria',          categoria: 'Eléctrico' },
  { id: 'lavabo',     label: 'Lavabo',             categoria: 'Sanitario' },
  { id: 'inodoro',    label: 'Inodoro',            categoria: 'Sanitario' },
  { id: 'ducha',      label: 'Ducha',              categoria: 'Sanitario' },
]

export function getSimbolo(id) {
  return SIMBOLOS.find(s => s.id === id) ?? SIMBOLOS[0]
}

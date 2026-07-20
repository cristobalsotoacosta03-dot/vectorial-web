import { describe, it, expect } from 'vitest'
import { validarNumero } from './validation'

describe('validarNumero', () => {
  it('rechaza un valor vacío cuando el campo es obligatorio', () => {
    expect(validarNumero('', { label: 'El caudal' })).toBe('El caudal es obligatorio')
  })

  it('acepta un valor vacío cuando el campo no es obligatorio', () => {
    expect(validarNumero('', { requerido: false })).toBeNull()
  })

  it('rechaza algo que no es un número', () => {
    expect(validarNumero('abc', { label: 'La temperatura' })).toBe('La temperatura debe ser un número')
  })

  it('rechaza un valor por debajo del mínimo', () => {
    expect(validarNumero(2, { min: 5, label: 'La autonomía' })).toBe('La autonomía debe ser ≥ 5')
  })

  it('rechaza un valor por encima del máximo', () => {
    expect(validarNumero(200, { max: 180, label: 'La autonomía' })).toBe('La autonomía debe ser ≤ 180')
  })

  it('acepta un valor dentro de rango', () => {
    expect(validarNumero(15, { min: 1, max: 180 })).toBeNull()
  })

  it('acepta el propio límite mínimo y máximo (inclusivos)', () => {
    expect(validarNumero(1, { min: 1, max: 180 })).toBeNull()
    expect(validarNumero(180, { min: 1, max: 180 })).toBeNull()
  })

  it('trata "0" como un valor presente, no como vacío', () => {
    expect(validarNumero(0, { min: 0 })).toBeNull()
    expect(validarNumero('0', { min: 0 })).toBeNull()
  })
})

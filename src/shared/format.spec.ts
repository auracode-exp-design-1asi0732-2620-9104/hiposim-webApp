import { describe, expect, it } from 'vitest'
import { formatCurrency, formatInstallment, formatRate, toInternationalPhone } from './format'

describe('format', () => {
  it('shows a rate fraction as a percentage', () => {
    expect(formatRate(0.0885)).toBe('8.85%')
    expect(formatRate(0.1)).toBe('10.00%')
  })

  it('formats soles without cents for prices and with cents for installments', () => {
    expect(formatCurrency(280000)).toContain('280,000')
    expect(formatCurrency(280000)).not.toContain('.00')
    expect(formatInstallment(1909)).toContain('1,909.00')
  })

  it.each([
    ['987654321', '51987654321'],
    ['987 654 321', '51987654321'],
    ['+51 987 654 321', '51987654321'],
    ['51987654321', '51987654321'],
  ])('builds an international number from %s', (input, expected) => {
    expect(toInternationalPhone(input)).toBe(expected)
  })
})

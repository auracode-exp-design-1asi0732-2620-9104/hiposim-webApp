import { describe, expect, it } from 'vitest'
import en from './locales/en'
import es419 from './locales/es-419'
import { i18n, setLocale } from './index'

/** Every key of the English file must exist in the Spanish one, and the other way round. */
function keysOf(object: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(object).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? keysOf(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

describe('i18n', () => {
  it('has the same keys in English and Spanish', () => {
    expect(keysOf(es419).sort()).toEqual(keysOf(en).sort())
  })

  it('uses English by default', () => {
    expect(i18n.global.locale.value).toBe('en')
    expect(i18n.global.t('auth.submit')).toBe('Sign in')
  })

  it('switches to Spanish, updates the document language and remembers the choice', () => {
    setLocale('es-419')

    expect(i18n.global.t('auth.submit')).toBe('Iniciar sesión')
    expect(document.documentElement.lang).toBe('es-419')
    expect(localStorage.getItem('hiposim.locale')).toBe('es-419')

    setLocale('en')
  })
})

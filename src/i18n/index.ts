import { createI18n } from 'vue-i18n'
import en from './locales/en'
import es419 from './locales/es-419'

export type AppLocale = 'en' | 'es-419'
export const supportedLocales: AppLocale[] = ['en', 'es-419']

const STORAGE_KEY = 'hiposim.locale'

function isLocale(value: string | null): value is AppLocale {
  return value === 'en' || value === 'es-419'
}

function initialLocale(): AppLocale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLocale(saved)) return saved
  } catch {
    // Storage can be blocked; fall through to the default.
  }
  return 'en' // English is the default language of every product (course statement).
}

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: 'en',
  messages: { en, 'es-419': es419 },
})

/** Dates and numbers follow the interface language; amounts stay in Peruvian soles. */
export const intlLocale = () => (i18n.global.locale.value === 'en' ? 'en-US' : 'es-PE')

export function setLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // Not persisting is acceptable.
  }
}

document.documentElement.lang = i18n.global.locale.value

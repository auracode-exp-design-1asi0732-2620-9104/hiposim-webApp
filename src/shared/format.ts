import { intlLocale } from '@/i18n'

const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 })
const currencyCents = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 })

/** Whole soles, for property prices and totals. */
export const formatCurrency = (value: number) => currency.format(value)

/** Soles with cents, for installments. */
export const formatInstallment = (value: number) => currencyCents.format(value)

/** The API sends rates as fractions: 0.0885 is shown as 8.85%. */
export const formatRate = (fraction: number) => `${(fraction * 100).toFixed(2)}%`

export function formatDateTime(isoUtc: string) {
  return new Date(isoUtc).toLocaleString(intlLocale(), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Digits only, with the +51 prefix, as wa.me and tel: expect. */
export function toInternationalPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('51') && digits.length > 9 ? digits : `51${digits}`
}

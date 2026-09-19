import { z } from 'zod'

/**
 * Reglas de validación compartidas entre Login y Registro.
 * Centralizadas aquí para que ambos formularios (y los que vengan después:
 * Mi Inmobiliaria, Configuración) apliquen exactamente la misma política.
 */

const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'live.com',
  'icloud.com',
  'protonmail.com',
]

export const emailSchema = z
  .string()
  .min(1, 'El correo es obligatorio.')
  .email('Ingresa un correo electrónico válido.')

export const corporateEmailSchema = emailSchema.refine(
  (value) => !PERSONAL_EMAIL_DOMAINS.includes(value.split('@')[1]?.toLowerCase() ?? ''),
  { message: 'Usa el correo corporativo de tu inmobiliaria, no uno personal (Gmail, Hotmail, etc.).' },
)

// SUNAT: el RUC tiene 11 dígitos; los dos primeros indican el tipo de contribuyente.
// 10 = persona natural, 15/17 = casos especiales, 20 = persona jurídica (el caso típico de una inmobiliaria).
export const rucSchema = z
  .string()
  .min(1, 'El RUC es obligatorio.')
  .regex(/^\d{11}$/, 'El RUC debe tener exactamente 11 dígitos numéricos.')
  .refine((value) => ['10', '15', '17', '20'].includes(value.slice(0, 2)), {
    message: 'El RUC debe iniciar con 10, 15, 17 o 20, según el tipo de contribuyente SUNAT.',
  })

// Celulares en Perú: 9 dígitos, siempre empiezan en 9. Se acepta con o sin +51.
export const phoneSchema = z
  .string()
  .min(1, 'El teléfono es obligatorio.')
  .transform((value) => value.replace(/[\s()-]/g, '').replace(/^\+?51/, ''))
  .pipe(
    z
      .string()
      .regex(/^9\d{8}$/, 'Ingresa un celular peruano válido: 9 dígitos, comenzando en 9 (ej. 987654321).'),
  )

export interface PasswordRuleCheck {
  key: string
  label: string
  test: (value: string) => boolean
}

export const passwordRules: PasswordRuleCheck[] = [
  { key: 'minLength', label: 'Al menos 8 caracteres', test: (v) => v.length >= 8 },
  { key: 'maxLength', label: 'Máximo 64 caracteres', test: (v) => v.length <= 64 },
  { key: 'uppercase', label: 'Una letra mayúscula', test: (v) => /[A-Z]/.test(v) },
  { key: 'lowercase', label: 'Una letra minúscula', test: (v) => /[a-z]/.test(v) },
  { key: 'number', label: 'Un número', test: (v) => /\d/.test(v) },
  { key: 'symbol', label: 'Un símbolo (ej. !@#$%)', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

export const passwordSchema = z
  .string()
  .min(1, 'La contraseña es obligatoria.')
  .refine((value) => passwordRules.every((rule) => rule.test(value)), {
    message: 'La contraseña no cumple con la política de seguridad requerida.',
  })

// Para el login solo exigimos que el campo no esté vacío: no tiene sentido
// aplicar la política completa de contraseña nueva contra una que ya existe.
export const loginPasswordSchema = z.string().min(1, 'Ingresa tu contraseña.')

export const requiredTextSchema = (fieldLabel: string, min = 2) =>
  z.string().min(min, `${fieldLabel} es obligatorio.`)

interface SafeParseLike {
  success: boolean
  error?: { issues: { message: string }[] }
}

export function getFirstZodError(result: SafeParseLike): string | null {
  if (result.success) return null
  return result.error?.issues[0]?.message ?? 'Dato inválido.'
}

import { i18n } from '@/i18n'
import type { LeadStatus } from './leads.types'

/** Read inside templates so it follows the interface language. */
export const statusLabel = (status: LeadStatus) => i18n.global.t(`status.${status}`)

export const statusSeverity: Record<LeadStatus, 'success' | 'info' | 'warn' | 'secondary' | 'danger'> = {
  new: 'warn',
  contacted: 'info',
  appointmentScheduled: 'info',
  closed: 'success',
  discarded: 'secondary',
}

/**
 * Lead contract (PROPOSED, not in openapi.v0 yet: leads are TS08, owner Joaquin).
 * Fields are exactly what US23 and US24 ask for. Nothing else (no DNI, SBS score or inventory match).
 * Rates are fractions (0.0885 = 8.85%), amounts are PEN, dates are ISO 8601 UTC.
 */
export type LeadStatus = 'new' | 'contacted' | 'appointmentScheduled' | 'closed' | 'discarded'

/** US25: Nuevo, En contacto, Cita agendada, Cerrado, Descartado. */
export const leadStatuses: LeadStatus[] = ['new', 'contacted', 'appointmentScheduled', 'closed', 'discarded']

export interface LeadSummary {
  id: string
  buyerName: string
  propertyPrice: number
  monthlyInstallment: number
  tcea: number
  status: LeadStatus
  receivedAtUtc: string
}

export interface LeadHistoryEntry {
  type: 'status' | 'note'
  /** For a status entry this is the new status; for a note it is the note text. */
  text: string
  authorName: string
  atUtc: string
}

export interface LeadDetail {
  id: string
  status: LeadStatus
  buyer: { fullName: string; email: string; phone: string }
  simulation: {
    propertyPrice: number
    downPayment: number
    goodPayerBonus: number
    financedAmount: number
    termInMonths: number
    monthlyInstallment: number
    tcea: number
  }
  history: LeadHistoryEntry[]
}

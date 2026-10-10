/**
 * Lead model used by the screens. The API contract is the one of hiposim-backEnd (develop, TS08): see
 * leads.mapper.ts, which translates it. A value is `null` when the API does not send it yet.
 * Rates are fractions (0.0885 = 8.85%), amounts are PEN, dates are ISO 8601 UTC.
 */
export type LeadStatus = 'new' | 'contacted' | 'appointmentScheduled' | 'closed' | 'discarded'

/** US25: Nuevo, En contacto, Cita agendada, Cerrado, Descartado. */
export const leadStatuses: LeadStatus[] = ['new', 'contacted', 'appointmentScheduled', 'closed', 'discarded']

export interface LeadSummary {
  id: string
  buyerName: string
  /** The inbox endpoint does not send the property value yet (US23 asks for it). */
  propertyPrice: number | null
  monthlyInstallment: number | null
  tcea: number | null
  status: LeadStatus
  receivedAtUtc: string
}

export interface LeadHistoryEntry {
  type: 'status' | 'note'
  /** For a status entry this is the new status; for a note it is the note text. */
  text: string
  /** Id of the advisor who made the change (the API does not send names). Null for the system. */
  authorId: string | null
  /** Only the sample data carries a display name. */
  authorName?: string
  atUtc: string
}

export interface LeadDetail {
  id: string
  status: LeadStatus
  buyer: { fullName: string; email: string; phone: string }
  simulation: {
    propertyPrice: number | null
    downPayment: number | null
    goodPayerBonus: number | null
    financedAmount: number | null
    termInMonths: number | null
    monthlyInstallment: number | null
    tcea: number | null
  }
  history: LeadHistoryEntry[]
}

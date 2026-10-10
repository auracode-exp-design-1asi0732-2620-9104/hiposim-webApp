import type { LeadDetail, LeadHistoryEntry, LeadStatus, LeadSummary } from './leads.types'

/**
 * Shapes returned by hiposim-backEnd (src/HipoSim.Api/Leads/LeadContracts.cs, branch develop).
 * Keep this file in sync with that contract: it is the only place that knows it.
 */
export interface ApiLeadInbox {
  id: string
  buyerId: string
  buyerName: string
  buyerEmail: string
  simulationId: string
  /** Sent since the API added the simulation figures to the inbox; absent in older deployments. */
  propertyPrice?: number | null
  monthlyInstallment: number | null
  tcea: number | null
  status: string
  createdAt: string
}

export interface ApiLeadNote {
  id: string
  authorId: string
  content: string
  createdAt: string
}

export interface ApiLeadStatusChange {
  id: string
  changedBy: string
  previousStatus: string
  newStatus: string
  changedAt: string
}

export interface ApiLeadDetail {
  id: string
  buyerId: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  agencyId: string
  simulationId: string
  propertyPrice: number | null
  downPayment: number | null
  /** The three fields below are absent in older deployments of the API. */
  goodPayerBonus?: number | null
  financedAmount?: number | null
  termInMonths?: number | null
  monthlyInstallment: number | null
  tcea: number | null
  status: string
  consentGrantedAt: string
  createdAt: string
  notes: ApiLeadNote[]
  statusHistory: ApiLeadStatusChange[]
}

// The API names the statuses in PascalCase and calls "contacted" InContact.
const fromApi: Record<string, LeadStatus> = {
  New: 'new',
  InContact: 'contacted',
  AppointmentScheduled: 'appointmentScheduled',
  Closed: 'closed',
  Discarded: 'discarded',
}

const toApi: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'InContact',
  appointmentScheduled: 'AppointmentScheduled',
  closed: 'Closed',
  discarded: 'Discarded',
}

export const statusToApi = (status: LeadStatus) => toApi[status]
export const statusFromApi = (status: string): LeadStatus => fromApi[status] ?? 'new'

export function inboxItemFromApi(dto: ApiLeadInbox): LeadSummary {
  return {
    id: dto.id,
    buyerName: dto.buyerName,
    propertyPrice: dto.propertyPrice ?? null,
    monthlyInstallment: dto.monthlyInstallment,
    tcea: dto.tcea,
    status: statusFromApi(dto.status),
    receivedAtUtc: dto.createdAt,
  }
}

export function noteFromApi(dto: ApiLeadNote): LeadHistoryEntry {
  return { type: 'note', text: dto.content, authorId: dto.authorId, atUtc: dto.createdAt }
}

export function detailFromApi(dto: ApiLeadDetail): LeadDetail {
  // The API has no "received" record in the history, so it is added from the creation date.
  const received: LeadHistoryEntry = { type: 'status', text: 'new', authorId: null, atUtc: dto.createdAt }
  const changes: LeadHistoryEntry[] = dto.statusHistory.map((change) => ({
    type: 'status',
    text: statusFromApi(change.newStatus),
    authorId: change.changedBy,
    atUtc: change.changedAt,
  }))
  const history = [received, ...changes, ...dto.notes.map(noteFromApi)].sort((a, b) =>
    a.atUtc.localeCompare(b.atUtc),
  )

  return {
    id: dto.id,
    status: statusFromApi(dto.status),
    buyer: { fullName: dto.buyerName, email: dto.buyerEmail, phone: dto.buyerPhone },
    simulation: {
      propertyPrice: dto.propertyPrice,
      downPayment: dto.downPayment,
      goodPayerBonus: dto.goodPayerBonus ?? null,
      financedAmount: dto.financedAmount ?? null,
      termInMonths: dto.termInMonths ?? null,
      monthlyInstallment: dto.monthlyInstallment,
      tcea: dto.tcea,
    },
    history,
  }
}

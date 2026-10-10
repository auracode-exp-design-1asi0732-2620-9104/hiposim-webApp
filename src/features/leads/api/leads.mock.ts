import { ApiError } from '@/shared/api/http'
import type { LeadDetail, LeadHistoryEntry, LeadStatus, LeadSummary } from './leads.types'

// Sample data for VITE_USE_MOCK=true. Same shape as the proposed API, so switching is a one-line change.
const delay = () => new Promise((resolve) => setTimeout(resolve, 250))

const advisor = 'Asesor de prueba'
// Same id as the sample login (auth.api.ts), so the card shows "You" for these entries.
const advisorId = '00000000-0000-0000-0000-000000000001'

const leads: LeadDetail[] = [
  {
    id: 'a1',
    status: 'new',
    buyer: { fullName: 'Ana Torres', email: 'ana.torres@example.com', phone: '987654321' },
    simulation: {
      propertyPrice: 280000, downPayment: 42000, goodPayerBonus: 18200, financedAmount: 219800,
      termInMonths: 240, monthlyInstallment: 1909, tcea: 0.0885,
    },
    history: [{ type: 'status', text: 'new', authorId: null, authorName: 'Sistema', atUtc: '2026-10-08T15:20:00Z' }],
  },
  {
    id: 'a2',
    status: 'contacted',
    buyer: { fullName: 'Luis Ramos', email: 'luis.ramos@example.com', phone: '912345678' },
    simulation: {
      propertyPrice: 320000, downPayment: 64000, goodPayerBonus: 0, financedAmount: 256000,
      termInMonths: 300, monthlyInstallment: 2105, tcea: 0.0912,
    },
    history: [
      { type: 'status', text: 'new', authorId: null, authorName: 'Sistema', atUtc: '2026-10-07T12:00:00Z' },
      { type: 'status', text: 'contacted', authorId: advisorId, authorName: advisor, atUtc: '2026-10-07T16:30:00Z' },
      { type: 'note', text: 'Pidio ver el proyecto el sabado.', authorId: advisorId, authorName: advisor, atUtc: '2026-10-07T16:32:00Z' },
    ],
  },
  {
    id: 'a3',
    status: 'appointmentScheduled',
    buyer: { fullName: 'Marta Quispe', email: 'marta.quispe@example.com', phone: '955123456' },
    simulation: {
      propertyPrice: 250000, downPayment: 37500, goodPayerBonus: 18200, financedAmount: 194300,
      termInMonths: 240, monthlyInstallment: 1688, tcea: 0.0871,
    },
    history: [
      { type: 'status', text: 'new', authorId: null, authorName: 'Sistema', atUtc: '2026-10-05T09:00:00Z' },
      { type: 'status', text: 'appointmentScheduled', authorId: advisorId, authorName: advisor, atUtc: '2026-10-06T10:00:00Z' },
    ],
  },
  {
    id: 'a4',
    status: 'discarded',
    buyer: { fullName: 'Pedro Salas', email: 'pedro.salas@example.com', phone: '944000111' },
    simulation: {
      propertyPrice: 450000, downPayment: 45000, goodPayerBonus: 0, financedAmount: 405000,
      termInMonths: 360, monthlyInstallment: 3120, tcea: 0.0954,
    },
    history: [
      { type: 'status', text: 'new', authorId: null, authorName: 'Sistema', atUtc: '2026-10-04T08:00:00Z' },
      { type: 'status', text: 'discarded', authorId: advisorId, authorName: advisor, atUtc: '2026-10-05T09:00:00Z' },
    ],
  },
]

const toSummary = (lead: LeadDetail): LeadSummary => ({
  id: lead.id,
  buyerName: lead.buyer.fullName,
  propertyPrice: lead.simulation.propertyPrice,
  monthlyInstallment: lead.simulation.monthlyInstallment,
  tcea: lead.simulation.tcea,
  status: lead.status,
  receivedAtUtc: lead.history[0]?.atUtc ?? new Date().toISOString(),
})

function find(id: string) {
  const lead = leads.find((l) => l.id === id)
  if (!lead) throw new ApiError(404, 'Lead not found.')
  return lead
}

export const leadsMock = {
  async list(status?: LeadStatus) {
    await delay()
    return leads.filter((l) => !status || l.status === status).map(toSummary)
  },
  async get(id: string) {
    await delay()
    return structuredClone(find(id))
  },
  async changeStatus(id: string, status: LeadStatus) {
    await delay()
    const lead = find(id)
    lead.status = status
    lead.history.push({ type: 'status', text: status, authorId: advisorId, authorName: advisor, atUtc: new Date().toISOString() })
    return { id, status }
  },
  async addNote(id: string, text: string): Promise<LeadHistoryEntry> {
    await delay()
    const entry: LeadHistoryEntry = { type: 'note', text, authorId: advisorId, authorName: advisor, atUtc: new Date().toISOString() }
    find(id).history.push(entry)
    return entry
  },
}

import { describe, expect, it } from 'vitest'
import {
  detailFromApi,
  inboxItemFromApi,
  noteFromApi,
  statusFromApi,
  statusToApi,
  type ApiLeadDetail,
  type ApiLeadInbox,
} from './leads.mapper'
import { leadStatuses } from './leads.types'

const inbox: ApiLeadInbox = {
  id: 'lead-1',
  buyerId: 'buyer-1',
  buyerName: 'Ana Torres',
  buyerEmail: 'ana@example.com',
  simulationId: 'sim-1',
  monthlyInstallment: 1863.99,
  tcea: 0.0885,
  status: 'InContact',
  createdAt: '2026-10-10T05:00:00Z',
}

const detail: ApiLeadDetail = {
  id: 'lead-1',
  buyerId: 'buyer-1',
  buyerName: 'Ana Torres',
  buyerEmail: 'ana@example.com',
  buyerPhone: '987654321',
  agencyId: 'agency-1',
  simulationId: 'sim-1',
  propertyPrice: 280000,
  downPayment: 42000,
  monthlyInstallment: 1863.99,
  tcea: 0.0885,
  status: 'AppointmentScheduled',
  consentGrantedAt: '2026-10-10T05:00:00Z',
  createdAt: '2026-10-10T05:00:00Z',
  // The API sends the newest first.
  notes: [{ id: 'n1', authorId: 'adv-1', content: 'Llamar el lunes', createdAt: '2026-10-10T07:00:00Z' }],
  statusHistory: [
    { id: 'h2', changedBy: 'adv-1', previousStatus: 'InContact', newStatus: 'AppointmentScheduled', changedAt: '2026-10-10T08:00:00Z' },
    { id: 'h1', changedBy: 'adv-1', previousStatus: 'New', newStatus: 'InContact', changedAt: '2026-10-10T06:00:00Z' },
  ],
}

describe('lead contract mapper', () => {
  it('translates every status in both directions', () => {
    for (const status of leadStatuses) {
      expect(statusFromApi(statusToApi(status))).toBe(status)
    }
    expect(statusToApi('contacted')).toBe('InContact')
    expect(statusFromApi('InContact')).toBe('contacted')
  })

  it('falls back to "new" for a status it does not know', () => {
    expect(statusFromApi('SomethingElse')).toBe('new')
  })

  it('maps an inbox item and leaves the property value empty (the API does not send it)', () => {
    expect(inboxItemFromApi(inbox)).toEqual({
      id: 'lead-1',
      buyerName: 'Ana Torres',
      propertyPrice: null,
      monthlyInstallment: 1863.99,
      tcea: 0.0885,
      status: 'contacted',
      receivedAtUtc: '2026-10-10T05:00:00Z',
    })
  })

  it('keeps an empty installment and TCEA as null', () => {
    const item = inboxItemFromApi({ ...inbox, monthlyInstallment: null, tcea: null })
    expect(item.monthlyInstallment).toBeNull()
    expect(item.tcea).toBeNull()
  })

  it('maps the lead card: contact data, simulation and a single chronological history', () => {
    const lead = detailFromApi(detail)

    expect(lead.status).toBe('appointmentScheduled')
    expect(lead.buyer).toEqual({ fullName: 'Ana Torres', email: 'ana@example.com', phone: '987654321' })
    expect(lead.simulation).toMatchObject({ propertyPrice: 280000, downPayment: 42000, tcea: 0.0885 })
    expect(lead.simulation.financedAmount).toBeNull() // not in the API yet

    // Received, then the two changes and the note, oldest first.
    expect(lead.history.map((entry) => [entry.type, entry.text])).toEqual([
      ['status', 'new'],
      ['status', 'contacted'],
      ['note', 'Llamar el lunes'],
      ['status', 'appointmentScheduled'],
    ])
    expect(lead.history[0]?.authorId).toBeNull()
    expect(lead.history[1]?.authorId).toBe('adv-1')
  })

  it('maps a note created through the API', () => {
    expect(noteFromApi({ id: 'n2', authorId: 'adv-2', content: 'Visita agendada', createdAt: '2026-10-10T09:00:00Z' })).toEqual({
      type: 'note',
      text: 'Visita agendada',
      authorId: 'adv-2',
      atUtc: '2026-10-10T09:00:00Z',
    })
  })
})

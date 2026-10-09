import { describe, expect, it } from 'vitest'
import { ApiError, getStatus } from '@/shared/api/http'
import { leadsApi } from './leads.api'
import { leadStatuses } from './leads.types'

// The api module runs in sample-data mode in tests (VITE_USE_MOCK=true in vite.config.ts).
describe('leads api (sample data)', () => {
  it('lists every lead when no status is given', async () => {
    const leads = await leadsApi.list()
    expect(leads.length).toBeGreaterThan(0)
  })

  it('filters by status (US23 scenario 2)', async () => {
    const leads = await leadsApi.list('discarded')
    expect(leads.length).toBeGreaterThan(0)
    expect(leads.every((lead) => lead.status === 'discarded')).toBe(true)
  })

  it('returns the lead card with the shared simulation (US24)', async () => {
    const lead = await leadsApi.get('a1')
    expect(lead.buyer.email).toBeTruthy()
    expect(lead.simulation).toMatchObject({
      propertyPrice: expect.any(Number),
      downPayment: expect.any(Number),
      goodPayerBonus: expect.any(Number),
      financedAmount: expect.any(Number),
      termInMonths: expect.any(Number),
      monthlyInstallment: expect.any(Number),
      tcea: expect.any(Number),
    })
  })

  it('answers 404 for an unknown lead', async () => {
    const error = await leadsApi.get('does-not-exist').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(getStatus(error)).toBe(404)
  })

  it('records a status change in the history with its author and date (US25 scenario 1)', async () => {
    const before = (await leadsApi.get('a1')).history.length
    await leadsApi.changeStatus('a1', 'contacted')
    const after = await leadsApi.get('a1')
    expect(after.status).toBe('contacted')
    expect(after.history).toHaveLength(before + 1)
    const last = after.history.at(-1)
    expect(last).toMatchObject({ type: 'status', text: 'contacted' })
    expect(last?.authorName).toBeTruthy()
    expect(last?.atUtc).toBeTruthy()
  })

  it('adds a follow-up note with its author and date (US25 scenario 2)', async () => {
    await leadsApi.addNote('a2', 'Called, asked for the brochure.')
    const lead = await leadsApi.get('a2')
    expect(lead.history.at(-1)).toMatchObject({ type: 'note', text: 'Called, asked for the brochure.' })
  })

  it('knows the five statuses of US25', () => {
    expect(leadStatuses).toEqual(['new', 'contacted', 'appointmentScheduled', 'closed', 'discarded'])
  })
})

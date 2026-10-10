import { describe, expect, it } from 'vitest'
import type { LeadSummary } from '@/features/leads/api/leads.types'
import { buildLeadsCsv, type CsvLabels } from './leads.csv'

const labels: CsvLabels = {
  buyer: 'Buyer',
  propertyPrice: 'Property value (PEN)',
  installment: 'Monthly installment (PEN)',
  tcea: 'TCEA (%)',
  status: 'Status',
  received: 'Received',
}

const lead = (overrides: Partial<LeadSummary> = {}): LeadSummary => ({
  id: 'lead-1',
  buyerName: 'Ana Torres',
  propertyPrice: 280000,
  monthlyInstallment: 1908.88,
  tcea: 0.0885,
  status: 'contacted',
  receivedAtUtc: '2026-10-10T05:00:00Z',
  ...overrides,
})

const statusText = (status: LeadSummary['status']) => `[${status}]`

describe('leads CSV', () => {
  it('writes a header and one row per lead, with plain numbers and the rate as a percentage', () => {
    const csv = buildLeadsCsv([lead()], labels, statusText)

    expect(csv.split('\r\n')).toEqual([
      'Buyer,Property value (PEN),Monthly installment (PEN),TCEA (%),Status,Received',
      'Ana Torres,280000,1908.88,8.85,[contacted],2026-10-10T05:00:00Z',
    ])
  })

  it('leaves the cell empty for a value the API did not send', () => {
    const csv = buildLeadsCsv([lead({ propertyPrice: null, monthlyInstallment: null, tcea: null })], labels, statusText)

    expect(csv.split('\r\n')[1]).toBe('Ana Torres,,,,[contacted],2026-10-10T05:00:00Z')
  })

  it('quotes names with commas or quotes', () => {
    const csv = buildLeadsCsv([lead({ buyerName: 'Torres, Ana "Anita"' })], labels, statusText)

    expect(csv.split('\r\n')[1]).toMatch(/^"Torres, Ana ""Anita""",/)
  })

  it('does not let a name run as a spreadsheet formula', () => {
    const csv = buildLeadsCsv([lead({ buyerName: '=HYPERLINK("http://evil.test")' })], labels, statusText)

    expect(csv.split('\r\n')[1]).toMatch(/^"'=HYPERLINK/)
  })

  it('writes only the header when there are no leads', () => {
    expect(buildLeadsCsv([], labels, statusText).split('\r\n')).toHaveLength(1)
  })
})

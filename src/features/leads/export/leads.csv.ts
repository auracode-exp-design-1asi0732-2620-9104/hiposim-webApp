import type { LeadSummary } from '@/features/leads/api/leads.types'

export interface CsvLabels {
  buyer: string
  propertyPrice: string
  installment: string
  tcea: string
  status: string
  received: string
}

/** Text the user did not write must not become a spreadsheet formula (CSV injection). */
function safeText(value: string) {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}

function cell(value: string) {
  const text = safeText(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const optional = (value: number | null, digits: number) => (value === null ? '' : value.toFixed(digits))

/**
 * One row per lead, as the inbox shows them. Amounts are plain numbers in soles and the rate is a percentage, so a
 * spreadsheet can sum and sort them. The status is written with the label of the current interface language.
 */
export function buildLeadsCsv(
  leads: LeadSummary[],
  labels: CsvLabels,
  statusText: (status: LeadSummary['status']) => string,
) {
  const header = [labels.buyer, labels.propertyPrice, labels.installment, labels.tcea, labels.status, labels.received]
  const rows = leads.map((lead) => [
    lead.buyerName,
    optional(lead.propertyPrice, 0),
    optional(lead.monthlyInstallment, 2),
    optional(lead.tcea === null ? null : lead.tcea * 100, 2),
    statusText(lead.status),
    lead.receivedAtUtc,
  ])
  return [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')
}

/** Downloads the text as a UTF-8 file. The BOM makes Excel show accents correctly. */
export function downloadCsv(fileName: string, content: string) {
  const blob = new Blob(['﻿', content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

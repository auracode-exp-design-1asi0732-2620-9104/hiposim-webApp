import { http } from '@/shared/api/http'
import { useMockApi } from '@/shared/api/config'
import { leadsMock } from './leads.mock'
import type { LeadDetail, LeadHistoryEntry, LeadStatus, LeadSummary } from './leads.types'

/**
 * Advisor endpoints (TS08, proposed contract):
 *  GET   /api/leads?status=       US23, only the advisor's agency
 *  GET   /api/leads/{id}          US24, 403 when the lead belongs to another agency
 *  PATCH /api/leads/{id}/status   US25
 *  POST  /api/leads/{id}/notes    US25
 */
export const leadsApi = {
  async list(status?: LeadStatus): Promise<LeadSummary[]> {
    if (useMockApi) return leadsMock.list(status)
    const { data } = await http.get<LeadSummary[]>('/api/leads', { params: status ? { status } : undefined })
    return data
  },

  async get(id: string): Promise<LeadDetail> {
    if (useMockApi) return leadsMock.get(id)
    const { data } = await http.get<LeadDetail>(`/api/leads/${encodeURIComponent(id)}`)
    return data
  },

  async changeStatus(id: string, status: LeadStatus): Promise<{ id: string; status: LeadStatus }> {
    if (useMockApi) return leadsMock.changeStatus(id, status)
    const { data } = await http.patch<{ id: string; status: LeadStatus }>(
      `/api/leads/${encodeURIComponent(id)}/status`,
      { status },
    )
    return data
  },

  async addNote(id: string, text: string): Promise<LeadHistoryEntry> {
    if (useMockApi) return leadsMock.addNote(id, text)
    const { data } = await http.post<LeadHistoryEntry>(`/api/leads/${encodeURIComponent(id)}/notes`, { text })
    return data
  },
}

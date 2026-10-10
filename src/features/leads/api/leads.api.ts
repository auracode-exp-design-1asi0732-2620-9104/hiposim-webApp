import { http } from '@/shared/api/http'
import { useMockApi } from '@/shared/api/config'
import { leadsMock } from './leads.mock'
import {
  detailFromApi,
  inboxItemFromApi,
  noteFromApi,
  statusFromApi,
  statusToApi,
  type ApiLeadDetail,
  type ApiLeadInbox,
  type ApiLeadNote,
} from './leads.mapper'
import type { LeadDetail, LeadHistoryEntry, LeadStatus, LeadSummary } from './leads.types'

/**
 * Advisor endpoints of hiposim-backEnd (TS08, branch develop):
 *  GET   /api/leads?status=       inbox of the advisor's agency (US23)
 *  GET   /api/leads/{id}          lead card, 404 when it belongs to another agency (US24)
 *  PATCH /api/leads/{id}/status   body { status }  (US25)
 *  POST  /api/leads/{id}/notes    body { content } (US25)
 */
export const leadsApi = {
  async list(status?: LeadStatus): Promise<LeadSummary[]> {
    if (useMockApi) return leadsMock.list(status)
    const { data } = await http.get<ApiLeadInbox[]>('/api/leads', {
      params: status ? { status: statusToApi(status) } : undefined,
    })
    return data.map(inboxItemFromApi)
  },

  async get(id: string): Promise<LeadDetail> {
    if (useMockApi) return leadsMock.get(id)
    const { data } = await http.get<ApiLeadDetail>(`/api/leads/${encodeURIComponent(id)}`)
    return detailFromApi(data)
  },

  async changeStatus(id: string, status: LeadStatus): Promise<{ id: string; status: LeadStatus }> {
    if (useMockApi) return leadsMock.changeStatus(id, status)
    const { data } = await http.patch<{ id: string; status: string }>(
      `/api/leads/${encodeURIComponent(id)}/status`,
      { status: statusToApi(status) },
    )
    return { id: data.id, status: statusFromApi(data.status) }
  },

  async addNote(id: string, text: string): Promise<LeadHistoryEntry> {
    if (useMockApi) return leadsMock.addNote(id, text)
    const { data } = await http.post<ApiLeadNote>(`/api/leads/${encodeURIComponent(id)}/notes`, {
      content: text,
    })
    return noteFromApi(data)
  },
}

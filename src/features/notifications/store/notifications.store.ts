import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { leadsApi } from '@/features/leads/api/leads.api'
import type { LeadSummary } from '@/features/leads/api/leads.types'

/**
 * In-app notifications: the leads that are still "new", so nobody has contacted them.
 * No extra endpoint is needed (GET /api/leads?status=new). The portal polls every minute because the API has no push.
 */
export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<LeadSummary[]>([])
  const isLoading = ref(false)
  const hasError = ref(false)
  const lastUpdated = ref<Date | null>(null)

  const count = computed(() => items.value.length)

  async function refresh() {
    isLoading.value = true
    hasError.value = false
    try {
      items.value = await leadsApi.list('new')
      lastUpdated.value = new Date()
    } catch {
      hasError.value = true
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    items.value = []
    lastUpdated.value = null
    hasError.value = false
  }

  return { items, isLoading, hasError, lastUpdated, count, refresh, reset }
})

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import { leadsApi } from '@/features/leads/api/leads.api'
import { leadStatuses, type LeadStatus, type LeadSummary } from '@/features/leads/api/leads.types'
import { statusLabel, statusSeverity } from '@/features/leads/api/leads.labels'
import { formatCurrency, formatInstallment, formatRate, formatDateTime } from '@/shared/format'

const router = useRouter()
const { t } = useI18n()

const leads = ref<LeadSummary[]>([])
const isLoading = ref(false)
const hasError = ref(false)
const statusFilter = ref<LeadStatus | 'all'>('all')

const statusOptions = computed(() => [
  { label: t('leads.allStatuses'), value: 'all' },
  ...leadStatuses.map((value) => ({ label: statusLabel(value), value })),
])

// Counters over what the API returned for the current filter (real data, no invented figures).
const counters = computed(() => ({
  total: leads.value.length,
  nuevos: leads.value.filter((l) => l.status === 'new').length,
  enSeguimiento: leads.value.filter((l) => l.status === 'contacted' || l.status === 'appointmentScheduled').length,
}))

async function loadLeads() {
  isLoading.value = true
  hasError.value = false
  try {
    leads.value = await leadsApi.list(statusFilter.value === 'all' ? undefined : statusFilter.value)
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

function goToDetail(id: string) {
  router.push({ name: 'lead-detail', params: { id } })
}

// The filter is applied by the API (US23 scenario 2), so it is requested again when it changes.
watch(statusFilter, loadLeads)
onMounted(loadLeads)
</script>

<template>
  <div class="leads">
    <nav class="breadcrumb" :aria-label="t('leads.breadcrumbLeads')">
      <span>{{ t('leads.breadcrumbPortal') }}</span> <i class="pi pi-angle-right" aria-hidden="true" />
      <strong>{{ t('leads.breadcrumbLeads') }}</strong>
    </nav>

    <div class="leads__header">
      <div>
        <h1>{{ t('leads.title') }}</h1>
        <p>{{ t('leads.intro') }}</p>
      </div>
      <Button :label="t('leads.refresh')" icon="pi pi-refresh" severity="secondary" outlined :loading="isLoading" @click="loadLeads" />
    </div>

    <div class="leads__kpis" role="group" :aria-label="t('leads.summary')">
      <div class="kpi-card">
        <span class="kpi-card__label">{{ t('leads.kpiTotal') }}</span>
        <strong class="kpi-card__value">{{ counters.total }}</strong>
      </div>
      <div class="kpi-card">
        <span class="kpi-card__label">{{ t('leads.kpiNew') }}</span>
        <strong class="kpi-card__value kpi-card__value--accent">{{ counters.nuevos }}</strong>
      </div>
      <div class="kpi-card">
        <span class="kpi-card__label">{{ t('leads.kpiFollowUp') }}</span>
        <strong class="kpi-card__value">{{ counters.enSeguimiento }}</strong>
      </div>
    </div>

    <div class="leads__table-card">
      <div class="leads__filters">
        <label for="status-filter" class="leads__filter-label">{{ t('leads.statusLabel') }}</label>
        <Select
          v-model="statusFilter"
          input-id="status-filter"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="leads__filter-select"
          :aria-label="t('leads.filterByStatus')"
        />
        <span class="leads__count" aria-live="polite">{{ t('leads.count', { count: counters.total }) }}</span>
      </div>

      <Message v-if="hasError" severity="error" :closable="false">
        {{ t('leads.loadError') }}
        <Button :label="t('leads.retry')" size="small" text @click="loadLeads" />
      </Message>

      <p v-else-if="isLoading" class="leads__state" role="status">{{ t('leads.loading') }}</p>

      <p v-else-if="leads.length === 0" class="leads__state">{{ t('leads.empty') }}</p>

      <table v-else class="leads__table">
        <caption class="sr-only">{{ t('leads.tableCaption') }}</caption>
        <thead>
          <tr>
            <th scope="col">{{ t('leads.colBuyer') }}</th>
            <th scope="col">{{ t('leads.colProperty') }}</th>
            <th scope="col">{{ t('leads.colInstallment') }}</th>
            <th scope="col">{{ t('leads.colTcea') }}</th>
            <th scope="col">{{ t('leads.colStatus') }}</th>
            <th scope="col">{{ t('leads.colReceived') }}</th>
            <th scope="col"><span class="sr-only">{{ t('leads.colActions') }}</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lead in leads" :key="lead.id">
            <td><strong>{{ lead.buyerName }}</strong></td>
            <td>{{ formatCurrency(lead.propertyPrice) }}</td>
            <td>{{ formatInstallment(lead.monthlyInstallment) }}{{ t('leads.perMonth') }}</td>
            <td>{{ formatRate(lead.tcea) }}</td>
            <td><Tag :value="statusLabel(lead.status)" :severity="statusSeverity[lead.status]" /></td>
            <td>{{ formatDateTime(lead.receivedAtUtc) }}</td>
            <td>
              <Button
                :label="t('leads.view')"
                size="small"
                :aria-label="t('leads.viewFor', { name: lead.buyerName })"
                @click="goToDetail(lead.id)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.leads {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--color-neutral);
}

.leads__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.leads__header h1 {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  color: var(--color-text);
}

.leads__header p {
  color: var(--color-neutral);
  max-width: 60ch;
}

.leads__kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-2);
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-2) var(--space-3);
  background: #fff;
  border: 1px solid #e3e9ea;
  border-radius: var(--radius-md);
}

.kpi-card__label {
  font-size: 0.85rem;
  color: var(--color-neutral);
}

.kpi-card__value {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  color: var(--color-text);
}

.kpi-card__value--accent {
  color: #a86a00; /* amber darkened to keep AA contrast on white */
}

.leads__table-card {
  background: #fff;
  border: 1px solid #e3e9ea;
  border-radius: var(--radius-md);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  overflow-x: auto;
  min-width: 0;
  position: relative; /* keeps the visually hidden header text inside the scroll area */
}

.leads__filters {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.leads__filter-label {
  font-weight: 500;
}

.leads__filter-select {
  min-width: 220px;
}

.leads__count {
  margin-left: auto;
  color: var(--color-neutral);
  font-size: 0.9rem;
}

.leads__state {
  padding: var(--space-4) 0;
  text-align: center;
  color: var(--color-neutral);
}

.leads__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

.leads__table th {
  text-align: left;
  padding: 10px 12px;
  color: var(--color-neutral);
  font-weight: 600;
  border-bottom: 2px solid #e3e9ea;
  white-space: nowrap;
}

.leads__table td {
  padding: 12px;
  border-bottom: 1px solid #eef1f2;
  vertical-align: middle;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

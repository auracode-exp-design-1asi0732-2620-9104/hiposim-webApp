<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { leadsApi } from '@/features/leads/api/leads.api'
import { leadStatuses, type LeadStatus, type LeadSummary } from '@/features/leads/api/leads.types'
import { statusLabel, statusSeverity } from '@/features/leads/api/leads.labels'
import { formatDateTime, formatInstallment } from '@/shared/format'

const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()

const leads = ref<LeadSummary[]>([])
const isLoading = ref(true)
const hasError = ref(false)

const RECENT_LIMIT = 5

const countOf = (status: LeadStatus) => leads.value.filter((lead) => lead.status === status).length

// Everything is counted from the list the inbox shows: real data, nothing invented.
const total = computed(() => leads.value.length)
const newCount = computed(() => countOf('new'))
const followUpCount = computed(() => countOf('contacted') + countOf('appointmentScheduled'))
const closedCount = computed(() => countOf('closed'))
const closingRate = computed(() => (total.value === 0 ? 0 : Math.round((closedCount.value / total.value) * 100)))

const byStatus = computed(() =>
  leadStatuses.map((status) => ({
    status,
    count: countOf(status),
    share: total.value === 0 ? 0 : Math.round((countOf(status) / total.value) * 100),
  })),
)

const recent = computed(() =>
  [...leads.value]
    .sort((a, b) => b.receivedAtUtc.localeCompare(a.receivedAtUtc))
    .slice(0, RECENT_LIMIT),
)

async function load() {
  isLoading.value = true
  hasError.value = false
  try {
    leads.value = await leadsApi.list()
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="dash">
    <div class="dash__header">
      <div>
        <h1>{{ t('dashboard.greeting', { name: auth.session?.fullName ?? '' }) }}</h1>
        <p>{{ t('dashboard.intro') }}</p>
      </div>
      <Button
        :label="t('dashboard.refresh')"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        :loading="isLoading"
        @click="load"
      />
    </div>

    <Message v-if="hasError" severity="error" :closable="false">
      {{ t('dashboard.loadError') }}
      <Button :label="t('dashboard.retry')" size="small" text @click="load" />
    </Message>

    <p v-else-if="isLoading && total === 0" class="dash__state" role="status">{{ t('dashboard.loading') }}</p>

    <template v-else>
      <ul class="dash__kpis" :aria-label="t('leads.summary')">
        <li class="kpi">
          <span>{{ t('dashboard.kpiTotal') }}</span>
          <strong>{{ total }}</strong>
        </li>
        <li class="kpi kpi--new">
          <span>{{ t('dashboard.kpiNew') }}</span>
          <strong>{{ newCount }}</strong>
        </li>
        <li class="kpi">
          <span>{{ t('dashboard.kpiFollowUp') }}</span>
          <strong>{{ followUpCount }}</strong>
        </li>
        <li class="kpi kpi--closed">
          <span>{{ t('dashboard.kpiClosed') }}</span>
          <strong>{{ closedCount }}</strong>
          <small>
            {{ t('dashboard.conversion') }}: {{ closingRate }}%
          </small>
        </li>
      </ul>

      <div class="dash__grid">
        <section class="card" aria-labelledby="dash-status">
          <h2 id="dash-status">{{ t('dashboard.byStatus') }}</h2>
          <ul class="bars">
            <li v-for="item in byStatus" :key="item.status">
              <div class="bars__row">
                <Tag :value="statusLabel(item.status)" :severity="statusSeverity[item.status]" />
                <strong>{{ item.count }}</strong>
              </div>
              <div
                class="bars__track"
                role="progressbar"
                :aria-label="statusLabel(item.status)"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-valuenow="item.share"
              >
                <div class="bars__fill" :style="{ width: `${item.share}%` }" />
              </div>
            </li>
          </ul>
          <p class="dash__help">{{ t('dashboard.conversionHelp', { closed: closedCount, total }) }}</p>
        </section>

        <section class="card" aria-labelledby="dash-recent">
          <h2 id="dash-recent">{{ t('dashboard.recent') }}</h2>
          <p v-if="recent.length === 0" class="dash__help">{{ t('dashboard.recentEmpty') }}</p>
          <ul v-else class="recent">
            <li v-for="lead in recent" :key="lead.id">
              <div class="recent__body">
                <strong>{{ lead.buyerName }}</strong>
                <span>
                  {{ lead.monthlyInstallment === null ? t('leads.notAvailable') : formatInstallment(lead.monthlyInstallment) }}{{ t('leads.perMonth') }}
                  · {{ formatDateTime(lead.receivedAtUtc) }}
                </span>
              </div>
              <Tag :value="statusLabel(lead.status)" :severity="statusSeverity[lead.status]" />
              <Button
                :label="t('dashboard.view')"
                size="small"
                text
                :aria-label="t('dashboard.viewFor', { name: lead.buyerName })"
                @click="router.push({ name: 'lead-detail', params: { id: lead.id } })"
              />
            </li>
          </ul>
          <Button
            :label="t('dashboard.viewAll')"
            icon="pi pi-arrow-right"
            icon-pos="right"
            severity="secondary"
            outlined
            @click="router.push({ name: 'leads' })"
          />
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dash {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
}

.dash__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.dash__header h1 {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  color: var(--color-text);
}

.dash__header p,
.dash__state,
.dash__help {
  color: var(--color-neutral);
}

.dash__state {
  padding: var(--space-4) 0;
  text-align: center;
}

.dash__kpis {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: var(--space-2);
}

.kpi {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-2) var(--space-3);
  background: #fff;
  border: 1px solid #e3e9ea;
  border-top: 4px solid var(--color-primary);
  border-radius: var(--radius-md);
}

.kpi--new {
  border-top-color: var(--color-accent);
}

.kpi--closed {
  border-top-color: #2e9e6b;
}

.kpi span,
.kpi small {
  color: var(--color-neutral);
}

.kpi strong {
  font-family: var(--font-heading);
  font-size: 2rem;
  color: var(--color-text);
}

.dash__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-3);
}

.card {
  background: #fff;
  border: 1px solid #e3e9ea;
  border-radius: var(--radius-md);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.card h2 {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  color: var(--color-text);
}

.bars,
.recent {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.bars__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.bars__track {
  height: 8px;
  background: var(--color-bg-alt);
  border-radius: 999px;
  overflow: hidden;
}

.bars__fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
}

.recent li {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-wrap: wrap;
  padding-bottom: var(--space-1);
  border-bottom: 1px solid #eef1f2;
}

.recent__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 160px;
}

.recent__body span {
  color: var(--color-neutral);
  font-size: 0.9rem;
}
</style>

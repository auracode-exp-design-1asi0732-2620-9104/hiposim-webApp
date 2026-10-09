<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { leadsApi } from '@/features/leads/api/leads.api'
import { leadStatuses, type LeadStatus, type LeadSummary } from '@/features/leads/api/leads.types'
import { statusLabel, statusSeverity } from '@/features/leads/api/leads.labels'

const { t } = useI18n()
const auth = useAuthStore()

const leads = ref<LeadSummary[]>([])
const isLoading = ref(true)
const hasError = ref(false)

// Counted from the same list the inbox shows: real data, nothing invented.
const countsByStatus = computed(() =>
  leadStatuses.map((status: LeadStatus) => ({
    status,
    count: leads.value.filter((lead) => lead.status === status).length,
  })),
)

onMounted(async () => {
  try {
    leads.value = await leadsApi.list()
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="agency">
    <div>
      <h1>{{ t('agency.title') }}</h1>
      <p class="agency__intro">{{ t('agency.intro') }}</p>
    </div>

    <div class="agency__grid">
      <section class="card" aria-labelledby="agency-title">
        <h2 id="agency-title">{{ t('agency.agencyTitle') }}</h2>
        <dl>
          <div><dt>{{ t('agency.agencyName') }}</dt><dd>{{ auth.session?.companyName || t('agency.noName') }}</dd></div>
        </dl>
      </section>

      <section class="card" aria-labelledby="advisor-title">
        <h2 id="advisor-title">{{ t('agency.advisorTitle') }}</h2>
        <dl>
          <div><dt>{{ t('agency.advisorName') }}</dt><dd>{{ auth.session?.fullName }}</dd></div>
          <div><dt>{{ t('agency.advisorEmail') }}</dt><dd>{{ auth.session?.email }}</dd></div>
        </dl>
      </section>

      <section class="card card--wide" aria-labelledby="leads-title">
        <h2 id="leads-title">{{ t('agency.leadsTitle') }}</h2>
        <Message v-if="hasError" severity="error" :closable="false">{{ t('agency.loadError') }}</Message>
        <p v-else-if="isLoading" role="status" class="agency__state">{{ t('agency.loading') }}</p>
        <template v-else>
          <p class="agency__total">
            <span>{{ t('agency.leadsTotal') }}</span> <strong>{{ leads.length }}</strong>
          </p>
          <ul class="agency__counts">
            <li v-for="item in countsByStatus" :key="item.status">
              <Tag :value="statusLabel(item.status)" :severity="statusSeverity[item.status]" />
              <strong>{{ item.count }}</strong>
            </li>
          </ul>
        </template>
      </section>
    </div>

    <p class="agency__managed">{{ t('agency.managed') }}</p>
  </div>
</template>

<style scoped>
.agency {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
}

.agency h1 {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  color: var(--color-text);
}

.agency__intro,
.agency__managed,
.agency__state {
  color: var(--color-neutral);
}

.agency__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
}

.card--wide {
  grid-column: 1 / -1;
}

.card h2 {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  color: var(--color-text);
}

dl {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
}

dl > div {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
  border-bottom: 1px solid #eef1f2;
  padding-bottom: 8px;
}

dt {
  color: var(--color-neutral);
}

dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
  overflow-wrap: anywhere;
}

.agency__total {
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
}

.agency__counts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: var(--space-1);
}

.agency__counts li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-1);
  padding: 10px 14px;
  background: var(--color-bg-alt);
  border-radius: var(--radius-md);
}
</style>

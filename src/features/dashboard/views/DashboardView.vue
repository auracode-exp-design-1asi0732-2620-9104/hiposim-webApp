<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'primevue/chart'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useAuthStore } from '@/features/auth/store/auth.store'
import {
  mockLeads,
  getRecentActivity,
  getWeeklyLeadCounts,
  statusLabels,
  statusSeverity,
  formatCurrency,
  formatDate,
} from '@/features/leads/data/mock-leads'

const router = useRouter()
const auth = useAuthStore()

const kpis = computed(() => {
  const nuevos = mockLeads.filter((l) => l.status === 'nuevo').length
  const cerrados = mockLeads.filter((l) => l.status === 'cerrado').length
  const totalPropiedades = mockLeads.reduce((sum, l) => sum + l.matchedProperties.length, 0)
  const conversion = Math.round((cerrados / mockLeads.length) * 100)

  return { nuevos, cerrados, totalPropiedades, conversion }
})

const recentActivity = computed(() => getRecentActivity(5))

const weekly = getWeeklyLeadCounts()

const chartData = ref({
  labels: weekly.labels,
  datasets: [
    {
      label: 'Leads recibidos',
      data: weekly.values,
      backgroundColor: '#3AAFA9',
      borderRadius: 6,
    },
  ],
})

const chartOptions = ref({
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#64748b' } },
    y: { grid: { color: 'rgba(15, 32, 30, 0.08)' }, ticks: { color: '#64748b' }, beginAtZero: true },
  },
})

function goToLead(id: string) {
  router.push({ name: 'lead-detail', params: { id } })
}
</script>

<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <h1>Hola, {{ auth.session?.companyName ?? 'Inmobiliaria' }} 👋</h1>
      <p>Este es el resumen de tu actividad en HipoSim esta semana.</p>
    </div>

    <div class="dashboard__kpis">
      <div class="kpi-card">
        <span class="kpi-card__label">Leads Nuevos</span>
        <strong class="kpi-card__value kpi-card__value--accent">{{ kpis.nuevos }}</strong>
        <span class="kpi-card__hint">Esta semana</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-card__label">Tasa de Cierre</span>
        <strong class="kpi-card__value">{{ kpis.conversion }}%</strong>
        <span class="kpi-card__hint">Leads cerrados / total</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-card__label">Propiedades con Match</span>
        <strong class="kpi-card__value">{{ kpis.totalPropiedades }}</strong>
        <span class="kpi-card__hint">Sugeridas a prospectos</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-card__label">Leads Cerrados</span>
        <strong class="kpi-card__value">{{ kpis.cerrados }}</strong>
        <span class="kpi-card__hint">Total histórico (demo)</span>
      </div>
    </div>

    <div class="dashboard__grid">
      <section class="card">
        <div class="card__header">
          <h2>Leads recibidos por semana</h2>
        </div>
        <Chart type="bar" :data="chartData" :options="chartOptions" class="dashboard__chart" />
      </section>

      <section class="card">
        <div class="card__header">
          <h2>Actividad reciente</h2>
        </div>
        <ul class="activity-feed">
          <li v-for="item in recentActivity" :key="item.id" @click="goToLead(item.leadId)">
            <div class="activity-feed__dot" />
            <div>
              <strong>{{ item.leadName }}</strong>
              <p>{{ item.description }}</p>
              <span>{{ formatDate(item.date) }}</span>
            </div>
          </li>
        </ul>
      </section>

      <section class="card card--wide">
        <div class="card__header">
          <h2>Leads que necesitan seguimiento</h2>
          <Button label="Ver bandeja completa" text size="small" @click="router.push({ name: 'leads' })" />
        </div>
        <ul class="follow-up-list">
          <li v-for="lead in mockLeads.filter((l) => l.status !== 'cerrado').slice(0, 4)" :key="lead.id">
            <div>
              <strong>{{ lead.name }}</strong>
              <span>{{ formatCurrency(lead.simulation.propertyPrice) }} · TCEA {{ lead.simulation.tcea }}%</span>
            </div>
            <div class="follow-up-list__actions">
              <Tag :value="statusLabels[lead.status]" :severity="statusSeverity[lead.status]" />
              <Button label="Ver" size="small" text @click="goToLead(lead.id)" />
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  color: var(--panel-text);
}

.dashboard__header h1 {
  font-size: 1.4rem;
  color: var(--panel-text);
}

.dashboard__header p {
  margin-top: 4px;
  color: var(--panel-text-muted);
  font-size: 0.9rem;
}

.dashboard__kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2);
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
}

.kpi-card__label {
  font-size: 0.8rem;
  color: var(--panel-text-muted);
}

.kpi-card__value {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  color: var(--panel-text);
}

.kpi-card__value--accent {
  color: var(--color-accent);
}

.kpi-card__hint {
  font-size: 0.75rem;
  color: var(--panel-text-muted);
}

.dashboard__grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: var(--space-2);
}

.card {
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
}

.card--wide {
  grid-column: 1 / -1;
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.card__header h2 {
  font-size: 1rem;
  color: var(--panel-text);
}

.dashboard__chart {
  height: 220px;
}

.activity-feed {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 260px;
  overflow-y: auto;
}

.activity-feed li {
  display: flex;
  gap: 10px;
  cursor: pointer;
}

.activity-feed__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-secondary);
  margin-top: 6px;
  flex-shrink: 0;
}

.activity-feed strong {
  display: block;
  color: var(--panel-text);
  font-size: 0.85rem;
}

.activity-feed p {
  color: var(--panel-text-muted);
  font-size: 0.82rem;
  margin: 2px 0;
}

.activity-feed span {
  color: var(--panel-text-muted);
  font-size: 0.72rem;
}

.follow-up-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.follow-up-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--panel-border);
  font-size: 0.85rem;
}

.follow-up-list li:last-child {
  border-bottom: none;
}

.follow-up-list strong {
  display: block;
  color: var(--panel-text);
}

.follow-up-list span {
  color: var(--panel-text-muted);
  font-size: 0.78rem;
}

.follow-up-list__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import ToggleButton from 'primevue/togglebutton'
import Tag from 'primevue/tag'
import {
  mockLeads,
  statusLabels,
  statusSeverity,
  formatCurrency,
  formatRelativeTime,
  type LeadStatus,
} from '@/features/leads/data/mock-leads'

const router = useRouter()

const search = ref('')
const statusFilter = ref<LeadStatus | 'todos'>('todos')
const bbpOnly = ref(false)
const showNotification = ref(true)

const statusOptions = [
  { label: `Todos los estados (${mockLeads.length})`, value: 'todos' },
  ...(Object.entries(statusLabels) as [LeadStatus, string][]).map(([value, label]) => ({
    label,
    value,
  })),
]

const districtOptions = [{ label: 'Distrito: Jesús María (Sede)', value: 'jesus-maria' }]
const districtFilter = ref('jesus-maria')

const filteredLeads = computed(() => {
  return mockLeads.filter((lead) => {
    const matchesSearch =
      !search.value.trim() ||
      lead.name.toLowerCase().includes(search.value.toLowerCase()) ||
      lead.dni.includes(search.value)
    const matchesStatus = statusFilter.value === 'todos' || lead.status === statusFilter.value
    const matchesBbp = !bbpOnly.value || lead.simulation.bbpApplied
    return matchesSearch && matchesStatus && matchesBbp
  })
})

const kpis = computed(() => {
  const nuevos = mockLeads.filter((l) => l.status === 'nuevo').length
  const enContacto = mockLeads.filter((l) => l.status === 'contactado' || l.status === 'cita').length
  const califican = mockLeads.filter((l) => l.simulation.bbpApplied).length
  const maxBbp = Math.max(...mockLeads.map((l) => l.simulation.bbpAmount ?? 0))
  const pipeline = mockLeads.reduce((sum, l) => sum + l.simulation.propertyPrice, 0)

  return { nuevos, enContacto, califican, maxBbp, pipeline }
})

function goToDetail(id: string) {
  router.push({ name: 'lead-detail', params: { id } })
}
</script>

<template>
  <div class="leads">
    <nav class="breadcrumb">
      <span>Portal Inmobiliarias</span> <i class="pi pi-angle-right" />
      <span>Gestión de Prospectos</span> <i class="pi pi-angle-right" />
      <strong>Leads Calificados HipoSim</strong>
    </nav>

    <div class="leads__header">
      <div>
        <h1>Bandeja de Leads e Interesados Calificados</h1>
        <p>
          Prospectos de compradores que han completado su simulación en HipoSim y seleccionaron
          compartir su perfil crediticio.
        </p>
      </div>
      <div class="leads__header-actions">
        <Button label="Actualizar datos" icon="pi pi-refresh" severity="secondary" outlined />
        <Button label="Exportar Excel / CSV" icon="pi pi-download" class="leads__export" />
      </div>
    </div>

    <div class="leads__kpis">
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--warn"><i class="pi pi-bell" /></div>
        <span class="kpi-card__label">Nuevos Sin Atender</span>
        <strong class="kpi-card__value kpi-card__value--accent">{{ kpis.nuevos }}</strong>
        <span class="kpi-card__hint kpi-card__hint--up"><i class="pi pi-arrow-up" /> +3 en la última hora</span>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--info"><i class="pi pi-phone" /></div>
        <span class="kpi-card__label">En Contacto / Cita</span>
        <strong class="kpi-card__value">{{ kpis.enContacto }}</strong>
        <span class="kpi-card__hint">Ratio de contacto: 91%</span>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--success"><i class="pi pi-verified" /></div>
        <span class="kpi-card__label">Califican a BBP (Bono)</span>
        <strong class="kpi-card__value">{{ kpis.califican }}</strong>
        <span class="kpi-card__hint">Hasta {{ formatCurrency(kpis.maxBbp) }} de subsidio</span>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--primary"><i class="pi pi-building" /></div>
        <span class="kpi-card__label">Pipeline Proyectado</span>
        <strong class="kpi-card__value">{{ formatCurrency(kpis.pipeline) }}</strong>
        <span class="kpi-card__hint">Total inmuebles cotizados</span>
      </div>
    </div>

    <div class="leads__table-card">
      <div class="leads__filters">
        <span class="leads__search">
          <i class="pi pi-search" />
          <InputText v-model="search" placeholder="Filtrar por Nombre o DNI..." />
        </span>
        <Select v-model="statusFilter" :options="statusOptions" option-label="label" option-value="value" class="leads__filter-select" />
        <Select v-model="districtFilter" :options="districtOptions" option-label="label" option-value="value" class="leads__filter-select" />
        <ToggleButton v-model="bbpOnly" on-label="Solo con Bono BBP" off-label="Solo con Bono BBP" on-icon="pi pi-check-circle" off-icon="pi pi-circle" class="leads__bbp-toggle" />
        <span class="leads__count">{{ filteredLeads.length }} prospectos encontrados</span>
        <button class="leads__view-toggle"><i class="pi pi-table" /></button>
      </div>

      <table class="leads__table">
        <thead>
          <tr>
            <th>Cliente Comprador</th>
            <th>Simulación HipoSim</th>
            <th>Capacidad Financiera</th>
            <th>Recepción</th>
            <th>Estado del Lead</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lead in filteredLeads" :key="lead.id">
            <td>
              <div class="cell-client">
                <div class="cell-client__avatar">{{ lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('') }}</div>
                <div>
                  <strong>{{ lead.name }}</strong>
                  <div class="cell-client__meta">
                    DNI {{ lead.dni }}
                    <Tag v-if="lead.dniValidatedSbs" value="SBS OK" severity="success" class="cell-client__sbs" />
                  </div>
                  <span class="cell-client__phone">{{ lead.phone }}</span>
                </div>
              </div>
            </td>

            <td>
              <div class="cell-sim">
                <span>Inmueble: <strong>{{ formatCurrency(lead.simulation.propertyPrice) }}</strong></span>
                <span>Cuota Est.: <strong>{{ formatCurrency(lead.simulation.monthlyPayment) }}/mes</strong></span>
                <div class="cell-sim__tcea">
                  TCEA <strong>{{ lead.simulation.tcea }}%</strong>
                  <span class="cell-sim__bank">({{ lead.simulation.bank }})</span>
                </div>
              </div>
            </td>

            <td>
              <div class="cell-capacity">
                <span
                  >Cuota Inicial: <strong>{{ formatCurrency(lead.simulation.downPaymentAmount) }}</strong> ({{
                    lead.simulation.downPaymentPct
                  }}%)</span
                >
                <Tag
                  v-if="lead.simulation.bbpApplied"
                  :value="`Aplica Bono · BBP ${formatCurrency(lead.simulation.bbpAmount ?? 0)}`"
                  severity="info"
                  class="cell-capacity__bbp"
                />
                <span v-else class="cell-capacity__no-bbp">No aplica BBP (Excede tope)</span>
                <span class="cell-capacity__income">Ingresos declarados: {{ formatCurrency(lead.financialCapacity.netIncome) }}</span>
              </div>
            </td>

            <td>
              <div class="cell-date">
                <strong>{{ formatRelativeTime(lead.createdAt) }}</strong>
                <span>{{ new Date(lead.createdAt).toLocaleString('es-PE', { hour: '2-digit', minute: '2-digit' }) }}</span>
                <span class="cell-date__origin">Origen: {{ lead.originDistrict }}</span>
              </div>
            </td>

            <td>
              <Tag :value="statusLabels[lead.status]" :severity="statusSeverity[lead.status]" class="cell-status" />
            </td>

            <td>
              <div class="cell-actions">
                <button class="cell-actions__icon"><i class="pi pi-comment" /></button>
                <button class="cell-actions__icon"><i class="pi pi-phone" /></button>
                <Button label="Ver Ficha" size="small" @click="goToDetail(lead.id)" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="leads__pagination">
        <span>Mostrando 1 - {{ filteredLeads.length }} de {{ mockLeads.length }} prospectos</span>
        <span class="leads__page-size">Filas por página: <strong>10</strong></span>
      </div>
    </div>

    <p class="leads__disclaimer">
      <i class="pi pi-info-circle" /> Los datos de scoring y capacidad de endeudamiento provienen de
      cálculos algorítmicos normados por la Superintendencia de Banca, Seguros y AFP (SBS) y el Fondo
      MIVIVIENDA.
    </p>

    <Transition name="fade">
      <div v-if="showNotification" class="toast">
        <div class="toast__header">
          <i class="pi pi-bell toast__icon" />
          <strong>Nuevo lead recibido</strong>
          <span class="toast__time">Hace 2 min</span>
          <button class="toast__close" @click="showNotification = false"><i class="pi pi-times" /></button>
        </div>
        <p>
          <strong>Mariana Flores</strong> acaba de solicitar información y pre-calificación para
          <em>Proyecto Park Prado</em>.
        </p>
        <div class="toast__actions">
          <a href="#" @click.prevent="goToDetail('L-2024-091')">Atender ahora</a>
          <a href="#" @click.prevent="showNotification = false">Descartar</a>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.leads {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--panel-text);
  padding-bottom: 80px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--panel-text-muted);
}

.breadcrumb strong {
  color: var(--panel-text);
}

.leads__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.leads__header h1 {
  font-size: 1.5rem;
  color: var(--panel-text);
}

.leads__header p {
  margin-top: 6px;
  color: var(--panel-text-muted);
  font-size: 0.9rem;
  max-width: 640px;
}

.leads__header-actions {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}

.leads__export {
  background: var(--color-primary);
  border: none;
}

.leads__kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.kpi-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
}

.kpi-card__icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin-bottom: 4px;
}

.kpi-card__icon--warn {
  background: #fef3e2;
  color: var(--color-accent);
}

.kpi-card__icon--info {
  background: #e6f6f5;
  color: var(--color-secondary);
}

.kpi-card__icon--success {
  background: #e5f6ee;
  color: var(--color-success);
}

.kpi-card__icon--primary {
  background: #e6eff0;
  color: var(--color-primary);
}

.kpi-card__label {
  font-size: 0.8rem;
  color: var(--panel-text-muted);
}

.kpi-card__value {
  font-family: var(--font-heading);
  font-size: 1.7rem;
  color: var(--panel-text);
}

.kpi-card__value--accent {
  color: var(--color-accent);
}

.kpi-card__hint {
  font-size: 0.76rem;
  color: var(--panel-text-muted);
}

.kpi-card__hint--up {
  color: var(--color-success);
  display: flex;
  align-items: center;
  gap: 4px;
}

.leads__table-card {
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
}

.leads__filters {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-wrap: wrap;
  margin-bottom: var(--space-2);
}

.leads__search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 220px;
}

.leads__filter-select {
  min-width: 190px;
}

.leads__bbp-toggle {
  height: 40px;
}

.leads__count {
  margin-left: auto;
  font-size: 0.82rem;
  color: var(--panel-text-muted);
  white-space: nowrap;
}

.leads__view-toggle {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
  color: var(--panel-text-muted);
  cursor: pointer;
}

.leads__table {
  width: 100%;
  border-collapse: collapse;
}

.leads__table th {
  text-align: left;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--panel-text-muted);
  padding: 10px 12px;
  border-bottom: 1px solid var(--panel-border);
}

.leads__table td {
  padding: 14px 12px;
  border-bottom: 1px solid var(--panel-border);
  vertical-align: top;
}

.cell-client {
  display: flex;
  gap: 10px;
}

.cell-client__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--panel-surface-alt);
  color: var(--color-primary);
  display: grid;
  place-items: center;
  font-size: 0.78rem;
  font-weight: 700;
  flex-shrink: 0;
}

.cell-client strong {
  color: var(--panel-text);
  font-size: 0.88rem;
}

.cell-client__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  color: var(--panel-text-muted);
  margin-top: 2px;
}

.cell-client__sbs {
  font-size: 0.64rem;
  padding: 1px 6px;
}

.cell-client__phone {
  font-size: 0.76rem;
  color: var(--panel-text-muted);
}

.cell-sim {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.82rem;
  color: var(--panel-text-muted);
}

.cell-sim strong {
  color: var(--panel-text);
}

.cell-sim__tcea {
  color: var(--color-secondary);
  font-size: 0.8rem;
}

.cell-sim__bank {
  color: var(--panel-text-muted);
  font-size: 0.74rem;
}

.cell-capacity {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--panel-text-muted);
  max-width: 200px;
}

.cell-capacity strong {
  color: var(--panel-text);
}

.cell-capacity__bbp {
  width: fit-content;
  font-size: 0.7rem;
}

.cell-capacity__no-bbp {
  color: var(--color-error);
  font-size: 0.74rem;
}

.cell-capacity__income {
  font-size: 0.74rem;
}

.cell-date {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.8rem;
}

.cell-date strong {
  color: var(--color-accent);
}

.cell-date span {
  color: var(--panel-text-muted);
  font-size: 0.74rem;
}

.cell-date__origin {
  font-style: italic;
}

.cell-status {
  white-space: nowrap;
}

.cell-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cell-actions__icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
  color: var(--panel-text-muted);
  cursor: pointer;
}

.leads__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-2);
  font-size: 0.8rem;
  color: var(--panel-text-muted);
}

.leads__disclaimer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--panel-text-muted);
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-2);
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 320px;
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  box-shadow: 0 16px 40px rgba(15, 32, 30, 0.18);
  z-index: 50;
}

.toast__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.toast__icon {
  color: var(--color-accent);
}

.toast__time {
  margin-left: auto;
  font-size: 0.72rem;
  color: var(--panel-text-muted);
}

.toast__close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--panel-text-muted);
}

.toast p {
  font-size: 0.84rem;
  color: var(--panel-text);
  margin-bottom: 8px;
}

.toast__actions {
  display: flex;
  gap: var(--space-2);
  font-size: 0.82rem;
}

.toast__actions a {
  color: var(--color-secondary);
  text-decoration: none;
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

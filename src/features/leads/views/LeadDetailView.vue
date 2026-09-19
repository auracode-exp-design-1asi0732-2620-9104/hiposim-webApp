<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Select from 'primevue/select'
import ProgressBar from 'primevue/progressbar'
import Textarea from 'primevue/textarea'
import {
  findLeadById,
  statusLabels,
  statusSeverity,
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '@/features/leads/data/mock-leads'

const route = useRoute()
const router = useRouter()

const lead = computed(() => findLeadById(route.params.id as string))

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({ value, label }))
const advisorOptions = ['Valeria Soto (Sala Jesús María - Actual)', 'Renzo Ibarra (Sala Surco)', 'Camila Ríos (Sala La Molina)']
const noteDraft = ref('')

function dtiBarSeverity(status: string) {
  if (status === 'Saludable') return 'success'
  if (status === 'Ajustado') return 'warn'
  return 'danger'
}
</script>

<template>
  <div v-if="lead" class="detail">
    <nav class="detail__subnav">
      <div class="detail__subnav-trail">
        <span>Inmobiliaria VivaPerú - Sala Jesús María</span> <i class="pi pi-angle-right" />
        <RouterLink :to="{ name: 'leads' }">Leads e Interesados</RouterLink> <i class="pi pi-angle-right" />
        <strong>#{{ lead.id }} ({{ lead.name }})</strong>
      </div>
      <div class="detail__subnav-tabs">
        <span>Proyectos Activos</span>
        <span class="detail__subnav-tabs-active">Simulador Matriz</span>
        <span>Reportes SBS</span>
        <span>Ver Métricas</span>
        <Button label="Nuevo Crédito" size="small" class="detail__new-credit" />
      </div>
    </nav>

    <section class="header-card">
      <div class="header-card__top">
        <div class="header-card__identity">
          <div class="header-card__avatar">{{ lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('') }}</div>
          <div>
            <h1>{{ lead.name }}</h1>
            <div class="header-card__status">
              <Tag :value="`Estado: ${statusLabels[lead.status]} (${formatRelativeTime(lead.createdAt)})`" :severity="statusSeverity[lead.status]" />
            </div>
          </div>
        </div>

        <div class="header-card__actions">
          <Button label="Contactar por WhatsApp" icon="pi pi-whatsapp" class="header-card__whatsapp" />
          <Button label="Llamar directamente" icon="pi pi-phone" severity="secondary" outlined />
          <Select :options="statusOptions" option-label="label" option-value="value" :model-value="lead.status" placeholder="Cambiar estado" class="header-card__status-select" />
          <button class="header-card__icon-btn"><i class="pi pi-copy" /></button>
        </div>
      </div>

      <div class="header-card__meta">
        <span><i class="pi pi-id-card" /> DNI: {{ lead.dni }}</span>
        <span class="header-card__meta-verified"><i class="pi pi-check-circle" /> Simulación verificada SBS</span>
        <span><i class="pi pi-user" /> Asesor asignado: <strong>{{ lead.assignedAdvisor }}</strong></span>
      </div>
    </section>

    <div class="detail__grid">
      <div class="detail__main">
        <section class="card">
          <div class="card__header">
            <h2><i class="pi pi-briefcase" /> Datos del Solicitante y Régimen Laboral</h2>
            <Tag value="Pre-evaluado" severity="info" />
          </div>
          <div class="kv-grid">
            <div><dt>Nombre Completo</dt><dd>{{ lead.name }}{{ lead.coApplicantName ? ' / ' + lead.coApplicantName : '' }}</dd></div>
            <div><dt>Documento de Identidad</dt><dd>DNI {{ lead.dni }} ({{ lead.age }} años)</dd></div>
            <div><dt>Correo Electrónico</dt><dd>{{ lead.email }}</dd></div>
            <div><dt>Teléfono Principal</dt><dd>{{ lead.phone }}</dd></div>
            <div>
              <dt>Tipo de Solicitud</dt>
              <dd>{{ lead.requestType }}{{ lead.coApplicantName ? ` (con ${lead.coApplicantName})` : '' }}</dd>
            </div>
            <div><dt>Régimen Laboral</dt><dd>{{ lead.employmentRegime }}</dd></div>
          </div>
        </section>

        <section class="card">
          <div class="card__header">
            <h2><i class="pi pi-chart-line" /> Capacidad Financiera y Ratios de Aprobación</h2>
            <Tag :value="`Score Crediticio: ${lead.financialCapacity.creditScoreLabel}`" severity="success" />
          </div>
          <div class="capacity-grid">
            <div class="capacity-cell">
              <span class="label">{{ lead.requestType === 'Individual' ? 'Ingreso Neto' : 'Ingreso Neto Conyugal' }}</span>
              <strong>{{ formatCurrency(lead.financialCapacity.netIncome) }} / mes</strong>
              <span class="hint"><i class="pi pi-check" /> {{ lead.financialCapacity.incomeSupport }}</span>
            </div>
            <div class="capacity-cell">
              <span class="label">Ratio DTI (Carga Financiera) <Tag :value="lead.financialCapacity.dtiStatus" :severity="dtiBarSeverity(lead.financialCapacity.dtiStatus)" class="capacity-cell__tag" /></span>
              <strong>{{ lead.financialCapacity.dtiRatio }}% <span class="hint">máx {{ lead.financialCapacity.dtiMax }}%</span></strong>
              <ProgressBar :value="(lead.financialCapacity.dtiRatio / lead.financialCapacity.dtiMax) * 100" :show-value="false" class="capacity-cell__bar" />
            </div>
            <div class="capacity-cell">
              <span class="label">Cuota Máx. Aprobable</span>
              <strong>{{ formatCurrency(lead.financialCapacity.maxApprovablePayment) }} / mes</strong>
              <span class="hint"><i class="pi pi-arrow-up" /> Holgura favorable de {{ formatCurrency(lead.financialCapacity.paymentHeadroom) }}</span>
            </div>
          </div>
        </section>

        <section class="certificate">
          <div class="certificate__header">
            <span>SIMULACIÓN CERTIFICADA HIPOSIM #{{ lead.simulation.certificateId }}</span>
            <div class="certificate__price">
              <span>Valor Inmueble</span>
              <strong>{{ formatCurrency(lead.simulation.propertyPrice) }}</strong>
            </div>
          </div>
          <p class="certificate__property">Inmueble: {{ lead.simulation.propertyType }} en {{ lead.simulation.district }}</p>

          <div class="certificate__grid">
            <div>
              <h3><i class="pi pi-wallet" /> Composición de la Cuota Inicial</h3>
              <div class="certificate__row">
                <span>Cuota inicial aportada ({{ lead.simulation.downPaymentPct }}%)</span>
                <strong>{{ formatCurrency(lead.simulation.downPaymentAmount) }}</strong>
              </div>
              <div v-if="lead.simulation.bbpApplied" class="certificate__row certificate__row--bbp">
                <span><i class="pi pi-plus-circle" /> Bono Buen Pagador (Sostenible)</span>
                <strong>+ {{ formatCurrency(lead.simulation.bbpAmount ?? 0) }}</strong>
              </div>
              <div class="certificate__row certificate__row--total">
                <span>Cuota Inicial Efectiva Total ({{ lead.simulation.effectiveInitialPct }}%)</span>
                <strong>{{ formatCurrency(lead.simulation.effectiveInitialAmount) }}</strong>
              </div>
            </div>
            <div>
              <h3><i class="pi pi-building-columns" /> Estructura del Crédito Hipotecario</h3>
              <div class="certificate__row">
                <span>Monto neto a financiar</span>
                <strong>{{ formatCurrency(lead.simulation.financingAmount) }}</strong>
              </div>
              <div class="certificate__row">
                <span>Plazo seleccionado</span>
                <strong>{{ lead.simulation.termYears }} años ({{ lead.simulation.termYears * 12 }} cuotas)</strong>
              </div>
              <div class="certificate__row">
                <span>TCEA Referencial de mercado</span>
                <strong>{{ lead.simulation.marketTcea }}% <span class="hint">fija en soles</span></strong>
              </div>
            </div>
          </div>

          <div class="certificate__footer">
            <div>
              <span>CUOTA MENSUAL ESTIMADA PROYECTADA</span>
              <strong>{{ formatCurrency(lead.simulation.monthlyPayment) }} <small>/ mes</small></strong>
              <span class="certificate__footnote">Incluye amortización capital, intereses, seguro de desgravamen y seguro todo riesgo.</span>
            </div>
            <div class="certificate__footer-actions">
              <Tag value="Menor Costo Financiero SBS" severity="success" />
              <Button label="Ver Tabla de Amortización" size="small" severity="secondary" outlined />
            </div>
          </div>
        </section>
      </div>

      <div class="detail__side">
        <section class="card">
          <div class="card__header">
            <h2><i class="pi pi-map-marker" /> Match de Inventario</h2>
            <Tag :value="`${lead.matchedProperties[0]?.match ?? 0}% Afinidad`" severity="success" />
          </div>

          <div v-if="lead.matchedProperties.length" class="match-list">
            <div
              v-for="property in lead.matchedProperties"
              :key="property.id"
              class="match-card"
              :class="{ 'match-card--recommended': property.recommended }"
            >
              <Tag v-if="property.recommended" :value="`¡MATCH RECOMENDADO ${property.match}%!`" severity="success" class="match-card__badge" />
              <div class="match-card__header">
                <strong>{{ property.name }}</strong>
                <span class="match-card__price">{{ formatCurrency(property.price) }}</span>
              </div>
              <span class="match-card__address">{{ property.address }}</span>
              <div class="match-card__specs">
                <span>{{ property.areaM2 }} m² <small>Área Total</small></span>
                <span>{{ property.rooms }} Dorm. <small>Habitaciones</small></span>
                <span>{{ property.baths }} Baños <small>Servicios</small></span>
              </div>
              <span class="match-card__delivery">{{ property.deliveryStatus }}</span>
              <div class="match-card__footer">
                <span v-if="property.appliesToMivivienda" class="match-card__mivivienda"
                  ><i class="pi pi-check" /> Aplica al Bono MiVivienda Sostenible</span
                >
                <Button v-if="property.recommended" label="Presentar a Lead" size="small" />
                <a v-else href="#" class="match-card__compare">Comparar</a>
              </div>
            </div>
          </div>
          <p v-else class="empty-hint">Aún no hay propiedades sugeridas para este lead.</p>
        </section>

        <section class="card">
          <div class="card__header">
            <h2><i class="pi pi-send" /> Bitácora de Interacciones y CRM</h2>
          </div>
          <p class="crm-label">Registrar nueva llamada, visita o WhatsApp:</p>
          <Textarea v-model="noteDraft" rows="2" placeholder="Escribir resumen de la conversación con el cliente..." class="crm-textarea" />
          <div class="crm-toolbar">
            <button class="crm-toolbar__icon"><i class="pi pi-paperclip" /></button>
            <button class="crm-toolbar__icon"><i class="pi pi-calendar" /></button>
            <Button label="Guardar Nota" size="small" class="crm-toolbar__save" />
          </div>

          <ul class="timeline">
            <li v-for="item in lead.activity" :key="item.id">
              <span class="timeline__dot" :class="{ 'timeline__dot--done': item.type === 'completed' }" />
              <div>
                <span class="timeline__time">{{ formatRelativeTime(item.date) }} ({{ formatDate(item.date) }})</span>
                <strong>{{ item.title }}</strong>
                <p>{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </section>

        <section class="card">
          <div class="card__header">
            <h2><i class="pi pi-directions" /> Reasignar Lead Comercial</h2>
          </div>
          <p class="empty-hint">
            Si requieres derivar este comprador a otra sala o a un broker bancario dedicado:
          </p>
          <Select :options="advisorOptions" :model-value="advisorOptions[0]" class="reassign-select" />
          <Button label="Transferir" size="small" outlined class="reassign-btn" />
        </section>
      </div>
    </div>
  </div>

  <div v-else class="detail-empty">
    <p>No se encontró este lead.</p>
    <Button label="Volver a la bandeja" @click="router.push({ name: 'leads' })" />
  </div>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--panel-text);
  padding-bottom: 40px;
}

.detail__subnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-2);
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-2);
}

.detail__subnav-trail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--panel-text-muted);
}

.detail__subnav-trail a {
  color: var(--panel-text-muted);
  text-decoration: none;
}

.detail__subnav-trail strong {
  color: var(--panel-text);
}

.detail__subnav-tabs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.82rem;
  color: var(--panel-text-muted);
}

.detail__subnav-tabs-active {
  color: var(--color-primary);
  font-weight: 700;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 4px;
}

.detail__new-credit {
  background: var(--color-primary-dark);
  border: none;
}

.header-card {
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.header-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.header-card__identity {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.header-card__avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--panel-surface-alt);
  color: var(--color-primary);
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 1rem;
}

.header-card__identity h1 {
  font-size: 1.3rem;
  color: var(--panel-text);
}

.header-card__status {
  margin-top: 6px;
}

.header-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-wrap: wrap;
}

.header-card__whatsapp {
  background: #25d366;
  border: none;
}

.header-card__status-select {
  min-width: 170px;
}

.header-card__icon-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
  color: var(--panel-text-muted);
  cursor: pointer;
}

.header-card__meta {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: var(--panel-text-muted);
  border-top: 1px solid var(--panel-border);
  padding-top: var(--space-2);
}

.header-card__meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-card__meta strong {
  color: var(--panel-text);
}

.header-card__meta-verified {
  color: var(--color-success);
}

.detail__grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: var(--space-2);
  align-items: start;
}

.detail__main,
.detail__side {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.card {
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.card__header h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.98rem;
  color: var(--panel-text);
}

.kv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

.kv-grid dt {
  font-size: 0.74rem;
  color: var(--panel-text-muted);
  margin-bottom: 2px;
}

.kv-grid dd {
  font-size: 0.9rem;
  color: var(--panel-text);
  font-weight: 500;
}

.capacity-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.capacity-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--panel-bg);
  border-radius: var(--radius-md);
  padding: var(--space-2);
}

.capacity-cell .label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  color: var(--panel-text-muted);
}

.capacity-cell strong {
  font-size: 1.1rem;
  color: var(--panel-text);
}

.capacity-cell .hint {
  font-size: 0.7rem;
  color: var(--color-success);
  display: flex;
  align-items: center;
  gap: 4px;
}

.capacity-cell__tag {
  font-size: 0.62rem;
}

.capacity-cell__bar {
  height: 6px;
}

.certificate {
  background: var(--color-primary);
  color: #ffffff;
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.certificate__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  opacity: 0.85;
}

.certificate__price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.certificate__price strong {
  font-family: var(--font-heading);
  font-size: 1.3rem;
}

.certificate__property {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  margin: 8px 0 var(--space-2);
}

.certificate__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding: var(--space-2) 0;
}

.certificate__grid h3 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  opacity: 0.85;
  margin-bottom: 10px;
}

.certificate__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  padding: 4px 0;
}

.certificate__row--bbp {
  color: #a7f3d0;
}

.certificate__row--total {
  border-top: 1px dashed rgba(255, 255, 255, 0.3);
  margin-top: 4px;
  padding-top: 8px;
  font-weight: 600;
}

.certificate__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: var(--space-2);
  flex-wrap: wrap;
  gap: var(--space-2);
}

.certificate__footer span {
  display: block;
  font-size: 0.72rem;
  opacity: 0.8;
}

.certificate__footer strong {
  font-family: var(--font-heading);
  font-size: 2rem;
  display: block;
  margin: 2px 0;
}

.certificate__footer strong small {
  font-size: 0.9rem;
  font-family: var(--font-body);
  font-weight: 400;
}

.certificate__footnote {
  max-width: 320px;
  opacity: 0.75;
}

.certificate__footer-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.match-card {
  position: relative;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.match-card--recommended {
  border-color: var(--color-success);
  background: #f2fbf7;
}

.match-card__badge {
  align-self: flex-start;
  margin-bottom: 4px;
}

.match-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.match-card__header strong {
  color: var(--panel-text);
  font-size: 0.9rem;
}

.match-card__price {
  color: var(--color-primary);
  font-weight: 700;
}

.match-card__address {
  font-size: 0.76rem;
  color: var(--panel-text-muted);
}

.match-card__specs {
  display: flex;
  gap: var(--space-2);
  font-size: 0.78rem;
  color: var(--panel-text);
}

.match-card__specs small {
  display: block;
  color: var(--panel-text-muted);
  font-size: 0.66rem;
}

.match-card__delivery {
  font-size: 0.74rem;
  color: var(--panel-text-muted);
}

.match-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.match-card__mivivienda {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.74rem;
  color: var(--color-success);
}

.match-card__compare {
  color: var(--color-secondary);
  font-size: 0.8rem;
  text-decoration: none;
  font-weight: 600;
}

.empty-hint {
  color: var(--panel-text-muted);
  font-size: 0.85rem;
}

.crm-label {
  font-size: 0.78rem;
  color: var(--panel-text-muted);
  margin-bottom: 6px;
}

.crm-textarea {
  width: 100%;
}

.crm-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 var(--space-2);
}

.crm-toolbar__icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
  color: var(--panel-text-muted);
  cursor: pointer;
}

.crm-toolbar__save {
  margin-left: auto;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.timeline li {
  display: flex;
  gap: 10px;
}

.timeline__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--panel-border);
  margin-top: 5px;
  flex-shrink: 0;
}

.timeline__dot--done {
  background: var(--color-success);
}

.timeline__time {
  display: block;
  font-size: 0.7rem;
  color: var(--panel-text-muted);
}

.timeline strong {
  display: block;
  font-size: 0.85rem;
  color: var(--panel-text);
  margin: 2px 0;
}

.timeline p {
  font-size: 0.8rem;
  color: var(--panel-text-muted);
}

.reassign-select {
  width: 100%;
  margin-bottom: var(--space-2);
}

.detail-empty {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-start;
}
</style>

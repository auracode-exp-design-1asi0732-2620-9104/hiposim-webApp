<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import { leadsApi } from '@/features/leads/api/leads.api'
import {
  leadStatuses,
  type LeadDetail,
  type LeadHistoryEntry,
  type LeadStatus,
} from '@/features/leads/api/leads.types'
import { statusLabel, statusSeverity } from '@/features/leads/api/leads.labels'
import { getStatus } from '@/shared/api/http'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useNotificationsStore } from '@/features/notifications/store/notifications.store'
import {
  formatCurrency,
  formatInstallment,
  formatRate,
  formatDateTime,
  toInternationalPhone,
} from '@/shared/format'

const MAX_NOTE_LENGTH = 500

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const notifications = useNotificationsStore()
const auth = useAuthStore()
const leadId = route.params.id as string

const lead = ref<LeadDetail | null>(null)
const isLoading = ref(true)
// Keys instead of text, so the message follows the interface language.
const loadErrorKey = ref<'detail.denied' | 'detail.notFound' | 'detail.loadError' | ''>('')

const selectedStatus = ref<LeadStatus>('new')
const isSavingStatus = ref(false)
const statusFeedback = ref<{ severity: 'success' | 'error'; key: 'detail.statusSaved' | 'detail.statusError' } | null>(null)

const noteDraft = ref('')
const isSavingNote = ref(false)
const noteErrorKey = ref<'detail.noteRequired' | 'detail.noteTooLong' | 'detail.noteError' | ''>('')

const statusOptions = computed(() => leadStatuses.map((value) => ({ value, label: statusLabel(value) })))

// US24 scenario 2: the advisor contacts the buyer on the number the buyer authorized.
const whatsappUrl = computed(() =>
  lead.value ? `https://wa.me/${toInternationalPhone(lead.value.buyer.phone)}` : '#',
)
const phoneUrl = computed(() => (lead.value ? `tel:+${toInternationalPhone(lead.value.buyer.phone)}` : '#'))

const statusChanged = computed(() => lead.value !== null && selectedStatus.value !== lead.value.status)
const history = computed(() => [...(lead.value?.history ?? [])].reverse())

function describeEntry(type: 'status' | 'note', text: string) {
  return type === 'status' ? t('detail.statusEntry', { status: statusLabel(text as LeadStatus) }) : text
}

// The API sends the id of the advisor, not a name: the signed-in advisor is "You", the others are "Advisor".
function authorLabel(entry: LeadHistoryEntry) {
  if (entry.authorId && entry.authorId === auth.session?.id) return t('detail.you')
  if (entry.authorName === 'Sistema' || entry.authorName === 'System') return t('detail.system')
  if (entry.authorName) return entry.authorName
  return entry.authorId ? t('detail.advisor') : t('detail.system')
}

async function loadLead() {
  isLoading.value = true
  loadErrorKey.value = ''
  try {
    lead.value = await leadsApi.get(leadId)
    selectedStatus.value = lead.value.status
  } catch (error) {
    const status = getStatus(error)
    // US24 scenario 3: a lead of another agency is denied.
    if (status === 403) loadErrorKey.value = 'detail.denied'
    else if (status === 404) loadErrorKey.value = 'detail.notFound'
    else loadErrorKey.value = 'detail.loadError'
  } finally {
    isLoading.value = false
  }
}

async function saveStatus() {
  if (!lead.value || !statusChanged.value) return
  isSavingStatus.value = true
  statusFeedback.value = null
  try {
    await leadsApi.changeStatus(lead.value.id, selectedStatus.value)
    // Reload so the history shows who changed the status and when, as the API recorded it (US25).
    await loadLead()
    // The menu badge counts leads that are still new, so it changes with this update.
    notifications.refresh()
    statusFeedback.value = { severity: 'success', key: 'detail.statusSaved' }
  } catch {
    statusFeedback.value = { severity: 'error', key: 'detail.statusError' }
  } finally {
    isSavingStatus.value = false
  }
}

async function saveNote() {
  const text = noteDraft.value.trim()
  noteErrorKey.value = ''
  if (!text) {
    noteErrorKey.value = 'detail.noteRequired'
    return
  }
  if (text.length > MAX_NOTE_LENGTH) {
    noteErrorKey.value = 'detail.noteTooLong'
    return
  }
  isSavingNote.value = true
  try {
    await leadsApi.addNote(leadId, text)
    noteDraft.value = ''
    await loadLead()
  } catch {
    noteErrorKey.value = 'detail.noteError'
  } finally {
    isSavingNote.value = false
  }
}

onMounted(loadLead)
</script>

<template>
  <div class="detail">
    <Button
      :label="t('detail.back')"
      icon="pi pi-arrow-left"
      text
      class="detail__back"
      @click="router.push({ name: 'leads' })"
    />

    <p v-if="isLoading && !lead" class="detail__state" role="status">{{ t('detail.loading') }}</p>

    <Message v-else-if="loadErrorKey" severity="error" :closable="false">{{ t(loadErrorKey) }}</Message>

    <template v-else-if="lead">
      <header class="detail__header">
        <div>
          <h1>{{ lead.buyer.fullName }}</h1>
          <Tag :value="statusLabel(lead.status)" :severity="statusSeverity[lead.status]" />
        </div>
        <div class="detail__contact-actions">
          <a class="contact-btn" :href="whatsappUrl" target="_blank" rel="noopener noreferrer">
            <i class="pi pi-whatsapp" aria-hidden="true" /> {{ t('detail.whatsapp') }}
          </a>
          <a class="contact-btn contact-btn--outline" :href="phoneUrl">
            <i class="pi pi-phone" aria-hidden="true" /> {{ t('detail.call') }}
          </a>
        </div>
      </header>

      <div class="detail__grid">
        <section class="card" aria-labelledby="contact-title">
          <h2 id="contact-title">{{ t('detail.contactTitle') }}</h2>
          <dl>
            <div><dt>{{ t('detail.email') }}</dt><dd>{{ lead.buyer.email }}</dd></div>
            <div><dt>{{ t('detail.phone') }}</dt><dd>{{ lead.buyer.phone }}</dd></div>
          </dl>
        </section>

        <section class="card" aria-labelledby="sim-title">
          <h2 id="sim-title">{{ t('detail.simTitle') }}</h2>
          <dl>
            <div v-if="lead.simulation.propertyPrice !== null"><dt>{{ t('detail.propertyPrice') }}</dt><dd>{{ formatCurrency(lead.simulation.propertyPrice) }}</dd></div>
            <div v-if="lead.simulation.downPayment !== null"><dt>{{ t('detail.downPayment') }}</dt><dd>{{ formatCurrency(lead.simulation.downPayment) }}</dd></div>
            <div v-if="lead.simulation.goodPayerBonus !== null"><dt>{{ t('detail.bonus') }}</dt><dd>{{ formatCurrency(lead.simulation.goodPayerBonus) }}</dd></div>
            <div v-if="lead.simulation.financedAmount !== null"><dt>{{ t('detail.financed') }}</dt><dd>{{ formatCurrency(lead.simulation.financedAmount) }}</dd></div>
            <div v-if="lead.simulation.termInMonths !== null"><dt>{{ t('detail.term') }}</dt><dd>{{ t('detail.months', { n: lead.simulation.termInMonths }) }}</dd></div>
            <div v-if="lead.simulation.monthlyInstallment !== null"><dt>{{ t('detail.installment') }}</dt><dd>{{ formatInstallment(lead.simulation.monthlyInstallment) }}</dd></div>
            <div v-if="lead.simulation.tcea !== null"><dt>{{ t('detail.tcea') }}</dt><dd>{{ formatRate(lead.simulation.tcea) }}</dd></div>
          </dl>
        </section>

        <section class="card" aria-labelledby="status-title">
          <h2 id="status-title">{{ t('detail.statusTitle') }}</h2>
          <div class="status-row">
            <label for="status-select" class="sr-only">{{ t('detail.newStatus') }}</label>
            <Select
              v-model="selectedStatus"
              input-id="status-select"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              class="status-row__select"
            />
            <Button :label="t('detail.saveStatus')" :disabled="!statusChanged" :loading="isSavingStatus" @click="saveStatus" />
          </div>
          <Message v-if="statusFeedback" :severity="statusFeedback.severity" :closable="false" role="status">
            {{ t(statusFeedback.key) }}
          </Message>
        </section>

        <section class="card card--wide" aria-labelledby="notes-title">
          <h2 id="notes-title">{{ t('detail.followUp') }}</h2>
          <label for="note" class="sr-only">{{ t('detail.newNote') }}</label>
          <Textarea
            id="note"
            v-model="noteDraft"
            rows="3"
            :maxlength="MAX_NOTE_LENGTH"
            :placeholder="t('detail.notePlaceholder')"
            :invalid="!!noteErrorKey"
            fluid
          />
          <small v-if="noteErrorKey" class="field-error" role="alert">{{ t(noteErrorKey, { max: MAX_NOTE_LENGTH }) }}</small>
          <Button :label="t('detail.addNote')" icon="pi pi-plus" class="note-btn" :loading="isSavingNote" @click="saveNote" />

          <ol class="timeline" :aria-label="t('detail.history')">
            <li v-for="(entry, index) in history" :key="index" class="timeline__item">
              <span class="timeline__text">{{ describeEntry(entry.type, entry.text) }}</span>
              <span class="timeline__meta">{{ authorLabel(entry) }} · {{ formatDateTime(entry.atUtc) }}</span>
            </li>
          </ol>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.detail__back {
  align-self: flex-start;
}

.detail__state {
  padding: var(--space-4) 0;
  text-align: center;
  color: var(--color-neutral);
}

.detail__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.detail__header h1 {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  margin-bottom: 8px;
  color: var(--color-text);
}

.detail__contact-actions {
  display: flex;
  gap: var(--space-1);
}

.contact-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
}

.contact-btn--outline {
  background: #fff;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.detail__grid {
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
}

.status-row {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}

.status-row__select {
  min-width: 200px;
  flex: 1;
}

.field-error {
  color: var(--color-error-text);
}

.note-btn {
  align-self: flex-start;
}

.timeline {
  list-style: none;
  margin: var(--space-2) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border-left: 3px solid var(--color-secondary);
}

.timeline__item {
  display: flex;
  flex-direction: column;
  padding-left: var(--space-2);
}

.timeline__text {
  font-weight: 500;
  white-space: pre-wrap;
}

.timeline__meta {
  font-size: 0.8rem;
  color: var(--color-neutral);
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

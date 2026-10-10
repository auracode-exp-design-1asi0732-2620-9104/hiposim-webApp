<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useNotificationsStore } from '@/features/notifications/store/notifications.store'
import { formatCurrency, formatInstallment, formatDateTime } from '@/shared/format'
import { intlLocale } from '@/i18n'

const router = useRouter()
const { t } = useI18n()
const notifications = useNotificationsStore()

const REFRESH_EVERY_MS = 60_000
let timer: ReturnType<typeof setInterval> | undefined

function updatedAt() {
  return notifications.lastUpdated
    ? notifications.lastUpdated.toLocaleTimeString(intlLocale(), { hour: '2-digit', minute: '2-digit' })
    : ''
}

onMounted(() => {
  notifications.refresh()
  timer = setInterval(notifications.refresh, REFRESH_EVERY_MS)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="notes">
    <div class="notes__header">
      <div>
        <h1>{{ t('notifications.title') }}</h1>
        <p>{{ t('notifications.intro') }}</p>
      </div>
      <Button
        :label="t('notifications.refresh')"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        :loading="notifications.isLoading"
        @click="notifications.refresh"
      />
    </div>

    <p v-if="notifications.lastUpdated" class="notes__updated" aria-live="polite">
      {{ t('notifications.updatedAt', { time: updatedAt() }) }}
    </p>

    <Message v-if="notifications.hasError" severity="error" :closable="false">
      {{ t('notifications.loadError') }}
      <Button :label="t('notifications.retry')" size="small" text @click="notifications.refresh" />
    </Message>

    <p v-else-if="notifications.isLoading && notifications.count === 0" class="notes__state" role="status">
      {{ t('notifications.loading') }}
    </p>

    <p v-else-if="notifications.count === 0" class="notes__state">{{ t('notifications.empty') }}</p>

    <ul v-else class="notes__list" :aria-label="t('notifications.listLabel')">
      <li v-for="lead in notifications.items" :key="lead.id" class="note">
        <i class="pi pi-bell note__icon" aria-hidden="true" />
        <div class="note__body">
          <strong>{{ t('notifications.item', { name: lead.buyerName }) }}</strong>
          <span>
            {{
              t('notifications.detailLine', {
                price: lead.propertyPrice === null ? t('leads.notAvailable') : formatCurrency(lead.propertyPrice),
                installment:
                  lead.monthlyInstallment === null
                    ? t('leads.notAvailable')
                    : formatInstallment(lead.monthlyInstallment),
              })
            }}
          </span>
          <small>{{ t('notifications.received', { when: formatDateTime(lead.receivedAtUtc) }) }}</small>
        </div>
        <Button
          :label="t('notifications.view')"
          size="small"
          :aria-label="t('notifications.viewFor', { name: lead.buyerName })"
          @click="router.push({ name: 'lead-detail', params: { id: lead.id } })"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.notes {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
}

.notes__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.notes__header h1 {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  color: var(--color-text);
}

.notes__header p,
.notes__updated,
.notes__state {
  color: var(--color-neutral);
}

.notes__header p {
  max-width: 60ch;
}

.notes__state {
  padding: var(--space-4) 0;
  text-align: center;
}

.notes__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.note {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: #fff;
  border: 1px solid #e3e9ea;
  border-left: 4px solid var(--color-accent);
  border-radius: var(--radius-md);
}

.note__icon {
  color: var(--color-primary);
  font-size: 1.2rem;
}

.note__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.note__body small {
  color: var(--color-neutral);
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Tag from 'primevue/tag'
import {
  mockNotifications,
  formatNotificationTime,
  formatDayLabel,
  type NotificationType,
} from '@/features/notifications/data/mock-notifications'
import { formatCurrency } from '@/features/leads/data/mock-leads'

const router = useRouter()

type FilterKey = 'todas' | 'accion' | 'info' | 'leidas'

const filter = ref<FilterKey>('todas')
const notifications = ref(mockNotifications)

const filters: { key: FilterKey; label: string; icon: string }[] = [
  { key: 'todas', label: 'Todas', icon: 'pi pi-inbox' },
  { key: 'accion', label: 'Requieren acción', icon: 'pi pi-exclamation-circle' },
  { key: 'info', label: 'Informativas', icon: 'pi pi-info-circle' },
  { key: 'leidas', label: 'Leídas', icon: 'pi pi-check' },
]

const actionTypes: NotificationType[] = ['lead', 'reminder']

const filteredNotifications = computed(() => {
  return notifications.value.filter((n) => {
    if (filter.value === 'accion') return actionTypes.includes(n.type) && !n.read
    if (filter.value === 'info') return !actionTypes.includes(n.type)
    if (filter.value === 'leidas') return n.read
    return true
  })
})

const groupedByDay = computed(() => {
  const groups = new Map<string, typeof notifications.value>()
  for (const item of filteredNotifications.value) {
    const key = formatDayLabel(item.date)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  }
  return Array.from(groups.entries())
})

const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

function markAsRead(id: string) {
  const item = notifications.value.find((n) => n.id === id)
  if (item) item.read = true
}

function goToLead(id: string) {
  router.push({ name: 'lead-detail', params: { id } })
}
</script>

<template>
  <div class="page">
    <nav class="breadcrumb">
      <span>Portal Inmobiliarias</span> <i class="pi pi-angle-right" />
      <strong>Notificaciones</strong>
    </nav>

    <div class="page__header">
      <h1>Notificaciones</h1>
      <p>{{ unreadCount }} sin leer · actividad de tus leads y del sistema HipoSim.</p>
    </div>

    <div class="layout">
      <aside class="rail">
        <button
          v-for="f in filters"
          :key="f.key"
          class="rail__item"
          :class="{ 'rail__item--active': filter === f.key }"
          @click="filter = f.key"
        >
          <i :class="f.icon" />
          <span>{{ f.label }}</span>
        </button>
      </aside>

      <div class="feed">
        <div v-for="[day, items] in groupedByDay" :key="day" class="feed__group">
          <div class="feed__day"><span>{{ day }}</span></div>

          <div
            v-for="item in items"
            :key="item.id"
            class="notif"
            :class="{ 'notif--unread': !item.read }"
            @click="markAsRead(item.id)"
          >
            <template v-if="item.type === 'lead' && item.leadPreview">
              <div class="notif__icon notif__icon--lead"><i class="pi pi-user-plus" /></div>
              <div class="notif__body">
                <div class="notif__title-row">
                  <strong>{{ item.title }}</strong>
                  <span class="notif__time">{{ formatNotificationTime(item.date) }}</span>
                </div>
                <div class="notif__lead-preview" @click.stop="goToLead(item.leadPreview.leadId)">
                  <strong>{{ item.leadPreview.name }}</strong>
                  <span>{{ formatCurrency(item.leadPreview.monthlyPayment) }}/mes</span>
                  <span class="notif__lead-preview-tcea">TCEA {{ item.leadPreview.tcea }}%</span>
                  <i class="pi pi-arrow-right" />
                </div>
              </div>
            </template>

            <template v-else-if="item.type === 'status' && item.statusChange">
              <div class="notif__icon notif__icon--status"><i class="pi pi-sync" /></div>
              <div class="notif__body">
                <div class="notif__title-row">
                  <strong>{{ item.title }}</strong>
                  <span class="notif__time">{{ formatNotificationTime(item.date) }}</span>
                </div>
                <div class="notif__status-change">
                  <Tag :value="item.statusChange.from" severity="secondary" />
                  <i class="pi pi-arrow-right" />
                  <Tag :value="item.statusChange.to" severity="success" />
                </div>
              </div>
            </template>

            <template v-else-if="item.type === 'reminder'">
              <div class="notif__icon notif__icon--reminder"><i class="pi pi-clock" /></div>
              <div class="notif__body">
                <div class="notif__title-row">
                  <strong>{{ item.title }}</strong>
                  <span class="notif__time">{{ formatNotificationTime(item.date) }}</span>
                </div>
                <p>{{ item.description }}</p>
              </div>
            </template>

            <template v-else>
              <div class="notif__icon notif__icon--system"><i class="pi pi-megaphone" /></div>
              <div class="notif__body">
                <div class="notif__title-row">
                  <strong>{{ item.title }}</strong>
                  <span class="notif__time">{{ formatNotificationTime(item.date) }}</span>
                </div>
                <p>{{ item.description }}</p>
              </div>
            </template>
          </div>
        </div>

        <p v-if="!filteredNotifications.length" class="empty-hint">No hay notificaciones en este filtro.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--panel-text);
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

.page__header h1 {
  font-size: 1.4rem;
}

.page__header p {
  margin-top: 4px;
  color: var(--panel-text-muted);
  font-size: 0.9rem;
}

.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--space-2);
  align-items: start;
}

.rail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-1);
}

.rail__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--panel-text-muted);
  font-size: 0.86rem;
  text-align: left;
  cursor: pointer;
}

.rail__item:hover {
  background: var(--panel-surface-alt);
}

.rail__item--active {
  background: var(--panel-surface-alt);
  color: var(--color-primary);
  font-weight: 600;
}

.feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.feed__day {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--panel-text-muted);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.feed__day::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--panel-border);
}

.notif {
  display: flex;
  gap: var(--space-2);
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-left: 3px solid transparent;
  border-radius: var(--radius-md);
  padding: var(--space-2);
  margin-top: 8px;
  cursor: pointer;
}

.notif--unread {
  border-left-color: var(--color-accent);
  background: #fffaf1;
}

.notif__icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.notif__icon--lead {
  background: #e6f6f5;
  color: var(--color-secondary);
}

.notif__icon--status {
  background: #e6eff0;
  color: var(--color-primary);
}

.notif__icon--reminder {
  background: #fef3e2;
  color: var(--color-accent);
}

.notif__icon--system {
  background: #eef1f2;
  color: var(--panel-text-muted);
}

.notif__body {
  flex: 1;
}

.notif__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.notif__title-row strong {
  font-size: 0.9rem;
  color: var(--panel-text);
}

.notif__time {
  font-size: 0.72rem;
  color: var(--panel-text-muted);
  white-space: nowrap;
}

.notif__body p {
  margin-top: 4px;
  font-size: 0.82rem;
  color: var(--panel-text-muted);
}

.notif__lead-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  background: var(--panel-bg);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-size: 0.82rem;
}

.notif__lead-preview strong {
  color: var(--panel-text);
}

.notif__lead-preview-tcea {
  color: var(--color-secondary);
}

.notif__lead-preview i {
  margin-left: auto;
  color: var(--panel-text-muted);
}

.notif__status-change {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 0.8rem;
  color: var(--panel-text-muted);
}

.empty-hint {
  color: var(--panel-text-muted);
  font-size: 0.85rem;
  text-align: center;
  padding: var(--space-3);
}
</style>

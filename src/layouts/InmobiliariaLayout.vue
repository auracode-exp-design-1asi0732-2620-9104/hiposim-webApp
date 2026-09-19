<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Avatar from 'primevue/avatar'
import Badge from 'primevue/badge'
import { useAuthStore } from '@/features/auth/store/auth.store'
import HipoSimLogo from '@/shared/components/HipoSimLogo.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = [
  { label: 'Dashboard', icon: 'pi pi-th-large', to: '/dashboard' },
  { label: 'Leads e Interesados', icon: 'pi pi-users', to: '/leads', badge: 8 },
  { label: 'Mi Inmobiliaria', icon: 'pi pi-building', to: '/mi-inmobiliaria' },
  { label: 'Notificaciones', icon: 'pi pi-bell', to: '/notificaciones', badge: 3 },
  { label: 'Configuración', icon: 'pi pi-cog', to: '/configuracion' },
]

const isActive = (to: string) => computed(() => route.path.startsWith(to)).value

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="sidebar__brand">
        <HipoSimLogo :size="34" />
        <span class="sidebar__brand-sub">Portal Promotores y Agenc...</span>
      </div>

      <button class="sidebar__new" @click="router.push({ name: 'leads' })">
        <i class="pi pi-user-plus" /> Nuevo Prospecto
      </button>

      <nav class="sidebar__nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="sidebar__link"
          :class="{ 'sidebar__link--active': isActive(item.to) }"
        >
          <i :class="item.icon" />
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="sidebar__dot">{{ item.badge }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar__footer">
        <a href="#" class="sidebar__footer-link"><i class="pi pi-question-circle" /> Soporte B2B</a>
        <button class="sidebar__footer-link sidebar__logout" @click="handleLogout">
          <i class="pi pi-sign-out" /> Cerrar Sesión
        </button>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <button class="topbar__sede">
          <span class="topbar__sede-label">Sede / Proyecto Activo</span>
          <strong>{{ auth.session?.companyName ?? 'Inmobiliaria' }} - Sala Jesús María</strong>
          <i class="pi pi-chevron-down" />
        </button>

        <div class="topbar__search">
          <i class="pi pi-search" />
          <input type="text" placeholder="Buscar prospecto por DNI, nombre..." />
        </div>

        <div class="topbar__actions">
          <button class="topbar__icon-btn">
            <i class="pi pi-bell" />
            <Badge value="3" severity="warn" class="topbar__icon-badge" />
          </button>
          <button class="topbar__icon-btn">
            <i class="pi pi-question-circle" />
          </button>

          <div class="topbar__user">
            <Avatar label="VT" shape="circle" class="topbar__avatar" />
            <div class="topbar__user-info">
              <strong>Lic. Valeria Torres</strong>
              <span>Asesora Senior Hipotecaria</span>
            </div>
            <i class="pi pi-angle-down" />
          </div>
        </div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  --panel-bg: #f5f7f8;
  --panel-surface: #ffffff;
  --panel-surface-alt: #eef4f4;
  --panel-border: #e3e9ea;
  --panel-text: #1f2933;
  --panel-text-muted: #64748b;

  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
  background: var(--panel-bg);
  color: var(--panel-text);
}

.sidebar {
  display: flex;
  flex-direction: column;
  padding: var(--space-3) var(--space-2);
  border-right: 1px solid var(--panel-border);
  gap: var(--space-2);
  background: var(--panel-surface);
}

.sidebar__brand {
  display: flex;
  flex-direction: column;
  padding: var(--space-1) var(--space-1) var(--space-2);
}

.sidebar__brand-sub {
  font-size: 0.72rem;
  color: var(--panel-text-muted);
  margin-top: 2px;
  margin-left: 46px;
}

.sidebar__new {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  padding: 12px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: var(--space-2);
}

.sidebar__new:hover {
  background: var(--color-primary-dark);
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.sidebar__link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px 9px 14px;
  border-radius: 999px;
  background: #e8f1fb;
  color: var(--color-primary-dark);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: var(--font-body);
  transition: background 0.15s, color 0.15s;
}

.sidebar__link i {
  color: var(--color-primary);
  font-size: 0.95rem;
}

.sidebar__link:hover {
  background: #d9ebfa;
}

.sidebar__link--active {
  background: var(--color-primary);
  color: #ffffff;
}

.sidebar__link--active i {
  color: #ffffff;
}

.sidebar__link--active .sidebar__dot {
  background: #ffffff;
  color: var(--color-primary);
}

.sidebar__dot {
  margin-left: auto;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--color-primary-dark);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.sidebar__footer {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-top: 1px solid var(--panel-border);
  padding-top: var(--space-2);
}

.sidebar__footer-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: var(--panel-text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.88rem;
  text-decoration: none;
}

.sidebar__footer-link:hover {
  background: var(--panel-surface-alt);
  color: var(--panel-text);
}

.sidebar__logout {
  color: var(--color-error);
}

.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--panel-border);
  background: var(--panel-surface);
}

.topbar__sede {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  background: var(--panel-surface-alt);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: 8px 14px;
  cursor: pointer;
  min-width: 220px;
}

.topbar__sede-label {
  font-size: 0.68rem;
  color: var(--color-secondary);
  font-weight: 600;
}

.topbar__sede strong {
  font-size: 0.85rem;
  color: var(--panel-text);
}

.topbar__sede .pi-chevron-down {
  position: absolute;
  margin-left: 200px;
}

.topbar__search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  flex: 1;
  max-width: 420px;
  color: var(--panel-text-muted);
}

.topbar__search input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--panel-text);
  font-family: var(--font-body);
  width: 100%;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

.topbar__icon-btn {
  position: relative;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: var(--panel-text-muted);
  cursor: pointer;
  display: grid;
  place-items: center;
}

.topbar__icon-badge {
  position: absolute;
  top: -4px;
  right: -4px;
}

.topbar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.topbar__avatar {
  background: var(--color-primary);
  color: #ffffff;
}

.topbar__user-info {
  display: flex;
  flex-direction: column;
  font-size: 0.82rem;
  line-height: 1.25;
}

.topbar__user-info strong {
  color: var(--panel-text);
}

.topbar__user-info span {
  color: var(--panel-text-muted);
}

.content {
  flex: 1;
  padding: var(--space-3);
  overflow-y: auto;
}
</style>

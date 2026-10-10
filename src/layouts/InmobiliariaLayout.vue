<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Avatar from 'primevue/avatar'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useNotificationsStore } from '@/features/notifications/store/notifications.store'
import HipoSimLogo from '@/shared/components/HipoSimLogo.vue'
import LanguageSwitcher from '@/shared/components/LanguageSwitcher.vue'
import { landingUrl } from '@/shared/links'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const navItems = [
  { key: 'dashboard', icon: 'pi pi-th-large', to: '/dashboard' },
  { key: 'leads', icon: 'pi pi-users', to: '/leads' },
  { key: 'properties', icon: 'pi pi-building', to: '/mi-inmobiliaria' },
  { key: 'notifications', icon: 'pi pi-bell', to: '/notificaciones' },
  { key: 'settings', icon: 'pi pi-cog', to: '/configuracion' },
]

const notifications = useNotificationsStore()

// New leads are counted for the badge of the menu. The API has no push, so the portal asks again every minute.
const REFRESH_EVERY_MS = 60_000
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  notifications.refresh()
  timer = setInterval(notifications.refresh, REFRESH_EVERY_MS)
})
onBeforeUnmount(() => clearInterval(timer))

const isActive = (to: string) => computed(() => route.path.startsWith(to)).value

const initials = computed(() =>
  (auth.session?.fullName ?? 'A')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

// Below 900px the sidebar becomes a drawer opened from the top bar.
const menuOpen = ref(false)
const mainEl = ref<HTMLElement | null>(null)

// After each navigation the focus moves to the content, so keyboard and screen reader users start there.
watch(
  () => route.path,
  async () => {
    menuOpen.value = false
    await nextTick()
    mainEl.value?.focus({ preventScroll: true })
  },
)

function handleLogout() {
  notifications.reset()
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="shell">
    <a class="skip-link" href="#main-content">{{ t('app.skipToContent') }}</a>

    <div v-if="menuOpen" class="overlay" aria-hidden="true" @click="menuOpen = false" />

    <aside id="main-nav" class="sidebar" :class="{ 'sidebar--open': menuOpen }">
      <div class="sidebar__brand">
        <HipoSimLogo :size="34" />
        <span class="sidebar__brand-sub">{{ t('nav.sidebarSub') }}</span>
      </div>

      <nav class="sidebar__nav" :aria-label="t('nav.label')">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="sidebar__link"
          :class="{ 'sidebar__link--active': isActive(item.to) }"
        >
          <i :class="item.icon" aria-hidden="true" />
          <span>{{ t(`nav.${item.key}`) }}</span>
          <span
            v-if="item.key === 'notifications' && notifications.count > 0"
            class="sidebar__dot"
            :aria-label="t('nav.newLeadsBadge', { count: notifications.count })"
          >
            {{ notifications.count }}
          </span>
        </RouterLink>
      </nav>

      <div class="sidebar__footer">
        <button type="button" class="sidebar__footer-link sidebar__logout" @click="handleLogout">
          <i class="pi pi-sign-out" aria-hidden="true" /> {{ t('nav.logout') }}
        </button>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <button
          type="button"
          class="topbar__menu"
          :aria-label="t('nav.openMenu')"
          aria-controls="main-nav"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <i class="pi pi-bars" aria-hidden="true" />
        </button>

        <div class="topbar__sede">
          <span class="topbar__sede-label">{{ t('nav.agency') }}</span>
          <strong>{{ auth.session?.companyName || t('nav.agency') }}</strong>
        </div>

        <div class="topbar__actions">
          <LanguageSwitcher />
          <div class="topbar__user">
            <Avatar :label="initials" shape="circle" class="topbar__avatar" aria-hidden="true" />
            <div class="topbar__user-info">
              <strong>{{ auth.session?.fullName }}</strong>
              <span>{{ t('nav.advisor') }}</span>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" ref="mainEl" class="content" tabindex="-1">
        <RouterView />
      </main>

      <footer class="legal">
        <span>{{ t('app.copyright') }}</span>
        <a :href="`${landingUrl}#terminos`" target="_blank" rel="noopener noreferrer">{{ t('app.terms') }}</a>
        <a :href="`${landingUrl}#privacidad`" target="_blank" rel="noopener noreferrer">{{ t('app.privacy') }}</a>
      </footer>
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
  --panel-text-muted: #56657a; /* AA contrast on the panel background */

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

.main {
  min-width: 0;
}

.topbar__menu {
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  background: var(--panel-surface);
  color: var(--color-primary);
  cursor: pointer;
}

.overlay {
  display: none;
}

@media (max-width: 900px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .topbar__menu {
    display: inline-flex;
  }

  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: 260px;
    z-index: 40;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .sidebar--open {
    transform: translateX(0);
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.25);
  }

  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 30;
    background: rgba(15, 23, 42, 0.45);
  }

  .topbar__user-info {
    display: none;
  }
}

.legal {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  padding: 16px 24px;
  border-top: 1px solid var(--panel-border);
  font-size: 0.85rem;
  color: var(--panel-text-muted);
}

.legal a {
  color: var(--color-primary);
}

.skip-link {
  position: absolute;
  left: 8px;
  top: -48px;
  z-index: 100;
  padding: 10px 16px;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
}

.skip-link:focus {
  top: 8px;
}

.content:focus {
  outline: none;
}

.sidebar__link:focus-visible,
.sidebar__footer-link:focus-visible,
.topbar__menu:focus-visible,
.legal a:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style>

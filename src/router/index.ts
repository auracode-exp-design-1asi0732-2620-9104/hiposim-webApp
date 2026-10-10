import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { i18n } from '@/i18n'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/leads',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/features/auth/views/LoginView.vue'),
      meta: { titleKey: 'titles.login' },
    },
    // Agency sign-up has no user story in this delivery (accounts are provided by the HipoSim team).
    // There is no sign-up screen: the old address goes to the login.
    { path: '/registro', redirect: '/login' },
    {
      path: '/',
      component: () => import('@/layouts/InmobiliariaLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        // Sprint 2 scope: US22 to US25 (login, inbox, lead card, status and notes).
        {
          path: 'leads',
          name: 'leads',
          component: () => import('@/features/leads/views/LeadsInboxView.vue'),
          meta: { titleKey: 'titles.leads' },
        },
        {
          path: 'leads/:id',
          name: 'lead-detail',
          component: () => import('@/features/leads/views/LeadDetailView.vue'),
          meta: { titleKey: 'titles.leadDetail' },
        },
        // Supporting screens built from data the API already gives (no extra endpoints).
        {
          path: 'mi-inmobiliaria',
          name: 'mi-inmobiliaria',
          component: () => import('@/features/agency/views/AgencyView.vue'),
          meta: { titleKey: 'titles.properties' },
        },
        {
          path: 'notificaciones',
          name: 'notificaciones',
          component: () => import('@/features/notifications/views/NewLeadsView.vue'),
          meta: { titleKey: 'titles.notifications' },
        },
        {
          path: 'configuracion',
          name: 'configuracion',
          component: () => import('@/features/settings/views/AccountSettingsView.vue'),
          meta: { titleKey: 'titles.settings' },
        },
        // Summary built from the same list as the inbox: no extra endpoint.
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/features/dashboard/views/DashboardView.vue'),
          meta: { titleKey: 'titles.dashboard' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/leads' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // The portal is only for advisors (US22). A session without that role is closed.
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }
  if (to.meta.requiresAuth && !auth.isAdvisor) {
    auth.logout()
    return { name: 'login' }
  }
  // Already signed in: skip the login screen.
  if (to.name === 'login' && auth.isAuthenticated && auth.isAdvisor) {
    return { name: 'leads' }
  }
})

// Each page gets its own title (chapter 4.2.3: SEO and meta tags).
function updateTitle() {
  const key = router.currentRoute.value.meta.titleKey as string | undefined
  const { t } = i18n.global
  document.title = `HipoSim | ${key ? t(key) : t('app.portal')}`
}

router.afterEach(updateTitle)
// The title also follows the interface language when it changes.
watch(() => i18n.global.locale.value, updateTitle)

export default router

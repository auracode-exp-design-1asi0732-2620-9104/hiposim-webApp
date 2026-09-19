import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/store/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/features/auth/views/LoginView.vue'),
    },
    {
      path: '/registro',
      name: 'register',
      component: () => import('@/features/auth/views/RegisterView.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/InmobiliariaLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/features/dashboard/views/DashboardView.vue'),
        },
        {
          path: 'leads',
          name: 'leads',
          component: () => import('@/features/leads/views/LeadsInboxView.vue'),
        },
        {
          path: 'leads/:id',
          name: 'lead-detail',
          component: () => import('@/features/leads/views/LeadDetailView.vue'),
        },
        {
          path: 'mi-inmobiliaria',
          name: 'mi-inmobiliaria',
          component: () => import('@/features/properties/views/PropertiesView.vue'),
        },
        {
          path: 'notificaciones',
          name: 'notificaciones',
          component: () => import('@/features/notifications/views/NotificationsView.vue'),
        },
        {
          path: 'configuracion',
          name: 'configuracion',
          component: () => import('@/features/settings/views/SettingsView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }
})

export default router

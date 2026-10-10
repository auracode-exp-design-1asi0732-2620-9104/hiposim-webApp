import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createMemoryHistory, createRouter } from 'vue-router'
import { i18n } from '@/i18n'

/** Plugins every screen needs when it is mounted in a test. */
export function mountPlugins() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/login', name: 'login', component: { template: '<div />' } },
      { path: '/leads', name: 'leads', component: { template: '<div />' } },
      { path: '/leads/:id', name: 'lead-detail', component: { template: '<div />' } },
    ],
  })
  return { router, plugins: [createPinia(), i18n, PrimeVue, router] }
}

export const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

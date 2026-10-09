import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'

import App from './App.vue'
import router from './router'
import { HipoSimPreset } from './shared/theme/hiposim-preset'
import { i18n } from './i18n'

const app = createApp(App)

app.use(createPinia())
app.use(i18n)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: HipoSimPreset,
    options: {
      darkModeSelector: false, // HipoSim mantiene un tema claro consistente (ver Cap. IV)
    },
  },
})

app.mount('#app')

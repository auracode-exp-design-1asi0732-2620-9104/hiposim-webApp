<script setup lang="ts">
import { reactive, ref } from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuthStore } from '@/features/auth/store/auth.store'
import PasswordStrengthChecklist from '@/shared/components/PasswordStrengthChecklist.vue'
import { passwordSchema, getFirstZodError } from '@/shared/validation/rules'

const auth = useAuthStore()

const sections = [
  { id: 'cuenta', label: 'Cuenta', icon: 'pi pi-user' },
  { id: 'seguridad', label: 'Seguridad', icon: 'pi pi-shield' },
  { id: 'notificaciones', label: 'Preferencias de Notificación', icon: 'pi pi-bell' },
  { id: 'sesion', label: 'Sesión', icon: 'pi pi-sign-out' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const account = reactive({
  name: 'Lic. Valeria Torres',
  email: auth.session?.email ?? 'contacto@viraperu.pe',
  phone: '+51 987 654 321',
})

const security = reactive({ current: '', next: '', confirm: '' })
const securityError = ref('')
const securitySuccess = ref(false)

function updatePassword() {
  securityError.value = ''
  securitySuccess.value = false

  if (!security.current) {
    securityError.value = 'Ingresa tu contraseña actual.'
    return
  }
  const passwordError = getFirstZodError(passwordSchema.safeParse(security.next))
  if (passwordError) {
    securityError.value = passwordError
    return
  }
  if (security.next !== security.confirm) {
    securityError.value = 'Las contraseñas nuevas no coinciden.'
    return
  }

  securitySuccess.value = true
  security.current = ''
  security.next = ''
  security.confirm = ''
}

const notificationPrefs = reactive({
  newLead: true,
  unattendedLead: true,
  weeklyDigest: false,
  systemUpdates: true,
})
</script>

<template>
  <div class="page">
    <nav class="breadcrumb">
      <span>Portal Inmobiliarias</span> <i class="pi pi-angle-right" />
      <strong>Configuración</strong>
    </nav>

    <div class="layout">
      <aside class="index">
        <span class="index__title">En esta página</span>
        <button v-for="s in sections" :key="s.id" class="index__item" @click="scrollTo(s.id)">
          <i :class="s.icon" /> {{ s.label }}
        </button>
      </aside>

      <div class="panel">
        <section id="cuenta" class="panel__section">
          <h2>Cuenta</h2>
          <div class="row">
            <div class="row__label">
              <strong>Nombre completo</strong>
              <span>Como aparece frente a tus prospectos.</span>
            </div>
            <InputText v-model="account.name" class="row__control" />
          </div>
          <div class="row">
            <div class="row__label">
              <strong>Correo de acceso</strong>
              <span>Se usa para iniciar sesión y recibir notificaciones.</span>
            </div>
            <InputText v-model="account.email" class="row__control" />
          </div>
          <div class="row">
            <div class="row__label">
              <strong>Teléfono</strong>
              <span>Visible para el equipo interno, no para compradores.</span>
            </div>
            <InputText v-model="account.phone" class="row__control" />
          </div>
          <Button label="Guardar cambios" size="small" class="panel__save" />
        </section>

        <section id="seguridad" class="panel__section">
          <h2>Seguridad</h2>
          <div class="row">
            <div class="row__label">
              <strong>Contraseña actual</strong>
              <span>Confírmala para poder cambiarla.</span>
            </div>
            <Password v-model="security.current" :feedback="false" toggle-mask class="row__control" />
          </div>
          <div class="row">
            <div class="row__label">
              <strong>Nueva contraseña</strong>
              <span>Mínimo 8 caracteres, con mayúscula, número y símbolo.</span>
            </div>
            <div class="row__control">
              <Password v-model="security.next" :feedback="false" toggle-mask fluid />
              <PasswordStrengthChecklist v-if="security.next" :password="security.next" />
            </div>
          </div>
          <div class="row">
            <div class="row__label">
              <strong>Confirmar nueva contraseña</strong>
            </div>
            <Password v-model="security.confirm" :feedback="false" toggle-mask class="row__control" />
          </div>

          <Message v-if="securityError" severity="error" :closable="false">{{ securityError }}</Message>
          <Message v-if="securitySuccess" severity="success" :closable="false"
            >Contraseña actualizada correctamente.</Message
          >

          <Button label="Actualizar contraseña" size="small" class="panel__save" @click="updatePassword" />
        </section>

        <section id="notificaciones" class="panel__section">
          <h2>Preferencias de Notificación</h2>
          <div class="switch-row">
            <div class="row__label">
              <strong>Nuevo lead recibido</strong>
              <span>Te avisamos apenas un comprador envía su cotización.</span>
            </div>
            <ToggleSwitch v-model="notificationPrefs.newLead" />
          </div>
          <div class="switch-row">
            <div class="row__label">
              <strong>Lead sin atender +1 hora</strong>
              <span>Recordatorio si un lead nuevo lleva más de 1 hora sin respuesta.</span>
            </div>
            <ToggleSwitch v-model="notificationPrefs.unattendedLead" />
          </div>
          <div class="switch-row">
            <div class="row__label">
              <strong>Resumen semanal por correo</strong>
              <span>Un correo los lunes con tus métricas de la semana.</span>
            </div>
            <ToggleSwitch v-model="notificationPrefs.weeklyDigest" />
          </div>
          <div class="switch-row">
            <div class="row__label">
              <strong>Actualizaciones del sistema</strong>
              <span>Cambios de tasas, BBP o Mivivienda hechos por el Administrador.</span>
            </div>
            <ToggleSwitch v-model="notificationPrefs.systemUpdates" />
          </div>
        </section>

        <section id="sesion" class="panel__section panel__section--last">
          <h2>Sesión</h2>
          <div class="row">
            <div class="row__label">
              <strong>Cerrar sesión en todos los dispositivos</strong>
              <span>Útil si compartiste tu cuenta o perdiste un equipo.</span>
            </div>
            <Button label="Cerrar todas las sesiones" size="small" severity="danger" outlined />
          </div>
        </section>
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

.layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: var(--space-3);
  align-items: start;
}

.index {
  position: sticky;
  top: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-1);
}

.index__title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--panel-text-muted);
  padding: 8px 12px 4px;
}

.index__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--panel-text-muted);
  font-size: 0.84rem;
  text-align: left;
  cursor: pointer;
}

.index__item:hover {
  background: var(--panel-surface-alt);
  color: var(--color-primary);
}

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.panel__section {
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  scroll-margin-top: var(--space-2);
}

.panel__section h2 {
  font-size: 1.05rem;
  margin-bottom: 4px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-2) 0;
  border-top: 1px solid var(--panel-border);
}

.panel__section h2 + .row {
  border-top: none;
  padding-top: 0;
}

.row__label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row__label strong {
  font-size: 0.9rem;
}

.row__label span {
  font-size: 0.78rem;
  color: var(--panel-text-muted);
}

.row__control {
  width: 100%;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-top: 1px solid var(--panel-border);
}

.panel__section h2 + .switch-row {
  border-top: none;
  padding-top: 0;
}

.panel__save {
  align-self: flex-start;
}
</style>

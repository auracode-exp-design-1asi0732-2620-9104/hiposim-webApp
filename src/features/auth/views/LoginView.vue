<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuthStore } from '@/features/auth/store/auth.store'
import HipoSimLogo from '@/shared/components/HipoSimLogo.vue'
import { emailSchema, loginPasswordSchema, getFirstZodError } from '@/shared/validation/rules'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const errors = reactive({ email: '', password: '' })
const touched = reactive({ email: false, password: false })

function validateEmail() {
  errors.email = getFirstZodError(emailSchema.safeParse(email.value)) ?? ''
}

function validatePassword() {
  errors.password = getFirstZodError(loginPasswordSchema.safeParse(password.value)) ?? ''
}

function handleBlur(field: 'email' | 'password') {
  touched[field] = true
  field === 'email' ? validateEmail() : validatePassword()
}

function validateAll(): boolean {
  touched.email = true
  touched.password = true
  validateEmail()
  validatePassword()
  return !errors.email && !errors.password
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!validateAll()) {
    errorMessage.value = 'Revisa los campos marcados antes de continuar.'
    return
  }

  isSubmitting.value = true
  try {
    await auth.login(email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch {
    errorMessage.value = 'Correo o contraseña incorrectos.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login">
    <div class="login__overlay" />

    <div class="login__card">
      <div class="login__brand">
        <HipoSimLogo :size="52" />
        <p class="login__subtitle">Portal de Inmobiliarias</p>
      </div>

      <form class="login__form" novalidate @submit.prevent="handleSubmit">
        <div class="field">
          <label for="email">Correo electrónico</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="nombre@inmobiliaria.com"
            autocomplete="username"
            :invalid="touched.email && !!errors.email"
            @blur="handleBlur('email')"
            fluid
          />
          <small v-if="touched.email && errors.email" class="field-error">{{ errors.email }}</small>
        </div>

        <div class="field">
          <label for="password">Contraseña</label>
          <Password
            id="password"
            v-model="password"
            placeholder="Ingresa tu contraseña"
            :feedback="false"
            toggle-mask
            autocomplete="current-password"
            :invalid="touched.password && !!errors.password"
            @blur="handleBlur('password')"
            fluid
          />
          <small v-if="touched.password && errors.password" class="field-error">{{ errors.password }}</small>
        </div>

        <div class="login__row">
          <label class="remember">
            <Checkbox v-model="rememberMe" binary />
            <span>Recordarme</span>
          </label>
          <a href="#" class="login__link">¿Olvidaste tu contraseña?</a>
        </div>

        <Message v-if="errorMessage" severity="error" :closable="false">
          {{ errorMessage }}
        </Message>

        <Button
          type="submit"
          label="Iniciar sesión"
          class="login__submit"
          :loading="isSubmitting"
          fluid
        />
      </form>

      <p class="login__register">
        ¿Eres una inmobiliaria nueva?
        <RouterLink :to="{ name: 'register' }" class="login__link login__link--accent"
          >Regístrate aquí</RouterLink
        >
      </p>
    </div>
  </div>
</template>

<style scoped>
.login {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3);
  background:
    linear-gradient(160deg, rgba(14, 92, 99, 0.85), rgba(10, 70, 75, 0.9)),
    url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')
      center / cover no-repeat;
}

.login__overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 20%, rgba(58, 175, 169, 0.25), transparent 60%);
}

.login__card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(6px);
  box-shadow: 0 24px 60px rgba(5, 36, 39, 0.35);
}

.login__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
  text-align: center;
}

.login__subtitle {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-neutral);
  letter-spacing: 0.02em;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--color-text);
}

.field-error {
  color: var(--color-error);
  font-size: 0.76rem;
}

.login__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-neutral);
  cursor: pointer;
}

.login__link {
  color: var(--color-secondary);
  text-decoration: none;
  font-weight: 500;
}

.login__link:hover {
  text-decoration: underline;
}

.login__link--accent {
  color: var(--color-accent);
}

.login__submit {
  margin-top: var(--space-1);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border: none;
  font-family: var(--font-body);
  font-weight: 600;
}

.login__register {
  margin-top: var(--space-3);
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-neutral);
}
</style>

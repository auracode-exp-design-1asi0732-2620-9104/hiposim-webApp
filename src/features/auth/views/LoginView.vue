<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { getStatus } from '@/shared/api/http'
import HipoSimLogo from '@/shared/components/HipoSimLogo.vue'
import LanguageSwitcher from '@/shared/components/LanguageSwitcher.vue'
import { landingUrl } from '@/shared/links'

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()


const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isSubmitting = ref(false)
// Keys instead of text, so messages follow the interface language.
const formErrorKey = ref('')

const errors = reactive({ email: '', password: '' })
const touched = reactive({ email: false, password: false })

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail() {
  if (!email.value.trim()) errors.email = 'auth.emailRequired'
  else if (!EMAIL_PATTERN.test(email.value.trim())) errors.email = 'auth.emailInvalid'
  else errors.email = ''
}

function validatePassword() {
  errors.password = password.value ? '' : 'auth.passwordRequired'
}

function handleBlur(field: 'email' | 'password') {
  touched[field] = true
  if (field === 'email') validateEmail()
  else validatePassword()
}

function validateAll(): boolean {
  touched.email = true
  touched.password = true
  validateEmail()
  validatePassword()
  return !errors.email && !errors.password
}

async function handleSubmit() {
  formErrorKey.value = ''

  if (!validateAll()) {
    formErrorKey.value = 'auth.fixFields'
    return
  }

  isSubmitting.value = true
  try {
    await auth.login(email.value.trim(), password.value)
    router.push({ name: 'leads' })
  } catch (error) {
    const status = getStatus(error)
    if (status === 401 || status === 400) {
      // US22 scenario 2: never say which of the two values is wrong.
      formErrorKey.value = 'auth.wrongCredentials'
    } else if (error instanceof Error && error.message === 'Only advisors can use this portal.') {
      formErrorKey.value = 'auth.advisorsOnly'
    } else if (status === null) {
      formErrorKey.value = 'auth.network'
    } else {
      formErrorKey.value = 'auth.unexpected'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="login">
    <div class="login__overlay" />

    <div class="login__lang"><LanguageSwitcher /></div>

    <div class="login__card">
      <div class="login__brand">
        <HipoSimLogo :size="52" />
        <h1 class="login__subtitle">{{ t('auth.subtitle') }}</h1>
      </div>

      <form class="login__form" novalidate @submit.prevent="handleSubmit">
        <div class="field">
          <label for="email">{{ t('auth.email') }}</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            :placeholder="t('auth.emailPlaceholder')"
            autocomplete="username"
            :invalid="touched.email && !!errors.email"
            :aria-describedby="touched.email && errors.email ? 'email-error' : undefined"
            fluid
            @blur="handleBlur('email')"
          />
          <small v-if="touched.email && errors.email" id="email-error" class="field-error" role="alert">{{ t(errors.email) }}</small>
        </div>

        <div class="field">
          <label for="password">{{ t('auth.password') }}</label>
          <Password
            v-model="password"
            input-id="password"
            :placeholder="t('auth.passwordPlaceholder')"
            :feedback="false"
            toggle-mask
            autocomplete="current-password"
            :invalid="touched.password && !!errors.password"
            :aria-describedby="touched.password && errors.password ? 'password-error' : undefined"
            fluid
            @blur="handleBlur('password')"
          />
          <small v-if="touched.password && errors.password" id="password-error" class="field-error" role="alert">{{ t(errors.password) }}</small>
        </div>

        <div class="login__row">
          <label class="remember">
            <Checkbox v-model="rememberMe" binary />
            <span>{{ t('auth.remember') }}</span>
          </label>
        </div>

        <Message v-if="formErrorKey" severity="error" :closable="false">
          {{ t(formErrorKey) }}
        </Message>

        <Button
          type="submit"
          :label="t('auth.submit')"
          class="login__submit"
          :loading="isSubmitting"
          fluid
        />
      </form>

      <!-- Agency sign-up has no user story in this delivery; accounts are provided by the HipoSim team. -->
      <p class="login__register">{{ t('auth.needAccount') }}</p>
      <p class="login__register">
        <a class="login__link" :href="`${landingUrl}#terminos`" target="_blank" rel="noopener noreferrer">{{ t('app.terms') }}</a>
        ·
        <a class="login__link" :href="`${landingUrl}#privacidad`" target="_blank" rel="noopener noreferrer">{{ t('app.privacy') }}</a>
      </p>
    </div>
  </main>
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
  color: var(--color-error-text);
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

.login__lang {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  z-index: 2;
}

.login__subtitle {
  font-weight: 400;
}

.login__link:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}
</style>

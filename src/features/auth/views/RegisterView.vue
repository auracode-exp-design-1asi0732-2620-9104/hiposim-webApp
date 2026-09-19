<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Message from 'primevue/message'
import HipoSimLogo from '@/shared/components/HipoSimLogo.vue'
import PasswordStrengthChecklist from '@/shared/components/PasswordStrengthChecklist.vue'
import {
  requiredTextSchema,
  rucSchema,
  phoneSchema,
  corporateEmailSchema,
  passwordSchema,
  getFirstZodError,
} from '@/shared/validation/rules'

const router = useRouter()

const form = reactive({
  companyName: '',
  ruc: '',
  contactName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptsTerms: false,
})

type FieldKey = keyof typeof form

const errors = reactive<Record<FieldKey, string>>({
  companyName: '',
  ruc: '',
  contactName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptsTerms: '',
})

const touched = reactive<Record<FieldKey, boolean>>({
  companyName: false,
  ruc: false,
  contactName: false,
  email: false,
  phone: false,
  password: false,
  confirmPassword: false,
  acceptsTerms: false,
})

const isSubmitting = ref(false)
const submitError = ref('')
const isSuccess = ref(false)

function validateField(key: FieldKey) {
  switch (key) {
    case 'companyName':
      errors.companyName = getFirstZodError(
        requiredTextSchema('El nombre de la inmobiliaria').safeParse(form.companyName),
      ) ?? ''
      break
    case 'ruc':
      errors.ruc = getFirstZodError(rucSchema.safeParse(form.ruc)) ?? ''
      break
    case 'phone':
      errors.phone = getFirstZodError(phoneSchema.safeParse(form.phone)) ?? ''
      break
    case 'contactName':
      errors.contactName = getFirstZodError(
        requiredTextSchema('El nombre del representante').safeParse(form.contactName),
      ) ?? ''
      break
    case 'email':
      errors.email = getFirstZodError(corporateEmailSchema.safeParse(form.email)) ?? ''
      break
    case 'password':
      errors.password = getFirstZodError(passwordSchema.safeParse(form.password)) ?? ''
      // Si ya se había validado la confirmación, la re-chequeamos al cambiar la contraseña base.
      if (touched.confirmPassword) validateField('confirmPassword')
      break
    case 'confirmPassword':
      errors.confirmPassword =
        form.confirmPassword !== form.password ? 'Las contraseñas no coinciden.' : ''
      break
    case 'acceptsTerms':
      errors.acceptsTerms = form.acceptsTerms
        ? ''
        : 'Debes aceptar los Términos y Condiciones para continuar.'
      break
  }
}

function handleBlur(key: FieldKey) {
  touched[key] = true
  validateField(key)
}

function validateAll(): boolean {
  ;(Object.keys(form) as FieldKey[]).forEach((key) => {
    touched[key] = true
    validateField(key)
  })
  return (Object.keys(errors) as FieldKey[]).every((key) => !errors[key])
}

async function handleSubmit() {
  submitError.value = ''

  if (!validateAll()) {
    submitError.value = 'Revisa los campos marcados antes de continuar.'
    return
  }

  isSubmitting.value = true

  // TODO: reemplazar por la llamada real al backend (Platform Governance —
  // aprobación de Inmobiliaria). Por ahora solo simula el envío de la solicitud.
  await new Promise((resolve) => setTimeout(resolve, 600))

  isSubmitting.value = false
  isSuccess.value = true
}
</script>

<template>
  <div class="register">
    <div class="register__card">
      <div class="register__brand">
        <HipoSimLogo :size="52" />
        <p class="register__subtitle">Regístrate como Inmobiliaria</p>
      </div>

      <div v-if="isSuccess" class="register__success">
        <i class="pi pi-check-circle" />
        <h2>¡Solicitud enviada!</h2>
        <p>
          Recibimos los datos de <strong>{{ form.companyName }}</strong
          >. Nuestro equipo revisará tu cuenta y te avisaremos por correo apenas quede aprobada.
        </p>
        <Button label="Volver al inicio de sesión" class="register__submit" @click="router.push({ name: 'login' })" />
      </div>

      <form v-else class="register__form" novalidate @submit.prevent="handleSubmit">
        <div class="field">
          <label for="companyName">Nombre de la inmobiliaria</label>
          <InputText
            id="companyName"
            v-model="form.companyName"
            placeholder="Ej. Inmobiliaria ViraPerú"
            :invalid="touched.companyName && !!errors.companyName"
            @blur="handleBlur('companyName')"
            fluid
          />
          <small v-if="touched.companyName && errors.companyName" class="field-error">{{
            errors.companyName
          }}</small>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="ruc">RUC</label>
            <InputText
              id="ruc"
              v-model="form.ruc"
              placeholder="20123456789"
              maxlength="11"
              :invalid="touched.ruc && !!errors.ruc"
              @blur="handleBlur('ruc')"
              fluid
            />
            <small v-if="touched.ruc && errors.ruc" class="field-error">{{ errors.ruc }}</small>
          </div>
          <div class="field">
            <label for="phone">Teléfono</label>
            <InputText
              id="phone"
              v-model="form.phone"
              placeholder="987 654 321"
              :invalid="touched.phone && !!errors.phone"
              @blur="handleBlur('phone')"
              fluid
            />
            <small v-if="touched.phone && errors.phone" class="field-error">{{ errors.phone }}</small>
          </div>
        </div>

        <div class="field">
          <label for="contactName">Nombre del representante</label>
          <InputText
            id="contactName"
            v-model="form.contactName"
            placeholder="Nombre y apellido"
            :invalid="touched.contactName && !!errors.contactName"
            @blur="handleBlur('contactName')"
            fluid
          />
          <small v-if="touched.contactName && errors.contactName" class="field-error">{{
            errors.contactName
          }}</small>
        </div>

        <div class="field">
          <label for="email">Correo corporativo</label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            placeholder="contacto@inmobiliaria.com"
            :invalid="touched.email && !!errors.email"
            @blur="handleBlur('email')"
            fluid
          />
          <small v-if="touched.email && errors.email" class="field-error">{{ errors.email }}</small>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="password">Contraseña</label>
            <Password
              id="password"
              v-model="form.password"
              placeholder="Crea una contraseña segura"
              :feedback="false"
              toggle-mask
              :invalid="touched.password && !!errors.password"
              @blur="handleBlur('password')"
              fluid
            />
          </div>
          <div class="field">
            <label for="confirmPassword">Confirmar contraseña</label>
            <Password
              id="confirmPassword"
              v-model="form.confirmPassword"
              placeholder="Repite tu contraseña"
              :feedback="false"
              toggle-mask
              :invalid="touched.confirmPassword && !!errors.confirmPassword"
              @blur="handleBlur('confirmPassword')"
              fluid
            />
            <small v-if="touched.confirmPassword && errors.confirmPassword" class="field-error">{{
              errors.confirmPassword
            }}</small>
          </div>
        </div>

        <PasswordStrengthChecklist v-if="form.password" :password="form.password" />

        <label class="terms">
          <Checkbox
            v-model="form.acceptsTerms"
            binary
            :invalid="touched.acceptsTerms && !!errors.acceptsTerms"
            @change="handleBlur('acceptsTerms')"
          />
          <span
            >Acepto los <a href="#" class="register__link">Términos y Condiciones</a> y la Política de
            Privacidad de HipoSim.</span
          >
        </label>
        <small v-if="touched.acceptsTerms && errors.acceptsTerms" class="field-error">{{
          errors.acceptsTerms
        }}</small>

        <Message v-if="submitError" severity="error" :closable="false">
          {{ submitError }}
        </Message>

        <Button
          type="submit"
          label="Crear cuenta"
          class="register__submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          fluid
        />
      </form>

      <p v-if="!isSuccess" class="register__footer">
        ¿Ya tienes cuenta?
        <RouterLink :to="{ name: 'login' }" class="register__link register__link--accent"
          >Inicia sesión</RouterLink
        >
      </p>
    </div>
  </div>
</template>

<style scoped>
.register {
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

.register__card {
  position: relative;
  width: 100%;
  max-width: 480px;
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(6px);
  box-shadow: 0 24px 60px rgba(5, 36, 39, 0.35);
}

.register__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
  text-align: center;
}

.register__subtitle {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-neutral);
}

.register__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 0.88rem;
  color: var(--color-text);
}

.field-error {
  color: var(--color-error);
  font-size: 0.76rem;
}

.terms {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.82rem;
  color: var(--color-neutral);
  cursor: pointer;
}

.register__submit {
  margin-top: var(--space-1);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border: none;
  font-family: var(--font-body);
  font-weight: 600;
}

.register__footer {
  margin-top: var(--space-3);
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-neutral);
}

.register__link {
  color: var(--color-secondary);
  text-decoration: none;
  font-weight: 500;
}

.register__link:hover {
  text-decoration: underline;
}

.register__link--accent {
  color: var(--color-accent);
}

.register__success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-1);
  padding: var(--space-2) 0;
}

.register__success i {
  font-size: 2.5rem;
  color: var(--color-success);
  margin-bottom: var(--space-1);
}

.register__success h2 {
  font-family: var(--font-heading);
  color: var(--color-text);
}

.register__success p {
  color: var(--color-neutral);
  font-size: 0.9rem;
  margin-bottom: var(--space-2);
}
</style>

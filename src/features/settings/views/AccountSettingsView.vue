<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import { useAuthStore } from '@/features/auth/store/auth.store'
import LanguageSwitcher from '@/shared/components/LanguageSwitcher.vue'
import { landingUrl } from '@/shared/links'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

function signOut() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="settings">
    <div>
      <h1>{{ t('settings.title') }}</h1>
      <p class="settings__intro">{{ t('settings.intro') }}</p>
    </div>

    <section class="card" aria-labelledby="language-title">
      <h2 id="language-title">{{ t('settings.languageTitle') }}</h2>
      <LanguageSwitcher />
      <p class="settings__help">{{ t('settings.languageHelp') }}</p>
    </section>

    <section class="card" aria-labelledby="account-title">
      <h2 id="account-title">{{ t('settings.accountTitle') }}</h2>
      <dl>
        <div><dt>{{ t('settings.name') }}</dt><dd>{{ auth.session?.fullName }}</dd></div>
        <div><dt>{{ t('settings.email') }}</dt><dd>{{ auth.session?.email }}</dd></div>
      </dl>
      <p class="settings__help">{{ t('settings.accountHelp') }}</p>
      <Button
        :label="t('settings.signOut')"
        icon="pi pi-sign-out"
        severity="secondary"
        outlined
        class="settings__signout"
        @click="signOut"
      />
    </section>

    <section class="card" aria-labelledby="legal-title">
      <h2 id="legal-title">{{ t('settings.legalTitle') }}</h2>
      <ul class="settings__links">
        <li><a :href="`${landingUrl}#terminos`" target="_blank" rel="noopener noreferrer">{{ t('app.terms') }}</a></li>
        <li><a :href="`${landingUrl}#privacidad`" target="_blank" rel="noopener noreferrer">{{ t('app.privacy') }}</a></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 720px;
  min-width: 0;
}

.settings h1 {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  color: var(--color-text);
}

.settings__intro,
.settings__help {
  color: var(--color-neutral);
}

.card {
  background: #fff;
  border: 1px solid #e3e9ea;
  border-radius: var(--radius-md);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

.card h2 {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  color: var(--color-text);
}

dl {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  width: 100%;
}

dl > div {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
  border-bottom: 1px solid #eef1f2;
  padding-bottom: 8px;
}

dt {
  color: var(--color-neutral);
}

dd {
  margin: 0;
  font-weight: 600;
  overflow-wrap: anywhere;
  text-align: right;
}

.settings__links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings__links a {
  color: var(--color-primary);
  font-weight: 600;
}
</style>

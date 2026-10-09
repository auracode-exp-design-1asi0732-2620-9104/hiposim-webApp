<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setLocale, type AppLocale } from '@/i18n'

const { t, locale } = useI18n()

const options: { value: AppLocale; label: string; name: string }[] = [
  { value: 'en', label: 'EN', name: 'English' },
  { value: 'es-419', label: 'ES', name: 'Español' },
]
</script>

<template>
  <div class="lang" role="group" :aria-label="t('app.language')">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="lang__btn"
      :class="{ 'lang__btn--active': locale === option.value }"
      :aria-pressed="locale === option.value"
      :aria-label="option.name"
      :lang="option.value"
      @click="setLocale(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.lang {
  display: inline-flex;
  border: 1px solid var(--color-primary);
  border-radius: 999px;
  overflow: hidden;
}

.lang__btn {
  min-width: 44px;
  min-height: 36px;
  border: none;
  background: #fff;
  color: var(--color-primary);
  font-family: var(--font-body);
  font-weight: 600;
  cursor: pointer;
}

.lang__btn--active {
  background: var(--color-primary);
  color: #fff;
}

.lang__btn:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: -3px;
}
</style>

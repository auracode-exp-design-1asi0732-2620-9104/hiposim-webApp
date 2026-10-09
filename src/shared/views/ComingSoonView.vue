<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

// The route carries the translation key of its title (see the router).
const title = computed(() => (route.meta.titleKey ? t(route.meta.titleKey as string) : t('comingSoon.fallbackTitle')))
</script>

<template>
  <section class="soon" aria-labelledby="soon-title">
    <i class="pi pi-clock soon__icon" aria-hidden="true" />
    <h1 id="soon-title">{{ title }}</h1>
    <p>{{ t('comingSoon.text') }}</p>
    <RouterLink :to="{ name: 'leads' }" class="soon__link">{{ t('comingSoon.back') }}</RouterLink>
  </section>
</template>

<style scoped>
.soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-3);
  text-align: center;
  color: var(--color-neutral);
}

.soon__icon {
  font-size: 2.5rem;
  color: var(--color-secondary);
}

.soon h1 {
  font-family: var(--font-heading);
  color: var(--color-text);
}

.soon__link {
  color: var(--color-primary);
  font-weight: 600;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { passwordRules } from '@/shared/validation/rules'

const props = defineProps<{ password: string }>()

const checks = computed(() =>
  passwordRules.map((rule) => ({ ...rule, passed: rule.test(props.password) })),
)

const strengthLabel = computed(() => {
  const passedCount = checks.value.filter((c) => c.passed).length
  if (passedCount <= 2) return { text: 'Débil', tone: 'weak' }
  if (passedCount <= 4) return { text: 'Media', tone: 'medium' }
  if (passedCount <= 5) return { text: 'Buena', tone: 'good' }
  return { text: 'Fuerte', tone: 'strong' }
})
</script>

<template>
  <div class="checklist">
    <div class="checklist__bar">
      <span
        v-for="n in 4"
        :key="n"
        class="checklist__segment"
        :class="{ 'checklist__segment--filled': n <= Math.ceil(checks.filter((c) => c.passed).length / 1.5) }"
        :data-tone="strengthLabel.tone"
      />
      <span class="checklist__strength-label" :data-tone="strengthLabel.tone">{{ strengthLabel.text }}</span>
    </div>

    <ul class="checklist__rules">
      <li v-for="rule in checks" :key="rule.key" :class="{ 'checklist__rule--passed': rule.passed }">
        <i :class="rule.passed ? 'pi pi-check-circle' : 'pi pi-circle'" />
        <span>{{ rule.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.checklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.checklist__bar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.checklist__segment {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: #e2e8e8;
}

.checklist__segment--filled[data-tone='weak'] {
  background: var(--color-error);
}

.checklist__segment--filled[data-tone='medium'] {
  background: var(--color-accent);
}

.checklist__segment--filled[data-tone='good'],
.checklist__segment--filled[data-tone='strong'] {
  background: var(--color-success);
}

.checklist__strength-label {
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--color-neutral);
}

.checklist__strength-label[data-tone='weak'] {
  color: var(--color-error);
}

.checklist__strength-label[data-tone='medium'] {
  color: var(--color-accent);
}

.checklist__strength-label[data-tone='good'],
.checklist__strength-label[data-tone='strong'] {
  color: var(--color-success);
}

.checklist__rules {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
}

.checklist__rules li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  color: var(--color-neutral);
}

.checklist__rules li i {
  font-size: 0.8rem;
}

.checklist__rule--passed {
  color: var(--color-success);
}

.checklist__rule--passed i {
  color: var(--color-success);
}
</style>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    withWordmark?: boolean
    light?: boolean
  }>(),
  { size: 56, withWordmark: true, light: false },
)
</script>

<template>
  <div class="logo" :style="{ '--icon-size': `${size}px` }">
    <svg viewBox="0 0 64 64" class="logo__icon" role="img" aria-label="HipoSim">
      <rect width="64" height="64" rx="15" fill="#0E5C63" />
      <g transform="translate(9,9) scale(0.72)">
        <path
          d="M32 9 L55 28 H49 V52 H15 V28 H9 Z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          stroke-width="2"
          stroke-linejoin="round"
        />
        <rect x="21" y="41" width="6" height="7" rx="1.5" fill="#0E5C63" />
        <rect x="29" y="36" width="6" height="12" rx="1.5" fill="#3AAFA9" />
        <rect x="37" y="30" width="6" height="18" rx="1.5" fill="#F5A524" />
      </g>
    </svg>

    <span v-if="withWordmark" class="logo__wordmark" :class="{ 'logo__wordmark--light': light }">
      <span class="logo__hipo">Hipo</span><span class="logo__sim">Sim</span>
    </span>
  </div>
</template>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.logo__icon {
  width: var(--icon-size);
  height: var(--icon-size);
  flex-shrink: 0;
}

.logo__wordmark {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.75rem;
  letter-spacing: -0.02em;
}

.logo__hipo {
  color: var(--color-primary);
}

.logo__sim {
  color: var(--color-accent);
}

.logo__wordmark--light .logo__hipo {
  color: #ffffff;
}

.logo__wordmark--light .logo__sim {
  color: var(--color-accent);
}
</style>

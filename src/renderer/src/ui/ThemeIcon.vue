<script setup lang="ts">
import { computed } from 'vue';
import type { Theme } from './theme';

const props = withDefaults(
  defineProps<{
    theme: Theme;
    size?: number;
  }>(),
  { size: 16 }
);

const sz = computed(() => `${props.size}px`);
</script>

<template>
  <!-- sun -->
  <svg
    v-if="theme === 'light'"
    :width="sz"
    :height="sz"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>

  <!-- moon -->
  <svg
    v-else-if="theme === 'dark'"
    :width="sz"
    :height="sz"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>

  <!-- system / monitor -->
  <svg
    v-else
    :width="sz"
    :height="sz"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </svg>
</template>
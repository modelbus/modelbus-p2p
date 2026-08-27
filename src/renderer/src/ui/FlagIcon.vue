<script setup lang="ts">
defineProps<{
  /** ISO-3166-1 alpha-2 country code, lowercased (e.g. 'cn', 'us'). */
  cc: string;
  /** Render width in px. Defaults to 20. */
  width?: number;
  /** Optional alt text for screen readers. */
  alt?: string;
}>();
</script>

<template>
  <img
    class="flag"
    :src="`./flags/${cc}.svg`"
    :alt="alt ?? cc"
    :width="width ?? 20"
    :height="(width ?? 20) * 0.66"
    loading="lazy"
    draggable="false"
  />
</template>

<style scoped>
.flag {
  display: inline-block;
  vertical-align: middle;
  border-radius: 2px;
  box-shadow: 0 0 0 1px var(--border);
  object-fit: cover;
  background: var(--panel-2);
}
</style>
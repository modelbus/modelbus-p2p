<script setup lang="ts">
import { ref, computed } from 'vue';
import type { AppRefs, AppActions, AppHelpers } from './types';
import { t } from '../i18n';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
}>();

const filter = ref('');

const filteredProviders = computed(() => {
  const q = filter.value.trim().toLowerCase();
  if (!q) return props.refs.providers.value;
  return props.refs.providers.value.filter(
    (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
  );
});
</script>

<template>
  <div>
    <div class="banner">{{ t('setup.hint') }}</div>

    <div class="card">
      <div class="toolbar-row">
        <button @click="actions.loadProviders(true)" :disabled="refs.providerLoading.value">
          {{ refs.providerLoading.value ? t('setup.loading') : t('setup.refresh') }}
        </button>
        <span class="muted">{{ t('setup.providerCount', { n: refs.providers.value.length }) }}</span>
      </div>

      <label>{{ t('setup.search') }}</label>
      <input v-model="filter" placeholder="…" />

      <div style="margin-top: 12px">
        <select
          size="8"
          style="height: auto; max-height: 280px"
          :value="refs.draft.value.providerId"
          @change="actions.selectProvider(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="p in filteredProviders" :key="p.id" :value="p.id">
            {{ p.name }} ({{ p.id }}) — {{ p.modelCount }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="refs.providerDetail.value" class="card">
      <h3>{{ t('setup.details') }}</h3>
      <dl class="kv">
        <dt>ID</dt>
        <dd>{{ refs.providerDetail.value.id }}</dd>
        <dt>{{ t('setup.npm') }}</dt>
        <dd>{{ refs.providerDetail.value.npm || '—' }}</dd>
        <dt>{{ t('setup.apiBase') }}</dt>
        <dd>{{ refs.providerDetail.value.api || '—' }}</dd>
        <dt>{{ t('setup.envVars') }}</dt>
        <dd>{{ refs.providerDetail.value.env.join(', ') || '—' }}</dd>
        <dt>{{ t('setup.doc') }}</dt>
        <dd>{{ refs.providerDetail.value.doc || '—' }}</dd>
        <dt>{{ t('setup.models') }}</dt>
        <dd>{{ refs.providerDetail.value.models.length }}</dd>
      </dl>
      <details>
        <summary>{{ t('setup.browseModels') }}</summary>
        <div class="chip-grid">
          <span v-for="m in refs.providerDetail.value.models" :key="m.id" class="chip">
            {{ m.id }}
            <span v-if="m.context" class="muted">
              · {{ t('setup.contextShort', { n: Math.round(m.context / 1024) }) }}
            </span>
          </span>
        </div>
      </details>
    </div>
  </div>
</template>
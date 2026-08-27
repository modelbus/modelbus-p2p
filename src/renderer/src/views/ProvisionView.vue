<script setup lang="ts">
import type { AppRefs, AppActions, AppHelpers } from './types';
import { t } from '../i18n';

defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
}>();
</script>

<template>
  <div>
    <div v-if="!refs.status.value.started" class="banner">
      {{ t('provision.offlineHint') }}
    </div>
    <div v-else-if="refs.provision.value" class="banner ok">
      {{ t('provision.activeHint', { provider: refs.provision.value.providerName, n: refs.provision.value.modelIds.length }) }}
    </div>

    <div class="card">
      <div class="row cols-2">
        <div>
          <label>{{ t('provision.provider') }}</label>
          <select
            :value="refs.draft.value.providerId"
            @change="actions.selectProvider(($event.target as HTMLSelectElement).value)"
          >
            <option value="">{{ t('setup.pickProvider') }}</option>
            <option v-for="p in refs.providers.value" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
        </div>
        <div>
          <label>{{ t('provision.nickname') }}</label>
          <input v-model="refs.draft.value.nickname" placeholder="so others can pick you" />
        </div>
      </div>
      <div class="row cols-2">
        <div>
          <label>{{ t('provision.apiBase') }}</label>
          <input
            v-model="refs.draft.value.apiBase"
            :placeholder="refs.providerDetail.value?.api ?? 'https://api.openai.com/v1'"
          />
        </div>
        <div>
          <label>{{ t('provision.apiKey') }}</label>
          <input type="password" v-model="refs.draft.value.apiKey" placeholder="sk-…" autocomplete="off" />
        </div>
      </div>

      <div v-if="refs.providerDetail.value" style="margin-top: 12px">
        <label>{{ t('provision.modelsToShare') }}</label>
        <div class="chip-grid">
          <span
            v-for="m in refs.providerDetail.value.models"
            :key="m.id"
            class="chip"
            :class="{ selected: refs.draft.value.selectedModels.includes(m.id) }"
            @click="actions.toggleModel(m)"
          >
            {{ m.id }}
          </span>
        </div>
        <div style="margin-top: 8px; display: flex; gap: 8px">
          <button @click="refs.draft.value.selectedModels = refs.providerDetail.value!.models.map((m) => m.id)">
            {{ t('actions.selectAll') }}
          </button>
          <button @click="refs.draft.value.selectedModels = []">
            {{ t('actions.clearSelection') }}
          </button>
        </div>
      </div>

      <div style="margin-top: 16px; display: flex; gap: 8px; align-items: center">
        <button
          class="primary"
          @click="actions.saveProvision"
          :disabled="!refs.draft.value.providerId || !refs.draft.value.apiKey"
        >
          {{ refs.provision.value ? t('actions.update') : t('actions.startSharing') }}
        </button>
        <button v-if="refs.provision.value" class="danger" @click="actions.clearProvision">
          {{ t('actions.stopSharing') }}
        </button>
        <span v-if="refs.error.value" class="tag danger">{{ refs.error.value }}</span>
      </div>
    </div>

    <div v-if="refs.provision.value" class="card">
      <h3>{{ t('actions.startSharing') }}</h3>
      <dl class="kv">
        <dt>{{ t('status.peer') }}</dt>
        <dd class="code">{{ refs.provision.value.peerId }}</dd>
        <dt>{{ t('provision.provider') }}</dt>
        <dd>{{ refs.provision.value.providerName }}</dd>
        <dt>{{ t('setup.models') }}</dt>
        <dd>{{ refs.provision.value.modelIds.join(', ') }}</dd>
        <dt>{{ t('status.listen') }}</dt>
        <dd>
          <div v-for="m in refs.status.value.multiaddrs" :key="m" class="code">{{ m }}</div>
        </dd>
      </dl>
    </div>
  </div>
</template>
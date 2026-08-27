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
    <div class="card">
      <div class="row cols-2">
        <div>
          <label>{{ t('settings.registryUrl') }}</label>
          <input
            v-model="refs.cfg.value.registryUrl"
            :placeholder="t('settings.registryHint')"
          />
          <div class="muted" style="margin-top: 4px; font-size: 11px">
            {{ t('settings.registryHint') }}
          </div>
        </div>
        <div>
          <label>{{ t('settings.tcpPort') }}</label>
          <input type="number" v-model.number="refs.cfg.value.tcpPort" />
        </div>
      </div>
      <div class="row">
        <div>
          <label>{{ t('settings.bootstrap') }}</label>
          <textarea
            v-model="refs.cfg.value.bootstrapMultiaddrs"
            rows="5"
            placeholder="/ip4/.../tcp/.../p2p/..."
          ></textarea>
        </div>
      </div>
      <div style="margin-top: 8px; display: flex; gap: 8px; align-items: center">
        <button class="primary" @click="actions.saveConfig">{{ t('actions.save') }}</button>
        <button @click="actions.loadConfig">{{ t('actions.reload') }}</button>
        <span class="muted">{{ t('settings.saveHint') }}</span>
      </div>
    </div>
  </div>
</template>
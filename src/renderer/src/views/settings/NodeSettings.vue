<script setup lang="ts">
import { t } from '../../i18n';
import type { AppRefs, AppActions, AppHelpers } from '../types';

defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
}>();
</script>

<template>
  <section class="settings-pane">
    <header class="pane-header">
      <h2>{{ t('settings.tab.node') }}</h2>
      <p class="muted">{{ t('settings.nodeHint') }}</p>
    </header>

    <div class="form-row">
      <div>
        <label>{{ t('settings.registryUrl') }}</label>
        <input v-model="refs.cfg.value.registryUrl" />
        <div class="hint">{{ t('settings.registryHint') }}</div>
      </div>
    </div>

    <div class="form-row cols-2">
      <div>
        <label>{{ t('settings.tcpPort') }}</label>
        <input type="number" v-model.number="refs.cfg.value.tcpPort" />
      </div>
      <div>
        <label>{{ t('settings.proxyPortField') }}</label>
        <input type="number" v-model.number="refs.cfg.value.proxyPort" />
      </div>
    </div>

    <div class="form-row">
      <div>
        <label>{{ t('settings.bootstrap') }}</label>
        <textarea
          v-model="refs.cfg.value.bootstrapMultiaddrs"
          rows="4"
          placeholder="/ip4/.../tcp/.../p2p/..."
        ></textarea>
      </div>
    </div>

    <div class="form-actions">
      <button class="primary" @click="actions.saveConfig">{{ t('actions.save') }}</button>
      <button @click="actions.loadConfig">{{ t('actions.reload') }}</button>
      <span class="muted">{{ t('settings.saveHint') }}</span>
    </div>
  </section>
</template>
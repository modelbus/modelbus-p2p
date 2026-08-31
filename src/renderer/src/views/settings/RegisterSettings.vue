<script setup lang="ts">
import { computed } from 'vue';
import { t } from '../../i18n';
import type { AppRefs, AppActions, AppHelpers } from '../types';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
}>();

const trustedNodes = computed(() =>
  props.refs.nodes.value.map((n) => ({
    peerId: n.peerId,
    nickname: n.nickname,
    providerName: n.providerName,
    modelIds: n.modelIds,
    trusted: n.trusted,
  }))
);
</script>

<template>
  <section class="settings-pane">
    <header class="pane-header">
      <h2>{{ t('settings.tab.register') }}</h2>
      <p class="muted">{{ t('settings.registerHint') }}</p>
    </header>

    <div class="form-row cols-2">
      <div>
        <label>{{ t('settings.registryUrl') }}</label>
        <input v-model="refs.cfg.value.registryUrl" />
      </div>
      <div>
        <label>{{ t('provision.nickname') }}</label>
        <input v-model="refs.draft.value.nickname" />
      </div>
    </div>

    <div class="form-actions">
      <button @click="actions.saveConfig">{{ t('actions.save') }}</button>
      <button class="primary" @click="actions.refreshNodes">
        {{ t('actions.refreshNodes') }}
      </button>
      <span class="muted">
        {{ refs.nodes.value.length }} {{ t('consume.modelCount', { n: '' }).trim() }}
      </span>
    </div>

    <p class="hint" style="margin-top: 16px;">{{ t('settings.trustHint') }}</p>

    <div class="trust-table-wrap">
      <table class="log-table">
        <thead>
          <tr>
            <th style="width: 90px;">{{ t('settings.trustBadge') }}</th>
            <th>{{ t('home.lbNickname') }}</th>
            <th style="width: 110px;">{{ t('settings.peerShort') }}</th>
            <th>{{ t('settings.providers') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in trustedNodes" :key="n.peerId">
            <td>
              <span v-if="n.trusted" class="tag success">
                {{ t('settings.trustTrusted') }}
              </span>
              <span v-else class="tag warn">
                {{ t('settings.trustQuarantine') }}
              </span>
            </td>
            <td>{{ n.nickname }}</td>
            <td class="muted peer-cell">{{ helpers.peerShort(n.peerId) }}</td>
            <td class="muted">
              {{ n.providerName }} · {{ n.modelIds.length }} {{ t('home.models') }}
            </td>
          </tr>
          <tr v-if="!trustedNodes.length">
            <td colspan="4" class="muted">{{ t('settings.trustEmpty') }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="hint" style="margin-top: 16px;">{{ t('settings.registerHowto') }}</p>
  </section>
</template>

<style scoped>
.trust-table-wrap {
  margin-top: 8px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.peer-cell {
  font-size: 12px;
}
</style>
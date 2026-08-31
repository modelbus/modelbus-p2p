<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { t } from '../i18n';
import type { AppRefs, AppActions, AppHelpers } from './types';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
}>();

const search = ref('');

const trustedNodes = computed(() => {
  const list = props.refs.nodes.value.map((n) => ({
    peerId: n.peerId,
    nickname: n.nickname,
    providerName: n.providerName,
    modelIds: n.modelIds,
    trusted: n.trusted,
  }));
  const q = search.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (n) =>
      n.nickname.toLowerCase().includes(q) ||
      n.providerName.toLowerCase().includes(q) ||
      n.peerId.toLowerCase().includes(q)
  );
});

const totalCount = computed(() => props.refs.nodes.value.length);

onMounted(() => {
  // Fire a refresh on first visit so the table isn't blank.
  if (!props.refs.nodes.value.length) {
    props.actions.refreshNodes();
  }
});
</script>

<template>
  <div>
    <header class="pane-header">
      <h2>{{ t('nodes.title') }}</h2>
      <p class="muted">{{ t('nodes.hint') }}</p>
    </header>

    <div class="nodes-toolbar">
      <div class="search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
          stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="search"
          :placeholder="t('nodes.searchPlaceholder')"
          class="search-input"
        />
      </div>
      <div class="toolbar-spacer" />
      <span class="muted count-tag">
        {{ totalCount }} {{ t('nodes.totalNodes') }}
      </span>
      <button class="primary" @click="actions.refreshNodes">
        {{ t('actions.refreshNodes') }}
      </button>
    </div>

    <p class="muted hint" style="margin: 0 0 12px;">{{ t('settings.trustHint') }}</p>

    <div class="nodes-table-wrap">
      <table class="log-table">
        <thead>
          <tr>
            <th style="width: 90px;">{{ t('settings.trustBadge') }}</th>
            <th>{{ t('home.lbNickname') }}</th>
            <th style="width: 110px;">{{ t('settings.peerShort') }}</th>
            <th>{{ t('settings.providers') }}</th>
            <th style="width: 110px;">{{ t('nodes.colModels') }}</th>
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
            <td class="muted">{{ n.providerName }}</td>
            <td class="muted">{{ n.modelIds.length }} {{ t('home.models') }}</td>
          </tr>
          <tr v-if="!trustedNodes.length">
            <td colspan="5" class="muted empty-row">
              {{ t('settings.trustEmpty') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.pane-header {
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}
.pane-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.pane-header .muted {
  margin: 6px 0 0;
  font-size: 13px;
}
.nodes-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.search {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px 10px;
  color: var(--muted);
  flex: 1;
  max-width: 360px;
}
.search:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}
.search-input {
  border: none;
  background: transparent;
  padding: 4px 0;
  width: 100%;
}
.search-input:focus {
  outline: none;
  border: none;
  box-shadow: none;
}
.toolbar-spacer {
  flex: 1;
}
.count-tag {
  font-size: 12px;
  margin-right: 4px;
}
.hint {
  font-size: 11px;
  line-height: 1.45;
}
.nodes-table-wrap {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.peer-cell {
  font-size: 12px;
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
}
.empty-row {
  text-align: center;
  padding: 24px 0;
}
</style>
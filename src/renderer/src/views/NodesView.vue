<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { t } from '../i18n';
import type { AppRefs, AppActions, AppHelpers } from './types';
import { useNodePrefs } from '../composables/nodePrefs';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
}>();

const search = ref('');
const showBlacklisted = ref(false);

const { isPinned, togglePin, isBlacklisted, toggleBlacklist } = useNodePrefs();

const proxyTarget = computed(() => props.refs.proxyTarget.value);
const proxyPort = computed(() => props.refs.proxyPort.value);
const proxyStats = computed(() => props.refs.proxyStats.value);

const busyPeer = ref<string | null>(null);
const proxyError = ref<string | null>(null);

async function refreshProxy() {
  try {
    const [t, cfg] = await Promise.all([
      window.modelbus.proxy.target(),
      window.modelbus.bootstrap.getConfig(),
    ]);
    props.refs.proxyTarget.value = t;
    props.refs.proxyPort.value = cfg.proxyPort;
  } catch (err) {
    proxyError.value = (err as Error).message;
  }
}

async function useNode(peerId: string) {
  proxyError.value = null;
  busyPeer.value = peerId;
  try {
    await window.modelbus.proxy.setTarget(peerId);
    await refreshProxy();
  } catch (err) {
    proxyError.value = (err as Error).message;
  } finally {
    busyPeer.value = null;
  }
}

async function stopUsing() {
  proxyError.value = null;
  try {
    await window.modelbus.proxy.clearTarget();
    await refreshProxy();
  } catch (err) {
    proxyError.value = (err as Error).message;
  }
}

async function connectSelf() {
  proxyError.value = null;
  busyPeer.value = 'self';
  try {
    await window.modelbus.proxy.startAt();
    await refreshProxy();
  } catch (err) {
    proxyError.value = (err as Error).message;
  } finally {
    busyPeer.value = null;
  }
}

let timer: number | undefined;
let proxyTimer: number | undefined;
onMounted(() => {
  props.actions.refreshNodes();
  refreshProxy();
  timer = window.setInterval(props.actions.refreshNodes, 12_000);
  proxyTimer = window.setInterval(refreshProxy, 4_000);
  window.modelbus.proxy.onEvent((evt) => {
    if (
      evt.type === 'target:set' ||
      evt.type === 'proxy:started' ||
      evt.type === 'proxy:stopped'
    ) {
      refreshProxy();
    }
  });
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
  if (proxyTimer) window.clearInterval(proxyTimer);
});

function qualityClass(q: number): string {
  if (q >= 75) return 'success';
  if (q >= 45) return 'warn';
  return 'danger';
}

function speedClass(latencyMs: number): 'fast' | 'medium' | 'slow' {
  if (latencyMs < 400) return 'fast';
  if (latencyMs < 900) return 'medium';
  return 'slow';
}

function fmtMin(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/**
 * Sort order:
 *   1. pinned   (top)
 *   2. quality desc
 *   3. self first, then by nickname
 *
 * Blacklisted nodes are excluded unless `showBlacklisted` is on.
 */
const visibleNodes = computed(() => {
  const all = props.refs.nodes.value;
  const q = search.value.trim().toLowerCase();
  const filtered = all.filter((n) => {
    if (!showBlacklisted.value && isBlacklisted(n.peerId)) return false;
    if (!q) return true;
    return (
      n.nickname.toLowerCase().includes(q) ||
      n.providerName.toLowerCase().includes(q) ||
      n.peerId.toLowerCase().includes(q)
    );
  });
  return filtered.slice().sort((a, b) => {
    const pa = isPinned(a.peerId) ? 0 : 1;
    const pb = isPinned(b.peerId) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    if (a.quality !== b.quality) return b.quality - a.quality;
    if (a.self && !b.self) return -1;
    if (!a.self && b.self) return 1;
    return a.nickname.localeCompare(b.nickname);
  });
});
</script>

<template>
  <div>
    <header class="pane-header">
      <h2>{{ t('nodes.title') }}</h2>
      <p class="muted">{{ t('nodes.hint') }}</p>
    </header>

    <!-- ===== Consumer proxy status card ===== -->
    <section class="card proxy-card">
      <div class="proxy-row">
        <div>
          <span class="muted">{{ t('consume.proxyStatus') }}：</span>
          <span v-if="proxyTarget.peerId" class="tag success">
            {{ t('consume.running', { port: proxyPort }) }}
          </span>
          <span v-else class="tag">{{ t('consume.idle') }}</span>
          <span
            v-if="proxyTarget.peerId"
            class="muted"
            style="font-size: 12px; margin-left: 8px;"
          >
            {{ t('consume.target') }}: {{ proxyTarget.nickname }}
            ({{ proxyTarget.peerId.slice(0, 8) }}…)
          </span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="primary" @click="connectSelf" :disabled="busyPeer === 'self'">
            {{ busyPeer === 'self' ? '…' : t('models.connectSelf') }}
          </button>
          <button v-if="proxyTarget.peerId" class="danger" @click="stopUsing">
            {{ t('actions.stopUsing') }}
          </button>
          <span v-if="proxyError" class="tag danger">{{ proxyError }}</span>
        </div>
      </div>
      <p class="muted" style="margin: 6px 0 0; font-size: 11px;">
        {{ t('models.connectSelfHint', { port: proxyPort }) }}
      </p>
    </section>

    <!-- ===== Toolbar ===== -->
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
      <label class="blacklist-toggle">
        <input type="checkbox" v-model="showBlacklisted" />
        <span>{{
          showBlacklisted ? t('nodes.hideBlacklisted') : t('nodes.showBlacklisted')
        }}</span>
      </label>
      <div class="toolbar-spacer" />
      <span class="muted count-tag">{{ visibleNodes.length }} {{ t('nodes.totalNodes') }}</span>
      <button class="primary" @click="actions.refreshNodes">
        {{ t('actions.refreshNodes') }}
      </button>
    </div>

    <p class="muted hint" style="margin: 0 0 12px;">{{ t('settings.trustHint') }}</p>

    <!-- ===== Nodes table ===== -->
    <div class="nodes-table-wrap">
      <table class="log-table">
        <thead>
          <tr>
            <th style="width: 90px;">{{ t('settings.trustBadge') }}</th>
            <th>{{ t('home.lbNickname') }}</th>
            <th>{{ t('nodes.colAddress') }}</th>
            <th>{{ t('settings.providers') }}</th>
            <th>{{ t('nodes.colModels') }}</th>
            <th style="width: 110px;">{{ t('nodes.colQuality') }}</th>
            <th style="width: 80px;" class="num">{{ t('nodes.colUptime') }}</th>
            <th style="width: 80px;" class="num">{{ t('nodes.colRequests') }}</th>
            <th style="width: 80px;" class="num">{{ t('nodes.colLatency') }}</th>
            <th style="width: 60px;">{{ t('nodes.colStatus') }}</th>
            <th style="width: 200px;">{{ t('nodes.colAction') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="n in visibleNodes"
            :key="n.peerId + '::' + n.provider"
            :class="{
              'self-row': n.self,
              'pinned-row': isPinned(n.peerId),
              'blacklisted-row': isBlacklisted(n.peerId)
            }"
          >
            <td>
              <span v-if="n.trusted" class="tag success">
                {{ t('settings.trustTrusted') }}
              </span>
              <span v-else class="tag warn">
                {{ t('settings.trustQuarantine') }}
              </span>
            </td>
            <td>
              <div class="nick-cell">
                <strong>{{ n.nickname }}</strong>
                <span v-if="n.self" class="tag accent">{{ t('models.selfBadge') }}</span>
                <span v-if="isPinned(n.peerId)" class="tag accent pinned-tag">
                  {{ t('nodes.pinnedBadge') }}
                </span>
                <span v-if="isBlacklisted(n.peerId)" class="tag danger blacklisted-tag">
                  {{ t('nodes.blacklistedBadge') }}
                </span>
              </div>
            </td>
            <td class="muted peer-cell">{{ n.peerId }}</td>
            <td class="muted">{{ n.providerName }}</td>
            <td class="muted">{{ n.modelIds.length }}</td>
            <td>
              <span class="quality-bar" :class="qualityClass(n.quality)">
                <span class="quality-fill" :style="{ width: n.quality + '%' }" />
                <span class="quality-val">{{ n.quality }}</span>
              </span>
            </td>
            <td class="num muted">{{ fmtMin(n.uptimeMinutes) }}</td>
            <td class="num muted">{{ n.servedRequests }}</td>
            <td class="num muted">{{ n.avgLatencyMs }}ms</td>
            <td>
              <span class="speed-dot" :class="speedClass(n.avgLatencyMs)" />
            </td>
            <td>
              <div class="action-row">
                <button
                  v-if="proxyTarget.peerId !== n.peerId"
                  class="primary action-btn"
                  :disabled="busyPeer === n.peerId"
                  @click="useNode(n.peerId)"
                >
                  {{ busyPeer === n.peerId ? '…' : t('actions.use') }}
                </button>
                <button
                  v-else
                  class="danger action-btn"
                  @click="stopUsing"
                >
                  {{ t('actions.stopUsing') }}
                </button>
                <button
                  class="ghost action-btn"
                  :title="isPinned(n.peerId) ? t('nodes.unpinTooltip') : t('nodes.pinTooltip')"
                  @click="togglePin(n.peerId)"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.7"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 17v5" />
                    <path d="M9 10.76V6h6v4.76l3 4.24V17H6v-2z" />
                  </svg>
                  <span>{{ isPinned(n.peerId) ? t('nodes.unpin') : t('nodes.togglePin') }}</span>
                </button>
                <button
                  class="ghost action-btn"
                  :title="isBlacklisted(n.peerId) ? t('nodes.unblacklistTooltip') : t('nodes.blacklistTooltip')"
                  @click="toggleBlacklist(n.peerId)"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.7"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
                  </svg>
                  <span>{{ isBlacklisted(n.peerId) ? t('nodes.unblacklist') : t('nodes.toggleBlacklist') }}</span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!visibleNodes.length">
            <td colspan="11" class="muted empty-row">
              {{ search.trim() ? t('nodes.emptyWithFilter') : t('settings.trustEmpty') }}
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

.proxy-card {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}
.proxy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.nodes-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
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
.blacklist-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
  user-select: none;
}
.blacklist-toggle input {
  margin: 0;
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
.nodes-table-wrap .log-table th,
.nodes-table-wrap .log-table td {
  white-space: nowrap;
}
.nodes-table-wrap .log-table th.num,
.nodes-table-wrap .log-table td.num {
  text-align: right;
}
.self-row {
  background: var(--accent-soft);
}
.pinned-row td:first-child,
.pinned-row {
  box-shadow: inset 3px 0 0 var(--accent);
}
.blacklisted-row td {
  opacity: 0.55;
  text-decoration: line-through;
}

.nick-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.pinned-tag {
  font-size: 10px;
}
.blacklisted-tag {
  font-size: 10px;
}

.peer-cell {
  font-size: 11px;
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quality-bar {
  position: relative;
  display: inline-block;
  width: 90px;
  height: 16px;
  background: var(--panel-2);
  border-radius: 8px;
  overflow: hidden;
  vertical-align: middle;
}
.quality-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--muted);
  transition: width 0.3s;
}
.quality-bar.success .quality-fill { background: var(--accent-2); }
.quality-bar.warn .quality-fill { background: var(--warn); }
.quality-bar.danger .quality-fill { background: var(--danger); }
.quality-val {
  position: relative;
  display: inline-block;
  width: 100%;
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  color: var(--text);
}

.speed-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.speed-dot.fast { background: var(--accent-2); box-shadow: 0 0 4px var(--accent-2); }
.speed-dot.medium { background: var(--warn); }
.speed-dot.slow { background: var(--danger); }

.action-row {
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}
.action-btn {
  padding: 3px 10px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.action-btn svg {
  flex-shrink: 0;
}

.empty-row {
  text-align: center;
  padding: 24px 0;
}

@media (max-width: 1100px) {
  .nodes-table-wrap .log-table {
    font-size: 11px;
  }
  .peer-cell {
    max-width: 140px;
  }
}
</style>
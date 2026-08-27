<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type {
  NodeAnnouncement,
  ProvisionConfig,
  WalletScore,
  ModelEntry,
  ModelQualityNode,
  LeaderboardEntry,
} from '@shared/types';
import type { AppRefs, AppActions, AppHelpers } from './types';
import { t } from '../i18n';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
}>();

// Remote state that lives outside AppRefs — wallet score, models catalogue.
const wallet = ref<WalletScore | null>(null);
const models = ref<ModelEntry[]>([]);
const leaderboard = ref<LeaderboardEntry[]>([]);
const apiKey = ref<string>(
  (typeof localStorage !== 'undefined' && localStorage.getItem('modelbus.consumer.apiKey')) || ''
);
const refreshing = ref(false);

async function refreshAll() {
  refreshing.value = true;
  try {
    const [w, c] = await Promise.all([
      window.modelbus.wallet.score(),
      window.modelbus.models.catalogue(),
    ]);
    wallet.value = w;
    models.value = c.models;
    leaderboard.value = c.leaderboard;
  } finally {
    refreshing.value = false;
  }
}

const localPeerId = computed(() => props.refs.status.value?.peerId ?? null);

const consumerKeyConfigured = computed(() => !!apiKey.value);

const localEndpoint = computed(() => `http://127.0.0.1:${props.refs.proxyPort.value}`);

const isProvisioning = computed(() => !!props.refs.provision.value);

const curlExample = computed(() => {
  const model = props.refs.provision.value?.modelIds[0] ?? '<model-id>';
  return `curl ${localEndpoint.value}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey.value || '<your-api-key>'}" \\
  -d '{ "model": "${model}", "messages": [{"role":"user","content":"hi"}] }'`;
});

const nodeModels = computed(() => {
  // Group by provider for the shared-tokens list.
  const p = props.refs.provision.value;
  return p ? p.modelIds : [];
});

const consumeNode = computed(() => props.refs.proxyTarget.value);

let pollTimer: number | undefined;
onMounted(() => {
  refreshAll();
  pollTimer = window.setInterval(refreshAll, 10_000);
});
onBeforeUnmount(() => {
  if (pollTimer) window.clearInterval(pollTimer);
});

function goProvision() {
  // Switch to settings → provision sub-tab
  // The simplest way: dispatch a custom event the App.vue listens for.
  window.dispatchEvent(new CustomEvent('modelbus:nav', { detail: { tab: 'settings', sub: 'provision' } }));
}
function goService() {
  window.dispatchEvent(new CustomEvent('modelbus:nav', { detail: { tab: 'settings', sub: 'service' } }));
}
function goConsume() {
  window.dispatchEvent(new CustomEvent('modelbus:nav', { detail: { tab: 'settings', sub: 'node' } }));
}

function fmtMin(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h < 24) return `${h}h${r ? ` ${r}m` : ''}`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return `${d}d${rh ? ` ${rh}h` : ''}`;
}

function qualityClass(q: number): string {
  if (q >= 75) return 'success';
  if (q >= 45) return 'warn';
  return 'danger';
}
</script>

<template>
  <div class="home-stack">
    <!-- ============ Block 1: 节点信息 ============ -->
    <section class="card home-block">
      <h3>{{ t('home.nodeInfo') }}</h3>
      <div class="node-info-grid">
        <div class="node-info-main">
          <div class="kvline">
            <span class="muted">{{ t('home.peerId') }}</span>
            <span class="code short">{{ localPeerId ?? t('status.placeholder') }}</span>
          </div>
          <div class="kvline">
            <span class="muted">{{ t('home.role') }}</span>
            <span class="tag" :class="{ success: refs.status.value.started }">
              {{ refs.status.value.role === 'provision'
                  ? t('status.roleProvision')
                  : refs.status.value.role === 'consume'
                  ? t('status.roleConsume')
                  : t('status.roleIdle') }}
            </span>
            <span class="muted">·</span>
            <span class="muted">{{ t('home.connections') }}: {{ refs.status.value.connected }}</span>
          </div>
          <div class="kvline" v-if="refs.status.value.multiaddrs.length">
            <span class="muted">{{ t('status.listen') }}</span>
            <span class="code short addr-list">
              {{ refs.status.value.multiaddrs[0] }}
              <span v-if="refs.status.value.multiaddrs.length > 1" class="muted">
                +{{ refs.status.value.multiaddrs.length - 1 }}
              </span>
            </span>
          </div>
        </div>
        <div class="node-info-actions">
          <button v-if="!refs.status.value.started" class="primary" @click="actions.startNode">
            {{ t('actions.start') }}
          </button>
          <button v-else class="danger" @click="actions.stopNode">
            {{ t('actions.stop') }}
          </button>
        </div>
      </div>
    </section>

    <!-- ============ Block 2: 我使用的 Token、共享的 Token ============ -->
    <section class="card home-block home-block-tokens">
      <div class="tokens-cols">
        <div class="tokens-col">
          <h3>{{ t('home.tokenShared') }}</h3>
          <div v-if="isProvisioning" class="token-summary">
            <div class="kvline">
              <span class="muted">{{ t('provision.provider') }}</span>
              <span class="tag accent">{{ refs.provision.value!.providerName }}</span>
            </div>
            <div class="kvline">
              <span class="muted">{{ t('provision.nickname') }}</span>
              <span>{{ refs.provision.value!.nickname }}</span>
            </div>
            <div class="kvline">
              <span class="muted">{{ t('home.modelsShared') }}</span>
              <span>{{ nodeModels.length }}</span>
            </div>
            <div class="model-chips">
              <span v-for="m in nodeModels" :key="m" class="chip selected">{{ m }}</span>
              <span v-if="!nodeModels.length" class="muted">—</span>
            </div>
          </div>
          <div v-else class="empty-hint">
            {{ t('home.tokenSharedEmpty') }}
          </div>
        </div>

        <div class="tokens-divider" />

        <div class="tokens-col">
          <h3>{{ t('home.tokenUsed') }}</h3>
          <div v-if="consumeNode.peerId" class="token-summary">
            <div class="kvline">
              <span class="muted">{{ t('consume.target') }}</span>
              <span class="tag accent">{{ consumeNode.nickname }}</span>
            </div>
            <div class="kvline">
              <span class="muted">{{ t('consume.proxyStatus') }}</span>
              <span class="tag success">{{ t('consume.running', { port: refs.proxyPort.value }) }}</span>
            </div>
            <div class="kvline">
              <span class="muted">{{ t('home.modelsAvailable') }}</span>
              <span>{{ models.length }}</span>
            </div>
          </div>
          <div v-else class="empty-hint">
            {{ t('home.tokenUsedEmpty') }}
          </div>
        </div>
      </div>
    </section>

    <!-- ============ Block 3: 上线状态引导 ============ -->
    <section class="card home-block">
      <h3>{{ t('home.provisionGuide') }}</h3>
      <div v-if="!isProvisioning" class="guide not-started">
        <div class="guide-icon">🚀</div>
        <div class="guide-body">
          <div class="guide-title">{{ t('home.notProvisionedTitle') }}</div>
          <div class="guide-desc">{{ t('home.notProvisionedDesc') }}</div>
        </div>
        <button class="primary" @click="goProvision">
          {{ t('home.startProvisionNow') }}
        </button>
      </div>
      <div v-else class="guide started">
        <div class="guide-icon">✅</div>
        <div class="guide-body">
          <div class="guide-title">{{ t('home.provisionedTitle', { provider: refs.provision.value!.providerName }) }}</div>
          <div class="guide-desc">
            {{ t('home.provisionedDesc', { n: nodeModels.length }) }}
          </div>
        </div>
        <button @click="goProvision">{{ t('home.modifyProvision') }}</button>
      </div>
    </section>

    <!-- ============ Block 4: 开放调用服务 ============ -->
    <section class="card home-block">
      <h3>{{ t('home.serviceApi') }}</h3>
      <div v-if="!isProvisioning" class="guide not-started">
        <div class="guide-body">
          <div class="guide-desc">{{ t('home.serviceNoProvision') }}</div>
        </div>
        <button class="primary" @click="goProvision">{{ t('home.startProvisionNow') }}</button>
      </div>
      <div v-else class="service-grid">
        <div class="service-row">
          <span class="muted">{{ t('home.apiKey') }}</span>
          <span class="code short">
            <template v-if="consumerKeyConfigured">
              <span class="api-key-mask">••••••••</span>
            </template>
            <template v-else>
              <span class="muted">{{ t('home.apiKeyMissing') }}</span>
            </template>
          </span>
          <button class="ghost" @click="goService">{{ t('home.configure') }}</button>
        </div>
        <div class="service-row">
          <span class="muted">{{ t('home.models') }}</span>
          <span class="model-chips">
            <span v-for="m in nodeModels" :key="m" class="chip">{{ m }}</span>
          </span>
        </div>
        <div class="service-row">
          <span class="muted">{{ t('home.port') }}</span>
          <span class="code short">{{ refs.proxyPort.value }}</span>
          <span class="muted">{{ t('home.url') }}</span>
          <span class="code short">{{ localEndpoint }}</span>
        </div>
        <div>
          <div class="muted" style="font-size: 11px; margin-bottom: 4px;">
            {{ t('home.usageHint') }}
          </div>
          <pre class="code">{{ curlExample }}</pre>
        </div>
      </div>
    </section>

    <!-- ============ Block 5: 排行榜 ============ -->
    <section class="card home-block">
      <h3>{{ t('home.leaderboard') }}</h3>
      <div v-if="leaderboard.length" class="leaderboard">
        <div class="leaderboard-row leaderboard-head">
          <span>#</span>
          <span>{{ t('home.lbNickname') }}</span>
          <span>{{ t('home.lbProvider') }}</span>
          <span class="num">{{ t('home.lbQuality') }}</span>
          <span class="num">{{ t('home.lbUptime') }}</span>
          <span class="num">{{ t('home.lbRequests') }}</span>
          <span class="num">{{ t('home.lbLatency') }}</span>
        </div>
        <div
          v-for="row in leaderboard.slice(0, 8)"
          :key="row.peerId"
          class="leaderboard-row"
          :class="{ self: row.peerId === localPeerId }"
        >
          <span class="rank">{{ row.rank }}</span>
          <span class="nickname">
            {{ row.nickname }}
            <span v-if="row.peerId === localPeerId" class="tag accent" style="font-size: 10px;">you</span>
          </span>
          <span class="provider muted">{{ row.provider }}</span>
          <span class="num">
            <span class="quality-bar" :class="qualityClass(row.quality)">
              <span class="quality-fill" :style="{ width: row.quality + '%' }" />
              <span class="quality-val">{{ row.quality }}</span>
            </span>
          </span>
          <span class="num muted">{{ fmtMin(row.onlineMinutes) }}</span>
          <span class="num muted">{{ row.servedRequests }}</span>
          <span class="num muted">{{ row.avgLatencyMs }}ms</span>
        </div>
      </div>
      <div v-else class="muted">{{ t('home.leaderboardEmpty') }}</div>
    </section>

    <div class="home-refresh-row">
      <button class="ghost" @click="refreshAll" :disabled="refreshing">
        {{ refreshing ? t('setup.loading') : t('actions.refresh') }}
      </button>
      <span class="muted" style="font-size: 11px;">
        {{ wallet ? t('home.walletShort', { tokens: wallet.tokens.toFixed(2) }) : '' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.home-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.home-block h3 {
  margin: 0 0 10px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  font-weight: 600;
}

.node-info-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.node-info-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
}
.node-info-actions {
  flex-shrink: 0;
}
.kvline {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  min-width: 0;
}
.kvline > .code {
  font-size: 11px;
  padding: 4px 8px;
}
.kvline > .muted {
  width: 70px;
  flex-shrink: 0;
}
.code.short {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.addr-list {
  flex: 1;
}

.tokens-cols {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 16px;
  align-items: start;
}
.tokens-col h3 {
  margin-top: 0;
}
.tokens-divider {
  background: var(--border);
  width: 1px;
  height: 100%;
}
.tokens-col {
  min-width: 0;
}
.token-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.empty-hint {
  color: var(--muted);
  font-size: 12px;
  padding: 12px 0;
}
.model-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.guide {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-elev);
}
.guide.started {
  background: var(--accent-2-soft);
  border-color: transparent;
}
.guide.not-started {
  background: var(--warn-soft);
  border-color: transparent;
}
.guide-icon {
  font-size: 24px;
  line-height: 1;
}
.guide-body {
  flex: 1;
  min-width: 0;
}
.guide-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}
.guide-desc {
  font-size: 12px;
  color: var(--text-soft);
}

.service-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.service-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
}
.service-row > .muted {
  width: 80px;
  flex-shrink: 0;
}
.api-key-mask {
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  letter-spacing: 2px;
}

.leaderboard {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.leaderboard-row {
  display: grid;
  grid-template-columns: 36px 1fr 1fr 140px 80px 80px 80px;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--bg-elev);
  font-size: 12px;
}
.leaderboard-row.self {
  background: var(--accent-soft);
}
.leaderboard-row.leaderboard-head {
  background: transparent;
  color: var(--muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: 4px;
}
.leaderboard-row .num {
  text-align: right;
}
.leaderboard-row .rank {
  font-weight: 600;
  text-align: center;
}
.quality-bar {
  position: relative;
  display: inline-block;
  width: 120px;
  height: 18px;
  background: var(--panel-2);
  border-radius: 9px;
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
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  color: var(--text);
}

.home-refresh-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  align-items: center;
}
</style>
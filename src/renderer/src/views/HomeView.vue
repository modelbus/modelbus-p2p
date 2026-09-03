<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import type {
  ProvisionConfig,
  WalletScore,
  ModelEntry,
  LeaderboardEntry,
} from '@shared/types';
import type { AppRefs, AppActions, AppHelpers } from './types';
import { t } from '../i18n';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
}>();

// ---- Wallet + catalogue state -------------------------------------------------
const wallet = ref<WalletScore | null>(null);
const models = ref<ModelEntry[]>([]);
const leaderboard = ref<LeaderboardEntry[]>([]);
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

// ---- Ephemeral UI state -------------------------------------------------------
const apiKey = ref<string>(
  (typeof localStorage !== 'undefined' && localStorage.getItem('modelbus.consumer.apiKey')) || ''
);
const helpModalOpen = ref(false);
const serviceModalOpen = ref(false);
const now = ref(Date.now());
let nowTimer: number | undefined;

// When the local P2P node starts/stops we record the wall-clock timestamp so we
// can show "today / this month" online time even though the wallet only carries
// the cumulative uptime.
const startedAt = ref<number | null>(
  props.refs.status.value.started ? Date.now() : null
);
watch(
  () => props.refs.status.value.started,
  (v) => {
    startedAt.value = v ? Date.now() : null;
  }
);

// ---- Local data derivations ---------------------------------------------------
const localPeerId = computed(() => props.refs.status.value.peerId ?? null);
const isProvisioning = computed(() => !!props.refs.provision.value);
const nodeModels = computed(() => {
  const p = props.refs.provision.value;
  return p ? p.providers.flatMap((x) => x.modelIds) : [];
});
const nodeProviderNames = computed(() => {
  const p = props.refs.provision.value;
  return p ? p.providers.map((x) => x.providerName) : [];
});
const consumerKeyConfigured = computed(() => !!apiKey.value);
const localEndpoint = computed(
  () => `http://127.0.0.1:${props.refs.proxyPort.value}`
);

/**
 * Estimate tokens ~ bytes / 4. The proxy statistics track bytes sent/received
 * for chat-completions-style traffic; we use a conservative 4-bytes-per-token
 * ratio so the dashboard is at least directionally correct without parsing
 * OpenAI-style response bodies.
 */
const CHARS_PER_TOKEN = 4;
function bytesToTokens(bytes: number): number {
  return Math.round(bytes / CHARS_PER_TOKEN);
}

const todayStart = computed(() => {
  const d = new Date(now.value);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
});
const monthStart = computed(() => {
  const d = new Date(now.value);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
});
const sessionUptimeMs = computed(() =>
  props.refs.status.value.started && startedAt.value
    ? Math.max(0, now.value - startedAt.value)
    : 0
);

const onlineTodayMs = computed(() => {
  if (!sessionUptimeMs.value) return 0;
  const sinceMidnight = now.value - todayStart.value;
  return Math.min(sessionUptimeMs.value, sinceMidnight);
});

const totalOnlineMs = computed(() => {
  // Prefer wallet minutes (cumulative across sessions); fall back to this
  // session's clock if the wallet hasn't loaded yet.
  if (wallet.value) return wallet.value.onlineMinutes * 60_000;
  return sessionUptimeMs.value;
});

/** Filter the recent proxy log window to today's / month's rows. The proxy
 *  keeps at most the last 500 entries, which is enough resolution for a
 *  personal LLM proxy — anything busier than ~250 req/day would exceed it. */
const logsToday = computed(
  () => props.refs.proxyLogs.value.filter((l) => l.ts >= todayStart.value)
);
const logsMonth = computed(
  () => props.refs.proxyLogs.value.filter((l) => l.ts >= monthStart.value)
);

const requestsToday = computed(() => logsToday.value.length);
const requestsMonth = computed(() => logsMonth.value.length);

/**
 * Tokens are estimated by prorating the cumulative proxyStats bytes by the
 * share of today's / month's requests. This is intentionally an estimate —
 * the proxy does not parse upstream usage objects yet.
 */
const totalBytes = computed(
  () =>
    props.refs.proxyStats.value.bytesReceived +
    props.refs.proxyStats.value.bytesSent
);
const totalRequests = computed(() => props.refs.proxyStats.value.totalRequests);

const tokensToday = computed(() => {
  const r = totalRequests.value;
  if (!r) return 0;
  return Math.round((requestsToday.value / r) * bytesToTokens(totalBytes.value));
});
const tokensMonth = computed(() => {
  const r = totalRequests.value;
  if (!r) return 0;
  return Math.round((requestsMonth.value / r) * bytesToTokens(totalBytes.value));
});

const connections = computed(() => props.refs.status.value.connected);
const score = computed(() =>
  wallet.value ? wallet.value.tokens.toFixed(2) : '—'
);

function fmtMin(ms: number): string {
  const totalMin = Math.floor(ms / 60_000);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const r = totalMin % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

function qualityClass(q: number): string {
  if (q >= 75) return 'success';
  if (q >= 45) return 'warn';
  return 'danger';
}

// ---- Refresh cadence ----------------------------------------------------------
let pollTimer: number | undefined;
onMounted(() => {
  refreshAll();
  pollTimer = window.setInterval(refreshAll, 10_000);
  nowTimer = window.setInterval(() => (now.value = Date.now()), 30_000);
});
onBeforeUnmount(() => {
  if (pollTimer) window.clearInterval(pollTimer);
  if (nowTimer) window.clearInterval(nowTimer);
});

// ---- Navigation helpers -------------------------------------------------------
function goProvision() {
  window.dispatchEvent(
    new CustomEvent('modelbus:nav', {
      detail: { tab: 'settings', sub: 'provision' },
    })
  );
}
function goService() {
  window.dispatchEvent(
    new CustomEvent('modelbus:nav', {
      detail: { tab: 'settings', sub: 'service' },
    })
  );
}

// ---- Demo curl for the help / service modals ---------------------------------
const helpModelExample = computed(() => {
  const m = models.value[0]?.id ?? '<model-id>';
  return `curl ${localEndpoint.value}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey.value || '<your-api-key>'}" \\
  -d '{ "model": "${m}", "messages": [{"role":"user","content":"hi"}] }'`;
});

const serviceCurlExample = computed(() => {
  const m = nodeModels.value[0] ?? '<model-id>';
  return `curl ${localEndpoint.value}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey.value || '<your-api-key>'}" \\
  -d '{ "model": "${m}", "messages": [{"role":"user","content":"hi"}] }'`;
});
</script>

<template>
  <div class="home-stack">
    <!-- ============ Stats row ============ -->
    <section class="stats-grid card" aria-label="stats">
      <div class="stat-card">
        <div class="stat-label">{{ t('home.statScore') }}</div>
        <div class="stat-value">{{ score }}</div>
        <div class="stat-unit">{{ t('home.statScoreUnit') }}</div>
        <div class="stat-hint muted">{{ t('home.statScoreHint') }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">{{ t('home.statOnline') }}</div>
        <div class="stat-value">
          {{ fmtMin(onlineTodayMs) }} <span class="stat-divider">/</span>
          <span class="muted">{{ fmtMin(totalOnlineMs) }}</span>
        </div>
        <div class="stat-meta">
          <span>{{ t('home.statOnlineToday') }}</span>
          <span class="stat-divider">·</span>
          <span>{{ t('home.statOnlineTotal') }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-label">{{ t('home.statTokens') }}</div>
        <div class="stat-value">
          {{ fmtTokens(tokensToday) }}
          <span class="stat-divider">/</span>
          <span class="muted">{{ fmtTokens(tokensMonth) }}</span>
        </div>
        <div class="stat-meta">
          <span>{{ t('home.statTokensToday') }}</span>
          <span class="stat-divider">·</span>
          <span>{{ t('home.statTokensMonth') }}</span>
        </div>
        <div class="stat-hint muted">{{ t('home.statTokensHint') }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">{{ t('home.statRequests') }}</div>
        <div class="stat-value">
          {{ requestsToday }}
          <span class="stat-divider">/</span>
          <span class="muted">{{ requestsMonth }}</span>
        </div>
        <div class="stat-meta">
          <span>{{ t('home.statRequestsToday') }}</span>
          <span class="stat-divider">·</span>
          <span>{{ t('home.statRequestsMonth') }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-label">{{ t('home.statConnections') }}</div>
        <div class="stat-value">{{ connections }}</div>
        <div class="stat-hint muted">{{ t('home.statConnectionsHint') }}</div>
      </div>
    </section>

    <!-- ============ Node info & status (merged) ============ -->
    <section class="card home-block">
      <header class="block-head">
        <h3>{{ t('home.nodeAndStatus') }}</h3>
        <span class="status-pill" :class="{ online: refs.status.value.started }">
          <span class="led"></span>
          {{
            refs.status.value.started
              ? t('home.nodeAndStatusOnline')
              : t('home.nodeAndStatusOffline')
          }}
        </span>
      </header>
      <div class="node-status-grid">
        <dl class="kv kv-inline">
          <dt>{{ t('home.peerId') }}</dt>
          <dd class="code short">{{ localPeerId ?? t('status.placeholder') }}</dd>
          <dt>{{ t('home.role') }}</dt>
          <dd>
            <span class="tag" :class="{ success: refs.status.value.started }">
              {{
                refs.status.value.role === 'provision'
                  ? t('status.roleProvision')
                  : refs.status.value.role === 'consume'
                  ? t('status.roleConsume')
                  : t('status.roleIdle')
              }}
            </span>
          </dd>
          <dt>{{ t('status.listen') }}</dt>
          <dd class="muted">
            <span v-if="refs.status.value.multiaddrs.length">
              {{ refs.status.value.multiaddrs[0] }}
              <span v-if="refs.status.value.multiaddrs.length > 1">
                +{{ refs.status.value.multiaddrs.length - 1 }}
              </span>
            </span>
            <span v-else>{{ t('status.placeholder') }}</span>
          </dd>
        </dl>
        <div class="node-status-side">
          <div v-if="isProvisioning" class="provision-status">
            <div class="provision-text">
              {{
                t('home.nodeAndStatusProvisionedTitle', {
                  provider: nodeProviderNames.join(', '),
                  n: nodeModels.length,
                })
              }}
            </div>
            <div class="muted provision-sub">
              {{ t('home.nodeAndStatusProvisionedDesc') }}
            </div>
          </div>
          <div v-else class="provision-status not-started">
            <div class="provision-text">
              {{ t('home.nodeAndStatusNotProvisionedTitle') }}
            </div>
            <div class="muted provision-sub">
              {{ t('home.nodeAndStatusNotProvisionedDesc') }}
            </div>
          </div>
          <div class="node-status-actions">
            <button
              v-if="!refs.status.value.started"
              class="primary"
              @click="actions.startNode"
            >
              {{ t('actions.start') }}
            </button>
            <button v-else class="danger" @click="actions.stopNode">
              {{ t('actions.stop') }}
            </button>
            <button @click="goProvision">
              {{
                isProvisioning
                  ? t('home.nodeAndStatusModify')
                  : t('home.nodeAndStatusProvisionBtn')
              }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 可使用 (available models) ============ -->
    <section class="card home-block">
      <header class="block-head">
        <h3>{{ t('home.available') }}</h3>
        <button
          class="icon-btn ghost-icon"
          type="button"
          :title="t('home.availableHelp')"
          :aria-label="t('home.availableHelp')"
          @click="helpModalOpen = true"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </header>
      <p class="muted block-hint">{{ t('home.availableHint') }}</p>
      <ul v-if="models.length" class="model-list">
        <li v-for="m in models.slice(0, 8)" :key="m.provider + '::' + m.id">
          <span class="model-name">{{ m.id }}</span>
          <span class="model-provider muted">{{ m.provider }}</span>
          <span class="model-nodes">
            {{ t('home.availableNodesSuffix', { n: m.nodeCount }) }}
          </span>
        </li>
      </ul>
      <div v-else class="empty-hint">{{ t('home.availableEmpty') }}</div>
    </section>

    <!-- ============ 开放调用服务 (popover entry) ============ -->
    <section class="card home-block service-link">
      <header class="block-head">
        <h3>{{ t('home.serviceLink') }}</h3>
      </header>
      <div class="service-link-body">
        <div class="muted service-link-desc">{{ t('home.serviceLinkDesc') }}</div>
        <div class="service-link-endpoint muted">
          {{ localEndpoint }}
        </div>
        <button
          class="primary"
          @click="serviceModalOpen = true"
          :disabled="!isProvisioning"
          :title="isProvisioning ? '' : t('home.serviceLinkEmpty')"
        >
          {{ t('home.serviceLinkOpen') }}
        </button>
      </div>
    </section>

    <!-- ============ 排行榜 ============ -->
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
            <span
              v-if="row.peerId === localPeerId"
              class="tag accent"
              style="font-size: 10px;"
              >you</span
            >
          </span>
          <span class="provider muted">{{ row.provider }}</span>
          <span class="num">
            <span class="quality-bar" :class="qualityClass(row.quality)">
              <span class="quality-fill" :style="{ width: row.quality + '%' }" />
              <span class="quality-val">{{ row.quality }}</span>
            </span>
          </span>
          <span class="num muted">{{ fmtMin(row.onlineMinutes * 60_000) }}</span>
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
    </div>

    <!-- ===== Help modal (如何使用) ===== -->
    <div
      v-if="helpModalOpen"
      class="modal-overlay"
      @click.self="helpModalOpen = false"
    >
      <div class="modal-card home-modal" role="dialog" aria-modal="true">
        <header class="modal-head">
          <h3>{{ t('home.availableHelpTitle') }}</h3>
          <button class="modal-close" @click="helpModalOpen = false" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>
        <div class="modal-body">
          <p class="muted">{{ t('home.availableHelpIntro') }}</p>
          <ol class="help-steps">
            <li>{{ t('home.availableHelpStep1') }}</li>
            <li>
              {{
                t('home.availableHelpStep2', { port: refs.proxyPort.value })
              }}
            </li>
            <li>{{ t('home.availableHelpStep3') }}</li>
          </ol>
          <div class="help-example">
            <div class="muted help-example-label">
              {{ t('home.availableHelpExample') }}
            </div>
            <pre class="code">{{ helpModelExample }}</pre>
          </div>
        </div>
        <footer class="modal-foot">
          <button class="primary" @click="helpModalOpen = false">
            {{ t('home.availableHelpClose') }}
          </button>
        </footer>
      </div>
    </div>

    <!-- ===== Service modal (开放调用服务) ===== -->
    <div
      v-if="serviceModalOpen"
      class="modal-overlay"
      @click.self="serviceModalOpen = false"
    >
      <div class="modal-card home-modal" role="dialog" aria-modal="true">
        <header class="modal-head">
          <div>
            <h3>{{ t('home.serviceModalTitle') }}</h3>
            <p class="muted modal-sub">{{ t('home.serviceModalDesc') }}</p>
          </div>
          <button class="modal-close" @click="serviceModalOpen = false" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>
        <div class="modal-body">
          <div v-if="!isProvisioning" class="banner">
            {{ t('home.serviceModalNoProvision') }}
          </div>
          <template v-else>
            <dl class="kv kv-stack">
              <dt>{{ t('home.serviceModalApiKey') }}</dt>
              <dd>
                <span v-if="consumerKeyConfigured" class="api-key-mask code short">
                  ••••••••
                </span>
                <span v-else class="muted code short">
                  {{ t('home.serviceModalApiKeyMissing') }}
                </span>
                <button class="ghost" @click="goService">
                  {{ t('home.serviceModalConfigure') }}
                </button>
              </dd>
              <dt>{{ t('home.serviceModalEndpoint') }}</dt>
              <dd class="code short">{{ localEndpoint }}</dd>
              <dt>{{ t('home.serviceModalModels') }}</dt>
              <dd>
                <span v-if="nodeModels.length" class="model-chips">
                  <span v-for="m in nodeModels" :key="m" class="chip selected">
                    {{ m }}
                  </span>
                </span>
                <span v-else class="muted">—</span>
              </dd>
            </dl>
            <div class="help-example">
              <div class="muted help-example-label">
                {{ t('home.serviceModalUsageExample') }}
              </div>
              <pre class="code">{{ serviceCurlExample }}</pre>
            </div>
          </template>
        </div>
        <footer class="modal-foot">
          <button class="primary" @click="serviceModalOpen = false">
            {{ t('home.serviceModalClose') }}
          </button>
          <button v-if="!isProvisioning" class="ghost" @click="goProvision">
            {{ t('home.startProvisionNow') }}
          </button>
        </footer>
      </div>
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
  margin: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  font-weight: 600;
}

/* ===== Stats grid ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  padding: 14px;
  margin-bottom: 0;
}
@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 720px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.stat-card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  font-weight: 600;
}
.stat-value {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--text);
  font-variant-numeric: tabular-nums;
  word-break: break-word;
}
.stat-value .muted {
  font-size: 16px;
  font-weight: 500;
}
.stat-unit {
  font-size: 12px;
  color: var(--muted);
}
.stat-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--muted);
}
.stat-hint {
  font-size: 11px;
  margin-top: auto;
}
.stat-divider {
  margin: 0 4px;
  color: var(--border-strong);
}

/* ===== Block header (title + actions) ===== */
.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}
.block-head h3 {
  margin: 0;
}
.block-hint {
  font-size: 12px;
  margin: -8px 0 12px;
}
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--panel-2);
  border: 1px solid var(--border);
  color: var(--muted);
  font-size: 11px;
  font-weight: 500;
}
.status-pill .led {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--muted);
}
.status-pill.online {
  background: var(--accent-2-soft);
  color: var(--accent-2);
  border-color: transparent;
}
.status-pill.online .led {
  background: var(--accent-2);
  box-shadow: 0 0 4px var(--accent-2);
}
.ghost-icon {
  border: none;
  background: transparent;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: var(--muted);
}
.ghost-icon:hover {
  background: var(--bg-elev);
  color: var(--text);
}

/* ===== Node status grid ===== */
.node-status-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  align-items: stretch;
}
@media (max-width: 720px) {
  .node-status-grid {
    grid-template-columns: 1fr;
  }
}
.kv-inline {
  grid-template-columns: 80px 1fr;
  font-size: 13px;
}
.kv-stack dt {
  color: var(--muted);
  font-size: 12px;
  margin-top: 6px;
}
.kv-stack dd {
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.kv-stack dd > .code.short {
  flex: 1;
  min-width: 0;
}
.node-status-side {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.provision-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}
.provision-sub {
  font-size: 12px;
  margin-top: 4px;
}
.node-status-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
}

/* ===== Available models list ===== */
.model-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.model-list li {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  font-size: 13px;
  min-width: 0;
}
.model-name {
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.model-provider {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.model-nodes {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 500;
}
.empty-hint {
  color: var(--muted);
  font-size: 12px;
  padding: 16px 0;
  text-align: center;
  border: 1px dashed var(--border);
  border-radius: 8px;
}

/* ===== Service link (lightweight entry) ===== */
.service-link-body {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.service-link-desc {
  font-size: 13px;
  flex: 1;
  min-width: 200px;
}
.service-link-endpoint {
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 12px;
  background: var(--bg-elev);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
}

/* ===== Leaderboard ===== */
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
.quality-bar.success .quality-fill {
  background: var(--accent-2);
}
.quality-bar.warn .quality-fill {
  background: var(--warn);
}
.quality-bar.danger .quality-fill {
  background: var(--danger);
}
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

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}
.modal-card {
  width: 100%;
  max-width: 560px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 96px);
  overflow: hidden;
}
.modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}
.modal-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.modal-sub {
  margin: 4px 0 0;
  font-size: 12px;
}
.modal-close {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--muted);
  cursor: pointer;
}
.modal-close:hover {
  background: var(--bg-elev);
  color: var(--text);
  border-color: var(--border);
}
.modal-body {
  padding: 14px 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px;
  border-top: 1px solid var(--border);
}
.help-steps {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--text);
}
.help-example {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.help-example-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.help-example .code {
  margin: 0;
}
.api-key-mask {
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  letter-spacing: 2px;
  display: inline-block;
  min-width: 80px;
}
.modal-body .code.short {
  display: inline-block;
  max-width: 100%;
  padding: 4px 8px;
  font-size: 12px;
}
.model-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.modal-body .code {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

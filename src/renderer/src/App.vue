<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import type {
  ProviderSummary,
  ProviderDetail,
  ProvisionConfig,
  NodeAnnouncement,
  ProxyStats,
  BootstrapConfig,
  ModelInfo,
} from '@shared/types';

import { t, currentLocale, availableLocales, setLocale } from './i18n';
import { theme, themeOptions } from './ui/theme';
import FlagIcon from './ui/FlagIcon.vue';
import ThemeIcon from './ui/ThemeIcon.vue';

import HomeView from './views/HomeView.vue';
import ModelsView from './views/ModelsView.vue';
import WalletView from './views/WalletView.vue';
import LogsView from './views/LogsView.vue';
import SettingsView from './views/SettingsView.vue';
import NodesView from './views/NodesView.vue';

import type { EventLogEntry, AppRefs, AppActions, AppHelpers, DraftProvider } from './views/types';

type Tab = 'home' | 'models' | 'nodes' | 'wallet' | 'logs' | 'settings';

const tab = ref<Tab>('home');
const settingsSub = ref<'profile' | 'provision' | 'service'>('profile');

// ---- state (kept as refs so we can pass to child views) ----
const status = ref<{
  started: boolean;
  peerId: string | null;
  multiaddrs: string[];
  role: 'idle' | 'provision' | 'consume';
  connected: number;
}>({
  started: false,
  peerId: null,
  multiaddrs: [],
  role: 'idle',
  connected: 0,
});

const providers = ref<ProviderSummary[]>([]);
const providerDetail = ref<ProviderDetail | null>(null);
const providerLoading = ref(false);

const provision = ref<ProvisionConfig | null>(null);
const draft = ref<{
  nickname: string;
  providers: DraftProvider[];
}>({
  nickname: '',
  providers: [],
});

/**
 * localStorage cache key for the in-progress provision draft. The draft
 * is the *unsaved* state the user is editing on the Settings → Models
 * pane; without persistence, an app restart (or a Ctrl-R in dev) wipes
 * every provider the user added but didn't yet "开始分享". The cache is
 * intentionally local to the renderer — the real, shareable config
 * still lives in the main process store and is the source of truth
 * after the user clicks the top "开始分享 / 更新" button.
 */
const DRAFT_CACHE_KEY = 'modelbus.provision.draft.v1';

type CachedDraft = { nickname: string; providers: DraftProvider[] };

function loadCachedDraft(): CachedDraft | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedDraft>;
    if (
      !parsed ||
      typeof parsed.nickname !== 'string' ||
      !Array.isArray(parsed.providers)
    ) {
      return null;
    }
    // Filter out anything that doesn't look like a DraftProvider so a
    // corrupted cache can't crash the render.
    const providers = parsed.providers.filter(
      (p): p is DraftProvider =>
        !!p &&
        typeof p.providerId === 'string' &&
        typeof p.providerName === 'string' &&
        typeof p.apiBase === 'string' &&
        typeof p.apiKey === 'string' &&
        Array.isArray(p.selectedModels)
    );
    return { nickname: parsed.nickname, providers };
  } catch {
    return null;
  }
}

function saveCachedDraft(d: CachedDraft) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(DRAFT_CACHE_KEY, JSON.stringify(d));
  } catch {
    /* quota / private-mode failures are non-fatal */
  }
}

function clearCachedDraft() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(DRAFT_CACHE_KEY);
  } catch {
    /* best-effort */
  }
}

const nodes = ref<NodeAnnouncement[]>([]);
const registryLoading = ref(false);
const nodesRefreshing = ref(0);
const proxyStats = ref<ProxyStats>({
  totalRequests: 0,
  successRequests: 0,
  failedRequests: 0,
  bytesSent: 0,
  bytesReceived: 0,
});
const proxyTarget = ref<{ peerId: string | null; nickname: string | null; providerId: string | null }>({
  peerId: null,
  nickname: null,
  providerId: null,
});
const proxyLogs = ref<Array<{ ts: number; method: string; path: string; status: number; latencyMs: number; peerId?: string }>>([]);
const proxyPort = ref(18100);
const cfg = ref<BootstrapConfig>({
  registryUrl: '',
  bootstrapMultiaddrs: [],
  tcpPort: 15001,
  proxyPort: 18100,
});

const eventLog = ref<EventLogEntry[]>([]);
const error = ref<string | null>(null);

// ---- popover state ----
const langMenuOpen = ref(false);
const themeMenuOpen = ref(false);
const systemMenuOpen = ref(false);

// ---- Node-actions cluster (toolbar) -----------------------------------------
// Hover the cluster to peek at peer/role/listener/provision info; click an
// action button inside to start/stop the node, jump to provisioning, or
// open the public-API service modal.
const clusterHover = ref(false);
const serviceModalOpen = ref(false);
const apiKey = ref<string>(
  (typeof localStorage !== 'undefined' && localStorage.getItem('modelbus.consumer.apiKey')) || ''
);
let hoverTimer: number | undefined;

const isProvisioning = computed(() => !!provision.value);
const consumerKeyConfigured = computed(() => !!apiKey.value);
const localEndpoint = computed(() => `http://127.0.0.1:${proxyPort.value}`);
const nodeModels = computed(() =>
  provision.value ? provision.value.providers.flatMap((p) => p.modelIds) : []
);
const nodeProviderNames = computed(() =>
  provision.value ? provision.value.providers.map((p) => p.providerName) : []
);

/** Show the cluster popover with a small delay so cursor passes through
 *  without flicker. Clearing the timer handles mouse-leave cleanly. */
function openCluster() {
  if (hoverTimer) window.clearTimeout(hoverTimer);
  hoverTimer = window.setTimeout(() => (clusterHover.value = true), 80);
}
function closeCluster() {
  if (hoverTimer) window.clearTimeout(hoverTimer);
  hoverTimer = window.setTimeout(() => (clusterHover.value = false), 140);
}
function cancelCloseCluster() {
  if (hoverTimer) window.clearTimeout(hoverTimer);
}

/** Curl example shown inside the public-API service modal — opened from the
 *  cluster on the toolbar. */
const serviceCurlExample = computed(() => {
  const m = nodeModels.value[0] ?? '<model-id>';
  return `curl ${localEndpoint.value}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey.value || '<your-api-key>'}" \\
  -d '{ "model": "${m}", "messages": [{"role":"user","content":"hi"}] }'`;
});

function goProvisionFromCluster() {
  clusterHover.value = false;
  settingsSub.value = 'provision';
  tab.value = 'settings';
}
function goServiceFromCluster() {
  clusterHover.value = false;
  settingsSub.value = 'service';
  tab.value = 'settings';
}

function openDevTools() {
  window.modelbus.system.openDevTools().catch((err) => {
    console.error('[system] openDevTools failed:', err);
  });
}

function openLogsFolder() {
  window.modelbus.system.openLogsFolder().catch((err) => {
    console.error('[system] openLogsFolder failed:', err);
  });
}

// ---- actions ----
async function loadProviders(force = false) {
  providerLoading.value = true;
  error.value = null;
  try {
    providers.value = await window.modelbus.providers.list(force);
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    providerLoading.value = false;
  }
}

async function refreshStatus() {
  status.value = await window.modelbus.p2p.status();
}

async function refreshProvision() {
  provision.value = await window.modelbus.provision.get();
  if (provision.value) {
    // A persisted provision always wins over the local cache — it's
    // the source of truth. The cache is only useful when there is
    // nothing to load yet (first boot after a draft-only session).
    draft.value = {
      nickname: provision.value.nickname,
      providers: provision.value.providers.map((p) => ({
        providerId: p.providerId,
        providerName: p.providerName,
        apiBase: p.apiBase ?? '',
        apiKey: p.apiKey,
        selectedModels: [...p.modelIds],
      })),
    };
    if (provision.value.providers.length > 0) {
      await loadProviderDetail(provision.value.providers[0].providerId);
    }
  }
}

/** Restore the cached draft (if any) when the renderer boots up. Must
 *  run before `refreshProvision` so a subsequent refreshProvision with
 *  no persisted provision keeps the cached draft instead of overwriting
 *  it back to empty. */
function restoreDraftFromCache() {
  const cached = loadCachedDraft();
  if (!cached) return;
  if (cached.providers.length === 0 && !cached.nickname) return;
  draft.value = cached;
}

// Persist draft on every change. Deep watch on `draft.value` so nested
// edits (adding/removing a provider, editing apiKey) all flush.
watch(
  draft,
  (d) => {
    if (!d || (d.providers.length === 0 && !d.nickname)) {
      clearCachedDraft();
    } else {
      saveCachedDraft({ nickname: d.nickname, providers: d.providers });
    }
  },
  { deep: true }
);

async function refreshProxy() {
  proxyStats.value = await window.modelbus.proxy.stats();
  proxyLogs.value = await window.modelbus.proxy.logs(50);
  proxyTarget.value = await window.modelbus.proxy.target();
}

async function refreshNodes() {
  registryLoading.value = true;
  try {
    nodes.value = await window.modelbus.registry.fetch();
  } finally {
    registryLoading.value = false;
    nodesRefreshing.value = Date.now();
  }
}

async function refreshAll() {
  await refreshStatus();
  await refreshProvision();
  await refreshProxy();
  if (tab.value === 'consume') await refreshNodes();
}

async function startNode() {
  try {
    await window.modelbus.p2p.start();
  } catch (err) {
    error.value = (err as Error).message;
  }
  await refreshStatus();
}

async function stopNode() {
  await window.modelbus.p2p.stop();
  await refreshStatus();
}

async function loadProviderDetail(id: string) {
  if (!id) {
    providerDetail.value = null;
    return;
  }
  providerDetail.value = await window.modelbus.providers.get(id);
}

function addProvider() {
  draft.value.providers.push({
    providerId: '',
    providerName: '',
    apiBase: '',
    apiKey: '',
    selectedModels: [],
  });
}

function removeProvider(index: number) {
  draft.value.providers.splice(index, 1);
}

async function selectProvider(index: number, id: string) {
  const p = draft.value.providers[index];
  if (!p) return;
  const summary = providers.value.find((x) => x.id === id);
  p.providerId = id;
  p.providerName = summary?.name ?? id;
  p.selectedModels = [];
  await loadProviderDetail(id);
}

function toggleModel(index: number, m: ModelInfo) {
  const p = draft.value.providers[index];
  if (!p) return;
  const i = p.selectedModels.indexOf(m.id);
  if (i >= 0) p.selectedModels.splice(i, 1);
  else p.selectedModels.push(m.id);
}

async function saveProvision() {
  error.value = null;
  try {
    if (draft.value.providers.length === 0) {
      error.value = t('provision.needPick');
      return;
    }
    for (const p of draft.value.providers) {
      if (!p.providerId) {
        error.value = t('provision.needPick');
        return;
      }
      if (!p.apiKey) {
        error.value = t('provision.needKey');
        return;
      }
    }
    if (!draft.value.nickname) draft.value.nickname = status.value.peerId?.slice(-6) ?? 'anonymous';

    // Resolve each provider's model set (empty selection => share all).
    const creds = [];
    for (const p of draft.value.providers) {
      const detail = await window.modelbus.providers.get(p.providerId);
      const allowed = new Set((detail?.models ?? []).map((m) => m.id));
      const models = p.selectedModels.length
        ? p.selectedModels.filter((id) => allowed.has(id))
        : (detail?.models ?? []).map((m) => m.id);
      creds.push({
        providerId: p.providerId,
        providerName: p.providerName,
        apiBase: p.apiBase || undefined,
        apiKey: p.apiKey,
        modelIds: models,
      });
    }

    if (!status.value.peerId) await startNode();
    const full = await window.modelbus.provision.set({
      nickname: draft.value.nickname,
      providers: creds,
    });
    provision.value = full;
    // The persisted provision is now the source of truth; drop the
    // local cache so the next launch hydrates from main instead of
    // a stale draft. (The watcher would have written a copy a moment
    // ago when draft.value was last assigned; we explicitly clear to
    // avoid that race.)
    clearCachedDraft();
    await refreshStatus();
    await refreshNodes();
  } catch (err) {
    error.value = (err as Error).message;
  }
}

async function pickTarget(peerId: string) {
  error.value = null;
  try {
    await window.modelbus.proxy.setTarget(peerId);
    await refreshProxy();
    if (cfg.value.proxyPort !== proxyPort.value) {
      cfg.value.proxyPort = proxyPort.value;
      await window.modelbus.bootstrap.setConfig({ proxyPort: proxyPort.value });
    }
  } catch (err) {
    error.value = (err as Error).message;
  }
}

async function clearTarget() {
  await window.modelbus.proxy.clearTarget();
  await refreshProxy();
}

async function loadConfig() {
  cfg.value = await window.modelbus.bootstrap.getConfig();
  proxyPort.value = cfg.value.proxyPort;
}

async function saveConfig() {
  await window.modelbus.bootstrap.setConfig(cfg.value);
}

function setError(msg: string | null) {
  error.value = msg;
}

// ---- helpers ----
function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}
function peerShort(id?: string | null): string {
  return id ? `${id.slice(0, 6)}…${id.slice(-4)}` : '—';
}

// ---- click-outside close for menus ----
function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('.menu')) {
    langMenuOpen.value = false;
    themeMenuOpen.value = false;
    systemMenuOpen.value = false;
  }
  if (!target.closest('.cluster')) {
    clusterHover.value = false;
  }
}

const tabs = computed<Array<{ id: Tab; label: string }>>(() => [
  { id: 'home', label: t('nav.home') },
  { id: 'models', label: t('nav.models') },
  { id: 'nodes', label: t('nav.nodes') },
  { id: 'wallet', label: t('nav.wallet') },
  { id: 'logs', label: t('nav.logs') },
  { id: 'settings', label: t('nav.settings') },
]);

const refs: AppRefs = {
  status, providers, providerDetail, providerLoading,
  provision, draft,
  nodes, registryLoading, nodesRefreshing,
  proxyStats, proxyTarget, proxyLogs,
  proxyPort, cfg,
  eventLog, error,
};

const actions: AppActions = {
  refreshStatus, refreshProvision, refreshProxy, refreshNodes, refreshAll,
  startNode, stopNode,
  loadProviders, loadProviderDetail, addProvider, removeProvider, selectProvider, toggleModel,
  saveProvision,
  pickTarget, clearTarget,
  loadConfig, saveConfig,
  setError,
};

const helpers: AppHelpers = { fmtBytes, fmtTime, peerShort };

const currentLocaleEntry = computed(() => availableLocales.find((l) => l.id === currentLocale.value));
const currentLocaleLabel = computed(() => currentLocaleEntry.value?.label ?? '');
const currentLocaleCc = computed(() => currentLocaleEntry.value?.cc ?? 'cn');
const currentThemeLabel = computed(() => themeOptions.find((o) => o.id === theme.value)?.label ?? '');

onMounted(async () => {
  // Pull the in-progress draft from localStorage BEFORE we hit the main
  // process. refreshProvision will overwrite the draft when a persisted
  // provision exists, so the cache is effectively a 'fallback while
  // the saved config is empty' buffer.
  restoreDraftFromCache();

  await loadConfig();
  await loadProviders(false);
  await refreshAll();

  window.modelbus.p2p.onEvent((evt) => {
    eventLog.value.unshift({ ts: Date.now(), type: evt.type, msg: JSON.stringify(evt.payload).slice(0, 120) });
    if (eventLog.value.length > 100) eventLog.value.length = 100;
    if (evt.type === 'started' || evt.type === 'stopped') refreshStatus();
    if (evt.type === 'provision:registered' || evt.type === 'provision:unregistered') refreshProvision();
    if (evt.type === 'proxy:served' || evt.type === 'proxy:error' || evt.type === 'target:set') refreshProxy();
    if (evt.type === 'self:update') refreshStatus();
  });
  window.modelbus.proxy.onEvent((evt) => {
    eventLog.value.unshift({ ts: Date.now(), type: 'proxy:' + evt.type, msg: JSON.stringify(evt.payload).slice(0, 120) });
    if (eventLog.value.length > 100) eventLog.value.length = 100;
  });
  document.addEventListener('click', onDocClick);
  window.addEventListener('modelbus:nav', onNavEvent);
});

function onNavEvent(e: Event) {
  const detail = (e as CustomEvent<{ tab?: Tab; sub?: string }>).detail;
  if (!detail) return;
  if (detail.tab) tab.value = detail.tab;
  if (detail.sub && (detail.sub === 'profile' || detail.sub === 'provision' || detail.sub === 'service')) {
    settingsSub.value = detail.sub;
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick);
  window.removeEventListener('modelbus:nav', onNavEvent);
  if (hoverTimer) window.clearTimeout(hoverTimer);
});
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <img class="brand-logo" src="/logo.png" alt="ModelBus" draggable="false" />
      </div>

      <nav class="tabs">
        <button
          v-for="tb in tabs"
          :key="tb.id"
          :class="{ active: tab === tb.id }"
          @click="tab = tb.id"
        >
          <span>{{ tb.label }}</span>
        </button>
      </nav>

      <div class="toolbar">
        <!-- ============ Cluster: node actions + hover popover ============ -->
        <div
          class="cluster"
          @mouseenter="openCluster"
          @mouseleave="closeCluster"
        >
          <button
            type="button"
            class="cluster-trigger"
            :aria-expanded="clusterHover"
            :title="t('toolbar.clusterLabel')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>{{ t('toolbar.clusterLabel') }}</span>
            <span class="muted cluster-caret">▾</span>
          </button>

          <div
            v-show="clusterHover"
            class="cluster-popover"
            role="tooltip"
            @mouseenter="cancelCloseCluster"
            @mouseleave="closeCluster"
          >
            <header class="cluster-head">
              <span class="status-pill" :class="{ online: status.started }">
                <span class="led"></span>
                {{
                  status.started
                    ? t('status.p2pOnline')
                    : t('status.p2pOffline')
                }}
              </span>
            </header>
            <dl class="cluster-info">
              <dt>{{ t('toolbar.popoverPeer') }}</dt>
              <dd class="code short">
                {{ status.peerId ?? t('status.placeholder') }}
              </dd>
              <dt>{{ t('toolbar.popoverRole') }}</dt>
              <dd>
                <span class="tag" :class="{ success: status.started }">
                  {{
                    status.role === 'provision'
                      ? t('status.roleProvision')
                      : status.role === 'consume'
                      ? t('status.roleConsume')
                      : t('status.roleIdle')
                  }}
                </span>
              </dd>
              <dt>{{ t('toolbar.popoverListen') }}</dt>
              <dd class="muted">
                <span v-if="status.multiaddrs.length">
                  {{ status.multiaddrs[0] }}
                  <span v-if="status.multiaddrs.length > 1">
                    +{{ status.multiaddrs.length - 1 }}
                  </span>
                </span>
                <span v-else>{{ t('status.placeholder') }}</span>
              </dd>
              <dt>{{ t('toolbar.popoverConnections') }}</dt>
              <dd>
                <strong>{{ status.connected }}</strong>
              </dd>
            </dl>
            <div
              v-if="isProvisioning"
              class="cluster-line"
            >
              <div class="cluster-line-text">
                {{
                  t('toolbar.popoverProvisionTitle', {
                    provider: nodeProviderNames.join(', '),
                    n: nodeModels.length,
                  })
                }}
              </div>
              <div class="muted cluster-line-sub">
                {{ t('toolbar.popoverProvisionDesc') }}
              </div>
            </div>
            <div v-else class="cluster-line not-started">
              <div class="cluster-line-text">
                {{ t('toolbar.popoverNotProvisionedTitle') }}
              </div>
              <div class="muted cluster-line-sub">
                {{ t('toolbar.popoverNotProvisionedDesc') }}
              </div>
            </div>
            <div class="cluster-actions">
              <button
                v-if="!status.started"
                class="primary"
                @click="startNode"
              >
                {{ t('actions.start') }}
              </button>
              <button v-else class="danger" @click="stopNode">
                {{ t('actions.stop') }}
              </button>
              <button @click="goProvisionFromCluster">
                {{
                  isProvisioning
                    ? t('home.myNodeModify')
                    : t('home.myNodeProvisionBtn')
                }}
              </button>
              <button
                type="button"
                class="ghost"
                @click="serviceModalOpen = true"
                :disabled="!isProvisioning"
                :title="isProvisioning ? '' : t('home.myNodeServiceNoProvision')"
              >
                {{ t('home.myNodeServiceBtn') }}
              </button>
            </div>
          </div>
        </div>

        <div
          class="status-pill"
          :class="{ online: status.started }"
          :title="status.peerId ?? ''"
        >
          <span class="led"></span>
          <span class="status-label">
            {{
              status.started
                ? t('status.p2pOnline')
                : t('status.p2pOffline')
            }}
          </span>
        </div>

        <div class="menu">
          <button
            class="menu-trigger"
            :title="currentLocaleLabel"
            @click.stop="langMenuOpen = !langMenuOpen; themeMenuOpen = false; systemMenuOpen = false"
          >
            <FlagIcon :cc="currentLocaleCc" :width="18" />
            <span>{{ currentLocaleLabel }}</span>
            <span class="muted" style="font-size: 10px">▾</span>
          </button>
          <div v-if="langMenuOpen" class="menu-pop">
            <button
              v-for="l in availableLocales"
              :key="l.id"
              @click="setLocale(l.id); langMenuOpen = false"
            >
              <span class="lang-flag">
                <FlagIcon :cc="l.cc" :width="18" />
                <span>{{ l.label }}</span>
              </span>
              <span v-if="l.id === currentLocale" class="check">✓</span>
            </button>
          </div>
        </div>

        <div class="menu">
          <button
            class="icon-btn"
            :title="currentThemeLabel"
            aria-label="Theme"
            @click.stop="themeMenuOpen = !themeMenuOpen; langMenuOpen = false; systemMenuOpen = false"
          >
            <ThemeIcon :theme="theme" :size="16" />
          </button>
          <div v-if="themeMenuOpen" class="menu-pop">
            <button
              v-for="o in themeOptions"
              :key="o.id"
              @click="theme = o.id; themeMenuOpen = false"
            >
              <span class="lang-flag">
                <ThemeIcon :theme="o.id" :size="16" />
                <span>{{ o.label }}</span>
              </span>
              <span v-if="o.id === theme" class="check">✓</span>
            </button>
          </div>
        </div>

        <div class="menu">
          <button
            class="icon-btn"
            :title="t('system.menuLabel')"
            aria-label="System"
            @click.stop="systemMenuOpen = !systemMenuOpen; langMenuOpen = false; themeMenuOpen = false"
          >
            <svg :width="16" :height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <div v-if="systemMenuOpen" class="menu-pop">
            <button @click="openDevTools(); systemMenuOpen = false">
              <span class="lang-flag">
                <svg :width="16" :height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                  stroke-linejoin="round" aria-hidden="true">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                <span>{{ t('system.openDevTools') }}</span>
              </span>
            </button>
            <button @click="openLogsFolder(); systemMenuOpen = false">
              <span class="lang-flag">
                <svg :width="16" :height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                  stroke-linejoin="round" aria-hidden="true">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span>{{ t('system.openLogsFolder') }}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="content">
      <HomeView v-if="tab === 'home'" :refs="refs" :actions="actions" :helpers="helpers" />
      <ModelsView v-else-if="tab === 'models'" />
      <NodesView v-else-if="tab === 'nodes'" :refs="refs" :actions="actions" :helpers="helpers" />
      <WalletView v-else-if="tab === 'wallet'" />
      <LogsView v-else-if="tab === 'logs'" :refs="refs" :actions="actions" :helpers="helpers" />
      <SettingsView v-else-if="tab === 'settings'" :key="settingsSub" :initial-sub="settingsSub" :refs="refs" :actions="actions" :helpers="helpers" />
    </main>

    <!-- ===== Service modal (开放调用服务) — moved from HomeView so the
              toolbar cluster button can open it. ===== -->
    <div
      v-if="serviceModalOpen"
      class="modal-overlay"
      @click.self="serviceModalOpen = false"
    >
      <div class="modal-card" role="dialog" aria-modal="true">
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
                <button class="ghost" @click="goServiceFromCluster">
                  {{ t('home.serviceModalConfigure') }}
                </button>
              </dd>
              <dt>{{ t('home.serviceModalEndpoint') }}</dt>
              <dd class="code short">{{ localEndpoint }}</dd>
              <dt>{{ t('home.serviceModalModels') }}</dt>
              <dd>
                <span v-if="nodeModels.length" class="model-chips">
                  <span
                    v-for="m in nodeModels"
                    :key="m"
                    class="chip selected"
                  >{{ m }}</span>
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
          <button
            v-if="!isProvisioning"
            class="ghost"
            @click="goProvisionFromCluster"
          >
            {{ t('home.myNodeProvisionBtn') }}
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
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
// SetupView / ProvisionView / ConsumeView are still implemented but
// their content is now folded into HomeView / SettingsView for a more
// compact layout. Kept here as reference imports in case a future
// need arises to surface them again.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import SetupView from './views/SetupView.vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ProvisionView from './views/ProvisionView.vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ConsumeView from './views/ConsumeView.vue';

import type { EventLogEntry, AppRefs, AppActions, AppHelpers } from './views/types';

type Tab = 'home' | 'models' | 'wallet' | 'logs' | 'settings';

const tab = ref<Tab>('home');
const settingsSub = ref<'node' | 'register' | 'provision' | 'service'>('node');

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
const draft = ref({
  providerId: '',
  nickname: '',
  apiBase: '',
  apiKey: '',
  selectedModels: [] as string[],
});

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
    draft.value = {
      providerId: provision.value.providerId,
      nickname: provision.value.nickname,
      apiBase: provision.value.apiBase ?? '',
      apiKey: provision.value.apiKey,
      selectedModels: [...provision.value.modelIds],
    };
    await loadProviderDetail(provision.value.providerId);
  }
}

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

async function selectProvider(id: string) {
  draft.value.providerId = id;
  draft.value.selectedModels = [];
  await loadProviderDetail(id);
}

function toggleModel(m: ModelInfo) {
  const i = draft.value.selectedModels.indexOf(m.id);
  if (i >= 0) draft.value.selectedModels.splice(i, 1);
  else draft.value.selectedModels.push(m.id);
}

async function saveProvision() {
  error.value = null;
  try {
    const provider = providers.value.find((p) => p.id === draft.value.providerId);
    if (!provider) {
      error.value = t('provision.needPick');
      return;
    }
    if (!draft.value.apiKey) {
      error.value = t('provision.needKey');
      return;
    }
    if (!draft.value.nickname) draft.value.nickname = status.value.peerId?.slice(-6) ?? 'anonymous';
    const detail = providerDetail.value ?? (await window.modelbus.providers.get(provider.id));
    const allowed = new Set((detail?.models ?? []).map((m) => m.id));
    const models = draft.value.selectedModels.length
      ? draft.value.selectedModels.filter((id) => allowed.has(id))
      : (detail?.models ?? []).map((m) => m.id);
    if (!status.value.peerId) await startNode();
    const full = await window.modelbus.provision.set({
      nickname: draft.value.nickname,
      providerId: provider.id,
      providerName: provider.name,
      apiBase: draft.value.apiBase || undefined,
      apiKey: draft.value.apiKey,
      modelIds: models,
    });
    provision.value = full;
    await refreshStatus();
    await refreshNodes();
  } catch (err) {
    error.value = (err as Error).message;
  }
}

async function clearProvision() {
  await window.modelbus.provision.clear();
  provision.value = null;
  draft.value = {
    providerId: '',
    nickname: '',
    apiBase: '',
    apiKey: '',
    selectedModels: [],
  };
  await loadProviderDetail('');
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
}

const tabs = computed<Array<{ id: Tab; label: string; icon: string }>>(() => [
  { id: 'home', label: t('nav.home'), icon: '🏠' },
  { id: 'models', label: t('nav.models'), icon: '🧠' },
  { id: 'wallet', label: t('nav.wallet'), icon: '💰' },
  { id: 'logs', label: t('nav.logs'), icon: '📋' },
  { id: 'settings', label: t('nav.settings'), icon: '⚙' },
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
  loadProviders, loadProviderDetail, selectProvider, toggleModel,
  saveProvision, clearProvision,
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
  if (detail.sub && (detail.sub === 'node' || detail.sub === 'register' || detail.sub === 'provision' || detail.sub === 'service')) {
    settingsSub.value = detail.sub;
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick);
  window.removeEventListener('modelbus:nav', onNavEvent);
});
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <img class="brand-logo" src="/logo.png" alt="ModelBus" draggable="false" />
        <span class="brand-suffix">P2P</span>
      </div>

      <nav class="tabs">
        <button
          v-for="tb in tabs"
          :key="tb.id"
          :class="{ active: tab === tb.id }"
          @click="tab = tb.id"
        >
          <span class="tab-icon">{{ tb.icon }}</span>
          <span>{{ tb.label }}</span>
        </button>
      </nav>

      <div class="toolbar">
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
      <WalletView v-else-if="tab === 'wallet'" />
      <LogsView v-else-if="tab === 'logs'" :refs="refs" :actions="actions" :helpers="helpers" />
      <SettingsView v-else-if="tab === 'settings'" :key="settingsSub" :initial-sub="settingsSub" />
    </main>
  </div>
</template>
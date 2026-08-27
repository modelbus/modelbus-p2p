<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type {
  ProviderSummary,
  ProviderDetail,
  ProvisionConfig,
  NodeAnnouncement,
  ProxyStats,
  BootstrapConfig,
  ModelInfo,
} from '../../shared/types';

type Tab = 'status' | 'setup' | 'provision' | 'consume' | 'settings';

const tab = ref<Tab>('status');
const status = ref<{ started: boolean; peerId: string | null; multiaddrs: string[]; role: 'idle' | 'provision' | 'consume'; connected: number }>({
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

const eventLog = ref<Array<{ ts: number; type: string; msg: string }>>([]);
const error = ref<string | null>(null);

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'status', label: 'Status' },
  { id: 'setup', label: 'Setup' },
  { id: 'provision', label: 'Provision (Share)' },
  { id: 'consume', label: 'Consume (Drive)' },
  { id: 'settings', label: 'Settings' },
];

const providerFilter = ref('');
const filteredProviders = computed(() => {
  const q = providerFilter.value.trim().toLowerCase();
  if (!q) return providers.value;
  return providers.value.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
});

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

async function loadProviderDetail(id: string) {
  if (!id) {
    providerDetail.value = null;
    return;
  }
  providerDetail.value = await window.modelbus.providers.get(id);
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
    if (!provider) throw new Error('please pick a provider first');
    if (!draft.value.apiKey) throw new Error('apiKey is required');
    if (!draft.value.nickname) draft.value.nickname = status.value.peerId?.slice(-6) ?? 'anonymous';
    const detail = providerDetail.value ?? (await window.modelbus.providers.get(provider.id));
    const allowed = new Set((detail?.models ?? []).map((m) => m.id));
    const models = draft.value.selectedModels.length
      ? draft.value.selectedModels.filter((id) => allowed.has(id))
      : (detail?.models ?? []).map((m) => m.id);
    const peerId = status.value.peerId ?? (await window.modelbus.p2p.status()).peerId;
    if (!peerId) {
      await startNode();
    }
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
});
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <h1>ModelBus · P2P</h1>
      <nav>
        <button v-for="t in tabs" :key="t.id" :class="{ active: tab === t.id }" @click="tab = t.id">
          {{ t.label }}
        </button>
      </nav>
      <div class="status">
        <div>
          <span class="tag" :class="status.started ? 'success' : 'danger'">
            {{ status.started ? 'P2P online' : 'P2P offline' }}
          </span>
        </div>
        <div style="margin-top:6px">peer: <span class="muted">{{ peerShort(status.peerId) }}</span></div>
        <div>peers: <span class="muted">{{ status.connected }}</span></div>
        <div>role: <span class="muted">{{ status.role }}</span></div>
      </div>
    </aside>

    <main class="content">
      <div v-if="error" class="banner">{{ error }}</div>

      <section v-if="tab === 'status'">
        <h2>Status</h2>

        <div class="card">
          <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
            <button v-if="!status.started" class="primary" @click="startNode">Start P2P node</button>
            <button v-else class="danger" @click="stopNode">Stop P2P node</button>
            <button @click="refreshAll">Refresh</button>
            <span class="muted">role: {{ status.role }}</span>
          </div>
          <dl class="kv" style="margin-top:12px">
            <dt>Peer ID</dt><dd class="code">{{ status.peerId ?? '—' }}</dd>
            <dt>Listen</dt>
            <dd>
              <div v-if="status.multiaddrs.length">
                <div v-for="m in status.multiaddrs" :key="m" class="code">{{ m }}</div>
              </div>
              <span v-else class="muted">—</span>
            </dd>
            <dt>Connections</dt><dd>{{ status.connected }}</dd>
          </dl>
        </div>

        <div class="card">
          <h3 style="margin-top:0">Event log</h3>
          <div class="scroll">
            <table class="log-table">
              <thead><tr><th>Time</th><th>Type</th><th>Payload</th></tr></thead>
              <tbody>
                <tr v-for="(e, i) in eventLog" :key="i">
                  <td>{{ fmtTime(e.ts) }}</td>
                  <td><span class="tag">{{ e.type }}</span></td>
                  <td>{{ e.msg }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section v-else-if="tab === 'setup'">
        <h2>Pick your provider</h2>
        <div class="banner">
          Pick a provider from the <a href="#" @click.prevent="loadProviders(true)">models.dev</a> registry and load your account key.
          Your key is stored locally in your userData and used only when you explicitly start the Provision mode.
        </div>

        <div class="card">
          <div style="display:flex; gap:12px; align-items:center;">
            <button @click="loadProviders(true)" :disabled="providerLoading">
              {{ providerLoading ? 'Loading…' : 'Refresh from models.dev' }}
            </button>
            <span class="muted">{{ providers.length }} providers</span>
          </div>
          <div style="margin-top:12px">
            <label>Search</label>
            <input v-model="providerFilter" placeholder="filter providers by name or id" />
            <select size="10" style="margin-top:8px; height:auto;" :value="draft.providerId" @change="selectProvider(($event.target as HTMLSelectElement).value)">
              <option v-for="p in filteredProviders" :key="p.id" :value="p.id">
                {{ p.name }} ({{ p.id }}) — {{ p.modelCount }} models
              </option>
            </select>
          </div>
        </div>

        <div v-if="providerDetail" class="card">
          <h3 style="margin-top:0">{{ providerDetail.name }}</h3>
          <dl class="kv">
            <dt>ID</dt><dd>{{ providerDetail.id }}</dd>
            <dt>npm</dt><dd>{{ providerDetail.npm || '—' }}</dd>
            <dt>API base</dt><dd>{{ providerDetail.api || '(not declared, defaults to OpenAI-compatible)' }}</dd>
            <dt>Env vars</dt><dd>{{ providerDetail.env.join(', ') || '—' }}</dd>
            <dt>Doc</dt><dd>{{ providerDetail.doc || '—' }}</dd>
            <dt>Models</dt><dd>{{ providerDetail.models.length }}</dd>
          </dl>
          <details style="margin-top:8px">
            <summary>Browse models</summary>
            <div class="chip-grid" style="margin-top:8px">
              <span v-for="m in providerDetail.models" :key="m.id" class="chip">
                {{ m.id }}
                <span v-if="m.context" class="muted"> · {{ Math.round(m.context / 1024) }}k ctx</span>
              </span>
            </div>
          </details>
        </div>
      </section>

      <section v-else-if="tab === 'provision'">
        <h2>Provision — share your token</h2>
        <div v-if="!status.started" class="banner">
          The P2P node is offline. Click <a href="#" @click.prevent="startNode">Start</a> on the Status tab to bring it up before provisioning.
        </div>
        <div v-else-if="provision" class="banner ok">
          You're sharing <strong>{{ provision.providerName }}</strong> ({{ provision.modelIds.length }} models).
          Other clients that select your peer will route inference requests through you.
        </div>

        <div class="card">
          <div class="row cols-2">
            <div>
              <label>Provider</label>
              <select :value="draft.providerId" @change="selectProvider(($event.target as HTMLSelectElement).value)">
                <option value="">— pick one —</option>
                <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div>
              <label>Nickname</label>
              <input v-model="draft.nickname" placeholder="so others can pick you" />
            </div>
          </div>
          <div class="row cols-2">
            <div>
              <label>API base override (optional)</label>
              <input v-model="draft.apiBase" :placeholder="providerDetail?.api ?? 'https://api.openai.com/v1'" />
            </div>
            <div>
              <label>API key</label>
              <input type="password" v-model="draft.apiKey" placeholder="sk-…" autocomplete="off" />
            </div>
          </div>
          <div v-if="providerDetail" style="margin-top:8px">
            <label>Models to share (empty = all)</label>
            <div class="chip-grid">
              <span
                v-for="m in providerDetail.models"
                :key="m.id"
                class="chip"
                :class="{ selected: draft.selectedModels.includes(m.id) }"
                @click="toggleModel(m)"
              >
                {{ m.id }}
              </span>
            </div>
            <div style="margin-top:8px; display:flex; gap:8px;">
              <button @click="draft.selectedModels = providerDetail.models.map((m) => m.id)">Select all</button>
              <button @click="draft.selectedModels = []">Clear</button>
            </div>
          </div>

          <div style="margin-top:14px; display:flex; gap:8px; align-items:center;">
            <button class="primary" @click="saveProvision" :disabled="!draft.providerId || !draft.apiKey">
              {{ provision ? 'Update' : 'Start sharing' }}
            </button>
            <button v-if="provision" class="danger" @click="clearProvision">Stop sharing</button>
            <span v-if="error" class="tag danger">{{ error }}</span>
          </div>
        </div>

        <div v-if="provision" class="card">
          <h3 style="margin-top:0">Active share</h3>
          <dl class="kv">
            <dt>Peer ID</dt><dd class="code">{{ provision.peerId }}</dd>
            <dt>Provider</dt><dd>{{ provision.providerName }}</dd>
            <dt>Models</dt><dd>{{ provision.modelIds.join(', ') }}</dd>
            <dt>Listen addresses</dt>
            <dd>
              <div v-for="m in status.multiaddrs" :key="m" class="code">{{ m }}</div>
            </dd>
          </dl>
        </div>
      </section>

      <section v-else-if="tab === 'consume'">
        <h2>Consume — drive someone else's token</h2>
        <div class="card">
          <div style="display:flex; align-items:center; gap:12px;">
            <button class="primary" @click="refreshNodes" :disabled="registryLoading">
              {{ registryLoading ? 'Fetching…' : 'Refresh node list' }}
            </button>
            <span class="muted">{{ nodes.length }} nodes · last refresh {{ fmtTime(nodesRefreshing) }}</span>
          </div>
          <p class="muted" style="margin-top:6px">
            Each node lists its provider and which models it shares. Pick one to start the local HTTP proxy
            on <code>http://127.0.0.1:{{ proxyPort }}</code> — point any OpenAI/Anthropic-compatible client at it.
          </p>
        </div>

        <div class="card">
          <h3 style="margin-top:0">Available nodes</h3>
          <div class="list">
            <div v-if="!nodes.length" class="muted">
              No nodes published yet. Ask the other side to click "Start sharing" on the Provision tab.
            </div>
            <div
              v-for="n in nodes"
              :key="n.peerId"
              class="list-item"
              :class="{ active: proxyTarget.peerId === n.peerId }"
            >
              <div>
                <div>
                  <strong>{{ n.nickname }}</strong>
                  <span class="tag accent">{{ n.providerName }}</span>
                  <span v-if="proxyTarget.peerId === n.peerId" class="tag success">active</span>
                </div>
                <div class="meta">
                  peer <span class="code">{{ peerShort(n.peerId) }}</span> ·
                  {{ n.modelIds.length }} models ·
                  {{ n.multiaddrs.length }} addrs
                </div>
                <div class="meta muted">{{ n.modelIds.slice(0, 6).join(', ') }}{{ n.modelIds.length > 6 ? '…' : '' }}</div>
              </div>
              <div style="display:flex; gap:8px;">
                <button v-if="proxyTarget.peerId !== n.peerId" class="primary" @click="pickTarget(n.peerId)">Use</button>
                <button v-else class="danger" @click="clearTarget">Stop</button>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 style="margin-top:0">Local proxy</h3>
          <div class="row cols-3">
            <div>
              <label>Listen port</label>
              <input type="number" v-model.number="proxyPort" />
            </div>
            <div>
              <label>Target</label>
              <input :value="proxyTarget.peerId ?? '(none)'" disabled />
            </div>
            <div>
              <label>Status</label>
              <input :value="proxyTarget.peerId ? `running on :${proxyPort}` : 'idle'" disabled />
            </div>
          </div>

          <div class="code" style="margin-top:8px">
# OpenAI-compatible example:
curl http://127.0.0.1:{{ proxyPort }}/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{ "model": "&lt;paste a model id&gt;", "messages": [{"role":"user","content":"hi"}] }'
          </div>
        </div>

        <div class="card">
          <h3 style="margin-top:0">Stats</h3>
          <dl class="kv">
            <dt>Total</dt><dd>{{ proxyStats.totalRequests }}</dd>
            <dt>Success</dt><dd>{{ proxyStats.successRequests }}</dd>
            <dt>Failed</dt><dd>{{ proxyStats.failedRequests }}</dd>
            <dt>Bytes sent</dt><dd>{{ fmtBytes(proxyStats.bytesSent) }}</dd>
            <dt>Bytes received</dt><dd>{{ fmtBytes(proxyStats.bytesReceived) }}</dd>
          </dl>
          <button @click="refreshProxy" style="margin-top:8px">Refresh</button>
        </div>

        <div class="card">
          <h3 style="margin-top:0">Recent traffic</h3>
          <div class="scroll">
            <table class="log-table">
              <thead><tr><th>Time</th><th>Method</th><th>Path</th><th>Status</th><th>Latency</th><th>Peer</th></tr></thead>
              <tbody>
                <tr v-for="(l, i) in proxyLogs" :key="i">
                  <td>{{ fmtTime(l.ts) }}</td>
                  <td>{{ l.method }}</td>
                  <td>{{ l.path }}</td>
                  <td>
                    <span class="tag" :class="l.status < 400 ? 'success' : 'danger'">{{ l.status }}</span>
                  </td>
                  <td>{{ l.latencyMs }}ms</td>
                  <td>{{ peerShort(l.peerId) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section v-else-if="tab === 'settings'">
        <h2>Settings</h2>
        <div class="card">
          <div class="row cols-2">
            <div>
              <label>Registry URL</label>
              <input v-model="cfg.registryUrl" placeholder="http://example.com/nodes.json or file:///mock/nodes.json" />
            </div>
            <div>
              <label>TCP listen port</label>
              <input type="number" v-model.number="cfg.tcpPort" />
            </div>
          </div>
          <div class="row">
            <div>
              <label>Bootstrap multiaddrs (one per line)</label>
              <textarea v-model="cfg.bootstrapMultiaddrs" rows="4" placeholder="/ip4/.../tcp/.../p2p/..."></textarea>
            </div>
          </div>
          <div style="margin-top:8px; display:flex; gap:8px;">
            <button class="primary" @click="saveConfig">Save</button>
            <button @click="loadConfig">Reload</button>
            <span class="muted">changes apply after restarting the P2P node.</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
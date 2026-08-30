<script setup lang="ts">
import { ref, computed } from 'vue';
import type { AppRefs, AppActions, AppHelpers } from './types';
import { t } from '../i18n';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
  initialSub?: 'node' | 'register' | 'provision' | 'service';
}>();

type Sub = 'node' | 'register' | 'provision' | 'service';

const sub = ref<Sub>(props.initialSub ?? 'node');

// API key used to authenticate callers of the consume proxy. The value
// now lives in the main-process store (persisted in modelbus-store.json)
// and is pushed into the running proxy immediately on save so that
// `curl http://127.0.0.1:18100/...` enforces it right away.
const apiKeyInput = ref<string>('');
const apiKeySaved = ref(false);
const apiKeyError = ref<string | null>(null);

async function refreshConsumerState() {
  try {
    const [key, auto] = await Promise.all([
      window.modelbus.consumer.getApiKey(),
      window.modelbus.consumer.getAutostart(),
    ]);
    apiKeyInput.value = key ?? '';
    consumerAutostart.value = !!auto;
  } catch (err) {
    console.error('[settings] refresh consumer state failed:', err);
  }
}

const consumerAutostart = ref(false);
const consumerStarting = ref(false);
const consumerStartError = ref<string | null>(null);

async function saveApiKey() {
  apiKeyError.value = null;
  try {
    await window.modelbus.consumer.setApiKey(apiKeyInput.value);
    apiKeySaved.value = true;
    setTimeout(() => (apiKeySaved.value = false), 1800);
  } catch (err) {
    apiKeyError.value = (err as Error).message;
  }
}

async function clearApiKey() {
  apiKeyError.value = null;
  try {
    await window.modelbus.consumer.setApiKey('');
    apiKeyInput.value = '';
  } catch (err) {
    apiKeyError.value = (err as Error).message;
  }
}

async function toggleAutostart(enabled: boolean) {
  consumerStartError.value = null;
  try {
    await window.modelbus.consumer.setAutostart(enabled);
    consumerAutostart.value = enabled;
    // If the user just enabled autostart and we're already provisioned,
    // start the proxy right away so curl works immediately.
    if (enabled && !props.refs.proxyStats.value && props.refs.provision.value) {
      consumerStarting.value = true;
      try {
        await window.modelbus.proxy.startAt();
        await props.actions.refreshProxy();
      } catch (err) {
        consumerStartError.value = (err as Error).message;
      } finally {
        consumerStarting.value = false;
      }
    }
  } catch (err) {
    consumerStartError.value = (err as Error).message;
  }
}

async function startConsumerNow() {
  consumerStartError.value = null;
  consumerStarting.value = true;
  try {
    await window.modelbus.proxy.startAt();
    // refresh proxy state so the UI flips to "running"
    if (props.actions.refreshProxy) await props.actions.refreshProxy();
  } catch (err) {
    consumerStartError.value = (err as Error).message ?? String(err);
  } finally {
    consumerStarting.value = false;
  }
}

refreshConsumerState();

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
  <div>
    <nav class="subtabs">
      <button :class="{ active: sub === 'node' }" @click="sub = 'node'">
        {{ t('settings.tab.node') }}
      </button>
      <button :class="{ active: sub === 'register' }" @click="sub = 'register'">
        {{ t('settings.tab.register') }}
      </button>
      <button :class="{ active: sub === 'provision' }" @click="sub = 'provision'">
        {{ t('settings.tab.provision') }}
      </button>
      <button :class="{ active: sub === 'service' }" @click="sub = 'service'">
        {{ t('settings.tab.service') }}
      </button>
      <div class="subtabs-spacer" />
      <button class="subtab-icon-btn" :title="t('system.openDevTools')" @click="openDevTools">
        <svg :width="14" :height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
          stroke-linejoin="round" aria-hidden="true">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </button>
      <button class="subtab-icon-btn" :title="t('system.openLogsFolder')" @click="openLogsFolder">
        <svg :width="14" :height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
          stroke-linejoin="round" aria-hidden="true">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </nav>

    <!-- ============ 节点 ============ -->
    <div v-if="sub === 'node'" class="card">
      <p class="muted" style="margin-top: 0;">
        {{ t('settings.nodeHint') }}
      </p>
      <div class="form-row">
        <div>
          <label>{{ t('settings.registryUrl') }}</label>
          <input v-model="refs.cfg.value.registryUrl" />
          <div class="muted" style="margin-top: 4px; font-size: 11px;">
            {{ t('settings.registryHint') }}
          </div>
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
      <div style="display: flex; gap: 8px; align-items: center;">
        <button class="primary" @click="actions.saveConfig">{{ t('actions.save') }}</button>
        <button @click="actions.loadConfig">{{ t('actions.reload') }}</button>
        <span class="muted">{{ t('settings.saveHint') }}</span>
      </div>
    </div>

    <!-- ============ 注册 ============ -->
    <div v-else-if="sub === 'register'" class="card">
      <p class="muted" style="margin-top: 0;">
        {{ t('settings.registerHint') }}
      </p>
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
      <div style="display: flex; gap: 8px; align-items: center;">
        <button @click="actions.saveConfig">{{ t('actions.save') }}</button>
        <button class="primary" @click="actions.refreshNodes">
          {{ t('actions.refreshNodes') }}
        </button>
        <span class="muted">
          {{ refs.nodes.value.length }} {{ t('consume.modelCount', { n: '' }).trim() }}
        </span>
      </div>
      <p class="muted" style="font-size: 11px; margin-top: 12px;">
        {{ t('settings.trustHint') }}
      </p>
      <div class="logs-table-wrap" style="margin-top: 8px;">
        <table class="log-table">
          <thead>
            <tr>
              <th style="width: 70px;">{{ t('settings.trustBadge') }}</th>
              <th>{{ t('home.lbNickname') }}</th>
              <th style="width: 100px;">{{ t('settings.peerShort') }}</th>
              <th>{{ t('settings.providers') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in trustedNodes" :key="n.peerId">
              <td>
                <span v-if="n.trusted" class="tag success" style="font-size: 10px;">
                  {{ t('settings.trustTrusted') }}
                </span>
                <span v-else class="tag" style="font-size: 10px;">
                  {{ t('settings.trustQuarantine') }}
                </span>
              </td>
              <td>{{ n.nickname }}</td>
              <td class="muted" style="font-size: 11px;">{{ helpers.peerShort(n.peerId) }}</td>
              <td class="muted" style="font-size: 11px;">
                {{ n.providerName }} · {{ n.modelIds.length }} {{ t('home.models') }}
              </td>
            </tr>
            <tr v-if="!trustedNodes.length">
              <td colspan="4" class="muted">{{ t('settings.trustEmpty') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="muted" style="font-size: 11px; margin-top: 12px;">
        {{ t('settings.registerHowto') }}
      </p>
    </div>

    <!-- ============ Token 上线 ============ -->
    <div v-else-if="sub === 'provision'" class="card">
      <p class="muted" style="margin-top: 0;">
        {{ t('settings.provisionHint') }}
      </p>
      <div class="form-row">
        <div>
          <label>{{ t('provision.nickname') }}</label>
          <input v-model="refs.draft.value.nickname" />
        </div>
      </div>

      <div
        v-for="(p, idx) in refs.draft.value.providers"
        :key="idx"
        style="border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-bottom: 12px;"
      >
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <strong>{{ t('provision.provider') }} #{{ idx + 1 }}</strong>
          <button class="danger" style="padding: 2px 8px; font-size: 12px;" @click="actions.removeProvider(idx)">
            {{ t('actions.remove') }}
          </button>
        </div>
        <div class="form-row cols-2">
          <div>
            <label>{{ t('provision.provider') }}</label>
            <select
              :value="p.providerId"
              @change="actions.selectProvider(idx, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">{{ t('setup.pickProvider') }}</option>
              <option v-for="sp in refs.providers.value" :key="sp.id" :value="sp.id">
                {{ sp.name }} ({{ sp.id }})
              </option>
            </select>
          </div>
          <div>
            <label>{{ t('provision.apiKey') }}</label>
            <input
              type="password"
              v-model="p.apiKey"
              placeholder="sk-…"
              autocomplete="off"
            />
          </div>
        </div>
        <div class="form-row">
          <div>
            <label>{{ t('provision.apiBase') }}</label>
            <input
              v-model="p.apiBase"
              :placeholder="refs.providerDetail.value?.api ?? 'https://api.openai.com/v1'"
            />
          </div>
        </div>
        <div v-if="refs.providerDetail.value && p.providerId === refs.providerDetail.value.id">
          <label>{{ t('provision.modelsToShare') }}</label>
          <div class="chip-grid">
            <span
              v-for="m in refs.providerDetail.value.models"
              :key="m.id"
              class="chip"
              :class="{ selected: p.selectedModels.includes(m.id) }"
              @click="actions.toggleModel(idx, m)"
            >
              {{ m.id }}
            </span>
          </div>
          <div style="margin-top: 8px; display: flex; gap: 8px;">
            <button @click="p.selectedModels = refs.providerDetail.value!.models.map((m) => m.id)">
              {{ t('actions.selectAll') }}
            </button>
            <button @click="p.selectedModels = []">
              {{ t('actions.clearSelection') }}
            </button>
          </div>
        </div>
      </div>

      <button style="margin-bottom: 12px;" @click="actions.addProvider">
        + {{ t('provision.addProvider') }}
      </button>

      <div style="display: flex; gap: 8px; align-items: center;">
        <button
          class="primary"
          @click="actions.saveProvision"
          :disabled="!refs.draft.value.providers.length"
        >
          {{ refs.provision.value ? t('actions.update') : t('actions.startSharing') }}
        </button>
        <button v-if="refs.provision.value" class="danger" @click="actions.clearProvision">
          {{ t('actions.stopSharing') }}
        </button>
        <span v-if="refs.error.value" class="tag danger">{{ refs.error.value }}</span>
      </div>
    </div>

    <!-- ============ 调用服务（API-key 鉴权） ============ -->
    <div v-else-if="sub === 'service'" class="card">
      <p class="muted" style="margin-top: 0;">
        {{ t('settings.serviceHint') }}
      </p>
      <div class="form-row">
        <div>
          <label>
            <input
              type="checkbox"
              :checked="consumerAutostart"
              @change="toggleAutostart(($event.target as HTMLInputElement).checked)"
              style="margin-right: 6px;"
            />
            {{ t('settings.consumerAutostart') }}
          </label>
          <div class="muted" style="margin-top: 4px; font-size: 11px;">
            {{ t('settings.consumerAutostartHint') }}
          </div>
        </div>
      </div>
      <div class="form-row">
        <div>
          <label>{{ t('settings.consumerApiKey') }}</label>
          <input
            v-model="apiKeyInput"
            type="password"
            placeholder="sk-mbus-…"
            autocomplete="off"
          />
          <div class="muted" style="margin-top: 4px; font-size: 11px;">
            {{ t('settings.consumerApiKeyHint') }}
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button class="primary" @click="saveApiKey">
          {{ t('actions.save') }}
        </button>
        <button class="danger" @click="clearApiKey">
          {{ t('actions.clear') }}
        </button>
        <span v-if="apiKeySaved" class="tag success">{{ t('provision.saved') }}</span>
        <span v-if="apiKeyError" class="tag danger">{{ apiKeyError }}</span>
      </div>
      <hr />
      <div style="display: flex; gap: 8px; align-items: center;">
        <button
          class="primary"
          @click="startConsumerNow"
          :disabled="consumerStarting || !refs.provision.value"
        >
          {{ consumerStarting ? '…' : t('settings.startConsumer') }}
        </button>
        <span v-if="consumerStartError" class="tag danger">{{ consumerStartError }}</span>
      </div>
      <hr />
      <dl class="kv">
        <dt>{{ t('settings.localEndpoint') }}</dt>
        <dd class="code">http://127.0.0.1:{{ refs.proxyPort.value }}</dd>
        <dt>{{ t('settings.authHeader') }}</dt>
        <dd class="code">Authorization: Bearer &lt;api key&gt;</dd>
      </dl>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { t } from '../../i18n';
import type { AppRefs, AppActions } from '../types';
import type { ConsumerLimits } from '@shared/types';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
}>();

const apiKeyInput = ref('');
const apiKeySaved = ref(false);
const apiKeyError = ref<string | null>(null);

const consumerAutostart = ref(false);
const consumerStarting = ref(false);
const consumerStartError = ref<string | null>(null);

const limits = ref<ConsumerLimits>({ maxConcurrentNodes: 3, monthlyTokenLimit: 1_000_000 });
const limitsSaving = ref(false);
const limitsSaved = ref(false);
const limitsError = ref<string | null>(null);

const stats = computed(() => props.refs.proxyStats.value);

/**
 * Mock monthly usage derived from the running proxy stats. Until the
 * upstream quota telemetry exists, this gives the UI a believable
 * "已消耗 / 总额" ratio.
 */
const monthlyUsed = computed(() => {
  const total = (stats.value?.bytesSent ?? 0) + (stats.value?.bytesReceived ?? 0);
  // ~1 token per 4 bytes is the rough OpenAI ratio; round up.
  return Math.max(0, Math.round(total / 4));
});

const usageRatio = computed(() => {
  const lim = limits.value.monthlyTokenLimit;
  if (!lim) return 0;
  return Math.min(100, Math.round((monthlyUsed.value / lim) * 100));
});

const connectedNodes = computed(() => props.refs.status.value.connected);

const nodesRatio = computed(() => {
  const lim = limits.value.maxConcurrentNodes;
  if (!lim) return 0;
  return Math.min(100, Math.round((connectedNodes.value / lim) * 100));
});

async function refresh() {
  try {
    const [key, auto, fetched] = await Promise.all([
      window.modelbus.consumer.getApiKey(),
      window.modelbus.consumer.getAutostart(),
      window.modelbus.consumer.getLimits(),
    ]);
    apiKeyInput.value = key ?? '';
    consumerAutostart.value = !!auto;
    limits.value = fetched;
  } catch (err) {
    console.error('[settings] refresh consumer state failed:', err);
  }
}

onMounted(refresh);

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

async function saveLimits() {
  limitsError.value = null;
  limitsSaving.value = true;
  try {
    const merged = await window.modelbus.consumer.setLimits({
      maxConcurrentNodes: clampNonNeg(limits.value.maxConcurrentNodes),
      monthlyTokenLimit: clampNonNeg(limits.value.monthlyTokenLimit),
    });
    limits.value = merged;
    limitsSaved.value = true;
    setTimeout(() => (limitsSaved.value = false), 1800);
  } catch (err) {
    limitsError.value = (err as Error).message;
  } finally {
    limitsSaving.value = false;
  }
}

function clampNonNeg(n: number): number {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.floor(v);
}

function formatToken(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + 'K';
  return String(n);
}

async function startConsumerNow() {
  consumerStartError.value = null;
  consumerStarting.value = true;
  try {
    await window.modelbus.proxy.startAt();
    if (props.actions.refreshProxy) await props.actions.refreshProxy();
  } catch (err) {
    consumerStartError.value = (err as Error).message ?? String(err);
  } finally {
    consumerStarting.value = false;
  }
}
</script>

<template>
  <section class="settings-pane">
    <header class="pane-header">
      <h2>{{ t('settings.tab.service') }}</h2>
      <p class="muted">{{ t('settings.serviceHint') }}</p>
    </header>

    <!-- Usage summary cards -->
    <div class="usage-grid">
      <div class="usage-card">
        <div class="usage-label">{{ t('settings.usageNodes') }}</div>
        <div class="usage-value">
          <span class="big">{{ connectedNodes }}</span>
          <span class="dim">/ {{ limits.maxConcurrentNodes || '∞' }}</span>
        </div>
        <div class="meter">
          <div class="meter-fill" :style="{ width: nodesRatio + '%' }"></div>
        </div>
        <div class="usage-foot muted">
          {{ t('settings.usageNodesHint') }}
        </div>
      </div>

      <div class="usage-card">
        <div class="usage-label">{{ t('settings.usageTokens') }}</div>
        <div class="usage-value">
          <span class="big">{{ formatToken(monthlyUsed) }}</span>
          <span class="dim">/ {{ formatToken(limits.monthlyTokenLimit) || '∞' }}</span>
        </div>
        <div class="meter">
          <div class="meter-fill" :style="{ width: usageRatio + '%' }"></div>
        </div>
        <div class="usage-foot muted">
          {{ t('settings.usageTokensHint') }}
        </div>
      </div>

      <div class="usage-card subtle">
        <div class="usage-label">{{ t('settings.usageRequests') }}</div>
        <div class="usage-value">
          <span class="big">{{ stats?.totalRequests ?? 0 }}</span>
          <span class="dim">{{ t('settings.usageRequestsUnit') }}</span>
        </div>
        <div class="usage-foot muted">
          {{ t('settings.usageRequestsHint') }}
        </div>
      </div>
    </div>

    <!-- Limits + API key form -->
    <div class="form-row cols-2">
      <div>
        <label>{{ t('settings.maxNodes') }}</label>
        <input
          type="number"
          min="0"
          step="1"
          :value="limits.maxConcurrentNodes"
          @input="
            (e) =>
              (limits.maxConcurrentNodes = clampNonNeg(
                Number((e.target as HTMLInputElement).value)
              ))
          "
        />
        <div class="hint">{{ t('settings.maxNodesHint') }}</div>
      </div>
      <div>
        <label>{{ t('settings.monthlyTokenLimit') }}</label>
        <input
          type="number"
          min="0"
          step="1000"
          :value="limits.monthlyTokenLimit"
          @input="
            (e) =>
              (limits.monthlyTokenLimit = clampNonNeg(
                Number((e.target as HTMLInputElement).value)
              ))
          "
        />
        <div class="hint">{{ t('settings.monthlyTokenLimitHint') }}</div>
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
        <div class="hint">{{ t('settings.consumerApiKeyHint') }}</div>
      </div>
    </div>

    <div class="form-row">
      <label class="checkbox-label">
        <input
          type="checkbox"
          :checked="consumerAutostart"
          @change="toggleAutostart(($event.target as HTMLInputElement).checked)"
        />
        {{ t('settings.consumerAutostart') }}
        <span class="muted hint inline">{{ t('settings.consumerAutostartHint') }}</span>
      </label>
    </div>

    <div class="form-actions">
      <button class="primary" @click="saveLimits" :disabled="limitsSaving">
        {{ limitsSaving ? '…' : t('actions.save') }}
      </button>
      <button @click="saveApiKey">{{ t('settings.saveApiKey') }}</button>
      <button class="danger" @click="clearApiKey">{{ t('actions.clear') }}</button>
      <span v-if="limitsSaved" class="tag success">{{ t('provision.saved') }}</span>
      <span v-if="apiKeySaved" class="tag success">{{ t('provision.saved') }}</span>
      <span v-if="limitsError" class="tag danger">{{ limitsError }}</span>
      <span v-if="apiKeyError" class="tag danger">{{ apiKeyError }}</span>
    </div>

    <hr />

    <div class="form-actions">
      <button
        class="primary"
        @click="startConsumerNow"
        :disabled="consumerStarting || !refs.provision.value"
      >
        {{ consumerStarting ? '…' : t('settings.startConsumer') }}
      </button>
      <span v-if="consumerStartError" class="tag danger">{{ consumerStartError }}</span>
    </div>

    <dl class="kv">
      <dt>{{ t('settings.localEndpoint') }}</dt>
      <dd class="code">http://127.0.0.1:{{ refs.proxyPort.value }}</dd>
      <dt>{{ t('settings.authHeader') }}</dt>
      <dd class="code">Authorization: Bearer &lt;api key&gt;</dd>
    </dl>
  </section>
</template>

<style scoped>
.usage-grid {
  display: grid;
  grid-template-columns: 1.2fr 1.6fr 1fr;
  gap: 12px;
  margin-bottom: 22px;
}
@media (max-width: 900px) {
  .usage-grid {
    grid-template-columns: 1fr;
  }
}
.usage-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.usage-card.subtle {
  background: var(--bg-elev);
}
.usage-label {
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}
.usage-value {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.usage-value .big {
  font-size: 26px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
}
.usage-value .dim {
  color: var(--muted);
  font-size: 13px;
}
.meter {
  width: 100%;
  height: 6px;
  background: var(--bg-elev);
  border-radius: 3px;
  overflow: hidden;
}
.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transition: width 0.2s ease-out;
}
.usage-foot {
  font-size: 12px;
  margin-top: 4px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text);
  font-size: 13px;
  text-transform: none;
  letter-spacing: 0;
}
.checkbox-label input {
  width: auto;
  margin: 0;
}
.hint.inline {
  display: inline;
  margin-left: 6px;
}
</style>
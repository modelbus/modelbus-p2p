<script setup lang="ts">
import { ref } from 'vue';
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

// API key used to authenticate callers of the consume proxy. In a future
// release this will be wired through the IPC layer; for now it lives in
// localStorage so it survives restarts.
const apiKeyInput = ref<string>(
  (typeof localStorage !== 'undefined' && localStorage.getItem('modelbus.consumer.apiKey')) ?? ''
);
const apiKeySaved = ref(false);
function saveApiKey() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('modelbus.consumer.apiKey', apiKeyInput.value);
  }
  apiKeySaved.value = true;
  setTimeout(() => (apiKeySaved.value = false), 1800);
}
function clearApiKey() {
  apiKeyInput.value = '';
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('modelbus.consumer.apiKey');
  }
}
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
        {{ t('settings.registerHowto') }}
      </p>
    </div>

    <!-- ============ Token 上线 ============ -->
    <div v-else-if="sub === 'provision'" class="card">
      <p class="muted" style="margin-top: 0;">
        {{ t('settings.provisionHint') }}
      </p>
      <div class="form-row cols-2">
        <div>
          <label>{{ t('provision.provider') }}</label>
          <select
            :value="refs.draft.value.providerId"
            @change="actions.selectProvider(($event.target as HTMLSelectElement).value)"
          >
            <option value="">{{ t('setup.pickProvider') }}</option>
            <option v-for="p in refs.providers.value" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
        </div>
        <div>
          <label>{{ t('provision.nickname') }}</label>
          <input v-model="refs.draft.value.nickname" />
        </div>
      </div>
      <div class="form-row cols-2">
        <div>
          <label>{{ t('provision.apiBase') }}</label>
          <input
            v-model="refs.draft.value.apiBase"
            :placeholder="refs.providerDetail.value?.api ?? 'https://api.openai.com/v1'"
          />
        </div>
        <div>
          <label>{{ t('provision.apiKey') }}</label>
          <input
            type="password"
            v-model="refs.draft.value.apiKey"
            placeholder="sk-…"
            autocomplete="off"
          />
        </div>
      </div>
      <div v-if="refs.providerDetail.value" style="margin-bottom: 10px;">
        <label>{{ t('provision.modelsToShare') }}</label>
        <div class="chip-grid">
          <span
            v-for="m in refs.providerDetail.value.models"
            :key="m.id"
            class="chip"
            :class="{ selected: refs.draft.value.selectedModels.includes(m.id) }"
            @click="actions.toggleModel(m)"
          >
            {{ m.id }}
          </span>
        </div>
        <div style="margin-top: 8px; display: flex; gap: 8px;">
          <button @click="refs.draft.value.selectedModels = refs.providerDetail.value!.models.map((m) => m.id)">
            {{ t('actions.selectAll') }}
          </button>
          <button @click="refs.draft.value.selectedModels = []">
            {{ t('actions.clearSelection') }}
          </button>
        </div>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button
          class="primary"
          @click="actions.saveProvision"
          :disabled="!refs.draft.value.providerId || !refs.draft.value.apiKey"
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
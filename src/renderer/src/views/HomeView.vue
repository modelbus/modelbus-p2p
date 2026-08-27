<script setup lang="ts">
import { ref } from 'vue';
import type { AppRefs, AppActions, AppHelpers } from './types';
import { t } from '../i18n';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
}>();

const targetPeer = ref(props.refs.proxyTarget.value.peerId);
function syncTargetPeer() {
  targetPeer.value = props.refs.proxyTarget.value.peerId;
}
</script>

<template>
  <div class="home-grid">
    <!-- ============ Column 1: Status + Peer info ============ -->
    <div class="card col-status">
      <h3>{{ t('status.title') }}</h3>
      <div style="display:flex; gap:8px; margin-bottom: 10px; align-items: center;">
        <button v-if="!refs.status.value.started" class="primary" @click="actions.startNode">
          {{ t('actions.start') }}
        </button>
        <button v-else class="danger" @click="actions.stopNode">
          {{ t('actions.stop') }}
        </button>
        <button @click="actions.refreshStatus">{{ t('actions.refresh') }}</button>
        <span class="muted" style="font-size: 11px;">
          role: {{ refs.status.value.role }}
        </span>
      </div>
      <dl class="kv" style="margin-bottom: 10px;">
        <dt>{{ t('status.peer') }}</dt>
        <dd class="code" style="font-size: 11px;">
          {{ refs.status.value.peerId ?? t('status.placeholder') }}
        </dd>
        <dt>{{ t('status.listen') }}</dt>
        <dd>
          <div v-if="refs.status.value.multiaddrs.length" style="max-height: 70px; overflow-y: auto;">
            <div
              v-for="m in refs.status.value.multiaddrs"
              :key="m"
              class="code"
              style="font-size: 11px; padding: 4px 8px; margin-bottom: 2px;"
            >
              {{ m }}
            </div>
          </div>
          <span v-else class="muted">{{ t('status.placeholder') }}</span>
        </dd>
        <dt>{{ t('status.connections') }}</dt>
        <dd>{{ refs.status.value.connected }}</dd>
      </dl>
      <h3 style="margin-top: 4px;">{{ t('status.eventLog') }}</h3>
      <div class="scroll">
        <table class="log-table">
          <thead>
            <tr>
              <th style="width: 80px">Time</th>
              <th style="width: 110px">Type</th>
              <th>Payload</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(e, i) in refs.eventLog.value.slice(0, 30)" :key="i">
              <td style="font-size: 11px">{{ helpers.fmtTime(e.ts) }}</td>
              <td><span class="tag">{{ e.type }}</span></td>
              <td style="font-size: 11px">{{ e.msg }}</td>
            </tr>
            <tr v-if="!refs.eventLog.value.length">
              <td colspan="3" class="muted">{{ t('status.empty') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ============ Column 2: Provision (share) ============ -->
    <div class="card col-provision">
      <h3>{{ t('provision.title') }}</h3>
      <div v-if="!refs.status.value.started" class="banner" style="margin-bottom: 8px;">
        {{ t('provision.offlineHint') }}
      </div>
      <div v-else-if="refs.provision.value" class="banner ok" style="margin-bottom: 8px;">
        {{ t('provision.activeHint', { provider: refs.provision.value.providerName, n: refs.provision.value.modelIds.length }) }}
      </div>

      <div class="form-row">
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
      <div class="form-row">
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

      <div v-if="refs.providerDetail.value" style="margin-bottom: 8px;">
        <label>{{ t('provision.modelsToShare') }}</label>
        <div class="chip-grid" style="max-height: 120px;">
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
      </div>
    </div>

    <!-- ============ Column 3: Consume (drive) ============ -->
    <div class="card col-consume">
      <h3>{{ t('consume.title') }}</h3>
      <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
        <button class="primary" @click="actions.refreshNodes" :disabled="refs.registryLoading.value">
          {{
            refs.registryLoading.value
              ? t('setup.loading')
              : t('actions.refreshNodes')
          }}
        </button>
        <span class="muted" style="font-size: 11px;">
          {{ refs.nodes.value.length }} nodes
        </span>
      </div>

      <div class="list scroll">
        <div
          v-for="n in refs.nodes.value.slice(0, 6)"
          :key="n.peerId"
          class="list-item"
          :class="{ active: refs.proxyTarget.value.peerId === n.peerId }"
          style="padding: 8px 10px;"
        >
          <div>
            <div style="font-size: 12px;">
              <strong>{{ n.nickname }}</strong>
              <span class="tag accent" style="font-size: 10px;">{{ n.providerName }}</span>
              <span
                v-if="refs.proxyTarget.value.peerId === n.peerId"
                class="tag success"
                style="font-size: 10px;"
              >active</span>
            </div>
            <div class="meta" style="font-size: 10px;">
              {{ helpers.peerShort(n.peerId) }} · {{ n.modelIds.length }} {{ t('consume.modelCount', { n: '' }).trim() }}
            </div>
          </div>
          <div>
            <button
              v-if="refs.proxyTarget.value.peerId !== n.peerId"
              class="primary"
              style="padding: 3px 8px; font-size: 11px;"
              @click="actions.pickTarget(n.peerId); syncTargetPeer()"
            >
              {{ t('actions.use') }}
            </button>
            <button
              v-else
              class="danger"
              style="padding: 3px 8px; font-size: 11px;"
              @click="actions.clearTarget"
            >
              {{ t('actions.stopUsing') }}
            </button>
          </div>
        </div>
        <div v-if="!refs.nodes.value.length" class="muted" style="font-size: 11px;">
          {{ t('consume.noNodes') }}
        </div>
      </div>

      <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border);">
        <div class="form-row cols-2" style="margin-bottom: 6px;">
          <div>
            <label>{{ t('consume.port') }}</label>
            <input type="number" v-model.number="refs.proxyPort.value" />
          </div>
          <div>
            <label>{{ t('consume.proxyStatus') }}</label>
            <input
              :value="
                refs.proxyTarget.value.peerId
                  ? t('consume.running', { port: refs.proxyPort.value })
                  : t('consume.idle')
              "
              disabled
            />
          </div>
        </div>
        <div class="code" style="font-size: 11px; padding: 6px 8px;">
          curl http://127.0.0.1:{{ refs.proxyPort.value }}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{ "model": "&lt;id&gt;", "messages": [{"role":"user","content":"hi"}] }'
        </div>
      </div>
    </div>
  </div>
</template>
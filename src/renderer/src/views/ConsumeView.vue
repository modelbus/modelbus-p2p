<script setup lang="ts">
import type { AppRefs, AppActions, AppHelpers } from './types';
import { t } from '../i18n';

defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
}>();
</script>

<template>
  <div>
    <div class="card">
      <div class="toolbar-row">
        <button class="primary" @click="actions.refreshNodes" :disabled="refs.registryLoading.value">
          {{
            refs.registryLoading.value
              ? t('setup.loading')
              : t('actions.refreshNodes')
          }}
        </button>
        <span class="muted" v-if="refs.nodesRefreshing.value">
          {{ refs.nodes.value.length }} nodes · last refresh {{ helpers.fmtTime(refs.nodesRefreshing.value) }}
        </span>
      </div>
      <p class="muted" style="margin: 0">
        {{ t('consume.refreshHint') }}
      </p>
    </div>

    <div class="card">
      <h3>{{ t('consume.title') }}</h3>
      <div class="list">
        <div v-if="!refs.nodes.value.length" class="muted">
          {{ t('consume.noNodes') }}
        </div>
        <div
          v-for="n in refs.nodes.value"
          :key="n.peerId"
          class="list-item"
          :class="{ active: refs.proxyTarget.value.peerId === n.peerId }"
        >
          <div>
            <div>
              <strong>{{ n.nickname }}</strong>
              <span class="tag accent">{{ n.providerName }}</span>
              <span v-if="refs.proxyTarget.value.peerId === n.peerId" class="tag success">active</span>
            </div>
            <div class="meta">
              {{ t('consume.peerShort') }} {{ helpers.peerShort(n.peerId) }} ·
              {{ t('consume.modelCount', { n: n.modelIds.length }) }} ·
              {{ t('consume.addrCount', { n: n.multiaddrs.length }) }}
            </div>
            <div class="meta muted">
              {{ n.modelIds.slice(0, 6).join(', ') }}{{ n.modelIds.length > 6 ? '…' : '' }}
            </div>
          </div>
          <div style="display: flex; gap: 8px">
            <button
              v-if="refs.proxyTarget.value.peerId !== n.peerId"
              class="primary"
              @click="actions.pickTarget(n.peerId)"
            >
              {{ t('actions.use') }}
            </button>
            <button v-else class="danger" @click="actions.clearTarget">
              {{ t('actions.stopUsing') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>{{ t('consume.title') }}</h3>
      <div class="row cols-3">
        <div>
          <label>{{ t('consume.port') }}</label>
          <input type="number" v-model.number="refs.proxyPort.value" />
        </div>
        <div>
          <label>{{ t('consume.target') }}</label>
          <input :value="refs.proxyTarget.value.peerId ?? '(none)'" disabled />
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
      <div class="code" style="margin-top: 12px">
{{ t('consume.example') }}
curl http://127.0.0.1:{{ refs.proxyPort.value }}/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{ "model": "&lt;paste a model id&gt;", "messages": [{"role":"user","content":"hi"}] }'
      </div>
    </div>

    <div class="card">
      <h3>{{ t('consume.stats') }}</h3>
      <dl class="kv">
        <dt>{{ t('consume.total') }}</dt>
        <dd>{{ refs.proxyStats.value.totalRequests }}</dd>
        <dt>{{ t('consume.success') }}</dt>
        <dd>{{ refs.proxyStats.value.successRequests }}</dd>
        <dt>{{ t('consume.failed') }}</dt>
        <dd>{{ refs.proxyStats.value.failedRequests }}</dd>
        <dt>{{ t('consume.sent') }}</dt>
        <dd>{{ helpers.fmtBytes(refs.proxyStats.value.bytesSent) }}</dd>
        <dt>{{ t('consume.received') }}</dt>
        <dd>{{ helpers.fmtBytes(refs.proxyStats.value.bytesReceived) }}</dd>
      </dl>
      <button @click="actions.refreshProxy" style="margin-top: 8px">{{ t('actions.refresh') }}</button>
    </div>

    <div class="card">
      <h3>{{ t('consume.recent') }}</h3>
      <div class="scroll">
        <table class="log-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Method</th>
              <th>Path</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Peer</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(l, i) in refs.proxyLogs.value" :key="i">
              <td>{{ helpers.fmtTime(l.ts) }}</td>
              <td>{{ l.method }}</td>
              <td>{{ l.path }}</td>
              <td>
                <span class="tag" :class="l.status < 400 ? 'success' : 'danger'">{{ l.status }}</span>
              </td>
              <td>{{ l.latencyMs }}ms</td>
              <td>{{ helpers.peerShort(l.peerId) }}</td>
            </tr>
            <tr v-if="!refs.proxyLogs.value.length">
              <td colspan="6" class="muted">{{ t('consume.empty') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
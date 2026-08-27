<script setup lang="ts">
import { computed } from 'vue';
import type { AppRefs, AppActions, AppHelpers } from './types';
import { t } from '../i18n';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
}>();

// Proxy logs already cover consumer-side traffic.
const consumeLogs = computed(() => props.refs.proxyLogs.value);

// Supplied-side traffic needs to be inferred from the event log. The main
// process emits a `provision:served` event whenever the local inference
// handler forwards a request — we surface those rows here.
const supplyLogs = computed(() => {
  return props.refs.eventLog.value
    .filter((e) => e.type === 'provision:served')
    .slice(0, 200);
});
</script>

<template>
  <div>
    <!-- =============== Event log =============== -->
    <div class="logs-section">
      <h3>{{ t('status.eventLog') }}</h3>
      <div class="logs-table-wrap">
        <div class="scroll">
          <table class="log-table">
            <thead>
              <tr>
                <th style="width: 90px">Time</th>
                <th style="width: 160px">Type</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(e, i) in refs.eventLog.value" :key="'e-' + i">
                <td>{{ helpers.fmtTime(e.ts) }}</td>
                <td><span class="tag">{{ e.type }}</span></td>
                <td>{{ e.msg }}</td>
              </tr>
              <tr v-if="!refs.eventLog.value.length">
                <td colspan="3" class="muted">{{ t('status.empty') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style="margin-top: 8px; display: flex; gap: 8px;">
        <button @click="actions.refreshAll">{{ t('actions.refresh') }}</button>
      </div>
    </div>

    <!-- =============== Supply log (you serve others) =============== -->
    <div class="logs-section">
      <h3>{{ t('logs.supplied') }}</h3>
      <div class="logs-table-wrap">
        <div class="scroll">
          <table class="log-table">
            <thead>
              <tr>
                <th style="width: 90px">Time</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(e, i) in supplyLogs" :key="'s-' + i">
                <td>{{ helpers.fmtTime(e.ts) }}</td>
                <td><span class="tag">{{ e.msg }}</span></td>
              </tr>
              <tr v-if="!supplyLogs.length">
                <td colspan="2" class="muted">{{ t('logs.noSupplied') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- =============== Consume log (you call others) =============== -->
    <div class="logs-section">
      <h3>{{ t('logs.consumed') }}</h3>
      <div class="logs-table-wrap">
        <div class="scroll">
          <table class="log-table">
            <thead>
              <tr>
                <th style="width: 90px">Time</th>
                <th style="width: 60px">Method</th>
                <th>Path</th>
                <th style="width: 60px">Status</th>
                <th style="width: 80px">Latency</th>
                <th style="width: 120px">Peer</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(l, i) in consumeLogs" :key="'c-' + i">
                <td>{{ helpers.fmtTime(l.ts) }}</td>
                <td>{{ l.method }}</td>
                <td>{{ l.path }}</td>
                <td>
                  <span class="tag" :class="l.status < 400 ? 'success' : 'danger'">{{ l.status }}</span>
                </td>
                <td>{{ l.latencyMs }}ms</td>
                <td>{{ helpers.peerShort(l.peerId) }}</td>
              </tr>
              <tr v-if="!consumeLogs.length">
                <td colspan="6" class="muted">{{ t('logs.noConsumed') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <dl class="kv" style="margin-top: 8px; grid-template-columns: 100px 1fr;">
        <dt>{{ t('consume.stats') }}</dt>
        <dd>
          {{ t('consume.total') }}: {{ refs.proxyStats.value.totalRequests }} ·
          {{ t('consume.success') }}: {{ refs.proxyStats.value.successRequests }} ·
          {{ t('consume.failed') }}: {{ refs.proxyStats.value.failedRequests }} ·
          {{ t('consume.sent') }}: {{ helpers.fmtBytes(refs.proxyStats.value.bytesSent) }} ·
          {{ t('consume.received') }}: {{ helpers.fmtBytes(refs.proxyStats.value.bytesReceived) }}
        </dd>
      </dl>
    </div>
  </div>
</template>
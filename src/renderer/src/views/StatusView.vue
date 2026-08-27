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
    <div class="toolbar-row">
      <button v-if="!refs.status.value.started" class="primary" @click="actions.startNode">
        {{ t('actions.start') }}
      </button>
      <button v-else class="danger" @click="actions.stopNode">
        {{ t('actions.stop') }}
      </button>
      <button @click="actions.refreshAll">{{ t('actions.refresh') }}</button>
      <span class="muted">role: {{ refs.status.value.role }}</span>
    </div>

    <div class="card">
      <h3>{{ t('status.title') }}</h3>
      <dl class="kv">
        <dt>{{ t('status.peer') }}</dt>
        <dd class="code">{{ refs.status.value.peerId ?? t('status.placeholder') }}</dd>
        <dt>{{ t('status.listen') }}</dt>
        <dd>
          <div v-if="refs.status.value.multiaddrs.length">
            <div v-for="m in refs.status.value.multiaddrs" :key="m" class="code">{{ m }}</div>
          </div>
          <span v-else class="muted">{{ t('status.placeholder') }}</span>
        </dd>
        <dt>{{ t('status.connections') }}</dt>
        <dd>{{ refs.status.value.connected }}</dd>
      </dl>
    </div>

    <div class="card">
      <h3>{{ t('status.eventLog') }}</h3>
      <div class="scroll">
        <table class="log-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Payload</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(e, i) in refs.eventLog.value" :key="i">
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
  </div>
</template>
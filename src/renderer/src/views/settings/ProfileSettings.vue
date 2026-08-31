<script setup lang="ts">
import { ref, computed } from 'vue';
import { t } from '../../i18n';
import type { AppRefs, AppActions, AppHelpers } from '../types';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
}>();

const trustedNodes = computed(() =>
  props.refs.nodes.value.map((n) => ({
    peerId: n.peerId,
    nickname: n.nickname,
    providerName: n.providerName,
    modelIds: n.modelIds,
    trusted: n.trusted,
  }))
);

const peerIdDisplay = computed(() => props.refs.status.value.peerId ?? '—');

/**
 * UI-only placeholders for contact fields — not yet wired to the
 * backend, intentionally inert so the user can see what's planned.
 */
const contactApiKey = ref('');
const contactPhone = ref('');
const contactEmail = ref('');
</script>

<template>
  <section class="settings-pane">
    <header class="pane-header">
      <h2>{{ t('profile.title') }}</h2>
      <p class="muted">{{ t('profile.hint') }}</p>
    </header>

    <!-- ========== 身份 ========== -->
    <section class="form-section">
      <h3 class="section-title">{{ t('profile.sectionIdentity') }}</h3>
      <div class="form-row cols-2">
        <div>
          <label>{{ t('profile.nickname') }}</label>
          <input v-model="refs.draft.value.nickname" />
        </div>
        <div>
          <label>{{ t('profile.peerId') }}</label>
          <input :value="peerIdDisplay" readonly class="readonly-input" />
          <div class="hint">{{ t('profile.peerIdHint') }}</div>
        </div>
      </div>
    </section>

    <!-- ========== 网络 ========== -->
    <section class="form-section">
      <h3 class="section-title">{{ t('profile.sectionNetwork') }}</h3>
      <div class="form-row">
        <div>
          <label>{{ t('settings.registryUrl') }}</label>
          <input v-model="refs.cfg.value.registryUrl" />
          <div class="hint">{{ t('settings.registryHint') }}</div>
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
      <div class="form-actions">
        <button class="primary" @click="actions.saveConfig">{{ t('actions.save') }}</button>
        <button @click="actions.loadConfig">{{ t('actions.reload') }}</button>
        <span class="muted">{{ t('settings.saveHint') }}</span>
      </div>
    </section>

    <!-- ========== 联系 ========== -->
    <section class="form-section">
      <h3 class="section-title">{{ t('profile.sectionContact') }}</h3>
      <p class="muted section-hint">{{ t('profile.contactHint') }}</p>
      <div class="form-row cols-2">
        <div>
          <label>{{ t('profile.apiKey') }}</label>
          <input
            v-model="contactApiKey"
            type="password"
            placeholder="sk-mbus-…"
            autocomplete="off"
          />
          <div class="hint">{{ t('profile.apiKeyHint') }}</div>
        </div>
        <div>
          <label>{{ t('profile.phone') }}</label>
          <input v-model="contactPhone" placeholder="+86 138 0000 0000" />
        </div>
      </div>
      <div class="form-row">
        <div>
          <label>{{ t('profile.email') }}</label>
          <input v-model="contactEmail" type="email" placeholder="you@example.com" />
        </div>
      </div>
    </section>

    <!-- ========== 信任节点（继承自原 Register Tab） ========== -->
    <section class="form-section">
      <h3 class="section-title">{{ t('profile.sectionTrusted') }}</h3>
      <p class="muted section-hint">{{ t('settings.trustHint') }}</p>
      <div class="form-actions">
        <button class="primary" @click="actions.refreshNodes">
          {{ t('actions.refreshNodes') }}
        </button>
        <span class="muted">
          {{ refs.nodes.value.length }} {{ t('consume.modelCount', { n: '' }).trim() }}
        </span>
      </div>

      <div class="trust-table-wrap">
        <table class="log-table">
          <thead>
            <tr>
              <th style="width: 90px;">{{ t('settings.trustBadge') }}</th>
              <th>{{ t('home.lbNickname') }}</th>
              <th style="width: 110px;">{{ t('settings.peerShort') }}</th>
              <th>{{ t('settings.providers') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in trustedNodes" :key="n.peerId">
              <td>
                <span v-if="n.trusted" class="tag success">
                  {{ t('settings.trustTrusted') }}
                </span>
                <span v-else class="tag warn">
                  {{ t('settings.trustQuarantine') }}
                </span>
              </td>
              <td>{{ n.nickname }}</td>
              <td class="muted peer-cell">{{ helpers.peerShort(n.peerId) }}</td>
              <td class="muted">
                {{ n.providerName }} · {{ n.modelIds.length }} {{ t('home.models') }}
              </td>
            </tr>
            <tr v-if="!trustedNodes.length">
              <td colspan="4" class="muted">{{ t('settings.trustEmpty') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="hint" style="margin-top: 16px;">{{ t('settings.registerHowto') }}</p>
    </section>
  </section>
</template>

<style scoped>
.form-section {
  margin-bottom: 22px;
}
.section-title {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}
.section-hint {
  margin: 0 0 14px;
  font-size: 12px;
}
.readonly-input {
  background: var(--bg-elev);
  color: var(--text-soft);
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 12px;
}
.trust-table-wrap {
  margin-top: 8px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.peer-cell {
  font-size: 12px;
}
</style>
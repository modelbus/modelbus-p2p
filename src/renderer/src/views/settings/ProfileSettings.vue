<script setup lang="ts">
import { ref, computed } from 'vue';
import { t } from '../../i18n';
import type { AppRefs, AppActions, AppHelpers } from '../types';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
}>();

const peerIdDisplay = computed(() => props.refs.status.value.peerId ?? '—');
const draftNickname = computed({
  get: () => props.refs.draft.value.nickname,
  set: (v) => (props.refs.draft.value.nickname = v),
});

/**
 * Contact fields are UI-only placeholders — they exist in the form so
 * the layout already shows the eventual fields, but no persistence
 * is wired up yet. Tying them to local state keeps the form self-
 * contained until the account service lands.
 */
const contactPhone = ref('');
const contactEmail = ref('');

async function saveAll() {
  // The network config (registry URL, ports, bootstrap, nickname)
  // is the only thing currently persisted. The contact fields are
  // in-form only — see the comment on contactPhone / contactEmail.
  await props.actions.saveConfig();
}
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
          <input v-model="draftNickname" />
        </div>
        <div>
          <label>{{ t('profile.peerId') }}</label>
          <input :value="peerIdDisplay" readonly class="readonly-input" />
          <div class="hint">{{ t('profile.peerIdHint') }}</div>
        </div>
      </div>
    </section>

    <!-- ========== 网络 + 联系（合并） ========== -->
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
      <div class="form-row cols-2">
        <div>
          <label>{{ t('profile.phone') }}</label>
          <input v-model="contactPhone" placeholder="+86 138 0000 0000" />
        </div>
        <div>
          <label>{{ t('profile.email') }}</label>
          <input v-model="contactEmail" type="email" placeholder="you@example.com" />
        </div>
      </div>
      <p class="hint section-hint">{{ t('profile.contactHint') }}</p>
      <div class="form-actions">
        <button class="primary" @click="saveAll">{{ t('actions.save') }}</button>
        <span class="muted">{{ t('settings.saveHint') }}</span>
      </div>
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
</style>
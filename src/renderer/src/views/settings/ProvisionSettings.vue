<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ProviderDetail, ProviderSummary, ProvisionConfig } from '@shared/types';
import { t } from '../../i18n';
import type { AppRefs, AppActions, DraftProvider } from '../types';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
}>();

const expanded = ref<Record<number, boolean>>({});

function toggle(idx: number) {
  expanded.value[idx] = !expanded.value[idx];
}

function isExpanded(idx: number) {
  return !!expanded.value[idx];
}

const providers = props.refs.providers;
const providerDetail = props.refs.providerDetail;
const draftProviders = props.refs.draft.value.providers;

/**
 * Mock quota / status for a ProviderCredential. Real values aren't wired
 * upstream yet so we surface a deterministic mock so the list can show
 * a believable "connection / quota" column.
 */
function mockStatus(p: DraftProvider) {
  // Stable hash of providerId so the same provider always shows the
  // same mock values between renders.
  let h = 0;
  for (const c of p.providerId) h = (h * 31 + c.charCodeAt(0)) | 0;
  const connected = (p.providerId !== '' && p.apiKey !== '') || h % 3 === 0;
  const balance = ((Math.abs(h) % 9000) + 1000) * 1000;
  const used = ((Math.abs(h >> 3) % 7000) + 200) * 1000;
  return { connected, balance, used };
}

const hasAnyDraft = computed(() => draftProviders.length > 0);
const activeProvision = computed<ProvisionConfig | null>(
  () => props.refs.provision.value
);

function statusTag(connected: boolean) {
  return connected
    ? { cls: 'tag success', label: t('provision.statusOnline') }
    : { cls: 'tag warn', label: t('provision.statusOffline') };
}

function loadDetail(idx: number) {
  const p = draftProviders[idx];
  if (p && p.providerId) props.actions.loadProviderDetail(p.providerId);
}

watch(
  () => draftProviders.length,
  () => {
    expanded.value = {};
  }
);
</script>

<template>
  <section class="settings-pane">
    <header class="pane-header">
      <h2>{{ t('provision.title') }}</h2>
      <p class="muted">{{ t('settings.provisionHint') }}</p>
    </header>

    <!-- Token-provider list -->
    <div v-if="!hasAnyDraft" class="empty-card">
      <div class="empty-card-inner">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
          <circle cx="8" cy="14.5" r="1.2" />
        </svg>
        <div class="empty-title">{{ t('provision.emptyTitle') }}</div>
        <div class="empty-hint">{{ t('provision.emptyHint') }}</div>
        <button class="primary" @click="actions.addProvider">
          + {{ t('provision.addProvider') }}
        </button>
      </div>
    </div>

    <ul v-else class="provider-list">
      <li
        v-for="(p, idx) in draftProviders"
        :key="idx"
        class="provider-card"
        :class="{ expanded: isExpanded(idx) }"
      >
        <header class="provider-card-head" @click="toggle(idx)">
          <div class="provider-card-main">
            <div class="provider-icon">
              {{ (p.providerName || p.providerId || '?').slice(0, 1).toUpperCase() }}
            </div>
            <div class="provider-meta">
              <div class="provider-title">
                {{ p.providerName || (p.providerId ? p.providerId : t('provision.providerPending')) }}
                <span class="provider-id">@{{ p.providerId || '—' }}</span>
              </div>
              <div class="provider-sub">
                <span>{{ t('provision.modelsCount', { n: p.selectedModels.length }) }}</span>
                <span class="dot">·</span>
                <span class="api-line">{{ p.apiBase || 'https://…' }}</span>
              </div>
            </div>
          </div>
          <div class="provider-card-aside">
            <span :class="statusTag(mockStatus(p).connected).cls">
              <span class="status-dot" :class="{ on: mockStatus(p).connected }"></span>
              {{ statusTag(mockStatus(p).connected).label }}
            </span>
            <div class="quota">
              <span class="quota-text">
                {{ t('provision.quotaLeft', { n: mockStatus(p).balance }) }}
              </span>
              <span class="quota-bar">
                <span
                  class="quota-fill"
                  :style="{
                    width:
                      Math.round(
                        (mockStatus(p).used / (mockStatus(p).used + mockStatus(p).balance)) * 100
                      ) + '%'
                  }"
                ></span>
              </span>
            </div>
            <button
              class="chevron-btn"
              :class="{ open: isExpanded(idx) }"
              :title="t('actions.expand')"
              @click.stop="toggle(idx)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </header>

        <div v-if="isExpanded(idx)" class="provider-card-body">
          <div class="form-row cols-2">
            <div>
              <label>{{ t('provision.provider') }}</label>
              <select
                :value="p.providerId"
                @change="
                  actions.selectProvider(idx, ($event.target as HTMLSelectElement).value);
                  loadDetail(idx);
                "
              >
                <option value="">{{ t('setup.pickProvider') }}</option>
                <option v-for="sp in providers.value" :key="sp.id" :value="sp.id">
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
                :placeholder="providerDetail.value?.api ?? 'https://api.openai.com/v1'"
              />
            </div>
          </div>

          <div v-if="providerDetail.value && p.providerId === providerDetail.value.id">
            <label>{{ t('provision.modelsToShare') }}</label>
            <div class="chip-grid">
              <span
                v-for="m in providerDetail.value.models"
                :key="m.id"
                class="chip"
                :class="{ selected: p.selectedModels.includes(m.id) }"
                @click="actions.toggleModel(idx, m)"
              >
                {{ m.id }}
              </span>
            </div>
            <div class="chip-actions">
              <button @click="p.selectedModels = providerDetail.value!.models.map((m) => m.id)">
                {{ t('actions.selectAll') }}
              </button>
              <button @click="p.selectedModels = []">
                {{ t('actions.clearSelection') }}
              </button>
            </div>
          </div>

          <div class="provider-card-foot">
            <button class="danger" @click="actions.removeProvider(idx)">
              {{ t('actions.remove') }}
            </button>
          </div>
        </div>
      </li>
    </ul>

    <div v-if="hasAnyDraft" class="add-provider-row">
      <button @click="actions.addProvider">
        + {{ t('provision.addProvider') }}
      </button>
    </div>

    <div class="save-row">
      <button
        class="primary"
        @click="actions.saveProvision"
        :disabled="!refs.draft.value.providers.length"
      >
        {{ activeProvision ? t('actions.update') : t('actions.startSharing') }}
      </button>
      <button v-if="activeProvision" class="danger" @click="actions.clearProvision">
        {{ t('actions.stopSharing') }}
      </button>
      <span v-if="refs.error.value" class="tag danger">{{ refs.error.value }}</span>
    </div>
  </section>
</template>

<style scoped>
.empty-card {
  background: var(--panel);
  border: 1px dashed var(--border-strong);
  border-radius: 12px;
  padding: 36px 24px;
  text-align: center;
  color: var(--muted);
  margin-bottom: 16px;
}
.empty-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
.empty-hint {
  font-size: 13px;
  max-width: 360px;
}
.provider-list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.provider-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.provider-card:hover {
  border-color: var(--border-strong);
}
.provider-card.expanded {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.provider-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  cursor: pointer;
  user-select: none;
}
.provider-card-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.provider-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}
.provider-meta {
  min-width: 0;
}
.provider-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.provider-id {
  color: var(--muted);
  font-size: 12px;
  font-weight: 400;
}
.provider-sub {
  margin-top: 2px;
  font-size: 12px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
.provider-sub .api-line {
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.provider-sub .dot {
  opacity: 0.5;
}
.provider-card-aside {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}
.provider-card-aside .tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--muted);
}
.status-dot.on {
  background: var(--accent-2);
  box-shadow: 0 0 6px var(--accent-2);
}
.quota {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 120px;
}
.quota-text {
  font-size: 11px;
  color: var(--muted);
}
.quota-bar {
  width: 110px;
  height: 4px;
  background: var(--bg-elev);
  border-radius: 2px;
  overflow: hidden;
}
.quota-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
}
.chevron-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--muted);
  cursor: pointer;
  transition: transform 0.15s, color 0.15s;
}
.chevron-btn:hover {
  color: var(--text);
}
.chevron-btn.open {
  transform: rotate(180deg);
  color: var(--accent);
}
.provider-card-body {
  padding: 4px 18px 16px;
  border-top: 1px solid var(--border);
  background: var(--bg-elev);
}
.chip-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.provider-card-foot {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}
.add-provider-row {
  margin-bottom: 12px;
}
.save-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

@media (max-width: 720px) {
  .provider-card-aside .quota {
    display: none;
  }
}
</style>
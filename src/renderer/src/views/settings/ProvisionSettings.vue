<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { ProvisionConfig } from '@shared/types';
import { t } from '../../i18n';
import type { AppRefs, AppActions, DraftProvider } from '../types';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
}>();

const draftProviders = props.refs.draft.value.providers;

/**
 * Modal state: null when closed, otherwise an object describing the
 * draft being edited. `mode === 'create'` opens with a fresh blank
 * provider; `mode === 'edit'` opens with a copy of the existing
 * one so the user can cancel without touching the live draft.
 */
type ModalState =
  | { mode: 'create'; draft: DraftProvider }
  | { mode: 'edit'; index: number; draft: DraftProvider }
  | null;

const modal = ref<ModalState>(null);

function blankProvider(): DraftProvider {
  return { providerId: '', providerName: '', apiBase: '', apiKey: '', selectedModels: [] };
}

function openCreate() {
  modal.value = { mode: 'create', draft: blankProvider() };
  void props.actions.loadProviderDetail('');
}

function openEdit(idx: number) {
  const orig = draftProviders[idx];
  if (!orig) return;
  // Shallow copy the selectedModels so editing doesn't mutate until save.
  modal.value = {
    mode: 'edit',
    index: idx,
    draft: {
      providerId: orig.providerId,
      providerName: orig.providerName,
      apiBase: orig.apiBase,
      apiKey: orig.apiKey,
      selectedModels: [...orig.selectedModels],
    },
  };
  if (orig.providerId) void props.actions.loadProviderDetail(orig.providerId);
}

function closeModal() {
  modal.value = null;
}

const providerDetail = computed(() => props.refs.providerDetail.value);

async function confirmModal() {
  if (!modal.value) return;
  const { draft } = modal.value;
  if (!draft.providerId) {
    // Match the original UX: refuse to save without a provider.
    return;
  }
  if (modal.value.mode === 'create') {
    props.refs.draft.value.providers.push({ ...draft });
  } else {
    const i = modal.value.index;
    props.refs.draft.value.providers.splice(i, 1, { ...draft });
  }
  modal.value = null;
}

async function onProviderChange(id: string) {
  if (!modal.value) return;
  modal.value.draft.providerId = id;
  modal.value.draft.providerName = props.refs.providers.value.find((p) => p.id === id)?.name ?? '';
  // Pre-select every model the new provider exposes — the user can
  // deselect individual chips afterwards. The previous chip list
  // doesn't apply to the new upstream so we always start from a
  // clean slate.
  if (id) {
    const detail = await props.actions.loadProviderDetail(id);
    if (detail && modal.value && modal.value.draft.providerId === id) {
      modal.value.draft.selectedModels = detail.models.map((m) => m.id);
    }
  } else {
    modal.value.draft.selectedModels = [];
  }
}

function toggleModel(id: string) {
  if (!modal.value) return;
  const cur = modal.value.draft.selectedModels;
  const i = cur.indexOf(id);
  if (i >= 0) cur.splice(i, 1);
  else cur.push(id);
}

function removeProvider(idx: number) {
  props.refs.draft.value.providers.splice(idx, 1);
}

/**
 * Mock quota / status for the row badge. Real values aren't wired
 * upstream yet so we surface a deterministic mock so the list can show
 * a believable "connection / quota" column.
 */
function mockStatus(p: DraftProvider) {
  let h = 0;
  for (const c of p.providerId) h = (h * 31 + c.charCodeAt(0)) | 0;
  const connected = (p.providerId !== '' && p.apiKey !== '') || h % 3 === 0;
  const balance = ((Math.abs(h) % 9000) + 1000) * 1000;
  const used = ((Math.abs(h >> 3) % 7000) + 200) * 1000;
  return { connected, balance, used };
}

const hasAnyDraft = computed(() => draftProviders.length > 0);
const activeProvision = computed<ProvisionConfig | null>(() => props.refs.provision.value);

function statusTag(connected: boolean) {
  return connected
    ? { cls: 'tag success', label: t('provision.statusOnline') }
    : { cls: 'tag warn', label: t('provision.statusOffline') };
}

const modalCanConfirm = computed(() => {
  const m = modal.value;
  if (!m) return false;
  return m.draft.providerId !== '';
});

const modalPlaceholder = computed(() => {
  const det = providerDetail.value;
  if (det?.api) return det.api;
  return 'https://api.openai.com/v1';
});

watch(
  () => draftProviders.length,
  () => {
    // No expanded-state tracking any more; the modal handles editing.
  }
);

// Focus the first input after the modal opens for keyboard users.
const firstFieldRef = ref<HTMLInputElement | null>(null);
watch(modal, async (v) => {
  if (v) {
    await nextTick();
    firstFieldRef.value?.focus();
  }
});
</script>

<template>
  <section class="settings-pane">
    <header class="pane-header">
      <h2>{{ t('provision.title') }}</h2>
      <p class="muted">{{ t('settings.provisionHint') }}</p>
    </header>

    <!-- Empty state -->
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
        <button class="primary" @click="openCreate">
          + {{ t('provision.addProvider') }}
        </button>
      </div>
    </div>

    <!-- Provider list (read-only cards) -->
    <template v-else>
      <ul class="provider-list">
        <li
          v-for="(p, idx) in draftProviders"
          :key="idx"
          class="provider-card"
        >
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
            <button class="ghost-btn" :title="t('actions.expand')" @click="openEdit(idx)">
              {{ t('actions.edit') }}
            </button>
            <button class="danger" :title="t('actions.remove')" @click="removeProvider(idx)">
              {{ t('actions.remove') }}
            </button>
          </div>
        </li>
      </ul>

      <div class="add-provider-row">
        <button @click="openCreate">+ {{ t('provision.addProvider') }}</button>
      </div>
    </template>

    <!-- Save / stop sharing -->
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

    <!-- Modal -->
    <div v-if="modal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card" role="dialog" aria-modal="true">
        <header class="modal-head">
          <h3>
            {{ modal.mode === 'create' ? t('provision.addProvider') : t('provision.editProvider') }}
          </h3>
          <button class="modal-close" @click="closeModal" aria-label="Close" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div class="modal-body">
          <div class="form-row">
            <div>
              <label>{{ t('provision.provider') }}</label>
              <select
                ref="firstFieldRef"
                :value="modal.draft.providerId"
                @change="onProviderChange(($event.target as HTMLSelectElement).value)"
              >
                <option value="">{{ t('setup.pickProvider') }}</option>
                <option v-for="sp in refs.providers.value" :key="sp.id" :value="sp.id">
                  {{ sp.name }} ({{ sp.id }})
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div>
              <label>{{ t('provision.apiBase') }}</label>
              <input
                v-model="modal.draft.apiBase"
                :placeholder="modalPlaceholder"
              />
            </div>
          </div>

          <div class="form-row">
            <div>
              <label>{{ t('provision.apiKey') }}</label>
              <input
                v-model="modal.draft.apiKey"
                type="password"
                placeholder="sk-…"
                autocomplete="off"
              />
            </div>
          </div>

          <div v-if="providerDetail && modal.draft.providerId === providerDetail.id">
            <label>{{ t('provision.modelsToShare') }}</label>
            <div class="chip-grid">
              <span
                v-for="m in providerDetail.models"
                :key="m.id"
                class="chip"
                :class="{ selected: modal.draft.selectedModels.includes(m.id) }"
                @click="toggleModel(m.id)"
              >
                {{ m.id }}
              </span>
            </div>
          </div>
        </div>

        <footer class="modal-foot">
          <button @click="closeModal">{{ t('actions.cancel') }}</button>
          <button class="primary" :disabled="!modalCanConfirm" @click="confirmModal">
            {{ t('actions.save') }}
          </button>
        </footer>
      </div>
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
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: border-color 0.15s;
}
.provider-card:hover {
  border-color: var(--border-strong);
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
  gap: 12px;
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}
.modal-card {
  width: 100%;
  max-width: 560px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 96px);
  overflow: hidden;
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.modal-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.modal-close {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.modal-close:hover {
  background: var(--bg-elev);
  color: var(--text);
  border-color: var(--border);
}
.modal-close svg {
  display: block;
}
.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
}
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  background: var(--bg-elev);
}
.chip-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

@media (max-width: 720px) {
  .provider-card-aside .quota {
    display: none;
  }
}
</style>
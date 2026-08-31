<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import type { ModelEntry, ModelQualityNode, LeaderboardEntry } from '@shared/types';
import { t } from '../i18n';

const models = ref<ModelEntry[]>([]);
const nodes = ref<ModelQualityNode[]>([]);
const refreshing = ref(false);

// ---- Models list (grouped by provider, clickable to drill down) ----

interface ProviderGroup {
  provider: string;
  models: ModelEntry[];
}

/**
 * Group the catalogue's flat ModelEntry list by provider. The build
 * preserves the catalogue order (already sorted by quality desc) so
 * the most attractive models render at the top of each group.
 */
const groupedModels = computed<ProviderGroup[]>(() => {
  const map = new Map<string, ModelEntry[]>();
  for (const m of models.value) {
    const list = map.get(m.provider);
    if (list) list.push(m);
    else map.set(m.provider, [m]);
  }
  return Array.from(map.entries()).map(([provider, ms]) => ({ provider, models: ms }));
});

/**
 * Speed bucket based on average upstream latency. Used both for the
 * coloured status dot on each model row and for the modal nodes list.
 *   <  400 ms → green  (fast)
 *   <  900 ms → yellow (medium)
 *   >= 900 ms → red    (slow)
 */
function speedClass(latencyMs: number): 'fast' | 'medium' | 'slow' {
  if (latencyMs < 400) return 'fast';
  if (latencyMs < 900) return 'medium';
  return 'slow';
}

function speedLabel(cls: 'fast' | 'medium' | 'slow'): string {
  if (cls === 'fast') return t('models.statusFast');
  if (cls === 'medium') return t('models.statusMedium');
  return t('models.statusSlow');
}

function qualityClass(q: number): string {
  if (q >= 75) return 'success';
  if (q >= 45) return 'warn';
  return 'danger';
}

function fmtMin(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ---- Nodes modal (per-model, paginated table) ----

const PAGE_SIZE = 10;

const openModel = ref<ModelEntry | null>(null);
const modalPage = ref(1);

/**
 * Nodes offering the currently open model. The catalogue aggregates
 * per `(provider, modelId)` pair, so we filter by both to avoid
 * matching nodes that expose the same model id via a different
 * upstream.
 */
const modalNodes = computed<ModelQualityNode[]>(() => {
  const m = openModel.value;
  if (!m) return [];
  return nodes.value.filter(
    (n) => n.provider === m.provider && n.modelIds.includes(m.id)
  );
});

const modalTotalPages = computed(() =>
  Math.max(1, Math.ceil(modalNodes.value.length / PAGE_SIZE))
);

const modalPagedNodes = computed<ModelQualityNode[]>(() => {
  const start = (modalPage.value - 1) * PAGE_SIZE;
  return modalNodes.value.slice(start, start + PAGE_SIZE);
});

watch(openModel, () => {
  modalPage.value = 1;
});

function openModelModal(m: ModelEntry) {
  openModel.value = m;
}
function closeModelModal() {
  openModel.value = null;
}
function modalPrev() {
  if (modalPage.value > 1) modalPage.value -= 1;
}
function modalNext() {
  if (modalPage.value < modalTotalPages.value) modalPage.value += 1;
}

/** Hide a broken provider logo (a 404 from /logos/<id>.svg) so the
 *  parent chip stays usable without a leftover broken <img>. */
function onProviderLogoError(evt: Event) {
  const el = evt.target as HTMLImageElement;
  el.style.display = 'none';
  el.dataset['broken'] = '1';
}

async function refresh() {
  refreshing.value = true;
  try {
    const c = await window.modelbus.models.catalogue();
    models.value = c.models;
    nodes.value = c.nodes;
  } finally {
    refreshing.value = false;
  }
}

let timer: number | undefined;
onMounted(() => {
  refresh();
  timer = window.setInterval(refresh, 12_000);
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});
</script>

<template>
  <div class="models-stack">
    <!-- ===== Models (grouped by provider, clickable rows) ===== -->
    <section class="card models-block">
      <h3>{{ t('models.title') }}</h3>
      <p class="muted" style="margin: -4px 0 14px; font-size: 12px;">
        {{ t('models.groupHint') }}
      </p>
      <div v-if="groupedModels.length" class="models-groups">
        <section
          v-for="group in groupedModels"
          :key="group.provider"
          class="provider-group"
        >
          <header class="provider-group-head">
            <div class="provider-group-icon">
              <img
                :src="`./logos/${group.provider}.svg`"
                :alt="group.provider"
                class="provider-group-img"
                @error="onProviderLogoError"
              />
            </div>
            <div class="provider-group-meta">
              <span class="provider-group-name">{{ group.provider }}</span>
              <span class="muted provider-group-count">
                · {{ group.models.length }} {{ group.models.length === 1 ? t('models.modelSingular') : t('models.modelPlural') }}
              </span>
            </div>
          </header>
          <ul class="model-list">
            <li
              v-for="m in group.models"
              :key="m.provider + '::' + m.id"
              class="model-row"
              role="button"
              tabindex="0"
              @click="openModelModal(m)"
              @keydown.enter="openModelModal(m)"
              @keydown.space.prevent="openModelModal(m)"
            >
              <span class="model-name">{{ m.name || m.id }}</span>
              <span class="model-provider muted">{{ m.provider }}</span>
              <span class="model-nodes muted">
                {{ t('models.nodesShort', { n: m.nodeCount }) }}
              </span>
              <span class="model-latency muted">{{ m.avgLatencyMs }}ms</span>
              <span class="model-status">
                <span
                  class="speed-dot"
                  :class="speedClass(m.avgLatencyMs)"
                  :title="speedLabel(speedClass(m.avgLatencyMs))"
                />
                <span class="speed-text muted">
                  {{ speedLabel(speedClass(m.avgLatencyMs)) }}
                </span>
              </span>
            </li>
          </ul>
        </section>
      </div>
      <div v-else class="muted">{{ t('models.empty') }}</div>
    </section>

    <!-- ===== Nodes modal (per model, paginated table) ===== -->
    <div v-if="openModel" class="modal-overlay" @click.self="closeModelModal">
      <div class="modal-card model-modal" role="dialog" aria-modal="true">
        <header class="modal-head">
          <div>
            <h3>{{ t('models.nodesModalTitle') }}</h3>
            <p class="muted modal-sub">
              <span class="modal-model-name">{{ openModel.name || openModel.id }}</span>
              <span class="dot">·</span>
              <span>{{ openModel.provider }}</span>
            </p>
          </div>
          <button class="modal-close" type="button" @click="closeModelModal" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div class="modal-body">
          <p v-if="!modalNodes.length" class="muted empty-state">
            {{ t('models.nodesModalEmpty') }}
          </p>
          <template v-else>
            <div class="modal-summary muted">
              {{ t('models.nodesModalPageOf', { n: modalNodes.length }) }}
            </div>
            <div class="modal-table-wrap">
              <table class="log-table modal-table">
                <thead>
                  <tr>
                    <th>{{ t('home.lbNickname') }}</th>
                    <th>{{ t('nodes.colAddress') }}</th>
                    <th class="num">{{ t('nodes.colLatency') }}</th>
                    <th class="num">{{ t('nodes.colUptime') }}</th>
                    <th class="num">{{ t('nodes.colRequests') }}</th>
                    <th class="num">{{ t('nodes.colQuality') }}</th>
                    <th>{{ t('nodes.colStatus') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="n in modalPagedNodes"
                    :key="n.peerId + '::' + n.provider"
                    :class="{ 'self-row': n.self }"
                  >
                    <td>
                      <strong>{{ n.nickname }}</strong>
                      <span v-if="n.self" class="tag accent">{{ t('models.selfBadge') }}</span>
                    </td>
                    <td class="muted peer-cell">{{ n.peerId }}</td>
                    <td class="num muted">{{ n.avgLatencyMs }}ms</td>
                    <td class="num muted">{{ fmtMin(n.uptimeMinutes) }}</td>
                    <td class="num muted">{{ n.servedRequests }}</td>
                    <td class="num">
                      <span class="quality-bar" :class="qualityClass(n.quality)">
                        <span class="quality-fill" :style="{ width: n.quality + '%' }" />
                        <span class="quality-val">{{ n.quality }}</span>
                      </span>
                    </td>
                    <td>
                      <span class="speed-dot" :class="speedClass(n.avgLatencyMs)" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="modalTotalPages > 1" class="modal-pager">
              <button :disabled="modalPage <= 1" @click="modalPrev">
                {{ t('models.nodesModalPrev') }}
              </button>
              <span class="muted">
                {{ t('models.nodesModalPage', { page: modalPage, total: modalTotalPages }) }}
              </span>
              <button :disabled="modalPage >= modalTotalPages" @click="modalNext">
                {{ t('models.nodesModalNext') }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.models-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.models-block h3 {
  margin: 0 0 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  font-weight: 600;
}

/* ===== Models: provider-grouped list ===== */
.models-groups {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.provider-group {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
}
.provider-group-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.provider-group-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--panel);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.provider-group-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 3px;
  border-radius: inherit;
}
.provider-group-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.provider-group-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.provider-group-count {
  font-size: 11px;
}
.model-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.model-row {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) 90px 80px 110px;
  gap: 12px;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  transition: background 0.12s, border-color 0.12s;
}
.model-row:hover,
.model-row:focus-visible {
  background: var(--panel);
  border-color: var(--border);
  outline: none;
}
.model-row:focus-visible {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}
.model-name {
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 13px;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.model-provider,
.model-nodes,
.model-latency {
  font-size: 12px;
}
.model-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.speed-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}
.speed-dot.fast { background: var(--accent-2); box-shadow: 0 0 4px var(--accent-2); }
.speed-dot.medium { background: var(--warn); }
.speed-dot.slow { background: var(--danger); }
.speed-text {
  font-size: 12px;
}

@media (max-width: 760px) {
  .model-row {
    grid-template-columns: minmax(0, 1.5fr) 70px 70px 90px;
  }
  .model-provider {
    display: none;
  }
}

/* ===== Modal: per-model nodes (table format) ===== */
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
  max-width: 860px;
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
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.modal-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.modal-sub {
  margin: 6px 0 0;
  font-size: 12px;
}
.modal-model-name {
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  color: var(--text);
}
.modal-sub .dot {
  margin: 0 6px;
  opacity: 0.5;
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
.modal-summary {
  margin-bottom: 10px;
  font-size: 12px;
}
.empty-state {
  text-align: center;
  padding: 24px 0;
  font-size: 13px;
}
.modal-table-wrap {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.modal-table {
  width: 100%;
}
.modal-table th,
.modal-table td {
  white-space: nowrap;
}
.modal-table th.num,
.modal-table td.num {
  text-align: right;
}
.modal-table .peer-cell {
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 11px;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.self-row {
  background: var(--accent-soft);
}
.modal-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.modal-pager button {
  padding: 4px 12px;
}
.modal-pager button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Quality bar reused by the modal table */
.quality-bar {
  position: relative;
  display: inline-block;
  width: 90px;
  height: 16px;
  background: var(--panel-2);
  border-radius: 8px;
  overflow: hidden;
  vertical-align: middle;
}
.quality-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--muted);
  transition: width 0.3s;
}
.quality-bar.success .quality-fill { background: var(--accent-2); }
.quality-bar.warn .quality-fill { background: var(--warn); }
.quality-bar.danger .quality-fill { background: var(--danger); }
.quality-val {
  position: relative;
  display: inline-block;
  width: 100%;
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  color: var(--text);
}
</style>

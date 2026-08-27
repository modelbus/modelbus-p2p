<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { ModelEntry, ModelQualityNode, LeaderboardEntry } from '@shared/types';
import { t } from '../i18n';

const models = ref<ModelEntry[]>([]);
const nodes = ref<ModelQualityNode[]>([]);
const leaderboard = ref<LeaderboardEntry[]>([]);
const refreshing = ref(false);
const nodeSearch = ref('');

async function refresh() {
  refreshing.value = true;
  try {
    const c = await window.modelbus.models.catalogue();
    models.value = c.models;
    nodes.value = c.nodes;
    leaderboard.value = c.leaderboard;
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

const filteredNodes = computed(() => {
  const q = nodeSearch.value.trim().toLowerCase();
  if (!q) return nodes.value;
  return nodes.value.filter(
    (n) =>
      n.nickname.toLowerCase().includes(q) ||
      n.providerName.toLowerCase().includes(q) ||
      n.modelIds.some((m) => m.toLowerCase().includes(q))
  );
});

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
</script>

<template>
  <div class="models-stack">
    <!-- ===== Models ===== -->
    <section class="card models-block">
      <h3>{{ t('models.title') }}</h3>
      <p class="muted" style="margin: -4px 0 12px; font-size: 12px;">
        {{ t('models.hint') }}
      </p>
      <div v-if="models.length" class="models-grid">
        <div v-for="m in models.slice(0, 24)" :key="m.provider + ':' + m.id" class="model-card">
          <div class="model-card-head">
            <span class="model-id">{{ m.id }}</span>
            <span class="quality-dot" :class="qualityClass(m.quality)" :title="`quality ${m.quality}`" />
          </div>
          <div class="model-card-meta">
            <span class="muted">{{ m.provider }}</span>
            <span class="muted">·</span>
            <span class="muted">{{ t('models.nodesShort', { n: m.nodeCount }) }}</span>
            <span class="muted">·</span>
            <span class="muted">{{ m.avgLatencyMs }}ms</span>
          </div>
        </div>
        <div v-if="models.length > 24" class="muted" style="font-size: 11px;">
          +{{ models.length - 24 }} {{ t('models.more') }}
        </div>
      </div>
      <div v-else class="muted">{{ t('models.empty') }}</div>
    </section>

    <!-- ===== Nodes ===== -->
    <section class="card nodes-block">
      <div class="nodes-head">
        <h3>{{ t('models.nodesTitle') }}</h3>
        <input
          v-model="nodeSearch"
          class="nodes-search"
          :placeholder="t('setup.search')"
        />
        <button class="ghost" @click="refresh" :disabled="refreshing">
          {{ refreshing ? t('setup.loading') : t('actions.refresh') }}
        </button>
      </div>
      <div v-if="filteredNodes.length" class="nodes-table-wrap">
        <table class="log-table">
          <thead>
            <tr>
              <th>{{ t('models.colNode') }}</th>
              <th>{{ t('models.colProvider') }}</th>
              <th>{{ t('models.colModels') }}</th>
              <th class="num">{{ t('models.colQuality') }}</th>
              <th class="num">{{ t('models.colUptime') }}</th>
              <th class="num">{{ t('models.colRequests') }}</th>
              <th class="num">{{ t('models.colLatency') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in filteredNodes" :key="n.peerId">
              <td>
                <strong>{{ n.nickname }}</strong>
              </td>
              <td class="muted">{{ n.providerName }}</td>
              <td class="muted models-list">
                <span v-for="m in n.modelIds.slice(0, 3)" :key="m" class="chip">
                  {{ m }}
                </span>
                <span v-if="n.modelIds.length > 3" class="muted">
                  +{{ n.modelIds.length - 3 }}
                </span>
              </td>
              <td class="num">
                <span class="quality-bar" :class="qualityClass(n.quality)">
                  <span class="quality-fill" :style="{ width: n.quality + '%' }" />
                  <span class="quality-val">{{ n.quality }}</span>
                </span>
              </td>
              <td class="num muted">{{ fmtMin(n.uptimeMinutes) }}</td>
              <td class="num muted">{{ n.servedRequests }}</td>
              <td class="num muted">{{ n.avgLatencyMs }}ms</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="muted">{{ t('models.empty') }}</div>
    </section>
  </div>
</template>

<style scoped>
.models-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.models-block h3,
.nodes-block h3 {
  margin: 0 0 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  font-weight: 600;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
}
.model-card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.model-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.model-id {
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 12px;
  font-weight: 600;
}
.quality-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--muted);
}
.quality-dot.success { background: var(--accent-2); }
.quality-dot.warn { background: var(--warn); }
.quality-dot.danger { background: var(--danger); }
.model-card-meta {
  display: flex;
  gap: 6px;
  font-size: 11px;
  flex-wrap: wrap;
}

.nodes-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.nodes-head h3 {
  flex: 1;
}
.nodes-search {
  width: 200px;
}

.nodes-table-wrap {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.nodes-table-wrap .log-table th.num,
.nodes-table-wrap .log-table td.num {
  text-align: right;
}
.models-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.quality-bar {
  position: relative;
  display: inline-block;
  width: 100px;
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
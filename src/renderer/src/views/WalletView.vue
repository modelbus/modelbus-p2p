<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { WalletScore, WalletBreakdownItem } from '@shared/types';
import { t } from '../i18n';

const wallet = ref<WalletScore | null>(null);
const refreshing = ref(false);

async function refresh() {
  refreshing.value = true;
  try {
    wallet.value = await window.modelbus.wallet.score();
  } finally {
    refreshing.value = false;
  }
}

let timer: number | undefined;
onMounted(() => {
  refresh();
  timer = window.setInterval(refresh, 8_000);
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});

function axisLabel(item: WalletBreakdownItem): string {
  switch (item.key) {
    case 'online': return t('wallet.axis.online');
    case 'tokens': return t('wallet.axis.tokens');
    case 'requests': return t('wallet.axis.requests');
    case 'speed': return t('wallet.axis.speed');
    default: return item.key;
  }
}
function axisValue(item: WalletBreakdownItem): string {
  const v = item.value.toFixed(item.key === 'speed' ? 0 : 0);
  return `${v}${item.unit ? ' ' + item.unit : ''}`;
}

function fmtMin(m: number): string {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h < 24) return `${h}h${r ? ` ${r}m` : ''}`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return `${d}d${rh ? ` ${rh}h` : ''}`;
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}
</script>

<template>
  <div class="wallet-stack">
    <section class="card wallet-hero">
      <div class="wallet-hero-main">
        <div class="muted">{{ t('wallet.balance') }}</div>
        <div class="wallet-balance">
          <span class="wallet-coin">MBP</span>
          <span class="wallet-amount">
            {{ wallet ? wallet.tokens.toFixed(2) : '0.00' }}
          </span>
        </div>
        <div class="wallet-sub muted">
          <span>{{ t('wallet.lastUpdated') }}: {{ wallet ? fmtTime(wallet.updatedAt) : '—' }}</span>
          <button class="ghost" @click="refresh" :disabled="refreshing">
            {{ refreshing ? t('setup.loading') : t('actions.refresh') }}
          </button>
        </div>
      </div>
      <div class="wallet-hero-side">
        <div class="wallet-stat">
          <div class="muted">{{ t('wallet.onlineMinutes') }}</div>
          <div class="stat-val">{{ wallet ? fmtMin(wallet.onlineMinutes) : '—' }}</div>
        </div>
        <div class="wallet-stat">
          <div class="muted">{{ t('wallet.servedRequests') }}</div>
          <div class="stat-val">{{ wallet?.servedRequests ?? 0 }}</div>
        </div>
        <div class="wallet-stat">
          <div class="muted">{{ t('wallet.providedTokens') }}</div>
          <div class="stat-val">{{ wallet?.providedTokens ?? 0 }}</div>
        </div>
        <div class="wallet-stat">
          <div class="muted">{{ t('wallet.avgLatency') }}</div>
          <div class="stat-val">
            {{ wallet?.avgLatencyMs ?? '—' }}<span class="unit">ms</span>
          </div>
        </div>
      </div>
    </section>

    <section class="card wallet-breakdown-card">
      <h3>{{ t('wallet.breakdownTitle') }}</h3>
      <div v-if="wallet" class="breakdown-list">
        <div v-for="item in wallet.breakdown" :key="item.key" class="breakdown-row">
          <div class="bd-name">
            <div class="bd-axis">{{ axisLabel(item) }}</div>
            <div class="muted" style="font-size: 11px;">
              {{ axisValue(item) }} × {{ item.weight }}
            </div>
          </div>
          <div class="bd-bar">
            <div
              class="bd-fill"
              :style="{ width: Math.min(100, (item.contribution / Math.max(1, wallet.tokens)) * 100) + '%' }"
            />
          </div>
          <div class="bd-contribution">
            +{{ item.contribution.toFixed(2) }}
          </div>
        </div>
      </div>
      <div v-else class="muted">{{ t('status.loading') }}</div>
    </section>

    <section class="card wallet-formula">
      <h3>{{ t('wallet.formulaTitle') }}</h3>
      <p class="muted" style="font-size: 12px; line-height: 1.6;">
        {{ t('wallet.formulaDesc') }}
      </p>
      <pre class="code">{{ t('wallet.formula') }}</pre>
      <div class="muted" style="font-size: 11px; margin-top: 6px;">
        {{ t('wallet.formulaNote') }}
      </div>
    </section>
  </div>
</template>

<style scoped>
.wallet-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.wallet-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.wallet-hero-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.wallet-balance {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.wallet-coin {
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 0.05em;
  font-size: 14px;
  text-transform: uppercase;
}
.wallet-amount {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text);
  font-feature-settings: 'tnum';
}
.wallet-sub {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.wallet-hero-side {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 12px 24px;
}
.wallet-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.wallet-stat .stat-val {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  font-feature-settings: 'tnum';
}
.wallet-stat .unit {
  font-size: 12px;
  color: var(--muted);
  font-weight: 400;
  margin-left: 2px;
}

.wallet-breakdown-card h3,
.wallet-formula h3 {
  margin: 0 0 12px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  font-weight: 600;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.breakdown-row {
  display: grid;
  grid-template-columns: 160px 1fr 80px;
  align-items: center;
  gap: 12px;
}
.bd-axis {
  font-weight: 500;
  font-size: 13px;
}
.bd-bar {
  height: 12px;
  background: var(--panel-2);
  border-radius: 6px;
  overflow: hidden;
}
.bd-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s;
}
.bd-contribution {
  text-align: right;
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 13px;
  color: var(--accent-2);
  font-weight: 600;
}

.wallet-formula pre {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.7;
}
</style>
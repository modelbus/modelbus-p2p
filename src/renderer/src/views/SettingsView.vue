<script setup lang="ts">
import { ref } from 'vue';
import { t } from '../i18n';
import type { AppRefs, AppActions, AppHelpers } from './types';
import ProfileSettings from './settings/ProfileSettings.vue';
import ProvisionSettings from './settings/ProvisionSettings.vue';
import ServiceSettings from './settings/ServiceSettings.vue';

const props = defineProps<{
  refs: AppRefs;
  actions: AppActions;
  helpers: AppHelpers;
  initialSub?: 'profile' | 'provision' | 'service';
}>();

type Sub = 'profile' | 'provision' | 'service';

const sub = ref<Sub>(props.initialSub ?? 'profile');

interface NavItem {
  key: Sub;
  labelKey: string;
  hintKey: string;
  icon: 'profile' | 'provision' | 'service';
}

const navItems: NavItem[] = [
  {
    key: 'profile',
    labelKey: 'settings.tab.profile',
    hintKey: 'settings.tabHint.profile',
    icon: 'profile',
  },
  {
    key: 'provision',
    labelKey: 'settings.tab.provision',
    hintKey: 'settings.tabHint.provision',
    icon: 'provision',
  },
  {
    key: 'service',
    labelKey: 'settings.tab.service',
    hintKey: 'settings.tabHint.service',
    icon: 'service',
  },
];

function pickSub(k: Sub) {
  sub.value = k;
}

function openDevTools() {
  window.modelbus.system.openDevTools().catch((err) => {
    console.error('[system] openDevTools failed:', err);
  });
}

function openLogsFolder() {
  window.modelbus.system.openLogsFolder().catch((err) => {
    console.error('[system] openLogsFolder failed:', err);
  });
}
</script>

<template>
  <div class="settings-shell">
    <!-- Vertical sidebar nav -->
    <aside class="settings-nav">
      <div class="settings-nav-head">
        <div class="settings-nav-title">{{ t('settings.title') }}</div>
        <div class="settings-nav-sub">{{ t('settings.subtitle') }}</div>
      </div>
      <nav class="settings-nav-list">
        <button
          v-for="item in navItems"
          :key="item.key"
          class="settings-nav-item"
          :class="{ active: sub === item.key }"
          @click="pickSub(item.key)"
        >
          <span class="settings-nav-icon">
            <!-- icon: profile -->
            <svg v-if="item.icon === 'profile'" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="1.7"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="3.4" />
              <path d="M4 20a8 8 0 0 1 16 0" />
            </svg>
            <!-- icon: provision (models / cube) -->
            <svg v-else-if="item.icon === 'provision'" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="1.7"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
              <path d="M12 12l8-4.5" />
              <path d="M12 12v9" />
              <path d="M12 12L4 7.5" />
            </svg>
            <!-- icon: service (globe) -->
            <svg v-else width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="1.7"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3a14 14 0 0 1 0 18" />
              <path d="M12 3a14 14 0 0 0 0 18" />
            </svg>
          </span>
          <span class="settings-nav-text">
            <span class="settings-nav-label">{{ t(item.labelKey) }}</span>
            <span class="settings-nav-hint">{{ t(item.hintKey) }}</span>
          </span>
          <svg class="settings-nav-arrow" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </nav>

      <div class="settings-nav-foot">
        <button class="ghost-btn" :title="t('system.openDevTools')" @click="openDevTools">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>{{ t('system.openDevTools') }}</span>
        </button>
        <button class="ghost-btn" :title="t('system.openLogsFolder')" @click="openLogsFolder">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span>{{ t('system.openLogsFolder') }}</span>
        </button>
      </div>
    </aside>

    <!-- Right content pane -->
    <div class="settings-content">
      <ProfileSettings
        v-if="sub === 'profile'"
        :refs="refs"
        :actions="actions"
        :helpers="helpers"
      />
      <ProvisionSettings
        v-else-if="sub === 'provision'"
        :refs="refs"
        :actions="actions"
      />
      <ServiceSettings v-else-if="sub === 'service'" :refs="refs" :actions="actions" />
    </div>
  </div>
</template>

<style scoped>
.settings-shell {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
  align-items: flex-start;
}
@media (max-width: 900px) {
  .settings-shell {
    grid-template-columns: 1fr;
  }
}

.settings-nav {
  position: sticky;
  top: 0;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.settings-nav-head {
  padding: 4px 8px 12px;
  border-bottom: 1px solid var(--border);
}
.settings-nav-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.01em;
}
.settings-nav-sub {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
}
.settings-nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.settings-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  color: var(--text-soft);
  font: inherit;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.settings-nav-item:hover {
  background: var(--bg-elev);
  color: var(--text);
}
.settings-nav-item.active {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: transparent;
}
.settings-nav-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--bg-elev);
  color: inherit;
  flex-shrink: 0;
}
.settings-nav-item.active .settings-nav-icon {
  background: var(--panel);
}
.settings-nav-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.settings-nav-label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.settings-nav-hint {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.settings-nav-arrow {
  opacity: 0;
  transition: opacity 0.12s, transform 0.12s;
}
.settings-nav-item.active .settings-nav-arrow {
  opacity: 1;
  transform: translateX(0);
}
.settings-nav-item:not(.active) .settings-nav-arrow {
  transform: translateX(-2px);
}
.settings-nav-item:hover .settings-nav-arrow {
  opacity: 0.5;
  transform: translateX(0);
}
.settings-nav-foot {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--muted);
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}
.ghost-btn:hover {
  background: var(--bg-elev);
  color: var(--text);
}

.settings-content {
  min-width: 0;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px 28px;
}
:deep(.settings-pane) {
  display: flex;
  flex-direction: column;
}
:deep(.pane-header) {
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}
:deep(.pane-header h2) {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--text);
}
:deep(.pane-header .muted) {
  margin: 6px 0 0;
  font-size: 13px;
}
:deep(.form-actions) {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
:deep(.hint) {
  margin-top: 4px;
  font-size: 11px;
  color: var(--muted);
  line-height: 1.45;
}
</style>
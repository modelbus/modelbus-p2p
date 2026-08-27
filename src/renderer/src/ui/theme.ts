import { ref, watch } from 'vue';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'modelbus.theme';
const valid = (v: string | null): v is Theme => v === 'light' || v === 'dark' || v === 'system';

const initial: Theme = (() => {
  if (typeof localStorage === 'undefined') return 'light';
  const v = localStorage.getItem(STORAGE_KEY);
  return valid(v) ? v : 'light';
})();

export const theme = ref<Theme>(initial);

function applyTheme(value: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', value);
}

applyTheme(theme.value);

watch(theme, (v) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, v);
  applyTheme(v);
});

export const themeOptions: Array<{ id: Theme; label: string }> = [
  { id: 'light', label: '☀ Light' },
  { id: 'dark', label: '🌙 Dark' },
  { id: 'system', label: '⚙ System' },
];
import { ref, computed, watch } from 'vue';
import { zhCN, type Dict, type Locale } from './zh-CN';
import { zhTW } from './zh-TW';
import { enUS } from './en-US';
import { jaJP } from './ja-JP';
import { koKR } from './ko-KR';

const STORAGE_KEY = 'modelbus.locale';

const dictionaries: Record<Locale, Dict> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR,
};

const stored =
  (typeof localStorage !== 'undefined' && (localStorage.getItem(STORAGE_KEY) as Locale)) || 'zh-CN';
const locale = ref<Locale>(stored in dictionaries ? stored : 'zh-CN');

watch(locale, (v) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, v);
});

export const currentLocale = locale;

export const dict = computed<Dict>(() => dictionaries[locale.value]);

/**
 * Resolve a dotted key like 'nav.status' against the dictionary.
 * Supports `{n}` interpolation when the value is a string, and
 * forwards params to a function-typed value.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const segs = key.split('.');
  let cur: unknown = dict.value;
  for (const s of segs) {
    if (cur && typeof cur === 'object' && s in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[s];
    } else {
      return key;
    }
  }
  if (typeof cur === 'string') return interpolate(cur, params);
  if (typeof cur === 'function') {
    try {
      const out = (cur as (p?: Record<string, string | number>) => unknown)(params);
      if (typeof out === 'string') return out;
    } catch {
      /* ignore */
    }
  }
  return key;
}

function interpolate(s: string, params?: Record<string, string | number>): string {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}

export function setLocale(next: Locale) {
  locale.value = next;
}

export const availableLocales: Array<{ id: Locale; label: string; cc: string }> = [
  { id: 'zh-CN', label: '简体中文', cc: 'cn' },
  { id: 'zh-TW', label: '繁體中文', cc: 'tw' },
  { id: 'en-US', label: 'English', cc: 'us' },
  { id: 'ja-JP', label: '日本語', cc: 'jp' },
  { id: 'ko-KR', label: '한국어', cc: 'kr' },
];
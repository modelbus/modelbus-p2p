import { ref, computed, watch } from 'vue';
import { zhCN, type Dict, type Locale } from './zh-CN';
import { zhTW } from './zh-TW';
import { enUS } from './en-US';
import { koKR } from './ko-KR';
import { deDE } from './de-DE';
import { esES } from './es-ES';
import { frFR } from './fr-FR';
import { itIT } from './it-IT';
import { daDK } from './da-DK';
import { jaJP } from './ja-JP';
import { plPL } from './pl-PL';
import { ruRU } from './ru-RU';
import { bsBA } from './bs-BA';
import { arSA } from './ar-SA';
import { nbNO } from './nb-NO';
import { ptBR } from './pt-BR';
import { thTH } from './th-TH';
import { trTR } from './tr-TR';
import { ukUA } from './uk-UA';
import { bnBD } from './bn-BD';
import { elGR } from './el-GR';
import { viVN } from './vi-VN';

const STORAGE_KEY = 'modelbus.locale';

const dictionaries: Record<Locale, Dict> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ko-KR': koKR,
  'de-DE': deDE,
  'es-ES': esES,
  'fr-FR': frFR,
  'it-IT': itIT,
  'da-DK': daDK,
  'ja-JP': jaJP,
  'pl-PL': plPL,
  'ru-RU': ruRU,
  'bs-BA': bsBA,
  'ar-SA': arSA,
  'nb-NO': nbNO,
  'pt-BR': ptBR,
  'th-TH': thTH,
  'tr-TR': trTR,
  'uk-UA': ukUA,
  'bn-BD': bnBD,
  'el-GR': elGR,
  'vi-VN': viVN,
};

const stored =
  (typeof localStorage !== 'undefined' && (localStorage.getItem(STORAGE_KEY) as Locale)) || 'zh-CN';
const locale = ref<Locale>(stored in dictionaries ? stored : 'zh-CN');

watch(locale, (v) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, v);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', v);
    document.documentElement.setAttribute('dir', v === 'ar-SA' ? 'rtl' : 'ltr');
  }
});

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('lang', locale.value);
  document.documentElement.setAttribute('dir', locale.value === 'ar-SA' ? 'rtl' : 'ltr');
}

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

export const availableLocales: Array<{ id: Locale; label: string; cc: string; dir?: 'rtl' }> = [
  { id: 'zh-CN', label: '简体中文', cc: 'cn' },
  { id: 'zh-TW', label: '繁體中文', cc: 'cn' },
  { id: 'en-US', label: 'English', cc: 'us' },
  { id: 'ko-KR', label: '한국어', cc: 'kr' },
  { id: 'de-DE', label: 'Deutsch', cc: 'de' },
  { id: 'es-ES', label: 'Español', cc: 'es' },
  { id: 'fr-FR', label: 'Français', cc: 'fr' },
  { id: 'it-IT', label: 'Italiano', cc: 'it' },
  { id: 'da-DK', label: 'Dansk', cc: 'dk' },
  { id: 'ja-JP', label: '日本語', cc: 'jp' },
  { id: 'pl-PL', label: 'Polski', cc: 'pl' },
  { id: 'ru-RU', label: 'Русский', cc: 'ru' },
  { id: 'bs-BA', label: 'Bosanski', cc: 'ba' },
  { id: 'ar-SA', label: 'العربية', cc: 'sa', dir: 'rtl' },
  { id: 'nb-NO', label: 'Norsk', cc: 'no' },
  { id: 'pt-BR', label: 'Português (Brasil)', cc: 'br' },
  { id: 'th-TH', label: 'ไทย', cc: 'th' },
  { id: 'tr-TR', label: 'Türkçe', cc: 'tr' },
  { id: 'uk-UA', label: 'Українська', cc: 'ua' },
  { id: 'bn-BD', label: 'বাংলা', cc: 'bd' },
  { id: 'el-GR', label: 'Ελληνικά', cc: 'gr' },
  { id: 'vi-VN', label: 'Tiếng Việt', cc: 'vn' },
];
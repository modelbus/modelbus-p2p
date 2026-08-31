import { ref, watch, type Ref } from 'vue';

/**
 * Per-peer user preferences stored in localStorage. Two lists:
 *
 *   pinned    — peers the user wants surfaced at the top of any
 *               catalogue view regardless of quality / latency
 *   blacklisted — peers the user wants hidden from the default
 *               catalogue view; a 'show blacklisted' toggle in the
 *               Nodes tab brings them back, struck-through, so the
 *               user can revisit / un-blacklist without losing the
 *               entry.
 *
 * Both lists are keyed by the peer's peerId (multihash string).
 * The lists are persisted as a single JSON blob under one storage
 * key so we don't fan-out to per-key quota / atomicity issues.
 */
const STORAGE_KEY = 'modelbus.nodePrefs.v1';

interface NodePrefs {
  pinned: string[];
  blacklisted: string[];
}

function empty(): NodePrefs {
  return { pinned: [], blacklisted: [] };
}

function load(): NodePrefs {
  if (typeof localStorage === 'undefined') return empty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return empty();
    const pinned = Array.isArray(parsed.pinned) ? parsed.pinned.filter((s: unknown) => typeof s === 'string') : [];
    const blacklisted = Array.isArray(parsed.blacklisted)
      ? parsed.blacklisted.filter((s: unknown) => typeof s === 'string')
      : [];
    return { pinned, blacklisted };
  } catch {
    return empty();
  }
}

function save(prefs: NodePrefs) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* quota / private-mode failures are non-fatal */
  }
}

/**
 * Singleton shared across the renderer. Components subscribe by
 * reading the refs directly; the watch flushes changes back to
 * localStorage on every mutation.
 */
const pinned = ref<string[]>([]);
const blacklisted = ref<string[]>([]);
let initialised = false;

function ensureInit() {
  if (initialised) return;
  const prefs = load();
  pinned.value = prefs.pinned;
  blacklisted.value = prefs.blacklisted;
  initialised = true;
}

watch(
  [pinned, blacklisted],
  () => {
    if (!initialised) return;
    save({ pinned: pinned.value, blacklisted: blacklisted.value });
  },
  { deep: true }
);

function isPinned(peerId: string): boolean {
  ensureInit();
  return pinned.value.includes(peerId);
}

function togglePin(peerId: string) {
  ensureInit();
  const idx = pinned.value.indexOf(peerId);
  if (idx >= 0) pinned.value.splice(idx, 1);
  else pinned.value.push(peerId);
}

function isBlacklisted(peerId: string): boolean {
  ensureInit();
  return blacklisted.value.includes(peerId);
}

function toggleBlacklist(peerId: string) {
  ensureInit();
  const idx = blacklisted.value.indexOf(peerId);
  if (idx >= 0) blacklisted.value.splice(idx, 1);
  else blacklisted.value.push(peerId);
}

/**
 * Convenience hook returning the live refs + helpers. Components
 * import this once and use the returned closures.
 */
export function useNodePrefs(): {
  pinned: Ref<string[]>;
  blacklisted: Ref<string[]>;
  isPinned: (peerId: string) => boolean;
  togglePin: (peerId: string) => void;
  isBlacklisted: (peerId: string) => boolean;
  toggleBlacklist: (peerId: string) => void;
} {
  ensureInit();
  return {
    pinned,
    blacklisted,
    isPinned,
    togglePin,
    isBlacklisted,
    toggleBlacklist,
  };
}
import type { NodeAnnouncement, NodeAnnouncementFlat } from '@shared/types';
import { TRUSTED_ROOT_PEER_IDS } from '../config/trusted-roots.js';

const FETCH_TIMEOUT_MS = 10_000;

/**
 * RegistryService is the gateway between the local node and the wider
 * "modelbus" network. It is the single point that knows how to:
 *
 *   1. fetch the public catalogue from the official HTTPS endpoint
 *      (or from a local file:// mock that has the same shape);
 *   2. validate each announcement against a hard-coded list of
 *      `trustedRoot` peerIds — this is how a brand-new client trusts
 *      its first hop without any central signing authority;
 *   3. cache the validated subset on disk so the next launch can
 *      come up before the network is reachable.
 *
 * The mock file (`mock/nodes.json`) and the official endpoint both
 * speak the same array-of-NodeAnnouncement shape — there is no
 * envelope, no signature, no revision field. Trust is computed
 * locally by membership in the trusted-root set.
 */
export class RegistryService {
  /** Trusted peerIds baked into the binary. Used as the trust root for
   *  cold start. */
  readonly trustedRoots: ReadonlySet<string> = new Set(TRUSTED_ROOT_PEER_IDS);

  async fetch(url: string): Promise<NodeAnnouncementFlat[]> {
    try {
      const u = new URL(url);
      let raw: unknown;
      if (u.protocol === 'file:') {
        const path = decodeURIComponent(u.pathname);
        const { readFile } = await import('node:fs/promises');
        const text = await readFile(path, 'utf-8');
        raw = JSON.parse(text);
      } else {
        const r = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        raw = await r.json();
      }
      const announcements = Array.isArray(raw) ? raw : [];
      return this.flatten(announcements);
    } catch (err) {
      console.warn('[registry] fetch failed:', (err as Error).message);
      return [];
    }
  }

  /**
   * Validates + flattens a raw list of NodeAnnouncement into the
   * backwards-compatible flat shape that consume / leaderboard views
   * consume. Items with bad schema are dropped silently; the renderer
   * is expected to render whatever survived.
   */
  flatten(items: unknown[]): NodeAnnouncementFlat[] {
    const out: NodeAnnouncementFlat[] = [];
    for (const raw of items) {
      const flat = this.toFlat(raw);
      if (flat) out.push(flat);
    }
    return out;
  }

  /** Returns the single flat row derived from a raw entry, or null. */
  toFlat(raw: unknown): NodeAnnouncementFlat | null {
    if (!raw || typeof raw !== 'object') return null;
    const item = raw as Partial<NodeAnnouncement> & Record<string, unknown>;

    if (typeof item.peerId !== 'string' || item.peerId.length === 0) return null;
    if (!item.addr || typeof item.addr !== 'object') return null;
    const structuredAddr = item.addr as Partial<NodeAnnouncement['addr']>;
    if (typeof structuredAddr.addr !== 'string') return null;
    if (!Array.isArray(item.providers) || item.providers.length === 0) return null;

    const providers = item.providers
      .filter((p): p is NodeAnnouncement['providers'][number] => !!p && typeof p === 'object')
      .map((p) => ({
        providerId: String(p.providerId ?? ''),
        providerName: String(p.providerName ?? p.providerId ?? ''),
        models: Array.isArray(p.models)
          ? p.models
              .filter((m): m is { id: string; name: string } => !!m && typeof m === 'object')
              .map((m) => ({ id: String(m.id ?? ''), name: String(m.name ?? m.id ?? '') }))
              .filter((m) => m.id)
          : [],
      }))
      .filter((p) => p.providerId);

    if (providers.length === 0) return null;

    // The "flat" view picks the first provider's first model as the
    // headline. Real routing is done by model.id (see upstream.ts +
    // proxy-server.ts) so this is only used for backwards-compatible
    // summaries.
    const primary = providers[0];
    const modelIds = primary.models.map((m) => m.id);

    const announcedAt =
      typeof item.announcedAt === 'number' ? item.announcedAt : Date.now();

    return {
      peerId: item.peerId,
      nickname: String(item.nickname ?? item.peerId.slice(0, 8)),
      providerId: primary.providerId,
      providerName: primary.providerName,
      modelIds,
      primaryAddr: structuredAddr.addr,
      announcedAt,
      trusted: this.trustedRoots.has(item.peerId),
    };
  }

  /**
   * Quick test used by ipc.ts to decide whether the local node can be
   * announced under a given invite. The deeper chain-of-trust
   * validation lives in services/trust.ts; this just answers
   * "is this peer one of our hardcoded roots?".
   */
  isTrustedRoot(peerId: string): boolean {
    return this.trustedRoots.has(peerId);
  }
}
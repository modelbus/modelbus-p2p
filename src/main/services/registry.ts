import type { NodeAnnouncement } from '@shared/types';

export class RegistryService {
  async fetch(url: string): Promise<NodeAnnouncement[]> {
    try {
      const u = new URL(url);
      if (u.protocol === 'file:') {
        const path = decodeURIComponent(u.pathname);
        const { readFile } = await import('node:fs/promises');
        const raw = await readFile(path, 'utf-8');
        const data = JSON.parse(raw);
        return this.normalize(Array.isArray(data) ? data : []);
      }
      const r = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      return this.normalize(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('[registry] fetch failed:', (err as Error).message);
      return [];
    }
  }

  private normalize(items: unknown[]): NodeAnnouncement[] {
    const out: NodeAnnouncement[] = [];
    const now = Date.now();
    for (const raw of items) {
      const item = raw as Partial<NodeAnnouncement> & Record<string, unknown>;
      if (!item?.peerId || !item?.providerId) continue;
      out.push({
        peerId: String(item.peerId),
        nickname: String(item.nickname ?? item.peerId.slice(0, 8)),
        providerId: String(item.providerId),
        providerName: String(item.providerName ?? item.providerId),
        modelIds: Array.isArray(item.modelIds) ? item.modelIds.map(String) : [],
        multiaddrs: Array.isArray(item.multiaddrs) ? item.multiaddrs.map(String) : [],
        announcedAt: typeof item.announcedAt === 'number' ? item.announcedAt : now,
      });
    }
    return out;
  }
}
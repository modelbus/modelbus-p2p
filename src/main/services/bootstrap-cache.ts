import { app } from 'electron';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { NodeAnnouncementFlat } from '@shared/types';

/**
 * Persists the validated subset of nodes between launches so the
 * next boot can come up even if the official endpoint is unreachable.
 * File lives in <userData>/bootstrap-cache.json.
 *
 * The cache stores FLAT rows so we don't have to re-run schema
 * validation on every read; the cost is that we lose the structured
 * `addr` field. That's fine — the flat row already carries
 * `primaryAddr as a plain multiaddr string, which is what every
 * downstream consumer needs.
 */
export class BootstrapCache {
  private path: string;

  constructor(filename = 'bootstrap-cache.json') {
    this.path = join(app.getPath('userData'), filename);
  }

  async load(): Promise<NodeAnnouncementFlat[]> {
    try {
      const raw = await fs.readFile(this.path, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((x): x is NodeAnnouncementFlat => !!x && typeof x === 'object');
    } catch {
      return [];
    }
  }

  async save(rows: NodeAnnouncementFlat[]): Promise<void> {
    const dir = join(this.path, '..');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(rows, null, 2));
  }

  async clear(): Promise<void> {
    try {
      await fs.unlink(this.path);
    } catch {
      /* nothing to clear */
    }
  }
}
import type { ProviderSummary, ProviderDetail } from '@shared/types';
import { PATHS } from './paths.js';

const API_BASE = 'https://models.dev';
const ENDPOINTS = {
  catalog: `${API_BASE}/api.json`,
  models: `${API_BASE}/models.json`,
};

interface RawProvider {
  id: string;
  name: string;
  npm?: string;
  api?: string;
  doc?: string;
  env?: string[];
  models?: Record<string, unknown>;
}

type RawCatalog = Record<string, RawProvider>;

/**
 * ProviderService fetches the public models.dev catalog and converts it
 * into the local ProviderSummary / ProviderDetail shapes. Network or
 * TLS failures are handled gracefully — we return an empty catalog
 * rather than throwing, so the renderer can still surface a usable
 * (if empty) list. The user can still type an apiBase manually.
 */
export class ProviderService {
  private catalog: RawCatalog | null = null;
  private fetchedAt = 0;
  private readonly ttlMs = 1000 * 60 * 30; // 30 分钟
  private inflight: Promise<RawCatalog> | null = null;

  async ensureCatalog(force = false): Promise<RawCatalog> {
    const fresh = this.catalog && Date.now() - this.fetchedAt < this.ttlMs;
    if (fresh && !force) return this.catalog!;
    if (this.inflight) return this.inflight;
    this.inflight = (async () => {
      try {
        const r = await fetch(ENDPOINTS.catalog, {
          // 10 s is plenty for a small JSON; aborts cleanly on dead proxies.
          signal: AbortSignal.timeout(10_000),
        });
        if (!r.ok) throw new Error(`Failed to load providers: HTTP ${r.status}`);
        const data = (await r.json()) as RawCatalog;
        this.catalog = data;
        this.fetchedAt = Date.now();
        return data;
      } catch (err) {
        // Graceful degradation: the UI can still let the user pick a
        // provider id manually (and it falls back to a known default
        // base URL in upstream.ts). We never throw, so the renderer
        // can show an empty list and a hint rather than a raw fetch
        // error on the Token 上线 tab.
        const msg = (err as Error).message || 'fetch failed';
        try {
          const { appendFile } = await import('node:fs/promises');
          await appendFile(
            PATHS.log,
            `${new Date().toISOString()} [WARN] providers:list fetch failed: ${msg}\n`
          );
        } catch { /* logging is best-effort */ }
        return {};
      } finally {
        this.inflight = null;
      }
    })();
    return this.inflight;
  }

  async list(force = false): Promise<ProviderSummary[]> {
    const cat = await this.ensureCatalog(force);
    return Object.values(cat)
      .map((p) => this.toSummary(p))
      .filter((p): p is ProviderSummary => !!p)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async get(id: string): Promise<ProviderDetail | null> {
    // If the catalog can't be reached, the caller can still pass an
    // apiBase override, so we don't need the network to construct a
    // usable ProviderDetail — we just don't have a model list yet.
    let cat: RawCatalog = {};
    try {
      cat = await this.ensureCatalog(false);
    } catch {
      cat = {};
    }
    const p = cat[id];
    if (!p) {
      // The provider isn't in the catalog (or the catalog is empty).
      // We can still return a minimal record from our built-in known
      // baseUrl map so a manual apiBase override can take over.
      return this.fallbackDetail(id);
    }
    const summary = this.toSummary(p);
    if (!summary) return null;
    const models = Object.values(p.models ?? {}).map((m) => this.toModelInfo(m));
    return { ...summary, models };
  }

  /**
   * Minimal ProviderDetail when the catalog is unreachable. Lets the
   * renderer keep selecting a provider id and lets the user fill in
   * apiBase + apiKey manually. Better than throwing all the way back
   * to the UI as a cryptic fetch error.
   */
  private fallbackDetail(id: string): ProviderDetail | null {
    if (!id) return null;
    return {
      id,
      name: id,
      npm: '',
      api: undefined,
      doc: '',
      env: [],
      modelCount: 0,
      models: [],
    };
  }

  private toSummary(p: RawProvider): ProviderSummary | null {
    if (!p?.id || !p?.name) return null;
    return {
      id: p.id,
      name: p.name,
      npm: p.npm ?? '',
      api: p.api,
      doc: p.doc ?? '',
      env: Array.isArray(p.env) ? p.env : [],
      modelCount: p.models ? Object.keys(p.models).length : 0,
    };
  }

  private toModelInfo(raw: unknown): ProviderDetail['models'][number] {
    const m = raw as Record<string, unknown>;
    const limit = (m.limit as Record<string, unknown> | undefined) ?? {};
    return {
      id: String(m.id ?? ''),
      name: String(m.name ?? m.id ?? ''),
      description: typeof m.description === 'string' ? m.description : undefined,
      context: typeof limit.context === 'number' ? limit.context : undefined,
      output: typeof limit.output === 'number' ? limit.output : undefined,
      attachment: typeof m.attachment === 'boolean' ? m.attachment : undefined,
      tool_call: typeof m.tool_call === 'boolean' ? m.tool_call : undefined,
      reasoning: typeof m.reasoning === 'boolean' ? m.reasoning : undefined,
    };
  }
}
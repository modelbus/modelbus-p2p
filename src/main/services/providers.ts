import type { ProviderSummary, ProviderDetail } from '@shared/types';

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

export class ProviderService {
  private catalog: RawCatalog | null = null;
  private fetchedAt = 0;
  private readonly ttlMs = 1000 * 60 * 30; // 30 分钟
  private inflight: Promise<RawCatalog> | null = null;

  async ensureCatalog(force = false): Promise<RawCatalog> {
    const fresh = this.catalog && Date.now() - this.fetchedAt < this.ttlMs;
    if (fresh && !force) return this.catalog!;
    if (this.inflight) return this.inflight;
    this.inflight = fetch(ENDPOINTS.catalog)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed to load providers: HTTP ${r.status}`);
        const data = (await r.json()) as RawCatalog;
        this.catalog = data;
        this.fetchedAt = Date.now();
        return data;
      })
      .finally(() => {
        this.inflight = null;
      });
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
    const cat = await this.ensureCatalog(false);
    const p = cat[id];
    if (!p) return null;
    const summary = this.toSummary(p);
    if (!summary) return null;
    const models = Object.values(p.models ?? {}).map((m) => this.toModelInfo(m));
    return { ...summary, models };
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
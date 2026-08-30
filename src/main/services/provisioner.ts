import type { Libp2p } from 'libp2p';
import type { ProviderDetail, ProvisionConfig, ProviderCredential } from '@shared/types';
import { INFERENCE_PROTOCOL, serveInference } from '../proto/inference.js';
import { buildUpstreamCall, callUpstream } from './upstream.js';
import { ProviderService } from './providers.js';

export interface ProvisionerEvents {
  emit(event: { type: string; payload: unknown }): void;
}

/**
 * ProvisionerService registers a single libp2p protocol handler for the
 * `/modelbus/inference/1.0.0` protocol. A node can carry several LLM
 * providers at once (e.g. MiniMax + DeepSeek); incoming requests are
 * routed to the right provider by the canonical model id.
 *
 * If the caller asks for a model that this node doesn't carry, the
 * service returns 400 with an explanatory body — it never falls through
 * to a random provider.
 */
export class ProvisionerService {
  private registered = false;
  /**
   * Map from providerId to its credential + ProviderDetail (models.dev).
   * One node can carry many provider configs (one per LLM vendor).
   */
  private providers: Map<string, { config: ProviderCredential; detail: ProviderDetail }> = new Map();

  constructor(
    private libp2p: () => Libp2p | null,
    private providersService: ProviderService,
    private events: ProvisionerEvents
  ) {}

  isActive(): boolean {
    return this.registered && this.providers.size > 0;
  }

  /** Convenience: return the primary (first registered) provider credential. */
  config(): ProviderCredential | null {
    const first = this.providers.values().next().value;
    return first ? first.config : null;
  }

  /**
   * (Re)register the inference handler and install the full set of
   * provider credentials. Replaces any previous set atomically.
   */
  async register(config: ProvisionConfig): Promise<void> {
    const node = this.libp2p();
    if (!node) throw new Error('libp2p node is not started');

    // Resolve all providers first so a bad providerId fails cleanly
    // without leaving a half-installed route table.
    const next = new Map<string, { config: ProviderCredential; detail: ProviderDetail }>();
    for (const cred of config.providers) {
      const detail = await this.providersService.get(cred.providerId);
      if (!detail) throw new Error(`unknown provider ${cred.providerId}`);
      next.set(cred.providerId, { config: cred, detail });
    }
    if (next.size === 0) throw new Error('at least one provider is required');

    if (!this.registered) {
      await node.handle(
        INFERENCE_PROTOCOL,
        serveInference(async (req) => this.handleLocal(req)),
        { maxInboundStreams: 32 }
      );
      this.registered = true;
    }

    this.providers = next;

    this.events.emit({
      type: 'provision:registered',
      payload: {
        peerId: config.peerId,
        providerCount: this.providers.size,
        providers: Array.from(this.providers.values()).map((e) => e.detail.name),
      },
    });
  }

  async unregister(): Promise<void> {
    if (!this.registered) return;
    const node = this.libp2p();
    if (node) {
      try {
        await node.unhandle(INFERENCE_PROTOCOL);
      } catch {
        /* ignore */
      }
    }
    this.registered = false;
    this.providers.clear();
    this.events.emit({ type: 'provision:unregistered', payload: {} });
  }

  /** Remove a single provider from the route table. */
  async unregisterProvider(providerId: string): Promise<void> {
    this.providers.delete(providerId);
    if (this.providers.size === 0) {
      await this.unregister();
    } else {
      this.events.emit({
        type: 'provision:unregistered',
        payload: { providerId, remaining: this.providers.size },
      });
    }
  }

  /** Resolve which provider should serve a given model id. */
  resolveProvider(modelId: string): { config: ProviderCredential; detail: ProviderDetail } | null {
    for (const entry of this.providers.values()) {
      if (entry.config.modelIds.includes(modelId)) return entry;
    }
    // Fallback: if only one provider is registered, route to it.
    if (this.providers.size === 1) {
      return this.providers.values().next().value ?? null;
    }
    return null;
  }

  /**
   * Handle an inference request locally, without going through the
   * libp2p stream. This is what ConsumerProxy calls when the selected
   * target peer is our own node — libp2p forbids dialing yourself
   * ("Can not dial self"), so the loop must be short-circuited here.
   */
  async handleLocal(req: {
    model: string;
    path: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    id: string;
  }) {
    const routed = this.resolveProvider(req.model);
    if (!routed) {
      this.events.emit({
        type: 'provision:served',
        payload: { model: req.model, status: 400, error: 'model not hosted on this node' },
      });
      return {
        id: req.id,
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: `model "${req.model}" is not hosted by this peer` }),
      };
    }

    try {
      const upstream = buildUpstreamCall(
        routed.detail,
        routed.config.apiKey,
        req.path,
        req.method,
        req.headers,
        req.body
      );
      const r = await callUpstream(upstream);
      this.events.emit({
        type: 'provision:served',
        payload: { model: req.model, status: r.status, provider: routed.detail.id },
      });
      return {
        id: req.id,
        status: r.status,
        headers: r.headers,
        body: r.body,
      };
    } catch (err) {
      const status = (err as { status?: number }).status ?? 500;
      this.events.emit({
        type: 'provision:served',
        payload: { model: req.model, status, provider: routed.detail.id, error: (err as Error).message },
      });
      return {
        id: req.id,
        status,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: (err as Error).message }),
      };
    }
  }

  /** Expose the count of registered providers — used by the UI. */
  get providerCount(): number {
    return this.providers.size;
  }

  /** Expose the registered providers list — used by the UI. */
  listProviders(): Array<{ providerId: string; modelIds: string[] }> {
    return Array.from(this.providers.entries()).map(([providerId, { config }]) => ({
      providerId,
      modelIds: [...config.modelIds],
    }));
  }
}
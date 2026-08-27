import type { Libp2p } from 'libp2p';
import type { PeerId } from '@libp2p/interface';
import type { ProviderDetail, ProvisionConfig } from '@shared/types';
import { INFERENCE_PROTOCOL, serveInference } from '../proto/inference.js';
import { buildUpstreamCall, callUpstream } from './upstream.js';
import { ProviderService } from './providers.js';

export interface ProvisionerEvents {
  emit(event: { type: string; payload: unknown }): void;
}

export class ProvisionerService {
  private registered = false;
  private currentConfig: ProvisionConfig | null = null;
  private currentProvider: ProviderDetail | null = null;

  constructor(
    private libp2p: () => Libp2p | null,
    private providers: ProviderService,
    private events: ProvisionerEvents
  ) {}

  isActive(): boolean {
    return this.registered && !!this.currentConfig;
  }

  config(): ProvisionConfig | null {
    return this.currentConfig;
  }

  async register(config: ProvisionConfig): Promise<void> {
    await this.unregister();
    const node = this.libp2p();
    if (!node) throw new Error('libp2p node is not started');
    const provider = await this.providers.get(config.providerId);
    if (!provider) throw new Error(`unknown provider ${config.providerId}`);

    this.currentConfig = config;
    this.currentProvider = provider;

    await node.handle(INFERENCE_PROTOCOL, serveInference(async (req) => {
      return this.handleInference(config, provider, req);
    }), { maxInboundStreams: 32 });

    this.registered = true;
    this.events.emit({
      type: 'provision:registered',
      payload: {
        peerId: config.peerId,
        provider: provider.name,
        models: config.modelIds.length,
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
        // ignore
      }
    }
    this.registered = false;
    this.currentConfig = null;
    this.currentProvider = null;
    this.events.emit({ type: 'provision:unregistered', payload: {} });
  }

  async handle(
    peerId: PeerId,
    config: ProvisionConfig,
    provider: ProviderDetail,
    req: { model: string; path: string; method: string; headers: Record<string, string>; body: string }
  ): Promise<{ status: number; headers: Record<string, string>; body: string }> {
    const upstream = buildUpstreamCall(
      provider,
      config.apiKey,
      req.path,
      req.method,
      req.headers,
      req.body
    );
    try {
      const r = await callUpstream(upstream);
      this.events.emit({
        type: 'provision:served',
        payload: {
          peerId: peerId.toString(),
          model: req.model,
          status: r.status,
        },
      });
      return r;
    } catch (err) {
      const status = (err as { status?: number }).status ?? 500;
      this.events.emit({
        type: 'provision:served',
        payload: { peerId: peerId.toString(), model: req.model, status, error: (err as Error).message },
      });
      return {
        status,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: (err as Error).message }),
      };
    }
  }

  private async handleInference(
    config: ProvisionConfig,
    provider: ProviderDetail,
    req: { model: string; path: string; method: string; headers: Record<string, string>; body: string; id: string }
  ) {
    const r = await this.handle(undefined as unknown as PeerId, config, provider, req);
    return {
      id: req.id,
      status: r.status,
      headers: r.headers,
      body: r.body,
    };
  }
}
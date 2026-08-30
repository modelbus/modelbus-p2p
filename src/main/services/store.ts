import { promises as fs } from 'node:fs';
import type { ProvisionConfig, BootstrapConfig } from '@shared/types';
import { PATHS } from './paths.js';

interface StoreShape {
  bootstrap?: BootstrapConfig;
  provision?: ProvisionConfig;
  /** Optional consumer-side API key. When set, ConsumerProxy rejects
   *  any HTTP request that doesn't carry it as `Authorization: Bearer`. */
  consumerApiKey?: string;
  /** True if the user wants the consumer proxy to start automatically
   *  whenever the P2P node comes up (so curl works without having to
   *  click anything first). */
  consumerAutostart?: boolean;
  /** base64-encoded protobuf Ed25519 private key used to derive the
   *  stable libp2p peerId (fallback when no hardware UUID exists). */
  peerKey?: string;
}

const DEFAULT_BOOTSTRAP: BootstrapConfig = {
  registryUrl: 'http://localhost:8089/nodes.json',
  bootstrapMultiaddrs: [
    '/ip4/127.0.0.1/tcp/15001/p2p/12D3KooWBnM2JxV67R3sX8kHnYwYqGRkfKvFnhGPGFJ6mhYMwRkz',
  ],
  tcpPort: 15001,
  proxyPort: 18100,
};

export class Store {
  private path: string;
  private data: StoreShape = {};

  /** Settings live in ~/.modelbus/p2p.json (see services/paths.ts). */
  constructor(path = PATHS.settings) {
    this.path = path;
  }

  async load(): Promise<void> {
    try {
      const raw = await fs.readFile(this.path, 'utf-8');
      this.data = JSON.parse(raw);
    } catch {
      this.data = {};
    }
  }

  async save(): Promise<void> {
    await fs.mkdir(PATHS.dir, { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(this.data, null, 2));
  }

  getBootstrap(): BootstrapConfig {
    return { ...DEFAULT_BOOTSTRAP, ...(this.data.bootstrap ?? {}) };
  }

  async setBootstrap(patch: Partial<BootstrapConfig>): Promise<BootstrapConfig> {
    const merged = { ...this.getBootstrap(), ...patch };
    this.data.bootstrap = merged;
    await this.save();
    return merged;
  }

  getProvision(): ProvisionConfig | null {
    return this.data.provision ?? null;
  }

  async setProvision(cfg: ProvisionConfig): Promise<void> {
    this.data.provision = cfg;
    await this.save();
  }

  async clearProvision(): Promise<void> {
    delete this.data.provision;
    await this.save();
  }

  getConsumerApiKey(): string | null {
    return this.data.consumerApiKey ?? null;
  }

  async setConsumerApiKey(key: string): Promise<void> {
    this.data.consumerApiKey = key;
    await this.save();
  }

  async clearConsumerApiKey(): Promise<void> {
    delete this.data.consumerApiKey;
    await this.save();
  }

  getConsumerAutostart(): boolean {
    return this.data.consumerAutostart ?? false;
  }

  async setConsumerAutostart(enabled: boolean): Promise<void> {
    this.data.consumerAutostart = enabled;
    await this.save();
  }

  /**
   * The persisted libp2p identity. A stable peerId is essential: without
   * it every app restart would mint a fresh peerId, invalidating the
   * provision entry, the consumer proxy's self-dial, and every peer that
   * cached our multiaddrs. Stored as a base64 protobuf Ed25519 private key.
   */
  getPeerKey(): string | null {
    return this.data.peerKey ?? null;
  }

  async setPeerKey(base64: string): Promise<void> {
    this.data.peerKey = base64;
    await this.save();
  }
}
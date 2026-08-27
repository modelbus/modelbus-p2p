import { app } from 'electron';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { ProvisionConfig, BootstrapConfig } from '@shared/types';

interface StoreShape {
  bootstrap?: BootstrapConfig;
  provision?: ProvisionConfig;
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

  constructor(filename = 'modelbus-store.json') {
    this.path = join(app.getPath('userData'), filename);
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
    const dir = join(this.path, '..');
    await fs.mkdir(dir, { recursive: true });
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
}
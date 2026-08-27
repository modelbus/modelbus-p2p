import { contextBridge, ipcRenderer } from 'electron';
import type {
  ProviderDetail,
  ProviderSummary,
  ProvisionConfig,
  NodeAnnouncement,
  ProxyStats,
  NodeRole,
  BootstrapConfig,
  WalletScore,
  ModelEntry,
  LeaderboardEntry,
  ModelQualityNode,
} from '../shared/types.js';

const api = {
  bootstrap: {
    getConfig: (): Promise<BootstrapConfig> => ipcRenderer.invoke('bootstrap:getConfig'),
    setConfig: (cfg: Partial<BootstrapConfig>): Promise<BootstrapConfig> =>
      ipcRenderer.invoke('bootstrap:setConfig', cfg),
  },
  providers: {
    list: (refresh?: boolean): Promise<ProviderSummary[]> =>
      ipcRenderer.invoke('providers:list', !!refresh),
    get: (id: string): Promise<ProviderDetail | null> =>
      ipcRenderer.invoke('providers:get', id),
  },
  registry: {
    fetch: (): Promise<NodeAnnouncement[]> => ipcRenderer.invoke('registry:fetch'),
  },
  p2p: {
    status: (): Promise<{
      started: boolean;
      peerId: string | null;
      multiaddrs: string[];
      role: 'idle' | 'provision' | 'consume';
      connected: number;
    }> => ipcRenderer.invoke('p2p:status'),
    start: (): Promise<void> => ipcRenderer.invoke('p2p:start'),
    stop: (): Promise<void> => ipcRenderer.invoke('p2p:stop'),
    onEvent: (handler: (event: { type: string; payload: unknown }) => void) => {
      const listener = (_: unknown, evt: { type: string; payload: unknown }) => handler(evt);
      ipcRenderer.on('p2p:event', listener);
      return () => ipcRenderer.off('p2p:event', listener);
    },
  },
  provision: {
    get: (): Promise<ProvisionConfig | null> => ipcRenderer.invoke('provision:get'),
    set: (cfg: Omit<ProvisionConfig, 'peerId'>): Promise<ProvisionConfig> =>
      ipcRenderer.invoke('provision:set', cfg),
    clear: (): Promise<void> => ipcRenderer.invoke('provision:clear'),
  },
  proxy: {
    stats: (): Promise<ProxyStats> => ipcRenderer.invoke('proxy:stats'),
    clear: (): Promise<void> => ipcRenderer.invoke('proxy:clear'),
    logs: (limit?: number): Promise<Array<{
      ts: number;
      method: string;
      path: string;
      status: number;
      latencyMs: number;
      peerId?: string;
    }>> => ipcRenderer.invoke('proxy:logs', limit ?? 100),
    target: (): Promise<{ peerId: string | null; nickname: string | null; providerId: string | null }> =>
      ipcRenderer.invoke('proxy:target'),
    setTarget: (peerId: string): Promise<void> => ipcRenderer.invoke('proxy:setTarget', peerId),
    clearTarget: (): Promise<void> => ipcRenderer.invoke('proxy:clearTarget'),
    onEvent: (handler: (event: { type: string; payload: unknown }) => void) => {
      const listener = (_: unknown, evt: { type: string; payload: unknown }) => handler(evt);
      ipcRenderer.on('proxy:event', listener);
      return () => ipcRenderer.off('proxy:event', listener);
    },
  },
  wallet: {
    score: (): Promise<WalletScore> => ipcRenderer.invoke('wallet:score'),
  },
  models: {
    catalogue: (): Promise<{
      models: ModelEntry[];
      nodes: ModelQualityNode[];
      leaderboard: LeaderboardEntry[];
    }> => ipcRenderer.invoke('models:catalogue'),
  },
  system: {
    openExternal: (url: string): Promise<void> => ipcRenderer.invoke('system:openExternal', url),
  },
};

contextBridge.exposeInMainWorld('modelbus', api);

export type ModelbusApi = typeof api;
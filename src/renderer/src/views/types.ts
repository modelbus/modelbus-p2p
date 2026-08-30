import type {
  ProviderSummary,
  ProviderDetail,
  ProvisionConfig,
  NodeAnnouncement,
  ProxyStats,
  BootstrapConfig,
  ModelInfo,
} from '@shared/types';

export interface EventLogEntry {
  ts: number;
  type: string;
  msg: string;
}

/** One in-progress provider draft in the multi-provider provision form. */
export interface DraftProvider {
  providerId: string;
  providerName: string;
  apiBase: string;
  apiKey: string;
  selectedModels: string[];
}

export interface AppRefs {
  status: import('vue').Ref<{
    started: boolean;
    peerId: string | null;
    multiaddrs: string[];
    role: 'idle' | 'provision' | 'consume';
    connected: number;
  }>;
  providers: import('vue').Ref<ProviderSummary[]>;
  providerDetail: import('vue').Ref<ProviderDetail | null>;
  providerLoading: import('vue').Ref<boolean>;
  provision: import('vue').Ref<ProvisionConfig | null>;
  draft: import('vue').Ref<{
    nickname: string;
    providers: DraftProvider[];
  }>;
  nodes: import('vue').Ref<NodeAnnouncement[]>;
  registryLoading: import('vue').Ref<boolean>;
  nodesRefreshing: import('vue').Ref<number>;
  proxyStats: import('vue').Ref<ProxyStats>;
  proxyTarget: import('vue').Ref<{ peerId: string | null; nickname: string | null; providerId: string | null }>;
  proxyLogs: import('vue').Ref<Array<{ ts: number; method: string; path: string; status: number; latencyMs: number; peerId?: string }>>;
  proxyPort: import('vue').Ref<number>;
  cfg: import('vue').Ref<BootstrapConfig>;
  eventLog: import('vue').Ref<EventLogEntry[]>;
  error: import('vue').Ref<string | null>;
}

export interface AppActions {
  refreshStatus: () => Promise<void>;
  refreshProvision: () => Promise<void>;
  refreshProxy: () => Promise<void>;
  refreshNodes: () => Promise<void>;
  refreshAll: () => Promise<void>;
  startNode: () => Promise<void>;
  stopNode: () => Promise<void>;
  loadProviders: (force?: boolean) => Promise<void>;
  loadProviderDetail: (id: string) => Promise<void>;
  addProvider: () => void;
  removeProvider: (index: number) => void;
  selectProvider: (index: number, id: string) => Promise<void>;
  toggleModel: (index: number, m: ModelInfo) => void;
  saveProvision: () => Promise<void>;
  clearProvision: () => Promise<void>;
  pickTarget: (peerId: string) => Promise<void>;
  clearTarget: () => Promise<void>;
  loadConfig: () => Promise<void>;
  saveConfig: () => Promise<void>;
  setError: (msg: string | null) => void;
}

export interface AppHelpers {
  fmtBytes: (n: number) => string;
  fmtTime: (ts: number) => string;
  peerShort: (id?: string | null) => string;
}
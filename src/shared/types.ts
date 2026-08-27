export type NodeRole = 'idle' | 'provision' | 'consume';

export interface ProviderSummary {
  id: string;
  name: string;
  npm: string;
  api?: string;
  doc: string;
  env: string[];
  modelCount: number;
}

export interface ProviderDetail extends ProviderSummary {
  models: ModelInfo[];
}

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  context?: number;
  output?: number;
  attachment?: boolean;
  tool_call?: boolean;
  reasoning?: boolean;
}

export interface ProvisionConfig {
  peerId: string;
  nickname: string;
  providerId: string;
  providerName: string;
  apiBase?: string;
  apiKey: string;
  modelIds: string[];
}

export interface NodeAnnouncement {
  peerId: string;
  nickname: string;
  providerId: string;
  providerName: string;
  modelIds: string[];
  multiaddrs: string[];
  announcedAt: number;
}

export interface InferenceRequest {
  id: string;
  model: string;
  path: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

export interface InferenceResponse {
  id: string;
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface ProxyStats {
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  bytesSent: number;
  bytesReceived: number;
}

export interface BootstrapConfig {
  registryUrl: string;
  bootstrapMultiaddrs: string[];
  tcpPort: number;
  proxyPort: number;
}

// -------- Wallet --------

export interface WalletScore {
  /** Total token balance */
  tokens: number;
  /** Online minutes since the wallet was created */
  onlineMinutes: number;
  /** Number of tokens the node has shared at the same time */
  providedTokens: number;
  /** Number of inference requests served by this node */
  servedRequests: number;
  /** Mean upstream latency, milliseconds */
  avgLatencyMs: number;
  /** Each axis that contributes to the score, for the UI */
  breakdown: Array<{
    label: string;
    value: number;
    weight: number;
    contribution: number;
  }>;
  /** When the wallet was last updated */
  updatedAt: number;
}

export interface WalletBreakdownItem {
  key: 'online' | 'tokens' | 'requests' | 'speed';
  label: string;
  value: number;
  unit: string;
  weight: number;
  contribution: number;
}

// -------- Models --------

export interface ModelEntry {
  /** Canonical model id, e.g. openai/gpt-5 */
  id: string;
  name: string;
  provider: string;
  /** Aggregate quality score, higher = better. 0-100. */
  quality: number;
  /** Mean upstream latency when calling this model, ms */
  avgLatencyMs: number;
  /** How many nodes offer this model right now */
  nodeCount: number;
}

export interface LeaderboardEntry {
  rank: number;
  peerId: string;
  nickname: string;
  provider: string;
  tokens: number;
  onlineMinutes: number;
  servedRequests: number;
  avgLatencyMs: number;
  quality: number;
}

export interface ModelQualityNode {
  peerId: string;
  nickname: string;
  provider: string;
  providerName: string;
  modelIds: string[];
  /** Mean upstream latency in ms */
  avgLatencyMs: number;
  /** How many requests have been served */
  servedRequests: number;
  /** How long the node has been online in minutes */
  uptimeMinutes: number;
  /** Aggregate quality score (0-100) */
  quality: number;
}
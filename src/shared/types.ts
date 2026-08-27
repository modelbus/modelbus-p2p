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
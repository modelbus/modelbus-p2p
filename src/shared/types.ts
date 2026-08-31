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

/**
 * A single LLM provider credential the node owner is willing to share.
 * A node may carry several of these at once (e.g. MiniMax + DeepSeek).
 */
export interface ProviderCredential {
  providerId: string;
  providerName: string;
  /** Optional API base override (OpenAI-compatible endpoint). */
  apiBase?: string;
  apiKey: string;
  modelIds: string[];
}

export interface ProvisionConfig {
  peerId: string;
  nickname: string;
  providers: ProviderCredential[];
}

/**
 * Model offered by a Provider. `id is the canonical model id used when
 * forwarding requests (e.g. "openai/gpt-5"); `name is the human-friendly
 * label shown in the UI (e.g. "GPT-5").
 */
export interface ModelOffer {
  id: string;
  name: string;
}

/**
 * One LLM provider attached to a node. A node may carry multiple
 * providers — each one is a different upstream API the node is willing
 * to relay. The apiBase is intentionally NOT included here: it is
 * reconstructed client-side via the NAT proxy + models.dev mapping
 * (`buildUpstreamCall`), keeping the wire format free of endpoints that
 * could go stale.
 */
export interface ProviderOffer {
  providerId: string;
  providerName: string;
  models: ModelOffer[];
}

/**
 * Structured form of a single reachable multiaddr. A node exposes one
 * primary address (`kind: "direct"` is preferred). `kind: "relay"` is
 * for nodes that only reach others via a circuit relay.
 */
export interface StructuredAddr {
  /** The libp2p multiaddr string (e.g. "/ip4/.../tcp/.../p2p/..."). */
  addr: string;
  /** "direct" | "relay" | "unknown" */
  kind: 'direct' | 'relay' | 'unknown';
  /** Transport hint: "tcp" | "ws" | "quic" | "webtransport" | "webrtc" | ... */
  transport?: string;
  /** Last time we observed this address reachable. */
  lastSeen?: number;
}

/**
 * A peer's announcement on the network. Schema version 2.
 *
 * The mock file and the official HTTPS endpoint share this exact
 * shape so that a static JSON file can stand in for the registry
 * when the central server is unreachable. Trust-chain / signature
 * fields are deliberately absent from the public format — the
 * client validates trust locally against a hardcoded set of
 * `trustedRoot peerIds (see config/trusted-roots.ts).
 */
export interface NodeAnnouncement {
  /** Schema version. Bump on breaking changes. */
  version: 2;
  peerId: string;
  nickname: string;
  providers: ProviderOffer[];
  /** The single primary reachable address of this node. */
  addr: StructuredAddr;
  /** Unix ms when the node last refreshed its entry. */
  announcedAt: number;
  /** Unix ms after which the entry is considered stale; clients may
   * still keep stale entries but should weight them lower. */
  expiresAt?: number;
}

/**
 * Lightweight summary derived from NodeAnnouncement for backwards
 * compatibility with views that previously consumed the flat
 * single-provider schema. The registry service flattens every new
 * entry into this shape so consume / leaderboard views don't need to
 * be rewritten in this round.
 */
export interface NodeAnnouncementFlat {
  peerId: string;
  nickname: string;
  providerId: string;
  providerName: string;
  modelIds: string[];
  /** Best libp2p multiaddr string from the structured addr. */
  primaryAddr: string;
  announcedAt: number;
  /** Whether the local trust check has accepted this peer. */
  trusted: boolean;
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

/**
 * Soft limits applied to how much traffic this node will serve as a
 * consumer-side provider. Stored in the settings store and surfaced
 * in the UI as a usage progress bar; the proxy server itself does not
 * reject requests based on these — they are advisory in this release.
 */
export interface ConsumerLimits {
  /** Maximum number of upstream peer connections the proxy will hold
   *  open concurrently. 0 / null means "no limit". */
  maxConcurrentNodes: number;
  /** Maximum tokens the node is willing to spend this calendar month.
   *  0 / null means "no limit". */
  monthlyTokenLimit: number;
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
  /** True when this row represents the local node itself. */
  self?: boolean;
}
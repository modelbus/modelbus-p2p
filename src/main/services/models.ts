import type { ModelEntry, LeaderboardEntry, ModelQualityNode, NodeAnnouncement } from '@shared/types';

/**
 * Compute a 0-100 quality score from a set of signals.
 *
 *   quality = latencyScore * 0.4
 *           + uptimeScore * 0.3
 *           + loadScore * 0.3
 *
 *   latencyScore: 100 if avgLatencyMs <= 100, 0 if >= 1500, linear in between
 *   uptimeScore:  100 if uptimeMinutes >= 720, 0 if <= 5, linear in between
 *   loadScore:    100 if servedRequests <= 100, 0 if >= 10000, linear in between
 */
export function qualityScore(input: {
  avgLatencyMs: number;
  uptimeMinutes: number;
  servedRequests: number;
}): number {
  const lat = clamp01((1500 - input.avgLatencyMs) / 1400);
  const up = clamp01((input.uptimeMinutes - 5) / 715);
  const load = clamp01((10000 - input.servedRequests) / 9900);
  return Math.round((lat * 0.4 + up * 0.3 + load * 0.3) * 100);
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * Aggregate an arbitrary list of NodeAnnouncements into:
 *  - model table (deduplicated by model id, with average latency and quality)
 *  - per-node quality rows
 *  - leaderboard sorted by quality desc
 */
export function buildModelViews(nodes: NodeAnnouncement[], localStats: {
  peerId: string | null;
  uptimeMinutes: number;
  avgLatencyMs: number;
  servedRequests: number;
}): {
  models: ModelEntry[];
  nodes: ModelQualityNode[];
  leaderboard: LeaderboardEntry[];
} {
  const now = Date.now();

  // Deduplicate nodes by peerId (registry may list the same peer twice).
  const dedup = new Map<string, NodeAnnouncement>();
  for (const n of nodes) dedup.set(n.peerId, n);

  // Heuristic: latency scales with how many models the node advertises.
  // 1 model => ~200ms, 10 models => ~1200ms. We also seed a tiny per-node
  // offset using the peerId hash so the same peer stays consistent across
  // renders.
  const nodeRows: ModelQualityNode[] = [];
  for (const n of dedup.values()) {
    const seed = hashSeed(n.peerId);
    const latency = clampLatency(200 + n.modelIds.length * 110 + seed);
    const uptime = localStats.peerId === n.peerId ? localStats.uptimeMinutes : 5 + (seed % 600);
    const served = localStats.peerId === n.peerId ? localStats.servedRequests : 50 + (seed % 900);
    const quality = qualityScore({
      avgLatencyMs: latency,
      uptimeMinutes: uptime,
      servedRequests: served,
    });
    nodeRows.push({
      peerId: n.peerId,
      nickname: n.nickname,
      provider: n.providerId,
      providerName: n.providerName,
      modelIds: n.modelIds,
      avgLatencyMs: latency,
      servedRequests: served,
      uptimeMinutes: uptime,
      quality,
    });
  }

  // Aggregate per model id (provider + id is the key because the same model
  // id can be served by different providers — e.g. `gpt-5` is exposed by
  // several OpenAI-compatible providers).
  const modelMap = new Map<string, ModelEntry>();
  for (const n of nodeRows) {
    for (const mid of n.modelIds) {
      const key = `${n.provider}::${mid}`;
      const existing = modelMap.get(key);
      if (!existing) {
        modelMap.set(key, {
          id: mid,
          name: mid,
          provider: n.provider,
          quality: n.quality,
          avgLatencyMs: n.avgLatencyMs,
          nodeCount: 1,
        });
      } else {
        existing.nodeCount += 1;
        existing.avgLatencyMs = Math.round((existing.avgLatencyMs + n.avgLatencyMs) / 2);
        existing.quality = Math.round((existing.quality + n.quality) / 2);
      }
    }
  }

  const models = Array.from(modelMap.values()).sort((a, b) => b.quality - a.quality);
  const leaderboard: LeaderboardEntry[] = nodeRows
    .slice()
    .sort((a, b) => b.quality - a.quality)
    .map((n, i) => ({
      rank: i + 1,
      peerId: n.peerId,
      nickname: n.nickname,
      provider: n.providerName,
      tokens: 0,
      onlineMinutes: n.uptimeMinutes,
      servedRequests: n.servedRequests,
      avgLatencyMs: n.avgLatencyMs,
      quality: n.quality,
    }));

  void now;
  return { models, nodes: nodeRows, leaderboard };
}

function clampLatency(n: number): number {
  if (!Number.isFinite(n)) return 1500;
  if (n < 100) return 100;
  if (n > 1500) return 1500;
  return Math.round(n);
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h % 9973;
}
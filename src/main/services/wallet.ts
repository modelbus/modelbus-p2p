import type { WalletScore, WalletBreakdownItem } from '@shared/types';

/**
 * Compute the wallet score for a node.
 *
 *   tokens = (onlineMinutes * 0.05)
 *          + (providedTokens * 2)
 *          + (servedRequests * 0.1)
 *          + max(0, 200 - avgLatencyMs) * 0.5
 *
 * Online time, number of tokens, number of requests and speed
 * all participate in the score. The exact weights can be tuned
 * later; the breakdown array exposes each term so the UI can
 * explain where the number comes from.
 */
export interface WalletInputs {
  onlineMinutes: number;
  providedTokens: number;
  servedRequests: number;
  avgLatencyMs: number;
}

export const WALLET_WEIGHTS = {
  online: 0.05,
  tokens: 2,
  requests: 0.1,
  // smaller latency => bigger contribution. Capped at 0 once
  // latency goes past 200ms so the speed term never goes negative.
  speed: 0.5,
};

export function computeWallet(inputs: WalletInputs): WalletScore {
  const online = inputs.onlineMinutes * WALLET_WEIGHTS.online;
  const tokens = inputs.providedTokens * WALLET_WEIGHTS.tokens;
  const requests = inputs.servedRequests * WALLET_WEIGHTS.requests;
  const speed = Math.max(0, 200 - inputs.avgLatencyMs) * WALLET_WEIGHTS.speed;
  const total = Math.round((online + tokens + requests + speed) * 100) / 100;

  const breakdown: WalletBreakdownItem[] = [
    { key: 'online', label: 'wallet.axis.online', value: inputs.onlineMinutes, unit: 'min', weight: WALLET_WEIGHTS.online, contribution: round(online) },
    { key: 'tokens', label: 'wallet.axis.tokens', value: inputs.providedTokens, unit: '', weight: WALLET_WEIGHTS.tokens, contribution: round(tokens) },
    { key: 'requests', label: 'wallet.axis.requests', value: inputs.servedRequests, unit: '', weight: WALLET_WEIGHTS.requests, contribution: round(requests) },
    { key: 'speed', label: 'wallet.axis.speed', value: inputs.avgLatencyMs, unit: 'ms', weight: WALLET_WEIGHTS.speed, contribution: round(speed) },
  ];

  return {
    tokens: total,
    onlineMinutes: inputs.onlineMinutes,
    providedTokens: inputs.providedTokens,
    servedRequests: inputs.servedRequests,
    avgLatencyMs: inputs.avgLatencyMs,
    breakdown,
    updatedAt: Date.now(),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
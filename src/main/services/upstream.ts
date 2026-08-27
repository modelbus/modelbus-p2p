import type { ProviderDetail } from '@shared/types';

interface UpstreamError extends Error {
  status: number;
  upstreamBody?: string;
}

/**
 * Build the upstream HTTP request to a real provider.
 * Most modern providers expose an OpenAI-compatible /v1/chat/completions or /v1/responses endpoint.
 */
export interface UpstreamCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

export function buildUpstreamCall(
  provider: ProviderDetail,
  apiKey: string,
  reqPath: string,
  reqMethod: string,
  reqHeaders: Record<string, string>,
  reqBody: string
): UpstreamCall {
  const base = (provider.api ?? 'https://api.openai.com/v1').replace(/\/$/, '');
  const path = reqPath.startsWith('/') ? reqPath : `/${reqPath}`;
  const url = base + path;

  const headers: Record<string, string> = { ...reqHeaders };
  // Remove hop-by-hop and host-sensitive headers.
  delete headers['host'];
  delete headers['authorization'];
  delete headers['x-api-key'];
  delete headers['content-length'];
  delete headers['connection'];

  const isAnthropic = provider.id === 'anthropic' || /anthropic/i.test(provider.name);
  if (isAnthropic) {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = headers['anthropic-version'] ?? '2023-06-01';
  } else {
    headers['authorization'] = `Bearer ${apiKey}`;
  }
  if (!headers['content-type'] && reqMethod !== 'GET' && reqBody) {
    headers['content-type'] = 'application/json';
  }
  return { url, method: reqMethod, headers, body: reqBody };
}

export async function callUpstream(call: UpstreamCall, timeoutMs = 120_000): Promise<{
  status: number;
  headers: Record<string, string>;
  body: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(call.url, {
      method: call.method,
      headers: call.headers,
      body: call.method === 'GET' || call.method === 'HEAD' ? undefined : call.body,
      signal: controller.signal,
    });
    const respHeaders: Record<string, string> = {};
    r.headers.forEach((v, k) => {
      if (k.toLowerCase() === 'content-encoding') return;
      if (k.toLowerCase() === 'transfer-encoding') return;
      respHeaders[k] = v;
    });
    const body = await r.text();
    return { status: r.status, headers: respHeaders, body };
  } catch (err) {
    const e = err as UpstreamError;
    throw Object.assign(new Error(`upstream error: ${e.message}`), { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
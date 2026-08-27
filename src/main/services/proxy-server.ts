import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { Libp2p } from 'libp2p';
import { fromString as u8FromString } from 'uint8arrays';
import { peerIdFromString } from '@libp2p/peer-id';
import type { Multiaddr } from '@multiformats/multiaddr';

import { dialAndCallInference } from '../proto/inference.js';
import type { ProxyStats, NodeAnnouncement } from '@shared/types';

export interface ConsumerEvents {
  emit(event: { type: string; payload: unknown }): void;
}

export interface ProxyLogEntry {
  ts: number;
  method: string;
  path: string;
  status: number;
  latencyMs: number;
  peerId?: string;
  error?: string;
}

const MAX_LOG = 500;

export class ConsumerProxy {
  private server: ReturnType<typeof createServer> | null = null;
  private port = 0;
  private host = '127.0.0.1';
  private target: NodeAnnouncement | null = null;
  private stats: ProxyStats = {
    totalRequests: 0,
    successRequests: 0,
    failedRequests: 0,
    bytesSent: 0,
    bytesReceived: 0,
  };
  private logs: ProxyLogEntry[] = [];

  constructor(
    private libp2p: () => Libp2p | null,
    private events: ConsumerEvents
  ) {}

  isRunning(): boolean {
    return !!this.server;
  }

  port_(): number {
    return this.port;
  }

  setTarget(t: NodeAnnouncement | null) {
    this.target = t;
    this.events.emit({ type: 'target:set', payload: { peerId: t?.peerId ?? null } });
  }

  getTarget(): NodeAnnouncement | null {
    return this.target;
  }

  getStats(): ProxyStats {
    return { ...this.stats };
  }

  getLogs(limit = 100): ProxyLogEntry[] {
    return this.logs.slice(-limit);
  }

  clearStats(): void {
    this.stats = {
      totalRequests: 0,
      successRequests: 0,
      failedRequests: 0,
      bytesSent: 0,
      bytesReceived: 0,
    };
    this.logs = [];
    this.events.emit({ type: 'stats:cleared', payload: {} });
  }

  async start(port: number, host = '127.0.0.1'): Promise<number> {
    if (this.server) return this.port;
    this.port = port;
    this.host = host;
    this.server = createServer((req, res) => this.handleHttp(req, res));
    await new Promise<void>((resolve, reject) => {
      this.server!.once('error', reject);
      this.server!.listen(port, host, () => resolve());
    });
    this.events.emit({ type: 'proxy:started', payload: { port, host } });
    return this.port;
  }

  async stop(): Promise<void> {
    if (!this.server) return;
    const s = this.server;
    this.server = null;
    await new Promise<void>((resolve) => s.close(() => resolve()));
    this.events.emit({ type: 'proxy:stopped', payload: {} });
  }

  private async handleHttp(req: IncomingMessage, res: ServerResponse) {
    if (!this.target) {
      this.writeError(res, 503, 'No target peer selected. Pick a node in the Consume tab first.');
      return;
    }
    const node = this.libp2p();
    if (!node) {
      this.writeError(res, 503, 'libp2p node is not running');
      return;
    }

    const start = Date.now();
    this.stats.totalRequests += 1;

    try {
      const peerId = peerIdFromString(this.target.peerId);
      const headers = this.collectHeaders(req);
      const bodyBuf = await this.readBody(req);
      const bodyText = bodyBuf.toString('utf-8');

      this.stats.bytesSent += bodyBuf.length;

      const conn = await this.openConnection(node, peerId);

      const id = randomUUID();
      const upstream = await dialAndCallInference(conn, {
        id,
        model: this.extractModel(headers, bodyText),
        path: req.url ?? '/',
        method: req.method ?? 'GET',
        headers: this.stripHopHeaders(headers),
        body: bodyText,
      });

      // Drain the connection; we already consumed the response via stream.
      try {
        await conn.close();
      } catch {
        // ignore
      }

      const status = upstream.status ?? 200;
      res.statusCode = status;
      const upstreamHeaders = upstream.headers ?? {};
      for (const [k, v] of Object.entries(upstreamHeaders)) {
        if (k.toLowerCase() === 'content-encoding') continue;
        if (k.toLowerCase() === 'transfer-encoding') continue;
        res.setHeader(k, String(v));
      }
      const out = upstream.body ?? '';
      const outBuf = u8FromString(out);
      this.stats.bytesReceived += outBuf.length;
      res.end(outBuf);

      this.stats.successRequests += 1;
      this.pushLog({
        ts: Date.now(),
        method: req.method ?? 'GET',
        path: req.url ?? '/',
        status,
        latencyMs: Date.now() - start,
        peerId: this.target.peerId,
      });
      this.events.emit({
        type: 'proxy:served',
        payload: { method: req.method, path: req.url, status, latencyMs: Date.now() - start },
      });
    } catch (err) {
      const msg = (err as Error).message ?? String(err);
      this.stats.failedRequests += 1;
      this.writeError(res, 502, `proxy error: ${msg}`);
      this.pushLog({
        ts: Date.now(),
        method: req.method ?? 'GET',
        path: req.url ?? '/',
        status: 502,
        latencyMs: Date.now() - start,
        peerId: this.target.peerId,
        error: msg,
      });
      this.events.emit({ type: 'proxy:error', payload: { msg } });
    }
  }

  private async openConnection(node: Libp2p, peerId: ReturnType<typeof peerIdFromString>) {
    // First try direct / known peer-store addrs; otherwise dial via peerId (which uses cached addrs / DHT).
    try {
      return await node.dial(peerId);
    } catch (err) {
      console.warn('[consumer] direct dial failed, trying addresses', (err as Error).message);
      const peer = await node.peerStore.get(peerId);
      const addrs: Multiaddr[] = (peer.addresses ?? []).map((a: { multiaddr: Multiaddr }) => a.multiaddr);
      if (!addrs.length) throw new Error('no known addresses for target peer');
      return await node.dial(addrs[0]);
    }
  }

  private writeError(res: ServerResponse, status: number, message: string) {
    if (res.headersSent) {
      try {
        res.end();
      } catch {
        // ignore
      }
      return;
    }
    res.statusCode = status;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: message }));
  }

  private collectHeaders(req: IncomingMessage): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (Array.isArray(v)) out[k] = v.join(', ');
      else if (typeof v === 'string') out[k] = v;
    }
    return out;
  }

  private stripHopHeaders(h: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(h)) {
      const lk = k.toLowerCase();
      if (lk === 'host' || lk === 'content-length' || lk === 'connection') continue;
      out[k] = v;
    }
    return out;
  }

  private async readBody(req: IncomingMessage): Promise<Buffer> {
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c as ArrayBuffer)));
      req.on('end', () => resolve());
      req.on('error', reject);
    });
    return Buffer.concat(chunks);
  }

  private extractModel(headers: Record<string, string>, body: string): string {
    try {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed === 'object' && typeof parsed.model === 'string') {
        return parsed.model;
      }
    } catch {
      // ignore
    }
    return headers['x-modelbus-target-model'] ?? 'unknown';
  }

  private pushLog(entry: ProxyLogEntry) {
    this.logs.push(entry);
    if (this.logs.length > MAX_LOG) this.logs.splice(0, this.logs.length - MAX_LOG);
  }
}
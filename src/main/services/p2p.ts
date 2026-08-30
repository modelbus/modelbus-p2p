import type { Libp2p } from 'libp2p';
import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { webSockets } from '@libp2p/websockets';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { bootstrap } from '@libp2p/bootstrap';
import { kadDHT } from '@libp2p/kad-dht';
import { identify } from '@libp2p/identify';
import { ping } from '@libp2p/ping';
import { circuitRelayTransport, circuitRelayServer } from '@libp2p/circuit-relay-v2';
import { uPnPNAT } from '@libp2p/upnp-nat';
import { autoNAT } from '@libp2p/autonat';
import { multiaddr, type Multiaddr } from '@multiformats/multiaddr';
import { peerIdFromString } from '@libp2p/peer-id';
import { generateKeyPair, privateKeyFromProtobuf, privateKeyToProtobuf } from '@libp2p/crypto/keys';
import type { PeerId, PrivateKey } from '@libp2p/interface';

import type { BootstrapConfig } from '@shared/types';
import type { Store } from './store.js';

export interface P2PEventBus {
  emit(event: { type: string; payload: unknown }): void;
}

export class P2PService {
  private node: Libp2p | null = null;
  private starting = false;
  private stopping = false;
  private startedAt = 0;

  constructor(
    private events: P2PEventBus,
    private store?: Store
  ) {}

  isStarted(): boolean {
    return !!this.node;
  }

  peerId(): PeerId | null {
    return this.node?.peerId ?? null;
  }

  peerIdString(): string | null {
    return this.node?.peerId.toString() ?? null;
  }

  multiaddrs(): string[] {
    if (!this.node) return [];
    return this.node.getMultiaddrs().map((m) => m.toString());
  }

  getNode(): Libp2p | null {
    return this.node;
  }

  async start(cfg: BootstrapConfig): Promise<void> {
    if (this.node || this.starting) return;
    this.starting = true;
    try {
      const listen: string[] = [
        `/ip4/0.0.0.0/tcp/${cfg.tcpPort}`,
        `/ip4/0.0.0.0/tcp/${cfg.tcpPort + 1}/ws`,
      ];
      const bootstrapList = cfg.bootstrapMultiaddrs.filter((m) => !!m && m.length > 0);

      // Stable identity: reuse the persisted Ed25519 key (or mint one on
      // first run) so the peerId never changes across restarts.
      const privateKey = await this.loadOrCreatePrivateKey();

      this.node = await createLibp2p({
        privateKey: privateKey as PrivateKey,
        addresses: { listen },
        transports: [
          tcp(),
          webSockets(),
          circuitRelayTransport(),
        ],
        streamMuxers: [yamux()],
        connectionEncrypters: [noise()],
        peerDiscovery: bootstrapList.length
          ? [bootstrap({ list: bootstrapList })]
          : [],
        services: {
          identify: identify(),
          ping: ping(),
          dht: kadDHT({
            clientMode: false,
            protocol: '/modelbus/kad/1.0.0',
          }),
          circuitRelay: circuitRelayServer({
            reservations: {
              maxReservations: 30,
              applyDefaultLimit: true,
            },
          }),
          upnpNAT: uPnPNAT({
            portMappingDescription: 'modelbus-p2p',
          }),
          autoNAT: autoNAT(),
        },
        connectionManager: {
          maxConnections: 200,
        },
      });

      this.wireEvents(this.node);
      this.startedAt = Date.now();
      this.events.emit({ type: 'started', payload: { peerId: this.peerIdString() } });
    } finally {
      this.starting = false;
    }
  }

  /** Load the persisted identity or generate + persist a fresh one. */
  private async loadOrCreatePrivateKey(): Promise<PrivateKey> {
    if (this.store) {
      const saved = this.store.getPeerKey();
      if (saved) {
        try {
          const bytes = Uint8Array.from(Buffer.from(saved, 'base64'));
          // NOTE: @libp2p/crypto resolves against @libp2p/interface@3 while
          // libp2p/peer-id resolve against @2; the runtime key objects are
          // identical, only their TS types differ. Cast across the split.
          return privateKeyFromProtobuf(bytes) as unknown as PrivateKey;
        } catch (err) {
          console.warn('[p2p] failed to load persisted peer key, regenerating:', (err as Error).message);
        }
      }
    }
    // No store, no saved key, or corrupt key — generate a new Ed25519 key.
    const privateKey = await generateKeyPair('Ed25519');
    if (this.store) {
      const bytes = privateKeyToProtobuf(privateKey);
      await this.store.setPeerKey(Buffer.from(bytes).toString('base64'));
    }
    return privateKey as unknown as PrivateKey;
  }

  async stop(): Promise<void> {
    if (!this.node || this.stopping) return;
    this.stopping = true;
    try {
      const node = this.node;
      this.node = null;
      await node.stop();
      this.events.emit({ type: 'stopped', payload: {} });
    } finally {
      this.stopping = false;
    }
  }

  uptime(): number {
    return this.startedAt ? Date.now() - this.startedAt : 0;
  }

  private wireEvents(node: Libp2p) {
    node.addEventListener('peer:discovery', (evt) => {
      const id = evt.detail.id?.toString?.() ?? 'unknown';
      const addrs = (evt.detail.multiaddrs ?? []).map((m) => m.toString());
      this.events.emit({ type: 'peer:discovery', payload: { id, addrs } });
    });
    node.addEventListener('peer:connect', (evt) => {
      const id = evt.detail?.toString?.() ?? 'unknown';
      this.events.emit({ type: 'peer:connect', payload: { id } });
    });
    node.addEventListener('peer:disconnect', (evt) => {
      const id = evt.detail?.toString?.() ?? 'unknown';
      this.events.emit({ type: 'peer:disconnect', payload: { id } });
    });
    node.addEventListener('self:peer:update', (evt) => {
      const addrs = (evt.detail?.peer?.addresses ?? []).map((a) => a.multiaddr.toString());
      this.events.emit({ type: 'self:update', payload: { addrs } });
    });
  }

  async ensureConnection(target: { peerId?: string; multiaddr?: string }): Promise<Multiaddr | null> {
    if (!this.node) return null;
    if (target.multiaddr) {
      const ma = multiaddr(target.multiaddr);
      try {
        await this.node.dial(ma);
        return ma;
      } catch (err) {
        console.warn('[p2p] dial failed:', (err as Error).message);
      }
    }
    if (target.peerId) {
      try {
        const peerId = peerIdFromString(target.peerId);
        const conn = await this.node.dial(peerId);
        return conn.remoteAddr;
      } catch (err) {
        console.warn('[p2p] dial by peerId failed:', (err as Error).message);
        return null;
      }
    }
    return null;
  }

  async knownMultiaddrs(peerIdStr: string): Promise<Multiaddr[]> {
    if (!this.node) return [];
    try {
      const peerId = peerIdFromString(peerIdStr);
      const peer = await this.node.peerStore.get(peerId);
      return (peer.addresses ?? []).map((a: { multiaddr: Multiaddr }) => a.multiaddr);
    } catch {
      return [];
    }
  }
}
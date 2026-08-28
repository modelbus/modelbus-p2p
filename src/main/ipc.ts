import { app, BrowserWindow, ipcMain, shell } from 'electron';
import type { BootstrapConfig, NodeAnnouncementFlat, ProvisionConfig, WalletScore, ModelEntry, LeaderboardEntry, ModelQualityNode } from '@shared/types';
import type { Store } from './services/store.js';
import type { ProviderService } from './services/providers.js';
import type { RegistryService } from './services/registry.js';
import type { P2PService } from './services/p2p.js';
import type { ProvisionerService } from './services/provisioner.js';
import type { ConsumerProxy } from './services/proxy-server.js';
import type { BootstrapCache } from './services/bootstrap-cache.js';
import { computeWallet } from './services/wallet.js';
import { buildModelViews } from './services/models.js';

export interface Deps {
  store: Store;
  providers: ProviderService;
  registry: RegistryService;
  p2p: P2PService;
  provisioner: ProvisionerService;
  proxy: ConsumerProxy;
  bootstrapCache: BootstrapCache;
  getMainWindow: () => BrowserWindow | null;
}

export function registerIpc(deps: Deps): void {
  const { store, providers, registry, p2p, provisioner, proxy, bootstrapCache, getMainWindow } = deps;

  ipcMain.handle('bootstrap:getConfig', async () => store.getBootstrap());
  ipcMain.handle('bootstrap:setConfig', async (_e, patch: Partial<BootstrapConfig>) =>
    store.setBootstrap(patch)
  );

  ipcMain.handle('providers:list', async (_e, refresh: boolean) => providers.list(refresh));
  ipcMain.handle('providers:get', async (_e, id: string) => providers.get(id));

  ipcMain.handle('registry:fetch', async () => {
    const cfg = store.getBootstrap();
    let items: NodeAnnouncementFlat[] = await registry.fetch(cfg.registryUrl);
    // Cold start fallback: if the official endpoint was unreachable
    // (e.g. offline install), serve from the on-disk cache.
    if (items.length === 0) {
      items = await bootstrapCache.load();
    }
    // Merge live data: also include the locally registered provider (if any)
    if (provisioner.isActive()) {
      const cfg2 = provisioner.config()!;
      const primaryAddr = p2p.multiaddrs()[0] ?? '';
      const modelIds = cfg2.modelIds;
      const local: NodeAnnouncementFlat = {
        peerId: cfg2.peerId,
        nickname: cfg2.nickname,
        providerId: cfg2.providerId,
        providerName: cfg2.providerName,
        modelIds,
        primaryAddr,
        announcedAt: Date.now(),
        trusted: true,
      };
      if (!items.find((it) => it.peerId === local.peerId)) items.unshift(local);
    }
    // Persist the validated/trusted subset so the next launch has a
    // warm cache even if the official endpoint is unreachable.
    try {
      await bootstrapCache.save(items.filter((it) => it.trusted));
    } catch {
      // cache failure is non-fatal
    }
    return items;
  });

  // Returns the on-disk bootstrap cache as-is, no network call. Used
  // by the Settings → Register tab to show what nodes are currently
  // remembered even when the user is offline.
  ipcMain.handle('registry:cache', async (): Promise<NodeAnnouncementFlat[]> => {
    return bootstrapCache.load();
  });

  ipcMain.handle('registry:cacheClear', async () => {
    await bootstrapCache.clear();
  });

  ipcMain.handle('p2p:status', async () => ({
    started: p2p.isStarted(),
    peerId: p2p.peerIdString(),
    multiaddrs: p2p.multiaddrs(),
    role: provisioner.isActive() ? 'provision' : proxy.getTarget() ? 'consume' : 'idle',
    connected: p2p.isStarted() ? (p2p.getNode()?.getConnections().length ?? 0) : 0,
  }));

  ipcMain.handle('p2p:start', async () => {
    const cfg = store.getBootstrap();
    if (!p2p.isStarted()) await p2p.start(cfg);
    // If a provision config exists, re-register so the node is ready to serve.
    const prov = store.getProvision();
    if (prov && !provisioner.isActive()) {
      try {
        await provisioner.register({ ...prov, peerId: p2p.peerIdString() ?? prov.peerId });
      } catch (err) {
        console.error('[ipc] provision re-register failed:', (err as Error).message);
      }
    }
  });

  ipcMain.handle('p2p:stop', async () => {
    await provisioner.unregister();
    await proxy.stop();
    await p2p.stop();
  });

  ipcMain.handle('provision:get', async () => store.getProvision());
  ipcMain.handle('provision:set', async (_e, cfg: Omit<ProvisionConfig, 'peerId'>) => {
    const peerId = p2p.peerIdString();
    if (!peerId) throw new Error('libp2p is not started yet — please start the node first.');
    const full: ProvisionConfig = { ...cfg, peerId };
    await store.setProvision(full);
    // Re-register against the running node if any.
    if (p2p.isStarted()) {
      await provisioner.register(full);
      // Auto-announce to the registry URL (best-effort) so other clients can see us.
      try {
        await announceToRegistry(store.getBootstrap().registryUrl, full, p2p.multiaddrs());
      } catch (err) {
        console.warn('[ipc] auto announce failed:', (err as Error).message);
      }
    }
    return full;
  });
  ipcMain.handle('provision:clear', async () => {
    await provisioner.unregister();
    await store.clearProvision();
  });

  ipcMain.handle('proxy:stats', async () => proxy.getStats());
  ipcMain.handle('proxy:clear', async () => proxy.clearStats());
  ipcMain.handle('proxy:logs', async (_e, limit: number) => proxy.getLogs(limit));
  ipcMain.handle('proxy:target', async () => {
    const t = proxy.getTarget();
    return {
      peerId: t?.peerId ?? null,
      nickname: t?.nickname ?? null,
      providerId: t?.providerId ?? null,
    };
  });
  ipcMain.handle('proxy:setTarget', async (_e, peerId: string) => {
    const items: NodeAnnouncementFlat[] = await registry.fetch(store.getBootstrap().registryUrl);
    let found = items.find((it) => it.peerId === peerId);
    if (!found && p2p.peerIdString() === peerId) {
      const local = store.getProvision();
      if (local) {
        const primaryAddr = p2p.multiaddrs()[0] ?? '';
        found = {
          peerId: local.peerId,
          nickname: local.nickname,
          providerId: local.providerId,
          providerName: local.providerName,
          modelIds: local.modelIds,
          primaryAddr,
          announcedAt: Date.now(),
          trusted: true,
        };
      }
    }
    if (!found) throw new Error(`peer ${peerId} not found in registry`);
    proxy.setTarget(found);
    // start proxy server if not yet
    if (!proxy.isRunning()) {
      await proxy.start(store.getBootstrap().proxyPort);
    }
  });
  ipcMain.handle('proxy:clearTarget', async () => {
    proxy.setTarget(null);
  });

  ipcMain.handle('system:openExternal', async (_e, url: string) => {
    await shell.openExternal(url);
  });

  ipcMain.handle('system:openDevTools', async () => {
    const win = deps.getMainWindow();
    if (win && !win.webContents.isDestroyed()) {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  ipcMain.handle('system:openLogsFolder', async () => {
    // Electron writes main-process logs into the userData directory; on
    // macOS that is ~/Library/Application Support/<appName>/. We open
    // the parent folder so the user can also see the persisted store.
    await shell.openPath(app.getPath('userData'));
  });

  // -------- Wallet --------

  ipcMain.handle('wallet:score', async (): Promise<WalletScore> => {
    const localPeerId = p2p.peerIdString();
    const stats = proxy.getStats();
    const provision = provisioner.config();
    const inputs = {
      onlineMinutes: Math.max(0, Math.floor(p2p.uptime() / 60_000)),
      providedTokens: provision?.modelIds.length ?? 0,
      servedRequests: stats.successRequests + stats.failedRequests,
      avgLatencyMs: avgServedLatencyMs(),
    };
    return computeWallet(inputs);
  });

  // -------- Models / Leaderboard --------

  ipcMain.handle('models:catalogue', async (): Promise<{
    models: ModelEntry[];
    nodes: ModelQualityNode[];
    leaderboard: LeaderboardEntry[];
  }> => {
    const items = await registry.fetch(store.getBootstrap().registryUrl);
    // Always include the local node if it is provisioned.
    if (provisioner.isActive()) {
      const local = provisioner.config()!;
      const primaryAddr = p2p.multiaddrs()[0] ?? '';
      const localEntry: NodeAnnouncementFlat = {
        peerId: local.peerId,
        nickname: local.nickname,
        providerId: local.providerId,
        providerName: local.providerName,
        modelIds: local.modelIds,
        primaryAddr,
        announcedAt: Date.now(),
        trusted: true,
      };
      if (!items.find((it) => it.peerId === localEntry.peerId)) items.unshift(localEntry);
    }
    return buildModelViews(items, {
      peerId: p2p.peerIdString(),
      uptimeMinutes: Math.max(0, Math.floor(p2p.uptime() / 60_000)),
      avgLatencyMs: avgServedLatencyMs(),
      servedRequests: proxy.getStats().successRequests + proxy.getStats().failedRequests,
    });
  });

  // Forward service events to the renderer.
  const forward = (event: { type: string; payload: unknown }) => {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send('p2p:event', event);
      win.webContents.send('proxy:event', event);
    }
  };
  // Hook into services via a tiny helper:
  (deps as unknown as { __forward?: typeof forward }).__forward = forward;
  void getMainWindow;

  function avgServedLatencyMs(): number {
    const logs = proxy.getLogs(200);
    if (!logs.length) return 1500;
    const sum = logs.reduce((acc: number, l: { latencyMs: number }) => acc + l.latencyMs, 0);
    return Math.round(sum / logs.length);
  }
}

async function announceToRegistry(
  url: string,
  cfg: ProvisionConfig,
  multiaddrs: string[]
): Promise<void> {
  // The registry URL by convention is read-only in this first cut. But if it's a
  // mock file:// or a writable endpoint, we can do a best-effort PUT/POST.
  try {
    const payload = {
      peerId: cfg.peerId,
      nickname: cfg.nickname,
      providerId: cfg.providerId,
      providerName: cfg.providerName,
      modelIds: cfg.modelIds,
      multiaddrs,
      announcedAt: Date.now(),
    };
    const u = new URL(url);
    if (u.protocol === 'file:') {
      const { writeFile } = await import('node:fs/promises');
      const path = decodeURIComponent(u.pathname);
      let arr: unknown[] = [];
      try {
        const raw = await (await import('node:fs/promises')).readFile(path, 'utf-8');
        arr = JSON.parse(raw);
      } catch {
        // ignore
      }
      arr = Array.isArray(arr) ? arr.filter((it) => (it as { peerId?: string }).peerId !== cfg.peerId) : [];
      arr.push(payload);
      await writeFile(path, JSON.stringify(arr, null, 2));
      return;
    }
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[announce] failed:', (err as Error).message);
  }
}




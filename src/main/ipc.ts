import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { promises as fsPromises } from 'node:fs';
import type { BootstrapConfig, ConsumerLimits, NodeAnnouncementFlat, ProvisionConfig, WalletScore, ModelEntry, LeaderboardEntry, ModelQualityNode } from '@shared/types';
import type { Store } from './services/store.js';
import type { ProviderService } from './services/providers.js';
import type { RegistryService } from './services/registry.js';
import type { P2PService } from './services/p2p.js';
import type { ProvisionerService } from './services/provisioner.js';
import type { ConsumerProxy } from './services/proxy-server.js';
import type { BootstrapCache } from './services/bootstrap-cache.js';
import type { Logger } from './services/logger.js';
import { computeWallet } from './services/wallet.js';
import { buildModelViews } from './services/models.js';
import { MODELBUS_DIR } from './services/paths.js';

export interface Deps {
  store: Store;
  providers: ProviderService;
  registry: RegistryService;
  p2p: P2PService;
  provisioner: ProvisionerService;
  proxy: ConsumerProxy;
  bootstrapCache: BootstrapCache;
  logger?: Logger;
  getMainWindow: () => BrowserWindow | null;
}

export function registerIpc(deps: Deps): void {
  const { store, providers, registry, p2p, provisioner, proxy, bootstrapCache, getMainWindow } = deps;

  /**
   * Flatten a multi-provider ProvisionConfig into the single-provider
   * NodeAnnouncementFlat view the rest of the app consumes. Uses the
   * FIRST provider as the headline provider; the full provider list is
   * only carried on the wire-format NodeAnnouncement (v2).
   */
  /**
   * Project a (possibly multi-provider) ProvisionConfig into the
   * backwards-compatible flat shape. Each provider the local node
   * carries becomes its own flat row so the Models UI can list
   * `deepseek` and `minimax-token-plan` separately even though they
   * share the same peer identity. If the config has no providers at
   * all we still emit a single placeholder row so the local node
   * remains visible in the registry.
   */
  function localFlat(config: ProvisionConfig): NodeAnnouncementFlat[] {
    const peerId = p2p.peerIdString() ?? config.peerId;
    const nickname = config.nickname;
    const primaryAddr = p2p.multiaddrs()[0] ?? '';
    if (!config.providers.length) {
      return [{
        peerId,
        nickname,
        providerId: '',
        providerName: '',
        modelIds: [],
        primaryAddr,
        announcedAt: Date.now(),
        trusted: true,
      }];
    }
    return config.providers.map((p) => ({
      peerId,
      nickname,
      providerId: p.providerId,
      providerName: p.providerName,
      modelIds: [...p.modelIds],
      primaryAddr,
      announcedAt: Date.now(),
      trusted: true,
    }));
  }

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
      const prov = store.getProvision();
      if (prov) {
        const local = localFlat(prov);
        for (const entry of local) {
          if (!items.find((it) => it.peerId === entry.peerId && it.providerId === entry.providerId)) {
            items.unshift(entry);
          }
        }
      }
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
    peerId: p2p.cachedPeerId(),
    multiaddrs: p2p.multiaddrs(),
    role: provisioner.isActive() ? 'provision' : proxy.getTarget() ? 'consume' : 'idle',
    connected: p2p.isStarted() ? (p2p.getNode()?.getConnections().length ?? 0) : 0,
  }));

  ipcMain.handle('p2p:start', async () => {
    const cfg = store.getBootstrap();
    if (!p2p.isStarted()) await p2p.start(cfg);
    // If a provision config exists, re-register so the node is ready to serve.
    const prov = store.getProvision();
    if (prov) {
      // The peerId is now persisted (stable across restarts), but a store
      // written by an older build may still carry a random peerId from
      // before persistence landed. Re-align it with the live identity so
      // every downstream "local target" uses the right peerId and the
      // self-dial short-circuit matches.
      const me = p2p.peerIdString();
      if (me && prov.peerId !== me) {
        await store.setProvision({ ...prov, peerId: me });
      }
      if (!provisioner.isActive()) {
        try {
          await provisioner.register({ ...prov, peerId: me ?? prov.peerId });
        } catch (err) {
          console.error('[ipc] provision re-register failed:', (err as Error).message);
        }
      }
    }
    // If the user wants the consumer proxy to auto-start, point it at
    // our own provision entry and bring the listener up. This is what
    // makes `curl http://127.0.0.1:18100/...` work without having to
    // open the Models tab first.
    if (store.getConsumerAutostart() && provisioner.isActive() && !proxy.isRunning()) {
      try {
        const local = store.getProvision();
        const me = p2p.peerIdString();
        if (local && me) {
          // Auto-start picks the first provider; the user can switch to
          // a different upstream from the Models tab later.
          proxy.setTarget(localFlat(local)[0]);
          await proxy.start(cfg.proxyPort);
        }
      } catch (err) {
        console.warn('[ipc] consumer autostart failed:', (err as Error).message);
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
    // If the user wants the consumer proxy to auto-start, point it at
    // our own node and bring the listener up. This is what makes
    // `curl http://127.0.0.1:18100/...` work right after a successful
    // provision.
    if (store.getConsumerAutostart() && p2p.isStarted() && !proxy.isRunning()) {
      try {
        proxy.setTarget(localFlat(full)[0]);
        await proxy.start(store.getBootstrap().proxyPort);
      } catch (err) {
        console.warn('[ipc] consumer autostart after provision failed:', (err as Error).message);
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

  // ---- Consumer-side configuration ----
  // Push the currently-stored API key into the running proxy so any
  // setting change in the UI takes effect immediately. We don't
  // auto-restart the listener; the key is read on every request.
  function applyConsumerApiKey(): void {
    proxy.setApiKey(store.getConsumerApiKey());
  }
  applyConsumerApiKey();

  ipcMain.handle('consumer:setApiKey', async (_e, key: string) => {
    if (typeof key !== 'string') throw new Error('key must be a string');
    const trimmed = key.trim();
    if (trimmed.length === 0) {
      await store.clearConsumerApiKey();
    } else {
      await store.setConsumerApiKey(trimmed);
    }
    applyConsumerApiKey();
    return { apiKey: store.getConsumerApiKey() };
  });

  ipcMain.handle('consumer:getApiKey', async () => store.getConsumerApiKey());

  ipcMain.handle('consumer:setAutostart', async (_e, enabled: boolean) => {
    await store.setConsumerAutostart(!!enabled);
    return { autostart: store.getConsumerAutostart() };
  });

  ipcMain.handle('consumer:getAutostart', async () => store.getConsumerAutostart());

  ipcMain.handle('consumer:getLimits', async () => store.getConsumerLimits());
  ipcMain.handle('consumer:setLimits', async (_e, patch: Partial<ConsumerLimits>) =>
    store.setConsumerLimits(patch)
  );

  /**
   * Start the proxy pointed at a specific peer (or the local node if
   * peerId is omitted). Used by Settings → 调用服务 ("Save & Start")
   * to make curl work immediately.
   */
  ipcMain.handle('consumer:startAt', async (_e, payload?: { peerId?: string }) => {
    const peerId = payload?.peerId ?? p2p.peerIdString();
    if (!peerId) throw new Error('libp2p is not started yet');

    const items: NodeAnnouncementFlat[] = await registry.fetch(store.getBootstrap().registryUrl);
    let target: NodeAnnouncementFlat | undefined = items.find((it) => it.peerId === peerId);
    if (!target && peerId === p2p.peerIdString()) {
      const local = store.getProvision();
      if (local) {
        // The local peer exposes one or more providers; default the
        // proxy target to the first one.
        target = localFlat(local)[0];
      }
    }
    if (!target) throw new Error(`peer ${peerId} not found in registry`);

    proxy.setTarget(target);
    if (!proxy.isRunning()) {
      await proxy.start(store.getBootstrap().proxyPort);
    }
    return { port: store.getBootstrap().proxyPort, target };
  });
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
        found = localFlat(local)[0];
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
    // Open ~/.modelbus/ — the on-disk home for p2p.json, event.log and
    // modelbus.db. shell.openPath delegates to the platform's default
    // file manager: Finder on macOS, Explorer on Windows, xdg-open on
    // Linux. Make sure the directory exists so the manager has
    // something to focus on a first-run install.
    await fsPromises.mkdir(MODELBUS_DIR, { recursive: true });
    const err = await shell.openPath(MODELBUS_DIR);
    if (err) console.warn('[ipc] openLogsFolder failed:', err);
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
    // Always include the local node if it is provisioned. Each
    // provider becomes its own row so the Models UI can list them
    // separately.
    if (provisioner.isActive()) {
      const prov = store.getProvision();
      if (prov) {
        const localEntries = localFlat(prov);
        for (const entry of localEntries) {
          if (
            !items.find(
              (it) => it.peerId === entry.peerId && it.providerId === entry.providerId
            )
          ) {
            items.unshift(entry);
          }
        }
      }
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
    const first = cfg.providers[0];
    const payload = {
      peerId: cfg.peerId,
      nickname: cfg.nickname,
      providerId: first?.providerId ?? '',
      providerName: first?.providerName ?? '',
      modelIds: first ? [...first.modelIds] : [],
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




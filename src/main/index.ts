import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';

import { Store } from './services/store.js';
import { ProviderService } from './services/providers.js';
import { RegistryService } from './services/registry.js';
import { P2PService } from './services/p2p.js';
import { ProvisionerService } from './services/provisioner.js';
import { ConsumerProxy } from './services/proxy-server.js';
import { BootstrapCache } from './services/bootstrap-cache.js';
import { registerIpc } from './ipc.js';

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;

function createWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#0f1115',
    title: 'ModelBus P2P',
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
    },
    show: false,
  });
  mainWindow.once('ready-to-show', () => mainWindow?.show());

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
  return mainWindow;
}

class EventBus {
  private handlers: Array<(e: { type: string; payload: unknown }) => void> = [];
  emit(event: { type: string; payload: unknown }) {
    for (const h of this.handlers) {
      try {
        h(event);
      } catch (err) {
        console.warn('[bus]', err);
      }
    }
  }
  on(h: (e: { type: string; payload: unknown }) => void) {
    this.handlers.push(h);
  }
  off(h: (e: { type: string; payload: unknown }) => void) {
    this.handlers = this.handlers.filter((x) => x !== h);
  }
}

async function bootstrap() {
  const store = new Store();
  await store.load();

  const bus = new EventBus();

  const providers = new ProviderService();
  const registry = new RegistryService();
  const p2p = new P2PService(bus);
  const provisioner = new ProvisionerService(() => p2p.getNode(), providers, bus);
  const proxy = new ConsumerProxy(
    () => p2p.getNode(),
    bus,
    () => p2p.peerIdString(),
    (req) => provisioner.handleLocal(req)
  );
  const bootstrapCache = new BootstrapCache();

  const deps = {
    store,
    providers,
    registry,
    p2p,
    provisioner,
    proxy,
    bootstrapCache,
    getMainWindow: () => mainWindow,
  };
  registerIpc(deps);
  bus.on((evt) => {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send('p2p:event', evt);
      win.webContents.send('proxy:event', evt);
    }
  });
  return deps;
}

app.whenReady().then(async () => {
  await bootstrap();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', async (event) => {
  // Best-effort clean shutdown of libp2p + proxy.
  try {
    event.preventDefault();
    const all = BrowserWindow.getAllWindows();
    for (const w of all) w.webContents.send('p2p:event', { type: 'shutting-down', payload: {} });
    const node = (globalThis as unknown as { __deps?: { p2p: P2PService; proxy: ConsumerProxy } }).__deps;
    if (node) {
      await node.p2p.stop();
      await node.proxy.stop();
    }
    app.exit(0);
  } catch (err) {
    console.error('[shutdown]', err);
    app.exit(1);
  }
});
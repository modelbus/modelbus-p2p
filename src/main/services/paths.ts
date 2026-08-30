import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * Central place for the on-disk layout of ModelBus.
 *
 *   ~/.modelbus/
 *   ├── p2p.json       — settings (provision profiles, keys, ports, …)
 *   ├── event.log      — application event log
 *   └── modelbus.db    — SQLite database of served / consumed requests
 *
 * The directory is created lazily by each consumer; callers should
 * ensure it exists before writing.
 */
export const MODELBUS_DIR = join(homedir(), '.modelbus');

export const PATHS = {
  dir: MODELBUS_DIR,
  settings: join(MODELBUS_DIR, 'p2p.json'),
  log: join(MODELBUS_DIR, 'event.log'),
  db: join(MODELBUS_DIR, 'modelbus.db'),
} as const;

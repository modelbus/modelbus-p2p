import Database from 'better-sqlite3';
import { promises as fs } from 'node:fs';
import { PATHS } from './paths.js';

/**
 * SQLite-backed store for request records, persisted at
 * ~/.modelbus/modelbus.db.
 *
 * Schema:
 *   CREATE TABLE requests (
 *     id          INTEGER PRIMARY KEY AUTOINCREMENT,
 *     ts          INTEGER NOT NULL,   -- unix ms
 *     direction   TEXT    NOT NULL,   -- 'supply' (served to peers) | 'consume' (sent to peers)
 *     peer_id     TEXT,               -- remote peerId involved (if any)
 *     model       TEXT,
 *     path        TEXT,
 *     method      TEXT,
 *     status      INTEGER,
 *     latency_ms  INTEGER,
 *     bytes_in    INTEGER,
 *     bytes_out   INTEGER
 *   );
 */
export interface RequestRecord {
  ts: number;
  direction: 'supply' | 'consume';
  peerId?: string;
  model?: string;
  path?: string;
  method?: string;
  status?: number;
  latencyMs?: number;
  bytesIn?: number;
  bytesOut?: number;
}

export class Db {
  private db: Database.Database | null = null;

  async init(): Promise<void> {
    await fs.mkdir(PATHS.dir, { recursive: true });
    this.db = new Database(PATHS.db);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS requests (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        ts          INTEGER NOT NULL,
        direction   TEXT    NOT NULL,
        peer_id     TEXT,
        model       TEXT,
        path        TEXT,
        method      TEXT,
        status      INTEGER,
        latency_ms  INTEGER,
        bytes_in    INTEGER,
        bytes_out   INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_requests_ts ON requests(ts);
      CREATE INDEX IF NOT EXISTS idx_requests_direction ON requests(direction);
    `);
  }

  record(r: RequestRecord): void {
    if (!this.db) return;
    this.db
      .prepare(
        `INSERT INTO requests
           (ts, direction, peer_id, model, path, method, status, latency_ms, bytes_in, bytes_out)
         VALUES
           (@ts, @direction, @peer_id, @model, @path, @method, @status, @latency_ms, @bytes_in, @bytes_out)`
      )
      .run({
        ts: r.ts,
        direction: r.direction,
        peer_id: r.peerId ?? null,
        model: r.model ?? null,
        path: r.path ?? null,
        method: r.method ?? null,
        status: r.status ?? null,
        latency_ms: r.latencyMs ?? null,
        bytes_in: r.bytesIn ?? null,
        bytes_out: r.bytesOut ?? null,
      });
  }

  /** Latest N records, newest first. */
  recent(limit = 200): RequestRecord[] {
    if (!this.db) return [];
    return this.db
      .prepare(
        `SELECT ts, direction, peer_id, model, path, method, status, latency_ms, bytes_in, bytes_out
         FROM requests ORDER BY id DESC LIMIT ?`
      )
      .all(limit)
      .map((row) => this.hydrate(row as Record<string, unknown>));
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  private hydrate(row: Record<string, unknown>): RequestRecord {
    return {
      ts: Number(row.ts),
      direction: row.direction as 'supply' | 'consume',
      peerId: (row.peer_id as string) ?? undefined,
      model: (row.model as string) ?? undefined,
      path: (row.path as string) ?? undefined,
      method: (row.method as string) ?? undefined,
      status: row.status != null ? Number(row.status) : undefined,
      latencyMs: row.latency_ms != null ? Number(row.latency_ms) : undefined,
      bytesIn: row.bytes_in != null ? Number(row.bytes_in) : undefined,
      bytesOut: row.bytes_out != null ? Number(row.bytes_out) : undefined,
    };
  }
}

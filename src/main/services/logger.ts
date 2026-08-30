import { promises as fs, createWriteStream, type WriteStream } from 'node:fs';
import { PATHS } from './paths.js';

/**
 * Append-only file logger writing to ~/.modelbus/event.log.
 *
 * Writes are serialized through a promise queue so concurrent emitters
 * never interleave partial lines. Each entry is a single JSON-ish line:
 *
 *   2026-08-31T01:23:45.678Z [INFO] message {"key":"value"}
 */
export class Logger {
  private stream: WriteStream | null = null;
  private queue: Promise<void> = Promise.resolve();

  async init(): Promise<void> {
    await fs.mkdir(PATHS.dir, { recursive: true });
    this.stream = createWriteStream(PATHS.log, { flags: 'a' });
  }

  log(level: 'INFO' | 'WARN' | 'ERROR', message: string, extra?: Record<string, unknown>): void {
    const payload = extra && Object.keys(extra).length ? ` ${JSON.stringify(extra)}` : '';
    const line = `${new Date().toISOString()} [${level}] ${message}${payload}\n`;
    this.queue = this.queue.then(
      () =>
        new Promise<void>((resolve) => {
          if (this.stream) {
            this.stream.write(line, () => resolve());
          } else {
            // eslint-disable-next-line no-console
            console.log(line.trimEnd());
            resolve();
          }
        })
    );
  }

  info(message: string, extra?: Record<string, unknown>): void {
    this.log('INFO', message, extra);
  }

  warn(message: string, extra?: Record<string, unknown>): void {
    this.log('WARN', message, extra);
  }

  error(message: string, extra?: Record<string, unknown>): void {
    this.log('ERROR', message, extra);
  }

  close(): void {
    this.queue = this.queue.then(
      () =>
        new Promise<void>((resolve) => {
          if (this.stream) {
            this.stream.end(() => resolve());
            this.stream = null;
          } else {
            resolve();
          }
        })
    );
  }
}

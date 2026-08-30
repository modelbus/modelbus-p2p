import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

/**
 * Best-effort hardware identifier for the current machine.
 *
 * The identifier is stable across reboots and app reinstalls, so the
 * libp2p peerId derived from it is always the same on a given device —
 * exactly what a P2P node needs for a stable identity.
 *
 * Resolution order per platform:
 *   - macOS:  `ioreg` IOPlatformUUID (Hardware UUID)
 *   - Linux:  /etc/machine-id, then /var/lib/dbus/machine-id
 *   - Windows: HKLM\SOFTWARE\Microsoft\Cryptography\MachineGuid
 *
 * Returns '' if none of the sources are available (then the caller falls
 * back to a persisted random identity).
 */
export function getMachineId(): string {
  try {
    if (process.platform === 'darwin') {
      const out = execFileSync(
        'ioreg',
        ['-rd1', '-c', 'IOPlatformExpertDevice'],
        { encoding: 'utf8', timeout: 3000 }
      );
      const m = out.match(/"IOPlatformUUID"\s*=\s*"([^"]+)"/);
      if (m?.[1]) return m[1].toLowerCase();
    } else if (process.platform === 'linux') {
      for (const p of ['/etc/machine-id', '/var/lib/dbus/machine-id']) {
        if (existsSync(p)) {
          const v = readFileSync(p, 'utf8').trim();
          if (v) return v.toLowerCase();
        }
      }
    } else if (process.platform === 'win32') {
      const out = execFileSync(
        'reg',
        ['query', 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography', '/v', 'MachineGuid'],
        { encoding: 'utf8', timeout: 3000 }
      );
      const m = out.match(/MachineGuid\s+REG_SZ\s+([0-9a-fA-F-]+)/);
      if (m?.[1]) return m[1].toLowerCase();
    }
  } catch {
    /* fall through to empty */
  }
  return '';
}

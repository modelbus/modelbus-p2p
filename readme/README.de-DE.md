<!-- auto-generated README for de-DE; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : Eine dezentrale LLM-Token-Sharing-Plattform
</h1>
<p align="center" style="font-weight: bold;">
  Möglicherweise die weltweit erste Plattform, auf der jeder seine Tokens an ein P2P-Netzwerk hängen und im Gegenzug die Tokens anderer Peers nutzen kann. Kein zentraler Server, kein Konto, kein API-Schlüssel verlässt jemals deine Maschine.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P befindet sich noch in Entwicklung und öffentlichem Test.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## Inhalt

- [Was ist es](#was-ist-es)
- [Kernfunktionen](#kernfunktionen)
- [Bildschirmfotos](#bildschirmfotos)
- [Architektur](#architektur)
- [Dezentrales Design](#dezentrales-design)
- [Knoten-Ankündigungsformat (v2)](#knoten-ankndigungsformat-v2)
- [Anfrage-Ablauf](#anfrage-ablauf)
- [Download & Nutzung (demnächst)](#download-nutzung-demnchst)
- [Schnellstart](#schnellstart)
- [Roadmap](#roadmap)

---

## Was ist es

ModelBus-P2P ist ein Desktop-Client auf Basis von [js-libp2p](https://github.com/libp2p/js-libp2p) und Electron. Er löst ein Problem, das fast jeder kennt: **diesen Monat übrig, nächsten Monat zu wenig.**

> Szenario: Du zahlst für OpenAI oder Claude und verbrennst dein monatliches Kontingent selten. Statt es verfallen zu lassen, hänge es an das P2P-Netzwerk. Jede Anfrage, die über deinen Knoten läuft, wird in **MBP-Token** umgerechnet (Online-Minuten × 0,05 + geteilte Token-Anzahl × 2 + bediente Anfragen × 0,1 + Antwortgeschwindigkeit × 0,5). Wenn der nächste Monat kommt und dein Kontingent knapp wird, gibst du diese MBP-Token aus, um Token anderer Peers aufzurufen. Es ist kein zentraler Server beteiligt, und dein API-Schlüssel bleibt auf deiner Maschine.

- **Provision / Share**: Hinterlege deinen API-Schlüssel und die Modelle, die du teilen möchtest. Das Netzwerk lernt deine Peer-ID.
- **Consume / Drive**: Starte einen lokalen OpenAI-kompatiblen HTTP-Proxy auf `http://127.0.0.1:18100`; jeder kompatible Client kann direkt darauf zugreifen; Anfragen werden über P2P an den Peer weitergeleitet, der den Token tatsächlich hält.
- **Wallet**: Jede Bereitstellung oder jeder Aufruf sammelt MBP-Token. Der Home-Tab und die Wallet-Seite zeigen Saldo, Aufschlüsselung und Formel in Echtzeit. MBP wird derzeit nur als Buchung geführt; zukünftige Versionen nutzen es für Reputation, Anreize und priorisiertes Routing.
- **Kein Onboarding**: Der erste Start holt Seed-Knoten vom offiziellen Endpunkt (oder einem lokalen Mock) und läuft danach vollständig im P2P-Modus.

---

## Kernfunktionen

| Funktion | Hinweise |
|---|---|
| **P2P-Transport** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Dezentrales Vertrauen** | 4 fest kodierte Seed-Peer-IDs als Vertrauensanker; neue Peers kommen über eine Vertrauenskette (nächster Meilenstein) hinzu |
| **Cold-Start-Fallback** | Erster Start zieht Knoten vom offiziellen HTTPS-Endpunkt oder einem lokalen Mock; alles landet in `<userData>/bootstrap-cache.json` |
| **Multi-Provider-Routing** | Ein Peer kann OpenAI + Anthropic + Google gleichzeitig hosten; Aufrufer routen nach `model.id` |
| **OpenAI-kompatibler Proxy** | Lokaler HTTP-Proxy auf `:18100`; jeder OpenAI-/Anthropic-kompatible Client funktioniert sofort |
| **API-Schlüssel-Auth (optional)** | Im Consum-Proxy einen festen Schlüssel setzen; Aufrufer müssen `Authorization: Bearer <key>` senden |
| **22 Sprachen** | Standard ist Deutsch; RTL-Arabisch unterstützt |
| **Helles Standard-Theme** | Dunkel / OS folgen umschaltbar |

---

## Bildschirmfotos

Home, Models, Wallet, Logs, Settings – fünf Ansichten. Vollauflösende Screenshots liegen unter [docs/image/](../docs/image/).

---

## Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│  Electron Renderer (Vue 3)                                       │
│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │
│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │
│  └──────┴──────────┴──────────┴────────┴──────────┘              │
│                       │  ipcRenderer.invoke / on                  │
└───────────────────────┼─────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Electron Main (Node.js)                                         │
│  ipcMain ──► services/                                          │
│              ├─ providers   (models.dev Cache)                  │
│              ├─ registry    (offizielle API + Cache-Fallback)   │
│              ├─ p2p         (libp2p-Daemon)                      │
│              ├─ provisioner (Multi-Provider-Router)             │
│              ├─ proxy-server (OpenAI-kompatibles HTTP)          │
│              ├─ upstream    (echte Provider-API-Aufrufe)        │
│              ├─ wallet      (MBP-Scoreberechnung)                │
│              └─ models      (Katalog-Aggregator)                 │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   P2P-Netzwerk    │
              └──────────────────┘
```

```bash
# Knoten-Ankündigung v2 – siehe unten
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Lokaler Consum-Proxy
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Dezentrales Design

Vier Seed-Peer-IDs sind in die Binärdatei eingebrannt (`src/main/config/trusted-roots.ts`). Cold-Start-Flow:

1. Lokaler Cache ist beim ersten Start leer
2. Parallel abrufen: offizieller HTTPS-Endpunkt + vom Nutzer konfigurierte `bootstrapMultiaddrs` + mDNS
3. Jede Peer-ID gegen `TRUSTED_ROOT_PEER_IDS` validieren
4. Validierte Teilmenge in `<userData>/bootstrap-cache.json` speichern
5. P2P-Daemon startet; Cache-Treffer bleiben im P2P-Modus; Misses versuchen den offiziellen Endpunkt jede Stunde erneut

```
4 fest kodierte Wurzeln  ←  Vertrauensanker
└─ vom offiziellen Endpunkt zwischengespeichert
   ├─ direkte Verbindung über bootstrapMultiaddrs
   ├─ mDNS (LAN-Discovery)
   └─ libp2p DHT findProviders (reines P2P)
```

Der offizielle Endpunkt bleibt **für immer** als Rettungskanal erhalten, auch wenn das P2P-Netzwerk gesund ist.

---

## Knoten-Ankündigungsformat (v2)

Aufruf: `<https://modelbus.cc/api/v1/nodes>` liefert `Array<NodeAnnouncement>`:

```json
{
  "version":     2,
  "peerId":      "12D3KooW...",
  "nickname":    "alpha-share",
  "providers": [
    {
      "providerId":   "openai",
      "providerName": "OpenAI",
      "models":       [
        { "id": "openai/gpt-5",       "name": "GPT-5" },
        { "id": "openai/gpt-5-mini", "name": "GPT-5 mini" }
      ]
    }
  ],
  "addr": {
    "addr":      "/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...",
    "kind":      "direct",
    "transport": "tcp",
    "lastSeen":  1735689600000
  },
  "announcedAt": 1735689600000,
  "expiresAt":   1735862400000
}
```

Felder:

- **version** `2`: Schema-Version; bei Breaking Changes +1
- **peerId**: libp2p-Peer-ID, global eindeutig
- **nickname**: Menschenlesbarer Name
- **providers[]**: LLM-Provider, die dieser Peer hostet
  - **providerId**: Provider-ID aus models.dev
  - **providerName**: Anzeigename
  - **models[]**: Modelle unter diesem Provider; jeder Eintrag hat `id` (kanonisch) und `name` (Anzeige)
- **addr**: einzelne primäre erreichbare Adresse (Singular, nicht Plural)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: Unix-ms der letzten Aktualisierung
- **expiresAt**: weiche TTL; abgelaufene Einträge bleiben nutzbar, werden aber niedriger gewichtet

Die letzten 4 Einträge in `mock/nodes.json` sind die vertrauenswürdigen Seed-Peers; ihre Peer-IDs stimmen mit `trusted-roots.ts` überein.

---

## Anfrage-Ablauf

**Provision** (du = Token-Inhaber): Einstellungen → Token-Freigabe → Anbieter auswählen → API-Schlüssel einfügen → Modelle markieren → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (du = Token-Konsument): Wähle im Models-Tab einen vertrauenswürdigen Peer → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → HTTP POST trifft ein → `body.model` extrahieren → Peer anwählen → `InferenceRequest` (JSON + Längenpräfix) senden → blockierend auf `InferenceResponse` warten → HTTP-Antwort schreiben.

**Anfrage-Routing** (beim Angerufenen, `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ Treffer: openai-Provider-Konfiguration
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ echten Aufruf ausführen, Antwort zurückgeben
  └─ kein Treffer: 400 + { error: "model X is not hosted by this peer" }
```

---

## Download & Nutzung (demnächst)

> 📦 Offizielle Installer (Windows / macOS / Linux, später Mobile und Web SDK) werden derzeit vorbereitet.

**Sofort benutzen: aus dem Quellcode bauen**

```bash
pnpm install
pnpm run dev          # Entwicklungsmodus (Electron + Vite HMR)
pnpm run package:mac  # macOS dmg
pnpm run package:win  # Windows nsis
pnpm run package:linux # Linux AppImage
```

Die Artefakte landen in `release/`.

**Vertriebskanäle (geplant)**: offizielle Download-Seite · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Die offizielle Domain bleibt dauerhaft der Rettungsendpunkt.

---

## Schnellstart

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

Beim ersten Start zeigt die App standardmäßig auf `mock/nodes.json`, sodass der gesamte Ablauf ohne Netzwerk funktioniert. Weitere Details im Haupt-[README.md](../README.md) und im [docs/](../docs/)-Ordner.

---

## Roadmap

- ✅ v1: Multi-Provider, offizieller Cold Start, Vertrauensanker, P2P-Weiterleitung, 22 Sprachen, Wallet-Gerüst
- 🔜 v2: Vertrauenskette (trustChain) – Ed25519-signiertes Invite-Ledger
- 🔜 v3: Qualitätsbewertung aus realen Metriken (Latenz, Fehlerrate, Verfügbarkeit)
- 🔜 v4: Token-Ökonomie-Kreislauf – MBP steuert priorisiertes Routing, Cold-Start-Boosts und Knoten-Discovery
- 🔜 v5: Mobile Peers
- 🔜 v6: Web SDK – `<modelbus>` im Browser

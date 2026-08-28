<!-- auto-generated README for en-US; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : A Decentralised LLM Token-Sharing Platform
</h1>
<p align="center" style="font-weight: bold;">
  Possibly the world's first platform where anyone can attach their Token to a P2P network and use other peers' shared Tokens in return. No central server, no account, no API key ever leaves your machine.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P is still under development and public testing.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[简体中文](../README.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## Contents

- [What is it](#what-is-it)
- [Core features](#core-features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Decentralised design](#decentralised-design)
- [Node announcement schema (v2)](#node-announcement-schema-v2)
- [Request flow](#request-flow)
- [Download & Use (coming soon)](#download-use-coming-soon)
- [Quick start](#quick-start)
- [Roadmap](#roadmap)

---

## What is it

ModelBus-P2P is a desktop client built on [js-libp2p](https://github.com/libp2p/js-libp2p) and Electron. It solves a problem almost everyone has: **this month I have unused quota, next month I will run out.**

> Scenario: you pay for OpenAI or Claude and rarely burn through your monthly allowance. Instead of letting it expire, attach it to the P2P network. Every request that flows through your node is converted into **MBP tokens** (online minutes × 0.05 + shared-token count × 2 + served requests × 0.1 + response speed × 0.5). When next month arrives and your quota runs short, you spend those MBP tokens to call Tokens shared by other peers. No central server is involved at any point, and your API key stays on your machine.

- **Provision / Share**: attach your subscription API key plus the models you want to share. The network learns your peerId.
- **Consume / Drive**: spin up a local OpenAI-compatible HTTP proxy on `http://127.0.0.1:18100`; point any compatible client at it; requests are forwarded over P2P to the peer that actually holds the Token.
- **Wallet**: every share or call accrues MBP tokens. The Home tab and the dedicated Wallet page show the balance, the breakdown and the formula. MBP is currently accounting-only; future releases will use it for reputation, incentives and priority routing.
- **No onboarding**: the first launch pulls seed nodes from the official endpoint (or a local mock) and then runs in fully P2P mode.

---

## Core features

| Feature | Notes |
|---|---|
| **P2P transport** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Decentralised trust** | 4 hard-coded seed peerIds form the trust root; new peers join through a trust-chain (next milestone) |
| **Cold-start fallback** | First launch pulls nodes from the official HTTPS endpoint or a local mock; everything lands in `<userData>/bootstrap-cache.json` |
| **Multi-provider routing** | One peer can host OpenAI + Anthropic + Google keys at the same time; callers route by `model.id` |
| **OpenAI-compatible proxy** | Local HTTP proxy on `:18100`; any OpenAI / Anthropic-compatible client works out of the box |
| **API-key auth (optional)** | Pin a fixed key in the consume proxy; callers must send `Authorization: Bearer <key>` |
| **22 languages** | zh-CN default; RTL Arabic supported |
| **Light-mode default theme** | Toggle dark / follow OS |

---

## Screenshots

Home, Models, Wallet, Logs, Settings — five views in total. Full-resolution screenshots live under [docs/image/](../docs/image/).

---

## Architecture

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
│              ├─ providers   (models.dev cache)                  │
│              ├─ registry    (official API + cache fallback)    │
│              ├─ p2p         (libp2p daemon)                      │
│              ├─ provisioner (multi-provider router)            │
│              ├─ proxy-server (OpenAI-compatible HTTP)           │
│              ├─ upstream    (real provider API calls)           │
│              ├─ wallet      (MBP score calculator)              │
│              └─ models      (catalogue aggregator)              │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   P2P Network     │
              └──────────────────┘
```

```bash
# Node announcement v2 — see the schema section below
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Local consume proxy
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Decentralised design

Four seed peerIds are baked into the binary (`src/main/config/trusted-roots.ts`). Cold-start flow:

1. Local cache is empty on first launch
2. Pull concurrently: official HTTPS endpoint + user-configured `bootstrapMultiaddrs` + mDNS
3. Validate every peerId against `TRUSTED_ROOT_PEER_IDS`
4. Persist the trusted subset to `<userData>/bootstrap-cache.json`
5. P2P daemon starts; cache hits stay in P2P mode; misses retry the official endpoint every hour

```
4 hard-coded roots  ←  trust anchors
└─ cached from official endpoint
   ├─ direct connect via bootstrapMultiaddrs
   ├─ mDNS (LAN discovery)
   └─ libp2p DHT findProviders (P2P pure)
```

The official endpoint is kept **forever** as the rescue channel even when the P2P network is healthy.

---

## Node announcement schema (v2)

`<https://modelbus.cc/api/v1/nodes>` returns `Array<NodeAnnouncement>`:

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
  ],  "addr": {
 "addr":      "/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...",
    "kind":      "direct",
    "transport": "tcp",
    "lastSeen":  1735689600000
  },  "announcedAt": 1735689600000,
  "expiresAt":   1735862400000
}
```

Fields:

- **version** `2` — schema version; bump on breaking changes
- **peerId** — libp2p PeerId, globally unique
- **nickname** — human-readable name
- **providers[]** — LLM providers this peer hosts
  - **providerId** — provider id from models.dev
  - **providerName** — display name
  - **models[]** — models shared under this provider; each has `id` (canonical) and `name` (display)
- **addr** — single primary reachable address (singular, not plural)
  - **kind** — `direct` / `relay` / `unknown`
  - **transport** — `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt** — Unix ms when this entry was last refreshed
- **expiresAt** — soft TTL; stale entries are still usable but ranked lower

The trailing 4 entries in `mock/nodes.json` are the trusted seed peers and share the same peerIds as `trusted-roots.ts`.

---

## Request flow

**Provision** (you = Token holder): Settings → Share Tokens → pick provider, paste API key, tick models → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (you = Token consumer): pick a trusted peer on the Models tab → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → HTTP POST arrives → extract `body.model` → dial peer → write `InferenceRequest` (JSON + length-prefixed) → block on `InferenceResponse` → write HTTP response.

**Request routing** (at the callee):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ match: openai provider config
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ callUpstream, return response
  └─ no match: 400 + { error: "model X is not hosted by this peer" }
```

---

## Download & Use (coming soon)

> 📦 Official installers (Windows / macOS / Linux, plus mobile and Web SDK later) are still being prepared.

**For now, build from source:**

```bash
pnpm install
pnpm run dev          # dev mode (Electron + Vite HMR)
pnpm run package:mac  # bundle macOS dmg
pnpm run package:win  # bundle Windows nsis
pnpm run package:linux # bundle Linux AppImage
```

Output lands in `release/`.

**Distribution channels (planned):** official download page · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. The official domain stays the long-term rescue endpoint.

---

## Quick start

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

On first launch the app defaults to `mock/nodes.json`, so the full flow works without any network. For deeper setup see the main [README.md](../README.md) and the [docs/](../docs/) folder.

---

## Roadmap

- ✅ v1: multi-provider, official cold start, trust roots, P2P forwarding, 22 languages, wallet scaffolding
- 🔜 v2: trust chain (Ed25519-signed invite ledger)
- 🔜 v3: real-world quality metrics (latency, error rate, uptime)
- 🔜 v4: token-economy loop — MBP drives priority routing, cold-start boosts, node discovery
- 🔜 v5: mobile peers
- 🔜 v6: web SDK — `<modelbus>` in the browser

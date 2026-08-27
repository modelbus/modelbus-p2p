# ModelBus P2P

> A decentralized token-sharing desktop client built on [`js-libp2p`](https://github.com/libp2p/js-libp2p) and Electron.

ModelBus turns your AI provider API key into a peer-to-peer service. Any node can
either **Provision (Share)** its own key out to the network or **Consume (Drive)**
another peer's key by routing requests through the libp2p transport layer.

```
┌────────────────────┐         libp2p /modelbus/inference/1.0.0         ┌────────────────────┐
│ Consumer node      │ ────── JSON over length-prefixed stream ───────▶ │ Provisioner node  │
│  local HTTP proxy  │                                                   │  upstream API call│
│  :18100/v1/...     │ ◀─────────── upstream response ────────────────── │  openai/anthropic │
└────────────────────┘                                                   └────────────────────┘
```

## Features

* Pure **libp2p** transport stack: TCP + WebSocket + Circuit Relay v2 + UPnP NAT
* Full provider catalogue from [models.dev](https://github.com/anomalyco/models.dev)
  (OpenAI, Anthropic, Google, Bedrock, Mistral, Groq, DeepSeek, …)
* Cross-NAT connectivity via libp2p circuit relay (peers can sit behind typical
  home routers)
* OpenAI-compatible local HTTP proxy (port `18100` by default) on the consumer side
* Browser-style Electron renderer (Vue 3) with live traffic / event log
* Registry served from any URL (`http://`, `https://`, or `file:///` for local mock)

## Architecture

| Layer | File | Purpose |
|---|---|---|
| Electron main | `src/main/index.ts` | Bootstraps services, manages the BrowserWindow |
| IPC | `src/main/ipc.ts` | Bridge between renderer and the libp2p / HTTP layer |
| P2P | `src/main/services/p2p.ts` | `createLibp2p()` with TCP / WS / relay / DHT / UPnP |
| Provisioner | `src/main/services/provisioner.ts` | Handles the custom `/modelbus/inference/1.0.0` protocol and forwards to upstream LLM providers |
| Consumer proxy | `src/main/services/proxy-server.ts` | Local HTTP server that dials the chosen peer and forwards requests |
| Protocol wire | `src/main/proto/inference.ts` | Length-prefixed JSON frames (`@libp2p/utils/lp-stream`) |
| Provider list | `src/main/services/providers.ts` | Cached fetcher for `https://models.dev/api.json` |
| Registry | `src/main/services/registry.ts` | Reads the node catalogue URL and merges with the local announce |
| Renderer | `src/renderer/src/App.vue` | Status / Setup / Provision / Consume / Settings tabs |

## Quick start

```bash
npm install
npm run dev        # launches Electron with HMR
```

To produce a packaged app:

```bash
npm run package:mac
```

## How to use it

1. **Setup tab** – pick a provider from `models.dev` and copy your API key.
2. **Status tab** – click **Start P2P node**. UPnP will try to open a port; if you
   are behind symmetric NAT, libp2p's circuit relay still works as long as at
   least one peer can be reached.
3. **Provision tab** – choose the provider, paste the API key, optionally pick a
   subset of models, then click **Start sharing**. Your peer ID and listen
   addresses will be announced to the registry URL.
4. **Consume tab** (on a second device or the same machine for a smoke test) –
   click **Refresh node list**, pick a peer, and the local HTTP proxy starts on
   `http://127.0.0.1:18100/v1/...`. Any OpenAI- or Anthropic-style client (curl,
   opencode, Open WebUI, etc.) can talk to it.

```bash
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
        "model": "openai/gpt-5",
        "messages": [{"role": "user", "content": "hi"}]
      }'
```

The consumer forwards the entire HTTP request over the libp2p stream, the
provisioner rebuilds it as a real call to the upstream provider (using its own
key), then streams the response back the same way.

## Registry URL

The default mock is `http://localhost:8089/nodes.json`; you can override it on
the **Settings** tab with any URL the client can reach (e.g. a public JSON
endpoint that you operate). `file:///path/to/mock/nodes.json` works too — see
`mock/nodes.json` for the expected shape.

When you start sharing, ModelBus will also try to POST your announcement back
to that URL (if it's writable, or `file://`). That's optional and best-effort.

## NAT traversal notes

* UPnP/NAT-PMP opens inbound TCP ports when supported by the router.
* When UPnP fails, both sides still work as long as they can reach each other
  through a relay. ModelBus automatically dials peers from the registry over
  their advertised `multiaddrs`; if those fail, it tries the cached addresses in
  the local peer-store.
* The bundled `circuitRelayServer` makes every node a candidate relay, so the
  network self-heals as more peers come online.

## Development tips

* `npm run typecheck` runs `tsc --noEmit` against both the main/preload and the
  renderer trees.
* `DEBUG="libp2p:*" npm run dev` prints verbose libp2p logs.
* The renderer uses no state-management library; just `ref`/`computed` in
  `App.vue`. Swap in Pinia if you want to scale.

## Security note

API keys are stored in `app.getPath('userData')/modelbus-store.json`. Keys are
sent over the wire only when you explicitly consume another peer's *response* —
your key never leaves your machine when you act as the provisioner.

This is an alpha build. Trust no one.
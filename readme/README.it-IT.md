<!-- auto-generated README for it-IT; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : Una piattaforma decentralizzata per la condivisione di token LLM
</h1>
<p align="center" style="font-weight: bold;">
  Probabilmente la prima piattaforma al mondo dove chiunque può collegare il proprio Token a una rete P2P e, in cambio, usare i Token condivisi da altri peer. Nessun server centrale, nessuna registrazione, nessuna chiave API lascia mai la tua macchina.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P è ancora in fase di sviluppo e test pubblici.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## Indice

- [Cos'è](#cos)
- [Funzionalità principali](#funzionalit-principali)
- [Schermate](#schermate)
- [Architettura](#architettura)
- [Design decentralizzato](#design-decentralizzato)
- [Schema annuncio nodo (v2)](#schema-annuncio-nodo-v2)
- [Flusso di una richiesta](#flusso-di-una-richiesta)
- [Download e uso (in arrivo)](#download-e-uso-in-arrivo)
- [Avvio rapido](#avvio-rapido)
- [Roadmap](#roadmap)

---

## Cos'è

ModelBus-P2P è un client desktop basato su [js-libp2p](https://github.com/libp2p/js-libp2p) ed Electron. Risolve un problema che quasi tutti conosciamo: **questo mese avanza, il prossimo non basta.**

> Scenario: paghi OpenAI o Claude e raramente consumi tutta la quota mensile. Invece di lasciarla scadere, agganciala alla rete P2P. Ogni richiesta che passa attraverso il tuo nodo viene convertita in **token MBP** (minuti online × 0,05 + numero di token condivisi × 2 + richieste servite × 0,1 + velocità di risposta × 0,5). Quando arriva il mese successivo e la tua quota è agli sgoccioli, spendi quegli MBP per invocare i Token condivisi da altri peer. Non c'è mai un server centrale di mezzo, e la tua chiave API resta sulla tua macchina.

- **Provision / Share**: registra la chiave API del tuo abbonamento e i modelli che vuoi condividere. La rete apprende il tuo peerId.
- **Consume / Drive**: avvia un proxy HTTP locale compatibile con OpenAI su `http://127.0.0.1:18100`; qualsiasi client compatibile lo punta lì; le richieste vengono inoltrate via P2P al peer che detiene effettivamente il Token.
- **Wallet**: ogni condivisione o chiamata genera token MBP. La scheda Home e la pagina Wallet mostrano saldo, ripartizione e formula in tempo reale. MBP è attualmente solo contabile; le versioni future lo useranno per reputazione, incentivi e instradamento prioritario.
- **Niente onboarding**: al primo avvio recupera nodi seed dall'endpoint ufficiale (o da un mock locale), poi funziona interamente in modalità P2P.

---

## Funzionalità principali

| Funzionalità | Note |
|---|---|
| **Trasporto P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Fiducia decentralizzata** | 4 peerId seed hardcodati come ancore di fiducia; i nuovi peer entrano tramite catena di fiducia (prossima milestone) |
| **Fallback cold-start** | Il primo avvio recupera i nodi dall'endpoint HTTPS ufficiale o da un mock locale; tutto atterra in `<userData>/bootstrap-cache.json` |
| **Instradamento multi-provider** | Un peer può ospitare OpenAI + Anthropic + Google contemporaneamente; i chiamanti instradano per `model.id` |
| **Proxy compatibile OpenAI** | Proxy HTTP locale su `:18100`; qualsiasi client compatibile OpenAI/Anthropic funziona subito |
| **Auth API key (opzionale)** | Fissa una chiave nel proxy di consumo; i chiamanti devono inviare `Authorization: Bearer <key>` |
| **22 lingue** | Italiano predefinito; arabo RTL supportato |
| **Tema chiaro predefinito** | Commutabile in scuro / segui SO |

---

## Schermate

Home, Modelli, Wallet, Log, Impostazioni: cinque viste in totale. Le schermate a risoluzione piena sono in [docs/image/](../docs/image/).

---

## Architettura

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
│              ├─ providers   (cache models.dev)                 │
│              ├─ registry    (API ufficiale + fallback cache)   │
│              ├─ p2p         (demone libp2p)                     │
│              ├─ provisioner (router multi-provider)           │
│              ├─ proxy-server (HTTP compatibile OpenAI)          │
│              ├─ upstream    (chiamate API reali)               │
│              ├─ wallet      (calcolo score MBP)                │
│              └─ models      (aggregatore catalogo)              │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   Rete P2P        │
              └──────────────────┘
```

```bash
# Annuncio nodo v2 — vedi sezione seguente
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Proxy locale di consumo
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Design decentralizzato

Quattro peerId seed sono impressi nel binario (`src/main/config/trusted-roots.ts`). Flusso di cold-start:

1. La cache locale è vuota al primo avvio
2. Recupero in parallelo: endpoint HTTPS ufficiale + `bootstrapMultiaddrs` configurati + mDNS
3. Ogni peerId viene validato contro `TRUSTED_ROOT_PEER_IDS`
4. Il sottoinsieme validato viene persistito in `<userData>/bootstrap-cache.json`
5. Il demone P2P parte; i successi di cache restano in P2P; i fallimenti ritentano l'endpoint ufficiale ogni ora

```
4 radici hardcodate  ←  ancore di fiducia
└─ in cache dall'endpoint ufficiale
   ├─ connessione diretta via bootstrapMultiaddrs
   ├─ mDNS (discovery LAN)
   └─ libp2p DHT findProviders (P2P puro)
```

L'endpoint ufficiale resta **per sempre** come canale di soccorso, anche quando la rete P2P è in salute.

---

## Schema annuncio nodo (v2)

Richiesta: `<https://modelbus.cc/api/v1/nodes>` restituisce `Array<NodeAnnouncement>`:

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

Campi:

- **version** `2`: versione di schema, +1 ad ogni cambio incompatibile
- **peerId**: libp2p PeerId, globalmente unico
- **nickname**: nome leggibile
- **providers[]**: provider LLM ospitati da questo peer
  - **providerId**: id del provider in models.dev
  - **providerName**: nome visualizzato
  - **models[]**: modelli sotto questo provider; ognuno ha `id` (canonico) e `name` (visualizzato)
- **addr**: singolo indirizzo principale raggiungibile (singolare)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: Unix ms dell'ultimo aggiornamento
- **expiresAt**: TTL morbido; voci scadute restano utilizzabili con peso ridotto

Le ultime 4 voci di `mock/nodes.json` sono i peer seed fidati; i loro peerId coincidono con `trusted-roots.ts`.

---

## Flusso di una richiesta

**Provision** (tu = detentore del Token): Impostazioni → Condivisione Token → scegli provider, incolla la chiave API, seleziona i modelli → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (tu = consumatore del Token): scegli un peer fidato nella scheda Modelli → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → arriva un POST HTTP → estrae `body.model` → compone il peer → scrive `InferenceRequest` (JSON con prefisso di lunghezza) → attende bloccando `InferenceResponse` → scrive la risposta HTTP.

**Instradamento lato chiamato** (`ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ match: configurazione provider openai
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ chiamata reale, restituisce risposta
  └─ nessun match: 400 + { error: "model X is not hosted by this peer" }
```

---

## Download e uso (in arrivo)

> 📦 Gli installer ufficiali (pacchetti Windows / macOS / Linux, e in seguito mobile e Web SDK) sono attualmente in preparazione.

**Per usarlo da subito: compila dai sorgenti**

```bash
pnpm install
pnpm run dev          # modalità sviluppo (Electron + Vite HMR)
pnpm run package:mac  # dmg per macOS
pnpm run package:win  # nsis per Windows
pnpm run package:linux # AppImage per Linux
```

Gli artefatti finiscono in `release/`.

**Canali di distribuzione (previsti)**: pagina ufficiale di download · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Il dominio ufficiale resta a lungo come endpoint di soccorso.

---

## Avvio rapido

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

Al primo avvio l'app punta di default a `mock/nodes.json`, quindi l'intero flusso funziona senza rete. Per dettagli vedi il [README.md](../README.md) principale e la cartella [docs/](../docs/).

---

## Roadmap

- ✅ v1: multi-provider, cold-start ufficiale, radici di fiducia, inoltro P2P, 22 lingue, scheletro del Wallet
- 🔜 v2: catena di fiducia (trustChain) — registro inviti firmato Ed25519
- 🔜 v3: valutazione qualità nodo basata su metriche reali (latenza, tasso di errori, uptime)
- 🔜 v4: ciclo economico dei token — MBP pilota instradamento prioritario, boost al cold-start, discovery
- 🔜 v5: peer mobili
- 🔜 v6: Web SDK — `<modelbus>` nel browser

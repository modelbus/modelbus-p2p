<!-- auto-generated README for nb-NO; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : En desentralisert plattform for deling av LLM-tokens
</h1>
<p align="center" style="font-weight: bold;">
  Kanskje verdens første plattform der alle kan knytte sin Token til et P2P-nettverk og bruke andre peers' delte Tokens til gjengjeld. Ingen sentral server, ingen konto, ingen API-nøkkel forlater noensinne maskinen din.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P er fortsatt under utvikling og offentlig testing.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## Innhold

- [Hva er det](#hva-er-det)
- [Kjernefunksjoner](#kjernefunksjoner)
- [Skjermbilder](#skjermbilder)
- [Arkitektur](#arkitektur)
- [Desentralisert design](#desentralisert-design)
- [Node-annonseringsformat (v2)](#node-annonseringsformat-v2)
- [Forespørselsflyt](#foresprselsflyt)
- [Nedlasting og bruk (snart)](#nedlasting-og-bruk-snart)
- [Rask start](#rask-start)
- [Veikart](#veikart)

---

## Hva er det

ModelBus-P2P er en skrivebordsklient bygget på [js-libp2p](https://github.com/libp2p/js-libp2p) og Electron. Den løser et problem nesten alle kjenner: **denne måneden overskudd, neste måned underskudd.**

> Scenario: du betaler for OpenAI eller Claude og bruker sjelden opp månedskvoten. I stedet for å la den utløpe, koble den til P2P-nettverket. Hver forespørsel som går gjennom noden din, konverteres til **MBP-tokens** (onlineminutter × 0,05 + antall delte Tokens × 2 + betjente forespørsler × 0,1 + svartid × 0,5). Når neste måned kommer og kvoten blir knapp, bruker du disse MBP-ene til å kalle Tokens delt av andre peers. Ingen sentral server er involvert, og API-nøkkelen din blir på maskinen din.

- **Provision / Share**: registrer API-nøkkelen for abonnementet og modellene du vil dele. Nettverket lærer peerId-en din.
- **Consume / Drive**: start en lokal OpenAI-kompatibel HTTP-proxy på `http://127.0.0.1:18100`; pek enhver kompatibel klient dit; forespørsler videresendes over P2P til peeren som faktisk holder Token.
- **Wallet**: hver deling eller samtale akkumulerer MBP-tokens. Hjem-fanen og Wallet-siden viser saldo, oppdeling og formel i sanntid. MBP er foreløpig bare bokføring; fremtidige versjoner bruker det for omdømme, insentiver og prioritert ruting.
- **Ingen onboarding**: første start henter frø-noder fra det offisielle endepunktet (eller en lokal mock), og kjører deretter helt i P2P-modus.

---

## Kjernefunksjoner

| Funksjon | Merknader |
|---|---|
| **P2P-transport** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Desentralisert tillit** | 4 hardkodede frø-peer-ID-er som tillitsankre; nye peers kommer inn via tillitskjede (neste milepæl) |
| **Kaldstart-fallback** | Første start henter noder fra det offisielle HTTPS-endepunktet eller en lokal mock; alt lander i `<userData>/bootstrap-cache.json` |
| **Multi-provider-ruting** | Én peer kan huse OpenAI + Anthropic + Google samtidig; kallere ruter via `model.id` |
| **OpenAI-kompatibel proxy** | Lokal HTTP-proxy på `:18100`; enhver OpenAI/Anthropic-kompatibel klient fungerer ut av boksen |
| **API-nøkkel-auth (valgfritt)** | Sett en fast nøkkel i konsum-proxyen; kallere må sende `Authorization: Bearer <key>` |
| **22 språk** | Norsk som standard; RTL-arabisk støttet |
| **Lyst standardtema** | Bytt til mørkt / følg OS |

---

## Skjermbilder

Hjem, Modeller, Wallet, Logger, Innstillinger — totalt fem visninger. Skjermbilder i full oppløsning ligger i [docs/image/](../docs/image/).

---

## Arkitektur

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
│              ├─ registry    (offisiell API + cache-fallback)   │
│              ├─ p2p         (libp2p-demon)                      │
│              ├─ provisioner (multi-provider-ruter)             │
│              ├─ proxy-server (OpenAI-kompatibel HTTP)          │
│              ├─ upstream    (ekte provider-API-kall)           │
│              ├─ wallet      (MBP-poengberegning)               │
│              └─ models      (katalogaggregator)                │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   P2P-nettverk    │
              └──────────────────┘
```

```bash
# Node-annonsering v2 — se neste seksjon
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Lokal konsum-proxy
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Desentralisert design

Fire frø-peer-ID-er er bakt inn i binæren (`src/main/config/trusted-roots.ts`). Kaldstart-flyt:

1. Lokal cache er tom ved første start
2. Hent parallelt: offisielt HTTPS-endepunkt + brukerkonfigurerte `bootstrapMultiaddrs` + mDNS
3. Valider hver peerId mot `TRUSTED_ROOT_PEER_IDS`
4. Lagre godkjent delmengde i `<userData>/bootstrap-cache.json`
5. P2P-demonen starter; cache-treff forblir i P2P-modus; bom prøver det offisielle endepunktet igjen hver time

```
4 hardkodede røtter  ←  tillitsankre
└─ cachet fra offisielt endepunkt
   ├─ direkte tilkobling via bootstrapMultiaddrs
   ├─ mDNS (LAN-oppdagelse)
   └─ libp2p DHT findProviders (ren P2P)
```

Det offisielle endepunktet beholdes **for alltid** som redningskanal, selv når P2P-nettverket er friskt.

---

## Node-annonseringsformat (v2)

Forespørsel: `<https://modelbus.cc/api/v1/nodes>` returnerer `Array<NodeAnnouncement>`:

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

Felt:

- **version** `2`: skjemaversjon; +1 ved store endringer
- **peerId**: libp2p PeerId, globalt unik
- **nickname**: lesbart navn
- **providers[]**: LLM-leverandører denne peeren huser
  - **providerId**: leverandør-ID i models.dev
  - **providerName**: visningsnavn
  - **models[]**: modeller under denne leverandøren; hver har `id` (kanonisk) og `name` (visning)
- **addr**: eneste primære adresse (entall)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: Unix-ms for siste oppdatering
- **expiresAt**: myk TTL; utløpte oppføringer er fortsatt brukbare, men lavere vekt

De 4 siste oppføringene i `mock/nodes.json` er de betrodde frø-peerene; peerId-ene matcher `trusted-roots.ts`.

---

## Forespørselsflyt

**Provision** (du = Token-innehaver): Innstillinger → Token-deling → velg leverandør, lim inn API-nøkkel, kryss av modeller → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (du = Token-forbruker): velg en betrodd peer i Modeller-fanen → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → HTTP POST kommer inn → trekk ut `body.model` → ring peeren → skriv `InferenceRequest` (JSON + lengdeprefiks) → vent blokkerende på `InferenceResponse` → skriv HTTP-svar.

**Forespørselsruting** (hos den kalte peeren `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ treff: openai-leverandørkonfigurasjon
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ ekte kall, returner respons
  └─ ikke treff: 400 + { error: "model X is not hosted by this peer" }
```

---

## Nedlasting og bruk (snart)

> 📦 Offisielle installatører (Windows / macOS / Linux-pakker, senere mobil og Web SDK) er under forberedelse.

**Slik bruker du det nå: bygg fra kilde**

```bash
pnpm install
pnpm run dev          # utviklingsmodus (Electron + Vite HMR)
pnpm run package:mac  # macOS dmg
pnpm run package:win  # Windows nsis
pnpm run package:linux # Linux AppImage
```

Artefaktene havner i `release/`.

**Distribusjonskanaler (planlagt)**: offisiell nedlastingsside · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Det offisielle domenet er permanent redningsendepunkt.

---

## Rask start

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

Ved første start peker appen som standard til `mock/nodes.json`, så hele flyten fungerer uten nettverk. For mer, se hoved-[README.md](../README.md) og mappen [docs/](../docs/).

---

## Veikart

- ✅ v1: multi-provider, offisiell kaldstart, tillitsankre, P2P-videresending, 22 språk, Wallet-skjelett
- 🔜 v2: tillitskjede (trustChain) — Ed25519-signert invitasjonsbok
- 🔜 v3: nodekvalitetsvurdering basert på reelle målinger (svartid, feilrate, oppetid)
- 🔜 v4: token-økonomiløkke — MBP driver prioritert ruting, kaldstart-boost og nodeoppdagelse
- 🔜 v5: mobile peers
- 🔜 v6: Web SDK — `<modelbus>` i nettleseren

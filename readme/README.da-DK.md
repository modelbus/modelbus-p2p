<!-- auto-generated README for da-DK; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : En decentral platform til deling af LLM-tokens
</h1>
<p align="center" style="font-weight: bold;">
  Måske verdens første platform, hvor alle kan tilknytte deres Token til et P2P-netværk og til gengæld bruge andre peers' delte Tokens. Ingen central server, ingen kontooprettelse, ingen API-nøgle forlader nogensinde din maskine.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P er stadig under udvikling og offentlig test.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## Indhold

- [Hvad er det](#hvad-er-det)
- [Kernefunktioner](#kernefunktioner)
- [Skærmbilleder](#skrmbilleder)
- [Arkitektur](#arkitektur)
- [Decentralt design](#decentralt-design)
- [Node-annonceformat (v2)](#node-annonceformat-v2)
- [Forespørgselsflow](#foresprgselsflow)
- [Download og brug (kommer snart)](#download-og-brug-kommer-snart)
- [Hurtig start](#hurtig-start)
- [Roadmap](#roadmap)

---

## Hvad er det

ModelBus-P2P er en desktop-klient bygget på [js-libp2p](https://github.com/libp2p/js-libp2p) og Electron. Den løser et problem de fleste kender: **denne måned er der overskud, næste måned er der underskud.**

> Scenarie: du betaler for OpenAI eller Claude og opbruger sjældent hele din månedlige kvote. I stedet for at lade den udløbe kan du koble den til P2P-netværket. Hver forespørgsel der løber gennem din node, omregnes til **MBP-tokens** (online-minutter × 0,05 + delt Token-antal × 2 + betjente forespørgsler × 0,1 + svartid × 0,5). Næste måned hvor kvoten er ved at slippe op, bruger du de MBP til at kalde Tokens der deles af andre peers. Der er aldrig en central server indblandet, og din API-nøgle bliver på din maskine.

- **Provision / Share**: registrer din abonnements-API-nøgle og de modeller du vil dele. Netværket lærer dit peerId.
- **Consume / Drive**: start en lokal OpenAI-kompatibel HTTP-proxy på `http://127.0.0.1:18100`; peg enhver kompatibel klient derhen; forespørgsler videresendes over P2P til den peer der faktisk holder Token.
- **Wallet**: hver deling eller kald akkumulerer MBP-tokens. Home-fanen og Wallet-siden viser saldo, opdeling og formel i realtid. MBP er pt. kun bogføring; fremtidige versioner bruger det til omdømme, incitamenter og prioriteret routing.
- **Ingen onboarding**: første start henter seed-noder fra det officielle endpoint (eller en lokal mock) og kører herefter fuldt i P2P-tilstand.

---

## Kernefunktioner

| Funktion | Bemærkninger |
|---|---|
| **P2P-transport** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Decentral tillid** | 4 hardcodede seed-peer-IDs som tillidsankre; nye peers tilsluttes via tillidskæde (næste milepæl) |
| **Cold-start-fallback** | Første start henter noder fra det officielle HTTPS-endpoint eller en lokal mock; alt lander i `<userData>/bootstrap-cache.json` |
| **Multi-provider-routing** | Én peer kan hoste OpenAI + Anthropic + Google samtidigt; kaldere router via `model.id` |
| **OpenAI-kompatibel proxy** | Lokal HTTP-proxy på `:18100`; enhver OpenAI/Anthropic-kompatibel klient virker ud af boksen |
| **API-nøgle-auth (valgfri)** | Sæt en fast nøgle i consume-proxyen; kaldere skal sende `Authorization: Bearer <key>` |
| **22 sprog** | Dansk som standard; RTL-arabisk understøttet |
| **Lyst standardtema** | Skift til mørkt / følg OS |

---

## Skærmbilleder

Home, Models, Wallet, Logs, Settings — fem visninger i alt. Skærmbilleder i fuld opløsning ligger i [docs/image/](../docs/image/).

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
│              ├─ registry    (officielt API + cache-fallback)   │
│              ├─ p2p         (libp2p-dæmon)                      │
│              ├─ provisioner (multi-provider-router)             │
│              ├─ proxy-server (OpenAI-kompatibelt HTTP)          │
│              ├─ upstream    (ægte provider-API-kald)             │
│              ├─ wallet      (MBP-scoreberegning)                │
│              └─ models      (katalogaggregator)                 │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   P2P-netværk     │
              └──────────────────┘
```

```bash
# Node-annonce v2 — se næste sektion
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Lokal consume-proxy
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Decentralt design

Fire seed-peer-IDs er indgraveret i binæren (`src/main/config/trusted-roots.ts`). Cold-start-flow:

1. Lokal cache er tom ved første start
2. Hent parallelt: officielt HTTPS-endpoint + brugerkonfigurerede `bootstrapMultiaddrs` + mDNS
3. Valider hver peerId mod `TRUSTED_ROOT_PEER_IDS`
4. Persistér det validerede subset i `<userData>/bootstrap-cache.json`
5. P2P-dæmonen starter; cache-hit forbliver i P2P-tilstand; misser prøver det officielle endpoint igen hver time

```
4 hardcodede rødder  ←  tillidsankre
└─ cachet fra officielt endpoint
   ├─ direkte forbindelse via bootstrapMultiaddrs
   ├─ mDNS (LAN-discovery)
   └─ libp2p DHT findProviders (ren P2P)
```

Det officielle endpoint bevares **for altid** som redningskanal, også når P2P-netværket er sundt.

---

## Node-annonceformat (v2)

Forespørgsel: `<https://modelbus.cc/api/v1/nodes>` returnerer `Array<NodeAnnouncement>`:

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

Felter:

- **version** `2`: skemaversion; +1 ved brydende ændringer
- **peerId**: libp2p PeerId, globalt entydig
- **nickname**: menneskelæseligt navn
- **providers[]**: LLM-udbydere som denne peer hoster
  - **providerId**: udbyder-id i models.dev
  - **providerName**: visningsnavn
  - **models[]**: modeller under denne udbyder; hver har `id` (kanonisk) og `name` (visning)
- **addr**: enkelt primær adresse (ental, ikke flertal)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: Unix-ms for seneste opdatering
- **expiresAt**: blød TTL; udløbne entries er stadig brugbare men vægtes lavere

De sidste 4 entries i `mock/nodes.json` er de betroede seed-peers; deres peer-IDs matcher `trusted-roots.ts`.

---

## Forespørgselsflow

**Provision** (dig = Token-indehaver): Indstillinger → Token-deling → vælg udbyder, indsæt API-nøgle, markér modeller → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (dig = Token-forbruger): vælg en betroet peer under Models → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → en HTTP POST modtages → udtræk `body.model` → ring til peer → skriv `InferenceRequest` (JSON + længdeprefix) → bloker på `InferenceResponse` → skriv HTTP-svar.

**Forespørgselsrouting** (på den kaldte peer, `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ match: openai-udbyderkonfiguration
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ kald rigtigt, returnér svar
  └─ intet match: 400 + { error: "model X is not hosted by this peer" }
```

---

## Download og brug (kommer snart)

> 📦 Officielle installere (Windows / macOS / Linux-pakker, og senere mobil og Web SDK) er under forberedelse.

**For at bruge det nu: byg fra kildekoden**

```bash
pnpm install
pnpm run dev          # udviklingstilstand (Electron + Vite HMR)
pnpm run package:mac  # macOS dmg
pnpm run package:win  # Windows nsis
pnpm run package:linux # Linux AppImage
```

Artefakterne ender i `release/`.

**Distributionskanaler (planlagt)**: officiel download-side · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Det officielle domæne er permanent redningsendepunktet.

---

## Hurtig start

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

Ved første start peger appen som standard på `mock/nodes.json`, så hele flowet fungerer uden netværk. For mere, se hoved-[README.md](../README.md) og mappen [docs/](../docs/).

---

## Roadmap

- ✅ v1: multi-provider, officiel cold-start, tillidsankre, P2P-videresendelse, 22 sprog, Wallet-skelet
- 🔜 v2: tillidskæde (trustChain) — Ed25519-signeret invite-ligebog
- 🔜 v3: nodekvalitetsbedømmelse baseret på reelle målinger (latens, fejlrate, oppetid)
- 🔜 v4: token-økonomi-løkke — MBP styrer prioriteret routing, cold-start-boost, node-discovery
- 🔜 v5: mobile peers
- 🔜 v6: Web SDK — `<modelbus>` i browseren

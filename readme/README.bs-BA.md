<!-- auto-generated README for bs-BA; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : Decentralizirana platforma za dijeljenje LLM tokena
</h1>
<p align="center" style="font-weight: bold;">
  Možda prva platforma na svijetu na kojoj svako može priključiti svoj Token na P2P mrežu i zauzvrat koristiti Tokene koje dijele drugi čvorovi. Bez centralnog servera, bez registracije naloga, nijedan API ključ nikada ne napušta vaš uređaj.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P je još uvijek u razvoju i javnom testiranju.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## Sadržaj

- [Šta je ovo](#ta-je-ovo)
- [Ključne funkcije](#kljune-funkcije)
- [Snimci ekrana](#snimci-ekrana)
- [Arhitektura](#arhitektura)
- [Decentralni dizajn](#decentralni-dizajn)
- [Format objave čvora (v2)](#format-objave-vora-v2)
- [Tok zahtjeva](#tok-zahtjeva)
- [Preuzimanje i korištenje (uskoro)](#preuzimanje-i-koritenje-uskoro)
- [Brzi start](#brzi-start)
- [Mapa puta](#mapa-puta)

---

## Šta je ovo

ModelBus-P2P je desktop klijent izgrađen na [js-libp2p](https://github.com/libp2p/js-libp2p) i Electronu. Rješava problem koji gotovo svi znaju: **ovaj mjesec višak, sljedeći mjesec manjak.**

> Scenarij: plaćate OpenAI ili Claude i rijetko potrošite mjesečnu kvotu. Umjesto da je pustite da istekne, priključite je na P2P mrežu. Svaki zahtjev koji prođe kroz vaš čvor pretvara se u **MBP tokene** (minuti online × 0,05 + broj dijeljenih Tokena × 2 + opsluženi zahtjevi × 0,1 + brzina odgovora × 0,5). Kada sljedeći mjesec kvota postane tijesna, trošite te MBP da pozovete Tokene koje dijele drugi čvorovi. Nijedan centralni server nije uključen, a vaš API ključ ostaje na vašem uređaju.

- **Provision / Share**: registrujte ključ API svog pretplatničkog paketa i modele koje želite dijeliti. Mreža uči vaš peerId.
- **Consume / Drive**: podignite lokalni proxy HTTP kompatibilan s OpenAI-jem na `http://127.0.0.1:18100`; usmjerite bilo koji kompatibilni klijent tamo; zahtjevi se prosljeđuju putem P2P-a čvoru koji stvarno drži Token.
- **Wallet**: svako dijeljenje ili poziv akumulira MBP tokene. Kartica Početna i stranica Wallet prikazuju stanje, raščlambu i formulu u realnom vremenu. MBP je trenutno samo knjigovodstveni; buduće verzije će ga koristiti za reputaciju, poticaje i prioritetno rutiranje.
- **Bez oneboardinga**: prvo pokretanje dovodi seed čvorove sa zvaničnog endpoint-a (ili lokalnog mock-a), a zatim radi potpuno u P2P načinu.

---

## Ključne funkcije

| Funkcija | Napomene |
|---|---|
| **P2P prijenos** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Decentralno povjerenje** | 4 hardkodirana seed peer-ID-ja kao sidra povjerenja; novi čvorovi ulaze preko lanca povjerenja (sljedeća prekretnica) |
| **Cold-start rezerva** | Prvo pokretanje dovodi čvorove sa zvaničnog HTTPS endpoint-a ili lokalnog mock-a; sve stiže u `<userData>/bootstrap-cache.json` |
| **Multi-provider rutiranje** | Jedan čvor može istovremeno hostati OpenAI + Anthropic + Google; pozivaoci rutiraju po `model.id` |
| **Proxy kompatibilan s OpenAI** | Lokalni HTTP proxy na `:18100`; svaki OpenAI/Anthropic-kompatibilni klijent radi odmah |
| **Auth putem API ključa (opcionalno)** | Postavite fiksni ključ u proxy za potrošnju; pozivaoci moraju slati `Authorization: Bearer <key>` |
| **22 jezika** | Bosanski po defaultu; podržan RTL arapski |
| **Svijetla default tema** | Prebacivanje na tamnu / praćenje OS-a |

---

## Snimci ekrana

Početna, Modeli, Novčanik, Dnevnik, Postavke — ukupno pet pogleda. Snimci u punoj rezoluciji su u [docs/image/](../docs/image/).

---

## Arhitektura

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
│              ├─ registry    (zvanični API + fallback cache)    │
│              ├─ p2p         (libp2p daemon)                    │
│              ├─ provisioner (multi-provider ruter)            │
│              ├─ proxy-server (HTTP kompatibilan s OpenAI)     │
│              ├─ upstream    (stvarni pozivi providera)        │
│              ├─ wallet      (računanje MBP rezultata)          │
│              └─ models      (agregator kataloga)              │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   P2P mreža       │
              └──────────────────┘
```

```bash
# Objava čvora v2 — vidi sljedeću sekciju
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Lokalni proxy za potrošnju
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Decentralni dizajn

Četiri seed peer-ID-ja su ugrađena u binarni fajl (`src/main/config/trusted-roots.ts`). Tok cold starta:

1. Lokalni cache je prazan pri prvom pokretanju
2. Paralelno pribavljanje: zvanični HTTPS endpoint + konfigurisani `bootstrapMultiaddrs` + mDNS
3. Validacija svakog peerId-a prema `TRUSTED_ROOT_PEER_IDS`
4. Čuvanje validiranog podskupa u `<userData>/bootstrap-cache.json`
5. P2P daemon kreće; cache pogodaci ostaju u P2P načinu; promašaji ponovo pokušavaju zvanični endpoint svakog sata

```
4 hardkodirana korijena  ←  sidra povjerenja
└─ iz cache-a zvaničnog endpoint-a
   ├─ direktna veza preko bootstrapMultiaddrs
   ├─ mDNS (otkrivanje u LAN-u)
   └─ libp2p DHT findProviders (čisti P2P)
```

Zvanični endpoint ostaje **zauvijek** kao kanal za spas, čak i kada je P2P mreža zdrava.

---

## Format objave čvora (v2)

Zahtjev: `<https://modelbus.cc/api/v1/nodes>` vraća `Array<NodeAnnouncement>`:

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

Polja:

- **version** `2`: verzija šeme; +1 pri lomljivim promjenama
- **peerId**: libp2p PeerId, globalno jedinstven
- **nickname**: čitljivo ime
- **providers[]**: LLM provideri koje ovaj čvor hosta
  - **providerId**: id providera u models.dev
  - **providerName**: prikazano ime
  - **models[]**: modeli pod ovim providerom; svaki ima `id` (kanonski) i `name` (prikaz)
- **addr**: jedinstvena glavna dostupna adresa (jednina)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: Unix ms posljednjeg osvježavanja
- **expiresAt**: mekani TTL; istekli unosi su i dalje upotrebljivi ali s manjom težinom

Posljednja 4 unosa u `mock/nodes.json` su pouzdani seed čvorovi; njihovi peerId se poklapaju s `trusted-roots.ts`.

---

## Tok zahtjeva

**Provision** (vi = vlasnik Tokena): Postavke → Dijeljenje Tokena → odaberite providera, zalijepite API ključ, označite modele → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (vi = potrošač Tokena): odaberite pouzdani čvor u kartici Modeli → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → stiže HTTP POST → izvucite `body.model` → pozovite čvor → napišite `InferenceRequest` (JSON + prefiks dužine) → čekajte `InferenceResponse` → napišite HTTP odgovor.

**Rutiranje zahtjeva** (na pozvanom čvoru `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ poklapanje: konfiguracija providera openai
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ stvarni poziv, vraćanje odgovora
  └─ bez poklapanja: 400 + { error: "model X is not hosted by this peer" }
```

---

## Preuzimanje i korištenje (uskoro)

> 📦 Zvanični instalateri (paketi za Windows / macOS / Linux, a kasnije mobilni i Web SDK) su u pripremi.

**Da ga odmah koristite: izgradite iz izvornog koda**

```bash
pnpm install
pnpm run dev          # razvojni način (Electron + Vite HMR)
pnpm run package:mac  # dmg za macOS
pnpm run package:win  # nsis za Windows
pnpm run package:linux # AppImage za Linux
```

Artefakti završavaju u `release/`.

**Kanali distribucije (planirani)**: zvanična stranica za preuzimanje · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Zvanični domen ostaje trajni endpoint za spas.

---

## Brzi start

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

Pri prvom pokretanju aplikacija po defaultu pokazuje na `mock/nodes.json`, pa cijeli tok radi bez mreže. Detalji u glavnom [README.md](../README.md) i mapi [docs/](../docs/).

---

## Mapa puta

- ✅ v1: multi-provider, zvanični cold start, sidra povjerenja, P2P prosljeđivanje, 22 jezika, kostur Novčanika
- 🔜 v2: lanac povjerenja (trustChain) — knjiga pozivnica potpisana Ed25519
- 🔜 v3: ocjena kvalitete čvora na osnovu stvarnih mjera (kašnjenje, stopa grešaka, radno vrijeme)
- 🔜 v4: krug token-ekonomije — MBP vodi prioritetno rutiranje, ubrzanje cold starta i otkrivanje čvorova
- 🔜 v5: mobilni čvorovi
- 🔜 v6: Web SDK — `<modelbus>` u pregledniku

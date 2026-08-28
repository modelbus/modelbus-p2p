<!-- auto-generated README for pl-PL; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : Zdecentralizowana platforma udostępniania tokenów LLM
</h1>
<p align="center" style="font-weight: bold;">
  Prawdopodobnie pierwsza na świecie platforma, na której każdy może podłączyć swój Token do sieci P2P i w zamian korzystać z Tokenów udostępnianych przez inne węzły. Bez centralnego serwera, bez rejestracji konta, żaden klucz API nigdy nie opuszcza Twojej maszyny.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P jest wciąż w fazie rozwoju i publicznych testów.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.en-US.md) · [简体中文](../README.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## Spis treści

- [Co to jest](#what)
- [Główne funkcje](#features)
- [Zrzuty ekranu](#screenshots)
- [Architektura](#architecture)
- [Projekt zdecentralizowany](#decentralised)
- [Format ogłoszenia węzła (v2)](#schema)
- [Przebieg zapytania](#flow)
- [Pobierz i używaj (wkrótce)](#download)
- [Szybki start](#quickstart)
- [Mapa drogowa](#roadmap)

---

## Co to jest <a id="what"></a>

ModelBus-P2P to klient desktopowy oparty na [js-libp2p](https://github.com/libp2p/js-libp2p) i Electronie. Rozwiązuje problem, który ma niemal każdy: **w tym miesiącu nadmiar, w następnym brak.**

> Scenariusz: płacisz za OpenAI lub Claude i rzadko wykorzystujesz miesięczny limit. Zamiast pozwolić mu wygasnąć, podłącz go do sieci P2P. Każde zapytanie przechodzące przez Twój węzeł jest przeliczane na **tokeny MBP** (minuty online × 0,05 + liczba udostępnionych Tokenów × 2 + obsłużone zapytania × 0,1 + szybkość odpowiedzi × 0,5). Gdy w następnym miesiącu zabraknie Ci limitu, wydajesz te MBP, aby wywołać Tokeny udostępniane przez inne węzły. W żadnym momencie nie pośredniczy serwer centralny, a Twój klucz API pozostaje na Twojej maszynie.

- **Provision / Share**: zarejestruj klucz API swojej subskrypcji i modele, które chcesz udostępniać. Sieć poznaje Twój peerId.
- **Consume / Drive**: uruchom lokalny, zgodny z OpenAI proxy HTTP pod `http://127.0.0.1:18100`; wskaż na niego dowolny kompatybilny klient; zapytania są przekazywane przez P2P do węzła, który faktycznie przechowuje Token.
- **Wallet**: każde udostępnienie lub wywołanie gromadzi tokeny MBP. Zakładka Strona główna i strona Wallet pokazują saldo, rozbicie i wzór w czasie rzeczywistym. MBP jest obecnie tylko księgowe; przyszłe wersje wykorzystają go do reputacji, zachęt i priorytetowego routingu.
- **Bez onboardingu**: pierwsze uruchomienie pobiera węzły nasienne z oficjalnego punktu końcowego (lub lokalnego mocka), a następnie działa w pełni w trybie P2P.

---

## Główne funkcje <a id="features"></a>

| Funkcja | Uwagi |
|---|---|
| **Transport P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Zdecentralizowane zaufanie** | 4 zakodowane na stałe ID węzłów nasiennych jako kotwice zaufania; nowe węzły dołączają przez łańcuch zaufania (kolejny kamień milowy) |
| **Zapasowy cold-start** | Pierwsze uruchomienie pobiera węzły z oficjalnego punktu HTTPS lub lokalnego mocka; całość trafia do `<userData>/bootstrap-cache.json` |
| **Routing multi-provider** | Jeden węzeł może hostować OpenAI + Anthropic + Google jednocześnie; wywołujący routują po `model.id` |
| **Proxy zgodne z OpenAI** | Lokalny proxy HTTP na `:18100`; każdy klient zgodny z OpenAI/Anthropic działa od razu |
| **Uwierzytelnianie kluczem API (opcjonalnie)** | Ustaw stały klucz w proxy konsumpcji; wywołujący muszą wysłać `Authorization: Bearer <key>` |
| **22 języki** | Polski domyślnie; obsługiwane arabskie RTL |
| **Jasny motyw domyślny** | Przełącz na ciemny / podążaj za OS |

---

## Zrzuty ekranu <a id="screenshots"></a>

<p align="center"><img src="../docs/image/home.png" alt="Home / 首页" width="640"/></p>

<p align="center"><img src="../docs/image/model.png" alt="Models / 模型" width="640"/></p>

<p align="center"><img src="../docs/image/wallet.png" alt="Wallet / 钱包" width="640"/></p>

<p align="center"><img src="../docs/image/log.png" alt="Logs / 日志" width="640"/></p>

<p align="center"><img src="../docs/image/setting.png" alt="Settings / 设置" width="640"/></p>


---

## Architektura <a id="architecture"></a>

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
│              ├─ registry    (oficjalne API + fallback cache)   │
│              ├─ p2p         (demon libp2p)                     │
│              ├─ provisioner (router multi-provider)           │
│              ├─ proxy-server (HTTP zgodne z OpenAI)           │
│              ├─ upstream    (realne wywołania API)            │
│              ├─ wallet      (obliczanie wyniku MBP)            │
│              └─ models      (agregator katalogu)               │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   Sieć P2P        │
              └──────────────────┘
```

```bash
# Ogłoszenie węzła v2 — patrz następna sekcja
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Lokalny proxy konsumpcji
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Projekt zdecentralizowany <a id="decentralised"></a>

Cztery ID węzłów nasiennych są wbudowane w plik binarny (`src/main/config/trusted-roots.ts`). Przebieg cold-startu:

1. Lokalna pamięć podręczna jest pusta przy pierwszym uruchomieniu
2. Równoległe pobieranie: oficjalny punkt HTTPS + skonfigurowane `bootstrapMultiaddrs` + mDNS
3. Weryfikacja każdego peerId względem `TRUSTED_ROOT_PEER_IDS`
4. Zapis zweryfikowanego podzbioru w `<userData>/bootstrap-cache.json`
5. Demon P2P startuje; trafienia z cache pozostają w trybie P2P; niepowodzenia ponawiają oficjalny punkt co godzinę

```
4 zakodowane korzenie  ←  kotwice zaufania
└─ z cache z oficjalnego punktu
   ├─ bezpośrednie połączenie przez bootstrapMultiaddrs
   ├─ mDNS (wykrywanie w LAN)
   └─ libp2p DHT findProviders (czysty P2P)
```

Oficjalny punkt końcowy jest zachowany **na zawsze** jako kanał ratunkowy, nawet gdy sieć P2P działa.

---

## Format ogłoszenia węzła (v2) <a id="schema"></a>

Żądanie: `<https://modelbus.cc/api/v1/nodes>` zwraca `Array<NodeAnnouncement>`:

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

Pola:

- **version** `2`: wersja schematu; +1 przy zmianach łamiących
- **peerId**: libp2p PeerId, globalnie unikalny
- **nickname**: nazwa czytelna dla człowieka
- **providers[]**: dostawcy LLM hostowani przez ten węzeł
  - **providerId**: id dostawcy w models.dev
  - **providerName**: nazwa wyświetlana
  - **models[]**: modele w ramach tego dostawcy; każdy ma `id` (kanoniczne) i `name` (wyświetlane)
- **addr**: pojedynczy główny adres (liczba pojedyncza)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: Unix ms ostatniej aktualizacji
- **expiresAt**: miękki TTL; wygasłe wpisy wciąż użyteczne, ale o niższej wadze

Ostatnie 4 wpisy w `mock/nodes.json` to zaufane węzły nasienne; ich peerId odpowiadają `trusted-roots.ts`.

---

## Przebieg zapytania <a id="flow"></a>

**Provision** (Ty = posiadacz Tokenu): Ustawienia → Udostępnij Token → wybierz dostawcę, wklej klucz API, zaznacz modele → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (Ty = konsument Tokenu): wybierz zaufany węzeł w zakładce Modele → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → przychodzi POST HTTP → wyciągnij `body.model` → wybierz węzeł → zapisz `InferenceRequest` (JSON + prefiks długości) → czekaj na `InferenceResponse` → zapisz odpowiedź HTTP.

**Routing zapytania** (po stronie wywoływanego `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ trafienie: konfiguracja dostawcy openai
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ realne wywołanie, zwraca odpowiedź
  └─ brak trafienia: 400 + { error: "model X is not hosted by this peer" }
```

---

## Pobierz i używaj (wkrótce) <a id="download"></a>

> 📦 Oficjalne instalatory (pakiety Windows / macOS / Linux, a później mobilne i Web SDK) są obecnie przygotowywane.

**Aby użyć teraz: zbuduj ze źródeł**

```bash
pnpm install
pnpm run dev          # tryb deweloperski (Electron + Vite HMR)
pnpm run package:mac  # dmg dla macOS
pnpm run package:win  # nsis dla Windows
pnpm run package:linux # AppImage dla Linux
```

Artefakty lądują w `release/`.

**Kanały dystrybucji (planowane)**: oficjalna strona pobierania · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Oficjalna domena pozostaje trwałym punktem ratunkowym.

---

## Szybki start <a id="quickstart"></a>

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

Przy pierwszym uruchomieniu aplikacja domyślnie wskazuje `mock/nodes.json`, więc cały przepływ działa bez sieci. Szczegóły w głównym [README.md](../README.md) i katalogu [docs/](../docs/).

---

## Mapa drogowa <a id="roadmap"></a>

- ✅ v1: multi-provider, oficjalny cold-start, kotwice zaufania, przekazywanie P2P, 22 języki, szkielet Wallet
- 🔜 v2: łańcuch zaufania (trustChain) — księga zaproszeń podpisana Ed25519
- 🔜 v3: ocena jakości węzła na podstawie rzeczywistych metryk (opóźnienie, błędy, uptime)
- 🔜 v4: pętla gospodarki tokenowej — MBP napędza priorytetowy routing, boost cold-startu i odkrywanie węzłów
- 🔜 v5: mobilne węzły
- 🔜 v6: SDK web — `<modelbus>` w przeglądarce

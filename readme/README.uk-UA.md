<!-- auto-generated README for uk-UA; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : Децентралізована платформа обміну токенами LLM
</h1>
<p align="center" style="font-weight: bold;">
  Можливо, перша у світі платформа, де кожен може під'єднати свій токен до P2P-мережі й натомість використовувати токени, які поширюють інші піри. Без центрального сервера, без реєстрації акаунта, жоден API-ключ ніколи не залишає вашу машину.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P все ще в розробці та публічному тестуванні.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.en-US.md) · [简体中文](../README.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## Зміст

- [Що це таке](#what)
- [Основні можливості](#features)
- [Скріншоти](#screenshots)
- [Архітектура](#architecture)
- [Децентралізований дизайн](#decentralised)
- [Формат оголошення вузла (v2)](#schema)
- [Потік запиту](#flow)
- [Завантаження та використання (скоро)](#download)
- [Швидкий старт](#quickstart)
- [Дорожня карта](#roadmap)

---

## Що це таке <a id="what"></a>

ModelBus-P2P — це настільний клієнт на базі [js-libp2p](https://github.com/libp2p/js-libp2p) та Electron. Він вирішує проблему, знайому майже кожному: **цього місяця залишається, наступного не вистачає.**

> Сценарій: ви платите за OpenAI або Claude і рідко вичерпуєте місячний ліміт. Замість того щоб дати йому згаснути, під'єднайте його до P2P-мережі. Кожен запит, що проходить через ваш вузол, перетворюється на **токени MBP** (хвилини онлайн × 0,05 + кількість розданих токенів × 2 + обслужені запити × 0,1 + швидкість відповіді × 0,5). Коли наступного місяця ліміт закінчується, ви витрачаєте ці MBP, щоб викликати токени, які діляться інші піри. Жоден центральний сервер не втручається, і ваш API-ключ залишається на вашій машині.

- **Provision / Share**: зареєструйте API-ключ вашої підписки та моделі, якими хочете поділитися. Мережа дізнається ваш peerId.
- **Consume / Drive**: підніміть локальний сумісний з OpenAI HTTP-проксі на `http://127.0.0.1:18100`; спрямуйте на нього будь-який сумісний клієнт; запити пересилаються через P2P піру, який фактично зберігає токен.
- **Wallet**: кожне надання або виклик накопичує токени MBP. Вкладка Головна та сторінка Wallet показують баланс, розбивку та формулу в реальному часі. Зараз MBP — це лише облік; майбутні версії використають його для репутації, заохочень і пріоритетної маршрутизації.
- **Без онбордингу**: перший запуск отримує вузли-сиди з офіційного ендпоінта (або локального mock), після чого повністю працює в режимі P2P.

---

## Основні можливості <a id="features"></a>

| Функція | Примітки |
|---|---|
| **P2P-транспорт** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Децентралізована довіра** | 4 зашитих ID вузлів-сидів як якорі довіри; нові піри входять через ланцюг довіри (наступна віха) |
| **Холодний старт** | Перший запуск отримує вузли з офіційного HTTPS-ендпоінта або локального mock; усе потрапляє до `<userData>/bootstrap-cache.json` |
| **Мульти-провайдер маршрутизація** | Один пір може хостити OpenAI + Anthropic + Google одночасно; викликачі маршрутизують за `model.id` |
| **Проксі, сумісний з OpenAI** | Локальний HTTP-проксі на `:18100`; будь-який сумісний з OpenAI/Anthropic клієнт працює одразу |
| **Auth за API-ключем (опціонально)** | Зафіксуйте ключ у проксі споживання; викликачі повинні надсилати `Authorization: Bearer <key>` |
| **22 мови** | Українська за замовчуванням; підтримка арабської RTL |
| **Світла тема за замовчуванням** | Перемикання на темну / слідувати ОС |

---

## Скріншоти <a id="screenshots"></a>

<p align="center"><img src="../docs/image/home.png" alt="Home / 首页" width="640"/></p>

<p align="center"><img src="../docs/image/model.png" alt="Models / 模型" width="640"/></p>

<p align="center"><img src="../docs/image/wallet.png" alt="Wallet / 钱包" width="640"/></p>

<p align="center"><img src="../docs/image/log.png" alt="Logs / 日志" width="640"/></p>

<p align="center"><img src="../docs/image/setting.png" alt="Settings / 设置" width="640"/></p>


---

## Архітектура <a id="architecture"></a>

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
│              ├─ providers   (кэш models.dev)                   │
│              ├─ registry    (офіційний API + фолбек кешу)      │
│              ├─ p2p         (демон libp2p)                     │
│              ├─ provisioner (мульти-провайдер маршрутизатор)   │
│              ├─ proxy-server (HTTP сумісний з OpenAI)          │
│              ├─ upstream    (реальні виклики API)              │
│              ├─ wallet      (розрахунок MBP)                   │
│              └─ models      (агрегатор каталогу)               │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   P2P-мережа      │
              └──────────────────┘
```

```bash
# Оголошення вузла v2 — див. наступний розділ
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Локальний проксі споживання
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Децентралізований дизайн <a id="decentralised"></a>

Чотири ID вузлів-сидів вшиті в бінарник (`src/main/config/trusted-roots.ts`). Потік холодного старту:

1. Локальний кеш порожній при першому запуску
2. Паралельне отримання: офіційний HTTPS-ендпоінт + налаштовані `bootstrapMultiaddrs` + mDNS
3. Перевірка кожного peerId за `TRUSTED_ROOT_PEER_IDS`
4. Збереження перевіреної підмножини в `<userData>/bootstrap-cache.json`
5. Демон P2P стартує; влучання в кеш залишаються в режимі P2P; промахи повторюють офіційний ендпоінт щогодини

```
4 зашитих корені  ←  якорі довіри
└─ у кеші з офіційного ендпоінта
   ├─ пряме підключення через bootstrapMultiaddrs
   ├─ mDNS (виявлення в LAN)
   └─ libp2p DHT findProviders (чистий P2P)
```

Офіційний ендпоінт зберігається **назавжди** як канал порятунку, навіть коли P2P-мережа здорова.

---

## Формат оголошення вузла (v2) <a id="schema"></a>

Запит: `<https://modelbus.cc/api/v1/nodes>` повертає `Array<NodeAnnouncement>`:

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

Поля:

- **version** `2`: версія схеми; +1 при сумісних зламах
- **peerId**: libp2p PeerId, глобально унікальний
- **nickname**: зрозуміле ім'я
- **providers[]**: LLM-провайдери, які хостить цей пір
  - **providerId**: id провайдера в models.dev
  - **providerName**: відображуване ім'я
  - **models[]**: моделі під цим провайдером; кожна має `id` (канонічний) і `name` (відображуваний)
- **addr**: єдина основна адреса (однина)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: Unix-мс останнього оновлення
- **expiresAt**: м'який TTL; застарілі записи все ще придатні, але з меншою вагою

Останні 4 записи в `mock/nodes.json` — довірені вузли-сиди; їхні peerId збігаються з `trusted-roots.ts`.

---

## Потік запиту <a id="flow"></a>

**Provision** (ви = власник токена): Налаштування → Поділитися токеном → виберіть провайдера, вставте API-ключ, позначте моделі → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (ви = споживач токена): виберіть довірений пір на вкладці Моделі → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → надходить POST HTTP → витягніть `body.model` → наберіть пір → запишіть `InferenceRequest` (JSON + префікс довжини) → блокуюче чекайте `InferenceResponse` → запишіть HTTP-відповідь.

**Маршрутизація запиту** (на викликаному пірі `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ збіг: конфігурація провайдера openai
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ реальний виклик, повернути відповідь
  └─ немає збігу: 400 + { error: "model X is not hosted by this peer" }
```

---

## Завантаження та використання (скоро) <a id="download"></a>

> 📦 Офіційні інсталятори (пакети Windows / macOS / Linux, а пізніше мобільний і Web SDK) зараз готуються.

**Щоб скористатися зараз: зберіть із джерел**

```bash
pnpm install
pnpm run dev          # режим розробки (Electron + Vite HMR)
pnpm run package:mac  # dmg для macOS
pnpm run package:win  # nsis для Windows
pnpm run package:linux # AppImage для Linux
```

Артефакти потрапляють у `release/`.

**Канали поширення (заплановані)**: офіційна сторінка завантаження · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Офіційний домен залишається рятувальним ендпоінтом назавжди.

---

## Швидкий старт <a id="quickstart"></a>

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

При першому запуску застосунок за замовчуванням вказує на `mock/nodes.json`, тож увесь потік працює без мережі. Деталі в головному [README.md](../README.md) та папці [docs/](../docs/).

---

## Дорожня карта <a id="roadmap"></a>

- ✅ v1: мульти-провайдер, офіційний холодний старт, якорі довіри, P2P-пересилка, 22 мови, каркас гаманця
- 🔜 v2: ланцюг довіри (trustChain) — реєстр запрошень із підписом Ed25519
- 🔜 v3: оцінка якості вузла за реальними метриками (затримка, помилки, час роботи)
- 🔜 v4: цикл токен-економіки — MBP веде пріоритетну маршрутизацію, буст холодного старту та виявлення вузлів
- 🔜 v5: мобільні піри
- 🔜 v6: веб-SDK — `<modelbus>` у браузері

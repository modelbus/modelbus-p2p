<!-- auto-generated README for ru-RU; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : Децентрализованная платформа обмена токенами LLM
</h1>
<p align="center" style="font-weight: bold;">
  Возможно, первая в мире платформа, где каждый может подключить свой токен к P2P-сети и взамен использовать токены, которыми делятся другие пиры. Без центрального сервера, без регистрации аккаунта, ни один API-ключ никогда не покинет вашу машину.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P всё ещё в разработке и публичном тестировании.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## Содержание

- [Что это такое](#-)
- [Основные возможности](#-)
- [Скриншоты](#)
- [Архитектура](#)
- [Децентрализованный дизайн](#-)
- [Формат объявления узла (v2)](#-v2)
- [Поток запроса](#-)
- [Загрузка и использование (скоро)](#-)
- [Быстрый старт](#-)
- [Дорожная карта](#-)

---

## Что это такое

ModelBus-P2P — это настольный клиент на базе [js-libp2p](https://github.com/libp2p/js-libp2p) и Electron. Он решает проблему, знакомую почти каждому: **в этом месяце остаётся, в следующем не хватает.**

> Сценарий: вы платите за OpenAI или Claude и редко сжигаете весь месячный лимит. Вместо того чтобы дать ему истечь, подключите его к P2P-сети. Каждый запрос, прошедший через ваш узел, конвертируется в **токены MBP** (минуты онлайн × 0,05 + количество расшаренных токенов × 2 + обслуженные запросы × 0,1 + скорость ответа × 0,5). Когда следующий месяц и лимит на исходе, вы тратите эти MBP, чтобы вызвать токены других пиров. Никогда не вмешивается центральный сервер, и ваш API-ключ остаётся на вашей машине.

- **Provision / Share**: зарегистрируйте API-ключ вашей подписки и модели, которыми хотите поделиться. Сеть узнаёт ваш peerId.
- **Consume / Drive**: поднимите локальный совместимый с OpenAI HTTP-прокси на `http://127.0.0.1:18100`; укажите на него любой совместимый клиент; запросы пересылаются через P2P пиру, который фактически хранит токен.
- **Wallet**: каждое предоставление или вызов накапливает токены MBP. Вкладка Главная и страница Wallet показывают баланс, разбивку и формулу в реальном времени. Сейчас MBP — это только учёт; будущие версии используют его для репутации, поощрений и приоритетной маршрутизации.
- **Без онбординга**: первый запуск получает узлы-сиды с официального эндпоинта (или локального mock), после чего полностью работает в режиме P2P.

---

## Основные возможности

| Функция | Примечания |
|---|---|
| **P2P-транспорт** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Децентрализованное доверие** | 4 зашитых узла-сида как якоря доверия; новые пиры входят через цепочку доверия (следующая веха) |
| **Холодный старт** | Первый запуск получает узлы с официального HTTPS-эндпоинта или локального mock; всё попадает в `<userData>/bootstrap-cache.json` |
| **Мульти-провайдер маршрутизация** | Один пир может хостить OpenAI + Anthropic + Google одновременно; вызывающие маршрутизируют по `model.id` |
| **Прокси, совместимый с OpenAI** | Локальный HTTP-прокси на `:18100`; любой совместимый с OpenAI/Anthropic клиент работает из коробки |
| **Auth по API-ключу (опционально)** | Зафиксируйте ключ в прокси потребления; вызывающие должны слать `Authorization: Bearer <key>` |
| **22 языка** | Русский по умолчанию; поддержка арабского RTL |
| **Светлая тема по умолчанию** | Переключение на тёмную / следовать ОС |

---

## Скриншоты

Главная, Модели, Кошелёк, Журналы, Настройки — всего пять видов. Скриншоты в полном разрешении в [docs/image/](../docs/image/).

---

## Архитектура

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
│              ├─ registry    (официальный API + фолбэк кэша)     │
│              ├─ p2p         (демон libp2p)                     │
│              ├─ provisioner (мульти-провайдер маршрутизатор)   │
│              ├─ proxy-server (HTTP совместимый с OpenAI)       │
│              ├─ upstream    (реальные вызовы API)              │
│              ├─ wallet      (расчёт балла MBP)                 │
│              └─ models      (агрегатор каталога)               │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   P2P-сеть        │
              └──────────────────┘
```

```bash
# Объявление узла v2 — см. следующий раздел
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Локальный прокси потребления
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Децентрализованный дизайн

Четыре ID узлов-сидов вшиты в бинарник (`src/main/config/trusted-roots.ts`). Поток холодного старта:

1. Локальный кэш пуст при первом запуске
2. Параллельное получение: официальный HTTPS-эндпоинт + настроенные `bootstrapMultiaddrs` + mDNS
3. Проверка каждого peerId по `TRUSTED_ROOT_PEER_IDS`
4. Сохранение проверенного подмножества в `<userData>/bootstrap-cache.json`
5. Демон P2P стартует; попадания в кэш остаются в P2P-режиме; промахи повторяют официальный эндпоинт каждый час

```
4 зашитых корня  ←  якоря доверия
└─ в кэше с официального эндпоинта
   ├─ прямое подключение через bootstrapMultiaddrs
   ├─ mDNS (обнаружение в LAN)
   └─ libp2p DHT findProviders (чистый P2P)
```

Официальный эндпоинт сохраняется **навсегда** как канал спасения, даже когда P2P-сеть здорова.

---

## Формат объявления узла (v2)

Запрос: `<https://modelbus.cc/api/v1/nodes>` возвращает `Array<NodeAnnouncement>`:

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

- **version** `2`: версия схемы; +1 при ломающих изменениях
- **peerId**: libp2p PeerId, глобально уникальный
- **nickname**: читаемое имя
- **providers[]**: LLM-провайдеры, которые хостит этот пир
  - **providerId**: id провайдера в models.dev
  - **providerName**: отображаемое имя
  - **models[]**: модели у этого провайдера; каждая имеет `id` (канонический) и `name` (отображаемый)
- **addr**: единственный основной адрес (единственное число)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: Unix-мс последнего обновления
- **expiresAt**: мягкий TTL; устаревшие записи всё ещё применимы, но с меньшим весом

Последние 4 записи в `mock/nodes.json` — доверенные узлы-сиды; их peerId совпадают с `trusted-roots.ts`.

---

## Поток запроса

**Provision** (вы = держатель токена): Настройки → Поделиться Token → выберите провайдера, вставьте API-ключ, отметьте модели → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (вы = потребитель токена): выберите доверенный пир на вкладке Модели → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → приходит POST HTTP → извлечь `body.model` → набрать пир → записать `InferenceRequest` (JSON + префикс длины) → блокирующе дождаться `InferenceResponse` → записать HTTP-ответ.

**Маршрутизация запроса** (на вызываемом пире `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ совпадение: конфигурация провайдера openai
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ реальный вызов, вернуть ответ
  └─ нет совпадения: 400 + { error: "model X is not hosted by this peer" }
```

---

## Загрузка и использование (скоро)

> 📦 Официальные установщики (пакеты Windows / macOS / Linux, а позже мобильный и Web SDK) сейчас готовятся.

**Чтобы использовать сейчас: соберите из исходников**

```bash
pnpm install
pnpm run dev          # режим разработки (Electron + Vite HMR)
pnpm run package:mac  # dmg для macOS
pnpm run package:win  # nsis для Windows
pnpm run package:linux # AppImage для Linux
```

Артефакты попадают в `release/`.

**Каналы распространения (планируемые)**: официальная страница загрузки · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Официальный домен остаётся пожизненным спасательным эндпоинтом.

---

## Быстрый старт

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

При первом запуске приложение по умолчанию указывает на `mock/nodes.json`, поэтому весь поток работает без сети. Подробнее в главном [README.md](../README.md) и каталоге [docs/](../docs/).

---

## Дорожная карта

- ✅ v1: мульти-провайдер, официальный холодный старт, якоря доверия, P2P-пересылка, 22 языка, каркас кошелька
- 🔜 v2: цепочка доверия (trustChain) — реестр приглашений, подписанный Ed25519
- 🔜 v3: оценка качества узла по реальным метрикам (задержка, ошибки, аптайм)
- 🔜 v4: цикл токен-экономики — MBP ведёт приоритетную маршрутизацию, буст холодного старта и обнаружение узлов
- 🔜 v5: мобильные пиры
- 🔜 v6: веб-SDK — `<modelbus>` в браузере

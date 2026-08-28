// Generates per-locale README files under ./readme/.
//
// Every per-locale README is fully native-language-authored (no
// Chinese copy-paste with translation overlays). The body of every
// section is written natively for each locale; tables, ASCII art
// and code blocks are translated line by line.
//
// Run from the repo root:
//   node scripts/gen-readme-i18n.mjs

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const HEADER_BADGES = '[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)';

// Build the single-line language picker from each locale's table row.
// `selfLang` is excluded (the file we're writing); `selfHref` points
// back at the per-locale file under readme/.
function languageLinks(selfLang, selfHref) {
  // Canonical hrefs as seen from the repo root.
  const ROWS = [
    ['English',         'README.md',              'en-US'],
    ['简体中文',         'readme/README.zh-CN.md', 'zh-CN'],
    ['繁體中文',         'readme/README.zh-TW.md', 'zh-TW'],
    ['日本語',           'readme/README.ja-JP.md', 'ja-JP'],
    ['한국어',           'readme/README.ko-KR.md', 'ko-KR'],
    ['Deutsch',         'readme/README.de-DE.md', 'de-DE'],
    ['Español',         'readme/README.es-ES.md', 'es-ES'],
    ['Français',        'readme/README.fr-FR.md', 'fr-FR'],
    ['Italiano',        'readme/README.it-IT.md', 'it-IT'],
    ['Dansk',           'readme/README.da-DK.md', 'da-DK'],
    ['Polski',          'readme/README.pl-PL.md', 'pl-PL'],
    ['Русский',          'readme/README.ru-RU.md', 'ru-RU'],
    ['Bosanski',        'readme/README.bs-BA.md', 'bs-BA'],
    ['العربية',           'readme/README.ar-SA.md', 'ar-SA'],
    ['Norsk',           'readme/README.nb-NO.md', 'nb-NO'],
    ['Português (Brasil)', 'readme/README.pt-BR.md', 'pt-BR'],
    ['ไทย',              'readme/README.th-TH.md', 'th-TH'],
    ['Türkçe',          'readme/README.tr-TR.md', 'tr-TR'],
    ['Українська',      'readme/README.uk-UA.md', 'uk-UA'],
    ['বাংলা',            'readme/README.bn-BD.md', 'bn-BD'],
    ['Ελληνικά',        'readme/README.el-GR.md', 'el-GR'],
    ['Tiếng Việt',      'readme/README.vi-VN.md', 'vi-VN'],
  ];

  // Convert a repo-root href into a proper relative link for the file
  // being generated. Files inside ./readme/ reference siblings without
  // the readme/ prefix; README.md at the repo root uses the full path.
  const inReadme = selfHref.startsWith('readme/');
  return ROWS
    .filter(([, , id]) => id !== selfLang)
    .map(([label, href]) => {
      const rel = inReadme ? href.replace(/^readme\//, '') : href;
      return `[${label}](${rel})`;
    })
    .join(' · ');
}

// Render the fixed top section (logo, title, tagline, status, badges,
// language picker). `titleTagline` is the bolded one-liner under the
// title; `statusSentence` is the single-sentence status banner.
function topBlock({ logoAlt, titleLine, tagline, statusSentence, langLinks, headerLine }) {
  return `<p align="center">
  <img src="../docs/image/logo.png" alt="${logoAlt}" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ${titleLine}
</h1>
<p align="center" style="font-weight: bold;">
  ${tagline}
</p>

<p align="center">
  ⚠️ <strong>${statusSentence}</strong>
</p>

<div align="center">

${HEADER_BADGES}

${headerLine}

${langLinks}

</div>

---

`;
}

// ---------- per-locale content ----------
//
// Each entry below contains only the strings the file actually needs.
// The body of every section is written natively in that locale —
// no Chinese scaffolding under the translations. Tables, code
// fences and ASCII diagrams are translated line by line.

const LOCALES = {
  'zh-CN': {
    logoAlt: 'ModelBus',
    titleLine: 'ModelBus-P2P : 一个去中心化的 LLM Token 共享平台',
    tagline: '或许是全球首个，任何人都可以把自己的 Token 挂上 P2P 网络，也可以因此调用网络上更多其他节点共享的 Token。无需中心服务器、无需注册账号、不会丢失任何 API Key。',
    statusSentence: 'ModelBus-P2P 仍处于开发与公开测试阶段。',
    sections: {
      toc: '## 目录',
      what: '## 这是什么',
      features: '## 核心特性',
      screenshots: '## 界面一览',
      architecture: '## 架构总览',
      decentralised: '## 去中心化设计',
      schema: '## 节点公告格式（v2）',
      flow: '## 调用流程详解',
      download: '## 下载使用（即将开通）',
      quickstart: '## 快速开始',
      roadmap: '## 路线图',
    },
    body: {
      what: `ModelBus-P2P 是一个基于 [js-libp2p](https://github.com/libp2p/js-libp2p) + Electron 的桌面客户端。它解决的是一个非常普遍的问题：**这个月我用不完，下个月我又不够用**。

> 场景：你订阅了 OpenAI 或 Claude，本月额度没用完。与其让它月底清零，不如把它挂上 P2P 网络，本月用出去的每一笔请求都会按规则折算成 **MBP 积分**（在线时长 × 0.05 + 共享 Token 数 × 2 + 服务请求数 × 0.1 + 响应速度 × 0.5）。下个月当你的订阅不够用时，你可以用积分去调用其他节点共享的 Token。整个过程不经过任何中心服务器，API Key 始终留在你自己的机器上。

- **上线（Provision / Share）**：把你订阅的 API Key + 想共享的模型挂到 P2P 网络，告诉大家你的 peerId。
- **调用（Consume / Drive）**：在本机启一个 OpenAI 兼容的 HTTP 代理，配置 \`http://127.0.0.1:18100\` 作为 base_url，所有请求都会经 P2P 转发到真实持有 Token 的节点去执行。
- **钱包（Wallet）**：每次共享 / 调用都按规则折算为 MBP 积分；首页和「钱包」页实时展示余额、积分构成与公式。
- **不需要任何人审批**：首次启动通过官方 endpoint（或本地 mock）拿到种子节点，之后完全 P2P 运行。`,

      features: `| 特性 | 说明 |
|---|---|
| **P2P 传输栈** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT 穿透 + Kademlia DHT + AutoNAT |
| **去中心化信任** | 4 个硬编码的种子节点作为信任根；新节点通过信任链（下一阶段）扩展网络 |
| **冷启动保底** | 首次启动从官方 HTTPS endpoint（或本地 mock）获取节点；之后所有内容在 \`<userData>/bootstrap-cache.json\` 中缓存 |
| **多 Provider 路由** | 同一个节点可同时挂 OpenAI + Anthropic + Google 的 Key；调用方按 \`model.id\` 自动路由 |
| **OpenAI 兼容代理** | 消费端本地启 OpenAI 兼容的 HTTP 代理（默认 \`:18100\`），任何 OpenAI / Anthropic 兼容客户端都能直连 |
| **API Key 鉴权（可选）** | 消费端可设置固定 API Key；调用方需在 \`Authorization: Bearer <key>\` 头携带 |
| **22 种语言** | 默认中文（zh-CN），含 RTL 阿拉伯语支持 |
| **现代浅色默认主题** | 白天模式默认，可切换深色 / 跟随系统 |`,

      screenshots: `首页、模型、钱包、日志、设置 共 5 个视图。详细截图请查看 [docs/image/](../docs/image/) 目录。`,

      architecture: `\`\`\`
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
│  ipcMain ───►  services/                                       │
│               ├─ providers   (models.dev cache)                │
│               ├─ registry    (official API + cache fallback)  │
│               ├─ p2p         (libp2p daemon)                    │
│               ├─ provisioner (multi-provider router)          │
│               ├─ proxy-server (OpenAI compatible HTTP)         │
│               ├─ upstream    (real provider API calls)         │
│               ├─ wallet      (MBP score calculator)            │
│               └─ models      (catalogue aggregator)            │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
                 ┌──────────────────┐
                 │   P2P Network     │
                 └──────────────────┘
\`\`\`

\`\`\`bash
# 节点公告格式（v2）— 详见本 README 对应章节
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
\`\`\`

\`\`\`bash
# 消费端本地 HTTP 代理
curl http://127.0.0.1:18100/v1/chat/completions \\
  -H "Authorization: Bearer <api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
\`\`\``,

      decentralised: `应用二进制内硬编码 **4 个种子节点 peerId**（\`src/main/config/trusted-roots.ts\`）。冷启动流程：

1. 首次启动本地 cache 为空
2. 并发拉取：\`GET 官方endpoint\` + 用户配置的 \`bootstrapMultiaddrs\` + mDNS
3. 用本地 \`TRUSTED_ROOT_PEER_IDS\` 校验每个 peerId
4. 写入 \`<userData>/bootstrap-cache.json\`
5. P2P daemon 启动；命中即纯 P2P；未命中则每 1h 后台重试官网

\`\`\`
4 个 hard-coded roots    ← 起点
└─ cached from official endpoint
   ├─ direct connect via bootstrapMultiaddrs
   ├─ mDNS (LAN discovery)
   └─ libp2p DHT findProviders (P2P pure)
\`\`\`

**官网永远保留**：即使整个 P2P 网络瘫痪，新用户仍能通过官网加入。`,

      schema: `\`<https://modelbus.cc/api/v1/nodes>\` 返回 \`Array<NodeAnnouncement>\`：

\`\`\`json
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
\`\`\`

字段含义：

- **version** \`2\` — schema 版本
- **peerId** — libp2p PeerId，唯一身份
- **nickname** — 用户可读昵称
- **providers[]** — 该节点挂载的 LLM 供应商列表
  - **providerId** — models.dev 里的 provider id
  - **providerName** — 可读显示名
  - **models[]** — 该 provider 下愿意共享的模型
- **addr** — 单个主要可达地址（不复数）
  - **kind** — \`direct\` / \`relay\` / \`unknown\`
  - **transport** — \`tcp\` / \`ws\` / \`quic\` / \`webtransport\` / \`webrtc\`
- **announcedAt** — 该条目最近刷新
- **expiresAt** — 软过期；客户端仍可消费过期条目

\`mock/nodes.json\` 末尾预填了 4 个 trusted seed 节点，与 \`trusted-roots.ts\` 对齐。`,

      flow: `**上线**（你 = Token 持有方）：Settings → Token 上线 → 选 provider / 输 API Key / 勾选模型 → \`provision:set\` → \`ProvisionerService.register(config)\` → \`node.handle('/modelbus/inference/1.0.0', …)\` → \`events: 'provision:registered'\`。

**调用**（你 = Token 消费方）：Models 标签选 trusted 节点 → \`proxy:setTarget\` → \`ConsumerProxy.start(:18100)\` → 收到 HTTP POST → 提取 body.model → dial peer → 写 \`InferenceRequest\` JSON+lp → 阻塞读 \`InferenceResponse\` → 回写 HTTP 响应。

**请求路由**（被叫节点 \`ProvisionerService.handle\`）：

\`\`\`
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ 匹配：openai provider 配置
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ 真实调用，返回响应
  └─ 不匹配：400 + { error: "model X is not hosted by this peer" }
\`\`\``,

      download: `> 📦 正式发行版（Windows / macOS / Linux 安装包，及后续移动端、Web SDK）正在筹备中。

**现阶段如何获取**：自行构建

\`\`\`bash
pnpm install
pnpm run dev          # 启动开发模式（Electron + Vite HMR）
pnpm run package:mac  # 在 macOS 上打包 dmg
pnpm run package:win  # 在 Windows 上打包 nsis
pnpm run package:linux # 在 Linux 上打包 AppImage
\`\`\`

构建产物在 \`release/\`。

**发布渠道（敬请期待）**：官网下载页 · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew。官方域名永远是保底救援通道。`,

      quickstart: `\`\`\`bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
\`\`\`

应用启动后默认指向 \`mock/nodes.json\`，无需网络即可体验完整流程。更多细节见主 [README.md](../README.md) 与 [docs/](../docs/) 目录。`,

      roadmap: `- ✅ v1：多 provider、官网冷启动、信任根、P2P 转发、22 语言、钱包雏形
- 🔜 v2：信任链（trustChain）— 基于 Ed25519 签名的链式邀请账本
- 🔜 v3：节点质量评估接入真实指标（延迟、错误率、稳定性）
- 🔜 v4：Token 经济学闭环 — MBP 用于优先路由、冷启动加速、节点发现
- 🔜 v5：移动端
- 🔜 v6：Web 端 \`<modelbus>\` JS SDK`,
    },
  },

  'en-US': {
    logoAlt: 'ModelBus',
    titleLine: 'ModelBus-P2P : A Decentralised LLM Token-Sharing Platform',
    tagline: 'Possibly the world\'s first platform where anyone can attach their Token to a P2P network and use other peers\' shared Tokens in return. No central server, no account, no API key ever leaves your machine.',
    statusSentence: 'ModelBus-P2P is still under development and public testing.',
    sections: {
      toc: '## Contents',
      what: '## What is it',
      features: '## Core features',
      screenshots: '## Screenshots',
      architecture: '## Architecture',
      decentralised: '## Decentralised design',
      schema: '## Node announcement schema (v2)',
      flow: '## Request flow',
      download: '## Download & Use (coming soon)',
      quickstart: '## Quick start',
      roadmap: '## Roadmap',
    },
    body: {
      what: `ModelBus-P2P is a desktop client built on [js-libp2p](https://github.com/libp2p/js-libp2p) and Electron. It solves a problem almost everyone has: **this month I have unused quota, next month I will run out.**

> Scenario: you pay for OpenAI or Claude and rarely burn through your monthly allowance. Instead of letting it expire, attach it to the P2P network. Every request that flows through your node is converted into **MBP tokens** (online minutes × 0.05 + shared-token count × 2 + served requests × 0.1 + response speed × 0.5). When next month arrives and your quota runs short, you spend those MBP tokens to call Tokens shared by other peers. No central server is involved at any point, and your API key stays on your machine.

- **Provision / Share**: attach your subscription API key plus the models you want to share. The network learns your peerId.
- **Consume / Drive**: spin up a local OpenAI-compatible HTTP proxy on \`http://127.0.0.1:18100\`; point any compatible client at it; requests are forwarded over P2P to the peer that actually holds the Token.
- **Wallet**: every share or call accrues MBP tokens. The Home tab and the dedicated Wallet page show the balance, the breakdown and the formula. MBP is currently accounting-only; future releases will use it for reputation, incentives and priority routing.
- **No onboarding**: the first launch pulls seed nodes from the official endpoint (or a local mock) and then runs in fully P2P mode.`,

      features: `| Feature | Notes |
|---|---|
| **P2P transport** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Decentralised trust** | 4 hard-coded seed peerIds form the trust root; new peers join through a trust-chain (next milestone) |
| **Cold-start fallback** | First launch pulls nodes from the official HTTPS endpoint or a local mock; everything lands in \`<userData>/bootstrap-cache.json\` |
| **Multi-provider routing** | One peer can host OpenAI + Anthropic + Google keys at the same time; callers route by \`model.id\` |
| **OpenAI-compatible proxy** | Local HTTP proxy on \`:18100\`; any OpenAI / Anthropic-compatible client works out of the box |
| **API-key auth (optional)** | Pin a fixed key in the consume proxy; callers must send \`Authorization: Bearer <key>\` |
| **22 languages** | zh-CN default; RTL Arabic supported |
| **Light-mode default theme** | Toggle dark / follow OS |`,

      screenshots: `Home, Models, Wallet, Logs, Settings — five views in total. Full-resolution screenshots live under [docs/image/](../docs/image/).`,

      architecture: `\`\`\`
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
\`\`\`

\`\`\`bash
# Node announcement v2 — see the schema section below
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
\`\`\`

\`\`\`bash
# Local consume proxy
curl http://127.0.0.1:18100/v1/chat/completions \\
  -H "Authorization: Bearer <api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
\`\`\``,

      decentralised: `Four seed peerIds are baked into the binary (\`src/main/config/trusted-roots.ts\`). Cold-start flow:

1. Local cache is empty on first launch
2. Pull concurrently: official HTTPS endpoint + user-configured \`bootstrapMultiaddrs\` + mDNS
3. Validate every peerId against \`TRUSTED_ROOT_PEER_IDS\`
4. Persist the trusted subset to \`<userData>/bootstrap-cache.json\`
5. P2P daemon starts; cache hits stay in P2P mode; misses retry the official endpoint every hour

\`\`\`
4 hard-coded roots  ←  trust anchors
└─ cached from official endpoint
   ├─ direct connect via bootstrapMultiaddrs
   ├─ mDNS (LAN discovery)
   └─ libp2p DHT findProviders (P2P pure)
\`\`\`

The official endpoint is kept **forever** as the rescue channel even when the P2P network is healthy.`,

      schema: `\`<https://modelbus.cc/api/v1/nodes>\` returns \`Array<NodeAnnouncement>\`:

\`\`\`json
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
\`\`\`

Fields:

- **version** \`2\` — schema version; bump on breaking changes
- **peerId** — libp2p PeerId, globally unique
- **nickname** — human-readable name
- **providers[]** — LLM providers this peer hosts
  - **providerId** — provider id from models.dev
  - **providerName** — display name
  - **models[]** — models shared under this provider; each has \`id\` (canonical) and \`name\` (display)
- **addr** — single primary reachable address (singular, not plural)
  - **kind** — \`direct\` / \`relay\` / \`unknown\`
  - **transport** — \`tcp\` / \`ws\` / \`quic\` / \`webtransport\` / \`webrtc\`
- **announcedAt** — Unix ms when this entry was last refreshed
- **expiresAt** — soft TTL; stale entries are still usable but ranked lower

The trailing 4 entries in \`mock/nodes.json\` are the trusted seed peers and share the same peerIds as \`trusted-roots.ts\`.`,

      flow: `**Provision** (you = Token holder): Settings → Share Tokens → pick provider, paste API key, tick models → \`provision:set\` → \`ProvisionerService.register(config)\` → \`node.handle('/modelbus/inference/1.0.0', …)\` → \`events: 'provision:registered'\`.

**Consume** (you = Token consumer): pick a trusted peer on the Models tab → \`proxy:setTarget\` → \`ConsumerProxy.start(:18100)\` → HTTP POST arrives → extract \`body.model\` → dial peer → write \`InferenceRequest\` (JSON + length-prefixed) → block on \`InferenceResponse\` → write HTTP response.

**Request routing** (at the callee):

\`\`\`
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ match: openai provider config
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ callUpstream, return response
  └─ no match: 400 + { error: "model X is not hosted by this peer" }
\`\`\``,

      download: `> 📦 Official installers (Windows / macOS / Linux, plus mobile and Web SDK later) are still being prepared.

**For now, build from source:**

\`\`\`bash
pnpm install
pnpm run dev          # dev mode (Electron + Vite HMR)
pnpm run package:mac  # bundle macOS dmg
pnpm run package:win  # bundle Windows nsis
pnpm run package:linux # bundle Linux AppImage
\`\`\`

Output lands in \`release/\`.

**Distribution channels (planned):** official download page · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. The official domain stays the long-term rescue endpoint.`,

      quickstart: `\`\`\`bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
\`\`\`

On first launch the app defaults to \`mock/nodes.json\`, so the full flow works without any network. For deeper setup see the main [README.md](../README.md) and the [docs/](../docs/) folder.`,

      roadmap: `- ✅ v1: multi-provider, official cold start, trust roots, P2P forwarding, 22 languages, wallet scaffolding
- 🔜 v2: trust chain (Ed25519-signed invite ledger)
- 🔜 v3: real-world quality metrics (latency, error rate, uptime)
- 🔜 v4: token-economy loop — MBP drives priority routing, cold-start boosts, node discovery
- 🔜 v5: mobile peers
- 🔜 v6: web SDK — \`<modelbus>\` in the browser`,
    },
  },

  'zh-TW': {
    logoAlt: 'ModelBus',
    titleLine: 'ModelBus-P2P：一個去中心化的 LLM Token 共享平台',
    tagline: '或許是全球首個，任何人都能把自己的 Token 掛上 P2P 網路，也能因此使用網路上其他節點共享的 Token。不需要中心伺服器、不需要註冊帳號、任何 API 金鑰都不會離開你的電腦。',
    statusSentence: 'ModelBus-P2P 仍在開發與公開測試階段。',
    sections: {
      toc: '## 目錄',
      what: '## 這是什麼',
      features: '## 核心特色',
      screenshots: '## 介面一覽',
      architecture: '## 架構總覽',
      decentralised: '## 去中心化設計',
      schema: '## 節點公告格式（v2）',
      flow: '## 呼叫流程詳解',
      download: '## 下載使用（即將開通）',
      quickstart: '## 快速開始',
      roadmap: '## 路線圖',
    },
    body: {
      what: `ModelBus-P2P 是一個基於 [js-libp2p](https://github.com/libp2p/js-libp2p) 與 Electron 的桌面客戶端，解決一個幾乎人人都有過的難題：**這個月用不完，下個月又不夠用**。

> 情境：你訂閱了 OpenAI 或 Claude，但每月額度常常用不完。與其任它月底歸零，不如把它掛上 P2P 網路；本月透過你節點的每一筆請求，都會依規則折算成 **MBP 積分**（在線分鐘數 × 0.05 ＋ 共享 Token 數 × 2 ＋ 服務請求數 × 0.1 ＋ 回應速度 × 0.5）。到了下個月額度不夠時，就能用積分去呼叫其他節點共享的 Token。整個過程沒有任何中心伺服器介入，API 金鑰始終留在你自己的機器上。

- **上線（Provision / Share）**：把你訂閱的 API 金鑰與想共享的模型掛上 P2P 網路，讓其他節點知道你的 peerId。
- **呼叫（Consume / Drive）**：在本機啟一個 OpenAI 相容的 HTTP 代理，設定 \`http://127.0.0.1:18100\` 為 base_url，所有請求都會經 P2P 轉發到實際持有 Token 的節點執行。
- **錢包（Wallet）**：每次共享／呼叫都會折算成 MBP 積分；首頁與「錢包」分頁即時顯示餘額、積分構成與計算公式。
- **無需審批**：首次啟動從官方 endpoint（或本地 mock）取得種子節點，之後完全 P2P 運作。`,

      features: `| 特色 | 說明 |
|---|---|
| **P2P 傳輸棧** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT 打洞 + Kademlia DHT + AutoNAT |
| **去中心化信任** | 4 個硬編碼的種子節點作為信任根；新節點透過信任鏈（下一階段）擴展網路 |
| **冷啟動保底** | 首次啟動從官方 HTTPS endpoint（或本地 mock）取得節點，之後內容快取於 \`<userData>/bootstrap-cache.json\` |
| **多 Provider 路由** | 同一節點可同時掛載 OpenAI + Anthropic + Google 的金鑰；呼叫端依 \`model.id\` 自動路由 |
| **OpenAI 相容代理** | 消費端在本機啟動 OpenAI 相容的 HTTP 代理（預設 \`:18100\`），任何 OpenAI / Anthropic 相容客戶端皆可直連 |
| **API 金鑰驗證（選用）** | 消費端可設定固定 API 金鑰；呼叫端須在 \`Authorization: Bearer <key>\` 標頭帶上 |
| **22 種語言** | 預設繁體中文，支援 RTL 阿拉伯文 |
| **淺色預設主題** | 預設淺色模式，可切換深色／跟隨系統 |`,

      screenshots: `首頁、模型、錢包、日誌、設定共 5 個視圖。完整截圖位於 [docs/image/](../docs/image/) 目錄。`,

      architecture: `\`\`\`
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
│              ├─ registry    (官方 API + 快取備援)              │
│              ├─ p2p         (libp2p 守護行程)                     │
│              ├─ provisioner (多 provider 路由器)                │
│              ├─ proxy-server (OpenAI 相容 HTTP)                │
│              ├─ upstream    (實際 provider API 呼叫)          │
│              ├─ wallet      (MBP 分數計算)                       │
│              └─ models      (目錄彙整器)                          │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   P2P 網路         │
              └──────────────────┘
\`\`\`

\`\`\`bash
# 節點公告格式（v2）— 詳見下文章節
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
\`\`\`

\`\`\`bash
# 消費端本機 HTTP 代理
curl http://127.0.0.1:18100/v1/chat/completions \\
  -H "Authorization: Bearer <api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
\`\`\``,

      decentralised: `應用程式二進位檔內硬編碼了 **4 個種子節點 peerId**（位於 \`src/main/config/trusted-roots.ts\`）。冷啟動流程：

1. 首次啟動時本地快取為空
2. 並行抓取：官方 HTTPS endpoint + 使用者設定的 \`bootstrapMultiaddrs\` + mDNS
3. 比對每個 peerId 與 \`TRUSTED_ROOT_PEER_IDS\`
4. 將通過驗證的子集寫入 \`<userData>/bootstrap-cache.json\`
5. P2P 守護行程啟動；命中走純 P2P 模式；未命中則每小時背景重試官方端點

\`\`\`
4 個硬編碼根節點  ← 信任錨點
└─ 自官方 endpoint 快取
   ├─ 經 bootstrapMultiaddrs 直接連線
   ├─ mDNS（區域網路探索）
   └─ libp2p DHT findProviders（純 P2P）
\`\`\`

**官方端點永遠保留**：即使整個 P2P 網路健康，仍作為救援通道。`,

      schema: `請呼叫 \`<https://modelbus.cc/api/v1/nodes>\` 取得 \`Array<NodeAnnouncement>\`：

\`\`\`json
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
\`\`\`

欄位：

- **version** \`2\`：schema 版本，破壞性變更時 +1
- **peerId**：libp2p PeerId，全球唯一
- **nickname**：使用者可讀名稱
- **providers[]**：本節點掛載的 LLM 供應商清單
  - **providerId**：models.dev 中的供應商 id
  - **providerName**：顯示名稱
  - **models[]**：本 provider 下願意共享的模型（每個有 \`id\` 標準 id 與 \`name\` 顯示名稱）
- **addr**：單一主要可達位址（單數，非複數）
  - **kind**：「direct」／「relay」／「unknown」
  - **transport**：「tcp」／「ws」／「quic」／「webtransport」／「webrtc」
- **announcedAt**：本條目最近刷新的 Unix 毫秒
- **expiresAt**：軟過期時間；過期條目仍可用但權重較低

\`mock/nodes.json\` 末尾的 4 個條目是可信賴種子節點，peerId 與 \`trusted-roots.ts\` 對齊。`,

      flow: `**上線**（你 = Token 持有者）：設定 → Token 上線 → 選 provider、貼 API 金鑰、勾選模型 → \`provision:set\` → \`ProvisionerService.register(config)\` → \`node.handle('/modelbus/inference/1.0.0', …)\` → \`events: 'provision:registered'\`。

**呼叫**（你 = Token 消費者）：在模型分頁選擇可信賴節點 → \`proxy:setTarget\` → \`ConsumerProxy.start(:18100)\` → 收到 HTTP POST → 抽取 \`body.model\` → 撥號 peer → 寫入 \`InferenceRequest\`（JSON + 長度前綴）→ 阻塞讀 \`InferenceResponse\` → 寫回 HTTP 回應。

**請求路由**（在被叫端 \`ProvisionerService.handle\`）：

\`\`\`
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ 符合：openai provider 設定
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ 實際呼叫並回傳回應
  └─ 不符合：400 + { error: "model X is not hosted by this peer" }
\`\`\``,

      download: `> 📦 正式發行版（Windows / macOS / Linux 安裝套件，以及後續的行動端、Web SDK）尚在籌備中。

**目前取得方式：自行建置**

\`\`\`bash
pnpm install
pnpm run dev          # 開發模式（Electron + Vite HMR）
pnpm run package:mac  # macOS dmg
pnpm run package:win  # Windows nsis
pnpm run package:linux # Linux AppImage
\`\`\`

產出位於 \`release/\`。

**發佈管道（規劃中）**：官方下載頁 · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew。官方網域始終是長期救援通道。`,

      quickstart: `\`\`\`bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
\`\`\`

首次啟動時應用程式預設指向 \`mock/nodes.json\`，無需網路即可體驗完整流程。更多細節請參考主 [README.md](../README.md) 與 [docs/](../docs/) 目錄。`,

      roadmap: `- ✅ v1：多 provider、官方冷啟動、信任根、P2P 轉發、22 語言、錢包雛形
- 🔜 v2：信任鏈（trustChain）— 基於 Ed25519 簽名的鏈式邀請帳本
- 🔜 v3：實際指標驅動的節點品質評估（延遲、錯誤率、在線率）
- 🔜 v4：代幣經濟閉環 — MBP 用於優先路由、冷啟動加速、節點探索
- 🔜 v5：行動端節點
- 🔜 v6：Web 端 \`<modelbus>\` JS SDK`,
    },
  },

  'ja-JP': {
    logoAlt: 'ModelBus',
    titleLine: 'ModelBus-P2P：分散型 LLM Token 共有プラットフォーム',
    tagline: 'おそらく世界初。自分の Token を P2P ネットワークに繋ぎ、他のピアが共有する Token を使えるプラットフォーム。中央サーバー不要、アカウント登録不要、API キーがあなたの PC から外に出ることもありません。',
    statusSentence: 'ModelBus-P2P はまだ開発と公開テストの段階です。',
    sections: {
      toc: '## 目次',
      what: '## これは何ですか',
      features: '## 主な特徴',
      screenshots: '## 画面プレビュー',
      architecture: '## アーキテクチャ',
      decentralised: '## 分散型設計',
      schema: '## ノード公告フォーマット（v2）',
      flow: '## リクエストの流れ',
      download: '## ダウンロードと利用（近日公開）',
      quickstart: '## クイックスタート',
      roadmap: '## ロードマップ',
    },
    body: {
      what: `ModelBus-P2P は [js-libp2p](https://github.com/libp2p/js-libp2p) と Electron を基盤にしたデスクトップクライアントで、誰もが一度は経験する「**今月は余るのに来月は足りない**」という悩みを解決します。

> シナリオ：OpenAI や Claude のサブスクを契約していても、月間の枠を使い切ることは稀です。月末に消えてしまう前に P2P ネットワークに繋いでしまいましょう。あなたのノードを経由したリクエスト 1 件ごとに **MBP トークン**（オンライン分数 × 0.05 ＋ 共有 Token 数 × 2 ＋ 処理リクエスト数 × 0.1 ＋ 応答速度 × 0.5）に変換されます。来月の枠が足りなくなったら、その MBP で他のピアの共有 Token を呼び出せます。すべて P2P 上で完結し、API キーはあなたの PC から一切出ません。

- **Provision / Share**：サブスクの API キーと共有したいモデルを登録。ネットワークにあなたの peerId を公開します。
- **Consume / Drive**：ローカルで OpenAI 互換の HTTP プロキシ（\`http://127.0.0.1:18100\`）を起動し、対応クライアントの base_url をそこに向けるだけ。リクエストは P2P 経由で実際の Token 保持者に転送されます。
- **Wallet**：共有も呼び出しも、すべて MBP トークンに換算。ホームタブと Wallet 画面で残高・内訳・計算式をリアルタイム表示します。
- **オンボーディング不要**：初回起動時に公式エンドポイント（またはローカル mock）からシードピアを取得し、以降は完全 P2P で動作します。`,

      features: `| 機能 | 説明 |
|---|---|
| **P2P トランスポート** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT トラバーサル + Kademlia DHT + AutoNAT |
| **分散型トラスト** | 4 つのハードコードされたシードピアをトラストアンカーに、新規ピアはトラストチェーン（次フェーズ）で参加 |
| **コールドスタート補完** | 初回起動時に公式 HTTPS エンドポイント（またはローカル mock）からノードを取得し、以降は \`<userData>/bootstrap-cache.json\` にキャッシュ |
| **マルチ Provider ルーティング** | 1 ピアが OpenAI + Anthropic + Google のキーを同時に保持可能。呼び出し側は \`model.id\` で自動振り分け |
| **OpenAI 互換プロキシ** | ローカル HTTP プロキシ（既定 \`:18100\`）。OpenAI / Anthropic 互換クライアントがそのまま使える |
| **API キー認証（任意）** | コンシューマ側で固定キーを設定し、呼び出し側が \`Authorization: Bearer <key>\` ヘッダで送信する形 |
| **22 言語対応** | デフォルトは日本語。RTL アラビア語もサポート |
| **ライトモード既定テーマ** | ダーク／OS 追従に切替可能 |`,

      screenshots: `ホーム、モデル、ウォレット、ログ、設定の 5 ビュー。フル解像度のスクショは [docs/image/](../docs/image/) にあります。`,

      architecture: `\`\`\`
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
│              ├─ registry    (公式 API + キャッシュフォールバック)│
│              ├─ p2p         (libp2p デーモン)                    │
│              ├─ provisioner (マルチ Provider ルーター)            │
│              ├─ proxy-server (OpenAI 互換 HTTP)                │
│              ├─ upstream    (実 provider API 呼び出し)         │
│              ├─ wallet      (MBP スコア計算)                       │
│              └─ models      (カタログ集約)                          │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   P2P ネット       │
              └──────────────────┘
\`\`\`

\`\`\`bash
# ノード公告フォーマット（v2）— 後述
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
\`\`\`

\`\`\`bash
# コンシューマ側ローカル HTTP プロキシ
curl http://127.0.0.1:18100/v1/chat/completions \\
  -H "Authorization: Bearer <api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
\`\`\``,

      decentralised: `シードピア ID 4 個をバイナリにハードコードしています（\`src/main/config/trusted-roots.ts\`）。コールドスタートのフロー：

1. 初回起動時はローカルキャッシュが空
2. 公式 HTTPS エンドポイント + ユーザ設定の \`bootstrapMultiaddrs\` + mDNS を並行フェッチ
3. 各 peerId を \`TRUSTED_ROOT_PEER_IDS\` と照合して検証
4. 検証済みサブセットを \`<userData>/bootstrap-cache.json\` に永続化
5. P2P デーモン起動。キャッシュヒットは P2P のみ、ミスは 1 時間ごとに公式エンドポイントを再試行

\`\`\`
ハードコードされた 4 つのルート  ← トラストアンカー
└─ 公式エンドポイントからキャッシュ
   ├─ bootstrapMultiaddrs で直接接続
   ├─ mDNS（LAN 探索）
   └─ libp2p DHT findProviders（P2P のみ）
\`\`\`

公式エンドポイントは**恒久的に**救助チャネルとして残し、P2P ネットワークが健全なときも温存します。`,

      schema: `リクエスト：\`<https://modelbus.cc/api/v1/nodes>\` は \`Array<NodeAnnouncement>\` を返します：

\`\`\`json
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
\`\`\`

フィールド：

- **version** \`2\`：schema バージョン。破壊的変更で +1
- **peerId**：libp2p PeerId（世界で一意）
- **nickname**：表示名
- **providers[]**：このピアがホストする LLM プロバイダ一覧
  - **providerId**：models.dev の provider id
  - **providerName**：表示名
  - **models[]**：このプロバイダ配下の共有モデル。各要素は \`id\`（正規 ID）と \`name\`（表示名）を持つ
- **addr**：単一の主要到達アドレス（複数ではない）
  - **kind**：「direct」／「relay」／「unknown」
  - **transport**：「tcp」／「ws」／「quic」／「webtransport」／「webrtc」
- **announcedAt**：このエントリが最後に更新された Unix ms
- **expiresAt**：ソフト TTL。期限切れでも利用可能だが重みは下がる

\`mock/nodes.json\` の末尾 4 エントリはトラストシードで、peerId は \`trusted-roots.ts\` と一致します。`,

      flow: `**Provision**（あなた = Token 保有者）：設定 → Token 上線 → プロバイダ選択 → API キー貼付 → モデル選択 → \`provision:set\` → \`ProvisionerService.register(config)\` → \`node.handle('/modelbus/inference/1.0.0', …)\` → \`events: 'provision:registered'\`。

**Consume**（あなた = Token 消費者）：モデルタブで信頼済みピアを選択 → \`proxy:setTarget\` → \`ConsumerProxy.start(:18100)\` → HTTP POST 受信 → \`body.model\` 抽出 → ピアへダイヤル → \`InferenceRequest\`（JSON + レングスプレフィックス）送信 → \`InferenceResponse\` を待機 → HTTP 応答として書き戻し。

**リクエストルーティング**（被呼出側 \`ProvisionerService.handle\`）：

\`\`\`
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ 該当：openai プロバイダ設定
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ 実呼び出し、応答返却
  └─ 非該当：400 + { error: "model X is not hosted by this peer" }
\`\`\``,

      download: `> 📦 公式インストーラ（Windows / macOS / Linux パッケージ、将来的にモバイルと Web SDK）は現在準備中です。

**今すぐ使うには：ソースからビルド**

\`\`\`bash
pnpm install
pnpm run dev          # 開発モード（Electron + Vite HMR）
pnpm run package:mac  # macOS dmg
pnpm run package:win  # Windows nsis
pnpm run package:linux # Linux AppImage
\`\`\`

成果物は \`release/\` に出力されます。

**配布チャネル（予定）**：公式ダウンロードページ · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew。公式ドメインは長期の救助エンドポイントとして残ります。`,

      quickstart: `\`\`\`bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
\`\`\`

初回起動時はアプリが \`mock/nodes.json\` を指すので、ネットワークなしで全フローを体験できます。詳細はメイン [README.md](../README.md) と [docs/](../docs/) を参照してください。`,

      roadmap: `- ✅ v1：マルチ Provider、公式コールドスタート、トラストアンカー、P2P 転送、22 言語、ウォレットの原型
- 🔜 v2：トラストチェーン（trustChain）— Ed25519 署名による招待台帳
- 🔜 v3：実指標（遅延・エラー率・稼働率）に基づくノード品質評価
- 🔜 v4：トークン経済のループ — MBP が優先ルーティングやコールドスタートを駆動
- 🔜 v5：モバイルピア
- 🔜 v6：Web SDK — ブラウザ用 \`<modelbus>\``,
    },
  },

/* LOCALE-APPEND-START */

  'bs-BA': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : Decentralizirana platforma za dijeljenje LLM tokena",
  "tagline": "Možda prva platforma na svijetu na kojoj svako može priključiti svoj Token na P2P mrežu i zauzvrat koristiti Tokene koje dijele drugi čvorovi. Bez centralnog servera, bez registracije naloga, nijedan API ključ nikada ne napušta vaš uređaj.",
  "statusSentence": "ModelBus-P2P je još uvijek u razvoju i javnom testiranju.",
  "sections": {
    "toc": "## Sadržaj",
    "what": "## Šta je ovo",
    "features": "## Ključne funkcije",
    "screenshots": "## Snimci ekrana",
    "architecture": "## Arhitektura",
    "decentralised": "## Decentralni dizajn",
    "schema": "## Format objave čvora (v2)",
    "flow": "## Tok zahtjeva",
    "download": "## Preuzimanje i korištenje (uskoro)",
    "quickstart": "## Brzi start",
    "roadmap": "## Mapa puta"
  },
  "body": {
    "what": "ModelBus-P2P je desktop klijent izgrađen na [js-libp2p](https://github.com/libp2p/js-libp2p) i Electronu. Rješava problem koji gotovo svi znaju: **ovaj mjesec višak, sljedeći mjesec manjak.**\n\n> Scenarij: plaćate OpenAI ili Claude i rijetko potrošite mjesečnu kvotu. Umjesto da je pustite da istekne, priključite je na P2P mrežu. Svaki zahtjev koji prođe kroz vaš čvor pretvara se u **MBP tokene** (minuti online × 0,05 + broj dijeljenih Tokena × 2 + opsluženi zahtjevi × 0,1 + brzina odgovora × 0,5). Kada sljedeći mjesec kvota postane tijesna, trošite te MBP da pozovete Tokene koje dijele drugi čvorovi. Nijedan centralni server nije uključen, a vaš API ključ ostaje na vašem uređaju.\n\n- **Provision / Share**: registrujte ključ API svog pretplatničkog paketa i modele koje želite dijeliti. Mreža uči vaš peerId.\n- **Consume / Drive**: podignite lokalni proxy HTTP kompatibilan s OpenAI-jem na `http://127.0.0.1:18100`; usmjerite bilo koji kompatibilni klijent tamo; zahtjevi se prosljeđuju putem P2P-a čvoru koji stvarno drži Token.\n- **Wallet**: svako dijeljenje ili poziv akumulira MBP tokene. Kartica Početna i stranica Wallet prikazuju stanje, raščlambu i formulu u realnom vremenu. MBP je trenutno samo knjigovodstveni; buduće verzije će ga koristiti za reputaciju, poticaje i prioritetno rutiranje.\n- **Bez oneboardinga**: prvo pokretanje dovodi seed čvorove sa zvaničnog endpoint-a (ili lokalnog mock-a), a zatim radi potpuno u P2P načinu.",
    "features": "| Funkcija | Napomene |\n|---|---|\n| **P2P prijenos** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Decentralno povjerenje** | 4 hardkodirana seed peer-ID-ja kao sidra povjerenja; novi čvorovi ulaze preko lanca povjerenja (sljedeća prekretnica) |\n| **Cold-start rezerva** | Prvo pokretanje dovodi čvorove sa zvaničnog HTTPS endpoint-a ili lokalnog mock-a; sve stiže u `<userData>/bootstrap-cache.json` |\n| **Multi-provider rutiranje** | Jedan čvor može istovremeno hostati OpenAI + Anthropic + Google; pozivaoci rutiraju po `model.id` |\n| **Proxy kompatibilan s OpenAI** | Lokalni HTTP proxy na `:18100`; svaki OpenAI/Anthropic-kompatibilni klijent radi odmah |\n| **Auth putem API ključa (opcionalno)** | Postavite fiksni ključ u proxy za potrošnju; pozivaoci moraju slati `Authorization: Bearer <key>` |\n| **22 jezika** | Bosanski po defaultu; podržan RTL arapski |\n| **Svijetla default tema** | Prebacivanje na tamnu / praćenje OS-a |",
    "screenshots": "Početna, Modeli, Novčanik, Dnevnik, Postavke — ukupno pet pogleda. Snimci u punoj rezoluciji su u [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (cache models.dev)                 │\n│              ├─ registry    (zvanični API + fallback cache)    │\n│              ├─ p2p         (libp2p daemon)                    │\n│              ├─ provisioner (multi-provider ruter)            │\n│              ├─ proxy-server (HTTP kompatibilan s OpenAI)     │\n│              ├─ upstream    (stvarni pozivi providera)        │\n│              ├─ wallet      (računanje MBP rezultata)          │\n│              └─ models      (agregator kataloga)              │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   P2P mreža       │\n              └──────────────────┘\n```\n\n```bash\n# Objava čvora v2 — vidi sljedeću sekciju\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Lokalni proxy za potrošnju\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Četiri seed peer-ID-ja su ugrađena u binarni fajl (`src/main/config/trusted-roots.ts`). Tok cold starta:\n\n1. Lokalni cache je prazan pri prvom pokretanju\n2. Paralelno pribavljanje: zvanični HTTPS endpoint + konfigurisani `bootstrapMultiaddrs` + mDNS\n3. Validacija svakog peerId-a prema `TRUSTED_ROOT_PEER_IDS`\n4. Čuvanje validiranog podskupa u `<userData>/bootstrap-cache.json`\n5. P2P daemon kreće; cache pogodaci ostaju u P2P načinu; promašaji ponovo pokušavaju zvanični endpoint svakog sata\n\n```\n4 hardkodirana korijena  ←  sidra povjerenja\n└─ iz cache-a zvaničnog endpoint-a\n   ├─ direktna veza preko bootstrapMultiaddrs\n   ├─ mDNS (otkrivanje u LAN-u)\n   └─ libp2p DHT findProviders (čisti P2P)\n```\n\nZvanični endpoint ostaje **zauvijek** kao kanal za spas, čak i kada je P2P mreža zdrava.",
    "schema": "Zahtjev: `<https://modelbus.cc/api/v1/nodes>` vraća `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nPolja:\n\n- **version** `2`: verzija šeme; +1 pri lomljivim promjenama\n- **peerId**: libp2p PeerId, globalno jedinstven\n- **nickname**: čitljivo ime\n- **providers[]**: LLM provideri koje ovaj čvor hosta\n  - **providerId**: id providera u models.dev\n  - **providerName**: prikazano ime\n  - **models[]**: modeli pod ovim providerom; svaki ima `id` (kanonski) i `name` (prikaz)\n- **addr**: jedinstvena glavna dostupna adresa (jednina)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: Unix ms posljednjeg osvježavanja\n- **expiresAt**: mekani TTL; istekli unosi su i dalje upotrebljivi ali s manjom težinom\n\nPosljednja 4 unosa u `mock/nodes.json` su pouzdani seed čvorovi; njihovi peerId se poklapaju s `trusted-roots.ts`.",
    "flow": "**Provision** (vi = vlasnik Tokena): Postavke → Dijeljenje Tokena → odaberite providera, zalijepite API ključ, označite modele → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (vi = potrošač Tokena): odaberite pouzdani čvor u kartici Modeli → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → stiže HTTP POST → izvucite `body.model` → pozovite čvor → napišite `InferenceRequest` (JSON + prefiks dužine) → čekajte `InferenceResponse` → napišite HTTP odgovor.\n\n**Rutiranje zahtjeva** (na pozvanom čvoru `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ poklapanje: konfiguracija providera openai\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ stvarni poziv, vraćanje odgovora\n  └─ bez poklapanja: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Zvanični instalateri (paketi za Windows / macOS / Linux, a kasnije mobilni i Web SDK) su u pripremi.\n\n**Da ga odmah koristite: izgradite iz izvornog koda**\n\n```bash\npnpm install\npnpm run dev          # razvojni način (Electron + Vite HMR)\npnpm run package:mac  # dmg za macOS\npnpm run package:win  # nsis za Windows\npnpm run package:linux # AppImage za Linux\n```\n\nArtefakti završavaju u `release/`.\n\n**Kanali distribucije (planirani)**: zvanična stranica za preuzimanje · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Zvanični domen ostaje trajni endpoint za spas.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nPri prvom pokretanju aplikacija po defaultu pokazuje na `mock/nodes.json`, pa cijeli tok radi bez mreže. Detalji u glavnom [README.md](../README.md) i mapi [docs/](../docs/).",
    "roadmap": "- ✅ v1: multi-provider, zvanični cold start, sidra povjerenja, P2P prosljeđivanje, 22 jezika, kostur Novčanika\n- 🔜 v2: lanac povjerenja (trustChain) — knjiga pozivnica potpisana Ed25519\n- 🔜 v3: ocjena kvalitete čvora na osnovu stvarnih mjera (kašnjenje, stopa grešaka, radno vrijeme)\n- 🔜 v4: krug token-ekonomije — MBP vodi prioritetno rutiranje, ubrzanje cold starta i otkrivanje čvorova\n- 🔜 v5: mobilni čvorovi\n- 🔜 v6: Web SDK — `<modelbus>` u pregledniku"
  }
},


  'bn-BD': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : একটি বিকেন্দ্রীভূত LLM Token শেয়ারিং প্ল্যাটফর্ম",
  "tagline": "সম্ভবত বিশ্বের প্রথম প্ল্যাটফর্ম যেখানে যে কেউ তার Token P2P নেটওয়ার্কে সংযুক্ত করতে পারে এবং বিনিময়ে অন্যান্য পিয়ারের শেয়ার করা Token ব্যবহার করতে পারে। কোনো কেন্দ্রীয় সার্ভার নেই, অ্যাকাউন্ট নিবন্ধন নেই, কোনো API কী কখনো আপনার মেশিন ছেড়ে যায় না।",
  "statusSentence": "ModelBus-P2P এখনও উন্নয়ন ও পাবলিক পরীক্ষার পর্যায়ে আছে।",
  "sections": {
    "toc": "## সূচি",
    "what": "## এটি কী",
    "features": "## মূল বৈশিষ্ট্য",
    "screenshots": "## স্ক্রিনশট",
    "architecture": "## আর্কিটেকচার",
    "decentralised": "## বিকেন্দ্রীভূত নকশা",
    "schema": "## নোড ঘোষণা ফরম্যাট (v2)",
    "flow": "## অনুরোধ প্রবাহ",
    "download": "## ডাউনলোড ও ব্যবহার (শীঘ্রই)",
    "quickstart": "## দ্রুত শুরু",
    "roadmap": "## রোডম্যাপ"
  },
  "body": {
    "what": "ModelBus-P2P হল [js-libp2p](https://github.com/libp2p/js-libp2p) এবং Electron-এর উপর নির্মিত একটি ডেস্কটপ ক্লায়েন্ট। এটি প্রায় সবার জানা একটি সমস্যার সমাধান করে: **এই মাসে অতিরিক্ত, পরের মাসে অভাব।**\n\n> পরিস্থিতি: আপনি OpenAI বা Claude-এর জন্য পে করেন এবং খুব কমই মাসিক কোটা শেষ করেন। এটা মেয়াদোত্তীর্ণ হতে না দিয়ে P2P নেটওয়ার্কে লাগিয়ে দিন। আপনার নোড দিয়ে যাওয়া প্রতিটি অনুরোধ **MBP টোকেনে** রূপান্তরিত হয় (অনলাইন মিনিট × ০.০৫ + শেয়ার করা Token সংখ্যা × ২ + পরিবেশন করা অনুরোধ × ০.১ + প্রতিক্রিয়ার গতি × ০.৫)। যখন পরের মাসে কোটা সংকুচিত হয়, তখন সেই MBP খরচ করে অন্য পিয়ারের শেয়ার করা Token কল করুন। কোনো কেন্দ্রীয় সার্ভার জড়িত নয়, এবং আপনার API কী মেশিনেই থাকে।\n\n- **Provision / Share**: আপনার সাবস্ক্রিপশনের API কী এবং শেয়ার করতে চাওয়া মডেলগুলো নিবন্ধন করুন। নেটওয়ার্ক আপনার peerId জানবে।\n- **Consume / Drive**: `http://127.0.0.1:18100`-এ OpenAI-সামঞ্জস্যপূর্ণ স্থানীয় HTTP প্রক্সি চালু করুন; যেকোনো সামঞ্জস্যপূর্ণ ক্লায়েন্ট সেখানে পয়েন্ট করুন; অনুরোধ P2P-এর মাধ্যমে Token-ধারী পিয়ারে ফরওয়ার্ড হয়।\n- **Wallet**: প্রতিটি শেয়ার বা কল MBP টোকেন জমা করে। হোম ট্যাব ও Wallet পেজ রিয়েল-টাইমে ব্যালেন্স, ভাঙ্গন ও সূত্র দেখায়। MBP বর্তমানে শুধু হিসাব; ভবিষ্যৎ সংস্করণে এটি খ্যাতি, প্রণোদনা ও অগ্রাধিকার রাউটিং-এর জন্য ব্যবহৃত হবে।\n- **অনবোর্ডিং নেই**: প্রথম চালু অফিসিয়াল 엔드পয়েন্ট (বা লোকাল mock) থেকে সিড নোড আনে, তারপর সম্পূর্ণ P2P মোডে চলে।",
    "features": "| বৈশিষ্ট্য | নোট |\n|---|---|\n| **P2P পরিবহন** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **বিকেন্দ্রীভূত বিশ্বাস** | 4টি হার্ডকোডেড সিড পিয়ার আইডি বিশ্বাসের অ্যাঙ্কর; নতুন পিয়ার বিশ্বাস চেইনের মাধ্যমে যুক্ত হয় (পরবর্তী মাইলফলক) |\n| **কোল্ড স্টার্ট ফলব্যাক** | প্রথম চালু অফিসিয়াল HTTPS 엔드পয়েন্ট বা লোকাল mock থেকে নোড আনে; সবকিছু `<userData>/bootstrap-cache.json`-এ জমা হয় |\n| **মাল্টি-প্রোভাইডার রাউটিং** | একটি পিয়ার একসাথে OpenAI + Anthropic + Google হোস্ট করতে পারে; কলকারীরা `model.id` দিয়ে রাউট করে |\n| **OpenAI-সামঞ্জস্যপূর্ণ প্রক্সি** | `:18100`-এ স্থানীয় HTTP প্রক্সি; যেকোনো OpenAI/Anthropic-সামঞ্জস্যপূর্ণ ক্লায়েন্ট সরাসরি কাজ করে |\n| **API কী অথ (ঐচ্ছিক)** | ভোক্তা প্রক্সিতে একটি স্থায়ী কী সেট করুন; কলকারীদের `Authorization: Bearer <key>` পাঠাতে হবে |\n| **২২টি ভাষা** | বাংলা ডিফল্ট; RTL আরবি সমর্থিত |\n| **উজ্জ্বল ডিফল্ট থিম** | ডার্ক / OS অনুসরণে পরিবর্তনযোগ্য |",
    "screenshots": "হোম, মডেল, ওয়ালেট, লগ, সেটিংস — মোট পাঁচটি ভিউ। পূর্ণ রেজোলিউশনের স্ক্রিনশট [docs/image/](../docs/image/)-এ আছে।",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (models.dev ক্যাশ)                │\n│              ├─ registry    (অফিসিয়াল API + ক্যাশ ফলব্যাক)   │\n│              ├─ p2p         (libp2p ডেমন)                      │\n│              ├─ provisioner (মাল্টি-প্রোভাইডার রাউটার)        │\n│              ├─ proxy-server (OpenAI-সামঞ্জস্যপূর্ণ HTTP)     │\n│              ├─ upstream    (বাস্তব প্রোভাইডার API কল)       │\n│              ├─ wallet      (MBP স্কোর গণনা)                   │\n│              └─ models      (ক্যাটালগ সমষ্টি)                    │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   P2P নেটওয়ার্ক    │\n              └──────────────────┘\n```\n\n```bash\n# নোড ঘোষণা v2 — পরের বিভাগ দেখুন\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# লোকাল ভোক্তা প্রক্সি\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "চারটি সিড পিয়ার আইডি বাইনারিতে এমবেড করা (`src/main/config/trusted-roots.ts`)। কোল্ড স্টার্ট প্রবাহ:\n\n1. প্রথম চালুতে লোকাল ক্যাশ খালি\n2. সমান্তরালে আনা: অফিসিয়াল HTTPS 엔드পয়েন্ট + ব্যবহারকারী কনফিগার করা `bootstrapMultiaddrs` + mDNS\n3. প্রতিটি peerId `TRUSTED_ROOT_PEER_IDS`-এর সাথে যাচাই\n4. যাচাইকৃত সাবসেট `<userData>/bootstrap-cache.json`-এ সংরক্ষণ\n5. P2P ডেমন শুরু; ক্যাশ হিট P2P মোডে থাকে; মিস প্রতি ঘণ্টায় অফিসিয়াল 엔드পয়েন্ট পুনরায় চেষ্টা করে\n\n```\n৪টি হার্ডকোডেড রুট  ←  বিশ্বাসের অ্যাঙ্কর\n└─ অফিসিয়াল 엔드পয়েন্ট থেকে ক্যাশ\n   ├─ bootstrapMultiaddrs via সরাসরি সংযোগ\n   ├─ mDNS (LAN আবিষ্কার)\n   └─ libp2p DHT findProviders (শুদ্ধ P2P)\n```\n\nঅফিসিয়াল 엔드পয়েন্ট **চিরকাল** উদ্ধার চ্যানেল হিসেবে থাকে, P2P নেটওয়ার্ক সুস্থ থাকলেও।",
    "schema": "অনুরোধ: `<https://modelbus.cc/api/v1/nodes>` `Array<NodeAnnouncement>` ফেরত দেয়:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nক্ষেত্র:\n\n- **version** `2`: স্কিমা সংস্করণ; ভাঙা পরিবর্তনে +1\n- **peerId**: libp2p PeerId, বিশ্বব্যাপী অনন্য\n- **nickname**: পঠনযোগ্য নাম\n- **providers[]**: এই পিয়ার হোস্ট করা LLM প্রোভাইডার\n  - **providerId**: models.dev-এ প্রোভাইডার id\n  - **providerName**: প্রদর্শন নাম\n  - **models[]**: এই প্রোভাইডারের অধীনে মডেল; প্রতিটির `id` (ক্যানোনিক্যাল) ও `name` (প্রদর্শন)\n- **addr**: একক প্রধান অ্যাক্সেসযোগ্য ঠিকানা (একবচন)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: সর্বশেষ আপডেটের Unix ms\n- **expiresAt**: নরম TTL; মেয়াদোত্তীর্ণ এন্ট্রি এখনও ব্যবহারযোগ্য কিন্তু কম ওজন\n\n`mock/nodes.json`-এর শেষ ৪টি এন্ট্রি বিশ্বস্ত সিড পিয়ার; তাদের peerId `trusted-roots.ts`-এর সাথে মিলে যায়।",
    "flow": "**Provision** (আপনি = Token ধারক): সেটিংস → Token শেয়ার → প্রোভাইডার বাছুন, API কী আটকান, মডেল টিক দিন → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`।\n\n**Consume** (আপনি = Token ভোক্তা): মডেল ট্যাবে বিশ্বস্ত পিয়ার বাছুন → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → HTTP POST আসে → `body.model` বের করুন → পিয়ারে ডায়াল করুন → `InferenceRequest` (JSON + দৈর্ঘ্য উপসর্গ) লিখুন → `InferenceResponse`-এর জন্য অপেক্ষা করুন → HTTP উত্তর লিখুন।\n\n**অনুরোধ রাউটিং** (কলপ্রাপ্ত পিয়ারে `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ মিল: openai প্রোভাইডার কনফিগ\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ বাস্তব কল, উত্তর ফেরত\n  └─ মিল নেই: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 অফিসিয়াল ইনস্টলার (Windows / macOS / Linux প্যাকেজ, পরে মোবাইল ও Web SDK) প্রস্তুত করা হচ্ছে।\n\n**এখনই ব্যবহার করতে: সোর্স থেকে বিল্ড**\n\n```bash\npnpm install\npnpm run dev          # ডেভ মোড (Electron + Vite HMR)\npnpm run package:mac  # macOS dmg\npnpm run package:win  # Windows nsis\npnpm run package:linux # Linux AppImage\n```\n\nআউটপুট `release/`-এ থাকে।\n\n**বিতরণ চ্যানেল (পরিকল্পিত)**: অফিসিয়াল ডাউনলোড পেজ · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew। অফিসিয়াল ডোমেইন চিরকাল উদ্ধার 엔드পয়েন্ট।",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nপ্রথম চালুতে অ্যাপ ডিফল্টভাবে `mock/nodes.json`-এ পয়েন্ট করে, তাই পুরো প্রবাহ নেটওয়ার্ক ছাড়াই চলে। আরও বিস্তারিত মূল [README.md](../README.md) ও [docs/](../docs/) ফোল্ডারে।",
    "roadmap": "- ✅ v1: মাল্টি-প্রোভাইডার, অফিসিয়াল কোল্ড স্টার্ট, বিশ্বাস অ্যাঙ্কর, P2P ফরওয়ার্ড, ২২ ভাষা, ওয়ালেট কাঠামো\n- 🔜 v2: বিশ্বাস চেইন (trustChain) — Ed25519 স্বাক্ষরিত আমন্ত্রণ খতিয়ান\n- 🔜 v3: বাস্তব মেট্রিক (বিলম্ব, ত্রুটি হার, আপটাইম) ভিত্তিক নোড মান মূল্যায়ন\n- 🔜 v4: টোকেন অর্থনীতি লুপ — MBP অগ্রাধিকার রাউটিং, কোল্ড স্টার্ট বুস্ট ও নোড আবিষ্কার চালায়\n- 🔜 v5: মোবাইল পিয়ার\n- 🔜 v6: ওয়েব SDK — ব্রাউজারে `<modelbus>`"
  }
},
  'el-GR': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : Μια αποκεντρωμένη πλατφόρμα κοινής χρήσης token LLM",
  "tagline": "Πιθανώς η πρώτη πλατφόρμα στον κόσμο όπου ο καθένας μπορεί να συνδέσει το Token του σε ένα δίκτυο P2P και, αντίστοιχα, να χρησιμοποιήσει τα Token που μοιράζονται άλλοι κόμβοι. Χωρίς κεντρικό διακομιστή, χωρίς λογαριασμό, κανένα κλειδί API δεν φεύγει ποτέ από το μηχάνημά σας.",
  "statusSentence": "Το ModelBus-P2P βρίσκεται ακόμη σε ανάπτυξη και δημόσιες δοκιμές.",
  "sections": {
    "toc": "## Περιεχόμενα",
    "what": "## Τι είναι",
    "features": "## Βασικές δυνατότητες",
    "screenshots": "## Στιγμιότυπα",
    "architecture": "## Αρχιτεκτονική",
    "decentralised": "## Αποκεντρωμένος σχεδιασμός",
    "schema": "## Μορφή ανακοίνωσης κόμβου (v2)",
    "flow": "## Ροή αιτήματος",
    "download": "## Λήψη και χρήση (σύντομα)",
    "quickstart": "## Γρήγορη εκκίνηση",
    "roadmap": "## Οδικός χάρτης"
  },
  "body": {
    "what": "Το ModelBus-P2P είναι ένας επιτραπέζιος πελάτης χτισμένος σε [js-libp2p](https://github.com/libp2p/js-libp2p) και Electron. Λύνει ένα πρόβλημα που όλοι γνωρίζουμε: **αυτόν τον μήνα περισσεύει, τον επόμενο δεν φτάνει.**\n\n> Σενάριο: πληρώνετε OpenAI ή Claude και σπάνια εξαντλείτε το μηνιαίο όριο. Αντί να το αφήσετε να λήξει, συνδέστε το στο δίκτυο P2P. Κάθε αίτημα που περνά από τον κόμβο σας μετατρέπεται σε **token MBP** (λεπτά σύνδεσης × 0,05 + αριθμός μοιρασμένων Token × 2 + εξυπηρετηθέντα αιτήματα × 0,1 + ταχύτητα απόκρισης × 0,5). Όταν τον επόμενο μήνα το όριο στενέψει, ξοδεύετε αυτά τα MBP για να καλέσετε Token που μοιράζονται άλλοι κόμβοι. Κανένας κεντρικός διακομιστής δεν παρεμβαίνει και το κλειδί API μένει στο μηχάνημά σας.\n\n- **Provision / Share**: καταχωρήστε το κλειδί API της συνδρομής σας και τα μοντέλα που θέλετε να μοιραστείτε. Το δίκτυο μαθαίνει το peerId σας.\n- **Consume / Drive**: σηκώστε τοπικό HTTP proxy συμβατό με OpenAI στο `http://127.0.0.1:18100`; δείξτε εκεί οποιονδήποτε συμβατό πελάτη· τα αιτήματα προωθούνται μέσω P2P στον κόμβο που πραγματικά κρατά το Token.\n- **Wallet**: κάθε κοινή χρήση ή κλήση συσσωρεύει token MBP. Η καρτέλα Αρχική και η σελίδα Wallet δείχνουν ισοζύγιο, ανάλυση και τύπο σε πραγματικό χρόνο. Το MBP προς το παρόν είναι λογιστικό· μελλοντικές εκδόσεις θα το χρησιμοποιήσουν για φήμη, κίνητρα και προτεραιότητα δρομολόγησης.\n- **Χωρίς onboarding**: η πρώτη εκκίνηση φέρνει seed κόμβους από το επίσημο endpoint (ή τοπικό mock) και μετά λειτουργεί πλήρως σε λειτουργία P2P.",
    "features": "| Δυνατότητα | Σημειώσεις |\n|---|---|\n| **Μεταφορά P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Αποκεντρωμένη εμπιστοσύνη** | 4 σκληρά κωδικοποιημένα seed peer-id ως άγκυρες εμπιστοσύνης· νέοι peers μπαίνουν μέσω αλυσίδας εμπιστοσύνης (επόμενο ορόσημο) |\n| **Εφεδρικό cold start** | Η πρώτη εκκίνηση φέρνει κόμβους από το επίσημο HTTPS endpoint ή τοπικό mock· όλα καταλήγουν στο `<userData>/bootstrap-cache.json` |\n| **Δρομολόγηση πολλαπλών παρόχων** | Ένας peer μπορεί να φιλοξενεί OpenAI + Anthropic + Google ταυτόχρονα· οι καλούντες δρομολογούν κατά `model.id` |\n| **Συμβατό με OpenAI proxy** | Τοπικό HTTP proxy στο `:18100`· κάθε συμβατός με OpenAI/Anthropic πελάτης λειτουργεί αμέσως |\n| **Auth με κλειδί API (προαιρετικό)** | Σταθεροποιήστε ένα κλειδί στο proxy κατανάλωσης· οι καλούντες πρέπει να στέλνουν `Authorization: Bearer <key>` |\n| **22 γλώσσες** | Ελληνικά από προεπιλογή· υποστήριξη RTL αραβικών |\n| **Ανοιχτό θέμα default** | Εναλλαγή σε σκούρο / ακολουθία λειτουργικού |",
    "screenshots": "Αρχική, Μοντέλα, Πορτοφόλι, Αρχεία, Ρυθμίσεις — πέντε οθόνες συνολικά. Στιγμιότυπα πλήρους ανάλυσης στο [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (cache models.dev)                 │\n│              ├─ registry    (επίσημο API + fallback cache)    │\n│              ├─ p2p         (daemon libp2p)                    │\n│              ├─ provisioner (δρομολογητής πολλαπλών παρόχων)  │\n│              ├─ proxy-server (HTTP συμβατό με OpenAI)          │\n│              ├─ upstream    (πραγματικές κλήσεις API)         │\n│              ├─ wallet      (υπολογισμός MBP)                   │\n│              └─ models      (συγκεντρωτής καταλόγου)          │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   Δίκτυο P2P      │\n              └──────────────────┘\n```\n\n```bash\n# Ανακοίνωση κόμβου v2 — δείτε την επόμενη ενότητα\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Τοπικό proxy κατανάλωσης\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Τέσσερα seed peer-id είναι ενσωματωμένα στο δυαδικό (`src/main/config/trusted-roots.ts`). Ροή cold start:\n\n1. Το τοπικό cache είναι άδειο στην πρώτη εκκίνηση\n2. Παράλληλη λήψη: επίσημο HTTPS endpoint + ρυθμισμένα `bootstrapMultiaddrs` + mDNS\n3. Επικύρωση κάθε peerId με το `TRUSTED_ROOT_PEER_IDS`\n4. Αποθήκευση του επικυρωμένου υποσυνόλου στο `<userData>/bootstrap-cache.json`\n5. Ο daemon P2P ξεκινά· τα cache hits μένουν σε P2P λειτουργία· τα misses ξαναδοκιμάζουν το επίσημο endpoint κάθε ώρα\n\n```\n4 σκληρά ρίζες  ←  άγκυρες εμπιστοσύνης\n└─ από το επίσημο endpoint (cache)\n   ├─ απευθείας σύνδεση μέσω bootstrapMultiaddrs\n   ├─ mDNS (ανακάλυψη LAN)\n   └─ libp2p DHT findProviders (καθαρό P2P)\n```\n\nΤο επίσημο endpoint διατηρείται **για πάντα** ως κανάλι διάσωσης, ακόμη κι όταν το δίκτυο P2P είναι υγιές.",
    "schema": "Αίτημα: `<https://modelbus.cc/api/v1/nodes>` επιστρέφει `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nΠεδία:\n\n- **version** `2`: έκδοση σχήματος· +1 σε ασύμβατες αλλαγές\n- **peerId**: libp2p PeerId, παγκοσμίως μοναδικό\n- **nickname**: αναγνώσιμο όνομα\n- **providers[]**: LLM πάροχοι που φιλοξενεί αυτός ο κόμβος\n  - **providerId**: id παρόχου στο models.dev\n  - **providerName**: εμφανιζόμενο όνομα\n  - **models[]**: μοντέλα κάτω από αυτόν τον πάροχο· το καθένα έχει `id` (κανονικό) και `name` (εμφάνιση)\n- **addr**: ενιαία κύρια προσβάσιμη διεύθυνση (ενικός)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: Unix ms τελευταίας ενημέρωσης\n- **expiresAt**: μαλακό TTL· οι ληγμένες εγγραφές παραμένουν χρησιμοποιήσιμες με μικρότερο βάρος\n\nΟι τελευταίες 4 εγγραφές στο `mock/nodes.json` είναι οι αξιόπιστοι seed κόμβοι· τα peerIds τους ταιριάζουν με το `trusted-roots.ts`.",
    "flow": "**Provision** (εσείς = κάτοχος Token): Ρυθμίσεις → Κοινή χρήση Token → επιλέξτε πάροχο, επικολλήστε το κλειδί API, σημειώστε μοντέλα → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (εσείς = καταναλωτής Token): επιλέξτε αξιόπιστο κόμβο στην καρτέλα Μοντέλα → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → έρχεται ένα POST HTTP → εξάγετε `body.model` → καλέστε τον κόμβο → γράψτε `InferenceRequest` (JSON + πρόθεμα μήκους) → περιμένετε `InferenceResponse` → γράψτε την HTTP απόκριση.\n\n**Δρομολόγηση αιτήματος** (στον καλούμενο `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ ταίριασμα: config παρόχου openai\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ πραγματική κλήση, επιστροφή απόκρισης\n  └─ χωρίς ταίριασμα: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Οι επίσημοι εγκαταστάτες (πακέτα Windows / macOS / Linux, και αργότερα mobile και Web SDK) ετοιμάζονται.\n\n**Για να το χρησιμοποιήσετε τώρα: χτίστε από τον πηγαίο κώδικα**\n\n```bash\npnpm install\npnpm run dev          # λειτουργία ανάπτυξης (Electron + Vite HMR)\npnpm run package:mac  # dmg για macOS\npnpm run package:win  # nsis για Windows\npnpm run package:linux # AppImage για Linux\n```\n\nΤα τεχνουργήματα καταλήγουν στο `release/`.\n\n**Κανάλια διανομής (σχεδιασμένα)**: επίσημη σελίδα λήψης · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Ο επίσημος τομέας παραμένει μόνιμο endpoint διάσωσης.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nΣτην πρώτη εκκίνηση η εφαρμογή δείχνει στην `mock/nodes.json`, οπότε ολόκληρη η ροή λειτουργεί χωρίς δίκτυο. Λεπτομέρειες στο κεντρικό [README.md](../README.md) και στον φάκελο [docs/](../docs/).",
    "roadmap": "- ✅ v1: πολλαπλοί πάροχοι, επίσημο cold start, άγκυρες εμπιστοσύνης, P2P προώθηση, 22 γλώσσες, σκελετός Πορτοφολιού\n- 🔜 v2: αλυσίδα εμπιστοσύνης (trustChain) — βιβλίο προσκλήσεων με υπογραφή Ed25519\n- 🔜 v3: αξιολόγηση ποιότητας κόμβου βάσει πραγματικών μετρήσεων (καθυστέρηση, σφάλματα, χρόνος λειτουργίας)\n- 🔜 v4: βρόχος οικονομίας token — το MBP καθοδηγεί προτεραιότητα δρομολόγησης, ενίσχυση cold start και ανακάλυψη κόμβων\n- 🔜 v5: κινητοί κόμβοι\n- 🔜 v6: Web SDK — `<modelbus>` στον browser"
  }
},


  'uk-UA': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : Децентралізована платформа обміну токенами LLM",
  "tagline": "Можливо, перша у світі платформа, де кожен може під'єднати свій токен до P2P-мережі й натомість використовувати токени, які поширюють інші піри. Без центрального сервера, без реєстрації акаунта, жоден API-ключ ніколи не залишає вашу машину.",
  "statusSentence": "ModelBus-P2P все ще в розробці та публічному тестуванні.",
  "sections": {
    "toc": "## Зміст",
    "what": "## Що це таке",
    "features": "## Основні можливості",
    "screenshots": "## Скріншоти",
    "architecture": "## Архітектура",
    "decentralised": "## Децентралізований дизайн",
    "schema": "## Формат оголошення вузла (v2)",
    "flow": "## Потік запиту",
    "download": "## Завантаження та використання (скоро)",
    "quickstart": "## Швидкий старт",
    "roadmap": "## Дорожня карта"
  },
  "body": {
    "what": "ModelBus-P2P — це настільний клієнт на базі [js-libp2p](https://github.com/libp2p/js-libp2p) та Electron. Він вирішує проблему, знайому майже кожному: **цього місяця залишається, наступного не вистачає.**\n\n> Сценарій: ви платите за OpenAI або Claude і рідко вичерпуєте місячний ліміт. Замість того щоб дати йому згаснути, під'єднайте його до P2P-мережі. Кожен запит, що проходить через ваш вузол, перетворюється на **токени MBP** (хвилини онлайн × 0,05 + кількість розданих токенів × 2 + обслужені запити × 0,1 + швидкість відповіді × 0,5). Коли наступного місяця ліміт закінчується, ви витрачаєте ці MBP, щоб викликати токени, які діляться інші піри. Жоден центральний сервер не втручається, і ваш API-ключ залишається на вашій машині.\n\n- **Provision / Share**: зареєструйте API-ключ вашої підписки та моделі, якими хочете поділитися. Мережа дізнається ваш peerId.\n- **Consume / Drive**: підніміть локальний сумісний з OpenAI HTTP-проксі на `http://127.0.0.1:18100`; спрямуйте на нього будь-який сумісний клієнт; запити пересилаються через P2P піру, який фактично зберігає токен.\n- **Wallet**: кожне надання або виклик накопичує токени MBP. Вкладка Головна та сторінка Wallet показують баланс, розбивку та формулу в реальному часі. Зараз MBP — це лише облік; майбутні версії використають його для репутації, заохочень і пріоритетної маршрутизації.\n- **Без онбордингу**: перший запуск отримує вузли-сиди з офіційного ендпоінта (або локального mock), після чого повністю працює в режимі P2P.",
    "features": "| Функція | Примітки |\n|---|---|\n| **P2P-транспорт** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Децентралізована довіра** | 4 зашитих ID вузлів-сидів як якорі довіри; нові піри входять через ланцюг довіри (наступна віха) |\n| **Холодний старт** | Перший запуск отримує вузли з офіційного HTTPS-ендпоінта або локального mock; усе потрапляє до `<userData>/bootstrap-cache.json` |\n| **Мульти-провайдер маршрутизація** | Один пір може хостити OpenAI + Anthropic + Google одночасно; викликачі маршрутизують за `model.id` |\n| **Проксі, сумісний з OpenAI** | Локальний HTTP-проксі на `:18100`; будь-який сумісний з OpenAI/Anthropic клієнт працює одразу |\n| **Auth за API-ключем (опціонально)** | Зафіксуйте ключ у проксі споживання; викликачі повинні надсилати `Authorization: Bearer <key>` |\n| **22 мови** | Українська за замовчуванням; підтримка арабської RTL |\n| **Світла тема за замовчуванням** | Перемикання на темну / слідувати ОС |",
    "screenshots": "Головна, Моделі, Гаманець, Журнали, Налаштування — загалом п'ять видів. Скріншоти в повній роздільності в [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (кэш models.dev)                   │\n│              ├─ registry    (офіційний API + фолбек кешу)      │\n│              ├─ p2p         (демон libp2p)                     │\n│              ├─ provisioner (мульти-провайдер маршрутизатор)   │\n│              ├─ proxy-server (HTTP сумісний з OpenAI)          │\n│              ├─ upstream    (реальні виклики API)              │\n│              ├─ wallet      (розрахунок MBP)                   │\n│              └─ models      (агрегатор каталогу)               │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   P2P-мережа      │\n              └──────────────────┘\n```\n\n```bash\n# Оголошення вузла v2 — див. наступний розділ\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Локальний проксі споживання\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Чотири ID вузлів-сидів вшиті в бінарник (`src/main/config/trusted-roots.ts`). Потік холодного старту:\n\n1. Локальний кеш порожній при першому запуску\n2. Паралельне отримання: офіційний HTTPS-ендпоінт + налаштовані `bootstrapMultiaddrs` + mDNS\n3. Перевірка кожного peerId за `TRUSTED_ROOT_PEER_IDS`\n4. Збереження перевіреної підмножини в `<userData>/bootstrap-cache.json`\n5. Демон P2P стартує; влучання в кеш залишаються в режимі P2P; промахи повторюють офіційний ендпоінт щогодини\n\n```\n4 зашитих корені  ←  якорі довіри\n└─ у кеші з офіційного ендпоінта\n   ├─ пряме підключення через bootstrapMultiaddrs\n   ├─ mDNS (виявлення в LAN)\n   └─ libp2p DHT findProviders (чистий P2P)\n```\n\nОфіційний ендпоінт зберігається **назавжди** як канал порятунку, навіть коли P2P-мережа здорова.",
    "schema": "Запит: `<https://modelbus.cc/api/v1/nodes>` повертає `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nПоля:\n\n- **version** `2`: версія схеми; +1 при сумісних зламах\n- **peerId**: libp2p PeerId, глобально унікальний\n- **nickname**: зрозуміле ім'я\n- **providers[]**: LLM-провайдери, які хостить цей пір\n  - **providerId**: id провайдера в models.dev\n  - **providerName**: відображуване ім'я\n  - **models[]**: моделі під цим провайдером; кожна має `id` (канонічний) і `name` (відображуваний)\n- **addr**: єдина основна адреса (однина)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: Unix-мс останнього оновлення\n- **expiresAt**: м'який TTL; застарілі записи все ще придатні, але з меншою вагою\n\nОстанні 4 записи в `mock/nodes.json` — довірені вузли-сиди; їхні peerId збігаються з `trusted-roots.ts`.",
    "flow": "**Provision** (ви = власник токена): Налаштування → Поділитися токеном → виберіть провайдера, вставте API-ключ, позначте моделі → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (ви = споживач токена): виберіть довірений пір на вкладці Моделі → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → надходить POST HTTP → витягніть `body.model` → наберіть пір → запишіть `InferenceRequest` (JSON + префікс довжини) → блокуюче чекайте `InferenceResponse` → запишіть HTTP-відповідь.\n\n**Маршрутизація запиту** (на викликаному пірі `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ збіг: конфігурація провайдера openai\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ реальний виклик, повернути відповідь\n  └─ немає збігу: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Офіційні інсталятори (пакети Windows / macOS / Linux, а пізніше мобільний і Web SDK) зараз готуються.\n\n**Щоб скористатися зараз: зберіть із джерел**\n\n```bash\npnpm install\npnpm run dev          # режим розробки (Electron + Vite HMR)\npnpm run package:mac  # dmg для macOS\npnpm run package:win  # nsis для Windows\npnpm run package:linux # AppImage для Linux\n```\n\nАртефакти потрапляють у `release/`.\n\n**Канали поширення (заплановані)**: офіційна сторінка завантаження · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Офіційний домен залишається рятувальним ендпоінтом назавжди.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nПри першому запуску застосунок за замовчуванням вказує на `mock/nodes.json`, тож увесь потік працює без мережі. Деталі в головному [README.md](../README.md) та папці [docs/](../docs/).",
    "roadmap": "- ✅ v1: мульти-провайдер, офіційний холодний старт, якорі довіри, P2P-пересилка, 22 мови, каркас гаманця\n- 🔜 v2: ланцюг довіри (trustChain) — реєстр запрошень із підписом Ed25519\n- 🔜 v3: оцінка якості вузла за реальними метриками (затримка, помилки, час роботи)\n- 🔜 v4: цикл токен-економіки — MBP веде пріоритетну маршрутизацію, буст холодного старту та виявлення вузлів\n- 🔜 v5: мобільні піри\n- 🔜 v6: веб-SDK — `<modelbus>` у браузері"
  }
},
  'vi-VN': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : Nền tảng chia sẻ Token LLM phi tập trung",
  "tagline": "Có thể là nền tảng đầu tiên trên thế giới, nơi bất kỳ ai cũng có thể gắn Token của mình vào mạng P2P và đổi lại sử dụng Token được chia sẻ bởi các peer khác. Không có máy chủ trung tâm, không cần đăng ký tài khoản, không có API key nào rời khỏi máy của bạn.",
  "statusSentence": "ModelBus-P2P vẫn đang trong giai đoạn phát triển và thử nghiệm công khai.",
  "sections": {
    "toc": "## Mục lục",
    "what": "## Đây là gì",
    "features": "## Tính năng chính",
    "screenshots": "## Ảnh chụp màn hình",
    "architecture": "## Kiến trúc",
    "decentralised": "## Thiết kế phi tập trung",
    "schema": "## Định dạng thông báo nút (v2)",
    "flow": "## Luồng yêu cầu",
    "download": "## Tải về và sử dụng (sắp ra mắt)",
    "quickstart": "## Bắt đầu nhanh",
    "roadmap": "## Lộ trình"
  },
  "body": {
    "what": "ModelBus-P2P là một ứng dụng máy tính để bàn được xây dựng trên [js-libp2p](https://github.com/libp2p/js-libp2p) và Electron. Nó giải quyết một vấn đề mà hầu như ai cũng gặp: **tháng này thừa, tháng sau thiếu.**\n\n> Kịch bản: bạn trả phí cho OpenAI hoặc Claude nhưng hiếm khi dùng hết hạn mức hàng tháng. Thay vì để nó hết hạn, hãy gắn nó vào mạng P2P. Mỗi yêu cầu đi qua nút của bạn được quy đổi thành **token MBP** (phút trực tuyến × 0,05 + số Token chia sẻ × 2 + yêu cầu đã phục vụ × 0,1 + tốc độ phản hồi × 0,5). Khi tháng sau hạn mức cạn kiệt, bạn dùng số MBP đó để gọi Token do các peer khác chia sẻ. Không có máy chủ trung tâm nào can thiệp, và API key luôn ở trên máy của bạn.\n\n- **Provision / Share**: đăng ký API key của gói đăng ký và các mô hình muốn chia sẻ. Mạng sẽ biết peerId của bạn.\n- **Consume / Drive**: bật proxy HTTP cục bộ tương thích OpenAI tại `http://127.0.0.1:18100`; trỏ bất kỳ ứng dụng tương thích nào vào đó; yêu cầu được chuyển tiếp qua P2P đến peer thực sự giữ Token.\n- **Wallet**: mỗi lần chia sẻ hoặc gọi đều tích lũy token MBP. Tab Trang chính và trang Wallet hiển thị số dư, phân tích và công thức theo thời gian thực. Hiện MBP chỉ mang tính kế toán; các phiên bản tương lai sẽ dùng cho uy tín, khuyến khích và định tuyến ưu tiên.\n- **Không cần thiết lập**: lần khởi động đầu tiên lấy nút seed từ endpoint chính thức (hoặc bản mock cục bộ), rồi hoạt động hoàn toàn ở chế độ P2P.",
    "features": "| Tính năng | Ghi chú |\n|---|---|\n| **Vận chuyển P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Tin cậy phi tập trung** | 4 peerId seed được mã hoá cứng làm neo tin cậy; peer mới tham gia qua chuỗi tin cậy (cột mốc tiếp theo) |\n| **Dự phòng khởi động nguội** | Lần chạy đầu lấy nút từ endpoint HTTPS chính thức hoặc bản mock cục bộ; tất cả nằm trong `<userData>/bootstrap-cache.json` |\n| **Định tuyến nhiều nhà cung cấp** | Một peer có thể chứa OpenAI + Anthropic + Google cùng lúc; người gọi định tuyến theo `model.id` |\n| **Proxy tương thích OpenAI** | Proxy HTTP cục bộ tại `:18100`; mọi ứng dụng tương thích OpenAI/Anthropic chạy ngay |\n| **Xác thực API key (tuỳ chọn)** | Đặt một khoá cố định trong proxy tiêu thụ; người gọi phải gửi `Authorization: Bearer <key>` |\n| **22 ngôn ngữ** | Tiếng Việt mặc định; hỗ trợ tiếng Ả Rập RTL |\n| **Giao diện sáng mặc định** | Chuyển sang tối / theo hệ điều hành |",
    "screenshots": "Trang chính, Mô hình, Ví, Nhật ký, Cài đặt — tổng cộng năm màn hình. Ảnh độ phân giải đầy đủ nằm trong [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (bộ nhớ đệm models.dev)            │\n│              ├─ registry    (API chính thức + dự phòng cache)  │\n│              ├─ p2p         (daemon libp2p)                    │\n│              ├─ provisioner (bộ định tuyến nhiều nhà cung cấp) │\n│              ├─ proxy-server (HTTP tương thích OpenAI)         │\n│              ├─ upstream    (gọi API thật)                     │\n│              ├─ wallet      (tính điểm MBP)                    │\n│              └─ models      (tổng hợp danh mục)                │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   Mạng P2P        │\n              └──────────────────┘\n```\n\n```bash\n# Thông báo nút v2 — xem phần tiếp theo\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Proxy tiêu thụ cục bộ\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Bốn peerId seed được nhúng vào tệp nhị phân (`src/main/config/trusted-roots.ts`). Luồng khởi động nguội:\n\n1. Bộ nhớ đệm cục bộ trống ở lần chạy đầu\n2. Lấy song song: endpoint HTTPS chính thức + `bootstrapMultiaddrs` đã cấu hình + mDNS\n3. Xác thực từng peerId với `TRUSTED_ROOT_PEER_IDS`\n4. Lưu tập con đã xác thực vào `<userData>/bootstrap-cache.json`\n5. Daemon P2P khởi động; cache trúng giữ ở chế độ P2P; trượt thì thử lại endpoint chính thức mỗi giờ\n\n```\n4 gốc nhúng  ←  neo tin cậy\n└─ từ cache của endpoint chính thức\n   ├─ kết nối trực tiếp qua bootstrapMultiaddrs\n   ├─ mDNS (dò tìm LAN)\n   └─ libp2p DHT findProviders (P2P thuần)\n```\n\nEndpoint chính thức được giữ **mãi mãi** làm kênh cứu hộ, ngay cả khi mạng P2P hoạt động tốt.",
    "schema": "Yêu cầu: `<https://modelbus.cc/api/v1/nodes>` trả về `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nCác trường:\n\n- **version** `2`: phiên bản schema; +1 với thay đổi phá vỡ\n- **peerId**: libp2p PeerId, duy nhất toàn cầu\n- **nickname**: tên dễ đọc\n- **providers[]**: nhà cung cấp LLM mà peer này lưu trữ\n  - **providerId**: id nhà cung cấp trong models.dev\n  - **providerName**: tên hiển thị\n  - **models[]**: mô hình thuộc nhà cung cấp này; mỗi mô hình có `id` (chuẩn) và `name` (hiển thị)\n- **addr**: địa chỉ chính duy nhất có thể truy cập (số ít)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: mili giây Unix của lần cập nhật cuối\n- **expiresAt**: TTL mềm; mục hết hạn vẫn dùng được nhưng trọng số thấp hơn\n\n4 mục cuối trong `mock/nodes.json` là peer seed tin cậy; peerId của chúng khớp với `trusted-roots.ts`.",
    "flow": "**Provision** (bạn = người giữ Token): Cài đặt → Chia sẻ Token → chọn nhà cung cấp, dán API key, đánh dấu mô hình → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (bạn = người dùng Token): chọn peer tin cậy trong tab Mô hình → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → một POST đến → trích `body.model` → quay số peer → ghi `InferenceRequest` (JSON + tiền tố độ dài) → chờ `InferenceResponse` → ghi phản hồi HTTP.\n\n**Định tuyến yêu cầu** (phía peer được gọi `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ khớp: cấu hình nhà cung cấp openai\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ gọi thật, trả về phản hồi\n  └─ không khớp: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Bộ cài chính thức (gói Windows / macOS / Linux, và sau đó mobile và Web SDK) đang được chuẩn bị.\n\n**Để dùng ngay: build từ mã nguồn**\n\n```bash\npnpm install\npnpm run dev          # chế độ phát triển (Electron + Vite HMR)\npnpm run package:mac  # dmg cho macOS\npnpm run package:win  # nsis cho Windows\npnpm run package:linux # AppImage cho Linux\n```\n\nSản phẩm nằm trong `release/`.\n\n**Kênh phân phối (dự kiến)**: trang tải chính thức · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Tên miền chính thức luôn là endpoint cứu hộ.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nLần chạy đầu tiên ứng dụng mặc định trỏ tới `mock/nodes.json`, nhờ vậy toàn bộ luồng hoạt động không cần mạng. Chi tiết xem [README.md](../README.md) chính và thư mục [docs/](../docs/).",
    "roadmap": "- ✅ v1: đa nhà cung cấp, khởi động nguội chính thức, neo tin cậy, chuyển tiếp P2P, 22 ngôn ngữ, khung Ví\n- 🔜 v2: chuỗi tin cậy (trustChain) — sổ mời ký bằng Ed25519\n- 🔜 v3: đánh giá chất lượng nút bằng chỉ số thực (độ trễ, tỷ lệ lỗi, thời gian hoạt động)\n- 🔜 v4: vòng lặp kinh tế token — MBP dẫn dắt định tuyến ưu tiên, tăng tốc khởi động nguội và khám phá nút\n- 🔜 v5: peer di động\n- 🔜 v6: SDK web — `<modelbus>` trong trình duyệt"
  }
},


  'th-TH': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : แพลตฟอร์มแบ่งปัน Token LLM แบบกระจายศูนย์",
  "tagline": "อาจเป็นแพลตฟอร์มแรกของโลกที่ทุกคนสามารถแขวน Token ของตนเองบนเครือข่าย P2P และเรียกใช้ Token ที่เพียร์อื่นแชร์ไว้ ไม่มีเซิร์ฟเวอร์กลาง ไม่ต้องสมัครบัญชี ไม่มี API Key หลุดออกจากเครื่องของคุณ",
  "statusSentence": "ModelBus-P2P ยังอยู่ในขั้นตอนการพัฒนาและทดสอบสาธารณะ",
  "sections": {
    "toc": "## สารบัญ",
    "what": "## คืออะไร",
    "features": "## คุณสมบัติหลัก",
    "screenshots": "## ภาพหน้าจอ",
    "architecture": "## สถาปัตยกรรม",
    "decentralised": "## การออกแบบแบบกระจายศูนย์",
    "schema": "## รูปแบบการประกาศโหนด (v2)",
    "flow": "## ขั้นตอนคำขอ",
    "download": "## ดาวน์โหลดและใช้งาน (เร็ว ๆ นี้)",
    "quickstart": "## เริ่มต้นอย่างรวดเร็ว",
    "roadmap": "## แผนงาน"
  },
  "body": {
    "what": "ModelBus-P2P เป็นไคลเอนต์เดสก์ท็อปที่สร้างจาก [js-libp2p](https://github.com/libp2p/js-libp2p) และ Electron แก้ปัญหาที่แทบทุกคนรู้จัก: **เดือนนี้เหลือ เดือนหน้าไม่พอ**\n\n> สถานการณ์: คุณจ่ายเงินสำหรับ OpenAI หรือ Claude แต่แทบไม่ได้ใช้โควตารายเดือนจนหมด แทนที่จะปล่อยให้หมดอายุ ให้แขวนมันไว้บนเครือข่าย P2P ทุกคำขอที่ผ่านโหนดของคุณจะถูกแปลงเป็น **โทเคน MBP** (นาทีออนไลน์ × 0.05 + จำนวน Token ที่แชร์ × 2 + คำขอที่ให้บริการ × 0.1 + ความเร็วการตอบสนอง × 0.5) เมื่อเดือนถัดมาโควตาขาดแคลน คุณใช้ MBP เหล่านั้นเพื่อเรียก Token ที่เพียร์อื่นแชร์ไว้ ไม่มีเซิร์ฟเวอร์กลางเข้ามาเกี่ยวข้อง และ API Key ยังคงอยู่บนเครื่องของคุณ\n\n- **Provision / Share**: ลงทะเบียน API Key ของการสมัครสมาชิกและโมเดลที่ต้องการแชร์ เครือข่ายจะรู้จัก peerId ของคุณ\n- **Consume / Drive**: เปิดพร็อกซี HTTP ในเครื่องที่เข้ากันได้กับ OpenAI ที่ `http://127.0.0.1:18100` ชี้ไคลเอนต์ที่เข้ากันได้ไปที่นั่น คำขอจะถูกส่งต่อผ่าน P2P ไปยังเพียร์ที่ถือ Token จริง\n- **Wallet**: การแชร์หรือการเรียกแต่ละครั้งจะสะสมโทเคน MBP แท็บหน้าแรกและหน้า Wallet แสดงยอดคงเหลือ รายละเอียด และสูตรแบบเรียลไทม์ ตอนนี้ MBP เป็นเพียงการบันทึกบัญชี เวอร์ชันอนาคตจะใช้สำหรับชื่อเสียง สิ่งจูงใจ และการจัดลำดับความสำคัญ\n- **ไม่ต้องเตรียมการ**: การเปิดครั้งแรกจะดึงโหนด seed จาก endpooint อย่างเป็นทางการ (หรือ mock ในเครื่อง) แล้วทำงานในโหมด P2P เต็มรูปแบบ",
    "features": "| คุณสมบัติ | หมายเหตุ |\n|---|---|\n| **การขนส่ง P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **ความไว้วางใจแบบกระจายศูนย์** | peerId seed 4 ตัวที่ฮาร์ดโค้ดไว้เป็นจุดยึดความไว้วางใจ เพียร์ใหม่เข้าร่วมผ่านห่วงโซ่ความไว้วางใจ (ขั้นต่อไป) |\n| **สำรองการเริ่มต้นเร็ว** | การเปิดครั้งแรกดึงโหนดจาก endpooint HTTPS อย่างเป็นทางการหรือ mock ในเครื่อง ทั้งหมดอยู่ใน `<userData>/bootstrap-cache.json` |\n| **การจัดเส้นทางหลายผู้ให้บริการ** | เพียร์เดียวสามารถโฮสต์ OpenAI + Anthropic + Google พร้อมกัน ผู้เรียกจัดเส้นทางตาม `model.id` |\n| **พร็อกซีที่เข้ากันได้กับ OpenAI** | พร็อกซี HTTP ในเครื่องที่ `:18100` ไคลเอนต์ที่เข้ากันได้กับ OpenAI/Anthropic ทำงานได้ทันที |\n| **การยืนยันด้วย API Key (ไม่บังคับ)** | ตั้งคีย์คงที่ในพร็อกซีฝั่งผู้ใช้ ผู้เรียกต้องส่ง `Authorization: Bearer <key>` |\n| **22 ภาษา** | ค่าเริ่มต้นเป็นไทย รองรับอาหรับ RTL |\n| **ธีมสว่างเป็นค่าเริ่มต้น** | สลับเป็นมืด / ตามระบบปฏิบัติการ |",
    "screenshots": "หน้าแรก, โมเดล, กระเป๋าเงิน, บันทึก, การตั้งค่า — รวม 5 มุมมอง ภาพหน้าจอความละเอียดเต็มอยู่ใน [docs/image/](../docs/image/)",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (แคช models.dev)                 │\n│              ├─ registry    (API ทางการ + แคชสำรอง)           │\n│              ├─ p2p         (daemon libp2p)                   │\n│              ├─ provisioner (เราเตอร์หลายผู้ให้บริการ)          │\n│              ├─ proxy-server (HTTP ที่เข้ากันได้กับ OpenAI)  │\n│              ├─ upstream    (เรียก API จริง)                  │\n│              ├─ wallet      (คำนวณคะแนน MBP)                   │\n│              └─ models      (รวมแคตตาล็อก)                     │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   เครือข่าย P2P    │\n              └──────────────────┘\n```\n\n```bash\n# การประกาศโหนด v2 — ดูหัวข้อถัดไป\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# พร็อกซีฝั่งผู้ใช้ในเครื่อง\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "peerId seed 4 ตัวถูกฝังในไบนารี (`src/main/config/trusted-roots.ts`) ขั้นตอนการเริ่มต้นเร็ว:\n\n1. แคชในเครื่องว่างเปล่าเมื่อเปิดครั้งแรก\n2. ดึงพร้อมกัน: endpooint HTTPS ทางการ + `bootstrapMultiaddrs` ที่ตั้งค่าไว้ + mDNS\n3. ตรวจสอบแต่ละ peerId กับ `TRUSTED_ROOT_PEER_IDS`\n4. บันทึกชุดย่อยที่ตรวจแล้วลง `<userData>/bootstrap-cache.json`\n5. daemon P2P เริ่มทำงาน กรณีแคชตรงจะอยู่ในโหมด P2P กรณีไม่ตรงจะลอง endpooint ทางการใหม่ทุกชั่วโมง\n\n```\n4 รากที่ฮาร์ดโค้ด  ←  จุดยึดความไว้วางใจ\n└─ จากแคชของ endpooint ทางการ\n   ├─ เชื่อมต่อตรงผ่าน bootstrapMultiaddrs\n   ├─ mDNS (ค้นหาใน LAN)\n   └─ libp2p DHT findProviders (P2P ล้วน)\n```\n\nendpooint ทางการจะคงอยู่ **ตลอดไป** เป็นช่องทางกู้ภัย แม้เครือข่าย P2P จะปกติ",
    "schema": "คำขอ: `<https://modelbus.cc/api/v1/nodes>` คืนค่า `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nฟิลด์:\n\n- **version** `2`: เวอร์ชัน schema เพิ่ม +1 เมื่อมีการเปลี่ยนแปลงที่พัง\n- **peerId**: libp2p PeerId ไม่ซ้ำทั่วโลก\n- **nickname**: ชื่อที่อ่านได้\n- **providers[]**: ผู้ให้บริการ LLM ที่เพียร์นี้โฮสต์\n  - **providerId**: id ผู้ให้บริการใน models.dev\n  - **providerName**: ชื่อที่แสดง\n  - **models[]**: โมเดลภายใต้ผู้ให้บริการนี้ แต่ละรายการมี `id` (บัญญัติ) และ `name` (แสดง)\n- **addr**: ที่อยู่หลักเดียวที่เข้าถึงได้ (เอกพจน์ ไม่ใช่พหูพจน์)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: มิลลิวินาที Unix ของการอัปเดตครั้งล่าสุด\n- **expiresAt**: TTL แบบยืดหยุ่น รายการหมดอายุยังใช้ได้แต่น้ำหนักต่ำลง\n\n4 รายการสุดท้ายใน `mock/nodes.json` คือเพียร์ seed ที่เชื่อถือได้ peerId ตรงกับ `trusted-roots.ts`",
    "flow": "**Provision** (คุณ = ผู้ถือ Token): การตั้งค่า → แชร์ Token → เลือกผู้ให้บริการ วาง API Key ทำเครื่องหมายโมเดล → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`\n\n**Consume** (คุณ = ผู้ใช้ Token): เลือกเพียร์ที่เชื่อถือได้ในแท็บโมเดล → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → รับ HTTP POST → ดึง `body.model` → โทรหาเพียร์ → เขียน `InferenceRequest` (JSON + คำนำหน้าความยาว) → รอ `InferenceResponse` → เขียนคำตอบ HTTP\n\n**การจัดเส้นทางคำขอ** (ที่ฝั่งผู้ถูกเรียก `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ ตรง: การตั้งค่าผู้ให้บริการ openai\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ เรียกจริง คืนคำตอบ\n  └─ ไม่ตรง: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 ตัวติดตั้งอย่างเป็นทางการ (แพ็กเกจ Windows / macOS / Linux และต่อมามือถือและ Web SDK) กำลังเตรียมการ\n\n**วิธีใช้ตอนนี้: สร้างจากซอร์สโค้ด**\n\n```bash\npnpm install\npnpm run dev          # โหมดพัฒนา (Electron + Vite HMR)\npnpm run package:mac  # dmg สำหรับ macOS\npnpm run package:win  # nsis สำหรับ Windows\npnpm run package:linux # AppImage สำหรับ Linux\n```\n\nผลลัพธ์อยู่ใน `release/`\n\n**ช่องทางเผยแพร่ (ตามแผน)**: หน้าโหลดอย่างเป็นทางการ · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew โดเมนทางการเป็น endpooint กู้ภัยถาวร",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nเมื่อเปิดครั้งแรกแอปชี้ไปที่ `mock/nodes.json` เป็นค่าเริ่มต้น ดังนั้นโฟลว์ทั้งหมดทำงานได้โดยไม่ต้องมีเครือข่าย รายละเอียดเพิ่มเติมใน [README.md](../README.md) หลักและโฟลเดอร์ [docs/](../docs/)",
    "roadmap": "- ✅ v1: หลายผู้ให้บริการ, เริ่มต้นเร็วอย่างเป็นทางการ, จุดยึดความไว้วางใจ, ส่งต่อ P2P, 22 ภาษา, โครงกระเป๋าเงิน\n- 🔜 v2: ห่วงโซ่ความไว้วางใจ (trustChain) — สมุดเชิญที่ลงนามด้วย Ed25519\n- 🔜 v3: ประเมินคุณภาพโหนดด้วยเมตริกจริง (ความหน่วง, อัตราข้อผิดพลาด, อัปไทม์)\n- 🔜 v4: วัฏจักรเศรษฐกิจโทเคน — MBP ขับเคลื่อนการจัดเส้นทางลำดับความสำคัญ, บูสต์การเริ่มต้นเร็ว, ค้นพบโหนด\n- 🔜 v5: เพียร์มือถือ\n- 🔜 v6: SDK เว็บ — `<modelbus>` ในเบราว์เซอร์"
  }
},
  'tr-TR': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : Merkezi Olmayan LLM Token Paylaşım Platformu",
  "tagline": "Belki de dünyanın ilk platformu: herkes Token'ını bir P2P ağına bağlayabilir ve karşılığında diğer eşlerin paylaştığı Token'ları kullanabilir. Merkezi sunucu yok, hesap yok, API anahtarı makinenizden asla çıkmaz.",
  "statusSentence": "ModelBus-P2P hâlâ geliştirme ve herkese açık test aşamasında.",
  "sections": {
    "toc": "## İçindekiler",
    "what": "## Nedir",
    "features": "## Temel özellikler",
    "screenshots": "## Ekran görüntüleri",
    "architecture": "## Mimari",
    "decentralised": "## Merkeziyetsiz tasarım",
    "schema": "## Düğüm duyuru biçimi (v2)",
    "flow": "## İstek akışı",
    "download": "## İndirme ve kullanım (yakında)",
    "quickstart": "## Hızlı başlangıç",
    "roadmap": "## Yol haritası"
  },
  "body": {
    "what": "ModelBus-P2P, [js-libp2p](https://github.com/libp2p/js-libp2p) ve Electron üzerine kurulu bir masaüstü istemcisidir. Neredeyse herkesin yaşadığı sorunu çözer: **bu ay artıyor, gelecek ay yetmiyor.**\n\n> Senaryo: OpenAI veya Claude'a ödeme yapıyorsunuz ve aylık kotanızı nadiren tüketiyorsunuz. Sona ermesine izin vermek yerine P2P ağına bağlayın. Düğümünüzden geçen her istek **MBP tokenına** dönüştürülür (çevrimiçi dakika × 0,05 + paylaşılan Token sayısı × 2 + sunulan istekler × 0,1 + yanıt hızı × 0,5). Gelecek ay kota azaldığında, diğer eşlerin paylaştığı Token'ları çağırmak için bu MBP'leri harcarsınız. Hiçbir merkezi sunucu araya girmez ve API anahtarınız makinenizde kalır.\n\n- **Provision / Share**: abonelik anahtarınızı ve paylaşmak istediğiniz modelleri kaydedin. Ağ peerId'nizi öğrenir.\n- **Consume / Drive**: `http://127.0.0.1:18100` adresinde OpenAI uyumlu yerel bir HTTP proxy başlatın; herhangi bir uyumlu istemciyi oraya yönlendirin; istekler P2P üzerinden Token'ı gerçekten tutan eşe iletilir.\n- **Wallet**: her paylaşım veya çağrı MBP tokenı biriktirir. Ana Sayfa sekmesi ve Wallet sayfası bakiyeyi, dökümü ve formülü gerçek zamanlı gösterir. MBP şimdilik sadece muhasebe amaçlı; gelecek sürümler itibar, teşvikler ve öncelikli yönlendirme için kullanacak.\n- **Kayıt gerekmez**: ilk başlatma resmi uç noktadan (veya yerel bir mock'tan) tohum düğümlerini çeker ve sonra tamamen P2P modunda çalışır.",
    "features": "| Özellik | Notlar |\n|---|---|\n| **P2P aktarım** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Merkeziyetsiz güven** | 4 sabit kodlu tohum eş kimliği güven çapası; yeni eşler güven zinciriyle katılır (sonraki kilometre taşı) |\n| **Soğuk başlangıç yedeği** | İlk başlatma resmi HTTPS uç noktasından veya yerel mock'tan düğümleri çeker; her şey `<userData>/bootstrap-cache.json` içine düşer |\n| **Çoklu sağlayıcı yönlendirme** | Bir eş aynı anda OpenAI + Anthropic + Google barındırabilir; çağıranlar `model.id` ile yönlendirir |\n| **OpenAI uyumlu proxy** | `:18100` üzerinde yerel HTTP proxy; uyumlu her istemci kutudan çıktığı gibi çalışır |\n| **API anahtarı kimliği (isteğe bağlı)** | Tüketim proxy'sinde sabit bir anahtar belirleyin; çağıranlar `Authorization: Bearer <key>` göndermeli |\n| **22 dil** | Varsayılan Türkçe; RTL Arapça destekli |\n| **Açık varsayılan tema** | Karanlık / işletim sistemini izle olarak değiştirilebilir |",
    "screenshots": "Ana Sayfa, Modeller, Wallet, Günlükler, Ayarlar — toplam beş görünüm. Tam çözünürlüklü görüntüler [docs/image/](../docs/image/) altındadır.",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (models.dev önbelleği)              │\n│              ├─ registry    (resmi API + önbellek yedeği)      │\n│              ├─ p2p         (libp2p daemon)                     │\n│              ├─ provisioner (çoklu sağlayıcı yönlendirici)     │\n│              ├─ proxy-server (OpenAI uyumlu HTTP)              │\n│              ├─ upstream    (gerçek sağlayıcı API çağrıları)  │\n│              ├─ wallet      (MBP puan hesaplama)                │\n│              └─ models      (katalog toplayıcı)                │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   P2P Ağı         │\n              └──────────────────┘\n```\n\n```bash\n# Düğüm duyurusu v2 — sonraki bölüme bakın\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Yerel tüketim proxy'si\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Dört tohum eş kimliği ikili dosyaya gömülüdür (`src/main/config/trusted-roots.ts`). Soğuk başlangıç akışı:\n\n1. İlk başlatmada yerel önbellek boştur\n2. Paralel çek: resmi HTTPS uç noktası + kullanıcının yapılandırdığı `bootstrapMultiaddrs` + mDNS\n3. Her peerId'yi `TRUSTED_ROOT_PEER_IDS` ile doğrula\n4. Doğrulanmış alt kümeyi `<userData>/bootstrap-cache.json` içine kaydet\n5. P2P daemon başlar; önbellek isabetleri P2P modunda kalır; ıskalamalar her saat resmi uç noktayı yeniden dener\n\n```\n4 sabit kök  ←  güven çapaları\n└─ resmi uç noktadan önbelleklenmiş\n   ├─ bootstrapMultiaddrs üzerinden doğrudan bağlantı\n   ├─ mDNS (LAN keşfi)\n   └─ libp2p DHT findProviders (saf P2P)\n```\n\nResmi uç nokta, P2P ağı sağlıklı olsa bile **sonsuza dek** kurtarma kanalı olarak korunur.",
    "schema": "İstek: `<https://modelbus.cc/api/v1/nodes>` `Array<NodeAnnouncement>` döndürür:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nAlanlar:\n\n- **version** `2`: şema sürümü; kırıcı değişikliklerde +1\n- **peerId**: libp2p PeerId, küresel olarak benzersiz\n- **nickname**: okunabilir ad\n- **providers[]**: bu eşin barındırdığı LLM sağlayıcıları\n  - **providerId**: models.dev'deki sağlayıcı kimliği\n  - **providerName**: görüntülenen ad\n  - **models[]**: bu sağlayıcı altındaki modeller; her birinin `id` (kanonik) ve `name` (görüntü) değeri var\n- **addr**: tek birincil erişilebilir adres (çoğul değil)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: son güncellemenin Unix ms değeri\n- **expiresAt**: yumuşak TTL; süresi dolmuş kayıtlar hâlâ kullanılabilir ama daha düşük ağırlıklı\n\n`mock/nodes.json` içindeki son 4 kayıt güvenilir tohum eşlerdir; peerId'leri `trusted-roots.ts` ile eşleşir.",
    "flow": "**Provision** (siz = Token sahibi): Ayarlar → Token paylaşımı → sağlayıcı seç, API anahtarını yapıştır, modelleri işaretle → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (siz = Token tüketicisi): Modeller sekmesinde güvenilir bir eş seç → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → HTTP POST gelir → `body.model` çıkar → eşi ara → `InferenceRequest` (JSON + uzunluk öneki) yaz → `InferenceResponse`'ı bloklayarak bekle → HTTP yanıtını yaz.\n\n**İstek yönlendirme** (çağrılan eşte `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ eşleşme: openai sağlayıcı yapılandırması\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ gerçek çağrı, yanıtı döndür\n  └─ eşleşme yok: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Resmi yükleyiciler (Windows / macOS / Linux paketleri, sonra mobil ve Web SDK) hazırlanıyor.\n\n**Hemen kullanmak için: kaynaktan derleyin**\n\n```bash\npnpm install\npnpm run dev          # geliştirme modu (Electron + Vite HMR)\npnpm run package:mac  # macOS dmg\npnpm run package:win  # Windows nsis\npnpm run package:linux # Linux AppImage\n```\n\nÇıktılar `release/` içine düşer.\n\n**Dağıtım kanalları (planlanan)**: resmi indirme sayfası · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Resmi alan adı kalıcı kurtarma uç noktası olarak kalır.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nİlk başlatmada uygulama varsayılan olarak `mock/nodes.json`'a işaret eder, bu yüzden tüm akış ağ olmadan çalışır. Ayrıntı için ana [README.md](../README.md) ve [docs/](../docs/) klasörüne bakın.",
    "roadmap": "- ✅ v1: çoklu sağlayıcı, resmi soğuk başlangıç, güven çapaları, P2P iletimi, 22 dil, Wallet iskeleti\n- 🔜 v2: güven zinciri (trustChain) — Ed25519 imzalı davet defteri\n- 🔜 v3: gerçek ölçümlere dayalı düğüm kalite değerlendirmesi (gecikme, hata oranı, çalışma süresi)\n- 🔜 v4: token ekonomisi döngüsü — MBP öncelikli yönlendirmeyi, soğuk başlangıç desteğini ve düğüm keşfini sürer\n- 🔜 v5: mobil eşler\n- 🔜 v6: Web SDK — tarayıcıda `<modelbus>`"
  }
},


  'ar-SA': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : منصة لا مركزية لمشاركة رموز LLM",
  "tagline": "ربما المنصة الأولى في العالم حيث يمكن لأي شخص ربط رمزه بشبكة P2P، وفي المقابل استخدام الرموز المشتركة من قبل أقران آخرين. لا خادم مركزي، لا تسجيل حساب، ولا مفتاح API يغادر جهازك أبداً.",
  "statusSentence": "ModelBus-P2P لا يزال قيد التطوير والاختبار العام.",
  "sections": {
    "toc": "## المحتويات",
    "what": "## ما هو",
    "features": "## الميزات الأساسية",
    "screenshots": "## لقطات الشاشة",
    "architecture": "## البنية",
    "decentralised": "## التصميم اللامركزي",
    "schema": "## صيغة إعلان العقدة (v2)",
    "flow": "## تدفق الطلب",
    "download": "## التحميل والاستخدام (قريباً)",
    "quickstart": "## البدء السريع",
    "roadmap": "## خارطة الطريق"
  },
  "body": {
    "what": "ModelBus-P2P هو عميل سطح مكتب مبني على [js-libp2p](https://github.com/libp2p/js-libp2p) و Electron. يحل مشكلة يعرفها الجميع تقريباً: **هذا الشهر فائض والشهر القادم نقص.**\n\n> السيناريو: تدفع مقابل OpenAI أو Claude ونادراً ما تستنزف الحصة الشهرية. بدلاً من أن تنتهي صلاحيتها، علّقها على شبكة P2P. كل طلب يمر عبر عقدتك يتحول إلى **رموز MBP** (دقائق الاتصال × 0.05 + عدد الرموز المشتركة × 2 + الطلبات المقدمة × 0.1 + سرعة الاستجابة × 0.5). عندما يحين الشهر التالي وتشحّ حصتك، أنفق تلك MBP لاستدعاء رموز يشاركها أقران آخرون. لا يتدخل خادم مركزي أبداً، ويبقى مفتاح API على جهازك.\n\n- **Provision / Share**: سجّل مفتاح API لاشتراكك والنماذج التي تريد مشاركتها. تعرف الشبكة على peerId الخاص بك.\n- **Consume / Drive**: شغّل وكيل HTTP محلياً متوافقاً مع OpenAI على `http://127.0.0.1:18100`؛ وجّه إليه أي عميل متوافق؛ تُحوَّل الطلبات عبر P2P إلى النظير الذي يملك الرمز فعلياً.\n- **Wallet**: كل مشاركة أو استدعاء يجمع رموز MBP. تعرض تبويبة الرئيسية وصفحة المحفظة الرصيد والتفصيل والصيغة في الوقت الفعلي. حالياً MBP للمحاسبة فقط؛ الإصدارات القادمة ستستخدمه للسمعة والحوافز والتوجيه ذي الأولوية.\n- **بدون إعداد مسبق**: أول تشغيل يجلب العقد البذرية من نقطة النهاية الرسمية (أو نموذج محلي)، ثم يعمل بالكامل في وضع P2P.",
    "features": "| الميزة | ملاحظات |\n|---|---|\n| **نقل P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **ثقة لا مركزية** | 4 معرّفات عقد بذرية مدمجة كمراسي ثقة؛ أقران جدد ينضمون عبر سلسلة الثقة (المرحلة التالية) |\n| **بدء بارد احتياطي** | أول تشغيل يجلب العقد من نقطة النهاية الرسمية HTTPS أو نموذج محلي؛ كل شيء يُخزن في `<userData>/bootstrap-cache.json` |\n| **توجيه متعدد المزودين** | نظير واحد يستضيف OpenAI + Anthropic + Google في آنٍ واحد؛ المتصلون يوجّهون عبر `model.id` |\n| **وكيل متوافق مع OpenAI** | وكيل HTTP محلي على `:18100`؛ أي عميل متوافق مع OpenAI/Anthropic يعمل مباشرة |\n| **توثيق بمفتاح API (اختياري)** | ثبّت مفتاحاً في وكيل الاستهلاك؛ يجب على المتصلين إرسال `Authorization: Bearer <key>` |\n| **22 لغة** | العربية افتراضياً؛ دعم RTL |\n| **مظهر فاتح افتراضي** | قابل للتبديل إلى داكن / اتبع النظام |",
    "screenshots": "الرئيسية، النماذج، المحفظة، السجلات، الإعدادات — خمس شاشات إجمالاً. لقطات بدقة كاملة في [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (كاش models.dev)                   │\n│              ├─ registry    (واجهة رسمية + كاش احتياطي)         │\n│              ├─ p2p         (خادم libp2p)                      │\n│              ├─ provisioner (موجّه متعدد المزودين)              │\n│              ├─ proxy-server (HTTP متوافق مع OpenAI)          │\n│              ├─ upstream    (استدعاءات API حقيقية)             │\n│              ├─ wallet      (حساب نقاط MBP)                    │\n│              └─ models      (مجمع الكتالوج)                    │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   شبكة P2P        │\n              └──────────────────┘\n```\n\n```bash\n# إعلان العقدة v2 — انظر القسم التالي\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# وكيل الاستهلاك المحلي\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "أربعة معرّفات عقد بذرية مدمجة في الثنائي (`src/main/config/trusted-roots.ts`). تدفق البدء البارد:\n\n1. الكاش المحلي فارغ عند أول تشغيل\n2. جلب متوازٍ: نقطة نهاية رسمية HTTPS + `bootstrapMultiaddrs` المُهيأة + mDNS\n3. التحقق من كل peerId مقابل `TRUSTED_ROOT_PEER_IDS`\n4. حفظ المجموعة الفرعية الموثقة في `<userData>/bootstrap-cache.json`\n5. يبدأ خادم P2P؛ الإصابات بالكاش تبقى في وضع P2P؛ الإخفاقات تُعيد المحاولة على نقطة النهاية الرسمية كل ساعة\n\n```\n4 جذور مدمجة  ←  مراسي الثقة\n└─ من كاش نقطة النهاية الرسمية\n   ├─ اتصال مباشر عبر bootstrapMultiaddrs\n   ├─ mDNS (اكتشاف LAN)\n   └─ libp2p DHT findProviders (P2P خالص)\n```\n\nنقطة النهاية الرسمية تُحفظ **للأبد** كقناة إنقاذ، حتى عندما تكون شبكة P2P سليمة.",
    "schema": "الطلب: `<https://modelbus.cc/api/v1/nodes>` يُرجع `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nالحقول:\n\n- **version** `2`: إصدار المخطط؛ +1 عند تغييرات قاسمة\n- **peerId**: libp2p PeerId، فريد عالمياً\n- **nickname**: اسم مقروء\n- **providers[]**: مزودو LLM الذين يستضيفهم هذا النظير\n  - **providerId**: معرّف المزود في models.dev\n  - **providerName**: اسم العرض\n  - **models[]**: نماذج هذا المزود؛ لكلٍّ `id` (قانوني) و `name` (عرض)\n- **addr**: عنوان أساسي واحد قابل للوصول (مفرد وليس جمعاً)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: مللي ثانية Unix لآخر تحديث\n- **expiresAt**: TTL مرن؛ الإدخالات المنتهية ما تزال قابلة للاستخدام لكن بوزن أقل\n\nالـ 4 إدخالات الأخيرة في `mock/nodes.json` هي العقد البذرية الموثوقة؛ تتطابق peerId مع `trusted-roots.ts`.",
    "flow": "**Provision** (أنت = حامل الرمز): الإعدادات → مشاركة الرمز → اختر المزود، الصق مفتاح API، حدّد النماذج → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (أنت = مستهلك الرمز): اختر نظيراً موثوقاً في تبويبة النماذج → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → يصل POST HTTP → استخرج `body.model` → اتصل بالنظير → اكتب `InferenceRequest` (JSON + بادئة طول) → انتظر `InferenceResponse` → اكتب استجابة HTTP.\n\n**توجيه الطلب** (عند النظير المُستدعى `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ تطابق: إعداد مزود openai\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ استدعاء حقيقي، إعادة الرد\n  └─ لا تطابق: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 المثبتات الرسمية (حزم Windows / macOS / Linux، ولاحقاً الموبايل و Web SDK) قيد التحضير.\n\n**لاستخدامه الآن: ابنِ من المصدر**\n\n```bash\npnpm install\npnpm run dev          # وضع التطوير (Electron + Vite HMR)\npnpm run package:mac  # dmg لنظام macOS\npnpm run package:win  # nsis لنظام Windows\npnpm run package:linux # AppImage لنظام Linux\n```\n\nتقع النواتج في `release/`.\n\n**قنوات التوزيع (مخطط لها)**: صفحة التحميل الرسمية · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. يبقى النطاق الرسمي نقطة إنقاذ دائمة.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nعند أول تشغيل تشير التطبيق افتراضياً إلى `mock/nodes.json`، لذا يعمل التدفق كاملاً دون شبكة. التفاصيل في [README.md](../README.md) الرئيسي ومجلد [docs/](../docs/).",
    "roadmap": "- ✅ v1: متعدد المزودين، بدء بارد رسمي، مراسي ثقة، تمرير P2P، 22 لغة، هيكل المحفظة\n- 🔜 v2: سلسلة الثقة (trustChain) — دفتر دعوات موقّع Ed25519\n- 🔜 v3: تقييم جودة العقدة بمقاييس حقيقية (زمن الاستجابة، الأخطاء، مدة التشغيل)\n- 🔜 v4: حلقة اقتصاد الرموز — MBP يقود التوجيه ذا الأولوية، وتغيير البدء البارد، واكتشاف العقد\n- 🔜 v5: أقران موبايل\n- 🔜 v6: SDK ويب — `<modelbus>` في المتصفح"
  }
},
  'nb-NO': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : En desentralisert plattform for deling av LLM-tokens",
  "tagline": "Kanskje verdens første plattform der alle kan knytte sin Token til et P2P-nettverk og bruke andre peers' delte Tokens til gjengjeld. Ingen sentral server, ingen konto, ingen API-nøkkel forlater noensinne maskinen din.",
  "statusSentence": "ModelBus-P2P er fortsatt under utvikling og offentlig testing.",
  "sections": {
    "toc": "## Innhold",
    "what": "## Hva er det",
    "features": "## Kjernefunksjoner",
    "screenshots": "## Skjermbilder",
    "architecture": "## Arkitektur",
    "decentralised": "## Desentralisert design",
    "schema": "## Node-annonseringsformat (v2)",
    "flow": "## Forespørselsflyt",
    "download": "## Nedlasting og bruk (snart)",
    "quickstart": "## Rask start",
    "roadmap": "## Veikart"
  },
  "body": {
    "what": "ModelBus-P2P er en skrivebordsklient bygget på [js-libp2p](https://github.com/libp2p/js-libp2p) og Electron. Den løser et problem nesten alle kjenner: **denne måneden overskudd, neste måned underskudd.**\n\n> Scenario: du betaler for OpenAI eller Claude og bruker sjelden opp månedskvoten. I stedet for å la den utløpe, koble den til P2P-nettverket. Hver forespørsel som går gjennom noden din, konverteres til **MBP-tokens** (onlineminutter × 0,05 + antall delte Tokens × 2 + betjente forespørsler × 0,1 + svartid × 0,5). Når neste måned kommer og kvoten blir knapp, bruker du disse MBP-ene til å kalle Tokens delt av andre peers. Ingen sentral server er involvert, og API-nøkkelen din blir på maskinen din.\n\n- **Provision / Share**: registrer API-nøkkelen for abonnementet og modellene du vil dele. Nettverket lærer peerId-en din.\n- **Consume / Drive**: start en lokal OpenAI-kompatibel HTTP-proxy på `http://127.0.0.1:18100`; pek enhver kompatibel klient dit; forespørsler videresendes over P2P til peeren som faktisk holder Token.\n- **Wallet**: hver deling eller samtale akkumulerer MBP-tokens. Hjem-fanen og Wallet-siden viser saldo, oppdeling og formel i sanntid. MBP er foreløpig bare bokføring; fremtidige versjoner bruker det for omdømme, insentiver og prioritert ruting.\n- **Ingen onboarding**: første start henter frø-noder fra det offisielle endepunktet (eller en lokal mock), og kjører deretter helt i P2P-modus.",
    "features": "| Funksjon | Merknader |\n|---|---|\n| **P2P-transport** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Desentralisert tillit** | 4 hardkodede frø-peer-ID-er som tillitsankre; nye peers kommer inn via tillitskjede (neste milepæl) |\n| **Kaldstart-fallback** | Første start henter noder fra det offisielle HTTPS-endepunktet eller en lokal mock; alt lander i `<userData>/bootstrap-cache.json` |\n| **Multi-provider-ruting** | Én peer kan huse OpenAI + Anthropic + Google samtidig; kallere ruter via `model.id` |\n| **OpenAI-kompatibel proxy** | Lokal HTTP-proxy på `:18100`; enhver OpenAI/Anthropic-kompatibel klient fungerer ut av boksen |\n| **API-nøkkel-auth (valgfritt)** | Sett en fast nøkkel i konsum-proxyen; kallere må sende `Authorization: Bearer <key>` |\n| **22 språk** | Norsk som standard; RTL-arabisk støttet |\n| **Lyst standardtema** | Bytt til mørkt / følg OS |",
    "screenshots": "Hjem, Modeller, Wallet, Logger, Innstillinger — totalt fem visninger. Skjermbilder i full oppløsning ligger i [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (models.dev cache)                  │\n│              ├─ registry    (offisiell API + cache-fallback)   │\n│              ├─ p2p         (libp2p-demon)                      │\n│              ├─ provisioner (multi-provider-ruter)             │\n│              ├─ proxy-server (OpenAI-kompatibel HTTP)          │\n│              ├─ upstream    (ekte provider-API-kall)           │\n│              ├─ wallet      (MBP-poengberegning)               │\n│              └─ models      (katalogaggregator)                │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   P2P-nettverk    │\n              └──────────────────┘\n```\n\n```bash\n# Node-annonsering v2 — se neste seksjon\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Lokal konsum-proxy\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Fire frø-peer-ID-er er bakt inn i binæren (`src/main/config/trusted-roots.ts`). Kaldstart-flyt:\n\n1. Lokal cache er tom ved første start\n2. Hent parallelt: offisielt HTTPS-endepunkt + brukerkonfigurerte `bootstrapMultiaddrs` + mDNS\n3. Valider hver peerId mot `TRUSTED_ROOT_PEER_IDS`\n4. Lagre godkjent delmengde i `<userData>/bootstrap-cache.json`\n5. P2P-demonen starter; cache-treff forblir i P2P-modus; bom prøver det offisielle endepunktet igjen hver time\n\n```\n4 hardkodede røtter  ←  tillitsankre\n└─ cachet fra offisielt endepunkt\n   ├─ direkte tilkobling via bootstrapMultiaddrs\n   ├─ mDNS (LAN-oppdagelse)\n   └─ libp2p DHT findProviders (ren P2P)\n```\n\nDet offisielle endepunktet beholdes **for alltid** som redningskanal, selv når P2P-nettverket er friskt.",
    "schema": "Forespørsel: `<https://modelbus.cc/api/v1/nodes>` returnerer `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nFelt:\n\n- **version** `2`: skjemaversjon; +1 ved store endringer\n- **peerId**: libp2p PeerId, globalt unik\n- **nickname**: lesbart navn\n- **providers[]**: LLM-leverandører denne peeren huser\n  - **providerId**: leverandør-ID i models.dev\n  - **providerName**: visningsnavn\n  - **models[]**: modeller under denne leverandøren; hver har `id` (kanonisk) og `name` (visning)\n- **addr**: eneste primære adresse (entall)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: Unix-ms for siste oppdatering\n- **expiresAt**: myk TTL; utløpte oppføringer er fortsatt brukbare, men lavere vekt\n\nDe 4 siste oppføringene i `mock/nodes.json` er de betrodde frø-peerene; peerId-ene matcher `trusted-roots.ts`.",
    "flow": "**Provision** (du = Token-innehaver): Innstillinger → Token-deling → velg leverandør, lim inn API-nøkkel, kryss av modeller → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (du = Token-forbruker): velg en betrodd peer i Modeller-fanen → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → HTTP POST kommer inn → trekk ut `body.model` → ring peeren → skriv `InferenceRequest` (JSON + lengdeprefiks) → vent blokkerende på `InferenceResponse` → skriv HTTP-svar.\n\n**Forespørselsruting** (hos den kalte peeren `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ treff: openai-leverandørkonfigurasjon\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ ekte kall, returner respons\n  └─ ikke treff: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Offisielle installatører (Windows / macOS / Linux-pakker, senere mobil og Web SDK) er under forberedelse.\n\n**Slik bruker du det nå: bygg fra kilde**\n\n```bash\npnpm install\npnpm run dev          # utviklingsmodus (Electron + Vite HMR)\npnpm run package:mac  # macOS dmg\npnpm run package:win  # Windows nsis\npnpm run package:linux # Linux AppImage\n```\n\nArtefaktene havner i `release/`.\n\n**Distribusjonskanaler (planlagt)**: offisiell nedlastingsside · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Det offisielle domenet er permanent redningsendepunkt.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nVed første start peker appen som standard til `mock/nodes.json`, så hele flyten fungerer uten nettverk. For mer, se hoved-[README.md](../README.md) og mappen [docs/](../docs/).",
    "roadmap": "- ✅ v1: multi-provider, offisiell kaldstart, tillitsankre, P2P-videresending, 22 språk, Wallet-skjelett\n- 🔜 v2: tillitskjede (trustChain) — Ed25519-signert invitasjonsbok\n- 🔜 v3: nodekvalitetsvurdering basert på reelle målinger (svartid, feilrate, oppetid)\n- 🔜 v4: token-økonomiløkke — MBP driver prioritert ruting, kaldstart-boost og nodeoppdagelse\n- 🔜 v5: mobile peers\n- 🔜 v6: Web SDK — `<modelbus>` i nettleseren"
  }
},
  'pt-BR': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : Uma plataforma descentralizada de compartilhamento de tokens LLM",
  "tagline": "Provavelmente a primeira plataforma do mundo onde qualquer pessoa pode anexar seu Token a uma rede P2P e, em troca, usar os Tokens compartilhados por outros peers. Sem servidor central, sem cadastro, nenhuma chave API sai da sua máquina.",
  "statusSentence": "ModelBus-P2P ainda está em desenvolvimento e testes públicos.",
  "sections": {
    "toc": "## Índice",
    "what": "## O que é",
    "features": "## Principais recursos",
    "screenshots": "## Capturas de tela",
    "architecture": "## Arquitetura",
    "decentralised": "## Design descentralizado",
    "schema": "## Formato de anúncio de nó (v2)",
    "flow": "## Fluxo de requisição",
    "download": "## Download e uso (em breve)",
    "quickstart": "## Início rápido",
    "roadmap": "## Roadmap"
  },
  "body": {
    "what": "ModelBus-P2P é um cliente desktop construído sobre [js-libp2p](https://github.com/libp2p/js-libp2p) e Electron. Resolve um problema que quase todo mundo conhece: **este mês sobra, no próximo falta.**\n\n> Cenário: você paga por OpenAI ou Claude e raramente gasta a cota mensal. Em vez de deixá-la expirar, conecte-a à rede P2P. Cada requisição que passa pelo seu nó é convertida em **tokens MBP** (minutos online × 0,05 + quantidade de Tokens compartilhados × 2 + requisições atendidas × 0,1 + velocidade de resposta × 0,5). Quando chegar o mês seguinte e a cota escassear, você gasta esses MBP para chamar os Tokens compartilhados por outros peers. Nenhum servidor central intervém, e a chave API permanece na sua máquina.\n\n- **Provision / Share**: registre a chave API da sua assinatura e os modelos que quer compartilhar. A rede aprende seu peerId.\n- **Consume / Drive**: suba um proxy HTTP local compatível com OpenAI em `http://127.0.0.1:18100`; aponte qualquer cliente compatível para lá; as requisições são encaminhadas via P2P ao peer que realmente guarda o Token.\n- **Wallet**: cada compartilhamento ou chamada acumula tokens MBP. A aba Início e a página Wallet mostram saldo, detalhamento e fórmula em tempo real. MBP hoje é apenas contábil; versões futuras usarão para reputação, incentivos e roteamento prioritário.\n- **Sem onboarding**: o primeiro lançamento busca nós semente do endpoint oficial (ou de um mock local) e depois opera totalmente em modo P2P.",
    "features": "| Recurso | Observações |\n|---|---|\n| **Transporte P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Confiança descentralizada** | 4 peerIds semente fixos como âncoras de confiança; novos peers entram via cadeia de confiança (próximo marco) |\n| **Cold-start de reserva** | O primeiro lançamento busca nós no endpoint HTTPS oficial ou em um mock local; tudo vai para `<userData>/bootstrap-cache.json` |\n| **Roteamento multi-provider** | Um peer pode hospedar OpenAI + Anthropic + Google ao mesmo tempo; os chamadores roteiam por `model.id` |\n| **Proxy compatível com OpenAI** | Proxy HTTP local em `:18100`; qualquer cliente compatível com OpenAI/Anthropic funciona de imediato |\n| **Auth por chave API (opcional)** | Fixe uma chave no proxy de consumo; os chamadores devem enviar `Authorization: Bearer <key>` |\n| **22 idiomas** | Português (Brasil) por padrão; árabe RTL suportado |\n| **Tema claro padrão** | Alternável para escuro / seguir o SO |",
    "screenshots": "Início, Modelos, Wallet, Registros, Configurações — cinco visualizações no total. Capturas em resolução cheia estão em [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (cache de models.dev)              │\n│              ├─ registry    (API oficial + fallback de cache)  │\n│              ├─ p2p         (daemon libp2p)                     │\n│              ├─ provisioner (roteador multi-provider)          │\n│              ├─ proxy-server (HTTP compatível com OpenAI)      │\n│              ├─ upstream    (chamadas reais à API)             │\n│              ├─ wallet      (cálculo de pontuação MBP)         │\n│              └─ models      (agregador de catálogo)            │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   Rede P2P        │\n              └──────────────────┘\n```\n\n```bash\n# Anúncio de nó v2 — veja a próxima seção\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Proxy local de consumo\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Quatro peerIds semente estão gravados no binário (`src/main/config/trusted-roots.ts`). Fluxo de cold-start:\n\n1. O cache local está vazio no primeiro lançamento\n2. Busca paralela: endpoint HTTPS oficial + `bootstrapMultiaddrs` configurados + mDNS\n3. Valide cada peerId contra `TRUSTED_ROOT_PEER_IDS`\n4. Persista o subconjunto validado em `<userData>/bootstrap-cache.json`\n5. O daemon P2P inicia; acertos de cache permanecem em modo P2P; falhas tentam o endpoint oficial de novo a cada hora\n\n```\n4 raízes fixas  ←  âncoras de confiança\n└─ em cache do endpoint oficial\n   ├─ conexão direta via bootstrapMultiaddrs\n   ├─ mDNS (descoberta em LAN)\n   └─ libp2p DHT findProviders (P2P puro)\n```\n\nO endpoint oficial é mantido **para sempre** como canal de resgate, mesmo quando a rede P2P está saudável.",
    "schema": "Requisição: `<https://modelbus.cc/api/v1/nodes>` retorna `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nCampos:\n\n- **version** `2`: versão do esquema; +1 em mudanças que quebram\n- **peerId**: libp2p PeerId, globalmente único\n- **nickname**: nome legível\n- **providers[]**: provedores LLM que este peer hospeda\n  - **providerId**: id do provedor em models.dev\n  - **providerName**: nome de exibição\n  - **models[]**: modelos sob este provedor; cada um tem `id` (canônico) e `name` (exibido)\n- **addr**: único endereço principal alcançável (singular)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: Unix ms da última atualização\n- **expiresAt**: TTL suave; entradas expiradas ainda são úteis com peso menor\n\nAs 4 últimas entradas em `mock/nodes.json` são os peers semente de confiança; seus peerIds correspondem a `trusted-roots.ts`.",
    "flow": "**Provision** (você = detentor do Token): Configurações → Compartilhar Token → escolha o provedor, cole a chave API, marque os modelos → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (você = consumidor do Token): escolha um peer de confiança na aba Modelos → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → um POST chega → extraia `body.model` → disque o peer → escreva `InferenceRequest` (JSON + prefixo de comprimento) → aguarde `InferenceResponse` → escreva a resposta HTTP.\n\n**Roteamento da requisição** (no peer chamado `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ match: configuração do provedor openai\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ chamada real, retorna resposta\n  └─ sem match: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Instaladores oficiais (pacotes Windows / macOS / Linux, e mais tarde mobile e Web SDK) estão sendo preparados.\n\n**Para usar agora: compile a partir do código-fonte**\n\n```bash\npnpm install\npnpm run dev          # modo de desenvolvimento (Electron + Vite HMR)\npnpm run package:mac  # dmg para macOS\npnpm run package:win  # nsis para Windows\npnpm run package:linux # AppImage para Linux\n```\n\nOs artefatos vão para `release/`.\n\n**Canais de distribuição (previstos)**: página oficial de downloads · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. O domínio oficial permanece como endpoint de resgate.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nNo primeiro lançamento o app aponta por padrão para `mock/nodes.json`, então todo o fluxo funciona sem rede. Para detalhes veja o [README.md](../README.md) principal e a pasta [docs/](../docs/).",
    "roadmap": "- ✅ v1: multi-provedor, cold-start oficial, âncoras de confiança, encaminhamento P2P, 22 idiomas, esqueleto do Wallet\n- 🔜 v2: cadeia de confiança (trustChain) — livro de convites assinado por Ed25519\n- 🔜 v3: avaliação de qualidade do nó por métricas reais (latência, taxa de erro, uptime)\n- 🔜 v4: ciclo econômico de tokens — MBP guia roteamento prioritário, boost de cold-start e descoberta de nós\n- 🔜 v5: peers móveis\n- 🔜 v6: SDK web — `<modelbus>` no navegador"
  }
},


  'pl-PL': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : Zdecentralizowana platforma udostępniania tokenów LLM",
  "tagline": "Prawdopodobnie pierwsza na świecie platforma, na której każdy może podłączyć swój Token do sieci P2P i w zamian korzystać z Tokenów udostępnianych przez inne węzły. Bez centralnego serwera, bez rejestracji konta, żaden klucz API nigdy nie opuszcza Twojej maszyny.",
  "statusSentence": "ModelBus-P2P jest wciąż w fazie rozwoju i publicznych testów.",
  "sections": {
    "toc": "## Spis treści",
    "what": "## Co to jest",
    "features": "## Główne funkcje",
    "screenshots": "## Zrzuty ekranu",
    "architecture": "## Architektura",
    "decentralised": "## Projekt zdecentralizowany",
    "schema": "## Format ogłoszenia węzła (v2)",
    "flow": "## Przebieg zapytania",
    "download": "## Pobierz i używaj (wkrótce)",
    "quickstart": "## Szybki start",
    "roadmap": "## Mapa drogowa"
  },
  "body": {
    "what": "ModelBus-P2P to klient desktopowy oparty na [js-libp2p](https://github.com/libp2p/js-libp2p) i Electronie. Rozwiązuje problem, który ma niemal każdy: **w tym miesiącu nadmiar, w następnym brak.**\n\n> Scenariusz: płacisz za OpenAI lub Claude i rzadko wykorzystujesz miesięczny limit. Zamiast pozwolić mu wygasnąć, podłącz go do sieci P2P. Każde zapytanie przechodzące przez Twój węzeł jest przeliczane na **tokeny MBP** (minuty online × 0,05 + liczba udostępnionych Tokenów × 2 + obsłużone zapytania × 0,1 + szybkość odpowiedzi × 0,5). Gdy w następnym miesiącu zabraknie Ci limitu, wydajesz te MBP, aby wywołać Tokeny udostępniane przez inne węzły. W żadnym momencie nie pośredniczy serwer centralny, a Twój klucz API pozostaje na Twojej maszynie.\n\n- **Provision / Share**: zarejestruj klucz API swojej subskrypcji i modele, które chcesz udostępniać. Sieć poznaje Twój peerId.\n- **Consume / Drive**: uruchom lokalny, zgodny z OpenAI proxy HTTP pod `http://127.0.0.1:18100`; wskaż na niego dowolny kompatybilny klient; zapytania są przekazywane przez P2P do węzła, który faktycznie przechowuje Token.\n- **Wallet**: każde udostępnienie lub wywołanie gromadzi tokeny MBP. Zakładka Strona główna i strona Wallet pokazują saldo, rozbicie i wzór w czasie rzeczywistym. MBP jest obecnie tylko księgowe; przyszłe wersje wykorzystają go do reputacji, zachęt i priorytetowego routingu.\n- **Bez onboardingu**: pierwsze uruchomienie pobiera węzły nasienne z oficjalnego punktu końcowego (lub lokalnego mocka), a następnie działa w pełni w trybie P2P.",
    "features": "| Funkcja | Uwagi |\n|---|---|\n| **Transport P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Zdecentralizowane zaufanie** | 4 zakodowane na stałe ID węzłów nasiennych jako kotwice zaufania; nowe węzły dołączają przez łańcuch zaufania (kolejny kamień milowy) |\n| **Zapasowy cold-start** | Pierwsze uruchomienie pobiera węzły z oficjalnego punktu HTTPS lub lokalnego mocka; całość trafia do `<userData>/bootstrap-cache.json` |\n| **Routing multi-provider** | Jeden węzeł może hostować OpenAI + Anthropic + Google jednocześnie; wywołujący routują po `model.id` |\n| **Proxy zgodne z OpenAI** | Lokalny proxy HTTP na `:18100`; każdy klient zgodny z OpenAI/Anthropic działa od razu |\n| **Uwierzytelnianie kluczem API (opcjonalnie)** | Ustaw stały klucz w proxy konsumpcji; wywołujący muszą wysłać `Authorization: Bearer <key>` |\n| **22 języki** | Polski domyślnie; obsługiwane arabskie RTL |\n| **Jasny motyw domyślny** | Przełącz na ciemny / podążaj za OS |",
    "screenshots": "Strona główna, Modele, Wallet, Logi, Ustawienia — łącznie pięć widoków. Zrzuty w pełnej rozdzielczości znajdują się w [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (cache models.dev)                 │\n│              ├─ registry    (oficjalne API + fallback cache)   │\n│              ├─ p2p         (demon libp2p)                     │\n│              ├─ provisioner (router multi-provider)           │\n│              ├─ proxy-server (HTTP zgodne z OpenAI)           │\n│              ├─ upstream    (realne wywołania API)            │\n│              ├─ wallet      (obliczanie wyniku MBP)            │\n│              └─ models      (agregator katalogu)               │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   Sieć P2P        │\n              └──────────────────┘\n```\n\n```bash\n# Ogłoszenie węzła v2 — patrz następna sekcja\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Lokalny proxy konsumpcji\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Cztery ID węzłów nasiennych są wbudowane w plik binarny (`src/main/config/trusted-roots.ts`). Przebieg cold-startu:\n\n1. Lokalna pamięć podręczna jest pusta przy pierwszym uruchomieniu\n2. Równoległe pobieranie: oficjalny punkt HTTPS + skonfigurowane `bootstrapMultiaddrs` + mDNS\n3. Weryfikacja każdego peerId względem `TRUSTED_ROOT_PEER_IDS`\n4. Zapis zweryfikowanego podzbioru w `<userData>/bootstrap-cache.json`\n5. Demon P2P startuje; trafienia z cache pozostają w trybie P2P; niepowodzenia ponawiają oficjalny punkt co godzinę\n\n```\n4 zakodowane korzenie  ←  kotwice zaufania\n└─ z cache z oficjalnego punktu\n   ├─ bezpośrednie połączenie przez bootstrapMultiaddrs\n   ├─ mDNS (wykrywanie w LAN)\n   └─ libp2p DHT findProviders (czysty P2P)\n```\n\nOficjalny punkt końcowy jest zachowany **na zawsze** jako kanał ratunkowy, nawet gdy sieć P2P działa.",
    "schema": "Żądanie: `<https://modelbus.cc/api/v1/nodes>` zwraca `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nPola:\n\n- **version** `2`: wersja schematu; +1 przy zmianach łamiących\n- **peerId**: libp2p PeerId, globalnie unikalny\n- **nickname**: nazwa czytelna dla człowieka\n- **providers[]**: dostawcy LLM hostowani przez ten węzeł\n  - **providerId**: id dostawcy w models.dev\n  - **providerName**: nazwa wyświetlana\n  - **models[]**: modele w ramach tego dostawcy; każdy ma `id` (kanoniczne) i `name` (wyświetlane)\n- **addr**: pojedynczy główny adres (liczba pojedyncza)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: Unix ms ostatniej aktualizacji\n- **expiresAt**: miękki TTL; wygasłe wpisy wciąż użyteczne, ale o niższej wadze\n\nOstatnie 4 wpisy w `mock/nodes.json` to zaufane węzły nasienne; ich peerId odpowiadają `trusted-roots.ts`.",
    "flow": "**Provision** (Ty = posiadacz Tokenu): Ustawienia → Udostępnij Token → wybierz dostawcę, wklej klucz API, zaznacz modele → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (Ty = konsument Tokenu): wybierz zaufany węzeł w zakładce Modele → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → przychodzi POST HTTP → wyciągnij `body.model` → wybierz węzeł → zapisz `InferenceRequest` (JSON + prefiks długości) → czekaj na `InferenceResponse` → zapisz odpowiedź HTTP.\n\n**Routing zapytania** (po stronie wywoływanego `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ trafienie: konfiguracja dostawcy openai\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ realne wywołanie, zwraca odpowiedź\n  └─ brak trafienia: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Oficjalne instalatory (pakiety Windows / macOS / Linux, a później mobilne i Web SDK) są obecnie przygotowywane.\n\n**Aby użyć teraz: zbuduj ze źródeł**\n\n```bash\npnpm install\npnpm run dev          # tryb deweloperski (Electron + Vite HMR)\npnpm run package:mac  # dmg dla macOS\npnpm run package:win  # nsis dla Windows\npnpm run package:linux # AppImage dla Linux\n```\n\nArtefakty lądują w `release/`.\n\n**Kanały dystrybucji (planowane)**: oficjalna strona pobierania · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Oficjalna domena pozostaje trwałym punktem ratunkowym.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nPrzy pierwszym uruchomieniu aplikacja domyślnie wskazuje `mock/nodes.json`, więc cały przepływ działa bez sieci. Szczegóły w głównym [README.md](../README.md) i katalogu [docs/](../docs/).",
    "roadmap": "- ✅ v1: multi-provider, oficjalny cold-start, kotwice zaufania, przekazywanie P2P, 22 języki, szkielet Wallet\n- 🔜 v2: łańcuch zaufania (trustChain) — księga zaproszeń podpisana Ed25519\n- 🔜 v3: ocena jakości węzła na podstawie rzeczywistych metryk (opóźnienie, błędy, uptime)\n- 🔜 v4: pętla gospodarki tokenowej — MBP napędza priorytetowy routing, boost cold-startu i odkrywanie węzłów\n- 🔜 v5: mobilne węzły\n- 🔜 v6: SDK web — `<modelbus>` w przeglądarce"
  }
},
  'ru-RU': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : Децентрализованная платформа обмена токенами LLM",
  "tagline": "Возможно, первая в мире платформа, где каждый может подключить свой токен к P2P-сети и взамен использовать токены, которыми делятся другие пиры. Без центрального сервера, без регистрации аккаунта, ни один API-ключ никогда не покинет вашу машину.",
  "statusSentence": "ModelBus-P2P всё ещё в разработке и публичном тестировании.",
  "sections": {
    "toc": "## Содержание",
    "what": "## Что это такое",
    "features": "## Основные возможности",
    "screenshots": "## Скриншоты",
    "architecture": "## Архитектура",
    "decentralised": "## Децентрализованный дизайн",
    "schema": "## Формат объявления узла (v2)",
    "flow": "## Поток запроса",
    "download": "## Загрузка и использование (скоро)",
    "quickstart": "## Быстрый старт",
    "roadmap": "## Дорожная карта"
  },
  "body": {
    "what": "ModelBus-P2P — это настольный клиент на базе [js-libp2p](https://github.com/libp2p/js-libp2p) и Electron. Он решает проблему, знакомую почти каждому: **в этом месяце остаётся, в следующем не хватает.**\n\n> Сценарий: вы платите за OpenAI или Claude и редко сжигаете весь месячный лимит. Вместо того чтобы дать ему истечь, подключите его к P2P-сети. Каждый запрос, прошедший через ваш узел, конвертируется в **токены MBP** (минуты онлайн × 0,05 + количество расшаренных токенов × 2 + обслуженные запросы × 0,1 + скорость ответа × 0,5). Когда следующий месяц и лимит на исходе, вы тратите эти MBP, чтобы вызвать токены других пиров. Никогда не вмешивается центральный сервер, и ваш API-ключ остаётся на вашей машине.\n\n- **Provision / Share**: зарегистрируйте API-ключ вашей подписки и модели, которыми хотите поделиться. Сеть узнаёт ваш peerId.\n- **Consume / Drive**: поднимите локальный совместимый с OpenAI HTTP-прокси на `http://127.0.0.1:18100`; укажите на него любой совместимый клиент; запросы пересылаются через P2P пиру, который фактически хранит токен.\n- **Wallet**: каждое предоставление или вызов накапливает токены MBP. Вкладка Главная и страница Wallet показывают баланс, разбивку и формулу в реальном времени. Сейчас MBP — это только учёт; будущие версии используют его для репутации, поощрений и приоритетной маршрутизации.\n- **Без онбординга**: первый запуск получает узлы-сиды с официального эндпоинта (или локального mock), после чего полностью работает в режиме P2P.",
    "features": "| Функция | Примечания |\n|---|---|\n| **P2P-транспорт** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Децентрализованное доверие** | 4 зашитых узла-сида как якоря доверия; новые пиры входят через цепочку доверия (следующая веха) |\n| **Холодный старт** | Первый запуск получает узлы с официального HTTPS-эндпоинта или локального mock; всё попадает в `<userData>/bootstrap-cache.json` |\n| **Мульти-провайдер маршрутизация** | Один пир может хостить OpenAI + Anthropic + Google одновременно; вызывающие маршрутизируют по `model.id` |\n| **Прокси, совместимый с OpenAI** | Локальный HTTP-прокси на `:18100`; любой совместимый с OpenAI/Anthropic клиент работает из коробки |\n| **Auth по API-ключу (опционально)** | Зафиксируйте ключ в прокси потребления; вызывающие должны слать `Authorization: Bearer <key>` |\n| **22 языка** | Русский по умолчанию; поддержка арабского RTL |\n| **Светлая тема по умолчанию** | Переключение на тёмную / следовать ОС |",
    "screenshots": "Главная, Модели, Кошелёк, Журналы, Настройки — всего пять видов. Скриншоты в полном разрешении в [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (кэш models.dev)                   │\n│              ├─ registry    (официальный API + фолбэк кэша)     │\n│              ├─ p2p         (демон libp2p)                     │\n│              ├─ provisioner (мульти-провайдер маршрутизатор)   │\n│              ├─ proxy-server (HTTP совместимый с OpenAI)       │\n│              ├─ upstream    (реальные вызовы API)              │\n│              ├─ wallet      (расчёт балла MBP)                 │\n│              └─ models      (агрегатор каталога)               │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   P2P-сеть        │\n              └──────────────────┘\n```\n\n```bash\n# Объявление узла v2 — см. следующий раздел\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Локальный прокси потребления\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Четыре ID узлов-сидов вшиты в бинарник (`src/main/config/trusted-roots.ts`). Поток холодного старта:\n\n1. Локальный кэш пуст при первом запуске\n2. Параллельное получение: официальный HTTPS-эндпоинт + настроенные `bootstrapMultiaddrs` + mDNS\n3. Проверка каждого peerId по `TRUSTED_ROOT_PEER_IDS`\n4. Сохранение проверенного подмножества в `<userData>/bootstrap-cache.json`\n5. Демон P2P стартует; попадания в кэш остаются в P2P-режиме; промахи повторяют официальный эндпоинт каждый час\n\n```\n4 зашитых корня  ←  якоря доверия\n└─ в кэше с официального эндпоинта\n   ├─ прямое подключение через bootstrapMultiaddrs\n   ├─ mDNS (обнаружение в LAN)\n   └─ libp2p DHT findProviders (чистый P2P)\n```\n\nОфициальный эндпоинт сохраняется **навсегда** как канал спасения, даже когда P2P-сеть здорова.",
    "schema": "Запрос: `<https://modelbus.cc/api/v1/nodes>` возвращает `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nПоля:\n\n- **version** `2`: версия схемы; +1 при ломающих изменениях\n- **peerId**: libp2p PeerId, глобально уникальный\n- **nickname**: читаемое имя\n- **providers[]**: LLM-провайдеры, которые хостит этот пир\n  - **providerId**: id провайдера в models.dev\n  - **providerName**: отображаемое имя\n  - **models[]**: модели у этого провайдера; каждая имеет `id` (канонический) и `name` (отображаемый)\n- **addr**: единственный основной адрес (единственное число)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: Unix-мс последнего обновления\n- **expiresAt**: мягкий TTL; устаревшие записи всё ещё применимы, но с меньшим весом\n\nПоследние 4 записи в `mock/nodes.json` — доверенные узлы-сиды; их peerId совпадают с `trusted-roots.ts`.",
    "flow": "**Provision** (вы = держатель токена): Настройки → Поделиться Token → выберите провайдера, вставьте API-ключ, отметьте модели → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (вы = потребитель токена): выберите доверенный пир на вкладке Модели → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → приходит POST HTTP → извлечь `body.model` → набрать пир → записать `InferenceRequest` (JSON + префикс длины) → блокирующе дождаться `InferenceResponse` → записать HTTP-ответ.\n\n**Маршрутизация запроса** (на вызываемом пире `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ совпадение: конфигурация провайдера openai\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ реальный вызов, вернуть ответ\n  └─ нет совпадения: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Официальные установщики (пакеты Windows / macOS / Linux, а позже мобильный и Web SDK) сейчас готовятся.\n\n**Чтобы использовать сейчас: соберите из исходников**\n\n```bash\npnpm install\npnpm run dev          # режим разработки (Electron + Vite HMR)\npnpm run package:mac  # dmg для macOS\npnpm run package:win  # nsis для Windows\npnpm run package:linux # AppImage для Linux\n```\n\nАртефакты попадают в `release/`.\n\n**Каналы распространения (планируемые)**: официальная страница загрузки · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Официальный домен остаётся пожизненным спасательным эндпоинтом.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nПри первом запуске приложение по умолчанию указывает на `mock/nodes.json`, поэтому весь поток работает без сети. Подробнее в главном [README.md](../README.md) и каталоге [docs/](../docs/).",
    "roadmap": "- ✅ v1: мульти-провайдер, официальный холодный старт, якоря доверия, P2P-пересылка, 22 языка, каркас кошелька\n- 🔜 v2: цепочка доверия (trustChain) — реестр приглашений, подписанный Ed25519\n- 🔜 v3: оценка качества узла по реальным метрикам (задержка, ошибки, аптайм)\n- 🔜 v4: цикл токен-экономики — MBP ведёт приоритетную маршрутизацию, буст холодного старта и обнаружение узлов\n- 🔜 v5: мобильные пиры\n- 🔜 v6: веб-SDK — `<modelbus>` в браузере"
  }
},


  'it-IT': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : Una piattaforma decentralizzata per la condivisione di token LLM",
  "tagline": "Probabilmente la prima piattaforma al mondo dove chiunque può collegare il proprio Token a una rete P2P e, in cambio, usare i Token condivisi da altri peer. Nessun server centrale, nessuna registrazione, nessuna chiave API lascia mai la tua macchina.",
  "statusSentence": "ModelBus-P2P è ancora in fase di sviluppo e test pubblici.",
  "sections": {
    "toc": "## Indice",
    "what": "## Cos'è",
    "features": "## Funzionalità principali",
    "screenshots": "## Schermate",
    "architecture": "## Architettura",
    "decentralised": "## Design decentralizzato",
    "schema": "## Schema annuncio nodo (v2)",
    "flow": "## Flusso di una richiesta",
    "download": "## Download e uso (in arrivo)",
    "quickstart": "## Avvio rapido",
    "roadmap": "## Roadmap"
  },
  "body": {
    "what": "ModelBus-P2P è un client desktop basato su [js-libp2p](https://github.com/libp2p/js-libp2p) ed Electron. Risolve un problema che quasi tutti conosciamo: **questo mese avanza, il prossimo non basta.**\n\n> Scenario: paghi OpenAI o Claude e raramente consumi tutta la quota mensile. Invece di lasciarla scadere, agganciala alla rete P2P. Ogni richiesta che passa attraverso il tuo nodo viene convertita in **token MBP** (minuti online × 0,05 + numero di token condivisi × 2 + richieste servite × 0,1 + velocità di risposta × 0,5). Quando arriva il mese successivo e la tua quota è agli sgoccioli, spendi quegli MBP per invocare i Token condivisi da altri peer. Non c'è mai un server centrale di mezzo, e la tua chiave API resta sulla tua macchina.\n\n- **Provision / Share**: registra la chiave API del tuo abbonamento e i modelli che vuoi condividere. La rete apprende il tuo peerId.\n- **Consume / Drive**: avvia un proxy HTTP locale compatibile con OpenAI su `http://127.0.0.1:18100`; qualsiasi client compatibile lo punta lì; le richieste vengono inoltrate via P2P al peer che detiene effettivamente il Token.\n- **Wallet**: ogni condivisione o chiamata genera token MBP. La scheda Home e la pagina Wallet mostrano saldo, ripartizione e formula in tempo reale. MBP è attualmente solo contabile; le versioni future lo useranno per reputazione, incentivi e instradamento prioritario.\n- **Niente onboarding**: al primo avvio recupera nodi seed dall'endpoint ufficiale (o da un mock locale), poi funziona interamente in modalità P2P.",
    "features": "| Funzionalità | Note |\n|---|---|\n| **Trasporto P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Fiducia decentralizzata** | 4 peerId seed hardcodati come ancore di fiducia; i nuovi peer entrano tramite catena di fiducia (prossima milestone) |\n| **Fallback cold-start** | Il primo avvio recupera i nodi dall'endpoint HTTPS ufficiale o da un mock locale; tutto atterra in `<userData>/bootstrap-cache.json` |\n| **Instradamento multi-provider** | Un peer può ospitare OpenAI + Anthropic + Google contemporaneamente; i chiamanti instradano per `model.id` |\n| **Proxy compatibile OpenAI** | Proxy HTTP locale su `:18100`; qualsiasi client compatibile OpenAI/Anthropic funziona subito |\n| **Auth API key (opzionale)** | Fissa una chiave nel proxy di consumo; i chiamanti devono inviare `Authorization: Bearer <key>` |\n| **22 lingue** | Italiano predefinito; arabo RTL supportato |\n| **Tema chiaro predefinito** | Commutabile in scuro / segui SO |",
    "screenshots": "Home, Modelli, Wallet, Log, Impostazioni: cinque viste in totale. Le schermate a risoluzione piena sono in [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (cache models.dev)                 │\n│              ├─ registry    (API ufficiale + fallback cache)   │\n│              ├─ p2p         (demone libp2p)                     │\n│              ├─ provisioner (router multi-provider)           │\n│              ├─ proxy-server (HTTP compatibile OpenAI)          │\n│              ├─ upstream    (chiamate API reali)               │\n│              ├─ wallet      (calcolo score MBP)                │\n│              └─ models      (aggregatore catalogo)              │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   Rete P2P        │\n              └──────────────────┘\n```\n\n```bash\n# Annuncio nodo v2 — vedi sezione seguente\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Proxy locale di consumo\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Quattro peerId seed sono impressi nel binario (`src/main/config/trusted-roots.ts`). Flusso di cold-start:\n\n1. La cache locale è vuota al primo avvio\n2. Recupero in parallelo: endpoint HTTPS ufficiale + `bootstrapMultiaddrs` configurati + mDNS\n3. Ogni peerId viene validato contro `TRUSTED_ROOT_PEER_IDS`\n4. Il sottoinsieme validato viene persistito in `<userData>/bootstrap-cache.json`\n5. Il demone P2P parte; i successi di cache restano in P2P; i fallimenti ritentano l'endpoint ufficiale ogni ora\n\n```\n4 radici hardcodate  ←  ancore di fiducia\n└─ in cache dall'endpoint ufficiale\n   ├─ connessione diretta via bootstrapMultiaddrs\n   ├─ mDNS (discovery LAN)\n   └─ libp2p DHT findProviders (P2P puro)\n```\n\nL'endpoint ufficiale resta **per sempre** come canale di soccorso, anche quando la rete P2P è in salute.",
    "schema": "Richiesta: `<https://modelbus.cc/api/v1/nodes>` restituisce `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nCampi:\n\n- **version** `2`: versione di schema, +1 ad ogni cambio incompatibile\n- **peerId**: libp2p PeerId, globalmente unico\n- **nickname**: nome leggibile\n- **providers[]**: provider LLM ospitati da questo peer\n  - **providerId**: id del provider in models.dev\n  - **providerName**: nome visualizzato\n  - **models[]**: modelli sotto questo provider; ognuno ha `id` (canonico) e `name` (visualizzato)\n- **addr**: singolo indirizzo principale raggiungibile (singolare)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: Unix ms dell'ultimo aggiornamento\n- **expiresAt**: TTL morbido; voci scadute restano utilizzabili con peso ridotto\n\nLe ultime 4 voci di `mock/nodes.json` sono i peer seed fidati; i loro peerId coincidono con `trusted-roots.ts`.",
    "flow": "**Provision** (tu = detentore del Token): Impostazioni → Condivisione Token → scegli provider, incolla la chiave API, seleziona i modelli → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (tu = consumatore del Token): scegli un peer fidato nella scheda Modelli → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → arriva un POST HTTP → estrae `body.model` → compone il peer → scrive `InferenceRequest` (JSON con prefisso di lunghezza) → attende bloccando `InferenceResponse` → scrive la risposta HTTP.\n\n**Instradamento lato chiamato** (`ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ match: configurazione provider openai\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ chiamata reale, restituisce risposta\n  └─ nessun match: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Gli installer ufficiali (pacchetti Windows / macOS / Linux, e in seguito mobile e Web SDK) sono attualmente in preparazione.\n\n**Per usarlo da subito: compila dai sorgenti**\n\n```bash\npnpm install\npnpm run dev          # modalità sviluppo (Electron + Vite HMR)\npnpm run package:mac  # dmg per macOS\npnpm run package:win  # nsis per Windows\npnpm run package:linux # AppImage per Linux\n```\n\nGli artefatti finiscono in `release/`.\n\n**Canali di distribuzione (previsti)**: pagina ufficiale di download · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Il dominio ufficiale resta a lungo come endpoint di soccorso.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nAl primo avvio l'app punta di default a `mock/nodes.json`, quindi l'intero flusso funziona senza rete. Per dettagli vedi il [README.md](../README.md) principale e la cartella [docs/](../docs/).",
    "roadmap": "- ✅ v1: multi-provider, cold-start ufficiale, radici di fiducia, inoltro P2P, 22 lingue, scheletro del Wallet\n- 🔜 v2: catena di fiducia (trustChain) — registro inviti firmato Ed25519\n- 🔜 v3: valutazione qualità nodo basata su metriche reali (latenza, tasso di errori, uptime)\n- 🔜 v4: ciclo economico dei token — MBP pilota instradamento prioritario, boost al cold-start, discovery\n- 🔜 v5: peer mobili\n- 🔜 v6: Web SDK — `<modelbus>` nel browser"
  }
},
  'da-DK': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : En decentral platform til deling af LLM-tokens",
  "tagline": "Måske verdens første platform, hvor alle kan tilknytte deres Token til et P2P-netværk og til gengæld bruge andre peers' delte Tokens. Ingen central server, ingen kontooprettelse, ingen API-nøgle forlader nogensinde din maskine.",
  "statusSentence": "ModelBus-P2P er stadig under udvikling og offentlig test.",
  "sections": {
    "toc": "## Indhold",
    "what": "## Hvad er det",
    "features": "## Kernefunktioner",
    "screenshots": "## Skærmbilleder",
    "architecture": "## Arkitektur",
    "decentralised": "## Decentralt design",
    "schema": "## Node-annonceformat (v2)",
    "flow": "## Forespørgselsflow",
    "download": "## Download og brug (kommer snart)",
    "quickstart": "## Hurtig start",
    "roadmap": "## Roadmap"
  },
  "body": {
    "what": "ModelBus-P2P er en desktop-klient bygget på [js-libp2p](https://github.com/libp2p/js-libp2p) og Electron. Den løser et problem de fleste kender: **denne måned er der overskud, næste måned er der underskud.**\n\n> Scenarie: du betaler for OpenAI eller Claude og opbruger sjældent hele din månedlige kvote. I stedet for at lade den udløbe kan du koble den til P2P-netværket. Hver forespørgsel der løber gennem din node, omregnes til **MBP-tokens** (online-minutter × 0,05 + delt Token-antal × 2 + betjente forespørgsler × 0,1 + svartid × 0,5). Næste måned hvor kvoten er ved at slippe op, bruger du de MBP til at kalde Tokens der deles af andre peers. Der er aldrig en central server indblandet, og din API-nøgle bliver på din maskine.\n\n- **Provision / Share**: registrer din abonnements-API-nøgle og de modeller du vil dele. Netværket lærer dit peerId.\n- **Consume / Drive**: start en lokal OpenAI-kompatibel HTTP-proxy på `http://127.0.0.1:18100`; peg enhver kompatibel klient derhen; forespørgsler videresendes over P2P til den peer der faktisk holder Token.\n- **Wallet**: hver deling eller kald akkumulerer MBP-tokens. Home-fanen og Wallet-siden viser saldo, opdeling og formel i realtid. MBP er pt. kun bogføring; fremtidige versioner bruger det til omdømme, incitamenter og prioriteret routing.\n- **Ingen onboarding**: første start henter seed-noder fra det officielle endpoint (eller en lokal mock) og kører herefter fuldt i P2P-tilstand.",
    "features": "| Funktion | Bemærkninger |\n|---|---|\n| **P2P-transport** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Decentral tillid** | 4 hardcodede seed-peer-IDs som tillidsankre; nye peers tilsluttes via tillidskæde (næste milepæl) |\n| **Cold-start-fallback** | Første start henter noder fra det officielle HTTPS-endpoint eller en lokal mock; alt lander i `<userData>/bootstrap-cache.json` |\n| **Multi-provider-routing** | Én peer kan hoste OpenAI + Anthropic + Google samtidigt; kaldere router via `model.id` |\n| **OpenAI-kompatibel proxy** | Lokal HTTP-proxy på `:18100`; enhver OpenAI/Anthropic-kompatibel klient virker ud af boksen |\n| **API-nøgle-auth (valgfri)** | Sæt en fast nøgle i consume-proxyen; kaldere skal sende `Authorization: Bearer <key>` |\n| **22 sprog** | Dansk som standard; RTL-arabisk understøttet |\n| **Lyst standardtema** | Skift til mørkt / følg OS |",
    "screenshots": "Home, Models, Wallet, Logs, Settings — fem visninger i alt. Skærmbilleder i fuld opløsning ligger i [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (models.dev cache)                  │\n│              ├─ registry    (officielt API + cache-fallback)   │\n│              ├─ p2p         (libp2p-dæmon)                      │\n│              ├─ provisioner (multi-provider-router)             │\n│              ├─ proxy-server (OpenAI-kompatibelt HTTP)          │\n│              ├─ upstream    (ægte provider-API-kald)             │\n│              ├─ wallet      (MBP-scoreberegning)                │\n│              └─ models      (katalogaggregator)                 │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   P2P-netværk     │\n              └──────────────────┘\n```\n\n```bash\n# Node-annonce v2 — se næste sektion\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Lokal consume-proxy\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Fire seed-peer-IDs er indgraveret i binæren (`src/main/config/trusted-roots.ts`). Cold-start-flow:\n\n1. Lokal cache er tom ved første start\n2. Hent parallelt: officielt HTTPS-endpoint + brugerkonfigurerede `bootstrapMultiaddrs` + mDNS\n3. Valider hver peerId mod `TRUSTED_ROOT_PEER_IDS`\n4. Persistér det validerede subset i `<userData>/bootstrap-cache.json`\n5. P2P-dæmonen starter; cache-hit forbliver i P2P-tilstand; misser prøver det officielle endpoint igen hver time\n\n```\n4 hardcodede rødder  ←  tillidsankre\n└─ cachet fra officielt endpoint\n   ├─ direkte forbindelse via bootstrapMultiaddrs\n   ├─ mDNS (LAN-discovery)\n   └─ libp2p DHT findProviders (ren P2P)\n```\n\nDet officielle endpoint bevares **for altid** som redningskanal, også når P2P-netværket er sundt.",
    "schema": "Forespørgsel: `<https://modelbus.cc/api/v1/nodes>` returnerer `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nFelter:\n\n- **version** `2`: skemaversion; +1 ved brydende ændringer\n- **peerId**: libp2p PeerId, globalt entydig\n- **nickname**: menneskelæseligt navn\n- **providers[]**: LLM-udbydere som denne peer hoster\n  - **providerId**: udbyder-id i models.dev\n  - **providerName**: visningsnavn\n  - **models[]**: modeller under denne udbyder; hver har `id` (kanonisk) og `name` (visning)\n- **addr**: enkelt primær adresse (ental, ikke flertal)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: Unix-ms for seneste opdatering\n- **expiresAt**: blød TTL; udløbne entries er stadig brugbare men vægtes lavere\n\nDe sidste 4 entries i `mock/nodes.json` er de betroede seed-peers; deres peer-IDs matcher `trusted-roots.ts`.",
    "flow": "**Provision** (dig = Token-indehaver): Indstillinger → Token-deling → vælg udbyder, indsæt API-nøgle, markér modeller → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (dig = Token-forbruger): vælg en betroet peer under Models → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → en HTTP POST modtages → udtræk `body.model` → ring til peer → skriv `InferenceRequest` (JSON + længdeprefix) → bloker på `InferenceResponse` → skriv HTTP-svar.\n\n**Forespørgselsrouting** (på den kaldte peer, `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ match: openai-udbyderkonfiguration\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ kald rigtigt, returnér svar\n  └─ intet match: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Officielle installere (Windows / macOS / Linux-pakker, og senere mobil og Web SDK) er under forberedelse.\n\n**For at bruge det nu: byg fra kildekoden**\n\n```bash\npnpm install\npnpm run dev          # udviklingstilstand (Electron + Vite HMR)\npnpm run package:mac  # macOS dmg\npnpm run package:win  # Windows nsis\npnpm run package:linux # Linux AppImage\n```\n\nArtefakterne ender i `release/`.\n\n**Distributionskanaler (planlagt)**: officiel download-side · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Det officielle domæne er permanent redningsendepunktet.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nVed første start peger appen som standard på `mock/nodes.json`, så hele flowet fungerer uden netværk. For mere, se hoved-[README.md](../README.md) og mappen [docs/](../docs/).",
    "roadmap": "- ✅ v1: multi-provider, officiel cold-start, tillidsankre, P2P-videresendelse, 22 sprog, Wallet-skelet\n- 🔜 v2: tillidskæde (trustChain) — Ed25519-signeret invite-ligebog\n- 🔜 v3: nodekvalitetsbedømmelse baseret på reelle målinger (latens, fejlrate, oppetid)\n- 🔜 v4: token-økonomi-løkke — MBP styrer prioriteret routing, cold-start-boost, node-discovery\n- 🔜 v5: mobile peers\n- 🔜 v6: Web SDK — `<modelbus>` i browseren"
  }
},


  'ko-KR': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : 탈중앙 LLM Token 공유 플랫폼",
  "tagline": "아마도 세계 최초, 누구나 자신의 Token을 P2P 네트워크에 연결하고 다른 피어가 공유한 Token을 사용할 수 있는 플랫폼. 중앙 서버 없이, 계정 등록 없이, API 키가 당신의 컴퓨터 밖으로 나가지 않습니다.",
  "statusSentence": "ModelBus-P2P는 아직 개발 및 공개 테스트 단계입니다.",
  "sections": {
    "toc": "## 목차",
    "what": "## 이것은 무엇인가",
    "features": "## 핵심 기능",
    "screenshots": "## 화면 미리보기",
    "architecture": "## 아키텍처",
    "decentralised": "## 탈중앙 설계",
    "schema": "## 노드 공지 포맷 (v2)",
    "flow": "## 요청 흐름",
    "download": "## 다운로드 및 사용 (출시 예정)",
    "quickstart": "## 빠른 시작",
    "roadmap": "## 로드맵"
  },
  "body": {
    "what": "ModelBus-P2P는 [js-libp2p](https://github.com/libp2p/js-libp2p)와 Electron 기반의 데스크톱 클라이언트로, 누구나 한 번쯤 겪는 **이번 달엔 남고 다음 달엔 부족한** 문제를 해결합니다.\n\n> 시나리오: OpenAI나 Claude를 구독해도 월간 한도를 다 쓰지 못하는 경우가 많습니다. 말일에 사라지기 전에 P2P 네트워크에 연결하세요. 노드를 통과한 모든 요청은 **MBP 토큰**(온라인 분 × 0.05 ＋ 공유 Token 수 × 2 ＋ 처리 요청 수 × 0.1 ＋ 응답 속도 × 0.5)으로 환산됩니다. 다음 달에 한도가 모자라면 그 MBP로 다른 피어의 공유 Token을 호출할 수 있습니다. 모든 과정은 중앙 서버 없이 진행되며, API 키는 항상 당신의 컴퓨터에 머뭅니다.\n\n- **Provision / Share**: 구독 API 키와 공유할 모델을 등록. 네트워크에 peerId 공개.\n- **Consume / Drive**: 로컬에 OpenAI 호환 HTTP 프록시(`http://127.0.0.1:18100`)를 띄우고 base_url을 거기로 지정. 요청은 P2P를 통해 실제 Token 보유자에게 전달됨.\n- **Wallet**: 공유든 호출이든 모두 MBP 토큰으로 환산. 홈 탭과 Wallet 화면에서 잔액·내역·공식을 실시간 표시.\n- **온보딩 불필요**: 첫 실행 시 공식 엔드포인트(또는 로컬 mock)에서 시드 피어를 가져오고, 이후 완전한 P2P 모드로 동작.",
    "features": "| 기능 | 설명 |\n|---|---|\n| **P2P 트랜스포트** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT 통과 + Kademlia DHT + AutoNAT |\n| **탈중앙 신뢰** | 하드코드된 시드 피어 4개가 신뢰 앵커. 신규 피어는 신뢰 체인(다음 마일스톤)으로 합류 |\n| **콜드 스타트 보강** | 첫 실행 시 공식 HTTPS 엔드포인트(또는 로컬 mock)에서 노드를 가져오고, 이후 `<userData>/bootstrap-cache.json`에 캐시 |\n| **다중 Provider 라우팅** | 한 피어가 OpenAI + Anthropic + Google 키를 동시에 보유 가능. 호출 측은 `model.id`로 자동 라우팅 |\n| **OpenAI 호환 프록시** | 로컬 HTTP 프록시(기본 `:18100`). OpenAI / Anthropic 호환 클라이언트가 그대로 사용 가능 |\n| **API 키 인증(선택)** | 컨슈머 측에서 고정 키를 설정하고, 호출 측이 `Authorization: Bearer <key>` 헤더로 전달 |\n| **22개 언어** | 기본은 한국어. RTL 아랍어 지원 |\n| **라이트 모드 기본 테마** | 다크 모드 / OS 추종으로 전환 가능 |",
    "screenshots": "홈, 모델, 월렛, 로그, 설정 — 총 5개 화면. 전체 해상도 스크린샷은 [docs/image/](../docs/image/) 폴더에 있습니다.",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (models.dev cache)                  │\n│              ├─ registry    (공식 API + 캐시 폴백)            │\n│              ├─ p2p         (libp2p 데몬)                       │\n│              ├─ provisioner (다중 Provider 라우터)              │\n│              ├─ proxy-server (OpenAI 호환 HTTP)                 │\n│              ├─ upstream    (실제 provider API 호출)          │\n│              ├─ wallet      (MBP 점수 계산)                      │\n│              └─ models      (카탈로그 통합)                       │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   P2P 네트워크     │\n              └──────────────────┘\n```\n\n```bash\n# 노드 공지 포맷 (v2) — 아래 섹션 참조\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# 컨슈머 측 로컬 HTTP 프록시\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "바이너리에 시드 피어 ID 4개가 하드코드되어 있습니다(`src/main/config/trusted-roots.ts`). 콜드 스타트 흐름:\n\n1. 첫 실행 시 로컬 캐시가 비어 있음\n2. 동시 수집: 공식 HTTPS 엔드포인트 + 사용자가 설정한 `bootstrapMultiaddrs` + mDNS\n3. 모든 peerId를 `TRUSTED_ROOT_PEER_IDS`와 대조하여 검증\n4. 검증된 서브셋을 `<userData>/bootstrap-cache.json`에 영구 저장\n5. P2P 데몬 시작. 캐시 적중 시 P2P 전용, 미적중 시 매시간 공식 엔드포인트를 백그라운드에서 재시도\n\n```\n하드코드된 4개의 루트  ←  신뢰 앵커\n└─ 공식 엔드포인트에서 캐시\n   ├─ bootstrapMultiaddrs로 직접 연결\n   ├─ mDNS (LAN 디스커버리)\n   └─ libp2p DHT findProviders (P2P 전용)\n```\n\n공식 엔드포인트는 **영구히** P2P 네트워크가 정상일 때도 구조 채널로 보존됩니다.",
    "schema": "요청: `<https://modelbus.cc/api/v1/nodes>` 는 `Array<NodeAnnouncement>` 를 반환합니다:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\n필드:\n\n- **version** `2`: 스키마 버전. 호환을 깨는 변경 시 +1\n- **peerId**: libp2p PeerId (전 세계 유일)\n- **nickname**: 사람이 읽을 수 있는 이름\n- **providers[]**: 해당 피어가 호스팅하는 LLM 공급자 목록\n  - **providerId**: models.dev의 provider id\n  - **providerName**: 표시 이름\n  - **models[]**: 해당 공급자 하위에서 공유하는 모델. 각 항목은 `id`(정규 ID)와 `name`(표시명)을 가짐\n- **addr**: 단일 주요 도달 주소(복수가 아닌 단수)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: 이 항목이 마지막으로 갱신된 Unix ms\n- **expiresAt**: 부드러운 TTL. 만료된 항목도 사용 가능하나 가중치가 낮아짐\n\n`mock/nodes.json`의 마지막 4개 항목은 신뢰할 수 있는 시드 피어이며, peerId는 `trusted-roots.ts`와 일치합니다.",
    "flow": "**Provision** (당신 = Token 보유자): 설정 → Token 공유 → 공급자 선택 → API 키 붙여넣기 → 모델 선택 → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (당신 = Token 소비자): 모델 탭에서 신뢰 피어 선택 → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → HTTP POST 수신 → `body.model` 추출 → 피어에 다이얼 → `InferenceRequest`(JSON + 길이 접두사) 송신 → `InferenceResponse`를 블로킹 수신 → HTTP 응답으로 기록.\n\n**요청 라우팅**(피호출 측 `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ 일치: openai 공급자 설정\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ 실제 호출 후 응답 반환\n  └─ 불일치: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 공식 인스톨러(Windows / macOS / Linux 패키지, 추후 모바일·Web SDK)는 현재 준비 중입니다.\n\n**지금 사용하려면: 소스에서 빌드**\n\n```bash\npnpm install\npnpm run dev          # 개발 모드(Electron + Vite HMR)\npnpm run package:mac  # macOS dmg\npnpm run package:win  # Windows nsis\npnpm run package:linux # Linux AppImage\n```\n\n산출물은 `release/`에 위치합니다.\n\n**배포 채널(예정)**: 공식 다운로드 페이지 · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. 공식 도메인은 영구히 구조 채널로 남습니다.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\n첫 실행 시 앱은 기본적으로 `mock/nodes.json`을 가리키므로 네트워크 없이 전체 흐름을 체험할 수 있습니다. 자세한 내용은 메인 [README.md](../README.md) 및 [docs/](../docs/) 폴더를 참고하세요.",
    "roadmap": "- ✅ v1: 다중 Provider, 공식 콜드 스타트, 신뢰 앵커, P2P 포워딩, 22개 언어, 월렛 골격\n- 🔜 v2: 신뢰 체인(trustChain) — Ed25519 서명 기반 초대 원장\n- 🔜 v3: 실측 지표(지연·오류율·가동률) 기반 노드 품질 평가\n- 🔜 v4: 토큰 경제 루프 — MBP가 우선 라우팅·콜드 스타트 부스트·노드 디스커버리를 구동\n- 🔜 v5: 모바일 피어\n- 🔜 v6: Web SDK — 브라우저용 `<modelbus>`"
  }
},
  'de-DE': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : Eine dezentrale LLM-Token-Sharing-Plattform",
  "tagline": "Möglicherweise die weltweit erste Plattform, auf der jeder seine Tokens an ein P2P-Netzwerk hängen und im Gegenzug die Tokens anderer Peers nutzen kann. Kein zentraler Server, kein Konto, kein API-Schlüssel verlässt jemals deine Maschine.",
  "statusSentence": "ModelBus-P2P befindet sich noch in Entwicklung und öffentlichem Test.",
  "sections": {
    "toc": "## Inhalt",
    "what": "## Was ist es",
    "features": "## Kernfunktionen",
    "screenshots": "## Bildschirmfotos",
    "architecture": "## Architektur",
    "decentralised": "## Dezentrales Design",
    "schema": "## Knoten-Ankündigungsformat (v2)",
    "flow": "## Anfrage-Ablauf",
    "download": "## Download & Nutzung (demnächst)",
    "quickstart": "## Schnellstart",
    "roadmap": "## Roadmap"
  },
  "body": {
    "what": "ModelBus-P2P ist ein Desktop-Client auf Basis von [js-libp2p](https://github.com/libp2p/js-libp2p) und Electron. Er löst ein Problem, das fast jeder kennt: **diesen Monat übrig, nächsten Monat zu wenig.**\n\n> Szenario: Du zahlst für OpenAI oder Claude und verbrennst dein monatliches Kontingent selten. Statt es verfallen zu lassen, hänge es an das P2P-Netzwerk. Jede Anfrage, die über deinen Knoten läuft, wird in **MBP-Token** umgerechnet (Online-Minuten × 0,05 + geteilte Token-Anzahl × 2 + bediente Anfragen × 0,1 + Antwortgeschwindigkeit × 0,5). Wenn der nächste Monat kommt und dein Kontingent knapp wird, gibst du diese MBP-Token aus, um Token anderer Peers aufzurufen. Es ist kein zentraler Server beteiligt, und dein API-Schlüssel bleibt auf deiner Maschine.\n\n- **Provision / Share**: Hinterlege deinen API-Schlüssel und die Modelle, die du teilen möchtest. Das Netzwerk lernt deine Peer-ID.\n- **Consume / Drive**: Starte einen lokalen OpenAI-kompatiblen HTTP-Proxy auf `http://127.0.0.1:18100`; jeder kompatible Client kann direkt darauf zugreifen; Anfragen werden über P2P an den Peer weitergeleitet, der den Token tatsächlich hält.\n- **Wallet**: Jede Bereitstellung oder jeder Aufruf sammelt MBP-Token. Der Home-Tab und die Wallet-Seite zeigen Saldo, Aufschlüsselung und Formel in Echtzeit. MBP wird derzeit nur als Buchung geführt; zukünftige Versionen nutzen es für Reputation, Anreize und priorisiertes Routing.\n- **Kein Onboarding**: Der erste Start holt Seed-Knoten vom offiziellen Endpunkt (oder einem lokalen Mock) und läuft danach vollständig im P2P-Modus.",
    "features": "| Funktion | Hinweise |\n|---|---|\n| **P2P-Transport** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Dezentrales Vertrauen** | 4 fest kodierte Seed-Peer-IDs als Vertrauensanker; neue Peers kommen über eine Vertrauenskette (nächster Meilenstein) hinzu |\n| **Cold-Start-Fallback** | Erster Start zieht Knoten vom offiziellen HTTPS-Endpunkt oder einem lokalen Mock; alles landet in `<userData>/bootstrap-cache.json` |\n| **Multi-Provider-Routing** | Ein Peer kann OpenAI + Anthropic + Google gleichzeitig hosten; Aufrufer routen nach `model.id` |\n| **OpenAI-kompatibler Proxy** | Lokaler HTTP-Proxy auf `:18100`; jeder OpenAI-/Anthropic-kompatible Client funktioniert sofort |\n| **API-Schlüssel-Auth (optional)** | Im Consum-Proxy einen festen Schlüssel setzen; Aufrufer müssen `Authorization: Bearer <key>` senden |\n| **22 Sprachen** | Standard ist Deutsch; RTL-Arabisch unterstützt |\n| **Helles Standard-Theme** | Dunkel / OS folgen umschaltbar |",
    "screenshots": "Home, Models, Wallet, Logs, Settings – fünf Ansichten. Vollauflösende Screenshots liegen unter [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (models.dev Cache)                  │\n│              ├─ registry    (offizielle API + Cache-Fallback)   │\n│              ├─ p2p         (libp2p-Daemon)                      │\n│              ├─ provisioner (Multi-Provider-Router)             │\n│              ├─ proxy-server (OpenAI-kompatibles HTTP)          │\n│              ├─ upstream    (echte Provider-API-Aufrufe)        │\n│              ├─ wallet      (MBP-Scoreberechnung)                │\n│              └─ models      (Katalog-Aggregator)                 │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   P2P-Netzwerk    │\n              └──────────────────┘\n```\n\n```bash\n# Knoten-Ankündigung v2 – siehe unten\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Lokaler Consum-Proxy\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Vier Seed-Peer-IDs sind in die Binärdatei eingebrannt (`src/main/config/trusted-roots.ts`). Cold-Start-Flow:\n\n1. Lokaler Cache ist beim ersten Start leer\n2. Parallel abrufen: offizieller HTTPS-Endpunkt + vom Nutzer konfigurierte `bootstrapMultiaddrs` + mDNS\n3. Jede Peer-ID gegen `TRUSTED_ROOT_PEER_IDS` validieren\n4. Validierte Teilmenge in `<userData>/bootstrap-cache.json` speichern\n5. P2P-Daemon startet; Cache-Treffer bleiben im P2P-Modus; Misses versuchen den offiziellen Endpunkt jede Stunde erneut\n\n```\n4 fest kodierte Wurzeln  ←  Vertrauensanker\n└─ vom offiziellen Endpunkt zwischengespeichert\n   ├─ direkte Verbindung über bootstrapMultiaddrs\n   ├─ mDNS (LAN-Discovery)\n   └─ libp2p DHT findProviders (reines P2P)\n```\n\nDer offizielle Endpunkt bleibt **für immer** als Rettungskanal erhalten, auch wenn das P2P-Netzwerk gesund ist.",
    "schema": "Aufruf: `<https://modelbus.cc/api/v1/nodes>` liefert `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nFelder:\n\n- **version** `2`: Schema-Version; bei Breaking Changes +1\n- **peerId**: libp2p-Peer-ID, global eindeutig\n- **nickname**: Menschenlesbarer Name\n- **providers[]**: LLM-Provider, die dieser Peer hostet\n  - **providerId**: Provider-ID aus models.dev\n  - **providerName**: Anzeigename\n  - **models[]**: Modelle unter diesem Provider; jeder Eintrag hat `id` (kanonisch) und `name` (Anzeige)\n- **addr**: einzelne primäre erreichbare Adresse (Singular, nicht Plural)\n  - **kind**: `direct` / `relay` / `unknown`\n  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt**: Unix-ms der letzten Aktualisierung\n- **expiresAt**: weiche TTL; abgelaufene Einträge bleiben nutzbar, werden aber niedriger gewichtet\n\nDie letzten 4 Einträge in `mock/nodes.json` sind die vertrauenswürdigen Seed-Peers; ihre Peer-IDs stimmen mit `trusted-roots.ts` überein.",
    "flow": "**Provision** (du = Token-Inhaber): Einstellungen → Token-Freigabe → Anbieter auswählen → API-Schlüssel einfügen → Modelle markieren → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (du = Token-Konsument): Wähle im Models-Tab einen vertrauenswürdigen Peer → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → HTTP POST trifft ein → `body.model` extrahieren → Peer anwählen → `InferenceRequest` (JSON + Längenpräfix) senden → blockierend auf `InferenceResponse` warten → HTTP-Antwort schreiben.\n\n**Anfrage-Routing** (beim Angerufenen, `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ Treffer: openai-Provider-Konfiguration\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ echten Aufruf ausführen, Antwort zurückgeben\n  └─ kein Treffer: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Offizielle Installer (Windows / macOS / Linux, später Mobile und Web SDK) werden derzeit vorbereitet.\n\n**Sofort benutzen: aus dem Quellcode bauen**\n\n```bash\npnpm install\npnpm run dev          # Entwicklungsmodus (Electron + Vite HMR)\npnpm run package:mac  # macOS dmg\npnpm run package:win  # Windows nsis\npnpm run package:linux # Linux AppImage\n```\n\nDie Artefakte landen in `release/`.\n\n**Vertriebskanäle (geplant)**: offizielle Download-Seite · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Die offizielle Domain bleibt dauerhaft der Rettungsendpunkt.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nBeim ersten Start zeigt die App standardmäßig auf `mock/nodes.json`, sodass der gesamte Ablauf ohne Netzwerk funktioniert. Weitere Details im Haupt-[README.md](../README.md) und im [docs/](../docs/)-Ordner.",
    "roadmap": "- ✅ v1: Multi-Provider, offizieller Cold Start, Vertrauensanker, P2P-Weiterleitung, 22 Sprachen, Wallet-Gerüst\n- 🔜 v2: Vertrauenskette (trustChain) – Ed25519-signiertes Invite-Ledger\n- 🔜 v3: Qualitätsbewertung aus realen Metriken (Latenz, Fehlerrate, Verfügbarkeit)\n- 🔜 v4: Token-Ökonomie-Kreislauf – MBP steuert priorisiertes Routing, Cold-Start-Boosts und Knoten-Discovery\n- 🔜 v5: Mobile Peers\n- 🔜 v6: Web SDK – `<modelbus>` im Browser"
  }
},


  'es-ES': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : Una plataforma descentralizada de tokens LLM",
  "tagline": "Posiblemente la primera plataforma del mundo donde cualquiera puede conectar su Token a una red P2P y, a cambio, usar los Tokens compartidos por otros pares. Sin servidor central, sin cuenta, ninguna clave API sale jamás de tu equipo.",
  "statusSentence": "ModelBus-P2P sigue en desarrollo y en pruebas públicas.",
  "sections": {
    "toc": "## Índice",
    "what": "## ¿Qué es?",
    "features": "## Características principales",
    "screenshots": "## Capturas",
    "architecture": "## Arquitectura",
    "decentralised": "## Diseño descentralizado",
    "schema": "## Esquema de anuncio de nodo (v2)",
    "flow": "## Flujo de petición",
    "download": "## Descarga y uso (próximamente)",
    "quickstart": "## Inicio rápido",
    "roadmap": "## Hoja de ruta"
  },
  "body": {
    "what": "ModelBus-P2P es un cliente de escritorio construido sobre [js-libp2p](https://github.com/libp2p/js-libp2p) y Electron. Resuelve un problema que casi todos tenemos: **este mes me sobra, el que viene me falta**.\n\n> Escenario: pagas OpenAI o Claude y rara vez agotas el cupo mensual. En lugar de que caduque, cuélgalo en la red P2P. Cada petición que pase por tu nodo se convierte en **tokens MBP** (minutos en línea × 0,05 + número de Tokens compartidos × 2 + peticioneses servidas × 0,1 + velocidad de respuesta × 0,5). Cuando llegue el mes siguiente y tu cupo escasee, gastas esos MBP para invocar Tokens compartidos por otros pares. En ningún momento interviene un servidor central y la clave API permanece en tu equipo.\n\n- **Provision / Share**: registra la clave API de tu suscripción y los modelos que quieras compartir. La red aprende tu peerId.\n- **Consume / Drive**: arranca un proxy HTTP local compatible con OpenAI en `http://127.0.0.1:18100`; cualquier cliente compatible lo apunta ahí y las peticiones se reenvían por P2P al par que realmente guarda el Token.\n- **Wallet**: cada compartición o llamada genera tokens MBP. La pestaña Inicio y la página Wallet muestran saldo, desglose y fórmula en tiempo real. MBP hoy solo lleva contabilidad; futuras versiones lo usarán para reputación, incentivos y enrutado prioritario.\n- **Sin onboarding**: el primer arranque descarga nodos semilla del endpoint oficial (o de un mock local) y a partir de ahí opera completamente en modo P2P.",
    "features": "| Característica | Notas |\n|---|---|\n| **Transporte P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Confianza descentralizada** | 4 peerIds semilla hardcodeados como anclas de confianza; los nuevos pares entran por cadena de confianza (siguiente hito) |\n| **Cold-start de respaldo** | El primer arranque obtiene nodos del endpoint HTTPS oficial o de un mock local; todo aterriza en `<userData>/bootstrap-cache.json` |\n| **Enrutado multi-provider** | Un par puede hospedar OpenAI + Anthropic + Google a la vez; los llamadores enrutan por `model.id` |\n| **Proxy compatible con OpenAI** | Proxy HTTP local en `:18100`; cualquier cliente OpenAI/Anthropic-compatible funciona de fábrica |\n| **Auth por API key (opcional)** | Fija una clave en el proxy de consumo; los llamadores deben enviar `Authorization: Bearer <key>` |\n| **22 idiomas** | Español por defecto; árabe RTL soportado |\n| **Tema claro por defecto** | Conmutable a oscuro / seguir al SO |",
    "screenshots": "Inicio, Modelos, Wallet, Registros, Ajustes: cinco vistas en total. Las capturas a resolución completa están en [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (models.dev cache)                  │\n│              ├─ registry    (API oficial + fallback de caché)  │\n│              ├─ p2p         (daemon libp2p)                     │\n│              ├─ provisioner (enrutador multi-provider)          │\n│              ├─ proxy-server (HTTP compatible con OpenAI)      │\n│              ├─ upstream    (llamadas reales al provider)      │\n│              ├─ wallet      (cálculo de MBP)                     │\n│              └─ models      (agregador de catálogo)            │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   Red P2P         │\n              └──────────────────┘\n```\n\n```bash\n# Anuncio de nodo v2 — ver sección siguiente\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Proxy local de consumo\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Hay 4 peerIds semilla grabados en el binario (`src/main/config/trusted-roots.ts`). Flujo de arranque en frío:\n\n1. La caché local está vacía al primer arranque\n2. Captura en paralelo: endpoint HTTPS oficial + `bootstrapMultiaddrs` configurados + mDNS\n3. Valida cada peerId contra `TRUSTED_ROOT_PEER_IDS`\n4. Persiste el subconjunto validado en `<userData>/bootstrap-cache.json`\n5. Arranca el daemon P2P; los aciertos de caché se quedan en modo P2P; los fallos reintentan el endpoint oficial cada hora\n\n```\n4 raíces hardcodeadas  ←  anclas de confianza\n└─ cacheadas desde el endpoint oficial\n   ├─ conexión directa vía bootstrapMultiaddrs\n   ├─ mDNS (descubrimiento LAN)\n   └─ libp2p DHT findProviders (P2P puro)\n```\n\nEl endpoint oficial se conserva **siempre** como canal de rescate, incluso cuando la red P2P está sana.",
    "schema": "Petición: `<https://modelbus.cc/api/v1/nodes>` devuelve `Array<NodeAnnouncement>`:\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nCampos:\n\n- **version** `2` — versión de esquema; se incrementa ante cambios incompatibles\n- **peerId** — libp2p PeerId, globalmente único\n- **nickname** — nombre legible\n- **providers[]** — proveedores LLM que este par aloja\n  - **providerId** — id del proveedor en models.dev\n  - **providerName** — nombre a mostrar\n  - **models[]** — modelos bajo este proveedor; cada uno tiene `id` (canónico) y `name` (mostrado)\n- **addr** — única dirección principal alcanzable (singular)\n  - **kind** — `direct` / `relay` / `unknown`\n  - **transport** — `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt** — Unix ms de la última actualización\n- **expiresAt** — TTL blando; las entradas caducadas siguen usándose con menor peso\n\nLos 4 últimos elementos de `mock/nodes.json` son los pares semilla de confianza; sus peerIds coinciden con `trusted-roots.ts`.",
    "flow": "**Provision** (tú = poseedor del Token): Ajustes → Compartir Token → elige proveedor, pega la clave API, marca modelos → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (tú = consumidor del Token): elige un par de confianza en la pestaña Modelos → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → llega un HTTP POST → extrae `body.model` → marca al par → escribe `InferenceRequest` (JSON con prefijo de longitud) → espera `InferenceResponse` → escribe la respuesta HTTP.\n\n**Enrutado de la petición** (en el lado del par llamado, `ProvisionerService.handle`):\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ coincide: configuración del proveedor openai\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ llama y devuelve la respuesta\n  └─ no coincide: 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Los instaladores oficiales (paquetes Windows / macOS / Linux, y más adelante mobile y Web SDK) están en preparación.\n\n**Para usarlo ya: compila desde el código fuente**\n\n```bash\npnpm install\npnpm run dev          # modo desarrollo (Electron + Vite HMR)\npnpm run package:mac  # dmg para macOS\npnpm run package:win  # nsis para Windows\npnpm run package:linux # AppImage para Linux\n```\n\nLos artefactos quedan en `release/`.\n\n**Canales de distribución (previstos)**: página oficial de descargas · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. El dominio oficial queda como canal de rescate permanente.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nAl arrancar por primera vez la app apunta por defecto a `mock/nodes.json`, de modo que todo el flujo funciona sin red. Para más detalles consulta el [README.md](../README.md) principal y la carpeta [docs/](../docs/).",
    "roadmap": "- ✅ v1: multi-proveedor, arranque en frío oficial, raíces de confianza, reenvío P2P, 22 idiomas, andamiaje de Wallet\n- 🔜 v2: cadena de confianza (trustChain) — libro de invitaciones firmado con Ed25519\n- 🔜 v3: evaluación de calidad de nodo basada en métricas reales (latencia, tasa de error, uptime)\n- 🔜 v4: bucle económico de tokens — MBP impulsa el enrutado prioritario, el arranque en frío y el descubrimiento\n- 🔜 v5: pares móviles\n- 🔜 v6: SDK web — `<modelbus>` en el navegador"
  }
},
  'fr-FR': {
  "logoAlt": "ModelBus",
  "titleLine": "ModelBus-P2P : Une plateforme décentralisée de partage de tokens LLM",
  "tagline": "Probablement la première plateforme au monde où n'importe qui peut attacher son Token à un réseau P2P et, en retour, utiliser les Tokens partagés par d'autres pairs. Pas de serveur central, pas de compte, aucune clé API ne quitte jamais votre machine.",
  "statusSentence": "ModelBus-P2P est encore en développement et en tests publics.",
  "sections": {
    "toc": "## Sommaire",
    "what": "## De quoi s'agit-il",
    "features": "## Fonctionnalités principales",
    "screenshots": "## Captures d'écran",
    "architecture": "## Architecture",
    "decentralised": "## Conception décentralisée",
    "schema": "## Schéma d'annonce de nœud (v2)",
    "flow": "## Déroulement d'une requête",
    "download": "## Téléchargement et utilisation (bientôt disponible)",
    "quickstart": "## Démarrage rapide",
    "roadmap": "## Feuille de route"
  },
  "body": {
    "what": "ModelBus-P2P est un client de bureau construit sur [js-libp2p](https://github.com/libp2p/js-libp2p) et Electron. Il résout un problème que presque tout le monde connaît : **ce mois-ci il me reste du quota, le mois prochain il m'en manquera**.\n\n> Scénario : vous payez OpenAI ou Claude et épuisez rarement votre quota mensuel. Au lieu de le perdre, branchez-le au réseau P2P. Chaque requête qui transite par votre nœud est convertie en **tokens MBP** (minutes en ligne × 0,05 + nombre de Tokens partagés × 2 + requêtes servies × 0,1 + vitesse de réponse × 0,5). Le mois suivant, quand votre quota devient juste, vous dépensez ces MBP pour appeler les Tokens partagés par d'autres pairs. Aucun serveur central n'intervient, et votre clé API reste sur votre machine.\n\n- **Provision / Share** : enregistrez la clé API de votre abonnement et les modèles que vous voulez partager. Le réseau apprend votre peerId.\n- **Consume / Drive** : lancez un proxy HTTP local compatible OpenAI sur `http://127.0.0.1:18100`; pointez-y n'importe quel client compatible ; les requêtes sont relayées via P2P jusqu'au pair qui détient réellement le Token.\n- **Wallet** : chaque partage ou appel génère des tokens MBP. L'onglet Accueil et la page Wallet affichent solde, détail et formule en temps réel. MBP reste comptable pour l'instant ; les versions futures s'en serviront pour la réputation, les incitations et le routage prioritaire.\n- **Pas d'onboarding** : le premier lancement récupère des nœuds graines depuis l'endpoint officiel (ou un mock local), puis tourne entièrement en mode P2P.",
    "features": "| Fonctionnalité | Notes |\n|---|---|\n| **Transport P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |\n| **Confiance décentralisée** | 4 peerIds graines codés en dur servent d'ancres ; les nouveaux pairs rejoignent via chaîne de confiance (prochain jalon) |\n| **Démarrage à froid** | Le premier lancement récupère les nœuds depuis l'endpoint HTTPS officiel ou un mock local ; tout atterrit dans `<userData>/bootstrap-cache.json` |\n| **Routage multi-provider** | Un pair peut héberger OpenAI + Anthropic + Google simultanément ; les appelants routent par `model.id` |\n| **Proxy compatible OpenAI** | Proxy HTTP local sur `:18100` ; tout client compatible OpenAI/Anthropic fonctionne immédiatement |\n| **Auth par clé API (optionnel)** | Fixez une clé sur le proxy de consommation ; les appelants doivent envoyer `Authorization: Bearer <key>` |\n| **22 langues** | Français par défaut ; arabe RTL pris en charge |\n| **Thème clair par défaut** | Basculable en sombre / suivre le système |",
    "screenshots": "Accueil, Modèles, Wallet, Journaux, Paramètres — cinq vues au total. Les captures pleine résolution sont dans [docs/image/](../docs/image/).",
    "architecture": "```\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Renderer (Vue 3)                                       │\n│  ┌──────┬──────────┬──────────┬────────┬──────────┐              │\n│  │ Home │  Models  │  Wallet  │  Logs  │ Settings │              │\n│  └──────┴──────────┴──────────┴────────┴──────────┘              │\n│                       │  ipcRenderer.invoke / on                  │\n└───────────────────────┼─────────────────────────────────────────┘\n                        ▼\n┌─────────────────────────────────────────────────────────────────┐\n│  Electron Main (Node.js)                                         │\n│  ipcMain ──► services/                                          │\n│              ├─ providers   (cache models.dev)                 │\n│              ├─ registry    (API officielle + repli cache)     │\n│              ├─ p2p         (daemon libp2p)                     │\n│              ├─ provisioner (routeur multi-provider)           │\n│              ├─ proxy-server (HTTP compatible OpenAI)          │\n│              ├─ upstream    (appels API réels)                 │\n│              ├─ wallet      (calcul du score MBP)               │\n│              └─ models      (agrégateur de catalogue)            │\n└─────────────────────────────────────────────────────────────────┘\n                        │  libp2p\n                        ▼\n              ┌──────────────────┐\n              │   Réseau P2P      │\n              └──────────────────┘\n```\n\n```bash\n# Annonce de nœud v2 — voir section suivante\nGET https://modelbus.cc/api/v1/nodes\n → 200 [ NodeAnnouncement, NodeAnnouncement, … ]\n```\n\n```bash\n# Proxy local de consommation\ncurl http://127.0.0.1:18100/v1/chat/completions \\\n  -H \"Authorization: Bearer <api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\":\"openai/gpt-5\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'\n```",
    "decentralised": "Quatre peerIds graines sont gravés dans le binaire (`src/main/config/trusted-roots.ts`). Flux de démarrage à froid :\n\n1. Le cache local est vide au premier lancement\n2. Récupération en parallèle : endpoint HTTPS officiel + `bootstrapMultiaddrs` configurés + mDNS\n3. Validation de chaque peerId contre `TRUSTED_ROOT_PEER_IDS`\n4. Persistance du sous-ensemble validé dans `<userData>/bootstrap-cache.json`\n5. Démarrage du daemon P2P ; les succès de cache restent en P2P ; les échecs ré-essaient l'endpoint officiel toutes les heures\n\n```\n4 racines codées en dur  ←  ancres de confiance\n└─ mises en cache depuis l'endpoint officiel\n   ├─ connexion directe via bootstrapMultiaddrs\n   ├─ mDNS (découverte LAN)\n   └─ libp2p DHT findProviders (P2P pur)\n```\n\nL'endpoint officiel est conservé **durablement** comme canal de secours, même quand le réseau P2P est sain.",
    "schema": "Requête : `<https://modelbus.cc/api/v1/nodes>` renvoie `Array<NodeAnnouncement>` :\n\n```json\n{\n  \"version\":     2,\n  \"peerId\":      \"12D3KooW...\",\n  \"nickname\":    \"alpha-share\",\n  \"providers\": [\n    {\n      \"providerId\":   \"openai\",\n      \"providerName\": \"OpenAI\",\n      \"models\":       [\n        { \"id\": \"openai/gpt-5\",       \"name\": \"GPT-5\" },\n        { \"id\": \"openai/gpt-5-mini\", \"name\": \"GPT-5 mini\" }\n      ]\n    }\n  ],\n  \"addr\": {\n    \"addr\":      \"/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...\",\n    \"kind\":      \"direct\",\n    \"transport\": \"tcp\",\n    \"lastSeen\":  1735689600000\n  },\n  \"announcedAt\": 1735689600000,\n  \"expiresAt\":   1735862400000\n}\n```\n\nChamps :\n\n- **version** `2` : version de schéma, +1 à chaque changement cassant\n- **peerId** : libp2p PeerId, globalement unique\n- **nickname** : nom lisible\n- **providers[]** : fournisseurs LLM hébergés par ce pair\n  - **providerId** : id du fournisseur dans models.dev\n  - **providerName** : nom affiché\n  - **models[]** : modèles sous ce fournisseur ; chacun a `id` (canonique) et `name` (affiché)\n- **addr** : adresse principale unique joignable (singulier)\n  - **kind** : `direct` / `relay` / `unknown`\n  - **transport** : `tcp` / `ws` / `quic` / `webtransport` / `webrtc`\n- **announcedAt** : Unix ms du dernier rafraîchissement\n- **expiresAt** : TTL souple ; les entrées expirées restent utilisables avec un poids réduit\n\nLes 4 dernières entrées de `mock/nodes.json` sont les pairs graines de confiance et leurs peerIds correspondent à `trusted-roots.ts`.",
    "flow": "**Provision** (vous = détenteur du Token) : Paramètres → Partage de Token → choisissez un fournisseur, collez la clé API, cochez les modèles → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.\n\n**Consume** (vous = consommateur du Token) : choisissez un pair de confiance dans l'onglet Modèles → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → un POST HTTP arrive → on extrait `body.model` → on appelle le pair → on écrit `InferenceRequest` (JSON avec préfixe de longueur) → on attend bloquant `InferenceResponse` → on écrit la réponse HTTP.\n\n**Routage côté appelé** (`ProvisionerService.handle`) :\n\n```\nrequest.model = \"openai/gpt-5\"\n  └─ resolveProvider(\"openai/gpt-5\")\n     ├─ match : configuration openai\n     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)\n     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…\n     │   └─ appel réel, renvoie la réponse\n  └─ pas de match : 400 + { error: \"model X is not hosted by this peer\" }\n```",
    "download": "> 📦 Les installateurs officiels (Windows / macOS / Linux, et plus tard mobile et Web SDK) sont en cours de préparation.\n\n**Pour l'utiliser dès maintenant : compiler depuis les sources**\n\n```bash\npnpm install\npnpm run dev          # mode développement (Electron + Vite HMR)\npnpm run package:mac  # dmg macOS\npnpm run package:win  # nsis Windows\npnpm run package:linux # AppImage Linux\n```\n\nLes artefacts atterrissent dans `release/`.\n\n**Canaux de distribution (prévus)** : page officielle de téléchargement · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Le domaine officiel reste durablement le point de secours.",
    "quickstart": "```bash\ngit clone https://github.com/your-org/modelbus-p2p.git\ncd modelbus-p2p\npnpm install\npnpm run dev\n```\n\nAu premier lancement l'application pointe par défaut sur `mock/nodes.json`, donc le flux complet fonctionne sans réseau. Pour plus de détails voir le [README.md](../README.md) principal et le dossier [docs/](../docs/).",
    "roadmap": "- ✅ v1 : multi-fournisseur, démarrage à froid officiel, racines de confiance, relayage P2P, 22 langues, ébauche de Wallet\n- 🔜 v2 : chaîne de confiance (trustChain) — registre d'invitations signé Ed25519\n- 🔜 v3 : évaluation de la qualité des nœuds sur métriques réelles (latence, taux d'erreur, uptime)\n- 🔜 v4 : boucle économique de tokens — MBP pilote le routage prioritaire, le boost au démarrage à froid et la découverte de nœuds\n- 🔜 v5 : pairs mobiles\n- 🔜 v6 : SDK web — `<modelbus>` dans le navigateur"
  }
},
/* LOCALE-APPEND-END   */
};

// Concatenate the per-section body blocks into a full document,
// framed by the fixed top matter.
function renderDocument(lang, content, langLinks) {
  const s = content.sections;
  const b = content.body;
  const top = topBlock({
    logoAlt: content.logoAlt,
    titleLine: content.titleLine,
    tagline: content.tagline,
    statusSentence: content.statusSentence,
    langLinks,
    headerLine: '',
  });
  return [
    `<!-- auto-generated README for ${lang}; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->\n`,
    top,
    `${s.toc}\n\n`,
    `- [${s.what.replace(/^## /, '')}](#${s.what.replace(/^## /, '').toLowerCase().replace(/[^a-z0-9 \-]/g, '').replace(/\s+/g, '-')})\n`,
    `- [${s.features.replace(/^## /, '')}](#${s.features.replace(/^## /, '').toLowerCase().replace(/[^a-z0-9 \-]/g, '').replace(/\s+/g, '-')})\n`,
    `- [${s.screenshots.replace(/^## /, '')}](#${s.screenshots.replace(/^## /, '').toLowerCase().replace(/[^a-z0-9 \-]/g, '').replace(/\s+/g, '-')})\n`,
    `- [${s.architecture.replace(/^## /, '')}](#${s.architecture.replace(/^## /, '').toLowerCase().replace(/[^a-z0-9 \-]/g, '').replace(/\s+/g, '-')})\n`,
    `- [${s.decentralised.replace(/^## /, '')}](#${s.decentralised.replace(/^## /, '').toLowerCase().replace(/[^a-z0-9 \-]/g, '').replace(/\s+/g, '-')})\n`,
    `- [${s.schema.replace(/^## /, '')}](#${s.schema.replace(/^## /, '').toLowerCase().replace(/[^a-z0-9 \-]/g, '').replace(/\s+/g, '-')})\n`,
    `- [${s.flow.replace(/^## /, '')}](#${s.flow.replace(/^## /, '').toLowerCase().replace(/[^a-z0-9 \-]/g, '').replace(/\s+/g, '-')})\n`,
    `- [${s.download.replace(/^## /, '')}](#${s.download.replace(/^## /, '').toLowerCase().replace(/[^a-z0-9 \-]/g, '').replace(/\s+/g, '-')})\n`,
    `- [${s.quickstart.replace(/^## /, '')}](#${s.quickstart.replace(/^## /, '').toLowerCase().replace(/[^a-z0-9 \-]/g, '').replace(/\s+/g, '-')})\n`,
    `- [${s.roadmap.replace(/^## /, '')}](#${s.roadmap.replace(/^## /, '').toLowerCase().replace(/[^a-z0-9 \-]/g, '').replace(/\s+/g, '-')})\n\n`,

    `---\n\n`,

    `${s.what}\n\n${b.what}\n\n---\n\n`,
    `${s.features}\n\n${b.features}\n\n---\n\n`,
    `${s.screenshots}\n\n${b.screenshots}\n\n---\n\n`,
    `${s.architecture}\n\n${b.architecture}\n\n---\n\n`,
    `${s.decentralised}\n\n${b.decentralised}\n\n---\n\n`,
    `${s.schema}\n\n${b.schema}\n\n---\n\n`,
    `${s.flow}\n\n${b.flow}\n\n---\n\n`,
    `${s.download}\n\n${b.download}\n\n---\n\n`,
    `${s.quickstart}\n\n${b.quickstart}\n\n---\n\n`,
    `${s.roadmap}\n\n${b.roadmap}\n`,
  ].join('');
}

async function main() {
  await fs.mkdir(path.join(root, 'readme'), { recursive: true });

  for (const [lang, content] of Object.entries(LOCALES)) {
    const href = `readme/README.${lang}.md`;
    const langLinks = languageLinks(lang, href);
    const doc = renderDocument(lang, content, langLinks);
    const out = path.join(root, href);
    await fs.writeFile(out, doc, 'utf-8');
    console.log(`generated ${href}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
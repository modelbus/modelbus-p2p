<!-- auto-generated README for zh-CN; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : 一个去中心化的 LLM Token 共享平台
</h1>
<p align="center" style="font-weight: bold;">
  或许是全球首个，任何人都可以把自己的 Token 挂上 P2P 网络，也可以因此调用网络上更多其他节点共享的 Token。无需中心服务器、无需注册账号、不会丢失任何 API Key。
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P 仍处于开发与公开测试阶段。</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](readme/README.en-US.md) · [繁體中文](readme/README.zh-TW.md) · [日本語](readme/README.ja-JP.md) · [한국어](readme/README.ko-KR.md) · [Deutsch](readme/README.de-DE.md) · [Español](readme/README.es-ES.md) · [Français](readme/README.fr-FR.md) · [Italiano](readme/README.it-IT.md) · [Dansk](readme/README.da-DK.md) · [Polski](readme/README.pl-PL.md) · [Русский](readme/README.ru-RU.md) · [Bosanski](readme/README.bs-BA.md) · [العربية](readme/README.ar-SA.md) · [Norsk](readme/README.nb-NO.md) · [Português (Brasil)](readme/README.pt-BR.md) · [ไทย](readme/README.th-TH.md) · [Türkçe](readme/README.tr-TR.md) · [Українська](readme/README.uk-UA.md) · [বাংলা](readme/README.bn-BD.md) · [Ελληνικά](readme/README.el-GR.md) · [Tiếng Việt](readme/README.vi-VN.md)

</div>

---

## 目录

- [这是什么](#)
- [核心特性](#)
- [界面一览](#)
- [架构总览](#)
- [去中心化设计](#)
- [节点公告格式（v2）](#v2)
- [调用流程详解](#)
- [下载使用（即将开通）](#)
- [快速开始](#)
- [路线图](#)

---

## 这是什么

ModelBus-P2P 是一个基于 [js-libp2p](https://github.com/libp2p/js-libp2p) + Electron 的桌面客户端。它解决的是一个非常普遍的问题：**这个月我用不完，下个月我又不够用**。

> 场景：你订阅了 OpenAI 或 Claude，本月额度没用完。与其让它月底清零，不如把它挂上 P2P 网络，本月用出去的每一笔请求都会按规则折算成 **MBP 积分**（在线时长 × 0.05 + 共享 Token 数 × 2 + 服务请求数 × 0.1 + 响应速度 × 0.5）。下个月当你的订阅不够用时，你可以用积分去调用其他节点共享的 Token。整个过程不经过任何中心服务器，API Key 始终留在你自己的机器上。

- **上线（Provision / Share）**：把你订阅的 API Key + 想共享的模型挂到 P2P 网络，告诉大家你的 peerId。
- **调用（Consume / Drive）**：在本机启一个 OpenAI 兼容的 HTTP 代理，配置 `http://127.0.0.1:18100` 作为 base_url，所有请求都会经 P2P 转发到真实持有 Token 的节点去执行。
- **钱包（Wallet）**：每次共享 / 调用都按规则折算为 MBP 积分；首页和「钱包」页实时展示余额、积分构成与公式。
- **不需要任何人审批**：首次启动通过官方 endpoint（或本地 mock）拿到种子节点，之后完全 P2P 运行。

---

## 核心特性

| 特性 | 说明 |
|---|---|
| **P2P 传输栈** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT 穿透 + Kademlia DHT + AutoNAT |
| **去中心化信任** | 4 个硬编码的种子节点作为信任根；新节点通过信任链（下一阶段）扩展网络 |
| **冷启动保底** | 首次启动从官方 HTTPS endpoint（或本地 mock）获取节点；之后所有内容在 `<userData>/bootstrap-cache.json` 中缓存 |
| **多 Provider 路由** | 同一个节点可同时挂 OpenAI + Anthropic + Google 的 Key；调用方按 `model.id` 自动路由 |
| **OpenAI 兼容代理** | 消费端本地启 OpenAI 兼容的 HTTP 代理（默认 `:18100`），任何 OpenAI / Anthropic 兼容客户端都能直连 |
| **API Key 鉴权（可选）** | 消费端可设置固定 API Key；调用方需在 `Authorization: Bearer <key>` 头携带 |
| **22 种语言** | 默认中文（zh-CN），含 RTL 阿拉伯语支持 |
| **现代浅色默认主题** | 白天模式默认，可切换深色 / 跟随系统 |

---

## 界面一览

首页、模型、钱包、日志、设置 共 5 个视图。详细截图请查看 [docs/image/](docs/image/) 目录。

---

## 架构总览

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
```

```bash
# 节点公告格式（v2）— 详见本 README 对应章节
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# 消费端本地 HTTP 代理
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## 去中心化设计

应用二进制内硬编码 **4 个种子节点 peerId**（`src/main/config/trusted-roots.ts`）。冷启动流程：

1. 首次启动本地 cache 为空
2. 并发拉取：`GET 官方endpoint` + 用户配置的 `bootstrapMultiaddrs` + mDNS
3. 用本地 `TRUSTED_ROOT_PEER_IDS` 校验每个 peerId
4. 写入 `<userData>/bootstrap-cache.json`
5. P2P daemon 启动；命中即纯 P2P；未命中则每 1h 后台重试官网

```
4 个 hard-coded roots    ← 起点
└─ cached from official endpoint
   ├─ direct connect via bootstrapMultiaddrs
   ├─ mDNS (LAN discovery)
   └─ libp2p DHT findProviders (P2P pure)
```

**官网永远保留**：即使整个 P2P 网络瘫痪，新用户仍能通过官网加入。

---

## 节点公告格式（v2）

`<https://modelbus.cc/api/v1/nodes>` 返回 `Array<NodeAnnouncement>`：

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

字段含义：

- **version** `2` — schema 版本
- **peerId** — libp2p PeerId，唯一身份
- **nickname** — 用户可读昵称
- **providers[]** — 该节点挂载的 LLM 供应商列表
  - **providerId** — models.dev 里的 provider id
  - **providerName** — 可读显示名
  - **models[]** — 该 provider 下愿意共享的模型
- **addr** — 单个主要可达地址（不复数）
  - **kind** — `direct` / `relay` / `unknown`
  - **transport** — `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt** — 该条目最近刷新
- **expiresAt** — 软过期；客户端仍可消费过期条目

`mock/nodes.json` 末尾预填了 4 个 trusted seed 节点，与 `trusted-roots.ts` 对齐。

---

## 调用流程详解

**上线**（你 = Token 持有方）：Settings → Token 上线 → 选 provider / 输 API Key / 勾选模型 → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`。

**调用**（你 = Token 消费方）：Models 标签选 trusted 节点 → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → 收到 HTTP POST → 提取 body.model → dial peer → 写 `InferenceRequest` JSON+lp → 阻塞读 `InferenceResponse` → 回写 HTTP 响应。

**请求路由**（被叫节点 `ProvisionerService.handle`）：

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ 匹配：openai provider 配置
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ 真实调用，返回响应
  └─ 不匹配：400 + { error: "model X is not hosted by this peer" }
```

---

## 下载使用（即将开通）

> 📦 正式发行版（Windows / macOS / Linux 安装包，及后续移动端、Web SDK）正在筹备中。

**现阶段如何获取**：自行构建

```bash
pnpm install
pnpm run dev          # 启动开发模式（Electron + Vite HMR）
pnpm run package:mac  # 在 macOS 上打包 dmg
pnpm run package:win  # 在 Windows 上打包 nsis
pnpm run package:linux # 在 Linux 上打包 AppImage
```

构建产物在 `release/`。

**发布渠道（敬请期待）**：官网下载页 · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew。官方域名永远是保底救援通道。

---

## 快速开始

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

应用启动后默认指向 `mock/nodes.json`，无需网络即可体验完整流程。更多细节见 [docs/](docs/) 目录。

---

## 路线图

- ✅ v1：多 provider、官网冷启动、信任根、P2P 转发、22 语言、钱包雏形
- 🔜 v2：信任链（trustChain）— 基于 Ed25519 签名的链式邀请账本
- 🔜 v3：节点质量评估接入真实指标（延迟、错误率、稳定性）
- 🔜 v4：Token 经济学闭环 — MBP 用于优先路由、冷启动加速、节点发现
- 🔜 v5：移动端
- 🔜 v6：Web 端 `<modelbus>` JS SDK

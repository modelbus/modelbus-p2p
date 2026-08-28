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

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p)
[![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)

[English](readme/README.en-US.md) · [繁體中文](readme/README.zh-TW.md) · [日本語](readme/README.ja-JP.md) · [한국어](readme/README.ko-KR.md) · [Deutsch](readme/README.de-DE.md) · [Español](readme/README.es-ES.md) · [Français](readme/README.fr-FR.md) · [Italiano](readme/README.it-IT.md) · [Dansk](readme/README.da-DK.md) · [Polski](readme/README.pl-PL.md) · [Русский](readme/README.ru-RU.md) · [Bosanski](readme/README.bs-BA.md) · [العربية](readme/README.ar-SA.md) · [Norsk](readme/README.nb-NO.md) · [Português (Brasil)](readme/README.pt-BR.md) · [ไทย](readme/README.th-TH.md) · [Türkçe](readme/README.tr-TR.md) · [Українська](readme/README.uk-UA.md) · [বাংলা](readme/README.bn-BD.md) · [Ελληνικά](readme/README.el-GR.md) · [Tiếng Việt](readme/README.vi-VN.md)

</div>

---

## 目录

- [这是什么](#what)
- [核心特性](#features)
- [界面一览](#screenshots)
- [架构总览](#architecture)
- [去中心化设计](#decentralised)
- [节点公告格式（v2）](#schema)
- [调用流程详解](#flow)
- [目录结构](#layout)
- [配置说明](#config)
- [下载使用（即将开通）](#download)
- [快速开始](#quickstart)
- [开发与调试](#dev)
- [多语言](#i18n)
- [路线图](#roadmap)
- [许可](#license)

---

## 这是什么 <a id="what"></a>

ModelBus-P2P 是一个基于 [js-libp2p](https://github.com/libp2p/js-libp2p) + Electron 的桌面客户端。它解决的是一个非常普遍的问题：**这个月我用不完，下个月我又不够用**。

> 场景：你订阅了 OpenAI 或 Claude，本月额度没用完。与其让它月底清零，不如把它挂上 P2P 网络，本月用出去的每一笔请求都会按规则折算成 **MBP 积分**（在线时长 × 0.05 + 共享 Token 数 × 2 + 服务请求数 × 0.1 + 响应速度 × 0.5）。下个月当你的订阅不够用时，你可以用积分去调用其他节点共享的 Token。整个过程不经过任何中心服务器，API Key 始终留在你自己的机器上。

- **上线（Provision / Share）**：把你订阅的 API Key + 想共享的模型挂到 P2P 网络，告诉大家你的 peerId。
- **调用（Consume / Drive）**：在本机启一个 OpenAI 兼容的 HTTP 代理，配置 `http://127.0.0.1:18100` 作为 base_url，所有请求都会经 P2P 转发到真实持有 Token 的节点去执行。
- **钱包（Wallet）**：每次共享 / 调用都按规则折算为 MBP 积分；首页和「钱包」页实时展示余额、积分构成与公式。
- **不需要任何人审批**：首次启动通过官方 endpoint（或本地 mock）拿到种子节点，之后完全 P2P 运行。

---

## 核心特性 <a id="features"></a>

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

## 界面一览 <a id="screenshots"></a>

应用包含五个视图，每个都针对一个核心场景。以下截图来自桌面端（白天主题）：

### 首页（Home）

节点信息、我共享/使用的 Token、上线引导、API 服务说明、节点排行榜，一屏看完。

<p align="center"><img src="docs/image/home.png" alt="Home" width="640"/></p>

### 模型（Models）

合并所有节点公告的可用模型 + 节点质量列表（速度、模型、稳定时长）。

<p align="center"><img src="docs/image/model.png" alt="Models" width="640"/></p>

### 钱包（Wallet）

MBP Token 余额 + 积分构成 + 公式说明。

<p align="center"><img src="docs/image/wallet.png" alt="Wallet" width="640"/></p>

### 日志（Logs）

事件日志 + 供应流量（我服务的请求）+ 调用流量（我发出的请求）。

<p align="center"><img src="docs/image/log.png" alt="Logs" width="640"/></p>

### 设置（Settings）

节点、注册、Token 上线、调用服务（API Key）四个子标签。

<p align="center"><img src="docs/image/setting.png" alt="Settings" width="640"/></p>

---

## 架构总览 <a id="architecture"></a>

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
│  ipcMain ──►  services/                                         │
│              ├─ providers   (models.dev 缓存)                  │
│              ├─ registry    (官方 API + 缓存回退)              │
│              ├─ p2p         (libp2p 守护进程)                   │
│              ├─ provisioner (多 Provider 路由器)                │
│              ├─ proxy-server (OpenAI 兼容 HTTP)                 │
│              ├─ upstream    (真实 Provider API 调用)            │
│              ├─ wallet      (MBP 积分计算)                       │
│              ├─ models      (目录聚合器)                         │
│              └─ store       (JSON 持久化)                        │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
                 ┌──────────────────┐
                 │    P2P 网络        │
                 └──────────────────┘
```

### 关键文件

| 层 | 文件 | 作用 |
|---|---|---|
| 类型 | `src/shared/types.ts` | 跨进程共享类型（v2 NodeAnnouncement 等） |
| 协议 | `src/main/proto/inference.ts` | 自定义 libp2p 协议 `/modelbus/inference/1.0.0` |
| P2P | `src/main/services/p2p.ts` | libp2p 节点生命周期 |
| 信任 | `src/main/services/registry.ts` | 双源 bootstrap（官网 + 本地缓存）+ 信任校验 |
| 缓存 | `src/main/services/bootstrap-cache.ts` | `<userData>/bootstrap-cache.json` |
| 上线 | `src/main/services/provisioner.ts` | 按 model.id 多 Provider 路由 |
| 消费 | `src/main/services/proxy-server.ts` | OpenAI 兼容本地 HTTP 代理 |
| 上游 | `src/main/services/upstream.ts` | 真实 LLM Provider API 调用 |
| 钱包 | `src/main/services/wallet.ts` | MBP 积分计算 |
| 模型 | `src/main/services/models.ts` | 模型 / 节点目录聚合 |
| UI | `src/renderer/src/views/*.vue` | 5 个视图（Home / Models / Wallet / Logs / Settings） |
| 桥 | `src/preload/index.ts` | contextBridge 类型化桥 |

---

## 去中心化设计 <a id="decentralised"></a>

应用二进制内硬编码 **4 个种子节点 peerId**（`src/main/config/trusted-roots.ts`）。冷启动流程：

1. 首次启动，本地 cache 为空
2. 并发拉取：`GET 官方 endpoint` + 用户配置的 `bootstrapMultiaddrs` + mDNS
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

**官网永远保留**：即使整个 P2P 网络瘫痪，新用户仍能通过官网加入。它会一直作为冷启动救援通道，直到网络自我维持。

---

## 节点公告格式（v2） <a id="schema"></a>

`GET https://modelbus.cc/api/v1/nodes` 返回 `Array<NodeAnnouncement>`：

```json
{
  "version": 2,
  "peerId": "12D3KooW...",
  "nickname": "alpha-share",
  "providers": [
    {
      "providerId": "openai",
      "providerName": "OpenAI",
      "models": [
        { "id": "openai/gpt-5", "name": "GPT-5" },
        { "id": "openai/gpt-5-mini", "name": "GPT-5 mini" }
      ]
    }
  ],
  "addr": {
    "addr": "/ip4/127.0.0.1/tcp/15001/p2p/12D3KooW...",
    "kind": "direct",
    "transport": "tcp",
    "lastSeen": 1735689600000
  },
  "announcedAt": 1735689600000,
  "expiresAt": 1735862400000
}
```

字段含义：

| 字段 | 类型 | 说明 |
|---|---|---|
| `version` | `2` | schema 版本；破坏性变更时 +1 |
| `peerId` | string | libp2p PeerId，全局唯一身份 |
| `nickname` | string | 用户可读昵称 |
| `providers[]` | array | 该节点挂载的 LLM 供应商列表 |
| `providers[].providerId` | string | models.dev 里的 provider id（如 `openai`） |
| `providers[].providerName` | string | 可读显示名 |
| `providers[].models[]` | array | 该 provider 下愿意共享的模型 |
| `providers[].models[].id` | string | 模型 id（**真实发送给上游的标识**） |
| `providers[].models[].name` | string | UI 展示用 |
| `addr` | object | 单个主要可达地址（不复数；一节点一地址） |
| `addr.addr` | string | libp2p multiaddr 字符串 |
| `addr.kind` | string | `direct` / `relay` / `unknown` |
| `addr.transport` | string | `tcp` / `ws` / `quic` / `webtransport` / `webrtc` |
| `addr.lastSeen` | number | 最后一次观察到该地址可达的 Unix ms |
| `announcedAt` | number | 该条目最近一次刷新 |
| `expiresAt` | number | 软过期；客户端仍可消费过期条目，但应降低权重 |

**mock 预填**：`mock/nodes.json` 末尾预填了 4 个 trusted seed 节点，与 `trusted-roots.ts` 中的 peerId 对齐，保证 `pnpm run dev` 无需联网即可启动。

---

## 调用流程详解 <a id="flow"></a>

### 上线（你 = Token 持有方）

```
Settings → Token 上线
   ├─ 选 provider（openai / anthropic / ...）
   ├─ 输入 API Key
   ├─ 勾选要共享的模型（每 provider 一组）
   ▼
ipc: provision:set
   ├─ ProvisionerService.register(config)
   │   └─ node.handle('/modelbus/inference/1.0.0', serveInference(req => this.handle(req)))
   └─ 上线成功 → events: 'provision:registered'
```

### 调用（你 = Token 消费方）

```
Models 标签 / 排行榜
   ├─ 选一个 trusted 节点
   ▼
ipc: proxy:setTarget(peerId)
   ├─ ConsumerProxy.setTarget(flatNode)
   ├─ ConsumerProxy.start(:18100)
   ▼
Local HTTP Proxy :18100
   ├─ 收到 HTTP POST /v1/chat/completions
   │   └─ 提取 body.model → dialPeer(targetPeerId) → open libp2p stream
   │       └─ 写入 InferenceRequest (encode by JSON+lp)
   │       └─ 阻塞读取 InferenceResponse
   └─ 把 response 写回 HTTP 客户端
```

### 请求路由（被叫节点 `ProvisionerService.handle`）

```
request.model = "openai/gpt-5"
   └─ resolveProvider("openai/gpt-5")
       ├─ 匹配：openai provider 配置 (config.apiKey="sk-...")
       │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
       │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-...
       │   └─ 真实调用，返回响应
       └─ 不匹配：400 + { error: "model X is not hosted by this peer" }
```

**关键设计**：consumer 不知道被叫节点挂载了哪些 provider / model，请求里只带 `model` 字段。被叫节点按 `resolveProvider(modelId)` 自动分发。

---

## 目录结构 <a id="layout"></a>

```
modelbus-p2p/
├── docs/
│   └── image/             # README 截图（home / model / wallet / log / setting / logo）
├── mock/
│   └── nodes.json         # v2 schema 示例，末尾含 4 个 trusted seed
├── readme/                # 21 种语言的 README 副本
├── scripts/
│   ├── gen-readme-i18n.mjs  # 生成 readme/ 下的多语言 README
│   └── i18n-update.mjs      # i18n 字典批量更新脚本
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── config/trusted-roots.ts
│   │   ├── proto/inference.ts
│   │   ├── services/      # p2p / registry / provisioner / proxy / upstream / wallet / ...
│   │   ├── index.ts
│   │   └── ipc.ts
│   ├── preload/index.ts   # contextBridge 类型化桥
│   ├── renderer/          # Vue 3 渲染进程
│   │   ├── public/        # logo.png + 22 个国旗 SVG
│   │   ├── src/i18n/      # 22 个语言字典
│   │   ├── src/ui/        # FlagIcon / ThemeIcon
│   │   └── src/views/     # Home / Models / Wallet / Logs / Settings
│   └── shared/types.ts    # 跨进程类型（v2 NodeAnnouncement 等）
├── README.md              # 本文件（中文主文档）
├── electron.vite.config.ts
├── package.json
└── tsconfig.json
```

---

## 配置说明 <a id="config"></a>

### `BootstrapConfig`（持久化在 `<userData>/modelbus-store.json`）

| 字段 | 默认 | 说明 |
|---|---|---|
| `registryUrl` | `http://localhost:8089/nodes.json` | 节点列表拉取地址。开发期可改为 `file://./mock/nodes.json` 走本地 |
| `bootstrapMultiaddrs` | `[]` | 启动时连接的额外种子 multiaddr 列表 |
| `tcpPort` | `15001` | 本节点 libp2p TCP 监听端口 |
| `proxyPort` | `18100` | 消费端 OpenAI 兼容代理端口 |

修改任一项后 **重启 P2P 节点** 生效。

### API Key（消费端鉴权，可选）

`localStorage` 中 `modelbus.consumer.apiKey`。消费端 HTTP 代理（`:18100`）会校验：

```bash
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"<id>","messages":[{"role":"user","content":"hi"}]}'
```

### Trusted Roots（信任根）

`src/main/config/trusted-roots.ts`。**生产环境**必须替换为模型维护者真实运行的 4 个节点 peerId。客户端启动时检查：

- 任何 peerId 在此列表 → `trusted = true`
- 否则 → `trusted = false`（UI 标「待验证」）

---

## 下载使用（即将开通） <a id="download"></a>

> 📦 正式发行版（包括 Windows / macOS / Linux 安装包，以及后续移动端、Web SDK）正在筹备中，敬请期待。

### 现阶段如何获取可运行的客户端？

本仓库当前是 v1 测试版（详见顶部项目状态说明），正式发布渠道尚未上线。如果你希望**立即试用**，可以按下面的「快速开始」自行构建：

```bash
pnpm install
pnpm run dev          # 启动开发模式（Electron + Vite HMR）
pnpm run package:mac  # 在 macOS 上打包 dmg
pnpm run package:win  # 在 Windows 上打包 nsis
pnpm run package:linux # 在 Linux 上打包 AppImage
```

构建产物在 `release/` 目录。

### 发布渠道（敬请期待）

| 渠道 | 状态 |
|---|---|
| [官方网站 https://modelbus.cc](https://modelbus.cc) 下载页 | 即将开放 |
| GitHub Releases | 随 `v1.0` tag 开放 |
| macOS App Store | 暂未规划 |
| Windows Store | 暂未规划 |
| Snap / apt / Homebrew | 暂未规划 |

> 任何**带签名的二进制分发**都会先在 GitHub Releases 上发布，并附 SHA-256 校验和。**官方域名永远是保底救援通道**：冷启动包、签名校验与新版本发布都会放在 `https://modelbus.cc/download/`。

---

## 快速开始 <a id="quickstart"></a>

### 准备

- Node.js ≥ 22
- pnpm ≥ 9（推荐；npm 也可，但 pnpm 对 Electron 后安装步骤更稳）

### 安装 + 开发

```bash
# 安装依赖（会自动下载 Electron 二进制；已配置 ELECTRON_MIRROR）
pnpm install

# 启动 dev（HMR 热更新）
pnpm run dev
```

应用启动后默认指向 `file://./mock/nodes.json`，**无需任何网络**即可体验完整流程：

1. 进入 **设置 → 节点**，确认 registry URL 是 `file://./mock/nodes.json`
2. 进入 **设置 → 注册**，应看到 6 个节点（4 个 `Trusted` + 2 个 `Unverified`）
3. 进入 **设置 → Token 上线**，随便填一个假 API Key、勾选几个模型 → 上线
4. 回到 **首页**，第 4 块会显示你的 API 服务端口 + curl 示例

### 打包

```bash
pnpm run package:mac   # macOS dmg
pnpm run package:win   # Windows nsis
pnpm run package:linux # Linux AppImage
```

构建产物在 `release/`。

### 类型检查

```bash
pnpm run typecheck   # 双侧（主进程 + 渲染进程）零错误检查
```

---

## 开发与调试 <a id="dev"></a>

### 系统菜单

顶栏右侧第三个按钮（⚙ 齿轮）：

- **打开开发者工具** — 在 detached 窗口弹出 DevTools，方便多屏调试
- **打开日志 / 数据目录** — 弹出 `<userData>` 目录（含 `modelbus-store.json`、`bootstrap-cache.json`）

设置页右上角也提供同样的两个快捷按钮。

### 调试 libp2p

```bash
# 详细 libp2p 日志
DEBUG="libp2p:*" pnpm run dev

# 仅连接 / DHT
DEBUG="libp2p:connection-manager:*,libp2p:kad-dht:*" pnpm run dev
```

### 添加自定义 Provider

当前 Provider 列表从 [models.dev](https://github.com/anomalyco/models.dev) 动态拉取。若需要自定义 provider（如自部署 OpenAI 兼容服务），直接在 Settings → Token 上线 时手动指定 `API 地址覆盖`（如 `https://my-llm.example.com/v1`）即可。

### 修改 Mock

`mock/nodes.json` 是 v2 schema 的实例。改完后只需重启 dev。`pnpm run dev` 启动时会自动 fetch 一次并显示在 Settings → Register。

---

## 多语言 <a id="i18n"></a>

内置 **22 种语言**，默认 `zh-CN`：

| | | |
|---|---|---|
| 简体中文 | 繁體中文 | English |
| 한국어 | Deutsch | Español |
| Français | Italiano | Dansk |
| 日本語 | Polski | Русский |
| Bosanski | العربية | Norsk |
| Português (Brasil) | ไทย | Türkçe |
| Українська | বাংলা | Ελληνικά |
| Tiếng Việt | | |

切换：顶栏右侧第一个按钮（🌐 国旗图标）。语言选择持久化到 localStorage。

**多语言 README**：每个语言一份，在 [readme/](readme/) 目录；根目录 `README.md` 为中文主文档。

新增语言：在 `src/renderer/src/i18n/` 下新建 `xx-XX.ts`，按 `Dict` 类型补全条目，并在 `src/renderer/src/i18n/index.ts` 的 `availableLocales` 与 `dictionaries` 注册。

---

## 路线图 <a id="roadmap"></a>

| 阶段 | 目标 |
|---|---|
| **v1** ✅ | 多 provider、官网冷启动、信任根、P2P 转发、22 语言、钱包雏形 |
| **v2** | 信任链（trustChain）— 基于 Ed25519 签名的链式邀请账本 |
| **v3** | 节点质量评估接入真实指标（上传延迟、错误率、运行稳定性），淘汰低质量节点 |
| **v4** | Token 经济学闭环 — MBP 用于：优先路由、加速新节点冷启动、付费节点发现 |
| **v5** | 移动端（P2P 节点）— 让手机也能上线 |
| **v6** | Web 端 — 浏览器内 `<modelbus>` JS SDK |

---

## 许可 <a id="license"></a>

[MIT](./LICENSE)

<!-- auto-generated README for zh-TW; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P：一個去中心化的 LLM Token 共享平台
</h1>
<p align="center" style="font-weight: bold;">
  或許是全球首個，任何人都能把自己的 Token 掛上 P2P 網路，也能因此使用網路上其他節點共享的 Token。不需要中心伺服器、不需要註冊帳號、任何 API 金鑰都不會離開你的電腦。
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P 仍在開發與公開測試階段。</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.en-US.md) · [简体中文](../README.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## 目錄

- [這是什麼](#what)
- [核心特色](#features)
- [介面一覽](#screenshots)
- [架構總覽](#architecture)
- [去中心化設計](#decentralised)
- [節點公告格式（v2）](#schema)
- [呼叫流程詳解](#flow)
- [下載使用（即將開通）](#download)
- [快速開始](#quickstart)
- [路線圖](#roadmap)

---

## 這是什麼 <a id="what"></a>

ModelBus-P2P 是一個基於 [js-libp2p](https://github.com/libp2p/js-libp2p) 與 Electron 的桌面客戶端，解決一個幾乎人人都有過的難題：**這個月用不完，下個月又不夠用**。

> 情境：你訂閱了 OpenAI 或 Claude，但每月額度常常用不完。與其任它月底歸零，不如把它掛上 P2P 網路；本月透過你節點的每一筆請求，都會依規則折算成 **MBP 積分**（在線分鐘數 × 0.05 ＋ 共享 Token 數 × 2 ＋ 服務請求數 × 0.1 ＋ 回應速度 × 0.5）。到了下個月額度不夠時，就能用積分去呼叫其他節點共享的 Token。整個過程沒有任何中心伺服器介入，API 金鑰始終留在你自己的機器上。

- **上線（Provision / Share）**：把你訂閱的 API 金鑰與想共享的模型掛上 P2P 網路，讓其他節點知道你的 peerId。
- **呼叫（Consume / Drive）**：在本機啟一個 OpenAI 相容的 HTTP 代理，設定 `http://127.0.0.1:18100` 為 base_url，所有請求都會經 P2P 轉發到實際持有 Token 的節點執行。
- **錢包（Wallet）**：每次共享／呼叫都會折算成 MBP 積分；首頁與「錢包」分頁即時顯示餘額、積分構成與計算公式。
- **無需審批**：首次啟動從官方 endpoint（或本地 mock）取得種子節點，之後完全 P2P 運作。

---

## 核心特色 <a id="features"></a>

| 特色 | 說明 |
|---|---|
| **P2P 傳輸棧** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT 打洞 + Kademlia DHT + AutoNAT |
| **去中心化信任** | 4 個硬編碼的種子節點作為信任根；新節點透過信任鏈（下一階段）擴展網路 |
| **冷啟動保底** | 首次啟動從官方 HTTPS endpoint（或本地 mock）取得節點，之後內容快取於 `<userData>/bootstrap-cache.json` |
| **多 Provider 路由** | 同一節點可同時掛載 OpenAI + Anthropic + Google 的金鑰；呼叫端依 `model.id` 自動路由 |
| **OpenAI 相容代理** | 消費端在本機啟動 OpenAI 相容的 HTTP 代理（預設 `:18100`），任何 OpenAI / Anthropic 相容客戶端皆可直連 |
| **API 金鑰驗證（選用）** | 消費端可設定固定 API 金鑰；呼叫端須在 `Authorization: Bearer <key>` 標頭帶上 |
| **22 種語言** | 預設繁體中文，支援 RTL 阿拉伯文 |
| **淺色預設主題** | 預設淺色模式，可切換深色／跟隨系統 |

---

## 介面一覽 <a id="screenshots"></a>

<p align="center"><img src="../docs/image/home.png" alt="Home / 首页" width="640"/></p>

<p align="center"><img src="../docs/image/model.png" alt="Models / 模型" width="640"/></p>

<p align="center"><img src="../docs/image/wallet.png" alt="Wallet / 钱包" width="640"/></p>

<p align="center"><img src="../docs/image/log.png" alt="Logs / 日志" width="640"/></p>

<p align="center"><img src="../docs/image/setting.png" alt="Settings / 设置" width="640"/></p>


---

## 架構總覽 <a id="architecture"></a>

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
```

```bash
# 節點公告格式（v2）— 詳見下文章節
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# 消費端本機 HTTP 代理
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## 去中心化設計 <a id="decentralised"></a>

應用程式二進位檔內硬編碼了 **4 個種子節點 peerId**（位於 `src/main/config/trusted-roots.ts`）。冷啟動流程：

1. 首次啟動時本地快取為空
2. 並行抓取：官方 HTTPS endpoint + 使用者設定的 `bootstrapMultiaddrs` + mDNS
3. 比對每個 peerId 與 `TRUSTED_ROOT_PEER_IDS`
4. 將通過驗證的子集寫入 `<userData>/bootstrap-cache.json`
5. P2P 守護行程啟動；命中走純 P2P 模式；未命中則每小時背景重試官方端點

```
4 個硬編碼根節點  ← 信任錨點
└─ 自官方 endpoint 快取
   ├─ 經 bootstrapMultiaddrs 直接連線
   ├─ mDNS（區域網路探索）
   └─ libp2p DHT findProviders（純 P2P）
```

**官方端點永遠保留**：即使整個 P2P 網路健康，仍作為救援通道。

---

## 節點公告格式（v2） <a id="schema"></a>

請呼叫 `<https://modelbus.cc/api/v1/nodes>` 取得 `Array<NodeAnnouncement>`：

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

欄位：

- **version** `2`：schema 版本，破壞性變更時 +1
- **peerId**：libp2p PeerId，全球唯一
- **nickname**：使用者可讀名稱
- **providers[]**：本節點掛載的 LLM 供應商清單
  - **providerId**：models.dev 中的供應商 id
  - **providerName**：顯示名稱
  - **models[]**：本 provider 下願意共享的模型（每個有 `id` 標準 id 與 `name` 顯示名稱）
- **addr**：單一主要可達位址（單數，非複數）
  - **kind**：「direct」／「relay」／「unknown」
  - **transport**：「tcp」／「ws」／「quic」／「webtransport」／「webrtc」
- **announcedAt**：本條目最近刷新的 Unix 毫秒
- **expiresAt**：軟過期時間；過期條目仍可用但權重較低

`mock/nodes.json` 末尾的 4 個條目是可信賴種子節點，peerId 與 `trusted-roots.ts` 對齊。

---

## 呼叫流程詳解 <a id="flow"></a>

**上線**（你 = Token 持有者）：設定 → Token 上線 → 選 provider、貼 API 金鑰、勾選模型 → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`。

**呼叫**（你 = Token 消費者）：在模型分頁選擇可信賴節點 → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → 收到 HTTP POST → 抽取 `body.model` → 撥號 peer → 寫入 `InferenceRequest`（JSON + 長度前綴）→ 阻塞讀 `InferenceResponse` → 寫回 HTTP 回應。

**請求路由**（在被叫端 `ProvisionerService.handle`）：

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ 符合：openai provider 設定
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ 實際呼叫並回傳回應
  └─ 不符合：400 + { error: "model X is not hosted by this peer" }
```

---

## 下載使用（即將開通） <a id="download"></a>

> 📦 正式發行版（Windows / macOS / Linux 安裝套件，以及後續的行動端、Web SDK）尚在籌備中。

**目前取得方式：自行建置**

```bash
pnpm install
pnpm run dev          # 開發模式（Electron + Vite HMR）
pnpm run package:mac  # macOS dmg
pnpm run package:win  # Windows nsis
pnpm run package:linux # Linux AppImage
```

產出位於 `release/`。

**發佈管道（規劃中）**：官方下載頁 · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew。官方網域始終是長期救援通道。

---

## 快速開始 <a id="quickstart"></a>

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

首次啟動時應用程式預設指向 `mock/nodes.json`，無需網路即可體驗完整流程。更多細節請參考主 [README.md](../README.md) 與 [docs/](../docs/) 目錄。

---

## 路線圖 <a id="roadmap"></a>

- ✅ v1：多 provider、官方冷啟動、信任根、P2P 轉發、22 語言、錢包雛形
- 🔜 v2：信任鏈（trustChain）— 基於 Ed25519 簽名的鏈式邀請帳本
- 🔜 v3：實際指標驅動的節點品質評估（延遲、錯誤率、在線率）
- 🔜 v4：代幣經濟閉環 — MBP 用於優先路由、冷啟動加速、節點探索
- 🔜 v5：行動端節點
- 🔜 v6：Web 端 `<modelbus>` JS SDK

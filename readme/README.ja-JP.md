<!-- auto-generated README for ja-JP; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P：分散型 LLM Token 共有プラットフォーム
</h1>
<p align="center" style="font-weight: bold;">
  おそらく世界初。自分の Token を P2P ネットワークに繋ぎ、他のピアが共有する Token を使えるプラットフォーム。中央サーバー不要、アカウント登録不要、API キーがあなたの PC から外に出ることもありません。
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P はまだ開発と公開テストの段階です。</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.en-US.md) · [简体中文](../README.md) · [繁體中文](README.zh-TW.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## 目次

- [これは何ですか](#what)
- [主な特徴](#features)
- [画面プレビュー](#screenshots)
- [アーキテクチャ](#architecture)
- [分散型設計](#decentralised)
- [ノード公告フォーマット（v2）](#schema)
- [リクエストの流れ](#flow)
- [ダウンロードと利用（近日公開）](#download)
- [クイックスタート](#quickstart)
- [ロードマップ](#roadmap)

---

## これは何ですか <a id="what"></a>

ModelBus-P2P は [js-libp2p](https://github.com/libp2p/js-libp2p) と Electron を基盤にしたデスクトップクライアントで、誰もが一度は経験する「**今月は余るのに来月は足りない**」という悩みを解決します。

> シナリオ：OpenAI や Claude のサブスクを契約していても、月間の枠を使い切ることは稀です。月末に消えてしまう前に P2P ネットワークに繋いでしまいましょう。あなたのノードを経由したリクエスト 1 件ごとに **MBP トークン**（オンライン分数 × 0.05 ＋ 共有 Token 数 × 2 ＋ 処理リクエスト数 × 0.1 ＋ 応答速度 × 0.5）に変換されます。来月の枠が足りなくなったら、その MBP で他のピアの共有 Token を呼び出せます。すべて P2P 上で完結し、API キーはあなたの PC から一切出ません。

- **Provision / Share**：サブスクの API キーと共有したいモデルを登録。ネットワークにあなたの peerId を公開します。
- **Consume / Drive**：ローカルで OpenAI 互換の HTTP プロキシ（`http://127.0.0.1:18100`）を起動し、対応クライアントの base_url をそこに向けるだけ。リクエストは P2P 経由で実際の Token 保持者に転送されます。
- **Wallet**：共有も呼び出しも、すべて MBP トークンに換算。ホームタブと Wallet 画面で残高・内訳・計算式をリアルタイム表示します。
- **オンボーディング不要**：初回起動時に公式エンドポイント（またはローカル mock）からシードピアを取得し、以降は完全 P2P で動作します。

---

## 主な特徴 <a id="features"></a>

| 機能 | 説明 |
|---|---|
| **P2P トランスポート** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT トラバーサル + Kademlia DHT + AutoNAT |
| **分散型トラスト** | 4 つのハードコードされたシードピアをトラストアンカーに、新規ピアはトラストチェーン（次フェーズ）で参加 |
| **コールドスタート補完** | 初回起動時に公式 HTTPS エンドポイント（またはローカル mock）からノードを取得し、以降は `<userData>/bootstrap-cache.json` にキャッシュ |
| **マルチ Provider ルーティング** | 1 ピアが OpenAI + Anthropic + Google のキーを同時に保持可能。呼び出し側は `model.id` で自動振り分け |
| **OpenAI 互換プロキシ** | ローカル HTTP プロキシ（既定 `:18100`）。OpenAI / Anthropic 互換クライアントがそのまま使える |
| **API キー認証（任意）** | コンシューマ側で固定キーを設定し、呼び出し側が `Authorization: Bearer <key>` ヘッダで送信する形 |
| **22 言語対応** | デフォルトは日本語。RTL アラビア語もサポート |
| **ライトモード既定テーマ** | ダーク／OS 追従に切替可能 |

---

## 画面プレビュー <a id="screenshots"></a>

<p align="center"><img src="../docs/image/home.png" alt="Home / 首页" width="640"/></p>

<p align="center"><img src="../docs/image/model.png" alt="Models / 模型" width="640"/></p>

<p align="center"><img src="../docs/image/wallet.png" alt="Wallet / 钱包" width="640"/></p>

<p align="center"><img src="../docs/image/log.png" alt="Logs / 日志" width="640"/></p>

<p align="center"><img src="../docs/image/setting.png" alt="Settings / 设置" width="640"/></p>


---

## アーキテクチャ <a id="architecture"></a>

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
```

```bash
# ノード公告フォーマット（v2）— 後述
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# コンシューマ側ローカル HTTP プロキシ
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## 分散型設計 <a id="decentralised"></a>

シードピア ID 4 個をバイナリにハードコードしています（`src/main/config/trusted-roots.ts`）。コールドスタートのフロー：

1. 初回起動時はローカルキャッシュが空
2. 公式 HTTPS エンドポイント + ユーザ設定の `bootstrapMultiaddrs` + mDNS を並行フェッチ
3. 各 peerId を `TRUSTED_ROOT_PEER_IDS` と照合して検証
4. 検証済みサブセットを `<userData>/bootstrap-cache.json` に永続化
5. P2P デーモン起動。キャッシュヒットは P2P のみ、ミスは 1 時間ごとに公式エンドポイントを再試行

```
ハードコードされた 4 つのルート  ← トラストアンカー
└─ 公式エンドポイントからキャッシュ
   ├─ bootstrapMultiaddrs で直接接続
   ├─ mDNS（LAN 探索）
   └─ libp2p DHT findProviders（P2P のみ）
```

公式エンドポイントは**恒久的に**救助チャネルとして残し、P2P ネットワークが健全なときも温存します。

---

## ノード公告フォーマット（v2） <a id="schema"></a>

リクエスト：`<https://modelbus.cc/api/v1/nodes>` は `Array<NodeAnnouncement>` を返します：

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

フィールド：

- **version** `2`：schema バージョン。破壊的変更で +1
- **peerId**：libp2p PeerId（世界で一意）
- **nickname**：表示名
- **providers[]**：このピアがホストする LLM プロバイダ一覧
  - **providerId**：models.dev の provider id
  - **providerName**：表示名
  - **models[]**：このプロバイダ配下の共有モデル。各要素は `id`（正規 ID）と `name`（表示名）を持つ
- **addr**：単一の主要到達アドレス（複数ではない）
  - **kind**：「direct」／「relay」／「unknown」
  - **transport**：「tcp」／「ws」／「quic」／「webtransport」／「webrtc」
- **announcedAt**：このエントリが最後に更新された Unix ms
- **expiresAt**：ソフト TTL。期限切れでも利用可能だが重みは下がる

`mock/nodes.json` の末尾 4 エントリはトラストシードで、peerId は `trusted-roots.ts` と一致します。

---

## リクエストの流れ <a id="flow"></a>

**Provision**（あなた = Token 保有者）：設定 → Token 上線 → プロバイダ選択 → API キー貼付 → モデル選択 → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`。

**Consume**（あなた = Token 消費者）：モデルタブで信頼済みピアを選択 → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → HTTP POST 受信 → `body.model` 抽出 → ピアへダイヤル → `InferenceRequest`（JSON + レングスプレフィックス）送信 → `InferenceResponse` を待機 → HTTP 応答として書き戻し。

**リクエストルーティング**（被呼出側 `ProvisionerService.handle`）：

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ 該当：openai プロバイダ設定
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ 実呼び出し、応答返却
  └─ 非該当：400 + { error: "model X is not hosted by this peer" }
```

---

## ダウンロードと利用（近日公開） <a id="download"></a>

> 📦 公式インストーラ（Windows / macOS / Linux パッケージ、将来的にモバイルと Web SDK）は現在準備中です。

**今すぐ使うには：ソースからビルド**

```bash
pnpm install
pnpm run dev          # 開発モード（Electron + Vite HMR）
pnpm run package:mac  # macOS dmg
pnpm run package:win  # Windows nsis
pnpm run package:linux # Linux AppImage
```

成果物は `release/` に出力されます。

**配布チャネル（予定）**：公式ダウンロードページ · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew。公式ドメインは長期の救助エンドポイントとして残ります。

---

## クイックスタート <a id="quickstart"></a>

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

初回起動時はアプリが `mock/nodes.json` を指すので、ネットワークなしで全フローを体験できます。詳細はメイン [README.md](../README.md) と [docs/](../docs/) を参照してください。

---

## ロードマップ <a id="roadmap"></a>

- ✅ v1：マルチ Provider、公式コールドスタート、トラストアンカー、P2P 転送、22 言語、ウォレットの原型
- 🔜 v2：トラストチェーン（trustChain）— Ed25519 署名による招待台帳
- 🔜 v3：実指標（遅延・エラー率・稼働率）に基づくノード品質評価
- 🔜 v4：トークン経済のループ — MBP が優先ルーティングやコールドスタートを駆動
- 🔜 v5：モバイルピア
- 🔜 v6：Web SDK — ブラウザ用 `<modelbus>`

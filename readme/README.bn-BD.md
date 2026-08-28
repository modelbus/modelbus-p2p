<!-- auto-generated README for bn-BD; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : একটি বিকেন্দ্রীভূত LLM Token শেয়ারিং প্ল্যাটফর্ম
</h1>
<p align="center" style="font-weight: bold;">
  সম্ভবত বিশ্বের প্রথম প্ল্যাটফর্ম যেখানে যে কেউ তার Token P2P নেটওয়ার্কে সংযুক্ত করতে পারে এবং বিনিময়ে অন্যান্য পিয়ারের শেয়ার করা Token ব্যবহার করতে পারে। কোনো কেন্দ্রীয় সার্ভার নেই, অ্যাকাউন্ট নিবন্ধন নেই, কোনো API কী কখনো আপনার মেশিন ছেড়ে যায় না।
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P এখনও উন্নয়ন ও পাবলিক পরীক্ষার পর্যায়ে আছে।</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## সূচি

- [এটি কী](#-)
- [মূল বৈশিষ্ট্য](#-)
- [স্ক্রিনশট](#)
- [আর্কিটেকচার](#)
- [বিকেন্দ্রীভূত নকশা](#-)
- [নোড ঘোষণা ফরম্যাট (v2)](#-v2)
- [অনুরোধ প্রবাহ](#-)
- [ডাউনলোড ও ব্যবহার (শীঘ্রই)](#-)
- [দ্রুত শুরু](#-)
- [রোডম্যাপ](#)

---

## এটি কী

ModelBus-P2P হল [js-libp2p](https://github.com/libp2p/js-libp2p) এবং Electron-এর উপর নির্মিত একটি ডেস্কটপ ক্লায়েন্ট। এটি প্রায় সবার জানা একটি সমস্যার সমাধান করে: **এই মাসে অতিরিক্ত, পরের মাসে অভাব।**

> পরিস্থিতি: আপনি OpenAI বা Claude-এর জন্য পে করেন এবং খুব কমই মাসিক কোটা শেষ করেন। এটা মেয়াদোত্তীর্ণ হতে না দিয়ে P2P নেটওয়ার্কে লাগিয়ে দিন। আপনার নোড দিয়ে যাওয়া প্রতিটি অনুরোধ **MBP টোকেনে** রূপান্তরিত হয় (অনলাইন মিনিট × ০.০৫ + শেয়ার করা Token সংখ্যা × ২ + পরিবেশন করা অনুরোধ × ০.১ + প্রতিক্রিয়ার গতি × ০.৫)। যখন পরের মাসে কোটা সংকুচিত হয়, তখন সেই MBP খরচ করে অন্য পিয়ারের শেয়ার করা Token কল করুন। কোনো কেন্দ্রীয় সার্ভার জড়িত নয়, এবং আপনার API কী মেশিনেই থাকে।

- **Provision / Share**: আপনার সাবস্ক্রিপশনের API কী এবং শেয়ার করতে চাওয়া মডেলগুলো নিবন্ধন করুন। নেটওয়ার্ক আপনার peerId জানবে।
- **Consume / Drive**: `http://127.0.0.1:18100`-এ OpenAI-সামঞ্জস্যপূর্ণ স্থানীয় HTTP প্রক্সি চালু করুন; যেকোনো সামঞ্জস্যপূর্ণ ক্লায়েন্ট সেখানে পয়েন্ট করুন; অনুরোধ P2P-এর মাধ্যমে Token-ধারী পিয়ারে ফরওয়ার্ড হয়।
- **Wallet**: প্রতিটি শেয়ার বা কল MBP টোকেন জমা করে। হোম ট্যাব ও Wallet পেজ রিয়েল-টাইমে ব্যালেন্স, ভাঙ্গন ও সূত্র দেখায়। MBP বর্তমানে শুধু হিসাব; ভবিষ্যৎ সংস্করণে এটি খ্যাতি, প্রণোদনা ও অগ্রাধিকার রাউটিং-এর জন্য ব্যবহৃত হবে।
- **অনবোর্ডিং নেই**: প্রথম চালু অফিসিয়াল 엔드পয়েন্ট (বা লোকাল mock) থেকে সিড নোড আনে, তারপর সম্পূর্ণ P2P মোডে চলে।

---

## মূল বৈশিষ্ট্য

| বৈশিষ্ট্য | নোট |
|---|---|
| **P2P পরিবহন** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **বিকেন্দ্রীভূত বিশ্বাস** | 4টি হার্ডকোডেড সিড পিয়ার আইডি বিশ্বাসের অ্যাঙ্কর; নতুন পিয়ার বিশ্বাস চেইনের মাধ্যমে যুক্ত হয় (পরবর্তী মাইলফলক) |
| **কোল্ড স্টার্ট ফলব্যাক** | প্রথম চালু অফিসিয়াল HTTPS 엔드পয়েন্ট বা লোকাল mock থেকে নোড আনে; সবকিছু `<userData>/bootstrap-cache.json`-এ জমা হয় |
| **মাল্টি-প্রোভাইডার রাউটিং** | একটি পিয়ার একসাথে OpenAI + Anthropic + Google হোস্ট করতে পারে; কলকারীরা `model.id` দিয়ে রাউট করে |
| **OpenAI-সামঞ্জস্যপূর্ণ প্রক্সি** | `:18100`-এ স্থানীয় HTTP প্রক্সি; যেকোনো OpenAI/Anthropic-সামঞ্জস্যপূর্ণ ক্লায়েন্ট সরাসরি কাজ করে |
| **API কী অথ (ঐচ্ছিক)** | ভোক্তা প্রক্সিতে একটি স্থায়ী কী সেট করুন; কলকারীদের `Authorization: Bearer <key>` পাঠাতে হবে |
| **২২টি ভাষা** | বাংলা ডিফল্ট; RTL আরবি সমর্থিত |
| **উজ্জ্বল ডিফল্ট থিম** | ডার্ক / OS অনুসরণে পরিবর্তনযোগ্য |

---

## স্ক্রিনশট

হোম, মডেল, ওয়ালেট, লগ, সেটিংস — মোট পাঁচটি ভিউ। পূর্ণ রেজোলিউশনের স্ক্রিনশট [docs/image/](../docs/image/)-এ আছে।

---

## আর্কিটেকচার

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
│              ├─ providers   (models.dev ক্যাশ)                │
│              ├─ registry    (অফিসিয়াল API + ক্যাশ ফলব্যাক)   │
│              ├─ p2p         (libp2p ডেমন)                      │
│              ├─ provisioner (মাল্টি-প্রোভাইডার রাউটার)        │
│              ├─ proxy-server (OpenAI-সামঞ্জস্যপূর্ণ HTTP)     │
│              ├─ upstream    (বাস্তব প্রোভাইডার API কল)       │
│              ├─ wallet      (MBP স্কোর গণনা)                   │
│              └─ models      (ক্যাটালগ সমষ্টি)                    │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   P2P নেটওয়ার্ক    │
              └──────────────────┘
```

```bash
# নোড ঘোষণা v2 — পরের বিভাগ দেখুন
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# লোকাল ভোক্তা প্রক্সি
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## বিকেন্দ্রীভূত নকশা

চারটি সিড পিয়ার আইডি বাইনারিতে এমবেড করা (`src/main/config/trusted-roots.ts`)। কোল্ড স্টার্ট প্রবাহ:

1. প্রথম চালুতে লোকাল ক্যাশ খালি
2. সমান্তরালে আনা: অফিসিয়াল HTTPS 엔드পয়েন্ট + ব্যবহারকারী কনফিগার করা `bootstrapMultiaddrs` + mDNS
3. প্রতিটি peerId `TRUSTED_ROOT_PEER_IDS`-এর সাথে যাচাই
4. যাচাইকৃত সাবসেট `<userData>/bootstrap-cache.json`-এ সংরক্ষণ
5. P2P ডেমন শুরু; ক্যাশ হিট P2P মোডে থাকে; মিস প্রতি ঘণ্টায় অফিসিয়াল 엔드পয়েন্ট পুনরায় চেষ্টা করে

```
৪টি হার্ডকোডেড রুট  ←  বিশ্বাসের অ্যাঙ্কর
└─ অফিসিয়াল 엔드পয়েন্ট থেকে ক্যাশ
   ├─ bootstrapMultiaddrs via সরাসরি সংযোগ
   ├─ mDNS (LAN আবিষ্কার)
   └─ libp2p DHT findProviders (শুদ্ধ P2P)
```

অফিসিয়াল 엔드পয়েন্ট **চিরকাল** উদ্ধার চ্যানেল হিসেবে থাকে, P2P নেটওয়ার্ক সুস্থ থাকলেও।

---

## নোড ঘোষণা ফরম্যাট (v2)

অনুরোধ: `<https://modelbus.cc/api/v1/nodes>` `Array<NodeAnnouncement>` ফেরত দেয়:

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

ক্ষেত্র:

- **version** `2`: স্কিমা সংস্করণ; ভাঙা পরিবর্তনে +1
- **peerId**: libp2p PeerId, বিশ্বব্যাপী অনন্য
- **nickname**: পঠনযোগ্য নাম
- **providers[]**: এই পিয়ার হোস্ট করা LLM প্রোভাইডার
  - **providerId**: models.dev-এ প্রোভাইডার id
  - **providerName**: প্রদর্শন নাম
  - **models[]**: এই প্রোভাইডারের অধীনে মডেল; প্রতিটির `id` (ক্যানোনিক্যাল) ও `name` (প্রদর্শন)
- **addr**: একক প্রধান অ্যাক্সেসযোগ্য ঠিকানা (একবচন)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: সর্বশেষ আপডেটের Unix ms
- **expiresAt**: নরম TTL; মেয়াদোত্তীর্ণ এন্ট্রি এখনও ব্যবহারযোগ্য কিন্তু কম ওজন

`mock/nodes.json`-এর শেষ ৪টি এন্ট্রি বিশ্বস্ত সিড পিয়ার; তাদের peerId `trusted-roots.ts`-এর সাথে মিলে যায়।

---

## অনুরোধ প্রবাহ

**Provision** (আপনি = Token ধারক): সেটিংস → Token শেয়ার → প্রোভাইডার বাছুন, API কী আটকান, মডেল টিক দিন → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`।

**Consume** (আপনি = Token ভোক্তা): মডেল ট্যাবে বিশ্বস্ত পিয়ার বাছুন → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → HTTP POST আসে → `body.model` বের করুন → পিয়ারে ডায়াল করুন → `InferenceRequest` (JSON + দৈর্ঘ্য উপসর্গ) লিখুন → `InferenceResponse`-এর জন্য অপেক্ষা করুন → HTTP উত্তর লিখুন।

**অনুরোধ রাউটিং** (কলপ্রাপ্ত পিয়ারে `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ মিল: openai প্রোভাইডার কনফিগ
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ বাস্তব কল, উত্তর ফেরত
  └─ মিল নেই: 400 + { error: "model X is not hosted by this peer" }
```

---

## ডাউনলোড ও ব্যবহার (শীঘ্রই)

> 📦 অফিসিয়াল ইনস্টলার (Windows / macOS / Linux প্যাকেজ, পরে মোবাইল ও Web SDK) প্রস্তুত করা হচ্ছে।

**এখনই ব্যবহার করতে: সোর্স থেকে বিল্ড**

```bash
pnpm install
pnpm run dev          # ডেভ মোড (Electron + Vite HMR)
pnpm run package:mac  # macOS dmg
pnpm run package:win  # Windows nsis
pnpm run package:linux # Linux AppImage
```

আউটপুট `release/`-এ থাকে।

**বিতরণ চ্যানেল (পরিকল্পিত)**: অফিসিয়াল ডাউনলোড পেজ · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew। অফিসিয়াল ডোমেইন চিরকাল উদ্ধার 엔드পয়েন্ট।

---

## দ্রুত শুরু

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

প্রথম চালুতে অ্যাপ ডিফল্টভাবে `mock/nodes.json`-এ পয়েন্ট করে, তাই পুরো প্রবাহ নেটওয়ার্ক ছাড়াই চলে। আরও বিস্তারিত মূল [README.md](../README.md) ও [docs/](../docs/) ফোল্ডারে।

---

## রোডম্যাপ

- ✅ v1: মাল্টি-প্রোভাইডার, অফিসিয়াল কোল্ড স্টার্ট, বিশ্বাস অ্যাঙ্কর, P2P ফরওয়ার্ড, ২২ ভাষা, ওয়ালেট কাঠামো
- 🔜 v2: বিশ্বাস চেইন (trustChain) — Ed25519 স্বাক্ষরিত আমন্ত্রণ খতিয়ান
- 🔜 v3: বাস্তব মেট্রিক (বিলম্ব, ত্রুটি হার, আপটাইম) ভিত্তিক নোড মান মূল্যায়ন
- 🔜 v4: টোকেন অর্থনীতি লুপ — MBP অগ্রাধিকার রাউটিং, কোল্ড স্টার্ট বুস্ট ও নোড আবিষ্কার চালায়
- 🔜 v5: মোবাইল পিয়ার
- 🔜 v6: ওয়েব SDK — ব্রাউজারে `<modelbus>`

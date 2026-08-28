<!-- auto-generated README for ar-SA; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : منصة لا مركزية لمشاركة رموز LLM
</h1>
<p align="center" style="font-weight: bold;">
  ربما المنصة الأولى في العالم حيث يمكن لأي شخص ربط رمزه بشبكة P2P، وفي المقابل استخدام الرموز المشتركة من قبل أقران آخرين. لا خادم مركزي، لا تسجيل حساب، ولا مفتاح API يغادر جهازك أبداً.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P لا يزال قيد التطوير والاختبار العام.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## المحتويات

- [ما هو](#-)
- [الميزات الأساسية](#-)
- [لقطات الشاشة](#-)
- [البنية](#)
- [التصميم اللامركزي](#-)
- [صيغة إعلان العقدة (v2)](#-v2)
- [تدفق الطلب](#-)
- [التحميل والاستخدام (قريباً)](#-)
- [البدء السريع](#-)
- [خارطة الطريق](#-)

---

## ما هو

ModelBus-P2P هو عميل سطح مكتب مبني على [js-libp2p](https://github.com/libp2p/js-libp2p) و Electron. يحل مشكلة يعرفها الجميع تقريباً: **هذا الشهر فائض والشهر القادم نقص.**

> السيناريو: تدفع مقابل OpenAI أو Claude ونادراً ما تستنزف الحصة الشهرية. بدلاً من أن تنتهي صلاحيتها، علّقها على شبكة P2P. كل طلب يمر عبر عقدتك يتحول إلى **رموز MBP** (دقائق الاتصال × 0.05 + عدد الرموز المشتركة × 2 + الطلبات المقدمة × 0.1 + سرعة الاستجابة × 0.5). عندما يحين الشهر التالي وتشحّ حصتك، أنفق تلك MBP لاستدعاء رموز يشاركها أقران آخرون. لا يتدخل خادم مركزي أبداً، ويبقى مفتاح API على جهازك.

- **Provision / Share**: سجّل مفتاح API لاشتراكك والنماذج التي تريد مشاركتها. تعرف الشبكة على peerId الخاص بك.
- **Consume / Drive**: شغّل وكيل HTTP محلياً متوافقاً مع OpenAI على `http://127.0.0.1:18100`؛ وجّه إليه أي عميل متوافق؛ تُحوَّل الطلبات عبر P2P إلى النظير الذي يملك الرمز فعلياً.
- **Wallet**: كل مشاركة أو استدعاء يجمع رموز MBP. تعرض تبويبة الرئيسية وصفحة المحفظة الرصيد والتفصيل والصيغة في الوقت الفعلي. حالياً MBP للمحاسبة فقط؛ الإصدارات القادمة ستستخدمه للسمعة والحوافز والتوجيه ذي الأولوية.
- **بدون إعداد مسبق**: أول تشغيل يجلب العقد البذرية من نقطة النهاية الرسمية (أو نموذج محلي)، ثم يعمل بالكامل في وضع P2P.

---

## الميزات الأساسية

| الميزة | ملاحظات |
|---|---|
| **نقل P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **ثقة لا مركزية** | 4 معرّفات عقد بذرية مدمجة كمراسي ثقة؛ أقران جدد ينضمون عبر سلسلة الثقة (المرحلة التالية) |
| **بدء بارد احتياطي** | أول تشغيل يجلب العقد من نقطة النهاية الرسمية HTTPS أو نموذج محلي؛ كل شيء يُخزن في `<userData>/bootstrap-cache.json` |
| **توجيه متعدد المزودين** | نظير واحد يستضيف OpenAI + Anthropic + Google في آنٍ واحد؛ المتصلون يوجّهون عبر `model.id` |
| **وكيل متوافق مع OpenAI** | وكيل HTTP محلي على `:18100`؛ أي عميل متوافق مع OpenAI/Anthropic يعمل مباشرة |
| **توثيق بمفتاح API (اختياري)** | ثبّت مفتاحاً في وكيل الاستهلاك؛ يجب على المتصلين إرسال `Authorization: Bearer <key>` |
| **22 لغة** | العربية افتراضياً؛ دعم RTL |
| **مظهر فاتح افتراضي** | قابل للتبديل إلى داكن / اتبع النظام |

---

## لقطات الشاشة

الرئيسية، النماذج، المحفظة، السجلات، الإعدادات — خمس شاشات إجمالاً. لقطات بدقة كاملة في [docs/image/](../docs/image/).

---

## البنية

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
│              ├─ providers   (كاش models.dev)                   │
│              ├─ registry    (واجهة رسمية + كاش احتياطي)         │
│              ├─ p2p         (خادم libp2p)                      │
│              ├─ provisioner (موجّه متعدد المزودين)              │
│              ├─ proxy-server (HTTP متوافق مع OpenAI)          │
│              ├─ upstream    (استدعاءات API حقيقية)             │
│              ├─ wallet      (حساب نقاط MBP)                    │
│              └─ models      (مجمع الكتالوج)                    │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   شبكة P2P        │
              └──────────────────┘
```

```bash
# إعلان العقدة v2 — انظر القسم التالي
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# وكيل الاستهلاك المحلي
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## التصميم اللامركزي

أربعة معرّفات عقد بذرية مدمجة في الثنائي (`src/main/config/trusted-roots.ts`). تدفق البدء البارد:

1. الكاش المحلي فارغ عند أول تشغيل
2. جلب متوازٍ: نقطة نهاية رسمية HTTPS + `bootstrapMultiaddrs` المُهيأة + mDNS
3. التحقق من كل peerId مقابل `TRUSTED_ROOT_PEER_IDS`
4. حفظ المجموعة الفرعية الموثقة في `<userData>/bootstrap-cache.json`
5. يبدأ خادم P2P؛ الإصابات بالكاش تبقى في وضع P2P؛ الإخفاقات تُعيد المحاولة على نقطة النهاية الرسمية كل ساعة

```
4 جذور مدمجة  ←  مراسي الثقة
└─ من كاش نقطة النهاية الرسمية
   ├─ اتصال مباشر عبر bootstrapMultiaddrs
   ├─ mDNS (اكتشاف LAN)
   └─ libp2p DHT findProviders (P2P خالص)
```

نقطة النهاية الرسمية تُحفظ **للأبد** كقناة إنقاذ، حتى عندما تكون شبكة P2P سليمة.

---

## صيغة إعلان العقدة (v2)

الطلب: `<https://modelbus.cc/api/v1/nodes>` يُرجع `Array<NodeAnnouncement>`:

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

الحقول:

- **version** `2`: إصدار المخطط؛ +1 عند تغييرات قاسمة
- **peerId**: libp2p PeerId، فريد عالمياً
- **nickname**: اسم مقروء
- **providers[]**: مزودو LLM الذين يستضيفهم هذا النظير
  - **providerId**: معرّف المزود في models.dev
  - **providerName**: اسم العرض
  - **models[]**: نماذج هذا المزود؛ لكلٍّ `id` (قانوني) و `name` (عرض)
- **addr**: عنوان أساسي واحد قابل للوصول (مفرد وليس جمعاً)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: مللي ثانية Unix لآخر تحديث
- **expiresAt**: TTL مرن؛ الإدخالات المنتهية ما تزال قابلة للاستخدام لكن بوزن أقل

الـ 4 إدخالات الأخيرة في `mock/nodes.json` هي العقد البذرية الموثوقة؛ تتطابق peerId مع `trusted-roots.ts`.

---

## تدفق الطلب

**Provision** (أنت = حامل الرمز): الإعدادات → مشاركة الرمز → اختر المزود، الصق مفتاح API، حدّد النماذج → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (أنت = مستهلك الرمز): اختر نظيراً موثوقاً في تبويبة النماذج → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → يصل POST HTTP → استخرج `body.model` → اتصل بالنظير → اكتب `InferenceRequest` (JSON + بادئة طول) → انتظر `InferenceResponse` → اكتب استجابة HTTP.

**توجيه الطلب** (عند النظير المُستدعى `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ تطابق: إعداد مزود openai
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ استدعاء حقيقي، إعادة الرد
  └─ لا تطابق: 400 + { error: "model X is not hosted by this peer" }
```

---

## التحميل والاستخدام (قريباً)

> 📦 المثبتات الرسمية (حزم Windows / macOS / Linux، ولاحقاً الموبايل و Web SDK) قيد التحضير.

**لاستخدامه الآن: ابنِ من المصدر**

```bash
pnpm install
pnpm run dev          # وضع التطوير (Electron + Vite HMR)
pnpm run package:mac  # dmg لنظام macOS
pnpm run package:win  # nsis لنظام Windows
pnpm run package:linux # AppImage لنظام Linux
```

تقع النواتج في `release/`.

**قنوات التوزيع (مخطط لها)**: صفحة التحميل الرسمية · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. يبقى النطاق الرسمي نقطة إنقاذ دائمة.

---

## البدء السريع

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

عند أول تشغيل تشير التطبيق افتراضياً إلى `mock/nodes.json`، لذا يعمل التدفق كاملاً دون شبكة. التفاصيل في [README.md](../README.md) الرئيسي ومجلد [docs/](../docs/).

---

## خارطة الطريق

- ✅ v1: متعدد المزودين، بدء بارد رسمي، مراسي ثقة، تمرير P2P، 22 لغة، هيكل المحفظة
- 🔜 v2: سلسلة الثقة (trustChain) — دفتر دعوات موقّع Ed25519
- 🔜 v3: تقييم جودة العقدة بمقاييس حقيقية (زمن الاستجابة، الأخطاء، مدة التشغيل)
- 🔜 v4: حلقة اقتصاد الرموز — MBP يقود التوجيه ذا الأولوية، وتغيير البدء البارد، واكتشاف العقد
- 🔜 v5: أقران موبايل
- 🔜 v6: SDK ويب — `<modelbus>` في المتصفح

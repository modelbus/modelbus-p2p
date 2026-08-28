<!-- auto-generated README for th-TH; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : แพลตฟอร์มแบ่งปัน Token LLM แบบกระจายศูนย์
</h1>
<p align="center" style="font-weight: bold;">
  อาจเป็นแพลตฟอร์มแรกของโลกที่ทุกคนสามารถแขวน Token ของตนเองบนเครือข่าย P2P และเรียกใช้ Token ที่เพียร์อื่นแชร์ไว้ ไม่มีเซิร์ฟเวอร์กลาง ไม่ต้องสมัครบัญชี ไม่มี API Key หลุดออกจากเครื่องของคุณ
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P ยังอยู่ในขั้นตอนการพัฒนาและทดสอบสาธารณะ</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.en-US.md) · [简体中文](../README.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## สารบัญ

- [คืออะไร](#)
- [คุณสมบัติหลัก](#)
- [ภาพหน้าจอ](#)
- [สถาปัตยกรรม](#)
- [การออกแบบแบบกระจายศูนย์](#)
- [รูปแบบการประกาศโหนด (v2)](#-v2)
- [ขั้นตอนคำขอ](#)
- [ดาวน์โหลดและใช้งาน (เร็ว ๆ นี้)](#-)
- [เริ่มต้นอย่างรวดเร็ว](#)
- [แผนงาน](#)

---

## คืออะไร

ModelBus-P2P เป็นไคลเอนต์เดสก์ท็อปที่สร้างจาก [js-libp2p](https://github.com/libp2p/js-libp2p) และ Electron แก้ปัญหาที่แทบทุกคนรู้จัก: **เดือนนี้เหลือ เดือนหน้าไม่พอ**

> สถานการณ์: คุณจ่ายเงินสำหรับ OpenAI หรือ Claude แต่แทบไม่ได้ใช้โควตารายเดือนจนหมด แทนที่จะปล่อยให้หมดอายุ ให้แขวนมันไว้บนเครือข่าย P2P ทุกคำขอที่ผ่านโหนดของคุณจะถูกแปลงเป็น **โทเคน MBP** (นาทีออนไลน์ × 0.05 + จำนวน Token ที่แชร์ × 2 + คำขอที่ให้บริการ × 0.1 + ความเร็วการตอบสนอง × 0.5) เมื่อเดือนถัดมาโควตาขาดแคลน คุณใช้ MBP เหล่านั้นเพื่อเรียก Token ที่เพียร์อื่นแชร์ไว้ ไม่มีเซิร์ฟเวอร์กลางเข้ามาเกี่ยวข้อง และ API Key ยังคงอยู่บนเครื่องของคุณ

- **Provision / Share**: ลงทะเบียน API Key ของการสมัครสมาชิกและโมเดลที่ต้องการแชร์ เครือข่ายจะรู้จัก peerId ของคุณ
- **Consume / Drive**: เปิดพร็อกซี HTTP ในเครื่องที่เข้ากันได้กับ OpenAI ที่ `http://127.0.0.1:18100` ชี้ไคลเอนต์ที่เข้ากันได้ไปที่นั่น คำขอจะถูกส่งต่อผ่าน P2P ไปยังเพียร์ที่ถือ Token จริง
- **Wallet**: การแชร์หรือการเรียกแต่ละครั้งจะสะสมโทเคน MBP แท็บหน้าแรกและหน้า Wallet แสดงยอดคงเหลือ รายละเอียด และสูตรแบบเรียลไทม์ ตอนนี้ MBP เป็นเพียงการบันทึกบัญชี เวอร์ชันอนาคตจะใช้สำหรับชื่อเสียง สิ่งจูงใจ และการจัดลำดับความสำคัญ
- **ไม่ต้องเตรียมการ**: การเปิดครั้งแรกจะดึงโหนด seed จาก endpooint อย่างเป็นทางการ (หรือ mock ในเครื่อง) แล้วทำงานในโหมด P2P เต็มรูปแบบ

---

## คุณสมบัติหลัก

| คุณสมบัติ | หมายเหตุ |
|---|---|
| **การขนส่ง P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **ความไว้วางใจแบบกระจายศูนย์** | peerId seed 4 ตัวที่ฮาร์ดโค้ดไว้เป็นจุดยึดความไว้วางใจ เพียร์ใหม่เข้าร่วมผ่านห่วงโซ่ความไว้วางใจ (ขั้นต่อไป) |
| **สำรองการเริ่มต้นเร็ว** | การเปิดครั้งแรกดึงโหนดจาก endpooint HTTPS อย่างเป็นทางการหรือ mock ในเครื่อง ทั้งหมดอยู่ใน `<userData>/bootstrap-cache.json` |
| **การจัดเส้นทางหลายผู้ให้บริการ** | เพียร์เดียวสามารถโฮสต์ OpenAI + Anthropic + Google พร้อมกัน ผู้เรียกจัดเส้นทางตาม `model.id` |
| **พร็อกซีที่เข้ากันได้กับ OpenAI** | พร็อกซี HTTP ในเครื่องที่ `:18100` ไคลเอนต์ที่เข้ากันได้กับ OpenAI/Anthropic ทำงานได้ทันที |
| **การยืนยันด้วย API Key (ไม่บังคับ)** | ตั้งคีย์คงที่ในพร็อกซีฝั่งผู้ใช้ ผู้เรียกต้องส่ง `Authorization: Bearer <key>` |
| **22 ภาษา** | ค่าเริ่มต้นเป็นไทย รองรับอาหรับ RTL |
| **ธีมสว่างเป็นค่าเริ่มต้น** | สลับเป็นมืด / ตามระบบปฏิบัติการ |

---

## ภาพหน้าจอ

หน้าแรก, โมเดล, กระเป๋าเงิน, บันทึก, การตั้งค่า — รวม 5 มุมมอง ภาพหน้าจอความละเอียดเต็มอยู่ใน [docs/image/](../docs/image/)

---

## สถาปัตยกรรม

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
│              ├─ providers   (แคช models.dev)                 │
│              ├─ registry    (API ทางการ + แคชสำรอง)           │
│              ├─ p2p         (daemon libp2p)                   │
│              ├─ provisioner (เราเตอร์หลายผู้ให้บริการ)          │
│              ├─ proxy-server (HTTP ที่เข้ากันได้กับ OpenAI)  │
│              ├─ upstream    (เรียก API จริง)                  │
│              ├─ wallet      (คำนวณคะแนน MBP)                   │
│              └─ models      (รวมแคตตาล็อก)                     │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   เครือข่าย P2P    │
              └──────────────────┘
```

```bash
# การประกาศโหนด v2 — ดูหัวข้อถัดไป
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# พร็อกซีฝั่งผู้ใช้ในเครื่อง
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## การออกแบบแบบกระจายศูนย์

peerId seed 4 ตัวถูกฝังในไบนารี (`src/main/config/trusted-roots.ts`) ขั้นตอนการเริ่มต้นเร็ว:

1. แคชในเครื่องว่างเปล่าเมื่อเปิดครั้งแรก
2. ดึงพร้อมกัน: endpooint HTTPS ทางการ + `bootstrapMultiaddrs` ที่ตั้งค่าไว้ + mDNS
3. ตรวจสอบแต่ละ peerId กับ `TRUSTED_ROOT_PEER_IDS`
4. บันทึกชุดย่อยที่ตรวจแล้วลง `<userData>/bootstrap-cache.json`
5. daemon P2P เริ่มทำงาน กรณีแคชตรงจะอยู่ในโหมด P2P กรณีไม่ตรงจะลอง endpooint ทางการใหม่ทุกชั่วโมง

```
4 รากที่ฮาร์ดโค้ด  ←  จุดยึดความไว้วางใจ
└─ จากแคชของ endpooint ทางการ
   ├─ เชื่อมต่อตรงผ่าน bootstrapMultiaddrs
   ├─ mDNS (ค้นหาใน LAN)
   └─ libp2p DHT findProviders (P2P ล้วน)
```

endpooint ทางการจะคงอยู่ **ตลอดไป** เป็นช่องทางกู้ภัย แม้เครือข่าย P2P จะปกติ

---

## รูปแบบการประกาศโหนด (v2)

คำขอ: `<https://modelbus.cc/api/v1/nodes>` คืนค่า `Array<NodeAnnouncement>`:

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

ฟิลด์:

- **version** `2`: เวอร์ชัน schema เพิ่ม +1 เมื่อมีการเปลี่ยนแปลงที่พัง
- **peerId**: libp2p PeerId ไม่ซ้ำทั่วโลก
- **nickname**: ชื่อที่อ่านได้
- **providers[]**: ผู้ให้บริการ LLM ที่เพียร์นี้โฮสต์
  - **providerId**: id ผู้ให้บริการใน models.dev
  - **providerName**: ชื่อที่แสดง
  - **models[]**: โมเดลภายใต้ผู้ให้บริการนี้ แต่ละรายการมี `id` (บัญญัติ) และ `name` (แสดง)
- **addr**: ที่อยู่หลักเดียวที่เข้าถึงได้ (เอกพจน์ ไม่ใช่พหูพจน์)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: มิลลิวินาที Unix ของการอัปเดตครั้งล่าสุด
- **expiresAt**: TTL แบบยืดหยุ่น รายการหมดอายุยังใช้ได้แต่น้ำหนักต่ำลง

4 รายการสุดท้ายใน `mock/nodes.json` คือเพียร์ seed ที่เชื่อถือได้ peerId ตรงกับ `trusted-roots.ts`

---

## ขั้นตอนคำขอ

**Provision** (คุณ = ผู้ถือ Token): การตั้งค่า → แชร์ Token → เลือกผู้ให้บริการ วาง API Key ทำเครื่องหมายโมเดล → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`

**Consume** (คุณ = ผู้ใช้ Token): เลือกเพียร์ที่เชื่อถือได้ในแท็บโมเดล → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → รับ HTTP POST → ดึง `body.model` → โทรหาเพียร์ → เขียน `InferenceRequest` (JSON + คำนำหน้าความยาว) → รอ `InferenceResponse` → เขียนคำตอบ HTTP

**การจัดเส้นทางคำขอ** (ที่ฝั่งผู้ถูกเรียก `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ ตรง: การตั้งค่าผู้ให้บริการ openai
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ เรียกจริง คืนคำตอบ
  └─ ไม่ตรง: 400 + { error: "model X is not hosted by this peer" }
```

---

## ดาวน์โหลดและใช้งาน (เร็ว ๆ นี้)

> 📦 ตัวติดตั้งอย่างเป็นทางการ (แพ็กเกจ Windows / macOS / Linux และต่อมามือถือและ Web SDK) กำลังเตรียมการ

**วิธีใช้ตอนนี้: สร้างจากซอร์สโค้ด**

```bash
pnpm install
pnpm run dev          # โหมดพัฒนา (Electron + Vite HMR)
pnpm run package:mac  # dmg สำหรับ macOS
pnpm run package:win  # nsis สำหรับ Windows
pnpm run package:linux # AppImage สำหรับ Linux
```

ผลลัพธ์อยู่ใน `release/`

**ช่องทางเผยแพร่ (ตามแผน)**: หน้าโหลดอย่างเป็นทางการ · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew โดเมนทางการเป็น endpooint กู้ภัยถาวร

---

## เริ่มต้นอย่างรวดเร็ว

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

เมื่อเปิดครั้งแรกแอปชี้ไปที่ `mock/nodes.json` เป็นค่าเริ่มต้น ดังนั้นโฟลว์ทั้งหมดทำงานได้โดยไม่ต้องมีเครือข่าย รายละเอียดเพิ่มเติมใน [README.md](../README.md) หลักและโฟลเดอร์ [docs/](../docs/)

---

## แผนงาน

- ✅ v1: หลายผู้ให้บริการ, เริ่มต้นเร็วอย่างเป็นทางการ, จุดยึดความไว้วางใจ, ส่งต่อ P2P, 22 ภาษา, โครงกระเป๋าเงิน
- 🔜 v2: ห่วงโซ่ความไว้วางใจ (trustChain) — สมุดเชิญที่ลงนามด้วย Ed25519
- 🔜 v3: ประเมินคุณภาพโหนดด้วยเมตริกจริง (ความหน่วง, อัตราข้อผิดพลาด, อัปไทม์)
- 🔜 v4: วัฏจักรเศรษฐกิจโทเคน — MBP ขับเคลื่อนการจัดเส้นทางลำดับความสำคัญ, บูสต์การเริ่มต้นเร็ว, ค้นพบโหนด
- 🔜 v5: เพียร์มือถือ
- 🔜 v6: SDK เว็บ — `<modelbus>` ในเบราว์เซอร์

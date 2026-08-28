<!-- auto-generated README for vi-VN; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : Nền tảng chia sẻ Token LLM phi tập trung
</h1>
<p align="center" style="font-weight: bold;">
  Có thể là nền tảng đầu tiên trên thế giới, nơi bất kỳ ai cũng có thể gắn Token của mình vào mạng P2P và đổi lại sử dụng Token được chia sẻ bởi các peer khác. Không có máy chủ trung tâm, không cần đăng ký tài khoản, không có API key nào rời khỏi máy của bạn.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P vẫn đang trong giai đoạn phát triển và thử nghiệm công khai.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.en-US.md) · [简体中文](../README.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md)

</div>

---

## Mục lục

- [Đây là gì](#what)
- [Tính năng chính](#features)
- [Ảnh chụp màn hình](#screenshots)
- [Kiến trúc](#architecture)
- [Thiết kế phi tập trung](#decentralised)
- [Định dạng thông báo nút (v2)](#schema)
- [Luồng yêu cầu](#flow)
- [Tải về và sử dụng (sắp ra mắt)](#download)
- [Bắt đầu nhanh](#quickstart)
- [Lộ trình](#roadmap)

---

## Đây là gì <a id="what"></a>

ModelBus-P2P là một ứng dụng máy tính để bàn được xây dựng trên [js-libp2p](https://github.com/libp2p/js-libp2p) và Electron. Nó giải quyết một vấn đề mà hầu như ai cũng gặp: **tháng này thừa, tháng sau thiếu.**

> Kịch bản: bạn trả phí cho OpenAI hoặc Claude nhưng hiếm khi dùng hết hạn mức hàng tháng. Thay vì để nó hết hạn, hãy gắn nó vào mạng P2P. Mỗi yêu cầu đi qua nút của bạn được quy đổi thành **token MBP** (phút trực tuyến × 0,05 + số Token chia sẻ × 2 + yêu cầu đã phục vụ × 0,1 + tốc độ phản hồi × 0,5). Khi tháng sau hạn mức cạn kiệt, bạn dùng số MBP đó để gọi Token do các peer khác chia sẻ. Không có máy chủ trung tâm nào can thiệp, và API key luôn ở trên máy của bạn.

- **Provision / Share**: đăng ký API key của gói đăng ký và các mô hình muốn chia sẻ. Mạng sẽ biết peerId của bạn.
- **Consume / Drive**: bật proxy HTTP cục bộ tương thích OpenAI tại `http://127.0.0.1:18100`; trỏ bất kỳ ứng dụng tương thích nào vào đó; yêu cầu được chuyển tiếp qua P2P đến peer thực sự giữ Token.
- **Wallet**: mỗi lần chia sẻ hoặc gọi đều tích lũy token MBP. Tab Trang chính và trang Wallet hiển thị số dư, phân tích và công thức theo thời gian thực. Hiện MBP chỉ mang tính kế toán; các phiên bản tương lai sẽ dùng cho uy tín, khuyến khích và định tuyến ưu tiên.
- **Không cần thiết lập**: lần khởi động đầu tiên lấy nút seed từ endpoint chính thức (hoặc bản mock cục bộ), rồi hoạt động hoàn toàn ở chế độ P2P.

---

## Tính năng chính <a id="features"></a>

| Tính năng | Ghi chú |
|---|---|
| **Vận chuyển P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Tin cậy phi tập trung** | 4 peerId seed được mã hoá cứng làm neo tin cậy; peer mới tham gia qua chuỗi tin cậy (cột mốc tiếp theo) |
| **Dự phòng khởi động nguội** | Lần chạy đầu lấy nút từ endpoint HTTPS chính thức hoặc bản mock cục bộ; tất cả nằm trong `<userData>/bootstrap-cache.json` |
| **Định tuyến nhiều nhà cung cấp** | Một peer có thể chứa OpenAI + Anthropic + Google cùng lúc; người gọi định tuyến theo `model.id` |
| **Proxy tương thích OpenAI** | Proxy HTTP cục bộ tại `:18100`; mọi ứng dụng tương thích OpenAI/Anthropic chạy ngay |
| **Xác thực API key (tuỳ chọn)** | Đặt một khoá cố định trong proxy tiêu thụ; người gọi phải gửi `Authorization: Bearer <key>` |
| **22 ngôn ngữ** | Tiếng Việt mặc định; hỗ trợ tiếng Ả Rập RTL |
| **Giao diện sáng mặc định** | Chuyển sang tối / theo hệ điều hành |

---

## Ảnh chụp màn hình <a id="screenshots"></a>

<p align="center"><img src="../docs/image/home.png" alt="Home / 首页" width="640"/></p>

<p align="center"><img src="../docs/image/model.png" alt="Models / 模型" width="640"/></p>

<p align="center"><img src="../docs/image/wallet.png" alt="Wallet / 钱包" width="640"/></p>

<p align="center"><img src="../docs/image/log.png" alt="Logs / 日志" width="640"/></p>

<p align="center"><img src="../docs/image/setting.png" alt="Settings / 设置" width="640"/></p>


---

## Kiến trúc <a id="architecture"></a>

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
│              ├─ providers   (bộ nhớ đệm models.dev)            │
│              ├─ registry    (API chính thức + dự phòng cache)  │
│              ├─ p2p         (daemon libp2p)                    │
│              ├─ provisioner (bộ định tuyến nhiều nhà cung cấp) │
│              ├─ proxy-server (HTTP tương thích OpenAI)         │
│              ├─ upstream    (gọi API thật)                     │
│              ├─ wallet      (tính điểm MBP)                    │
│              └─ models      (tổng hợp danh mục)                │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   Mạng P2P        │
              └──────────────────┘
```

```bash
# Thông báo nút v2 — xem phần tiếp theo
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Proxy tiêu thụ cục bộ
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Thiết kế phi tập trung <a id="decentralised"></a>

Bốn peerId seed được nhúng vào tệp nhị phân (`src/main/config/trusted-roots.ts`). Luồng khởi động nguội:

1. Bộ nhớ đệm cục bộ trống ở lần chạy đầu
2. Lấy song song: endpoint HTTPS chính thức + `bootstrapMultiaddrs` đã cấu hình + mDNS
3. Xác thực từng peerId với `TRUSTED_ROOT_PEER_IDS`
4. Lưu tập con đã xác thực vào `<userData>/bootstrap-cache.json`
5. Daemon P2P khởi động; cache trúng giữ ở chế độ P2P; trượt thì thử lại endpoint chính thức mỗi giờ

```
4 gốc nhúng  ←  neo tin cậy
└─ từ cache của endpoint chính thức
   ├─ kết nối trực tiếp qua bootstrapMultiaddrs
   ├─ mDNS (dò tìm LAN)
   └─ libp2p DHT findProviders (P2P thuần)
```

Endpoint chính thức được giữ **mãi mãi** làm kênh cứu hộ, ngay cả khi mạng P2P hoạt động tốt.

---

## Định dạng thông báo nút (v2) <a id="schema"></a>

Yêu cầu: `<https://modelbus.cc/api/v1/nodes>` trả về `Array<NodeAnnouncement>`:

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

Các trường:

- **version** `2`: phiên bản schema; +1 với thay đổi phá vỡ
- **peerId**: libp2p PeerId, duy nhất toàn cầu
- **nickname**: tên dễ đọc
- **providers[]**: nhà cung cấp LLM mà peer này lưu trữ
  - **providerId**: id nhà cung cấp trong models.dev
  - **providerName**: tên hiển thị
  - **models[]**: mô hình thuộc nhà cung cấp này; mỗi mô hình có `id` (chuẩn) và `name` (hiển thị)
- **addr**: địa chỉ chính duy nhất có thể truy cập (số ít)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: mili giây Unix của lần cập nhật cuối
- **expiresAt**: TTL mềm; mục hết hạn vẫn dùng được nhưng trọng số thấp hơn

4 mục cuối trong `mock/nodes.json` là peer seed tin cậy; peerId của chúng khớp với `trusted-roots.ts`.

---

## Luồng yêu cầu <a id="flow"></a>

**Provision** (bạn = người giữ Token): Cài đặt → Chia sẻ Token → chọn nhà cung cấp, dán API key, đánh dấu mô hình → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (bạn = người dùng Token): chọn peer tin cậy trong tab Mô hình → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → một POST đến → trích `body.model` → quay số peer → ghi `InferenceRequest` (JSON + tiền tố độ dài) → chờ `InferenceResponse` → ghi phản hồi HTTP.

**Định tuyến yêu cầu** (phía peer được gọi `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ khớp: cấu hình nhà cung cấp openai
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ gọi thật, trả về phản hồi
  └─ không khớp: 400 + { error: "model X is not hosted by this peer" }
```

---

## Tải về và sử dụng (sắp ra mắt) <a id="download"></a>

> 📦 Bộ cài chính thức (gói Windows / macOS / Linux, và sau đó mobile và Web SDK) đang được chuẩn bị.

**Để dùng ngay: build từ mã nguồn**

```bash
pnpm install
pnpm run dev          # chế độ phát triển (Electron + Vite HMR)
pnpm run package:mac  # dmg cho macOS
pnpm run package:win  # nsis cho Windows
pnpm run package:linux # AppImage cho Linux
```

Sản phẩm nằm trong `release/`.

**Kênh phân phối (dự kiến)**: trang tải chính thức · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Tên miền chính thức luôn là endpoint cứu hộ.

---

## Bắt đầu nhanh <a id="quickstart"></a>

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

Lần chạy đầu tiên ứng dụng mặc định trỏ tới `mock/nodes.json`, nhờ vậy toàn bộ luồng hoạt động không cần mạng. Chi tiết xem [README.md](../README.md) chính và thư mục [docs/](../docs/).

---

## Lộ trình <a id="roadmap"></a>

- ✅ v1: đa nhà cung cấp, khởi động nguội chính thức, neo tin cậy, chuyển tiếp P2P, 22 ngôn ngữ, khung Ví
- 🔜 v2: chuỗi tin cậy (trustChain) — sổ mời ký bằng Ed25519
- 🔜 v3: đánh giá chất lượng nút bằng chỉ số thực (độ trễ, tỷ lệ lỗi, thời gian hoạt động)
- 🔜 v4: vòng lặp kinh tế token — MBP dẫn dắt định tuyến ưu tiên, tăng tốc khởi động nguội và khám phá nút
- 🔜 v5: peer di động
- 🔜 v6: SDK web — `<modelbus>` trong trình duyệt

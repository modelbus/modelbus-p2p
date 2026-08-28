<!-- auto-generated README for tr-TR; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : Merkezi Olmayan LLM Token Paylaşım Platformu
</h1>
<p align="center" style="font-weight: bold;">
  Belki de dünyanın ilk platformu: herkes Token'ını bir P2P ağına bağlayabilir ve karşılığında diğer eşlerin paylaştığı Token'ları kullanabilir. Merkezi sunucu yok, hesap yok, API anahtarı makinenizden asla çıkmaz.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P hâlâ geliştirme ve herkese açık test aşamasında.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.en-US.md) · [简体中文](../README.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## İçindekiler

- [Nedir](#nedir)
- [Temel özellikler](#temel-zellikler)
- [Ekran görüntüleri](#ekran-grntleri)
- [Mimari](#mimari)
- [Merkeziyetsiz tasarım](#merkeziyetsiz-tasarm)
- [Düğüm duyuru biçimi (v2)](#dm-duyuru-biimi-v2)
- [İstek akışı](#istek-ak)
- [İndirme ve kullanım (yakında)](#indirme-ve-kullanm-yaknda)
- [Hızlı başlangıç](#hzl-balang)
- [Yol haritası](#yol-haritas)

---

## Nedir

ModelBus-P2P, [js-libp2p](https://github.com/libp2p/js-libp2p) ve Electron üzerine kurulu bir masaüstü istemcisidir. Neredeyse herkesin yaşadığı sorunu çözer: **bu ay artıyor, gelecek ay yetmiyor.**

> Senaryo: OpenAI veya Claude'a ödeme yapıyorsunuz ve aylık kotanızı nadiren tüketiyorsunuz. Sona ermesine izin vermek yerine P2P ağına bağlayın. Düğümünüzden geçen her istek **MBP tokenına** dönüştürülür (çevrimiçi dakika × 0,05 + paylaşılan Token sayısı × 2 + sunulan istekler × 0,1 + yanıt hızı × 0,5). Gelecek ay kota azaldığında, diğer eşlerin paylaştığı Token'ları çağırmak için bu MBP'leri harcarsınız. Hiçbir merkezi sunucu araya girmez ve API anahtarınız makinenizde kalır.

- **Provision / Share**: abonelik anahtarınızı ve paylaşmak istediğiniz modelleri kaydedin. Ağ peerId'nizi öğrenir.
- **Consume / Drive**: `http://127.0.0.1:18100` adresinde OpenAI uyumlu yerel bir HTTP proxy başlatın; herhangi bir uyumlu istemciyi oraya yönlendirin; istekler P2P üzerinden Token'ı gerçekten tutan eşe iletilir.
- **Wallet**: her paylaşım veya çağrı MBP tokenı biriktirir. Ana Sayfa sekmesi ve Wallet sayfası bakiyeyi, dökümü ve formülü gerçek zamanlı gösterir. MBP şimdilik sadece muhasebe amaçlı; gelecek sürümler itibar, teşvikler ve öncelikli yönlendirme için kullanacak.
- **Kayıt gerekmez**: ilk başlatma resmi uç noktadan (veya yerel bir mock'tan) tohum düğümlerini çeker ve sonra tamamen P2P modunda çalışır.

---

## Temel özellikler

| Özellik | Notlar |
|---|---|
| **P2P aktarım** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Merkeziyetsiz güven** | 4 sabit kodlu tohum eş kimliği güven çapası; yeni eşler güven zinciriyle katılır (sonraki kilometre taşı) |
| **Soğuk başlangıç yedeği** | İlk başlatma resmi HTTPS uç noktasından veya yerel mock'tan düğümleri çeker; her şey `<userData>/bootstrap-cache.json` içine düşer |
| **Çoklu sağlayıcı yönlendirme** | Bir eş aynı anda OpenAI + Anthropic + Google barındırabilir; çağıranlar `model.id` ile yönlendirir |
| **OpenAI uyumlu proxy** | `:18100` üzerinde yerel HTTP proxy; uyumlu her istemci kutudan çıktığı gibi çalışır |
| **API anahtarı kimliği (isteğe bağlı)** | Tüketim proxy'sinde sabit bir anahtar belirleyin; çağıranlar `Authorization: Bearer <key>` göndermeli |
| **22 dil** | Varsayılan Türkçe; RTL Arapça destekli |
| **Açık varsayılan tema** | Karanlık / işletim sistemini izle olarak değiştirilebilir |

---

## Ekran görüntüleri

Ana Sayfa, Modeller, Wallet, Günlükler, Ayarlar — toplam beş görünüm. Tam çözünürlüklü görüntüler [docs/image/](../docs/image/) altındadır.

---

## Mimari

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
│              ├─ providers   (models.dev önbelleği)              │
│              ├─ registry    (resmi API + önbellek yedeği)      │
│              ├─ p2p         (libp2p daemon)                     │
│              ├─ provisioner (çoklu sağlayıcı yönlendirici)     │
│              ├─ proxy-server (OpenAI uyumlu HTTP)              │
│              ├─ upstream    (gerçek sağlayıcı API çağrıları)  │
│              ├─ wallet      (MBP puan hesaplama)                │
│              └─ models      (katalog toplayıcı)                │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   P2P Ağı         │
              └──────────────────┘
```

```bash
# Düğüm duyurusu v2 — sonraki bölüme bakın
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Yerel tüketim proxy'si
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Merkeziyetsiz tasarım

Dört tohum eş kimliği ikili dosyaya gömülüdür (`src/main/config/trusted-roots.ts`). Soğuk başlangıç akışı:

1. İlk başlatmada yerel önbellek boştur
2. Paralel çek: resmi HTTPS uç noktası + kullanıcının yapılandırdığı `bootstrapMultiaddrs` + mDNS
3. Her peerId'yi `TRUSTED_ROOT_PEER_IDS` ile doğrula
4. Doğrulanmış alt kümeyi `<userData>/bootstrap-cache.json` içine kaydet
5. P2P daemon başlar; önbellek isabetleri P2P modunda kalır; ıskalamalar her saat resmi uç noktayı yeniden dener

```
4 sabit kök  ←  güven çapaları
└─ resmi uç noktadan önbelleklenmiş
   ├─ bootstrapMultiaddrs üzerinden doğrudan bağlantı
   ├─ mDNS (LAN keşfi)
   └─ libp2p DHT findProviders (saf P2P)
```

Resmi uç nokta, P2P ağı sağlıklı olsa bile **sonsuza dek** kurtarma kanalı olarak korunur.

---

## Düğüm duyuru biçimi (v2)

İstek: `<https://modelbus.cc/api/v1/nodes>` `Array<NodeAnnouncement>` döndürür:

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

Alanlar:

- **version** `2`: şema sürümü; kırıcı değişikliklerde +1
- **peerId**: libp2p PeerId, küresel olarak benzersiz
- **nickname**: okunabilir ad
- **providers[]**: bu eşin barındırdığı LLM sağlayıcıları
  - **providerId**: models.dev'deki sağlayıcı kimliği
  - **providerName**: görüntülenen ad
  - **models[]**: bu sağlayıcı altındaki modeller; her birinin `id` (kanonik) ve `name` (görüntü) değeri var
- **addr**: tek birincil erişilebilir adres (çoğul değil)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: son güncellemenin Unix ms değeri
- **expiresAt**: yumuşak TTL; süresi dolmuş kayıtlar hâlâ kullanılabilir ama daha düşük ağırlıklı

`mock/nodes.json` içindeki son 4 kayıt güvenilir tohum eşlerdir; peerId'leri `trusted-roots.ts` ile eşleşir.

---

## İstek akışı

**Provision** (siz = Token sahibi): Ayarlar → Token paylaşımı → sağlayıcı seç, API anahtarını yapıştır, modelleri işaretle → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (siz = Token tüketicisi): Modeller sekmesinde güvenilir bir eş seç → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → HTTP POST gelir → `body.model` çıkar → eşi ara → `InferenceRequest` (JSON + uzunluk öneki) yaz → `InferenceResponse`'ı bloklayarak bekle → HTTP yanıtını yaz.

**İstek yönlendirme** (çağrılan eşte `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ eşleşme: openai sağlayıcı yapılandırması
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ gerçek çağrı, yanıtı döndür
  └─ eşleşme yok: 400 + { error: "model X is not hosted by this peer" }
```

---

## İndirme ve kullanım (yakında)

> 📦 Resmi yükleyiciler (Windows / macOS / Linux paketleri, sonra mobil ve Web SDK) hazırlanıyor.

**Hemen kullanmak için: kaynaktan derleyin**

```bash
pnpm install
pnpm run dev          # geliştirme modu (Electron + Vite HMR)
pnpm run package:mac  # macOS dmg
pnpm run package:win  # Windows nsis
pnpm run package:linux # Linux AppImage
```

Çıktılar `release/` içine düşer.

**Dağıtım kanalları (planlanan)**: resmi indirme sayfası · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Resmi alan adı kalıcı kurtarma uç noktası olarak kalır.

---

## Hızlı başlangıç

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

İlk başlatmada uygulama varsayılan olarak `mock/nodes.json`'a işaret eder, bu yüzden tüm akış ağ olmadan çalışır. Ayrıntı için ana [README.md](../README.md) ve [docs/](../docs/) klasörüne bakın.

---

## Yol haritası

- ✅ v1: çoklu sağlayıcı, resmi soğuk başlangıç, güven çapaları, P2P iletimi, 22 dil, Wallet iskeleti
- 🔜 v2: güven zinciri (trustChain) — Ed25519 imzalı davet defteri
- 🔜 v3: gerçek ölçümlere dayalı düğüm kalite değerlendirmesi (gecikme, hata oranı, çalışma süresi)
- 🔜 v4: token ekonomisi döngüsü — MBP öncelikli yönlendirmeyi, soğuk başlangıç desteğini ve düğüm keşfini sürer
- 🔜 v5: mobil eşler
- 🔜 v6: Web SDK — tarayıcıda `<modelbus>`

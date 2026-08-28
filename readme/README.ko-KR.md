<!-- auto-generated README for ko-KR; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : 탈중앙 LLM Token 공유 플랫폼
</h1>
<p align="center" style="font-weight: bold;">
  아마도 세계 최초, 누구나 자신의 Token을 P2P 네트워크에 연결하고 다른 피어가 공유한 Token을 사용할 수 있는 플랫폼. 중앙 서버 없이, 계정 등록 없이, API 키가 당신의 컴퓨터 밖으로 나가지 않습니다.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P는 아직 개발 및 공개 테스트 단계입니다.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## 목차

- [이것은 무엇인가](#-)
- [핵심 기능](#-)
- [화면 미리보기](#-)
- [아키텍처](#)
- [탈중앙 설계](#-)
- [노드 공지 포맷 (v2)](#-v2)
- [요청 흐름](#-)
- [다운로드 및 사용 (출시 예정)](#-)
- [빠른 시작](#-)
- [로드맵](#)

---

## 이것은 무엇인가

ModelBus-P2P는 [js-libp2p](https://github.com/libp2p/js-libp2p)와 Electron 기반의 데스크톱 클라이언트로, 누구나 한 번쯤 겪는 **이번 달엔 남고 다음 달엔 부족한** 문제를 해결합니다.

> 시나리오: OpenAI나 Claude를 구독해도 월간 한도를 다 쓰지 못하는 경우가 많습니다. 말일에 사라지기 전에 P2P 네트워크에 연결하세요. 노드를 통과한 모든 요청은 **MBP 토큰**(온라인 분 × 0.05 ＋ 공유 Token 수 × 2 ＋ 처리 요청 수 × 0.1 ＋ 응답 속도 × 0.5)으로 환산됩니다. 다음 달에 한도가 모자라면 그 MBP로 다른 피어의 공유 Token을 호출할 수 있습니다. 모든 과정은 중앙 서버 없이 진행되며, API 키는 항상 당신의 컴퓨터에 머뭅니다.

- **Provision / Share**: 구독 API 키와 공유할 모델을 등록. 네트워크에 peerId 공개.
- **Consume / Drive**: 로컬에 OpenAI 호환 HTTP 프록시(`http://127.0.0.1:18100`)를 띄우고 base_url을 거기로 지정. 요청은 P2P를 통해 실제 Token 보유자에게 전달됨.
- **Wallet**: 공유든 호출이든 모두 MBP 토큰으로 환산. 홈 탭과 Wallet 화면에서 잔액·내역·공식을 실시간 표시.
- **온보딩 불필요**: 첫 실행 시 공식 엔드포인트(또는 로컬 mock)에서 시드 피어를 가져오고, 이후 완전한 P2P 모드로 동작.

---

## 핵심 기능

| 기능 | 설명 |
|---|---|
| **P2P 트랜스포트** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT 통과 + Kademlia DHT + AutoNAT |
| **탈중앙 신뢰** | 하드코드된 시드 피어 4개가 신뢰 앵커. 신규 피어는 신뢰 체인(다음 마일스톤)으로 합류 |
| **콜드 스타트 보강** | 첫 실행 시 공식 HTTPS 엔드포인트(또는 로컬 mock)에서 노드를 가져오고, 이후 `<userData>/bootstrap-cache.json`에 캐시 |
| **다중 Provider 라우팅** | 한 피어가 OpenAI + Anthropic + Google 키를 동시에 보유 가능. 호출 측은 `model.id`로 자동 라우팅 |
| **OpenAI 호환 프록시** | 로컬 HTTP 프록시(기본 `:18100`). OpenAI / Anthropic 호환 클라이언트가 그대로 사용 가능 |
| **API 키 인증(선택)** | 컨슈머 측에서 고정 키를 설정하고, 호출 측이 `Authorization: Bearer <key>` 헤더로 전달 |
| **22개 언어** | 기본은 한국어. RTL 아랍어 지원 |
| **라이트 모드 기본 테마** | 다크 모드 / OS 추종으로 전환 가능 |

---

## 화면 미리보기

홈, 모델, 월렛, 로그, 설정 — 총 5개 화면. 전체 해상도 스크린샷은 [docs/image/](../docs/image/) 폴더에 있습니다.

---

## 아키텍처

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
│              ├─ registry    (공식 API + 캐시 폴백)            │
│              ├─ p2p         (libp2p 데몬)                       │
│              ├─ provisioner (다중 Provider 라우터)              │
│              ├─ proxy-server (OpenAI 호환 HTTP)                 │
│              ├─ upstream    (실제 provider API 호출)          │
│              ├─ wallet      (MBP 점수 계산)                      │
│              └─ models      (카탈로그 통합)                       │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   P2P 네트워크     │
              └──────────────────┘
```

```bash
# 노드 공지 포맷 (v2) — 아래 섹션 참조
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# 컨슈머 측 로컬 HTTP 프록시
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## 탈중앙 설계

바이너리에 시드 피어 ID 4개가 하드코드되어 있습니다(`src/main/config/trusted-roots.ts`). 콜드 스타트 흐름:

1. 첫 실행 시 로컬 캐시가 비어 있음
2. 동시 수집: 공식 HTTPS 엔드포인트 + 사용자가 설정한 `bootstrapMultiaddrs` + mDNS
3. 모든 peerId를 `TRUSTED_ROOT_PEER_IDS`와 대조하여 검증
4. 검증된 서브셋을 `<userData>/bootstrap-cache.json`에 영구 저장
5. P2P 데몬 시작. 캐시 적중 시 P2P 전용, 미적중 시 매시간 공식 엔드포인트를 백그라운드에서 재시도

```
하드코드된 4개의 루트  ←  신뢰 앵커
└─ 공식 엔드포인트에서 캐시
   ├─ bootstrapMultiaddrs로 직접 연결
   ├─ mDNS (LAN 디스커버리)
   └─ libp2p DHT findProviders (P2P 전용)
```

공식 엔드포인트는 **영구히** P2P 네트워크가 정상일 때도 구조 채널로 보존됩니다.

---

## 노드 공지 포맷 (v2)

요청: `<https://modelbus.cc/api/v1/nodes>` 는 `Array<NodeAnnouncement>` 를 반환합니다:

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

필드:

- **version** `2`: 스키마 버전. 호환을 깨는 변경 시 +1
- **peerId**: libp2p PeerId (전 세계 유일)
- **nickname**: 사람이 읽을 수 있는 이름
- **providers[]**: 해당 피어가 호스팅하는 LLM 공급자 목록
  - **providerId**: models.dev의 provider id
  - **providerName**: 표시 이름
  - **models[]**: 해당 공급자 하위에서 공유하는 모델. 각 항목은 `id`(정규 ID)와 `name`(표시명)을 가짐
- **addr**: 단일 주요 도달 주소(복수가 아닌 단수)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: 이 항목이 마지막으로 갱신된 Unix ms
- **expiresAt**: 부드러운 TTL. 만료된 항목도 사용 가능하나 가중치가 낮아짐

`mock/nodes.json`의 마지막 4개 항목은 신뢰할 수 있는 시드 피어이며, peerId는 `trusted-roots.ts`와 일치합니다.

---

## 요청 흐름

**Provision** (당신 = Token 보유자): 설정 → Token 공유 → 공급자 선택 → API 키 붙여넣기 → 모델 선택 → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (당신 = Token 소비자): 모델 탭에서 신뢰 피어 선택 → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → HTTP POST 수신 → `body.model` 추출 → 피어에 다이얼 → `InferenceRequest`(JSON + 길이 접두사) 송신 → `InferenceResponse`를 블로킹 수신 → HTTP 응답으로 기록.

**요청 라우팅**(피호출 측 `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ 일치: openai 공급자 설정
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ 실제 호출 후 응답 반환
  └─ 불일치: 400 + { error: "model X is not hosted by this peer" }
```

---

## 다운로드 및 사용 (출시 예정)

> 📦 공식 인스톨러(Windows / macOS / Linux 패키지, 추후 모바일·Web SDK)는 현재 준비 중입니다.

**지금 사용하려면: 소스에서 빌드**

```bash
pnpm install
pnpm run dev          # 개발 모드(Electron + Vite HMR)
pnpm run package:mac  # macOS dmg
pnpm run package:win  # Windows nsis
pnpm run package:linux # Linux AppImage
```

산출물은 `release/`에 위치합니다.

**배포 채널(예정)**: 공식 다운로드 페이지 · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. 공식 도메인은 영구히 구조 채널로 남습니다.

---

## 빠른 시작

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

첫 실행 시 앱은 기본적으로 `mock/nodes.json`을 가리키므로 네트워크 없이 전체 흐름을 체험할 수 있습니다. 자세한 내용은 메인 [README.md](../README.md) 및 [docs/](../docs/) 폴더를 참고하세요.

---

## 로드맵

- ✅ v1: 다중 Provider, 공식 콜드 스타트, 신뢰 앵커, P2P 포워딩, 22개 언어, 월렛 골격
- 🔜 v2: 신뢰 체인(trustChain) — Ed25519 서명 기반 초대 원장
- 🔜 v3: 실측 지표(지연·오류율·가동률) 기반 노드 품질 평가
- 🔜 v4: 토큰 경제 루프 — MBP가 우선 라우팅·콜드 스타트 부스트·노드 디스커버리를 구동
- 🔜 v5: 모바일 피어
- 🔜 v6: Web SDK — 브라우저용 `<modelbus>`

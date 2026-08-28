<!-- auto-generated README for pt-BR; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : Uma plataforma descentralizada de compartilhamento de tokens LLM
</h1>
<p align="center" style="font-weight: bold;">
  Provavelmente a primeira plataforma do mundo onde qualquer pessoa pode anexar seu Token a uma rede P2P e, em troca, usar os Tokens compartilhados por outros peers. Sem servidor central, sem cadastro, nenhuma chave API sai da sua máquina.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P ainda está em desenvolvimento e testes públicos.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## Índice

- [O que é](#o-que-)
- [Principais recursos](#principais-recursos)
- [Capturas de tela](#capturas-de-tela)
- [Arquitetura](#arquitetura)
- [Design descentralizado](#design-descentralizado)
- [Formato de anúncio de nó (v2)](#formato-de-anncio-de-n-v2)
- [Fluxo de requisição](#fluxo-de-requisio)
- [Download e uso (em breve)](#download-e-uso-em-breve)
- [Início rápido](#incio-rpido)
- [Roadmap](#roadmap)

---

## O que é

ModelBus-P2P é um cliente desktop construído sobre [js-libp2p](https://github.com/libp2p/js-libp2p) e Electron. Resolve um problema que quase todo mundo conhece: **este mês sobra, no próximo falta.**

> Cenário: você paga por OpenAI ou Claude e raramente gasta a cota mensal. Em vez de deixá-la expirar, conecte-a à rede P2P. Cada requisição que passa pelo seu nó é convertida em **tokens MBP** (minutos online × 0,05 + quantidade de Tokens compartilhados × 2 + requisições atendidas × 0,1 + velocidade de resposta × 0,5). Quando chegar o mês seguinte e a cota escassear, você gasta esses MBP para chamar os Tokens compartilhados por outros peers. Nenhum servidor central intervém, e a chave API permanece na sua máquina.

- **Provision / Share**: registre a chave API da sua assinatura e os modelos que quer compartilhar. A rede aprende seu peerId.
- **Consume / Drive**: suba um proxy HTTP local compatível com OpenAI em `http://127.0.0.1:18100`; aponte qualquer cliente compatível para lá; as requisições são encaminhadas via P2P ao peer que realmente guarda o Token.
- **Wallet**: cada compartilhamento ou chamada acumula tokens MBP. A aba Início e a página Wallet mostram saldo, detalhamento e fórmula em tempo real. MBP hoje é apenas contábil; versões futuras usarão para reputação, incentivos e roteamento prioritário.
- **Sem onboarding**: o primeiro lançamento busca nós semente do endpoint oficial (ou de um mock local) e depois opera totalmente em modo P2P.

---

## Principais recursos

| Recurso | Observações |
|---|---|
| **Transporte P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Confiança descentralizada** | 4 peerIds semente fixos como âncoras de confiança; novos peers entram via cadeia de confiança (próximo marco) |
| **Cold-start de reserva** | O primeiro lançamento busca nós no endpoint HTTPS oficial ou em um mock local; tudo vai para `<userData>/bootstrap-cache.json` |
| **Roteamento multi-provider** | Um peer pode hospedar OpenAI + Anthropic + Google ao mesmo tempo; os chamadores roteiam por `model.id` |
| **Proxy compatível com OpenAI** | Proxy HTTP local em `:18100`; qualquer cliente compatível com OpenAI/Anthropic funciona de imediato |
| **Auth por chave API (opcional)** | Fixe uma chave no proxy de consumo; os chamadores devem enviar `Authorization: Bearer <key>` |
| **22 idiomas** | Português (Brasil) por padrão; árabe RTL suportado |
| **Tema claro padrão** | Alternável para escuro / seguir o SO |

---

## Capturas de tela

Início, Modelos, Wallet, Registros, Configurações — cinco visualizações no total. Capturas em resolução cheia estão em [docs/image/](../docs/image/).

---

## Arquitetura

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
│              ├─ providers   (cache de models.dev)              │
│              ├─ registry    (API oficial + fallback de cache)  │
│              ├─ p2p         (daemon libp2p)                     │
│              ├─ provisioner (roteador multi-provider)          │
│              ├─ proxy-server (HTTP compatível com OpenAI)      │
│              ├─ upstream    (chamadas reais à API)             │
│              ├─ wallet      (cálculo de pontuação MBP)         │
│              └─ models      (agregador de catálogo)            │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   Rede P2P        │
              └──────────────────┘
```

```bash
# Anúncio de nó v2 — veja a próxima seção
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Proxy local de consumo
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Design descentralizado

Quatro peerIds semente estão gravados no binário (`src/main/config/trusted-roots.ts`). Fluxo de cold-start:

1. O cache local está vazio no primeiro lançamento
2. Busca paralela: endpoint HTTPS oficial + `bootstrapMultiaddrs` configurados + mDNS
3. Valide cada peerId contra `TRUSTED_ROOT_PEER_IDS`
4. Persista o subconjunto validado em `<userData>/bootstrap-cache.json`
5. O daemon P2P inicia; acertos de cache permanecem em modo P2P; falhas tentam o endpoint oficial de novo a cada hora

```
4 raízes fixas  ←  âncoras de confiança
└─ em cache do endpoint oficial
   ├─ conexão direta via bootstrapMultiaddrs
   ├─ mDNS (descoberta em LAN)
   └─ libp2p DHT findProviders (P2P puro)
```

O endpoint oficial é mantido **para sempre** como canal de resgate, mesmo quando a rede P2P está saudável.

---

## Formato de anúncio de nó (v2)

Requisição: `<https://modelbus.cc/api/v1/nodes>` retorna `Array<NodeAnnouncement>`:

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

Campos:

- **version** `2`: versão do esquema; +1 em mudanças que quebram
- **peerId**: libp2p PeerId, globalmente único
- **nickname**: nome legível
- **providers[]**: provedores LLM que este peer hospeda
  - **providerId**: id do provedor em models.dev
  - **providerName**: nome de exibição
  - **models[]**: modelos sob este provedor; cada um tem `id` (canônico) e `name` (exibido)
- **addr**: único endereço principal alcançável (singular)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: Unix ms da última atualização
- **expiresAt**: TTL suave; entradas expiradas ainda são úteis com peso menor

As 4 últimas entradas em `mock/nodes.json` são os peers semente de confiança; seus peerIds correspondem a `trusted-roots.ts`.

---

## Fluxo de requisição

**Provision** (você = detentor do Token): Configurações → Compartilhar Token → escolha o provedor, cole a chave API, marque os modelos → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (você = consumidor do Token): escolha um peer de confiança na aba Modelos → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → um POST chega → extraia `body.model` → disque o peer → escreva `InferenceRequest` (JSON + prefixo de comprimento) → aguarde `InferenceResponse` → escreva a resposta HTTP.

**Roteamento da requisição** (no peer chamado `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ match: configuração do provedor openai
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ chamada real, retorna resposta
  └─ sem match: 400 + { error: "model X is not hosted by this peer" }
```

---

## Download e uso (em breve)

> 📦 Instaladores oficiais (pacotes Windows / macOS / Linux, e mais tarde mobile e Web SDK) estão sendo preparados.

**Para usar agora: compile a partir do código-fonte**

```bash
pnpm install
pnpm run dev          # modo de desenvolvimento (Electron + Vite HMR)
pnpm run package:mac  # dmg para macOS
pnpm run package:win  # nsis para Windows
pnpm run package:linux # AppImage para Linux
```

Os artefatos vão para `release/`.

**Canais de distribuição (previstos)**: página oficial de downloads · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. O domínio oficial permanece como endpoint de resgate.

---

## Início rápido

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

No primeiro lançamento o app aponta por padrão para `mock/nodes.json`, então todo o fluxo funciona sem rede. Para detalhes veja o [README.md](../README.md) principal e a pasta [docs/](../docs/).

---

## Roadmap

- ✅ v1: multi-provedor, cold-start oficial, âncoras de confiança, encaminhamento P2P, 22 idiomas, esqueleto do Wallet
- 🔜 v2: cadeia de confiança (trustChain) — livro de convites assinado por Ed25519
- 🔜 v3: avaliação de qualidade do nó por métricas reais (latência, taxa de erro, uptime)
- 🔜 v4: ciclo econômico de tokens — MBP guia roteamento prioritário, boost de cold-start e descoberta de nós
- 🔜 v5: peers móveis
- 🔜 v6: SDK web — `<modelbus>` no navegador

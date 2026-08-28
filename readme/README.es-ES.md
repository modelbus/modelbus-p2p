<!-- auto-generated README for es-ES; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : Una plataforma descentralizada de tokens LLM
</h1>
<p align="center" style="font-weight: bold;">
  Posiblemente la primera plataforma del mundo donde cualquiera puede conectar su Token a una red P2P y, a cambio, usar los Tokens compartidos por otros pares. Sin servidor central, sin cuenta, ninguna clave API sale jamás de tu equipo.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P sigue en desarrollo y en pruebas públicas.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.en-US.md) · [简体中文](../README.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## Índice

- [¿Qué es?](#what)
- [Características principales](#features)
- [Capturas](#screenshots)
- [Arquitectura](#architecture)
- [Diseño descentralizado](#decentralised)
- [Esquema de anuncio de nodo (v2)](#schema)
- [Flujo de petición](#flow)
- [Descarga y uso (próximamente)](#download)
- [Inicio rápido](#quickstart)
- [Hoja de ruta](#roadmap)

---

## ¿Qué es? <a id="what"></a>

ModelBus-P2P es un cliente de escritorio construido sobre [js-libp2p](https://github.com/libp2p/js-libp2p) y Electron. Resuelve un problema que casi todos tenemos: **este mes me sobra, el que viene me falta**.

> Escenario: pagas OpenAI o Claude y rara vez agotas el cupo mensual. En lugar de que caduque, cuélgalo en la red P2P. Cada petición que pase por tu nodo se convierte en **tokens MBP** (minutos en línea × 0,05 + número de Tokens compartidos × 2 + peticioneses servidas × 0,1 + velocidad de respuesta × 0,5). Cuando llegue el mes siguiente y tu cupo escasee, gastas esos MBP para invocar Tokens compartidos por otros pares. En ningún momento interviene un servidor central y la clave API permanece en tu equipo.

- **Provision / Share**: registra la clave API de tu suscripción y los modelos que quieras compartir. La red aprende tu peerId.
- **Consume / Drive**: arranca un proxy HTTP local compatible con OpenAI en `http://127.0.0.1:18100`; cualquier cliente compatible lo apunta ahí y las peticiones se reenvían por P2P al par que realmente guarda el Token.
- **Wallet**: cada compartición o llamada genera tokens MBP. La pestaña Inicio y la página Wallet muestran saldo, desglose y fórmula en tiempo real. MBP hoy solo lleva contabilidad; futuras versiones lo usarán para reputación, incentivos y enrutado prioritario.
- **Sin onboarding**: el primer arranque descarga nodos semilla del endpoint oficial (o de un mock local) y a partir de ahí opera completamente en modo P2P.

---

## Características principales <a id="features"></a>

| Característica | Notas |
|---|---|
| **Transporte P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Confianza descentralizada** | 4 peerIds semilla hardcodeados como anclas de confianza; los nuevos pares entran por cadena de confianza (siguiente hito) |
| **Cold-start de respaldo** | El primer arranque obtiene nodos del endpoint HTTPS oficial o de un mock local; todo aterriza en `<userData>/bootstrap-cache.json` |
| **Enrutado multi-provider** | Un par puede hospedar OpenAI + Anthropic + Google a la vez; los llamadores enrutan por `model.id` |
| **Proxy compatible con OpenAI** | Proxy HTTP local en `:18100`; cualquier cliente OpenAI/Anthropic-compatible funciona de fábrica |
| **Auth por API key (opcional)** | Fija una clave en el proxy de consumo; los llamadores deben enviar `Authorization: Bearer <key>` |
| **22 idiomas** | Español por defecto; árabe RTL soportado |
| **Tema claro por defecto** | Conmutable a oscuro / seguir al SO |

---

## Capturas <a id="screenshots"></a>

<p align="center"><img src="../docs/image/home.png" alt="Home / 首页" width="640"/></p>

<p align="center"><img src="../docs/image/model.png" alt="Models / 模型" width="640"/></p>

<p align="center"><img src="../docs/image/wallet.png" alt="Wallet / 钱包" width="640"/></p>

<p align="center"><img src="../docs/image/log.png" alt="Logs / 日志" width="640"/></p>

<p align="center"><img src="../docs/image/setting.png" alt="Settings / 设置" width="640"/></p>


---

## Arquitectura <a id="architecture"></a>

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
│              ├─ registry    (API oficial + fallback de caché)  │
│              ├─ p2p         (daemon libp2p)                     │
│              ├─ provisioner (enrutador multi-provider)          │
│              ├─ proxy-server (HTTP compatible con OpenAI)      │
│              ├─ upstream    (llamadas reales al provider)      │
│              ├─ wallet      (cálculo de MBP)                     │
│              └─ models      (agregador de catálogo)            │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   Red P2P         │
              └──────────────────┘
```

```bash
# Anuncio de nodo v2 — ver sección siguiente
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

## Diseño descentralizado <a id="decentralised"></a>

Hay 4 peerIds semilla grabados en el binario (`src/main/config/trusted-roots.ts`). Flujo de arranque en frío:

1. La caché local está vacía al primer arranque
2. Captura en paralelo: endpoint HTTPS oficial + `bootstrapMultiaddrs` configurados + mDNS
3. Valida cada peerId contra `TRUSTED_ROOT_PEER_IDS`
4. Persiste el subconjunto validado en `<userData>/bootstrap-cache.json`
5. Arranca el daemon P2P; los aciertos de caché se quedan en modo P2P; los fallos reintentan el endpoint oficial cada hora

```
4 raíces hardcodeadas  ←  anclas de confianza
└─ cacheadas desde el endpoint oficial
   ├─ conexión directa vía bootstrapMultiaddrs
   ├─ mDNS (descubrimiento LAN)
   └─ libp2p DHT findProviders (P2P puro)
```

El endpoint oficial se conserva **siempre** como canal de rescate, incluso cuando la red P2P está sana.

---

## Esquema de anuncio de nodo (v2) <a id="schema"></a>

Petición: `<https://modelbus.cc/api/v1/nodes>` devuelve `Array<NodeAnnouncement>`:

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

- **version** `2` — versión de esquema; se incrementa ante cambios incompatibles
- **peerId** — libp2p PeerId, globalmente único
- **nickname** — nombre legible
- **providers[]** — proveedores LLM que este par aloja
  - **providerId** — id del proveedor en models.dev
  - **providerName** — nombre a mostrar
  - **models[]** — modelos bajo este proveedor; cada uno tiene `id` (canónico) y `name` (mostrado)
- **addr** — única dirección principal alcanzable (singular)
  - **kind** — `direct` / `relay` / `unknown`
  - **transport** — `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt** — Unix ms de la última actualización
- **expiresAt** — TTL blando; las entradas caducadas siguen usándose con menor peso

Los 4 últimos elementos de `mock/nodes.json` son los pares semilla de confianza; sus peerIds coinciden con `trusted-roots.ts`.

---

## Flujo de petición <a id="flow"></a>

**Provision** (tú = poseedor del Token): Ajustes → Compartir Token → elige proveedor, pega la clave API, marca modelos → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (tú = consumidor del Token): elige un par de confianza en la pestaña Modelos → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → llega un HTTP POST → extrae `body.model` → marca al par → escribe `InferenceRequest` (JSON con prefijo de longitud) → espera `InferenceResponse` → escribe la respuesta HTTP.

**Enrutado de la petición** (en el lado del par llamado, `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ coincide: configuración del proveedor openai
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ llama y devuelve la respuesta
  └─ no coincide: 400 + { error: "model X is not hosted by this peer" }
```

---

## Descarga y uso (próximamente) <a id="download"></a>

> 📦 Los instaladores oficiales (paquetes Windows / macOS / Linux, y más adelante mobile y Web SDK) están en preparación.

**Para usarlo ya: compila desde el código fuente**

```bash
pnpm install
pnpm run dev          # modo desarrollo (Electron + Vite HMR)
pnpm run package:mac  # dmg para macOS
pnpm run package:win  # nsis para Windows
pnpm run package:linux # AppImage para Linux
```

Los artefactos quedan en `release/`.

**Canales de distribución (previstos)**: página oficial de descargas · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. El dominio oficial queda como canal de rescate permanente.

---

## Inicio rápido <a id="quickstart"></a>

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

Al arrancar por primera vez la app apunta por defecto a `mock/nodes.json`, de modo que todo el flujo funciona sin red. Para más detalles consulta el [README.md](../README.md) principal y la carpeta [docs/](../docs/).

---

## Hoja de ruta <a id="roadmap"></a>

- ✅ v1: multi-proveedor, arranque en frío oficial, raíces de confianza, reenvío P2P, 22 idiomas, andamiaje de Wallet
- 🔜 v2: cadena de confianza (trustChain) — libro de invitaciones firmado con Ed25519
- 🔜 v3: evaluación de calidad de nodo basada en métricas reales (latencia, tasa de error, uptime)
- 🔜 v4: bucle económico de tokens — MBP impulsa el enrutado prioritario, el arranque en frío y el descubrimiento
- 🔜 v5: pares móviles
- 🔜 v6: SDK web — `<modelbus>` en el navegador

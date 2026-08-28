<!-- auto-generated README for fr-FR; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : Une plateforme décentralisée de partage de tokens LLM
</h1>
<p align="center" style="font-weight: bold;">
  Probablement la première plateforme au monde où n'importe qui peut attacher son Token à un réseau P2P et, en retour, utiliser les Tokens partagés par d'autres pairs. Pas de serveur central, pas de compte, aucune clé API ne quitte jamais votre machine.
</p>

<p align="center">
  ⚠️ <strong>ModelBus-P2P est encore en développement et en tests publics.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Ελληνικά](README.el-GR.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## Sommaire

- [De quoi s'agit-il](#de-quoi-sagit-il)
- [Fonctionnalités principales](#fonctionnalits-principales)
- [Captures d'écran](#captures-dcran)
- [Architecture](#architecture)
- [Conception décentralisée](#conception-dcentralise)
- [Schéma d'annonce de nœud (v2)](#schma-dannonce-de-nud-v2)
- [Déroulement d'une requête](#droulement-dune-requte)
- [Téléchargement et utilisation (bientôt disponible)](#tlchargement-et-utilisation-bientt-disponible)
- [Démarrage rapide](#dmarrage-rapide)
- [Feuille de route](#feuille-de-route)

---

## De quoi s'agit-il

ModelBus-P2P est un client de bureau construit sur [js-libp2p](https://github.com/libp2p/js-libp2p) et Electron. Il résout un problème que presque tout le monde connaît : **ce mois-ci il me reste du quota, le mois prochain il m'en manquera**.

> Scénario : vous payez OpenAI ou Claude et épuisez rarement votre quota mensuel. Au lieu de le perdre, branchez-le au réseau P2P. Chaque requête qui transite par votre nœud est convertie en **tokens MBP** (minutes en ligne × 0,05 + nombre de Tokens partagés × 2 + requêtes servies × 0,1 + vitesse de réponse × 0,5). Le mois suivant, quand votre quota devient juste, vous dépensez ces MBP pour appeler les Tokens partagés par d'autres pairs. Aucun serveur central n'intervient, et votre clé API reste sur votre machine.

- **Provision / Share** : enregistrez la clé API de votre abonnement et les modèles que vous voulez partager. Le réseau apprend votre peerId.
- **Consume / Drive** : lancez un proxy HTTP local compatible OpenAI sur `http://127.0.0.1:18100`; pointez-y n'importe quel client compatible ; les requêtes sont relayées via P2P jusqu'au pair qui détient réellement le Token.
- **Wallet** : chaque partage ou appel génère des tokens MBP. L'onglet Accueil et la page Wallet affichent solde, détail et formule en temps réel. MBP reste comptable pour l'instant ; les versions futures s'en serviront pour la réputation, les incitations et le routage prioritaire.
- **Pas d'onboarding** : le premier lancement récupère des nœuds graines depuis l'endpoint officiel (ou un mock local), puis tourne entièrement en mode P2P.

---

## Fonctionnalités principales

| Fonctionnalité | Notes |
|---|---|
| **Transport P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Confiance décentralisée** | 4 peerIds graines codés en dur servent d'ancres ; les nouveaux pairs rejoignent via chaîne de confiance (prochain jalon) |
| **Démarrage à froid** | Le premier lancement récupère les nœuds depuis l'endpoint HTTPS officiel ou un mock local ; tout atterrit dans `<userData>/bootstrap-cache.json` |
| **Routage multi-provider** | Un pair peut héberger OpenAI + Anthropic + Google simultanément ; les appelants routent par `model.id` |
| **Proxy compatible OpenAI** | Proxy HTTP local sur `:18100` ; tout client compatible OpenAI/Anthropic fonctionne immédiatement |
| **Auth par clé API (optionnel)** | Fixez une clé sur le proxy de consommation ; les appelants doivent envoyer `Authorization: Bearer <key>` |
| **22 langues** | Français par défaut ; arabe RTL pris en charge |
| **Thème clair par défaut** | Basculable en sombre / suivre le système |

---

## Captures d'écran

Accueil, Modèles, Wallet, Journaux, Paramètres — cinq vues au total. Les captures pleine résolution sont dans [docs/image/](../docs/image/).

---

## Architecture

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
│              ├─ providers   (cache models.dev)                 │
│              ├─ registry    (API officielle + repli cache)     │
│              ├─ p2p         (daemon libp2p)                     │
│              ├─ provisioner (routeur multi-provider)           │
│              ├─ proxy-server (HTTP compatible OpenAI)          │
│              ├─ upstream    (appels API réels)                 │
│              ├─ wallet      (calcul du score MBP)               │
│              └─ models      (agrégateur de catalogue)            │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   Réseau P2P      │
              └──────────────────┘
```

```bash
# Annonce de nœud v2 — voir section suivante
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Proxy local de consommation
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Conception décentralisée

Quatre peerIds graines sont gravés dans le binaire (`src/main/config/trusted-roots.ts`). Flux de démarrage à froid :

1. Le cache local est vide au premier lancement
2. Récupération en parallèle : endpoint HTTPS officiel + `bootstrapMultiaddrs` configurés + mDNS
3. Validation de chaque peerId contre `TRUSTED_ROOT_PEER_IDS`
4. Persistance du sous-ensemble validé dans `<userData>/bootstrap-cache.json`
5. Démarrage du daemon P2P ; les succès de cache restent en P2P ; les échecs ré-essaient l'endpoint officiel toutes les heures

```
4 racines codées en dur  ←  ancres de confiance
└─ mises en cache depuis l'endpoint officiel
   ├─ connexion directe via bootstrapMultiaddrs
   ├─ mDNS (découverte LAN)
   └─ libp2p DHT findProviders (P2P pur)
```

L'endpoint officiel est conservé **durablement** comme canal de secours, même quand le réseau P2P est sain.

---

## Schéma d'annonce de nœud (v2)

Requête : `<https://modelbus.cc/api/v1/nodes>` renvoie `Array<NodeAnnouncement>` :

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

Champs :

- **version** `2` : version de schéma, +1 à chaque changement cassant
- **peerId** : libp2p PeerId, globalement unique
- **nickname** : nom lisible
- **providers[]** : fournisseurs LLM hébergés par ce pair
  - **providerId** : id du fournisseur dans models.dev
  - **providerName** : nom affiché
  - **models[]** : modèles sous ce fournisseur ; chacun a `id` (canonique) et `name` (affiché)
- **addr** : adresse principale unique joignable (singulier)
  - **kind** : `direct` / `relay` / `unknown`
  - **transport** : `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt** : Unix ms du dernier rafraîchissement
- **expiresAt** : TTL souple ; les entrées expirées restent utilisables avec un poids réduit

Les 4 dernières entrées de `mock/nodes.json` sont les pairs graines de confiance et leurs peerIds correspondent à `trusted-roots.ts`.

---

## Déroulement d'une requête

**Provision** (vous = détenteur du Token) : Paramètres → Partage de Token → choisissez un fournisseur, collez la clé API, cochez les modèles → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (vous = consommateur du Token) : choisissez un pair de confiance dans l'onglet Modèles → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → un POST HTTP arrive → on extrait `body.model` → on appelle le pair → on écrit `InferenceRequest` (JSON avec préfixe de longueur) → on attend bloquant `InferenceResponse` → on écrit la réponse HTTP.

**Routage côté appelé** (`ProvisionerService.handle`) :

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ match : configuration openai
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ appel réel, renvoie la réponse
  └─ pas de match : 400 + { error: "model X is not hosted by this peer" }
```

---

## Téléchargement et utilisation (bientôt disponible)

> 📦 Les installateurs officiels (Windows / macOS / Linux, et plus tard mobile et Web SDK) sont en cours de préparation.

**Pour l'utiliser dès maintenant : compiler depuis les sources**

```bash
pnpm install
pnpm run dev          # mode développement (Electron + Vite HMR)
pnpm run package:mac  # dmg macOS
pnpm run package:win  # nsis Windows
pnpm run package:linux # AppImage Linux
```

Les artefacts atterrissent dans `release/`.

**Canaux de distribution (prévus)** : page officielle de téléchargement · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Le domaine officiel reste durablement le point de secours.

---

## Démarrage rapide

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

Au premier lancement l'application pointe par défaut sur `mock/nodes.json`, donc le flux complet fonctionne sans réseau. Pour plus de détails voir le [README.md](../README.md) principal et le dossier [docs/](../docs/).

---

## Feuille de route

- ✅ v1 : multi-fournisseur, démarrage à froid officiel, racines de confiance, relayage P2P, 22 langues, ébauche de Wallet
- 🔜 v2 : chaîne de confiance (trustChain) — registre d'invitations signé Ed25519
- 🔜 v3 : évaluation de la qualité des nœuds sur métriques réelles (latence, taux d'erreur, uptime)
- 🔜 v4 : boucle économique de tokens — MBP pilote le routage prioritaire, le boost au démarrage à froid et la découverte de nœuds
- 🔜 v5 : pairs mobiles
- 🔜 v6 : SDK web — `<modelbus>` dans le navigateur

<!-- auto-generated README for el-GR; do not edit by hand. Edit scripts/gen-readme-i18n.mjs and re-run. -->
<p align="center">
  <img src="../docs/image/logo.png" alt="ModelBus" width="150px" height="auto"/>
</p>
<h1 align="center" style="font-weight: bold;">
  ModelBus-P2P : Μια αποκεντρωμένη πλατφόρμα κοινής χρήσης token LLM
</h1>
<p align="center" style="font-weight: bold;">
  Πιθανώς η πρώτη πλατφόρμα στον κόσμο όπου ο καθένας μπορεί να συνδέσει το Token του σε ένα δίκτυο P2P και, αντίστοιχα, να χρησιμοποιήσει τα Token που μοιράζονται άλλοι κόμβοι. Χωρίς κεντρικό διακομιστή, χωρίς λογαριασμό, κανένα κλειδί API δεν φεύγει ποτέ από το μηχάνημά σας.
</p>

<p align="center">
  ⚠️ <strong>Το ModelBus-P2P βρίσκεται ακόμη σε ανάπτυξη και δημόσιες δοκιμές.</strong>
</p>

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/) [![P2P](https://img.shields.io/badge/p2p-libp2p-5A0FA8.svg?logo=libp2p&logoColor=white)](https://github.com/libp2p/js-libp2p) [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![UI](https://img.shields.io/badge/UI-Vue_3-42B883.svg?logo=vuedotjs&logoColor=white)](https://vuejs.org/)



[English](README.en-US.md) · [简体中文](../README.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja-JP.md) · [한국어](README.ko-KR.md) · [Deutsch](README.de-DE.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md) · [Italiano](README.it-IT.md) · [Dansk](README.da-DK.md) · [Polski](README.pl-PL.md) · [Русский](README.ru-RU.md) · [Bosanski](README.bs-BA.md) · [العربية](README.ar-SA.md) · [Norsk](README.nb-NO.md) · [Português (Brasil)](README.pt-BR.md) · [ไทย](README.th-TH.md) · [Türkçe](README.tr-TR.md) · [Українська](README.uk-UA.md) · [বাংলা](README.bn-BD.md) · [Tiếng Việt](README.vi-VN.md)

</div>

---

## Περιεχόμενα

- [Τι είναι](#what)
- [Βασικές δυνατότητες](#features)
- [Στιγμιότυπα](#screenshots)
- [Αρχιτεκτονική](#architecture)
- [Αποκεντρωμένος σχεδιασμός](#decentralised)
- [Μορφή ανακοίνωσης κόμβου (v2)](#schema)
- [Ροή αιτήματος](#flow)
- [Λήψη και χρήση (σύντομα)](#download)
- [Γρήγορη εκκίνηση](#quickstart)
- [Οδικός χάρτης](#roadmap)

---

## Τι είναι <a id="what"></a>

Το ModelBus-P2P είναι ένας επιτραπέζιος πελάτης χτισμένος σε [js-libp2p](https://github.com/libp2p/js-libp2p) και Electron. Λύνει ένα πρόβλημα που όλοι γνωρίζουμε: **αυτόν τον μήνα περισσεύει, τον επόμενο δεν φτάνει.**

> Σενάριο: πληρώνετε OpenAI ή Claude και σπάνια εξαντλείτε το μηνιαίο όριο. Αντί να το αφήσετε να λήξει, συνδέστε το στο δίκτυο P2P. Κάθε αίτημα που περνά από τον κόμβο σας μετατρέπεται σε **token MBP** (λεπτά σύνδεσης × 0,05 + αριθμός μοιρασμένων Token × 2 + εξυπηρετηθέντα αιτήματα × 0,1 + ταχύτητα απόκρισης × 0,5). Όταν τον επόμενο μήνα το όριο στενέψει, ξοδεύετε αυτά τα MBP για να καλέσετε Token που μοιράζονται άλλοι κόμβοι. Κανένας κεντρικός διακομιστής δεν παρεμβαίνει και το κλειδί API μένει στο μηχάνημά σας.

- **Provision / Share**: καταχωρήστε το κλειδί API της συνδρομής σας και τα μοντέλα που θέλετε να μοιραστείτε. Το δίκτυο μαθαίνει το peerId σας.
- **Consume / Drive**: σηκώστε τοπικό HTTP proxy συμβατό με OpenAI στο `http://127.0.0.1:18100`; δείξτε εκεί οποιονδήποτε συμβατό πελάτη· τα αιτήματα προωθούνται μέσω P2P στον κόμβο που πραγματικά κρατά το Token.
- **Wallet**: κάθε κοινή χρήση ή κλήση συσσωρεύει token MBP. Η καρτέλα Αρχική και η σελίδα Wallet δείχνουν ισοζύγιο, ανάλυση και τύπο σε πραγματικό χρόνο. Το MBP προς το παρόν είναι λογιστικό· μελλοντικές εκδόσεις θα το χρησιμοποιήσουν για φήμη, κίνητρα και προτεραιότητα δρομολόγησης.
- **Χωρίς onboarding**: η πρώτη εκκίνηση φέρνει seed κόμβους από το επίσημο endpoint (ή τοπικό mock) και μετά λειτουργεί πλήρως σε λειτουργία P2P.

---

## Βασικές δυνατότητες <a id="features"></a>

| Δυνατότητα | Σημειώσεις |
|---|---|
| **Μεταφορά P2P** | TCP + WebSocket + Circuit Relay v2 + UPnP/NAT + Kademlia DHT + AutoNAT |
| **Αποκεντρωμένη εμπιστοσύνη** | 4 σκληρά κωδικοποιημένα seed peer-id ως άγκυρες εμπιστοσύνης· νέοι peers μπαίνουν μέσω αλυσίδας εμπιστοσύνης (επόμενο ορόσημο) |
| **Εφεδρικό cold start** | Η πρώτη εκκίνηση φέρνει κόμβους από το επίσημο HTTPS endpoint ή τοπικό mock· όλα καταλήγουν στο `<userData>/bootstrap-cache.json` |
| **Δρομολόγηση πολλαπλών παρόχων** | Ένας peer μπορεί να φιλοξενεί OpenAI + Anthropic + Google ταυτόχρονα· οι καλούντες δρομολογούν κατά `model.id` |
| **Συμβατό με OpenAI proxy** | Τοπικό HTTP proxy στο `:18100`· κάθε συμβατός με OpenAI/Anthropic πελάτης λειτουργεί αμέσως |
| **Auth με κλειδί API (προαιρετικό)** | Σταθεροποιήστε ένα κλειδί στο proxy κατανάλωσης· οι καλούντες πρέπει να στέλνουν `Authorization: Bearer <key>` |
| **22 γλώσσες** | Ελληνικά από προεπιλογή· υποστήριξη RTL αραβικών |
| **Ανοιχτό θέμα default** | Εναλλαγή σε σκούρο / ακολουθία λειτουργικού |

---

## Στιγμιότυπα <a id="screenshots"></a>

<p align="center"><img src="../docs/image/home.png" alt="Home / 首页" width="640"/></p>

<p align="center"><img src="../docs/image/model.png" alt="Models / 模型" width="640"/></p>

<p align="center"><img src="../docs/image/wallet.png" alt="Wallet / 钱包" width="640"/></p>

<p align="center"><img src="../docs/image/log.png" alt="Logs / 日志" width="640"/></p>

<p align="center"><img src="../docs/image/setting.png" alt="Settings / 设置" width="640"/></p>


---

## Αρχιτεκτονική <a id="architecture"></a>

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
│              ├─ registry    (επίσημο API + fallback cache)    │
│              ├─ p2p         (daemon libp2p)                    │
│              ├─ provisioner (δρομολογητής πολλαπλών παρόχων)  │
│              ├─ proxy-server (HTTP συμβατό με OpenAI)          │
│              ├─ upstream    (πραγματικές κλήσεις API)         │
│              ├─ wallet      (υπολογισμός MBP)                   │
│              └─ models      (συγκεντρωτής καταλόγου)          │
└─────────────────────────────────────────────────────────────────┘
                        │  libp2p
                        ▼
              ┌──────────────────┐
              │   Δίκτυο P2P      │
              └──────────────────┘
```

```bash
# Ανακοίνωση κόμβου v2 — δείτε την επόμενη ενότητα
GET https://modelbus.cc/api/v1/nodes
 → 200 [ NodeAnnouncement, NodeAnnouncement, … ]
```

```bash
# Τοπικό proxy κατανάλωσης
curl http://127.0.0.1:18100/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"hi"}]}'
```

---

## Αποκεντρωμένος σχεδιασμός <a id="decentralised"></a>

Τέσσερα seed peer-id είναι ενσωματωμένα στο δυαδικό (`src/main/config/trusted-roots.ts`). Ροή cold start:

1. Το τοπικό cache είναι άδειο στην πρώτη εκκίνηση
2. Παράλληλη λήψη: επίσημο HTTPS endpoint + ρυθμισμένα `bootstrapMultiaddrs` + mDNS
3. Επικύρωση κάθε peerId με το `TRUSTED_ROOT_PEER_IDS`
4. Αποθήκευση του επικυρωμένου υποσυνόλου στο `<userData>/bootstrap-cache.json`
5. Ο daemon P2P ξεκινά· τα cache hits μένουν σε P2P λειτουργία· τα misses ξαναδοκιμάζουν το επίσημο endpoint κάθε ώρα

```
4 σκληρά ρίζες  ←  άγκυρες εμπιστοσύνης
└─ από το επίσημο endpoint (cache)
   ├─ απευθείας σύνδεση μέσω bootstrapMultiaddrs
   ├─ mDNS (ανακάλυψη LAN)
   └─ libp2p DHT findProviders (καθαρό P2P)
```

Το επίσημο endpoint διατηρείται **για πάντα** ως κανάλι διάσωσης, ακόμη κι όταν το δίκτυο P2P είναι υγιές.

---

## Μορφή ανακοίνωσης κόμβου (v2) <a id="schema"></a>

Αίτημα: `<https://modelbus.cc/api/v1/nodes>` επιστρέφει `Array<NodeAnnouncement>`:

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

Πεδία:

- **version** `2`: έκδοση σχήματος· +1 σε ασύμβατες αλλαγές
- **peerId**: libp2p PeerId, παγκοσμίως μοναδικό
- **nickname**: αναγνώσιμο όνομα
- **providers[]**: LLM πάροχοι που φιλοξενεί αυτός ο κόμβος
  - **providerId**: id παρόχου στο models.dev
  - **providerName**: εμφανιζόμενο όνομα
  - **models[]**: μοντέλα κάτω από αυτόν τον πάροχο· το καθένα έχει `id` (κανονικό) και `name` (εμφάνιση)
- **addr**: ενιαία κύρια προσβάσιμη διεύθυνση (ενικός)
  - **kind**: `direct` / `relay` / `unknown`
  - **transport**: `tcp` / `ws` / `quic` / `webtransport` / `webrtc`
- **announcedAt**: Unix ms τελευταίας ενημέρωσης
- **expiresAt**: μαλακό TTL· οι ληγμένες εγγραφές παραμένουν χρησιμοποιήσιμες με μικρότερο βάρος

Οι τελευταίες 4 εγγραφές στο `mock/nodes.json` είναι οι αξιόπιστοι seed κόμβοι· τα peerIds τους ταιριάζουν με το `trusted-roots.ts`.

---

## Ροή αιτήματος <a id="flow"></a>

**Provision** (εσείς = κάτοχος Token): Ρυθμίσεις → Κοινή χρήση Token → επιλέξτε πάροχο, επικολλήστε το κλειδί API, σημειώστε μοντέλα → `provision:set` → `ProvisionerService.register(config)` → `node.handle('/modelbus/inference/1.0.0', …)` → `events: 'provision:registered'`.

**Consume** (εσείς = καταναλωτής Token): επιλέξτε αξιόπιστο κόμβο στην καρτέλα Μοντέλα → `proxy:setTarget` → `ConsumerProxy.start(:18100)` → έρχεται ένα POST HTTP → εξάγετε `body.model` → καλέστε τον κόμβο → γράψτε `InferenceRequest` (JSON + πρόθεμα μήκους) → περιμένετε `InferenceResponse` → γράψτε την HTTP απόκριση.

**Δρομολόγηση αιτήματος** (στον καλούμενο `ProvisionerService.handle`):

```
request.model = "openai/gpt-5"
  └─ resolveProvider("openai/gpt-5")
     ├─ ταίριασμα: config παρόχου openai
     │   └─ buildUpstreamCall(openai, key, path, method, headers, body)
     │       └─ https://api.openai.com/v1/chat/completions + Bearer sk-…
     │   └─ πραγματική κλήση, επιστροφή απόκρισης
  └─ χωρίς ταίριασμα: 400 + { error: "model X is not hosted by this peer" }
```

---

## Λήψη και χρήση (σύντομα) <a id="download"></a>

> 📦 Οι επίσημοι εγκαταστάτες (πακέτα Windows / macOS / Linux, και αργότερα mobile και Web SDK) ετοιμάζονται.

**Για να το χρησιμοποιήσετε τώρα: χτίστε από τον πηγαίο κώδικα**

```bash
pnpm install
pnpm run dev          # λειτουργία ανάπτυξης (Electron + Vite HMR)
pnpm run package:mac  # dmg για macOS
pnpm run package:win  # nsis για Windows
pnpm run package:linux # AppImage για Linux
```

Τα τεχνουργήματα καταλήγουν στο `release/`.

**Κανάλια διανομής (σχεδιασμένα)**: επίσημη σελίδα λήψης · GitHub Releases · macOS App Store · Windows Store · Snap / apt / Homebrew. Ο επίσημος τομέας παραμένει μόνιμο endpoint διάσωσης.

---

## Γρήγορη εκκίνηση <a id="quickstart"></a>

```bash
git clone https://github.com/your-org/modelbus-p2p.git
cd modelbus-p2p
pnpm install
pnpm run dev
```

Στην πρώτη εκκίνηση η εφαρμογή δείχνει στην `mock/nodes.json`, οπότε ολόκληρη η ροή λειτουργεί χωρίς δίκτυο. Λεπτομέρειες στο κεντρικό [README.md](../README.md) και στον φάκελο [docs/](../docs/).

---

## Οδικός χάρτης <a id="roadmap"></a>

- ✅ v1: πολλαπλοί πάροχοι, επίσημο cold start, άγκυρες εμπιστοσύνης, P2P προώθηση, 22 γλώσσες, σκελετός Πορτοφολιού
- 🔜 v2: αλυσίδα εμπιστοσύνης (trustChain) — βιβλίο προσκλήσεων με υπογραφή Ed25519
- 🔜 v3: αξιολόγηση ποιότητας κόμβου βάσει πραγματικών μετρήσεων (καθυστέρηση, σφάλματα, χρόνος λειτουργίας)
- 🔜 v4: βρόχος οικονομίας token — το MBP καθοδηγεί προτεραιότητα δρομολόγησης, ενίσχυση cold start και ανακάλυψη κόμβων
- 🔜 v5: κινητοί κόμβοι
- 🔜 v6: Web SDK — `<modelbus>` στον browser

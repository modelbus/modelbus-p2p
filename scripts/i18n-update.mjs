// One-off script to translate the new i18n keys added in the menu
// refactor (nav.home / nav.logs, settings.tab.*, logs.*, settings.*Hint, ...)
// across every non-zh-CN dictionary. Run with:
//   node scripts/i18n-update.mjs
//
// It rewrites the nav block, the consume.refreshHint phrasing (mentioning
// the Home tab instead of an obsolete tab name), the consume.noNodes hint,
// and adds the missing settings.tab / settings.*Hint / logs blocks with
// the matching translations.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const i18nDir = path.resolve(__dirname, '..', 'src', 'renderer', 'src', 'i18n');

// Per-language patch:
//   { file, nav: {home, logs, settings}, consume: {pickHint, noNodes}, ... }
// The script just looks up a few simple keys (the lang code at the top
// of the file) and rewrites / appends the same structure in each.

const translations = {
  'zh-TW': {
    navHome: '首頁', navLogs: '日誌', navSettings: '設定',
    pickHint: '選中節點後，本機 HTTP 代理將在 http://127.0.0.1:{port} 啟動。',
    noNodes: '暫無可用節點。請對方在首頁點擊開始分享。',
    proxyPortField: '本機代理通訊埠',
    bootstrapHint: '供 libp2p 啟動時連線的對等節點',
    nodeHint: '設定本機 libp2p 節點的網路參數：registry URL、TCP 監聽通訊埠、引導節點清單。',
    registerHint: '將你的節點資訊註冊到全域節點清單（registry URL）以便其他使用者發現。',
    registerHowto: 'Token 上線後，本應用會自動向 registry URL 發佈一次 announce。也可以手動儲存目前設定後再到首頁點擊「開始分享」。',
    provisionHint: '設定你願意分享的 LLM Token：選擇供應商、填寫 API Key、勾選要分享的模型。',
    serviceHint: '對外提供呼叫服務的設定：設定呼叫方所需的固定 API Key，請求時會校驗該 Key。',
    consumerApiKey: '消費端 API Key',
    consumerApiKeyHint: '呼叫方存取本機代理時必須在請求標頭中攜帶此 Key（Authorization: Bearer <key>）。',
    localEndpoint: '本機端點',
    authHeader: '鑑權請求標頭',
    tabNode: '節點', tabRegister: '註冊', tabProvision: 'Token 上線', tabService: '呼叫服務',
    logsTitle: '日誌', logsSupplied: '供應流量（我服務的請求）',
    logsConsumed: '呼叫流量（我發出的請求）', logsNoSupplied: '暫無被呼叫記錄。',
    logsNoConsumed: '暫無呼叫記錄。',
    offlineHint: '請先在首頁啟動 P2P 節點。',
    activeHint: '你正在分享 {provider}（{n} 個模型）。其他使用者選中你的節點後會透過你轉發請求。',
  },
  'en-US': {
    navHome: 'Home', navLogs: 'Logs', navSettings: 'Settings',
    pickHint: 'Pick a peer and the local HTTP proxy starts at http://127.0.0.1:{port}.',
    noNodes: 'No nodes yet. Ask the other side to click "Start sharing" on the Home tab.',
    proxyPortField: 'Local proxy port',
    bootstrapHint: 'Peers libp2p dials when the node starts',
    nodeHint: 'Configure the local libp2p networking: registry URL, TCP listen port, bootstrap peers.',
    registerHint: 'Publish your node information to the global registry URL so others can discover you.',
    registerHowto: 'Once you start sharing, this app posts an announce to the registry URL. You can also save the current settings manually and then click "Start sharing" on the Home tab.',
    provisionHint: 'Set up the LLM token you are willing to share: pick a provider, paste the API key, select the models.',
    serviceHint: 'Expose a public API with a fixed API key — every incoming request is checked for the key.',
    consumerApiKey: 'Consumer API key',
    consumerApiKeyHint: 'Callers must send this key in the Authorization header (Bearer <key>) when hitting the local proxy.',
    localEndpoint: 'Local endpoint',
    authHeader: 'Auth header',
    tabNode: 'Node', tabRegister: 'Register', tabProvision: 'Provision', tabService: 'Service',
    logsTitle: 'Logs', logsSupplied: 'Supplied traffic (requests I served)',
    logsConsumed: 'Consumed traffic (requests I made)', logsNoSupplied: 'No supplied traffic yet.',
    logsNoConsumed: 'No consumed traffic yet.',
    offlineHint: 'Please start the P2P node from the Home tab first.',
    activeHint: 'Sharing {provider} ({n} models). Other peers will route inference requests through you.',
  },
  'ko-KR': {
    navHome: '홈', navLogs: '로그', navSettings: '설정',
    pickHint: '피어를 선택하면 로컬 HTTP 프록시가 http://127.0.0.1:{port} 에서 시작됩니다.',
    noNodes: '사용 가능한 노드가 없습니다. 상대방에게 홈 탭에서 공유 시작을 요청하세요.',
    proxyPortField: '로컬 프록시 포트',
    bootstrapHint: 'libp2p가 시작 시 접속할 피어',
    nodeHint: '로컬 libp2p 네트워크 설정: 레지스트리 URL, TCP 리스닝 포트, 부트스트랩 피어.',
    registerHint: '다른 사용자가 찾을 수 있도록 노드 정보를 글로벌 레지스트리 URL에 게시합니다.',
    registerHowto: '공유를 시작하면 앱이 레지스트리 URL에 announce를 게시합니다. 설정을 수동으로 저장한 다음 홈 탭에서 시작할 수도 있습니다.',
    provisionHint: '공유할 LLM 토큰을 설정합니다: 프로바이더 선택, API 키 입력, 모델 선택.',
    serviceHint: '고정 API 키로 호출을 인증하는 공개 API 서비스를 노출합니다.',
    consumerApiKey: '소비자 API 키',
    consumerApiKeyHint: '로컬 프록시에 접근할 때 호출자는 이 키를 Authorization 헤더에 포함해야 합니다 (Bearer <key>).',
    localEndpoint: '로컬 엔드포인트',
    authHeader: '인증 헤더',
    tabNode: '노드', tabRegister: '등록', tabProvision: 'Token 공유', tabService: '호출 서비스',
    logsTitle: '로그', logsSupplied: '공급 트래픽 (내가 서비스한 요청)',
    logsConsumed: '소비 트래픽 (내가 보낸 요청)', logsNoSupplied: '공급 트래픽이 없습니다.',
    logsNoConsumed: '소비 트래픽이 없습니다.',
    offlineHint: '먼저 홈 탭에서 P2P 노드를 시작하세요.',
    activeHint: '{provider} ({n} 모델)을 공유 중입니다. 다른 사용자가 내 노드를 선택하면 요청이 경유됩니다.',
  },
  'de-DE': {
    navHome: 'Start', navLogs: 'Protokolle', navSettings: 'Einstellungen',
    pickHint: 'Wähle einen Peer und der lokale HTTP-Proxy startet auf http://127.0.0.1:{port}.',
    noNodes: 'Keine Knoten. Bitte die Gegenseite auf der Startseite auf «Freigabe starten» klicken lassen.',
    proxyPortField: 'Lokaler Proxy-Port',
    bootstrapHint: 'Peers, die libp2p beim Start anruft',
    nodeHint: 'Konfiguriere das lokale libp2p-Netzwerk: Registry-URL, TCP-Listen-Port, Bootstrap-Peers.',
    registerHint: 'Veröffentliche deine Knoteninformationen in der globalen Registry, damit andere dich finden.',
    registerHowto: 'Sobald du die Freigabe startest, postet die App ein Announce an die Registry-URL. Du kannst die Einstellungen auch manuell speichern und dann auf der Startseite auf «Freigabe starten» klicken.',
    provisionHint: 'Richte das LLM-Token ein, das du teilen möchtest: Anbieter wählen, API-Schlüssel einfügen, Modelle auswählen.',
    serviceHint: 'Stelle einen öffentlichen API-Dienst mit einem festen API-Schlüssel bereit — jeder Request wird gegen diesen Schlüssel geprüft.',
    consumerApiKey: 'Consumer-API-Schlüssel',
    consumerApiKeyHint: 'Aufrufer müssen diesen Schlüssel im Authorization-Header (Bearer <key>) senden, wenn sie den lokalen Proxy nutzen.',
    localEndpoint: 'Lokaler Endpunkt',
    authHeader: 'Auth-Header',
    tabNode: 'Knoten', tabRegister: 'Registrieren', tabProvision: 'Token-Freigabe', tabService: 'API-Dienst',
    logsTitle: 'Protokolle', logsSupplied: 'Bereitgestellter Verkehr (von mir bediente Requests)',
    logsConsumed: 'Konsumierter Verkehr (von mir gesendete Requests)', logsNoSupplied: 'Noch keine bereitgestellten Anfragen.',
    logsNoConsumed: 'Noch kein konsumierter Verkehr.',
    offlineHint: 'Bitte starte den P2P-Knoten zuerst auf der Startseite.',
    activeHint: 'Du gibst {provider} frei ({n} Modelle). Andere Peers leiten Anfragen über dich.',
  },
  'es-ES': {
    navHome: 'Inicio', navLogs: 'Registros', navSettings: 'Ajustes',
    pickHint: 'Elige un peer y el proxy HTTP local arrancará en http://127.0.0.1:{port}.',
    noNodes: 'Sin nodos. Pide a la otra parte que pulse «Empezar a compartir» en la pestaña Inicio.',
    proxyPortField: 'Puerto del proxy local',
    bootstrapHint: 'Peers que libp2p marca al iniciar',
    nodeHint: 'Configura la red libp2p local: URL del registro, puerto TCP de escucha, peers de arranque.',
    registerHint: 'Publica la información de tu nodo en la URL del registro global para que otros te descubran.',
    registerHowto: 'Al empezar a compartir, la aplicación envía un announce a la URL del registro. También puedes guardar la configuración manualmente y luego pulsar «Empezar a compartir» en Inicio.',
    provisionHint: 'Configura el token LLM que vas a compartir: elige proveedor, pega la clave API, marca los modelos.',
    serviceHint: 'Expón un servicio de API público con una clave API fija — cada petición se valida contra esa clave.',
    consumerApiKey: 'Clave API del consumidor',
    consumerApiKeyHint: 'Los llamadores deben enviar esta clave en la cabecera Authorization (Bearer <key>) al usar el proxy local.',
    localEndpoint: 'Endpoint local',
    authHeader: 'Cabecera de autenticación',
    tabNode: 'Nodo', tabRegister: 'Registrar', tabProvision: 'Token compartido', tabService: 'Servicio de API',
    logsTitle: 'Registros', logsSupplied: 'Tráfico servido (peticiones que atendí)',
    logsConsumed: 'Tráfico consumido (peticiones que envié)', logsNoSupplied: 'Aún no hay tráfico servido.',
    logsNoConsumed: 'Aún no hay tráfico consumido.',
    offlineHint: 'Inicia primero el nodo P2P en la pestaña Inicio.',
    activeHint: 'Estás compartiendo {provider} ({n} modelos). Otros peers enrutarán las peticiones a través de ti.',
  },
  'fr-FR': {
    navHome: 'Accueil', navLogs: 'Journaux', navSettings: 'Paramètres',
    pickHint: 'Choisissez un pair et le proxy HTTP local démarre sur http://127.0.0.1:{port}.',
    noNodes: 'Aucun nœud. Demandez à l\'autre partie de cliquer « Commencer le partage » dans l\'onglet Accueil.',
    proxyPortField: 'Port du proxy local',
    bootstrapHint: 'Pairs contactés par libp2p au démarrage',
    nodeHint: 'Configurez le réseau libp2p local : URL du registre, port TCP d\'écoute, pairs d\'amorçage.',
    registerHint: 'Publiez les informations de votre nœud dans l\'URL du registre global pour que d\'autres vous découvrent.',
    registerHowto: 'Quand vous commencez le partage, l\'application envoie un announce à l\'URL du registre. Vous pouvez aussi enregistrer la configuration manuellement puis cliquer « Commencer le partage » dans Accueil.',
    provisionHint: 'Configurez le token LLM que vous partagez : fournisseur, clé API, modèles sélectionnés.',
    serviceHint: 'Exposez un service API public avec une clé API fixe — chaque requête est vérifiée.',
    consumerApiKey: 'Clé API consommateur',
    consumerApiKeyHint: 'Les appelants doivent envoyer cette clé dans l\'en-tête Authorization (Bearer <key>) pour utiliser le proxy local.',
    localEndpoint: 'Point d\'accès local',
    authHeader: 'En-tête d\'authentification',
    tabNode: 'Nœud', tabRegister: 'Enregistrer', tabProvision: 'Partage de token', tabService: 'Service API',
    logsTitle: 'Journaux', logsSupplied: 'Trafic fourni (requêtes que j\'ai servies)',
    logsConsumed: 'Trafic consommé (requêtes que j\'ai émises)', logsNoSupplied: 'Aucun trafic fourni pour le moment.',
    logsNoConsumed: 'Aucun trafic consommé pour le moment.',
    offlineHint: 'Démarrez d\'abord le nœud P2P depuis l\'onglet Accueil.',
    activeHint: 'Vous partagez {provider} ({n} modèles). Les autres pairs routeront les requêtes via vous.',
  },
  'it-IT': {
    navHome: 'Home', navLogs: 'Registri', navSettings: 'Impostazioni',
    pickHint: 'Scegli un peer: il proxy HTTP locale parte su http://127.0.0.1:{port}.',
    noNodes: 'Nessun nodo. Chiedi all\'altra parte di cliccare «Inizia a condividere» nella scheda Home.',
    proxyPortField: 'Porta proxy locale',
    bootstrapHint: 'Peer contattati da libp2p all\'avvio',
    nodeHint: 'Configura la rete libp2p locale: URL del registro, porta TCP di ascolto, peer di bootstrap.',
    registerHint: 'Pubblica le informazioni del tuo nodo nell\'URL del registro globale per farti scoprire.',
    registerHowto: 'Quando inizi a condividere, l\'app invia un announce all\'URL del registro. Puoi anche salvare manualmente la configurazione e poi cliccare «Inizia a condividere» nella scheda Home.',
    provisionHint: 'Configura il token LLM che condividi: provider, chiave API, modelli.',
    serviceHint: 'Esponi un servizio API pubblico con una chiave API fissa — ogni richiesta viene verificata.',
    consumerApiKey: 'Chiave API consumer',
    consumerApiKeyHint: 'I client devono inviare questa chiave nell\'header Authorization (Bearer <key>) quando usano il proxy locale.',
    localEndpoint: 'Endpoint locale',
    authHeader: 'Header di autenticazione',
    tabNode: 'Nodo', tabRegister: 'Registra', tabProvision: 'Condivisione token', tabService: 'Servizio API',
    logsTitle: 'Registri', logsSupplied: 'Traffico servito (richieste che ho servito)',
    logsConsumed: 'Traffico consumato (richieste che ho inviato)', logsNoSupplied: 'Nessun traffico servito.',
    logsNoConsumed: 'Nessun traffico consumato.',
    offlineHint: 'Avvia prima il nodo P2P dalla scheda Home.',
    activeHint: 'Stai condividendo {provider} ({n} modelli). Gli altri peer instraderanno le richieste tramite te.',
  },
  'da-DK': {
    navHome: 'Start', navLogs: 'Log', navSettings: 'Indstillinger',
    pickHint: 'Vælg en peer; den lokale HTTP-proxy starter på http://127.0.0.1:{port}.',
    noNodes: 'Ingen noder. Bed den anden side klikke «Start deling» under Start.',
    proxyPortField: 'Lokal proxy-port',
    bootstrapHint: 'Peers libp2p ringer op ved opstart',
    nodeHint: 'Konfigurer det lokale libp2p-netværk: register-URL, TCP-lytteport, bootstrap-peers.',
    registerHint: 'Publicer dine nodeoplysninger til den globale register-URL, så andre kan finde dig.',
    registerHowto: 'Når du starter deling, sender appen en announce til register-URLen. Du kan også gemme indstillingerne manuelt og derefter klikke «Start deling» på Start.',
    provisionHint: 'Opsæt den LLM-token du vil dele: vælg udbyder, indsæt API-nøgle, vælg modeller.',
    serviceHint: 'Eksponer en offentlig API-tjeneste med en fast API-nøgle — hver anmodning tjekkes mod nøglen.',
    consumerApiKey: 'Forbruger-API-nøgle',
    consumerApiKeyHint: 'Kaldere skal sende denne nøgle i Authorization-headeren (Bearer <key>) når de bruger den lokale proxy.',
    localEndpoint: 'Lokalt endpoint',
    authHeader: 'Auth-header',
    tabNode: 'Node', tabRegister: 'Registrer', tabProvision: 'Token-deling', tabService: 'API-tjeneste',
    logsTitle: 'Log', logsSupplied: 'Leveret trafik (forespørgsler jeg har betjent)',
    logsConsumed: 'Forbrugt trafik (forespørgsler jeg har sendt)', logsNoSupplied: 'Ingen leveret trafik endnu.',
    logsNoConsumed: 'Ingen forbrugt trafik endnu.',
    offlineHint: 'Start først P2P-noden fra Start.',
    activeHint: 'Du deler {provider} ({n} modeller). Andre peers ruter forespørgsler gennem dig.',
  },
  'ja-JP': {
    navHome: 'ホーム', navLogs: 'ログ', navSettings: '設定',
    pickHint: 'ピアを選ぶとローカル HTTP プロキシが http://127.0.0.1:{port} で起動します。',
    noNodes: '利用可能なノードがありません。ホームタブで「共有を開始」をクリックしてもらってください。',
    proxyPortField: 'ローカルプロキシポート',
    bootstrapHint: '起動時に libp2p がダイヤルするピア',
    nodeHint: 'ローカル libp2p のネットワークを設定：レジストリ URL、TCP リスンポート、ブートストラップピア。',
    registerHint: 'グローバルレジストリ URL にノード情報を公開して、他のユーザーから見つけてもらえるようにします。',
    registerHowto: '共有を開始するとアプリがレジストリ URL に announce を投稿します。手動で設定を保存してからホームタブで開始することもできます。',
    provisionHint: '共有する LLM トークンを設定します：プロバイダーを選択し、API キーを貼り付け、モデルを選びます。',
    serviceHint: '固定 API キーを設定して公開 API サービスを公開します。すべてのリクエストがそのキーで検証されます。',
    consumerApiKey: 'コンシューマー API キー',
    consumerApiKeyHint: '呼び出し側は Authorization ヘッダー (Bearer <key>) でこのキーを送信する必要があります。',
    localEndpoint: 'ローカルエンドポイント',
    authHeader: '認証ヘッダー',
    tabNode: 'ノード', tabRegister: '登録', tabProvision: 'トークン共有', tabService: 'API サービス',
    logsTitle: 'ログ', logsSupplied: '提供したトラフィック（自分が処理したリクエスト）',
    logsConsumed: '消費したトラフィック（自分が送ったリクエスト）', logsNoSupplied: '提供したトラフィックはまだありません。',
    logsNoConsumed: '消費したトラフィックはまだありません。',
    offlineHint: 'まずホームタブで P2P ノードを起動してください。',
    activeHint: '{provider}（{n} モデル）を共有中です。他の利用者があなたのノードを選ぶとリクエストが経由されます。',
  },
  'pl-PL': {
    navHome: 'Strona główna', navLogs: 'Logi', navSettings: 'Ustawienia',
    pickHint: 'Wybierz węzeł; lokalny proxy HTTP wystartuje na http://127.0.0.1:{port}.',
    noNodes: 'Brak węzłów. Poproś drugą stronę o kliknięcie „Zacznij udostępniać" na stronie głównej.',
    proxyPortField: 'Port lokalnego proxy',
    bootstrapHint: 'Węzły, które libp2p odpyta przy starcie',
    nodeHint: 'Skonfiguruj sieć libp2p: URL rejestru, port nasłuchujący TCP, węzły bootstrap.',
    registerHint: 'Opublikuj informacje o swoim węźle w globalnym rejestrze, aby inni mogli Cię znaleźć.',
    registerHowto: 'Po rozpoczęciu udostępniania aplikacja wysyła announce do URL rejestru. Możesz też ręcznie zapisać ustawienia, a potem kliknąć „Zacznij udostępniać" na stronie głównej.',
    provisionHint: 'Skonfiguruj token LLM, który chcesz udostępnić: wybierz dostawcę, wklej klucz API, zaznacz modele.',
    serviceHint: 'Udostępnij publiczny serwis API ze stałym kluczem API — każde żądanie jest sprawdzane.',
    consumerApiKey: 'Klucz API konsumenta',
    consumerApiKeyHint: 'Wywołujący muszą wysyłać ten klucz w nagłówku Authorization (Bearer <key>), gdy korzystają z lokalnego proxy.',
    localEndpoint: 'Lokalny endpoint',
    authHeader: 'Nagłówek autoryzacji',
    tabNode: 'Węzeł', tabRegister: 'Zarejestruj', tabProvision: 'Token', tabService: 'Serwis API',
    logsTitle: 'Logi', logsSupplied: 'Ruch dostarczony (żądania, które obsłużyłem)',
    logsConsumed: 'Ruch skonsumowany (żądania, które wysłałem)', logsNoSupplied: 'Brak dostarczonego ruchu.',
    logsNoConsumed: 'Brak skonsumowanego ruchu.',
    offlineHint: 'Najpierw uruchom węzeł P2P na stronie głównej.',
    activeHint: 'Udostępniasz {provider} ({n} modeli). Inne węzły będą kierować zapytania przez Ciebie.',
  },
  'ru-RU': {
    navHome: 'Главная', navLogs: 'Журналы', navSettings: 'Параметры',
    pickHint: 'Выберите пир — локальный HTTP-прокси запустится на http://127.0.0.1:{port}.',
    noNodes: 'Узлов нет. Попросите другую сторону нажать «Начать делиться» на вкладке Главная.',
    proxyPortField: 'Порт локального прокси',
    bootstrapHint: 'Пиры, к которым libp2p подключается при старте',
    nodeHint: 'Настройте локальную сеть libp2p: URL реестра, TCP-порт прослушивания, узлы начальной загрузки.',
    registerHint: 'Опубликуйте информацию о вашем узле в глобальном реестре, чтобы другие могли вас найти.',
    registerHowto: 'Когда вы начнёте делиться, приложение отправит announce в URL реестра. Также можно вручную сохранить настройки и нажать «Начать делиться» на вкладке Главная.',
    provisionHint: 'Настройте токен LLM, которым хотите поделиться: выберите провайдера, вставьте API-ключ, отметьте модели.',
    serviceHint: 'Публичный API-сервис с фиксированным API-ключом — каждый запрос проверяется.',
    consumerApiKey: 'API-ключ потребителя',
    consumerApiKeyHint: 'Вызывающие должны передавать этот ключ в заголовке Authorization (Bearer <key>), обращаясь к локальному прокси.',
    localEndpoint: 'Локальная конечная точка',
    authHeader: 'Заголовок авторизации',
    tabNode: 'Узел', tabRegister: 'Регистрация', tabProvision: 'Токен', tabService: 'API-сервис',
    logsTitle: 'Журналы', logsSupplied: 'Предоставленный трафик (запросы, которые я обслужил)',
    logsConsumed: 'Потреблённый трафик (запросы, которые я отправил)', logsNoSupplied: 'Предоставленного трафика пока нет.',
    logsNoConsumed: 'Потреблённого трафика пока нет.',
    offlineHint: 'Сначала запустите P2P-узел на вкладке Главная.',
    activeHint: 'Вы делитесь {provider} ({n} моделей). Другие пиры будут маршрутизировать запросы через вас.',
  },
  'bs-BA': {
    navHome: 'Početna', navLogs: 'Dnevnik', navSettings: 'Postavke',
    pickHint: 'Odaberite čvor; lokalni HTTP proxy starta na http://127.0.0.1:{port}.',
    noNodes: 'Nema čvorova. Zamolite drugu stranu da klikne «Počni dijeliti» na kartici Početna.',
    proxyPortField: 'Lokalni proxy port',
    bootstrapHint: 'Peer-ovi koje libp2p poziva pri pokretanju',
    nodeHint: 'Konfigurirajte lokalnu libp2p mrežu: URL registra, TCP port za slušanje, bootstrap peer-ove.',
    registerHint: 'Objavite informacije o svom čvoru u globalni registar kako bi vas drugi mogli pronaći.',
    registerHowto: 'Kada počnete dijeliti, aplikacija šalje announce na URL registra. Možete i ručno spremiti postavke, a zatim kliknuti «Počni dijeliti» na kartici Početna.',
    provisionHint: 'Postavite LLM token koji dijelite: odaberite dobavljača, unesite API ključ, označite modele.',
    serviceHint: 'Javno API sučelje s fiksnim API ključem — svaki zahtjev se provjerava.',
    consumerApiKey: 'Consumer API ključ',
    consumerApiKeyHint: 'Pozivatelji moraju slati ovaj ključ u Authorization zaglavlju (Bearer <key>) kada koriste lokalni proxy.',
    localEndpoint: 'Lokalna krajnja točka',
    authHeader: 'Auth zaglavlje',
    tabNode: 'Čvor', tabRegister: 'Registriraj', tabProvision: 'Token dijeljenje', tabService: 'API usluga',
    logsTitle: 'Dnevnik', logsSupplied: 'Pruženi promet (zahtjevi koje sam opslužio)',
    logsConsumed: 'Potrošeni promet (zahtjevi koje sam poslao)', logsNoSupplied: 'Još nema pruženog prometa.',
    logsNoConsumed: 'Još nema potrošenog prometa.',
    offlineHint: 'Najprije pokrenite P2P čvor na kartici Početna.',
    activeHint: 'Dijelite {provider} ({n} modela). Ostali čvorovi će usmjeravati zahtjeve preko vas.',
  },
  'ar-SA': {
    navHome: 'الرئيسية', navLogs: 'السجلات', navSettings: 'الإعدادات',
    pickHint: 'اختر نظيرًا وسيبدأ وكيل HTTP المحلي على http://127.0.0.1:{port}.',
    noNodes: 'لا توجد عقد. اطلب من الطرف الآخر النقر على «بدء المشاركة» في تبويب الرئيسية.',
    proxyPortField: 'منفذ الوكيل المحلي',
    bootstrapHint: 'النظراء الذين يتصل بهم libp2p عند البدء',
    nodeHint: 'اضبط شبكة libp2p المحلية: عنوان السجل، منفذ استماع TCP، عقد التمهيد.',
    registerHint: 'انشر معلومات عقدتك في عنوان السجل العالمي ليتمكن الآخرون من اكتشافك.',
    registerHowto: 'عند بدء المشاركة، ترسل التطبيق announce إلى عنوان السجل. يمكنك أيضًا حفظ الإعدادات يدويًا ثم النقر على «بدء المشاركة» في تبويب الرئيسية.',
    provisionHint: 'اضبط رمز LLM الذي ستشاركه: اختر الموفر، أدخل مفتاح API، حدد النماذج.',
    serviceHint: 'اعرض خدمة API عامة بمفتاح API ثابت — يتم التحقق من كل طلب بهذا المفتاح.',
    consumerApiKey: 'مفتاح API للمستهلك',
    consumerApiKeyHint: 'يجب على المتصلين إرسال هذا المفتاح في ترويسة Authorization (Bearer <key>) عند استخدام الوكيل المحلي.',
    localEndpoint: 'نقطة الوصول المحلية',
    authHeader: 'ترويسة المصادقة',
    tabNode: 'العقدة', tabRegister: 'تسجيل', tabProvision: 'مشاركة الرمز', tabService: 'خدمة API',
    logsTitle: 'السجلات', logsSupplied: 'حركة مقدمة (الطلبات التي خدمتها)',
    logsConsumed: 'حركة مستهلكة (الطلبات التي أرسلتها)', logsNoSupplied: 'لا توجد حركة مقدمة بعد.',
    logsNoConsumed: 'لا توجد حركة مستهلكة بعد.',
    offlineHint: 'يرجى تشغيل عقدة P2P أولًا من تبويب الرئيسية.',
    activeHint: 'تشارك {provider} ({n} نماذج). سيقوم الآخرون بتوجيه الطلبات عبرك.',
  },
  'nb-NO': {
    navHome: 'Hjem', navLogs: 'Logger', navSettings: 'Innstillinger',
    pickHint: 'Velg en peer; den lokale HTTP-proxyen starter på http://127.0.0.1:{port}.',
    noNodes: 'Ingen noder. Be den andre parten klikke «Start deling» under Hjem.',
    proxyPortField: 'Lokal proxy-port',
    bootstrapHint: 'Peers libp2p ringer ved oppstart',
    nodeHint: 'Konfigurer det lokale libp2p-nettverket: register-URL, TCP-lytteport, bootstrap-peers.',
    registerHint: 'Publiser nodeinformasjonen din til den globale register-URLen slik at andre kan finne deg.',
    registerHowto: 'Når du starter deling, sender appen en announce til register-URLen. Du kan også lagre innstillingene manuelt og deretter klikke «Start deling» under Hjem.',
    provisionHint: 'Sett opp LLM-tokenen du vil dele: velg leverandør, lim inn API-nøkkel, velg modeller.',
    serviceHint: 'Tilby en offentlig API-tjeneste med en fast API-nøkkel — hver forespørsel sjekkes.',
    consumerApiKey: 'Forbruker-API-nøkkel',
    consumerApiKeyHint: 'Kallere må sende denne nøkkelen i Authorization-headeren (Bearer <key>) når de bruker den lokale proxyen.',
    localEndpoint: 'Lokalt endepunkt',
    authHeader: 'Auth-header',
    tabNode: 'Node', tabRegister: 'Registrer', tabProvision: 'Token-deling', tabService: 'API-tjeneste',
    logsTitle: 'Logger', logsSupplied: 'Levert trafikk (forespørsler jeg har betjent)',
    logsConsumed: 'Konsumert trafikk (forespørsler jeg har sendt)', logsNoSupplied: 'Ingen levert trafikk ennå.',
    logsNoConsumed: 'Ingen konsumert trafikk ennå.',
    offlineHint: 'Start P2P-noden fra Hjem først.',
    activeHint: 'Du deler {provider} ({n} modeller). Andre peers ruter forespørsler gjennom deg.',
  },
  'pt-BR': {
    navHome: 'Início', navLogs: 'Logs', navSettings: 'Ajustes',
    pickHint: 'Escolha um peer; o proxy HTTP local sobe em http://127.0.0.1:{port}.',
    noNodes: 'Sem nós ainda. Peça à outra parte clicar em «Começar a compartilhar» em Início.',
    proxyPortField: 'Porta do proxy local',
    bootstrapHint: 'Peers que o libp2p disca ao iniciar',
    nodeHint: 'Configure a rede libp2p local: URL do registro, porta TCP de escuta, peers de bootstrap.',
    registerHint: 'Publique as informações do seu nó no registro global para que outros possam descobrir.',
    registerHowto: 'Ao começar a compartilhar, o app envia um announce para a URL do registro. Você também pode salvar as configurações manualmente e clicar em «Começar a compartilhar» em Início.',
    provisionHint: 'Configure o token LLM que você compartilha: escolha o provedor, cole a chave API, marque os modelos.',
    serviceHint: 'Exponha um serviço de API público com uma chave API fixa — cada requisição é validada.',
    consumerApiKey: 'Chave API do consumidor',
    consumerApiKeyHint: 'Os chamadores devem enviar essa chave no cabeçalho Authorization (Bearer <key>) ao usar o proxy local.',
    localEndpoint: 'Endpoint local',
    authHeader: 'Cabeçalho de autenticação',
    tabNode: 'Nó', tabRegister: 'Registrar', tabProvision: 'Compartilhar token', tabService: 'Serviço de API',
    logsTitle: 'Logs', logsSupplied: 'Tráfego fornecido (requisições que atendi)',
    logsConsumed: 'Tráfego consumido (requisições que enviei)', logsNoSupplied: 'Ainda sem tráfego fornecido.',
    logsNoConsumed: 'Ainda sem tráfego consumido.',
    offlineHint: 'Inicie o nó P2P em Início primeiro.',
    activeHint: 'Você está compartilhando {provider} ({n} modelos). Outros peers rotearão requisições por você.',
  },
  'th-TH': {
    navHome: 'หน้าหลัก', navLogs: 'บันทึก', navSettings: 'การตั้งค่า',
    pickHint: 'เลือกเพียร์ แล้วพร็อกซี HTTP ภายในจะเริ่มที่ http://127.0.0.1:{port}',
    noNodes: 'ยังไม่มีโหนด ขอให้อีกฝ่ายกด «เริ่มแชร์» ที่แท็บหน้าหลัก',
    proxyPortField: 'พอร์ตพร็อกซีภายใน',
    bootstrapHint: 'เพียร์ที่ libp2p โทรหาเมื่อเริ่มต้น',
    nodeHint: 'ตั้งค่าเครือข่าย libp2p ภายใน: URL รีจิสทรี พอร์ตฟัง TCP เพียร์สำหรับบูตสแตรป',
    registerHint: 'เผยแพร่ข้อมูลโหนดของคุณไปยัง URL รีจิสทรีสากลเพื่อให้ผู้อื่นค้นพบ',
    registerHowto: 'เมื่อคุณเริ่มแชร์ แอปจะส่ง announce ไปยัง URL รีจิสทรี คุณสามารถบันทึกการตั้งค่าด้วยตัวเองแล้วกด «เริ่มแชร์» ที่แท็บหน้าหลัก',
    provisionHint: 'ตั้งค่าโทเคน LLM ที่จะแชร์: เลือกผู้ให้บริการ วางคีย์ API เลือกโมเดล',
    serviceHint: 'เปิดบริการ API สาธารณะด้วยคีย์ API คงที่ — ทุกคำขอจะถูกตรวจสอบ',
    consumerApiKey: 'คีย์ API สำหรับผู้บริโภค',
    consumerApiKeyHint: 'ผู้เรียกต้องส่งคีย์นี้ในส่วนหัว Authorization (Bearer <key>) เมื่อใช้พร็อกซีภายใน',
    localEndpoint: 'ปลายทางภายใน',
    authHeader: 'ส่วนหัวการยืนยันตัวตน',
    tabNode: 'โหนด', tabRegister: 'ลงทะเบียน', tabProvision: 'แชร์โทเคน', tabService: 'บริการ API',
    logsTitle: 'บันทึก', logsSupplied: 'ทราฟฟิกที่ให้บริการ (คำขอที่ฉันให้บริการ)',
    logsConsumed: 'ทราฟฟิกที่ใช้ (คำขอที่ฉันส่งออก)', logsNoSupplied: 'ยังไม่มีทราฟฟิกที่ให้บริการ',
    logsNoConsumed: 'ยังไม่มีทราฟฟิกที่ใช้',
    offlineHint: 'กรุณาเริ่มโหนด P2P จากแท็บหน้าหลักก่อน',
    activeHint: 'คุณกำลังแชร์ {provider} ({n} โมเดล) เพียร์อื่นๆ จะส่งต่อคำขอผ่านคุณ',
  },
  'tr-TR': {
    navHome: 'Ana sayfa', navLogs: 'Günlükler', navSettings: 'Ayarlar',
    pickHint: 'Bir eş seç; yerel HTTP proxy http://127.0.0.1:{port} adresinde başlar.',
    noNodes: 'Henüz düğüm yok. Karşı taraftan Ana sayfa sekmesinde «Paylaşımı başlat»a tıklamasını iste.',
    proxyPortField: 'Yerel proxy portu',
    bootstrapHint: 'libp2p\'nin başlangıçta aradığı eşler',
    nodeHint: 'Yerel libp2p ağını yapılandır: kayıt URL\'si, TCP dinleme portu, önyükleme eşleri.',
    registerHint: 'Düğüm bilgilerinizi küresel kayıt URL\'sinde yayınlayın ki diğerleri sizi bulsun.',
    registerHowto: 'Paylaşımı başlattığınızda uygulama kayıt URL\'sine bir announce gönderir. Ayarları kendiniz de kaydedip Ana sayfa sekmesinden başlatabilirsiniz.',
    provisionHint: 'Paylaşacağınız LLM tokenını ayarlayın: sağlayıcı seçin, API anahtarını yapıştırın, modelleri işaretleyin.',
    serviceHint: 'Sabit bir API anahtarıyla herkese açık bir API servisi sunun — her istek bu anahtarla doğrulanır.',
    consumerApiKey: 'Tüketici API anahtarı',
    consumerApiKeyHint: 'Çağıranlar yerel proxy\'yi kullanırken bu anahtarı Authorization başlığında (Bearer <key>) göndermelidir.',
    localEndpoint: 'Yerel uç nokta',
    authHeader: 'Kimlik doğrulama başlığı',
    tabNode: 'Düğüm', tabRegister: 'Kayıt', tabProvision: 'Token paylaşımı', tabService: 'API servisi',
    logsTitle: 'Günlükler', logsSupplied: 'Sağlanan trafik (yanıtladığım istekler)',
    logsConsumed: 'Tüketilen trafik (gönderdiğim istekler)', logsNoSupplied: 'Henüz sağlanan trafik yok.',
    logsNoConsumed: 'Henüz tüketilen trafik yok.',
    offlineHint: 'Önce Ana sayfa sekmesinden P2P düğümünü başlat.',
    activeHint: '{provider} ({n} model) paylaşıyorsun. Diğer eşler istekleri senin üzerinden yönlendirecek.',
  },
  'uk-UA': {
    navHome: 'Головна', navLogs: 'Журнали', navSettings: 'Параметри',
    pickHint: 'Виберіть пір — локальний HTTP-проксі запуститься на http://127.0.0.1:{port}.',
    noNodes: 'Вузлів немає. Попросіть іншу сторону натиснути «Почати поширювати» на вкладці Головна.',
    proxyPortField: 'Порт локального проксі',
    bootstrapHint: 'Піри, до яких libp2p підключається при старті',
    nodeHint: 'Налаштуйте локальну мережу libp2p: URL реєстру, TCP-порт прослуховування, початкові вузли.',
    registerHint: 'Опублікуйте інформацію про ваш вузол у глобальному реєстрі, щоб інші могли вас знайти.',
    registerHowto: 'Коли ви починаєте поширювати, застосунок надсилає announce в URL реєстру. Також можна вручну зберегти налаштування і натиснути «Почати поширювати» на вкладці Головна.',
    provisionHint: 'Налаштуйте токен LLM, яким ділитесь: виберіть провайдера, вставте API-ключ, позначте моделі.',
    serviceHint: 'Публічний API-сервіс із фіксованим API-ключем — кожен запит перевіряється.',
    consumerApiKey: 'API-ключ споживача',
    consumerApiKeyHint: 'Викликаючі повинні передавати цей ключ у заголовку Authorization (Bearer <key>) під час використання локального проксі.',
    localEndpoint: 'Локальна кінцева точка',
    authHeader: 'Заголовок авторизації',
    tabNode: 'Вузол', tabRegister: 'Реєстрація', tabProvision: 'Поширення токена', tabService: 'API-сервіс',
    logsTitle: 'Журнали', logsSupplied: 'Наданий трафік (запити, які я обробив)',
    logsConsumed: 'Спожитий трафік (запити, які я надіслав)', logsNoSupplied: 'Наданого трафіку поки нема.',
    logsNoConsumed: 'Спожитого трафіку поки нема.',
    offlineHint: 'Спочатку запустіть P2P-вузол на вкладці Головна.',
    activeHint: 'Ви поширюєте {provider} ({n} моделей). Інші піри маршрутизуватимуть запити через вас.',
  },
  'bn-BD': {
    navHome: 'হোম', navLogs: 'লগ', navSettings: 'সেটিংস',
    pickHint: 'একটি পিয়ার নির্বাচন করলে স্থানীয় HTTP প্রক্সি http://127.0.0.1:{port}-এ শুরু হবে।',
    noNodes: 'কোনো নোড নেই। অন্যপক্ষকে হোম ট্যাবে «শেয়ার শুরু» ক্লিক করতে বলুন।',
    proxyPortField: 'স্থানীয় প্রক্সি পোর্ট',
    bootstrapHint: 'libp2p শুরুর সময় যে পিয়ারদের ডায়াল করে',
    nodeHint: 'স্থানীয় libp2p নেটওয়ার্ক কনফিগার করুন: রেজিস্ট্রি URL, TCP লিসেনিং পোর্ট, বুটস্ট্র্যাপ পিয়ার।',
    registerHint: 'অন্যরা আপনাকে খুঁজে পেতে পারে তার জন্য গ্লোবাল রেজিস্ট্রি URL-এ আপনার নোডের তথ্য প্রকাশ করুন।',
    registerHowto: 'শেয়ার শুরু করলে অ্যাপ রেজিস্ট্রি URL-এ একটি announce পাঠায়। আপনি ম্যানুয়ালি সেটিংস সংরক্ষণ করে হোম ট্যাব থেকেও শুরু করতে পারেন।',
    provisionHint: 'আপনার শেয়ার করা LLM টোকেন সেটআপ করুন: প্রোভাইডার নির্বাচন করুন, API কী পেস্ট করুন, মডেল বাছুন।',
    serviceHint: 'একটি নির্দিষ্ট API কী সহ পাবলিক API পরিষেবা প্রকাশ করুন — প্রতিটি অনুরোধ এই কী দিয়ে যাচাই করা হয়।',
    consumerApiKey: 'ভোক্তা API কী',
    consumerApiKeyHint: 'স্থানীয় প্রক্সি ব্যবহার করার সময় কলারকে অবশ্যই Authorization হেডারে (Bearer <key>) এই কী পাঠাতে হবে।',
    localEndpoint: 'স্থানীয় এন্ডপয়েন্ট',
    authHeader: 'অথেন্টিকেশন হেডার',
    tabNode: 'নোড', tabRegister: 'নিবন্ধন', tabProvision: 'টোকেন শেয়ার', tabService: 'API পরিষেবা',
    logsTitle: 'লগ', logsSupplied: 'সরবরাহকৃত ট্রাফিক (আমি যে অনুরোধগুলো পরিবেশন করেছি)',
    logsConsumed: 'ব্যবহৃত ট্রাফিক (আমি যে অনুরোধগুলো পাঠিয়েছি)', logsNoSupplied: 'কোনো সরবরাহকৃত ট্রাফিক নেই।',
    logsNoConsumed: 'কোনো ব্যবহৃত ট্রাফিক নেই।',
    offlineHint: 'প্রথমে হোম ট্যাবে P2P নোড শুরু করুন।',
    activeHint: 'আপনি {provider} ({n} মডেল) শেয়ার করছেন। অন্যান্য পিয়ার আপনার মাধ্যমে অনুরোধ পাঠাবে।',
  },
  'el-GR': {
    navHome: 'Αρχική', navLogs: 'Αρχεία', navSettings: 'Ρυθμίσεις',
    pickHint: 'Επιλέξτε ένα peer και ο τοπικός HTTP proxy θα ξεκινήσει στο http://127.0.0.1:{port}.',
    noNodes: 'Δεν υπάρχουν κόμβοι. Ζητήστε από την άλλη πλευρά να πατήσει «Έναρξη κοινής χρήσης» στην Αρχική.',
    proxyPortField: 'Τοπική θύρα proxy',
    bootstrapHint: 'Peer που καλεί το libp2p κατά την εκκίνηση',
    nodeHint: 'Ρυθμίστε το τοπικό δίκτυο libp2p: URL μητρώου, θύρα ακρόασης TCP, bootstrap peers.',
    registerHint: 'Δημοσιεύστε τις πληροφορίες του κόμβου σας στο παγκόσμιο μητρώο ώστε να σας βρουν.',
    registerHowto: 'Όταν ξεκινήσετε την κοινή χρήση, η εφαρμογή στέλνει ένα announce στο URL του μητρώου. Μπορείτε επίσης να αποθηκεύσετε τις ρυθμίσεις χειροκίνητα και να πατήσετε «Έναρξη κοινής χρήσης» στην Αρχική.',
    provisionHint: 'Ρυθμίστε το LLM token που μοιράζεστε: επιλέξτε πάροχο, επικολλήστε το κλειδί API, τσεκάρετε μοντέλα.',
    serviceHint: 'Δημόσια υπηρεσία API με σταθερό κλειδί API — κάθε αίτημα ελέγχεται.',
    consumerApiKey: 'Κλειδί API καταναλωτή',
    consumerApiKeyHint: 'Οι καλούντες πρέπει να στέλνουν αυτό το κλειδί στην κεφαλίδα Authorization (Bearer <key>) όταν χρησιμοποιούν τον τοπικό proxy.',
    localEndpoint: 'Τοπικό endpoint',
    authHeader: 'Κεφαλίδα πιστοποίησης',
    tabNode: 'Κόμβος', tabRegister: 'Εγγραφή', tabProvision: 'Διαμοιρασμός token', tabService: 'Υπηρεσία API',
    logsTitle: 'Αρχεία', logsSupplied: 'Παρεχόμενη κίνηση (αιτήματα που εξυπηρέτησα)',
    logsConsumed: 'Καταναλωμένη κίνηση (αιτήματα που έστειλα)', logsNoSupplied: 'Καμία παρεχόμενη κίνηση ακόμη.',
    logsNoConsumed: 'Καμία καταναλωμένη κίνηση ακόμη.',
    offlineHint: 'Ξεκινήστε πρώτα τον κόμβο P2P από την Αρχική.',
    activeHint: 'Παρέχετε {provider} ({n} μοντέλα). Άλλοι peer θα δρομολογούν αιτήματα μέσω εσάς.',
  },
  'vi-VN': {
    navHome: 'Trang chính', navLogs: 'Nhật ký', navSettings: 'Cài đặt',
    pickHint: 'Chọn một peer; proxy HTTP cục bộ sẽ khởi động tại http://127.0.0.1:{port}.',
    noNodes: 'Chưa có nút nào. Nhờ phía bên kia bấm «Bắt đầu chia sẻ» ở tab Trang chính.',
    proxyPortField: 'Cổng proxy cục bộ',
    bootstrapHint: 'Peer mà libp2p quay số khi khởi động',
    nodeHint: 'Cấu hình mạng libp2p cục bộ: URL registry, cổng lắng nghe TCP, peer bootstrap.',
    registerHint: 'Công bố thông tin nút của bạn lên URL registry toàn cục để người khác có thể khám phá.',
    registerHowto: 'Khi bạn bắt đầu chia sẻ, ứng dụng sẽ gửi một announce đến URL registry. Bạn cũng có thể lưu cài đặt thủ công rồi bấm «Bắt đầu chia sẻ» ở tab Trang chính.',
    provisionHint: 'Thiết lập token LLM bạn muốn chia sẻ: chọn nhà cung cấp, dán khóa API, chọn mô hình.',
    serviceHint: 'Mở dịch vụ API công khai với một khóa API cố định — mỗi yêu cầu được xác minh bằng khóa đó.',
    consumerApiKey: 'Khóa API người dùng',
    consumerApiKeyHint: 'Bên gọi phải gửi khóa này trong header Authorization (Bearer <key>) khi dùng proxy cục bộ.',
    localEndpoint: 'Điểm cuối cục bộ',
    authHeader: 'Header xác thực',
    tabNode: 'Nút', tabRegister: 'Đăng ký', tabProvision: 'Chia sẻ token', tabService: 'Dịch vụ API',
    logsTitle: 'Nhật ký', logsSupplied: 'Lưu lượng cung cấp (yêu cầu tôi đã phục vụ)',
    logsConsumed: 'Lưu lượng tiêu thụ (yêu cầu tôi đã gửi)', logsNoSupplied: 'Chưa có lưu lượng cung cấp.',
    logsNoConsumed: 'Chưa có lưu lượng tiêu thụ.',
    offlineHint: 'Hãy khởi động nút P2P ở tab Trang chính trước.',
    activeHint: 'Bạn đang chia sẻ {provider} ({n} mô hình). Các peer khác sẽ chuyển tiếp yêu cầu qua bạn.',
  },
};

async function run() {
  for (const [lang, t] of Object.entries(translations)) {
    const file = path.join(i18nDir, `${lang}.ts`);
    const text = await fs.readFile(file, 'utf-8');
    // Replace nav block
    const navBlock = `  nav: {\n    home: '${t.navHome}',\n    logs: '${t.navLogs}',\n    settings: '${t.navSettings}',\n  },`;
    const next = text.replace(/  nav:\s*\{[\s\S]*?\},/, navBlock);

    // Replace consume.pickHint + consume.noNodes
    // Replace pickHint / noNodes / offlineHint / activeHint even when the
    // translation contains apostrophes (Italian / French / Turkish use them
    // a lot). Strategy: find the key line, splice the whole line.
    function replaceKeyLine(src, key, value) {
      const re = new RegExp(`(    ${key}: ')(.*?)(',\\n)`);
      const m = src.match(re);
      if (!m) return src;
      const safe = String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return src.replace(re, `$1${safe}$3`);
    }
    let out = next;
    out = replaceKeyLine(out, 'pickHint', t.pickHint);
    out = replaceKeyLine(out, 'noNodes', t.noNodes);
    out = replaceKeyLine(out, 'offlineHint', t.offlineHint);
    out = replaceKeyLine(out, 'activeHint', t.activeHint);

    // Drop any existing settings/logs derived keys so we can append fresh ones.
    let merged = out;
    const dropKeys = ['tab', 'nodeHint', 'registerHint', 'registerHowto',
      'provisionHint', 'serviceHint', 'consumerApiKey', 'consumerApiKeyHint',
      'localEndpoint', 'authHeader', 'proxyPortField', 'bootstrapHint'];
    for (const k of dropKeys) {
      merged = merged.replace(new RegExp(`\\n    ${k}:\\s*(\\{[^}]*\\}|'[^']*'),?`), '');
    }
    // Also drop any existing logs block so we re-emit it cleanly.
    merged = merged.replace(/\n  logs:\s*\{[\s\S]*?\n  \},\n/, '\n');

    // Append all new keys (always, even if they were missing) right before the
    // closing `}` of the settings block.
    const q = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const settingsAppend =
      `\n    proxyPortField: '${q(t.proxyPortField)}',\n` +
      `    bootstrapHint: '${q(t.bootstrapHint)}',\n` +
      `    tab: {\n` +
      `      node: '${q(t.tabNode)}',\n` +
      `      register: '${q(t.tabRegister)}',\n` +
      `      provision: '${q(t.tabProvision)}',\n` +
      `      service: '${q(t.tabService)}',\n` +
      `    },\n` +
      `    nodeHint: '${q(t.nodeHint)}',\n` +
      `    registerHint: '${q(t.registerHint)}',\n` +
      `    registerHowto: '${q(t.registerHowto)}',\n` +
      `    provisionHint: '${q(t.provisionHint)}',\n` +
      `    serviceHint: '${q(t.serviceHint)}',\n` +
      `    consumerApiKey: '${q(t.consumerApiKey)}',\n` +
      `    consumerApiKeyHint: '${q(t.consumerApiKeyHint)}',\n` +
      `    localEndpoint: '${q(t.localEndpoint)}',\n` +
      `    authHeader: '${q(t.authHeader)}',\n` +
      `  },`;
    merged = merged.replace(
      /(\n  settings:\s*\{[\s\S]*?)(  \},\n)/,
      `$1${settingsAppend}\n`
    );

    const logsBlock =
      `  logs: {\n` +
      `    title: '${q(t.logsTitle)}',\n` +
      `    supplied: '${q(t.logsSupplied)}',\n` +
      `    consumed: '${q(t.logsConsumed)}',\n` +
      `    noSupplied: '${q(t.logsNoSupplied)}',\n` +
      `    noConsumed: '${q(t.logsNoConsumed)}',\n` +
      `  },\n`;
    // Insert logs block right before the closing `};` at the end of the dict.
    merged = merged.replace(
      /(\n\};)\s*$/,
      `\n${logsBlock}$1`
    );
    out = merged;

    await fs.writeFile(file, out);
    console.log(`updated ${lang}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
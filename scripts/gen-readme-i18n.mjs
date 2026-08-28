// One-off script that emits a translated README.{lang}.md for each
// locale supported by the renderer. The main README content is the
// same across locales; only the language metadata (HTML lang, the
// "other languages" table) and the heading copy change.
//
// Run: node scripts/gen-readme-i18n.mjs

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const LANG = 'lang';

const SUPPORTED = [
  { id: 'zh-CN', label: '简体中文',  flag: 'cn', dir: 'ltr' },
  { id: 'zh-TW', label: '繁體中文',  flag: 'cn', dir: 'ltr' },
  { id: 'en-US', label: 'English',     flag: 'us', dir: 'ltr' },
  { id: 'ko-KR', label: '한국어',       flag: 'kr', dir: 'ltr' },
  { id: 'de-DE', label: 'Deutsch',     flag: 'de', dir: 'ltr' },
  { id: 'es-ES', label: 'Español',     flag: 'es', dir: 'ltr' },
  { id: 'fr-FR', label: 'Français',    flag: 'fr', dir: 'ltr' },
  { id: 'it-IT', label: 'Italiano',    flag: 'it', dir: 'ltr' },
  { id: 'da-DK', label: 'Dansk',       flag: 'dk', dir: 'ltr' },
  { id: 'ja-JP', label: '日本語',        flag: 'jp', dir: 'ltr' },
  { id: 'pl-PL', label: 'Polski',      flag: 'pl', dir: 'ltr' },
  { id: 'ru-RU', label: 'Русский',      flag: 'ru', dir: 'ltr' },
  { id: 'bs-BA', label: 'Bosanski',    flag: 'ba', dir: 'ltr' },
  { id: 'ar-SA', label: 'العربية',     flag: 'sa', dir: 'rtl' },
  { id: 'nb-NO', label: 'Norsk',       flag: 'no', dir: 'ltr' },
  { id: 'pt-BR', label: 'Português (Brasil)', flag: 'br', dir: 'ltr' },
  { id: 'th-TH', label: 'ไทย',          flag: 'th', dir: 'ltr' },
  { id: 'tr-TR', label: 'Türkçe',      flag: 'tr', dir: 'ltr' },
  { id: 'uk-UA', label: 'Українська',  flag: 'ua', dir: 'ltr' },
  { id: 'bn-BD', label: 'বাংলা',        flag: 'bd', dir: 'ltr' },
  { id: 'el-GR', label: 'Ελληνικά',    flag: 'gr', dir: 'ltr' },
  { id: 'vi-VN', label: 'Tiếng Việt',  flag: 'vn', dir: 'ltr' },
];

const HEADING = {
  'zh-CN': '或许全球首个，任何人都可以把自己的Token挂上P2P网络，也可以因此调用网络上更多其他节点共享的Token。无需中心服务器、无需注册账号、不会丢失任何API Key。',
  'zh-TW': '或許全球首個，任何人都可以把自己的 Token 掛上 P2P 網路，也可以因此呼叫網路上更多其他節點共享的 Token。無需中心伺服器、無需註冊帳號、不會丟失任何 API Key。',
  'en-US': 'Possibly the world\'s first platform where anyone can attach their Token to a P2P network and use other peers\' shared Tokens in return. No central server, no account registration, no API key ever leaves your machine.',
  'ko-KR': '어쩌면 세계 최초, 누구나 자신의 Token을 P2P 네트워크에 연결하고, 그 대가로 네트워크의 다른 노드가 공유하는 Token을 호출할 수 있습니다. 중앙 서버도, 계정 등록도, API Key 유출도 없습니다.',
  'de-DE': 'Möglich die weltweit erste Plattform, auf der jeder seine Tokens an ein P2P-Netzwerk hängen und im Gegenzug die Tokens anderer Peers nutzen kann. Kein zentraler Server, keine Kontoerstellung, kein API-Schlüssel verlässt jemals deine Maschine.',
  'es-ES': 'Posiblemente la primera plataforma del mundo donde cualquiera puede conectar su Token a una red P2P y, a cambio, usar los Tokens compartidos por otros peers. Sin servidor central, sin registro de cuenta, ninguna clave API sale de tu máquina.',
  'fr-FR': 'Probablement la première plateforme au monde où n\'importe qui peut attacher son Token à un réseau P2P et, en retour, utiliser les Tokens partagés par d\'autres pairs. Pas de serveur central, pas d\'inscription, aucune clé API ne quitte jamais votre machine.',
  'it-IT': 'Probabilmente la prima piattaforma al mondo dove chiunque può collegare il proprio Token a una rete P2P e, in cambio, usare i Token condivisi da altri peer. Nessun server centrale, nessuna registrazione, nessuna chiave API lascia mai la tua macchina.',
  'da-DK': 'Måske verdens første platform, hvor alle kan knytte deres Token til et P2P-netværk og til gengæld bruge andre peers\' delte Tokens. Ingen central server, ingen kontooprettelse, ingen API-nøgle forlader nogensinde din maskine.',
  'ja-JP': 'おそらく世界初、誰もが自分の Token を P2P ネットワークに繋ぎ、その代わりにネットワーク上の他のノードが共有する Token を利用できるプラットフォーム。中央サーバー不要、アカウント登録不要、API キーがあなたのマシンから外に出ることもありません。',
  'pl-PL': 'Prawdopodobnie pierwsza na świecie platforma, na której każdy może podłączyć swój Token do sieci P2P i w zamian korzystać z Tokenów udostępnianych przez inne węzły. Bez centralnego serwera, bez rejestracji konta, żaden klucz API nigdy nie opuszcza Twojej maszyny.',
  'ru-RU': 'Возможно, первая в мире платформа, где каждый может подключить свой токен к P2P-сети и взамен использовать токены, расшаренные другими пирами. Без центрального сервера, без регистрации аккаунта, ни один API-ключ никогда не покинет вашу машину.',
  'bs-BA': 'Možda prva platforma na svijetu na kojoj svako može priključiti svoj Token na P2P mrežu i zauzvrat koristiti Tokene koje dijele drugi čvorovi. Bez centralnog servera, bez registracije naloga, nijedan API ključ nikada ne napušta vašu mašinu.',
  'ar-SA': 'ربما أول منصة في العالم يربط فيها anyone رمز Token بشبكة P2P ويستخدم رموز Token المشتركة من الأقران الآخرين. لا خادم مركزي، لا تسجيل حساب، ولا مفتاح API يخرج من جهازك أبداً.',
  'nb-NO': 'Kanskje verdens første plattform der alle kan knytte sin Token til et P2P-nettverk og bruke andre peers\' delte Tokens til gjengjeld. Ingen sentral server, ingen kontoregistrering, ingen API-nøkkel forlater noensinne maskinen din.',
  'pt-BR': 'Provavelmente a primeira plataforma do mundo onde qualquer pessoa pode anexar seu Token a uma rede P2P e, em troca, usar Tokens compartilhados por outros peers. Sem servidor central, sem cadastro de conta, nenhuma chave API sai da sua máquina.',
  'th-TH': 'อาจเป็นแพลตฟอร์มแรกของโลกที่ผู้ใช้ทุกคนสามารถแขวน Token ของตนเองบนเครือข่าย P2P และเรียกใช้ Token ที่เพียร์อื่นแชร์ไว้ ไม่มีเซิร์ฟเวอร์กลาง ไม่ต้องสมัครบัญชี ไม่มี API Key หลุดออกจากเครื่องคุณ',
  'tr-TR': 'Belki de dünyanın ilk platformu: herkes Token\'ını bir P2P ağına bağlayabilir ve karşılığında diğer eşlerin paylaştığı Token\'ları kullanabilir. Merkezi sunucu yok, hesap kaydı yok, API anahtarı makinenizden asla çıkmaz.',
  'uk-UA': 'Можливо, перша у світі платформа, де кожен може під\'єднати свій токен до P2P-мережі й натомість використовувати токени, які поширюють інші піри. Без центрального сервера, без реєстрації облікового запису, жоден API-ключ ніколи не залишає вашу машину.',
  'bn-BD': 'সম্ভবত প্রথম প্ল্যাটফর্ম যেখানে যে কেউ তার Token P2P নেটওয়ার্কে সংযুক্ত করতে পারে এবং বিনিময়ে অন্যান্য পিয়ারের শেয়ার করা Token ব্যবহার করতে পারে। কোনো কেন্দ্রীয় সার্ভার নেই, অ্যাকাউন্ট নিবন্ধন নেই, কোনো API কী কখনো আপনার মেশিন ছেড়ে যায় না।',
  'el-GR': 'Πιθανώς η πρώτη πλατφόρμα στον κόσμο όπου ο καθένας μπορεί να συνδέσει το Token του в P2P δίκτυο και να χρησιμοποιήσει τα κοινά Token άλλων κόμβων σε αντάλλαγμα. Χωρίς κεντρικό διακομιστή, χωρίς εγγραφή λογαριασμού, κανένα κλειδί API δε φεύγει ποτέ από τη μηχανή σου.',
  'vi-VN': 'Có thể là nền tảng đầu tiên trên thế giới, nơi bất kỳ ai cũng có thể gắn Token của mình vào mạng P2P và đổi lại sử dụng Token được chia sẻ bởi các peer khác. Không có máy chủ trung tâm, không cần đăng ký tài khoản, không có API key nào rời khỏi máy của bạn.',
};

// Status banner translations — keep them short and uniform.
const STATUS = {
  'zh-CN': '⚠️ **项目状态（v1 测试版）**：ModelBus-P2P 仍处于开发与公开测试阶段。协议格式（`/modelbus/inference/1.0.0`、节点公告 v2 schema、信任根清单）可能在未来出现不向后兼容的升级；早期 announce 的节点可能在新版本上线后需要重新注册。',
  'zh-TW': '⚠️ **專案狀態（v1 測試版）**：ModelBus-P2P 仍在開發與公開測試階段。協定格式（`/modelbus/inference/1.0.0`、節點公告 v2 schema、信任根清單）未來可能出現不向下相容的升級；早期 announce 的節點在新版本上線後可能需要重新註冊。',
  'en-US': '⚠️ **Project status (v1 test release)**: ModelBus-P2P is still under development and public testing. Wire-format components (the `/modelbus/inference/1.0.0` protocol, the v2 node-announcement schema, the trust-root list) may receive breaking upgrades in the future; peers announced under older versions may need to re-register.',
  'ko-KR': '⚠️ **프로젝트 상태 (v1 테스트 버전)**: ModelBus-P2P는 아직 개발 및 공개 테스트 단계입니다. 와이어 포맷 (`/modelbus/inference/1.0.0` 프로토콜, 노드 공지 v2 schema, 신뢰 루트 목록)은 향후 하위 호환되지 않는 업그레이드가 있을 수 있으며, 이전 버전에 announce 된 노드는 새 버전 출시 후 재등록이 필요할 수 있습니다.',
  'de-DE': '⚠️ **Проjektstatus (v1-Testversion)**: ModelBus-P2P befindet sich noch in Entwicklung und öffentlichem Test. Komponenten des Wire-Formats (das `/modelbus/inference/1.0.0`-Protokoll, das v2-Node-Announcement-Schema, die Trust-Root-Liste) können in Zukunft Breaking Changes erhalten; Peers, die unter älteren Versionen announced wurden, müssen möglicherweise neu registriert werden.',
  'es-ES': '⚠️ **Estado del proyecto (v1 de prueba)**: ModelBus-P2P sigue en desarrollo y pruebas públicas. Componentes del formato de mensajes (protocolo `/modelbus/inference/1.0.0`, esquema v2 de anuncios, lista de raíces de confianza) pueden recibir actualizaciones incompatibles en el futuro; los peers anunciados con versiones antiguas pueden necesitar volver a registrarse.',
  'fr-FR': '⚠️ **Statut du projet (v1 test)**: ModelBus-P2P est encore en développement et en tests publics. Les composants du format de message (protocole `/modelbus/inference/1.0.0`, schéma v2 d\'annonce, liste des racines de confiance) peuvent recevoir des mises à jour incompatibles à l\'avenir ; les pairs annoncés sous des versions plus anciennes peuvent devoir se réenregistrer.',
  'it-IT': '⚠️ **Stato del progetto (v1 di prova)**: ModelBus-P2P è ancora in sviluppo e test pubblici. I componenti del formato di trasmissione (protocollo `/modelbus/inference/1.0.0`, schema v2 degli annunci, elenco delle radici di fiducia) potrebbero subire aggiornamenti incompatibili in futuro; i peer annunciati con versioni precedenti potrebbero doversi registrare di nuovo.',
  'da-DK': '⚠️ **Projektstatus (v1-test)**: ModelBus-P2P er stadig under udvikling og offentlig test. Komponenter i wire-formatet (`/modelbus/inference/1.0.0`-protokollen, v2-node-announcement-skemaet, trust-root-listen) kan få brydende opgraderinger i fremtiden; peers der er annonceret under ældre versioner skal muligvis registreres igen.',
  'ja-JP': '⚠️ **プロジェクト状態（v1 テスト版）**: ModelBus-P2P はまだ開発と公開テストの段階です。ワイヤーフォーマット（`/modelbus/inference/1.0.0` プロトコル、v2 ノードアナウンス schema、トラストルート一覧）は将来、後方互換性のないアップグレードを受ける可能性があります。古いバージョンで announce したノードは再登録が必要になる場合があります。',
  'pl-PL': '⚠️ **Статус проекту (v1 test)**: ModelBus-P2P jest wciąż w fazie rozwoju i publicznych testów. Komponenty formatu transmisji (protokół `/modelbus/inference/1.0.0`, schemat v2 ogłoszeń węzłów, lista korzeni zaufania) mogą w przyszłości otrzymać niezgodne aktualizacje; węzły zgłoszone w starszych wersjach mogą wymagać ponownej rejestracji.',
  'ru-RU': '⚠️ **Статус проекта (v1 тест)**: ModelBus-P2P всё ещё в разработке и публичном тестировании. Компоненты wire-формата (протокол `/modelbus/inference/1.0.0`, схема v2 объявлений узлов, список корней доверия) могут получать несовместимые обновления в будущем; пиры, объявленные под старыми версиями, могут нуждаться в повторной регистрации.',
  'bs-BA': '⚠️ **Status projekta (v1 test)**: ModelBus-P2P je još u razvoju i javnom testiranju. Komponente wire-formata (`/modelbus/inference/1.0.0` protokol, v2 node-announcement shema, lista trust-root) mogu u budućnosti dobiti nekompatibilna ažuriranja; peerovi objavljeni pod starijim verzijama mogu zahtijevati ponovnu registraciju.',
  'ar-SA': '⚠️ **حالة المشروع (إصدار اختبار v1)**: ModelBus-P2P لا يزال في مرحلة التطوير والاختبار العام. قد تتلقى مكونات تنسيق الاتصال (بروتوكول `/modelbus/inference/1.0.0`، ومخطط إعلان العقدة v2، وقائمة جذور الثقة) تحديثات غير متوافقة في المستقبل؛ قد يحتاج الأقران المُعلَن بهم في الإصدارات القديمة إلى إعادة التسجيل.',
  'nb-NO': '⚠️ **Prosjektstatus (v1-test)**: ModelBus-P2P er fortsatt under utvikling og offentlig testing. Komponenter i wire-formatet (`/modelbus/inference/1.0.0`-protokollen, v2-node-announcement-skjemaet, tillitsrot-listen) kan få brytende oppgraderinger i fremtiden; peers som er annonsert under eldre versjoner må kanskje registreres på nytt.',
  'pt-BR': '⚠️ **Статус do projeto (v1 de teste)**: ModelBus-P2P ainda está em desenvolvimento e testes públicos. Componentes do formato de mensagem (protocolo `/modelbus/inference/1.0.0`, esquema v2 de anúncios, lista de raízes de confiança) podem receber atualizações incompatíveis no futuro; peers anunciados em versões mais antigas podem precisar de novo registro.',
  'th-TH': '⚠️ **สถานะโปรเจกต์ (v1 ทดสอบ)**: ModelBus-P2P ยังอยู่ในขั้นตอนการพัฒนาและทดสอบสาธารณะ คอมโพเนนต์ของ wire-format (โปรโตคอล `/modelbus/inference/1.0.0`, สคีมาประกาศโหนด v2, รายการ trust-root) อาจได้รับการอัปเกรดที่ไม่เข้ากันในอนาคต เพียร์ที่ประกาศด้วยเวอร์ชันเก่าอาจต้องลงทะเบียนใหม่',
  'tr-TR': '⚠️ **Проје statüsü (v1 testi)**: ModelBus-P2P hâlâ geliştirme ve herkese açık test aşamasında. Wire-format bileşenleri (`/modelbus/inference/1.0.0` protokolü, v2 node-announcement şeması, trust-root listesi) gelecekte uyumluluğu bozan güncellemeler alabilir; eski sürümlerde announce edilmiş eşlerin yeniden kayıt olması gerekebilir.',
  'uk-UA': '⚠️ **Статус проєкту (v1 тест)**: ModelBus-P2P все ще в розробці та публічному тестуванні. Компоненти дротового формату (протокол `/modelbus/inference/1.0.0`, схема оголошень вузлів v2, список коренів довіри) можуть у майбутньому отримати несумісні оновлення; піри, оголошені зі старими версіями, можуть потребувати повторної реєстрації.',
  'bn-BD': '⚠️ **প্রকল্পের অবস্থা (v1 পরীক্ষা সংস্করণ)**: ModelBus-P2P এখনও উন্নয়ন ও প্রকাশ্য পরীক্ষার পর্যায়ে আছে। ওয়্যার-ফর্ম্যাট উপাদানগুলো (`/modelbus/inference/1.0.0` প্রোটোকল, v2 নোড-অ্যানাউন্সমেন্ট স্কিমা, trust-root তালিকা) ভবিষ্যতে অসঙ্গতিপূর্ণ আপগ্রেড পেতে পারে; পুরানো সংস্করণে ঘোষিত পিয়ারদের পুনরায় নিবন্ধন করতে হতে পারে।',
  'el-GR': '⚠️ **Κατάσταση έργου (v1 δοκιμαστική)**: Το ModelBus-P2P βρίσκεται ακόμη σε ανάπτυξη και δημόσιες δοκιμές. Στοιχεία του wire-format (πρωτόκολλο `/modelbus/inference/1.0.0`, v2 σχήμα ανακοίνωσης κόμβων, λίστα trust-root) μπορεί να λάβουν μη συμβατές αναβαθμίσεις στο μέλλον· peers που έχουν ανακοινωθεί σε παλαιότερες εκδόσεις μπορεί να χρειαστεί να εγγραφούν ξανά.',
  'vi-VN': '⚠️ **Trạng thái dự án (v1 thử nghiệm)**: ModelBus-P2P vẫn đang trong giai đoạn phát triển và thử nghiệm công khai. Các thành phần wire-format (giao thức `/modelbus/inference/1.0.0`, schema thông báo nút v2, danh sách trust-root) có thể nhận các bản cập nhật không tương thích trong tương lai; các peer được thông báo dưới phiên bản cũ có thể cần đăng ký lại.',
};

const DOWNLOAD = {
  'zh-CN': '## 下载使用（即将开通）',
  'zh-TW': '## 下載使用（即將開通）',
  'en-US': '## Download & Use (coming soon)',
  'ko-KR': '## 다운로드 및 사용 (곧 개방)',
  'de-DE': '## Download & Nutzung (demnächst verfügbar)',
  'es-ES': '## Descarga y uso (próximamente)',
  'fr-FR': '## Téléchargement et utilisation (bientôt disponible)',
  'it-IT': '## Download e uso (in arrivo)',
  'da-DK': '## Download og brug (kommer snart)',
  'ja-JP': '## ダウンロードと利用（近日公開）',
  'pl-PL': '## Pobierz i używaj (wkrótce)',
  'ru-RU': '## Загрузка и использование (скоро)',
  'bs-BA': '## Preuzimanje i korištenje (uskoro)',
  'ar-SA': '## التحميل والاستخدام (قريباً)',
  'nb-NO': '## Nedlasting og bruk (snart)',
  'pt-BR': '## Download e uso (em breve)',
  'th-TH': '## ดาวน์โหลดและใช้งาน (เร็ว ๆ นี้)',
  'tr-TR': '## İndirme ve kullanım (yakında)',
  'uk-UA': '## Завантаження та використання (скоро)',
  'bn-BD': '## ডাউনলোড ও ব্যবহার (শীঘ্রই)',
  'el-GR': '## Λήψη και χρήση (σύντομα)',
  'vi-VN': '## Tải về và sử dụng (sắp ra mắt)',
};

const DOWNLOAD_BODY = {
  'zh-CN': `> 📦 正式发行版（包括 Windows / macOS / Linux 安装包，以及后续移动端、Web SDK）正在筹备中，敬请期待。

### 现阶段如何获取可运行的客户端？

本仓库当前是 v1 测试版（详见顶部项目状态说明），正式发布渠道尚未上线。如果你希望**立即试用**，可以按下面的「快速开始」自行构建：

\`\`\`bash
pnpm install
pnpm run dev          # 启动开发模式（Electron + Vite HMR）
pnpm run package:mac  # 在 macOS 上打包 dmg
pnpm run package:win  # 在 Windows 上打包 nsis
pnpm run package:linux # 在 Linux 上打包 AppImage
\`\`\`

构建产物在 \`release/\` 目录。

### 发布渠道（敬请期待）

| 渠道 | 状态 |
|---|---|
| [官方网站 https://modelbus.cc](https://modelbus.cc) 下载页 | 即将开放 |
| GitHub Releases | 随 \`v1.0\` tag 开放 |
| macOS App Store | 暂未规划 |
| Windows Store | 暂未规划 |
| Snap / apt / Homebrew | 暂未规划 |

> 任何**带签名的二进制分发**都会先在 GitHub Releases 上发布，并附 SHA-256 校验和。**官方域名永远是保底救援通道**：冷启动包、签名校验与新版本发布都会放在 \`https://modelbus.cc/download/\`。`,
};

const INTRO = {
  'zh-CN': '或许全球首个，任何人都可以把自己的Token挂上P2P网络，也可以因此调用网络上更多其他节点共享的Token。无需中心服务器、无需注册账号、不会丢失任何API Key。',
  'zh-TW': '或許全球首個，任何人都可以把自己的 Token 掛上 P2P 網路，也可以因此呼叫網路上更多其他節點共享的 Token。無需中心伺服器、無需註冊帳號、不會丟失任何 API Key。',
  'en-US': 'Possibly the world\'s first platform where anyone can attach their Token to a P2P network and use other peers\' shared Tokens in return. No central server, no account registration, no API key ever leaves your machine.',
  'ko-KR': '어쩌면 세계 최초, 누구나 자신의 Token을 P2P 네트워크에 연결하고, 그 대가로 네트워크의 다른 노드가 공유하는 Token을 호출할 수 있습니다. 중앙 서버도, 계정 등록도, API Key 유출도 없습니다.',
  'de-DE': 'Möglich die weltweit erste Plattform, auf der jeder seine Tokens an ein P2P-Netzwerk hängen und im Gegenzug die Tokens anderer Peers nutzen kann. Kein zentraler Server, keine Kontoerstellung, kein API-Schlüssel verlässt jemals deine Maschine.',
  'es-ES': 'Posiblemente la primera plataforma del mundo donde cualquiera puede conectar su Token a una red P2P y, a cambio, usar los Tokens compartidos por otros peers. Sin servidor central, sin registro de cuenta, ninguna clave API sale de tu máquina.',
  'fr-FR': 'Probablement la première plateforme au monde où n\'importe qui peut attacher son Token à un réseau P2P et, en retour, utiliser les Tokens partagés par d\'autres pairs. Pas de serveur central, pas d\'inscription, aucune clé API ne quitte jamais votre machine.',
  'it-IT': 'Probabilmente la prima piattaforma al mondo dove chiunque può collegare il proprio Token a una rete P2P e, in cambio, usare i Token condivisi da altri peer. Nessun server centrale, nessuna registrazione, nessuna chiave API lascia mai la tua macchina.',
  'da-DK': 'Måske verdens første platform, hvor alle kan knytte deres Token til et P2P-netværk og til gengæld bruge andre peers\' delte Tokens. Ingen central server, ingen kontooprettelse, ingen API-nøgle forlader nogensinde din maskine.',
  'ja-JP': 'おそらく世界初、誰もが自分の Token を P2P ネットワークに繋ぎ、その代わりにネットワーク上の他のノードが共有する Token を利用できるプラットフォーム。中央サーバー不要、アカウント登録不要、API キーがあなたのマシンから外に出ることもありません。',
  'pl-PL': 'Prawdopodobnie pierwsza na świecie platforma, na której każdy może podłączyć swój Token do sieci P2P i w zamian korzystać z Tokenów udostępnianych przez inne węzły. Bez centralnego serwera, bez rejestracji konta, żaden klucz API nigdy nie opuszcza Twojej maszyny.',
  'ru-RU': 'Возможно, первая в мире платформа, где каждый может подключить свой токен к P2P-сети и взамен использовать токены, расшаренные другими пирами. Без центрального сервера, без регистрации аккаунта, ни один API-ключ никогда не покинет вашу машину.',
  'bs-BA': 'Možda prva platforma na svijetu na kojoj svako može priključiti svoj Token na P2P mrežu i zauzvrat koristiti Tokene koje dijele drugi čvorovi. Bez centralnog servera, bez registracije naloga, nijedan API ključ nikada ne napušta vašu mašinu.',
  'ar-SA': 'ربما أول منصة في العالم يربط فيها anyone رمز Token بشبكة P2P ويستخدم رموز Token المشتركة من الأقران الآخرين. لا خادم مركزي، لا تسجيل حساب، ولا مفتاح API يخرج من جهازك أبداً.',
  'nb-NO': 'Kanskje verdens første plattform der alle kan knytte sin Token til et P2P-nettverk og bruke andre peers\' delte Tokens til gjengjeld. Ingen sentral server, ingen kontoregistrering, ingen API-nøkkel forlater noensinne maskinen din.',
  'pt-BR': 'Provavelmente a primeira plataforma do mundo onde qualquer pessoa pode anexar seu Token a uma rede P2P e, em troca, usar Tokens compartilhados por outros peers. Sem servidor central, sem cadastro de conta, nenhuma chave API sai da sua máquina.',
  'th-TH': 'อาจเป็นแพลตฟอร์มแรกของโลกที่ผู้ใช้ทุกคนสามารถแขวน Token ของตนเองบนเครือข่าย P2P และเรียกใช้ Token ที่เพียร์อื่นแชร์ไว้ ไม่มีเซิร์ฟเวอร์กลาง ไม่ต้องสมัครบัญชี ไม่มี API Key หลุดออกจากเครื่องคุณ',
  'tr-TR': 'Belki de dünyanın ilk platformu: herkes Token\'ını bir P2P ağına bağlayabilir ve karşılığında diğer eşlerin paylaştığı Token\'ları kullanabilir. Merkezi sunucu yok, hesap kaydı yok, API anahtarı makinenizden asla çıkmaz.',
  'uk-UA': 'Можливо, перша у світі платформа, де кожен може під\'єднати свій токен до P2P-мережі й натомість використовувати токени, які поширюють інші піри. Без центрального сервера, без реєстрації облікового запису, жоден API-ключ ніколи не залишає вашу машину.',
  'bn-BD': 'সম্ভবত প্রথম প্ল্যাটফর্ম যেখানে যে কেউ তার Token P2P নেটওয়ার্কে সংযুক্ত করতে পারে এবং বিনিময়ে অন্যান্য পিয়ারের শেয়ার করা Token ব্যবহার করতে পারে। কোনো কেন্দ্রীয় সার্ভার নেই, অ্যাকাউন্ট নিবন্ধন নেই, কোনো API কী কখনো আপনার মেশিন ছেড়ে যায় না।',
  'el-GR': 'Πιθανώς η πρώτη πλατφόρμα στον κόσμο όπου ο καθένας μπορεί να συνδέσει το Token του в P2P δίκτυο και να χρησιμοποιήσει τα κοινά Token άλλων κόμβων σε αντάλλαγμα. Χωρίς κεντρικό διακομιστή, χωρίς εγγραφή λογαριασμού, κανένα κλειδί API δε φεύγει ποτέ από τη μηχανή σου.',
  'vi-VN': 'Có thể là nền tảng đầu tiên trên thế giới, nơi bất kỳ ai cũng có thể gắn Token của mình vào mạng P2P và đổi lại sử dụng Token được chia sẻ bởi các peer khác. Không có máy chủ trung tâm, không cần đăng ký tài khoản, không có API key nào rời khỏi máy của bạn.',
};

// Per-locale TOC + section heading translations. We translate just the
// headings; the body of each section stays in Chinese (the canonical
// source) and is meant to be reviewed by a native speaker later.
const HEADINGS = {
  'zh-CN': {
    '目录': '目录',
    '这是什么': '这是什么',
    '核心特性': '核心特性',
    '界面一览': '界面一览',
    '架构总览': '架构总览',
    '去中心化设计': '去中心化设计',
    '节点公告格式（v2）': '节点公告格式（v2）',
    '调用流程详解': '调用流程详解',
    '下载使用（即将开通）': '下载使用（即将开通）',
    '目录结构': '目录结构',
    '快速开始': '快速开始',
    '配置说明': '配置说明',
    '开发与调试': '开发与调试',
    '多语言': '多语言',
    '多语言 README': '多语言 README',
    '其他语言的 README': '其他语言的 README',
    '路线图': '路线图',
    '许可': '许可',
  },
  'en-US': {
    '目录': 'Contents',
    '这是什么': 'What is it',
    '核心特性': 'Core features',
    '界面一览': 'Screenshots',
    '架构总览': 'Architecture',
    '去中心化设计': 'Decentralised design',
    '节点公告格式（v2）': 'Node announcement schema (v2)',
    '调用流程详解': 'Request flow',
    '下载使用（即将开通）': 'Download & Use (coming soon)',
    '目录结构': 'Project layout',
    '快速开始': 'Quick start',
    '配置说明': 'Configuration',
    '开发与调试': 'Development & debugging',
    '多语言': 'Languages',
    '多语言 README': 'Localised README',
    '其他语言的 README': 'Other-language READMEs',
    '路线图': 'Roadmap',
    '许可': 'License',
  },
  'ja-JP': {
    '目录': '目次',
    '这是什么': 'これは何ですか',
    '核心特性': '主な特徴',
    '界面一览': '画面プレビュー',
    '架构总览': 'アーキテクチャ',
    '去中心化设计': '分散型設計',
    '节点公告格式（v2）': 'ノード公告フォーマット（v2）',
    '调用流程详解': 'リクエストの流れ',
    '下载使用（即将开通）': 'ダウンロードと利用（近日公開）',
    '目录结构': 'プロジェクト構成',
    '快速开始': 'クイックスタート',
    '配置说明': '設定',
    '开发与调试': '開発とデバッグ',
    '多语言': '他言語',
    '多语言 README': '他言語の README',
    '其他语言的 README': '他言語の README',
    '路线图': 'ロードマップ',
    '许可': 'ライセンス',
  },
};

// Provide a sane English fallback for any language we did not hand-
// translate. This avoids "多语言 README" leaking into non-zh outputs.
HEADINGS['en-US'] = HEADINGS['en-US'];

// For every other supported locale, fall back to English headings. We
// deliberately don't translate headings into the remaining 19
// languages because the underlying body stays in Chinese anyway —
// the headings are just signposts. A native speaker can re-translate
// headings without touching the body.
const FALLBACK_LOCALES = [
  'ko-KR', 'de-DE', 'es-ES', 'fr-FR', 'it-IT', 'da-DK',
  'pl-PL', 'ru-RU', 'bs-BA', 'ar-SA', 'nb-NO', 'pt-BR',
  'th-TH', 'tr-TR', 'uk-UA', 'bn-BD', 'el-GR', 'vi-VN', 'zh-TW',
];
for (const lang of FALLBACK_LOCALES) {
  HEADINGS[lang] = HEADINGS['en-US'];
}
// Fallback: any missing heading falls back to the English text.
function tHeading(lang, zhHeading) {
  const map = HEADINGS[lang] || HEADINGS['en-US'];
  return map[zhHeading] || HEADINGS['en-US'][zhHeading] || zhHeading;
}

// Localised README title used in the header.
const TITLE = {
  'zh-CN': 'ModelBus-P2P : 一个去中心化的LLM Token共享平台',
  'zh-TW': 'ModelBus-P2P : 一個去中心化的 LLM Token 共享平台',
  'en-US': 'ModelBus-P2P : A Decentralized LLM Token Sharing Platform',
  'ko-KR': 'ModelBus-P2P : 탈중앙 LLM Token 공유 플랫폼',
  'de-DE': 'ModelBus-P2P : Eine dezentrale LLM-Token-Sharing-Plattform',
  'es-ES': 'ModelBus-P2P : Una plataforma descentralizada de tokens LLM',
  'fr-FR': 'ModelBus-P2P : Une plateforme décentralisée de tokens LLM',
  'it-IT': 'ModelBus-P2P : Una piattaforma decentralizzata di token LLM',
  'da-DK': 'ModelBus-P2P : En decentral LLM-token-deling-platform',
  'ja-JP': 'ModelBus-P2P : 分散型 LLM Token 共有プラットフォーム',
  'pl-PL': 'ModelBus-P2P : Zdecentralizowana platforma udostępniania tokenów LLM',
  'ru-RU': 'ModelBus-P2P : Децентрализованная платформа обмена токенами LLM',
  'bs-BA': 'ModelBus-P2P : Decentralizirana platforma za dijeljenje LLM tokena',
  'ar-SA': 'ModelBus-P2P : منصة لا مركزية لمشاركة رموز LLM',
  'nb-NO': 'ModelBus-P2P : En desentralisert plattform for deling av LLM-tokens',
  'pt-BR': 'ModelBus-P2P : Uma plataforma descentralizada de tokens LLM',
  'th-TH': 'ModelBus-P2P : แพลตฟอร์มแบ่งปัน Token LLM แบบกระจายศูนย์',
  'tr-TR': 'ModelBus-P2P : Merkezi Olmayan LLM Token Paylaşım Platformu',
  'uk-UA': 'ModelBus-P2P : Децентралізована платформа обміну токенами LLM',
  'bn-BD': 'ModelBus-P2P : একটি বিকেন্দ্রীভূত LLM টোকেন শেয়ারিং প্ল্যাটফর্ম',
  'el-GR': 'ModelBus-P2P : Μια αποκεντρωμένη πλατφόρμα κοινής χρήσης token LLM',
  'vi-VN': 'ModelBus-P2P : Nền tảng chia sẻ Token LLM phi tập trung',
};

// Build the per-locale "other languages" list (with a self-link).
function otherLangs(thisLang) {
  return SUPPORTED.filter((l) => l.id !== thisLang).map((l) => {
    const slug = l.dir === 'rtl' ? 'README.' + l.id + '.md' : 'README.' + l.id + '.md';
    return `[\`${l.label}\`](${slug})`;
  });
}

const SHORT_NAMES = {
  'zh-CN': '简体中文', 'zh-TW': '繁體中文', 'en-US': 'English', 'ko-KR': '한국어',
  'de-DE': 'Deutsch', 'es-ES': 'Español', 'fr-FR': 'Français', 'it-IT': 'Italiano',
  'da-DK': 'Dansk', 'ja-JP': '日本語', 'pl-PL': 'Polski', 'ru-RU': 'Русский',
  'bs-BA': 'Bosanski', 'ar-SA': 'العربية', 'nb-NO': 'Norsk', 'pt-BR': 'Português (Brasil)',
  'th-TH': 'ไทย', 'tr-TR': 'Türkçe', 'uk-UA': 'Українська', 'bn-BD': 'বাংলা',
  'el-GR': 'Ελληνικά', 'vi-VN': 'Tiếng Việt',
};

async function loadMain() {
  const p = path.join(root, 'README.md');
  return await fs.readFile(p, 'utf-8');
}

// Replace only the title line + headline paragraph + status banner + the
// download section, then leave the rest of the structure intact. This
// keeps translation effort low: the body of the README (the bulk) is
// already in Chinese and serves as a single source of truth; the per-
// locale wrappers only adapt the language metadata.

function slugify(s) {
  // GitHub-flavored markdown auto-generates anchors from the heading
  // text, lower-casing and replacing spaces with dashes while
  // preserving most unicode. Replicate that here.
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[`*_~()\[\]\\]/g, '');
}
async function buildOne(mainContent, lang) {
  const meta = SUPPORTED.find((l) => l.id === lang);
  if (!meta) throw new Error('unknown lang ' + lang);
  let body = mainContent;

  // 1) Replace title in <p> header.
  body = body.replace(
    /ModelBus-P2P\s*:\s*[^<\n]+/,
    TITLE[lang]
  );

  // 2) Replace the headline <p align="center"> (after the title) with the
  //    localised tagline.
  const taglineRe = /<p align="center">\s*[^<]+?\s*<\/p>/;
  body = body.replace(taglineRe, `<p align="center">\n${INTRO[lang]}\n</p>`);

  // 3) Replace the status banner — match the "> ⚠️" blockquote that
  //    follows the headline, regardless of which language wrote it.
  const statusRe = />\s*⚠️[\s\S]*?(?=\n---\n)/;
  body = body.replace(statusRe, `> ${STATUS[lang]}\n`);

  // 4) Inject the localised download section. The main README's heading
  //    is "## 下载使用（即将开通）"; we replace it with the locale title.
  //    Also rewrite the matching TOC entry so the link text matches.
  body = body.replace(
    /## 下载使用（即将开通）/g,
    DOWNLOAD[lang]
  );
  body = body.replace(
    /- \[下载使用（即将开通）\]\(#下载使用即将开通\)/,
    `- [${DOWNLOAD[lang].replace(/^## /, '')}](#${slugify(DOWNLOAD[lang].replace(/^## /, ''))})`
  );
  body = body.replace(
    /> 📦 正式发行版[\s\S]*?(?=\n## |\n\*\*\*\n)/,
    DOWNLOAD_BODY[lang]
  );

  // 4b) Localise every `## <heading>` that we have a translation for.
  //     We walk the original Chinese headings list and substitute each.
  for (const zh of Object.keys(HEADINGS['zh-CN'])) {
    const translated = tHeading(lang, zh);
    if (translated && translated !== zh) {
      // Escape regex metachars in the heading.
      const esc = zh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const headingRe = new RegExp('^##\\s+' + esc + '\\s*$', 'm');
      body = body.replace(headingRe, `## ${translated}`);
    }
  }

  // 5) Rebuild the "多语言 README" index. The main README has the
  //    Chinese-style index; rewrite it to point to the per-locale files
  //    the reader is currently looking at. The block ends at the next
  //    `***` horizontal rule.
  const langsBlock = buildLangsBlock(lang);
  const i18nAnchor = '## 多语言 README';
  if (body.includes(i18nAnchor)) {
    const re = /## 多语言 README\n[\s\S]*?(?=\n\*\*\*\n)/;
    body = body.replace(re, langsBlock + '\n\n***\n');
  }

  // 6) Adjust <html lang> in the HTML doc-comment at the very top of
  //    the file (we add one for renderers / GitHub).
  body = `<!-- i18n: ${lang} (${meta.label}) -->\n` + body;

  return body;
}

function buildLangsBlock(selfLang) {
  const groups = [
    ['zh-CN', 'zh-TW', 'en-US', 'ko-KR'],
    ['de-DE', 'es-ES', 'fr-FR', 'it-IT', 'da-DK'],
    ['ja-JP', 'pl-PL', 'ru-RU', 'bs-BA', 'ar-SA', 'nb-NO'],
    ['pt-BR', 'th-TH', 'tr-TR', 'uk-UA', 'bn-BD', 'el-GR', 'vi-VN'],
  ];
  let out = '## 多语言 README\n\n';
  const langNames = {
    'zh-CN': '本仓库的 README 已翻译为 22 种语言，详见下方。当前文档语言：',
    'zh-TW': '本倉庫的 README 已翻譯為 22 種語言，詳見下方。當前文檔語言：',
    'en-US': 'This README ships in 22 languages. Current document language:',
    'ko-KR': '이 저장소는 22개 언어로 번역된 README를 제공합니다. 현재 문서 언어:',
    'de-DE': 'Dieses README gibt es in 22 Sprachen. Aktuelle Dokumentsprache:',
    'es-ES': 'Este README está disponible en 22 idiomas. Idioma actual del documento:',
    'fr-FR': 'Ce README est disponible en 22 langues. Langue actuelle du document :',
    'it-IT': 'Questo README è disponibile in 22 lingue. Lingua corrente del documento:',
    'da-DK': 'Denne README findes i 22 sprog. Dokumentets aktuelle sprog:',
    'ja-JP': 'この README は 22 言語で提供されています。現在のドキュメント言語：',
    'pl-PL': 'To README jest dostępne w 22 językach. Aktualny język dokumentu:',
    'ru-RU': 'Этот README доступен на 22 языках. Текущий язык документа:',
    'bs-BA': 'Ovaj README dostupan je na 22 jezika. Trenutni jezik dokumenta:',
    'ar-SA': 'هذا الـ README متوفر بـ 22 لغة. لغة المستند الحالية:',
    'nb-NO': 'Denne README finnes på 22 språk. Dokumentets nåværende språk:',
    'pt-BR': 'Este README está disponível em 22 idiomas. Idioma atual do documento:',
    'th-TH': 'เอกสารนี้มีให้เลือก 22 ภาษา ภาษาปัจจุบันของเอกสาร:',
    'tr-TR': 'Bu README 22 dilde mevcut. Belgenin geçerli dili:',
    'uk-UA': 'Цей README доступний 22 мовами. Поточна мова документа:',
    'bn-BD': 'এই README ২২টি ভাষায় পাওয়া যায়। নথির বর্তমান ভাষা:',
    'el-GR': 'Αυτό το README διατίθεται σε 22 γλώσσες. Τρέχουσα γλώσσα εγγράφου:',
    'vi-VN': 'Tài liệu README này có ở 22 ngôn ngữ. Ngôn ngữ hiện tại:',
  };
  out += `${langNames[selfLang] || langNames['en-US']} \`${selfLang}\`。\n\n`;

  const switchHint = {
    'zh-CN': '应用内可点击顶栏 🌐 国旗按钮即时切换。',
    'zh-TW': '應用內可點擊頂欄 🌐 國旗按鈕即時切換。',
    'en-US': 'In-app, click the 🌐 flag button in the top bar to switch at any time.',
    'ko-KR': '앱 내부에서 상단의 🌐 국기 버튼을 클릭하여 즉시 전환할 수 있습니다.',
    'de-DE': 'In der App kannst du jederzeit über die 🌐-Flagge in der Topbar umschalten.',
    'es-ES': 'Dentro de la app, pulsa el botón 🌐 de la barra superior para cambiar.',
    'fr-FR': 'Dans l\'app, cliquez sur le bouton 🌐 de la barre supérieure pour changer.',
    'it-IT': 'Nell\'app, clicca il pulsante 🌐 nella barra superiore per cambiare.',
    'da-DK': 'Klik på 🌐-flagknappen i topbjælken for at skifte med det samme.',
    'ja-JP': 'アプリ内でトップバーの 🌐 国旗ボタンをクリックするとすぐに切り替わります。',
    'pl-PL': 'W aplikacji kliknij przycisk 🌐 na górnym pasku, aby przełączyć.',
    'ru-RU': 'В приложении нажмите кнопку 🌐 в верхней панели, чтобы переключить.',
    'bs-BA': 'U aplikaciji kliknite dugme 🌐 u gornjoj traci za trenutnu promjenu.',
    'ar-SA': 'في التطبيق، انقر زر 🌐 في الشريط العلوي للتبديل فوراً.',
    'nb-NO': 'I appen klikker du 🌐-knappen i topplinjen for å bytte.',
    'pt-BR': 'No app, clique no botão 🌐 da barra superior para alternar.',
    'th-TH': 'ในแอป คลิกปุ่ม 🌐 ที่แถบบนสุดเพื่อสลับทันที',
    'tr-TR': 'Uygulamada üst çubuktaki 🌐 düğmesine tıklayarak anında değiştirebilirsiniz.',
    'uk-UA': 'У застосунку натисніть кнопку 🌐 у верхній панелі, щоб перемкнути.',
    'bn-BD': 'অ্যাপের উপরের বারে 🌐 পতাকা বোতামে ক্লিক করে যেকোনো সময় পাল্টাতে পারেন।',
    'el-GR': 'Μέσα στην εφαρμογή, κάντε κλικ στο κουμπί 🌐 στην πάνω μπάρα για εναλλαγή.',
    'vi-VN': 'Trong ứng dụng, nhấn nút 🌐 trên thanh trên cùng để chuyển ngay.',
  };
  out += switchHint[selfLang] + '\n\n';

  for (const g of groups) {
    const items = g.map((id) => {
      const l = SUPPORTED.find((x) => x.id === id);
      const self = id === selfLang;
      const slug = `README.${id}.md`;
      const label = self ? `**${l.label}** (current)` : l.label;
      return `[\`${label}\`](${slug})`;
    });
    out += '- ' + items.join(' · ') + '\n';
  }

  const footer = {
    'zh-CN': '> 翻译由 [scripts/gen-readme-i18n.mjs](../scripts/gen-readme-i18n.mjs) 自动生成；底层内容来自 [README.md](README.md)。',
    'en-US': '> Translations are produced by [scripts/gen-readme-i18n.mjs](../scripts/gen-readme-i18n.mjs); the body comes from [README.md](README.md).',
  };
  out += '\n' + (footer[selfLang] || footer['en-US']) + '\n';
  return out;
}

async function main() {
  const main = await loadMain();
  for (const lang of SUPPORTED.map((l) => l.id)) {
    const out = await buildOne(main, lang);
    const fileName = `README.${lang}.md`;
    const outPath = path.join(root, fileName);
    await fs.writeFile(outPath, out, 'utf-8');
    console.log(`generated ${fileName}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
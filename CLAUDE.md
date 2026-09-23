# AI Simülasyon Sitesi — proje notları

Türkçe, tek sayfalık (statik HTML/CSS/JS, build adımı yok) bir AI/ML eğitim
sitesi. Ana dosyalar: `index.html` (tüm ders modülleri + Yol Haritası +
AIpedia + sidebar, tek dosyada `<div class="model" id="model-...">` bloklar
halinde), `js/app.js` (Yol Haritası/tech-tree + sidebar + genel sayfa
mantığı), `js/lesson-*.js` (belirli derslerin simülasyon kodu), `css/style.css`.
GitHub Pages'ten `main` dalından yayınlanır.

## Ders modülü içerik şablonu (devam eden bir iş)

Kullanıcı tüm ders modüllerinin (Yol Haritası'ndaki her düğüm = bir ders)
genel olarak şu 6 maddelik akışı izlediğini/izlemesi gerektiğini tarif etti:

1. **Giriş** — bir görsel + konu hakkında kısa açıklama
2. **Hikâye** — modülün/kavramın keşif hikâyesi
3. **Gerçek Hayatta Nerede** — kısa örnek kartları
4. **Nedir & Nasıl Çalışır** — ne olduğu, neden ihtiyaç duyulduğu, kısaca nasıl çalıştığı
5. **Simülasyon** — etkileşimli/canlı kısım
6. **Kendini Test Et** — soru-cevap accordion'ları

Bunun dışında kalan, konuyu uzatan/derinleştiren her şey ayrı bir
**➕ Ekstra / Derinleşme** kümesinde toplanıyor — sıradaki her modülde bu
küme (varsa) her zaman **5'ten sonra, 6'dan hemen önce** yer alır, tutarlı
bir "1→2→3→4→5→Ekstra→6" sırası için.

**Uygulama şekli**: her küme `.tpl-cl` bileşeniyle (bkz. `css/style.css`
— `.sechead.rnn-toggle`/`.rnn-secbody` ile birebir aynı toggle mekaniği,
ayrı bir sınıf adıyla ki sol panel alt-navigasyonu — `.sechead` tabanlı —
bu kümelerle kirlenmesin) açılıp kapanabilen, aşamaya göre renkli
(1-mavi, 2-turuncu, 3-yeşil, 4-mor, 5-camgöbeği, 6-kırmızı, ekstra-noktalı
gri) bir kutuya sarılıyor. Varsayılan durum **hepsi kapalı** (kullanıcı
tercihi, güncellendi — HTML'de her `.tpl-head`/`.tpl-body` çifti baştan
`closed` sınıfıyla geliyor; `js/lesson-linreg.js`'teki tek satırlık toggle
bunu açar/kapar). Önceki "hepsi açık" kararının gerekçesi olan
canvas/Three.js yanlış boyutlanma riski kontrol edildi: sayfadaki
canvas'lar sabit `width`/`height` HTML özniteliğiyle çiziliyor (konteyner
`clientWidth`'ine bakmıyor) ve tek istisna olan 3B kayıp yüzeyi
(`initLoss3D`, `js/app.js`) zaten sayfa yüklenişinde `.model` katmanı
`display:none` iken tek seferlik kuruluyor — yani tpl-cl açık/kapalı
durumundan bağımsız olarak hep aynı sabit-boyut fallback'i kullanıyor;
tpl-cl'nin kapalı gelmesi ek bir regresyon yaratmıyor. Bir modülde bir küme
hiç yoksa, o küme yine de boş bir `.tpl-cl` olarak eklenir, kırmızı
`<span class="tpl-empty-tag">BOŞ — eklenebilir</span>` rozeti ve
`.tpl-empty` içinde neyin eklenebileceğine dair kısa bir not taşır —
eksiklik gizlenmiyor, görünür kılınıyor.

JS tarafı: `js/lesson-linreg.js` içinde (adı yanıltıcı olsa da bu dosya
TÜM sayfalar için globaldir, `.acc-head`/`.sechead.rnn-toggle` gibi genel
toggle'ları da burada kuruyor) `.tpl-head`/`.tpl-body` için
`.sechead.rnn-toggle` ile aynı mantıkla bir click listener var.

**Şu ana kadar uygulanan yer**: sadece **Temeller Çağı** — ve orada da
sadece **Lineer Regresyon** ile **Aktivasyon Fonksiyonları**. **Yapı
Taşları** (mat) bilinçli olarak DIŞARIDA bırakıldı — o sayfa 6 maddelik
akışa uymuyor, kategori→modül→alıştırma şeklinde ayrı bir "ders kitabı"
yapısında (kendi `.acc-category`/`.acc-module` sistemi var).

**Sıradaki plan** (kullanıcı açıkça "bunu bütün çağlara sırayla
uygulayacağız, istendiğinde hatırla" dedi): aynı `.tpl-cl` şablonu
sırayla diğer çağlara/modüllere de uygulanacak — Nöral Çağ (Neural
Network, RNN/BPTT), Dizi Modelleme Çağı (Vanishing/Exploding, LSTM/GRU,
Kelime Temsili, Seq2Seq), Transformer Çağı (Self-Attention, Multi-Head,
Transformer Bloğu), vb. Her modülde önce mevcut içerik hangi kümeye
denk düştüğü tespit edilmeli (genelde zaten yakın bir sırada duruyor,
sadece sınır çizmek yeterli oluyor), varsa "ekstra" bir tanjant varsa o
5'ten sonra 6'dan önceye taşınmalı, eksik kümeler için boş+notlu
placeholder eklenmeli. Bu iş her modülde ayrı bir PR olarak, kullanıcıyla
birlikte (kullanıcı içeriği tekrar ederken/incelerken) ilerliyor —
tek seferde tüm siteyi otomatik dönüştürmeye kalkma.

**Kapsam güncellemesi**: ilerleyiş katı bir "çağ sırasıyla ileri" akışı
değil — kullanıcı Temeller Çağı ile Nöral Çağ arasında "git gel"
yapabileceğini belirtti (bir çağ bitmeden diğerine geçip geri dönmek
normal). Şu an aktif odak: kullanıcı **RNN (BPTT)** modülünün içeriğini
kendi düzenliyor/düzeltiyor; o modülde oturttuğu düzeni netleştirdikten
sonra bu düzeni hem GERİYE DÖNÜK olarak diğer (zaten işlenmiş) modüllere
hem de İLERİYE doğru **LSTM/GRU**'ya entegre edeceğiz. Yani RNN, Nöral
Çağ'ın geri kalanı için de bir şablon/referans noktası olacak — RNN'de
netleşen yapıyı bekleyip ona göre hareket et, aceleyle tahmin ederek diğer
modüllere uygulamaya başlama.

**Güncelleme — XOR'un 5️⃣ Simülasyon'u da bir referans noktası oldu**:
kullanıcı uzun bir oturumda **XOR modülünün geri yayılım kartlarını**
(RNN kart anatomisinden esinlenerek) baştan ayrıntılandırdı ve
"taslağı XOR üzerinden kuracağız, bu sayfayı en son haline getirip
burası için özel bir şablon yazacağız — şu anki 6 maddelik şablonun
5. maddesinin (Simülasyon) güncellenmiş, daha ayrıntılı hâli" dedi.
Yani plan: **önce XOR sayfasını kendi içinde tamamla, sonra bu yapıyı
resmî bir alt-şablon olarak yaz** (RNN ile aynı ilişki — bekle, netleş,
sonra genelleştir; aceleyle diğer modüllere taşımaya kalkma).

XOR'un geri yayılım kartlarında şu ana kadar oturan somut bileşenler
(gelecekte şablonlaştırılacak envanter):
1. **Kart başlığı `.xe-formul`** — kartın en üstünde, o kartın hesapladığı
   halkanın MathJax formülü duruyor (RNN'deki gibi; eski `girdi:/çıktı:`
   makine-dili şeridi `.xe-flow` kaldırıldı).
2. **Canlı tek satır `.xe-head-eq`** — RNN'deki `.rc-card` mantığının
   aynısı: `sembol = yerine konmuş sayılar = sonuç`, epoch ilerledikçe
   güncelleniyor; hemen altında "💡 Ne öğrendik" callout'u.
3. **`#xeTreeWrap` — bütün geri yayılımı gösteren TEK ağaç**: kartların
   ÜSTÜNDE, gövde (L→p→z_y) + z_y'de dallanma (çıktı ağırlıkları + gizli
   nöronlar) + yapraklar (dokuz gradyan, canlı). `.acc` ile açılıp
   kapanabilir (varsayılan açık), başlıkta sağ üstte **⛶ tam ekran**
   düğmesi (`.xt-full` — `position:fixed; inset:0`, Esc/✕ ile kapanır,
   Esc önce açık pop-up'ı kapatır, sonra tam ekrandan çıkar).
4. **Türetme pop-up'ları (`data-pop` + `.xt-src`)** — ağaçtaki her
   ok/kutu ve kart başlığındaki her formül üstüne gelince (tıklayınca
   sabitlenir) o türevin K1–K6 kurallarıyla adım adım nasıl bulunduğunu
   gösteriyor; sonunda **"🔗 Peki gradyan buradan nasıl çıkıyor?"**
   bloğuyla türevden gradyana geçişi (çarpma + dört noktanın ortalaması)
   canlı sayılarla tamamlıyor — bu son adım, kullanıcının "türev ile
   sonuç arasında bir boşluk var, bir anda geçmiş gibi oluyor" tespitiyle
   eklendi, atlanmamalı.
5. Paylaşılan **K1–K6 türev kuralları** kutusu, hem kart detaylarından
   hem pop-up'lardan referans veriliyor.
6. Her şey responsive (dar ekranda taşmıyor, tablo/agaç yatay kaydırılır)
   ve canlı (epoch ilerledikçe hem kartlar hem ağaç hem pop-up'lar
   güncellenir).

**Önemli site-geneli ders (bugün yaşandı)**: sayfadaki görünen
`v202X-XX-XX HH:MM TR` sürüm etiketini güncellemek, script/stylesheet
etiketlerindeki `?v=` cache-bust parametresini OTOMATİK güncellemiyor
— ikisi ayrı sistemler. `index.html`'de her ikisi de aynı damgayı
taşıyor (`<script src="...js?v=YYYYMMDDHHMM">` ve görünen metin); bir
JS/CSS dosyası değiştiğinde **ikisi de aynı anda** bump edilmeli, yoksa
GitHub Pages'in önbellek penceresinde kullanıcılar eski JS'i çalıştırmaya
devam eder ve yeni özellik "hiç çalışmıyormuş" gibi görünür (bkz. git
geçmişi — tam ekran düğmesinin ilk PR'ı tam da bu yüzden canlıda
çalışmadı).

## Zincir Kuralı modülü (Türev Kuralları → Modül 4) — sahne güncellemeleri

Türev Kuralları kategorisinin içerik denetimi (kullanıcı "örnekleri
incele, gereksiz/fazlalık var mı, rakamlar doğru mu" dedi) sonucunda
Zincir Kuralı modülünün "Sahne 1" ve "Sahne 3" sahneleri sırayla
güncellendi:

1. **Sahne 1 — bisiklet vitesi → canlı f(g(x))=(2x+1)³ örneği (PR
   #274)**: eski "Sahne 1 — Bisiklet vitesi" (`gears()` IIFE,
   `js/lesson-turev.js`) ile "Sahne 2 — Döviz zinciri" aynı fikri
   (zincirleme oranların çarpımı) iki farklı senaryoda tekrarlıyordu,
   hiçbiri gerçek bir bileşke fonksiyonu türetmiyordu. Bisiklet sahnesi
   kaldırıldı, yerine **teğet çizgisi canlı gösteren** bir sahne geldi
   (`chainLive()` IIFE): `x` kaydırılabilir, iç halka `g(x)=2x+1`, dış
   halka `f(u)=u³`, zincir kuralıyla `dy/dx = f′(g(x))·g′(x)` canlı
   hesaplanıp sarı teğet çizgisi olarak çiziliyor. Bisiklet sahnesindeki
   değerli "vanishing gradient / 0.25²⁰≈10⁻¹²" içgörüsü SİLİNMEDİ, daha
   doğal bir yerine (Sahne 3 — Sigmoid'in callout'u) taşındı.
2. **Sahne 1'e h→0 doğrulaması eklendi (PR #275)**: kullanıcının
   "y=2x+1³'te direkt eğimi bulsak" sorusuna verilen yanıttan (x=1'de
   sembolik türev = limit tanımı = 54, ikisi de eşleşiyor) esinlenerek,
   aynı sahnenin İÇİNE (id'siz, `border-left:3px solid #5aa0e0` ile
   ayrılan) bir doğrulama alt-bloğu eklendi: `h` kaydırılabilir, sekant
   eğimi `(y(x+h)-y(x))/h` canlı hesaplanıp `h→0` yaklaşırken sembolik
   türeve yakınsadığı gösteriliyor.
3. **Sahne 3 (Sigmoid zinciri) — MathJax açıklama paneli (PR #276)**:
   canvas üzerindeki düz-metin kutucuklar (z→u=e⁻ᶻ→s=1+u→σ=1/s) hangi
   işlemin neyle çarpıldığını göstermekte yetersizdi ("karışık kutucuklar
   birbirine girmiş, mathjax kullanmazsan anlaşılmıyor" — kullanıcı
   geri bildirimi). Canvas'ın sağındaki boş alana gerçek MathJax'lı bir
   panel eklendi: üç halkanın sembolik yerel türevleri + zincir kuralı
   formülü + z kaydırıldıkça canlı güncellenen sayısal yerine-koyma
   satırı (`#tzSigLive`, `js/lesson-turev.js`'teki `sig()` IIFE'sinde
   `requestAnimationFrame` ile debounce'lanmış `MathJax.typesetClear`+
   `typesetPromise` çağrısı — `js/app.js`'teki `typesetMath()`/`.dt-tree`
   deseniyle aynı mantık).
   - **Mobil ders**: canlı formülün render edilen SVG'si mobil (375px)
     panel genişliğini aşıyor, site-geneli `mjx-container{overflow-x:
     auto; max-width:100%}` kuralı (`css/style.css` satır 17) yüzünden
     kesilmiş GÖRÜNMÜYOR, sadece görünmeyen/kolay-gözden-kaçan bir iç
     mini-kaydırma-çubuğunun ardında saklanıyor — `scrollWidth`/
     `clientWidth` gibi yüzeysel DOM kontrolleri bunu yakalamıyor, gerçek
     `<svg>` `getBoundingClientRect()` genişliğini konteynerinkiyle
     karşılaştırmak gerekiyor. Düzeltme iki parçalı: (a) tek satırlık
     formül ikiye bölündü (çarpanlar / sonuç), (b) `#tzSigLive
     mjx-container` için `@media(max-width:720px)` içine (satır ~570)
     `font-size:75% !important` eklendi (`.xe-cards .eq mjx-container`
     ile aynı scoped-font-size deseni, satır ~758).
4. **Sahne 3 — canvas'ı sil, kanıt notlarıyla AYNI dış/iç anlatısına
   geç (PR #280 → PR #290)**: PR #276'nın MathJax paneli (madde 3)
   z→u=e⁻ᶻ→s=1+u→σ=1/s dört-halkalı bir zincir kullanıyordu — ama
   `.afx` sistemi (bkz. aşağıki not) kurulunca sigmoid'in kanıt
   notları σ(z)=(1+e⁻ᶻ)⁻¹ yazıp **sadece dışın türevi × içinin türevi**
   (iki parça, u/s YOK) diyordu. PR #280'de canvas'ın YANINA `.afx-mount
   data-fn="sigmoid"` eklendi ama canvas'ın KENDİSİ (hâlâ u/s dilinde)
   dokunulmadan kaldı — iki farklı anlatı aynı sahnede yan yana durmaya
   devam etti. Kullanıcı "elle kağıtta çözdüm ama buraya bakınca hiçbir
   şey anlamıyorum" deyince kök neden netleşti: **canvas'ın KENDİSİ**
   sorunluydu, sadece yanına doğru anlatıyı eklemek yetmemişti. PR
   #290'da canvas TAMAMEN kaldırıldı (kutu/ok çizimi zaten hiçbir eğri/
   grafik çizmiyordu — salt metin içeriyordu, MathJax'e taşınınca
   kayıp olmadı) — yerine `.afx-rule` kutusunun 2-3-4. adımlarıyla
   (dışın türevi / içinin türevi / çarp) BİREBİR aynı formülleri
   canlı sayılarla gösteren bir MathJax paneli geldi, hiç u/s
   kullanmadan. **Ders**: bir sahnenin YANINA doğru referans içerik
   eklemek (afx-mount), sahnenin KENDİ ana gövdesindeki eski/çelişen
   anlatıyı otomatik düzeltmiyor — ikisi aynı sayfada yan yana kalırsa
   kullanıcı için "iki farklı ders" gibi görünüp kafa karıştırıyor;
   yeni bir referans eklerken ESKİ içeriğin onunla tutarlı olup
   olmadığı da ayrıca kontrol edilmeli.
5. **σ(z) adımı eksikti (PR #292)**: PR #290'ın yeni panelinde
   "✅ Kontrol — σ(1−σ)" satırı σ ve 1−σ sayılarını gösteriyordu ama
   bu sayıların NEREDEN geldiği (σ(z)'nin kendisi) panelde hiçbir yerde
   AYRI bir adım olarak hesaplanmıyordu — dışın/içinin türevi adımları
   sadece `(1+e⁻ᶻ)` üzerinden gidiyordu, σ hiç görünmüyordu. Kullanıcı
   ekran görüntüsüyle "bu sayılar nereden geliyor?" diye sorunca fark
   edildi. Düzeltme: panelin başına `🧮 Önce σ(z) — ileri geçişte
   zaten hesaplanan değer` adımı eklendi, Kontrol satırı da
   `σ(1−σ)=σ×(1−σ)` açılımıyla o adıma açıkça bağlandı. **Ders**: canlı
   (z'ye göre güncellenen) bir panelde SONRAKİ bir adımda kullanılan
   HER sayının, panelin kendi İÇİNDE daha ÖNCE bir yerde AÇIKÇA
   hesaplanmış/gösterilmiş olması gerekir — "bu değer zaten ortada"
   varsayımı (ör. σ'nin ileri geçişte hesaplandığı bilgisi) izleyici
   için GEÇERSİZ, ekranda görünmeyen hiçbir sayı "biliniyor" sayılamaz.
6. **Panelin 5 adımı kapanır/açılır yapıldı, hepsi başlangıçta kapalı
   (PR #296)**: kullanıcı "bu sorularda kapanır açılır olsun, hepsi
   başlangıçta kapalı gelsin" dedi (bu panelin ekran görüntüsüyle —
   önce "Kendini Test Et"teki `.acc-soru` kutularına dair sanıldı,
   zaten 34/34 kapalı/collapsible olduğu doğrulanıp kullanıcıya
   bildirildi; kullanıcının ikinci, daha spesifik ekran görüntüsü asıl
   hedefin BU panel olduğunu netleştirdi). Panel z kaydırıcısıyla canlı
   güncellendiği (madde 5) için doğrudan `read.innerHTML` = madde 5'in
   ürettiği HTML dizesini her `input` olayında YENİDEN yazmak, dizenin
   içinde hep hardcoded `closed` sınıfı olduğundan kullanıcının az önce
   açtığı bir kutuyu her sürüklemede otomatik geri kapatırdı. Çözüm:
   `js/lesson-turev.js`'teki `sig()` IIFE'sinde 5 `.afx-head closed`/
   `.afx-body closed` kutusu (id'leri `tzSig-s0`..`tzSig-s4`) SADECE BİR
   KEZ, IIFE kurulurken inşa edilip `stepEls` dizisinde önbelleğe
   alınıyor; `render()` artık dıştaki `.afx-head`/`.afx-body`'ye hiç
   dokunmadan sadece bu 5 yaprak div'in `innerHTML`'ini güncelleyip
   `typesetLive(stepEls)` çağırıyor. Toggle için yeni JS yazılmadı —
   `.afx-head`/`.afx-body` zaten `js/lesson-linreg.js`'te olay-
   delegasyonlu (global, DOM'a sonradan eklenen elemanları da kapsayan)
   bir dinleyiciyle yönetiliyordu (PR #278'den beri, `.afx-mount`
   klonları için kurulmuştu), o dinleyici bu yeni kutuları da otomatik
   kapsadı. **Ders**: canlı/periyodik güncellenen bir panele collapsible
   davranış eklerken, "iskelet" (toggle durumu taşıyan dış yapı) ile
   "veri" (her güncellemede değişen sayılar) ayrı tutulmalı — iskelet
   bir kez kurulup veri güncellemeleri sadece en İÇTEKİ yaprak
   elemanlara yazılmalı, aksi halde her güncelleme kullanıcının
   etkileşim durumunu (açık/kapalı) sıfırlar. **Not: bu madde PR #298'de
   GERİ ALINDI** — bkz. madde 7, kapsam yanlış anlaşılmıştı. Yukarıdaki
   teknik (iskelet-bir-kez/yaprak-güncelleme) genel bir desen olarak
   doğru/geçerli kalıyor, sadece BU panelde artık kullanılmıyor.
7. **Madde 6 yanlış hedefe uygulanmıştı — asıl istenen "Sahne N" sahne
   bloklarının kendisiydi (PR #298)**: kullanıcı madde 6 canlıya alınca
   ekran görüntüsüyle düzeltti: "burayı açılır kapanır değil sahne1,
   sahne2 sahne 3'ü falan onları kapanır açılır yapacaktın" — yani "bu
   sorularda kapanır açılır olsun" derken Sigmoid panelinin 5 mini-adımını
   değil, Türev ve Zincir Kuralı modüllerindeki **"Sahne N —" başlıklı
   `.pts` bloklarının kendisini** kastediyordu. `AskUserQuestion` ile
   kapsam netleştirildi: (1) TÜM "Sahne N" blokları site genelinde
   (sadece Zincir Kuralı değil), (2) madde 6'nın 5 mini-adım
   accordion'ı kaldırılıp panel PR #292'deki gibi tek akan MathJax
   metnine geri döndürülsün.
   - Site genelinde tam olarak **6 örnek** bulundu (hepsi bu iki
     modülde): Türev modülünde (`ytmod-3`) Sahne 1 (köprü), Sahne 2
     (kurabiye), Sahne 3 (en ucuz köprü); Zincir Kuralı modülünde
     (`ytmod-4`) Sahne 1 (teğet), Sahne 2 (döviz), Sahne 3 (sigmoid).
     Aynı modüllerdeki "Sahne" ETİKETİ TAŞIMAYAN `.pts` blokları (sezgi
     açılışı, "h→0 tanımı", pratik kurallar özeti) kasıtlı olarak
     DOKUNULMADI — sadece başlığı "Sahne N —" ile başlayanlar.
   - Yeni bileşen `.sahne-head`/`.sahne-body` (`css/style.css`,
     `.tpl-head`/`.tpl-body` ile birebir aynı toggle mekaniği ve
     varsayılan-kapalı deseni, ayrı sınıf adıyla). `<h3>` başlığı
     `<span>metin</span><span class="chev">▸</span>` yapısına çevrilip
     `sahne-head closed` sınıfı aldı; başlıktan sonraki TÜM içerik
     (paragraf, kaydırıcı, canvas, panel, callout — nested `.pts`/`.acc`
     alt-bloklar dahil) `<div class="sahne-body closed">` içine alındı.
     Toggle listener `js/lesson-linreg.js`'e `.tpl-head` ile aynı
     doğrudan-`querySelectorAll` desenle eklendi (bu bloklar statik HTML,
     sonradan klonlanmıyor — `.afx-head`'in delegasyon gerekçesi burada
     geçerli değil).
   - Sigmoid panelinin (`#tzSigRead`) 5 `.afx-head`/`.afx-body` mini-
     kutusu kaldırıldı, `js/lesson-turev.js`'teki `sig()` PR #292'deki
     tek-akan-metin haline geri döndürüldü — dış Sahne bloğu artık
     kendi açılıp kapandığı için panelin İÇİNDE ayrı bir toggle
     katmanına gerek kalmadı (iki seviyeli iç içe accordion, kullanıcının
     "koru, iç içe iki seviye olsun" DEĞİL "kaldır" seçeneğini seçmesiyle
     netleşti).
   - **Regresyon (geri dönüşte fark edilip düzeltildi)**: `#tzSigRead`
     PR #296'da `.afx-body` içine taşındığı için mobilde site-geneli
     `.afx-body mjx-container{font-size:82%}` kuralından faydalanıyordu;
     düz metne dönüşte bu sınıf da kayboldu, 375px'te iki formül (310px/
     265px, konteyner 243px) taşmaya başladı. Kök neden: panelin ASIL
     mobil-küçültme kuralı `.afx-body` değil, PR #292'den beri var olan
     `.afx-live mjx-container{font-size:78%}` (`css/style.css` ~satır
     632) idi — bu sınıf Phase 10'da (`#tzSigRead`'i adım-accordion'a
     çevirirken) `id="tzSigRead" style="..."` olarak sadeleştirilip
     unutulmuştu. `class="work afx-live"` geri eklenince taşma düzeldi.
     **Ders**: bir elementin class listesini "sadeleştirirken" (görünürde
     kullanılmayan bir sınıfı kaldırırken) o sınıfın media-query içinde
     SESSİZCE bir mobil davranış taşıyıp taşımadığı kontrol edilmeli —
     masaüstünde hiçbir fark yaratmayan bir sınıf kaybı, sadece dar
     ekranda ortaya çıkan bir regresyona yol açabilir.
   - `js/app.js`: `openScene()` (mini-ağaçtan bir sahneye tıklayınca
     scroll+aç) artık scroll'dan ÖNCE hedef `.sahne-body`/`.sahne-head`
     kapalıysa açıyor — aksi halde artık varsayılan kapalı gelen bir
     Sahne'ye mini-ağaçtan tıklamak, kullanıcıyı görünmeyen/gizli bir
     kutuya scroll ederdi. Aynı düzeltmenin yanında `MOD_SCENES`'teki
     `ytmod-4` Sahne 3 etiketi de PR #290'dan kalma eski (u/s dilinde)
     başlıktan güncel metne çevrildi (fark edilen ayrı bir küçük
     tutarsızlık, aynı PR'da düzeltildi).

## Aktivasyon fonksiyonu anlatım kutuları — `.afx` (PR #278)

Kullanıcı aktivasyon fonksiyonlarının anlatıldığı HER yerdeki anlatımı
kafa karıştırıcı buldu ("iç halka / orta halka / dış halka", düz metin
zincir durakları, bisiklet vitesi benzetmesi) ve örnek olarak bir başka
asistanın ürettiği biçimi gösterdi. **İstenen ritim**: numaralı kalın
başlık → düz cümlelerle açıklama → ortalanmış MathJax formülü. Bu biçim
`.afx` bileşeni olarak oturdu ve **bundan sonra türev/ispat anlatımı
gerektiren her yerde referans** alınmalı.

**Yapı**: her aktivasyon fonksiyonu için YAN YANA iki açılır kutu —
1. **📐 Türev kurallarıyla — adım adım** (altın, `.afx-rule`) — hızlı yol
2. **🔬 Limit tanımıyla kanıt — hiçbir kural bilmeden** (mavi, `.afx-lim`)

Dört fonksiyon da kapsandı: sigmoid, tanh, ReLU, Leaky ReLU.

**İki kutunun pedagojik gerekçesi** (silinmemeli): iki yol aynı sonuca
varır, AMA **ReLU/Leaky'de limit kutusu kuralların göremediği şeyi
gösterir** — \(z=0\)'da sağdan limit 1, soldan 0; eşit olmadıkları için
türev **tanımsız** (köşe). Türev kuralları bu soruya hiç giremez. Leaky'de
aynı analiz "ölü nöron çözüldü ama köşe duruyor" sonucunu verir.

**TEK KAYNAK + klon mimarisi**: anlatım yalnızca bir yerde yazılıdır —
`#model-aktivasyon` içindeki `.afx-src` blokları. Yapı Taşları'ndaki
`ytmod-6` (sigmoid), `ytmod-7` (tanh), `ytmod-8` (ReLU + Leaky)
modüllerinde sadece boş `.afx-mount` yuvaları durur; `js/app.js`'teki
`mountAfx` IIFE'si içeriği oraya **klonlar**. Aynı anlatım iki yerde ayrı
ayrı yazılmaz, zamanla birbirinden kopmaz. Klonlama kuralları:
- `.afx-src` içinde **ASLA `id` kullanma** (klonda çift id oluşur).
- Klonda `.afx-src` sınıfı sökülür ki fonksiyon seçicinin göster/gizle
  mantığı (`#model-aktivasyon .afx-src`) sadece asıl blokları hedeflesin.
- Toggle **olay delegasyonuyla** bağlanır (`js/lesson-linreg.js`) — klonlar
  sonradan DOM'a girdiği için doğrudan bağlanan listener onları görmez.
- MathJax: klon typeset'ten ÖNCE alınırsa ham `\[..\]` taşır, SONRA
  alınırsa işlenmiş SVG'yi taşır (global MJX cache'e id ile bağlanır,
  çalışır). İlk ihtimale karşı `mountAfx` açıkça `typesetPromise` çağırır.

**Simülasyon da bu anlatıma göre şekillendi**: `actWork` canlı okuması
artık düz metin değil MathJax ("sembol = yerine konmuş sayılar = sonuç",
rAF ile debounce'lanmış typeset). **ReLU/Leaky'de z tam 0 olunca** kutu
"TAM KÖŞEDESİN" deyip türevin neden tanımsız olduğunu yazar — anlatımla
simülasyon aynı noktada buluşur, bu bağ korunmalı.

**Kaldırılanlar**: bisiklet vitesi + "durak 1/2/3" zincir bloğu ve onu
süren IIFE (PR #274'te Zincir Kuralı modülünden kaldırılan bisiklet
sahnesiyle aynı gerekçe — tekrar eden benzetme), Zincir Kuralı
sahnesindeki "İç/Orta/Dış halka" etiketleri sade dile çevrildi.

**Mobil dersi (PR #276'nın devamı)**: uzun tek satırlık türetmeler 375px'te
konteyneri aşıyordu. Font küçültmek tek başına yetmedi (en uzunu 396px,
konteyner 261px). Asıl çözüm **çok satırlı `\begin{aligned}`** — hem dar
ekrana sığdırır hem adım adım daha okunur; ayrıca tanh ispatına
\(t=\tanh z\), \(T=\tanh h\) kısaltması eklenerek formüller daraltıldı.
Sonuç: dört fonksiyonun 155 formülünün tamamı 375px'te taşmıyor. Yeni
uzun formül eklerken: önce `aligned` ile kır, font küçültmeyi son çare
olarak kullan.

**Kapsam dersi (PR #280) — "her yerde" gerçekten her yer demek**:
kullanıcı `.afx`'i "her yerdeki aktivasyon fonksiyonu için" istediğinde,
Aktivasyon sayfası + Yapı Taşları'ndaki ytmod-6/7/8 modülleri (PR #278)
yeterli SANILDI ama **Zincir Kuralı modülünün kendi Sigmoid sahnesi**
(`yts-4-4`, "Sahne 3 — Sigmoid zinciri") gözden kaçtı — orada PR #276'dan
kalma eski statik "İç halka/Orta halka/Dış halka" paneli hâlâ duruyordu,
çünkü o sahne `.afx` sisteminin parçası değil, bağımsız bir canvas+panel
kombinasyonuydu. Kullanıcı ekran görüntüsüyle işaret edip düzelttirdi. PR
#280'de o statik panel kaldırılıp yerine sigmoid'in `.afx-mount` klonu
kondu (canvas + canlı okuma korundu, okuma da MathJax'e çevrildi). **Ders**:
bir bileşen "her yerde" tutarlı olsun denildiğinde, o kavramı gösteren
TÜM sayfaları tara — sadece bariz/ana sayfaları değil, ilgili konuyu
farklı bir bağlamda (burada: Zincir Kuralı'nın canlı örneği olarak)
tekrar eden yerleri de.

## "Soru N:" alıştırma kutuları — `.acc-soru` (PR #294)

Kullanıcı `.afx-box`'ların (📐/🔬) ekran görüntüsünü gösterip "sorular
daha kenarlıklı olsun, bir sorudan diğerine geçerken sorular arası
geçiş belli olsun" dedi — soru accordion'larının ince, düşük-kontrast
`var(--line)` kenarlığı bunu sağlamıyordu.

**Kapsam netleştirme**: "sorular" ifadesi belirsizdi (tek sayfa mı,
site geneli mi?) — `AskUserQuestion` ile sorulup **site genelinde
TÜM "Soru N:" accordion'ları** olarak netleşti. Site genelinde bu
formatta 34 örnek var (Yapı Taşları'nın 8 modülünde: tanh, ReLU/Leaky,
üstel/log, zincir/bölüm kuralı, kısmi türev, istatistik, trigonometri).
Lineer Regresyon gibi FARKLI soru formatı kullanan modüller ("1)
h(x)=..." tarzı, `Soru N:` DEĞİL) kasıtlı olarak kapsam dışı — kullanıcı
özellikle bu deseni belirtti, "her soru" demedi.

**Uygulama şekli**: `.acc` (site genelinde onlarca farklı bağlamda —
kategori/modül accordion'ları, AIpedia panelleri, vb. — kullanılan
paylaşılan sınıf) HİÇ değiştirilmedi. Onun yerine, `<div class="acc-head">
<span class="ac">▸</span> Soru ` deseniyle başlayan `.acc-head`'lerin
SARMALAYICI `<div class="acc">`'sini `<div class="acc acc-soru">`'ye
çeviren tek seferlik bir Python regex geçişi (`index.html` üzerinde,
34/34 eşleşme doğrulandı) ile 34 örnek işaretlendi. `.acc-soru`: mavi
tonlu çerçeve + hafif degrade zemin + öncü ❓ ikonu (`::before` ile,
HTML metnine hiç dokunmadan — ikon metne gömülü DEĞİL, salt CSS).
Aç/kapa mekanizması (`.acc-head` click delegasyonu, `js/lesson-linreg.js`)
tamamen değişmeden kaldı çünkü hâlâ aynı `.acc`/`.acc-head`/`.acc-body`
yapısı kullanılıyor, sadece ikinci bir modifier sınıf eklendi. **Ders**:
paylaşılan bir sınıfı DEĞİŞTİRMEDEN, o sınıfın belirli bir ALT KÜMESİNE
(burada: başlık metni "Soru N:" ile başlayanlar) özel stil vermek
gerektiğinde, HTML'i regex ile tarayıp ikinci bir modifier sınıf eklemek
— hem `.acc`'nin diğer onlarca kullanımını korur hem de yeni HTML
elle yazılmaz (34 örneği elle düzenlemek riskli/yorucu olurdu).

## Yapı Taşları — ilerleme ağaçları (mini-yol-haritaları)

Yapı Taşları (`#model-matematik`) kendi `.acc-category`/`.acc-module`
"ders kitabı" yapısını koruyor (yukarıdaki `.tpl-cl` şablonunun dışında,
bkz. üstteki not) ama kullanıcı buraya da ana Yol Haritası'yla **aynı
görsel dilde** (SVG kart + kablo + kilit animasyonu, `.tn`/`.te-*` stili)
ilerleme ağaçları istedi — kod olarak ana `#techSvg`'ye HİÇ dokunulmadan,
her biri kasıtlı olarak KOPYALANMIŞ, kendi id/sınıf/localStorage'ına sahip
ayrı sistemler halinde:

1. **`#matSvg`** (PR #261) — Türev Kuralları kategorisinin İÇİNDE, o
   kategorinin 4 modülünü gösteren küçük ağaç. Sınıflar `.mtn`/`.mte`,
   gradient/keyframe adları `mtnGrad*`/`mtSnake`/`mtRgbFlow`/`mtflow`/
   `mtpulse`. localStorage: `attn_mat_done_v1`. Modül eşlemesi
   `data-mat-id` HTML özniteliğiyle (MathJax textContent'i değiştirebildiği
   için metin eşleştirme KULLANILMADI). Her modülün `.acc-body`'sinin en
   üstüne JS ile enjekte edilen `.mat-done-btn` ("✓ Bu modülü tamamladım")
   ile işaretleniyor.
2. **`#ytSvg`** (PR #263) — Yapı Taşları'nın EN TEPESİNDE (6 kategori
   kartının hemen üstünde), 6 kategoriyi gösteren üst-seviye ağaç. Sınıflar
   `.ytn`/`.yte`, adlar `ytnGrad*`/`ytSnake`/`ytRgbFlow`/`ytflow`/`ytpulse`.
   localStorage: `attn_yt_done_v1` (matSvg'den tamamen bağımsız, biri
   diğerini temsil etmiyor). Önkoşul zinciri: Sayı Sistemleri → Türev
   Kuralları → {Aktivasyon Fonksiyonlarının Türevleri, İleri Konular};
   İstatistik ve Trigonometri kasıtlı olarak bağımsız/kilitsiz (kullanıcı
   onayladı). Kategori eşlemesi `data-yt-id` özniteliğiyle, her kategorinin
   `.acc-body`'sinin en üstüne `.yt-done-btn` enjekte ediliyor.

Her iki ağaç da ortak global pop-up motorunu (`[data-pop]`+`.xt-src`,
`js/lesson-linreg.js`) ve tam ekran mekanizmasını (`.xt-wrap`/
`.xt-full-btn`) kullanıyor — o kısım gerçekten paylaşılan/genel (PR #257).
Sadece SVG çizim/kilit-durumu mantığı (node/cable renk-durum CSS'i,
localStorage, `stateOf()`) her ağaçta bilinçli olarak tekrar yazılıyor.

**Bulunan ve düzeltilen site-geneli hata (PR #262)**: genel `.acc`
accordion sisteminde `.acc.open .acc-body{display:block}` kuralı boşluklu
(descendant) bir seçiciydi — bu yüzden açık bir üst `.acc` (ör. bir
kategori) içindeki TÜM `.acc-body`'leri (kendi `.open` durumundan bağımsız)
gösteriyordu; kategori açılınca içindeki modüller/`.gecis-karti`/`matSvg`
hep açık görünüyor, tıklayınca kapanmıyordu. Üç kural (`.acc-head` rengi,
ok dönüşü, `.acc-body` display) `>` (doğrudan çocuk) seçiciye çevrildi —
sitedeki TÜM `.acc` blokları zaten doğrudan çocuk yapısı kullandığı için
güvenli bir düzeltmeydi. Yeni bir ağaç/accordion eklerken bu seçici
kuralına dikkat: descendant (boşluklu) selector'lar iç içe `.acc` yapılarda
sızıntı yapar, `>` kullan.

**`#ytSvg`'nin evrimi (PR #265→#270) — GÜNCEL mimari**: `#ytSvg` PR
#265'te "kategori kartına tıkla → altında sade bir modül listesi aç"
olarak başladı ama kullanıcı geri bildirimleriyle üç kez önemli ölçüde
değişti; en son (güncel) hâli şöyle:

1. **Saf SVG DEĞİL, HTML kart + SVG-kablo-katmanı hibrit mimari** (PR
   #268). `#matSvg`'nin aksine, 6 kategori artık gerçek DOM elemanı
   (`.yt-card`, `.yt-cols` içinde 3 sütun — soldan sağa Yol Haritası
   gibi, PR #267). Sadece bağlayıcı kablolar SVG (`.yt-cables`) ve JS her
   render'da kartların GERÇEK ekran konumuna göre (`getBoundingClientRect`)
   yeniden çiziyor. Neden: kategori altında açılan mod listesinin GERÇEK
   DOM AKIŞINDA (reflow, komşu kartı iterek) açılabilmesi için — kullanıcı
   floating/absolute bir kutunun komşu karta binmesini istemedi ("bizim
   dizaynımıza gömülü olarak açılsın").
2. **3 seviyeli iç içe açılan liste**, hepsi aynı "gömülü/reflow" mantığı:
   - **Seviye 1→2**: bir `.yt-card`'a (kategori) tıklanınca, kendi
     sütununda hemen altına `.yt-ml-inline` (o kategorinin modül listesi,
     `ytmod-N` id'li 14 modül) açılıyor.
   - **Seviye 2→3**: bir modül satırına tıklanınca artık SAYFAYA
     GİTMİYOR. İlk denemede (PR #270) ✏️ Alıştırma soruları altına
     (`.yt-ml-sub`) açılıyordu — kullanıcı düzeltti: "bu değil ...
     köprüden bırakılan top, h→0 tanımı ... bunları kastettim, altına
     değil sağına dal gibi". PR #272'de düzeltildi: içerik artık modül
     içindeki `.pts`/`<h3>` SAHNE/örnek bölümleri (`MOD_SCENES`,
     `yts-M-N` id'li, 8 modülde 21 sahne) ve satırın **altına değil
     AYNI satırın SAĞINA** açılıyor — satır + sahne kutusu bir
     `.yt-ml-pair` flex sarmalayıcısında yan yana, aralarında
     `.yt-cables`'a eklenen animasyonlu bir `.yt-scwire` bağlantı
     çizgisiyle (kilit/durum taşımıyor, salt görsel "dal" bağlantısı).
     Sahnesi olmayan modüllerde (5-9, 14) tıklamak hâlâ doğrudan
     `openModule()`'e (sayfaya git) düşüyor.
   - **Yaprak (sahne) tıklaması**: `openScene()` — kategori+modül
     accordion'larını kademeli açıp sayfada o `.pts` bölümüne scroll
     ediyor (`.pts` her zaman görünür/collapsible değil, sadece
     ata'ların açılması + scroll yeterli). Bu üç seviyeli yapı
     `CAT_MODULES`/`MOD_SCENES` sabitleri + `openSet`/`openScSet`
     (Set — birden fazla eşzamanlı açık olabilir) + `highlightId` (tek,
     sadece kablo önkoşul-zinciri vurgusu için) ile yönetiliyor.
   - **Sağa-dal genişlemesi overlap yaratmadan**: `.yt-col` ve
     `.yt-ml-inline` sabit `width:190px` DEĞİL, `width:max-content` +
     `min-width:190px` — bir modülün sahne dalı açılınca o SÜTUN
     gerçekten genişliyor, flexbox bunu komşu sütunları GERÇEK reflow
     ile sağa iterek çözüyor (aynı `#ytInfoPanel`'de öğrenilen ders: asla
     `position:absolute` ile "sağa doğru büyüme" simüle etme, gerçek
     box-model büyümesi kullan).
   - **"Hepsini göster/gizle" araç çubuğu** (`#ytShowAll`/`#ytHideAll`,
     PR #269): 3 seviyeyi de aynı anda açıp kapatıyor — kullanıcı
     "herşeyin temsilini göstermek istiyorum" dedi.
3. **Sağ-üst bilgi paneli** (`#ytInfoPanel`, PR #269) — kart/kablo
   hover/tıklamasının açıklaması artık paylaşılan floating `#xtPop`
   pop-up'ında DEĞİL (o, komşu içeriğin üstüne biniyordu), `.yt-tree-inner`
   içinde GERÇEK bir flex sütunu olarak sağda duruyor (`position:absolute`
   DEĞİL — dar pencerede asla üstüne binmez, sadece yatay kaydırmaya
   katılır). Bunun için kart/kablolardaki tetikleyici öznitelik `data-pop`
   DEĞİL `data-info` (paylaşılan pop-up motoru `[data-pop]` seçiyor, bu
   yüzden `data-info` bilinçli olarak ondan ayrı tutuluyor).
4. Mobil netlik: `#ytSvg`'nin genişlediği (yatay 3 sütun) için `min-width`
   zorunlu (`.yt-tree-inner{min-width:fit-content}`) — shrink-to-fit YAPMA,
   dar ekranda küçülüp okunmaz olmak yerine `.yt-tree-stage{overflow-x:auto}`
   ile yatay kaydırılıyor (matSvg'nin aksine — matSvg 560px viewBox'ta
   kalıyor, ytSvg şimdi çok daha geniş, aynı shrink mantığı orada
   çalışmıyordu).

**Ders — iç içe `.acc` deneme yapılırken bulunan bir hata (PR #269)**:
manuel HTML düzenlemesi sırasında bir fazladan kapanış `</div>` kaldı,
bu da `#model-matematik .acc-category` sorgusunun SESSİZCE boş dönmesine
yol açtı (görünürde sayfa çalışıyordu ama tüm 6 kategori regresyon
testinden kayboluyordu). Büyük HTML script'i DIŞINDA manuel `Edit` ile
`.acc`/`.yt-*` yapısı değiştirilince MUTLAKA `s.count("<div") ==
s.count("</div>")` ile denge kontrol edilmeli — sadece Python script'i
kullanırken değil.

**Olası sonraki adım (henüz istenmedi, aceleyle başlama)**: diğer 5
kategoriye de `matSvg` tipi gerçek modül-seviyesi tamamlanma/kilit takibi
eklemek — şu an sadece Türev Kuralları'nda var (`attn_mat_done_v1`).
Kullanıcı bunu istediğinde konuşulacak.

## Yol Haritası (tech-tree) notları

- `js/app.js` içinde büyük bir IIFE: `NODES`, `ERAS`, dual-mode (yatay
  masaüstü / dikey mobil, `VERT` bayrağı) SVG çizim mantığı.
- Düğüm seçim kenarlığı (`.tn.sel rect.tn-card`) "yılan" tekniğini
  kullanıyor: `pathLength="100"` (rect'e app.js'te veriliyor) + küçük
  yüzdesel `stroke-dasharray` (18/82) + sürekli `stroke-dashoffset`
  animasyonu — kart boyutundan bağımsız, kartın çevresinde sürekli
  dolaşan küçük bir ışık şeridi izlenimi verir. **Bu teknik SADECE kapalı
  bir döngü/kutu çevresi için uygun** — açık uçtan uca bir hat (kablo)
  için denendi ama hattın "kopuk" görünmesine yol açtığı için kablolarda
  KULLANILMIYOR, geri alındı (bkz. git geçmişi).
- Bağlantı kabloları (`.te-off`/`.te-on`) klasik GERÇEK PİKSEL
  `stroke-dasharray` (`6 5` / `7 5`) + `@keyframes ttflow`
  (`stroke-dashoffset:-11`) kullanıyor — kablo kısa da uzun da olsa tire
  boyu sabit kalır, hat baştan sona bağlı/sürekli görünür, sadece kayarak
  akar. `te-off` (kilitli) daha yavaş (1.6s), `te-on` (güçlü) daha hızlı
  (.8s) akıyor — farkı renk değil hız taşıyor.
- Kablolar varsayılan durumda RENKSİZ (kilitli=kahverengi #9c8354,
  güçlü=yeşil #3f7d3f) — bir düğüme tıklanınca SADECE o düğümü açmak için
  gereken (köke kadar geçişli/transitive) kabloları `.te-req` sınıfı alıp
  rengarenk/"cafcaflı" akışa (AIpedia kutusuyla aynı 7 renk durağı,
  `teRgbFlow`) geçiyor. Çağ bazlı kalıcı kablo renklendirmesi bir ara
  denendi, kullanıcı geri istedi — kalıcı olarak DENENMESİN (bkz. git
  geçmişi, "her çağın bağlantı kablosu kendi çağ renginde olsun" → sonra
  "eskisi gibi renksiz olsun" geri alımı).

### Civ VII tarzı yeni kart dili (PR #282 → #284, TÜM ağaca genelleşti)

Kullanıcı Civ VII'nin tech tree ekran görüntüsünü örnek gösterip "bizimkini
iyi özelliklerini kaybetmeden böyle bir tasarıma geçse" dedi. Süreç:
önce statik bir mockup'ta (madalyon ikon, üstte başlık+durum rozeti,
altında "neyi açtığı" ikon şeridi, ayrı bir "mastery" alt-satırı, altın
parıltılı kenarlık, mühür köşeler, Cinzel başlık fontu) iki tur geri
bildirimle ("fena değil ama daha estetik olsun") tasarım netleşti, SONRA
kullanıcı iki net karar verdi: (1) Cinzel için Google Fonts kullanılsın
(sitenin İLK dış font bağımlılığı — `font-display:swap` ile güvenli), (2)
tüm ağaç yerine ÖNCE sadece Temeller Çağı canlıya alınsın, kullanıcı
sitede gezip onaylarsa kalan 4 çağ genelleştirilecek. **Şu an sadece
Temeller Çağı (mat/lin/akt) yeni dilde, kalanı eski Civ6 parşömen/kart
dilinde — bu KASITLI bir ara durum, hata değil.**

**Kademeli geçiş anahtarı**: `ERAS[i].newStyle=true`. `isNewStyle(n)`
bir düğümün tier'ine bakıp hangi çağa düştüğünü bulur, o çağ newStyle
işaretliyse yeni kart kullanılır. Sıradaki çağı geçirmek için tek
yapılması gereken o çağın objesine `newStyle:true` eklemek — kod başka
hiçbir şeye dokunmadan otomatik uyum sağlıyor (bkz. NW/NH/era-band
kodu, hepsi `isNewStyle()`'a bakıyor).

**Mimari — `<foreignObject>` ile gerçek HTML/CSS'i SVG'ye gömmek**:
`#techSvg` saf SVG kalmaya devam ediyor (Yapı Taşları'ndaki `#ytSvg`
gibi HTML-kart+SVG-kablo hibrit YAPILMADI — o mimari kartların DOM
akışında reflow ile açılıp komşuyu itmesi için gerekliydi, burada öyle
bir ihtiyaç yok). Onun yerine yeni-stil düğümler `newCardSvg()` ile
`<foreignObject>` içine gerçek `<div class="ttc-card">` gömüyor —
foreignObject içeriği SVG'nin viewBox ölçeklemesine (transform'a) tabi
olduğu için masaüstünde/mobilde/yeniden-boyutlandırmada AYRI bir CSS
gerekmeden otomatik büyüyüp küçülüyor (aynı `<text font-size="11">`
gibi vektörel SVG elemanlarının davrandığı gibi).

**Seçim "yılan" kenarlığı ve `justUnlocked` patlaması NASIL yeniden
kullanıldı**: bu iki efekt paylaşılan `#techSvg .tn.sel rect.tn-card` /
`.tn.justUnlocked rect.tn-card` kurallarına (pathLength=100 + dasharray
tekniği, üstteki nottaki AYNI "yılan") bağlı ve SADECE bir `rect`
elemanını hedefliyor. Yeni kartlarda görünen gövdeyi foreignObject
çiziyor ama YANINA (aynı boyutta, `gi=0` inset'siz) görünmez bir
"hayalet" `<rect class="tn-card">` daha ekleniyor — boşta hiçbir şey
görünmez (foreignObject üstünü tam kaplar, z-order'da SONRA gelir),
ama `.sel`/`.justUnlocked` durumunda SVG stroke path üzerinde
ORTALANDIĞI için yarısı foreignObject'in DIŞINA taşar ve görünür olur.
Bu sayede efektler için TEK SATIR CSS bile yazılmadı. **Önce `gi=2`
(içeri çekilmiş) denendi ama stroke tamamen foreignObject'in altında
kaldığı için görünmedi — `gi=0`'a düşürülünce düzeldi.**

**Genişlik uyumsuzluğu ve dinamik tier X-konumlandırma**: yeni kartlar
(300 birim) eski kartlardan (184-208 birim) çok daha geniş. Masaüstü
`layout()`'un eski `X=n=>125+n.tier*205` formülü SABİT bir tier
aralığı varsayıyordu — 300 birimlik kartlarla bu komşu çağı ezip
üst üste bindirdi (ilk denemede canlı ekran görüntüsünde net görüldü).
Düzeltme: tier X'leri artık o tier'deki EN GENİŞ kartın gerçek
genişliğine göre KÜMÜLATİF hesaplanıyor (`tierW[]`/`tierX[]`, GAP=60
birim ara boşluk). `tierW` dizisi `layout()` dışına (üst kapsam
değişkeni) taşındı ki era-band çizim kodu da (`X({tier:e.t0})-100`
gibi sabit kenar boşlukları yerine) gerçek kart genişliğine göre kenar
boşluğu hesaplayabilsin. **`W` artık sabit 2320 değil** — `#techSvg`'nin
`min-width`'i de CSS'te sabit bir sayı (eskiden 2410px) yerine
`render()` içinde JS'ten (`svg.style.minWidth=W+'px'`) uygulanıyor,
1 SVG birimi ≈ 1 CSS px varsayımıyla (masaüstünde zaten öyleydi).

**Mobil/dikey (VERT) modda kompakt varyant**: yeni kartlar VERT'te daha
dar (300→210 birim) ve daha kısa (150→104 birim) — hem canvas dışına
taşıp kırpılmasınlar diye (VERT'in slot matematiği eski 184-birimlik
kartlara göre ayarlı `mX` marjını kullanıyor, `mX` 100'den 108'e
çıkarıldı) hem de dar ekranda okunaklı kalsınlar diye. Kompakt modda
gerçek-hayat ikon şeridi (`.ttc-chips`) TAMAMEN GİZLENİYOR (JS'te
`if(!compact)` ile hiç DOM'a eklenmiyor bile), sadece başlık+rozet+
mastery noktaları kalıyor. **Bilinen küçük kusur (henüz çözülmedi)**:
çok dar kartta uzun başlıklar (`Lineer Regresyon` → `Lineer Regre...`)
ellipsis ile kırpılıyor — taşma/örtüşme yaratmıyor, sadece estetik bir
eksiklik; kullanıcı isterse kompakt kart genişliği/iç düzeni ayrıca
iyileştirilebilir.

**Cinzel fontu (Google Fonts) — sitenin İLK dış font bağımlılığı**:
`index.html`'e `<link>` ile eklendi, `font-display:swap` sayesinde
yavaş/başarısız yüklenmede sistem fontuna (Segoe UI) zarafetle düşüyor
— AIpedia'nın serif fontu için alınan "asla dış font indirme" kararının
(bkz. yukarıdaki not) İSTİSNASI, kullanıcının açık onayıyla.

**Tüm ağaca genelleştirme (PR #284)**: kullanıcı Temeller Çağı'nı
onaylayınca "iyi olmuş hepsini böyle yap" dedi — `ERAS` dizisindeki 5
çağın hepsine `newStyle:true` eklendi, kod başka HİÇBİR yere
dokunmadan uyum sağladı (kademeli mimarinin tam olarak amaçladığı şey).
Genelleştirme sırasında ölçeklenmeyen iki varsayım ortaya çıktı:

1. **Aynı tier içi dikey çakışma**: `Y=n=>100+(H-190)*n.v/100` formülü
   `n.v`'yi (0-100 elle verilmiş bir yüzde) SABİT `H=680` içinde ham
   bir konum olarak kullanıyordu — bu, eski 78-birimlik kartlar için
   yeterli boşluk bırakacak şekilde elle ayarlanmıştı. Yeni kartlar
   150 birim olunca aynı tier'deki iki düğüm (örn. Vektör & Nokta
   Çarpım / RNN+BPTT, ikisi de tier3) birbirine bindi. **Düzeltme**:
   `v` artık SADECE aynı tier içindeki sıralama için kullanılıyor
   (`arr.sort((a,b)=>a.v-b.v)`); gerçek Y, o tier'deki düğümlerin
   TOPLAM gerçek yüksekliğine (`NH(n)` toplamı + `VGAP=26` boşluklar)
   göre hesaplanıp tier'in dikey ortasına (`H/2`) göre ortalanıyor —
   VERT modda zaten kullanılan "sırala + eşit aralıklı diz" tekniğinin
   neredeyse aynısı, sadece eksen ve dayanak (H/2) farklı. **Ders**: bir
   düğüm/kart boyutunu değiştiren her genelleştirmede, o boyutu
   varsayarak elle ayarlanmış TÜM sabit sayıları (yüzdelik konum,
   satır/sütun aralığı, kenar boşluğu) yeniden gözden geçir — sadece
   ilk fark edilen ekseni (X) değil, diğer ekseni (Y) da.
2. **Arka plan dikişi**: `#techSvg`'nin KENDİ arka planı (era-band'ların
   ARKASINDAKİ taban) hâlâ eski Civ6 parşömen degradeydi — tek bir çağ
   newStyle iken bu bilinçliydi (geri kalanı hâlâ parşömen temaydı),
   ama TÜM çağlar koyu laciverte geçince kenarlarda/boşluklarda çirkin
   bir tan "dikiş" kaldı. `ERAS.every(e=>e.newStyle)` doğruysa
   `svg`'ye `techSvg-all-new` sınıfı eklenip taban da koyu laciverte
   çevrildi — eski parşömen kuralı SİLİNMEDİ (bir çağ ileride geri
   alınırsa yine devreye girsin diye), sadece daha spesifik bir kural
   üstüne eklendi.

**Hover tooltip (PR #284)**: kullanıcı "üzerlerine gelince Yapı
Taşları'ndaki gibi yazılar çıksın" dedi. Paylaşılan `[data-pop]`
motoruyla (`js/lesson-linreg.js`) DEĞİL, ayrı ve sadece hover'da çalışan
küçük bir kopyasıyla yapıldı — gerekçe: o motor click'te "pinle"ye
geçiyor, `.tn`'nin kendi click'i zaten seç+alt paneli açıyor, ikisi
AYNI elemanda olsaydı bir tıklama hem seçer hem pop-up'ı pinlerdi
(`#ytInfoPanel`'in `data-pop` yerine `data-info` kullanmasıyla BİREBİR
aynı gerekçe). Görsel dili (`.xt-pop`/`.xp-bas`/`.xp-sat`) paylaşılan
CSS'ten aynen alındı, motoru (`svg.addEventListener('mouseover'/
'mouseout', ...)`, `.tn[data-id]` üzerinde `closest()`) tamamen
bağımsız ve içerik HER hover'da canlı hesaplanıyor (statik bir
`.xt-src` kaynağı YOK — `stateOf(n)`/`subCount(n)` doğrudan çağrılıyor,
ilerleme değiştikçe otomatik güncel kalır).

**Özel scrollbar (PR #284)**: `#techSvg`'yi saran `<div
style="overflow-x:auto">`'a `id="ttScroll"` verildi, `.sb-inner`'daki
(satır ~309) AYNI ince-scrollbar deseni (`::-webkit-scrollbar` + Firefox
için `scrollbar-width:thin`/`scrollbar-color`) uygulandı. **Test notu**:
headless Chromium (Playwright) bu ortamda scrollbar'ı hiç render
etmiyor (overlay-scrollbar modu, `clientHeight===offsetHeight` ile
doğrulandı) — ekran görüntüsüyle doğrulanamadı, ama `.sb-inner`'da
ZATEN çalışan aynı teknik olduğu için gerçek tarayıcıda çalışacağına
güvenildi.

**Kilitli kart tonu + ikon ilerleme halkası (PR #286)**: kullanıcı canlı
Civ VII ekran görüntüleriyle iki şey daha işaret etti.

1. **Kilitli/açık kartlar arasındaki ton farkı çok sertti** — "açık
   modül ile kapalı modül arasında ton olarak çok fark var... neredeyse
   okunmayacak kadar solgun". Kök neden: `.ttc-card.ttc-locked{
   opacity:.66}` TÜM kartı (kenarlık + arkaplan + metin + ikon) birlikte
   soluklaştırıyordu. Civ VII referansında kilitli kartlar TAM OPAK,
   sadece daha az canlı renkli. **Düzeltme**: blanket `opacity` tamamen
   kaldırıldı; durum farkı artık SADECE kenarlık rengi (gri-mavi/altın/
   yeşil) + ikon doygunluğu (`saturate(.6)`→`saturate(.75)`) + başlık/
   rozet/chip tonuyla taşınıyor (chip `opacity:.4`→`.7`,
   `grayscale(.5)`→`.3`). **Ders**: "durumu ayırt edilebilir kıl" isteği
   otomatik olarak "agresif opacity/grayscale" ile çözülmemeli — önce
   TEK bir görsel özelliğin (burada: kenarlık rengi) yeterli ayrımı
   sağlayıp sağlamadığına bakılmalı, kalanı (ikon/metin) okunabilirlik
   lehine daha yumuşak tutulmalı.
2. **İkon çevresinde ilerleme halkası** — Civ VII'de teknoloji ikonunun
   çevresinde o teknolojideki ilerlemeyi (araştırma yüzdesi) gösteren
   dolan bir halka var. `.ttc-ring` olarak eklendi: `conic-gradient`
   (dolgu) + `radial-gradient` `mask` (ortayı oyup "donut" şekli
   vermek için) tekniği — SVG değil, saf CSS. Dolum oranı `--pct`
   (0-100) CSS custom property'siyle inline veriliyor
   (`style="--pct:NN"`), `js/app.js`'te `Math.round(k/N*100)` olarak
   hesaplanıp her `render()`'da güncelleniyor (`k`=`subCount(n)`,
   `N`=`n.sub.length` — zaten `.ttc-mastery` satırında kullanılan AYNI
   sayılar, yeni bir hesap gerekmedi). Kilitli düğümlerde alt-konu
   işaretlenemediği için (`show()`'da checkbox'lar `disabled`) halka
   otomatik boş kalıyor; tamamlanan düğümlerde `k` her zaman `N`'ye eşit
   olduğu için (recompute()/manuel "hepsini tamamladım" ikisi de tüm
   alt-konuları işaretliyor) halka otomatik tam doluyor — `st==='done'`
   için ayrı bir "halkayı tam göster" kuralı YAZILMADI, doğal sonuç
   zaten böyle çıkıyor.

**Kart çerçevesi — "işlenmiş madalyon" estetiği (PR #288)**: kullanıcı
"kutular biraz daha kenarlıklı olsun, aynısını kopyalamayalım, estetik
bir şeyler düşün" dedi — Civ VII'nin sade tek-çizgi kenarlığının
birebir kopyası DEĞİL, üç katmanlı özgün bir çerçeve tasarlandı:

1. Dış kenarlık 1.5px→2px.
2. **`outline` + negatif `outline-offset` (`-5px`) ile ikinci, soluk
   bir "iç çerçeve" çizgisi** — klasik pasepartu/tablo çerçevesi
   ikiliği. `outline` `box-sizing`/layout'u ETKİLEMEDİĞİ için ekstra
   bir DOM elemanı ya da üçüncü bir pseudo-element gerekmedi (bir
   elemanın zaten sadece `::before`/`::after` diye 2 pseudo-elementi
   olabiliyor, ikisi köşe perçinlerine ayrılmıştı — `outline` bu
   sınırlamayı bedavaya aştı).
3. **Dört köşede "perçin" noktaları** — tek bir `background` özelliğine
   eklenen 4 ayrı `radial-gradient` katmanı (`background:
   radial-gradient(...), radial-gradient(...), ..., #1c2a48` — SON
   katman düz renk, öncekiler küçük noktalar). Eski L-şeklindeki iki
   köşe parantezinin (`::before`=sol-üst, `::after`=sağ-alt, SADECE
   iki köşe) yerini aldı; dört köşe de simetrik. **Ders**: bir elemanın
   4 köşesine de bir şey koymak gerektiğinde ve sadece 2 pseudo-element
   hakkın varsa, `background`'a çoklu `radial-gradient` katmanı eklemek
   (her biri farklı `background-position`'da küçük bir nokta/şekil)
   pseudo-element sınırını aşan, tek elemanlı bir teknik.

Renkler (`--corner-c` custom property + `outline-color`) done/avail/
locked durum sınıflarıyla değişiyor — `--corner-c` `radial-gradient`
içinde `var()` ile kullanılıyor, durum sınıfı değişince perçin rengi de
otomatik güncelleniyor (ekstra JS gerekmedi, saf CSS cascade).

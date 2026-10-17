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

## RNN modülü — "5️⃣ Bütün Resim" aşaması (PR #300)

Kullanıcı "biz rnn için bizim genel uyguladığımız şablonu uygulamış
mıydık uyguladıysak neden bütün resim kısmı yok rnn de" diye sordu —
inceleyince XOR ve Neural Network modüllerinin ikisinin de artık
**"5️⃣ Bütün Resim"** diye ayrı bir aşaması olduğu (1→2→3→4→Bütün
Resim→Simülasyon→Ekstra→Test, 7 aşamalı) ama RNN'in hâlâ eski 6
aşamalı yapıda kaldığı ortaya çıktı — XOR/NN'e bu aşamanın NE ZAMAN
eklendiği (hangi PR) CLAUDE.md'de kayıtlı değildi, muhtemelen bu
dosyanın kapsamadığı daha erken bir oturumda yapılmıştı.

**Kapsam/içerik kararı (`AskUserQuestion` ile netleştirildi — iki tur)**:
1. RNN'in Simülasyon'u içinde zaten var olan ama gizli/toggle'lı duran
   `.ru-acc-row` (İleri+Geri Yayılım'ın "eski/filtrelenebilir görünüm"
   diye adlandırılmış düz formül-listesi hâli — `moOldViewToggle`
   butonuyla açılıyordu, many-to-one'da varsayılan KAPALI) kullanıcının
   seçtiği "var olanı taşı" seçeneğiyle yeni aşamaya taşındı: içerik
   Simülasyon'dan çıkarılıp "5️⃣ Bütün Resim"e kondu, artık kendi
   aşamasında olduğu için gizlenmeye gerek kalmadı (toggle butonu ve
   `moOldViewOpen` state'i tamamen kaldırıldı).
2. **Düzeltme**: kullanıcı canlıya bakınca "hiç yaparken var olan bütün
   resim sekmesindeki yapılanalra bakmadın mı benziyo mu hiç" dedi —
   taşınan içerik (düz MathJax formül listesi, iki accordion) XOR'un
   gerçek kutu+ok diyagramına (`#xeTreeWrap`) GÖRSEL olarak hiç
   benzemiyordu, sadece kavramsal olarak örtüşüyordu. İkinci bir
   `AskUserQuestion` ile "XOR tarzı diyagrama çevir" onayı alındı,
   içerik XOR'un `.xf-*`/`.xt-*` bileşenleri yeniden kullanılarak
   gerçek bir diyagrama dönüştürüldü. **Ders**: "var olanı taşı" dar
   anlamda doğru olsa bile, kullanıcı aynı anda (önceki turda) "XOR'la
   aynı üslup" emsalini göstermişse, taşınan içeriğin GÖRSEL olarak da
   o emsale benzeyip benzemediği ayrıca kontrol edilmeli — kavramsal
   eşdeğerlik görsel tutarlılığın yerine geçmiyor.

**Mimari — RNN'in zaman-tekrarlı zincirine uyarlanan XOR dili**:
- **İleri yol** (`.xf-akis`, aynı `.xf-box`/`.xf-chip`/`.xf-ok` sınıfları):
  XOR'un tek-geçişli zincirinden farklı olarak RNN 3 zaman adımını ART
  ARDA tekrarlıyor — x₁,h₀→z_h⁽¹⁾→h₁→(x₂ eklenir)→z_h⁽²⁾→h₂→(x₃)→
  z_h⁽³⁾→h₃→z_y→ŷ→L. Her ok tıklanabilir chip (`data-pop`).
- **Geri yol** (`.xt-tree`, aynı `.xt-node`/`.xt-kids`/`.xt-kid`/
  `.xt-box`/`.xt-edge` sınıfları): XOR'un 2 seviyeli DAL YAPISI yerine
  (gövde → iki bağımsız nöron dalı) RNN'de DOĞRUSAL ama DERİN bir
  "tarak" şekli var — her zaman adımında aynı dallanma tekrarlanıyor
  (bir dal o adımın gizli ağırlıklarına — W<sub>xh</sub>, W<sub>hh</sub>,
  b<sub>h</sub> — üç yaprak verir, bir dal BPTT ile bir önceki zaman
  adımına devam eder). Kök (L) ile en derin yaprak (t=1'in W<sub>xh</sub>
  katkısı) arası 9 seviye iç içe `.xt-kids` — XOR'dan çok daha derin
  ama daha dar bir ağaç; zincirin uzunluğu BPTT'nin "zaman içinde geri"
  doğasını görsel olarak da taşıyor. t=1'de h₀ sabit (eğitilebilir
  değil) olduğu için zincir orada doğal olarak sonlanıyor — W<sub>hh</sub>'nin
  t=1 katkısı (h₀=0 çarpanı yüzünden) her zaman 0, bu pop-up notunda
  açıkça belirtiliyor.
- **Toplam 11 yaprak** (W<sub>hy</sub>, b<sub>y</sub> + 3 zaman adımı ×
  {W<sub>xh</sub>, W<sub>hh</sub>, b<sub>h</sub>} = 2+9) — XOR'un "dokuz
  yaprak" kavramının doğrudan analoğu, callout'ta açıkça "W<sub>xh</sub>/
  W<sub>hh</sub>/b<sub>h</sub> her zaman adımında yeniden kullanıldığı
  için 9 kez yaprak veriyor ama gerçek gradyan üç yaprağın TOPLAMI"
  diye vurgulanıyor.
- **28 `data-pop`/`xtsrc-` türetme pop-up'ı** eklendi — paylaşılan
  `[data-pop]` motoru ve `.xt-wrap`/`.xt-full-btn` tam ekran mekanizması
  (`js/lesson-linreg.js`) SINIF/ÖZNİTELİK tabanlı olduğu için (bkz.
  üstteki Civ VII notundaki emsal) **sıfır yeni JS** gerekmeden otomatik
  çalıştı — sadece doğru `class`/`data-pop`/`id="xtsrc-KEY"` deseniyle
  HTML yazmak yeterliydi.

**JS — mevcut hesaplama kodu korunup sadece hedefleri değişti**:
`js/app.js`'teki büyük `render()` fonksiyonunda (eskiden `ruFeq1`..
`ruBeq9` id'lerini dolduran) hesaplama bloğu DOKUNULMADAN kaldı — sadece
`setTxt()` çağrılarının hedef id'leri yeni ağacın `rf*`/`rt*` kutularına
yönlendirildi (ör. `ruZ1val`→`rfzh1v`, `ruB3xval`→`rtWxh3v`). Guard da
`if($('ruFwd'))`'den `if($('rfzh1'))`'a güncellendi — eski id DOM'dan
kalktığı için guard hiç geçmiyordu, fark edilip düzeltildi.

**Diyagram↔ağaç vurgu bağlantısı yeniden kuruldu, DAHA GRANÜLER**:
Tek hücre diyagramında (`rnn-fc-right`, `#cellSvg`) bir düğüme tıklayınca
(İleri▶/◀BPTT adım butonları) `apply()` fonksiyonu önceden `ruFeq*`/
`ruBeq*` id'lerine `eq-hl-f`/`eq-hl-b` sınıfı ekleyip ilgili satırı
vurguluyordu; `buildM2o()`'daki `fSteps`/`bSteps` dizilerinin `eq:`
alanları yeni id'lere taşındı. Eski format bazı adımları (ör. hem z<sub>h</sub>
hesaplama hem b<sub>h</sub> satırı) AYNI id'de birleştiriyordu — yeni
ağaçta bunlar ayrı kutular olduğu için eşleme DAHA GRANÜLER hale geldi
(z<sub>h</sub><sup>(n)</sup> düğümü ile b<sub>h</sub> yaprağı artık
ayrı ayrı vurgulanıyor). `.xf-box`/`.xt-box` için `eq-hl-f`/`eq-hl-b`
CSS kuralı da yeni eklendi (`css/style.css`) — eskisi sadece düz `.eq`
satırları için tanımlıydı, kutu şeklindeki elemanlarda hiç çalışmazdı.
`apply()`'daki `ruFwdAcc`/`ruBwdAcc`'i açan özel kod da kaldırıldı
(o accordion'lar artık yok), yerine jenerik "Bütün Resim tpl-cl'sini
aç" mantığı kondu (vurgu, dış aşama kapalıyken görünmez olmasın diye).

**Yapısal temizlik**: Simülasyon'daki eski 2-sütunlu sürüklenebilir
düzen (`rnn-fc-left` + `rnnColResizer`, içerik taşındığı için solda
gösterecek bir şey kalmadı) HTML'den tamamen silindi, ona ait ayrı
resizer JS IIFE'si de kaldırıldı (`getElementById` zaten `null` dönüp
güvenle no-op oluyordu ama kodu da temizlemek daha doğruydu).
`rnnFwdCols`'a statik `rfc-diagram-only` sınıfı eklendi (zaten var olan
CSS kuralı — tek sütun, ortalanmış diyagram).

**Pop-up'lara eksik kalan "canlı köprü" eklendi (PR #302)**: ağaç
canlıya alınınca kullanıcı XOR'un `∂L/∂p` pop-up'ını örnek gösterip
"daha ayrıntılı, sen çok kısa anlatmışsın" dedi. Kök neden türetme
METNİ değildi (RNN'in çoğu türevi zaten tek-adımlı K3 uygulaması,
XOR'un `Lp` gibi çok-adımlı cebirsel örneklerinden doğal olarak daha
kısa) — eksik olan, XOR'un HER arka-plan pop-up'ının sonunda olan ama
RNN'e hiç taşınmamış **"🔗 Peki gradyan buradan nasıl çıkıyor?"**
canlı sayı köprüsüydü (`js/lesson-xor-epoch.js`'teki `zin()`/`ara()`/
`yaprak()` deseni, `[data-zincir]` hedefli, her `render()`'da
`.xp-zin` elemanlarının `innerHTML`'ini günceller). RNN'in 19 arka-
plan pop-up'ının hepsine `<div class="xp-zin" data-zincir="r_KEY">`
eklendi, `js/app.js`'e aynı `zin()`/`ara()` + RNN'e özgü yeni bir
`uclu()` yardımcısı kondu. **Fark**: XOR 4 örneğin (batch) ORTALAMASINI
gösterirken, RNN'de tek örnek var ama aynı ağırlık (W<sub>xh</sub>/
W<sub>hh</sub>/b<sub>h</sub>) 3 zaman adımında kullanıldığı için 3
katkının TOPLAMINI gösteriyor (`t=1/2/3: değer` satırları, geçerli
adım "← bu adım" ile işaretli, sonunda toplam satırı). **Ders**:
"daha ayrıntılı olsun" geri bildirimi otomatik olarak "metni uzat"
anlamına gelmiyor — önce XOR'un referans örneğindeki YAPISAL
bileşenleri (burada: türetme + canlı-sayı-köprüsü, iki ayrı parça)
tek tek karşılaştırıp HANGİ parçanın eksik olduğunu tespit etmek
gerekiyor; RNN'in türetme metni zaten yeterliydi, eksik olan tamamen
farklı bir bileşendi (canlı köprü).

**İleri yola da aynı köprü eklendi (PR #304)**: kullanıcı PR #302
canlıya alınınca "z_y'nin üstüne geldiğimde z_y hangi çarpımlarla
oluştu yazsın, bu attığım örnek gibi ama daha ayrıntılısı" dedi —
PR #302 SADECE geri yayılım (`.xt-*`) pop-up'larına canlı köprü
eklemişti, ileri yol (`.xf-*`) pop-up'ları (z_h⁽¹⁾, tanh, z_y, ŷ, L
— 9 tanesi) hâlâ sadece formül+açıklama seviyesindeydi, XOR'un KENDİ
ileri yol pop-up'ları da zaten hiç canlı köprü taşımıyordu (incelenince
`xtsrc-f_zh`/`f_zy` gibi `.xp-zin` div'lerinin HTML'de durduğu ama
hiçbir JS'in onları doldurmadığı görüldü — XOR'un kendisinde de eksik/
yarım kalmış bir yer, RNN için örnek alınmadı). İleri yolun 9
pop-up'ına **"📐 Şu anki sayılarla nasıl hesaplanıyor?"** başlıklı
(geri yayılımın 🔗 ikonundan kasıtlı olarak farklı, 📐 ikonuyla) bir
köprü eklendi — her biri o değerin HANGİ çarpım/toplamlardan oluştuğunu
gerçek sayılarla gösteriyor (ör. `z_y = W_hy·h₃ + b_y = (0.80)(0.588)
+ 0.20 = 0.670`). `js/app.js`'te `zinF()`/`araF()` adıyla (geri
yayılımın `zin()`/`ara()`'sından ayrı, çünkü farklı bir kod bloğunda,
ileri yol değerlerinin hesaplandığı yerde çalışıyor) zaten hesaplanmış
değişkenler (`rz1`, `rh1`, ... `ryhat`, `rL`) yeniden kullanılarak
yazıldı, yeni hesaplama eklenmedi.

**Bütün Resim'e sıkıştırılmış canlı devre diyagramı (PR #306)**: kullanıcı
ağacın boş alanına mimariyi sıkıştırıp oradan görsel olarak da
çalıştırabilmeyi istedi. `AskUserQuestion` ile netleşti: kapsam = SADECE
devre diyagramı + İleri▶/◀BPTT (eğitim döngüsü ▶⏩■↺ + iterasyon/maliyet
kapsam dışı — Bütün Resim tek örneği gösteriyor, çok-epoch eğitim oraya
uymuyor); yerleşim = ileri yol satırının altı, geri yol başlığının üstü
(`.bp-live`). **Mimari**: Simülasyon'daki `#cellSvg` IIFE'si
`rnnCellInit(P)` fabrikasına çevrildi (`js/app.js`), iki örnekle kuruluyor
— ikinci örnek (`bpCell*` id'leri, `pre:'bp_'`) SVG içindeki id'leri ve
`marker-end` referanslarını önekliyor (çift id olmasın) ve vurgu
aramalarını `svg.querySelector('[id="'+pre+id+'"]')` ile kendi SVG'sine
kapsıyor; ağaç/akış vurgusu (`eq:` haritası) iki örnek için ortak.
`window.__rnnCellSetMode` sadece Simülasyon örneğine bağlı (Bütün Resim
hep many-to-one). **Ders**: aynı stateful SVG+JS widget'ı ikinci bir yere
koymak için kodu kopyalamak yerine IIFE'yi parametreli fabrikaya çevirmek,
id'leri önekleyip aramaları kapsamak — iki örnek birbirinin durumunu
bozmadan tek kod yolunu paylaşıyor.

**Hücre diyagramı sadeleştirildi — dik açılı çizim (PR #308)**: kullanıcı
Stanford tarzı bir RNN hücre görseli gösterip "bizimki karmaşık, ilk başta
öyleydi sonradan bozuldu" dedi. Çapraz `ar()` okları kalktı; yerine `pl()`
(dik açılı `<path>` polyline) geldi: ana hat yatay, x aşağıdan ×Wxh ile
dirsek yapıp +'ya, bh yukarıdan, ŷ dalı çıkıştan yukarı. Aynı dil üç yerde:
Tek Hücre IIFE'si (`scSvg`) ve `rnnCellInit` içindeki `buildM2o`/
`buildM2mEq` (`cellSvg` + `bp_` kopyası). Id'ler, `hl`/`eq` eşlemeleri
değişmedi. **Ders**: satır aralığıyla toplu değiştirirken
`svg.setAttribute('viewBox',...)` gibi komşu yan satırlar sessizce
silinebilir. Devamında (bu PR) Bütün Resim canlı diyagramı ortalandı
(`.bp-live-grid .cell-diagram` flex + m2o viewBox `-25 0 950 316`) ve
sağ sütunun üstüne kapalı gelen `.bp-nota` Notasyon accordion'u eklendi.

## RNN — 5 türün hepsi için Bütün Resim (PR #310, #311, #312)

Kullanıcı Stanford'un RNN türleri tablosunu gösterip "bütün resim kısmını
bütün RNN çeşitleri için yapalım" dedi; `AskUserQuestion` ile kapsam =
**5 tür** (Tek Hücre/one-to-one, many-to-one, many-to-many Tx=Ty,
one-to-many, many-to-many Tx≠Ty), kayıp = Σ L_t. Tür seçici
(`data-rt="tek|m2o|m2mEq|o2m|dec"`) hem Simülasyon diyagramını hem
`#rnnBigPicture{Tek,M2o,M2m,O2m,Dec}` bloğunu değiştirir (`js/app.js`
switcher). Kullanıcı bundan sonra PR'ları **sormadan birleştirmemi**
istedi ("bundan sonra sorma birleştir").

- **Tek Hücre / many-to-many (Tx=Ty)**: HTML'i Python üreticileriyle
  (scratchpad'de, repoda yok) şablonlayıp `index.html`'e koyduk; ids
  `tf*/tt*` (tek), `mf*/mt*` (m2m); pop-up anahtarları `t_*`/`m_*`;
  canlı diyagramlar `rnnCellInit` ve `scInit` fabrikalarının ek örnekleri
  (`bs_`, `bq_` önekli). Tek Hücre IIFE'si `scInit(P)` fabrikasına çevrildi.
- **one-to-many / Tx≠Ty**: genel `buildSeq(cfg)` (diyagram + adımlar) ve
  `seqFill(cfg)` (canlı değer + köprüler), cfg = `{pf,T,inp[],out[]}`
  (adım başına girdi/çıktı var-yok). o2m: T=3 inp=[1,0,0] out=[1,1,1];
  dec: T=4 inp=[1,1,0,0] out=[0,0,1,1]; ids `o*`/`d*`. Ağırlıklar Tek
  Hücre kaydırıcılarıyla ortak, her türün kendi x/y kutuları var
  (`o_x1`, `d_y3`... `render` listener listesinde). Encoder-decoder aynı
  W'yi 4 kez kullanıyor (gerçekte ayrı) — sayfada not var.
- **Ağaç tasarımı**: çıktı adımlarının dalları kökten ayrılır, EN SON
  çıktılı adım ana zincirdir (BPTT); diğer çıktı dalları `↪ h_t`
  kutusuyla ana zincirdeki h_t'de toplanır (tek ağaç iki ebeveyn
  taşıyamadığı için). Çıktısız adımların h_t'si "sadece BPTT" alır.
- **Doğrulama dersi**: gradyanlar bağımsız bir sonlu-fark (finite
  difference) betiğiyle sayfadaki değerlerle karşılaştırıldı (beş ağırlık,
  iki tür, birebir) — yeni bir BPTT varyantı eklerken bunu yap.
- **Hata dersleri**: (1) `setTxt` `const` olarak tanımlanmadan önce
  kullanılan blok TDZ hatası verdi — canlı-değer bloğunu `setTxt`
  tanımından SONRA koy; (2) tek-hücre diyagramı için genişlik sınırı
  (`#bsCellSvg{max-width:480px}`) unutulunca ekranı doldurdu — yeni bir
  `.bp-live` örneğine her zaman kendi `max-width` kuralını ver.

**Tek Hücre "Geri Adım 5" yeniden yazıldı (PR sonrası)**: kullanıcı "whh
gradyanı −0.0271 bulundu, ee sonra ne oluyor, bu adım akıllıca anlatılmıyor"
dedi — kart "Zaman boyunca topla" idi ama TEK zaman adımında toplanacak bir
şey yok, vanishing örneği de varsayımsaldı; asıl "gradyan bulundu, sonra?"
sorusu (ağırlık güncelleme) kapalı bir accordion'da gömülüydü. Kart artık
**"Ağırlıkları güncelle"**: W := W − α·∂L/∂W formülü + beş ağırlığın canlı
güncellenmiş değeri (`#rcS5Rows`) + güncelleme öncesi/sonrası ŷ ve L
(`#rcS5Loss`, `render()` içinde). Eski toplama/vanishing içeriği SİLİNMEDİ,
kartın içinde kapalı bir "Zincire geçince ne olur?" accordion'una taşındı.
**Ders**: bir adımın başlığı o adımda GERÇEKTEN olan şeyi söylemeli;
kullanıcı "bu adımdan sonra ne oluyor" diye soruyorsa eksik halka genelde
bir sonraki mantıksal adımdır (burada güncelleme), mevcut metni uzatmak
değil.

**many-to-one "Geri Adım 6 — vanishing gradient, sayılarla" (`#moAdim6`)**:
kullanıcı sözel anlatımı reddedip "sayılarla görmek istiyorum, tek hücredeki
geri yayılım kartları kadar detaylı olsun" dedi (r/g harfleri
tanımlanmadan kullanıldığı için de karışıklık vardı). Kart: ① δ_t zinciri
tablosu (önceki sinyal × W_hh × (1−h²) = δ, t=3'ün %'si), ② δ'dan ağırlık
gradyanlarına tablo (dW_xh=δ·x, dW_hh=δ·h_{t−1}, db_h=δ), ③ aynı çarpanla
10 adıma tahmin + çubuk grafik (`#mo6Canvas`), 💡 canlı "Ne öğrendik".
Hepsi `render()` içinde mevcut `rdz*/dWxh*` değişkenlerinden, yeni hesap yok.
**Ders**: kavram anlatımında harf/sembol (g, r, δ) kullanmadan ÖNCE tanımla;
kullanıcı "sözel anlatma, sayıyla göster" diyorsa tablo + canlı sayı ver.

**RNN geri-yayılım pop-up'ları XOR-tarzı "yol + çarpım" köprüsüne geçti**:
kullanıcı pop-up'taki "dW_hh|t=3 = 0.0147" gibi sayıların NEREDEN çıktığını
anlamadı ("BPTT'nin kalbi diyorsun ama önceki adımdaki işlemler nasıl oldu
anlaşılmıyor, XOR'un geri yayılımına bak, hepsine entegre et"). XOR'un
pop-up'ı her halkada **yerel türev × bir önceki halkadaki gradyan = bu
halkanın gradyanı** satırını gösteriyor; RNN köprüleri sadece "üç katkının
toplamı"nı gösteriyordu. Şimdi ORTAK `rnnBridges(cfg, st)` + `rnnState(cfg)`
(`js/app.js`, `render()` içinde, `seqFill`'in yanında) beş türün hepsinin
(Tek Hücre `t_*`, many-to-one `r_*`, many-to-many `m_*`, one-to-many `o_*`,
Tx≠Ty `d_*`) geri-yayılım pop-up'larını doldurur: **📍 L'den bu halkaya
kadar adım adım** (ŷ→z_y→h→δ→BPTT→… hepsi canlı sayılarla, derin
halkalarda önceki adımların da dökümü) + **🔗 bu halka**: yerel türev ×
önceki gradyan = sonuç, yaprakta adımların toplamı. `cfg.K(name,t)` her
türün `data-zincir` anahtar adlandırmasını eşler. Eski tür-özel `zin()/zM()`
köprü kodları yerinde duruyor ama `rnnBridges` ÇAĞRISI render'ın EN SONUNDA
(`return` öncesi) yapılıyor ki onları ezsin — sıra önemli (önce koyunca
many-to-one/many-to-many'nin eski kodu geri yazıyordu). many-to-one'a eksik
olan 3 `r_zh{t}h{t-1}_from` h-kutusu pop-up kaynağı da eklendi.
**Ders**: kullanıcı "sayı nereden geldi" diyorsa köprü yalnızca SONUCU
değil, o sonuca giden ZİNCİRİN her halkasını (kaynağıyla) göstermeli.

**RNN köprüleri MathJax'e çevrildi (rnnBridges 2. tur)**: ilk sürüm köprüyü
`.xp-hes` içinde düz monospace + unicode alt indislerle yazmıştı — kullanıcı
"XOR'da MathJax var, burada hiç bir şey okunmuyor" dedi. Artık `rnnBridges`
her satırı gerçek LaTeX (`\\begin{aligned}` + `String.raw` şablonları)
olarak üretiyor (`.rb-eq`, pop-up açılınca `typesetMath` zaten çalışıyor);
satır başına tek satır `sembol = yerine konmuş = sonuç` (kalın sonuç),
tek-kaynaklı yinelenen toplam satırı yolda atlanıyor (yükseklik için),
yaprakta `\\underbrace` ile adımların toplamı. 190 RNN pop-up kaynağı bir
geçici div'e koyulup `typesetPromise` ile `mjx-merror` sayıldı (0).
**Ders**: sayfadaki bir bileşen "XOR'daki gibi" isteniyorsa görsel dili
(MathJax, aligned, kalın sonuç) de kopyala — monospace metin "aynı bilgi"
sayılmıyor.

**Ağırlık kaydırıcıları tüm RNN türlerinde ortak + canlı pop-up hatası**:
(1) kullanıcı W_hy'yi oynatmak için her seferinde Tek Hücre'ye dönmek zorunda
kalıyordu ("bütün modellerin başında olsun") — `#rcSliderPanel` (kaydırıcılar
+ α) `#rnnTypeTek` dışına, tür seçici notunun hemen altına taşındı; x/h₋₁/y
kutuları (`#rcTekInputs`) sadece Tek Hücre'ye ait olduğu için tür
değişince gizlenir (switcher). (2) W_hy kaydırılınca AÇIK pop-up'ta ham
`\\( \\begin{aligned}…` metni görünüyordu: pop-up kaynağın KLONUNU taşıdığı
için `data-zincir` özniteliği klonda da duruyor ve `render()`'ın
`querySelectorAll('[data-zincir=…]')` yazımı klonu da eziyor (typeset
edilmeden). `rnnBridges.put()` artık `#xtPop` içindeki elemanı yazdıktan
sonra `typesetClear+typesetPromise` çağırır. **Ders**: canlı güncellenen
içerik bir pop-up/klon olarak çoğaltılıyorsa, güncelleme seçicisi klonları
da yakalar — LaTeX içeren her canlı yazımda "klon açıkken" durumunu test et.

**Açık pop-up + kaydırıcı sürükleme: güncellemeyi debounce'la (`popQueue`)**:
önceki düzeltme (klonu her render'da typeset et) sürüklerken (art arda onlarca
`input`) MathJax kuyruğunu şişirdi, kullanıcı W_hh'ı sürüklerken yine ham
`\\( \\begin{aligned}` gördü. `rnnBridges.put()` artık `#xtPop` içindeki klonu
doğrudan yazmaz: `popQueue(el,html)` en son HTML'i saklar, kullanıcı ~150ms
durunca tek seferde yazıp `typesetPromise` çağırır (arada eski, düzgün render
edilmiş içerik kalır). **Ders**: canlı değişen + her değişimde yeniden
typeset edilen içerik, sürekli `input` olaylarında debounce'lanmalı.

**GERÇEK kök neden: pop-up motoru kaynağı typeset etmeden kopyalıyor
(`js/lesson-linreg.js` `ac()`)** — iki önceki "klonu typeset et/debounce"
düzeltmesi (klon-güncelleme yolu) asıl sorunu kaçırdı. `ac(el)`
`pop.innerHTML = kaynak.innerHTML` yapar ve KAYNAK (`.xt-src` içindeki
`.xp-zin`) `render()` tarafından her kaydırıcı hareketinde HAM LaTeX ile
yeniden yazılır; kaynağı kimse typeset etmediği için pop-up AÇILIRKEN ham
`\\( \\begin{aligned}…` görünür. Kullanıcı "kaydırıcıyı oynadım, SONRA pop-up
açınca bozuk" diye anlattı (pop-up kapalıyken oynama). Düzeltme: `ac()` sonunda
içerikte `\\(` kaldıysa `typesetClear+typesetPromise([pop])` + bitince
`yerlestir(el)` (yükseklik değişti). `popQueue` (açıkken sürükleme) kalıyor.
**Ders**: hata raporunu kullanıcının GERÇEK adım sırasıyla (önce kaydırıcı,
sonra pop-up aç) yeniden üret; bir önceki düzeltmeyi "geçti" saymadan önce
düzeltmenin kaldırılmış hâline karşı testin gerçekten KIRMIZI olduğunu doğrula
(`git stash` ile: raw:true → düzeltmeyle raw:false).

**Ağırlık paneli Bütün Resim'in ÜSTÜNE taşındı**: kullanıcı "kaydırıcıyı şunun
üstüne koy" dedi (Bütün Resim ağacında oynayıp sonuçları orada görmek istiyor;
panel 6️⃣ Simülasyon aşamasının içinde, kapalı ve aşağıdaydı). `#rcSliderPanel`
artık hiçbir `.tpl-cl` içinde DEĞİL — 5️⃣ Bütün Resim aşamasının hemen
önünde, her zaman görünür, iki aşama için ortak. `#rcTekInputs` (x/h₋₁/y)
hâlâ yalnız Tek Hücre'de görünür. Bütün Resim giriş metni, many-to-one
girdilerinin (x₁,x₂,x₃,y) Simülasyon→Geri Adım 5 kartında olduğunu açıkça
söyler.

**Geri Adım 6 "Ne öğrendik" metni artık duruma göre (3 rejim)**: kullanıcı
kaydırıcılarla r≈1 (sinyal %99.5) bir ayar bulunca kart HÂLÂ "t=1 yalnızca
%99.5'ini alıyor… ağ ilk girdiyi neredeyse hiç görmeden öğreniyor" diyordu —
statik vanishing anlatısı. `mo6Learn` artık `rat=|δ₁/δ₃|`'e göre dallanıyor:
<0.3 vanishing, >3 exploding, arası **dengeli (r≈1)**; ayrıca |δ₃|<0.005 ise
"sinyal zaten küçük (hata ~0 / tanh doygun) — vanishing değil" notu ekler.
**Ders**: canlı bir "Ne öğrendik" metni, kaydırıcıların ulaşabildiği HER
rejimde doğru olmalı; tek bir durumu varsayan sabit cümle, kullanıcı başka
bir rejime gidince yanlış bilgi verir.

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

## RNN sayfası sadeleştirme — kartlar yalnız Tek Hücre'de, diğer türler = sadece Bütün Resim

Kullanıcı "çöplük gibi oldu, çok şey ekledik" dedi: Tek Hücre dışındaki türlerde
Geri Adım kartları (`gAdimSectionM2o/M2m`, `moAdim*`, `gAdimM2m*`) ve Simülasyon'daki
ikinci hücre diyagramı (`rnnFwdCols`/`cellSvg`) tamamen **kaldırıldı**. Bütün Resim
aşaması (5️⃣) artık yalnız Tek Hücre için; many-to-one / m2m (Tx=Ty) / one-to-many /
Tx≠Ty için `rnnBigPictureM2o/M2m/O2m/Dec` blokları 6️⃣ Simülasyon'daki tür
butonlarının altına (`#rnnTypeOther`) taşındı — butona basınca o türün Bütün Resmi
(akış + canlı diyagram + ağaç + pop-up) açılır. Tek Hücre içeriği yeni `#rnnSimTek`
sarmalayıcısında; switcher (`js/app.js`) `rnnSimTek`/`rnnTypeOther`'ı türe göre
gösterir. Kaldırılan kartlarda duran girdi kutuları (`ru_x1..3/ru_y`,
`rcM2_x1..3/y1..3`) ilgili Bütün Resim bloğunun başına taşındı (render() onları
okuyor — silinen kartla beraber giderse `null.value` hatası verir).
**Ders**: (1) bir bölümü silerken render()'ın okuduğu girdi id'lerini önce grep'le;
(2) `#rnnTypeTek` sarmalayıcısı PR #321'de bozulmuştu (yalnız giriş paragrafını
sarıyordu, Tek Simülasyon her türde görünüyordu, slider `<div>`'i de en sonda
yanlış kapanıyordu) — "div sayısı eşit" kontrolü böyle kaymaları yakalamıyor,
tarayıcıda `parentElement` zinciri/çocuk sayısıyla bak.

**Geri Adım 6 (vanishing/exploding, 10 adıma tahmin + yüzde) geri getirildi**: sadeleştirmede
(#323) `#moAdim6` kartı many-to-one kartlarıyla birlikte silinmişti; kullanıcı "9 adımı
gösteriyordu, vanishing mi exploding mi, yüzde kaç" diye geri istedi. Kart (`.step` +
`#mo6Tbl1/#mo6Tbl2/#mo6Proj/#mo6Canvas/#mo6Learn`) many-to-one Bütün Resim bloğunun
(`#rnnBigPictureM2o`) sonuna konuldu; `render()` kodu id'ler aynı olduğu için dokunulmadan
yeniden çalıştı. Diğer türlerde (m2m/o2m/Tx≠Ty) bu kart yok.

## XOR — "🔍 Gizli nöronlar ne öğrendi?" kartı (`js/lesson-xor-maps.js`)

Kullanıcı XOR/NN/RNN'de "bilgiyi ağırlıklarla nasıl anlamlandırıyor, sezgisel olarak"
diye sordu; cevap sezgiseldi (nöron = örüntü detektörü, pozitif/negatif ağırlık,
bias = eşik, gizli katman = yeni özellik uzayı) ve "yap" dedi → 6️⃣ Simülasyon'daki
`.xs-top` bloğunun hemen altına `#xmCard` eklendi: h₁, h₂ ve çıktı p için girdi
uzayında (x₁,x₂) canlı aktivasyon ısı haritası + z=0 kesik çizgi + 4 nokta, her
nöronun yanında canlı denklem ve "şu an ≈ VEYA/VE/… gibi" otomatik kapı etiketi
(4 noktadaki 0/1 çıktıdan), ve gizli uzay (h₁,h₂) grafiği (noktalar nereye taşındı,
çıkış doğrusu tek düz çizgiyle ayırıyor mu). Ağırlıkları `window.XORNET`'ten okur;
`lesson-xor-epoch.js` `render()` sonunda `window.__xorMapsRender()` çağırır
(betik epoch'tan ÖNCE yüklenir ki ilk render'da tanımlı olsun). **Test notu**:
epoch'u headless'ta binlerce kez tıklamak çok yavaş (render ağır); eğitilmiş durumu
`window.XORNET`'e elle yazılmış çözülmüş ağırlıklarla ([[6,6],[4,4]], [-3,-6],
[10,-10], -5) görselleştirip doğrula. **Ders**: `pkill -f` komut zincirinin
ortasında kabuğu öldürür — sonraki commit/push adımları SESSİZCE çalışmaz ama
sonraki araç çağrısı (PR oluşturma) yine de başarılı olabilir; PR açmadan önce
`git log`/`git status` ile commit'in gerçekten atıldığını doğrula.

## XOR 2️⃣ Hikâye — tarihî anlatım + "sopa" keşif yolculuğu birleştirildi

Kullanıcı, XOR'u bir soru-cevap oturumunda kendi keşfi gibi yürüttü (sezgisel akış:
çıktıyı 0-1'e sıkıştır → sigmoid; tek lineer z neden olmaz; aktivasyon = "büyük mü?"
sorusu; XOR = (VEYA) VE DEĞİL (VE) mantık kapıları; gerçek veride (sigorta/yaş,
red→onay→red) sınır eğri; sopa benzetmesi: sopayı çoğalt / bük / yerini makine bulsun)
ve "hikâyede ikisini birleştir" dedi. Mevcut tarihî hikâye (Rosenblatt 1958 → Minsky &
Papert 1969 → kış → geri yayılım 1986) korunup arasına mühendis anlatısı girdi:
"XOR zaten mantık kapılarıyla çözülür (McCulloch-Pitts 1943) — mesele makinenin onu
örneklerden öğrenmesi", sigorta örneği, üç hamle (çoğalt/bük/makine bulsun), "🪄 Sopa
özeti" callout'u. Pedagojik detaylar (sigmoid doyması, sert basamağın sıfır türevi,
normalizasyon, kaç gizli nöron) hikâyede kısa tutuldu; Aktivasyon modülüne taşınabilir
(henüz yapılmadı, istenirse ayrı PR). **Not**: oturumda bir "iki aktivasyon, tek z"
cevabımı düzelttim — aynı z'nin FARKLI eşikli iki aktivasyonu + çıkış katmanı XOR'u
çözer (iki ayrı birim sayılır); artan σ/tanh çifti çözmez.

## RNN pop-up'larına sözel "💬 Ne anlama geliyor?" açıklaması (`js/lesson-rnn-soz.js`)

Kullanıcı Bütün Resim'deki her kutu/okun pop-up kartının altına "ne anlama geldiğinin
sözel açıklaması"nı istedi (formüller/sayılar var ama sezgi eksikti). 186 RNN
`.xt-src` kaynağının (5 tür: `t_/r_/m_/o_/d_*`) hepsine, `js/lesson-rnn-soz.js` sayfa
yüklenirken sonuna bir `.xp-soz` div'i ekler — HTML'e 186 yerde elle yazılmadı: anahtar
(`m_zhh2`, `r_zh3Whh`, `d_hsum1`…) `parse()` ile normalize edilir (zh, tanh, zy, yhat, L,
Ltot, Lyhat, yhatzy, zyWhy, zyby, zyh, hzh, zhWxh, zhWhh, zhbh, zhhp, bptt, hsum, from),
metin türe/adıma duyarlıdır (çıktısız/girdisiz adım, son adım, t=1'de h₀=0 notları).
Pop-up motoru kaynağın innerHTML'ini kopyaladığı için kaynağa bir kez eklemek yeter.
`window.__rnnSozCount` {done, miss} ile doğrulanır (186/186, miss=[]). Pop-up
`max-height` 72vh→84vh (içerik uzadı). **Ders**: `id.slice(7)` ile `xtsrc-` önekini
(6 karakter) kesince tüm anahtarlar bozuldu ve sessizce `HASOUT[type]` hatası verdi —
önek uzunluğunu varsayma, `slice('xtsrc-'.length)` kullan / sayıyı doğrula.

## "🧪 RNN Test" sayfası kaldırıldı

Kullanıcı "rnn testi kaldıralım, artık o kısma gerek yok" dedi: sidebar'daki `🧪 RNN Test`
bağlantısı (`index.html`) ve ayrı sayfa `rnn-test.html` silindi; `js/app.js`
`applyTreeOrder()` içindeki "RNN Test'i RNN dersinin ardına yerleştir" özel durumu
kaldırıldı (data-model'i olmayan düğmeler artık sona eklenir). RNN modülünün kendi
7️⃣ "Kendini Test Et" aşaması DURUYOR (o ayrı bir şey).

## RNN pop-up köprülerine canlı sözel cümle (`🗣️ Sözle:`) — rnnBridges içinde

Kullanıcı "işlem sonucunu nasıl sözel anlatırız" diye sordu (örnek: `[(ŷ−y)W_hy](1−h²)·h₋₁ =
(−0,0543)(0,50) = −0,0271`; sonra "0,50 nereden", "tanh eğimi neyle çarpılıyor") ve "hepsine ekle"
dedi. Statik "💬 Ne anlama geliyor?" (js/lesson-rnn-soz.js) sayısızdır; buna EK olarak `rnnBridges()`
(js/app.js; 5 türün hepsinde ortak) artık her halkanın altına o anki SAYILARLA bir cümle yazar:
`vs(name,t)` geri yol (Lyhat, yhatzy, zyWhy, zyby, zyh, hsum, hzh, zhWxh, zhWhh, zhbh, zhh —
"z_h'ye gelen sinyal −0,0543 × girdi 0,50 = −0,0271; gradyan eksi → ağırlık büyür" gibi, işaret
yorumu + paylaşılan ağırlıkta "bu yalnızca t=N katkısı" notu, tanh'ta "sinyalin %39'u geçiyor"),
`vf(name,t)` ileri yol (zh, tanh, zy, yhat, L, Ltot). Geri yol `put()` içinde html'e eklenir (pop-up
klonu `popQueue` ile aynı html'i alır); ileri yol 📐 köprüleri başka kodda `innerHTML` ile yazıldığı için
`appF()` ile SONRADAN eklenir (`.xp-vs` varsa önce silinir → idempotent). Her cfg'ye ileri anahtar
eşlemesi `KF(name,t)` eklendi (Tek `t_*`, m2o `r_zh1/r_zy…`, m2m `m_*`, seq `o_*/d_*`). Doğrulama:
5 türde 186/186 kaynakta `.xp-vs` var, NaN/undefined/%t yok. Stil: sarı `.xp-vs`.

**Sözel anlatım artık açılıp kapanır "🗣️ Sözel anlatım" sekmesinde** (PR sonrası güncelleme): kullanıcı
"sözel kısım için ayrı bir açılıp kapanır sekme olsun, anlatımı oraya taşı" dedi. Her RNN `.xt-src`
kaynağının sonunda `.xp-sozacc` (başlık `.xp-sozhead` + gövde `.xp-sozbody`) var; gövdede
**canlı yuva** `.xp-vslot[data-vs=KEY]` (rnnBridges `vsSet()` doldurur, "Şu anki sayılarla: …") +
statik **"Genel olarak: …"**. Canlı güncelleme yalnız yuvanın iç HTML'ini yazar, dış kabuğun
açık/kapalı durumu bozulmaz. Varsayılan kapalı; pop-up içinde tıklayınca açılır (pop-up motoru
`#xtPop` içindeki tıklamayı kapatma saymaz), tercih `sessionStorage('rnnSozOpen')` ile oturum boyunca
hatırlanır (`#xtPop` üzerinde MutationObserver). Açınca pop-up yüksekliği değiştiği için
`document.dispatchEvent(new Event('scroll'))` ile motorun yeniden-konumlama dinleyicisi tetiklenir.
`lesson-rnn-soz.js` artık `app.js`'ten ÖNCE yüklenir (yuvalar, ilk `render()` çalışmadan DOM'da olsun
diye — sonra yüklenseydi ilk dolum kaçardı). `hzh` cümlesi tanh eğrisi bağlantısını da anlatır:
"z_h = 0,6745 noktasındasın, oradaki tanjant eğimi 0,6543 (Aktivasyon sayfasındaki grafikte aynı)".

## RNN sayfası yeniden düzenlendi: Simülasyon → Bütün Resim, Simülasyon yalnız Tek Hücre

Kullanıcı sayfayı hâlâ karışık buldu (ağırlık paneli + giriş paragrafı hiçbir sekmede değil, tür
seçici Simülasyon'da ama tür seçince Bütün Resim boşalıyordu) ve şu düzeni istedi: **Simülasyon,
Bütün Resim'den ÖNCE; Simülasyon'da yalnız Tek Hücre; diğer RNN türleri Bütün Resim'de seçilebilir;
dışarıda kalan fazlalık bir sekmenin içine.** Yeni sıra: 1 Giriş, 2 Hikâye, 3 Gerçek Hayat, 4 Nedir,
**🎛️ Ağırlıklar & girdiler** (yeni `data-stage="w"` sekmesi, yeşil; `#rcSliderPanel` buraya taşındı;
iki aşama da bu ağırlıkları kullandığı için istisnai olarak AÇIK gelir — kapalı gelirse Simülasyon
"ölü" görünürdü), **5️⃣ Simülasyon — Tek Hücre** (tür butonları/`#rnnTypeOther` yok; giriş paragrafı
burada; `#rnnSimTek` her zaman görünür), **6️⃣ Bütün Resim — 5 RNN türü** (`.rnn-type-btn` seçici +
`#rnnTypeNote` + Tek/M2o/M2m/O2m/Dec blokları bu sekmede; switcher yalnız blok `display`'ini ve notu
değiştirir), Ekstra, 7️⃣ Test. Switcher'dan `rnnTypeTek/rnnSimTek/rnnTypeOther/rcTekInputs` gizleme
kodu kaldırıldı (`rcTekInputs` — x/h₋₁/y — artık hep görünür, çünkü Tek Hücre Simülasyon'u sürekli
orada). `data-stage` renkleri içeriğe bağlı kaldı (Simülasyon=6 → RNN için de camgöbeği override,
Bütün Resim=5). Eski "2) Zincirleme" sechead'i "🔬 Tek Hücre — ileri yayılım ve geri yayılım (BPTT)"
oldu. **Ders**: bir tür seçicinin hem içeriği hem BAŞKA bir aşamanın bloklarını yönetmesi, o aşama
kapalı/boş görününce "bozuk sayfa" izlenimi veriyor — seçici, yönettiği içeriğin yanında dursun.

**Tüm RNN girdileri tek yerde (🎛️ Ağırlıklar & girdiler sekmesi)**: kullanıcı "heryerde girdi var, şunları bi
yere topla" dedi. Bütün Resim'deki tür başına girdi satırları (many-to-one `ru_x1..3/ru_y`, m2m `rcM2_x1..3/y1..3`,
one-to-many `o_x1/o_y1..3`, Tx≠Ty `d_x1,d_x2,d_y3,d_y4`) bu sekmeye taşındı (id'ler aynı kaldığı için
`render()` dokunulmadan çalıştı; DOM düğümü taşındı, kopyalanmadı). Tek Hücre girdileri (`#rcTekInputs`) hep
görünür; diğer 4 tür `.rc-inblk[data-rtin]` bloğu olarak gizli gelir, Bütün Resim'de tür butonuna basınca
switcher o türün bloğunu gösterir. RNN modülünde artık `#rcWeightsBody` dışında `<input>` (range hariç) yok —
doğrulandı.

## RNN sayfası denetimi — 3 düzeltme (hız + id çakışması + ölü many-to-many bloğu)

Kullanıcı "genel RNN sayfasını incele, öneride bulun" dedi; ölçerek bulunanlar (sonra "sen belirlediğin
şekilde başla" dedi):
1. **Kaydırıcı hareket başına ~1,1 sn** (CDP profili: %89 `querySelectorAll`). `render()`'ın köprü yazan
   `zT/zM/zinF/zin/put/vsSet` yardımcıları her anahtar için `document.querySelectorAll('[data-zincir="…"]')`
   ile 240 bin düğümlü sayfayı tarıyordu (186 pop-up × 2). Artık `rnnZ(k)`/`rnnV(k)` (app.js'in en başı):
   statik kaynaklar bir kez `Map`'e indekslenir; açık pop-up klonları (`#xtPop`) her seferinde ayrıca aranır.
   Sonuç: ~1100 ms → ~25-40 ms/olay. **Ders**: sayfada yüzlerce gizli kaynak varken özellik seçicili
   `document.querySelectorAll`'ı sık çağrılan (render/input) yolda KULLANMA; indeksle.
2. **RNN ile Neural Network aynı id'leri kullanıyordu** (`mfx1/mfx2/mfh1/mfh2`): `lesson-nn.js` `getElementById`
   ile RNN'inkini bulup yazıyor, Neural'ın kendi "canlı yolculuk" kutuları "—" kalıyordu. Neural'ınkiler
   `nnfx1/nnfx2/nnfh1/nnfh2` oldu (HTML + `lesson-nn.js`). Dosyada çift id kalmadı (doğrulandı).
3. **many-to-many (Tx=Ty) Bütün Resim PR #323'ten beri TAMAMEN boştu** (her değer "—", 16 ileri 📐 köprüsü
   boş): `render()`'daki m2m hesap bloğu silinen kartın elemanına (`if($('rcM2S1sub'))`) bağlıydı. Guard artık
   `$('rcM2S1sub') || ($('mfzh1') && $('rcM2_x1'))`. Tüm `if($('…'))` guard'ları DOM'daki id'lerle karşılaştırıldı:
   başka ölü guard yok. **Ders**: bir bölümü silerken sadece onun id'lerini DEĞİL, `render()`'daki koşulların
   (`if($('…'))`) o id'lere bağlı olup olmadığını da tara — ölü blok sessizce hiç çalışmaz.

## RNN ağırlık paneli — hazır ayar düğmeleri (`#rcPresets`)

🎛️ Ağırlıklar & girdiler sekmesine `⚖️ Dengeli / 📉 Vanishing / 📈 Exploding / ↺ Varsayılan` düğmeleri
eklendi (W_xh,W_hh,b_h,W_hy,b_y değerlerini yazıp `input` olayı tetikler; render() dokunulmadan çalışır).
Exploding = (0.05, 2, 0) → girdi küçük, tanh doymaz, r≈W_hh=2. Küçük inline `<script>` index.html'de app.js'ten önce.

**XOR Hikâye'ye "🤔 Tek gizli nöron neden yetmez?" kutusu**: kullanıcı "tek gizli nöron + tek h + bias + aktivasyon yetmez mi" diye sordu;
z(0,0)+z(1,1)=z(1,0)+z(0,1) (=w₁+w₂+2b) kanıtı, "Sopa özeti"nin hemen üstüne kısa callout olarak eklendi (yalnız index.html).

## RNN — "7️⃣ Örnek Çalışmalar — elle tekrarla" aşaması

Kullanıcı Test'in önüne/arkasına "elle tekrar edilebilecek kısa, sezgiyi kuran 2-3 örnek (son kelimeyi tahmin vb.), kodlu" bir bölüm
istedi. Ekstra'dan sonra, Test'ten ÖNCE yeni `.tpl-cl` (`data-stage="3"`, yeşil) eklendi; Test 8️⃣ oldu. Üç skaler-hücre örneği
(h=tanh(Wxh·x+Whh·h), h₀=0): (1) duygu "kötü→ama→harika" vs ters sıra (0,79 / 0,21 — sıra önemli), (2) "kedi ve ___" sıradaki kelime
(0,87; köpek 0,13; Whh=0,2 ile 0,53 = hafıza unutuluyor), (3) Örnek 2'nin bozuk ağında tek BPTT adımı elle (∂L/∂Whh=−0,531, Whh 0,2→0,466,
p 0,53→0,64, δ₁=−0,0038 = vanishing). Her örnekte kapalı `.acc` içinde Python kodu; üç kod da çalıştırılıp sayfadaki sayılarla
eşleştirildi, 3. örnek sonlu farkla doğrulandı. **Ders**: elle-hesap örneğinde HTML'e yazmadan önce sayıları Python'da üret/doğrula.

**Örnek Çalışmalar MathJax'e çevrildi**: ilk sürüm düz metin/unicode idi, kullanıcı "mathjax ile yazaydın" dedi → tüm formüller `\( \)` / `\[ aligned \]`. 375px'te 3 blok taşıyordu: uzun satırlar kısaltıldı (çarpan `1·`, ara `tanh(…)` adımları atıldı, δ kuralı metinde bir kez yazıldı) + `#model-rnn .tpl-cl[data-stage="3"] .work mjx-container{font-size:68%}` mobil kuralı; `getBoundingClientRect` ile 0 taşma doğrulandı.

**Örnek Çalışmalar kod yorumları**: kullanıcı koddaki `# 0.4657  0.641` yorumunu anlamadı ("bunu yorum satırı olarak da ekle, sormasam anlamayacağım") — üç Python kutusunun HER satırı artık yorumlu (h/δ/grad/sayısal türev/öğrenme adımı ve çıktı sayılarının ne olduğu). **Ders**: kod örneğinde çıktı sayısını sadece yazma, hangi değişkenin ne olduğunu da yorumla.

**Örnek 4 — otomatik türev (autograd)**: kullanıcı "geriye yayılımı Python'da nasıl yaptırıyoruz, otomatik türev bulan bir şey" diye sordu → Örnek Çalışmalar'a Örnek 4: elle↔PyTorch eşleme tablosu, `L.backward()` yorumlu PyTorch kodu (kapalı `.acc`) ve kütüphanesiz 30 satırlık mini autograd (`Deger` sınıfı, çalıştırıldı: Whh.g = −0.5314). **Not**: ortamda torch kurulamadı, PyTorch kodu çalıştırılamadı (değerler mini autograd + sonlu farkla doğrulanmış aynı sayılar); mini autograd kodu gerçekten çalıştırıldı.

**Örnek Çalışmalar'daki 4 örnek açılır/kapanır, başlangıçta KAPALI**: kullanıcı istedi; mevcut `.sahne-head`/`.sahne-body` bileşeni (Türev "Sahne N" ile aynı, yeni JS yok) kullanıldı — `<h3 class="sahne-head closed">` + içerik `<div class="sahne-body closed">` (iç `.acc` kutuları/MathJax korunur). Doğrulandı: 4/4 kapalı gelir, tıklayınca açılır/kapanır, MathJax kapalıyken de typeset edilmiş, 375px'te taşma yok.

**XOR Hikâye: "✅ İki gizli nöronla aynı tabloya bakalım" kutusu**: kullanıcı "iki nöron için de aynı tablodan kanıt yap" dedi → tek-nöron kutusunun hemen altına: z₁=10x₁+10x₂−5, z₂=10x₁+10x₂−15, z_y=10h₁−10h₂−5 tablosu (4 nokta, h=[z>0]); toplam kuralı HER nöron için hâlâ geçerli (kırılan "çıkış tek bir z'nin artan fonksiyonu" varsayımı); z₁ sırasında (0,0)<(1,0)=(0,1)<(1,1) XOR çıktısı 0→1→0 = iki eşik gerekir. Sayılar Python'la doğrulandı.

**Örnek Çalışmalar 1-3: Problem → Girdi → Mimari → Hesap yapısı**: kullanıcı "sorular ne soruyu anlamıyorsun, karşıdakine önce problemi anlat, inputları göster, mimariyi gözünde canlandır" dedi. Her örnek artık 🎯 Problem (düz dille: ne çözmeye çalışıyoruz, kelime→sayı neden) → 📥 Girdi (tablo) → 🏗️ Mimari (açılmış 3 adımlı RNN SVG'si: x kutuları, h hücreleri, W_xh/W_hh/W_hy okları, h₀, çıkış kutusu; Örnek 3'te h değerleri + doğru cevap/kayıp kutusu) → 🧮 Hesap sırasıyla. SVG'ler `min-width:560px` + `overflow-x:auto` sarmalayıcıda (dar ekranda yatay kaydırılır, ipucu satırı var). **Ders**: elle-hesap örneğinde "formül"ü vermeden önce okuyucuya problem + girdi + şekil ver; sayıların NE olduğu anlaşılmadan hesap anlamsız.

**Örnek Çalışmalar şekilleri küçültüldü**: kullanıcı "çok büyük kalmış" dedi → SVG `max-width:720px` → `500px` (`min-width:480px`); dar ekranda hâlâ yana kaydırılır.

**Örnek Çalışmalar 1-3 İNTERAKTİF + iki sütun (`js/lesson-rnn-ornek.js`)**: kullanıcı "mimariyi yukarı çek, her şey tek ekrana sığsın, interaktif olsun" dedi. Yerleşim: üstte kısa 🎯 Problem; altında `.rex-grid` (sol: kontroller + canlı MathJax hesap, sağ: açılmış RNN SVG'si; ≤900px tek sütun). Ö1: 3 kelime `<select>` (kötü −1 … harika +1) + hazır cümle düğmeleri + W_xh/W_hh/W_hy kaydırıcıları; Ö2: ilk kelime (kedi/köpek) + hazır W_hh düğmeleri ("hafızayı boz"); Ö3: W_hh/α + "🔧 Bir öğrenme adımı at" (gerçek gradyan inişi, p 0,53→0,64→0,90…), "↺ başa dön". Hepsi `render()` ile SVG + `\[aligned\]` hesabı yeniden yazar (`tx()` rAF-debounce'lu typeset; yalnız `#rex*calc` yaprakları yazılır). Ö4 ve Python kutuları statik (varsayılan değerler). `rex3whh` step=0.001 (yuvarlama 0,466'yı bozmasın). **Ders**: statik "Python kodu ile aynı sonuç" iddiası interaktif sürümde yalnızca varsayılan ayarlar için geçerli — kod kutusu başlığında bunu belirt.

**Örnek Çalışmalar'a açılıp kapanan "🗺️ İleri (& geri) yayılım haritası" (Bütün Resim dili)**: kullanıcı "büyük resimdeki gibi ileri yayılım/geri yayılım haritası ekleyelim, iç mekanizmayı görelim" dedi. Ö1/Ö2: yalnız ileri yol (eğitim hedefi yok), Ö3: ileri yol + geri yayılım ağacı (L→p→z_y→{W_hy, h₃→z₃→{W_xh,W_hh,h₂→z₂→…→z₁}}, 7 yaprak, altta "yaprakları topla" özeti). Aynı `.xf-*`/`.xt-*` bileşenleri + paylaşılan `[data-pop]` motoru; HTML `js/lesson-rnn-ornek.js` içinde üretilir (`fwdHtml/bwdHtml`), değerler `fwdUpd/bwdUpd` ile canlı; pop-up kaynakları (`xtsrc-rx*_…`/`xtsrc-r3_…`, toplam ~40) `#rexSrc` gizli deposuna dinamik yazılır (türetme + canlı sayı + "💬" sözel cümle). Kabuk `.acc.xt-wrap` (kapalı gelir, ⛶ tam ekran). Dikkat: pop-up kaynağı yalnız açılırken kopyalanır — açıkken kaydırıcı oynarsa pop-up yenilenmez (yeniden hover). Tüm data-pop'ların kaynağı var (missing=[]), MathJax hatası 0.

**Örnek 1-2'deki geri yayılım haritası KALDIRILDI (karar)**: önce eklendi (kullanıcı "geri yayılım nerde" dedi), sonra kullanıcı "ağırlıkları zaten biz veriyoruz, geri yayılımı nerde kullanacağız" diye itiraz etti → `AskUserQuestion` ile "kaldır, yalnız ileri yol kalsın" seçildi (PR #346 geri alındı). Geri yayılım ağacı yalnız **kullanıldığı yerde**: Örnek 3 (W_hh güncellenir) ve Örnek 4. Ö1-2 = ileri yayılım + hafıza dersi. **Ders**: bir bileşeni "tutarlılık" için her örneğe koyma — o örnekte GERÇEKTEN kullanılıp kullanılmadığına bak; çıktısı hiçbir yerde tüketilmeyen bir harita gürültüdür.

**RNN Ekstra'daki eski numara/atıf düzeltildi**: "3) Neden RNN'i eğitmek zor?" başlığındaki artık anlamsız "3)" kaldırıldı; "unrolling widget'ında ve Geri Adım 5'te" (silinmiş/yer değiştirmiş yerlere atıf) → "Bütün Resim'deki δ zinciri (Geri Adım 6) ve Örnek Çalışmalar Örnek 3".

## Örnek Çalışmalar — KENDİ KENDİNİ EĞİTEN sürüm (önceki "elle ayarlı kaydırıcı" sürümlerinin yerini aldı)

Kullanıcı Örnek 1'e bakıp "burası çok elle ayarlanmış kaldı, yanıltabilir; ileri yayılımda yalnız tek cümle görüyoruz, hafızanın zamanla azalmasını gösteriyor; **kendi kendini bulan sisteme çevirelim, geri yayılım ve büyük resim tekrar olsun, açılır kapanır olsun, kod da ona göre değişsin, bütün örnekler için aynısı**" dedi. Sonuç (`js/lesson-rnn-ornek.js` baştan yazıldı, `mount(cfg)` fabrikası):
- **Ağırlıklar elle verilmez**: kötü bir başlangıçtan (Ö1: 0,5/1,2/0,5 — ilk kelimeye takılan; Ö2: 0,5/0,2/0,5 — zayıf hafıza; Ö3: 1/0,5/1) tam-yığın gradyan inişi (ortalama BCE, α=0,5; Ö3 α=1) ile ağ kendisi bulur. Düğmeler: ▶ eğit / ⏸ / 🔧 1 adım / ↺ başa dön + α kaydırıcısı; kayıp eğrisi (SVG), ağırlık "başlangıç → şimdi" etiketleri, doğru-sayısı.
- **Eğitim verisi tablosu** (Ö1: 4 cümle "kötü/harika ama kötü/harika" → olumlu/olumsuz, son kelime belirler ama ağ bunu bulmalı; Ö2: kedi/köpek ve ___ → miyav/hav; Ö3: tek cümle). Satıra tıklayınca şekil, hesap ve büyük resim o cümleyi gösterir.
- **Geri yayılım + büyük resim geri geldi** (önceki "Ö1-2'de kaldır" kararı koşulu değişince geçersiz: artık gradyanlar GERÇEKTEN kullanılıyor — güncelleme). Statik `.acc.xt-wrap` kabuğu HTML'de (lesson-linreg.js `.acc-head`/`.xt-full-btn` dinleyicileri yükleme anında bağlandığı için DİNAMİK üretme!), içi `mount` ile `#rexNmap`/`#rexNsum`'a yazılır: ileri yol + geri ağacı + pop-up kaynakları (`#rexSrc`, `r1_/r2_/r3_` önekli) + "cümle başına ve ortalama gradyan" tablosu + güncelleme satırı. Ö3'te ayrıca "🔙 Bir adımın içi" (δ₃→δ₂→δ₁, üç ağırlığın gradyanı ve güncellemesi, MathJax).
- **Kod ona göre değişti**: Ö1-3 Python kutuları artık TAM EĞİTİM döngüsü (ileri_geri fonksiyonu + epoch döngüsü); Ö4: PyTorch `opt.step()` döngüsü + kütüphanesiz mini autograd eğitimi. Kodlar çalıştırılıp çıktıları yorum olarak gömüldü (scratchpad'de `codes.py`/`gen.py` üreticileri, repoda yok); **JS motoru ile Python epoch 100'de birebir aynı** (Ö1: 2,11/0,36/3,93; Ö2: 1,13/2,31/3,83; Ö3 1 adım: 1,04/0,806/1,082). PyTorch kodu torch kurulamadığı için çalıştırılmadı (sayfada not var).
- Performans: ▶ eğit sırasında her tikte yalnız ucuz kısım (tablo, şekil, eğri) çizilir; MathJax + pop-up kaynakları ~350 ms'de bir ("ağır" render). Pop-up açıkken eğitim sürerse açık pop-up yenilenmez (hover ile yeniden aç).
**Ders**: örnek "elle ayarlanmış sihirli sayılar"la başlarsa okuyucu ağırlıkların nereden geldiğini sorar — ağırlıklar HER ZAMAN eğitimden gelmeli, başlangıç bilerek kötü seçilmeli; bir bileşenin (geri yayılım) kaldırılması kararı, o bileşenin çıktısı kullanılmadığı içindi — kullanım geri gelince bileşen de geri gelir.

## Yapı Taşları → İstatistik: "15) Değerlendirme Metrikleri — modelin karnesi" modülü (`ytmod-15`)

Kullanıcı RNN örneğindeki log-loss pop-up'ında "1−p adımı nerde?" diye takıldı (y=1 iken (1−y)=0 ile ikinci terim sıfırlanıyordu) ve "değerlendirme metriklerini İstatistik'e ekleyelim" dedi; `AskUserQuestion` ile kapsam = **hepsi** (sınıflandırma + regresyon + kayıp). Modül `t_ist` kategorisinde Modül 12'nin hemen ardında (HTML sırası 10,11,12,**15**; numara 15 çünkü 13-14 Trigonometri'de — kasıtlı, yeniden numaralandırma yapılmadı). İçerik: 💡 Hikâye (%99 doğruluk, 0 hasta), 🌍 4 gerçek-hayat kartı (hastalık taraması, spam, ev fiyatı, dil modeli — hepsi çalışılmış sayılarla), `yts-15-1` karışıklık matrisi + A/B modelleri, sınıflandırma (accuracy/precision/recall/F1) ve regresyon (MAE/MSE/RMSE/R²) formülleri, `yts-15-2` **log-loss nasıl okunur** (y=1 / y=0 tablosu, 0,693=ln2 "fikrim yok", perplexity), 4 "Soru N:" alıştırması (`.mprog` 0/4). `js/app.js`: `CAT_MODULES.t_ist`'e `{n:15}` ve `MOD_SCENES["ytmod-15"]` (2 sahne) eklendi (ağaçta "📂 İstatistik içindekiler"de görünür, doğrulandı). Tüm sayılar Python'la doğrulandı. RNN Örnek Çalışmalar'daki L pop-up'ına bu modüle atıf eklendi.

## LSTM modülü tpl-cl şablonuna taşındı (adım 1 — iskelet)

Kullanıcı "yavaştan lstm e geçsek mi" dedi; RNN şablon olarak alındı. `#model-lstm` düz `.sechead` yapısından 8 aşamalı `.tpl-cl` akışına çevrildi (hepsi kapalı): 1 Giriş, 2 Hikâye (BOŞ), 3 Gerçek Hayat (BOŞ), 4 Nedir (eski Fikir+Kapılar), 5 Simülasyon (vana paneli/tam hücre; cyan override'a `#model-lstm` eklendi), 6 Bütün Resim (BOŞ), Ekstra (GRU), 7 Örnek Çalışmalar (BOŞ — uzak-bağlam "kedi" görevi: RNN öğrenemez, LSTM f kapısını bulur), 8 Test. Mevcut widget'lar (`lstmPipe`, `lc_*`) kapalı gövdede çalışıyor, MathJax hatası 0, 375px'te taşma yok. Sıradaki adımlar (kullanıcıyla, her biri ayrı PR): boş aşamaları RNN kalıplarıyla doldurmak.

## LSTM modülü — mimari şeması yenilendi + 4 boş aşama dolduruldu (adım 2)

Kullanıcı Stanford/Colah tarzı iki LSTM şeması gösterip "senin çizdiğin amatör kalmış, RNN'deki mimari güzeldi" dedi ve "boşlara niye ekleme yapmadın" diye sordu (ilk adımda boş aşamaları bırakmıştım — ders: bir modülü şablona taşırken doldurulabilen boş aşamayı "sonra" diye bırakma, içeriği hemen yaz).
- **`js/lesson-lstm-cell.js`**: `window.lstmCellSvg(pre, v)` — dik açılı hücre çizimi (c hattı üstte, h hattı altta, σ σ tanh σ kutuları, ⊗/⊕, tanh elipsi, xₜ aşağıdan). `v` verilmezse sembolik (Nedir'deki `#lstmArch`), verilirse canlı sayılı + akış kalınlığı (Simülasyon `#lstmPipe`; `app.js`'teki eski vana-çizimi kaldırıldı).
- **2️⃣ Hikâye** (Hochreiter 1991 → H&S 1997 → Gers 2000 → Cho 2014 GRU) ve **3️⃣ Gerçek Hayat** (çeviri, konuşma, el yazısı, zaman serisi, müzik) yazıldı.
- **6️⃣ Bütün Resim** (`js/lesson-lstm-big.js`): tek hücre adımı; ileri yol (xf) + geri ağaç (xt: h→o/c→f,i,c̃→z→12 yaprak + `∂c/∂c₋₁=f` "gradyan otobanı" yaprağı) + ~25 pop-up. Girdiler Simülasyon'daki `lc_x/lc_h/lc_c`. 12 yaprak + c₋₁ gradyanı sonlu farkla doğrulandı. Kök h için ∂h/∂h=1 varsayılır.
- **7️⃣ Örnek Çalışmalar** (`js/lesson-lstm-ornek.js`): T=30 "kedi/köpek + 29 boş adım"; RNN ve LSTM yan yana kendi kendine eğitilir (lr 0,5), kayıp eğrisi + gradyan sağlığı grafiği, Python kod kutusu; JS ile Python epoch bazında birebir aynı (LSTM 0,552/0,024/0,004/0,001; RNN 0,693 takılı). **Dürüst not sayfada**: skaler LSTM başlangıca çok duyarlı — aynı ayarla T=15/20'de LSTM de takılıyor, RNN T=15'e kadar öğreniyor; bu yüzden demo "LSTM her zaman kazanır" değil "mekanizma: hafıza çarpanı bir kapı" diye çerçevelendi ve başlangıcın LSTM lehine seçildiği açıkça yazıldı. **Ders**: bir karşılaştırma demosu yazmadan önce parametre ızgarasını tara; sonuç kırılgansa bunu gizleme, sayfada söyle.
- **Ders (tekrar)**: `pkill -f` zincir ortasında kabuğu öldürür (bu oturumda iki kez oldu) — sunucuyu kapatmak için ayrı bir komut kullan ya da hiç kapatma.
Sıradaki: kullanıcı LSTM'den geriye (Nöral/Temeller) dönüp önceki dersleri düzeltecek, sonra Vektör & Nokta Çarpım.

## Vektör & Nokta Çarpım modülü tpl-cl şablonuna taşındı + Örnek Çalışmalar

Eski düz yapı (hero → hikâye → gerçek hayat → 1-4 sechead → test) 8 aşamaya bölündü: 1 Giriş (hero + "Neden şimdi?"), 2 Hikâye, 3 Gerçek Hayat, 4 Nedir (vektör nedir + nokta çarpımın iki yüzü), 5 Simülasyon (`#vecCanvas` oyuncağı), ➕ Ekstra (matris/transpoz/QKᵀ), 6 **Örnek Çalışmalar** (yeni), 7 Test. **Bütün Resim aşaması bilerek YOK** — bu derste geri yayılım/ileri-geri akış yok (RNN'den türeyen şablonda Bütün Resim = ileri+geri ağaç; ders gradyan içermiyorsa boş placeholder yerine hiç koyma). `js/lesson-vektor-ornek.js`: 3 canlı örnek (kelime benzerliği + kral−erkek+kadın; arama motoru uzunluk tuzağı: nokta çarpım B'yi, cosine A'yı seçer; attention skor tablosu softmax(QKᵀ/√d) + sorgu açısı kaydırıcısı), her biri `.sahne-head` kapalı + Python kod kutusu; JS ile Python birebir (doğrulandı). Kral·kraliçe=0 (2 özellikli oyuncakta dik) sayfada açıklandı.

## GERİYE DÖNÜK ŞABLON UYGULAMASI (RNN/LSTM'den türeyen akış → önceki derslere) — kullanıcı: "geriye dönük bütün dersleri düzenle, RNN hariç; önce müfredat uygun mu bak, değilse kendin karar ver"

Kapsam kararı: LSTM'den ÖNCEKİ dersler = Lineer Regresyon, Aktivasyon, XOR, Neural Network (+ Vektör, bitti). Yapı Taşları bilinçli dışarıda. Her ders için müfredat denetimi: şablon = Giriş, Hikâye, Gerçek Hayat, Nedir, **Simülasyon**, **Bütün Resim** (yalnız ileri/geri yayılımı olan derslerde), Ekstra, **Örnek Çalışmalar (kendi kendine öğrenen)**, Test. XOR/NN'de Bütün Resim Simülasyon'dan ÖNCEYDİ → RNN düzenine (Simülasyon → Bütün Resim) çevrilecek. Softmax/Embedding/Seq2Seq/Attention/Multi-Head/Transformer hâlâ düz yapıda (LSTM'den SONRA geliyor; kullanıcı "geriye dönük" dediği için bu turda kapsam dışı, istenirse ayrı iş).

**1) Lineer Regresyon (bu PR)**: müfredat uygundu, eksik 5 şey tamamlandı: görsel (hero SVG), 2 Hikâye (Ceres/Gauss–Legendre/Galton/Cauchy), 3 Gerçek Hayat, 4 Nedir (model + maliyet + sisli vadi/gradyan alçalma), **6 Bütün Resim** (`js/lesson-linreg-big.js`: Simülasyon'daki canlı veri/Θ ile ileri yol x→h→e→E + geri ağaç E→hᵢ→Θ₀/Θ₁ katkıları + yaprakları topla + 11 tür pop-up; nokta sayısı m değişince ağaç yeniden kurulur; `window.__linState()` / `__linBigRender()` kancası `lesson-linreg.js`'te), **7 Örnek Çalışmalar** (`js/lesson-linreg-ornek.js`: ev fiyatı kendi kendine eğitim + Gauss kapalı form karşılaştırması; α karşılaştırması 0,001/0,02/0,07/0,08 — sonuncusu patlar; Gauss'un tek formülü tablosu). JS = Python birebir (GD 600 tur: Θ₀=1,0229 Θ₁=0,7837 E=0,0180; α tablosu 0,0854/0,0250/0,0180/patladı); Büyük Resim türevleri Simülasyon Adım 3 ile aynı sayı. Test 8️⃣ oldu.

**2) Aktivasyon Fonksiyonları (geriye dönük şablon)**: müfredat uygundu (1-5, Ekstra, Test vardı); eksik **Bütün Resim** ve **Örnek Çalışmalar** eklendi. 6 Bütün Resim (`js/lesson-act-big.js`): tek nöron x,w,b→z→a=f(z)→L ileri yol + geri ağaç L→a→z→{w,b}, fonksiyon seçici (σ/tanh/ReLU/Leaky), canlı "f′(z) sinyalin %kaçını geçiriyor" yorumu + pop-up'lar; dw/db sonlu farkla doğrulandı. 7 Örnek Çalışmalar (`js/lesson-act-ornek.js`): (1) 8 katmanlı tek-nöronlu zincir σ/tanh/ReLU kendi kendine eğitilir (σ lr 0,05/0,1/0,3'te 1024/512/171 turda L<0,001; tanh 43/22/7; ReLU 11/5/5 — Python birebir), (2) ölü ReLU vs Leaky (L=9,333 sabit vs 0,166), (3) f′(z) tablosu + 0,25⁸ elle hesap. Test 8️⃣. **Ders**: örnek yazmadan önce parametre ızgarasını tara — ilk tasarım (hedef 0,9) ReLU'yu zaten hedefte başlatıyordu, hedef 0,5'e çekilince karşılaştırma lr'den bağımsız tutarlı çıktı.

**3) XOR (geriye dönük şablon)**: müfredat büyük ölçüde uygundu; iki değişiklik: (a) **sıra RNN düzenine çevrildi** — Simülasyon artık 5️⃣, Bütün Resim 6️⃣ (eskiden tersiydi; içerik/id'ler değişmedi, sayfa içi "6️⃣'daki …" atıfları 5️⃣'e güncellendi), (b) **7️⃣ Örnek Çalışmalar** eklendi (`js/lesson-xor-ornek.js`): (1) tek nöron AND/OR/XOR kendi kendine eğitilir (AND 0,0087 / OR 0,0046 / XOR 0,6931 — XOR'da w=0 zaten tek nöronun ULAŞABİLECEĞİ en iyi nokta, "takılma" değil; simetri yüzünden gradyan tam 0), (2) 2-2-1 ağ XOR: 12 rastgele başlangıçtan 9'u çözüyor, 3'ü (#2,#5,#7) yerel tuzakta takılıyor — dürüstçe sayfada yazıldı, 4 temsilci başlangıç (#0,#1,#2,#5) seçilebilir, (3) çözülmüş ağın (h₁=VEYA, h₂=VE) dört girdideki ileri yolu tablosu. Python birebir; Test 8️⃣. Not: XOR Giriş'indeki "6️⃣'da ağ ağırlıkları kendi bulacak" cümlesi 5️⃣'e çevrildi ama Örnek Çalışmalar'ın da aynı vaadi tuttuğu unutulmamalı.

**4) Neural Network (geriye dönük şablon — bu turun sonuncusu)**: (a) sıra RNN düzenine çevrildi (Simülasyon 5️⃣, Bütün Resim 6️⃣; "6️⃣'daki" atıfları güncellendi), (b) boş duran **Ekstra** artık dolu: NumPy karşılığı (matris çarpımıyla 4 noktanın tek işlemde ileri yolu; kod gerçekten çalıştırıldı — bu oturumda `pip install numpy` çalıştı, torch yine yok → PyTorch kodu yazılmadı, sayfada belirtildi), (c) **7️⃣ Örnek Çalışmalar** (`js/lesson-nn-ornek.js`): (1) katman genişliği — 2-k-1 ağ XOR'u 12 başlangıçla dener, k=2→10/12, k=3,4,8→12/12 (Python ile aynı LCG başlangıçları: `s=(s*1664525+1013904223)%2^32`, birebir), (2) parametre sayacı (784-128-10 → 101.770), (3) (1,0) noktasının matris zinciri MathJax ile elle. Test 8️⃣.
**Geriye dönük işin sonucu**: Lineer Regresyon, Aktivasyon, XOR, Neural Network ve Vektör artık 8 aşamalı şablonda (Vektör'de Bütün Resim yok — gradyan içermiyor). **Dokunulmayanlar**: Softmax, Embedding, Seq2Seq, Attention, Multi-Head, Transformer (LSTM'den sonra geliyor, hâlâ düz `.sechead` yapısı, `data-stage` yok) ve Yapı Taşları (bilinçli dışarıda). Başka modüllerde de "BOŞ — eklenebilir" yer tutucuları kalmış olabilir: `grep -c 'tpl-empty-tag">BOŞ' index.html`.
**Ders (tüm tur)**: her örneği yazmadan önce Python'da parametre ızgarası tara; sonuç kırılgansa (LSTM T=15/20, XOR 9/12, ReLU lr) bunu gizleme, sayfada söyle. İlk tasarım iki kez yanlış çıktı (aktivasyon hedefi 0,9; LSTM başlangıcı) — ızgara olmadan yayımlansaydı yanıltıcı olurdu.

## Neural Network sayfası görselleştirildi (kullanıcı: "ne bir mimarisi var ne çizimi, çok sade bir anlatım — hünerlerini göster")

Önceki tur NN'i şablona taşımıştı ama sayfa neredeyse çizimsizdi (hero'da ileri/geri döngü şeması dışında ağın KENDİSİ hiç çizilmemişti). `js/lesson-nn-net.js` eklendi: **`window.nnNetSvg(spec)`** genel ağ çizici (katman/nöron daireleri, ağırlık çizgisi = kalınlık |w| + renk mavi(+)/kırmızı(−), nöron dolgusu = etkinlik, bias etiketi, ağırlık sayıları, akışlı kesikli çizgiler `.nn-edge-flow`, kırpma ⋮ + `showN` katman başına gösterilecek nöron sayısı). Kullanıldığı yerler: **Giriş** (`#nnHeroNet`, 2-2-1 akışlı), **Nedir** (1 tek nöron anatomisi `#nnNeuronAnat` sayılı: çarp→topla→bias→g→a; 2 mimari `#nnArchSvg` W şekilleri; 3 🧰 **Kendi ağını kur** `#nnBuild` — katman/nöron ±, W şekilleri, parametre sayısı; 4 🌍 gerçek ölçek 784-128-64-10 `#nnReal`, 109.386 parametre), **Simülasyon** (🕸️ `#nnLive`: nnW* kutularına bağlı canlı ağ + x₁/x₂ seçimi + XOR karar haritası canvas; 🎞️ `#nnTrain`: eğitimi adım adım izle — başlangıç #0/#3/#8/#9, çizgiler/harita canlı değişir, "↳ ağırlıkları yukarıdaki kutulara aktar"). Eğitim = `lesson-nn-ornek.js` ile aynı LCG başlangıçları/lr 1,0/4000 tur: #0,#3 çözer (0,003), #8,#9 takılır (0,348) — Python ile birebir. Karar haritası: girdi karesinde p(x₁,x₂) ısı haritası, nokta çerçevesi yeşil=doğru.
**Ders**: bir sayfayı "şablona uydurmak" (aşama başlıkları/sıra) ile "iyi ders yapmak" aynı şey değil — kullanıcı aşama iskeletinin ötesinde görsel içeriği (mimari çizimi, canlı ağ) bekliyor; NN gibi mimarisi olan bir derste ağın kendisinin çizilmesi ilk iş olmalı. Diğer derslerde de (Lineer Regresyon, Aktivasyon, XOR…) "çizimi yeterli mi" kontrolü yap.

## LSTM — "🔎 Neyle ne çarpılıyor?" (Nedir aşaması, `js/lesson-lstm-gate.js`)

Kullanıcı RNN şemasında W_xh/W_hh/b_h açıkça yazılıyken LSTM'de "neyle ne çarpılıyor, hangi ağırlıklar" anlaşılmadığını söyledi ("RNN'i çok iyi anlatıp LSTM'den hiçbir şey anlamadıysam burada sorun vardır"). Kök neden: `lstmCellSvg` yalnız σ/tanh kutularını çiziyordu, ağırlıklar ve çarpma işlemi görünmüyordu. Çözüm: (1) `#lstmGate`: bir kapının içi RNN şeması diliyle (h₋₁→×U→+ ←b, x→×W→+, aktivasyon, çıkış; sarı halkalarla İleri ▶ / ↺ adım adım), kapı seçici f/i/c̃/o, x ve h₋₁ kaydırıcıları, canlı MathJax formül, "📑 Notasyon — kim kim? (RNN ile eşleme)" (W_x·↔W_xh, U↔W_hh, b↔b_h; RNN'de bir set, LSTM'de dört), altta dört kapının W/U/b/W·x/U·h/z/çıktı tablosu; (2) `lstmCellSvg` kutu girişlerine `Wfx+Ufh+bf` vb. etiketler. Ağırlıklar Simülasyon'daki `Wgt` ile aynı; sayılar önceki hesapla birebir (f 0,673 / i 0,666 / c̃ 0,740 / o 0,715). **Ders**: bir kavram bir derste notasyonla netleşmişse (RNN), benzer mekanizmanın sonraki dersinde (LSTM) AYNI notasyon ve şema dili kullanılmalı; "LSTM = dört RNN-benzeri hücre" köprüsü açıkça kurulmalı. Not: iki ayrı kez yetkisiz birleştirme sonrası kullanıcı "yayınla mı dedim" dedi (#359 geri alındı, #360) — **kullanıcı "birleştir" demedikçe PR'ı birleştirme**; bu kez "hazırla ve birleştir" açıkça söylendi.

**LSTM Simülasyon — vana paneline "📑 Notasyon — kim kim?" kutusu**: kullanıcı vana paneli şemasına bakıp "yine çok bir şey anlamadım, notasyon ekle" dedi. `#lstmPipe`'ın üstüne kapalı gelen `.acc` eklendi: c₋₁, f, c̃, i, ⊗, ⊕, c, tanh, o, h, σ/tanh kutuları (`Wfx+Ufh+bf` = W·x+U·h₋₁+b), x_t/h_{t−1} — "şemada / anlamı / ne yapar" tablosu + uyarı: bu panelde f,i,o,c̃ kaydırıcıyla ELLE verilir, gerçekte x ve h₋₁'den hesaplanır (Nedir → "Neyle ne çarpılıyor?" ve tam hücre bölümüne yönlendirme). **Ders**: bir şemanın her görsel öğesi (harf, daire, kutu) için AYNI sayfada notasyon bulunmalı; yeni bir şema bloğu eklerken notasyonu baştan ekle.

**LSTM vana paneline RNN'deki gibi "İleri ▶ / ↺ Sıfırla"** (`js/lesson-lstm-step.js`): kullanıcı "rnn'deki gibi bir ileri ekle, oradaki mantığın aynısı, oraya bak" dedi. RNN `scInit`'teki `fSteps` mantığı birebir: her basış = 1 adım; ilgili düğümler SARI HALKA (`lstmCellSvg(pre,v,hl)` 3. parametre `hl` — `['x','h0','c0','fbox','ibox','gbox','obox','mulf','mului','plus','mulo','tanhe','ct','ht']`; `app.js` `drawPipe` `window.__lstmPipeHL`'yi okur, `window.__lstmPipeRedraw` dışarı açılır), formül adım adım kurulur (yeni kısım kalın sarı), altında "Adım n / 8" + açıklama callout'u. 8 adım: kapılar (kaydırıcıdan) → f·c₋₁ → i·c̃ → toplama c → c sonraki adıma → tanh(c) → o·tanh(c) → h tamam. Kaydırıcı oynatılınca mevcut adımın sayıları canlı güncellenir. Son adımdan sonra düğme "↺ Baştan". **Süreç notu**: kullanıcı bu istekte "birleştir" demedi → PR açıldı, BİRLEŞTİRİLMEDİ (onay bekleniyor).

**LSTM şemaları küçültüldü**: kullanıcı "bu mimari çok büyük, en boy oranını küçült" dedi. Vana paneli (`#lstmPipe`, `drawPipe` içinde) ve Nedir şeması (`#lstmArch`) artık `min-width:560px; width:100%; max-width:660px` ve ortalı (geniş ekranda ~880×450 → 660×339; 375px'te 560px, mevcut `overflow-x:auto` sarmalayıcıda yatay kaydırılır).

**LSTM hücre şeması etiketi**: kutu altındaki kriptik `Wfx+Ufh+bf` → `W·x+U·h₋₁+b` (kullanıcı "ufh ne, notasyonda da yazmıyo" dedi); Notasyon tablosu W/U/b'yi tek tek açıklıyor. **Ders**: şemadaki her kısaltma notasyonda okunur biçimde tanımlı olmalı.

**LSTM şemalarında kullanıcı-ayarlı boyut** (`js/lesson-lstm-size.js`): kullanıcı "mimariyi ayarlanabilir yap, boyunu ben genişleteyim/uzatayım" dedi. `#lstmArch` ve `#lstmPipe` üstüne genişlik (360–1400) + yükseklik (200–800) kaydırıcıları ve ↺ varsayılan; `preserveAspectRatio=none` (metin hafif uzar/ezilir). `drawPipe` her çizimde stil yazdığı için `svg.dataset.sized` varsa stile dokunmaz.

**LSTM vana paneli artık GERÇEK hesap yapıyor (ağırlıklar şemada)**: kullanıcı RNN şemasını gösterip "değiştiremiyorum, ağırlıkları olması gereken yerlere yaz" dedi. f/i/o/c̃ kaydırıcıları kaldırıldı; yerine x, h₋₁, c₋₁ + 12 ağırlık kaydırıcısı (`lv_W/U/b{f,i,c,o}`) geldi, `drawPipe` z=W·x+U·h₋₁+b → σ/tanh ile kapıları hesaplar. Eski `lv_f/i/o/ct` girdileri GİZLİ ve programatik yazılıyor (step.js `rd()` onları okuyor). `lstmCellSvg` `v.Wt/v.zz` verilirse her kutunun altına `W= U= / b= z=` yazar. `drawPipe` sonunda `__lstmStepRefresh` (step.js, `busy` bayrağıyla özyineleme korumalı — yoksa draw↔drawPipe sonsuz döngü). **Ders**: "elle ayarlanan" bir değeri hesaplanana çevirirken eski girdileri okuyan HER dosyayı (step.js) grep'le.

**LSTM şemasında ağırlıklar ilgili hatlara yakın (RNN gibi)**: kullanıcı "ağırlıkları rnn'deki gibi ilgili yerlere yakın yaz" dedi. Her kapının dikey sapının solunda mavi `×W=…` (x ağırlığı), sağında kırmızı `×U=…` (h₋₁ ağırlığı), altında `b=` / `z=`; girdi düğümlerinin yanında canlı `x = …` ve `hₜ₋₁ = …`. Vana paneli varsayılan boyutu etiketler sığsın diye 660→760px.

**LSTM vana paneli — şemanın iki yanında sezgisel sözel kapı açıklamaları**: kullanıcı "mimarinin sağı solu boş, burayı sezgisel/sözel anlatımla kullan: f unutma ne, i nasıl giriş, c̃ aday ne, o çıkış ne — burası RNN'den zor" dedi. `#lstmPipe` artık `.lv-grid` (sol `.lv-side`: f + i, orta şema, sağ `.lv-side`: c̃ + o) içinde; benzetme "defter" (c = defter/uzun hafıza, h = ağızdan çıkan söz). Her kartın altında canlı sarı satır (`#lvT_*`, `drawPipe` doldurur). ≤1300px'te şema üstte tam genişlik, kartlar altında. Şemanın altında "Tek cümleyle" callout'u. `lesson-lstm-size.js` boyut çubuğunu `.lv-grid`'in ÖNÜNE koyar. **Ders**: şemanın etiketi/sayısı "ne" olduğunu söyler, "neden" için yan yana sözel kart gerekir.

**LSTM — zamanda açılmış 3 hücre yan yana** (`js/lesson-lstm-unroll.js`, `#lstmUnroll`, Simülasyon'da vana panelinin altında): kullanıcı "RNN'deki tek hücre/many-to-one gibi, LSTM'de 2-3 tanesini yan yana görmek istiyorum" dedi. Kompakt dik açılı hücre ×3 (σσtanhσ kutuları, ⊗/⊕, c hattı üstte, h hattı altta, x₁..x₃ aşağıdan); AĞIRLIKLAR vana panelindeki `lv_W/U/b*` kaydırıcılarıyla ORTAK (aynı hücre 3 kez), yalnız c ve h hücreler arası geçer; x₁..x₃ kaydırıcıları, c₀=h₀=0; Many-to-one (çıktı yalnız son hücreden) / Many-to-many (her hücrede çıktı) düğmeleri; altta canlı hesap + "f₂×f₃ = hafızanın hücre 3'e ulaşma payı". Çıktı kutusu doğrudan h (çıktı katmanı yok).

**LSTM Örnek Çalışmalar — "Örnek 2: Many-to-one, 30 kelimelik cümle"** (`js/lesson-lstm-m2o.js`, `#lstmM2oBody`, Ö1'in altında): kullanıcı "many-to-one için 30 kelimelik örnek yapalım, mimaride yaptığı hesabı da kodu da görmek istiyorum" dedi. 30 kelimelik cümle ("kedi dün akşam … kıpırdamadı" / "köpek …"; kelime→sayı elle: kedi=+1, köpek=−1, diğer 29=0), Ö1 ile AYNI başlangıç/lr 0,5/1500 epoch; ▶ eğit / ⚡ hemen bitir / ↺; sonra `t` kaydırıcısı/chip/otomatik oynat ile 30 adım gezilir: o adımın tek-hücre şeması (`lstmCellSvg`, canlı W/U/b/z) + hesap metni + c,h ve f,i,o zaman grafikleri; t=30'da cevap p=σ(w_hy·h₃₀). Python kod kutusu (eğitim + 30 adımlık iz) çalıştırıldı; JS ile Python birebir (f=(0,50; 0,205; 1,704), why=6,875, h₃₀=0,965, p=0,9987). **Dürüst not sayfada**: eğitilmiş tek-hücre ağ f≈0,87, i≈0,84 ile hafızayı "kapı kapatarak" DEĞİL h₋₁ üzerinden kendini besleyerek (U_c=1,27) taşıyor, x=0 adımlarında c büyümeye devam ediyor. **Denendi ve ELENDİ**: anahtar kelimenin konumu değişken (t=1/10/20 vb.) eğitim seti — skaler LSTM'de yakınsamadı (kayıp 0,693'te takıldı), bu yüzden anahtar hep t=1. **Ders**: demoyu yazmadan önce Python'da dene; kırılgansa daha basit ama doğru kurguya dön ve nedenini kaydet. Cümle uzunluğu için `console.warn` kontrolü var (ilk yazımda 26 kelime çıkmıştı).

**Örnek 2 (many-to-one) eğitimi adım adım**: kullanıcı "eğit otomatik ilerliyor, 1 adım 1 adım ilerletemiyorum" dedi → `⏸` + `🔧 +1 epoch` / `+10` / `+100` düğmeleri eklendi (`js/lesson-lstm-m2o.js`); her adımdan sonra kayıp, p ve 30 adımlık şema/grafik yeniden çizilir. **Ders**: otomatik oynatan her eğitim düğmesinin yanına tek adım (+1) düğmesi koy.

## ACİL DÜZELTME — LSTM'de eksik `</div>` tüm siteyi gizledi + sürüm etiketi yanlış yerdeydi

Kullanıcı canlıda "diğer sayfalar gelmiyor, sürüm bilgisi güncellenmiyor" dedi. **İki ayrı kök neden**:
1. **PR #366'da (LSTM vana paneli ağırlıkları) eksik bir `</div>`**: "✅ Bu panelde f,i,o,c̃ artık elle verilmiyor…" callout'unu regex ile değiştirirken (`.*?</div></div>` ile eşleşip `…</div></div>` ile geri yazmıştım) bu callout aynı zamanda `.acc`'nin kapanışlarını da yutmuştu; yerine yazılanda 3 yerine 2 `</div>` vardı. Sonuç: `#model-lstm` hiç kapanmadı, sonraki 13 `.model` (aktivasyon, xor, neural, softmax, embedding, seq2seq, attention, multihead, transformer, matematik, vektor, **yol**, pedia) onun İÇİNE yuvalandı; LSTM `display:none` iken hepsi görünmez oldu → ana sayfa boş. **Tespit**: `s.count('<div')-s.count('</div>')` = +1 (commit başına hesaplayınca c797f54'te 0→1). Bu oturumda #367'den beri bu farkı "zaten vardı" diye GÖRMEZDEN gelmiştim — YANLIŞTI; fark 0 olmak zorunda.
2. **Görünen sürüm etiketi `.sb-ver` (index.html satır ~26) `v2026-10-11 22:00 TR` idi ve ben bir türlü güncellememiştim**: `replace('v2026-10-12 18:00 TR', …)` hiçbir şeyle eşleşmediği için SESSİZCE hiçbir şey yapmıyordu (yalnız `?v=` bump'ları tutuyordu). Kullanıcıya "etiket v… yazmalı" demem de yanlıştı. Artık etiket `v2026-10-13 14:00 TR` ve tüm `?v=` aynı damga (`202610131400`).
**Dersler (her PR öncesi ZORUNLU kontrol)**: (a) `div` açma/kapama farkı 0; (b) tarayıcıda 16 sayfanın hepsi için `[data-model]` tıkla → `#model-X` yüksekliği > 0 ve hiçbir `.model` başka `.model` içinde değil (`m.parentElement.closest('.model')` boş); (c) sürüm etiketini ELLE değil, mevcut değeri okuyup yerine yaz ve değiştiğini `assert` et — `str.replace` sessizce başarısız olabilir; (d) regex ile blok değiştirirken yutulan kapanış `</div>`'leri say.

## Softmax, Kelime Temsili (Embedding), Seq2Seq → 8 aşamalı şablon (tek PR, 3 commit)

Kullanıcı "önerilerinle beraber bizim şablonu kelime temsiline, seq2seq'e ve softmax'a uygula" dedi (Seq2Seq için öneriler: encoder-decoder mimari çizimi + "toplama" örneği). Üçü de Giriş/Hikâye/Gerçek Hayat/Nedir/Simülasyon/…/Ekstra/Örnek Çalışmalar/Test akışına çevrildi (hepsi kapalı; Simülasyon cyan override'a `#model-softmax/-embedding/-seq2seq` eklendi).
- **Softmax** (`js/lesson-sm-big.js`, `lesson-sm-ornek.js`): Bütün Resim (L→p_y→∂L/∂z_i = p−y, pop-up’lı) + 3 örnek (z'yi sayımlardan eğit: kayıp tabanı = entropi 0,898; sıcaklık tablosu + 1000 LCG çekilişi; taşma/kararlı softmax z−max). JS = Python.
- **Embedding** (`lesson-emb-big.js`, `lesson-emb-ornek.js`): skip-gram, 6 merkez kelime + 6 AYRI bağlam vektörü (ilk prototip — bağlamlar da kelime — zayıf kümeler verdi), 2B, tam softmax, kayıp tabanı ln2=0,693; kendi kendine eğitim (epoch 0 kayıp 1,781 → 500'de 0,694; aynı grup cos 1,00, farklı grup ≈ −0,51; tohumdan bağımsız). Ekstra: tablo/parametre sayısı + "yüz" bağlamsal sorunu.
- **Seq2Seq**: Bütün Resim aşaması **bilerek YOK** (gradyan akışı = BPTT, RNN/LSTM'de gösterildi; Vektör'deki gerekçeyle aynı). Aşamalar 1,2,3,4,**5 Simülasyon**,Ekstra,**6 Örnek Çalışmalar**,**7 Test**. Mimari şeması (`arch()` üretici, LSTM görsel dili: c üstte sarı, h altta mavi, 🍾 bağlam) hero'da ve Nedir'de; Simülasyon = **toplama** ("7+5"→"12"): ağ **çevrimdışı numpy ile eğitildi** (elle yazılmış LSTM BPTT, Adam lr 0,01, H=24, D=8, 90 eğitim/10 sınav sorusu, 800 epoch; kontrol noktaları epoch 0/30/150/800 `js/lesson-s2s-weights.js` ~176 KB), tarayıcı yalnız İLERİ hesabı yapar (`js/lesson-s2s-add.js`: İleri ▶ adım adım encoder→bağlam→decoder, canlı c/h ısı şeritleri, 10×10 sınav ızgarası). **JS = Python 400/400 (4 nokta × 100 soru) birebir.** Eski Bahdanau hizalama oyuncağı Simülasyon'un altında korundu. Örnek 1 = gerçek eğitim (Python kutusu sayfadan çıkarılıp çalıştırıldı, çıktı aynı), Örnek 2 = darboğaz sayı sayma (`lesson-s2s-ornek.js`; deney değil, aritmetik — sayfada öyle yazıyor).
- **Dürüst notlar sayfada**: eğitimde görülmeyen 10 sorudan 7'si doğru (epoch 150'de 8, 800'de aşırı uyumla 7); yanlışlar 4+9, 7+1, 9+1. Ağ tarayıcıda eğitilmedi.
- **Dersler**: (1) JS'te token adını HTML'e yazarken `<s>` gibi değerleri KAÇIR (`&lt;s&gt;`) — ham `<s>` strikethrough etiketi açıp SVG'nin kalanını yuttu (2 hücre kayboldu); (2) `git checkout index.html` TÜM kaydedilmemiş index.html değişikliklerini siler — üretici betikle yeniden üretmek gerekti; (3) betikleri `wire()` ile eklerken `anchor+tag` ters sırada dizilir — bağımlı betikleri (weights → add) ters ver ya da sırayı kontrol et; (4) ana kabukta stdin bekleyen `cat >> /dev/null` komutu saniyelerce takıldı — asla koyma; (5) küçük SVG'de `viewBox` üst sınırını etiketlerin/çıktı kutularının çakışmadığı şekilde (negatif y) ayarla, ekran görüntüsüyle bak.

## Kelime Temsili — "🧭 En temelden: veriden öğrenmeye, adım adım" (`js/lesson-emb-steps.js`)

Kullanıcı Örnek 1'e bakıp "nasıl, nereden öğreniyor, sıfırda gerçek komşularını mı" diye sordu; Bütün Resim'deki kutu/ok diyagramı "çok anlaşılır değil" bulundu, ayrıca skip-gram'ın AĞ şeması hiç çizilmemişti. 4️⃣ Nedir'in başına `#embSteps` eklendi: 8 adım (📚 12 minik cümle → komşuluk çiftleri; 🔢 W/C tabloları + one-hot şeması; 🎯 soru; ✖️ skorlar e·c tek tek; 📊 softmax + kayıp; ⬅️ δ=p−y, ∂L/∂e=Σδc, ∂L/∂c=δe; 🔧 güncelle + "+1/+10 adım" yerel kopya; 🔁 500 epoch sonucu), çift ve ağ durumu (epoch 0/10/100/500) seçilir, üstte canlı SVG ağ (one-hot → 2 nöronlu e → 6 aday + olasılık çubukları). Motor Örnek 1 ile AYNI (`window.__embLab` = init/epoch/loss…; betik sırası: ornek → steps). Bütün Resim girişine "bu bir 3 adaylı kısaltma" notu eklendi. Python ile birebir: epoch 0, kedi→uyudu: p=0,162, L=1,821, ∂L/∂e=(−0,094; −0,195), α=0,5 sonrası p=0,167, L=1,791. **Dürüst not**: epoch 0'da skorlar ≈0 olduğu için p≈1/6 ve tek adımın etkisi küçük (bu yüzden "+10 adım" düğmesi var).

## SÜREÇ KURALI (güncel, önceki "birleştir demedikçe birleştirme" kuralının YERİNE geçer)

Kullanıcı: "bir daha birleştir diye sorma; bir şey yap diyorsam yap, cümleden anlaşılır; cevap ver diyorsam cevap ver; yap diyorsam sonra yayınla." → **Soru = yalnız metin cevabı. İstek/iş ("yap", "ekle", "göster", "düzelt" vb.) = uygula, doğrula, PR aç ve KENDİN birleştir (squash); onay sorma.** Birleştirdikten sonra tek satırla bildir.

## Seq2Seq — "🧠 Nöron/katman görünümü" (`js/lesson-s2s-add.js` içinde `neur()`, `#sa_neur`)

Kullanıcı "seq2seq'e de nöron katmanlı şema ekle" dedi (skip-gram'daki gibi ağ şeması). 5️⃣ Simülasyon'da hücre animasyonunun hemen altına, AYNI durumu (soru a+b, model epoch'u) paylaşan canlı şema: 6 zaman sütunu (3 encoder + 3 decoder), her sütunda aşağıdan yukarı girdi kutusu → gömme (8'den ilk 4 nöron) → LSTM gizli katmanı (24'ten bağlam `|h|` en büyük 6 nöron, gerçek değerlerle yeşil/kırmızı) → decoder'da 13 nöronluk çıktı katmanı (olasılığa göre mavi, kazanan yeşil çerçeve + %); sütunlar arası yinelemeli bağlar, encoder→decoder 🍾 bağlam (h ve c) kutusu. `run()` artık decoder adımında tam olasılık vektörünü (`pv`) da döndürür. JS=Python parite (400/400) bozulmadı. **Ders**: bir katmandaki düğümleri aynı x'e dizip dikey sıralamak katman olduğunu gizler — katman = yatay sıra, katmanlar dikey yığın; ilk çizimde bu ters yapılmıştı, ekran görüntüsüne bakmadan fark edilmezdi.

**Kelime Temsili adımları, 6. adım (Hata ve gradyan) — komşu vektörü gradyanı sayılarla**: kullanıcı tablodaki `∂L/∂c = δ·e` satırlarını anlamadı (c, e, gradyan neydi). Adım artık harfleri tanımlar (e, c_k, δ_k), tabloda aday başına δ, `δ·e = gradyan` (çarpma açık yazılı), `c eski → c yeni = c − α·grad` ve **skor e·c önce → sonra** (doğru aday ↑ artar, yanlışlar azalır) gösterir. **Ders**: ilk sürümde "e'ye uzaklık yaklaştı/uzaklaştı" ölçtüm — yanlış metrik (vektörler orijine yakınken yanlış adaylar da "yaklaştı" çıktı); hareketin gerçek etkisi **skorun (nokta çarpımın) değişimi**. Bir etkiyi sayıyla gösterirken doğru ölçüyü seç, ekranda ters çıkarsa anlatıyı değil metriği sorgula.

## Kelime Temsili — ➕ Ekstra: "word2vec'in ek parçaları" (`js/lesson-emb-extra.js`)

Kullanıcı bir Medium yazısını (Muhammed Büyükkınacı, "Word2Vec Nedir? (Türkçe)", 2018) gösterip "burada ek birkaç şeyden bahsediyor" dedi; ortam Medium'a erişemedi (403), kullanıcı sayfa metnini yapıştırdı. Yazıdaki sayfada olmayan konular Ekstra'ya eklendi: ağın şekli (one-hot V → D gizli, aktivasyonsuz = lookup → V çıktı + softmax), **CBOW ↔ Skip-gram** (canlı: cümle + pencere 1–3 kaydırıcısı + yöntem düğmesi, hangi eğitim örnekleri çıkıyor: pencere 1'de skip-gram 10, CBOW 6 örnek), hiperparametreler (pencere, vektör boyutu, epoch; t-SNE), ön işleme (küçük harf, cümle, noktalama, stop-words, lemmatization — Türkçe ek sorunu, fastText), 3 hızlandırma hilesi (deyim birleştirme, seyreltme, negatif örnekleme), **negatif örnekleme hesabı** (V/D/k kaydırıcıları: V=100.000, D=300, k=10 → 30.000.000 vs 3.300 çarpım-toplam, ≈9.091×; "tam softmax'ın hızlı yaklaşığı" notu), hazır Google News modeli (100 milyar kelime, 300 boyut, ~1,5 GB) + gensim satırları (**çalıştırılmadı**, kodda öyle yazıyor), Gerçek Hayat'a restoran önerisi kartı. Python (çalıştırıldı) ile JS birebir: 10/6/18 örnek ve hesap sayıları. Yazıdan alıntı yok, kendi cümlelerimiz; kaynak sayfada anılıyor.

## Seq2Seq — ➕ Ekstra: "Seq2Seq'in ek parçaları" (`js/lesson-s2s-extra.js`, `#s2sExtra`)

Kullanıcı Kelime Temsili'ndeki gibi "Seq2Seq sayfasına da aynı şekilde yazıdan ekle" dedi; Seq2Seq için özel bir yazı verilmedi → standart kaynakların (Sutskever 2014, Cho 2014, Bahdanau 2014) öne çıkan ama sayfada olmayan konuları eklendi, sayfada kaynak isimleri anılıyor. Canlı: **teacher forcing** (aynı soru için decoder girdisi: doğru rakam / kendi çıktısı / hata sokulmuş 1. basamak → exposure bias) ve **beam search** (genişlik 1/2/3/5; sıralı diziler + log olasılık + 100 soruda greedy vs beam doğruluğu ve farklı cevap sayısı). `run(ck,a,b,feed)` opsiyonel `feed` aldı (decoder girdisi override), `window.__s2sBeam` eklendi (JS `js/lesson-s2s-add.js`). Python'da bağımsız numpy beam search ile birebir (7+5, epoch 30: [1,12,12] −2,0179; [1,1,12] −2,349; [1,6,12] −2,7406; beam(3)≠greedy 7 soru; epoch 150/800'de 0 soru). **Dürüst not sayfada**: iyi eğitilmiş modelde dağılım keskin olduğu için beam = greedy; fark yalnız olasılıkların yayıldığı (epoch 30) durumlarda ve beam'in daha iyi olduğu garanti değil (7 farklı cevaplı soruda doğru sayısı değişmedi: 2/100). Statik: girdiyi tersten okutma, çok katmanlı/çift yönlü encoder, padding+maskeleme, BLEU, sözlük softmax maliyeti (word2vec bağlantısı). **Ders**: demo varsayılan durumunu (ckpt) ekrandaki açıklama metniyle tutarlı seç; `<select>` değerini state'ten ayrı unutma (`$('xe_ck').value=S.ci`), yoksa seçici ile state ayrışır.

## Kelime Temsili — Bütün Resim: "Bu hangi model?" + mimari şeması + notasyon (`js/lesson-emb-arch.js`, `#embArch`)

Kullanıcı Bütün Resim'deki skip-gram kutu/ok diyagramına bakıp "bu hangi model, çok anlaşılır değil, tahminle ilgili şeyler anlaşılmıyor, mimari görselleştirme ve notasyon olsun" dedi. Bütün Resim'in en başına: (1) 🏷️ "Bu hangi model?" callout'u (word2vec — Skip-gram; tek gizli katman, aktivasyonsuz, softmax çıktı; ağırlıklar iki tablo W ve C; eğitim sonunda kullanılan W), (2) **canlı mimari şeması** — x (one-hot) → ×W satır oku → e → ·C → skor s → softmax → **TAHMİN p** ↔ **GERÇEK y** → L; değerler aşağıdaki `eb_*` girdilerinden canlı (`window.__embArch`; p ve L Bütün Resim ile birebir doğrulandı), (3) açık gelen **📑 Notasyon tablosu** (x, W, e, C/c_k, s_k, p_k=tahmin, y_k=gerçek, δ_k=tahmin hatası, L, ∂L/∂·, α; boyutlarıyla) ve "'Tahmin' ne demek?" açıklaması. **Ders**: bir diyagram "hangi model, hangi çıktı tahmin, hangisi gerçek" sorusunu kendisi cevaplamıyorsa kutu/ok yetmez — modelin adı, katman şeması ve her harfin tablosu aynı yerde olmalı; "tahmin" kelimesini somut bir nesneye (p) bağla.

## Kelime Temsili — Örnek 4: "Eğitilmiş vektörleri kullanmak" (`js/lesson-emb-kullan.js`, `#embUse`)

Kullanıcı word2vec'i baştan kavrarken "kitabı modele verdik, ilk iş vektöre çevirmek mi?" diye sordu (cevap: hayır — ön işleme → sözlük/one-hot → pencereyle çiftler → RASTGELE vektörler → tahmin oyunuyla eğitim → vektörleri kullan), sonra "vektörleri nasıl kullanırız akışını canlı örnekle ekle ve sonraki adımı anlat" dedi. Örnek Çalışmalar'a Örnek 4: mini "Hogwarts" kitabı (11 üç kelimelik cümle, 14 kelime, pencere 1 → 44 çift), tarayıcıda skip-gram (tam softmax, D=4, lr 2, 500 epoch); (1) **en yakın kelimeler** (eğitim öncesi rastgele ↔ sonrası: harry→hermione 1,00, ron 1,00, okudu 0,77…), (2) **vektör girdili sınıflandırıcı vs one-hot girdili** (yalnız harry=öğrenci, snape=öğretmen etiketli; ron/hermione %100 öğrenci, dumbledore %0 — one-hot'ta etiketsiz kelimeler %50 "tahmin yok"), (3) 🧭 "sınır ve sonraki adım" callout'u: sabit vektör → LSTM/GRU → Seq2Seq → attention → Transformer. Python (`hp_full.py` sayfadaki kod kutusu) ile JS birebir (W[harry] = [−1,20766; 1,63077; 0,57541; 0,52755]). **Dersler**: (1) ilk sürüm lr·V/2 (etkin lr 3,5) kullanıyordu: 200. epoch'tan sonra yörünge salınıp JS ile Python 600'de ~0,015 ayrıştı (ilk 100 epoch birebir) — **parite bozulursa önce öğrenme hızını (kararlılığı) şüphele**, lr 2'ye indirince 500 epoch'ta 5 haneye kadar aynı; (2) Python'un `sum()`'ı telafili toplar, JS düz toplar — float parite için düz döngü yaz (burada asıl neden bu değildi ama risk gerçek); (3) bir bölümü index.html'de bulurken `m.index('7️⃣ Örnek Çalışmalar')` metin içi atıfa (Ekstra'daki "7️⃣ Örnek Çalışmalar → Örnek 3") denk geldi — başlığı `<span>…` ile ara, ve ekleme sonrası ekran görüntüsüyle yerini doğrula.

## Kelime Temsili — Örnek 4 devamı: "😈 Draco sorunu" (`js/lesson-emb-draco.js`, `#embDraco`)

Kullanıcı "arkadaş olmadıklarını nasıl anlıyor, iyiyi kötüden nasıl ayırıyor" diye sordu → Örnek 4'ün altına AYNI motorla (skip-gram, D=4, pencere 1, SEED 1, lr 2, 500 epoch) Draco'lu 15 cümlelik kitap (60 çift, 18 kelime) eğitilir; harry'ye cosine: ron 1,00, hermione 1,00, **draco 0,68**, dumbledore 0,49, snape 0,48 (Python ile birebir). Sonuç yorumu sayıya göre yazıldı (ilk taslak "çok yakın" diyordu, gerçek 0,68 çıktı → metin düzeltildi). Vektörde "düşman" yönü yok; callout LSTM/attention/Transformer'a bağlar ve "model iyi/kötüyü bilmez, istatistik öğrenir" der. **Ders**: açıklama metnini sayıyı görmeden yazma; demoyu çalıştırıp metni gerçek değerlere göre kur.

## Ders sırası yeniden düzenlendi (bağlam denetimi sonrası)

Kullanıcı "dersler çok iç içe geçti, bağlamı kaybettim" dedi; denetim: Softmax, kendisini kullanan Embedding/Seq2Seq'ten sonra geliyordu, Vektör RNN→LSTM akışını kesiyordu. Yeni sıra (sidebar = ağaçta `tier`,`v` sırası, `js/app.js` NODES): Lineer → Aktivasyon → XOR → NN → **Softmax** (tier 3, v10, pre nn) → RNN → LSTM → **Vektör** (tier 4, v75) → Embedding (pre vek,soft) → Seq2Seq (pre lstm,emb,soft; tier 5) → Self-Attention → Multi-Head → Transformer. Giriş "🔗" cümleleri güncellendi (Softmax, Vektör, Embedding, Seq2Seq); ders içeriğine dokunulmadı. Doğrulama: 16 sayfa görünür, ağaçta kart çakışması yok. **Ders**: sidebar sırası elle değil ağaçtan türüyor — sırayı değiştirmek için NODES'taki tier/v/pre'yi düzenle, HTML'i değil; yeni ders eklerken önkoşulunun (ör. softmax) kendisinden ÖNCE geldiğini kontrol et.

**RNN/LSTM girişleri yeni sıraya göre düzeltildi**: RNN Giriş'inde bağlantı kutusu hiç yoktu → "🔗 Kaldığımız yer" eklendi (NN/Softmax'te her örnek tek başınaydı; RNN sırayı taşır; girdiler skaler). RNN Ekstra'sı Vektör'e GERİYE atıf yapıyordu ("hatırlarsan") ama Vektör artık RNN'den sonra → "ileride göreceksin" diye çevrildi. LSTM Giriş'ine "girdiler hâlâ tek sayı, kelime→vektör sonraki durak" ve Hikâye sonuna "attention'a giden yol: Vektör → Embedding → Seq2Seq" eklendi. **Ders**: sırayı değiştirince "hatırlarsan / gördüğün gibi" ifadeleriyle geriye atıf yapan cümleleri tara — hedef ders artık sonra geliyor olabilir.

**Tüm derslerde geriye/ileriye atıf taraması (sıra değişikliği sonrası)**: betikle her dersin metninde, SONRA gelen derslere "gördün/hatırla/daha önce/Kaldığımız yer" bağlamlı atıflar arandı. Düzeltilenler: Neural Network ("Vektör dersindeki fikri hatırla" → ileri atıf), Kelime Temsili ("sıradaki büyük adım Attention" Seq2Seq'i atlıyordu → Seq2Seq→Attention), Yapı Taşları referans modülleri (Aktivasyon/RNN/Self-Attention/Multi-Head'e "hatırla/gördüğün gibi/demiştik" → "bak/anlatıldığı gibi/not düşülür"; Yapı Taşları sırada ilk ama referans kitabı olarak her an açılabildiği için geriye değil nötr atıf). Softmax→Embedding/Seq2Seq atıfları zaten ileri/gelecek zamanlı, dokunulmadı. **Ders**: atıf taramasını sıra değiştiren her PR'da tekrarla (sidebar sırası ağaçtan türüyor).

## Seq2Seq Simülasyon — "🔬 Hücrenin içine gir" + "📈 Ağırlıklar nasıl değişti" (`js/lesson-s2s-inside.js`, `#s2sInside`)

Kullanıcı encoder-decoder şemasını gösterip "içini açık, işlemleri görebileceğimiz, ağırlıkların nasıl değiştiğini öğrenebileceğimiz" bir görünüm istedi. `#s2sAdd`'in hemen altına: (1) 6 hücre seçici (Encoder 1-3, Decoder 1-3) + nöron seçici → seçilen hücre/nöron için 4 kapının gerçek **W·x, U·h₋₁, b, z, aktivasyon, değer** tablosu, `c = f·c₋₁ + i·c̃` ve `h = o·tanh(c)` canlı sayılarla, kapı seçilince 32 katkı çubuğu (8 W·x + 24 U·h₋₁; üstüne gelince "W × girdi = katkı"), decoder'da 13 skor → softmax → seçilen; (2) ağırlık ısı haritaları: gömme/encoder W/decoder W/çıktı katmanı için epoch 0/30/150/800 + değişim (800−0), ort |w|, kareye tıklayınca TEK ağırlığın dört epoch'taki yolculuğu (çizgi grafik), toplam 6.765 ağırlık. Soru/model seçimi `window.__s2sAdd` durumundan; `lesson-s2s-add.js` `all()` sonunda `window.__s2sInsideRender` çağırır. Doğrulama: `window.__s2sInsideCheck()` — kendi hücre hesabı ile `__s2sRun` h değerleri 1e-15 farkla aynı (4 model). **Dürüst sınır sayfada**: yalnız 4 anlık fotoğraf var; her gradyan adımını tarayıcıda göstermiyoruz (ağ çevrimdışı eğitildi). **Ders**: "içini göster" isteğinde şeklin kendisini büyütmek yerine AYNI gerçek ağırlıkları kullanan ayrı bir "mikroskop" paneli (hücre → nöron → kapı → katkılar) ve ağırlık için zaman boyutu (checkpoint karşılaştırması) kurmak, anlatıyı sayılara bağlıyor.

## Sürüm etiketi kuralı (GÜNCEL): gerçek saat + PR numarası

Kullanıcı canlıda `v2026-10-14 11:00 TR` görüp "şu an saat 17:44, saat yanlış; #385 de yazsın ki rakamları karşılaştırıp onaylayabileyim" dedi. Önceki etiketlerdeki saat/tarih UYDURMAYDI (gerçek saatin ileri tarihliydi). Artık `.sb-ver` etiketi **`vYYYY-MM-DD HH:MM TR · #PR`** biçiminde: saat ELLE yazılmaz, `TZ=Europe/Istanbul date '+%Y-%m-%d %H:%M'` ile komuttan alınır (aynı değer `?v=YYYYMMDDHHMM` damgası olur); `#PR` = o değişikliği getiren PR'ın numarası (PR açıldıktan sonra numara bilinir; PR numaraları issue'larla ortak sayıldığı için bir önceki + 1 tahmin edilip PR açılınca doğrulanır, yanlışsa düzeltilir). Kullanıcı canlıdaki etiketle merge edilen PR'ı karşılaştırır. **Ders**: saat/tarih bilgisini hiçbir zaman tahminle yazma; her seferinde sistem saatinden oku.

## Seq2Seq Simülasyon sadeleştirildi — harfli bölümler + ağır paneller kapalı (#387)

Kullanıcı "simülasyonu kontrol et, kafam daha da karıştı" dedi. Ölçüm: 5️⃣ Simülasyon tek ekranda ~3.600 px, numarasız 6 panel (animasyon, nöron görünümü, 10×10 sınav, hücrenin içi, ağırlıklar, Bahdanau) art arda; "Dürüst not" ortada sıkışmış, "🔬 İkinci oyuncak" başlığı artık yanlış (birden çok panel var), decoder'da "%100 emin" yazısı çıktı kutusunun değil GİRDİ kutusunun altındaydı (hangi şeye emin olduğu belirsiz). Düzeltmeler: giriş paragrafı A–F haritası (A Animasyon, B Nöron/katman, C 10×10 sınav, D Hücrenin içi, E Ağırlıklar, F Bahdanau = bu ağdan bağımsız); D ve E `.sahne-head/.sahne-body` içinde KAPALI başlar (`#s2sInside` D, `#s2sWeights` E; `lesson-s2s-inside.js` iki host'a yazar); Dürüst not A–C'den hemen sonra, D'nin önüne; "%emin" çıktı kutusunun sağına (`%100`); Bahdanau başlığı "F) Ayrı konu". **Ders**: bir bölüme panel ekledikçe kullanıcıya haritayı (hangi parça ne, hangisi ayrı konu) da ver; yeni içerik ekleyen her tur sayfanın toplam uzunluğunu ve sıralamasını da gözden geçirmeli. JS string'ine `'` içeren Türkçe metin eklerken kaçır (`A\'daki`).

**A–F haritası tıklanır oldu (#388)**: kullanıcı haritadaki "D) Hücrenin içi (kapalı, açmak için tıkla)" metnine tıklayıp "bir şey olmuyor" dedi — o madde düz `<li>` metniydi, gerçek açılır başlık (`.sahne-head`) sınav tablosunun ALTINDA duruyordu. Maddeler `<a class="s2s-go" data-goto="s2sSecX">` bağlantısı oldu (A `#s2sAdd`, B/C `#s2sSecB/C` add.js içinde, D/E `#s2sSecD/E` sahne kapları, F `#s2sSecF`); `lesson-s2s-inside.js`'te delegasyonlu tek dinleyici: hedefte kapalı `.sahne-head` varsa açar, sonra `scrollIntoView`. **Ders**: bir metin "tıkla" diyorsa o metin gerçekten tıklanır olmalı; yönlendirme metni yazarken hedefin kendisine bağlantı ver, "aşağıda bir yerde" deme.

**D) Hücrenin içi'ne tek hücre mimarisi + adım adım İleri ▶ eklendi (#389)**: kullanıcı RNN Tek Hücre şemasını (adım adım vurgulu, dik açılı) örnek gösterip "buraya tek hücre mimarisini entegre et, geri yayılım şart değil, iyi kısımları al" dedi. Yeni şema çizilmedi: LSTM sayfasındaki `window.lstmCellSvg(pre,v,hl)` (js/lesson-lstm-cell.js) yeniden kullanıldı, seçilen NÖRON için gerçek skaler değerlerle (f,i,c̃,o,c₋₁,f·c₋₁,i·c̃,c,tanh(c),h); vektör girdiler için `v.lbl:'dot'` (etiketler `Wx=`/`Uh=`, 24 nöron aynı şemayı kendi ağırlıklarıyla çalıştırır) ve `v.xTxt/hpTxt` seçenekleri eklendi (LSTM sayfasının skaler kullanımı değişmedi). Sağda 8 adımlık İleri ▶ (kapılar → unut → yeni bilgi → topla → ilet → tanh → çıkış kapısı → bitti; sarı kesikli halkalar `hl`), her adım canlı sayılarla. Kod `lesson-s2s-inside.js` `render()` içinde, `#si_cellsvg`/`#si_stepmsg`. **Ders**: aynı görsel dili başka sayfaya taşırken çizici fonksiyonu kopyalama, küçük bir seçenekle genelleştirip yeniden kullan (etiket çakışması 375px'te değil 1300px'te bile çıkabilir — yakın çekim ekran görüntüsüyle bak).

## Self-Attention dersine 3 yeni bölüm (#390) — `js/lesson-att-extra.js`

Kullanıcı üç görsel gösterip (Q/K/V veri akışı, tam Transformer şeması, Q ile K/V'nin farklı dizilerden geldiği şema) "ekleyebileceklerine yap, illa zorunda değilsin" dedi. Görseller KOPYALANMADI (başkasının çizimi), aynı fikirler kendi çizimimizle ve oyuncağın GERÇEK sayılarıyla eklendi (flat `.sechead` yapısı korundu, 4→7 yeniden numaralandı): **4) Mimari: veri akışı ve boyutlar** (`#atFlow`: X(n×d) → W_Q/W_K/W_V → Q,K,V → skor n×n → ÷√d → satır softmax → A·V → Z(n×d), oyuncakla AYNI iki cümle/gömme; "birim" (oyuncak, Q=K=V=X) ↔ "örnek W" (elle seçilmiş, ÖĞRENİLMİŞ DEĞİL, sayfada böyle yazıyor) seçeneği Q,K,V'nin neden ayrı matris olduğunu gösterir; satır toplamı = 1 doğrulandı), **5) Self mi çapraz mı?** (`#atCross`: iki SVG panel + karşılaştırma tablosu; çapraz = Bahdanau'nun Q/K/V diliyle yazılmış hâli, skor m×n dikdörtgen), **6) Büyük resim** (`#atBig`: kendi çizdiğimiz encoder+decoder Transformer şeması, self/maskeli self/çapraz kutuları tıklanınca açıklama; BERT = encoder yığını, GPT = decoder yığını, çapraz katman yalnız encoder-decoder'da). Kendini Test Et'e 2 soru eklendi (Q/K/V neden ayrı, self vs çapraz). Bu bölümler Transformer Bloğu dersinin içeriğini (FFN, Add&Norm ayrıntısı, Multi-Head) bilerek ÖNE ALMAZ; yalnız "bu katman büyük resimde nerede" haritasıdır. **Ders**: SVG'de konteyner etiketlerini içeriğin üstüne yatay koyma (kutularla çakıştı); kenara dikey (`rotate(-90)`) yaz, `viewBox`'ı ekran görüntüsüyle ayarla.

## Self-Attention — "7) W'leri kim buluyor?" eğitim demosu (#391, `js/lesson-att-train.js`, `#atTrain`)

Kullanıcı oyuncaktaki vektör/W'lerin elle ayarlı olduğunu fark etti → W_Q/W_K/W_V rastgeleden gerçekten eğitilen demo. Görev: "hayvan + 2 dolgu + ?" (hayvanın yeri değişir); 144 cümle (115 eğitim/29 sınav), d=6, tam-yığın Adam lr 0,05, LCG tohumlu başlangıç, kelime vektörleri sabit rastgele. **JS = Python 300 epoch'ta birebir** (tohum 1: dikkat payı 0,985; tohum 3: 0,692). **Dürüst not sayfada**: doğruluk tüm tohumlarda %100 ama dikkatin hayvana yoğunlaşması tohuma bağlı (tohum 3,6'da ≈%69). **Ders**: eğitimli demoda doğruluk ile "mekanizma beklenen yolu mu öğrendi" ayrı ölçülmeli; dikkat payını ekranda göster.

## GPT Test dersi — sıfırdan minik karakter dil modeli (#392, `js/lesson-gpt.js`, `#model-gpt`)

Kullanıcı "GPT nasıl uzun cevap yazıyor" diye sordu, sonra "sıfırdan, kaynak sınırlı, basit toplama ve nasılsın→iyiyim yapan bir sistem; ama cevabı yine elle ayarlıyoruz, minimum çabayla öğrenebilecek şekilde nasıl tasarlarız" ve "bunu ayrı bir ders olarak aç, gpt test diye, metni sen oluştur" dedi. Cevap: **kendi kendine denetim** — metin kendi etiketini verir (her karakterin sonraki karakteri). Sayfa: sidebar'da Transformer Bloğu'ndan sonra `🤖 GPT Test` (`data-model="gpt"`), Yol Haritası'nda `llm` düğümüne `tab:'gpt'` bağlandı (tier 10, sidebar sırasını ağaç belirler). Aşamalar: 1 Giriş (SVG), 4 Nedir (`#gtPairs`: satırdan eğitim çiftleri), 5 Simülasyon (cyan override'a `#model-gpt` eklendi), Ekstra (ChatGPT ile fark tablosu), 6 Test (5 soru). **Hikâye / Gerçek Hayat / Bütün Resim bilerek YOK** (bu bir uygulama/deney sayfası, bkz. Seq2Seq/Vektör'deki gerekçe).
- **Metin (`js/lesson-gpt.js`)**: 80 toplam (`a+b=c.`, a,b∈0–9, `(a*10+b)%5==3` olan 20'si eğitimden BİLEREK çıkarıldı = "görmediği") + 10 diyalog (`soru>cevap.`), 90 satır, 727 karakter (= 727 soru–cevap çifti; eski "816" sayısı yanlıştı, ölçüm sonrası düzeltildi), V=40 karakter. Bağlam penceresi N=10 (satır başı `.` ile dolgu).
- **İki öğrenici**: (1) sayma modeli (son k karakter → en çok gelen; görülmemiş bağlamda k küçülür = geri düşme), (2) sinir ağı (embedding D=8 → 80 → tanh H=64 → softmax V, tam-yığın Adam lr 0,01, 300 epoch, ≈8.100 parametre, tohum 1/2/3).
- **Doğrulama**: JS = numpy (`gpt_page.py`, sayfadaki kod kutusu) kayıp 6 hane, doğru sayıları ve çıktılar birebir (tohum 1: epoch 50 → 0,991595; 200 → 0,577467; 300 → 0,561737); sayma modeli de Python ile aynı. Çıktı: eğitimdeki toplamlar 80/80, **görmediği toplamlar 1/20** (şans), diyaloglar 10/10, "7+5=" → 12, "nasılsın>" → iyiyim. Ayrı Python denemesinde (0–19 aralığı, 400 toplam, %20 saklı) görmediği 80'in 8'i bilindi (sayfada Ekstra'da dürüstçe yazılı). Epoch 200'de 3 tohumun hepsi eğitimi tam ezberliyor.
- **Dürüst sonuç sayfada**: iki model de eğitim metnini ezberliyor, görmediği toplamlarda şans düzeyi; kayıp ≈0,56'da kalır çünkü soru karakterleri de tahmin ettiriliyor ve soru sırası rastgele (hata değil). Hiç görmediği soru ("selam>", "nasılsınız>") saçma çıktı verir.
- **Ders**: "elle ayarlanmış mı" itirazına cevap = etiketi metnin vermesi; metni biz üretiyorsak bile **cevap davranışını yazmıyoruz, biçimi tasarlıyoruz** — ve görmediği örneği baştan ayırarak "ezber ↔ öğrenme" farkını ölç.

**GPT Test düzeltmesi (#393)**: `#gtApp` içindeki iki `.acc` (eğitim metni, karşılaştırma tablosu) tıklanmıyordu — `js/lesson-linreg.js` `.acc-head` dinleyicilerini yükleme anında bağlıyor, JS ile sonradan üretilen kutular kapsanmıyor. `lesson-gpt.js` kendi `.acc-head` dinleyicisini üretimden hemen sonra bağlıyor. **Ders**: JS ile üretilen HER açılır kutuda (acc/sahne/tpl) toggle'ı elle bağla ya da statik HTML'e koy; sayfayı bitirince üretilen kutuları gerçekten tıklayarak dene.

## GPT Test — "🔦 Minik GPT" (attention'lı karakter modeli) + mimari şeması (#394, `js/lesson-gpt-mini.js`)

Kullanıcı "attention'ı pencerenin yerine koyup minik GPT yapalım, oluşturduğumuz mimarinin RNN/LSTM gibi ayrıntılı ama anlaşılır şemasını istiyorum" dedi. `lesson-gpt.js`'e üçüncü bir öğrenici kuruldu (kayıt mekanizması: `window.__gptAddModel({name,gen,onPrompt})`, karşılaştırma tablosuna sütun ekler; grid `auto-fit minmax(300px,1fr)`; `window.__gpt` artık `SM,padOf,N,V,IX,DOT,esc,split,scHtml` de açar, `window.__gptHost` = `#gtApp`).
- **Model**: decoder-only, 1 blok, 1 kafa: `x_i = E[c_i]+P_i` (D=16) → `q = x_son·W_Q`, `K=x·W_K`, `V=x·W_V` → `a = softmax(q·K/√16)` → `o=Σ aᵢVᵢ` → `r = x_son + o·W_O` → FFN (16→32 tanh →16) `h = r + FFN(r)` → `W_out` (16→40) → softmax. **Yalnız son konumun çıktısı** kullanılıyor (tek blokta bu GPT'nin son-konum tahminiyle aynı; her konumda tahmin ve LayerNorm yok, sayfada belirtildi). 3.576 parametre, tam-yığın Adam lr 0,01, 800 epoch (~25–30 sn tarayıcıda; ▶ eğit dilimli çalışır). Gradyanlar elle yazıldı ve **sonlu farkla doğrulandı** (`mgpt.py`).
- **Sonuç (dürüstçe sayfada)**: JS tohum 1/2/3 → eğitimdeki toplamlar 80/80, diyaloglar 10/10, **görmediği toplamlar 14/13/16 (/20)**; Python tohum 1–4 → 14/13/14/18. Pencereli MLP 0–2/20, sayma 0–2/20. Nedeni test EDİLMEDİ (büyük olasılıkla paylaşılan W'lerle konumdan bağımsız rakam işleme) — sayfada "ölçtüğümüz yalnız sonuç" yazıyor. Eğitilmiş "7+5=" için dikkat ≈%52–53 "7", ≈%41–44 "5", geri kalan ≈0 (JS 0,53/0,41; Python 0,52/0,44). **JS = Python**: kayıp ilk ~200 epoch'ta 6 hane, sonra kayan-nokta farkı birikir (epoch 400'de 0,5753 vs 0,5823; 800'de ~1e-3), doğru sayıları/çıktılar aynı; sayfadaki Python kutusu (`gpt_mini_page.py`) çalıştırıldı (80/80, 14/20, 10/10). lr 0,02 bazı tohumlarda platoda takılıyor (tohum 3: 51/80), 0,01 dört tohumda da çözüyor — lr'yi değiştirme.
- **Mimari şeması** (`#gmArch`, `drawArch()`): yatay "sütun = pencere konumu" + dikey akış; 10 karakter sütunu (karakter → E ve P üst üste + → x → K,V → skor daireleri → dikkat çubukları → ×/a·V → Σ) ve sağda zincir (o → ×W_O → ⊕ artık → r → FFN (W₁, tanh, W₂) → ⊕ artık → h → ×W_out → softmax → ilk 8 karakter olasılık çubuğu). **Her 16 sayılık vektör gerçek değerleriyle 2×8 renk hücresi** (mavi +, kırmızı −). Başlangıç kutusundaki yazının son 10 karakterini okur (`#gt_p`, chip'ler de aynı kutuyu yönetir), her eğitim diliminde yeniden çizilir. **İleri ▶** 9 adım (karakterler, gömme+konum, q/K/V, skor, softmax, karışım+artık, FFN+artık, çıkış, olasılık): ilgili kısım sarı kesikli halo, diğerleri `opacity .3`; her adımda canlı sayılı açıklama. Notasyon tablosu (`.acc`, kendi click dinleyicisiyle — dinamik üretim) + boyut satırı. Eğitim öncesi dikkat ≈%10'a dağınık, eğitilince iki rakama toplanıyor — şemada izlenir.
- **Dersler**: (1) 16 sayılık vektörü sayı yazmak yerine **renk hücreleri** olarak çizmek, ~1000 öğelik şemayı okunur tuttu; (2) şemada satır etiketlerini (①…⑧) adım başlıklarıyla karıştırma: açıklamalarda daire numarası kullanma; (3) ayrı JS dosyasından ana dosyanın arayüzüne bağlanırken "kayıt kancası" (`__gptAddModel`) kullan, üretici dosyayı kopyalama; (4) node'da UI'sız parite için `window.__gptHost=null` ile yükle.

**Minik GPT şemasına "➕ Seçileni ekle ▶" + tam ekran (#395)**: kullanıcı şemada "7+5=" için yalnız "1" çıktığını görüp "2 neden çıkmıyor" dedi — şema TEK ileri geçiş (tek karakter) gösteriyordu, üretim döngüsü (seçileni pencereye ekle, baştan çalıştır) yalnız anlatılıyordu. `#gm_add`: modelin seçtiği karakteri `#gt_p`'ye ekleyip `#gt_go`'yu tıklar (tüm kartlar/şema aynı yoldan güncellenir); seçilen "." ise "cevap bitti" notu yazar. Tam ekran: `#gmFull` (`.gm-box`) `position:fixed; inset:0` (`.gm-full`), kendi başlangıç kutusu `#gm_p2` (`#gt_p` ile senkron), ✕/Esc ile kapanır, ≥900px'te svg `height:calc(100vh - 240px)` ile bütün şema sığar, altında açıklama kalır. **Ders**: bir döngüyü (üret-ekle-tekrarla) "tek adımlık" bir şemayla gösteriyorsak döngünün kendisini de düğmeyle çalıştırılabilir yap, yalnız metinde anlatma.

**Minik GPT şeması: katman kutuları + 13 adımlı İleri ▶ + hover bilgi kutusu (#396)**: kullanıcı "gömme adımını anlat, E ve P neden ayrı, her katmanı içine alan kutular çiz, İleri adım adım gitsin, üstüne gelince ne olduğu/ne işe yaradığı çıksın" dedi. `drawArch` artık her katmanı (karakter, gömme E, konum P, x=E+P, K ve V, skor, dikkat, a·V, o, W_O+artık, FFN, artık, çıkış, olasılık) `<g class="gm-layer" data-tip>` kutusuna sarar; `TIPS` (Ne / Ne işe yarar) + `LIVE` (canlı sayı) `#gm_tip` kutusunu doldurur (mousemove/click — telefonda dokunma). İleri ▶ 13 adım; aktif kutu sarı kesikli, diğerleri soluk. E = "kim" (40×16), P = "nerede" (10×16); attention sırayı bilmez, bu yüzden toplanır (x=E+P, boyut 16 kalır). **Ders**: yeni değişken (`stepNow`) taşınırken eski `let` bildirimi silinmişti — SVG sessizce boş kaldı; Playwright `pageerror` dinle.

**Minik GPT şeması: ◀ Geri düğmesi (#397)**: kullanıcı "ileriye bir de geri ekle, geriye gelebilelim" dedi. `#gm_prev` İleri ▶'nın soluna; bir adım geri (`stepNow-1`), adım 0'da pasif/soluk. Aynı düğmeler tam ekranda da geçerli (aynı DOM taşınıyor). **Ders**: adım adım gezilen her animasyona baştan geri düğmesi koy.

**Minik GPT: "📚 E tablosu" görünümü (#398)**: kullanıcı "E tablosunu da görelim mimaride" dedi (E'nin nasıl oluştuğunu/eğitildiğini sormuştu). Şemanın altında açık `.acc` (`#gmETab`, `drawE`): 40 satır × 16 sütun ısı haritası (mavi +/kırmızı −), satır başına karakter+kimlik, şu anki pencerede kullanılan satırlar sarı çerçeveli, sağda karakterin eğitim metninde kaç kez geçtiği çubuğu (hiç geçmeyen karakterin satırı eğitimde güncellenmez), hover'da satırın ilk 6 sayısı, `Şimdiki E` ↔ `Başlangıç (rastgele)` düğmeleri (`init` E0 kopyasını saklar, `__gptMini.E0`). Her `drawArch`'ta yenilenir. **Ders**: bir tablonun "eğitimle nasıl değiştiği" sözle anlatılınca yetmiyor; önce/sonra düğmesiyle aynı ısı haritasını yan yana göstermek en kısa yol.

**Minik GPT: eğitim + şema + E tablosu tek ekranda (#399)**: kullanıcı "eğitimi başlatıp aşağı kayıyorum, E tablosuna bakıyorum, mimari için tekrar kayıyorum, çok düzensiz" dedi. Üçüncü kart (tohum/+1/+10/+100/eğit/↺, epoch-kayıp, çıktı, skor, kayıp eğrisi) `#gmFull` içine ÜSTE taşındı (`.gm-ctl`, DOM taşıma — id'ler aynı); `#gmFull` gövdesi `.gm-body` flex: solda şema+açıklama (`.gm-sv`), sağda E tablosu paneli (`#gmETab.gm-et`, artık açılır kutu değil) — dar ekranda alta yığılır. `başlangıç` kutusu (`#gm_p2`) her zaman görünür. Tam ekranda kayıp eğrisi/skor gizlenir (yer için), şema yüksekliği `100vh-300px`. **Ders**: birlikte izlenmesi gereken kontrol + görsel + tablo aynı kapsayıcıda, yan yana olmalı; ayrı kartlar kullanıcıyı kaydırmaya zorlar.

**Minik GPT: "✍️ Modele bir başlangıç ver" kutusu da şemanın kutusuna taşındı (#400)**: kullanıcı "şu kısmı da eklesydin" dedi (başlangıç yazısı + üret + örnek düğmeleri `#gt_chips` sayfanın başında kalmıştı). Üç kardeş eleman (başlık, `#gt_p` satırı, `#gt_chips`) `.gm-prompt` sarmalayıcısıyla `#gmFull` içine, eğitim kartının hemen altına taşındı (DOM taşıma, id'ler ve dinleyiciler aynı); araç çubuğundaki yinelenen `başlangıç` kutusu (`#gm_p2`) gizlendi. Ayrıca #399'daki hata düzeltildi: `.gm-fsonly` kuralı yanlışlıkla her zaman görünür yapılmıştı, `✕ Kapat (Esc)` tam ekran dışında da görünüyordu — `.gm-fsonly{display:none}` geri, yalnız tam ekranda görünür. **Ders**: bir CSS kuralını bir eleman için değiştirirken aynı sınıfı kullanan diğer elemanları (kapat düğmesi) da kontrol et.

**Minik GPT: "📍 P tablosu" başlangıç ↔ şimdi ısı haritası (#401)**: kullanıcı "P için de başlangıç/şimdi haritası ekle" dedi (P satırlarının nasıl oluştuğunu sormuştu). E tablosu panelinin altına `#gm_pt` (10×16, `drawP`, `init` P0 kopyasını saklar → `__gptMini.P0`): `Şimdiki P`/`Başlangıç (rastgele)` düğmeleri, son slot (i=9) sarı çerçeveli, sağda satırın başlangıçtan ortalama |değişimi| çubuğu, hover'da satırın ilk 6 sayısı. **Ölçüm notu**: 800 epoch sonrası satır başına ortalama uzaklık 0,29/0,15/0,29/0,14/0,10/0,21/0,26/0,19/0,31/0,13 (i=0..9) — son slot EN ÇOK hareket eden satır DEĞİL (Adam adım boyutunu gradyan büyüklüğüne göre değil lr'ye göre sınırlar, bu yüzden gidilen yol 'gradyan büyük' demek değil). Kullanıcıya "P[9] en güçlü gradyanı alır" demiştim — gradyanın doğrudan olduğu doğru, ama bunu 'en çok değişir' diye okumak yanlış. **Ders**: bir tablonun 'hangi satır ne kadar değişti' ölçüsü Adam ile gradyan şiddetini yansıtmaz; açıklamada ölçülen şeyi (uzaklık) ve çıkarımı ayrı yaz.

## Ekstra ders: "🧭 Transformer Haritası" (`#model-harita`, `harita/*.html`)

Kullanıcı bir hafta boyunca Minik GPT'yi (7+5= → 1) adım adım kavrarken yaptığımız iki haritanın siteye **ayrı bir ekstra ders** olarak girmesini istedi ("ayrı ekstra ders olarak dursun şimdilik"). Kenar çubuğunda GPT Test'in altında `🧭 Transformer Haritası (Ekstra)` (`data-model="harita"`, NODES'ta karşılığı yok → `applyTreeOrder` sona ekliyor, `rail-meta` stili). Ders sayfası bilerek 8 aşamalı şablonun DIŞINDA: iki kart ve iki bağlantı. Haritalar bağımsız, kendi içinde tam sayfalar:
- `harita/adim-adim.html`: sonsuz tuval (tekerlek/sürükle/pinch), 16 adım, her adımda sol ana kart + sağ "takıldığın yer" notları, gerçek sayılarla ısı haritaları.
- `harita/epoch.html`: dikey monitöre uygun tek sütun; 12 ölçüm anı (epoch 0…800), "hâlde mal fiyatlayan tüccar" hikâyesi, geri yayılım ("oynatsam hata ne olur") ve "kulak düğmesi" ölçümleri, **3 tohumla doğrulama** kutusu.
- Kartlar `target="_blank"` bağlantı: sayfalar tekerlekle yakınlaşma kullandığı için iframe'e GÖMÜLMEDİ (tekerlek hem sayfayı kaydırmak hem yakınlaşmak ister).
- **Sayılar sabit bir kayıttır** (tohum 1, `7+5=`); Python/Node betikleriyle gerçek eğitilmiş modelden çıkarılıp HTML'e gömüldü (betikler repoda yok). Kullanıcı sitede kendi eğitimini yapınca birebir aynı sayıları görmeyebilir; derste bu açıkça yazılı.

**Bu çalışmada ölçülen ve eski varsayımları düzelten bulgular (hepsi epoch sayfasında):**
- Dikkat "yavaş yavaş 7 ve 5'e keskinleşmiyor": 7+5 payı başta ≈%20 (10 slottan ikisine tesadüfen düşen pay), 64. güne kadar toplanmıyor (3 tohumda da ≤%27), asıl toplanma 64–256. gün arası. "Önce düşme" tohuma bağlı (tohum 1: 8. ve 64. gün; tohum 2: 16–32; tohum 3: yok).
- 16–64. günde ilk karakter doğruluğu 100 soruda 47 (üç tohumda aynı) = "hep 1 de" stratejisinin skoru; 64. günde p("1")≈%46 ≈ cevapların %45'inin 1 ile başlama oranı.
- Rakam satırlarının E'de birbirine benzerliği (cosine) ≈0,01 → 0,42–0,51 (64. gün), sonra biraz iniyor. 7–5 arası benzerliğin başlangıç düzeyi tohuma göre çok değişiyor (−0,2…0,5): o sayıya değil rakam-kümesi benzerliğine güvenilmeli. Bu, rakamın DEĞERİNİ (7>5) bildiğini göstermez.
- Görmediği 20 toplamda doğru sayısı 800. günde tohum 1/2/3 için **14/12/14** (cevabın tam eşleşmesi kriteriyle). Eski notlardaki 13–16 başka bir kriterle/ayarla ölçülmüştü; farkın nedeni araştırılmadı.
- Geri yayılım: 1. günde soru/etiket defterlerinin (W_Q, W_K) hataya etkisi ≈0,0001 (3 tohum); 64. günde hata düşüşü ≈0,01 (plato); 128–256. günde tezgâh kartlarının (P) etkisi yükseliyor. Tek ayarın etkisi 'Adam'ın adımıyla aynı değil: Adam ilk adımı herkese ≈ lr kadar atıyor (etkisi ≈0 ayarlar da ±0,01 oynar).
- Kulak düğmesi (her slotun skoruna ±0,05, 100 toplamın ilk karakter hatası): net bir "7 ve 5'e kulak ver" işareti HER epoch'ta yok; ortak olan: 128. günde 5'in tezgâhına kulak vermek hatayı artırıyor (3 tohum).
- Süreç dersleri: (1) betik sunucusunu repo dizininden başlat (`cd $SP` sonrası başlatınca 404/null hatası); (2) JS'te `.tk ul li` gibi genel seçici başka kutulara sızdı — liste stilini `.body>ul>li` ile sınırla; (3) "hep 1 diyor" gibi bir cümleyi doğruluk sayısının eşitliğinden çıkarma, tek tek doğrula ya da yumuşat.
- **Tema (#403):** `harita/*.html` ilk sürümde işletim sisteminin temasını izliyordu; açık temalı kullanıcıda beyaz açılıp koyu siteyle uyumsuz kaldı ("arka plan siyah kalsaydı daha iyiydi"). İki sayfanın `<html>` etiketine `data-theme="dark"` eklenerek koyuya SABİTLENDİ (sayfalardaki `:root[data-theme="dark"]` bloğu zaten vardı). Not: Artifact kopyaları hâlâ sistem temasını izliyor; siteye giren sayfalar koyu.


**3. kart: "3B mimari" (`harita/mimari-3b.html`)**: kullanıcı Minik GPT'nin 3B parçalanabilir mimari şemasını (önce Artifact olarak yapıldı) "siteye üçüncü kart olarak ekle" dedi. Bağımsız tam sayfa, yeni sekmede açılır (`#model-harita` kartı 3). three.js siteye vendorlanmış `js/vendor/three-0.128.0.min.js` ile (`../js/vendor/`), koyu tema sabit. İçerik: tekerlekle parçala + imlece yakınlaş (zoom-to-cursor), sağ tuş/Shift+sürükle kaydır, ok tuşları/W-S/A-D klavye, **birden çok mimari aynı anda** (Minik GPT gerçek eğitilmiş sayılarla; GPT-2 ve Llama tarzı **şekilleri gerçek, hücre sayıları rastgele/şematik**), ⚖ Farklar tablosu (sürüklenebilir), gizlenebilir ayar paneli, isteğe bağlı imleç bilgisi. GPT-2/Llama ölçüleri (768/12 kafa/12 blok/124M; 4096/32-8 GQA/32 blok/≈8 milyar, vocab 128.256) hafızadan yazıldı, kaynakla doğrulanmadı. Kaynak şablon/üretici repoda yok (scratchpad); sayfa doğrudan düzenlenebilir tek dosya.

**3B mimari: kafalar ayrı kartlar (#405)**: kullanıcı "12 kafa ayrı ayrı göster" dedi (bir blokta 12 kafa ≠ 12 blok karışıklığı sorulmuştu). GPT-2'de `heads` parçası 12, Llama'da 32 küçük T×T nedensel-maskeli kart (k1…); Llama'da aynı renkli çerçeveli 4 kart aynı K/V grubunu paylaşır (GQA). `kind:'multi'` parça türü, kart içeriği şematik.

**3B mimari: eşleşen parça vurgusu (#405)**: iki/üç mimari açıkken bir parçaya tıklayınca diğer modellerdeki KARŞILIK da sarı vurgulanır, kamera ikisinin ortasına ve aralarındaki mesafeye göre kadrajlanır, bilgi kutusu alta `↔ <model>: <parça>` satırı yazar (karşılığı yoksa "karşılığı yok", ör. Minik GPT'de LayerNorm). Eşleme `EQ` tablosunda (anahtarlar: tok, emb, pos, x, norm1, Wq/Wk/Wv, attn, oproj, res1, norm2, up, act, down, res2, normf, head, logits, next); Minik GPT'nin q/K/V/skor/a/o parçaları GPT-2/Llama'da 'attn' (kafalar) kartına denk gelir. Yeni mimari eklerken her parça id'sini `EQ`'ya ekle.

**3B mimari: eşleşme daha görünür (#406)**: kullanıcı "Minik GPT'de skora tıklayınca GPT-2'de neye karşılık geldiğini göremedim" dedi — etiket rengi tek başına yetmedi (çok kafa kartı gibi parçaların kenarı yok, küçük). Seçili parça ve eşleşenler artık yarı saydam SARI halo kutusu (depthTest kapalı, üst üste çizilir) + seçiliden eşleşenlere SARI kesikli çizgiyle işaretlenir; kamera mesafesi eşleşenler arası uzaklığa göre açılır. **Ders**: bir bağlantıyı göstermek için yalnız etiket vurgusu değil, iki ucu birleştiren görsel (çizgi/halo) kullan.

**3B mimari: tıklayınca zoom ayarı, tek düzlem başlangıç, kaybolma koruması (#407)**: kullanıcı (1) tıklayınca kameranın o parçaya gitmesinden konumunu kaybettiğini ("hem iyi hem kötü, ayarlanabilir olsun"), (2) Minik GPT'nin başlangıçta tek düzlem gelmesini, (3) bazen boş uzayda kaybolduğunu söyledi. Yapılan: `Tıklayınca zoom: kapalı` düğmesi (varsayılan KAPALI — tıklama yalnız halo/bilgi/eşleşme gösterir, kamera oynamaz; açıkken eskisi gibi odaklanır); Minik GPT `mDef=1` ile tek düzlemde açılır (mimariyi yeniden açınca da); kaybolma: kaydırma sahne sınırlarına kıstırılır, uzaklaşma sınırı 6→2,6, 15 karede bir hiçbir parça ekranda değilse (3 kez) otomatik `resetView()`, Sığdır düğmesi ve H/Home tuşu görünümü (zoom, kaydırma, açı) sıfırlar. **Ders**: serbest kamera sunan her sahnede "sahneye dön" kaçış yolu + sınır koruması baştan koy.

**3B mimari: "Aynı iş, farklı yapı" anlatımı (#408)**: kullanıcı eşleşen parçanın işaretlendiğini beğendi ve "Minik GPT'de böyleydi, GPT-2'de skorlar böyle gösteriliyor diye anlatım olsun" dedi. Bilgi kutusunun altına, seçilen parçanın eşleme anahtarına (`p.eq`) göre `CMPTXT[eq][mimari]` tablosundan üç mimarinin tek cümlelik karşılığı yazılır (seçili mimari önce, kapalı mimariler soluk "kapalı"). 20 eşleme anahtarının hepsi 3 mimari için dolu (doğrulandı: eksik parça yok). Yeni parça/mimari eklerken hem `EQ` hem `CMPTXT` güncellenmeli; metindeki GPT-2/Llama sayıları hafızadan.

## Self-Attention → 8 aşamalı şablon (#409) — denetimin 1. adımı

Kullanıcı sitenin şablona/teknoloji haritasına uygunluğunu denetletti; denetim sonucu (şablona uymayanlar: Self-Attention, Multi-Head, Transformer Bloğu; GPT Test yarım; Yol Haritası'nda "Vanishing" düğümü RNN sayfasına gidiyor ve "Modern LLM'ler" düğümü minik GPT Test'e bağlı) onaylandı ve "Self-Attention'dan başla" dendi. Self-Attention düz `.sechead` yapısından 8 aşamaya çevrildi: 1 Giriş (hero SVG: dikkat yayları), 2 Hikâye (Bahdanau 2014 → "Attention Is All You Need" 2017, Vaswani), 3 Gerçek Hayat (5 kart), 4 Nedir (Q/K/V, adım adım, mimari `#atFlow`), 5 Simülasyon (ısı haritası), 6 **Bütün Resim** (yeni, `js/lesson-att-big.js`), Ekstra (self mi çapraz mı, Transformer'ın neresinde, formül özeti), 7 Örnek Çalışmalar (Örnek 1 = eski W eğitimi `#atTrain`, Örnek 2 = yeni √d ölçümü `js/lesson-att-ornek.js`), 8 Test (+2 soru). Mevcut içerik taşındı, id'ler aynı kaldığı için `lesson-att-extra/train` JS'i dokunulmadan çalışıyor.
- **Bütün Resim**: 3 kelime × 2 sayı, W'ler sabit (WQ=[[1,5;−0,8],[0,5;2]], WK=[[1,3;1],[−1;1,8]], WV=[[0,9;0,1],[−0,2;0,6]], çıktı w=(0,7;−0,5)), girdiler/hedef düzenlenebilir. Çıktı katmanı yalnız SON kelimeyi kullanır → q₁,q₂ gradyan almaz, K ve V üç kelimeden toplar (callout + test sorusu). Ağaç: L→y→{w, z₃→{V→W_V, A₃→S₃→{q₃→W_Q, K→W_K}}}, 4 yaprak, 17 pop-up kaynağı (`xtsrc-ab_*`, ileri yol `ab_f_*`), hepsi canlı sayılı türetme + "🔗" köprü. Gradyanlar sonlu farkla doğrulandı (Python |fark|≈4e-11); JS = Python (dW_V, dW_Q, dW_K 4+ hane birebir); 17 pop-up MathJax hatası 0.
- **Örnek 2**: rastgele q + 5 k (LCG, `7+d`), d=4…256, 2000 deneme; ölçeksiz skor yayılımı √d ile büyür (1,65→13,38), d=256'da denemelerin %69'unda %99+ kilitlenme; √d ile yayılım ≈0,84 sabit. JS = Python birebir.
- **Dürüst eksik**: Örnek 1'in (eski W eğitimi) Python kodu kutusu yok (sayfada "Python karşılığı" deniyor ama kod gömülü değil) — istenirse ayrı iş.
- Sıradaki: Multi-Head, sonra Transformer Bloğu (3B mimari kartıyla örtüşmeyi bağla), sonra GPT Test eksik aşamaları ve Yol Haritası düğüm düzeltmeleri.

## Multi-Head → 8 aşamalı şablon (#410) — denetimin 2. adımı

Self-Attention'ın ardından Multi-Head (+ Positional Encoding) 8 aşamaya çevrildi: 1 Giriş (hero: aynı cümlede 3 kafa), 2 Hikâye (Vaswani 2017 → Clark/Voita/Michel 2019 kafa analizleri → PE), 3 Gerçek Hayat (GPT-3 96×96 kafa, BERT 12×12, ViT-B 12, …), 4 Nedir (neden tek kafa yetmez + Concat/W_O), 5 Simülasyon (3 kafa oyuncağı + Positional Encoding ısı haritası), 6 **Bütün Resim** (`js/lesson-mh-big.js`), Ekstra (GQA, RoPE; 3B mimari kartına bağlantı), 7 Örnek Çalışmalar (`js/lesson-mh-ornek.js`), 8 Test (+3 soru). Mevcut içerik taşındı (id'ler aynı: `mhSvg`, `posSvg`).
- **Bütün Resim**: 3 kelime × 4 sayı (d_model=4), 2 kafa, d_k=2; her kafanın KENDİ W_Q/W_K/W_V'si (4×2), çıktı W_O (4→1) yalnız SON kelimeden. Ağaç: L→y→{W_O, c₃→[Concat'in türevi: kopya-kes, ikiye böl]→her kafada {V→W_V, A→S→{q→W_Q, K→W_K}}}, 7 yaprak, 28 pop-up (`xtsrc-mb_*`). Tek-kafalı geri yolu Self-Attention Bütün Resim'inden bilinir, yeni halka yalnız Concat. Python sonlu fark farkı ≈2e-11, JS = Python, MathJax hatası 0.
- **Örnek 1** (pozisyon imzası): aynı W'lerle "kedi kovaladı köpek" / "köpek kovaladı kedi"; imza YOKken her kelimenin çıktısı iki cümlede birebir aynı (fark 0), imzayla 0,43–0,71. **Örnek 2** (sayarak gör): 4·d² ağırlık H'den bağımsız, skor tablosu sayısı H·n². JS = Python.
- **Kullanıcı sorusu**: "Q,K,V aynı boyut mu, bizde q 1×16 idi": gerçek modelde üçü de T×d (kafa başına T×d_k); Minik GPT ve Bütün Resim demolarında q yalnız son konum için kullanılır, bu bir sadeleştirme.
- Sıradaki: Transformer Bloğu (3B mimari kartıyla örtüşmeyi bağla), sonra GPT Test eksik aşamaları ve Yol Haritası düğüm düzeltmeleri.

## Transformer Bloğu → 8 aşamalı şablon (#411) — denetimin 3. adımı

Transformer Bloğu 8 aşamaya çevrildi: 1 Giriş (hero: blok diyagramı, iki kestirme yol), 2 Hikâye (ResNet 2015 → LayerNorm 2016 → Transformer 2017 "Add & Norm" + FFN → GPT-2 pre-LN, Xiong 2020), 3 Gerçek Hayat (GPT-3 96, BERT 12/24, Llama-3 8B 32, ViT-B 12, orijinal 6+6), 4 Nedir (residual, LayerNorm, FFN, tam blok diyagramı), 5 Simülasyon (mevcut residual kaydırıcısı `blkN` taşındı + yeni LayerNorm hesap makinesi `#tfLnSim`), 6 **Bütün Resim** (`js/lesson-tf-big.js`), Ekstra (Post-LN/Pre-LN, decoder, RMSNorm/SwiGLU/paylaşım), 7 Örnek Çalışmalar (`js/lesson-tf-ornek.js`), 8 Test (+3 soru).
- **Bütün Resim**: TEK blok, 3 kelime × 4 sayı, tek kafa, FFN 4→6→4 ReLU, γ=1 β=0, çıktı yalnız son kelimeden. İleri: attention·W_O → +X → LayerNorm → FFN → +n₁ → LayerNorm. Geri ağaç 9 yaprak (w, W₂, b₂, W₁, b₁, W_O, W_V, W_Q, W_K), 29 pop-up (`xtsrc-tb_*`). **İki yeni halka**: LayerNorm'un türevi (dn − ort(dn) − n̂·ort(dn·n̂))/σ ve residual'da **iki yoldan toplama** (n₁'in gradyanı = kestirme dr₂ + FFN yolu du·W₁ᵀ). Attention içi özetlendi (Self-Attention Bütün Resim'ine atıf). Sonlu fark |fark|≈7e-10; JS = Python. d=2 ile LayerNorm anlamsız (çıktı hep ±1) olduğu için d=4 seçildi.
- **Örnek 1** (ölçerek): 8 boyutlu N katmanlı rastgele ağda girişe ulaşan gradyan/çıkıştaki: residual YOK 50 katmanda 4,9·10⁻⁵, VAR 59 (dürüst not: bu oyuncakta residual gradyanı biraz da BÜYÜTÜYOR; gerçekte LayerNorm + küçük başlangıç dengeler). **Örnek 2** (sayarak): GPT-2 ağırlıklarını katman katman say; small 124.439.808, medium 354.823.168, large 774.030.080, XL 1.557.611.200, hepsi bilinen resmî sayılarla aynı (ağırlık paylaşımı yüzünden çıkış tablosu ayrıca sayılmaz). JS = Python.
- Denetim sonucu kalan: GPT Test eksik aşamaları (Hikâye, Gerçek Hayat, Bütün Resim, Örnek Çalışmalar) ve Yol Haritası düğüm düzeltmeleri ("Vanishing" düğümü RNN sayfasına gidiyor; "Modern LLM'ler" düğümü GPT Test'e bağlı). Self-Attention Örnek 1'in Python kod kutusu da eksik.

## GPT Test → 8 aşamalı şablon (#412) — denetimin 4. adımı

GPT Test yarım şablondaydı (Hikâye, Gerçek Hayat, Bütün Resim, Örnek Çalışmalar yok; eski not "bilerek yok" diyordu, kullanıcı "GPT Test'ten başla" deyince tamamlandı). Eklenenler: 2 Hikâye (Markov 1913 → Shannon 1948 → Bengio 2003 → Transformer/GPT 2017-2022; ortak fikir "metin kendi etiketini verir"), 3 Gerçek Hayat (5 kart), 6 **Bütün Resim**, 7 **Örnek Çalışmalar**, 8 Test (+2 soru). Mevcut Giriş/Nedir/Simülasyon/Ekstra aynen.
- **Ortak minik model** `js/lesson-gpt-tiny.js` (`window.GPTTiny`): 7 karakterlik sözlük (`1 2 3 4 + = .`), pencere 4, kart 2 sayı, ara katman 6 (tanh), softmax; LCG başlangıç (`seed 1, ölçek 0,5`), düz gradyan inişi lr 1,0. Bütün Resim ve Örnek 1 bunu paylaşır. Python'da `sum()` yerine açık döngü kullanıldı (Python 3.12 `sum` telafili toplar, float paritesini bozabilir).
- **Bütün Resim** (`js/lesson-gpt-big.js`): bir eğitim adımı — pencere → E tablosundan 4 kart → ara katman → 7 skor → softmax → L=−ln p(y); geri ağaç L→z (p−y)→{W_o, b_o, h→u→{W_h, b_h, x→E}}, 5 ağırlık grubu, 15 pop-up (`xtsrc-gt_*`). Pencere ve doğru karakter seçilebilir, ağırlıklar "rastgele" / "eğitilmiş (3000 epoch)". Bulgu: **E tablosunda yalnız penceredeki karakterlerin satırları gradyan alır** (tekrarlayan karakterin payları toplanır). Sonlu fark |fark|≈2e-10; JS = Python (ilk adım p('3')=0,1476, L=1,9134).
- **Örnek 1** (`js/lesson-gpt-ornek.js`): dört toplama satırı, 3000 epoch, kayıp 1,922 → 0,232 (taban 0,23: "1+" sonrası 1 mi 2 mi belirsiz); dört toplamı %99,7+ doğru; E tablosu 2B dağılımı canlı; "✍️ üret" 1+2= → 3.; "2+1=3." satırı çıkarılırsa model "2" der (%90,6, p('3')=0,000): ezber ↔ genelleme. JS = Python.
- Denetimden kalan: Yol Haritası düğümleri ("Vanishing" düğümü RNN sayfasına gidiyor; "Modern LLM'ler" düğümü GPT Test'e bağlı) ve Self-Attention Örnek 1'in Python kodu kutusu.

## Yol Haritası düzeltmeleri (#413) — denetimin son adımı

Denetim bulguları ve çözümleri: (1) **"📉 Vanishing / Exploding" düğümü** `tab:'rnn'` ile RNN sayfasının başına gidiyordu (ayrı ders yok, düğüm yalnız kavramsal durak ve `lstm`'in önkoşulu). Karar: düğüm KALIR (RNN → Vanishing → LSTM hikâyesi ve kilit zinciri bozulmasın), ama dürüst hâle getirildi: yeni düğüm alanları `gostage:'x'` + `golabel` — "Sayfada aç" düğmesi artık `RNN dersinde ilgili bölüme git →` yazar, dersi açar, `.tpl-cl[data-stage="x"]` (Ekstra) aşamasını açıp kaydırır (`js/app.js` data-go dinleyicisi, genel mekanizma: başka düğümler de `gostage` alabilir). Düğümün alt başlıkları ("0.5²⁰ vs 1.5²⁰ sezgisi", "Gradient clipping") sayfada gerçekten yoktu/yalnız adı geçiyordu → RNN Ekstra'ya iki canlı mini-demo eklendi (`js/lesson-rnn-van.js`): **r^T sezgisi** (0,5²⁰=9,54·10⁻⁷, 1,5²⁰=3325,26; r ve T kaydırıcı, "söndü/patladı/dengeli" yorumu) ve **gradient clipping** (g·min(1,c/‖g‖), 2B ok çizimi, yönü korur). Not: `NODES.find(n=>n.tab===m)` aynı sekmeli iki düğümde İLK bulunanı döndürür (rnn), bu yüzden 'van' kenar çubuğu durumunda hiç görünmez, yalnız ağaçta. (2) **"Modern LLM'ler (GPT)" düğümü** GPT Test'e bağlıydı ama sayfa minik karakter modeliydi → ad "🤖 GPT ve Modern LLM'ler" ve açıklama sayfanın gerçek içeriğini (minik GPT → GPT-2/Llama, 3B mimari kartı) anlatacak şekilde güncellendi. (3) Kenar çubuğu sıralama yorumundaki "şu an yok" düzeltildi (🧭 Transformer Haritası zaten düğümsüz ekstra).
- **Site denetimi bitti**: 9 ders + GPT Test 8 aşamalı şablonda (Seq2Seq/Vektör'de Bütün Resim bilerek yok); açık küçük eksik: Self-Attention Örnek 1'in (W eğitimi) Python kodu kutusu.

**Self-Attention Örnek 1'e Python kodu eklendi (#414)**: `js/lesson-att-train.js`'in kütüphanesiz Python karşılığı (yorumlu; aynı LCG başlangıç, 115/29 bölünmesi, tam yığın Adam lr 0,05, W_Q/W_K/W_V/W_O/bO) Örnek 1'in altına kapalı `.acc` olarak gömüldü; çıktısı yorum olarak gömülü: tohum 1 → dikkat payı 0,985, tohum 3 → 0,692, ikisinde eğitim ve sınav doğruluğu %100, kayıp ≈10⁻⁶. **JS = Python** (kayıp 5 haneye, doğruluk ve dikkat payı 3 haneye aynı). Bununla denetimdeki son açık eksik kapandı. (Python'da `sum()` yerine açık döngü: 3.12'nin telafili `sum`'ı JS paritesini bozabilir.)

## 3B mimari: "🎬 Eş zamanlı gezi" (#415)

Kullanıcı Minik GPT ile GPT-2 arasındaki farkı anlamak için "iki mimariyi eş zamanlı, adım adım gezelim; bu adımda burada bu oluyorken GPT-2'de şu oluyor diye anlat" dedi (özellikle "token sistemi nasıl?"). `harita/mimari-3b.html`'e `#bt` düğmesiyle açılan gezi: 11 adım (Girdi/token → Kimlik kartı → Konum → Toplama+normalizasyon → Q,K,V → Dikkat → Karışım+residual → FFN → Blok sonu → Çıkış tablosu → Sonraki parça). Her adımda aktif mimarilerin ilgili parçaları (adım başına mimari bazlı `ids`) sarı halo alır, kamera bu parçaların ortasına kadrajlanır (`tourOn`/`tourParts`, tıklayınca-zoom ayarından bağımsız), solda sürüklenebilir panel her mimari için tek paragraf anlatım + "🔍 Fark" satırı gösterir; ◀ İleri ▶, ▶▶ Otomatik (6,5 sn), noktalarla atlama. Gezi başlayınca alt ayar paneli otomatik gizlenir (kamera alanı), bitince geri gelir; yalnız bir mimari açıksa GPT-2 otomatik eklenir; Llama da eklenirse üç sütun. **Token anlatımı** (adım 1): BPE = başta her harf ayrı, en sık yan yana gelen iki parça birleştirilip yeni parça yapılır, on binlerce kez tekrar; "gördüm" → "gör"+"dü"+"m"; sözlük 50.257 / 128.256; dolgu yok, T=token sayısı. Çizimdeki token'lar uydurma (sayfada belirtildi); GPT-2/Llama sayıları hafızadan. Yeni mimari eklerken `TOUR[].ids` ve `txt`'ye de eklenmeli.

## 3B mimari: gezide istem seçeneği — "7+5=" / "hayatın anlamı nedir" (#416)

Kullanıcı "eş zamanlı gezintiyi 7+5= için ve hayatın anlamı nedir için anlat" dedi. `#tour` panelinin üstüne **İstem** düğmeleri (`data-pk` A/B); `setPrompt(k)` `D`'yi (artık `let`) `DA`/`DBF` ile değiştirir, `buildMini()` (Minik GPT parçalarını üreten, eskiden üst düzey kod) yeniden çalışır ve mevcut parçaların doku/`desc`/`nums`'ı + girdi küpleri yerinde güncellenir (`p.fm`, `p.cfm/ced`). Gezi kapanınca istem A'ya döner. **Minik GPT**: "hayatın anlamı nedir" 20 karakter, pencere 10 → yalnız SON 10 ("lamı nedir") görülür; ağırlıklar/eşikler (b1,b2,b_out) kayıtlı anlık görüntüden türetildi (A için parite ≈0,04 yuvarlama farkı), B: dikkat "m" %68, "e" %16; çıktı "e" ≈%100 — eğitim metninde böyle soru yok, "güven ≠ doğruluk" notu. **GPT-2**: gerçek token'lar `gpt-3-encoder` ile ölçüldü (7+5= → 22,10,20,28; hayatın anlamı nedir → 11 token, "ı"=30102 ayrı). Gerçek GPT-2'nin cevabı ve Llama token sayıları ÖLÇÜLMEDİ; sonraki-token kartı "?" ve metinler "ölçmedik" diyor. `TOUR`/`CMPTXT` değerleri artık fonksiyon olabilir (`fv()`); yeni prompt-bağımlı metin ekleyince fonksiyon yaz. **Ders**: sabit "örnek" token/çıktı çizimi (eski "␣uyu %41") istemle tutarsız kalır — ölçmediğin şeyi "?" ile göster.

**Gezide her adıma "📐 şekil/işlem" satırı (#417)**: kullanıcı "her adımda 7+5= için yapılan işlemleri anlat, GPT-2'de x nasıl dağılıyor, 4×768 mi" dedi. `SHP[adım]={mini,gpt2}` (fonksiyon) her mimari satırının altına kısa `.sh` satırı yazar: Minik GPT sabit 10×16 / 1×16 / 10×16; GPT-2 istemin token sayısına göre T×768 (7+5= → 4×768 = 3.072 sayı; hayatın anlamı nedir → 11×768), Q/K/V kafa başına T×64, skor T(T+1)/2×12 kafa, FFN T×3072, çıkış T×50.257 (yalnız son satır kullanılır). Llama için yok (token sayısı ölçülmedi). **Ders**: "nasıl dağılıyor" sorusunun cevabı sözcük değil matris şeklidir; her adımda giriş→çıkış şeklini sayıyla yaz.

**3B mimari: "🔬 Kafanın içine gir" (#418)**: kullanıcı GPT-2'de kafa boyutlarını soruyordu (4×192? 4×256? "3 tane 4×768 = 3 kafa mı?") ve "kafaya zoom yapılıp içi görülsün" dedi. Doğru resim: Q, K, V üç AYRI 4×768 tablodur (kafa değil); her biri SÜTUNLARDAN 12 dilime (768/12=64) bölünür; kafa k = üçünün k. dilimi (4×64 ×3 = 4×192 toplam girdi), skor 4×4, çıkış 4×64, 12 çıkış yan yana → 4×768 → W_O. "Heads" kartı seçilince bilgi kutusunda düğme (`#hgob`; kart başına `userData.head`, `lastHead`) → `#hin` tam panel: 1 ağırlık dilimleri (sarı bant), 2 Q/K/V = x·dilim, 3 skor + maske, 4 softmax tablosu, 5 çıkış, 6 12 kafa yan yana; ◀ İleri ▶ adım adım, ◀ kafa ▶ ile kafa değişir, Esc kapatır. Şekiller gerçek (GPT-2 T×768/T×64/T×T, T istemden; Llama 32 kafa, dk=128, K/V 8 grup), renk/sayılar şematik (rastgele, panelde yazılı). Llama'da T bilinmediği için çizimde 6. **Ders**: "kafa" sorusunda üç matrisi (Q,K,V) kafayla karıştırmak yaygın; anlatırken önce bölmenin ekseni (sütun) ve sonra "kafa = üç dilim" söylenmeli.

**3B mimari: GPT-2/Llama'ya Q, K, V tabloları çizildi + "12 kafa" kartı yeniden adlandırıldı (#419)**: kullanıcı yarım saat "12 kafa kartı = Q, K, V" sandığını, oysa o kartların **skor tabloları (T×T)** olduğunu söyledi ("niye en baştan çizmedin"). Minik GPT'de q/K/V ayrı kutuydu, GPT-2/Llama'da yoktu (hesap "heads" kartının arkasında gizliydi). Şimdi GPT-2'de `qT/kT/vT` (T×768; 7+5= → 4×768), Llama'da Q T×4096, K/V T×1024 kutuları W'lerle kafa kartı arasında; kafa kartı "Kafaların SKOR tabloları" (açıklama: "bu kartlar Q,K,V DEĞİL"). `EQ`'da yeni anahtarlar `qt/kt/vt` (Minik GPT q/K/V artık bunlarla eşleşir, `attn` yalnız skor/dikkat/o ↔ heads), `CMPTXT`'e 3 giriş, gezi adım 5 yeni parçaları vurgular, blok sütun aralıkları kaydırıldı (GPT-2 [4,14], Llama [3,14]). **Ders**: bir mimari karşılaştırmasında bir tarafta çizilen HER ara tablo diğer tarafta da çizilmeli — "içinde gizli" tablo, okuyucuda yanlış eşleme (kafa = Q/K/V) yaratıyor; yeni parça eklerken sütun indeksine bağlı sabitleri (`blocks`) kaydır.

**Kafa içi panelinin başına "📘 Özet" kutusu (#420)**: kullanıcı kavrama sürecinde söylediği DOĞRU cümleleri ("Q,K,V üç tablo; sütunlardan 12 dilim; kafa = üç 4×64; skor = Qᵢ·Kᵢᵀ → 4×4; üst üçgen kapalı; 12 çıkış yan yana") "siteye bilgi olarak ekle" dedi. `#hin` panelinde açık `<details class="sm">`: 6 madde (gerçek şekiller, T istemden) + ✔/✗ alt-üçgen maske tablosu (`table.tri`) + Llama'da K/V GQA notu; `index.html` 3B kart listesine bilgi satırı. **Ders**: kullanıcının kendi doğru çıkarımları (özellikle yanlış anlamalardan sonra oturanlar) en iyi ders metnidir — aynı sırayla, aynı sayılarla yaz.

**Gezide her adıma "💬 sözel" satır (#421)**: kullanıcı "karşılaştırmalarda hâlâ yetersiz bilgi var, bizimki ne bilgisi veriyordu, GPT-2 ne veriyor; anlatımda sadece sayı var, biraz sözel ekle" dedi. `SOZ[adım]={mini,gpt2}` (fonksiyon, istem-duyarlı) her mimari satırında 📐 şekil satırının ÜSTÜNE sarı kenarlı `.sz` satırı yazar: ne iş yapıldığı düz dille ("kimlik kartı = harfin ne olduğu", "yer kartı = kaçıncı kutuda", "soru/etiket/bilgi", "bakılan kutulardan karışım", "düşünme katmanı", "puan → seçim → ekle → tekrar"). Minik GPT cümleleri GERÇEK sayıları kullanır (en çok bakılan iki harf ve yüzdeleri, seçilen harf); GPT-2 cümleleri mekanizmayı anlatır, ölçülmeyen şeyler (hangi kafa neye bakıyor, FFN ne yapıyor, gerçek cevap) açıkça "ölçmedik" der. **Ders**: "sadece sayı var" geri bildirimi şekil satırından sonra bile geldi — her adımda üç katman gerekir: ne oluyor (sözel), hangi şekiller (sayı), ne fark var; sayıları sözelin yerine koyma.

## GPT-2 adım adım haritası (#422) — `harita/gpt2-adim-adim.html`

Kullanıcı "şu adım adım haritayı GPT-2 için yapabilir misin, hesap gücümüz yok ama hangi adımda ne olduğunu biliyorsundur" dedi. `harita/adim-adim.html`'in tuval motoru/CSS'i/ısı haritası yardımcıları kopyalanıp **17 adımlık** yeni sayfa kuruldu (Minik GPT'nin haritasıyla aynı iskelet: ana anlatım solda, "Minik GPT'de nasıldı?" + "Takıldığın yer" notları sağda): büyük resim, metin→token (7+5= → **22,10,20,28**, `gpt-3-encoder` ile ölçülmüş), wte 50.257×768, wpe 1.024×768, x=wte+wpe (ana akım), LayerNorm (pre-LN; Minik'te yoktu), Q/K/V üç 4×768 tablo (kodda fused 768×2304 notu), 12 kafaya sütun dilimleme (36 tablo), 4×4 skor+nedensel maske+softmax (16 hücrenin 10'u geçerli), a·V→yapıştır→W_O→residual, LN+FFN 768→3072→768 (GELU), 12 blok, son LN + wte devriği (1×50.257), seçim yöntemleri (greedy/sıcaklık/top-k), üretim döngüsü + KV önbelleği, eğitim (her konumda tahmin), ağırlık sayımı. Sayım koddan hesaplanır ve resmî **124.439.808** ile eşleşmezse `console.warn` verir (doğrulandı: blok 7.087.872, wte 38.597.376, wpe 786.432).
**Dürüst sınır (sayfada yazıyor)**: GPT-2 ağırlıkları yok → renkli hücreler şematik (tohumlu rastgele), skor tablosu örnek sayılarla ama maske/softmax işlemi gerçek; gerçek GPT-2'nin "7+5=" cevabı, hangi kafanın neye baktığı, katmanların ne öğrendiği **ölçülmedi** ("ölçmedik" diye yazılı); WebText (~8 milyon sayfa, ~40 GB) ve sözlük 50.257 = 256+50.000+1 hafızadan. `index.html` Transformer Haritası'na 4. kart eklendi.
**Ders**: ölçemediğin modeli anlatırken şekil/işlem (kesin) ile değer/davranış (bilinmiyor) ayrımını her sayfada baştan söyle; uydurma olasılıkları "gerçek" gibi gösterme (çıkış puanları "aday 1…8" olarak etiketlendi).

**3B mimari: GPT-2 token/wte kartlarına sade açıklama (#423)**: kullanıcı GPT-2'yi mimariden takip ederek baştan konuşmaya başladı ("kısa soru-cevap gidelim") ve her bölüm bitince konuşmada öğrendiklerinin ilgili 3B kartına eklenmesini istedi. Token kartına "token = karakter değil, sık harf grubu; 7+5= tam 4 token (22,10,20,28 ölçüldü); boşluk numarayı değiştirir", `wte` kartına "wte = word token embedding; 50.257 satır = 50.257 TOKEN (~50.000 kelime/parça + 256 bayt + 1 özel işaret); numara = okunacak satır" eklendi. **Ders**: sayfada kısaltmayı (wte) hiç açmamıştık — yeni terim kullanırken ilk geçtiği yerde açılımını yaz; kullanıcı bu tür eksikleri konuşma sonunda toplu eklememi istedi (wpe, vb. sırada).

**3B mimari: bölüm çerçeveleri + "📦 Taşıdığı bilgi" (#424)**: kullanıcı GPT-2'yi konuşarak takip ederken "embedding neresi, positional encoding nerede, hangi parçaları içeriyor, taşıdığı bilgi ne ifade ediyor mimaride görünsün; bütün mimari için devamında da yapılsın" dedi. `harita/mimari-3b.html`: her mimariye `groups` (GRPS tablosu: `cols:[ilk,son]` sütun aralığı, `pm` dolgu çarpanı, `bottom` etiketi alta) → renkli `LineSegments` çerçeve + tıklanır etiket (`.lb.gl`, `showGroup`), her karede parçaların gerçek konumundan hesaplanır (blok çerçevesiyle aynı yöntem). Şimdilik yalnız GİRİŞ tarafı: Tokenizer (gri), Embedding katmanı (mavi: wte+wpe+x), Positional encoding (mor: wpe); Llama'da konum çerçevesi yok (RoPE sonra). Her parçaya `carry` (CARRY tablosu, anahtar `mini|gpt2|llama`) → bilgi kutusunda "📦 Taşıdığı bilgi". Wte/wpe etiketleri "50.257×768 → T satır" / "1024×768 → ilk T satır" (satır seçme açıkça yazıldı, hesap değil). **Sonraki bölümler (LayerNorm, attention, FFN…) konuşma ilerledikçe aynı `GRPS`/`CARRY` tablolarına eklenecek.** **Ders**: tabloda mimari anahtarı `A.key` ('mini'|'gpt2'|'llama'), parça-kimlik önekiyle (g2/ll) karıştırma — ilk yazımda yanlış anahtar yüzünden yalnız Minik GPT çerçeve aldı, sayıyı (8 etiket) kontrol ederek yakalandı.

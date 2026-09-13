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

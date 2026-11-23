/* Fizik — Evrenin zaman çizelgesi (yol haritası).
   Büyük Patlama'dan bugüne genişleyen bir koni; her dönem bir dilim (elips) + kısa anlatım + o dönemin dersleri.
   Altta seçili dönemin ayrıntılı anlatımı. Alet çantası (temel fizik araçları) ayrı bir rafta.
   İlerleme: eski ağaçla aynı localStorage anahtarı (fz_tt_done_v1). Eski ağaç "🌳 Ders ağacı" görünümünde duruyor. */
(function(){
const KD='fz_tt_done_v1';
const rd=()=>{try{return new Set(JSON.parse(localStorage.getItem(KD)||'[]'))}catch(e){return new Set()}};
const wr=s=>{try{localStorage.setItem(KD,JSON.stringify([...s]))}catch(e){}};
let refresh=()=>{};
window.__ttDone=id=>rd().has(id);
window.__ttMark=function(id){const s=rd();s.has(id)?s.delete(id):s.add(id);wr(s);refresh();return s.has(id)};

const TOOLS={
 newton:['Kütleçekim yapıyı kurar: kozmik ağ, yıldızlar, galaksiler, gezegen yörüngeleri.'],
 enerji:['E = mc², bağlanma enerjisi, füzyon: her dönemde enerji bir biçimden ötekine geçer.'],
 em:['Atomları ve kimyayı bir arada tutan kuvvet; ilk ışığın kaynağı.'],
 isik:['Uzayın genişlemesi, kırmızıya kayma ve geçmişe bakmak: uzaktan gelen her bilgi ışıkla gelir.'],
 kuant:['Parçacıklar, alanlar ve dalgalanmalar: evrenin ilk saniyesi baştan sona kuantum.']
};

/* Dönemler. t: etiket, T: sıcaklık, z: kırmızıya kayma, a: evrenin bugüne göre boyutu (kabaca 2,725 K / T),
   sec: kozmik takvim için temsilî an (saniye). Sayılar yaklaşık; kaynaklar hafızadan (sayfada not var). */
const Y=31557600;
const EP=[
{id:'planck',ic:'✨',nm:'Planck çağı',t:'0 – 10⁻⁴³ sn',T:'> 10³² K',z:'—',a:'bilinmiyor',col:'#fff3d6',art:'foam',sec:1e-43,
 short:'Bildiğimiz fizik burada susuyor: dört kuvvetin tek olduğu düşünülen, uzayın ve zamanın bile bulanıklaştığı an.',
 what:['Büyük Patlama bir noktada patlayan bir bomba değil; uzayın kendisinin her yerde aynı anda genişlemeye başlamasıdır. Saati geriye sararsak her şey giderek sıkışır ve ısınır. 10⁻⁴³ saniyeden (Planck zamanı) öncesine gelince kütleçekimin kuantum etkileri o kadar güçlenir ki genel görelilik ile kuantum mekaniği aynı anda geçerli olmak zorunda kalır. İkisini birleştiren, deneyle sınanmış bir kuram (kuantum kütleçekimi) henüz yok.',
  'Bu yüzden bu dönem için söylenebilecekler kısa: uzunluklar Planck uzunluğuna (≈1,6×10⁻³⁵ m) yaklaşır, sıcaklık Planck sıcaklığına (≈1,4×10³² K) çıkar. Dört temel kuvvetin (kütleçekim, güçlü, zayıf, elektromanyetik) burada tek bir kuvvet olduğu düşünülür; bu bir öngörü, gözlem değil.'],
 formed:['Henüz parçacık yok; "uzay-zaman köpüğü" denen kuantum dalgalanmaları (kuramsal)'],
 evid:'Doğrudan kanıt yok. Bu dönem, bilinen yasaları geriye uzatınca vardığımız sınır. Sicim kuramı ve döngü kuantum kütleçekimi gibi adaylar burayı açıklamaya çalışıyor.',
 note:'Tamamen kuramsal. "Büyük Patlama\'dan önce ne vardı?" sorusunun bugün kabul görmüş bir cevabı yok.',
 lessons:['planck'],tools:['kuant','isik']},
{id:'enfl',ic:'🎈',nm:'Büyük birleşme ve enflasyon',t:'10⁻³⁶ – 10⁻³² sn',T:'≈ 10²⁸ → 10²⁷ K',z:'—',a:'en az 10²⁶ kat büyüyor',col:'#fff0a0',art:'infl',sec:1e-34,
 short:'Önce kütleçekim, sonra güçlü kuvvet ayrılır. Ardından uzay, saniyenin çok küçük bir kesrinde en az 10²⁶ kat büyür.',
 what:['Evren soğudukça önce kütleçekimin, yaklaşık 10⁻³⁶ saniyede de güçlü kuvvetin ayrıldığı düşünülür (büyük birleşme kuramları, GUT). Elektromanyetik ve zayıf kuvvet ise hâlâ tek bir "elektrozayıf" kuvvettir.',
  'Enflasyon kuramına göre bu sırada uzay inanılmaz hızla genişler: yaklaşık 10⁻³⁶ ile 10⁻³² saniye arasında boyutlar en az 10²⁶ kat (yaklaşık e⁶⁰) büyür. Bir protondan küçük bir bölge bir greyfurttan büyük hâle gelir. Bu genişleme ışık hızı sınırını çiğnemez: hareket eden bir şey yoktur, uzayın kendisi büyür.',
  'Enflasyon üç bilmeceyi birden çözer: evren neden her yönde aynı sıcaklıkta (ufuk sorunu), neden neredeyse tam düz (düzlük sorunu) ve galaksilerin tohumları nereden geldi. Cevap: minicik kuantum dalgalanmaları enflasyonla devasa boyutlara gerilir; bugünkü galaksi kümeleri o dalgalanmaların büyümüş hâlidir. Enflasyon bitince alanın enerjisi sıcak bir parçacık çorbasına dönüşür ("yeniden ısınma").'],
 formed:['Ayrışan kuvvetler: önce kütleçekim, sonra güçlü kuvvet','Yoğunluk dalgalanmaları (galaksilerin tohumu)','Enflasyonun sonunda sıcak parçacık çorbası'],
 evid:'Kozmik mikrodalga artalandaki (CMB) sıcaklık farkları yaklaşık 100.000\'de 1 düzeyinde ve kuramın öngördüğü gibi neredeyse ölçekten bağımsız. Evrenin uzamsal düzlüğü de ölçülüyor. Enflasyonun "imzası" sayılan kütleçekim dalgaları (CMB\'de B-modu) ise henüz bulunamadı.',
 note:'Güçlü dolaylı kanıtları olan ama doğrudan doğrulanmamış bir kuram. Süre ve büyüme oranı modele göre değişir.',
 lessons:['kuvvet','enflasyon'],tools:['kuant','isik','enerji']},
{id:'ew',ic:'⛰️',nm:'Elektrozayıf çağ ve Higgs',t:'≈ 10⁻¹² sn',T:'≈ 10¹⁵ K',z:'≈ 10¹⁵',a:'≈ 10¹⁵\'te biri',col:'#ffd166',art:'higgs',sec:1e-12,
 short:'Higgs alanı "açılır": W ve Z parçacıkları kütle kazanır, elektromanyetik ile zayıf kuvvet ayrılır. Maddenin karşıt maddeye olan küçük üstünlüğü de bu dönemlerde doğmuş olmalı.',
 what:['Yaklaşık 10⁻¹² saniyede sıcaklık 10¹⁵ K civarına (parçacık enerjisi ≈100 GeV) düşer. Bu noktada Higgs alanı her yerde sıfırdan farklı bir değere oturur. Bu alanla etkileşen parçacıklar (W ve Z bozonları, elektron, kuarklar) kütle kazanır; foton etkileşmediği için kütlesiz kalır. Böylece tek "elektrozayıf" kuvvet, bildiğimiz elektromanyetik ve zayıf kuvvete ayrılır.',
  'Büyük bir soru da buraya yakın bir yerde çözülmüş olmalı: madde ile karşıt madde eşit miktarda oluşsaydı birbirlerini yok edip geride yalnız ışık bırakırlardı. Bugün var olduğumuza göre, yaklaşık her 1 milyar karşıt madde parçacığına karşılık 1 milyar + 1 madde parçacığı olmalı. Bu küçük fazlalığın nasıl oluştuğu (baryogenez) hâlâ açık bir soru; zamanlaması da kesin değil.'],
 formed:['Kütleli W ve Z bozonları; kütle kazanan temel parçacıklar','Ayrı elektromanyetik ve zayıf kuvvet','Maddenin küçük fazlalığı (≈1 / 10⁹)'],
 evid:'Higgs bozonu 2012\'de CERN\'deki Büyük Hadron Çarpıştırıcısı\'nda (≈125 GeV) bulundu; W ve Z bozonları 1983\'te bulunmuştu. Madde fazlalığının oranı CMB\'den ve ilk çekirdeklerin miktarından ölçülüyor.',
 note:'Higgs mekanizması deneyle doğrulandı; madde fazlalığının kaynağı bilinmiyor.',
 lessons:['higgs','madde'],tools:['kuant','enerji']},
{id:'qh',ic:'🔴',nm:'Kuark çorbasından proton ve nötrona',t:'10⁻¹² → 10⁻⁵ sn',T:'≈ 2×10¹² K',z:'≈ 10¹²',a:'≈ 10¹²\'de biri',col:'#ff9f43',art:'qgp',sec:1e-5,
 short:'Kuarklar ve gluonlar serbestçe dolaşan bir plazma oluşturur. Sıcaklık ≈2×10¹² K\'nin altına inince kuarklar üçerli gruplar hâlinde proton ve nötronlara hapsolur.',
 what:['Higgs\'ten sonra evren bir "kuark-gluon plazması"dır: kuarklar ve onları bağlayan gluonlar, bugünkü gibi parçacıkların içine kapanmadan, sıcak bir sıvı gibi her yerdedir. Güçlü kuvvetin garip bir özelliği var: kuarkları birbirinden uzaklaştırdıkça çekim zayıflamaz, güçlenir. Bu yüzden normal koşullarda tek başına bir kuark asla görülmez.',
  'Yaklaşık 10⁻⁵ saniyede sıcaklık ≈2×10¹² K\'ye (≈150–170 MeV) düşünce kuarklar üçlü gruplar (baryonlar: proton = uud, nötron = udd) ve ikili gruplar (mezonlar) hâlinde hapsolur. Protonun kütlesinin çok küçük bir kısmı kuarkların kendi kütlesinden gelir; geri kalanı içerideki hareketin ve bağın enerjisidir (E = mc²).',
  'Bu sırada proton ve nötronlar sürekli birbirine dönüşür, sayıları neredeyse eşittir. Karşıt protonlar ve karşıt nötronlar da madde karşılıklarıyla karşılaşıp yok olur; madde fazlalığı sayesinde geride az da olsa proton ve nötron kalır.'],
 formed:['Protonlar ve nötronlar (baryonlar)','Pion gibi kısa ömürlü mezonlar'],
 evid:'Kuark-gluon plazması laboratuvarda yeniden üretildi: ABD\'deki RHIC (2005 civarı) ve CERN\'deki LHC\'de ağır çekirdekler çarpıştırılıyor; plazma neredeyse sürtünmesiz bir sıvı gibi davranıyor.',
 note:'Geçiş sıcaklığı kuramsal hesaplardan (lattice QCD); zaman bunun yaklaşık karşılığı.',
 lessons:['kuark','hadron'],tools:['kuant','enerji']},
{id:'nu',ic:'👻',nm:'Nötrinolar kopuyor',t:'≈ 1 sn',T:'≈ 10¹⁰ K',z:'≈ 10¹⁰',a:'≈ 10¹⁰\'da biri',col:'#ff7a5c',art:'nu',sec:1,
 short:'Nötrinolar madde ile etkileşmeyi bırakıp serbestçe uçmaya başlar. Proton/nötron oranı yaklaşık 6\'ya 1\'de donar; elektronlar ve pozitronlar birbirini yok eder.',
 what:['Bir saniye civarında sıcaklık ≈10¹⁰ K\'ye (≈1 MeV) düşer. Nötrinolar yalnız zayıf kuvvetle etkileşir; evren seyreldikçe çarpışmalar o kadar azalır ki nötrinolar "kopar": o andan sonra neredeyse hiçbir şeye çarpmadan bugüne kadar uçarlar. Bu kozmik nötrino artalanının bugün ≈1,95 K sıcaklığında olması gerekir.',
  'Nötronu protona, protonu nötrona çeviren tepkimeler de zayıf kuvvete dayanır; onlar da yavaşlar. Nötron biraz daha ağır olduğu için (≈1,29 MeV) sayısı protona göre azalır ve oran yaklaşık 1/6\'da kalır. Serbest nötron yaklaşık 15 dakikada bozunduğu için oran sonraki dakikalarda 1/7 civarına iner.',
  'Birkaç saniye içinde sıcaklık elektron ve pozitron üretmeye yetmez hâle gelir. Bu çiftler birbirini yok edip enerjilerini fotonlara verir; madde fazlalığı sayesinde geride az sayıda elektron kalır. Fotonlar bu yüzden nötrinolardan biraz daha sıcak kalır (bugün 2,725 K\'ye karşı 1,95 K).'],
 formed:['Kozmik nötrino artalanı (≈1,95 K)','Proton : nötron ≈ 6 : 1 (sonra ≈ 7 : 1)','Yok oluştan arta kalan elektronlar'],
 evid:'Kozmik nötrino artalanı enerjisi çok düşük olduğu için henüz doğrudan ölçülemedi; varlığı CMB\'deki ince izlerden ve ilk çekirdeklerin miktarından dolaylı olarak doğrulanıyor.',
 note:'Sıcaklıklar ve oranlar standart modelden hesaplanır.',
 lessons:['notrino'],tools:['kuant','enerji']},
{id:'bbn',ic:'🔥',nm:'İlk çekirdekler',t:'≈ 3 – 20 dk',T:'≈ 10⁹ K',z:'≈ 10⁹',a:'≈ 10⁹\'da biri',col:'#ff5e7e',art:'nuc',sec:180,
 short:'Evren yaklaşık 20 dakika boyunca dev bir füzyon reaktörüdür: helyum, döteryum ve biraz lityum oluşur. Bugünkü helyumun çoğu bu dakikalardan kalmadır.',
 what:['Proton ve nötron birleşip döteryumu (ağır hidrojen) oluşturabilir; ama sıcaklık 10⁹ K\'nin üstündeyken fotonlar döteryumu hemen parçalar. Her baryona yaklaşık 1,6 milyar foton düştüğü için, fotonların küçük bir kısmı bile buna yeter. Bu "döteryum darboğazı" yaklaşık 3. dakikada açılır.',
  'Darboğaz açılınca döteryum hızla helyum-4\'e dönüşür. Neredeyse bütün nötronlar helyumun içine girer: nötron/proton oranı ≈1/7 iken helyumun kütle payı ≈ 2·(1/7) / (1 + 1/7) ≈ %25 olur. Az miktarda döteryum, helyum-3 ve lityum-7 de oluşur.',
  'Yaklaşık 20 dakika sonra evren füzyonu sürdürmek için fazla soğuk ve seyrek hâle gelir; tepkimeler durur. Karbon, oksijen, demir gibi ağır elementler oluşamaz: kütle numarası 5 ve 8 olan kararlı çekirdek bulunmadığı için zincir orada tıkanır. Onlar yüz milyonlarca yıl sonra yıldızlarda yapılacak.'],
 formed:['Hidrojen çekirdeği (proton): kütlenin ≈ %75\'i','Helyum-4: kütlenin ≈ %25\'i','İz miktarda döteryum, helyum-3, lityum-7'],
 evid:'En eski yıldızlarda ve uzak gaz bulutlarında ölçülen ilkel helyum oranı (≈%24–25) ve döteryum miktarı hesapla uyumlu. Lityum-7 ise hesaptan yaklaşık 3 kat az gözleniyor ("lityum sorunu", hâlâ açık).',
 note:'Kütle payları gözlemle doğrulanmış güçlü bir öngörü.',
 lessons:['nukleo'],tools:['enerji','kuant']},
{id:'rec',ic:'📡',nm:'İlk atomlar ve ilk ışık',t:'≈ 380 bin yıl',T:'≈ 3000 K',z:'≈ 1100',a:'≈ 1100\'de biri',col:'#f08a4b',art:'cmb',sec:380e3*Y,
 short:'Elektronlar çekirdeklere bağlanır, ilk nötr atomlar oluşur. Işık artık serbestçe yol alır: bugün her yönden gelen kozmik mikrodalga artalanı bu andan kalmadır.',
 what:['Nükleosentezden sonraki yüz binlerce yıl boyunca evren; çekirdekler, serbest elektronlar ve fotonlardan oluşan sıcak, opak bir plazmadır. Bir foton çok kısa yol alıp bir elektrona çarpar; evren sisli bir gün gibi göz alamaz.',
  'Yaklaşık 380 bin yılda sıcaklık ≈3000 K\'ye düşer. Fotonlar artık elektronları atomlardan koparacak kadar enerjili olmadığından elektronlar çekirdeklere bağlanır; nötr hidrojen ve helyum atomları oluşur ("yeniden birleşme"). Serbest elektron kalmayınca sis dağılır: fotonlar o andan beri neredeyse hiç çarpmadan yol alıyor.',
  'O ışık o günden bu yana evrenin ≈1100 kat genişlemesiyle gerildi: dalga boyu kızılötesinden mikrodalgaya kaydı, sıcaklığı 3000 K\'den 2,725 K\'ye indi. Bu ışık gözlemleyebileceğimiz en eski "fotoğraf"tır. İçindeki 100.000\'de 1\'lik sıcaklık farkları, enflasyonun tohumlarının o andaki hâlidir.'],
 formed:['Nötr hidrojen ve helyum atomları','Kozmik mikrodalga artalan (CMB)','İlk ses dalgalarının izi (baryon akustik salınımları, ≈490 milyon ışık yılı ölçeği)'],
 evid:'CMB 1965\'te Penzias ve Wilson tarafından tesadüfen bulundu (1978 Nobel). COBE uydusu (1989–1992) kusursuz bir siyah cisim tayfı ve küçük farklar ölçtü; WMAP ve Planck uyduları bu farkların ayrıntılı haritasını çıkardı.',
 note:'"Yeniden birleşme" adı yanıltıcı: elektronlar ve çekirdekler daha önce hiç birleşmemişti.',
 lessons:['atom','cmb'],tools:['em','isik','kuant']},
{id:'dark',ic:'🕸️',nm:'Karanlık çağlar',t:'≈ 380 bin – 100 milyon yıl',T:'≈ 3000 K → 60 K',z:'≈ 1100 → 20',a:'1/1100 → 1/20',col:'#8a6cf5',art:'dark',sec:20e6*Y,
 short:'Henüz yıldız yok. Karanlık madde kütleçekimiyle kümelenip görünmez bir ağ kurar; sıradan gaz bu ağın düğümlerine akar.',
 what:['CMB serbest kaldıktan sonra evrende ışık üreten hiçbir şey yoktur: yalnız soğuyan artalan ışığı ve nötr hidrojen gazı. Bu yüzden bu döneme "karanlık çağlar" denir.',
  'Ama kütleçekim boş durmaz. Maddenin büyük kısmı ışıkla etkileşmeyen karanlık maddedir (sıradan maddenin yaklaşık 5,4 katı). Karanlık madde fotonların itişinden etkilenmediği için yeniden birleşmeden önce de kümelenmeye başlamıştı. Biraz daha yoğun bölgeler çevresinden madde çeker ve daha da yoğunlaşır: zengin daha zengin olur. Sonunda düğümler (haleler), filamanlar ve aralarında boşluklar olan dev bir "kozmik ağ" oluşur.',
  'Sıradan gaz bu çukurlara akar, sıkışıp ısınır, sonra ışıma yaparak soğur ve daha da çöker. İlk yıldızlar bu düğümlerin dibinde doğacak.'],
 formed:['Karanlık madde haleleri ve kozmik ağ','Halelere toplanan hidrojen-helyum gazı'],
 evid:'Bu dönemin ışığı yok. Nötr hidrojenin yaydığı 21 cm dalga boylu radyo sinyali bu çağı ölçmenin yolu; sinyal araştırılıyor, kesin ölçüm henüz yok. Karanlık maddenin varlığı galaksi dönüş eğrilerinden, kütleçekimsel mercekten ve CMB\'den biliniyor.',
 note:'Karanlık maddenin ne olduğu bilinmiyor; yalnız kütleçekim etkisi ölçülüyor.',
 lessons:['karanlik','yapi'],tools:['newton','enerji']},
{id:'stars',ic:'⭐',nm:'Kozmik şafak: ilk yıldızlar',t:'≈ 100 – 200 milyon yıl',T:'artalan ≈ 60 K',z:'≈ 20 – 30',a:'≈ 20\'de biri',col:'#4fa3ff',art:'stars',sec:150e6*Y,
 short:'Gaz bulutları çöker, merkezde füzyon tutuşur ve ilk yıldızlar yanar. Büyük kütleli olanları birkaç milyon yılda süpernova olup ilk ağır elementleri saçar.',
 what:['Hale içinde biriken gaz kendi kütleçekimiyle çöker. Çöken gaz ısınır; merkezde sıcaklık yaklaşık 10 milyon K\'ye ulaşınca hidrojen helyuma kaynaşmaya başlar ve bir yıldız doğar. İçerideki basınç, kütleçekimin ezmesini dengeler.',
  'İlk yıldızların (Popülasyon III) yalnız hidrojen ve helyumdan yapıldığı, bu yüzden çok büyük kütleli ve çok sıcak oldukları düşünülür. Büyük yıldızlar yakıtlarını hızla tüketir: birkaç milyon yılda çekirdeklerinde karbon, oksijen ve demire kadar elementler yapıp süpernova olarak patlarlar. Patlama bu elementleri ve daha ağırlarını çevreye saçar; bir kısmı kara deliğe dönüşür.',
  'İlk yıldızların ve galaksilerin morötesi ışığı nötr hidrojeni yeniden iyonlaştırır ("yeniden iyonlaşma"); bu süreç yaklaşık 1 milyar yılda tamamlanır ve galaksiler arası gaz bugünkü gibi saydamlaşır.'],
 formed:['İlk yıldızlar (Popülasyon III)','Karbon, oksijen, demir ve daha ağır elementler','İlk kara delikler','Yeniden iyonlaşmış gaz'],
 evid:'Popülasyon III yıldızları henüz doğrudan görülmedi. James Webb Uzay Teleskobu, evren birkaç yüz milyon yaşındayken var olan galaksileri gözlüyor. Uzak kuasarların tayfındaki hidrojen soğurması, yeniden iyonlaşmanın yaklaşık 1 milyar yılda bittiğini gösteriyor.',
 note:'İlk yıldızların tam zamanı ve kütleleri belirsiz; modeller yüz milyon yıl civarını gösteriyor.',
 lessons:['yildiz','evrim','supernova','kara'],tools:['enerji','kuant','newton']},
{id:'gal',ic:'🌌',nm:'Galaksiler',t:'≈ 400 milyon yıl →',T:'artalan ≈ 30 K',z:'≈ 10',a:'≈ 11\'de biri',col:'#5ec8ff',art:'gal',sec:400e6*Y,
 short:'Yıldızlar karanlık madde halelerinin içinde galaksilerde toplanır. Küçük galaksiler çarpışıp birleşerek büyür; merkezlerinde dev kara delikler büyür.',
 what:['Galaksiler, karanlık madde halelerine düşen gazın yıldıza dönüştüğü yerlerdir. İlk galaksiler küçük ve düzensizdi; kütleçekim onları birbirine çekip birleştirdi. Samanyolu da bu birleşmelerle büyüdü ve hâlâ küçük komşu galaksileri yutuyor.',
  'Bir galaksideki yıldızların dönüş hızı, görünen maddenin tek başına tutabileceğinden çok daha yüksek; aradaki kütleyi karanlık madde sağlar. Merkezdeki dev kara delikler (Samanyolu\'nda ≈4 milyon Güneş kütlesi) gaz yuttukça parlak kuasarlar olarak yanar; kuasar etkinliği evren ≈3 milyar yaşındayken zirve yapar.',
  'Yıldız oluşumu da evren 3–4 milyar yaşındayken en yüksek düzeydeydi ("kozmik öğle"); o zamandan beri yavaşlıyor. Her yeni yıldız kuşağı, öncekilerin saçtığı ağır elementlerle daha zengin doğuyor.'],
 formed:['Galaksiler ve galaksi kümeleri','Galaksi merkezlerinde dev kara delikler ve kuasarlar','Ağır elementlerce zenginleşen yeni yıldız kuşakları'],
 evid:'Hubble Derin Alan görüntüleri (1995\'ten bu yana) ve JWST, farklı uzaklıklardaki, yani farklı yaşlardaki galaksileri yan yana gösteriyor: uzaktakiler daha küçük ve düzensiz. Sloan Dijital Gökyüzü Taraması milyonlarca galaksinin konumuyla kozmik ağı haritaladı.',
 note:'Zaman ve oranlar yaklaşık.',
 lessons:['galaksi'],tools:['newton','isik']},
{id:'de',ic:'🚀',nm:'Genişleme hızlanıyor',t:'≈ 8 milyar yıl',T:'artalan ≈ 4–5 K',z:'≈ 0,6',a:'≈ %60\'ı',col:'#6ee0c2',art:'de',sec:8e9*Y,
 short:'Madde seyreldikçe kütleçekimin frenleyici etkisi zayıflar, "karanlık enerji" baskın gelir: evrenin genişlemesi yavaşlamayı bırakıp hızlanır.',
 what:['Hubble 1929\'da uzak galaksilerin bizden uzaklaştığını, ne kadar uzaktalarsa o kadar hızlı uzaklaştıklarını gösterdi: evren genişliyor. Madde kütleçekimiyle bu genişlemeyi frenlemeliydi; bilim insanları frenin ne kadar güçlü olduğunu ölçmek istiyordu.',
  '1998\'de iki ekip, uzak Tip Ia süpernovaların (parlaklığı bilinen "standart mumlar") beklenenden sönük olduğunu buldu: genişleme yavaşlamıyor, hızlanıyordu. Bunu sağlayan ve uzayın kendisine ait olduğu düşünülen enerjiye "karanlık enerji" dendi. Madde seyreldikçe yoğunluğu düşer, ama karanlık enerjinin yoğunluğu (en basit modelde, kozmolojik sabit) sabit kalır. Bu yüzden yaklaşık 8 milyar yılda denge bozulur ve genişleme hızlanmaya başlar.',
  'Bugün evrenin enerji bütçesinin yaklaşık %68\'i karanlık enerji, %27\'si karanlık madde, yalnız %5\'i bildiğimiz maddedir.'],
 formed:['Hızlanan genişleme','Birbirinden giderek daha hızlı uzaklaşan galaksi kümeleri'],
 evid:'Tip Ia süpernovalar (Perlmutter, Schmidt, Riess; 2011 Nobel), CMB ve galaksilerin dağılımındaki baryon akustik salınımları aynı sonucu veriyor. Son ölçümler (DESI, 2024–2025) karanlık enerjinin zamanla değişebileceğine dair ipuçları buldu; bu kesin değil.',
 note:'Karanlık enerjinin ne olduğu fiziğin en büyük açık sorularından biri. Hızlanmanın başladığı an yaklaşık.',
 lessons:['karanlikE'],tools:['isik','newton','enerji']},
{id:'sun',ic:'🪐',nm:'Güneş ve Dünya',t:'≈ 9,2 milyar yıl',T:'artalan ≈ 4 K',z:'≈ 0,45',a:'≈ %70\'i',col:'#ffd36e',art:'sun',sec:9.2e9*Y,
 short:'Önceki yıldız kuşaklarının küllerinden zenginleşmiş bir gaz bulutu çöker: Güneş doğar, çevresindeki diskten gezegenler oluşur. Bugünden 4,6 milyar yıl önce.',
 what:['Samanyolu\'nun bir kolunda, önceki yıldızların süpernovalarla saçtığı karbon, oksijen, silisyum, demir gibi elementlerce zenginleşmiş bir moleküler bulut çöker (belki yakındaki bir süpernovanın şok dalgasıyla). Çöken bulut dönerken yassılaşıp bir disk olur; merkezde Güneş tutuşur.',
  'Diskte toz taneleri yapışarak çakıllara, çakıllar kayalara, kayalar gezegenciklere dönüşür. İç bölgede sıcaklık yüksek olduğundan yalnız kaya ve metal kalır (Merkür, Venüs, Dünya, Mars); dışarıda buz da katı olduğundan dev gezegenler (Jüpiter, Satürn, Uranüs, Neptün) bol gaz toplar.',
  'Vücudumuzdaki karbon, kanımızdaki demir, soluduğumuz oksijen ilk dakikalarda değil, yıldızların içinde ve patlamalarında yapıldı. Kimya, atomların elektronlarının elektromanyetik kuvvetle bağ kurmasıdır; yaşam da bu kimyanın üzerine kuruludur.'],
 formed:['Güneş (yaklaşık 4,6 milyar yıl önce)','8 gezegen, asteroitler, kuyruklu yıldızlar','Ağır elementlerce zengin, kayalık Dünya'],
 evid:'En eski meteorit parçalarının radyometrik yaşı ≈4,567 milyar yıl. Genç yıldızların çevresinde gezegen oluşturan diskler (ALMA görüntüleri) doğrudan gözleniyor; binlerce ötegezegen bulundu.',
 note:'',
 lessons:['gunes','kimya'],tools:['newton','em','enerji']},
{id:'now',ic:'📍',nm:'Bugün',t:'13,8 milyar yıl',T:'2,725 K',z:'0',a:'bugün',col:'#9cc7ff',art:'today',sec:13.8e9*Y,
 short:'Gözlemlenebilir evrenin çapı ≈93 milyar ışık yılı, artalan ışığı 2,725 K. Entropi artmaya devam ediyor; geleceği karanlık enerji belirleyecek.',
 what:['Evren 13,8 milyar yaşında. Işık bu sürede 13,8 milyar yıl yol aldı; ama yol alırken uzay genişlediği için ışığını görebildiğimiz en uzak bölgeler bugün yaklaşık 46 milyar ışık yılı uzakta. Gözlemlenebilir evrenin çapı ≈93 milyar ışık yılı.',
  'Zamanın neden hep ileri aktığı sorusu entropiyle ilgili: evren çok düşük entropili, düzenli bir başlangıçtan başladı ve entropi o günden bu yana artıyor. Bir yıldızın yanması, bir bardağın kırılması, bizim yaşlanmamız aynı okun parçaları.',
  'Gelecek karanlık enerjiye bağlı. En olası senaryoda genişleme sonsuza dek hızlanır; uzak galaksiler görüş alanımızdan çıkar, yıldızlar trilyonlarca yıl sonra söner ve evren soğuk, karanlık bir dengeye (ısı ölümü) gider. "Büyük yırtılma" ya da "büyük sıkışma" gibi alternatifler karanlık enerjinin doğasına bağlı.'],
 formed:['Biz: 13,8 milyar yıllık bir zincirin halkası'],
 evid:'Yaş ve bileşim, Planck uydusunun CMB ölçümleri ve galaksi taramalarıyla yaklaşık %1 duyarlıkla belirlendi. Genişleme hızının (Hubble sabiti) farklı yöntemlerle farklı çıkması ("Hubble gerilimi") ise çözülmemiş bir soru.',
 note:'',
 lessons:['termo','gelecek'],tools:['enerji','isik']}
];
const R0=[18,58,64,70,76,82,92,100,108,116,126,138,150];
const TOOLK=['newton','enerji','em','isik','kuant'];

let L,NODES,byKey={},$=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(t){const e=$('csToast');if(!e)return;e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)}
function rng(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* kozmik takvim: 13,8 milyar yıl = 1 yıl (365 gün) */
const MON=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],MD=[31,28,31,30,31,30,31,31,30,31,30,31];
function cal(sec){
  const cs=sec/(13.8e9*Y)*365*86400;
  if(cs>=365*86400-1) return '31 Aralık, gece yarısı: şimdi';
  if(cs<1){const e=Math.floor(Math.log10(cs));return '1 Ocak, gece yarısından yaklaşık 10'+sup(e)+' saniye sonra'}
  let d=Math.floor(cs/86400),m=0;while(d>=MD[m]){d-=MD[m];m++}
  const r=cs%86400,h=Math.floor(r/3600),mi=Math.floor(r%3600/60),s=Math.floor(r%60);
  const tm=(m===0&&d===0)?(h?h+' sa ':'')+(mi?mi+' dk ':'')+s+' sn sonra':String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0');
  return (d+1)+' '+MON[m]+', '+tm;
}
function sup(n){const S={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};return String(n).split('').map(c=>S[c]||c).join('')}

function state(k,done,next){if(done.has(k))return 'done';if(!L[k])return 'soon';return k===next?'next':'avail'}
function chip(k,done,next){const n=byKey[k];if(!n)return '';const st=state(k,done,next);
  const pre={done:'✓ ',next:'▶ ',avail:'',soon:''}[st];
  return '<a class="fz-chip st-'+st+'" data-l="'+k+'" href="'+(L[k]?'#ders='+k:'#')+'" title="'+(st==='soon'?'Ders yakında':'Dersi aç')+'">'+pre+n[1]+' '+esc(n[2])+(st==='soon'?' <i>yakında</i>':'')+'</a>'}

function html(){
  return '<div class="model active" id="model-yol"><div id="fzSpace"><canvas id="fzStars" aria-hidden="true"></canvas><div class="fz-c">'
   +'<header class="fz-hero"><h1>🌌 Evrenin Zaman Çizelgesi</h1><p class="sub">Büyük Patlama\'dan bugüne ne oldu, sırasıyla. Koni evrenin genişlemesini, her dilim bir dönemi gösterir: soldan sağa (telefonda yukarıdan aşağı) okudukça evren büyür, soğur ve önce parçacıklar, sonra çekirdekler, atomlar, yıldızlar, galaksiler ve biz oluşuruz. Bir dileme tıkla: o dönemde ne olduğu, nereden bildiğimiz ve dersleri aşağıda açılsın.</p>'
   +'<div class="fz-prog"><div class="fz-bar"><i id="fzBar"></i></div><span id="fzProgT"></span><button class="fz-b fz-gold" id="fzNext"></button></div>'
   +'<div class="fz-views"><button class="fz-b on" id="fzV1">🌌 Zaman çizelgesi</button><button class="fz-b" id="fzV2">🌳 Ders ağacı</button></div></header>'
   +'<section id="fzTl">'
   +'<div class="fz-kit"><div class="fz-kith"><b>🧰 Alet Çantası</b><span>Zaman çizelgesini okumak için gereken beş temel araç. Dönemlerin hiçbiri değil, hepsinin dili. Bir aletin üstüne gel: hangi dönemlerde kullanıldığı yanar.</span></div><div class="fz-tools" id="fzTools"></div></div>'
   +'<div class="fz-ctl"><button class="fz-b" id="fzPrev">◀ Önceki dönem</button><button class="fz-b" id="fzPlay">▶ Zamanda yolculuk</button><button class="fz-b" id="fzNextE">Sonraki dönem ▶</button><button class="fz-b" id="fzAll">📜 Hikâyenin tamamını oku</button><button class="fz-b" id="fzFs">⛶ Tam ekran</button><span class="fz-hint" id="fzHint"></span></div>'
   +'<div class="fz-scroll" id="fzScroll"><div class="fz-inner" id="fzInner"><svg id="fzCone" aria-hidden="true"></svg><div class="fz-bang" id="fzBang"><span>Büyük<br>Patlama</span></div>'
   +EP.map((e,i)=>'<div class="fz-ep" data-i="'+i+'" style="--c:'+e.col+'"><div class="fz-top"><b class="fz-t">'+e.t+'</b><span>🌡️ '+e.T+'</span></div><div class="fz-slot"></div><div class="fz-cap"><h3><span class="fz-n">'+(i+1)+'</span>'+e.ic+' '+esc(e.nm)+'</h3><p>'+esc(e.short)+'</p><div class="fz-chips" data-ch="'+i+'"></div></div></div>').join('')
   +'</div></div>'
   +'<div class="fz-detail" id="fzDetail"></div>'
   +'<p class="fz-note">Sayılar yaklaşık ve hafızadan yazıldı (kaynaktan tek tek doğrulanmadı); zamanlar standart kozmoloji modeline göre. Erken dönemler (özellikle Planck ve enflasyon) kuramsaldır. Boyut, evrenin bugünkü hâline göre kabaca 2,725 K ÷ sıcaklık ile hesaplandı.</p>'
   +'</section>'
   +'<section id="fzTree" hidden><div class="pts" id="ttBox"><div id="techProg" style="font-size:14px;color:#ccd5e8;margin-bottom:10px"></div><div class="tt-lesonly" style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--muted);margin-bottom:12px"><span>✔ tamamlandı</span><span>◆ sıradaki</span><span>🔒 kilitli</span><span id="ttHint"></span></div><div id="ttTools"><span class="tt-lab">Harita</span><button id="ttFs">⛶ Tam ekran</button><span class="tt-lesonly" style="display:contents"><span class="tt-sep"></span><span class="tt-lab">Yön</span><button id="ttM_auto">Otomatik</button><button id="ttM_h">↔ Yatay</button><button id="ttM_v">↕ Dikey</button><span class="tt-sep"></span><span class="tt-lab">Boyut</span><button id="ttZm">−</button><button id="ttZv">%100</button><button id="ttZp">+</button></span></div><div id="ttScroll" style="overflow-x:auto"><svg id="techSvg" role="img"></svg></div><div id="techInfo" class="callout" style="margin-top:14px">Bir derse tıkla → ayrıntı burada açılsın.</div></div><span id="ttDir" hidden></span></section>'
   +'</div></div></div>';
}

/* ---- dilimlerin içindeki küçük çizimler (merkez 0,0; yarıçaplar rx, ry) ---- */
function art(e,rx,ry,r){
  const P=()=>{const a=r()*6.283,d=Math.sqrt(r())*.9;return [Math.cos(a)*d*rx,Math.sin(a)*d*ry]};
  const m=Math.min(rx,ry),f=v=>v.toFixed(1);let s='';
  const dot=(x,y,rad,c,o)=>'<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+rad+'" fill="'+c+'"'+(o!=null?' opacity="'+o+'"':'')+'/>';
  const glow=(x,y,rad,c)=>'<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(rad)+'" fill="url(#fzG)" style="color:'+c+'"/>';
  switch(e.art){
  case 'foam': s+=glow(0,0,m*1.1,'#fff');for(let i=0;i<9;i++){const[x,y]=P();s+='<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(m*(.2+r()*.35))+'" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>'}break;
  case 'infl': s+=glow(0,0,m*1.2,'#fff3b0');[.3,.6,.9].forEach(k=>s+='<ellipse rx="'+f(rx*k)+'" ry="'+f(ry*k)+'" fill="none" stroke="#fff3b0" stroke-opacity=".5"/>');
    for(let i=0;i<10;i++){const a=i*.628,c=Math.cos(a),n=Math.sin(a);s+='<line x1="'+f(c*rx*.25)+'" y1="'+f(n*ry*.25)+'" x2="'+f(c*rx*.85)+'" y2="'+f(n*ry*.85)+'" stroke="#ffe680" stroke-opacity=".6"/>'}break;
  case 'higgs': for(let i=0;i<70;i++){const[x,y]=P();s+=dot(x,y,.9,'#ffe7a8',.45)}for(let i=0;i<7;i++){const[x,y]=P();s+=glow(x,y,7,'#ffb84d')+dot(x,y,2.4,i%2?'#ffd166':'#ff9f43')}break;
  case 'qgp': {const C=['#ff4d4d','#4dff88','#4d9bff'];for(let i=0;i<110;i++){const[x,y]=P();s+=dot(x,y,1.6,C[i%3],.9)}for(let i=0;i<26;i++){const[x,y]=P();s+='<path d="M'+f(x)+' '+f(y)+' q3 -3 6 0 t6 0" fill="none" stroke="#ffe066" stroke-opacity=".7" stroke-width=".8"/>'}break}
  case 'nu': for(let i=0;i<40;i++){const[x,y]=P(),a=r()*6.283,l=6+r()*9;s+='<line x1="'+f(x)+'" y1="'+f(y)+'" x2="'+f(x+Math.cos(a)*l)+'" y2="'+f(y+Math.sin(a)*l)+'" stroke="#ffe1d6" stroke-opacity=".7" stroke-linecap="round"/>'}for(let i=0;i<40;i++){const[x,y]=P();s+=dot(x,y,1.3,i%7?'#ff8f7a':'#7ab8ff',.8)}break;
  case 'nuc': for(let i=0;i<40;i++){const[x,y]=P();s+=dot(x,y,1.4,'#ff6b6b',.7)}for(let i=0;i<14;i++){const[x,y]=P(),n=2+Math.floor(r()*3);for(let j=0;j<n;j++){const a=j/n*6.283+r();s+=dot(x+Math.cos(a)*2.4,y+Math.sin(a)*2.4,2.1,j%2?'#7ab8ff':'#ff6b6b')}}break;
  case 'cmb': {const C=['#ff9a3c','#e0552b','#ffd27a','#4d8bd6','#7fb2ff'];for(let i=0;i<150;i++){const[x,y]=P();s+=dot(x,y,(2+r()*4).toFixed(1),C[Math.floor(r()*5)],.5)}break}
  case 'dark': case 'stars': {const N=[];for(let i=0;i<9;i++)N.push(P());for(let i=0;i<N.length;i++){const j=(i+1+Math.floor(r()*3))%N.length;s+='<line x1="'+f(N[i][0])+'" y1="'+f(N[i][1])+'" x2="'+f(N[j][0])+'" y2="'+f(N[j][1])+'" stroke="#a48bff" stroke-opacity=".35"/>'}
    N.forEach(p=>s+=glow(p[0],p[1],6,'#8a6cf5'));
    if(e.art==='stars'){N.slice(0,7).forEach((p,i)=>{s+=glow(p[0],p[1],9,'#9ecbff')+dot(p[0],p[1],1.9,'#fff');});const p=N[7];s+=glow(p[0],p[1],14,'#ffb36b');for(let k=0;k<8;k++){const a=k*.785;s+='<line x1="'+f(p[0])+'" y1="'+f(p[1])+'" x2="'+f(p[0]+Math.cos(a)*9)+'" y2="'+f(p[1]+Math.sin(a)*9)+'" stroke="#ffe0b0" stroke-opacity=".8"/>'}}break}
  case 'gal': case 'de': for(let i=0;i<40;i++){const[x,y]=P();s+=dot(x,y,.8,'#fff',.6)}for(let i=0;i<8;i++){const[x,y]=P(),a=r()*180;s+='<g transform="translate('+f(x)+' '+f(y)+') rotate('+a.toFixed(0)+')"><ellipse rx="7" ry="2.6" fill="#bfe6ff" opacity=".55"/><circle r="1.6" fill="#fff"/></g>';
      if(e.art==='de'){const d=Math.hypot(x,y)||1,ux=x/d,uy=y/d,x2=x+ux*12,y2=y+uy*12;s+='<line x1="'+f(x+ux*8)+'" y1="'+f(y+uy*8)+'" x2="'+f(x2)+'" y2="'+f(y2)+'" stroke="#6ee0c2" stroke-width="1.2"/><circle cx="'+f(x2)+'" cy="'+f(y2)+'" r="1.5" fill="#6ee0c2"/>'}}break;
  case 'sun': s+=glow(0,0,m*.55,'#ffd36e')+dot(0,0,Math.max(3,m*.16),'#ffe08a');[.36,.52,.7,.88].forEach((k,i)=>{s+='<ellipse rx="'+f(rx*k)+'" ry="'+f(ry*k)+'" fill="none" stroke="#ffe6a8" stroke-opacity=".35"/>';const a=r()*6.283;s+=dot(Math.cos(a)*rx*k,Math.sin(a)*ry*k,i===2?2.2:1.8,['#c9a27a','#e8c48a','#6fb6ff','#e5935c'][i])});break;
  case 'today': {for(let i=0;i<50;i++){const[x,y]=P();s+=dot(x,y,.8,'#fff',.55)}s+=glow(0,0,m*.5,'#cfe3ff');for(let arm=0;arm<2;arm++){let d='';for(let k=0;k<=40;k++){const t=k/40,a=arm*Math.PI+t*4.2,q=.08+t*.85;d+=(k?'L':'M')+f(Math.cos(a)*q*rx)+' '+f(Math.sin(a)*q*ry)}s+='<path d="'+d+'" fill="none" stroke="#cfe3ff" stroke-opacity=".75" stroke-width="2.2" stroke-linecap="round"/>'}
    const a=.5*Math.PI+2.6;s+=dot(Math.cos(a)*.55*rx,Math.sin(a)*.55*ry,2.4,'#ffd36e');break}
  }
  return s;
}

/* monoton kübik interpolasyon (koni kenarı yumuşak ama taşmasız) */
function mono(xs,ys){const n=xs.length,d=[],m=[];for(let i=0;i<n-1;i++)d.push((ys[i+1]-ys[i])/(xs[i+1]-xs[i]));
  m[0]=d[0];m[n-1]=d[n-2];for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:2*d[i-1]*d[i]/(d[i-1]+d[i]);
  return x=>{let i=0;while(i<n-2&&x>xs[i+1])i++;const h=xs[i+1]-xs[i],t=Math.max(0,Math.min(1,(x-xs[i])/h)),t2=t*t,t3=t2*t;
    return (2*t3-3*t2+1)*ys[i]+(t3-2*t2+t)*h*m[i]+(-2*t3+3*t2)*ys[i+1]+(t3-t2)*h*m[i+1]}}

let sel=0,vert=false,playT=null,allMode=false;
function curDone(){return rd()}
function nextKey(done){const n=NODES.find(n=>L[n[0]]&&!done.has(n[0]));return n?n[0]:null}

function layoutCone(){
  const inner=$('fzInner'),svg=$('fzCone');if(!inner||!inner.offsetWidth)return;
  vert=window.innerWidth<=720;inner.classList.toggle('vert',vert);
  const ib=inner.getBoundingClientRect(),W=inner.scrollWidth,H=inner.scrollHeight;
  svg.setAttribute('width',W);svg.setAttribute('height',H);svg.setAttribute('viewBox','0 0 '+W+' '+H);
  const k=vert?62/150:1,slots=[...inner.querySelectorAll('.fz-slot')].map(el=>{const b=el.getBoundingClientRect();return [b.left-ib.left+b.width/2,b.top-ib.top+b.height/2]});
  const bb=$('fzBang').getBoundingClientRect(),bang=[bb.left-ib.left+bb.width/2,bb.top-ib.top+bb.height/2];
  const R=R0.map(r=>r*k),axC=vert?slots[0][0]:slots[0][1];
  const ps=[vert?bang[1]:bang[0]].concat(slots.map(s=>vert?s[1]:s[0])),last=ps[ps.length-1];ps.push(last+(vert?60:80));
  const rs=[0].concat(R,[R[R.length-1]*1.12]),fr=mono(ps,rs);
  let up='',lo=[];const step=6;for(let p=ps[0];p<=ps[ps.length-1]+.1;p+=step){const r=fr(p);if(vert){up+=(up?'L':'M')+(axC-r).toFixed(1)+' '+p.toFixed(1);lo.push((axC+r).toFixed(1)+' '+p.toFixed(1))}else{up+=(up?'L':'M')+p.toFixed(1)+' '+(axC-r).toFixed(1);lo.push(p.toFixed(1)+' '+(axC+r).toFixed(1))}}
  const path=up+'L'+lo.reverse().join('L')+'Z';
  const g0=ps[0],g1=ps[ps.length-1],gs=EP.map((e,i)=>'<stop offset="'+((ps[i+1]-g0)/(g1-g0)).toFixed(3)+'" stop-color="'+e.col+'"/>').join('');
  let defs='<defs><radialGradient id="fzG"><stop offset="0" stop-color="currentColor" stop-opacity=".8"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient>'
   +'<linearGradient id="fzCg" gradientUnits="userSpaceOnUse" '+(vert?'x1="0" x2="0" y1="'+g0+'" y2="'+g1+'"':'y1="0" y2="0" x1="'+g0+'" x2="'+g1+'"')+'><stop offset="0" stop-color="#fff"/>'+gs+'</linearGradient>'
   +'<filter id="fzBl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>';
  let body='<path d="'+path+'" fill="url(#fzCg)" opacity=".16"/><path d="'+path+'" fill="none" stroke="url(#fzCg)" stroke-width="7" opacity=".35" filter="url(#fzBl)"/><path d="'+path+'" fill="none" stroke="url(#fzCg)" stroke-width="1.4" opacity=".8"/>';
  /* ara halkalar: koniye derinlik */
  for(let p=ps[0]+30;p<last;p+=36){const r=fr(p);if(r<6)continue;body+=vert?'<ellipse cx="'+axC+'" cy="'+p.toFixed(1)+'" rx="'+r.toFixed(1)+'" ry="'+(r*.22).toFixed(1)+'" fill="none" stroke="#fff" stroke-opacity=".07"/>':'<ellipse cx="'+p.toFixed(1)+'" cy="'+axC+'" rx="'+(r*.22).toFixed(1)+'" ry="'+r.toFixed(1)+'" fill="none" stroke="#fff" stroke-opacity=".07"/>'}
  const done=curDone(),nk=nextKey(done);
  EP.forEach((e,i)=>{const[cx,cy]=slots[i],r=R[i],rx=vert?r:Math.max(9,r*.3),ry=vert?Math.max(11,r*.42):r;
    defs+='<clipPath id="fzK'+i+'"><ellipse rx="'+rx.toFixed(1)+'" ry="'+ry.toFixed(1)+'"/></clipPath><radialGradient id="fzS'+i+'"><stop offset="0" stop-color="'+e.col+'" stop-opacity=".42"/><stop offset="1" stop-color="#07051a" stop-opacity=".95"/></radialGradient>';
    const isNext=nk&&e.lessons.includes(nk);
    body+='<g class="fz-sl'+(i===sel?' sel':'')+(isNext?' nx':'')+'" data-i="'+i+'" transform="translate('+cx.toFixed(1)+' '+cy.toFixed(1)+')"><ellipse class="fz-halo" rx="'+(rx+7).toFixed(1)+'" ry="'+(ry+7).toFixed(1)+'" fill="none" stroke="'+e.col+'"/><ellipse rx="'+rx.toFixed(1)+'" ry="'+ry.toFixed(1)+'" fill="url(#fzS'+i+')"/><g clip-path="url(#fzK'+i+')">'+art(e,rx,ry,rng(i*97+13))+'</g><ellipse class="fz-rim" rx="'+rx.toFixed(1)+'" ry="'+ry.toFixed(1)+'" fill="none" stroke="'+e.col+'"/></g>'});
  svg.innerHTML=defs+'</defs>'+body;
  $('fzHint').textContent=vert?'⬇️ aşağı kaydır: zaman ilerler':'➡️ yana kaydır (sürükleyebilirsin): zaman ilerler';
}

function renderChips(){
  const done=curDone(),nk=nextKey(done);
  document.querySelectorAll('.fz-chips[data-ch]').forEach(c=>{const e=EP[+c.dataset.ch];c.innerHTML=e.lessons.map(k=>chip(k,done,nk)).join('')});
  document.querySelectorAll('.fz-ep').forEach(el=>{const e=EP[+el.dataset.i];el.classList.toggle('sel',+el.dataset.i===sel);el.classList.toggle('nx',!!nk&&e.lessons.includes(nk))});
  const total=NODES.length,dn=NODES.filter(n=>done.has(n[0])).length,wr=NODES.filter(n=>L[n[0]]).length;
  $('fzBar').style.width=(dn/total*100).toFixed(1)+'%';
  $('fzProgT').textContent=dn+' / '+total+' ders tamamlandı · '+wr+' ders yazıldı';
  const nb=$('fzNext');if(nk){nb.hidden=false;nb.textContent='▶ Sıradaki: '+byKey[nk][1]+' '+byKey[nk][2];nb.onclick=()=>location.hash='#ders='+nk}else nb.hidden=true;
  $('fzTools').innerHTML=TOOLK.map(k=>{const n=byKey[k],st=state(k,done,nk),use=EP.filter(e=>e.tools.includes(k)).length;
    return '<a class="fz-tool st-'+st+'" data-t="'+k+'" href="#ders='+k+'"><span class="fz-ti">'+n[1]+'</span><b>'+esc(n[2])+'</b><small>'+TOOLS[k][0]+'</small><em>'+(st==='done'?'✓ tamamlandı':st==='next'?'▶ sıradaki':'Dersi aç')+' · '+use+' dönemde</em></a>'}).join('');
}

function block(e,i,done,nk){
  return '<div class="fz-dh" style="--c:'+e.col+'"><span class="fz-dic">'+e.ic+'</span><div><small>Dönem '+(i+1)+' / '+EP.length+'</small><h2>'+esc(e.nm)+'</h2></div></div>'
   +'<div class="fz-facts"><span>⏱️ <b>Zaman</b>'+e.t+'</span><span>🌡️ <b>Sıcaklık</b>'+e.T+'</span><span>📏 <b>Boyut (bugüne göre)</b>'+e.a+'</span><span>🔴 <b>Kırmızıya kayma z</b>'+e.z+'</span><span>🗓️ <b>Kozmik takvimde</b>'+cal(e.sec)+'</span></div>'
   +'<div class="fz-dg"><div class="fz-dm"><h4>🔭 Ne oluyor?</h4>'+e.what.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div>'
   +'<div class="fz-ds"><h4>🧱 Ne oluştu?</h4><ul>'+e.formed.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><h4>🔎 Nereden biliyoruz?</h4><p>'+esc(e.evid)+'</p>'+(e.note?'<p class="fz-warn">⚠️ '+esc(e.note)+'</p>':'')
   +'<h4>📚 Bu dönemin dersleri</h4><div class="fz-chips">'+e.lessons.map(k=>chip(k,done,nk)).join('')+'</div>'
   +'<h4>🧰 Kullanılan aletler</h4><div class="fz-chips">'+e.tools.map(k=>chip(k,done,nk)).join('')+'</div></div></div>';
}
function renderDetail(){
  const d=$('fzDetail'),done=curDone(),nk=nextKey(done);
  if(allMode){d.innerHTML='<div class="fz-allh"><b>📜 Büyük Patlama\'dan bugüne, 13 dönemde</b><button class="fz-b" id="fzAllX">✕ Kapat</button></div>'+EP.map((e,i)=>'<article class="fz-art">'+block(e,i,done,nk)+'</article>').join('');$('fzAllX').onclick=()=>{allMode=false;renderDetail()}}
  else{const e=EP[sel];d.innerHTML='<article class="fz-art">'+block(e,sel,done,nk)+'<div class="fz-dnav"><button class="fz-b" data-go="-1"'+(sel?'':' disabled')+'>◀ '+(sel?esc(EP[sel-1].nm):'')+'</button><button class="fz-b" data-go="1"'+(sel<EP.length-1?'':' disabled')+'>'+(sel<EP.length-1?esc(EP[sel+1].nm):'')+' ▶</button></div></article>';
    d.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>select(sel+ +b.dataset.go,true))}
  $('fzAll').classList.toggle('on',allMode);
  if(vert){const ep=document.querySelector('.fz-ep[data-i="'+sel+'"]');if(!allMode&&ep)ep.after(d);else $('fzTl').insertBefore(d,document.querySelector('#fzTl .fz-note'))}
}
function select(i,scroll){
  sel=Math.max(0,Math.min(EP.length-1,i));allMode=false;renderChips();renderDetail();
  document.querySelectorAll('#fzCone .fz-sl').forEach(g=>g.classList.toggle('sel',+g.dataset.i===sel));
  if(scroll){const ep=document.querySelector('.fz-ep[data-i="'+sel+'"]'),sc=$('fzScroll');
    if(!vert){sc.scrollTo({left:ep.offsetLeft-sc.clientWidth/2+ep.offsetWidth/2,behavior:'smooth'})}
    else ep.scrollIntoView({behavior:'smooth',block:'start'})}
  if(vert)requestAnimationFrame(layoutCone);
}
function stopPlay(){if(playT){clearInterval(playT);playT=null;$('fzPlay').textContent='▶ Zamanda yolculuk';$('fzPlay').classList.remove('on')}}

/* ---- yıldızlı gökyüzü ---- */
function stars(){
  const cv=$('fzStars'),sp=$('fzSpace'),cx=cv.getContext('2d'),red=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W=0,H=0,S=[],dpr=Math.min(1.5,window.devicePixelRatio||1),neb=[];
  function size(){W=sp.clientWidth;H=sp.clientHeight;if(!W||!H)return;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';
    const n=Math.min(900,Math.round(W*H/2400)),r=rng(7);S=[];for(let i=0;i<n;i++)S.push([r()*W,r()*H,r()<.06?1.6:r()<.3?1.1:.7,.3+r()*.7,r()*6.28,.5+r()*2.2,r()<.15?'#bcd2ff':r()<.1?'#ffe2b8':'#fff']);
    neb=[[W*.12,H*.25,W*.35,'#2a1a55'],[W*.7,H*.15,W*.4,'#132a4f'],[W*.5,H*.8,W*.45,'#35163f']];draw(0)}
  function draw(t){if(!W)return;cx.setTransform(dpr,0,0,dpr,0,0);cx.fillStyle='#02020a';cx.fillRect(0,0,W,H);
    neb.forEach(n=>{const g=cx.createRadialGradient(n[0],n[1],0,n[0],n[1],n[2]);g.addColorStop(0,n[3]);g.addColorStop(1,'rgba(2,2,10,0)');cx.globalAlpha=.55;cx.fillStyle=g;cx.fillRect(0,0,W,H)});
    S.forEach(s=>{cx.globalAlpha=s[3]*(red?1:.55+.45*Math.sin(t*.001*s[5]+s[4]));cx.fillStyle=s[6];cx.fillRect(s[0],s[1],s[2],s[2])});cx.globalAlpha=1}
  new ResizeObserver(size).observe(sp);size();
  if(red)return;let lt=0;(function loop(t){requestAnimationFrame(loop);if(t-lt<50||!sp.offsetParent||document.hidden)return;lt=t;draw(t)})(0);
}

window.__fzTimelineHTML=html;
window.__fzTimelineInit=function(){
  L=window.FZ_LESSONS;NODES=window.FZ_NODES;NODES.forEach(n=>byKey[n[0]]=n);
  const done=rd(),nk=nextKey(done);if(nk){const i=EP.findIndex(e=>e.lessons.includes(nk));if(i>=0)sel=i}
  renderChips();renderDetail();stars();
  refresh=()=>{renderChips();renderDetail();layoutCone()};
  new ResizeObserver(()=>layoutCone()).observe($('fzInner'));
  addEventListener('resize',()=>{clearTimeout(layoutCone.t);layoutCone.t=setTimeout(()=>{layoutCone();renderDetail()},120)});
  addEventListener('hashchange',()=>{if(!/#ders=/.test(location.hash))setTimeout(refresh,0)});
  const space=$('fzSpace');
  space.addEventListener('click',ev=>{const a=ev.target.closest('a[data-l],a.fz-tool');if(a){const k=a.dataset.l||a.dataset.t;if(!L[k]){ev.preventDefault();toast('Bu ders yakında.')}ev.stopPropagation();return}
    const ep=ev.target.closest('.fz-ep');if(ep&&!$('fzScroll').dataset.drag){stopPlay();select(+ep.dataset.i,false)}});
  /* alet → dönem vurgusu */
  space.addEventListener('mouseover',ev=>{const t=ev.target.closest('.fz-tool');document.querySelectorAll('.fz-ep').forEach(el=>el.classList.toggle('hl',!!t&&EP[+el.dataset.i].tools.includes(t.dataset.t)));
    document.querySelectorAll('#fzCone .fz-sl').forEach(g=>g.classList.toggle('hl',!!t&&EP[+g.dataset.i].tools.includes(t.dataset.t)))});
  $('fzPrev').onclick=()=>{stopPlay();select(sel-1,true)};$('fzNextE').onclick=()=>{stopPlay();select(sel+1,true)};
  $('fzAll').onclick=()=>{stopPlay();allMode=!allMode;renderDetail();if(allMode)$('fzDetail').scrollIntoView({behavior:'smooth',block:'start'})};
  $('fzPlay').onclick=()=>{if(playT){stopPlay();return}if(sel>=EP.length-1)select(0,true);$('fzPlay').textContent='⏸ Durdur';$('fzPlay').classList.add('on');playT=setInterval(()=>{if(sel>=EP.length-1)return stopPlay();select(sel+1,true)},7000)};
  const fs=on=>{document.body.classList.toggle('fz-full',on);$('fzFs').textContent=on?'✕ Tam ekrandan çık':'⛶ Tam ekran';setTimeout(layoutCone,50)};
  $('fzFs').onclick=()=>fs(!document.body.classList.contains('fz-full'));
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&document.body.classList.contains('fz-full'))fs(false)});
  /* fareyle sürükleyerek kaydır */
  const sc=$('fzScroll');let dx=null,sl=0,mv=0;
  sc.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||vert||e.target.closest('a,button'))return;dx=e.clientX;sl=sc.scrollLeft;mv=0});
  addEventListener('pointermove',e=>{if(dx==null)return;mv=Math.max(mv,Math.abs(e.clientX-dx));sc.scrollLeft=sl-(e.clientX-dx);if(mv>5)sc.dataset.drag=1});
  addEventListener('pointerup',()=>{dx=null;setTimeout(()=>delete sc.dataset.drag,0)});
  /* görünüm: zaman çizelgesi / eski ders ağacı */
  let treeLoaded=false;
  const view=t=>{$('fzTl').hidden=t;$('fzTree').hidden=!t;$('fzV1').classList.toggle('on',!t);$('fzV2').classList.toggle('on',t);
    if(t&&!treeLoaded){treeLoaded=true;const s=document.createElement('script');s.src='js/tree.js?v=202611231058';document.body.appendChild(s)}
    if(!t)setTimeout(refresh,0)};
  $('fzV1').onclick=()=>view(false);$('fzV2').onclick=()=>view(true);
  layoutCone();
};
})();

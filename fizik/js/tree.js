(function(){
  const svg=document.getElementById('techSvg'); if(!svg) return;
  const info=document.getElementById('techInfo');
  const prog=document.getElementById('techProg');

  const NODES=[
    {id:'newton', nm:'🍎 Hareket ve Kütleçekimi', tier:0, v:50, pre:[], tab:'newton',
      d:'Newton yasaları, kütle ve ağırlık, yörüngeler. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Isaac Newton 1687\'de Principia\'da hareket yasalarını ve evrensel çekim yasasını yazdı: F = m·a ve iki kütle birbirini çeker. Aynı yasalar elmanın düşmesini ve gezegenlerin dönmesini açıklar.', real:[["🏀", "Basketbol topunun yörüngesini kuvvetlerden tahmin etmek"], ["🛰️", "Uydu ve gezegen yörüngeleri"], ["⚖️", "Ay’da ağırlığın değişmesi, kütlenin değişmemesi"]], sub:["Newton yasaları", "Kütle ve ağırlık", "Yörüngeler", "Kendini test (10 soruluk havuz)"]},
    {id:'enerji', nm:'🔋 Enerji ve Korunum', tier:1, v:50, pre:["newton"], tab:'enerji',
      d:'Kinetik ve potansiyel enerji, iş, enerjinin korunumu. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Enerjinin korunumu 19. yüzyılda Joule, Mayer, Helmholtz gibi isimlerin çalışmalarıyla yerleşti: enerji yaratılmaz ya da yok edilmez, biçim değiştirir. Birimi joule, James Prescott Joule\'un adındandır.', real:[["🚗", "Fren yapınca hareket enerjisinin ısıya dönüşmesi"], ["🎢", "Lunapark treni: yükseklik ↔ hız"], ["🍎", "Elmayı kaldırmak: kimyasal enerji → potansiyel enerji"]], sub:["Kinetik ve potansiyel enerji", "Iş", "Enerjinin korunumu", "Kendini test (10 soruluk havuz)"]},
    {id:'em', nm:'🧲 Elektromanyetizma', tier:2, v:50, pre:["enerji"], tab:'em',
      d:'Coulomb yasası, Maxwell denklemleri, elektromanyetik dalga. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Coulomb 1780\'lerde yük yasalarını ölçtü, Faraday indüklemeyi buldu, Maxwell 1860\'larda dört denklemle elektrik, manyetizma ve ışığı birleştirdi. Işığın bir elektromanyetik dalga olduğu bu birleşmeden çıktı.', real:[["📶", "Wi-Fi, Bluetooth ve radyo dalgaları"], ["🔌", "Elektrik devreleri: gerilim, akım, direnç"], ["💡", "Görünür ışık da bir elektromanyetik dalgadır"]], sub:["Coulomb yasası", "Maxwell denklemleri", "Elektromanyetik dalga", "Kendini test (10 soruluk havuz)"]},
    {id:'isik', nm:'💡 Işık ve Görelilik', tier:3, v:30, pre:["em"], tab:'isik',
      d:'Işık hızı, görelilik, E=mc², füzyon ve fisyon. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Einstein 1905\'te özel görelilik ve E=mc² ile, 1915\'te genel görelilikle kütleçekimini uzay-zamanın eğriliği olarak yazdı. Işık hızı boşlukta tam 299.792.458 m/sn kabul edilen bir sabittir.', real:[["🛰️", "GPS saatleri görelilik düzeltmesi ister"], ["☀️", "Güneş: füzyonla kütle enerjiye dönüşür"], ["☢️", "Nükleer santraller: fisyon"]], sub:["Işık hızı", "Görelilik", "E=mc²", "Füzyon ve fisyon", "Kendini test (10 soruluk havuz)"]},
    {id:'kuant', nm:'🎲 Kuantum Dünyası', tier:3, v:70, pre:["em"], tab:'kuant',
      d:'Dalga-parçacık ikiliği, çift yarık, belirsizlik. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Planck 1900\'de enerji paketlerini, Einstein 1905\'te foton fikrini, de Broglie madde dalgalarını, Schrödinger 1926\'da dalga denklemini, Heisenberg belirsizlik ilkesini ortaya koydu.', real:[["💻", "Transistör ve yarı iletkenler"], ["🔬", "Elektron mikroskobu ve lazer"], ["🔐", "Kuantum bilgisayar ve şifreleme araştırmaları"]], sub:["Dalga-parçacık ikiliği", "Çift yarık", "Belirsizlik", "Kendini test (10 soruluk havuz)"]},
    {id:'planck', nm:'📏 Planck Ölçekleri', tier:4, v:50, pre:["isik", "kuant"], tab:'planck',
      d:'Planck uzunluğu, zamanı ve sıcaklığı; evrenin en küçük ve en sıcak sınırı. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Max Planck 1900\'de enerjinin paketler hâlinde (kuantum) alınıp verildiğini önerdi; 1899\'da sabitlerinden doğal birim sistemi yazdı. Planck uzunluğu yaklaşık 1,6×10⁻³⁵ m, Planck zamanı yaklaşık 5,4×10⁻⁴⁴ sn, Planck sıcaklığı yaklaşık 1,4×10³² K.', real:[["📏", "Fizik sabitlerinden doğan “doğal” ölçü birimleri"], ["🧪", "Kuantum kütleçekimi araştırmalarının sınırı"], ["🌡️", "Aşırı sıcak plazmalarda ölçek duygusu"]], sub:["Planck uzunluğu", "Zamanı ve sıcaklığı; evrenin en küçük ve en sıcak sınırı", "Kendini test (10 soruluk havuz)"]},
    {id:'kuvvet', nm:'⚛️ Dört Kuvvet ve Birleşme', tier:5, v:50, pre:["planck"], tab:'kuvvet',
      d:'Kütleçekimi, elektromanyetizma, güçlü ve zayıf kuvvet; yüksek enerjide birleşme. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Maxwell 1860\'larda elektriği ve manyetizmayı tek kuramda birleştirdi; Glashow, Weinberg ve Salam 1960\'larda elektromanyetizma ile zayıf kuvveti birleştirdi (1979 Nobel).', real:[["🧲", "Mıknatıs ve elektrik: elektromanyetizma"], ["☀️", "Güneş’in ışığı: güçlü ve zayıf kuvvet"], ["🌍", "Yer çekimi: kütleçekimi"]], sub:["Kütleçekimi", "Elektromanyetizma", "Güçlü ve zayıf kuvvet; yüksek enerjide birleşme", "Kendini test (10 soruluk havuz)"]},
    {id:'enflasyon', nm:'🎈 Enflasyon', tier:6, v:50, pre:["kuvvet"], tab:'enflasyon',
      d:'Üstel genişleme, düzlük ve tekdüzelik, kuantum dalgalanmaları. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Alan Guth 1980 dolaylarında enflasyon fikrini öne sürdü; Linde, Albrecht ve Steinhardt modeli düzeltti. Fikir, evrenin ilk anlarında çok kısa bir üstel genişleme yaşadığıdır.', real:[["🔭", "Evrenin neden bu kadar düz ve tekdüze olduğunu açıklar"], ["📡", "Kozmik artalandaki küçük dalgalanmaların kökeni"], ["🌌", "Galaksilerin tohumları"]], sub:["Üstel genişleme", "Düzlük ve tekdüzelik", "Kuantum dalgalanmaları", "Kendini test (10 soruluk havuz)"]},
    {id:'madde', nm:'⚖️ Madde ve Karşıt Madde', tier:7, v:25, pre:["enflasyon"], tab:'madde',
      d:'Yeniden ısınma, çift oluşumu ve yok oluşu, küçük fazlalık. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Andrei Sakharov 1967\'de maddenin karşıt maddeye göre fazla olabilmesi için gereken üç koşulu yazdı. Evrenin neden maddeden oluştuğu hâlâ tam çözülmüş değildir.', real:[["🏥", "PET tarayıcıları: karşıt madde (pozitron) tıpta kullanılır"], ["⚡", "Çift oluşumu ve yok oluşu: E=mc² örneği"], ["🌍", "Evrenin neden maddeden oluştuğu sorusu"]], sub:["Yeniden ısınma", "Çift oluşumu ve yok oluşu", "Küçük fazlalık", "Kendini test (10 soruluk havuz)"]},
    {id:'higgs', nm:'⛰️ Higgs ve Kütle', tier:7, v:75, pre:["kuvvet", "enflasyon"], tab:'higgs',
      d:'Simetri kırılması, Higgs alanı, parçacık kütleleri. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Higgs, Englert, Brout ve başkaları 1964\'te kütle mekanizmasını önerdi; Higgs bozonu 2012\'de CERN\'de gözlendi, 2013 Nobel Fizik Ödülü verildi.', real:[["⚛️", "2012 LHC keşfi"], ["⚖️", "Parçacıkların kütle kazanması"], ["🧠", "Simetri kırılması: faz geçişleri (buz, mıknatıs)"]], sub:["Simetri kırılması", "Higgs alanı", "Parçacık kütleleri", "Kendini test (10 soruluk havuz)"]},
    {id:'kuark', nm:'🔴 Kuarklar ve Gluonlar', tier:8, v:50, pre:["higgs", "madde"], tab:'kuark',
      d:'Renk yükü, hapsolma, kuark-gluon plazması. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Gell-Mann ve Zweig 1964\'te kuark fikrini önerdi; Gross, Wilczek ve Politzer 1973\'te asimptotik özgürlüğü buldu (2004 Nobel): kuarklar yakında neredeyse serbest, uzakta hapsolmuş davranır.', real:[["🔬", "Proton/nötron içi yapı"], ["💥", "LHC ve RHIC’de kuark-gluon plazması"], ["🧲", "Güçlü kuvvet: çekirdeği bir arada tutar"]], sub:["Renk yükü", "Hapsolma", "Kuark-gluon plazması", "Kendini test (10 soruluk havuz)"]},
    {id:'hadron', nm:'🧲 Proton ve Nötron', tier:9, v:50, pre:["kuark"], tab:'hadron',
      d:'Kuarklardan hadronlar, kütlenin kaynağı, nötron-proton oranı. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Rutherford 1919 dolaylarında protonu tanımladı, Chadwick 1932\'de nötronu keşfetti. Protonun kütlesinin yalnız yaklaşık %1\'i kuarkların kütlesinden gelir; geri kalanı gluon alanının enerjisidir.', real:[["⚛️", "Atom çekirdeklerinin yapı taşları"], ["☢️", "Radyoaktif bozunma"], ["🧬", "Maddenin kütlesinin çoğunun kökeni"]], sub:["Kuarklardan hadronlar", "Kütlenin kaynağı", "Nötron-proton oranı", "Kendini test (10 soruluk havuz)"]},
    {id:'notrino', nm:'👻 Nötrinolar', tier:10, v:50, pre:["hadron"], tab:'notrino',
      d:'Zayıf etkileşim, ayrılma, Poltergeist deneyi. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Pauli 1930\'da beta bozunumunda kaybolan enerjiyi açıklamak için nötrinoyu önerdi; Cowan ve Reines 1956\'da nükleer reaktör yakınında doğrudan gözlemledi (Poltergeist projesi).', real:[["☀️", "Güneş’ten saniyede trilyonlarcası bedenimizden geçer"], ["💥", "Süpernova uyarısı"], ["🔭", "Yeraltı nötrino dedektörleri"]], sub:["Zayıf etkileşim", "Ayrılma", "Poltergeist deneyi", "Kendini test (10 soruluk havuz)"]},
    {id:'nukleo', nm:'🔥 İlk Çekirdekler (Nükleosentez)', tier:11, v:50, pre:["notrino"], tab:'nukleo',
      d:'Döteryum darboğazı, helyum-4, ilk elementlerin oranı. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Alpher, Bethe ve Gamow 1948\'de Büyük Patlama\'da hafif elementlerin oluştuğunu hesapladı; sonraki çalışmalar helyum ve döteryum oranlarını gözlemlerle karşılaştırdı.', real:[["🎈", "Evrendeki ilk hidrojen/helyum oranı"], ["🔭", "Gözlemlerle test edilen kozmoloji"], ["⭐", "Yıldızların başlangıç yakıtı"]], sub:["Döteryum darboğazı", "Helyum-4", "Ilk elementlerin oranı", "Kendini test (10 soruluk havuz)"]},
    {id:'atom', nm:'🌫️ İlk Atomlar', tier:12, v:30, pre:["nukleo"], tab:'atom',
      d:'Yeniden birleşme, 380 bin yıl, şeffaflaşan evren. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Yaklaşık 380.000 yıl sonra, sıcaklık ≈ 3000 K’e düşünce elektronlar çekirdeklere bağlandı: evren şeffaflaştı. İyonlaşma dengesini Saha denklemi verir (1920); evren için ayrıntılı hesap 1960’larda yapıldı.', real:[["💡", "İlk ışığın serbest kalması"], ["🌫️", "Şeffaflaşan evren"], ["⚛️", "Atomun doğuşu"]], sub:["Yeniden birleşme", "380 bin yıl", "Şeffaflaşan evren"]},
    {id:'karanlik', nm:'🕳️ Karanlık Madde', tier:12, v:70, pre:["nukleo"], tab:'karanlik',
      d:'Görünmeyen kütle, iskelet, WIMP ve MACHO adayları. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Zwicky 1933’te Coma kümesindeki galaksilerin hızlarından görünmez kütle çıkardı; Vera Rubin ve ekibi 1970’lerde Andromeda’nın dönüş eğrisinde aynı sonuca vardı. Karanlık madde bugün kozmolojik ölçümlerde maddenin yaklaşık %85’i kadardır; ne olduğu bilinmiyor.', real:[["🌀", "Galaksi dönüş eğrileri"], ["🔭", "Kütleçekimsel merceklenme"], ["🕸️", "Kozmik ağın iskeleti"]], sub:["Görünmeyen kütle", "Iskelet", "WIMP ve MACHO adayları"]},
    {id:'cmb', nm:'📡 Kozmik Mikrodalga Artalan', tier:13, v:30, pre:["atom"], tab:'cmb',
      d:'İlk ışığın bugünkü soğuk kalıntısı, Penzias ve Wilson. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Penzias ve Wilson 1965’te Bell Labs boynuz antenindeki durmayan radyo hışırtısını fark etti; yorumu Princeton’da Dicke’in grubu yaptı (1978 Nobel). COBE, WMAP ve Planck uyduları haritayı çıkardı.', real:[["📡", "Eski televizyon parazitinin bir kısmı"], ["🔭", "Planck ve WMAP uyduları"], ["🧭", "Evrenin yaşını ve içeriğini ölçmek"]], sub:["İlk ışığın bugünkü soğuk kalıntısı", "Penzias ve Wilson"]},
    {id:'yapi', nm:'🕸️ Yapının Oluşumu', tier:14, v:50, pre:["cmb", "karanlik"], tab:'yapi',
      d:'Filamanlar, halolar, ilk yıldızların beşikleri. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Baryonik akustik salınımlar 2005’te galaksi dağılımında (Eisenstein ve ekibi) bulundu; ≈ 150 Mpc’lik standart cetvel genişleme tarihçesini ölçer. Kozmik ağ süper bilgisayar simülasyonlarıyla incelenir.', real:[["🕸️", "Kozmik ağ"], ["🌌", "Galaksi kümeleri"], ["🧪", "Süper bilgisayar simülasyonları"]], sub:["Filamanlar", "Halolar", "Ilk yıldızların beşikleri"]},
    {id:'yildiz', nm:'⭐ Yıldızların Doğuşu', tier:15, v:50, pre:["yapi"], tab:'',
      d:'Gaz bulutunun çökmesi, füzyonun tutuşması. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[["⭐", "Yıldız bebek yuvaları (nebulalar)"], ["🔭", "Teleskopla gaz bulutu gözlemi"], ["☀️", "Güneş’in doğuşu"]], sub:["Gaz bulutunun çökmesi", "Füzyonun tutuşması"]},
    {id:'evrim', nm:'🌞 Yıldız Evrimi ve Füzyon', tier:16, v:35, pre:["yildiz"], tab:'',
      d:'Hidrojenden demire, kütleye göre yaşam çizgisi. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[["☀️", "Güneş’in yakıtı"], ["🔴", "Kırmızı dev ve beyaz cüce"], ["🧪", "Füzyon reaktörleri"]], sub:["Hidrojenden demire", "Kütleye göre yaşam çizgisi"]},
    {id:'supernova', nm:'💥 Süpernova ve Ağır Elementler', tier:17, v:25, pre:["evrim"], tab:'',
      d:'Yıldız ölümü, demirden ağır elementler. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[["💍", "Altın ve platin gibi ağır elementlerin kökeni"], ["🩸", "Vücudumuzdaki demirin kaynağı"], ["🔭", "Uzaklık ölçmek: Tip Ia süpernovalar"]], sub:["Yıldız ölümü", "Demirden ağır elementler"]},
    {id:'kara', nm:'⚫ Kara Delikler', tier:17, v:75, pre:["evrim"], tab:'',
      d:'Olay ufku, çöküş, kütleçekimi dalgaları. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[["🌀", "Olay Ufku Teleskobu görüntüleri"], ["🌊", "LIGO kütleçekimi dalgaları"], ["🛰️", "Galaksi merkezlerinde devasa kara delikler"]], sub:["Olay ufku", "Çöküş", "Kütleçekimi dalgaları"]},
    {id:'galaksi', nm:'🌌 Galaksiler', tier:18, v:50, pre:["yapi", "supernova"], tab:'',
      d:'Gökada türleri, Samanyolu, birleşmeler. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[["🌌", "Samanyolu"], ["🔭", "Andromeda ile gelecekteki birleşme"], ["🌠", "Gökada türleri"]], sub:["Gökada türleri", "Samanyolu", "Birleşmeler"]},
    {id:'karanlikE', nm:'🚀 Genişleme ve Karanlık Enerji', tier:19, v:50, pre:["galaksi"], tab:'',
      d:'Hubble yasası, hızlanan genişleme. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[["🔭", "Hubble yasası"], ["🚀", "Hızlanan genişleme"], ["⚖️", "Evrenin içeriği: yaklaşık %68 karanlık enerji"]], sub:["Hubble yasası", "Hızlanan genişleme"]},
    {id:'gunes', nm:'🪐 Güneş Sistemi', tier:20, v:50, pre:["galaksi", "supernova"], tab:'',
      d:'Gezegen oluşumu, Dünya. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[["🪐", "Gezegen oluşumu"], ["🌍", "Dünya’nın oluşumu"], ["☄️", "Kuyruklu yıldızlar ve asteroitler"]], sub:["Gezegen oluşumu", "Dünya"]},
    {id:'termo', nm:'🌡️ Entropi ve Zamanın Oku', tier:21, v:70, pre:["gunes"], tab:'',
      d:'Termodinamik, düzensizlik, zamanın yönü. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[["☕", "Kahve soğur, geri ısınmaz"], ["⚙️", "Isı makineleri"], ["⏳", "Zamanın yönü"]], sub:["Termodinamik", "Düzensizlik", "Zamanın yönü"]},
    {id:'kimya', nm:'🧪 Kimyanın Fiziği', tier:22, v:50, pre:["kuant", "gunes"], tab:'',
      d:'Kimyasal bağ, moleküller, yaşamın ham maddesi. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[["🧬", "Yaşamın temel molekülleri"], ["💧", "Suyun özellikleri"], ["🔋", "Pil kimyası"]], sub:["Kimyasal bağ", "Moleküller", "Yaşamın ham maddesi"]},
    {id:'gelecek', nm:'🔮 Evrenin Geleceği', tier:23, v:50, pre:["karanlikE", "termo", "kimya"], tab:'',
      d:'Isı ölümü, büyük yırtılma, büyük sıkışma, sönen yıldızlar. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[["🔭", "Evrenin kaderi için modeller"], ["⭐", "Yıldızların sönmesi"], ["❄️", "Isı ölümü senaryosu"]], sub:["Isı ölümü", "Büyük yırtılma", "Büyük sıkışma", "Sönen yıldızlar"]}
  ];
  const ERAS=[
    {t0:0,t1:3,nm:'🧰 ALET ÇANTASI', newStyle:true, c:'150,170,255'},
    {t0:4,t1:8,nm:'⏱️ İLK AN', newStyle:true, c:'169,139,255'},
    {t0:9,t1:11,nm:'⚛️ PARÇACIKTAN ÇEKİRDEĞE', newStyle:true, c:'255,122,170'},
    {t0:12,t1:14,nm:'💡 İLK IŞIK VE KARANLIK MADDE', newStyle:true, c:'255,201,60'},
    {t0:15,t1:19,nm:'⭐ YILDIZLAR VE ELEMENTLER', newStyle:true, c:'80,200,240'},
    {t0:20,t1:23,nm:'🪐 GEZEGENLER VE ZAMAN', newStyle:true, c:'120,220,150'}
  ];
  const byId={}; NODES.forEach(n=>byId[n.id]=n);
  // Madalyon tarzı yeni kart diline geçiş KADEMELİ — sadece newStyle:true
  // işaretli çağların düğümleri bu dili kullanır (bkz. CLAUDE.md). Önce
  // TEMELLER ÇAĞI canlıya alınıyor; kullanıcı onaylayınca sıradaki çağ
  // buraya (era.newStyle=true) eklenerek genelleştirilecek.
  function isNewStyle(n){
    const idx = ERAS.findIndex(e=>n.tier>=e.t0 && n.tier<=e.t1);
    return idx>=0 && !!ERAS[idx].newStyle;
  }

  const KD='fz_tt_done_v1', KS='fz_tt_sub_v1';
  let done, subs;
  try{ done=new Set(JSON.parse(localStorage.getItem(KD)||'[]')); }catch(e){ done=new Set(); }
  try{ subs=new Set(JSON.parse(localStorage.getItem(KS)||'[]')); }catch(e){ subs=new Set(); }
  function save(){ try{ localStorage.setItem(KD, JSON.stringify([...done])); localStorage.setItem(KS, JSON.stringify([...subs])); }catch(e){} }

  function subCount(n){ let k=0; n.sub.forEach((_,i)=>{ if(subs.has(n.id+':'+i)) k++; }); return k; }
  function stateOf(n){
    if(done.has(n.id)) return 'done';
    if(n.pre.every(p=>done.has(p))) return 'avail';
    return 'locked';
  }

  /* Yatay (masaüstü): tier→X, v→Y — çağlar soldan sağa sütun.
     Dikey (mobil, ≤BP_VERT): tier→Y, v→X — çağlar yukarıdan aşağı satır.
     İkisi de aynı X(n)/Y(n) arayüzünü sunduğu için kart çizim kodu, alt başlık
     metinleri vb. HİÇ değişmiyor — sadece layout() hangi eksenin ne anlama
     geldiğini yeniden tanımlıyor. render() her çağrıldığında güncel pencere
     genişliğine göre yeniden karar verir (resize/rotate anında tepki verir). */
  const BP_VERT=720;
  let TT_MODE='auto', TT_Z=0.925; const TT_Z0=0.925;
  const ttVert=()=> TT_MODE==='auto' ? window.innerWidth<=BP_VERT : TT_MODE==='v';
  let VERT=ttVert();
  // Yeni-stil (madalyon) kartlar eskisinden daha zengin içerik taşıdığı için
  // daha geniş/uzun — masaüstünde tam boy, dikey/mobil modda VERT slot
  // matematiği (mX=100 marjı, bkz. layout()) eski 184-birimlik kartlara göre
  // ayarlandığından kompakt bir boyuta küçülüyor (aksi halde kart canvas
  // dışına taşıp kırpılırdı).
  const NW=n=> isNewStyle(n) ? (VERT?210:236) : (n.crown?208:184);
  const NH=n=> isNewStyle(n) ? (VERT?104:112)+(n.alt&&n.alt.length?(VERT?14:10):0) : 78;   // alt dersli kartlarda 📎 satırı için ek yükseklik
  const ICR=19; // ikon dairesi yarıçapı
  let sel=null;
  let W,H,X,Y;
  let tierW=[]; // her tier'deki en geniş kartın genişliği (era-band kenar boşluğu için de kullanılıyor)
  function layout(){
    if(VERT){
      const mX=108, rowSp=172, topM=150, botM=90;
      // genişlik: en kalabalık satırdaki kartlar (210 birim + 24 boşluk) yan yana sığsın
      const _cnt={}; NODES.forEach(n=>{_cnt[n.tier]=(_cnt[n.tier]||0)+1});
      const maxK=Math.max(...Object.values(_cnt));
      const Wv=Math.max(680, 2*mX+(maxK-1)*234);
      const maxTier=Math.max(...NODES.map(n=>n.tier));
      // Yatay moddaki v-yüzdesini AYNEN kullanırsak dar mobil genişlikte 3 düğümlü
      // bir satırda kartlar üst üste biner (v'ler hesap edilirken 456px'lik dar bir
      // eksen değil, geniş yatay eksen düşünülmüştü). Bunun yerine: aynı çağdaki
      // (tier) düğümleri v'ye göre sırala (yatay moddaki okuma sırasını korumak için),
      // sonra sayılarına göre EŞİT ARALIKLI diz — kaç düğüm olursa olsun çakışma
      // garantili önlenir (1 düğüm→ortada, 2→uçlarda, 3→uç+orta+uç…).
      const byTier={};
      NODES.forEach(n=>{ (byTier[n.tier]=byTier[n.tier]||[]).push(n); });
      const slot=new Map();
      Object.values(byTier).forEach(arr=>{
        arr.sort((a,b)=>a.v-b.v);
        const k=arr.length;
        arr.forEach((n,i)=>slot.set(n.id, k===1?0.5:i/(k-1)));
      });
      W=Wv; H=topM+maxTier*rowSp+botM;
      X=n=>mX+(Wv-2*mX)*slot.get(n.id);
      Y=n=>topM+n.tier*rowSp;
    } else {
      // Tier X'leri artık SABİT 205 birim değil, o tier'deki EN GENİŞ kartın
      // gerçek genişliğine göre KÜMÜLATİF hesaplanıyor — newStyle kartlar
      // (300 birim) eski kartlardan (184-208) çok daha geniş olduğu için
      // sabit aralık iki komşu tier'i üst üste bindirirdi.
      const maxTier=Math.max(...NODES.map(n=>n.tier));
      const GAP=30; // tier'ler arası minimum boşluk (kablo dirseği + nefes payı)
      const MARGIN=40; // sol/sağ kenar boşluğu
      const tierX=[];
      tierW=[];
      for(let t=0;t<=maxTier;t++){
        const ns=NODES.filter(n=>n.tier===t);
        tierW[t]=ns.length?Math.max(...ns.map(NW)):184;
      }
      for(let t=0;t<=maxTier;t++){
        // İlk tier'in X'i kendi yarı-genişliği + kenar boşluğu kadar sağdan
        // başlar — sabit bir sayı (eski kod: 125) 300 birimlik yeni kartlarda
        // canvas'ın SOLUNA taşıp kırpılmaya yol açardı.
        tierX[t]= t===0 ? (tierW[0]/2+MARGIN) : tierX[t-1]+tierW[t-1]/2+GAP+tierW[t]/2;
      }
      { const cnt={}; NODES.forEach(n=>{cnt[n.tier]=(cnt[n.tier]||0)+1;}); const mx=Math.max(...Object.values(cnt));
        H=Math.max(560, mx*(112+10)+(mx-1)*18+150); }   // 4 kartlı sütun (iki kol) sığsın
      X=n=>tierX[n.tier];
      // Y ARTIK n.v'nin ham yüzdesi değil — v sadece aynı tier içindeki
      // SIRALAMA için (hangi düğüm üstte/altta görünsün) kullanılıyor.
      // Gerçek Y, o tier'deki düğümlerin GERÇEK yüksekliğine (NH) göre üst
      // üste binmeyecek şekilde eşit aralıklarla, tier'in dikey ortasına
      // (H/2) göre ortalanarak hesaplanıyor — sabit yüzde eski (78 birim)
      // kartlara göre ayarlıydı, yeni (150 birim) kartlarda aynı tier
      // içinde iki düğüm birbirine binerdi (örn. Vektör&Nokta / RNN).
      const byTierY={};
      NODES.forEach(n=>{ (byTierY[n.tier]=byTierY[n.tier]||[]).push(n); });
      const yPos=new Map();
      const VGAP=18;
      Object.values(byTierY).forEach(arr=>{
        arr.sort((a,b)=>a.v-b.v);
        const totalH=arr.reduce((s,n)=>s+NH(n),0)+VGAP*(arr.length-1);
        let cy=H/2-totalH/2;
        arr.forEach(n=>{ yPos.set(n.id, cy+NH(n)/2); cy+=NH(n)+VGAP; });
      });
      Y=n=>yPos.get(n.id);
      W=tierX[maxTier]+tierW[maxTier]/2+MARGIN+100;
    }
  }

  function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  const DEFS=
    '<defs>'
    +'<radialGradient id="tnGradDone" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#a8d896"/><stop offset="100%" stop-color="#4a8a3f"/></radialGradient>'
    +'<radialGradient id="tnGradAvail" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffe9a8"/><stop offset="100%" stop-color="#c9962f"/></radialGradient>'
    +'<radialGradient id="tnGradLocked" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#c9b98f"/><stop offset="100%" stop-color="#8a7550"/></radialGradient>'
    +'<pattern id="eaPp" width="46" height="46" patternUnits="userSpaceOnUse"><circle cx="6" cy="9" r=".9" fill="#7a5af0" fill-opacity=".16"/><circle cx="31" cy="4" r=".7" fill="#7a5af0" fill-opacity=".12"/><circle cx="19" cy="28" r="1" fill="#7a5af0" fill-opacity=".14"/><circle cx="40" cy="35" r=".8" fill="#7a5af0" fill-opacity=".15"/><circle cx="11" cy="41" r=".7" fill="#7a5af0" fill-opacity=".12"/><path d="M2 20 l5 -1 M26 15 l6 1 M33 24 l5 -2 M14 6 l4 1" stroke="#7a5af0" stroke-opacity=".12" stroke-width=".8"/></pattern>'
    +'<pattern id="eaOrn" width="64" height="28" patternUnits="userSpaceOnUse"><path d="M32 3 L43 14 L32 25 L21 14 Z M32 8 L38 14 L32 20 L26 14 Z M0 14 H21 M43 14 H64 M12 14 Q18 4 26 7 M52 14 Q46 4 38 7 M12 14 Q18 24 26 21 M52 14 Q46 24 38 21" fill="none" stroke="#7a5af0" stroke-opacity=".4" stroke-width="1.4"/><circle cx="32" cy="14" r="2" fill="#7a5af0" fill-opacity=".45"/></pattern>'
    +'</defs>';


  /* ---- Çağ arka planları (#551): her çağın bandında kendi tonu + konusunu anlatan soluk çizim ----
     Civ tarzı "çağa göre değişen arka plan" fikri; çizimler bize özgü (oyun görsellerinden kopya değil).
     Her sahne 400×300'lük kendi koordinatında çizilir, banda sığacak şekilde ölçeklenir.
     Kartlar üstte durur; çizim yalnız aralardan görünür (opacity düşük). */
  const ART=(function(){
    const N=v=>(+v).toFixed(1);
    const P=(d,c)=>'<path d="'+d+'" class="'+(c||'ea-s')+'"/>';
    const C=(x,y,r,c)=>'<circle cx="'+N(x)+'" cy="'+N(y)+'" r="'+r+'" class="'+(c||'ea-s')+'"/>';
    const E=(x,y,rx,ry,c)=>'<ellipse cx="'+N(x)+'" cy="'+N(y)+'" rx="'+rx+'" ry="'+ry+'" class="'+(c||'ea-s')+'"/>';
    const T=(x,y,s,sz)=>'<text x="'+N(x)+'" y="'+N(y)+'" class="ea-t" style="font-size:'+(sz||14)+'px">'+s+'</text>';
    const o={};
    o.t1=()=>{let g=C(200,150,6,'ea-b');for(let i=1;i<=4;i++)g+=C(200,150,i*34);for(let k=0;k<12;k++){const a=k*Math.PI/6;g+=P('M'+N(200+Math.cos(a)*10)+' '+N(150+Math.sin(a)*10)+'L'+N(200+Math.cos(a)*140)+' '+N(150+Math.sin(a)*140))}g+=T(150,292,'t = 0',16);return g;};
    o.t2=()=>{let g=C(110,150,28,'ea-b')+C(110,150,12)+C(290,100,16,'ea-b')+C(290,210,16,'ea-b')+C(200,150,5,'ea-b');
      g+=P('M138 150Q200 60 274 100','ea-dash')+P('M138 150Q200 240 274 210','ea-dash')+P('M290 116V194','ea-dash');g+=T(60,60,'p',20)+T(300,60,'n',20)+T(190,20,'u d u',14);return g;};
    o.t3=()=>{let g='';for(let i=0;i<9;i++){const x=40+i*40;g+=C(x,150,5+((i*7)%5),i%3?'ea-s':'ea-b');if(i<8)g+=P('M'+(x+8)+' 150H'+(x+32))}g+=P('M60 235Q120 170 190 190T330 140','ea-dash')+C(60,235,6,'ea-b')+C(330,140,6,'ea-b')+T(110,275,'ışık ve madde',14);return g;};
    o.t4=()=>{let g=E(200,150,150,48)+E(200,150,150,48,'ea-dash');g+=C(200,150,22,'ea-b')+P('M178 150h44M200 128v44');for(let i=0;i<14;i++){const a=i/14*6.283,r=105+((i*13)%20);g+=C(200+Math.cos(a)*r,150+Math.sin(a)*r*0.45,3+((i*3)%3),'ea-b')}g+=P('M60 250Q200 200 340 250','ea-dash')+T(130,285,'galaksi',14);return g;};
    o.t5=()=>{let g=C(200,150,34,'ea-b')+C(200,150,50);for(let i=0;i<8;i++){const a=i*Math.PI/4;g+=P('M'+N(200+Math.cos(a)*56)+' '+N(150+Math.sin(a)*56)+'L'+N(200+Math.cos(a)*88)+' '+N(150+Math.sin(a)*88))}g+=E(200,150,170,40,'ea-dash')+C(350,150,10,'ea-b')+C(60,150,6)+C(120,235,5)+T(160,285,'gezegenler',14);return g;};
    o.t0=()=>{let g=C(200,150,30,'ea-b')+E(200,150,120,40,'ea-dash')+C(320,150,8,'ea-b')+P('M60 260Q130 120 200 260','ea-dash');g+=P('M50 80q30-40 60 0t60 0t60 0t60 0','ea-b')+T(120,290,'F = m a',18);return g;};
    return o;
  })();

  // Bir çizimi kutuya (x,y,w,h) sığdırıp çiz — Civ 6'daki gibi sönük, tek tonlu gravür çizgi (kartların önüne geçmez)
  function artBox(key,x,y,w,h,c,topAnchor){
    const sc=Math.min(w/400,h/300)*0.96, dw=400*sc, dh=300*sc, ox=x+(w-dw)/2, oy=topAnchor? y+2 : y+(h-dh)/2;   // topAnchor: ana özne kartların ÜSTÜNDE kalsın (kartlar bandın ortasında toplanıyor)
    return '<g class="era-art" style="--ea:'+c+'" transform="translate('+ox.toFixed(1)+','+oy.toFixed(1)+') scale('+sc.toFixed(3)+')">'+ART[key]()+'</g>';
  }
  // Kartların kapladığı dikdörtgenler (çizimi boş alana koymak için)
  function cardRects(e){
    return NODES.filter(n=>n.tier>=e.t0 && n.tier<=e.t1).map(n=>{const w=NW(n),h=NH(n); return [X(n)-w/2-14,Y(n)-h/2-14,w+28,h+28];});
  }
  function ovl(a,b){ const w=Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]), h=Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]); return (w>0&&h>0)?w*h:0; }
  // Bölgede (x,y,w,h) kartlara en az binen, olabildiğince büyük 4:3 kutu
  function freeSpot(x,y,w,h,rects){
    for(const fr of [1,.85,.72,.6,.5,.42,.35,.28]){
      const bw=Math.min(w*fr,h*fr*4/3), bh=bw*.75; if(bw<150) break;
      let best=null, bo=1e18;
      for(let yy=y; yy+bh<=y+h+0.5; yy+=Math.max(12,(h-bh)/14||12)) for(let xx=x; xx+bw<=x+w+0.5; xx+=Math.max(12,(w-bw)/14||12)){
        let o=0; rects.forEach(r=>o+=ovl([xx,yy,bw,bh],r)); if(o<bo){bo=o; best=[xx,yy,bw,bh];}
      }
      if(best && bo/(bw*bh)<0.1) return best;
    }
    return null;
  }
  // Bant zemini: çağ tonu + parşömen tanesi + yunan kıvrımlı friz + dikey çağ adı filigranı + sönük gravür çizim
  function eraArt(i,e,x,y,w,h){
    let g='<defs><linearGradient id="eaG'+i+'" x1="0" y1="0" x2="'+(VERT?1:0)+'" y2="'+(VERT?0:1)+'"><stop offset="0" stop-color="rgb('+e.c+')" stop-opacity=".1"/><stop offset=".5" stop-color="rgb('+e.c+')" stop-opacity=".02"/><stop offset="1" stop-color="rgb('+(e.c2||e.c)+')" stop-opacity=".09"/></linearGradient>'
      +'<radialGradient id="eaV'+i+'" cx="50%" cy="50%" r="78%"><stop offset=".55" stop-color="#3a2408" stop-opacity="0"/><stop offset="1" stop-color="#3a2408" stop-opacity=".42"/></radialGradient></defs>';
    g+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="url(#eaG'+i+')" pointer-events="none"/>';
    g+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="url(#eaPp)" pointer-events="none"/>';
    g+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="url(#eaV'+i+')" pointer-events="none"/>';
    const top=VERT?40:50;   // her çağda tek, büyük arka plan çizimi — bandın ortasında, kartların arkasında
    if(e.lanes){
      if(VERT){ g+=artBox('llm',x+6,y+top,w/2-12,h-top-34,e.c)+artBox('img',x+w/2+6,y+top,w/2-12,h-top-34,e.c2); }
      else { g+=artBox('llm',x+40,y+top,w-80,h/2-top-10,e.c)+artBox('img',x+40,y+h/2+8,w-80,h/2-44,e.c2); }
    } else g+=artBox('t'+i,x+6,y+top,w-12,h-top-34,e.c,true);
    // süslü üst ve alt şerit (Civ 6'daki kabartma desen şeridi gibi); üstte başlık kurdelesi bunun üzerine biner
    const strip=(yy)=>'<rect x="'+(x+8)+'" y="'+yy+'" width="'+(w-16)+'" height="28" fill="rgba(90,61,20,.1)" pointer-events="none"/><rect x="'+(x+8)+'" y="'+yy+'" width="'+(w-16)+'" height="28" fill="url(#eaOrn)" pointer-events="none"/>'
      +'<line x1="'+(x+8)+'" y1="'+yy+'" x2="'+(x+w-8)+'" y2="'+yy+'" class="ea-rule"/><line x1="'+(x+8)+'" y1="'+(yy+28)+'" x2="'+(x+w-8)+'" y2="'+(yy+28)+'" class="ea-rule"/>';
    g+=strip(y+3)+strip(y+h-31);
    const nm=e.nm.replace(/^\S+\s/,'');
    if(!VERT){ const tx=e.lanes? x+w-26 : x+26;
      g+='<text class="ea-wm" transform="translate('+tx+','+(y+h/2)+') rotate(-90)" text-anchor="middle">'+nm+'</text>'; }
    else g+='<text class="ea-wm ea-wm-v" x="'+(x+w/2)+'" y="'+(y+h-40)+'" text-anchor="middle">'+nm+'</text>';
    return g;
  }

  // Madalyon tarzı yeni kart — gerçek HTML/CSS'i <foreignObject> ile SVG
  // koordinat sistemine gömer (viewBox ölçeklemesiyle otomatik büyür/küçülür,
  // ayrı bir mobil/masaüstü CSS'i gerekmez). Seçim "yılan" kenarlığı ve
  // justUnlocked patlaması PAYLAŞILAN #techSvg .tn.sel/.justUnlocked
  // rect.tn-card kurallarını aynen kullanabilsin diye foreignObject'in
  // ALTINA (birkaç birim içeri çekilmiş) "hayalet" bir <rect class="tn-card">
  // ekleniyor — boşta hiçbir şey görünmez (foreignObject üstünü kaplar),
  // sadece bu iki durumun kenarlık/parıltı efekti dışarı taşıp görünür.
  function newCardSvg(n, st, k, N, icon, label, x, y, w, h){
    const badge = st==='done' ? 'Bitti' : st==='avail' ? (k+' / '+N) : 'Kilitli';
    const checkBadge = st==='done' ? '<div class="ttc-check">✓</div>' : '';
    const compact = VERT;
    // İkon çevresindeki ilerleme halkası — alt-konu tamamlanma yüzdesi
    // (k/N). Kilitli düğümlerde alt-konu işaretlenemediği için k hep 0
    // (bkz. show(), checkbox'lar locked'ta disabled), halka doğal olarak
    // boş kalır; done'da recompute()/manuel "hepsini tamamladım" k=N
    // yaptığı için halka hep tam dolu çıkar.
    const pct = N ? Math.round(k/N*100) : 0;
    let body = '<div class="ttc-head">'
        +'<div class="ttc-icon-wrap" style="--pct:'+pct+'"><div class="ttc-ring"></div><div class="ttc-icon">'+icon+'</div>'+checkBadge+'</div>'
        +'<div class="ttc-title">'+esc(label)+'</div>'
        +'<div class="ttc-badge">'+esc(badge)+'</div>'
      +'</div>';
    if(!compact){
      const chipsHtml = n.real.map(r=>'<div class="ttc-chip">'+r[0]+'</div>').join('');
      body += '<div class="ttc-chips">'+chipsHtml+'</div>';
    }
    const dotsHtml = n.sub.map((_,i)=>{
      const on = subs.has(n.id+':'+i);
      return '<div class="ttc-mdot'+(on?' on':'')+'">'+(on?'✓':'·')+'</div>';
    }).join('');
    if(n.alt && n.alt.length){
      body += '<div class="ttc-alt">'+(compact
        ? '<span class="ttc-altl" data-alt="0">📎 '+(n.alt.length===1? esc(n.alt[0].nm.replace(/^\S+\s/,'')) : n.alt.length+' alt ders')+'</span>'
        : '<span class="ttc-altk">📎 içerir:</span>'+n.alt.map((a,i)=>'<span class="ttc-altl" data-alt="'+i+'">'+esc(a.nm.replace(/^\S+\s/,''))+'</span>').join(''))+'</div>';
    }
    body += '<div class="ttc-mastery"><div class="ttc-mnum">'+N+'</div><div class="ttc-mdots">'+dotsHtml+'</div></div>';
    // gi=0: hayalet rect foreignObject ile TAM aynı sınırları paylaşıyor —
    // SVG stroke'u path üzerinde ORTALANDIĞI için yarısı dışarı taşar, bu
    // yüzden .sel/.justUnlocked'ın kenarlık efekti foreignObject'in altında
    // kaybolmadan, kart kenarının hemen dışında görünür kalır.
    const gi=0;
    return '<g class="tn tn-'+st+(sel===n.id?' sel':'')+' tn-newstyle" data-id="'+n.id+'">'
      +'<rect class="tn-card" x="'+(x+gi)+'" y="'+(y+gi)+'" width="'+(w-2*gi)+'" height="'+(h-2*gi)+'" rx="11" pathLength="100"/>'
      +'<foreignObject x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'">'
        +'<div xmlns="http://www.w3.org/1999/xhtml" class="ttc-card ttc-'+st+'">'+body+'</div>'
      +'</foreignObject>'
    +'</g>';
  }

  function render(){
    VERT=ttVert();
    layout();
    const svgWrap=svg.parentElement;
    svg.classList.toggle('techSvg-vert', VERT);
    svg.classList.toggle('techSvg-all-new', ERAS.every(e=>e.newStyle));
    // W artık sabit değil (newStyle kartların gerçek genişliğine göre kümülatif
    // hesaplanıyor, bkz. layout()) — CSS'teki sabit min-width yerine gerçek
    // içerik genişliğini JS'ten uyguluyoruz (1 SVG birimi ≈ 1 CSS px).
    // boyut: yatayda gerçek genişlik × yakınlık, dikeyde kap genişliğinin yüzdesi × yakınlık
    if(VERT){ svg.style.minWidth=''; svg.style.maxWidth=TT_Z===1?'':'none'; svg.style.width=TT_Z===1?'':(100*TT_Z)+'%'; }
    else { svg.style.minWidth=(W*TT_Z)+'px'; svg.style.width=TT_Z===1?'':(W*TT_Z)+'px'; svg.style.maxWidth=TT_Z===1?'':'none'; }
    if(svgWrap) svgWrap.style.overflowX = (VERT&&TT_Z<=1) ? 'visible' : 'auto';
    ttToolSync();
    const hint=document.getElementById('ttHint');
    if(hint) hint.textContent = VERT ? '⬇️ aşağı kaydırarak aşamalarda ilerle' : '➡️ sağa kaydırarak aşamalarda ilerle';
    const dir=document.getElementById('ttDir');
    if(dir) dir.textContent = VERT ? 'yukarıdan aşağı aşamalar' : 'soldan sağa aşamalar';

    let s=DEFS;
    // çağ bantları + ayraç çizgileri + kurdele etiket
    ERAS.forEach((e,i)=>{
      const bandCls='era-band'+(i%2?' alt':'')+(e.newStyle?' era-band-new':'');
      const ribCls='era-ribbon'+(e.newStyle?' era-ribbon-new':'');
      const lblCls='era-lbl'+(e.newStyle?' era-lbl-new':'');
      if(VERT){
        // üst boşluk 96px: normal düğümler için fazlasıyla yeterli, AMA asıl amacı
        // "kraliyet" (crown) kartının (★ 2017 ★ etiketi) çağın ilk satırında
        // olduğunda ribbon/etiketle çakışmasını önlemek — o yüzden alttan büyük
        const y0=Y({tier:e.t0})-96, y1=Y({tier:e.t1})+58;
        s+='<rect class="'+bandCls+'" x="14" y="'+y0+'" width="'+(W-28)+'" height="'+(y1-y0)+'" rx="8"/>';
        if(e.c) s+=eraArt(i,e,14,y0,W-28,y1-y0);
        const lw=Math.max(150, e.nm.length*7.2);
        s+='<rect class="'+ribCls+'" x="'+(W/2-lw/2)+'" y="'+(y0+8)+'" width="'+lw+'" height="22" rx="11"/>';
        s+='<text class="'+lblCls+'" x="'+(W/2)+'" y="'+(y0+23)+'" text-anchor="middle" style="font-size:10.5px; letter-spacing:1.5px">'+e.nm+'</text>';
        if(e.lanes){   // iki kol: solda dil, sağda görüntü — ortada kesik ayraç
          s+='<line class="era-lane-sep" x1="'+(W/2)+'" y1="'+(y0+40)+'" x2="'+(W/2)+'" y2="'+(y1-8)+'"/>';
          s+='<text class="era-lane-lbl" x="'+(W*0.16)+'" y="'+(y0+23)+'" text-anchor="middle">'+e.lanes[0][1]+'</text>';
          s+='<text class="era-lane-lbl" x="'+(W*0.84)+'" y="'+(y0+23)+'" text-anchor="middle">'+e.lanes[1][1]+'</text>';
        }
      } else {
        const x0=X({tier:e.t0})-(tierW[e.t0]||184)/2-30, x1=X({tier:e.t1})+(tierW[e.t1]||184)/2+30;
        s+='<rect class="'+bandCls+'" x="'+x0+'" y="10" width="'+(x1-x0)+'" height="'+(H-20)+'" rx="8"/>';
        if(e.c) s+=eraArt(i,e,x0,10,x1-x0,H-20);
        const cx=(x0+x1)/2, lw=Math.max(180, e.nm.length*8.6);
        s+='<rect class="'+ribCls+'" x="'+(cx-lw/2)+'" y="16" width="'+lw+'" height="26" rx="13"/>';
        s+='<text class="'+lblCls+'" x="'+cx+'" y="34" text-anchor="middle">'+e.nm+'</text>';
        if(e.lanes){   // iki kol: üstte dil, altta görüntü — ortada kesik ayraç, solda dikey şerit adları
          s+='<line class="era-lane-sep" x1="'+(x0+10)+'" y1="'+(H/2)+'" x2="'+(x1-10)+'" y2="'+(H/2)+'"/>';
          s+='<text class="era-lane-lbl" transform="translate('+(x0+19)+','+(H*0.3)+') rotate(-90)" text-anchor="middle">'+e.lanes[0][1]+'</text>';
          s+='<text class="era-lane-lbl" transform="translate('+(x0+19)+','+(H*0.72)+') rotate(-90)" text-anchor="middle">'+e.lanes[1][1]+'</text>';
        }
      }
    });
    // "req" kümesi: seçili düğümü açmak için gereken TÜM zincir — sadece
    // doğrudan ön koşullar değil, onların da ön koşulları, onların da...
    // köke kadar geriye doğru (BFS/DFS ile .pre üzerinden). Seq2Seq'e
    // tıklarsan sadece LSTM/Kelime Temsili değil, LSTM'in gerektirdiği
    // Vanishing/Exploding, Kelime Temsili'nin gerektirdiği Vektör & Nokta
    // Çarpım da bu kümeye girer — "self-attention'a tıklayınca köke kadar
    // her şey yansın" isteği.
    const req=new Set();
    if(sel){
      const stack=[sel];
      while(stack.length){
        const id=stack.pop();
        if(req.has(id)) continue;
        req.add(id);
        const nd=byId[id];
        if(nd) nd.pre.forEach(p=>stack.push(p));
      }
    }
    // kenarlar (Dik dik hatlar) — yatayda sol/sağ kart kenarından, dikeyde üst/alt kart kenarından
    NODES.forEach(n=>{
      n.pre.forEach(p=>{
        const a=byId[p];
        let path;
        if(a.tier===n.tier){   // aynı sütunda üst üste (ör. Self-Attention → Multi-Head → Blok): yatayda dikey, dikeyde yatay kısa bağ
          path = VERT ? 'M'+(X(a)+NW(a)/2)+' '+Y(a)+' H'+(X(n)-NW(n)/2)
                      : 'M'+X(a)+' '+(Y(a)+NH(a)/2)+' V'+(Y(n)-NH(n)/2);
        } else if(VERT){
          const x1=X(a), y1=Y(a)+NH(a)/2, x2=X(n), y2=Y(n)-NH(n)/2, my=(y1+y2)/2;
          path='M'+x1+' '+y1+' V'+my+' H'+x2+' V'+y2;
        } else {
          const x1=X(a)+NW(a)/2, y1=Y(a), x2=X(n)-NW(n)/2, y2=Y(n), mx=(x1+x2)/2;
          path='M'+x1+' '+y1+' H'+mx+' V'+y2+' H'+x2;
        }
        // te-req: bu kablo, o an SEÇİLİ düğümü açmak için gereken zincirin bir
        // parçası (hedef n, req kümesindeyse kaynağı p de otomatik req'tedir,
        // çünkü kümeyi kurarken her düğümün ön koşullarını da ekledik) —
        // done/kilitli farketmez, "seni açmak için köke kadar bunlar lazım"
        // anlamında tıklanan düğüme özel yanıp sönüyor (bkz. style.css .te-req).
        // (pathLength YOK — kablolar gerçek piksel dasharray kullanıyor, ki
        // kısa/uzun kablolarda tire boyu hep aynı görünsün; bkz. style.css.)
        s+='<path class="'+(done.has(p)?'te-on':'te-off')+(req.has(n.id)?' te-req':'')+'" d="'+path+'"/>';
      });
    });
    // düğüm kartları — Kart tarzı: solda ikon dairesi, sağda başlık/durum/etiketler
    // (newStyle çağlarda yerini foreignObject'li madalyon kartına bırakıyor, bkz. newCardSvg)
    NODES.forEach(n=>{
      const st=stateOf(n);
      const k=subCount(n), N=n.sub.length;
      const w=NW(n), h=NH(n), x=X(n)-w/2, y=Y(n)-h/2;
      const sp=n.nm.indexOf(' ');
      const icon=sp>0?n.nm.slice(0,sp):n.nm, label=sp>0?n.nm.slice(sp+1):n.nm;
      if(n.crown) s+='<text x="'+X(n)+'" y="'+(y-12)+'" text-anchor="middle" font-size="11.5" font-weight="800" fill="#7a5af0" letter-spacing="1">★ 2017 ★</text>';
      if(isNewStyle(n)){
        s+=newCardSvg(n, st, k, N, icon, label, x, y, w, h);
        return;
      }
      let sub;
      if(st==='done') sub='✓ Tamamlandı';
      else if(st==='avail') sub='Sıradaki · '+k+'/'+N;
      else sub='Kilitli'+(k?' · '+k+'/'+N:'');
      const chips=n.real.map(r=>r[0]).join(' ');
      const icx=x+ICR+9, icy=Y(n), tx=icx+ICR+11;
      s+='<g class="tn tn-'+st+(sel===n.id?' sel':'')+'" data-id="'+n.id+'">'
        +'<rect class="tn-card" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="12" pathLength="100"/>'
        +'<circle class="tn-icon-bg" cx="'+icx+'" cy="'+icy+'" r="'+ICR+'"/>'
        +'<text class="tn-emoji" x="'+icx+'" y="'+(icy+6.5)+'" text-anchor="middle" font-size="19">'+icon+'</text>'
        +'<line class="tn-div" x1="'+(tx-6)+'" y1="'+(y+9)+'" x2="'+(tx-6)+'" y2="'+(y+h-9)+'"/>'
        +'<text x="'+tx+'" y="'+(Y(n)-11)+'" font-size="'+(n.crown?12:11)+'" font-weight="700">'+esc(label)+'</text>'
        +'<text class="tsub" x="'+tx+'" y="'+(Y(n)+7)+'">'+esc(sub)+'</text>'
        +'<text class="tchips" x="'+tx+'" y="'+(Y(n)+25)+'">'+chips+'</text>'
        +'</g>';
    });
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    svg.innerHTML=s;
    svg.querySelectorAll('.tn').forEach(g=>{
      g.style.cursor='pointer';
      g.addEventListener('click',e=>{
        const al=e.target.closest && e.target.closest('.ttc-altl');
        if(al){ const n=byId[g.dataset.id], a=n.alt[+al.dataset.alt]; if(a){ e.stopPropagation(); window.__goStage(a.tab||n.tab, a.st, a.sel); return; } }
        show(g.dataset.id);
      });
    });
    const nd=NODES.filter(n=>stateOf(n)==='done').length;
    const totS=NODES.reduce((a,n)=>a+n.sub.length,0);
    const kS=NODES.reduce((a,n)=>a+subCount(n),0);
    const next=NODES.filter(n=>stateOf(n)==='avail').map(n=>n.nm).join(' · ');
    prog.innerHTML='⚙️ Tamamlanan ders: <b style="color:#46c46a">'+nd+'/'+NODES.length+'</b> &nbsp;·&nbsp; Alt başlık: <b style="color:#46c46a">'+kS+'/'+totS+'</b>'+(next?' &nbsp;·&nbsp; Sıradaki: <b style="color:var(--accent)">'+esc(next)+'</b>':'');
    var _av=new Set(NODES.filter(n=>stateOf(n)==='avail').map(n=>n.id));
    if(window.__ttPrevAv){ var _f=[..._av].filter(x=>!window.__ttPrevAv.has(x)); if(_f.length && window.__ttOnUnlock) window.__ttOnUnlock(_f); }
    window.__ttPrevAv=_av;
    // sidebar ilerleme omurgası da bu durumdan besleniyor (işaret/içe aktar → anında yansısın)
    if(window.__railSync) window.__railSync();
  }

  function recompute(n){
    if(n.sub.every((_,i)=>subs.has(n.id+':'+i))) done.add(n.id); else done.delete(n.id);
  }

  function show(id){
    sel=id; render();
    const n=byId[id], st=stateOf(n);
    const unlocks=NODES.filter(m=>m.pre.includes(id));
    const chips=n.pre.length
      ? n.pre.map(p=>'<span style="display:inline-block; margin:2px 4px 2px 0; padding:2px 9px; border-radius:10px; font-size:12px; border:1px solid '+(done.has(p)?'#46c46a; color:#46c46a':'#e06a6a; color:#e06a6a')+'">'+esc(byId[p].nm)+(done.has(p)?' ✓':' ✗')+'</span>').join('')
      : '<span style="color:var(--muted)">yok — ilk ders</span>';
    const ul=unlocks.length? unlocks.map(m=>esc(m.nm)).join(' · ') : '—';
    const dis=(st==='locked')?' disabled':'';
    const reals=n.real.map(r=>'<div style="margin:3px 0">'+r[0]+' '+esc(r[1])+'</div>').join('');
    const list=n.sub.map((t,i)=>{
      const c=subs.has(n.id+':'+i);
      return '<label style="display:flex; gap:8px; align-items:flex-start; margin:5px 0; font-size:13px; cursor:pointer">'
        +'<input type="checkbox" data-sub="'+n.id+':'+i+'"'+(c?' checked':'')+dis+' style="margin-top:2px; accent-color:#46c46a">'
        +'<span'+(c?' style="color:#46c46a"':'')+'>'+esc(t)+'</span></label>';
    }).join('');
    let btns='';
    if(n.tab) btns+='<button class="addbtn" data-go="'+n.tab+'"'+(n.gostage?' data-gostage="'+n.gostage+'"':'')+' style="background:var(--blue); color:#fff">'+(n.golabel||'Sayfada aç →')+'</button> ';
    if(n.alt) n.alt.forEach((a,i)=>{ btns+='<button class="addbtn" data-altgo="'+i+'" style="background:#24405f; color:#cfe7ff; border:1px solid #3d6a99">'+esc(a.nm)+' →</button> '; });
    if(st!=='locked') btns+='<button class="addbtn" data-tg="'+n.id+'" style="background:'+(done.has(n.id)?'var(--panel); color:var(--muted); border:1px solid var(--line)':'var(--green); color:#0b2a12')+'">'+(done.has(n.id)?'↩ Hepsini geri al':'✔ Hepsini tamamladım')+'</button>';
    info.innerHTML='<b style="font-size:16px">'+esc(n.nm)+'</b>'
      +' <span style="font-size:12px; color:var(--muted)">('+(st==='done'?'tamamlandı':st==='avail'?'sıradaki':'kilitli — önce gerekenleri aç')+')</span>'
      +'<div style="margin:8px 0; line-height:1.6">'+n.d+'</div>'
      +'<div style="font-size:12px; color:var(--accent); font-weight:700; margin:12px 0 4px">👤 KEŞİF — Keşif Defteri</div>'
      +'<div style="font-size:13px; line-height:1.6; color:#ccd5e8">'+((window.FZ_LESSONS&&window.FZ_LESSONS[n.id]&&window.FZ_LESSONS[n.id].sci)||n.sci)+'</div>'
      +'<div style="font-size:12px; color:var(--accent); font-weight:700; margin:12px 0 4px">🌍 GERÇEK DÜNYADA NEYİ AÇTI</div>'
      +'<div style="font-size:13px; line-height:1.5; color:#ccd5e8">'+reals+'</div>'
      +'<div style="font-size:12px; color:var(--accent); font-weight:700; margin:12px 0 4px">⛓️ GEREKENLER</div>'
      +'<div style="font-size:13px">'+chips+'</div>'
      +'<div style="font-size:12px; color:var(--accent); font-weight:700; margin:12px 0 4px">📋 ALT BAŞLIKLAR '+(st==='locked'?'(kilit açılınca işaretlenebilir)':'— bitirdiğini işaretle')+'</div>'
      +list
      +'<div style="font-size:12px; color:var(--accent); font-weight:700; margin:12px 0 4px">🔓 BUNU AÇINCA AÇILIR</div>'
      +'<div style="font-size:13px; margin-bottom:10px">'+ul+'</div>'
      +btns;
    info.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{ location.hash='#ders='+b.dataset.go; }));
    info.querySelectorAll('[data-altgo]').forEach(b=>b.addEventListener('click',()=>{ const a=n.alt[+b.dataset.altgo]; window.__goStage(a.tab||n.tab, a.st, a.sel); }));
    info.querySelectorAll('[data-pedia]').forEach(b=>b.addEventListener('click',()=>{
      const t=document.querySelector('.navbtn[data-model="pedia"]'); if(t) t.click();
      setTimeout(()=>{ const el=document.getElementById('pedia-'+b.dataset.pedia); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); },60);
    }));
    info.querySelectorAll('[data-sub]').forEach(cb=>cb.addEventListener('change',()=>{
      const key=cb.dataset.sub;
      if(cb.checked) subs.add(key); else subs.delete(key);
      recompute(n); save(); show(id);
    }));
    info.querySelectorAll('[data-tg]').forEach(b=>b.addEventListener('click',()=>{
      if(done.has(n.id)){ n.sub.forEach((_,i)=>subs.delete(n.id+':'+i)); done.delete(n.id); }
      else { n.sub.forEach((_,i)=>subs.add(n.id+':'+i)); done.add(n.id); }
      save(); show(n.id);
    }));
    if(window.__ttAfterShow) window.__ttAfterShow(n, st, info);
  }

  // ---- Madalyon tarzı hover tooltip'i ---------------------------------
  // Paylaşılan [data-pop] pop-up motoruyla (js/lesson-linreg.js) İSTEMEDEN
  // çakışmasın diye AYRI ve sadece HOVER'da çalışan küçük bir kopyası —
  // o motor click'te "pinle" davranışına geçiyor, bizim .tn click'i zaten
  // seç + alt paneli aç işine bakıyor; ikisi aynı elemanda olsaydı bir
  // tıklama hem seçerdi hem pop-up'ı pinlerdi (bkz. #ytInfoPanel'de aynı
  // gerekçeyle data-pop yerine data-info kullanılması, CLAUDE.md). Görsel
  // dili (.xt-pop/.xp-bas/.xp-sat) paylaşılan CSS'ten AYNEN alıyor, motoru
  // bağımsız.
  (function(){
    const tip=document.createElement('div');
    tip.className='xt-pop'; tip.id='ttHoverTip'; tip.hidden=true;
    document.body.appendChild(tip);
    let hideT=null;
    function place(el){
      const r=el.getBoundingClientRect(), g=8;
      const pw=tip.offsetWidth, ph=tip.offsetHeight;
      let x=r.left+r.width/2-pw/2;
      x=Math.max(g, Math.min(x, window.innerWidth-pw-g));
      let y=r.bottom+8;
      if(y+ph>window.innerHeight-g) y=r.top-ph-8;
      y=Math.max(g, Math.min(y, window.innerHeight-ph-g));
      tip.style.left=Math.round(x)+'px';
      tip.style.top=Math.round(y)+'px';
    }
    function content(id){
      const n=byId[id]; if(!n) return '';
      const st=stateOf(n);
      const lockLine = st==='done' ? '✅ Tamamlandı'
        : st==='avail' ? '🔓 Sıradaki · Alt başlık '+subCount(n)+'/'+n.sub.length
        : '🔒 Kilitli — önce gerekli: '+n.pre.map(p=>byId[p].nm).join(', ');
      return '<div class="xp-bas">'+esc(n.nm)+'</div>'
        +'<div class="xp-sat">'+n.d+'</div>'
        +(n.alt&&n.alt.length?'<div class="xp-sat" style="color:#9fd6ff; font-size:11.5px">📎 Alt ders: '+n.alt.map(a=>esc(a.nm)).join(' · ')+' — karttaki satıra tıkla</div>':'')
        +'<div class="xp-sat" style="color:var(--muted); font-size:11.5px">'+esc(lockLine)+'</div>';
    }
    svg.addEventListener('mouseover', e=>{
      const g=e.target.closest && e.target.closest('.tn[data-id]');
      if(!g) return;
      clearTimeout(hideT);
      tip.innerHTML=content(g.dataset.id);
      tip.style.left='-9999px'; tip.hidden=false;
      place(g);
    });
    svg.addEventListener('mouseout', e=>{
      const g=e.target.closest && e.target.closest('.tn[data-id]');
      if(!g) return;
      clearTimeout(hideT);
      hideT=setTimeout(()=>{ tip.hidden=true; }, 60);
    });
  })();

  render();
  // pencere yatay/dikey eşiği aşınca (döndürme, tarayıcı yeniden boyutlandırma) ağacı yeniden diz
  let _ttRt;
  window.addEventListener('resize', ()=>{
    clearTimeout(_ttRt);
    _ttRt=setTimeout(()=>{ if(ttVert()!==VERT) render(); }, 150);
  });

  // ---- araç çubuğu: tam ekran, yatay/dikey, büyüt/küçült ----
  function ttToolSync(){
    const q=id=>document.getElementById(id);
    if(!q('ttTools')) return;
    ['auto','h','v'].forEach(m=>{const b=q('ttM_'+m); if(b) b.classList.toggle('on',TT_MODE===m)});
    const z=q('ttZv'); if(z) z.textContent='%'+(Math.round(TT_Z*1000)/10);
    const f=q('ttFs'); if(f) f.textContent=document.body.classList.contains('tt-full')?'✕ Tam ekrandan çık':'⛶ Tam ekran';
  }
  (function(){
    const q=id=>document.getElementById(id);
    if(!q('ttTools')) return;
    ['auto','h','v'].forEach(m=>{const b=q('ttM_'+m); if(b) b.onclick=()=>{TT_MODE=m; render();}});
    const zoom=f=>{TT_Z=Math.max(0.4,Math.min(2.5,Math.round(TT_Z*f*1000)/1000)); render();};
    q('ttZm').onclick=()=>zoom(1/1.2); q('ttZp').onclick=()=>zoom(1.2); q('ttZv').onclick=()=>{TT_Z=TT_Z0; render();};
    const fs=on=>{document.body.classList.toggle('tt-full',on); render();};
    q('ttFs').onclick=()=>fs(!document.body.classList.contains('tt-full'));
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&document.body.classList.contains('tt-full')) fs(false); });
    ttToolSync();
  })();
  window.__ttShow=show;
  window.__ttMark=function(id){ const n=byId[id]; if(!n) return false; if(done.has(id)){ n.sub.forEach((_,i)=>subs.delete(id+':'+i)); done.delete(id); } else { n.sub.forEach((_,i)=>subs.add(id+':'+i)); done.add(id); } save(); render(); return done.has(id); };
  window.__ttDone=id=>done.has(id);
  window.__ttAPI={ NODES:NODES, stateOf:stateOf };
  window.__ttGet=function(){ return { done:[...done], subs:[...subs] }; };
  window.__ttImport=function(d,s){ done.clear(); (d||[]).forEach(x=>done.add(x)); subs.clear(); (s||[]).forEach(x=>subs.add(x)); save(); render(); };
})();

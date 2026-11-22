(function(){
  const svg=document.getElementById('techSvg'); if(!svg) return;
  const info=document.getElementById('techInfo');
  const prog=document.getElementById('techProg');

  const NODES=[
    {id:'early', nm:'🧮 Erken Hesaplama', tier:0, v:50, pre:[], tab:'early',
      d:'Abaküs, Babbage, Lovelace, delikli kart. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Babbage (1820\'ler) tablolardaki hataları yok etmek için yalnızca toplama yapan Fark Makinesi\'ni tasarladı; sonra kartlarla programlanan Analitik Makine\'yi. Ada Lovelace bu makinenin yalnız sayılarla değil, her tür simgeyle çalışabileceğini yazdı.', real:[], sub:["Abaküs", "Babbage", "Lovelace", "Delikli kart", "Kendini test (5 soru)"]},
    {id:'elec', nm:'⚡ Elektronik Hesaplama', tier:1, v:50, pre:["early"], tab:'',
      d:'Röle, vakum tüpü, ENIAC, transistör. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Röle", "Vakum tüpü", "ENIAC", "Transistör"]},
    {id:'gates', nm:'🔀 Mantık Kapıları', tier:2, v:30, pre:["elec"], tab:'gates',
      d:'Boole cebri, NOT/AND/OR/XOR, doğruluk tablosu. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'George Boole (1850\'ler) mantığı cebire çevirdi; Claude Shannon (1937) bu cebirin anahtar devreleriyle birebir örtüştüğünü gösterdi.', real:[], sub:["Boole cebri", "NOT/AND/OR/XOR", "Doğruluk tablosu", "Kendini test (5 soru)"]},
    {id:'binary', nm:'🔢 İkili Sayılar ve Metin', tier:2, v:70, pre:["elec"], tab:'binary',
      d:'Bit ve bayt, ikiye tümleyen, kayan nokta, ASCII/Unicode. Ders hazır: canlı simülasyon, örnek ve test içerir.', sci:'Leibniz ikili sistemi sistematik tanımladı; ASCII (1960\'lar) harflere ortak sayılar atadı.', real:[], sub:["Bit ve bayt", "Ikiye tümleyen", "Kayan nokta", "ASCII/Unicode", "Kendini test (5 soru)"]},
    {id:'alu', nm:'➕ ALU', tier:3, v:50, pre:["gates", "binary"], tab:'',
      d:'Yarım ve tam toplayıcı, taşma, durum bayrakları. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Yarım ve tam toplayıcı", "Taşma", "Durum bayrakları"]},
    {id:'reg', nm:'🗄️ Yazmaç ve RAM', tier:4, v:50, pre:["gates"], tab:'',
      d:'Latch, yazmaç, SRAM/DRAM. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Latch", "Yazmaç", "SRAM/DRAM"]},
    {id:'cpu', nm:'🧠 İşlemci (CPU)', tier:5, v:50, pre:["alu", "reg"], tab:'',
      d:'Getir-çöz-çalıştır, kontrol birimi, saat hızı. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Getir-çöz-çalıştır", "Kontrol birimi", "Saat hızı"]},
    {id:'instr', nm:'📜 Komutlar ve Programlar', tier:6, v:50, pre:["cpu"], tab:'',
      d:'Makine kodu, dallanma, döngü, Intel 4004. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Makine kodu", "Dallanma", "Döngü", "Intel 4004"]},
    {id:'adv', nm:'🚀 Gelişmiş CPU Tasarımları', tier:7, v:30, pre:["instr"], tab:'',
      d:'Önbellek, boru hattı, dallanma tahmini, çok çekirdek. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Önbellek", "Boru hattı", "Dallanma tahmini", "Çok çekirdek"]},
    {id:'early2', nm:'🔌 Erken Programlama', tier:7, v:70, pre:["instr"], tab:'',
      d:'Fiş panosu, delikli kart, assembly, ilk derleyici. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Fiş panosu", "Delikli kart", "Assembly", "Ilk derleyici"]},
    {id:'lang1', nm:'💬 İlk Programlama Dilleri', tier:8, v:30, pre:["early2"], tab:'',
      d:'FORTRAN, COBOL, LISP, ALGOL. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["FORTRAN", "COBOL", "LISP", "ALGOL"]},
    {id:'ic', nm:'🔬 Entegre Devreler ve Moore', tier:8, v:70, pre:["adv"], tab:'',
      d:'Entegre devre, fotolitografi, Moore yasası. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Entegre devre", "Fotolitografi", "Moore yasası"]},
    {id:'basics', nm:'🧩 Programlama Temelleri', tier:9, v:50, pre:["lang1"], tab:'',
      d:'Değişken, koşul, döngü, fonksiyon. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Değişken", "Koşul", "Döngü", "Fonksiyon"]},
    {id:'algo', nm:'🧭 Algoritmalara Giriş', tier:10, v:30, pre:["basics"], tab:'',
      d:'Big O, sıralama, Dijkstra. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Big O", "Sıralama", "Dijkstra"]},
    {id:'ds', nm:'🧱 Veri Yapıları', tier:10, v:70, pre:["basics"], tab:'',
      d:'Dizi, bağlı liste, yığın, kuyruk, ağaç, graf. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Dizi", "Bağlı liste", "Yığın", "Kuyruk", "Ağaç", "Graf"]},
    {id:'turing', nm:'♟️ Alan Turing', tier:11, v:30, pre:["algo"], tab:'',
      d:'Turing makinesi, durma problemi, Enigma. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Turing makinesi", "Durma problemi", "Enigma"]},
    {id:'se', nm:'🛠️ Yazılım Mühendisliği', tier:11, v:70, pre:["ds"], tab:'',
      d:'OOP, API, IDE, Git, test. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["OOP", "API", "IDE", "Git", "Test"]},
    {id:'os', nm:'🖥️ İşletim Sistemleri', tier:12, v:30, pre:["se", "ic"], tab:'',
      d:'Çoklu görev, sürücüler, sanal bellek, bellek koruması. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Çoklu görev", "Sürücüler", "Sanal bellek", "Bellek koruması"]},
    {id:'stor', nm:'💾 Bellek ve Depolama', tier:12, v:70, pre:["ic"], tab:'',
      d:'Manyetik bant, HDD, optik disk, SSD. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Manyetik bant", "HDD", "Optik disk", "SSD"]},
    {id:'fs', nm:'📁 Dosyalar ve Dosya Sistemleri', tier:13, v:50, pre:["os", "stor"], tab:'',
      d:'Dosya biçimi, dizin, parçalanma. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Dosya biçimi", "Dizin", "Parçalanma"]},
    {id:'comp', nm:'🗜️ Veri Sıkıştırma', tier:14, v:15, pre:["fs"], tab:'',
      d:'RLE, Huffman, JPEG, MP3. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["RLE", "Huffman", "JPEG", "MP3"]},
    {id:'kbd', nm:'⌨️ Klavye ve Komut Satırı', tier:14, v:38, pre:["os"], tab:'',
      d:'QWERTY, terminal, CLI. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["QWERTY", "Terminal", "CLI"]},
    {id:'cold', nm:'🚀 Soğuk Savaş ve Tüketim', tier:14, v:62, pre:["ic"], tab:'',
      d:'SAGE, Apollo, Altair, Apple II. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["SAGE", "Apollo", "Altair", "Apple II"]},
    {id:'net', nm:'🔗 Bilgisayar Ağları', tier:14, v:85, pre:["os"], tab:'',
      d:'LAN/WAN, Ethernet, paket anahtarlama. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["LAN/WAN", "Ethernet", "Paket anahtarlama"]},
    {id:'scr', nm:'📺 Ekranlar ve 2B Grafik', tier:15, v:25, pre:["kbd"], tab:'',
      d:'CRT, piksel, frame buffer, LCD. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["CRT", "Piksel", "Frame buffer", "LCD"]},
    {id:'pc', nm:'💻 Kişisel Bilgisayar Devrimi', tier:15, v:55, pre:["cold"], tab:'',
      d:'IBM PC, MS-DOS, Macintosh. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["IBM PC", "MS-DOS", "Macintosh"]},
    {id:'inet', nm:'🌐 İnternet', tier:15, v:85, pre:["net"], tab:'',
      d:'IP, UDP, TCP, DNS. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["IP", "UDP", "TCP", "DNS"]},
    {id:'gui', nm:'🖱️ Grafik Arayüzler', tier:16, v:30, pre:["pc", "scr"], tab:'',
      d:'Engelbart, Xerox PARC, WIMP. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Engelbart", "Xerox PARC", "WIMP"]},
    {id:'web', nm:'🕸️ Dünya Çapında Ağ', tier:16, v:75, pre:["inet"], tab:'',
      d:'Hipermetin, HTTP/HTML, tarayıcı, PageRank. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Hipermetin", "HTTP/HTML", "Tarayıcı", "PageRank"]},
    {id:'g3d', nm:'🧊 3B Grafik', tier:17, v:30, pre:["gui"], tab:'',
      d:'Çokgen ağ, Z-tamponu, doku, GPU. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Çokgen ağ", "Z-tamponu", "Doku", "GPU"]},
    {id:'sec', nm:'🛡️ Siber Güvenlik', tier:17, v:75, pre:["web"], tab:'',
      d:'CIA üçlüsü, kimlik doğrulama, zararlı yazılım. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["CIA üçlüsü", "Kimlik doğrulama", "Zararlı yazılım"]},
    {id:'hack', nm:'🕵️ Hackerlar ve Siber Saldırılar', tier:18, v:35, pre:["sec"], tab:'',
      d:'Brute force, arabellek taşması, SQL enjeksiyonu, DDoS. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Brute force", "Arabellek taşması", "SQL enjeksiyonu", "DDoS"]},
    {id:'crypto', nm:'🔐 Kriptografi', tier:18, v:75, pre:["sec"], tab:'',
      d:'Sezar, AES, Diffie-Hellman, RSA. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Sezar", "AES", "Diffie-Hellman", "RSA"]},
    {id:'ml', nm:'🤖 Makine Öğrenmesi ve YZ', tier:19, v:50, pre:["algo", "web"], tab:'',
      d:'Sınıflandırma, algılayıcı, derin öğrenme, pekiştirmeli öğrenme. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Sınıflandırma", "Algılayıcı", "Derin öğrenme", "Pekiştirmeli öğrenme"]},
    {id:'cv', nm:'👁️ Bilgisayarlı Görü', tier:20, v:30, pre:["ml", "g3d"], tab:'',
      d:'Kenar algılama, Viola-Jones, CNN. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Kenar algılama", "Viola-Jones", "CNN"]},
    {id:'nlp', nm:'🗣️ Doğal Dil İşleme', tier:20, v:70, pre:["ml"], tab:'',
      d:'Ayrıştırma ağacı, konuşma tanıma, metinden konuşmaya. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Ayrıştırma ağacı", "Konuşma tanıma", "Metinden konuşmaya"]},
    {id:'robot', nm:'🦾 Robotlar', tier:21, v:20, pre:["cv"], tab:'',
      d:'Sensör, eyleyici, PID, navigasyon. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Sensör", "Eyleyici", "PID", "Navigasyon"]},
    {id:'psy', nm:'🧠 Hesaplamanın Psikolojisi', tier:21, v:50, pre:["gui"], tab:'',
      d:'Kullanılabilirlik, bilişsel yük, Fitts yasası. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Kullanılabilirlik", "Bilişsel yük", "Fitts yasası"]},
    {id:'edu', nm:'🎓 Eğitim Teknolojileri', tier:21, v:80, pre:["web"], tab:'',
      d:'MOOC, uyarlanabilir öğrenme, akıllı özel ders. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["MOOC", "Uyarlanabilir öğrenme", "Akıllı özel ders"]},
    {id:'future', nm:'🔮 Tekillik ve Gelecek', tier:22, v:50, pre:["robot", "nlp", "psy", "edu"], tab:'',
      d:'Otomasyon, yapay genel zekâ, sorumlu teknoloji. Ders yakında.', sci:'Bu dersin keşif hikâyesi, ders yazılınca buraya eklenecek.', real:[], sub:["Otomasyon", "Yapay genel zekâ", "Sorumlu teknoloji"]}
  ];
  const ERAS=[
    {t0:0,t1:7,nm:'⚙️ DONANIM VE TARİH', newStyle:true, c:'46,134,255'},
    {t0:8,t1:13,nm:'💬 YAZILIM VE TEMELLER', newStyle:true, c:'156,77,255'},
    {t0:14,t1:18,nm:'🌐 ARAYÜZLER VE AĞLAR', newStyle:true, c:'255,122,51'},
    {t0:19,t1:22,nm:'🤖 YAPAY ZEKÂ VE GELECEK', newStyle:true, c:'64,200,170'}
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

  const KD='bb_tt_done_v1', KS='bb_tt_sub_v1';
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
    +'<pattern id="eaPp" width="46" height="46" patternUnits="userSpaceOnUse"><circle cx="6" cy="9" r=".9" fill="#1f9d6b" fill-opacity=".16"/><circle cx="31" cy="4" r=".7" fill="#1f9d6b" fill-opacity=".12"/><circle cx="19" cy="28" r="1" fill="#1f9d6b" fill-opacity=".14"/><circle cx="40" cy="35" r=".8" fill="#1f9d6b" fill-opacity=".15"/><circle cx="11" cy="41" r=".7" fill="#1f9d6b" fill-opacity=".12"/><path d="M2 20 l5 -1 M26 15 l6 1 M33 24 l5 -2 M14 6 l4 1" stroke="#1f9d6b" stroke-opacity=".12" stroke-width=".8"/></pattern>'
    +'<pattern id="eaOrn" width="64" height="28" patternUnits="userSpaceOnUse"><path d="M32 3 L43 14 L32 25 L21 14 Z M32 8 L38 14 L32 20 L26 14 Z M0 14 H21 M43 14 H64 M12 14 Q18 4 26 7 M52 14 Q46 4 38 7 M12 14 Q18 24 26 21 M52 14 Q46 24 38 21" fill="none" stroke="#1f9d6b" stroke-opacity=".4" stroke-width="1.4"/><circle cx="32" cy="14" r="2" fill="#1f9d6b" fill-opacity=".45"/></pattern>'
    +'</defs>';


  /* ---- Çağ arka planları (#551): her çağın bandında kendi tonu + konusunu anlatan soluk çizim ----
     Civ tarzı "çağa göre değişen arka plan" fikri; çizimler bize özgü (oyun görsellerinden kopya değil).
     Her sahne 400×300'lük kendi koordinatında çizilir, banda sığacak şekilde ölçeklenir.
     Kartlar üstte durur; çizim yalnız aralardan görünür (opacity düşük). */
  const ART=(function(){
    const N=v=>(+v).toFixed(1);
    const P=(d,c)=>'<path d="'+d+'" class="'+(c||'ea-s')+'"/>';
    const C=(x,y,r,c)=>'<circle cx="'+N(x)+'" cy="'+N(y)+'" r="'+r+'" class="'+(c||'ea-s')+'"/>';
    const R=(x,y,w,h,c,rx)=>'<rect x="'+N(x)+'" y="'+N(y)+'" width="'+w+'" height="'+h+'" rx="'+(rx||0)+'" class="'+(c||'ea-s')+'"/>';
    const T=(x,y,s,sz)=>'<text x="'+N(x)+'" y="'+N(y)+'" class="ea-t" style="font-size:'+(sz||14)+'px">'+s+'</text>';
    const gear=(x,y,r,n)=>{let d='';for(let k=0;k<n*2;k++){const a=k*Math.PI/n,rr=(k%2)?r*0.8:r;d+=(k?'L':'M')+N(x+Math.cos(a)*rr)+' '+N(y+Math.sin(a)*rr);}return P(d+'Z')+C(x,y,r*0.28);};
    const o={};
    o.t0=()=>{let g=gear(110,150,62,10)+gear(215,110,38,8)+R(250,170,110,80,'ea-b',6);
      for(let i=0;i<5;i++)g+=P('M'+(262+i*20)+' 170v-18M'+(262+i*20)+' 250v18');
      g+=T(268,218,'1 0 1 1',15)+T(40,262,'0110 1001 1100',13)+P('M40 40h90v26h-90zM60 40v-12M80 40v-12M100 40v-12')+T(48,58,'AND',13);return g;};
    o.t1=()=>{let g=T(40,120,'{',110)+T(300,230,'}',110);
      for(let i=0;i<6;i++)g+=P('M120 '+(70+i*26)+'h'+(60+((i*37)%90)));
      g+=R(250,40,100,36,'ea-b',6)+P('M300 76v22')+R(240,98,120,36,'ea-b',18)+P('M300 134v22')+P('M300 156l45 28-45 28-45-28z')+T(268,189,'if',13);return g;};
    o.t2=()=>{const pts=[[70,70],[190,50],[320,90],[110,170],[240,160],[340,210],[180,250]];let g='';
      [[0,1],[1,2],[0,3],[1,4],[2,4],[2,5],[3,4],[4,5],[3,6],[4,6]].forEach(e=>g+=P('M'+pts[e[0]][0]+' '+pts[e[0]][1]+'L'+pts[e[1]][0]+' '+pts[e[1]][1]));
      pts.forEach(p=>g+=C(p[0],p[1],10,'ea-b'));g+=R(230,200,120,80,'ea-b',6)+P('M230 222h120')+C(242,211,3)+C(254,211,3)+P('M280 245l14 24 5-10 10-3z','ea-b');return g;};
    o.t3=()=>{let g='';const L=[[60,3],[170,4],[280,3]];const ys=[[70,150,230],[50,110,190,250],[70,150,230]];
      L.forEach((l,i)=>ys[i].forEach((y,j)=>{if(i<2)ys[i+1].forEach(y2=>g+=P('M'+l[0]+' '+y+'L'+(l[0]+110)+' '+y2));}));
      L.forEach((l,i)=>ys[i].forEach(y=>g+=C(l[0],y,11,'ea-b')));
      g+=R(330,110,56,70,'ea-b',10)+C(346,135,4)+C(370,135,4)+P('M344 158h26')+P('M358 110v-18')+C(358,88,5);return g;};
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
      if(n.crown) s+='<text x="'+X(n)+'" y="'+(y-12)+'" text-anchor="middle" font-size="11.5" font-weight="800" fill="#1f9d6b" letter-spacing="1">★ 2017 ★</text>';
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
      +'<div style="font-size:13px; line-height:1.6; color:#ccd5e8">'+n.sci+'</div>'
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

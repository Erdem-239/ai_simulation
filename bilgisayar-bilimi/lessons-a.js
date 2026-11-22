/* İlk 4 dersin derinleştirilmesi: Ekstra, keşif notu, soru havuzu 10'a tamamlama */
(function(L){
L.early.sci="Babbage (1820'ler) tablo hatalarını yok etmek için yalnızca toplama yapan Fark Makinesi'ni, sonra kartlarla programlanan Analitik Makine'yi tasarladı. Ada Lovelace bu makinenin yalnız sayılarla değil, her tür simgeyle çalışabileceğini yazdı. Hollerith'in delikli kartları (1890 nüfus sayımı) veri işlemenin ilk büyük ticari başarısıydı.";
L.early.extra='<h4>Delikli kart: ilk “yazılım” ve “veri”</h4><p>Bir kartın her konumunda delik var ya da yok: bu, ikili bilginin en eski fiziksel biçimlerinden biridir. Jacquard tezgâhında kart desen, Hollerith sisteminde kart kayıt, ilerleyen yıllarda bilgisayarlarda program ve veri taşıdı.</p><h4>Hollerith’ten IBM’e</h4><p>Hollerith’in tabulatör makineleri nüfus sayımını yıllardan aylara indirdi; kurduğu şirket sonraki on yıllarda IBM’e dönüşen bir yapının çekirdeği oldu (tarihler yaklaşık).</p><div class="call">Bugünkü karşılığı: bir veri tabanı kaydı da “alanlara bölünmüş bir kart”tır; sadece delikler yerine bitler var.</div>';
L.early.test.push(
{q:'Delikli kartın bilgi taşıma biçimi hangi kavrama en yakındır?',o:['İkili (var/yok)','Onluk','Renkli','Analog ses'],a:0,w:'Delik var/yok iki durumlu bilgidir.'},
{q:'Ada Lovelace’in Analitik Makine hakkındaki en önemli öngörüsü neydi?',o:['Makine yalnız sayıları işler','Makine sayı dışı simgeleri de işleyebilir','Makine asla yapılamaz','Makine yalnız toplar'],a:1,w:'Sayıların yerine müzik ya da harf gibi simgeler de konabileceğini yazdı.'},
{q:'Hollerith’in tabulatörü hangi alanda ünlenmiştir?',o:['Nüfus sayımı','Uzay uçuşu','Radyo yayını','Fotoğrafçılık'],a:0,w:'1890 ABD nüfus sayımında kullanıldı.'},
{q:'Fark yöntemiyle polinom tablosu üretmek için neye ihtiyaç yoktur?',o:['Çarpmaya','Toplamaya','Başlangıç değerlerine','Adım sayacına'],a:0,w:'Yalnız toplama yeterlidir.'},
{q:'Kartı değiştirince makinenin davranışı değişiyorsa bu neyin habercisidir?',o:['Program fikrinin','Elektriğin','Ağın','Ekranın'],a:0,w:'Aynı donanım, farklı kart = farklı program.'});
L.elec.sci="Colossus ve ENIAC vakum tüpleriyle hesabı yüzlerce kat hızlandırdı; 1947'de Bell Laboratuvarları'nda transistör icat edildi: anahtar küçüldü, soğudu, ucuzladı. Hikâyede anlatılan 'bug' anekdotu Harvard Mark II çevresinde Grace Hopper'ın adıyla anılır.";
L.elec.extra='<h4>Anahtar neden önemli?</h4><p>Mantık kapıları, bellek ve toplayıcılar sonunda “aç/kapa” elemanlarından kuruludur. Bir dersteki ALU da, RAM de aynı anahtarın farklı dizilişidir.</p><h4>Isı ve güç</h4><p>Her anahtarlama enerji harcar ve ısı üretir. Tüp çağında bu kısıt makineyi odalara sığdırırken, bugün de işlemcileri soğutmak başlı başına mühendislik konusudur.</p><div class="call">Soru: bir telefon işlemcisi neden ısındığında yavaşlar? (İpucu: ısıyı atamazsa saat hızını kendisi düşürür.)</div>';
L.elec.test.push(
{q:'Colossus ne için kullanılmıştır?',o:['Şifre kırma','Oyun','Hava durumu ekranı','Dosya yedekleme'],a:0,w:'II. Dünya Savaşı sırasında şifreli mesajları çözmek için.'},
{q:'ENIAC yaklaşık olarak neye dayanıyordu?',o:['Vakum tüplerine','Transistörlere','Entegre devrelere','Dişlilere'],a:0,w:'On binlerce vakum tüpü kullanıyordu.'},
{q:'Transistörün üstünlüğü nedir?',o:['Küçük, soğuk, ucuz ve dayanıklı','Daha ağır','Daha çok ısınır','Yalnız ses için'],a:0,w:'Bu yüzden tüpün yerini aldı.'},
{q:'Aşağıdakilerden hangisi tüp çağının sorunu DEĞİLDİR?',o:['Isınma','Sık arıza','Boyut','Aşırı soğuk çalışma'],a:3,w:'Tüpler sıcaktır; aşırı soğuk sorun değildi.'},
{q:'Bir hesabı hızlandırmanın temel yolu nedir?',o:['Anahtarı hızlandırmak ve küçültmek','Ekranı büyütmek','Kabloyu uzatmak','Daha çok ışık'],a:0,w:'Hesap anahtarlama toplamıdır.'});
L.gates.sci="George Boole (1850'ler) mantığı cebire çevirdi; Claude Shannon (1937) bu cebirin anahtar devreleriyle birebir örtüştüğünü gösterdi. Bugün her işlemci, milyarlarca kapının birleşimidir.";
L.gates.extra='<h4>Evrensel kapı: NAND</h4><p>Yalnız NAND kapısıyla AND, OR ve NOT dahil tüm mantık kurulabilir. Bu yüzden fabrikalarda tek tip kapı çoğaltmak yeterlidir (NOR da aynı özelliğe sahiptir).</p><h4>Kapıdan devreye</h4><p>NOT = NAND(a,a). AND = NOT(NAND(a,b)). OR = NAND(NOT a, NOT b). Aşağıdaki örnek çalışmada bunları ikili kombinasyonlarla doğrulayabilirsin.</p><pre class="code">def nand(a,b): return 1-(a&b)\ndef NOT(a): return nand(a,a)\ndef AND(a,b): return NOT(nand(a,b))\ndef OR(a,b): return nand(NOT(a),NOT(b))\nfor a in (0,1):\n    for b in (0,1):\n        print(a,b,AND(a,b),OR(a,b))</pre>';
L.gates.test.push(
{q:'Hangi tek kapıyla tüm mantık kurulabilir?',o:['NAND','AND','OR','XOR'],a:0,w:'NAND (ve NOR) evrensel kapıdır.'},
{q:'NOR(0,0) kaçtır?',o:['1','0','2','Tanımsız'],a:0,w:'OR(0,0)=0, tersi 1.'},
{q:'XOR neye benzer?',o:['“Biri ya da öteki, ikisi birden değil”','“İkisi de”','“Hiçbiri”','“Her zaman 1”'],a:0,w:'XOR: girdiler farklıysa 1.'},
{q:'Doğruluk tablosunda 3 girdili kapının kaç satırı olur?',o:['8','6','4','9'],a:0,w:'2³ = 8.'},
{q:'NAND(1,1) kaçtır?',o:['0','1','2','Hata'],a:0,w:'AND(1,1)=1, tersi 0.'});
L.binary.sci="Leibniz ikili sistemi sistematik tanımladı; ASCII (1960'lar) harflere ortak sayılar atadı. Unicode ise dünyadaki yazı sistemlerinin hepsini ve emojileri tek tabloda toplar.";
L.binary.extra='<h4>Negatif sayılar: ikiye tümleyen</h4><p>8 bitte −1 nasıl yazılır? 1’in bitlerini ters çevir, 1 ekle: 00000001 → 11111110 → 11111111. Bu yöntemin güzelliği: toplama devresi aynı kalır. Bu, ALU dersinde göreceğimiz çıkarmayı “tersle ve topla”ya çevirir.</p><h4>Ondalık sayılar: kayan nokta</h4><p>Bilgisayar 0,1’i bile ikilide tam yazamaz (0,000110011… sonsuz). Bu yüzden 0,1+0,2 çoğu dilde 0,30000000000000004 çıkar. Kayan nokta (IEEE 754) işareti, üssü ve kesri ayrı bitlerde tutar.</p><h4>Unicode</h4><p>“ğ”, “中” ve “😀” için ASCII yetmez; UTF-8 her karakteri 1–4 baytla kodlar ve ASCII ile uyumludur.</p>';
L.binary.test.push(
{q:'8 bitlik ikiye tümleyende −1 nasıl gösterilir?',o:['11111111','10000000','00000001','01111111'],a:0,w:'+1’in terslemesi artı bir.'},
{q:'0,1 + 0,2 neden tam 0,3 çıkmaz?',o:['0,1 ikilide sonsuz kesirdir','Hesap makinesi bozuk','İşlemci yavaş','Bellek yetmez'],a:0,w:'Kayan noktada yaklaşık saklanır.'},
{q:'UTF-8 hakkında hangisi doğrudur?',o:['Karakteri 1–4 bayt ile kodlar','Yalnız İngilizce harf','Sadece emojiler','Her karakter 8 bayt'],a:0,w:'ASCII ile uyumludur.'},
{q:'01111111 (8 bit) işaretsiz olarak kaçtır?',o:['127','128','255','63'],a:0,w:'64+32+16+8+4+2+1 = 127.'},
{q:'1 bayt kaç bittir?',o:['8','4','16','2'],a:0,w:'Standart olarak 8 bit.'});
})(window.BB_LESSONS);

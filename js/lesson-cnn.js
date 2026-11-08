// 🖼️ Görüntü + CNN dersi (#model-cnn):
//  Simülasyon: 10×10 resim çiz → 3×3 filtre kaydır (dolgu, ReLU, 2×2 max-pool) → özellik haritası; bir çıktı hücresine
//  tıklayınca 9 çarpımın toplamı. Örnekler: ağırlık sayısı, minik CNN'in dikey/yatay çubuk öğrenmesi (8 tohum), kaydırma.
//  Motor sayfadaki Python koduyla (cnn.py) birebir aynı.
(function(){
  const host=document.getElementById('cnSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const f2=v=>(Math.abs(v)<0.005?0:v).toFixed(2).replace('.',',').replace('-','−');
  const lcg=t=>{let s=t;return ()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};};
  function veri(){const X=[],Y=[];for(let j=0;j<6;j++){X.push(Array.from({length:6},()=>Array.from({length:6},(_,c)=>c===j?1:0)));Y.push(1);}
    for(let i=0;i<6;i++){X.push(Array.from({length:6},(_,r)=>Array.from({length:6},()=>r===i?1:0)));Y.push(0);}return [X,Y];}
  function konv(R,F,b,pad=0){const n=R.length,P=pad?Array.from({length:n+2},(_,i)=>Array.from({length:n+2},(_,j)=>i>0&&j>0&&i<=n&&j<=n?R[i-1][j-1]:0)):R,m=P.length-2,H=[];
    for(let i=0;i<m;i++){const s=[];for(let j=0;j<m;j++){let v=b;for(let a=0;a<3;a++)for(let c=0;c<3;c++)v+=P[i+a][j+c]*F[a][c];s.push(v);}H.push(s);}return [H,P];}
  function ileri(R,P){const [Z]=konv(R,P.F,P.b),A=Z.map(r=>r.map(z=>z>0?z:0));let m=0;for(const r of A)for(const x of r)m+=x;m/=16;return [Z,A,m,1/(1+Math.exp(-(P.w*m+P.c)))];}
  function model(t=1){const u=lcg(t);return {F:Array.from({length:3},()=>Array.from({length:3},()=>(u()-0.5)*0.6)),b:0,w:1,c:0};}
  function egit(P,X,Y,tur,lr=0.5){const K=[];for(let t=0;t<tur;t++){const gF=[[0,0,0],[0,0,0],[0,0,0]];let gb=0,gw=0,gc=0,L=0;
    X.forEach((R,n)=>{const y=Y[n],[Z,A,m,p]=ileri(R,P);L-=Math.log(y?p:1-p);const d=(p-y)/X.length;gw+=d*m;gc+=d;const dm=d*P.w/16;
      for(let i=0;i<4;i++)for(let j=0;j<4;j++){if(Z[i][j]<=0)continue;gb+=dm;for(let a=0;a<3;a++)for(let c=0;c<3;c++)gF[a][c]+=dm*R[i+a][j+c];}});
    K.push(L/X.length);for(let a=0;a<3;a++)for(let c=0;c<3;c++)P.F[a][c]-=lr*gF[a][c];P.b-=lr*gb;P.w-=lr*gw;P.c-=lr*gc;}return K;}
  const [X6,Y6]=veri();
  const LEARN=model(3);egit(LEARN,X6,Y6,600);
  window.__cnn={veri,konv,ileri,model,egit,LEARN};

  // ---- simülasyon ----
  const N=10;let img=Array.from({length:N},()=>new Array(N).fill(0)),sel=null;
  const PRE={dikey:(r,c)=>c===4?1:0,yatay:(r,c)=>r===4?1:0,T:(r,c)=>(r===1&&c>=1&&c<=8)||(c===4&&r>=1&&r<=8)?1:0,kare:(r,c)=>(r===2||r===7)&&c>=2&&c<=7||(c===2||c===7)&&r>=2&&r<=7?1:0,kosegen:(r,c)=>r===c?1:0};
  const FIL={dikey:[[-1,0,1],[-1,0,1],[-1,0,1]],yatay:[[-1,-1,-1],[0,0,0],[1,1,1]],bulanik:[[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]],keskin:[[0,-1,0],[-1,5,-1],[0,-1,0]],kosegen:[[2,-1,-1],[-1,2,-1],[-1,-1,2]],ogrenilmis:LEARN.F};
  const FAD={dikey:'dikey kenar',yatay:'yatay kenar',bulanik:'bulanıklaştır',keskin:'keskinleştir',kosegen:'köşegen',ogrenilmis:'öğrenilmiş (Örnek 2, tohum 3)'};
  let fk='dikey';
  const opt=()=>({pad:$('cnPad').checked?1:0,relu:$('cnRelu').checked,pool:$('cnPool').checked});
  const col=(v,mx)=>{const t=Math.max(-1,Math.min(1,v/(mx||1)));return t>=0?'rgba(70,196,106,'+(0.12+0.85*t)+')':'rgba(224,106,106,'+(0.12+0.85*-t)+')';};
  function grid(M,cls,mx,click,hl){return '<div class="cn-grid '+cls+'" style="grid-template-columns:repeat('+M[0].length+',1fr)">'+M.map((r,i)=>r.map((v,j)=>'<div class="cn-c'+(hl&&hl(i,j)?' hl':'')+'" data-i="'+i+'" data-j="'+j+'" style="background:'+(cls==='in'?(v?'#e8eefc':'#141d33'):col(v,mx))+'"'+(cls==='in'?'':' title="'+f2(v)+'"')+'>'+(cls==='out'&&M.length<=10?'<span>'+(Math.abs(v)<0.005?'':Math.round(v*10)/10)+'</span>':'')+'</div>').join('')).join('')+'</div>';}
  function draw(){const o=opt(),F=FIL[fk],[Z,P]=konv(img,F,0,o.pad),A=o.relu?Z.map(r=>r.map(z=>z>0?z:0)):Z;
    let Pl=null;if(o.pool){const m=Math.floor(A.length/2);Pl=Array.from({length:m},(_,i)=>Array.from({length:m},(_,j)=>Math.max(A[2*i][2*j],A[2*i][2*j+1],A[2*i+1][2*j],A[2*i+1][2*j+1])));}
    const mx=Math.max(1e-9,...A.flat().map(Math.abs));
    if(sel&&(sel[0]>=A.length||sel[1]>=A.length))sel=null;
    const inHl=sel?(i,j)=>{const ii=i+o.pad,jj=j+o.pad;return ii>=sel[0]&&ii<sel[0]+3&&jj>=sel[1]&&jj<sel[1]+3;}:null;
    $('cnIn').innerHTML=grid(img,'in',1,true,inHl);
    $('cnF').innerHTML='<table class="tk-tbl cn-f">'+F.map(r=>'<tr>'+r.map(v=>'<td style="background:'+col(v,Math.max(...F.flat().map(Math.abs)))+'">'+f2(v)+'</td>').join('')+'</tr>').join('')+'</table>';
    $('cnOut').innerHTML=grid(A,'out',mx,false,sel?(i,j)=>i===sel[0]&&j===sel[1]:null)+'<div class="nl-legend">'+A.length+'×'+A[0].length+(o.relu?' (ReLU sonrası)':'')+'</div>';
    $('cnPoolOut').innerHTML=Pl?grid(Pl,'out',mx,false,null)+'<div class="nl-legend">max-pool 2×2 → '+Pl.length+'×'+Pl.length+'</div>':'';
    host.querySelectorAll('#cnIn .cn-c').forEach(c=>c.onclick=()=>{const i=+c.dataset.i,j=+c.dataset.j;img[i][j]=1-img[i][j];draw();});
    host.querySelectorAll('#cnOut .cn-c').forEach(c=>c.onclick=()=>{sel=[+c.dataset.i,+c.dataset.j];draw();});
    host.querySelectorAll('.cn-fb').forEach(b=>b.classList.toggle('on',b.dataset.f===fk));
    // öğretmen
    let st='<b class="h">✏️ '+(sel?'Seçili çıktı hücresi ('+(sel[0]+1)+', '+(sel[1]+1)+')':'Bir çıktı hücresine tıkla')+'</b>';
    if(sel){const [i,j]=sel;let s=0,parts=[];for(let a=0;a<3;a++)for(let c=0;c<3;c++){const x=P[i+a][j+c],w=F[a][c];s+=x*w;if(x)parts.push(x+'·'+f2(w));}
      st+='Filtre resmin 3×3\'lük penceresinin üstüne kondu (solda sarı çerçeve). Her pikseli karşısındaki filtre ağırlığıyla çarp, topla:<br>'+(parts.length?parts.join(' + '):'(pencerede hiç beyaz piksel yok)')+' = <b>'+f2(s)+'</b>'+(o.relu&&s<0?' → ReLU → <b>0</b>':'')+'.<br>Aynı 9 ağırlık bütün pencerelerde <b>tekrar kullanılıyor</b> (ağırlık paylaşımı).';}
    else st+='Filtre resmin üstünde soldan sağa, yukarıdan aşağı kayıyor; her konumda 9 çarpımın toplamı bir çıktı hücresi oluyor. '+(o.pad?'Dolgu (padding) açık: kenarlara 0 eklendi, çıktı 10×10.':'Dolgu yok: filtre resmin dışına taşamadığı için çıktı 8×8.');
    $('cnStep').innerHTML=st;
    const pos=A.flat().filter(v=>v>0.5).length;
    let z='<b class="h">🗣️ Ne anlama geliyor?</b>«'+FAD[fk]+'» filtresi ';
    z+=fk==='bulanik'?'her pikseli komşularının ortalamasıyla değiştiriyor: ayrıntı kayboluyor.':fk==='keskin'?'pikseli komşularından farkıyla güçlendiriyor: kenarlar belirginleşiyor.':'resimde kendisine benzeyen deseni arıyor: yeşil = "burada bu desen var", kırmızı = "tam tersi var". Şu an '+pos+' hücrede güçlü yanıt var.';
    if(o.pool)z+=' Max-pool her 2×2 bloğun en büyüğünü tutuyor: harita küçülüyor ama "desen bu bölgede var mı" bilgisi kalıyor.';
    z+=' Bir CNN bu filtreleri elle değil, <b>eğitimle</b> bulur (Örnek 2).';
    $('cnSoz').innerHTML=z;}
  host.querySelectorAll('.cn-pre').forEach(b=>b.onclick=()=>{const f=PRE[b.dataset.p];img=Array.from({length:N},(_,r)=>Array.from({length:N},(_,c)=>f?f(r,c):0));sel=null;draw();});
  host.querySelectorAll('.cn-fb').forEach(b=>b.onclick=()=>{fk=b.dataset.f;draw();});
  ['cnPad','cnRelu','cnPool'].forEach(id=>$(id).onchange=()=>{sel=null;draw();});
  img=Array.from({length:N},(_,r)=>Array.from({length:N},(_,c)=>PRE.T(r,c)));sel=[0,2];draw();

  // ---- Örnek Çalışmalar ----
  const e2=$('cnEx2');if(e2){const R=[];for(let t=1;t<=8;t++){const P=model(t),K=egit(P,X6,Y6,600),y=[];X6.forEach((Rr,i)=>{if((ileri(Rr,P)[3]>0.5)!==(Y6[i]===1))y.push(i);});R.push([t,K[0],K[K.length-1],12-y.length,y,P.F]);}
    window.__cnnEx2=R.map(r=>r.slice(0,5));
    const fg=F=>'<table class="tk-tbl cn-f sm">'+F.map(r=>'<tr>'+r.map(v=>'<td style="background:'+col(v,3.5)+'">'+v.toFixed(1).replace('.',',').replace('-','−')+'</td>').join('')+'</tr>').join('')+'</table>';
    e2.innerHTML='<div class="cn-data">'+X6.map((R,i)=>'<div><div class="cn-grid in mini" style="grid-template-columns:repeat(6,1fr)">'+R.flat().map(v=>'<div class="cn-c" style="background:'+(v?'#e8eefc':'#141d33')+'"></div>').join('')+'</div><small>#'+i+' '+(Y6[i]?'dikey':'yatay')+'</small></div>').join('')+'</div>'+
    '<table class="tk-tbl"><tr><th>tohum</th><th>kayıp</th><th>doğru</th><th>yanlış resim</th><th>öğrenilen filtre</th></tr>'+R.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1].toFixed(4).replace('.',',')+' → '+r[2].toFixed(4).replace('.',',')+'</td><td>'+r[3]+' / 12</td><td>'+(r[4].length?r[4].map(i=>'#'+i).join(', '):'—')+'</td><td>'+fg(r[5])+'</td></tr>').join('')+'</table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> Kimse filtreye "dikey çizgi ara" demedi; 9 ağırlık rastgele başladı. Sekiz başlangıcın hepsinde filtre <b>sütun sütun aynı işaretli</b> bir desene dönüştü: bir dikey çizgi bulucu. Dört tohum 12/12 buldu; ötekiler <b>kenardaki</b> çubukları (#0, #1, #4, #5) kaçırdı: dolgu olmadığı için filtre kenar sütununu yalnız tek pencerede görüyor. Simülasyondaki «dolgu» düğmesi tam bu sorunun çaresi.</div>';}
  const e3=$('cnEx3');if(e3){const rows=[2,3].map(j=>{const [Z,A,m,p]=ileri(X6[j],LEARN);return [j,A[0],m,p];});
    window.__cnnEx3=rows;
    e3.innerHTML='<table class="tk-tbl"><tr><th>dikey çubuk</th><th>ReLU haritasının ilk satırı</th><th>harita ortalaması</th><th>p(dikey)</th></tr>'+rows.map(r=>'<tr><td>sütun '+r[0]+'</td><td>'+r[1].map(v=>v.toFixed(2).replace('.',',')).join(' · ')+'</td><td>'+r[2].toFixed(4).replace('.',',')+'</td><td>'+r[3].toFixed(4).replace('.',',')+'</td></tr>').join('')+'</table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> Çubuk bir sütun sağa kayınca özellik haritası da <b>bir sütun kaydı</b> (eşdeğişkenlik); ortalama alınınca sonuç <b>hiç değişmedi</b> (değişmezlik). Aynı filtre her yerde aynı deseni aradığı için CNN bir kediyi resmin neresinde olursa olsun tanıyabilir — tam bağlı bir ağ bunu her konum için ayrı öğrenmek zorunda kalırdı.</div>';}
})();

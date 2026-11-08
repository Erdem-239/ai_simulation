// 🎲 Üretim Stratejileri dersi (#model-gen):
//  Minik bir "önceki kelime → sonraki kelime" sayma modeli (20 cümle) üzerinde
//  açgözlü seçim, sıcaklık, top-k, top-p ve beam search. Motor sayfadaki Python koduyla (gen.py) birebir aynı:
//  sözlük ilk görülme sırasıyla, eşitlikte önce gelen kelime, LCG tohumlu örnekleme.
(function(){
  const host=document.getElementById('genSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const fm=(v,d=3)=>(v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');
  const pc=v=>'%'+(v*100).toFixed(1).replace('.',',');
  const METIN="kedi süt içti . kedi uyudu . kedi bahçede oynadı . kedi bahçede uyudu . kedi süt içti . kedi top ile oynadı . köpek kemik yedi . köpek bahçede koştu . köpek havladı . köpek bahçede oynadı . çocuk bahçede oynadı . çocuk top ile oynadı . çocuk süt içti . çocuk kitap okudu . çocuk uyudu . kuş ağaçta öttü . kuş uçtu . kuş bahçede öttü . bahçede çiçek açtı . kedi kuş ile oynadı .";
  const KEL=METIN.split(' '), SOZ=[], SAY={};
  KEL.forEach(k=>{if(!SOZ.includes(k))SOZ.push(k);});
  for(let i=0;i+1<KEL.length;i++){const a=KEL[i],b=KEL[i+1];SAY[a]=SAY[a]||{};SAY[a][b]=(SAY[a][b]||0)+1;}
  const lcg=t=>{let s=t;return ()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};};
  // ayrıntılı dağılım: her aday için sayı, p(T=1), p(T), kesildi mi, son p
  function detay(onceki,T=1,k=0,p=1){
    const c=SAY[onceki]||{}, ad=SOZ.filter(w=>w in c);
    let z1=0;ad.forEach(w=>z1+=c[w]);
    const g=ad.map(w=>Math.pow(c[w],1/T));let z=0;for(const x of g)z+=x;
    const pr=g.map(x=>x/z);
    const sira=ad.map((_,i)=>i).sort((i,j)=>pr[j]!==pr[i]?pr[j]-pr[i]:i-j);
    let tut=new Set(ad.map((_,i)=>i)), kesK=new Set(), kesP=new Set();
    if(k>0){tut=new Set(sira.slice(0,k));sira.slice(k).forEach(i=>kesK.add(i));}
    if(p<1){let top=0;const yeni=new Set();for(const i of sira){if(!tut.has(i))continue;if(top>=p-1e-12){kesP.add(i);continue;}yeni.add(i);top+=pr[i];}tut=yeni;}
    let zt=0;for(const i of tut)zt+=pr[i];
    return ad.map((w,i)=>({w,n:c[w],p1:c[w]/z1,pT:pr[i],kesK:kesK.has(i),kesP:kesP.has(i),q:tut.has(i)?pr[i]/zt:0,rank:sira.indexOf(i)}));
  }
  const dagilim=(o,T,k,p)=>detay(o,T,k,p).map(x=>[x.w,x.q]);
  function ornekle(d,r){let top=0;for(const [w,q] of d){top+=q;if(q>0&&r<top)return w;}return d.filter(x=>x[1]>0).slice(-1)[0][0];}
  function argmax(d){let b=d[0];for(const x of d)if(x[1]>b[1])b=x;return b[0];}
  function uret(bas,n,T=1,k=0,p=1,tohum=1,acg=false){const u=lcg(tohum),y=[bas];for(let i=0;i<n;i++){const d=dagilim(y[y.length-1],T,k,p);y.push(acg?argmax(d):ornekle(d,u()));}return y;}
  function isin(bas,n,B){let yol=[[[bas],0]];for(let i=0;i<n;i++){const ad=[];for(const [y,s] of yol)for(const [w,q] of dagilim(y[y.length-1],1,0,1))ad.push([y.concat([w]),s+Math.log(q)]);ad.sort((a,b)=>b[1]-a[1]);yol=ad.slice(0,B);}return yol;}
  const puan=y=>{let s=0;for(let i=0;i+1<y.length;i++)s+=Math.log(Object.fromEntries(dagilim(y[i],1,0,1))[y[i+1]]);return s;};
  window.__gen={SOZ,SAY,detay,dagilim,uret,isin,puan,lcg};

  // ---- simülasyon durumu ----
  let mode='samp', yol=['kedi'], u=lcg(1), last=null;
  const P=()=>({T:+$('genT').value,k:+$('genK').value,p:+$('genP').value,seed:+$('genSeed').value});
  const chip=(w,cls)=>'<span class="gn-w'+(cls?' '+cls:'')+'">'+esc(w)+'</span>';
  function reset(){yol=[$('genStart').value];u=lcg(P().seed);last=null;draw();}
  function step(){const {T,k,p}=P(),o=yol[yol.length-1],D=detay(o,mode==='greedy'?1:T,mode==='greedy'?0:k,mode==='greedy'?1:p),d=D.map(x=>[x.w,x.q]);
    let r=null,w;if(mode==='greedy')w=argmax(d);else{r=u();w=ornekle(d,r);}
    last={o,D,r,w};yol.push(w);draw();}
  function draw(){
    const {T,k,p}=P();
    $('genTv').textContent=fm(T,1);$('genKv').textContent=k?k:'kapalı';$('genPv').textContent=p>=1?'kapalı':fm(p,2);
    host.querySelectorAll('.gen-mode').forEach(b=>b.classList.toggle('on',b.dataset.m===mode));
    host.querySelectorAll('.gen-samp').forEach(e=>e.style.opacity=mode==='greedy'?.4:1);
    $('genOut').innerHTML=yol.map((w,i)=>chip(w,i===yol.length-1&&last?'new':'')).join(' ');
    const o=yol[yol.length-1];
    const D=last?last.D:detay(o,mode==='greedy'?1:T,mode==='greedy'?0:k,mode==='greedy'?1:p);
    const title=last?'Son adım: «'+esc(last.o)+'» sonrası':'Sıradaki adım: «'+esc(o)+'» sonrası';
    let t='<div class="tk-h">📊 '+title+'</div><table class="tk-tbl gn-tbl"><tr><th>aday</th><th>sayı</th><th>p (ham)</th>'+(mode==='greedy'?'':'<th>T sonrası</th><th>filtre</th>')+'<th>son p</th><th></th></tr>';
    let cum=0;
    for(const x of D){const kes=x.kesK?'✂️ top-k':x.kesP?'✂️ top-p':'✓';const lo=cum;cum+=x.q;
      const sel=last&&x.w===last.w;
      t+='<tr'+(sel?' class="on"':'')+(x.q===0?' style="opacity:.45"':'')+'><td>'+chip(x.w)+'</td><td>'+x.n+'</td><td>'+pc(x.p1)+'</td>'+(mode==='greedy'?'':'<td>'+pc(x.pT)+'</td><td>'+kes+'</td>')+'<td>'+pc(x.q)+'</td><td><span class="gn-bar" style="width:'+Math.round(x.q*120)+'px"></span>'+(mode==='samp'&&x.q>0?' <small>['+fm(lo,2)+'–'+fm(cum,2)+')</small>':'')+(sel?' ← seçildi':'')+'</td></tr>';}
    t+='</table>';
    $('genTbl').innerHTML=t;
    // öğretmen: adım
    let st='<b class="h">✏️ '+(last?'Bu adımda':'Sıradaki adımda')+'</b>';
    const oo=last?last.o:o, tot=D.reduce((s,x)=>s+x.n,0);
    st+='Önceki kelime <b>«'+esc(oo)+'»</b>. Metinde ondan sonra '+D.length+' farklı kelime gelmiş, toplam '+tot+' kez → ham olasılık = sayı ÷ '+tot+'.<br>';
    if(mode==='greedy') st+='Açgözlü seçim: en yüksek olasılıklı aday alınır'+(last?': <b>«'+esc(last.w)+'»</b>.':'.')+' Eşitlikte sözlükte önce gelen. Rastgelelik yok.';
    else{
      st+='① Sıcaklık T = '+fm(T,1)+': her olasılık p^(1/T) yapılıp yeniden toplamı 1 olacak şekilde bölünür'+(Math.abs(T-1)<1e-9?' (T = 1: değişmez).':(T<1?' → büyük olan daha da büyür.':' → olasılıklar birbirine yaklaşır.'))+'<br>';
      const nK=D.filter(x=>x.kesK).length,nP=D.filter(x=>x.kesP).length;
      st+='② Top-k: '+(k?'en iyi '+k+' aday kalır'+(nK?', '+nK+' aday kesildi.':', kesilen yok.'):'kapalı.')+'<br>';
      st+='③ Top-p: '+(p<1?'olasılıkları büyükten küçüğe topla, toplam '+fm(p,2)+'\'e ulaşınca dur'+(nP?', '+nP+' aday kesildi.':', kesilen yok.'):'kapalı.')+' Kalanlar yeniden toplamı 1 olacak şekilde bölünür.<br>';
      st+=last?'④ Zar: r = <b>'+fm(last.r,3)+'</b>. Son p sütunundaki aralıklardan r hangisine düşüyorsa o seçilir → <b>«'+esc(last.w)+'»</b>.':'④ Zar atılınca 0 ile 1 arasında bir r çıkacak; r hangi aralığa düşerse o kelime seçilir.';
    }
    $('genStep').innerHTML=st;
    // öğretmen: sözel
    const best=[...D].sort((a,b)=>b.q-a.q)[0], live=D.filter(x=>x.q>0).length, seen=yol.length>4?new Set(yol).size:null;
    let soz='<b class="h">🗣️ Ne anlama geliyor?</b>';
    if(mode==='greedy') soz+='Açgözlü seçimde aynı başlangıç her zaman aynı metni verir. Bu modelde «'+esc(best.w)+'» '+pc(best.p1)+' ile önde. '+(seen&&seen<6?'Şimdiye kadar '+yol.length+' kelimede yalnız <b>'+seen+' farklı kelime</b>: model bir döngüye girdi — açgözlü seçimin bilinen hastalığı.':'Birkaç adım ilerlet: döngüye girip girmediğine bak.');
    else{
      const b1=[...D].sort((a,b)=>b.p1-a.p1)[0];
      soz+='Ham dağılımda en olası aday «'+esc(b1.w)+'» '+pc(b1.p1)+'; ayarlarınla '+pc(D.find(x=>x.w===b1.w).q)+'. Şu an '+live+' aday hâlâ seçilebilir. ';
      if(T<0.6) soz+='Sıcaklık düşük: model güvendiği yola yapışıyor, metin tutarlı ama tekrara yatkın.';
      else if(T>1.6) soz+='Sıcaklık yüksek: nadir adaylar da sık seçilir, metin çeşitlenir ama tuhaf geçişler artar.';
      else soz+='Sıcaklık orta: modelin öğrendiği oranlara yakın seçiyoruz.';
      if(p<1&&live<D.length) soz+=' Top-p dağılıma göre esner: emin olunan adımda az, kararsız adımda çok aday bırakır.';
    }
    $('genSoz').innerHTML=soz;
  }
  host.querySelectorAll('.gen-mode').forEach(b=>b.onclick=()=>{mode=b.dataset.m;reset();});
  $('genStart').innerHTML=SOZ.filter(w=>w!=='.').map(w=>'<option'+(w==='kedi'?' selected':'')+'>'+w+'</option>').join('');
  $('genStart').onchange=reset;
  ['genT','genK','genP'].forEach(id=>$(id).oninput=()=>{last=null;draw();});
  $('genSeed').onchange=reset; $('genDice').onclick=()=>{$('genSeed').value=1+Math.floor(Math.random()*999);reset();};
  $('genNext').onclick=step; $('genNext8').onclick=()=>{for(let i=0;i<8;i++)step();}; $('genReset').onclick=reset;
  host.querySelectorAll('.gen-pre').forEach(b=>b.onclick=()=>{const [m,T,k,p]=b.dataset.v.split(',');mode=m;$('genT').value=T;$('genK').value=k;$('genP').value=p;reset();});
  reset();

  // ---- Örnek Çalışmalar ----
  const e1=$('genEx1'); if(e1){const y=uret('kedi',16,1,0,1,1,true);
    e1.innerHTML='<div class="gn-out">'+y.map(w=>chip(w)).join(' ')+'</div><p class="gn-note">16 kelimede yalnız <b>'+new Set(y).size+' farklı kelime</b>. «kedi» sonrası süt ve bahçede eşit (2\'şer); eşitlikte önce gelen «süt» seçiliyor, süt → içti → . → kedi: döngü kapandı.</p>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> Her adımda en olasıyı seçmek "en olası metni" değil, çoğu zaman <b>tekrar eden</b> bir metni verir. Büyük modellerde de açgözlü seçimin aynı cümleleri döndürmesi bilinen bir sorundur; bu yüzden sohbet modelleri genelde örnekleme kullanır.</div>';}
  const e2=$('genEx2'); if(e2){const rows=[0.3,0.5,1,1.5,3].map(T=>{const f=new Set();let ll=0,nd=0,N=0;
      for(let t=1;t<=300;t++){const y=uret('.',8,T,0,1,t);f.add(y.join(' '));for(let i=0;i+1<y.length;i++){const q=Object.fromEntries(dagilim(y[i],1,0,1))[y[i+1]];ll+=Math.log(q);N++;if(q<0.15)nd++;}}
      return [T,f.size,ll/N,nd/N];});
    window.__genEx2=rows;
    e2.innerHTML='<table class="tk-tbl"><tr><th>sıcaklık T</th><th>farklı cümle (300\'de)</th><th>ort. ln p (modelin gözünde ne kadar olağan)</th><th>nadir geçiş (p &lt; 0,15)</th></tr>'+rows.map(r=>'<tr><td>'+fm(r[0],1)+'</td><td>'+r[1]+'</td><td>'+fm(r[2],4)+'</td><td>%'+(r[3]*100).toFixed(2).replace('.',',')+'</td></tr>').join('')+'</table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> T yükseldikçe ortalama ln p düşüyor (cümleler modelin gözünde daha "olağandışı") ve nadir geçişler %3,5\'ten %30,4\'e çıkıyor. Çeşitlilik T = 0,3\'te 85 cümleden 1,5\'te 245\'e çıkıyor; T = 3\'te 223\'e hafif düşmesini ölçtük ama nedenini ayrıca incelemedik. <b>Sıcaklık bir çeşitlilik ↔ tutarlılık düğmesi</b>.</div>';}
  const e3=$('genEx3'); if(e3){
    const f=()=>{const bas=$('genEx3s').value,n=+$('genEx3n').value;const g=uret(bas,n,1,0,1,1,true),gp=puan(g);
      let h='<table class="tk-tbl"><tr><th>yöntem</th><th>metin</th><th>Σ ln p</th><th>p (çarpım)</th></tr><tr><td>açgözlü</td><td>'+g.map(w=>chip(w)).join(' ')+'</td><td>'+fm(gp,4)+'</td><td>'+fm(Math.exp(gp),4)+'</td></tr>';
      [2,3,5].forEach(B=>{const [y,s]=isin(bas,n,B)[0];h+='<tr'+(s>gp+1e-9?' class="on"':'')+'><td>beam B = '+B+'</td><td>'+y.map(w=>chip(w)).join(' ')+'</td><td>'+fm(s,4)+'</td><td>'+fm(Math.exp(s),4)+'</td></tr>';});
      $('genEx3o').innerHTML=h+'</table>';};
    e3.innerHTML='<div class="nl-ctl"><label>başlangıç <select id="genEx3s">'+SOZ.filter(w=>w!=='.').map(w=>'<option'+(w==='kuş'?' selected':'')+'>'+w+'</option>').join('')+'</select></label><label>kelime sayısı <input type="range" id="genEx3n" min="2" max="8" value="3"></label></div><div id="genEx3o"></div>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> «kuş» sonrası dört aday eşit (%25). Açgözlü eşitlikte «bahçede»yi alıyor, ama bahçede sonrası dağınık (oynadı %43): toplam p = 0,25 × 0,43 = <b>0,107</b>. Beam iki yolu birden tutuyor ve «ile»nin ardından «oynadı»nın kesin (%100) olduğunu görüyor: p = <b>0,25</b>. Beam, ilk adımda kötü görünen ama sonu iyi biten yolu kaçırmaz. Sarı satır = açgözlüden daha olası bir metin buldu.</div>';
    $('genEx3s').onchange=f;$('genEx3n').oninput=f;f();}
})();

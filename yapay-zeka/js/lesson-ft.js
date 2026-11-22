// 🎓 Ön eğitimden sohbet modeline (#model-ft):
//  Minik bir "son 6 kelime → sonraki kelime" ağı (one-hot pencere → 24 ReLU → softmax) tarayıcıda gerçekten
//  (1) ön eğitilir (internet metni gibi: bilgi cümleleri + art arda sorular), (2) ince ayar yapılır
//  (tam ya da LoRA r=2, yalnız cevap kısmı puanlanır), (3) tercih eğitimi (DPO) görür.
//  Motor sayfadaki Python koduyla (ft.py) birebir aynı işlem sırasını kullanır.
(function(){
  const host=document.getElementById('ftSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const fm=(v,d=3)=>(v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');
  const pc=v=>'%'+(v*100).toFixed(1).replace('.',',');
  const ON=["kedi süt içer .","köpek kemik yer .","kuş yem yer .","at ot yer .","balık yem yer .","kedi ve köpek oynar .","kuş uçar .","balık yüzer .",
    "soru : kedi ne yer ? soru : köpek ne yer ? soru : kuş uçar mı ?","soru : at ne yer ? soru : balık ne yer ? soru : kedi uçar mı ?","soru : kuş ne yer ? soru : balık yüzer mi ? soru : at ne yer ?"];
  const AYAR=["soru : kedi ne yer ? cevap : süt .","soru : köpek ne yer ? cevap : kemik .","soru : at ne yer ? cevap : ot .","soru : kuş uçar mı ? cevap : evet .","soru : kedi uçar mı ? cevap : hayır ."];
  const SOZ=['|'];ON.concat(AYAR).forEach(s=>s.split(' ').forEach(w=>{if(!SOZ.includes(w))SOZ.push(w);}));
  const V=SOZ.length,N=6,H=24,IX={};SOZ.forEach((w,i)=>IX[w]=i);
  const pad=t=>Array(N).fill('|').concat(t).slice(-N);
  function ornekler(sat,maske){const o=[];for(const s of sat){const t=s.split(' '),b=maske?t.indexOf('cevap'):0;for(let i=b;i<t.length;i++)o.push([pad(t.slice(0,i)).map(w=>IX[w]),IX[t[i]]]);}return o;}
  const lcg=t=>{let s=t;return ()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};};
  const gauss=u=>{const a=Math.max(u(),1e-12),b=u();return Math.sqrt(-2*Math.log(a))*Math.cos(2*Math.PI*b);};
  const matris=(r,c,std,u)=>{const m=[];for(let i=0;i<r;i++){const row=[];for(let j=0;j<c;j++)row.push(std*gauss(u));m.push(row);}return m;};
  const zeros=(r,c)=>Array.from({length:r},()=>new Array(c).fill(0));
  function model(t=1){const u=lcg(t);return {W1:matris(N*V,H,.3,u),b1:[new Array(H).fill(0)],W2:matris(H,V,.3,u),b2:[new Array(V).fill(0)]};}
  const kopya=P=>{const o={};for(const k in P)o[k]=P[k].map(r=>r.slice());return o;};
  function carp(A,B){const out=zeros(A.length,B[0].length);for(let i=0;i<A.length;i++)for(let k=0;k<B.length;k++){const a=A[i][k],Bk=B[k],o=out[i];for(let j=0;j<Bk.length;j++)o[j]+=a*Bk[j];}return out;}
  const tr=A=>A[0].map((_,j)=>A.map(r=>r[j]));
  function etkin(P,L){if(!L)return [P.W1,P.W2];const D1=carp(L.A1,L.B1),D2=carp(L.A2,L.B2);
    return [P.W1.map((r,i)=>r.map((x,j)=>x+D1[i][j])),P.W2.map((r,i)=>r.map((x,j)=>x+D2[i][j]))];}
  function ileri(P,pen,W1,W2){const u=P.b1[0].slice();pen.forEach((w,k)=>{const row=W1[k*V+w];for(let j=0;j<H;j++)u[j]+=row[j];});
    const h=u.map(x=>x>0?x:0),z=P.b2[0].slice();
    for(let i=0;i<H;i++){if(h[i]===0)continue;const row=W2[i];for(let j=0;j<V;j++)z[j]+=h[i]*row[j];}
    const m=Math.max(...z),e=z.map(x=>Math.exp(x-m));let s=0;for(const x of e)s+=x;return [u,h,e.map(x=>x/s)];}
  function kayip(P,D,L){const [W1,W2]=etkin(P,L);let t=0;for(const [pen,y] of D)t-=Math.log(ileri(P,pen,W1,W2)[2][y]);return t/D.length;}
  function adam(T,G,M,S,t,lr){for(const k in G){const g=G[k],Tk=T[k],Mk=M[k],Sk=S[k];for(let i=0;i<g.length;i++)for(let j=0;j<g[i].length;j++){const x=g[i][j];
    Mk[i][j]=0.9*Mk[i][j]+0.1*x;Sk[i][j]=0.999*Sk[i][j]+0.001*x*x;Tk[i][j]-=lr*(Mk[i][j]/(1-Math.pow(0.9,t)))/(Math.sqrt(Sk[i][j]/(1-Math.pow(0.999,t)))+1e-8);}}}
  const sifir=T=>{const o={};for(const k in T)o[k]=zeros(T[k].length,T[k][0].length);return o;};
  function gradyan(P,D,c,L){const [W1,W2]=etkin(P,L),g1=zeros(N*V,H),gb1=new Array(H).fill(0),g2=zeros(H,V),gb2=new Array(V).fill(0);
    D.forEach(([pen,y],n)=>{const [u,h,p]=ileri(P,pen,W1,W2),d=p.map(x=>c[n]*x);d[y]-=c[n];
      for(let j=0;j<V;j++)gb2[j]+=d[j];const dh=new Array(H).fill(0);
      for(let i=0;i<H;i++){if(h[i]===0)continue;const row=W2[i],g=g2[i];let s=0;for(let j=0;j<V;j++){g[j]+=h[i]*d[j];s+=d[j]*row[j];}dh[i]=s;}
      for(let i=0;i<H;i++)gb1[i]+=dh[i];
      pen.forEach((w,k)=>{const r=g1[k*V+w];for(let i=0;i<H;i++)r[i]+=dh[i];});});
    if(!L)return {W1:g1,b1:[gb1],W2:g2,b2:[gb2]};
    return {A1:carp(g1,tr(L.B1)),B1:carp(tr(L.A1),g1),A2:carp(g2,tr(L.B2)),B2:carp(tr(L.A2),g2)};}
  // eğitim durumu (adım adım çalışabilsin diye nesne)
  function egitici(P,D,lr,L){const T=L||P,M=sifir(T),S=sifir(T),c=new Array(D.length).fill(1/D.length);let t=0;
    return {adim(n){for(let i=0;i<n;i++){t++;adam(T,gradyan(P,D,c,L),M,S,t,lr);}return t;},get t(){return t;}};}
  function lora(r,t=7){const u=lcg(t);return {A1:matris(N*V,r,.1,u),B1:zeros(r,H),A2:matris(H,r,.1,u),B2:zeros(r,V)};}
  function dagilim(P,istem,L){const [W1,W2]=etkin(P,L);return ileri(P,pad(istem.split(' ')).map(w=>IX[w]),W1,W2)[2];}
  function uret(P,istem,L,n=5){const [W1,W2]=etkin(P,L),t=istem.split(' '),y=[];
    for(let i=0;i<n;i++){const p=ileri(P,pad(t).map(w=>IX[w]),W1,W2)[2];let b=0;for(let j=1;j<V;j++)if(p[j]>p[b])b=j;t.push(SOZ[b]);y.push(SOZ[b]);if(SOZ[b]==='.')break;}return y.join(' ');}
  function logp(P,istem,cevap,L){const [W1,W2]=etkin(P,L),t=istem.split(' ');let top=0;for(const w of cevap.split(' ')){top+=Math.log(ileri(P,pad(t).map(x=>IX[x]),W1,W2)[2][IX[w]]);t.push(w);}return top;}
  function ciftler(istem,cevap){const t=istem.split(' '),o=[];for(const w of cevap.split(' ')){o.push([pad(t).map(x=>IX[x]),IX[w]]);t.push(w);}return o;}
  function dpo(P,istem,iyi,kotu,beta=0.5,tur=30,lr=0.003){const ri=logp(P,istem,iyi),rk=logp(P,istem,kotu),Di=ciftler(istem,iyi),Dk=ciftler(istem,kotu),D=Di.concat(Dk),M=sifir(P),S=sifir(P),iz=[];
    const sig=x=>1/(1+Math.exp(-x));
    for(let t=1;t<=tur;t++){const m=(logp(P,istem,iyi)-ri)-(logp(P,istem,kotu)-rk),w=beta/(1+Math.exp(beta*m));iz.push([t-1,m,-Math.log(sig(beta*m))]);
      adam(P,gradyan(P,D,Di.map(()=>w).concat(Dk.map(()=>-w))),M,S,t,lr);}
    const m=(logp(P,istem,iyi)-ri)-(logp(P,istem,kotu)-rk);iz.push([tur,m,-Math.log(sig(beta*m))]);return iz;}
  const DO=ornekler(ON,false),DA=ornekler(AYAR,true);
  const nPar=P=>{let s=0;for(const k in P)s+=P[k].length*P[k][0].length;return s;};
  window.__ft={SOZ,ornekler,model,kopya,egitici,lora,kayip,uret,logp,dpo,DO,DA,nPar};

  // ---- simülasyon ----
  const Q=["soru : kedi ne yer ?","soru : at ne yer ?","soru : kuş ne yer ?","soru : köpek uçar mı ?","soru : balık yüzer mi ?","kuş","balık"];
  const SEEN={"soru : kedi ne yer ?":1,"soru : at ne yer ?":1};
  let base=null,full=null,lo=null,loOn=true,cur='base',busy=false,curve=[];
  const st={get P(){return cur==='full'?full:base;},get L(){return cur==='lora'&&loOn?lo:null;}};
  function run(job,total,chunk,done){busy=true;let n=0;const tick=()=>{const k=Math.min(chunk,total-n);job(k);n+=k;draw(n,total);if(n<total)setTimeout(tick,0);else{busy=false;done&&done();draw();}};tick();}
  function preTrain(){base=model(1);full=null;lo=null;cur='base';curve=[];const E=egitici(base,DO,0.02);
    run(k=>{E.adim(k);curve.push([E.t,kayip(base,DO)]);},400,20);}
  function fullTune(){if(!base||busy)return;full=kopya(base);cur='full';curve=[];const E=egitici(full,DA,0.003);
    run(k=>{E.adim(k);curve.push([E.t,kayip(full,DA)]);},200,10);}
  function loraTune(){if(!base||busy)return;lo=lora(2);loOn=true;cur='lora';curve=[];const E=egitici(base,DA,0.003,lo);
    run(k=>{E.adim(k);curve.push([E.t,kayip(base,DA,lo)]);},400,20);}
  const chip=w=>'<span class="gn-w">'+esc(w)+'</span>';
  function curveSvg(){if(curve.length<2)return '';const mx=Math.max(...curve.map(c=>c[1])),T=curve[curve.length-1][0];
    const X=t=>30+t/T*250,Y=v=>70-v/mx*60;
    return '<svg viewBox="0 0 290 80" style="width:100%;max-width:320px"><rect width="290" height="80" fill="#0d1426" rx="6"/><polyline fill="none" stroke="#46c46a" stroke-width="2" points="'+[[0,curve[0][1]]].concat(curve).map(c=>X(c[0])+','+Y(c[1])).join(' ')+'"/><text x="28" y="12" font-size="8" fill="#95a2c2" text-anchor="end">'+fm(mx,1)+'</text><text x="280" y="78" font-size="8" fill="#95a2c2" text-anchor="end">tur '+T+'</text></svg>';}
  function draw(n,total){
    host.querySelectorAll('.ft-stage').forEach(b=>b.classList.toggle('on',b.dataset.s===cur));
    $('ftFull').disabled=$('ftLora').disabled=!base||busy; $('ftPre').disabled=busy;
    $('ftLoraOff').disabled=!lo||busy; $('ftLoraOff').textContent=lo&&!loOn?'🔌 LoRA\'yı tak':'🔌 LoRA\'yı çıkar';
    $('ftCurve').innerHTML=busy?'⏳ eğitiliyor… tur '+n+' / '+total:curveSvg();
    if(!base){$('ftTbl').innerHTML='<i>Önce ① ön eğitimi çalıştır.</i>';$('ftStep').innerHTML='<b class="h">✏️ Durum</b>Henüz model yok: ağırlıklar rastgele.';$('ftSoz').innerHTML='';return;}
    if(busy){$('ftStep').innerHTML='<b class="h">✏️ Eğitiliyor</b>tur '+n+' / '+total;return;}
    const P=st.P,L=st.L,q=$('ftQ').value;
    // karşılaştırma tablosu
    const cols=[['Temel (ön eğitim)',base,null]];if(full)cols.push(['Tam ince ayar',full,null]);if(lo)cols.push(['LoRA r=2'+(loOn?'':' (çıkarıldı)'),base,loOn?lo:null]);
    let t='<table class="tk-tbl ft-tbl"><tr><th>istem</th>'+cols.map(c=>'<th>'+c[0]+'</th>').join('')+'</tr>';
    for(const s of Q)t+='<tr'+(s===q?' class="on"':'')+'><td>'+esc(s)+(SEEN[s]?' <small>(ince ayarda gördü)</small>':s.startsWith('soru')?' <small>(görmedi)</small>':' <small>(ön eğitim)</small>')+'</td>'+cols.map(c=>'<td>'+esc(uret(c[1],s,c[2]))+'</td>').join('')+'</tr>';
    t+='<tr><td><b>ön eğitim metni kaybı</b> <small>(büyürse: unutma)</small></td>'+cols.map(c=>'<td>'+fm(kayip(c[1],DO,c[2]))+'</td>').join('')+'</tr>';
    t+='<tr><td><b>ince ayar verisi kaybı</b></td>'+cols.map(c=>'<td>'+fm(kayip(c[1],DA,c[2]))+'</td>').join('')+'</tr></table>';
    $('ftTbl').innerHTML=t;
    // seçili istemin sonraki kelime olasılıkları
    const p=dagilim(P,q,L),top=p.map((x,i)=>[x,i]).sort((a,b)=>b[0]-a[0]).slice(0,5);
    $('ftNext').innerHTML='<div class="tk-h">🔮 «'+esc(q)+'» sonrası ilk kelime ('+(cur==='base'?'temel':cur==='full'?'tam ince ayar':'LoRA')+' model)</div>'+top.map(([x,i])=>'<div>'+chip(SOZ[i])+' <span class="gn-bar" style="width:'+Math.round(x*150)+'px"></span> '+pc(x)+'</div>').join('');
    // öğretmen
    const par=nPar(base),lpar=lo?nPar(lo):0;
    let s='<b class="h">✏️ Şu an seçili model</b>';
    if(cur==='base')s+='<b>Temel model</b>: '+par.toLocaleString('tr-TR')+' ağırlık, ön eğitim metninde 400 tur Adam (lr 0,02) ile eğitildi. Görevi tek: <b>metnin devamını tahmin et</b>. Metinde sorular art arda geldiği için bir sorudan sonra en olası devam… başka bir soru.';
    else if(cur==='full')s+='<b>Tam ince ayar</b>: temel modelin kopyası, 5 soru-cevap örneğiyle 200 tur (lr 0,003). <b>'+par.toLocaleString('tr-TR')+' ağırlığın hepsi</b> değişti. Kayıp yalnız «cevap : … .» kısmında ölçüldü (soru kısmı puanlanmaz).';
    else s+='<b>LoRA</b>: temel ağırlıklar <b>donduruldu</b>. Her katmana W + A·B eklendi (rank 2): yalnız '+lpar.toLocaleString('tr-TR')+' ağırlık eğitildi (temelin '+pc(lpar/par)+'\'i), 400 tur, lr 0,003. '+(loOn?'Adaptör takılı.':'Adaptör <b>çıkarıldı</b>: model birebir temel modele döndü.');
    $('ftStep').innerHTML=s;
    const bq=uret(base,q),cq=uret(P,q,L);
    let z='<b class="h">🗣️ Ne anlama geliyor?</b>';
    if(cur==='base')z+=q.startsWith('soru')?'Temel model «'+esc(q)+'» için «'+esc(bq)+'» diyor: soruyu <b>cevaplamıyor, devam ettiriyor</b>. Bilgi içeride olabilir (istem «kuş» → «'+esc(uret(base,'kuş'))+'») ama soru-cevap biçimini hiç görmedi.':'Ön eğitim cümlesi: model bunu metinden biliyor → «'+esc(bq)+'».';
    else{z+='Bu model «'+esc(q)+'» için «'+esc(cq)+'» diyor (temel: «'+esc(bq)+'»). ';
      if(SEEN[q])z+='İnce ayarda gördüğü bir soru: ezberlemesi beklenir.';
      else if(q.startsWith('soru'))z+=cq.startsWith('cevap')?'Görmediği soruda da <b>cevap biçimine</b> geçti; ama içeriğe dikkat: bilgi ön eğitimden gelmiyorsa <b>uyduruyor</b>.':'Görmediği bu soruda cevap biçimine geçemedi: 5 örnek bu biçimi her soru tipine genellemeye yetmedi.';
      else z+='Ön eğitim cümlesi: ince ayar bu bilgiyi '+(cq===bq?'bozmadı.':'<b>bozdu</b> (unutma).');}
    $('ftSoz').innerHTML=z;
  }
  $('ftQ').innerHTML=Q.map(q=>'<option>'+esc(q)+'</option>').join('');$('ftQ').value="soru : kuş ne yer ?";
  $('ftQ').onchange=()=>draw();
  $('ftPre').onclick=preTrain;$('ftFull').onclick=fullTune;$('ftLora').onclick=loraTune;
  $('ftLoraOff').onclick=()=>{loOn=!loOn;cur='lora';draw();};
  host.querySelectorAll('.ft-stage').forEach(b=>b.onclick=()=>{const s=b.dataset.s;if(s==='full'&&!full||s==='lora'&&!lo||busy)return;cur=s;draw();});
  draw();

  // ---- Örnek Çalışmalar (sayfa açılınca bir kez, tarayıcıda gerçekten eğitilir) ----
  let EX=null;
  function exModels(){if(EX)return EX;const P=model(1);egitici(P,DO,0.02).adim(400);const F=kopya(P);egitici(F,DA,0.003).adim(200);
    const B=kopya(P),L=lora(2);egitici(B,DA,0.003,L).adim(400);const G=kopya(F);const iz=dpo(G,"soru : kuş ne yer ?","cevap : yem .","cevap : ot .");
    EX={P,F,B,L,G,iz};window.__ftEX=EX;return EX;}
  function fillEx(){const {P,F,B,L,G,iz}=exModels();
    const e1=$('ftEx1'); if(e1&&!e1.dataset.ok){e1.dataset.ok=1;
      e1.innerHTML='<table class="tk-tbl"><tr><th>istem</th><th>temel modelin devamı</th></tr>'+Q.map(q=>'<tr><td>'+esc(q)+'</td><td>'+esc(uret(P,q))+'</td></tr>').join('')+'</table>'+
      '<p class="gn-note">Ön eğitim kaybı <b>'+fm(kayip(P,DO),4)+'</b> (metni iyi öğrendi). İnce ayar verisinin kaybı <b>'+fm(kayip(P,DA),2)+'</b>: «cevap» kelimesi metinde hiç geçmediği için model ona neredeyse sıfır olasılık veriyor.</p>'+
      '<div class="callout">💡 <b>Ne öğrendik:</b> Ön eğitimli model bir asistan değil, bir <b>metin devam ettiricidir</b>. Soruya soruyla devam etmesi hata değil: eğitildiği metinde sorular böyle sıralanıyordu. Gerçek "temel" (base) dil modelleri de soruya bazen bir başka soru listesiyle devam eder.</div>';}
    const e2=$('ftEx2'); if(e2&&!e2.dataset.ok){e2.dataset.ok=1;const n=nPar(P),nl=nPar(L);
      e2.innerHTML='<table class="tk-tbl"><tr><th></th><th>temel</th><th>tam ince ayar</th><th>LoRA r = 2</th></tr>'+
      '<tr><td>eğitilen ağırlık</td><td>—</td><td>'+n.toLocaleString('tr-TR')+'</td><td>'+nl.toLocaleString('tr-TR')+' ('+pc(nl/n)+')</td></tr>'+
      '<tr><td>ince ayar verisi kaybı</td><td>'+fm(kayip(P,DA),4)+'</td><td>'+fm(kayip(F,DA),4)+'</td><td>'+fm(kayip(B,DA,L),4)+'</td></tr>'+
      '<tr><td>ön eğitim metni kaybı (unutma)</td><td>'+fm(kayip(P,DO),4)+'</td><td>'+fm(kayip(F,DO),4)+'</td><td>'+fm(kayip(B,DO,L),4)+'</td></tr>'+
      Q.map(q=>'<tr><td>'+esc(q)+'</td><td>'+esc(uret(P,q))+'</td><td>'+esc(uret(F,q))+'</td><td>'+esc(uret(B,q,L))+'</td></tr>').join('')+'</table>'+
      '<div class="callout">💡 <b>Ne öğrendik:</b> İkisi de 5 örnekten «cevap : … .» biçimini öğrendi; LoRA bunu ağırlıkların yalnız '+pc(nl/n)+'\'ini eğiterek yaptı ve adaptör çıkarılınca model birebir temel modele döner. Görmediği «kuş ne yer?» sorusuna ikisi de <b>«ot»</b> diyor: biçimi öğrendi, bilgiyi uydurdu — ön eğitimde «kuş yem yer» cümlesi olduğu hâlde bu minik model o bilgiyi soru-cevap biçimine taşıyamadı. <b>Dürüst not:</b> bu oyuncakta LoRA ön eğitim metnini tam ince ayardan <b>daha çok</b> bozdu ('+fm(kayip(B,DO,L),2)+' ↔ '+fm(kayip(F,DO),2)+'). Büyük modellerde yapılan ölçümlerde LoRA\'nın daha az unutturduğu raporlanıyor (Biderman ve arkadaşları, 2024); bizim ağımız çok küçük ve LoRA payı (%'+(nl/n*100).toFixed(0)+') gerçekteki %0,1–1\'den çok büyük. Bunu burada doğrulayamadık.</div>';}
    const e3=$('ftEx3'); if(e3&&!e3.dataset.ok){e3.dataset.ok=1;const q="soru : kuş ne yer ?";
      const pi0=Math.exp(logp(F,q,"cevap : yem .")),pk0=Math.exp(logp(F,q,"cevap : ot .")),pi1=Math.exp(logp(G,q,"cevap : yem .")),pk1=Math.exp(logp(G,q,"cevap : ot ."));
      e3.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start"><table class="tk-tbl"><tr><th>adım</th><th>fark m (ln oran)</th><th>DPO kaybı</th></tr>'+iz.filter((r,i)=>i%5===0).map(r=>'<tr><td>'+r[0]+'</td><td>'+fm(r[1])+'</td><td>'+fm(r[2],4)+'</td></tr>').join('')+'</table>'+
      '<table class="tk-tbl"><tr><th></th><th>DPO öncesi</th><th>30 adım sonra</th></tr><tr><td>p(«cevap : yem .») — tercih edilen</td><td>'+pi0.toExponential(2).replace('.',',')+'</td><td>'+pi1.toExponential(2).replace('.',',')+'</td></tr><tr><td>p(«cevap : ot .») — reddedilen</td><td>'+pc(pk0)+'</td><td>'+pc(pk1)+'</td></tr>'+
      Q.map(s=>'<tr><td>'+esc(s)+'</td><td>'+esc(uret(F,s))+'</td><td>'+esc(uret(G,s))+'</td></tr>').join('')+'</table></div>'+
      '<div class="callout">💡 <b>Ne öğrendik:</b> DPO kaybı 0,693\'ten '+fm(iz[iz.length-1][2],3)+'\'e düştü: model tercih farkını gerçekten büyüttü. Ama nasıl? Reddedilen cevabın olasılığı '+pc(pk0)+' → '+pc(pk1)+' düştü, tercih edilen hâlâ neredeyse sıfır: model «yem»i <b>öğrenmedi</b>, yalnız «ot»tan uzaklaştı ve «'+esc(uret(G,q))+'» demeye başladı. Üstelik başka sorulara verdiği cevaplar da değişti. Bu yüzden gerçekte: (1) tercih eğitimi, iyi cevabı zaten üretebilen bir modele (önce ince ayar) uygulanır; (2) çok sayıda, çeşitli tercih çifti kullanılır; (3) β ile referans modelden fazla uzaklaşma cezalandırılır.</div>';}
  }
  // örnek bölümleri açıldığında hesapla (≈1 sn)
  document.querySelectorAll('#model-ft .sahne-head').forEach(h=>h.addEventListener('click',()=>setTimeout(fillEx,30)));
  window.__ftFillEx=fillEx;
})();

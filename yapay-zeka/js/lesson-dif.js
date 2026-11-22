// 🌫️ Diffusion dersi (#model-dif): minik DDPM, 2B noktalar (GAN dersindeki aynı 8 küme).
//  İleri süreç: x_t = √ᾱ_t·x0 + √(1−ᾱ_t)·ε (T = 50, β 0,001 → 0,2). Ağ ε_θ(x_t, t): (x, y, sin, cos) → 24 tanh → 24 tanh → 2.
//  Eğitim: eklenen gürültüyü tahmin et (MSE), Adam lr 0,003, yığın 32. Üretim: saf gürültüden 50 adımda geri.
//  Tarayıcıda gerçekten eğitilir; motor sayfadaki Python koduyla (dif.py) aynı işlem sırasını kullanır.
(function(){
  const host=document.getElementById('dfSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const f3=v=>v.toFixed(3).replace('.',','),f4=v=>v.toFixed(4).replace('.',',');
  const T=50,BETA=[],ALFA=[],AB=[];let pr=1;for(let i=0;i<T;i++){const b=1e-3+(0.2-1e-3)*i/(T-1);BETA.push(b);ALFA.push(1-b);pr*=1-b;AB.push(pr);}
  const lcg=t=>{let s=t;return ()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};};
  const gauss=u=>{const a=Math.max(u(),1e-12),b=u();return Math.sqrt(-2*Math.log(a))*Math.cos(2*Math.PI*b);};
  const MER=[];for(let k=0;k<8;k++)MER.push([2*Math.cos(2*Math.PI*k/8),2*Math.sin(2*Math.PI*k/8)]);
  const gercek=u=>{const k=Math.min(7,Math.floor(u()*8)),[cx,cy]=MER[k];return [cx+0.1*gauss(u),cy+0.1*gauss(u)];};
  const H=24,mat=(r,c,std,u)=>{const m=[];for(let i=0;i<r;i++){const row=[];for(let j=0;j<c;j++)row.push(std*gauss(u));m.push(row);}return m;};
  function model(t){const u=lcg(t);return {W1:mat(4,H,.5,u),b1:[new Array(H).fill(0)],W2:mat(H,H,.3,u),b2:[new Array(H).fill(0)],W3:mat(H,2,.3,u),b3:[[0,0]]};}
  const girdi=(x,t)=>{const tt=(t+1)/T;return [x[0],x[1],Math.sin(Math.PI*tt),Math.cos(Math.PI*tt)];};
  function kat(x,W,b,f){const o=[];for(let j=0;j<b[0].length;j++){let s=b[0][j];for(let i=0;i<x.length;i++)s+=x[i]*W[i][j];o.push(f(s));}return o;}
  function tahmin(P,x,t){const f=girdi(x,t),h1=kat(f,P.W1,P.b1,Math.tanh),h2=kat(h1,P.W2,P.b2,Math.tanh);return [f,h1,h2,kat(h2,P.W3,P.b3,s=>s)];}
  const z0=P=>{const o={};for(const k in P)o[k]=P[k].map(r=>new Array(r.length).fill(0));return o;};
  function egitici(t0,yigin=32,lr=0.003){const P=model(t0),u=lcg(t0+70),M=z0(P),S=z0(P),iz=[];let s=0;
    function adim(){s++;const G=z0(P);let L=0;
      for(let n=0;n<yigin;n++){const x0=gercek(u),t=Math.min(T-1,Math.floor(u()*T)),e=[gauss(u),gauss(u)],xt=[0,1].map(i=>Math.sqrt(AB[t])*x0[i]+Math.sqrt(1-AB[t])*e[i]);
        const [f,h1,h2,o]=tahmin(P,xt,t),d=[0,1].map(i=>2*(o[i]-e[i])/yigin);L+=(o[0]-e[0])**2+(o[1]-e[1])**2;
        for(let i=0;i<2;i++)G.b3[0][i]+=d[i];
        const d2=[];for(let j=0;j<H;j++){let q=0;for(let i=0;i<2;i++){G.W3[j][i]+=h2[j]*d[i];q+=d[i]*P.W3[j][i];}d2.push(q*(1-h2[j]*h2[j]));}
        const d1=[];for(let a=0;a<H;a++){let q=0;for(let j=0;j<H;j++){G.W2[a][j]+=h1[a]*d2[j];q+=d2[j]*P.W2[a][j];}d1.push(q*(1-h1[a]*h1[a]));}
        for(let j=0;j<H;j++){G.b2[0][j]+=d2[j];G.b1[0][j]+=d1[j];for(let i=0;i<4;i++)G.W1[i][j]+=f[i]*d1[j];}}
      for(const k in P)for(let i=0;i<P[k].length;i++)for(let j=0;j<P[k][0].length;j++){const g=G[k][i][j];M[k][i][j]=.9*M[k][i][j]+.1*g;S[k][i][j]=.999*S[k][i][j]+.001*g*g;
        P[k][i][j]-=lr*(M[k][i][j]/(1-Math.pow(.9,s)))/(Math.sqrt(S[k][i][j]/(1-Math.pow(.999,s)))+1e-8);}
      iz.push(L/yigin);}
    return {P,iz,adim(n){for(let i=0;i<n;i++)adim();return s;},get s(){return s;}};}
  function uret(P,adet=400,t0=9,kayit=[]){const u=lcg(t0),X=[];for(let i=0;i<adet;i++)X.push([gauss(u),gauss(u)]);const an={};an[T]=X.map(x=>x.slice());
    for(let t=T-1;t>=0;t--){for(const x of X){const e=tahmin(P,x,t)[3];for(let i=0;i<2;i++)x[i]=(x[i]-BETA[t]/Math.sqrt(1-AB[t])*e[i])/Math.sqrt(ALFA[t]);
        if(t>0){const z=[gauss(u),gauss(u)];for(let i=0;i<2;i++)x[i]+=Math.sqrt(BETA[t])*z[i];}}
      an[t]=X.map(x=>x.slice());}
    return [X,an];}
  function kapsam(X){const say=new Array(8).fill(0);let uzak=0;for(const x of X){const d=MER.map(([cx,cy])=>Math.hypot(x[0]-cx,x[1]-cy)),k=d.indexOf(Math.min(...d));if(d[k]<0.5)say[k]++;else uzak++;}return [say,uzak];}
  window.__dif={T,AB,BETA,egitici,uret,kapsam};

  // ---- simülasyon ----
  const DATA=(()=>{const u=lcg(321),o=[];for(let i=0;i<400;i++)o.push(gercek(u));return o;})();
  const NZ=(()=>{const u=lcg(654),o=[];for(let i=0;i<400;i++)o.push([gauss(u),gauss(u)]);return o;})();
  let E=null,run=false,gen=null,phase='fwd';
  const SZ=300,S=v=>SZ/2+v*SZ/8;
  function plot(pts,col,ghost){const c=$('dfCv'),g=c.getContext('2d');g.clearRect(0,0,SZ,SZ);g.fillStyle='#0d1426';g.fillRect(0,0,SZ,SZ);
    g.strokeStyle='#1f2a46';g.beginPath();g.moveTo(0,SZ/2);g.lineTo(SZ,SZ/2);g.moveTo(SZ/2,0);g.lineTo(SZ/2,SZ);g.stroke();
    g.strokeStyle='rgba(220,230,250,.25)';for(const [cx,cy] of MER){g.beginPath();g.arc(S(cx),S(-cy),SZ/8*0.5,0,7);g.stroke();}
    g.fillStyle=col;for(const [x,y] of pts){g.beginPath();g.arc(S(x),S(-y),1.8,0,7);g.fill();}}
  function draw(){host.querySelectorAll('.df-ph').forEach(b=>b.classList.toggle('on',b.dataset.p===phase));
    $('dfFwd').style.display=phase==='fwd'?'':'none';$('dfTrain').style.display=phase==='train'?'':'none';$('dfGen').style.display=phase==='gen'?'':'none';
    const st=$('dfStep'),sz=$('dfSoz');
    if(phase==='fwd'){const t=+$('dfT').value,ti=t-1;$('dfTv').textContent=t;const a=t?Math.sqrt(AB[ti]):1,b=t?Math.sqrt(1-AB[ti]):0;
      plot(DATA.map((x,i)=>[a*x[0]+b*NZ[i][0],a*x[1]+b*NZ[i][1]]),'#5aa0ff');
      st.innerHTML='<b class="h">✏️ t = '+t+'</b>'+(t?'Her nokta: x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε<br>= <b>'+f3(a)+'</b> · (asıl nokta) + <b>'+f3(b)+'</b> · (gürültü)<br>ᾱ_'+t+' = '+f4(AB[ti])+' (α\'ların çarpımı; β_'+t+' = '+f4(BETA[ti])+')':'Gürültü yok: asıl veri, çember üstünde 8 küme.');
      sz.innerHTML='<b class="h">🗣️ Ne anlama geliyor?</b>'+(t<10?'Az gürültü: kümeler hâlâ belli.':t<30?'Kümeler bulanıklaşıp birbirine karışıyor; yapı kayboluyor.':'Neredeyse saf gürültü: t = 50\'de verinin payı %'+(Math.sqrt(AB[T-1])*100).toFixed(1).replace('.',',')+'. Bu ileri süreç <b>öğrenilmez</b>, sabit bir formül.')+' Model, bunun <b>tersini</b> öğrenecek: gürültülü noktaya bakıp içindeki gürültüyü tahmin etmeyi.';}
    else if(phase==='train'){$('dfRun').textContent=run?'⏸ durdur':'▶ eğit';const n=E?E.s:0;
      const DEM=E?DATA.slice(0,200).map((x,i)=>{const t=24,a=Math.sqrt(AB[t]),b=Math.sqrt(1-AB[t]),xt=[a*x[0]+b*NZ[i][0],a*x[1]+b*NZ[i][1]],e=tahmin(E.P,xt,t)[3];return [(xt[0]-b*e[0])/a,(xt[1]-b*e[1])/a];}):DATA;
      plot(DEM,E?'#46c46a':'#5aa0ff');
      let L='';if(E&&E.iz.length>1){const k=E.iz,m=k.length,p=[];const w=Math.max(1,Math.floor(m/120));for(let i=0;i<m;i+=w){let s=0,c=0;for(let j=i;j<Math.min(m,i+w);j++){s+=k[j];c++;}p.push([i,s/c]);}
        L='<svg viewBox="0 0 300 90" style="width:100%;max-width:320px"><rect width="300" height="90" fill="#0d1426" rx="6"/><polyline fill="none" stroke="#a34ad1" stroke-width="1.8" points="'+p.map(q=>(20+q[0]/m*270)+','+(80-Math.min(2,q[1])/2*70)).join(' ')+'"/><text x="24" y="14" font-size="8.5" fill="#95a2c2">gürültü tahmin hatası (MSE)</text></svg>';}
      $('dfCurve').innerHTML=L+'<div class="nl-legend">adım '+n+' / 2000'+(E?' · son 100 adım kayıp '+f3(E.iz.slice(-100).reduce((a,b)=>a+b,0)/Math.min(100,E.iz.length)):'')+'</div>';
      st.innerHTML='<b class="h">✏️ Bir eğitim örneği</b>① Veriden bir nokta x₀ al. ② Rastgele bir t seç (1–50). ③ Gürültü ε çek, x_t = √ᾱ_t·x₀ + √(1−ᾱ_t)·ε ile tek adımda gürültüle. ④ Ağa (x_t, t) ver, <b>ε\'yi tahmin etsin</b>. ⑤ Kayıp = (tahmin − ε)². Her adımda 32 örnek.';
      sz.innerHTML='<b class="h">🗣️ Ne anlama geliyor?</b>'+(E?'Yeşil noktalar: t = 25\'te gürültülenmiş 200 noktayı modelin tahminiyle tek adımda temizleme denemesi. Eğitim ilerledikçe kümelere toplanıyorlar: model "bu noktada ne kadar ve hangi yönde gürültü var" sorusunu öğreniyor.':'Model henüz yok. ▶ ile 2.000 adım eğit (tarayıcıda birkaç saniye).')+' Dikkat: kayıp 0\'a inmez — aynı gürültülü nokta farklı asıl noktalardan gelmiş olabilir; model ortalamayı öğrenir.';}
    else{if(!E||E.s<2000){plot([],'#f0a032');st.innerHTML='<b class="h">✏️ Önce eğit</b>Üretim için eğitilmiş model gerekiyor: «② Eğit» sekmesinde 2.000 adımı tamamla.';sz.innerHTML='';return;}
      if(!gen)gen=uret(E.P,400,9);const k=+$('dfK').value;$('dfKv').textContent=k;const pts=gen[1][T-k];
      const [say,uz]=kapsam(pts);plot(pts,'#f0a032');
      st.innerHTML='<b class="h">✏️ Geri adım '+k+' / 50</b>'+(k?'Her adımda: tahmin edilen gürültünün bir kısmını çıkar, ölçekle, biraz taze gürültü ekle:<br>x_{t−1} = (x_t − β_t/√(1−ᾱ_t) · ε_θ(x_t, t)) / √α_t + √β_t · z':'Başlangıç: 400 nokta saf gürültüden, N(0, 1).')+'<br>Kümelerde: '+(400-uz)+', dışarıda: '+uz+' · yakalanan küme '+say.filter(x=>x>=10).length+' / 8';
      sz.innerHTML='<b class="h">🗣️ Ne anlama geliyor?</b>'+(k<20?'İlk adımlarda yalnız kaba yapı çıkıyor: noktalar çembere doğru çekiliyor.':k<45?'Kümeler belirginleşiyor; her nokta kendine en yakın kümeye yöneliyor.':'Son adımlar ince ayar yapıyor.')+' GAN tek adımda üretirken Diffusion <b>50 küçük adımda</b> üretir: yavaş ama her adım kolay bir iş (biraz gürültü temizle), bu yüzden eğitim kararlı ve bütün kümeler kapsanıyor.';}}
  function tick(){if(!run)return;E.adim(20);gen=null;draw();if(E.s>=2000){run=false;draw();return;}setTimeout(tick,0);}
  $('dfRun').onclick=()=>{if(!E)E=egitici(1);if(E.s>=2000)return;run=!run;draw();if(run)tick();};
  $('dfReset').onclick=()=>{run=false;E=null;gen=null;draw();};
  host.querySelectorAll('.df-ph').forEach(b=>b.onclick=()=>{phase=b.dataset.p;draw();});
  $('dfT').oninput=draw;$('dfK').oninput=draw;
  $('dfPlay').onclick=()=>{if(!E||E.s<2000)return;let k=0;const step=()=>{$('dfK').value=k;draw();if(k<50){k+=2;setTimeout(step,60);}};step();};
  draw();

  // ---- Örnek Çalışmalar ----
  const e1=$('dfEx1');if(e1)e1.innerHTML='<table class="tk-tbl"><tr><th>t</th><th>ᾱ_t</th><th>x_t = (asıl nokta payı)·x₀ + (gürültü payı)·ε</th></tr>'+[0,9,24,39,49].map(t=>'<tr><td>'+(t+1)+'</td><td>'+f4(AB[t])+'</td><td>'+f3(Math.sqrt(AB[t]))+' · x₀ + '+f3(Math.sqrt(1-AB[t]))+' · ε</td></tr>').join('')+'</table><div class="callout">💡 <b>Ne öğrendik:</b> Gürültü her adımda biraz artıyor; 50. adımda asıl verinin payı %6,7. ᾱ formülü sayesinde herhangi bir t\'ye <b>tek adımda</b> atlanabiliyor — eğitimde 50 adımı tek tek çalıştırmaya gerek yok. Bu takvim (β 0,001 → 0,2, 50 adım) küçük örneğimize göre seçildi; gerçek modeller genelde 1.000 adım ve daha yumuşak takvimler kullanır.</div>';
  let EX=null;
  function fillEx(){if(EX)return;EX=[];let P1=null;for(const t of [1,2,3]){const E2=egitici(t);E2.adim(2000);const [X]=uret(E2.P),[s,u]=kapsam(X);let l=0;for(const v of E2.iz.slice(-200))l+=v;EX.push([t,l/200,s.filter(q=>q>=10).length,u,s]);if(t===1)P1=E2.P;}
    window.__difEx2=EX;
    $('dfEx2').innerHTML='<table class="tk-tbl"><tr><th>tohum</th><th>kayıp (son 200)</th><th>yakalanan küme</th><th>dışarıda</th><th>küme başına</th></tr>'+EX.map(r=>'<tr><td>'+r[0]+'</td><td>'+f4(r[1])+'</td><td>'+r[2]+' / 8</td><td>'+r[3]+' / 400</td><td>'+r[4].join(' · ')+'</td></tr>').join('')+'</table>'+
      '<table class="tk-tbl"><tr><th>aynı veri, GAN dersi (3.000 adım)</th><td>tohum 1: 8 · tohum 2: 5 · tohum 3: 6 · tohum 4: 7 küme</td></tr></table>'+
      '<div class="callout">💡 <b>Ne öğrendik:</b> Diffusion üç tohumda da 8 kümenin hepsini yakalıyor; GAN aynı veride 5 ile 8 arasında oynuyordu. Kayıp sade bir "gürültüyü tahmin et" hatası: iki ağ arasında oyun yok, eğitim kararlı. Bedeli: üretim 50 adım (GAN\'da 1). Kümelerin dışındaki noktalar küçük modelimizin bulanıklığı; daha büyük ağ ve daha uzun eğitimle azalır.</div>';
    const [,A]=uret(P1),rows=[39,24,9,0].map(t=>[t,kapsam(A[t])[1]]);window.__difEx3=rows;
    $('dfEx3').innerHTML='<table class="tk-tbl"><tr><th>kalan adım</th><th>kümelerin dışındaki nokta</th></tr>'+rows.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+' / 400</td></tr>').join('')+'</table><div class="callout">💡 <b>Ne öğrendik:</b> Yapı aniden değil, adım adım ortaya çıkıyor: önce kaba şekil, sonra ince ayrıntı. Görüntü modellerinde de aynı: ilk adımlarda kompozisyon ve renk lekeleri, son adımlarda dokular. Hızlı örnekleyiciler (DDIM vb.) adım sayısını azaltmak için bu yolu kısaltır.</div>';}
  document.querySelectorAll('#model-dif .sahne-head').forEach(h=>h.addEventListener('click',()=>setTimeout(fillEx,30)));
  window.__difFillEx=fillEx;
})();

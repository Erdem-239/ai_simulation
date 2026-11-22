// 🖋️ Metinden Görüntüye dersi (#model-t2i): koşullu Diffusion + sınıflandırıcısız yönlendirme (CFG), 2B noktalar.
//  "İstem" = 8 yönden biri ("kuzey" …); "metin kodlayıcısı" onu (cos θ, sin θ, 1) vektörüne çevirir, boş istem (0, 0, 0).
//  Ağ ε_θ(x_t, t, c): (x, y, sin, cos, c₁, c₂, c₃) → 24 tanh → 24 tanh → 2. Eğitimde istemlerin %20'si boş bırakılır.
//  Üretim: ε = ε_boş + w·(ε_istem − ε_boş). Tarayıcıda gerçekten eğitilir; sayfadaki Python koduyla (t2i.py) aynı işlem sırası.
(function(){
  const host=document.getElementById('tiSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const f3=v=>v.toFixed(3).replace('.',','),f4=v=>v.toFixed(4).replace('.',','),pc=v=>'%'+(v*100).toFixed(1).replace('.',',');
  const T=50,BETA=[],ALFA=[],AB=[];let pr=1;for(let i=0;i<T;i++){const b=1e-3+(0.2-1e-3)*i/(T-1);BETA.push(b);ALFA.push(1-b);pr*=1-b;AB.push(pr);}
  const lcg=t=>{let s=t;return ()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};};
  const gauss=u=>{const a=Math.max(u(),1e-12),b=u();return Math.sqrt(-2*Math.log(a))*Math.cos(2*Math.PI*b);};
  const MER=[];for(let k=0;k<8;k++)MER.push([2*Math.cos(2*Math.PI*k/8),2*Math.sin(2*Math.PI*k/8)]);
  const YON=["doğu","kuzeydoğu","kuzey","kuzeybatı","batı","güneybatı","güney","güneydoğu"];
  const kodla=ist=>{const k=YON.indexOf(ist);if(k<0)return [0,0,0];const a=2*Math.PI*k/8;return [Math.cos(a),Math.sin(a),1];};
  const gercek=u=>{const k=Math.min(7,Math.floor(u()*8)),[cx,cy]=MER[k];return [[cx+0.1*gauss(u),cy+0.1*gauss(u)],YON[k]];};
  const H=24,mat=(r,c,std,u)=>{const m=[];for(let i=0;i<r;i++){const row=[];for(let j=0;j<c;j++)row.push(std*gauss(u));m.push(row);}return m;};
  function model(t){const u=lcg(t);return {W1:mat(7,H,.5,u),b1:[new Array(H).fill(0)],W2:mat(H,H,.3,u),b2:[new Array(H).fill(0)],W3:mat(H,2,.3,u),b3:[[0,0]]};}
  const girdi=(x,t,c)=>{const tt=(t+1)/T;return [x[0],x[1],Math.sin(Math.PI*tt),Math.cos(Math.PI*tt)].concat(c);};
  function kat(x,W,b,f){const o=[];for(let j=0;j<b[0].length;j++){let s=b[0][j];for(let i=0;i<x.length;i++)s+=x[i]*W[i][j];o.push(f(s));}return o;}
  function tahmin(P,x,t,c){const f=girdi(x,t,c),h1=kat(f,P.W1,P.b1,Math.tanh),h2=kat(h1,P.W2,P.b2,Math.tanh);return [f,h1,h2,kat(h2,P.W3,P.b3,s=>s)];}
  const z0=P=>{const o={};for(const k in P)o[k]=P[k].map(r=>new Array(r.length).fill(0));return o;};
  function egitici(t0,yigin=32,lr=0.003,bos=0.2){const P=model(t0),u=lcg(t0+70),M=z0(P),S=z0(P),iz=[];let s=0;
    function adim(){s++;const G=z0(P);let L=0;
      for(let n=0;n<yigin;n++){const [x0,ad]=gercek(u),t=Math.min(T-1,Math.floor(u()*T)),e=[gauss(u),gauss(u)];const c=kodla(u()<bos?'':ad);
        const xt=[0,1].map(i=>Math.sqrt(AB[t])*x0[i]+Math.sqrt(1-AB[t])*e[i]);
        const [f,h1,h2,o]=tahmin(P,xt,t,c),d=[0,1].map(i=>2*(o[i]-e[i])/yigin);L+=(o[0]-e[0])**2+(o[1]-e[1])**2;
        for(let i=0;i<2;i++)G.b3[0][i]+=d[i];
        const d2=[];for(let j=0;j<H;j++){let q=0;for(let i=0;i<2;i++){G.W3[j][i]+=h2[j]*d[i];q+=d[i]*P.W3[j][i];}d2.push(q*(1-h2[j]*h2[j]));}
        const d1=[];for(let a=0;a<H;a++){let q=0;for(let j=0;j<H;j++){G.W2[a][j]+=h1[a]*d2[j];q+=d2[j]*P.W2[a][j];}d1.push(q*(1-h1[a]*h1[a]));}
        for(let j=0;j<H;j++){G.b2[0][j]+=d2[j];G.b1[0][j]+=d1[j];for(let i=0;i<7;i++)G.W1[i][j]+=f[i]*d1[j];}}
      for(const k in P)for(let i=0;i<P[k].length;i++)for(let j=0;j<P[k][0].length;j++){const g=G[k][i][j];M[k][i][j]=.9*M[k][i][j]+.1*g;S[k][i][j]=.999*S[k][i][j]+.001*g*g;
        P[k][i][j]-=lr*(M[k][i][j]/(1-Math.pow(.9,s)))/(Math.sqrt(S[k][i][j]/(1-Math.pow(.999,s)))+1e-8);}
      iz.push(L/yigin);}
    return {P,iz,adim(n){for(let i=0;i<n;i++)adim();return s;},get s(){return s;}};}
  function uret(P,ist,w,adet=400,t0=9,cOzel=null){const u=lcg(t0),X=[];for(let i=0;i<adet;i++)X.push([gauss(u),gauss(u)]);const c=cOzel||kodla(ist),b0=[0,0,0];
    for(let t=T-1;t>=0;t--)for(const x of X){const ek=tahmin(P,x,t,c)[3],eb=tahmin(P,x,t,b0)[3],e=[0,1].map(i=>eb[i]+w*(ek[i]-eb[i]));
      for(let i=0;i<2;i++)x[i]=(x[i]-BETA[t]/Math.sqrt(1-AB[t])*e[i])/Math.sqrt(ALFA[t]);if(t>0){const z=[gauss(u),gauss(u)];for(let i=0;i<2;i++)x[i]+=Math.sqrt(BETA[t])*z[i];}}
    return X;}
  function kapsam(X){const say=new Array(8).fill(0);let uz=0;for(const x of X){const d=MER.map(([cx,cy])=>Math.hypot(x[0]-cx,x[1]-cy)),k=d.indexOf(Math.min(...d));if(d[k]<0.5)say[k]++;else uz++;}return [say,uz];}
  function hedef(X,k){const ic=X.filter(x=>Math.hypot(x[0]-MER[k][0],x[1]-MER[k][1])<0.5);if(!ic.length)return [0,0];let sd=0;
    for(let i=0;i<2;i++){let m=0;for(const x of ic)m+=x[i];m/=ic.length;let v=0;for(const x of ic)v+=(x[i]-m)**2;sd+=Math.sqrt(v/ic.length);}return [ic.length/X.length,sd/2];}
  window.__t2i={kodla,egitici,uret,kapsam,hedef,YON};

  // ---- simülasyon ----
  let E=null,busy=false,cache={};
  const SZ=300,S=v=>SZ/2+v*SZ/8;
  function plot(X,k){const c=$('tiCv'),g=c.getContext('2d');g.fillStyle='#0d1426';g.fillRect(0,0,SZ,SZ);
    MER.forEach(([cx,cy],i)=>{g.strokeStyle=i===k?'#f0c040':'rgba(220,230,250,.22)';g.lineWidth=i===k?2:1;g.beginPath();g.arc(S(cx),S(-cy),SZ/16,0,7);g.stroke();
      g.fillStyle='rgba(149,162,194,.8)';g.font='10px sans-serif';g.textAlign='center';g.fillText(YON[i],S(cx*1.42),S(-cy*1.42)+3);});
    g.fillStyle='#f0a032';for(const [x,y] of X||[]){g.beginPath();g.arc(S(x),S(-y),1.8,0,7);g.fill();}}
  function train(){if(busy||E)return;busy=true;E=egitici(1);const tick=()=>{E.adim(50);$('tiInfo').innerHTML='⏳ eğitiliyor… adım '+E.s+' / 3.000';if(E.s<3000)setTimeout(tick,0);else{busy=false;draw();}};tick();}
  function draw(){const ist=$('tiP').value,w=+$('tiW').value,k=YON.indexOf(ist);$('tiWv').textContent=w;
    const c=kodla(ist);$('tiVec').innerHTML='«'+(ist||'boş istem')+'» → c = ('+c.map(v=>f3(v)).join('; ')+')';
    if(!E||busy){plot([],k);if(!busy)$('tiInfo').innerHTML='Model henüz yok — ▶ ile eğit (tarayıcıda 3.000 adım, ~5-10 sn).';$('tiStep').innerHTML='<b class="h">✏️ Hazırlık</b>Bir ağ, gürültülü noktaya ek olarak bir <b>istem vektörü</b> alacak ve gürültüyü tahmin edecek. Eğitimde istemlerin %20\'si bilerek boş bırakılıyor: aynı ağ hem "istemli" hem "istemsiz" tahmin yapmayı öğreniyor.';$('tiSoz').innerHTML='';return;}
    const key=ist+'|'+w;if(!cache[key])cache[key]=uret(E.P,ist,w,300,9);const X=cache[key];plot(X,k);
    const [say,uz]=kapsam(X),[h,sd]=k>=0?hedef(X,k):[0,0];
    $('tiInfo').innerHTML='300 nokta · '+(k>=0?'hedef kümede <b>'+pc(h)+'</b> · yayılım <b>'+f3(sd)+'</b> (gerçek veride 0,1) · ':'')+'küme başına: '+say.join(' · ')+' · dışarıda '+uz;
    // canlı CFG hesabı: ilk noktanın t=25'teki tahmini
    const x=[0.5,1.2],t=24,ek=tahmin(E.P,x,t,c)[3],eb=tahmin(E.P,x,t,[0,0,0])[3],e=[0,1].map(i=>eb[i]+w*(ek[i]-eb[i]));
    $('tiStep').innerHTML='<b class="h">✏️ Bir adımın içi (örnek nokta x = (0,5; 1,2), t = 25)</b>Ağ iki kez çalışır:<br>ε_boş = ('+f3(eb[0])+'; '+f3(eb[1])+') — istem yokken<br>ε_istem = ('+f3(ek[0])+'; '+f3(ek[1])+') — «'+(ist||'boş')+'» ile<br>ε = ε_boş + w·(ε_istem − ε_boş) = ('+f3(e[0])+'; '+f3(e[1])+'), w = '+w+'<br>Fark (ε_istem − ε_boş) "istemin söylediği yön"; w onu büyütür.';
    let z='<b class="h">🗣️ Ne anlama geliyor?</b>';
    if(k<0||w===0)z+='İstem yok sayılıyor (w = 0 ya da boş istem): model verinin tamamını, 8 kümenin hepsini üretiyor — koşulsuz bir diffusion modeli gibi.';
    else if(w<=1)z+='w = 1: modelin öğrendiği koşullu dağılım. Noktaların '+pc(h)+'\'i «'+ist+'» kümesinde, yayılım gerçek veriye yakın.';
    else if(w<=3)z+='w > 1: istem güçlendirildi. İsabet yüksek, ama yayılım ('+f3(sd)+') gerçek verinin (0,1) altına iniyor: çıktılar daha "tipik", daha az çeşitli.';
    else z+='Çok büyük w: noktalar kümenin merkezine sıkıştı ya da '+(h<0.95?'hedefi aşıp dışarı taştı (isabet '+pc(h)+')':'çok dar bir alana toplandı')+'. Görüntü modellerinde bunun karşılığı aşırı doygun, yapay görünen resimler.';
    $('tiSoz').innerHTML=z;}
  $('tiP').innerHTML='<option value="">(boş istem)</option>'+YON.map(y=>'<option'+(y==='kuzey'?' selected':'')+'>'+y+'</option>').join('');
  $('tiP').onchange=draw;$('tiW').oninput=draw;$('tiTrain').onclick=train;
  draw();

  // ---- Örnek Çalışmalar ----
  let EX=null;
  function fillEx(){if(EX)return;const E2=egitici(1);E2.adim(3000);EX=E2.P;let l=0;for(const v of E2.iz.slice(-200))l+=v;
    const R1=[0,1,2,4,7].map(w=>{const X=uret(EX,'kuzey',w),[h,sd]=hedef(X,2),[s]=kapsam(X);return [w,h,sd,s];});
    window.__t2iEx1=[l/200,R1];
    $('tiEx1').innerHTML='<p class="gn-note">Eğitim: 3.000 adım, son 200 adımın kaybı '+f4(l/200)+'.</p><table class="tk-tbl"><tr><th>w</th><th>«kuzey» kümesinde</th><th>yayılım (gerçek 0,1)</th><th>küme başına</th></tr>'+R1.map(r=>'<tr><td>'+r[0]+'</td><td>'+pc(r[1])+'</td><td>'+f3(r[2])+'</td><td><small>'+r[3].join(' · ')+'</small></td></tr>').join('')+'</table>'+
      '<div class="callout">💡 <b>Ne öğrendik:</b> w = 0\'da istem yok sayılıyor (8 küme, kuzeyde yalnız ~%7). w = 1\'de neredeyse bütün noktalar kuzeyde ve yayılım gerçeğe yakın. w büyüdükçe yayılım gerçek verinin altına düşüyor (çeşitlilik kaybı), çok büyük w\'de noktalar hedefi aşıp dışarı taşıyor (w = 4\'te isabet ~%68, w = 7\'de ~%10). Görüntü modellerindeki "guidance scale" ayarı tam olarak bu w: istemle uyum ↔ çeşitlilik ve doğallık dengesi.</div>';
    const R2=[['',0],['güney',1]].map(([i,w])=>{const X=uret(EX,i,w);return [i,w,...kapsam(X)];});window.__t2iEx2=R2;
    $('tiEx2').innerHTML='<table class="tk-tbl"><tr><th>istem</th><th>küme başına (doğu → güneydoğu)</th><th>dışarıda</th></tr>'+R2.map(r=>'<tr><td>«'+(r[0]||'boş')+'», w = '+r[1]+'</td><td>'+r[2].join(' · ')+'</td><td>'+r[3]+'</td></tr>').join('')+'</table>'+
      '<div class="callout">💡 <b>Ne öğrendik:</b> Tek bir ağ iki işi birden öğrendi: istem boşken verinin tamamını, «güney» denince yalnız güneyi üretiyor. Bu, eğitimde istemlerin bir kısmını bilerek boş bırakmanın (Ho &amp; Salimans, 2021) sonucu — sınıflandırıcısız yönlendirme bu iki tahmini karşılaştırarak çalışır.</div>';
    const a=Math.PI/8,X3=uret(EX,'',1,400,9,[Math.cos(a),Math.sin(a),1]),[s3,u3]=kapsam(X3),ara=X3.filter(x=>Math.abs(Math.atan2(x[1],x[0])-a)<0.2&&Math.hypot(x[0],x[1])>1.5&&Math.hypot(x[0],x[1])<2.5).length;
    window.__t2iEx3=[s3,u3,ara];
    $('tiEx3').innerHTML='<table class="tk-tbl"><tr><th>küme başına (doğu → güneydoğu)</th><th>dışarıda</th><th>iki kümenin arasında</th></tr><tr><td>'+s3.join(' · ')+'</td><td>'+u3+'</td><td>'+ara+'</td></tr></table>'+
      '<div class="callout">💡 <b>Ne öğrendik:</b> Eğitimde hiç görülmeyen bir istem vektörü verdik (doğu ile kuzeydoğu arası, 22,5°). Model iki kümeden birini seçmedi, ikisini karıştırmadı da: noktaların '+ara+'\'ü iki kümenin <b>arasına</b>, eğitim verisinde hiç nokta olmayan bir bölgeye gitti. Model istem vektörünü sürekli bir "yön" gibi yorumluyor. Gerçek metin kodlayıcıları (CLIP gibi) da kelimeleri sürekli bir uzaya yerleştirir; büyük modellerin hiç görmedikleri kavram birleşimlerini ("astronot kedi") üretebilmesi bu sürekliliğe dayanır. Ama bu minik örnekte "arası" anlamlı mı, yoksa veri dışına bir taşma mı — buna veri karar verir, model değil.</div>';}
  document.querySelectorAll('#model-t2i .sahne-head').forEach(h=>h.addEventListener('click',()=>setTimeout(fillEx,30)));
  window.__t2iFillEx=fillEx;
})();

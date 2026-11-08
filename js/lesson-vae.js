// 🌀 Autoencoder & VAE dersi (#model-vae):
//  25 tane 6×6 "leke" resmi → encoder (36→16 tanh→2) → decoder (2→16 tanh→36 sigmoid). AE: kod doğrudan μ;
//  VAE: z = μ + σ·ε, kayba β·KL eklenir. Tarayıcıda gerçekten eğitilir (Adam lr 0,01, 2000 tur, LCG tohumlu).
//  Motor sayfadaki Python koduyla (vae.py) birebir aynı işlem sırasını kullanır.
(function(){
  const host=document.getElementById('vaSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const f4=v=>v.toFixed(4).replace('.',','),f2=v=>v.toFixed(2).replace('.',',').replace('-','−');
  const KON=[0.5,1.75,3.0,4.25,5.5];
  const leke=(cx,cy,s=0.9)=>{const o=[];for(let r=0;r<6;r++)for(let c=0;c<6;c++)o.push(Math.exp(-((c+0.5-cx)**2+(r+0.5-cy)**2)/(2*s*s)));return o;};
  const X=[];for(const cy of KON)for(const cx of KON)X.push(leke(cx,cy));
  const lcg=t=>{let s=t;return ()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};};
  const gauss=u=>{const a=Math.max(u(),1e-12),b=u();return Math.sqrt(-2*Math.log(a))*Math.cos(2*Math.PI*b);};
  const mat=(r,c,std,u)=>{const m=[];for(let i=0;i<r;i++){const row=[];for(let j=0;j<c;j++)row.push(std*gauss(u));m.push(row);}return m;};
  const z0=(r,c)=>Array.from({length:r},()=>new Array(c).fill(0));
  function model(t=1){const u=lcg(t);return {W1:mat(36,16,.3,u),b1:[new Array(16).fill(0)],Wm:mat(16,2,.3,u),bm:[[0,0]],Wv:mat(16,2,.1,u),bv:[[0,0]],W3:mat(2,16,.5,u),b3:[new Array(16).fill(0)],W4:mat(16,36,.3,u),b4:[new Array(36).fill(0)]};}
  const sig=s=>1/(1+Math.exp(-s)),I=s=>s;
  function kat(x,W,b,f){const o=[];for(let j=0;j<b[0].length;j++){let s=b[0][j];for(let i=0;i<x.length;i++)s+=x[i]*W[i][j];o.push(f(s));}return o;}
  const kodla=(P,x)=>{const h=kat(x,P.W1,P.b1,Math.tanh);return [h,kat(h,P.Wm,P.bm,I),kat(h,P.Wv,P.bv,I)];};
  const coz=(P,z)=>{const h=kat(z,P.W3,P.b3,Math.tanh);return [h,kat(h,P.W4,P.b4,sig)];};
  const hata=(a,b)=>{let s=0;for(let i=0;i<a.length;i++)s+=(a[i]-b[i])**2;return s;};
  function egitici(vae,beta,lr=0.01,t0=1){const P=model(t0),S={},M={};for(const k in P){S[k]=z0(P[k].length,P[k][0].length);M[k]=z0(P[k].length,P[k][0].length);}
    const u=lcg(t0+100),n=X.length;let t=0;
    function adim(){t++;const G={};for(const k in P)G[k]=z0(P[k].length,P[k][0].length);
      for(const x of X){const [h1,mu,lv]=kodla(P,x);let e=null,z;if(vae){e=[gauss(u),gauss(u)];z=[0,1].map(k=>mu[k]+Math.exp(0.5*lv[k])*e[k]);}else z=mu;
        const [h3,y]=coz(P,z),dl=[];for(let j=0;j<36;j++)dl.push(2*(y[j]-x[j])/n*y[j]*(1-y[j]));
        for(let i=0;i<16;i++)for(let j=0;j<36;j++)G.W4[i][j]+=h3[i]*dl[j];for(let j=0;j<36;j++)G.b4[0][j]+=dl[j];
        const d3=[];for(let i=0;i<16;i++){let s=0;for(let j=0;j<36;j++)s+=dl[j]*P.W4[i][j];d3.push(s*(1-h3[i]*h3[i]));}
        const dz=[];for(let k=0;k<2;k++){let s=0;for(let i=0;i<16;i++){G.W3[k][i]+=z[k]*d3[i];s+=d3[i]*P.W3[k][i];}dz.push(s);}
        for(let i=0;i<16;i++)G.b3[0][i]+=d3[i];
        let dmu,dlv;if(vae){dmu=[0,1].map(k=>dz[k]+beta*mu[k]/n);dlv=[0,1].map(k=>dz[k]*e[k]*0.5*Math.exp(0.5*lv[k])+beta*0.5*(Math.exp(lv[k])-1)/n);}else{dmu=dz;dlv=[0,0];}
        const d1=[];for(let i=0;i<16;i++){let s=0;for(let k=0;k<2;k++){G.Wm[i][k]+=h1[i]*dmu[k];G.Wv[i][k]+=h1[i]*dlv[k];s+=dmu[k]*P.Wm[i][k]+dlv[k]*P.Wv[i][k];}d1.push(s*(1-h1[i]*h1[i]));}
        for(let k=0;k<2;k++){G.bm[0][k]+=dmu[k];G.bv[0][k]+=dlv[k];}
        for(let i=0;i<16;i++){G.b1[0][i]+=d1[i];for(let p=0;p<36;p++)G.W1[p][i]+=x[p]*d1[i];}}
      for(const k in P)for(let i=0;i<P[k].length;i++)for(let j=0;j<P[k][0].length;j++){const g=G[k][i][j];
        M[k][i][j]=.9*M[k][i][j]+.1*g;S[k][i][j]=.999*S[k][i][j]+.001*g*g;P[k][i][j]-=lr*(M[k][i][j]/(1-Math.pow(.9,t)))/(Math.sqrt(S[k][i][j]/(1-Math.pow(.999,t)))+1e-8);}}
    return {P,adim(nn){for(let i=0;i<nn;i++)adim();return t;},get t(){return t;}};}
  const IZ=[];for(let i=0;i<25;i++)for(let j=0;j<25;j++)IZ.push(leke(6*j/24,6*i/24));
  // Python: for cy in …: for cx in … → IZ sırası cy dış, cx iç
  IZ.length=0;for(let a=0;a<25;a++)for(let b=0;b<25;b++)IZ.push(leke(6*b/24,6*a/24));
  const enYakin=y=>{let m=Infinity;for(const g of IZ){const h=hata(y,g);if(h<m)m=h;}return m;};
  function gercekci(P,adet=200,t=5){const u=lcg(t);let top=0;for(let i=0;i<adet;i++){const y=coz(P,[gauss(u),gauss(u)])[1];top+=enYakin(y);}return top/adet;}
  function olcum(P){let r=0,k=0;const mus=[];for(const x of X){const [h,mu,lv]=kodla(P,x);r+=hata(coz(P,mu)[1],x);mus.push(mu);for(let q=0;q<2;q++)k+=-0.5*(1+lv[q]-mu[q]**2-Math.exp(lv[q]));}return [r/X.length,k/X.length,mus];}
  window.__vae={X,leke,model,egitici,kodla,coz,hata,gercekci,olcum,enYakin};

  // ---- çizim yardımcıları ----
  const img=(v,sz=96)=>'<div class="va-img" style="width:'+sz+'px;height:'+sz+'px">'+v.map(p=>{const q=Math.sqrt(Math.max(0,Math.min(1,p)));return '<div style="background:rgb('+Math.round(q*235+15)+','+Math.round(q*238+16)+','+Math.round(q*252+3)+')"></div>';}).join('')+'</div>';
  const hue=i=>{const cx=i%5,cy=Math.floor(i/5);return 'hsl('+(cx*60)+','+(55+cy*8)+'%,'+(45+cy*6)+'%)';};
  // ---- simülasyon ----
  let mode='vae3',cur=null,busy=false,curve=[],z=[0,0],rnd=lcg(77),rec=null;
  const CFG={ae:[0,0,'AE (gürültüsüz, KL yok)'],vae1:[1,1,'VAE β = 1'],vae3:[1,0.3,'VAE β = 0,3']};
  function train(){if(busy)return;const [v,b]=CFG[mode],E=egitici(v,b);busy=true;curve=[];
    const tick=()=>{E.adim(100);const [r,k]=olcum(E.P);curve.push([E.t,r]);cur={P:E.P,mode};if(E.t<2000){draw(E.t);setTimeout(tick,0);}else{busy=false;rec=null;draw();}};tick();}
  function draw(prog){host.querySelectorAll('.va-m').forEach(b=>b.classList.toggle('on',b.dataset.m===mode));
    if(!cur){$('vaMap').innerHTML='<i>⏳ model eğitiliyor…</i>';return;}
    const P=cur.P,[r,k,mus]=olcum(P);
    const lo=[0,1].map(i=>Math.min(-3,...mus.map(m=>m[i]))),hi=[0,1].map(i=>Math.max(3,...mus.map(m=>m[i])));
    const W=260,X0=v=>20+(v-lo[0])/(hi[0]-lo[0])*W,Y0=v=>20+W-(v-lo[1])/(hi[1]-lo[1])*W;
    let s='<svg id="vaSvg" viewBox="0 0 300 300" style="width:100%;max-width:320px;cursor:crosshair;display:block"><rect width="300" height="300" fill="#0d1426" rx="8"/>';
    s+='<circle cx="'+X0(0)+'" cy="'+Y0(0)+'" r="'+(X0(2)-X0(0))+'" fill="none" stroke="#f0c040" stroke-dasharray="4 3" opacity=".7"/><text x="'+(X0(0)+4)+'" y="'+(Y0(2)-4)+'" font-size="8.5" fill="#f0c040">N(0,1)\'in 2σ halkası</text>';
    s+='<line x1="'+X0(lo[0])+'" x2="'+X0(hi[0])+'" y1="'+Y0(0)+'" y2="'+Y0(0)+'" stroke="#1f2a46"/><line y1="'+Y0(lo[1])+'" y2="'+Y0(hi[1])+'" x1="'+X0(0)+'" x2="'+X0(0)+'" stroke="#1f2a46"/>';
    mus.forEach((m,i)=>s+='<circle cx="'+X0(m[0])+'" cy="'+Y0(m[1])+'" r="5" fill="'+hue(i)+'" stroke="#000" stroke-width=".5"/>');
    s+='<circle cx="'+X0(z[0])+'" cy="'+Y0(z[1])+'" r="7" fill="none" stroke="#fff" stroke-width="2"/><text x="20" y="294" font-size="9" fill="#95a2c2">z1: '+f2(lo[0])+' … '+f2(hi[0])+'   z2: '+f2(lo[1])+' … '+f2(hi[1])+'</text></svg>';
    $('vaMap').innerHTML=s;
    $('vaSvg').onclick=ev=>{const b=ev.currentTarget.getBoundingClientRect(),sx=(ev.clientX-b.left)/b.width*300,sy=(ev.clientY-b.top)/b.height*300;z=[lo[0]+(sx-20)/W*(hi[0]-lo[0]),lo[1]+(20+W-sy)/W*(hi[1]-lo[1])];draw();};
    const y=coz(P,z)[1],d=enYakin(y);
    $('vaOut').innerHTML=img(y,120)+'<div class="nl-legend">z = ('+f2(z[0])+'; '+f2(z[1])+') · gerçek bir lekeye uzaklık '+f4(d)+'</div>';
    $('vaData').innerHTML=X.map((x,i)=>'<div style="border-color:'+hue(i)+'">'+img(x,30)+'</div>').join('');
    $('vaStat').innerHTML=(busy?'⏳ eğitiliyor… tur '+prog+' / 2000 · ':'')+'geri kurma hatası <b>'+f4(r)+'</b>'+(CFG[cur.mode][0]?' · KL <b>'+f4(k)+'</b>':'')+(rec!==null?' · rastgele 200 örneğin gerçeğe uzaklığı <b>'+f4(rec)+'</b>':'');
    $('vaStep').innerHTML='<b class="h">✏️ Şu an</b>Seçtiğin nokta z = ('+f2(z[0])+'; '+f2(z[1])+') decoder\'a verildi: 2 sayı → 16 nöron (tanh) → 36 piksel (sigmoid). Renkli noktalar 25 eğitim resminin encoder\'dan çıkan kodları (renk = lekenin konumu). '+(CFG[cur.mode][0]?'VAE\'de kayıp = geri kurma hatası + β · KL; KL kodları N(0,1) etrafında toplanmaya zorluyor.':'AE\'de kayıp yalnız geri kurma hatası; kodların nereye yerleşeceğine kimse karışmıyor.');
    let zz='<b class="h">🗣️ Ne anlama geliyor?</b>';
    if(cur.mode==='ae')zz+='Kodlar sarı halkanın çok dışına saçılmış ('+f2(lo[0])+' … '+f2(hi[0])+'). Resimleri çok iyi geri kuruyor ama halkanın içinden rastgele bir nokta seçersen çoğu zaman <b>anlamsız</b> bir resim çıkar: bu bir sıkıştırıcı, üretici değil. 🎲\'a bas.';
    else if(cur.mode==='vae1')zz+='β çok büyük: model KL\'yi sıfırlamanın en kolay yolunu buldu — <b>her resme aynı kodu</b> veriyor (bütün noktalar merkezde üst üste). Decoder hep aynı bulanık ortalama resmi çiziyor. Buna "posterior çöküşü" denir.';
    else zz+='Kodlar halkanın içine düzenli bir ızgara gibi yerleşti: komşu noktalar komşu konumdaki lekeler. Halkanın içinden <b>herhangi bir</b> nokta (🎲) gerçekçi bir leke çiziyor — artık bir <b>üretici</b> model.';
    $('vaSoz').innerHTML=zz;}
  host.querySelectorAll('.va-m').forEach(b=>b.onclick=()=>{mode=b.dataset.m;cur=null;draw();train();});
  $('vaRnd').onclick=()=>{z=[gauss(rnd),gauss(rnd)];draw();};
  $('vaReal').onclick=()=>{if(cur){rec=gercekci(cur.P);draw();}};
  let started=false;const start=()=>{if(!started){started=true;train();}};
  host.closest('.tpl-cl').querySelector('.tpl-head').addEventListener('click',()=>setTimeout(start,50));
  window.__vaeStart=start;draw();

  // ---- Örnek Çalışmalar (açılınca hesaplanır) ----
  let EX=null;
  function fillEx(){if(EX)return;EX={};const rows=[];for(const [ad,v,b] of [['AE',0,0],['VAE β = 1',1,1],['VAE β = 0,3',1,0.3]]){const E=egitici(v,b);E.adim(2000);const [r,k,mus]=olcum(E.P);
      const lo=[0,1].map(i=>Math.min(...mus.map(m=>m[i]))),hi=[0,1].map(i=>Math.max(...mus.map(m=>m[i])));EX[ad]=E.P;rows.push([ad,r,v?k:0,lo,hi,gercekci(E.P)]);}
    window.__vaeEx1=rows;
    $('vaEx1').innerHTML='<table class="tk-tbl"><tr><th>model</th><th>geri kurma hatası</th><th>KL</th><th>kod aralığı (z1; z2)</th><th>rastgele z → gerçeğe uzaklık</th></tr>'+rows.map(r=>'<tr><td>'+r[0]+'</td><td>'+f4(r[1])+'</td><td>'+(r[0]==='AE'?'—':f4(r[2]))+'</td><td>['+f2(r[3][0])+', '+f2(r[4][0])+']; ['+f2(r[3][1])+', '+f2(r[4][1])+']</td><td>'+f4(r[5])+'</td></tr>').join('')+'</table>'+
      '<div class="callout">💡 <b>Ne öğrendik:</b> AE resimleri en iyi geri kuruyor (≈0,013) ama kodları −20 ile +7 arasına saçılmış; N(0,1)\'den seçilen bir kod çoğu zaman hiçbir resme benzemiyor (5,46). β = 1\'de VAE "kopya çekti": bütün kodlar 0\'a çöktü, hiçbir şey öğrenmedi (1,73). β = 0,3 dengeyi buluyor: geri kurma biraz kötü (0,27) ama rastgele kodlar gerçekçi (0,17). <b>Üretici bir model için kodların düzenli bir bölgede toplanması gerekir.</b><br><small>Not: AE satırı tarayıcı ile Python arasında 3. ondalıkta ayrışıyor (0,0133 ↔ 0,0143; 5,46 her ikisinde): 2000 Adam adımında tanh/exp\'in son haneleri farklı birikiyor. VAE satırları ve Örnek 2 dört haneye kadar aynı.</small></div>';
    const P=EX['VAE β = 0,3'],a=X[0],b=X[24],pix=a.map((v,i)=>(v+b[i])/2),za=kodla(P,a)[1],zb=kodla(P,b)[1],gz=coz(P,[(za[0]+zb[0])/2,(za[1]+zb[1])/2])[1];
    window.__vaeEx2=[enYakin(pix),enYakin(gz)];
    let path='';for(let i=0;i<=6;i++){const t=i/6;path+=img(coz(P,[za[0]*(1-t)+zb[0]*t,za[1]*(1-t)+zb[1]*t])[1],46);}
    let pp='';for(let i=0;i<=6;i++){const t=i/6;pp+=img(a.map((v,j)=>v*(1-t)+b[j]*t),46);}
    $('vaEx2').innerHTML='<div class="tk-h">piksel ortalaması (sol üst → sağ alt)</div><div class="va-path">'+pp+'</div><div class="tk-h">gizli uzayda yürüyüş (aynı iki uç)</div><div class="va-path">'+path+'</div>'+
      '<table class="tk-tbl"><tr><th>orta nokta</th><th>gerçek bir lekeye uzaklık</th></tr><tr><td>piksel ortalaması</td><td>'+f4(enYakin(pix))+'</td></tr><tr><td>kodların ortası</td><td>'+f4(enYakin(gz))+'</td></tr></table>'+
      '<div class="callout">💡 <b>Ne öğrendik:</b> İki resmin piksellerini ortalamak iki <b>yarım</b> leke verir — böyle bir resim veride yok. Kodlarının ortasını decoder\'a vermek ise lekeyi <b>ortaya taşır</b>: gizli uzayda yürümek, anlamlı bir değişkende (konum) yürümek demek. Görüntü üretim modellerindeki "iki resim arasında geçiş" ve "gizli uzay" (Diffusion dersindeki latent diffusion) bu fikre dayanır.</div>';}
  document.querySelectorAll('#model-vae .sahne-head').forEach(h=>h.addEventListener('click',()=>setTimeout(fillEx,30)));
  window.__vaeFillEx=fillEx;
})();

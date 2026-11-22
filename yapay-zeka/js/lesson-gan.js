// 🥊 GAN dersi (#model-gan): üretici (G) ile ayırt edici (D) karşı karşıya.
//  2B veri: çember üstünde 8 küme. G: z(2) → 12 tanh → 2; D: x(2) → 12 tanh → 1 (sigmoid). Adam (β1 = 0,5, lr 0,002), yığın 32.
//  Tarayıcıda gerçekten eğitilir; motor sayfadaki Python koduyla (gan.py) aynı işlem sırasını kullanır.
(function(){
  const host=document.getElementById('gaSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const f3=v=>v.toFixed(3).replace('.',','),f4=v=>v.toFixed(4).replace('.',',');
  const lcg=t=>{let s=t;return ()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};};
  const gauss=u=>{const a=Math.max(u(),1e-12),b=u();return Math.sqrt(-2*Math.log(a))*Math.cos(2*Math.PI*b);};
  const MER=[];for(let k=0;k<8;k++)MER.push([2*Math.cos(2*Math.PI*k/8),2*Math.sin(2*Math.PI*k/8)]);
  const gercek=u=>{const k=Math.min(7,Math.floor(u()*8)),[cx,cy]=MER[k];return [cx+0.1*gauss(u),cy+0.1*gauss(u)];};
  const H=12;
  const mat=(r,c,std,u)=>{const m=[];for(let i=0;i<r;i++){const row=[];for(let j=0;j<c;j++)row.push(std*gauss(u));m.push(row);}return m;};
  function ag(t){const u=lcg(t);return [{A:mat(2,H,.8,u),a:[new Array(H).fill(0)],B:mat(H,2,.3,u),b:[[0,0]]},{A:mat(2,H,.8,u),a:[new Array(H).fill(0)],B:mat(H,1,.3,u),b:[[0]]}];}
  function ileri(N,x){const h=[];for(let j=0;j<H;j++){let s=N.a[0][j];for(let i=0;i<2;i++)s+=x[i]*N.A[i][j];h.push(Math.tanh(s));}
    const o=[];for(let k=0;k<N.b[0].length;k++){let s=N.b[0][k];for(let j=0;j<H;j++)s+=h[j]*N.B[j][k];o.push(s);}return [h,o];}
  function geri(N,x,h,d,G){const dh=[];for(let j=0;j<H;j++){let s=0;for(let k=0;k<d.length;k++){G.B[j][k]+=h[j]*d[k];s+=d[k]*N.B[j][k];}dh.push(s*(1-h[j]*h[j]));}
    for(let k=0;k<d.length;k++)G.b[0][k]+=d[k];const dx=[0,0];for(let j=0;j<H;j++){G.a[0][j]+=dh[j];for(let i=0;i<2;i++){G.A[i][j]+=x[i]*dh[j];dx[i]+=dh[j]*N.A[i][j];}}return dx;}
  const sifir=N=>{const o={};for(const k in N)o[k]=N[k].map(r=>new Array(r.length).fill(0));return o;};
  function adam(N,G,M,S,t,lr,b1=0.5){for(const k in N)for(let i=0;i<N[k].length;i++)for(let j=0;j<N[k][0].length;j++){const g=G[k][i][j];M[k][i][j]=b1*M[k][i][j]+(1-b1)*g;S[k][i][j]=.999*S[k][i][j]+.001*g*g;
    N[k][i][j]-=lr*(M[k][i][j]/(1-Math.pow(b1,t)))/(Math.sqrt(S[k][i][j]/(1-Math.pow(.999,t)))+1e-8);}}
  const sig=s=>s>-40?1/(1+Math.exp(-s)):0;
  function egitici(t0,yigin=32,lr=0.002){const [G,D]=ag(t0),u=lcg(t0+50),MG=sifir(G),SG=sifir(G),MD=sifir(D),SD=sifir(D),kay=[];let t=0;
    function adim(){t++;const GD=sifir(D);let LD=0;
      for(let i=0;i<yigin;i++){const x=gercek(u);let [h,o]=ileri(D,x),p=sig(o[0]);LD-=Math.log(Math.max(p,1e-12));geri(D,x,h,[(p-1)/yigin],GD);
        const z=[gauss(u),gauss(u)],f=ileri(G,z)[1];[h,o]=ileri(D,f);p=sig(o[0]);LD-=Math.log(Math.max(1-p,1e-12));geri(D,f,h,[p/yigin],GD);}
      adam(D,GD,MD,SD,t,lr);const GG=sifir(G);let LG=0;
      for(let i=0;i<yigin;i++){const z=[gauss(u),gauss(u)],[hg,f]=ileri(G,z),[h,o]=ileri(D,f),p=sig(o[0]);LG-=Math.log(Math.max(p,1e-12));const df=geri(D,f,h,[(p-1)/yigin],sifir(D));geri(G,z,hg,df,GG);}
      adam(G,GG,MG,SG,t,lr);kay.push([LD/yigin,LG/yigin]);}
    return {G,D,kay,adim(n){for(let i=0;i<n;i++)adim();return t;},get t(){return t;}};}
  function kapsam(G,adet=400,t=9){const u=lcg(t),say=new Array(8).fill(0);let uzak=0;for(let i=0;i<adet;i++){const x=ileri(G,[gauss(u),gauss(u)])[1],d=MER.map(([cx,cy])=>Math.hypot(x[0]-cx,x[1]-cy)),k=d.indexOf(Math.min(...d));if(d[k]<0.5)say[k]++;else uzak++;}return [say,uzak];}
  window.__gan={egitici,kapsam,ileri,MER};

  // ---- simülasyon ----
  const REAL=(()=>{const u=lcg(123),o=[];for(let i=0;i<300;i++)o.push(gercek(u));return o;})();
  let E=null,run=false,seed=1,snapT=0;
  const SZ=300,S=v=>SZ/2+v*SZ/6.4;
  function scene(){const c=$('gaCv'),g=c.getContext('2d');g.clearRect(0,0,SZ,SZ);
    if(E){const n=30;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=-3.2+6.4*(i+0.5)/n,y=3.2-6.4*(j+0.5)/n,p=sig(ileri(E.D,[x,y])[1][0]);g.fillStyle='rgba('+Math.round(70+150*(1-p))+','+Math.round(90+110*p)+','+Math.round(120)+','+(0.15+0.5*Math.abs(p-0.5))+')';g.fillRect(i*SZ/n,j*SZ/n,SZ/n+1,SZ/n+1);}}
    g.fillStyle='rgba(220,230,250,.55)';for(const [x,y] of REAL){g.beginPath();g.arc(S(x),S(-y),1.6,0,7);g.fill();}
    if(E){const u=lcg(9);g.fillStyle='#f0a032';for(let i=0;i<300;i++){const f=ileri(E.G,[gauss(u),gauss(u)])[1];g.beginPath();g.arc(S(f[0]),S(-f[1]),2,0,7);g.fill();}}}
  function curve(){if(!E||E.kay.length<2)return '';const K=E.kay,n=K.length,step=Math.max(1,Math.floor(n/150)),pts=[];for(let i=0;i<n;i+=step){let a=0,b=0,c=0;for(let j=i;j<Math.min(n,i+step);j++){a+=K[j][0];b+=K[j][1];c++;}pts.push([i,a/c,b/c]);}
    const X=i=>30+i/n*260,Y=v=>90-Math.min(3,v)/3*80;
    return '<svg viewBox="0 0 300 100" style="width:100%;max-width:320px"><rect width="300" height="100" fill="#0d1426" rx="6"/><line x1="30" x2="290" y1="'+Y(2*Math.LN2)+'" y2="'+Y(2*Math.LN2)+'" stroke="#5aa0ff" stroke-dasharray="3 3" opacity=".6"/><line x1="30" x2="290" y1="'+Y(Math.LN2)+'" y2="'+Y(Math.LN2)+'" stroke="#f0a032" stroke-dasharray="3 3" opacity=".6"/>'+
      '<polyline fill="none" stroke="#5aa0ff" stroke-width="1.6" points="'+pts.map(p=>X(p[0])+','+Y(p[1])).join(' ')+'"/><polyline fill="none" stroke="#f0a032" stroke-width="1.6" points="'+pts.map(p=>X(p[0])+','+Y(p[2])).join(' ')+'"/><text x="26" y="'+(Y(2*Math.LN2)+3)+'" font-size="8" fill="#5aa0ff" text-anchor="end">2ln2</text><text x="26" y="'+(Y(Math.LN2)+3)+'" font-size="8" fill="#f0a032" text-anchor="end">ln2</text></svg>';}
  function draw(){scene();host.querySelectorAll('.ga-s').forEach(b=>b.classList.toggle('on',+b.dataset.s===seed));
    $('gaRun').textContent=run?'⏸ durdur':'▶ eğit';
    if(!E){$('gaInfo').innerHTML='adım 0';$('gaCurve').innerHTML='';$('gaStep').innerHTML='<b class="h">✏️ Başlangıç</b>▶ ile eğitimi başlat. Gri noktalar gerçek veri (8 küme), turuncu noktalar üreticinin çıktısı, arka plan ayırt edicinin "bu nokta gerçek mi?" haritası.';$('gaSoz').innerHTML='';return;}
    const [say,uzak]=kapsam(E.G),kap=say.filter(x=>x>=10).length,K=E.kay,l=K.slice(-100);let ld=0,lg=0;for(const k of l){ld+=k[0];lg+=k[1];}ld/=l.length;lg/=l.length;
    $('gaInfo').innerHTML='adım <b>'+E.t+'</b> · yakalanan küme <b>'+kap+' / 8</b> · kümelerin dışında <b>'+uzak+' / 400</b>';
    $('gaCurve').innerHTML=curve()+'<div class="nl-legend"><span style="color:#5aa0ff">— D kaybı</span> <span style="color:#f0a032">— G kaybı</span> (100 adım ortalaması: '+f3(ld)+' / '+f3(lg)+')</div>';
    $('gaStep').innerHTML='<b class="h">✏️ Her adımda iki hamle</b>① <b>D</b>, 32 gerçek noktaya "gerçek" (1), 32 sahte noktaya "sahte" (0) demeyi öğrenir. ② <b>G</b>, 32 yeni sahte nokta üretir; D\'nin onlara "gerçek" demesi için ağırlıklarını değiştirir — gradyan D\'nin <b>içinden geçerek</b> G\'ye ulaşır. Arka plan: yeşil = D "gerçek" diyor, kırmızı = "sahte".';
    let z='<b class="h">🗣️ Ne anlama geliyor?</b>';
    if(E.t<300)z+='Başlangıçta G gürültüyü rastgele bir şekle çeviriyor; D onu kolayca ayırıyor.';
    else if(kap<6)z+='G yalnız '+kap+' kümeyi yakalıyor: kalanını <b>bırakmış</b>. D\'yi kandırabildiği birkaç bölgeye yığılmak G için kolay yol — buna <b>mod çöküşü / mod düşürme</b> denir. Başka bir tohum dene.';
    else z+=kap+' küme yakalandı. D kaybı 2·ln2 ≈ 1,386\'ya, G kaybı ln2 ≈ 0,693\'e yaklaşıyorsa D artık gerçekle sahteyi ayıramıyor: her noktaya ~%50 diyor. Bu, oyunun <b>dengesi</b>.';
    if(uzak>150)z+=' Noktaların '+uzak+'\'i kümelerin arasında: G bir kümeden ötekine sürekli bir yolla geçmek zorunda (z sürekli, çıktı sürekli), arada "köprü" noktalar kalıyor.';
    $('gaSoz').innerHTML=z;}
  function tick(){if(!run)return;E.adim(25);draw();if(E.t>=4000){run=false;draw();return;}setTimeout(tick,0);}
  $('gaRun').onclick=()=>{if(!E)E=egitici(seed);run=!run;draw();if(run)tick();};
  $('gaReset').onclick=()=>{run=false;E=null;draw();};
  host.querySelectorAll('.ga-s').forEach(b=>b.onclick=()=>{seed=+b.dataset.s;run=false;E=null;draw();});
  draw();

  // ---- Örnek Çalışmalar (açılınca hesaplanır) ----
  let EX=null;
  function fillEx(){if(EX)return;EX=[];let K1=null;
    for(const t of [1,2,3,4]){const T=egitici(t),row=[t];for(const s of [200,1000,3000]){T.adim(s-T.t);row.push(kapsam(T.G));}if(t===1)K1=T.kay;EX.push(row);}
    window.__ganEx1=EX.map(r=>[r[0],...r.slice(1).map(k=>[k[0].filter(x=>x>=10).length,k[1]])]);
    $('gaEx1').innerHTML='<table class="tk-tbl"><tr><th>tohum</th><th>adım 200</th><th>adım 1000</th><th>adım 3000</th></tr>'+EX.map(r=>'<tr><td>'+r[0]+'</td>'+r.slice(1).map(k=>'<td>'+k[0].filter(x=>x>=10).length+' küme · dışarıda '+k[1]+'</td>').join('')+'</tr>').join('')+'</table>'+
      '<div class="callout">💡 <b>Ne öğrendik:</b> Aynı kod, aynı veri, yalnız başlangıç farklı: tohum 1 sekiz kümenin hepsini yakalarken tohum 2 beşte kalıyor; tohum 2 adım 200\'de 8 kümeye dokunmuşken sonra bıraktı. GAN eğitimi bir <b>oyun</b>, bir kayıbı küçültmek değil: iki ağ birbirini kovalıyor ve sonuç başlangıca, hıza, mimariye çok duyarlı. "Dışarıda" sayısı da büyük: üretilen noktaların bir kısmı kümelerin arasında kalıyor.<br><small>Not: tarayıcıdaki sayılar en alttaki Python kodunun çıktısıyla birebir aynı (3.000 adımda da kontrol edildi). Yine de GAN oyunu küçük farklara çok duyarlıdır: başka bir bilgisayar kütüphanesi ya da donanımla sonuçlar değişebilir.</small></div>';
    let ld=0,lg=0;const l=K1.slice(-500);for(const k of l){ld+=k[0];lg+=k[1];}ld/=500;lg/=500;window.__ganEx2=[ld,lg,K1.slice(0,5)];
    $('gaEx2').innerHTML='<table class="tk-tbl"><tr><th></th><th>son 500 adım ortalaması</th><th>"D hiç ayıramıyor" değeri</th></tr><tr><td>D kaybı</td><td>'+f4(ld)+'</td><td>2·ln 2 = 1,3863</td></tr><tr><td>G kaybı</td><td>'+f4(lg)+'</td><td>ln 2 = 0,6931</td></tr></table>'+
      '<div class="callout">💡 <b>Ne öğrendik:</b> D her noktaya %50 derse kaybı −ln 0,5 − ln 0,5 = 2·ln 2 olur; G\'nin kaybı −ln 0,5 = ln 2. Tohum 1\'in kayıpları tam bu değerlerin yakınında: D artık gerçekle sahteyi ayıramıyor. GAN\'ın kuramsal amacı tam olarak bu denge: G\'nin dağılımı gerçeğinkine eşit olduğunda en iyi D bile yazı tura atar (Goodfellow ve arkadaşları, 2014). Dikkat: kayıpların dengede olması kalitenin iyi olduğunu garanti etmez — Örnek 1\'deki tohum 2 de benzer kayıplarla yalnız 5 küme üretiyor.</div>';}
  document.querySelectorAll('#model-gan .sahne-head').forEach(h=>h.addEventListener('click',()=>setTimeout(fillEx,30)));
  window.__ganFillEx=fillEx;
})();

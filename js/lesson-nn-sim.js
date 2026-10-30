// Neural Network — 5️⃣ Simülasyon (RNN Tek Hücre düzeni): üstte 9 ağırlık, solda tek kontrol çubuğu
// (nokta seç · İleri ▶ / ◀ Geri · 🔧 Eğit) + canlı ağ + karar haritası + 1) İleri yayılım,
// sağda 2) Geri Adım 1–4 (lesson-nn.js doldurur) ve 3) Güncelle (4 noktanın ortalama gradyanı).
(function(){
  const $=id=>document.getElementById(id);
  if(!$('nnSim')||!window.nnNetSvg) return;
  const sig=z=>1/(1+Math.exp(-z));
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const fm=(v,d=3)=>{if(!isFinite(v))return '—';v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const pr=v=>v<0?'('+fm(v,2)+')':fm(v,2);
  const mix=(a,b,t)=>{t=Math.max(0,Math.min(1,t));const h=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));const A=h(a),B=h(b);return '#'+A.map((x,i)=>Math.round(x+(B[i]-x)*t).toString(16).padStart(2,'0')).join('');};
  const P=[[0,0,0],[0,1,1],[1,0,1],[1,1,0]];
  const ids=['nnW11','nnW12','nnB1','nnW21','nnW22','nnB2','nnW31','nnW32','nnB3'];
  const names=['w₁₁','w₁₂','b₁','w₂₁','w₂₂','b₂','w₃₁','w₃₂','b₃'];
  const readW=()=>ids.map(id=>parseFloat($(id).value)||0);
  const fwd=(W,x1,x2)=>{const z1=W[0]*x1+W[1]*x2+W[2],z2=W[3]*x1+W[4]*x2+W[5],h1=sig(z1),h2=sig(z2),zy=W[6]*h1+W[7]*h2+W[8];return {z1,z2,h1,h2,zy,p:sig(zy)};};
  const bce=(p,y)=>-(y?Math.log(p+1e-12):Math.log(1-p+1e-12));
  function grad(W){
    const g=new Array(9).fill(0);let L=0;
    P.forEach(([x1,x2,y])=>{const r=fwd(W,x1,x2);L+=bce(r.p,y)/4;
      const d=r.p-y,d1=d*W[6]*r.h1*(1-r.h1),d2=d*W[7]*r.h2*(1-r.h2);
      g[6]+=d*r.h1/4;g[7]+=d*r.h2/4;g[8]+=d/4;g[0]+=d1*x1/4;g[1]+=d1*x2/4;g[2]+=d1/4;g[3]+=d2*x1/4;g[4]+=d2*x2/4;g[5]+=d2/4;});
    return {g,L};
  }
  const lossOf=W=>P.reduce((s,[a,b,y])=>s+bce(fwd(W,a,b).p,y)/4,0);
  const okOf=W=>P.filter(([a,b,y])=>(fwd(W,a,b).p>0.5)===(y===1)).length;
  // Örnek Çalışmalar / Python ile aynı LCG başlangıçları
  const lcg=seed=>{let s=seed;return ()=>{s=(s*1664525+1013904223)%4294967296;return Math.round((2*s/4294967296-1)*10)/10;};};
  const initSeed=k=>{const u=lcg(k+1),w=[u(),u(),u(),u()],b1=[u(),u()],w2=[u(),u()],b2=u();return [w[0],w[1],b1[0],w[2],w[3],b1[1],w2[0],w2[1],b2];};

  let W=readW(), pt=0, f=0, g=0, ep=0, hist=[], okH=[], timer=null, writing=false, startName='elle çözüm';
  const alpha=()=>{const a=parseFloat($('nnAlpha').value);return isFinite(a)&&a>0?a:1;};

  /* ---- ağ çizimi + adım vurgusu ---- */
  const WD=430,HT=230,px=i=>70+(WD-140)*i/2;
  function drawNet(){
    const [x1,x2]=P[pt],r=fwd(W,x1,x2);
    let s=window.nnNetSvg({layers:[2,2,1],labels:[['x₁','x₂'],['h₁','h₂'],['ŷ']],W:[[[W[0],W[1]],[W[3],W[4]]],[[W[6],W[7]]]],B:[[W[2],W[5]],[W[8]]],act:[[x1,x2],[r.h1,r.h2],[r.p]],titles:['girdi','gizli','çıktı'],showW:true,showB:true,width:WD,height:HT,edgeScale:0.12});
    const box=(x,w,col)=>'<rect x="'+x+'" y="6" width="'+w+'" height="'+(HT-34)+'" rx="12" fill="'+col+'" fill-opacity=".08" stroke="'+col+'" stroke-width="2.2" stroke-dasharray="6 4"/>';
    const col=(l,c)=>box(px(l)-34,68,c), edge=(l,c)=>box(px(l)+22,px(l+1)-px(l)-44,c);
    let hl='';
    if(g>0){const c='#ff8a6a';hl=[col(2,c),edge(1,c),col(1,c),edge(0,c)][g-1];}
    else if(f>0){const c='#ffd24a';hl=[col(0,c),edge(0,c)+col(1,c),edge(1,c)+col(2,c),col(2,c)][f-1];}
    const e=$('nnSimSvg');e.setAttribute('viewBox','0 0 '+WD+' '+HT);e.innerHTML=hl+s;
    heat();
  }
  function heat(){
    const c=$('nnSimHeat'),x=c.getContext('2d'),N=40,S=c.width/N;
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){x.fillStyle=mix('#1c3a6e','#f0a032',fwd(W,(i+0.5)/N,1-(j+0.5)/N).p);x.fillRect(i*S,j*S,S+0.5,S+0.5);}
    P.forEach(([a,b,y],k)=>{const cx=8+a*(c.width-16),cy=8+(1-b)*(c.width-16),ok=(fwd(W,a,b).p>0.5)===(y===1);x.beginPath();x.arc(cx,cy,k===pt?11:9,0,7);x.fillStyle=y?'#f0a032':'#3a7afe';x.fill();x.lineWidth=k===pt?4:3;x.strokeStyle=ok?'#46c46a':'#e06a6a';x.stroke();x.fillStyle='#fff';x.font='bold 10px Segoe UI';x.textAlign='center';x.fillText(y,cx,cy+3.5);});
  }

  /* ---- 1) ileri yayılım: seçili noktanın 4 satırı ---- */
  function drawFwd(){
    const [x1,x2,y]=P[pt],r=fwd(W,x1,x2),L=bce(r.p,y);
    const rows=[
      '<b>girdi</b> x = ('+x1+', '+x2+'), doğru cevap y = '+y,
      '<b>gizli</b> z<sub>h1</sub> = '+pr(W[0])+'·'+x1+' + '+pr(W[1])+'·'+x2+' + '+pr(W[2])+' = <b>'+fm(r.z1,2)+'</b> → h₁ = σ = <b>'+fm(r.h1,4)+'</b><br>'+
      '<span style="visibility:hidden"><b>gizli</b></span> z<sub>h2</sub> = '+pr(W[3])+'·'+x1+' + '+pr(W[4])+'·'+x2+' + '+pr(W[5])+' = <b>'+fm(r.z2,2)+'</b> → h₂ = σ = <b>'+fm(r.h2,4)+'</b>',
      '<b>çıktı</b> z<sub>y</sub> = '+pr(W[6])+'·'+fm(r.h1,3)+' + '+pr(W[7])+'·'+fm(r.h2,3)+' + '+pr(W[8])+' = <b>'+fm(r.zy,2)+'</b> → ŷ = σ = <b>'+fm(r.p,4)+'</b>',
      '<b>kayıp</b> L = −[y·ln ŷ + (1−y)·ln(1−ŷ)] = <b>'+fm(L,4)+'</b> '+((r.p>0.5)===(y===1)?'✓ doğru tahmin':'✗ yanlış tahmin')
    ];
    const h=$('nnFwdPt');h.innerHTML=rows.map((t,i)=>'<div class="nsim-eq'+(g===0&&f===i+1?' hl':'')+'">'+t+'</div>').join('');
  }

  /* ---- 3) güncelle ---- */
  function drawUpd(){
    const {g:G,L}=grad(W),a=alpha(),Wn=W.map((v,i)=>v-a*G[i]),Ln=lossOf(Wn);
    let t='<div style="overflow-x:auto"><table class="nsim-tbl nsim-htbl"><tr><th></th>'+names.map((n,i)=>'<th'+(i===6?' class="sep"':'')+'>'+n+'</th>').join('')+'</tr>'+
      '<tr><td>şimdi</td>'+W.map((v,i)=>'<td'+(i===6?' class="sep"':'')+'>'+fm(v,3)+'</td>').join('')+'</tr>'+
      '<tr><td>∂L/∂w</td>'+G.map((v,i)=>'<td'+(i===6?' class="sep"':'')+'>'+fm(v,4)+'</td>').join('')+'</tr>'+
      '<tr><td>yeni</td>'+Wn.map((v,i)=>'<td'+(i===6?' class="sep"':'')+'><b>'+fm(v,3)+'</b></td>').join('')+'</tr>';
    t+='</table></div><div class="nsim-loss">ortalama kayıp: <b>'+fm(L,4)+'</b> → bir güncellemeden sonra <b>'+fm(Ln,4)+'</b> '+(Ln<L?'<span style="color:#46c46a">↓ azalır</span>':'<span style="color:#e06a6a">↑ artar (α çok büyük olabilir)</span>')+' · doğru: '+okOf(W)+'/4 → '+okOf(Wn)+'/4</div>'+'<div class="nsim-sub">∂L/∂w = 4 noktanın ortalama gradyanı (Geri Adım kartları tek noktanınkini gösterir); yeni = şimdi − α·∂L/∂w. ▶ 1 tur "yeni" satırını kutulara yazar.</div>';
    // ne zaman doğruyu buldu? her doğru-sayısına İLK ulaşılan tur
    const ms=[];if(okH.length){let best=okH[0];okH.forEach((k,i)=>{if(k>best){best=k;ms.push([i,k]);}});}
    let when;
    if(!okH.length) when=okOf(W)===4?'Bu ağırlıklar <b>zaten 4/4</b> çözüyor (✋ elle çözüm). Ağın kendi kendine öğrenmesini görmek için yukarıdan bir <b>🎲 rastgele başlangıç</b> seç, sonra ⏩.':'Henüz eğitim yok: <b>▶ 1 tur</b> ya da <b>⏩</b> ile başlat.';
    else{when='Başlangıçta <b>'+okH[0]+'/4</b> doğru'+ms.map(([i,k])=>' → tur <b>'+i+'</b>\'de <b>'+k+'/4</b>').join('')+'.';
      const f4=ms.find(m=>m[1]===4);
      when+= f4?' ✅ Ağ XOR\'u <b>tur '+f4[0]+'</b>\'de çözdü; sonrası kaybın küçülmesi (emin olma).':okH[0]===4?' (zaten çözülüydü).':(ep>=1500&&okOf(W)<4?' ⚠️ Kayıp düşmeyi bıraktı: bu başlangıç <b>takıldı</b> (yerel tuzak) — 🎲 #0 ya da #3 dene.':' Henüz 4/4 değil, devam et.');}
    t='<div class="nsim-when">📈 <b>Ne zaman doğruyu buldu?</b> '+when+'</div>'+t;
    $('nnUpd').innerHTML=t;
    // kayıp eğrisi
    const hs=hist.length?hist:[L],mx=Math.max(0.75,...hs),X=i=>28+262*i/Math.max(1,hs.length-1),Y=v=>110-100*v/mx;
    let s='<line x1="28" y1="110" x2="292" y2="110" stroke="#44507a"/><line x1="28" y1="10" x2="28" y2="110" stroke="#44507a"/>';
    s+='<line x1="28" y1="'+Y(0.693)+'" x2="292" y2="'+Y(0.693)+'" stroke="#e0a030" stroke-dasharray="4 3"/><text x="290" y="'+(Y(0.693)-3)+'" text-anchor="end" font-size="9" fill="#e0a030">0,693 = "bilmiyorum"</text>';
    if(hs.length>1){let d='',st=Math.ceil(hs.length/300);hs.forEach((v,i)=>{if(i%st&&i!==hs.length-1)return;d+=(d?'L':'M')+X(i).toFixed(1)+','+Y(v).toFixed(1);});s+='<path d="'+d+'" fill="none" stroke="#46c46a" stroke-width="2"/>';}
    else s+='<text x="160" y="70" text-anchor="middle" font-size="10" fill="#95a2c2">▶ 1 tur ya da ⏩ ile eğit</text>';
    if(okH.length>1){const sc=['#e06a6a','#e06a6a','#e06a6a','#e0a030','#46c46a'],n=okH.length,step=Math.max(1,Math.ceil(n/260));
      for(let i=0;i<n;i+=step){const x=X(i),w=Math.max(1.2,262*step/Math.max(1,n-1)+0.4);s+='<rect x="'+x.toFixed(1)+'" y="114" width="'+w.toFixed(1)+'" height="5" fill="'+sc[okH[i]]+'"/>';}
      ms.forEach(([i,k])=>{s+='<line x1="'+X(i).toFixed(1)+'" y1="10" x2="'+X(i).toFixed(1)+'" y2="119" stroke="'+sc[k]+'" stroke-dasharray="2 2"/><text x="'+(X(i)+2).toFixed(1)+'" y="'+(k===4?22:32)+'" font-size="9" fill="'+sc[k]+'">'+k+'/4 (tur '+i+')</text>';});
      s+='<text x="28" y="128" font-size="8" fill="#95a2c2">şerit: doğru sayısı (kırmızı ≤2, turuncu 3, yeşil 4/4)</text>';}
    s+='<text x="24" y="14" text-anchor="end" font-size="9" fill="#95a2c2">'+fm(mx,2)+'</text><text x="24" y="112" text-anchor="end" font-size="9" fill="#95a2c2">0</text><text x="292" y="109" text-anchor="end" font-size="9" fill="#95a2c2">tur '+ep+'</text>';
    $('nnLossSvg').innerHTML=s;
    $('nnTrStat').innerHTML='başlangıç: <b>'+startName+'</b> · tur <b>'+ep+'</b> · kayıp <b>'+fm(L,4)+'</b> · doğru <b>'+okOf(W)+'/4</b>';
  }

  /* ---- adım mesajı + kart vurgusu ---- */
  const FMSG=['','<b>İleri 1/4 — girdi:</b> nokta girdi katmanına girer (x₁, x₂ öğrenilmez, sadece veri).','<b>İleri 2/4 — gizli katman:</b> her gizli nöron girdileri kendi ağırlıklarıyla çarpar, toplar, bias ekler (z) ve σ\'dan geçirir (h).','<b>İleri 3/4 — çıktı:</b> h₁, h₂ çıktı nöronunun girdisi olur; aynı işlem bir kez daha → ŷ.','<b>İleri 4/4 — kayıp:</b> ŷ doğru cevaptan ne kadar uzak? Şimdi ◀ Geri ile hatayı geriye taşı.'];
  const BMSG=['','<b>Geri 1/4:</b> kayıptan çıktı nöronunun z\'sine: ∂L/∂z<sub>y</sub> = ŷ − y (Geri Adım 1).','<b>Geri 2/4:</b> çıktı katmanının ağırlıkları: her biri ∂L/∂z<sub>y</sub> × kendi girdisi (Geri Adım 2).','<b>Geri 3/4:</b> hata gizli katmana iner: w₃ ağırlıkları üzerinden, sonra σ\'nın türeviyle (Geri Adım 3).','<b>Geri 4/4:</b> gizli katmanın ağırlıkları: ∂L/∂z<sub>h</sub> × girdi (Geri Adım 4). 9 gradyan hazır → 3) Güncelle.'];
  function msg(){
    const m=g>0?BMSG[g]:f>0?FMSG[f]:'➡️ <b>İleri ▶</b> ile seçili noktayı ağdan katman katman geçir, sonra <b>◀ Geri</b> ile hatayı geriye taşı. <b>▶ 1 tur</b> dört noktayla ileri+geri+güncellemeyi bir kerede yapar.';
    $('nnStepMsg').innerHTML=m;
    for(let k=1;k<=4;k++){const c=$('nnBp'+k);if(c)c.classList.toggle('active',g===k);}
    if(g>0){const c=$('nnBp'+g);if(c&&c.offsetParent)c.scrollIntoView({behavior:'smooth',block:'nearest'});}
  }
  function all(){drawNet();drawFwd();drawUpd();msg();}

  /* ---- ağırlıkları kutulara yaz (lesson-nn.js tablo/kartlarını da tetikler) ---- */
  function writeW(){writing=true;ids.forEach((id,i)=>{$(id).value=Math.round(W[i]*10000)/10000;});if(window.__nnRender)window.__nnRender();writing=false;}
  ids.forEach(id=>$(id).addEventListener('input',()=>{if(writing)return;W=readW();startName='elle';all();}));
  $('nnAlpha').addEventListener('input',drawUpd);
  $('nnFwdReset').addEventListener('click',()=>setTimeout(()=>{stop();W=readW();ep=0;hist=[];okH=[];startName='elle çözüm';all();},0));
  document.querySelectorAll('.nsim-seed').forEach(b=>b.addEventListener('click',()=>{stop();const k=+b.dataset.k;W=initSeed(k);ep=0;hist=[];okH=[];startName='🎲 #'+k;writeW();all();}));
  document.querySelectorAll('.nnbp-pt').forEach(b=>b.addEventListener('click',()=>{pt=+b.dataset.pt;all();}));
  $('nnStepF').onclick=()=>{g=0;f=Math.min(4,f+1);all();};
  $('nnStepB').onclick=()=>{if(f<4)f=4;g=Math.min(4,g+1);all();};
  $('nnStepR').onclick=()=>{f=0;g=0;all();};
  function train1(){const {g:G,L}=grad(W),a=alpha();if(!hist.length){hist.push(L);okH.push(okOf(W));}for(let i=0;i<9;i++)W[i]-=a*G[i];ep++;hist.push(lossOf(W));okH.push(okOf(W));}
  function stop(){if(timer){cancelAnimationFrame(timer);timer=null;}}
  $('nnTr1').onclick=()=>{stop();train1();writeW();all();};
  let last=0;
  const loop=t=>{for(let i=0;i<10;i++)train1();drawNet();drawUpd();if(t-last>250){last=t;writeW();drawFwd();}if(ep>=4000){stop();writeW();all();return;}timer=requestAnimationFrame(loop);};
  $('nnTrRun').onclick=()=>{if(!timer){if(ep>=4000){ep=0;hist=[];okH=[];}timer=requestAnimationFrame(loop);}};
  $('nnTrStop').onclick=()=>{stop();writeW();all();};
  window.__nnSim={state:()=>({W:W.slice(),ep,L:lossOf(W),ok:okOf(W),f,g,pt}),run:(k,n)=>{stop();W=initSeed(k);ep=0;hist=[];okH=[];startName='🎲 #'+k;for(let i=0;i<n;i++)train1();writeW();all();}};
  all();
})();

// Self-Attention: "W'leri kendisi öğrensin" — W_Q, W_K, W_V rastgele başlar, gradyan inişiyle (Adam) eğitilir.
// Görev: "<hayvan> <dolgu> <dolgu> ?" cümlelerinde (hayvanın yeri değişir) "?"-> hangi hayvan? Python (att_train.py) ile birebir.
(function(){
  const host=document.getElementById('atTrain'); if(!host) return;
  const $=id=>document.getElementById(id);
  const VOC=['kedi','köpek','kuş','hızlıca','sessizce','bugün','yine','?'],NA=3,D=6,LR=0.05,WS=0.4;
  const fm=(v,d=2)=>(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',');
  const SENT=[];for(let a=0;a<3;a++)for(let p=0;p<3;p++)for(let f1=0;f1<4;f1++)for(let f2=0;f2<4;f2++){const fil=[3+f1,3+f2],t=[];let k=0;for(let pos=0;pos<3;pos++){if(pos===p)t.push(a);else t.push(fil[k++]);}t.push(7);SENT.push({t,y:a,p});}
  const TR=SENT.filter((x,i)=>i%5!==0),TE=SENT.filter((x,i)=>i%5===0);
  const lcg=s=>()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};
  const zeros=(n,m)=>Array.from({length:n},()=>new Array(m).fill(0));
  let S;
  function init(seed){const r=lcg(seed),U=(n,m,sc)=>{const a=[];for(let i=0;i<n;i++){const row=[];for(let j=0;j<m;j++)row.push((r()-.5)*2*sc);a.push(row);}return a;};
    S={seed,ep:0,E:U(8,D,1),P:{WQ:U(D,D,WS),WK:U(D,D,WS),WV:U(D,D,WS),WO:U(D,3,WS),bO:[new Array(3).fill(0)]},m:{},v:{},hist:[]};
    for(const k in S.P){S.m[k]=zeros(S.P[k].length,S.P[k][0].length);S.v[k]=zeros(S.P[k].length,S.P[k][0].length);}
    S.hist.push(ev(TR));}
  const vm=(x,M)=>{const o=new Array(M[0].length).fill(0);for(let i=0;i<x.length;i++)for(let j=0;j<o.length;j++)o[j]+=x[i]*M[i][j];return o;};
  function fwd(toks){const P=S.P,X=toks.map(t=>S.E[t]),q=vm(X[3],P.WQ),K=X.map(x=>vm(x,P.WK)),V=X.map(x=>vm(x,P.WV));
    const s=K.map(k=>k.reduce((a,b,i)=>a+b*q[i],0)/Math.sqrt(D)),mx=Math.max(...s),e=s.map(v=>Math.exp(v-mx)),z=e.reduce((a,b)=>a+b,0),a=e.map(v=>v/z);
    const o=new Array(D).fill(0);a.forEach((w,i)=>V[i].forEach((v,j)=>o[j]+=w*v));
    const lg=vm(o,P.WO).map((v,i)=>v+P.bO[0][i]),m2=Math.max(...lg),e2=lg.map(v=>Math.exp(v-m2)),z2=e2.reduce((a,b)=>a+b,0),p=e2.map(v=>v/z2);
    return {X,q,K,V,s,a,o,p};}
  function ev(set){let L=0,ok=0,am=0;set.forEach(x=>{const f=fwd(x.t);L+=-Math.log(f.p[x.y]);ok+=f.p.indexOf(Math.max(...f.p))===x.y?1:0;am+=f.a[x.p];});return [L/set.length,ok/set.length,am/set.length];}
  function step(){const P=S.P,G={};for(const k in P)G[k]=zeros(P[k].length,P[k][0].length);
    TR.forEach(x=>{const f=fwd(x.t),dl=f.p.slice();dl[x.y]-=1;
      for(let i=0;i<D;i++)for(let j=0;j<3;j++)G.WO[i][j]+=f.o[i]*dl[j];for(let j=0;j<3;j++)G.bO[0][j]+=dl[j];
      const dO=P.WO.map(row=>row.reduce((a,b,j)=>a+b*dl[j],0)),da=f.V.map(v=>v.reduce((a,b,j)=>a+b*dO[j],0)),sa=f.a.reduce((a,b,i)=>a+b*da[i],0),ds=f.a.map((w,i)=>w*(da[i]-sa));
      const dq=new Array(D).fill(0);f.K.forEach((k,i)=>k.forEach((v,j)=>dq[j]+=ds[i]*v/Math.sqrt(D)));
      f.X.forEach((xv,i)=>{for(let r=0;r<D;r++)for(let c=0;c<D;c++){G.WV[r][c]+=xv[r]*f.a[i]*dO[c];G.WK[r][c]+=xv[r]*ds[i]*f.q[c]/Math.sqrt(D);}});
      for(let r=0;r<D;r++)for(let c=0;c<D;c++)G.WQ[r][c]+=f.X[3][r]*dq[c];});
    S.ep++;const t=S.ep,n=TR.length;
    for(const k in P)for(let i=0;i<P[k].length;i++)for(let j=0;j<P[k][0].length;j++){const g=G[k][i][j]/n;S.m[k][i][j]=0.9*S.m[k][i][j]+0.1*g;S.v[k][i][j]=0.999*S.v[k][i][j]+0.001*g*g;P[k][i][j]-=LR*(S.m[k][i][j]/(1-Math.pow(0.9,t)))/(Math.sqrt(S.v[k][i][j]/(1-Math.pow(0.999,t)))+1e-8);}
    S.hist.push(ev(TR));}
  host.innerHTML='<div style="font-size:13.5px;color:#ccd5e8;line-height:1.7;margin-bottom:8px">🎯 <b>Görev:</b> cümlede 1 hayvan + 2 dolgu kelime var (hayvanın yeri değişiyor), sonunda <b>?</b>. Ağ "<b>?</b> hangi hayvanı soruyor" diye tahmin etmeli. Cevap, <b>?</b>\'in dikkatini hayvana vermesini gerektirir; ama <b>kimse ağa "hayvana bak" demiyor</b>: W_Q, W_K, W_V (6×6) <b>rastgele</b> başlar, yalnız "yanlış tahmin → hata" sinyaliyle ayarlanır. Kelime vektörleri sabit rastgele (öğrenilmez), '+TR.length+' eğitim, '+TE.length+' sınav cümlesi.</div>'+
   '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px"><label style="font-size:12.5px">başlangıç (tohum) <select id="atT_seed" class="rex-sel"></select></label><button class="rex-btn" id="atT_1">🔧 +1 epoch</button><button class="rex-btn" id="atT_10">+10</button><button class="rex-btn" id="atT_100">+100</button><button class="rex-btn" id="atT_go">▶ eğit</button><button class="rex-btn" id="atT_rst">↺ başa dön</button></div>'+
   '<div id="atT_stat" style="font-size:13px;margin-bottom:8px"></div>'+
   '<div style="font-size:13px;color:#ccd5e8;margin-bottom:4px"><b>Bir sınav cümlesi seç</b> → "?" dikkatini kime veriyor?</div><div style="margin-bottom:6px"><select id="atT_s" class="rex-sel"></select></div><div id="atT_bars"></div>'+
   '<svg id="atT_curve" viewBox="0 0 420 130" style="width:100%;max-width:520px;margin-top:8px"></svg>'+
   '<div id="atT_note" style="font-size:13px;color:#ccd5e8;line-height:1.7;margin-top:6px"></div>';
  const ss=$('atT_seed');[1,2,3,4,5,6].forEach(s=>ss.add(new Option(String(s),s)));
  const sel=$('atT_s');TE.forEach((x,i)=>sel.add(new Option(x.t.map(t=>VOC[t]).join(' '),i)));
  let timer=null;
  function draw(){
    const tr=S.hist[S.ep],te=ev(TE);
    $('atT_stat').innerHTML='epoch <b>'+S.ep+'</b> · eğitim kaybı <b>'+fm(tr[0],4)+'</b> · doğruluk eğitim <b>%'+Math.round(tr[1]*100)+'</b> / sınav <b>%'+Math.round(te[1]*100)+'</b> · "?" dikkatinin hayvana düşen payı (ortalama) <b>%'+Math.round(tr[2]*100)+'</b> <span style="color:var(--muted)">(rastgele ≈ %25)</span>';
    const x=TE[sel.value],f=fwd(x.t),pr=f.p;
    $('atT_bars').innerHTML='<table class="rex-tbl" style="font-size:12.5px"><tr><th>kelime</th><th>"?"-in dikkati</th><th></th></tr>'+x.t.map((t,i)=>'<tr><td><b>'+VOC[t]+'</b>'+(i===x.p?' <span style="color:#ffd54a">(hayvan)</span>':'')+'</td><td>%'+Math.round(f.a[i]*100)+'</td><td style="width:55%"><div style="background:'+(i===x.p?'#ffd54a':'#5aa0e0')+';height:10px;width:'+Math.round(f.a[i]*100)+'%;border-radius:3px"></div></td></tr>').join('')+'</table>'+
      '<div style="font-size:13px;margin-top:4px">Ağın cevabı: '+[0,1,2].map(i=>VOC[i]+' %'+Math.round(pr[i]*100)).join(' · ')+' → <b>'+VOC[pr.indexOf(Math.max(...pr))]+'</b> '+(pr.indexOf(Math.max(...pr))===x.y?'✅':'❌')+' (doğrusu '+VOC[x.y]+')</div>';
    const H=S.hist,n=Math.max(H.length-1,1),px=i=>30+i/n*380,py=v=>110-v*95,mk=(k,c)=>'<polyline fill="none" stroke="'+c+'" stroke-width="2" points="'+H.map((h,i)=>px(i)+','+py(Math.min(h[k],1.2)/ (k===0?1.2:1))).join(' ')+'"/>';
    $('atT_curve').innerHTML='<line x1="30" y1="110" x2="410" y2="110" stroke="#445"/><line x1="30" y1="15" x2="30" y2="110" stroke="#445"/>'+mk(0,'#e06a6a')+mk(2,'#ffd54a')+'<text x="34" y="12" font-size="9" fill="#e06a6a">kayıp</text><text x="70" y="12" font-size="9" fill="#ffd54a">dikkat payı (hayvana)</text><text x="300" y="125" font-size="9" fill="#aeb9d4">epoch (0 → '+S.ep+')</text>';
    $('atT_note').innerHTML=S.ep===0?'Şu an W\'ler <b>rastgele</b>: dikkat 4 kelimeye kabaca eşit dağılıyor, cevap şansa bağlı. ▶ ile eğit ve çubukların hayvana kaydığını izle.':
      (tr[2]>0.9?'Dikkat <b>hayvana kaydı</b>: W_Q ve W_K "?"-in sorusunu hayvan kelimelerinin anahtarıyla eşleşecek hâle getirdi. Bunu <b>biz yazmadık</b>, hata sinyali buldurdu.':
      (tr[2]>0.5?'Dikkat hayvana kısmen kaydı (%'+Math.round(tr[2]*100)+'). Bu tohumda ağ çözümün bir kısmını dikkat dışı yoldan buluyor: doğruluk %100 olsa da dikkat tek kelimeye tam kilitlenmeyebilir. Farklı tohumlar farklı sonuç verir, bu normaldir.':'Eğitim sürüyor; dikkat henüz belirgin kaymadı.'));
  }
  const stop=()=>{if(timer){clearInterval(timer);timer=null;$('atT_go').textContent='▶ eğit';}};
  const adv=n=>{for(let i=0;i<n;i++)step();draw();};
  $('atT_1').onclick=()=>{stop();adv(1);};$('atT_10').onclick=()=>{stop();adv(10);};$('atT_100').onclick=()=>{stop();adv(100);};
  $('atT_go').onclick=()=>{if(timer){stop();return;}$('atT_go').textContent='⏸ durdur';timer=setInterval(()=>{adv(2);if(S.ep>=300)stop();},60);};
  $('atT_rst').onclick=()=>{stop();init(+ss.value);draw();};
  ss.onchange=()=>{stop();init(+ss.value);draw();};sel.onchange=draw;
  window.__attTrain={init,step,ev,get S(){return S;},TR,TE};
  init(1);draw();
})();

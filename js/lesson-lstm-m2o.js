// LSTM — "Örnek 2: Many-to-one, 30 kelimelik cümle". Ağ (Örnek 1 ile aynı başlangıç/lr/veri) kendi kendine eğitilir;
// sonra bir cümle 30 adımda okunur, her adımda tek-hücre şeması canlı sayılarla çizilir, cevap yalnız son h'den alınır.
// Python karşılığı (index.html'deki kod kutusu) ile aynı ağırlıkları/sayıları üretir.
(function(){
  const host=document.getElementById('lstmM2oBody'); if(!host) return;
  const $=id=>document.getElementById(id);
  const sig=z=>1/(1+Math.exp(-z));
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const F=(v,d=2)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d);};
  const T=30,K='fico',LR=0.5,MAXEP=1500;
  const REST='dün akşam bahçede uzun süre güneşin altında yattı sonra yavaşça kalkıp gerindi ve kapıya doğru yürüdü bir süre bekledi kimse gelmeyince geri dönüp sessizce uyudu sabaha kadar hiç kıpırdamadı'.split(' ');
  const SENT=[{w:'kedi',x:1,y:1,say:'miyav'},{w:'köpek',x:-1,y:0,say:'hav'}];
  SENT.forEach(s=>{s.words=[s.w].concat(REST);s.xs=[s.x].concat(new Array(T-1).fill(0));});
  if(SENT[0].words.length!==T) console.warn('m2o: cümle uzunluğu',SENT[0].words.length);
  const init=()=>({f:[.5,.5,1],i:[.5,.5,1],c:[.5,.5,0],o:[.5,.5,1],why:1});
  let P=init(),ep=0,lossNow=null,sel=0,t=1,timer=null,playT=null;

  function fwd(P,xs){
    let h=0,c=0;const rec=[];
    xs.forEach(x=>{
      const zf=P.f[0]*x+P.f[1]*h+P.f[2],zi=P.i[0]*x+P.i[1]*h+P.i[2],zc=P.c[0]*x+P.c[1]*h+P.c[2],zo=P.o[0]*x+P.o[1]*h+P.o[2];
      const f=sig(zf),i=sig(zi),g=Math.tanh(zc),o=sig(zo),cn=f*c+i*g,tc=Math.tanh(cn),hn=o*tc;
      rec.push({x,hp:h,cp:c,f,i,g,o,c:cn,tc,h:hn,zz:{f:zf,i:zi,c:zc,o:zo}});h=hn;c=cn;
    });
    return {rec,p:sig(P.why*h)};
  }
  function grad(P,xs,y){
    const {rec,p}=fwd(P,xs),L=-(y?Math.log(p):Math.log(1-p)),dzy=p-y;
    const G={f:[0,0,0],i:[0,0,0],c:[0,0,0],o:[0,0,0],why:dzy*rec[T-1].h};
    let dh=dzy*P.why,dc=0;
    for(let n=T-1;n>=0;n--){
      const r=rec[n],dcn=dc+dh*r.o*(1-r.tc*r.tc);
      const dz={f:dcn*r.cp*r.f*(1-r.f),i:dcn*r.g*r.i*(1-r.i),c:dcn*r.i*(1-r.g*r.g),o:dh*r.tc*r.o*(1-r.o)};
      let nd=0;for(const k of K){G[k][0]+=dz[k]*r.x;G[k][1]+=dz[k]*r.hp;G[k][2]+=dz[k];nd+=dz[k]*P[k][1];}
      dh=nd;dc=dcn*r.f;
    }
    return {L,G};
  }
  function epoch(){
    const Gs={f:[0,0,0],i:[0,0,0],c:[0,0,0],o:[0,0,0],why:0};let l=0;
    SENT.forEach(s=>{const {L,G}=grad(P,s.xs,s.y);l+=L/2;for(const k of K)for(let j=0;j<3;j++)Gs[k][j]+=G[k][j]/2;Gs.why+=G.why/2;});
    for(const k of K)for(let j=0;j<3;j++)P[k][j]-=LR*Gs[k][j];
    P.why-=LR*Gs.why;lossNow=l;ep++;
  }

  // ---- arayüz ----
  host.innerHTML=
    '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px">'+
      '<b>Cümle:</b><button class="rex-btn" id="m2S0">kedi …</button><button class="rex-btn" id="m2S1">köpek …</button>'+
      '<span style="width:12px"></span><button class="rex-btn" id="m2Go">▶ eğit</button><button class="rex-btn" id="m2Fast">⚡ hemen bitir (1500 epoch)</button><button class="rex-btn" id="m2Rst">↺ başa dön</button>'+
    '</div><div class="rex-stat" id="m2Stat" style="margin-bottom:8px"></div>'+
    '<div style="font-size:12.5px;color:#ccd5e8;margin:4px 0">30 kelime — birine tıkla (ya da kaydırıcı / ▶ ile gez). <span style="color:var(--muted)">Kelime→sayı elle verildi: "kedi"=+1, "köpek"=−1, diğer 29 kelime=0.</span></div>'+
    '<div id="m2Chips" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px"></div>'+
    '<div style="display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin-bottom:6px"><button class="rex-btn" id="m2Prev">◀</button><input type="range" id="m2T" min="1" max="30" step="1" value="1" style="width:260px"><button class="rex-btn" id="m2Next">▶</button><button class="rex-btn" id="m2Play">⏵ otomatik oynat</button><b id="m2Tv" style="color:var(--accent)"></b></div>'+
    '<div class="lv-grid" style="gap:12px">'+
      '<div class="lv-mid" style="overflow-x:auto"><svg id="m2Cell" viewBox="0 0 760 390" role="img" style="min-width:600px;width:100%;max-width:760px;display:block;margin:0 auto"></svg></div>'+
      '<div style="flex:1 1 380px;max-width:520px"><svg id="m2Chart" viewBox="0 0 480 330" role="img" style="width:100%;display:block"></svg></div>'+
    '</div>'+
    '<div class="work" id="m2Work" style="margin-top:8px;white-space:pre-wrap;line-height:1.8"></div>'+
    '<div class="callout" id="m2Note" style="margin-top:8px"></div>';

  function chips(){
    const s=SENT[sel];
    $('m2Chips').innerHTML=s.words.map((w,i)=>'<span data-t="'+(i+1)+'" style="cursor:pointer;padding:2px 6px;border-radius:6px;font-size:12px;border:1px solid '+(i+1===t?'#ffd84a':'var(--line)')+';background:'+(i+1===t?'rgba(255,216,74,.18)':'rgba(255,255,255,.04)')+';color:'+(i===0?'#7ad8e8':'#ccd5e8')+'">'+(i+1)+'·'+w+(i===0?' ('+(s.x>0?'+1':'−1')+')':'')+'</span>').join('');
  }
  function chart(rec){
    const W=480,px=34,iw=W-px-8;let s='';
    const panel=(y0,h,lo,hi,lab,lines)=>{
      const ys=v=>y0+h-h*(v-lo)/(hi-lo),xs=n=>px+iw*(n-1)/(T-1);
      let o='<text x="'+(px)+'" y="'+(y0-4)+'" font-size="10.5" fill="#95a2c2">'+lab+'</text><rect x="'+px+'" y="'+y0+'" width="'+iw+'" height="'+h+'" fill="rgba(255,255,255,.03)" stroke="#2a3558"/>';
      [lo,0,hi].forEach(v=>{if(v<lo||v>hi)return;o+='<text x="'+(px-4)+'" y="'+(ys(v)+4)+'" text-anchor="end" font-size="9.5" fill="#95a2c2">'+v+'</text>'+(v===0?'<line x1="'+px+'" y1="'+ys(0)+'" x2="'+(px+iw)+'" y2="'+ys(0)+'" stroke="#44507a" stroke-dasharray="3 3"/>':'');});
      lines.forEach(([key,col])=>{let d='';rec.forEach((r,n)=>{d+=(d?'L':'M')+xs(n+1)+','+ys(r[key]);});o+='<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="2.2"/>';});
      o+='<line x1="'+xs(t)+'" y1="'+y0+'" x2="'+xs(t)+'" y2="'+(y0+h)+'" stroke="#ffd84a" stroke-width="1.5"/>';
      return o;
    };
    s+=panel(20,130,-5,5,'<tspan fill="#46c46a">c (uzun hafıza)</tspan> · <tspan fill="#e06a6a">h (kısa hafıza)</tspan>',[['c','#46c46a'],['h','#e06a6a']]);
    s+=panel(188,100,0,1,'kapılar: <tspan fill="#f0a032">f</tspan> · <tspan fill="#ffe08a">i</tspan> · <tspan fill="#c77dff">o</tspan> (0–1)',[['f','#f0a032'],['i','#ffe08a'],['o','#c77dff']]);
    s+='<text x="'+px+'" y="312" font-size="10" fill="#95a2c2">t=1</text><text x="'+(px+iw)+'" y="312" text-anchor="end" font-size="10" fill="#95a2c2">t=30 (cevap burada)</text>';
    $('m2Chart').innerHTML=s;
  }
  function render(){
    const s=SENT[sel],{rec,p}=fwd(P,s.xs),q=rec[t-1];
    $('m2S0').style.outline=sel===0?'2px solid #46c46a':'none';$('m2S1').style.outline=sel===1?'2px solid #46c46a':'none';
    $('m2T').value=t;$('m2Tv').textContent='t = '+t+' / 30  ·  kelime: "'+s.words[t-1]+'"  ·  x = '+F(q.x,0);
    chips();
    $('m2Cell').innerHTML=window.lstmCellSvg('m2_',{f:q.f,i:q.i,o:q.o,cp:q.cp,ct:q.g,fc:q.f*q.cp,ic:q.i*q.g,c:q.c,tc:q.tc,h:q.h,Wt:{f:P.f,i:P.i,c:P.c,o:P.o},zz:q.zz,x:q.x,hp:q.hp},[]);
    chart(rec);
    const g=k=>'z='+F(P[k][0])+'·'+F(q.x,0)+' + '+F(P[k][1])+'·'+F(q.hp)+' + '+F(P[k][2])+' = '+F(q.zz[k]);
    $('m2Work').innerHTML=
      '<b>Adım t='+t+'</b> (kelime "'+s.words[t-1]+'", x='+F(q.x,0)+'; önceki: c₋₁='+F(q.cp)+', h₋₁='+F(q.hp)+')\n'+
      'f = σ('+g('f')+') = <b>'+F(q.f,3)+'</b>    i = σ('+g('i')+') = <b>'+F(q.i,3)+'</b>\n'+
      'c̃ = tanh('+g('c')+') = <b>'+F(q.g,3)+'</b>    o = σ('+g('o')+') = <b>'+F(q.o,3)+'</b>\n'+
      'c = f·c₋₁ + i·c̃ = ('+F(q.f,3)+')('+F(q.cp,3)+') + ('+F(q.i,3)+')('+F(q.g,3)+') = <b>'+F(q.c,3)+'</b>\n'+
      'h = o·tanh(c) = ('+F(q.o,3)+')('+F(q.tc,3)+') = <b>'+F(q.h,3)+'</b>'+
      (t===T?'\n\n<b style="color:#ffd84a">🏁 Cevap (yalnız son adımdan):</b> p = σ(w_hy·h₃₀) = σ('+F(P.why,3)+'·'+F(q.h,3)+') = <b>'+F(p,4)+'</b>  →  '+(p>.5?'<b>miyav</b> (kedi)':'<b>hav</b> (köpek)')+'   (doğru: '+s.say+')':'');
    const kr=rec[T-1],pc=p;
    $('m2Stat').innerHTML='epoch <b>'+ep+'</b> / '+MAXEP+'  ·  kayıp <b>'+(lossNow===null?'—':F(lossNow,3))+'</b>  ·  "'+s.w+'" cümlesinin cevabı: p = <b>'+F(pc,3)+'</b> → '+(pc>.5?'miyav':'hav')+' '+((pc>.5)===(s.y===1)?'✅':'❌')+'  ·  son h₃₀ = '+F(kr.h,3);
    $('m2Note').innerHTML=ep===0?'🧠 <b>Henüz eğitilmedi:</b> ağırlıklar rastgele-benzeri başlangıçta; p ≈ 0,5–0,6 civarı, cevap güvenilmez. <b>▶ eğit</b> ile ağın kendini düzeltmesini izle, sonra t kaydırıcısıyla 30 adımı gez.':
      '🧠 <b>Ne oluyor?</b> Sadece <b>t=1</b>\'de x≠0 (kedi/köpek). t=2…30\'da kelime sayısı 0 ama hücre çalışmaya devam ediyor: <b>c</b> ve <b>h</b> önceki adımdan taşınıyor. Grafiğe bak: c\'nin işareti (kedi → +, köpek → −) 30 adım boyunca korunuyor, f ≈ '+F(rec[10].f,2)+' (eski hafızanın %'+Math.round(rec[10].f*100)+'\'i her adımda kalıyor). Cevap yalnız <b>son adımdaki h</b>\'den çıkıyor: h₃₀ pozitifse miyav, negatifse hav.<br><span style="color:var(--muted)">Dürüst not: bu minik tek-hücreli ağ hafızayı "kapıyı kapat" şeklinde değil, h₋₁ üzerinden kendini besleyerek (c̃ = tanh(…+U·h₋₁), U='+F(P.c[1])+') taşıyor; bu yüzden x=0 olan kelimelerde de c küçük bir miktar daha büyüyor. Gerçek ağlarda çok sayıda hücre ve vektör gömmeleri var; mekanizma aynı.</span>';
  }
  const stop=()=>{if(timer){cancelAnimationFrame(timer);timer=null;}};
  function loop(){if(ep>=MAXEP){stop();render();return;}for(let i=0;i<25&&ep<MAXEP;i++)epoch();render();timer=requestAnimationFrame(loop);}
  const stopPlay=()=>{if(playT){clearInterval(playT);playT=null;$('m2Play').textContent='⏵ otomatik oynat';}};
  $('m2S0').onclick=()=>{sel=0;render();};$('m2S1').onclick=()=>{sel=1;render();};
  $('m2Go').onclick=()=>{if(!timer&&ep<MAXEP)timer=requestAnimationFrame(loop);};
  $('m2Fast').onclick=()=>{stop();while(ep<MAXEP)epoch();render();};
  $('m2Rst').onclick=()=>{stop();P=init();ep=0;lossNow=null;render();};
  $('m2T').addEventListener('input',e=>{stopPlay();t=+e.target.value;render();});
  $('m2Prev').onclick=()=>{stopPlay();t=Math.max(1,t-1);render();};
  $('m2Next').onclick=()=>{stopPlay();t=Math.min(T,t+1);render();};
  $('m2Chips').addEventListener('click',e=>{const c=e.target.closest('[data-t]');if(c){stopPlay();t=+c.dataset.t;render();}});
  $('m2Play').onclick=()=>{if(playT){stopPlay();return;}if(t>=T)t=1;$('m2Play').textContent='⏸ durdur';playT=setInterval(()=>{if(t>=T){stopPlay();return;}t++;render();},350);};
  window.__lstmM2o={get P(){return P;},get ep(){return ep;},run:()=>{while(ep<MAXEP)epoch();render();},fwd:(i)=>fwd(P,SENT[i].xs)};
  render();
})();

// Lineer Regresyon — "7️⃣ Örnek Çalışmalar": kendi kendine öğrenen doğru.
//  1) Ev fiyatı: Θ₀=Θ₁=0'dan gradyan inişiyle doğrunun kendisi oturur (+ Gauss'un kapalı form çözümü karşılaştırması)
//  2) Öğrenme hızı α: dört farklı α aynı veride yan yana (yavaş / iyi / sınırda / patlayan)
//  3) Gauss'un yolu: aynı doğruyu iterasyonsuz, tek formülle bulmak
// Python kod kutularıyla (index.html) aynı sayıları üretir.
(function(){
  const h1=document.getElementById('lrEx1'); if(!h1) return;
  const $=id=>document.getElementById(id);
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const fm=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const D=[[1,1.9],[2,2.6],[3,3.1],[4,4.4],[5,4.9],[6,5.8],[7,6.2],[8,7.5]], m=D.length;
  const cost=(a,b)=>D.reduce((s,[x,y])=>s+Math.pow(a+b*x-y,2),0)/(2*m);
  const grad=(a,b)=>[D.reduce((s,[x,y])=>s+(a+b*x-y),0)/m, D.reduce((s,[x,y])=>s+(a+b*x-y)*x,0)/m];
  function train(alpha,n){let a=0,b=0;const hist=[];for(let i=0;i<n;i++){hist.push(cost(a,b));const [d0,d1]=grad(a,b);a-=alpha*d0;b-=alpha*d1;}return {a,b,hist};}
  // kapalı form
  const xo=D.reduce((s,p)=>s+p[0],0)/m, yo=D.reduce((s,p)=>s+p[1],0)/m;
  const sxy=D.reduce((s,[x,y])=>s+(x-xo)*(y-yo),0), sxx=D.reduce((s,[x])=>s+(x-xo)*(x-xo),0);
  const K1=sxy/sxx, K0=yo-K1*xo, EMIN=cost(K0,K1);
  const NS='http://www.w3.org/2000/svg';

  /* ===== Örnek 1 ===== */
  const ALPHA=0.05, MAXEP=600;
  let a=0,b=0,ep=0,hist=[],timer=null;
  h1.innerHTML='<div class="rex-grid"><div class="rex-ctl">'+
    '<table class="rex-tbl"><tr><th>ev büyüklüğü x (×10 m²)</th>'+D.map(p=>'<td>'+p[0]+'</td>').join('')+'</tr><tr><th>fiyat y (×100 bin ₺)</th>'+D.map(p=>'<td>'+fm(p[1],1)+'</td>').join('')+'</tr></table>'+
    '<div style="display:flex; flex-wrap:wrap; gap:8px; margin:10px 0"><button class="rex-btn" id="lr1go">▶ eğit</button><button class="rex-btn" id="lr1pause">⏸</button><button class="rex-btn" id="lr1step">🔧 +10 tur</button><button class="rex-btn" id="lr1reset">↺ başa dön</button></div>'+
    '<div class="rex-stat" id="lr1stat"></div></div>'+
    '<div><svg id="lr1fit" viewBox="0 0 300 220" style="width:100%;max-width:380px"></svg><svg id="lr1loss" viewBox="0 0 300 120" style="width:100%;max-width:380px"></svg></div></div>';
  function draw1(){
    const X=v=>30+(300-40)*v/9, Y=v=>200-(200-14)*v/8;
    let s='<line x1="30" y1="200" x2="292" y2="200" stroke="#44507a"/><line x1="30" y1="14" x2="30" y2="200" stroke="#44507a"/>';
    s+='<line x1="'+X(0)+'" y1="'+Y(K0)+'" x2="'+X(9)+'" y2="'+Y(K0+K1*9)+'" stroke="#e0a030" stroke-width="1.5" stroke-dasharray="5 4"/>';
    s+='<line x1="'+X(0)+'" y1="'+Y(a)+'" x2="'+X(9)+'" y2="'+Y(a+b*9)+'" stroke="#46c46a" stroke-width="2.5"/>';
    D.forEach(([x,y])=>{s+='<line x1="'+X(x)+'" y1="'+Y(y)+'" x2="'+X(x)+'" y2="'+Y(a+b*x)+'" stroke="#e06a6a" stroke-opacity=".6"/><circle cx="'+X(x)+'" cy="'+Y(y)+'" r="4" fill="#3a7afe"/>';});
    s+='<text x="34" y="26" font-size="10" fill="#46c46a">— canlı doğru</text><text x="120" y="26" font-size="10" fill="#e0a030">- - kapalı form (Gauss)</text><text x="292" y="214" text-anchor="end" font-size="10" fill="#95a2c2">x</text>';
    $('lr1fit').innerHTML=s;
    const LX=i=>30+(300-40)*i/MAXEP, LY=v=>104-90*Math.min(1,Math.max(0,Math.log10(Math.max(v,1e-3))+3)/4.1);
    let l='<line x1="30" y1="104" x2="292" y2="104" stroke="#44507a"/><text x="30" y="118" font-size="10" fill="#95a2c2">0</text><text x="292" y="118" text-anchor="end" font-size="10" fill="#95a2c2">'+MAXEP+' tur</text><text x="4" y="14" font-size="10" fill="#95a2c2">maliyet E (log)</text>';
    if(hist.length>1){let d='';hist.forEach((v,i)=>{d+=(d?'L':'M')+LX(i)+','+LY(v);});l+='<path d="'+d+'" fill="none" stroke="#46c46a" stroke-width="2"/>';}
    l+='<line x1="30" y1="'+LY(EMIN)+'" x2="292" y2="'+LY(EMIN)+'" stroke="#e0a030" stroke-dasharray="4 3"/>';
    $('lr1loss').innerHTML=l;
    const E=cost(a,b);
    $('lr1stat').innerHTML='<div>tur: <b>'+ep+'</b> / '+MAXEP+' (α = '+fm(ALPHA,2)+')</div><div style="color:#46c46a">gradyan inişi: Θ₀ = <b>'+fm(a,4)+'</b>, Θ₁ = <b>'+fm(b,4)+'</b>, E = <b>'+fm(E,4)+'</b></div><div style="color:#e0a030">kapalı form: Θ₀ = <b>'+fm(K0,4)+'</b>, Θ₁ = <b>'+fm(K1,4)+'</b>, E = <b>'+fm(EMIN,4)+'</b></div>';
    window.__lr1={ep,a,b,hist:hist.slice(),K0,K1,EMIN};
  }
  function tick1(){const [d0,d1]=grad(a,b);hist.push(cost(a,b));a-=ALPHA*d0;b-=ALPHA*d1;ep++;}
  const stop=()=>{if(timer){cancelAnimationFrame(timer);timer=null;}};
  function loop(){if(ep>=MAXEP){stop();draw1();return;}for(let i=0;i<4&&ep<MAXEP;i++)tick1();draw1();timer=requestAnimationFrame(loop);}
  $('lr1go').onclick=()=>{if(!timer&&ep<MAXEP)timer=requestAnimationFrame(loop);};
  $('lr1pause').onclick=stop;
  $('lr1step').onclick=()=>{stop();for(let i=0;i<10&&ep<MAXEP;i++)tick1();draw1();};
  $('lr1reset').onclick=()=>{stop();a=b=0;ep=0;hist=[];draw1();};
  window.__lr1Step=n=>{for(let i=0;i<n&&ep<MAXEP;i++)tick1();draw1();};
  draw1();

  /* ===== Örnek 2 ===== */
  const h2=$('lrEx2');
  if(h2){
    const AL=[{a:0.001,c:'#95a2c2',n:'çok küçük'},{a:0.02,c:'#46c46a',n:'iyi'},{a:0.07,c:'#f0a032',n:'sınırda (zikzak)'},{a:0.08,c:'#e06a6a',n:'çok büyük'}];
    const N=300, runs=AL.map(o=>train(o.a,N));
    h2.innerHTML='<div style="font-size:13px;color:#ccd5e8;margin-bottom:6px">Kaç tur çalışsın? <input type="range" id="lr2n" min="1" max="'+N+'" value="'+N+'" style="width:220px"> <b id="lr2nv">'+N+'</b></div><div class="rex-grid"><div><svg id="lr2s" viewBox="0 0 320 200" style="width:100%;max-width:420px"></svg></div><div id="lr2t"></div></div>';
    const upd=()=>{
      const n=+$('lr2n').value;$('lr2nv').textContent=n;
      const X=i=>34+(320-44)*i/N, Y=v=>180-160*Math.min(1,Math.max(0,(Math.log10(Math.max(v,1e-2))+2)/4.5));
      let s='<line x1="34" y1="180" x2="312" y2="180" stroke="#44507a"/>';
      [-2,0,2].forEach(e=>{const y=Y(Math.pow(10,e));s+='<line x1="34" y1="'+y+'" x2="312" y2="'+y+'" stroke="#2a3558" stroke-dasharray="3 3"/><text x="30" y="'+(y+3)+'" text-anchor="end" font-size="9" fill="#95a2c2">10<tspan font-size="7" dy="-3">'+(''+e).replace('-','−')+'</tspan></text>';});
      runs.forEach((r,j)=>{let d='';for(let i=0;i<n;i++){const v=r.hist[i];if(!isFinite(v)||v>1e6){d+=(d?'L':'M')+X(i)+',14';break;}d+=(d?'L':'M')+X(i)+','+Y(v);}s+='<path d="'+d+'" fill="none" stroke="'+AL[j].c+'" stroke-width="2"/>';});
      $('lr2s').innerHTML=s+'<text x="34" y="196" font-size="9" fill="#95a2c2">tur 0</text><text x="312" y="196" text-anchor="end" font-size="9" fill="#95a2c2">'+N+'</text>';
      let t='<table class="rex-tbl"><tr><th>α</th><th>yorum</th><th>E ('+n+'. tur)</th></tr>';
      AL.forEach((o,j)=>{const v=runs[j].hist[n-1];t+='<tr><td><b style="color:'+o.c+'">'+o.a+'</b></td><td>'+o.n+'</td><td>'+(v>1e6?'<b style="color:#e06a6a">patladı</b>':'<b>'+fm(v,4)+'</b>')+'</td></tr>';});
      $('lr2t').innerHTML=t+'</table><div class="callout" style="margin-top:8px">α=0,001 doğru yöne gidiyor ama çok yavaş. α=0,07 neredeyse patlama sınırında: ilk turlarda maliyet <i>yükseliyor</i> (zikzak), sonra oturuyor. α=0,08\'de her adım hedefi aşıp daha uzağa düşüyor: maliyet büyüyerek <b>patlıyor</b>. Bu yüzden α\'yı "mümkün olan en büyük" değil, <b>güvenli ve yeterince hızlı</b> seçeriz.</div>';
      window.__lr2={vals:AL.map((o,j)=>runs[j].hist[n-1]),n};
    };
    $('lr2n').addEventListener('input',upd);upd();
  }

  /* ===== Örnek 3 ===== */
  const h3=$('lrEx3');
  if(h3){
    const rows=D.map(([x,y])=>'<tr><td>'+x+'</td><td>'+fm(y,1)+'</td><td>'+fm(x-xo,3)+'</td><td>'+fm(y-yo,3)+'</td><td>'+fm((x-xo)*(y-yo),3)+'</td><td>'+fm((x-xo)*(x-xo),3)+'</td></tr>').join('');
    h3.innerHTML='<div style="overflow-x:auto"><table class="rex-tbl"><tr><th>x</th><th>y</th><th>x − x̄</th><th>y − ȳ</th><th>(x−x̄)(y−ȳ)</th><th>(x−x̄)²</th></tr>'+rows+
      '<tr><td colspan="4"><b>toplam</b></td><td><b>'+fm(sxy,3)+'</b></td><td><b>'+fm(sxx,3)+'</b></td></tr></table></div>'+
      '<div class="work" style="margin-top:8px; line-height:1.9">x̄ = <b>'+fm(xo,3)+'</b>, ȳ = <b>'+fm(yo,3)+'</b><br>Θ₁ = Σ(x−x̄)(y−ȳ) ÷ Σ(x−x̄)² = '+fm(sxy,3)+' ÷ '+fm(sxx,3)+' = <b>'+fm(K1,4)+'</b><br>Θ₀ = ȳ − Θ₁·x̄ = '+fm(yo,3)+' − '+fm(K1,4)+'·'+fm(xo,3)+' = <b>'+fm(K0,4)+'</b><br>E = <b>'+fm(EMIN,4)+'</b> (bu veride ulaşılabilecek en küçük maliyet)</div>'+
      '<div class="callout" id="lr3cmp" style="margin-top:8px"></div>';
    const upd=()=>{const s=window.__lr1;$('lr3cmp').innerHTML='🔎 Örnek 1\'deki gradyan inişi şu an <b>'+fm(s.ep,0)+'. turda</b>: Θ₀ = <b>'+fm(s.a,4)+'</b> (kapalı form '+fm(K0,4)+'), Θ₁ = <b>'+fm(s.b,4)+'</b> ('+fm(K1,4)+'). İki yol aynı yere varıyor; gradyan inişi tur tur yürürken Gauss formülü tek hamlede zıplıyor. <b>Neden hâlâ gradyan inişi?</b> Çünkü bu formül sadece düz çizgi için var; yapay sinir ağlarında kapalı form yok — elimizdeki tek yol yürümek.';};
    ['lr1go','lr1pause','lr1step','lr1reset'].forEach(id=>$(id).addEventListener('click',()=>setTimeout(upd,50)));
    setInterval(()=>{if(timer)upd();},400);upd();
  }
})();

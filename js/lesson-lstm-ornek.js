// LSTM — "7️⃣ Örnek Çalışmalar": 30 adımlık uzak-bağlam görevi ("kedi/köpek" + 29 boş adım → ilk kelimeyi hatırla).
// Aynı veri, aynı öğrenme hızı; bir skaler RNN ve bir skaler LSTM, bilerek seçilmiş başlangıçlardan gradyan inişiyle öğrenir.
// Python karşılığı (index.html'deki kod kutusu) ile epoch bazında birebir aynı sayıları üretir.
(function(){
  const host=document.getElementById('lstmEx1'); if(!host) return;
  const $=id=>document.getElementById(id);
  const sig=z=>1/(1+Math.exp(-z));
  const fm=(v,d=3)=>(v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');
  const T=30, LR=0.5, MAXEP=1500, K='fico';
  const DATA=[{w:'kedi',x:1,y:1},{w:'köpek',x:-1,y:0}];
  const seq=d=>[d.x].concat(new Array(T-1).fill(0));

  // ---- RNN ----
  function rnnBack(w,xs,y){
    const h=[0];xs.forEach(x=>h.push(Math.tanh(w[0]*x+w[1]*h[h.length-1])));
    const p=sig(w[2]*h[T]),L=-(y?Math.log(p):Math.log(1-p)),dzy=p-y;
    const g=[0,0,dzy*h[T]];let dh=dzy*w[2];
    for(let t=T;t>=1;t--){const d=dh*(1-h[t]*h[t]);g[0]+=d*xs[t-1];g[1]+=d*h[t-1];dh=d*w[1];}
    return {L,g,p};
  }
  // ---- LSTM ----
  function lstmBack(P,xs,y){
    let h=0,c=0;const rec=[];
    xs.forEach(x=>{
      const f=sig(P.f[0]*x+P.f[1]*h+P.f[2]),i=sig(P.i[0]*x+P.i[1]*h+P.i[2]),g=Math.tanh(P.c[0]*x+P.c[1]*h+P.c[2]),o=sig(P.o[0]*x+P.o[1]*h+P.o[2]);
      const cn=f*c+i*g,tc=Math.tanh(cn);rec.push([x,h,c,f,i,g,o,tc]);h=o*tc;c=cn;
    });
    const p=sig(P.why*h),L=-(y?Math.log(p):Math.log(1-p)),dzy=p-y;
    const G={f:[0,0,0],i:[0,0,0],c:[0,0,0],o:[0,0,0],why:dzy*h};
    let dh=dzy*P.why,dc=0;
    for(let n=T-1;n>=0;n--){
      const [x,hp,cp,f,i,g,o,tc]=rec[n];
      const dcn=dc+dh*o*(1-tc*tc);
      const dz={f:dcn*cp*f*(1-f),i:dcn*g*i*(1-i),c:dcn*i*(1-g*g),o:dh*tc*o*(1-o)};
      let ndh=0;
      for(const k of K){G[k][0]+=dz[k]*x;G[k][1]+=dz[k]*hp;G[k][2]+=dz[k];ndh+=dz[k]*P[k][1];}
      dh=ndh;dc=dcn*f;
    }
    return {L,G,p,fs:rec.map(r=>r[3])};
  }
  // ---- gradyan sağlığı: t adımındaki sinyalin son adıma oranı ----
  function healthRnn(w,xs){
    const h=[0];xs.forEach(x=>h.push(Math.tanh(w[0]*x+w[1]*h[h.length-1])));
    const r=new Array(T+1).fill(1);                       // r[t] = |δ_t/δ_T|
    for(let t=T-1;t>=1;t--) r[t]=r[t+1]*Math.abs(w[1])*(1-h[t]*h[t]);
    return r;
  }
  function healthLstm(P,xs){
    const {fs}=lstmBack(P,xs,1);                           // fs[n]: n=0..T-1 (t=n+1)
    const r=new Array(T+1).fill(1);                       // r[t] = ∂c_T/∂c_t = Π_{s>t} f_s
    for(let t=T-1;t>=1;t--) r[t]=r[t+1]*fs[t];            // f_{t+1} = fs[t]
    return r;
  }

  const initR=()=>[0.5,0.5,1.0];
  const initL=()=>({f:[.5,.5,1],i:[.5,.5,1],c:[.5,.5,0],o:[.5,.5,1],why:1});
  let R=initR(),P=initL(),ep=0,LR_=[],LL_=[],timer=null;

  function epoch(){
    let kr=0,kl=0;const gr=[0,0,0],gl={f:[0,0,0],i:[0,0,0],c:[0,0,0],o:[0,0,0],why:0};
    DATA.forEach(d=>{
      const xs=seq(d),a=rnnBack(R,xs,d.y),b=lstmBack(P,xs,d.y);
      kr+=a.L/2;kl+=b.L/2;
      for(let j=0;j<3;j++)gr[j]+=a.g[j]/2;
      for(const k of K)for(let j=0;j<3;j++)gl[k][j]+=b.G[k][j]/2;
      gl.why+=b.G.why/2;
    });
    LR_.push(kr);LL_.push(kl);
    for(let j=0;j<3;j++)R[j]-=LR*gr[j];
    for(const k of K)for(let j=0;j<3;j++)P[k][j]-=LR*gl[k][j];
    P.why-=LR*gl.why;ep++;
  }

  // ---- arayüz ----
  host.innerHTML=
   '<div class="rex-grid">'+
   '<div class="rex-ctl">'+
     '<table class="rex-tbl"><tr><th>cümle</th><th>girdi (t=1…30)</th><th>doğru cevap</th></tr>'+
     DATA.map(d=>'<tr><td><b>'+d.w+'</b> … (29 boş adım)</td><td>x₁ = '+(d.x>0?'+1':'−1')+', x₂…x₃₀ = 0</td><td>'+d.y+'</td></tr>').join('')+'</table>'+
     '<div style="display:flex; flex-wrap:wrap; gap:8px; margin:10px 0">'+
       '<button class="rex-btn" id="lxGo">▶ eğit</button><button class="rex-btn" id="lxPause">⏸</button><button class="rex-btn" id="lxStep">🔧 +10 epoch</button><button class="rex-btn" id="lxReset">↺ başa dön</button></div>'+
     '<div class="rex-stat" id="lxStat"></div>'+
   '</div>'+
   '<div><div style="font-size:12.5px; color:#ccd5e8; margin-bottom:4px"><b>Kayıp eğrisi</b> — <span style="color:#e06a6a">RNN</span> · <span style="color:#46c46a">LSTM</span> (0,693 = "yazı-tura", hiç öğrenmedi)</div><svg id="lxLoss" viewBox="0 0 460 150" style="width:100%; max-width:560px"></svg>'+
   '<div style="font-size:12.5px; color:#ccd5e8; margin:8px 0 4px"><b>Gradyan sağlığı</b> — son adımdaki hata sinyali, geriye giderken her adımda kaç katına iniyor? (logaritmik; yüksek = sinyal t adımına ulaşıyor)</div><svg id="lxHealth" viewBox="0 0 460 150" style="width:100%; max-width:560px"></svg></div>'+
   '</div>';

  const NS='http://www.w3.org/2000/svg';
  function lossSvg(){
    const W=460,H=150,px=40,py=10,iw=W-px-8,ih=H-py-26;
    let s='<line x1="'+px+'" y1="'+(py+ih)+'" x2="'+(px+iw)+'" y2="'+(py+ih)+'" stroke="#44507a"/>';
    [0,0.35,0.7].forEach(v=>{const y=py+ih-ih*v/0.72;s+='<line x1="'+px+'" y1="'+y+'" x2="'+(px+iw)+'" y2="'+y+'" stroke="#2a3558" stroke-dasharray="3 3"/><text x="'+(px-4)+'" y="'+(y+4)+'" text-anchor="end" font-size="10" fill="#95a2c2">'+v.toFixed(2).replace('.',',')+'</text>';});
    const line=(a,col)=>{if(a.length<2)return'';const n=Math.max(a.length,50);let d='';a.forEach((v,i)=>{if(a.length>400&&i%Math.ceil(a.length/400)&&i!==a.length-1)return;d+=(d?'L':'M')+(px+iw*i/(MAXEP))+','+(py+ih-ih*Math.min(0.72,v)/0.72);});return '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="2"/>';};
    s+=line(LR_,'#e06a6a')+line(LL_,'#46c46a');
    s+='<text x="'+px+'" y="'+(H-8)+'" font-size="10" fill="#95a2c2">0</text><text x="'+(px+iw)+'" y="'+(H-8)+'" text-anchor="end" font-size="10" fill="#95a2c2">'+MAXEP+' epoch</text>';
    $('lxLoss').innerHTML=s;
  }
  function healthSvg(){
    const xs=seq(DATA[0]),hr=healthRnn(R,xs),hl=healthLstm(P,xs);
    const W=460,H=150,px=40,py=10,iw=W-px-8,ih=H-py-26,LO=-12;
    const ly=v=>py+ih-ih*(Math.max(LO,Math.log10(Math.max(v,1e-300)))-LO)/(-LO);
    let s='<line x1="'+px+'" y1="'+(py+ih)+'" x2="'+(px+iw)+'" y2="'+(py+ih)+'" stroke="#44507a"/>';
    [0,-4,-8,-12].forEach(e=>{const y=ly(Math.pow(10,e));s+='<line x1="'+px+'" y1="'+y+'" x2="'+(px+iw)+'" y2="'+y+'" stroke="#2a3558" stroke-dasharray="3 3"/><text x="'+(px-4)+'" y="'+(y+4)+'" text-anchor="end" font-size="10" fill="#95a2c2">10'+(e?'<tspan font-size="7" dy="-4">'+(''+e).replace('-','−')+'</tspan>':'⁰')+'</text>';});
    const line=(r,col)=>{let d='';for(let t=1;t<=T;t++)d+=(d?'L':'M')+(px+iw*(t-1)/(T-1))+','+ly(r[t]);return '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="2.2"/>';};
    s+=line(hr,'#e06a6a')+line(hl,'#46c46a');
    s+='<text x="'+px+'" y="'+(H-8)+'" font-size="10" fill="#95a2c2">t=1 (kedi burada)</text><text x="'+(px+iw)+'" y="'+(H-8)+'" text-anchor="end" font-size="10" fill="#95a2c2">t=30 (karar burada)</text>';
    $('lxHealth').innerHTML=s;
    return {r:hr[1],l:hl[1]};
  }
  const sci=v=>{if(v>=0.01)return fm(v*100,1)+' %';const e=Math.floor(Math.log10(v));return fm(v/Math.pow(10,e),1)+'·10'+(''+e).replace('-','⁻').replace(/[0-9]/g,c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[c]);};
  function draw(){
    lossSvg();const hs=healthSvg();
    const kr=LR_.length?LR_[LR_.length-1]:0.693,kl=LL_.length?LL_[LL_.length-1]:null;
    const pr=rnnBack(R,seq(DATA[0]),1).p,pl=lstmBack(P,seq(DATA[0]),1).p;
    $('lxStat').innerHTML=
      '<div>epoch: <b>'+ep+'</b> / '+MAXEP+'</div>'+
      '<div style="color:#e06a6a">RNN — kayıp <b>'+(ep?fm(kr,3):'—')+'</b> · p("kedi"→1) = <b>'+fm(pr,3)+'</b> · t=1\'e ulaşan sinyal <b>'+sci(hs.r)+'</b></div>'+
      '<div style="color:#46c46a">LSTM — kayıp <b>'+(ep?fm(kl,3):'—')+'</b> · p("kedi"→1) = <b>'+fm(pl,3)+'</b> · t=1\'e ulaşan sinyal <b>'+sci(hs.l)+'</b></div>';
    window.__lstmEx={ep,kr:LR_.slice(),kl:LL_.slice(),R:R.slice(),P:JSON.parse(JSON.stringify(P)),hs};
  }
  const stop=()=>{if(timer){cancelAnimationFrame(timer);timer=null;}};
  function loop(){if(ep>=MAXEP){stop();draw();return;}for(let i=0;i<5&&ep<MAXEP;i++)epoch();draw();timer=requestAnimationFrame(loop);}
  $('lxGo').onclick=()=>{if(!timer&&ep<MAXEP)timer=requestAnimationFrame(loop);};
  $('lxPause').onclick=stop;
  $('lxStep').onclick=()=>{stop();for(let i=0;i<10&&ep<MAXEP;i++)epoch();draw();};
  $('lxReset').onclick=()=>{stop();R=initR();P=initL();ep=0;LR_=[];LL_=[];draw();};
  window.__lstmExStep=n=>{for(let i=0;i<n&&ep<MAXEP;i++)epoch();draw();};
  draw();
})();

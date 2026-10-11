// Aktivasyon Fonksiyonları — "7️⃣ Örnek Çalışmalar" (kendi kendine öğrenen):
//  1) 8 katmanlı tek-nöronlu zincir: σ / tanh / ReLU aynı görev, aynı başlangıç — kaçıncı turda öğrenir, ilk katmanın gradyanı ne kadar?
//  2) Ölü ReLU: aynı veri, aynı başlangıç; ReLU takılır, Leaky ReLU kurtulur
//  3) f′(z) tablosu + 8 katmanda çarpanın bileşkesi (elle hesap)
// Python kod kutularıyla (index.html) aynı sayıları üretir.
(function(){
  const $=id=>document.getElementById(id);
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const fm=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const sci=v=>{if(v===0)return '0';const e=Math.floor(Math.log10(Math.abs(v)));return fm(v/Math.pow(10,e),1)+'·10'+(''+e).replace('-','⁻').replace(/[0-9]/g,c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[c]);};
  const F={sigmoid:{f:z=>1/(1+Math.exp(-z)),df:(a)=>a*(1-a),c:'#f0a032',n:'σ'},tanh:{f:Math.tanh,df:a=>1-a*a,c:'#5aa0e0',n:'tanh'},relu:{f:z=>Math.max(0,z),df:(a,z)=>z>0?1:0,c:'#46c46a',n:'ReLU'}};
  const N=8,X=1,Y=0.5,MAXEP=1200;

  /* ===== Örnek 1 ===== */
  const e1=$('acEx1');
  if(e1){
    const st={};let ep=0,timer=null,lr=0.1;
    const init=()=>{Object.keys(F).forEach(k=>{st[k]={w:new Array(N).fill(1),hist:[],first:null,hit:null,g1:0};});ep=0;};
    function step(k){
      const S=st[k],{f,df}=F[k],w=S.w,a=[X],z=[];
      for(let i=0;i<N;i++){z.push(w[i]*a[a.length-1]);a.push(f(z[i]));}
      const L=0.5*(a[N]-Y)*(a[N]-Y);S.hist.push(L);if(S.hit===null&&L<0.001)S.hit=ep;
      let d=a[N]-Y;const g=new Array(N);
      for(let i=N-1;i>=0;i--){const dz=d*df(a[i+1],z[i]);g[i]=dz*a[i];d=dz*w[i];}
      S.g1=Math.abs(g[0]);S.gN=Math.abs(g[N-1]);
      for(let i=0;i<N;i++)w[i]-=lr*g[i];
    }
    e1.innerHTML='<div style="font-size:13px;color:#ccd5e8;margin-bottom:6px">Öğrenme hızı: <select id="ac1lr" class="rex-sel"><option>0,05</option><option selected>0,1</option><option>0,3</option></select> <button class="rex-btn" id="ac1go">▶ eğit</button><button class="rex-btn" id="ac1pause">⏸</button><button class="rex-btn" id="ac1step">🔧 +20 tur</button><button class="rex-btn" id="ac1reset">↺ başa dön</button></div><div class="rex-grid"><div><svg id="ac1s" viewBox="0 0 320 170" style="width:100%;max-width:420px"></svg></div><div id="ac1t"></div></div>';
    const draw=()=>{
      const LX=i=>34+(320-44)*i/MAXEP, LY=v=>150-130*Math.min(1,Math.max(0,(Math.log10(Math.max(v,1e-5))+5)/4.5));
      let s='<line x1="34" y1="150" x2="312" y2="150" stroke="#44507a"/>';
      [-4,-2,-1].forEach(e=>{const y=LY(Math.pow(10,e));s+='<line x1="34" y1="'+y+'" x2="312" y2="'+y+'" stroke="#2a3558" stroke-dasharray="3 3"/><text x="30" y="'+(y+3)+'" text-anchor="end" font-size="9" fill="#95a2c2">10<tspan font-size="7" dy="-3">'+(''+e).replace('-','−')+'</tspan></text>';});
      const y3=LY(0.001);s+='<line x1="34" y1="'+y3+'" x2="312" y2="'+y3+'" stroke="#e0a030" stroke-dasharray="5 3"/><text x="312" y="'+(y3-3)+'" text-anchor="end" font-size="9" fill="#e0a030">L=0,001 (öğrendi)</text>';
      Object.keys(F).forEach(k=>{const h=st[k].hist;if(h.length>1){let d='';h.forEach((v,i)=>{d+=(d?'L':'M')+LX(i)+','+LY(v);});s+='<path d="'+d+'" fill="none" stroke="'+F[k].c+'" stroke-width="2"/>';}});
      $('ac1s').innerHTML=s+'<text x="34" y="166" font-size="9" fill="#95a2c2">0</text><text x="312" y="166" text-anchor="end" font-size="9" fill="#95a2c2">'+MAXEP+' tur</text><text x="4" y="12" font-size="9" fill="#95a2c2">kayıp L (log)</text>';
      let t='<table class="rex-tbl"><tr><th>aktivasyon</th><th>kayıp L</th><th>L&lt;0,001 olduğu tur</th><th>1. katmanın gradyanı</th></tr>';
      Object.keys(F).forEach(k=>{const S=st[k],L=S.hist.length?S.hist[S.hist.length-1]:null;t+='<tr><td><b style="color:'+F[k].c+'">'+F[k].n+'</b></td><td>'+(L===null?'—':fm(L,4))+'</td><td>'+(S.hit!==null?'<b>'+S.hit+'</b>':ep?'henüz değil':'—')+'</td><td>'+(S.hist.length?sci(S.g1):'—')+'</td></tr>';});
      $('ac1t').innerHTML=t+'</table><div class="callout" style="margin-top:8px">Aynı başlangıç (w=1), aynı hedef: <b>σ yüzlerce tur</b> sürerken tanh/ReLU birkaç on turda öğreniyor. Nedenini sağdaki sütun söylüyor: σ zincirinde 1. katmanın gradyanı 8 katman boyunca her seferinde ≤0,25 ile çarpılıp <b>milyonlarca kat</b> küçülüyor.</div>';
      window.__ac1={ep,hits:Object.fromEntries(Object.keys(F).map(k=>[k,st[k].hit])),g1:Object.fromEntries(Object.keys(F).map(k=>[k,st[k].g1]))};
    };
    const tick=()=>{Object.keys(F).forEach(step);ep++;};
    const stop=()=>{if(timer){cancelAnimationFrame(timer);timer=null;}};
    const loop=()=>{if(ep>=MAXEP){stop();draw();return;}for(let i=0;i<5&&ep<MAXEP;i++)tick();draw();timer=requestAnimationFrame(loop);};
    init();draw();
    $('ac1lr').onchange=()=>{lr=parseFloat($('ac1lr').value.replace(',','.'));stop();init();draw();};
    $('ac1go').onclick=()=>{if(!timer&&ep<MAXEP)timer=requestAnimationFrame(loop);};
    $('ac1pause').onclick=stop;$('ac1step').onclick=()=>{stop();for(let i=0;i<20&&ep<MAXEP;i++)tick();draw();};$('ac1reset').onclick=()=>{stop();init();draw();};
    window.__ac1Step=n=>{for(let i=0;i<n&&ep<MAXEP;i++)tick();draw();};
    window.__ac1Lr=v=>{$('ac1lr').value=v;$('ac1lr').onchange();};
  }

  /* ===== Örnek 2 ===== */
  const e2=$('acEx2');
  if(e2){
    const DT=[[1,2],[2,4],[3,6]],MAX2=600,LR=0.02;
    const run=(eg)=>{let w=0.5,b=-5;const h=[];for(let t=0;t<MAX2;t++){let gw=0,gb=0,L=0;DT.forEach(([x,y])=>{const z=w*x+b,a=z>0?z:eg*z,d=a-y;L+=0.5*d*d/3;const dz=d*(z>0?1:eg);gw+=dz*x/3;gb+=dz/3;});h.push(L);w-=LR*gw;b-=LR*gb;}return {h,w,b};};
    const R=run(0),K=run(0.1);
    e2.innerHTML='<div style="font-size:13px;color:#ccd5e8;margin-bottom:6px">Kaç tur? <input type="range" id="ac2n" min="1" max="'+MAX2+'" value="'+MAX2+'" style="width:220px"> <b id="ac2nv">'+MAX2+'</b></div><div class="rex-grid"><div><svg id="ac2s" viewBox="0 0 320 170" style="width:100%;max-width:420px"></svg></div><div id="ac2t"></div></div>';
    const upd=()=>{
      const n=+$('ac2n').value;$('ac2nv').textContent=n;
      const X=i=>34+(320-44)*i/MAX2,Y=v=>150-130*Math.min(1,v/12);
      let s='<line x1="34" y1="150" x2="312" y2="150" stroke="#44507a"/>';
      [[R,'#e06a6a'],[K,'#46c46a']].forEach(([r,c])=>{let d='';for(let i=0;i<n;i++)d+=(d?'L':'M')+X(i)+','+Y(r.h[i]);s+='<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="2.2"/>';});
      $('ac2s').innerHTML=s+'<text x="34" y="166" font-size="9" fill="#95a2c2">0</text><text x="312" y="166" text-anchor="end" font-size="9" fill="#95a2c2">'+MAX2+' tur</text><text x="4" y="12" font-size="9" fill="#95a2c2">kayıp L</text>';
      $('ac2t').innerHTML='<table class="rex-tbl"><tr><th></th><th>kayıp L ('+n+'. tur)</th></tr><tr><td><b style="color:#e06a6a">ReLU</b> (ölü)</td><td><b>'+fm(R.h[n-1],3)+'</b></td></tr><tr><td><b style="color:#46c46a">Leaky ReLU (0,1)</b></td><td><b>'+fm(K.h[n-1],3)+'</b></td></tr></table><div class="callout" style="margin-top:8px">Başlangıç w=0,5, b=−5: üç girdide de z negatif. ReLU\'da z≤0 iken türev <b>tam 0</b> → gradyan sıfır → ağırlıklar hiç değişmiyor (w=0,5, b=−5 sabit), nöron <b>ölü</b>. Leaky ReLU\'da eğim 0,1: küçük de olsa gradyan var, nöron yavaşça kendini kurtarıyor (w→'+fm(K.w,2)+', b→'+fm(K.b,2)+').</div>';
      window.__ac2={r:R.h[n-1],k:K.h[n-1],n};
    };
    $('ac2n').addEventListener('input',upd);upd();
  }

  /* ===== Örnek 3 ===== */
  const e3=$('acEx3');
  if(e3){
    const zs=[-6,-4,-2,-1,0,1,2,4,6];
    const dv={sigmoid:z=>{const a=1/(1+Math.exp(-z));return a*(1-a);},tanh:z=>1-Math.pow(Math.tanh(z),2),relu:z=>z>0?1:0};
    let h='<div style="overflow-x:auto"><table class="rex-tbl"><tr><th>f′(z)</th>'+zs.map(z=>'<th>z='+fm(z,0)+'</th>').join('')+'<th>en büyüğü</th><th>8 katmanda en iyi hâl</th></tr>';
    const mx={sigmoid:0.25,tanh:1,relu:1};
    Object.keys(F).forEach(k=>{h+='<tr><td><b style="color:'+F[k].c+'">'+F[k].n+'</b></td>'+zs.map(z=>'<td>'+fm(dv[k](z),3)+'</td>').join('')+'<td><b>'+fm(mx[k],2)+'</b></td><td><b>'+sci(Math.pow(mx[k],8))+'</b></td></tr>';});
    e3.innerHTML=h+'</table></div><div class="callout" style="margin-top:8px"><b>Elle hesap:</b> 8 katmanda geri giden sinyal her katmanda f′ ile çarpılır (ağırlık 1 varsayımıyla). Sigmoid\'in en iyi durumu bile 0,25⁸ = <b>'+sci(Math.pow(0.25,8))+'</b>; yani 1. katman, son katmana ulaşan sinyalin on binde birinden azını görür. ReLU\'da z&gt;0 ise çarpan 1⁸ = 1: sinyal bozulmadan akar (ama z≤0 olduğu an çarpan 0).</div>';
  }
})();

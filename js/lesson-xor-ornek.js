// XOR — "7️⃣ Örnek Çalışmalar" (kendi kendine öğrenen):
//  1) Tek nöron AND / OR / XOR: AND ve OR'u öğrenir, XOR'da en iyisi bile "hepsine 0,5" (kayıp 0,693)
//  2) 2 gizli nöronlu ağ XOR'u çözer — ama bazı başlangıçlar yerel tuzakta takılır (Python'daki 12 tohum ile aynı)
//  3) Elle hesap: çözülmüş ağın (h₁=VEYA, h₂=VE) dört girdideki ileri yolu
// Python kod kutularıyla (index.html) aynı sayıları üretir.
(function(){
  const $=id=>document.getElementById(id);
  const sig=z=>1/(1+Math.exp(-z));
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const fm=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const X=[[0,0],[0,1],[1,0],[1,1]];
  const KAPI={AND:[0,0,0,1],OR:[0,1,1,1],XOR:[0,1,1,0]};
  const bce=(p,t)=>-(t?Math.log(p):Math.log(1-p));
  const mkRng=null;

  /* ===== Örnek 1 ===== */
  const e1=$('xoEx1');
  if(e1){
    let kapi='AND',w=[0,0,0],ep=0,hist=[],timer=null;const MAX=2000;
    e1.innerHTML='<div style="font-size:13px;color:#ccd5e8;margin-bottom:6px">Öğrenmesi istenen kapı: '+Object.keys(KAPI).map(k=>'<button class="rex-btn xo1k" data-k="'+k+'">'+k+'</button>').join('')+' <button class="rex-btn" id="xo1go">▶ eğit</button><button class="rex-btn" id="xo1pause">⏸</button><button class="rex-btn" id="xo1reset">↺</button></div><div class="rex-grid"><div id="xo1t"></div><div><svg id="xo1s" viewBox="0 0 320 170" style="width:100%;max-width:420px"></svg></div></div>';
    const step=()=>{let g=[0,0,0],L=0;X.forEach((x,i)=>{const p=sig(w[0]*x[0]+w[1]*x[1]+w[2]),d=p-KAPI[kapi][i];L+=bce(p,KAPI[kapi][i])/4;g[0]+=d*x[0]/4;g[1]+=d*x[1]/4;g[2]+=d/4;});hist.push(L);for(let j=0;j<3;j++)w[j]-=1.0*g[j];ep++;};
    const draw=()=>{
      let t='<table class="rex-tbl"><tr><th>x₁</th><th>x₂</th><th>doğru ('+kapi+')</th><th>ağın cevabı p</th></tr>';
      X.forEach((x,i)=>{const p=sig(w[0]*x[0]+w[1]*x[1]+w[2]),ok=(p>0.5)===(KAPI[kapi][i]===1);t+='<tr><td>'+x[0]+'</td><td>'+x[1]+'</td><td>'+KAPI[kapi][i]+'</td><td><b style="color:'+(ep&&ok&&Math.abs(p-0.5)>0.05?'#46c46a':'#e0a030')+'">'+fm(p,3)+'</b></td></tr>';});
      const L=hist.length?hist[hist.length-1]:0.6931;
      t+='</table><div class="rex-stat" style="margin-top:8px">tur: <b>'+ep+'</b> / '+MAX+' · kayıp: <b>'+fm(L,4)+'</b> · w=('+fm(w[0],2)+', '+fm(w[1],2)+'), b='+fm(w[2],2)+'</div>';
      const done=ep>=MAX*0.5;
      t+='<div class="callout" style="margin-top:8px">'+(kapi==='XOR'?(done?'🧱 <b>XOR\'da tek nöron öğrenemedi:</b> kayıp 0,693\'te (yazı-tura) ve ağırlıklar 0\'da kaldı. Bu bir "takılma" değil — tek bir doğrunun ulaşabileceği <b>en iyi</b> nokta bu: dört noktaya da 0,5 demek. Duvar budur.':'XOR\'u dene: kayıp düşecek mi? (▶ eğit)'):(done?'✅ <b>'+kapi+'</b>\'ı tek nöron öğrendi: ağırlıkların ikisi de ≈ '+fm(w[0],1)+' (ikisi de önemli) ve bias eksi ('+fm(w[2],1)+' → "yeterince girdi gelmedikçe sessiz kal").':kapi+' için ▶ eğit\'e bas.'))+'</div>';
      $('xo1t').innerHTML=t;
      const LX=i=>34+(320-44)*i/MAX,LY=v=>150-130*Math.min(1,v/0.72);
      let s='<line x1="34" y1="150" x2="312" y2="150" stroke="#44507a"/><line x1="34" y1="'+LY(0.693)+'" x2="312" y2="'+LY(0.693)+'" stroke="#e0a030" stroke-dasharray="4 3"/><text x="312" y="'+(LY(0.693)-3)+'" text-anchor="end" font-size="9" fill="#e0a030">0,693 (yazı-tura)</text>';
      if(hist.length>1){let d='';hist.forEach((v,i)=>{d+=(d?'L':'M')+LX(i)+','+LY(v);});s+='<path d="'+d+'" fill="none" stroke="#46c46a" stroke-width="2.2"/>';}
      $('xo1s').innerHTML=s+'<text x="34" y="166" font-size="9" fill="#95a2c2">0</text><text x="312" y="166" text-anchor="end" font-size="9" fill="#95a2c2">'+MAX+' tur</text><text x="4" y="12" font-size="9" fill="#95a2c2">kayıp L</text>';
      document.querySelectorAll('.xo1k').forEach(b=>{b.style.outline=b.dataset.k===kapi?'2px solid var(--accent)':'none';});
      window.__xo1={kapi,ep,L,w:w.slice()};
    };
    const stop=()=>{if(timer){cancelAnimationFrame(timer);timer=null;}};
    const loop=()=>{if(ep>=MAX){stop();draw();return;}for(let i=0;i<10&&ep<MAX;i++)step();draw();timer=requestAnimationFrame(loop);};
    const reset=()=>{stop();w=[0,0,0];ep=0;hist=[];draw();};
    document.querySelectorAll('.xo1k').forEach(b=>b.onclick=()=>{kapi=b.dataset.k;reset();});
    $('xo1go').onclick=()=>{if(!timer&&ep<MAX)timer=requestAnimationFrame(loop);};$('xo1pause').onclick=stop;$('xo1reset').onclick=reset;
    window.__xo1Run=(k,n)=>{kapi=k;reset();for(let i=0;i<n;i++)step();draw();};
    draw();
  }

  /* ===== Örnek 2 ===== */
  const e2=$('xoEx2');
  if(e2){
    // Python'daki random.Random(tohum) + uniform(-1,1) 1 ondalığa yuvarlanmış başlangıçlar (4 temsilci)
    const INIT={0:{W1:[[0.7,0.5],[-0.2,-0.5]],b1:[0,-0.2],W2:[0.6,-0.4],b2:0},1:{W1:[[-0.7,0.7],[0.5,-0.5]],b1:[0,-0.1],W2:[0.3,0.6],b2:-0.8},2:{W1:[[0.9,0.9],[-0.9,-0.8]],b1:[0.7,0.5],W2:[0.3,-0.4],b2:0.2},5:{W1:[[0.2,0.5],[0.6,0.9]],b1:[0.5,0.8],W2:[-0.9,-0.1],b2:0.9}};
    const MAX=4000;let sel=0,N=null,ep=0,hist=[],timer=null;
    const mk=k=>{const I=INIT[k];return {W1:I.W1.map(r=>r.slice()),b1:I.b1.slice(),W2:I.W2.slice(),b2:I.b2};};
    const fwd=(n,x)=>{const h=[0,1].map(j=>sig(n.W1[j][0]*x[0]+n.W1[j][1]*x[1]+n.b1[j]));return {h,p:sig(n.W2[0]*h[0]+n.W2[1]*h[1]+n.b2)};};
    function step(){
      const g={W1:[[0,0],[0,0]],b1:[0,0],W2:[0,0],b2:0};let L=0;
      X.forEach((x,i)=>{const {h,p}=fwd(N,x),t=KAPI.XOR[i];L+=bce(p,t)/4;const dz=p-t;
        for(let j=0;j<2;j++){g.W2[j]+=dz*h[j]/4;const dh=dz*N.W2[j]*h[j]*(1-h[j]);g.W1[j][0]+=dh*x[0]/4;g.W1[j][1]+=dh*x[1]/4;g.b1[j]+=dh/4;}
        g.b2+=dz/4;});
      hist.push(L);
      for(let j=0;j<2;j++){N.W1[j][0]-=g.W1[j][0];N.W1[j][1]-=g.W1[j][1];N.b1[j]-=g.b1[j];N.W2[j]-=g.W2[j];}
      N.b2-=g.b2;ep++;
    }
    e2.innerHTML='<div style="font-size:13px;color:#ccd5e8;margin-bottom:6px">Başlangıç (rastgele tohum): '+Object.keys(INIT).map(k=>'<button class="rex-btn xo2k" data-k="'+k+'">#'+k+'</button>').join('')+' <button class="rex-btn" id="xo2go">▶ eğit</button><button class="rex-btn" id="xo2pause">⏸</button><button class="rex-btn" id="xo2reset">↺</button></div><div class="rex-grid"><div id="xo2t"></div><div><svg id="xo2s" viewBox="0 0 320 170" style="width:100%;max-width:420px"></svg></div></div>';
    const draw=()=>{
      let t='<table class="rex-tbl"><tr><th>x₁</th><th>x₂</th><th>XOR</th><th>ağın cevabı p</th></tr>';
      X.forEach((x,i)=>{const p=fwd(N,x).p,ok=(p>0.5)===(KAPI.XOR[i]===1);t+='<tr><td>'+x[0]+'</td><td>'+x[1]+'</td><td>'+KAPI.XOR[i]+'</td><td><b style="color:'+(ok?'#46c46a':'#e06a6a')+'">'+fm(p,3)+'</b> '+(ok?'✓':'✗')+'</td></tr>';});
      const L=hist.length?hist[hist.length-1]:null,doğru=X.filter((x,i)=>(fwd(N,x).p>0.5)===(KAPI.XOR[i]===1)).length;
      t+='</table><div class="rex-stat" style="margin-top:8px">başlangıç <b>#'+sel+'</b> · tur: <b>'+ep+'</b> / '+MAX+' · kayıp: <b>'+(L===null?'—':fm(L,4))+'</b> · doğru: <b>'+doğru+'/4</b></div>';
      t+='<div class="callout" style="margin-top:8px">'+(ep>=MAX?(L<0.05?'✅ Bu başlangıçtan ağ XOR\'u <b>çözdü</b>: 4/4 doğru.':'⚠️ Bu başlangıçta ağ <b>takıldı</b>: '+doğru+'/4 doğru, kayıp '+fm(L,3)+'. Gizli nöronlar yanlış bir "vadiye" girdi ve gradyan oradan çıkaracak kadar büyük değil — yerel tuzak.'):'▶ eğit\'e bas ve kaybın nereye indiğine bak.')+'<br><span style="font-size:12px;color:var(--muted)">Python\'da 12 farklı rastgele başlangıç denendi: <b>9\'u çözdü, 3\'ü takıldı</b> (#2, #5, #7). Aynı ağ, aynı veri, yalnızca başlangıç farklı.</span></div>';
      $('xo2t').innerHTML=t;
      const LX=i=>34+(320-44)*i/MAX,LY=v=>150-130*Math.min(1,v/0.72);
      let s='<line x1="34" y1="150" x2="312" y2="150" stroke="#44507a"/><line x1="34" y1="'+LY(0.693)+'" x2="312" y2="'+LY(0.693)+'" stroke="#e0a030" stroke-dasharray="4 3"/>';
      if(hist.length>1){let d='';hist.forEach((v,i)=>{if(hist.length>500&&i%Math.ceil(hist.length/500)&&i!==hist.length-1)return;d+=(d?'L':'M')+LX(i)+','+LY(v);});s+='<path d="'+d+'" fill="none" stroke="#46c46a" stroke-width="2.2"/>';}
      $('xo2s').innerHTML=s+'<text x="34" y="166" font-size="9" fill="#95a2c2">0</text><text x="312" y="166" text-anchor="end" font-size="9" fill="#95a2c2">'+MAX+' tur</text><text x="4" y="12" font-size="9" fill="#95a2c2">kayıp L</text>';
      document.querySelectorAll('.xo2k').forEach(b=>{b.style.outline=+b.dataset.k===sel?'2px solid var(--accent)':'none';});
      window.__xo2={sel,ep,L,dogru:doğru};
    };
    const stop=()=>{if(timer){cancelAnimationFrame(timer);timer=null;}};
    const loop=()=>{if(ep>=MAX){stop();draw();return;}for(let i=0;i<20&&ep<MAX;i++)step();draw();timer=requestAnimationFrame(loop);};
    const reset=()=>{stop();N=mk(sel);ep=0;hist=[];draw();};
    document.querySelectorAll('.xo2k').forEach(b=>b.onclick=()=>{sel=+b.dataset.k;reset();});
    $('xo2go').onclick=()=>{if(!timer&&ep<MAX)timer=requestAnimationFrame(loop);};$('xo2pause').onclick=stop;$('xo2reset').onclick=reset;
    window.__xo2Run=(k,n)=>{sel=k;reset();for(let i=0;i<n;i++)step();draw();};
    reset();
  }

  /* ===== Örnek 3 ===== */
  const e3=$('xoEx3');
  if(e3){
    const A=[10,10,-5],Bw=[10,10,-15],C=[10,-10,-5];
    let h='<div style="overflow-x:auto"><table class="rex-tbl"><tr><th>x₁</th><th>x₂</th><th>z₁=10x₁+10x₂−5</th><th>h₁ (VEYA)</th><th>z₂=10x₁+10x₂−15</th><th>h₂ (VE)</th><th>z<sub>y</sub>=10h₁−10h₂−5</th><th>p</th><th>cevap</th></tr>';
    X.forEach(x=>{const z1=A[0]*x[0]+A[1]*x[1]+A[2],h1=sig(z1),z2=Bw[0]*x[0]+Bw[1]*x[1]+Bw[2],h2=sig(z2),zy=C[0]*h1+C[1]*h2+C[2],p=sig(zy);
      h+='<tr><td>'+x[0]+'</td><td>'+x[1]+'</td><td>'+fm(z1,0)+'</td><td>'+fm(h1,3)+'</td><td>'+fm(z2,0)+'</td><td>'+fm(h2,3)+'</td><td>'+fm(zy,2)+'</td><td><b>'+fm(p,3)+'</b></td><td><b>'+(p>0.5?1:0)+'</b></td></tr>';});
    e3.innerHTML=h+'</table></div><div class="callout" style="margin-top:8px">Bu ağırlıklar Örnek 2\'deki ağın <b>öğrendiği</b> türden bir çözümdür (biz elle yazdık ki hesabı izleyebilesin). h₁ "en az biri 1 mi?" (VEYA), h₂ "ikisi de 1 mi?" (VE) kapısı gibi çalışıyor; çıkış nöronu "VEYA doğru ama VE yanlışsa 1 de" diyor: <b>XOR = VEYA ve DEĞİL(VE)</b>. Tek nöronun yapamadığı şey, katman katman iki basit karardan kurulabiliyor.</div>';
  }
})();

// LSTM — "Bir kapının içi: RNN hücresiyle aynı iş" (Nedir aşaması).
// RNN'de z_h = W_hh·h₋₁ + W_xh·x + b_h → tanh. LSTM'de aynı çarp-topla-bias DÖRT kez, dört ayrı ağırlık setiyle yapılır.
// Burada tek bir kapı RNN şemasının diliyle (× W, × U, + b, aktivasyon) adım adım kurulur; altta dört kapının ağırlık/sayı tablosu var.
// Ağırlıklar sabit örnek değerler: f(0.5,0.4,0.1) i(0.6,0.3,0) c(0.8,0.5,0) o(0.7,0.4,0.1).
(function(){
  const host=document.getElementById('lstmGate'); if(!host) return;
  const $=id=>document.getElementById(id);
  const sig=z=>1/(1+Math.exp(-z));
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const fm=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const tx=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>v<0?'('+tx(v,d)+')':tx(v,d);
  const G={f:{n:'f — unutma',nm:'f',act:'σ',g:sig,w:[0.5,0.4,0.1],c:'#f0a032',role:'eski hafızanın ne kadarı kalsın'},
           i:{n:'i — giriş',nm:'i',act:'σ',g:sig,w:[0.6,0.3,0.0],c:'#f0a032',role:'yeni bilginin ne kadarı girsin'},
           c:{n:'c̃ — aday',nm:'c̃',act:'tanh',g:Math.tanh,w:[0.8,0.5,0.0],c:'#5aa0e0',role:'hafızaya yazılacak içerik'},
           o:{n:'o — çıkış',nm:'o',act:'σ',g:sig,w:[0.7,0.4,0.1],c:'#f0a032',role:'hafızanın ne kadarı dışarı söylensin'}};
  const ORDER=['f','i','c','o'],SUB={f:'f',i:'i',c:'c',o:'o'};
  let kapi='f',step=0;

  host.innerHTML=
   '<div style="display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center;margin-bottom:8px;font-size:13px;color:#ccd5e8">Kapı: <span id="lgBtns"></span>'+
   '<span>x<sub>t</sub> = <input type="range" id="lgX" min="-2" max="2" step="0.05" value="1" style="width:110px"> <b id="lgXv">1,00</b></span>'+
   '<span>h<sub>t−1</sub> = <input type="range" id="lgH" min="-1" max="1" step="0.05" value="0.3" style="width:110px"> <b id="lgHv">0,30</b></span></div>'+
   '<div style="display:flex;gap:8px;margin-bottom:6px"><button class="rex-btn" id="lgGo">İleri ▶</button><button class="rex-btn" id="lgReset">↺ Sıfırla</button></div>'+
   '<div style="overflow-x:auto"><svg id="lgSvg" viewBox="0 0 660 330" style="min-width:540px;width:100%;max-width:720px;display:block;margin:0 auto"></svg></div>'+
   '<div class="work" id="lgFormula" style="margin-top:6px"></div><div class="callout" id="lgNote" style="margin-top:8px"></div>'+
   '<div class="acc" style="margin-top:8px"><div class="acc-head"><span class="ac">▸</span> 📑 Notasyon — kim kim? (RNN ile eşleme)</div><div class="acc-body">'+
   '<table class="rex-tbl"><tr><th>LSTM</th><th>ne</th><th>RNN\'deki karşılığı</th></tr>'+
   '<tr><td>x<sub>t</sub></td><td>o anki girdi (yeni kelime)</td><td>x</td></tr>'+
   '<tr><td>h<sub>t−1</sub></td><td>önceki adımın çıktısı (geçmiş)</td><td>h₋₁</td></tr>'+
   '<tr><td>W<sub>f</sub>, W<sub>i</sub>, W<sub>c</sub>, W<sub>o</sub></td><td>x\'in ağırlığı — her kutunun kendisi</td><td>W<sub>xh</sub></td></tr>'+
   '<tr><td>U<sub>f</sub>, U<sub>i</sub>, U<sub>c</sub>, U<sub>o</sub></td><td>h<sub>t−1</sub>\'in ağırlığı — her kutunun kendisi</td><td>W<sub>hh</sub></td></tr>'+
   '<tr><td>b<sub>f</sub>, b<sub>i</sub>, b<sub>c</sub>, b<sub>o</sub></td><td>bias</td><td>b<sub>h</sub></td></tr>'+
   '<tr><td>σ ya da tanh</td><td>aktivasyon (kapılarda σ, adayda tanh)</td><td>tanh</td></tr></table>'+
   '<p style="font-size:12.5px;color:var(--muted);margin:6px 0 0">RNN\'de bu ağırlıklardan <b>bir set</b> vardı; LSTM\'de <b>dört set</b> (her kutu için ayrı). W ve U harflerini "x için" ve "h için" diye hatırla.</p></div></div>'+
   '<h4 style="margin:12px 0 6px">Dört kapı yan yana — aynı işlem, farklı ağırlıklar</h4><div style="overflow-x:auto" id="lgTable"></div>';
  ORDER.forEach(k=>{const b=document.createElement('button');b.className='rex-btn lg-k';b.dataset.k=k;b.textContent=G[k].n;b.onclick=()=>{kapi=k;step=0;draw();};$('lgBtns').appendChild(b);});

  const circ=(x,y,r,t,fs)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#14203a" stroke="#6a78a8" stroke-width="2"/><text x="'+x+'" y="'+(y+(fs?5:6))+'" text-anchor="middle" font-size="'+(fs||18)+'" fill="#fff" font-weight="700">'+t+'</text>';
  const ring=(x,y,r)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="none" stroke="#ffd84a" stroke-width="3.5" stroke-dasharray="6 4"/>';
  const rbox=(x,y,w,h)=>'<rect x="'+(x-4)+'" y="'+(y-4)+'" width="'+(w+8)+'" height="'+(h+8)+'" rx="12" fill="none" stroke="#ffd84a" stroke-width="3.5" stroke-dasharray="6 4"/>';
  const arrow=(d,col)=>'<path d="'+d+'" fill="none" stroke="'+(col||'#8a96bc')+'" stroke-width="2.5" marker-end="url(#lgA)"/>';
  const lab=(x,y,t,c,sz,a)=>'<text x="'+x+'" y="'+y+'" text-anchor="'+(a||'middle')+'" font-size="'+(sz||13)+'" fill="'+(c||'#ccd5e8')+'" font-style="italic">'+t+'</text>';

  function draw(){
    const x=parseFloat($('lgX').value),h=parseFloat($('lgH').value),Gt=G[kapi],[W,U,b]=Gt.w;
    $('lgXv').textContent=fm(x,2);$('lgHv').textContent=fm(h,2);
    const wx=W*x,uh=U*h,z=wx+uh+b,a=Gt.g(z),s=SUB[kapi];
    // şema (RNN şemasının dili: soldan h, ×U, +, aktivasyon; aşağıdan x, ×W; yukarıdan b)
    let v='<defs><marker id="lgA" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto"><path d="M0,0 L8,3.5 L0,7 Z" fill="#8a96bc"/></marker></defs>';
    v+='<rect x="130" y="40" width="400" height="250" rx="18" fill="rgba(90,160,224,.06)" stroke="#44507a" stroke-width="2"/>';
    v+=arrow('M92,150 L158,150')+arrow('M222,150 L296,150')+arrow('M364,150 L430,150')+arrow('M506,150 L580,150',Gt.c);
    v+=arrow('M330,70 L330,128')+arrow('M330,240 L330,172');
    v+=arrow('M330,296 L330,266');
    // düğümler
    v+='<rect x="30" y="132" width="62" height="36" rx="9" fill="#1c3a30" stroke="#46c46a" stroke-width="2"/><text x="61" y="156" text-anchor="middle" font-size="15" fill="#fff" font-weight="700">h₋₁</text>';
    v+=circ(190,150,26,'×')+lab(190,112,'U'+s,'#f0c070',14);
    v+=circ(330,150,26,'+');
    v+='<rect x="436" y="130" width="70" height="40" rx="10" fill="#241a3c" stroke="#c77dff" stroke-width="2"/><text x="471" y="156" text-anchor="middle" font-size="16" fill="#fff" font-weight="700">'+Gt.act+'</text>';
    v+='<circle cx="610" cy="150" r="28" fill="#2a2210" stroke="'+Gt.c+'" stroke-width="2.5"/><text x="610" y="146" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">'+Gt.nm+'</text><text x="610" y="162" text-anchor="middle" font-size="11" fill="#ccd5e8">'+(step>=4?fm(a,3):'?')+'</text>';
    v+=circ(330,252,24,'×')+lab(372,258,'W'+s,'#f0c070',14,'start');
    v+='<rect x="302" y="296" width="56" height="30" rx="8" fill="#12333a" stroke="#4ad0e0" stroke-width="2"/><text x="330" y="317" text-anchor="middle" font-size="15" fill="#fff" font-weight="700">x</text>';
    v+=lab(330,60,'b'+s,'#f0c070',14);
    v+=lab(61,190,'geçmiş','#95a2c2',11)+lab(372,318,'yeni girdi','#95a2c2',11,'start');
    // adım değerleri
    if(step>=1)v+=lab(372,282,'x·W'+s+' = '+fm(wx,3),'#8fdc9f',12,'start');
    if(step>=2)v+=lab(190,188,'h·U'+s+' = '+fm(uh,3),'#8fdc9f',12);
    if(step>=3)v+=lab(400,112,'z'+s+' = '+fm(z,3),'#ffd84a',13,'start');
    if(step>=4)v+=lab(541,138,'→','#fff',13);
    // vurgu halkaları
    if(step===1){v+=rbox(302,296,56,30)+ring(330,252,32);}
    if(step===2){v+=rbox(30,132,62,36)+ring(190,150,34);}
    if(step===3){v+=ring(330,150,34);}
    if(step===4){v+=rbox(436,130,70,40)+ring(610,150,36);}
    $('lgSvg').innerHTML=v;
    // formül (MathJax)
    const gsym=Gt.act==='tanh'?'\\tanh':'\\sigma';
    let fo='\\( z_'+s+'=U_'+s+'\\,h_{t-1}+W_'+s+'\\,x_t+b_'+s+'\\ \\rightarrow\\ '+Gt.nm+'='+gsym+'(z_'+s+') \\)';
    if(step>=1)fo+='<br>\\( W_'+s+'x_t='+tp(W,2)+'\\cdot'+tp(x,2)+'=\\mathbf{'+tx(wx,3)+'} \\)';
    if(step>=2)fo+='  \\( U_'+s+'h_{t-1}='+tp(U,2)+'\\cdot'+tp(h,2)+'=\\mathbf{'+tx(uh,3)+'} \\)';
    if(step>=3)fo+='<br>\\( z_'+s+'='+tx(uh,3)+'+'+tp(wx,3)+'+'+tp(b,2)+'=\\mathbf{'+tx(z,3)+'} \\)';
    if(step>=4)fo+='  \\( '+Gt.nm+'='+gsym+'('+tp(z,3)+')=\\mathbf{'+tx(a,3)+'} \\)';
    $('lgFormula').innerHTML=fo;
    const notes=['<b>'+Gt.n+' kutusunun içine bakıyoruz.</b> Bu kutu ('+Gt.role+') RNN hücresiyle <b>aynı çarp-topla-bias</b> işini yapar, farkı: aktivasyon '+(Gt.act==='tanh'?'tanh (aynı)':'σ (0–1 vana)')+' ve ağırlıkların adı W<sub>'+s+'</sub>, U<sub>'+s+'</sub>, b<sub>'+s+'</sub>. <b>İleri ▶</b> ile kur.',
      '<b>1) x × W<sub>'+s+'</sub>:</b> yeni girdi, <u>bu kutunun</u> W ağırlığıyla çarpılır. RNN\'de bu W<sub>xh</sub>·x idi. Sayı: '+fm(W,2)+' × '+fm(x,2)+' = '+fm(wx,3)+'.',
      '<b>2) h<sub>t−1</sub> × U<sub>'+s+'</sub>:</b> geçmiş çıktı, <u>bu kutunun</u> U ağırlığıyla çarpılır. RNN\'de W<sub>hh</sub>·h₋₁ idi. Sayı: '+fm(U,2)+' × '+fm(h,2)+' = '+fm(uh,3)+'.',
      '<b>3) Topla + bias:</b> iki çarpım toplanıp b<sub>'+s+'</sub> eklenir → ham skor z<sub>'+s+'</sub> = '+fm(z,3)+'. RNN\'deki z<sub>h</sub> ile aynı şey.',
      '<b>4) Aktivasyon:</b> '+(Gt.act==='tanh'?'tanh(z) → '+fm(a,3)+' (−1…+1 arası içerik).':'σ(z) → '+fm(a,3)+' (0–1 arası vana: %'+Math.round(a*100)+' açık).')+' Bu çıkış, hücrenin <b>hafıza adımlarında</b> kullanılır (f·c₋₁, i·c̃, o·tanh c). <b>Diğer üç kutu da bu şemanın aynısı</b>, yalnız ağırlıkları farklı — aşağıdaki tabloya bak.'];
    $('lgNote').innerHTML=notes[step];
    document.querySelectorAll('.lg-k').forEach(bt=>{bt.style.outline=bt.dataset.k===kapi?'2px solid var(--accent)':'none';});
    $('lgGo').disabled=step>=4;
    // dört kapı tablosu
    let t='<table class="rex-tbl"><tr><th>kapı</th><th>W (x için)</th><th>U (h₋₁ için)</th><th>b</th><th>W·x</th><th>U·h₋₁</th><th>z</th><th>çıktı</th></tr>';
    const out={};
    ORDER.forEach(k=>{const g=G[k],[w,u,bb]=g.w,zz=w*x+u*h+bb,aa=g.g(zz);out[k]=aa;t+='<tr'+(k===kapi?' style="background:rgba(255,216,74,.10)"':'')+'><td><b>'+g.n+'</b></td><td>'+fm(w,2)+'</td><td>'+fm(u,2)+'</td><td>'+fm(bb,2)+'</td><td>'+fm(w*x,3)+'</td><td>'+fm(u*h,3)+'</td><td>'+fm(zz,3)+'</td><td><b>'+g.act+' → '+fm(aa,3)+'</b></td></tr>';});
    $('lgTable').innerHTML=t+'</table><div style="font-size:12.5px;color:var(--muted);margin-top:4px">Aynı x ve h₋₁, dört farklı ağırlık seti → dört farklı çıktı. Bu sayılar bir sonraki adımda (f·c₋₁, i·c̃, c, o·tanh c) kullanılır.</div>';
    window.__lg={kapi,step,x,h,wx,uh,z,a,out};
    clearTimeout(draw.t);draw.t=setTimeout(()=>{const M=window.MathJax;if(!M||!M.startup||!M.startup.promise)return;M.startup.promise.then(()=>{if(!M.typesetPromise)return;if(M.typesetClear)M.typesetClear([$('lgFormula')]);return M.typesetPromise([$('lgFormula')]);}).catch(()=>{});},50);
  }
  $('lgGo').onclick=()=>{if(step<4){step++;draw();}};
  $('lgReset').onclick=()=>{step=0;draw();};
  ['lgX','lgH'].forEach(id=>$(id).addEventListener('input',draw));
  draw();
})();

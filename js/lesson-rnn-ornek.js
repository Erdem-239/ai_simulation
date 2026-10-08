// RNN — "Örnek Çalışmalar" (index.html, #rex1 / #rex2 / #rex3): canlı mini RNN örnekleri.
// Her örnek: kontroller (kelime seçimi / kaydırıcılar) → açılmış RNN şekli (SVG) + MathJax'li canlı hesap.
(function(){
  const $=id=>document.getElementById(id);
  const sig=z=>1/(1+Math.exp(-z));
  // Türkçe sayı biçimi: metin için "−0,762", LaTeX için "-0{,}762"
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>{v=z0(v,d);return v<0?'('+t(v,d)+')':t(v,d);};

  // ---- MathJax (debounce'lu) ----
  const pend=new Map();
  function tx(el){
    if(!el||pend.has(el))return;
    pend.set(el,requestAnimationFrame(()=>{
      pend.delete(el);
      const M=window.MathJax;
      if(!M||!M.startup||!M.startup.promise)return;   // başlangıç typeset'i zaten yapacak
      M.startup.promise.then(()=>{
        if(!M.typesetPromise)return;
        if(M.typesetClear)M.typesetClear([el]);
        return M.typesetPromise([el]);
      }).catch(()=>{});
    }));
  }

  // ---- açılmış RNN şekli (3 adım) ----
  function svg(uid,c){
    const cx=[130,320,510],tc='#ccd5e8',mc='#8a96b8',o=[];
    o.push('<svg viewBox="0 0 640 330" style="width:100%; min-width:460px; max-width:600px; display:block; margin:0 auto" role="img" aria-label="Açılmış RNN: 3 zaman adımı">');
    o.push('<defs><marker id="'+uid+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="'+mc+'"/></marker></defs>');
    const ox=cx[2],good=c.outGood;
    o.push('<rect x="'+(ox-80)+'" y="14" width="160" height="46" rx="10" fill="'+(good?'#1d3a2a':'#4a1d1d')+'" stroke="'+(good?'#2ec46a':'#e06a6a')+'" stroke-width="2"/>');
    o.push('<text x="'+ox+'" y="34" text-anchor="middle" fill="'+tc+'" font-size="15" font-weight="700">'+c.outLab+'</text>');
    o.push('<text x="'+ox+'" y="51" text-anchor="middle" fill="'+mc+'" font-size="12">'+c.outSub+'</text>');
    o.push('<line x1="'+ox+'" y1="118" x2="'+ox+'" y2="62" stroke="'+mc+'" stroke-width="2" marker-end="url(#'+uid+')"/>');
    o.push('<text x="'+(ox+10)+'" y="96" fill="#2ec46a" font-size="13" font-weight="700">W<tspan font-size="10" dy="3">hy</tspan><tspan dy="-3"> = '+c.why+'</tspan></text>');
    for(let i=0;i<3;i++){
      const x=cx[i];
      o.push('<rect x="'+(x-60)+'" y="120" width="120" height="60" rx="12" fill="#2a2150" stroke="#9c4dff" stroke-width="2"/>');
      o.push('<text x="'+x+'" y="144" text-anchor="middle" fill="'+tc+'" font-size="16" font-weight="700">h<tspan font-size="11" dy="3">'+(i+1)+'</tspan></text>');
      o.push('<text x="'+x+'" y="166" text-anchor="middle" fill="'+(c.hCol||tc)+'" font-size="14" font-weight="700">= '+c.h[i]+'</text>');
      o.push('<rect x="'+(x-60)+'" y="250" width="120" height="56" rx="10" fill="#10284a" stroke="#4aa3ff" stroke-width="2"/>');
      o.push('<text x="'+x+'" y="274" text-anchor="middle" fill="'+tc+'" font-size="15" font-weight="700">'+c.words[i]+'</text>');
      o.push('<text x="'+x+'" y="294" text-anchor="middle" fill="#4aa3ff" font-size="13">x<tspan font-size="10" dy="3">'+(i+1)+'</tspan><tspan dy="-3"> = '+c.xs[i]+'</tspan></text>');
      o.push('<line x1="'+x+'" y1="248" x2="'+x+'" y2="182" stroke="'+mc+'" stroke-width="2" marker-end="url(#'+uid+')"/>');
      o.push('<text x="'+(x+8)+'" y="222" fill="#4aa3ff" font-size="12" font-weight="700">W<tspan font-size="9" dy="3">xh</tspan><tspan dy="-3"> = '+c.wxh+'</tspan></text>');
      if(i<2){
        const mx=(x+cx[i+1])/2;
        o.push('<line x1="'+(x+62)+'" y1="150" x2="'+(cx[i+1]-62)+'" y2="150" stroke="#f0a032" stroke-width="2.5" marker-end="url(#'+uid+')"/>');
        o.push('<text x="'+mx+'" y="136" text-anchor="middle" fill="#f0a032" font-size="12" font-weight="700">W<tspan font-size="9" dy="3">hh</tspan><tspan dy="-3"> = '+c.whh+'</tspan></text>');
        o.push('<text x="'+mx+'" y="172" text-anchor="middle" fill="#f0a032" font-size="11">hafıza</text>');
      }
    }
    o.push('<text x="14" y="154" fill="#f0a032" font-size="12" font-weight="700">h<tspan font-size="9" dy="3">0</tspan><tspan dy="-3">=0</tspan></text>');
    o.push('<line x1="42" y1="150" x2="'+(cx[0]-62)+'" y2="150" stroke="#f0a032" stroke-width="2.5" marker-end="url(#'+uid+')"/>');
    if(c.loss){
      o.push('<rect x="'+(ox-80-175)+'" y="14" width="140" height="46" rx="10" fill="#4a1d1d" stroke="#e06a6a" stroke-width="2"/>');
      o.push('<text x="'+(ox-80-105)+'" y="34" text-anchor="middle" fill="'+tc+'" font-size="14" font-weight="700">doğru cevap y = 1</text>');
      o.push('<text x="'+(ox-80-105)+'" y="51" text-anchor="middle" fill="#e06a6a" font-size="12">'+c.loss+'</text>');
      o.push('<line x1="'+(ox-80-35)+'" y1="37" x2="'+(ox-82)+'" y2="37" stroke="#e06a6a" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#'+uid+')"/>');
    }
    o.push('</svg>');
    return o.join('');
  }

  // ---- ortak: kaydırıcı ↔ değer etiketi ----
  function bind(ids,fn){
    ids.forEach(id=>{const e=$(id);if(e)e.addEventListener('input',fn);});
  }
  function lab(id,v,d=2){const e=$(id+'v');if(e)e.textContent=f(parseFloat(v),d);}
  function setRange(id,v){const e=$(id);if(e){e.value=v;}}

  // ================= Örnek 1: duygu =================
  (function(){
    if(!$('rex1'))return;
    const ids=['rex1a','rex1b','rex1c'], rg=['rex1wxh','rex1whh','rex1why'];
    const wordOf=v=>{const o=[...$('rex1a').options].find(op=>parseFloat(op.value)===v);return o?o.dataset.w:'?';};
    function render(){
      const xs=ids.map(i=>parseFloat($(i).value));
      const wxh=parseFloat($('rex1wxh').value),whh=parseFloat($('rex1whh').value),why=parseFloat($('rex1why').value);
      rg.forEach(i=>lab(i,$(i).value));
      let h=0;const hs=[],zs=[];
      xs.forEach(x=>{const z=wxh*x+whh*h;zs.push(z);h=Math.tanh(z);hs.push(h);});
      const p=sig(why*h);
      $('rex1fig').innerHTML=svg('rx1',{
        words:ids.map(i=>$(i).selectedOptions[0].dataset.w),xs:xs.map(x=>f(x,1)),
        whh:f(whh,2),wxh:f(wxh,2),why:f(why,2),h:hs.map(v=>f(v,3)),
        outLab:'p = '+f(p,2),outSub:p>=0.5?'olumlu olma olasılığı ✓':'olumlu olma olasılığı ✗',outGood:p>=0.5});
      const L=[];
      hs.forEach((hv,i)=>{
        const prev=i?hs[i-1]:0;
        L.push('t='+(i+1)+':\\quad & h_'+(i+1)+'=\\tanh\\big('+t(wxh,2)+'\\cdot '+tp(xs[i],1)+'+'+t(whh,2)+'\\cdot '+tp(prev,3)+'\\big)=\\mathbf{'+t(hv,3)+'}');
      });
      $('rex1calc').innerHTML='\\[\\begin{aligned}'+L.join('\\\\')+'\\end{aligned}\\]'+
        '\\[p=\\sigma\\big('+t(why,2)+'\\cdot '+tp(h,3)+'\\big)=\\mathbf{'+t(p,2)+'}\\quad\\Rightarrow\\quad\\text{'+(p>=0.5?'olumlu':'olumsuz')+'}\\]';
      tx($('rex1calc'));
    }
    bind(ids.concat(rg),render);
    document.querySelectorAll('[data-rex1]').forEach(b=>b.addEventListener('click',()=>{
      const v=b.dataset.rex1.split(',').map(Number);
      ids.forEach((id,i)=>{$(id).value=v[i];});
      if(v.length>3){setRange('rex1wxh',v[3]);setRange('rex1whh',v[4]);setRange('rex1why',v[5]);}
      render();
    }));
    render();
  })();

  // ================= Örnek 2: sıradaki kelime =================
  (function(){
    if(!$('rex2'))return;
    const rg=['rex2wxh','rex2whh','rex2why'];
    function render(){
      const x1=parseFloat($('rex2a').value);
      const wxh=parseFloat($('rex2wxh').value),whh=parseFloat($('rex2whh').value),why=parseFloat($('rex2why').value);
      rg.forEach(i=>lab(i,$(i).value));
      const xs=[x1,0,0];let h=0;const hs=[];
      xs.forEach(x=>{h=Math.tanh(wxh*x+whh*h);hs.push(h);});
      const p=sig(why*h),miyav=p>=0.5,conf=Math.max(p,1-p);
      $('rex2fig').innerHTML=svg('rx2',{
        words:[$('rex2a').selectedOptions[0].dataset.w,'ve','___'],xs:xs.map(x=>f(x,0)),
        whh:f(whh,2),wxh:f(wxh,2),why:f(why,2),h:hs.map(v=>f(v,3)),
        outLab:'p = '+f(p,2)+' → '+(miyav?'miyav':'hav'),outSub:'miyav olasılığı',outGood:conf>=0.7});
      const L=hs.map((hv,i)=>'t='+(i+1)+':\\quad & h_'+(i+1)+'=\\tanh\\big('+t(wxh,2)+'\\cdot '+tp(xs[i],0)+'+'+t(whh,2)+'\\cdot '+tp(i?hs[i-1]:0,3)+'\\big)=\\mathbf{'+t(hv,3)+'}');
      $('rex2calc').innerHTML='\\[\\begin{aligned}'+L.join('\\\\')+'\\end{aligned}\\]'+
        '\\[p=\\sigma\\big('+t(why,2)+'\\cdot '+tp(h,3)+'\\big)=\\mathbf{'+t(p,2)+'}\\]';
      const msg=conf>=0.7?'Ağ <b>'+(miyav?'"miyav"':'"hav"')+'</b> diyor (%'+Math.round(conf*100)+' emin) — ilk kelimenin bilgisi iki nötr adımdan sonra da duruyor.'
        :'Ağ <b>kararsız</b> (p ≈ '+f(p,2)+'): ilk kelimenin bilgisi iki adımda sönmüş. W<sub>hh</sub>\'yi büyütmeyi dene.';
      $('rex2msg').innerHTML=msg;
      tx($('rex2calc'));
    }
    bind(['rex2a'].concat(rg),render);
    document.querySelectorAll('[data-rex2]').forEach(b=>b.addEventListener('click',()=>{
      const v=b.dataset.rex2.split(',').map(Number);
      setRange('rex2wxh',v[0]);setRange('rex2whh',v[1]);setRange('rex2why',v[2]);
      render();
    }));
    render();
  })();

  // ================= Örnek 3: tek BPTT adımı =================
  (function(){
    if(!$('rex3'))return;
    const Wxh=2,Why=3,xs=[1,0,0];
    let steps=0;
    function fwd(whh){
      const h=[0];xs.forEach(x=>h.push(Math.tanh(Wxh*x+whh*h[h.length-1])));
      const p=sig(Why*h[3]);return {h,p,L:-Math.log(p)};
    }
    function grads(whh){
      const r=fwd(whh),h=r.h;
      const dzy=r.p-1,dh3=dzy*Why;
      const d3=dh3*(1-h[3]*h[3]),d2=d3*whh*(1-h[2]*h[2]),d1=d2*whh*(1-h[1]*h[1]);
      const c3=d3*h[2],c2=d2*h[1],c1=d1*h[0];
      return Object.assign(r,{dzy,dh3,d3,d2,d1,c3,c2,c1,g:c3+c2+c1});
    }
    function render(){
      const whh=parseFloat($('rex3whh').value),al=parseFloat($('rex3al').value);
      lab('rex3whh',whh,3);lab('rex3al',al,2);
      const r=grads(whh),h=r.h;
      const nw=whh-al*r.g,nr=fwd(nw);
      $('rex3fig').innerHTML=svg('rx3',{
        words:['kedi','ve','___'],xs:['+1','0','0'],whh:f(whh,3),wxh:'2',why:'3',
        h:[1,2,3].map(i=>f(h[i],3)),
        outLab:'p = '+f(r.p,3),outSub:'ağın tahmini (miyav)',outGood:r.p>=0.7,loss:'L = −ln p = '+f(r.L,3)});
      $('rex3calc').innerHTML='\\[\\begin{aligned}'+
        '\\text{1) çıkış:}\\quad&\\tfrac{\\partial L}{\\partial z_y}=p-y='+t(r.p,3)+'-1=\\mathbf{'+t(r.dzy,3)+'}\\\\'+
        '\\text{2) }h_3\\text{\'e:}\\quad&\\tfrac{\\partial L}{\\partial h_3}='+tp(r.dzy,3)+'\\cdot 3=\\mathbf{'+t(r.dh3,3)+'}\\\\'+
        '\\text{3) }z_3\\text{\'e:}\\quad&\\delta_3='+tp(r.dh3,3)+'\\cdot'+t(1-h[3]*h[3],3)+'=\\mathbf{'+t(r.d3,3)+'}\\\\'+
        '\\text{4) }W_{hh}\\,(t{=}3):\\quad&\\delta_3\\cdot h_2='+tp(r.d3,3)+'\\cdot'+t(h[2],3)+'=\\mathbf{'+t(r.c3,3)+'}\\\\'+
        '\\text{5) bir adım geri:}\\quad&\\delta_2='+tp(r.d3,3)+'\\cdot'+t(whh,3)+'\\cdot'+t(1-h[2]*h[2],3)+'=\\mathbf{'+t(r.d2,3)+'}\\\\'+
        '&W_{hh}\\,(t{=}2):\\ \\delta_2\\cdot h_1='+tp(r.d2,3)+'\\cdot'+t(h[1],3)+'=\\mathbf{'+t(r.c2,3)+'}\\\\'+
        '\\text{6) }t=1:\\quad&\\delta_1='+tp(r.d2,3)+'\\cdot'+t(whh,3)+'\\cdot'+t(1-h[1]*h[1],3)+'='+t(r.d1,4)+'\\\\'+
        '&W_{hh}\\,(t{=}1):\\ \\delta_1\\cdot h_0=\\mathbf{0}\\quad(h_0=0)'+
        '\\end{aligned}\\]'+
        '\\[\\frac{\\partial L}{\\partial W_{hh}}='+tp(r.c3,3)+'+'+tp(r.c2,3)+'+0=\\mathbf{'+t(r.g,3)+'}\\]'+
        '\\[\\begin{aligned}W_{hh}&\\leftarrow '+t(whh,3)+'-\\underbrace{'+t(al,2)+'}_{\\alpha}\\cdot'+tp(r.g,3)+'=\\mathbf{'+t(nw,3)+'}\\\\ p&:\\ '+t(r.p,3)+'\\to\\mathbf{'+t(nr.p,3)+'}\\qquad L:\\ '+t(r.L,3)+'\\to '+t(nr.L,3)+'\\end{aligned}\\]';
      $('rex3steps').textContent=steps;
      $('rex3msg').innerHTML=r.g<0?'Gradyan <b>eksi</b> → W<sub>hh</sub>\'ı <b>büyüt</b> (hafızayı güçlendir). δ<sub>1</sub> ≈ '+f(r.d1,4)+', δ<sub>3</sub> ≈ '+f(r.d3,3)+': sinyal geri giderken '+(Math.abs(r.d3/(r.d1||1e-9))>20?'yaklaşık '+Math.round(Math.abs(r.d3/(r.d1||1e-9)))+' kat ':'')+'sönüyor.'
        :'Gradyan ≈ 0 ya da pozitif → bu ayarda W<sub>hh</sub>\'ı büyütmek p\'yi artırmıyor.';
      tx($('rex3calc'));
    }
    $('rex3whh').addEventListener('input',render);
    $('rex3al').addEventListener('input',render);
    $('rex3step').addEventListener('click',()=>{
      const whh=parseFloat($('rex3whh').value),al=parseFloat($('rex3al').value);
      const nw=whh-al*grads(whh).g;
      $('rex3whh').value=Math.max(parseFloat($('rex3whh').min),Math.min(parseFloat($('rex3whh').max),nw));
      steps++;render();
    });
    $('rex3reset').addEventListener('click',()=>{$('rex3whh').value=0.2;steps=0;render();});
    render();
  })();
})();

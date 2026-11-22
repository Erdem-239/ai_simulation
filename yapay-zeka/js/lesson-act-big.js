// Aktivasyon Fonksiyonları — "6️⃣ Bütün Resim": tek nöron (x,w,b → z → a=f(z) → L) ileri yolu + geri yayılım ağacı + pop-up'lar.
// Fonksiyonu seç (σ / tanh / ReLU / Leaky), girdileri değiştir: geri yoldaki f′(z) çarpanının gradyanı nasıl ezdiğini canlı gör.
(function(){
  const host=document.getElementById('actBigMap'); if(!host) return;
  const $=id=>document.getElementById(id);
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>v<0?'('+t(v,d)+')':t(v,d);
  const setT=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
  const FN={
    sigmoid:{n:'σ(z)',fn:z=>1/(1+Math.exp(-z)),df:(a,z)=>a*(1-a),tex:'\\sigma(z)',dtex:'\\sigma(z)\\,(1-\\sigma(z))'},
    tanh:{n:'tanh(z)',fn:Math.tanh,df:(a,z)=>1-a*a,tex:'\\tanh(z)',dtex:'1-\\tanh^2(z)'},
    relu:{n:'ReLU(z)',fn:z=>Math.max(0,z),df:(a,z)=>z>0?1:0,tex:'\\max(0,z)',dtex:'\\begin{cases}1&z>0\\\\0&z\\le0\\end{cases}'},
    leaky:{n:'LeakyReLU(z)',fn:z=>z>0?z:0.01*z,df:(a,z)=>z>0?1:0.01,tex:'\\max(0.01z,z)',dtex:'\\begin{cases}1&z>0\\\\0{,}01&z\\le0\\end{cases}'}
  };
  let cur='sigmoid';
  const E=(cls,key,tex)=>'<span class="xt-edge '+cls+'" data-pop="'+key+'" tabindex="0" role="button" aria-label="türetmeyi göster">\\( '+tex+' \\)</span><span class="xt-ar">→</span>';
  const B=(cls,id,sym,cap)=>'<div class="xt-box '+cls+'" id="ab_'+id+'">'+sym+(cap?'<span class="xt-cap">'+cap+'</span>':'')+'<span class="xt-val" id="ab_'+id+'v">—</span></div>';
  const LF=(cls,id,sym)=>'<div class="xt-box '+cls+' yaprak" id="ab_'+id+'">'+sym+'<span class="xt-val" id="ab_'+id+'v">—</span></div>';
  const kid=(e,c)=>'<div class="xt-kid">'+e+c+'</div>';
  const node=(b,k)=>'<div class="xt-node">'+b+(k?'<div class="xt-kids">'+k+'</div>':'')+'</div>';
  const fbox=(cls,id,sym)=>'<div class="xf-box '+cls+'" id="af_'+id+'">'+sym+'<span class="xf-val" id="af_'+id+'v">—</span></div>';
  const fkol=(inner,ad)=>'<div class="xf-kol">'+inner+'<div class="xf-kolad">'+ad+'</div></div>';
  const fok=(key,tex)=>'<div class="xf-ok"><span class="xf-chip" data-pop="'+key+'" tabindex="0" role="button" aria-label="bu adımı anlat">\\( '+tex+' \\)</span><span class="xf-ar">→</span></div>';
  function srcEl(id){let e=document.getElementById('xtsrc-'+id);if(!e){e=document.createElement('div');e.className='xt-src';e.id='xtsrc-'+id;($('actSrc')||document.body).appendChild(e);}return e;}
  function src(id,title,eq,num,say){srcEl(id).innerHTML='<div class="xp-bas">'+title+'</div><div class="eq">\\( '+eq+' \\)</div>'+(num?'<div class="xp-hes">\\( '+num+' \\)</div>':'')+'<div class="xp-sat">'+say+'</div>';}

  host.innerHTML=
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px" id="abFn">'+Object.keys(FN).map(k=>'<button class="addbtn" data-k="'+k+'" style="background:var(--panel);color:var(--text);border:1px solid var(--line)">'+FN[k].n+'</button>').join('')+'</div>'+
    '<div class="ptrow" style="margin-bottom:8px"><div class="ptcell"><label>x (girdi)</label><input id="ab_x" type="number" step="0.1" value="1"></div><div class="ptcell"><label>w (ağırlık)</label><input id="ab_w" type="number" step="0.1" value="2"></div><div class="ptcell"><label>b (bias)</label><input id="ab_b" type="number" step="0.1" value="1"></div><div class="ptcell"><label>y (hedef)</label><input id="ab_y" type="number" step="0.1" value="0"></div></div>'+
    '<div class="xf-baslik">▶ İLERİ YOL — bir nöron <span>(girdi → ham toplam z → aktivasyon → kayıp)</span></div><div class="xf-scroll"><div class="xf-akis">'+
      fkol(fbox('gi','x','x')+fbox('gi','w','w')+fbox('gi','b','b'),'girdiler')+fok('ab_z','w x{+}b')+fkol(fbox('gh','z','z'),'ham skor')+fok('ab_a','f(z)')+fkol(fbox('gy','a','a=f(z)'),'çıktı')+fok('ab_L','\\tfrac12(a-y)^2')+fkol(fbox('gl','L','L'),'kayıp')+
    '</div></div>'+
    '<div class="xf-baslik" style="margin-top:8px">◀ GERİ YOL — kayıptan w ve b\'ye <span>(her ok bir türev; <b>f′(z)</b> kutusuna dikkat)</span></div><div class="xt-scroll"><div class="xt-tree">'+
      node(B('g1 kok','L','L','kayıp'),
        kid(E('g1','ab_La','\\tfrac{\\partial L}{\\partial a}=a-y'),
          node(B('g1','a','a','∂L/∂a'),
            kid(E('g3','ab_az','\\tfrac{\\partial a}{\\partial z}=f\'(z)'),
              node(B('g3','z','z','δ = ∂L/∂z'),
                kid(E('g2','ab_zw','\\tfrac{\\partial z}{\\partial w}=x'),LF('g2','dw','dw'))+
                kid(E('g4','ab_zb','\\tfrac{\\partial z}{\\partial b}=1'),LF('g4','db','db'))))))) +
    '</div></div><div class="callout" id="abVerdict" style="margin-top:8px"></div>';
  host.querySelectorAll('#abFn button').forEach(bt=>bt.onclick=()=>{cur=bt.dataset.k;fill();});
  ['ab_x','ab_w','ab_b','ab_y'].forEach(id=>$(id).addEventListener('input',fill));

  function fill(){
    host.querySelectorAll('#abFn button').forEach(bt=>{const on=bt.dataset.k===cur;bt.style.background=on?'var(--blue)':'var(--panel)';bt.style.color=on?'#fff':'var(--text)';});
    const G=FN[cur],x=parseFloat($('ab_x').value)||0,w=parseFloat($('ab_w').value)||0,b=parseFloat($('ab_b').value)||0,y=parseFloat($('ab_y').value)||0;
    const z=w*x+b,a=G.fn(z),L=0.5*(a-y)*(a-y),da=a-y,dfz=G.df(a,z),dz=da*dfz,dw=dz*x,db=dz;
    setT('af_xv',f(x,2));setT('af_wv',f(w,2));setT('af_bv',f(b,2));setT('af_zv',f(z,3));setT('af_av',f(a,3));setT('af_Lv',f(L,4));
    setT('ab_Lv',f(L,4));setT('ab_av',f(da,3));setT('ab_zv',f(dz,4));setT('ab_dwv',f(dw,4));setT('ab_dbv',f(db,4));
    src('ab_z','z — ham skor','z=wx+b','z='+tp(w,2)+'\\cdot'+tp(x,2)+'+'+tp(b,2)+'=\\mathbf{'+t(z,3)+'}','💬 Lineer regresyondaki Θ₁x+Θ₀\'ın aynısı: girdiyle ağırlık çarpılıp bias eklenir.');
    src('ab_a','a — aktivasyon','a=f(z)='+G.tex,'a='+G.tex.replace(/z/g,tp(z,3))+'=\\mathbf{'+t(a,3)+'}','💬 Seçili fonksiyon (<b>'+G.n+'</b>) ham z\'yi nöronun çıktısına çevirir. Şimdi z='+f(z,3)+' → a='+f(a,3)+'.');
    src('ab_L','L — kayıp','L=\\tfrac12(a-y)^2','L=\\tfrac12('+tp(a,3)+'-'+tp(y,2)+')^2=\\mathbf{'+t(L,4)+'}','💬 Çıktı hedeften ne kadar uzak? Geri yayılım buradan başlar.');
    src('ab_La','∂L/∂a','\\tfrac{\\partial L}{\\partial a}=a-y','\\tfrac{\\partial L}{\\partial a}='+tp(a,3)+'-'+tp(y,2)+'=\\mathbf{'+t(da,3)+'}','💬 Çıktı hedefin '+(da>0?'üstünde → a\'yı küçültmek':da<0?'altında → a\'yı büyütmek':'tam üstünde')+' kaybı düşürür.');
    src('ab_az','∂a/∂z = f′(z) — aktivasyonun türevi','\\tfrac{\\partial a}{\\partial z}=f\'(z)='+G.dtex,'f\'(z)='+t(dfz,4)+'\\ \\Rightarrow\\ \\delta='+tp(da,3)+'\\cdot'+t(dfz,4)+'=\\mathbf{'+t(dz,4)+'}',
      '💬 <b>Bu çarpan sinyalin ne kadarının geçtiğini söyler:</b> '+f(dfz,4)+' → gelen sinyalin <b>%'+(dfz*100).toFixed(dfz<0.1?1:0).replace('.',',')+'\'i</b> geçiyor. '+(cur==='sigmoid'?'Sigmoid\'te bu en fazla 0,25; z büyük/küçükse (doyma) sıfıra yaklaşır.':cur==='tanh'?'tanh\'ta en fazla 1 (z=0), doyunca sıfıra yaklaşır.':cur==='relu'?'ReLU\'da z>0 iken tam 1, z≤0 iken tam 0: nöron "ölü".':'Leaky ReLU\'da z≤0 iken bile 0,01 kalır: nöron ölmez.'));
    src('ab_zw','∂z/∂w','\\tfrac{\\partial z}{\\partial w}=x','dw=\\delta\\cdot x='+tp(dz,4)+'\\cdot'+tp(x,2)+'=\\mathbf{'+t(dw,4)+'}','💬 Ağırlığın gradyanı = gelen δ × o ağırlığın girdisi (x).');
    src('ab_zb','∂z/∂b','\\tfrac{\\partial z}{\\partial b}=1','db=\\delta\\cdot1=\\mathbf{'+t(db,4)+'}','💬 Bias her zaman 1 ile çarpılır; gradyanı doğrudan δ.');
    $('abVerdict').innerHTML='🔑 Seçili <b>'+G.n+'</b>, z = <b>'+f(z,3)+'</b> noktasında: f′(z) = <b>'+f(dfz,4)+'</b>. '+(dfz<0.05?'Çarpan çok küçük — gradyan neredeyse <b>tamamen söndü</b> (w ve b hemen hiç öğrenemiyor). '+(cur==='relu'&&z<=0?'ReLU\'da bu "ölü nöron": z negatif kaldıkça gradyan tam 0.':'Bu, doymuş/sönmüş bölge.'):'Gradyan sağlıklı akıyor.')+' z\'yi değiştirmek için w ya da b\'yi oynat.';
    window.__actBig={z,a,dfz,dw,db};
  }
  const M=window.MathJax;fill();
  if(M&&M.startup&&M.startup.promise)M.startup.promise.then(()=>M.typesetPromise&&M.typesetPromise([host]).catch(()=>{}));
})();

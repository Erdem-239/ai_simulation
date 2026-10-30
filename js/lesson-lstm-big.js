// LSTM — "6️⃣ Bütün Resim": tek bir hücre adımının ileri yolu (xf-*) + geri yayılım ağacı (xt-*) + türetme pop-up'ları.
// Girdiler, hedef ve 12 ağırlık Simülasyon'daki kaydırıcılardan (lv_x, lv_hp, lv_cp, lv_y, lv_W/U/b{f,i,c,o}).
// Geri yol kökü kayıp L = ½(h − y)² (Simülasyon ile aynı); app.js drawPipe her çizimde window.__lstmBigRender'ı çağırır.
(function(){
  const host=document.getElementById('lstmBigMap'); if(!host) return;
  const $=id=>document.getElementById(id);
  const sig=z=>1/(1+Math.exp(-z));
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>v<0?'('+t(v,d)+')':t(v,d);
  let W={};
  const NAME={f:'f',i:'i',c:'c̃',o:'o'};

  // ---------- HTML ----------
  const E=(cls,key,tex)=>'<span class="xt-edge '+cls+'" data-pop="'+key+'" tabindex="0" role="button" aria-label="türetmeyi göster">\\( '+tex+' \\)</span><span class="xt-ar">→</span>';
  const B=(cls,id,sym,cap)=>'<div class="xt-box '+cls+'" id="lb_'+id+'">\\( '+sym+' \\)<span class="xt-cap">'+cap+'</span><span class="xt-val" id="lb_'+id+'v">—</span></div>';
  const LF=(cls,id,sym)=>'<div class="xt-box '+cls+' yaprak" id="lb_'+id+'">'+sym+'<span class="xt-val" id="lb_'+id+'v">—</span></div>';
  const kid=(e,c)=>'<div class="xt-kid">'+e+c+'</div>';
  const node=(b,k)=>'<div class="xt-node">'+b+(k?'<div class="xt-kids">'+k+'</div>':'')+'</div>';
  const fbox=(cls,id,sym,cap)=>'<div class="xf-box '+cls+'" id="lf_'+id+'">'+sym+'<span class="xf-val" id="lf_'+id+'v">—</span>'+(cap?'<span class="xf-cap">'+cap+'</span>':'')+'</div>';
  const fkol=(inner,ad)=>'<div class="xf-kol">'+inner+'<div class="xf-kolad">'+ad+'</div></div>';
  const fok=(key,tex)=>'<div class="xf-ok"><span class="xf-chip" data-pop="'+key+'" tabindex="0" role="button" aria-label="bu adımı anlat">\\( '+tex+' \\)</span><span class="xf-ar">→</span></div>';

  function gateBranch(g,cls,edgeKey,edgeTex,sym,cap){
    const n=NAME[g], act=g==='c'?'1-\\tilde c^2':(g+'(1-'+g+')');
    const zs='z_'+g;
    const leaves=
      kid(E(cls,'l_'+g+'W','\\tfrac{\\partial '+zs+'}{\\partial W_'+g+'}=x'),LF(cls,'W'+g,'dW<sub>'+n+'</sub>'))+
      kid(E(cls,'l_'+g+'U','\\tfrac{\\partial '+zs+'}{\\partial U_'+g+'}=h_{t-1}'),LF(cls,'U'+g,'dU<sub>'+n+'</sub>'))+
      kid(E(cls,'l_'+g+'b','\\tfrac{\\partial '+zs+'}{\\partial b_'+g+'}=1'),LF(cls,'b'+g,'db<sub>'+n+'</sub>'));
    const zbox=node(B(cls,'z'+g,zs,'δ'),leaves);
    const gbox=node(B(cls,g==='c'?'g':g,g==='c'?'\\tilde c':g,cap),
      kid(E(cls,'l_'+g+'z','\\tfrac{\\partial '+(g==='c'?'\\tilde c':g)+'}{\\partial '+zs+'}='+(g==='c'?'1-\\tilde c^2':g+'(1-'+g+')')),zbox));
    return kid(E(cls,edgeKey,edgeTex),gbox);
  }

  function build(){
    // ileri yol
    let o='<div class="xf-baslik">▶ İLERİ YOL — girdilerden h\'ye ve kayba <span>(tek hücre adımı; sayılar Simülasyon\'daki kaydırıcılardan)</span></div><div class="xf-scroll"><div class="xf-akis">';
    o+=fkol(fbox('gi','x','x')+fbox('gh','h0','h₋₁')+fbox('gc','c0','c₋₁'),'girdiler');
    o+=fok('l_z','Wx{+}Uh_{t-1}{+}b')+fkol(fbox('gh','zf','z<sub>f</sub>')+fbox('gh','zi','z<sub>i</sub>')+fbox('gh','zc','z<sub>c̃</sub>')+fbox('gh','zo','z<sub>o</sub>'),'dört ham toplam');
    o+=fok('l_g','\\sigma\\,/\\,\\tanh')+fkol(fbox('gy','f','f')+fbox('gy','i','i')+fbox('gy','g','c̃')+fbox('gy','o','o'),'kapılar ve aday');
    o+=fok('l_c','f c_{t-1}{+}i\\tilde c')+fkol(fbox('gc','c','c'),'yeni hafıza (cell state)');
    o+=fok('l_tc','\\tanh')+fkol(fbox('gh','tc','tanh c'),'sıkıştırılmış');
    o+=fok('l_h','o\\cdot')+fkol(fbox('gl','h','h'),'çıktı');
    o+=fok('l_L','\\tfrac12(h-y)^2')+fkol(fbox('gl','L','L')+fbox('gc','y','y'),'kayıp (hedef y)');
    o+='</div></div>';
    // geri yol
    const dc=
      gateBranch('f','g3','l_cf','\\tfrac{\\partial c}{\\partial f}=c_{t-1}','f','unutma')+
      kid(E('g2','l_cc','\\tfrac{\\partial c}{\\partial c_{t-1}}=f'),LF('g2','cp','∂L/∂c<sub>t−1</sub> ← gradyan otobanı'))+
      gateBranch('i','g4','l_ci','\\tfrac{\\partial c}{\\partial i}=\\tilde c','i','giriş')+
      gateBranch('c','g4','l_cg','\\tfrac{\\partial c}{\\partial \\tilde c}=i','\\tilde c','aday');
    const root=node(B('g1 kok','L','L','kayıp'),kid(E('g1','l_Lh','\\tfrac{\\partial L}{\\partial h}=h-y'),node(B('g1','h','h','δ<sub>h</sub>'),
      gateBranch('o','g1','l_ho','\\tfrac{\\partial h}{\\partial o}=\\tanh c','o','çıkış')+
      kid(E('g2','l_hc','\\tfrac{\\partial h}{\\partial c}=o(1-\\tanh^2 c)'),node(B('g2','c','c','δ<sub>c</sub>'),dc)))));
    o+='<div class="xf-baslik" style="margin-top:8px">◀ GERİ YOL — kayıptan 12 ağırlığa <span>(her ok bir türev; üstüne gel → nasıl bulunduğu)</span></div><div class="xt-scroll"><div class="xt-tree">'+root+'</div></div>';
    host.innerHTML=o;
  }

  // ---------- pop-up kaynakları ----------
  function srcEl(id){let e=document.getElementById('xtsrc-'+id);if(!e){e=document.createElement('div');e.className='xt-src';e.id='xtsrc-'+id;(document.getElementById('lstmSrc')||document.body).appendChild(e);}return e;}
  function src(id,title,eq,num,say){srcEl(id).innerHTML='<div class="xp-bas">'+title+'</div><div class="eq">\\( '+eq+' \\)</div>'+(num?'<div class="xp-hes">\\( '+num+' \\)</div>':'')+'<div class="xp-sat">'+say+'</div>';}
  const setT=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
  const KEY=['f','i','c','o'];

  function model(){
    const rv=id=>parseFloat($(id).value);
    const x=rv('lv_x'),h0=rv('lv_hp'),c0=rv('lv_cp'),y=rv('lv_y');
    KEY.forEach(g=>{W[g]=[rv('lv_W'+g),rv('lv_U'+g),rv('lv_b'+g)];});
    const z={},a={};
    KEY.forEach(g=>{z[g]=W[g][0]*x+W[g][1]*h0+W[g][2];});
    a.f=sig(z.f);a.i=sig(z.i);a.c=Math.tanh(z.c);a.o=sig(z.o);
    const c=a.f*c0+a.i*a.c,tc=Math.tanh(c),h=a.o*tc;
    // geri
    const dh=h-y,L=0.5*dh*dh,dc=dh*a.o*(1-tc*tc),dO=dh*tc;
    const da={f:dc*c0,i:dc*a.c,c:dc*a.i,o:dO};
    const dz={f:da.f*a.f*(1-a.f),i:da.i*a.i*(1-a.i),c:da.c*(1-a.c*a.c),o:da.o*a.o*(1-a.o)};
    return {x,h0,c0,y,z,a,c,tc,h,dh,L,dc,dO,da,dz,dcp:dc*a.f};
  }

  function fill(){
    const M=model(),{x,h0,c0,z,a,c,tc,h,dc,da,dz}=M;
    // ileri değerler
    setT('lf_xv',f(x,2));setT('lf_h0v',f(h0,2));setT('lf_c0v',f(c0,2));
    KEY.forEach(g=>setT('lf_z'+g+'v',f(z[g],3)));
    setT('lf_fv',f(a.f,3));setT('lf_iv',f(a.i,3));setT('lf_gv',f(a.c,3));setT('lf_ov',f(a.o,3));
    setT('lf_cv',f(c,3));setT('lf_tcv',f(tc,3));setT('lf_hv',f(h,3));setT('lf_Lv',f(M.L,4));setT('lf_yv',f(M.y,2));
    // geri değerler
    setT('lb_Lv',f(M.L,4));setT('lb_hv',f(M.dh,3));setT('lb_cv',f(dc,3));
    KEY.forEach(g=>{
      setT('lb_'+(g==='c'?'g':g)+'v',f(da[g],3));setT('lb_z'+g+'v',f(dz[g],4));
      setT('lb_W'+g+'v',f(dz[g]*x,4));setT('lb_U'+g+'v',f(dz[g]*h0,4));setT('lb_b'+g+'v',f(dz[g],4));
    });
    setT('lb_cpv',f(M.dcp,3));
    // ----- ileri pop-up'lar -----
    const zline=g=>'z_'+g+'='+t(W[g][0],1)+'\\cdot'+tp(x,2)+'+'+t(W[g][1],1)+'\\cdot'+tp(h0,2)+(W[g][2]?'+'+t(W[g][2],1):'')+'=\\mathbf{'+t(z[g],3)+'}';
    src('l_z','z — dört ham toplam','z_k=W_kx+U_kh_{t-1}+b_k\\quad(k=f,i,\\tilde c,o)','\\begin{aligned}'+KEY.map(g=>zline(g)).join('\\\\')+'\\end{aligned}',
      '💬 Dört kapı/aday <b>aynı girdilere</b> (x ve h₋₁) bakar ama her birinin <b>kendi ağırlıkları</b> var — bu yüzden dört farklı karar çıkar.');
    src('l_g','σ / tanh — kapılar ve aday','f=\\sigma(z_f),\\ i=\\sigma(z_i),\\ o=\\sigma(z_o),\\ \\tilde c=\\tanh(z_c)',
      '\\begin{aligned}f&=\\sigma('+tp(z.f,3)+')=\\mathbf{'+t(a.f,3)+'}\\\\ i&=\\mathbf{'+t(a.i,3)+'}\\\\ \\tilde c&=\\tanh('+tp(z.c,3)+')=\\mathbf{'+t(a.c,3)+'}\\\\ o&=\\mathbf{'+t(a.o,3)+'}\\end{aligned}',
      '💬 Kapılar <b>sigmoid</b>: 0–1 arası "yüzde kaçı geçsin". Aday <b>tanh</b>: −1…+1 arası "ne yazılsın". Şu an eski hafızanın <b>%'+Math.round(a.f*100)+'\'i kalıyor</b>, yeninin %'+Math.round(a.i*100)+'\'i giriyor.');
    src('l_c','c — yeni hafıza','c_t=f\\,c_{t-1}+i\\,\\tilde c','c='+tp(a.f,3)+'\\cdot'+tp(c0,2)+'+'+tp(a.i,3)+'\\cdot'+tp(a.c,3)+'='+t(a.f*c0,3)+'+'+tp(a.i*a.c,3)+'=\\mathbf{'+t(c,3)+'}',
      '💬 <b>Çarpma yok, W yok:</b> eski hafıza yalnızca f ile ölçeklenip yeni içerikle <b>toplanıyor</b>. Gradyanı kurtaran bu toplama (aşağıdaki geri yolda ∂c/∂c₋₁ = f).');
    src('l_tc','tanh c','\\tanh(c_t)','\\tanh('+tp(c,3)+')=\\mathbf{'+t(tc,3)+'}','💬 Hafıza değeri çıktıya çıkmadan önce yeniden −1…+1 aralığına sıkıştırılır.');
    src('l_L','L — kayıp','L=\\tfrac12(h-y)^2','L=\\tfrac12('+tp(h,3)+'-'+tp(M.y,2)+')^2=\\mathbf{'+t(M.L,4)+'}','💬 Hedef y Simülasyon\'daki kaydırıcıdan. Geri yayılım buradan başlar.');
    src('l_Lh','∂L/∂h = h − y','\\tfrac{\\partial L}{\\partial h}=h-y','\\delta_h='+tp(h,3)+'-'+tp(M.y,2)+'=\\mathbf{'+t(M.dh,3)+'}','💬 '+(M.dh>0?'h hedefin üstünde → küçülmeli':M.dh<0?'h hedefin altında → büyümeli':'h tam hedefte')+'. Ağaçtaki her sayı bu sinyalin zincir kuralıyla taşınmış hâli.');
    src('l_h','h — çıktı','h_t=o\\cdot\\tanh(c_t)','h='+tp(a.o,3)+'\\cdot'+tp(tc,3)+'=\\mathbf{'+t(h,3)+'}','💬 Çıkış kapısı o, hafızanın <b>ne kadarının dışarı söyleneceğini</b> belirler (%'+Math.round(a.o*100)+'). Bu h hem üst katmana hem sonraki adıma gider.');
    // ----- geri pop-up'lar -----
    src('l_ho','∂h/∂o','\\tfrac{\\partial h}{\\partial o}=\\tanh c','\\tfrac{\\partial L}{\\partial o}=\\delta_h\\cdot\\tanh c='+tp(M.dh,3)+'\\cdot'+tp(tc,3)+'=\\mathbf{'+t(M.dO,3)+'}','💬 h = o·tanh(c) olduğundan, o\'nun katsayısı tanh(c). Hafıza büyükse çıkış kapısı çok etkili.');
    src('l_hc','∂h/∂c','\\tfrac{\\partial h}{\\partial c}=o(1-\\tanh^2 c)','\\delta_c=\\delta_h\\cdot o(1-\\tanh^2c)='+tp(M.dh,3)+'\\cdot'+t(a.o,3)+'\\cdot'+t(1-tc*tc,3)+'=\\mathbf{'+t(dc,3)+'}','💬 c, h\'ye önce tanh\'tan sonra o ile çarparak ulaşır: tanh\'ın eğimi (1−tanh²c) ve çıkış kapısı. Bundan sonraki <b>her</b> dalın ortak başlangıç sinyali δ<sub>c</sub> = '+f(dc,3)+'.');
    src('l_cf','∂c/∂f','\\tfrac{\\partial c}{\\partial f}=c_{t-1}','\\tfrac{\\partial L}{\\partial f}='+tp(dc,3)+'\\cdot'+tp(c0,2)+'=\\mathbf{'+t(da.f,3)+'}','💬 f eski hafızayı ölçeklediği için türevi <b>eski hafızanın kendisi</b>: büyük hafıza → f\'ye çok duyarlı.');
    src('l_cc','∂c/∂c₋₁ = f — gradyan otobanı','\\tfrac{\\partial c_t}{\\partial c_{t-1}}=f','\\tfrac{\\partial L}{\\partial c_{t-1}}='+tp(dc,3)+'\\cdot'+tp(a.f,3)+'=\\mathbf{'+t(M.dcp,3)+'}',
      '💬 <b>LSTM\'in bütün sırrı.</b> Sinyal geçmişe giderken çarpılan sayı bir W·tanh\' değil, <b>öğrenilebilir kapı f</b> ('+f(a.f,3)+'). Ağ onu 1\'e yaklaştırırsa sinyal 20 adım sonra bile ölmez; RNN\'de bu çarpan her adımda kaderine terk edilmişti.');
    src('l_ci','∂c/∂i','\\tfrac{\\partial c}{\\partial i}=\\tilde c','\\tfrac{\\partial L}{\\partial i}='+tp(dc,3)+'\\cdot'+tp(a.c,3)+'=\\mathbf{'+t(da.i,3)+'}','💬 i yeni içeriği ölçeklediği için türevi <b>yeni içeriğin kendisi</b> (c̃).');
    src('l_cg','∂c/∂c̃','\\tfrac{\\partial c}{\\partial \\tilde c}=i','\\tfrac{\\partial L}{\\partial \\tilde c}='+tp(dc,3)+'\\cdot'+tp(a.i,3)+'=\\mathbf{'+t(da.c,3)+'}','💬 Aday içeriğin katsayısı giriş kapısı i: kapı kapalıysa (i≈0) aday içerik hiç öğrenemez.');
    KEY.forEach(g=>{
      const A=g==='c'?'\\tilde c':g, zs='z_'+g, n=NAME[g];
      const act=g==='c'?'1-\\tilde c^2':g+'(1-'+g+')';
      const slope=g==='c'?1-a.c*a.c:a[g]*(1-a[g]);
      src('l_'+g+'z','∂'+n+'/∂z_'+n,'\\tfrac{\\partial '+A+'}{\\partial '+zs+'}='+act,
        '\\delta_{'+g+'}='+tp(da[g],3)+'\\cdot'+t(slope,3)+'=\\mathbf{'+t(dz[g],4)+'}',
        '💬 '+(g==='c'?'tanh':'sigmoid')+'\'in eğimi ('+f(slope,3)+') gelen sinyalle çarpılıp bu birimin ham toplamına (z) ulaşan <b>δ</b> bulunur.'+(g!=='c'?' Sigmoid eğimi en çok 0,25 olabilir — kapılar doyunca öğrenme yavaşlar.':''));
      src('l_'+g+'W','∂z/∂W_'+n,'\\tfrac{\\partial '+zs+'}{\\partial W_'+g+'}=x','dW_'+g+'=\\delta\\cdot x='+tp(dz[g],4)+'\\cdot'+tp(x,2)+'=\\mathbf{'+t(dz[g]*x,4)+'}','💬 Girdi ağırlığının gradyanı = gelen δ × girdi (x).');
      src('l_'+g+'U','∂z/∂U_'+n,'\\tfrac{\\partial '+zs+'}{\\partial U_'+g+'}=h_{t-1}','dU_'+g+'=\\delta\\cdot h_{t-1}='+tp(dz[g],4)+'\\cdot'+tp(h0,2)+'=\\mathbf{'+t(dz[g]*h0,4)+'}','💬 Geri-besleme ağırlığının gradyanı = δ × önceki çıktı (h₋₁).');
      src('l_'+g+'b','∂z/∂b_'+n,'\\tfrac{\\partial '+zs+'}{\\partial b_'+g+'}=1','db_'+g+'=\\delta\\cdot1=\\mathbf{'+t(dz[g],4)+'}','💬 Bias her zaman 1 ile çarpıldığı için gradyanı doğrudan δ\'nın kendisi.');
    });
    const sum=$('lstmBigSum');
    if(sum){
      sum.innerHTML='<div style="font-size:12.5px; color:#ccd5e8; line-height:1.7">12 yaprağın hepsi: <b>gradyan = δ<sub>birim</sub> × girdi</b> (W için x, U için h₋₁, b için 1). Ve geçmişe giden yol: <b>∂L/∂c₋₁ = δ<sub>c</sub>·f = '+f(dc,3)+' × '+f(a.f,3)+' = '+f(M.dcp,3)+'</b> — tek bir çarpım, W yok.</div>';
    }
    // pop-up'ın MathJax'ı açılırken lesson-linreg.js'te typeset ediliyor
  }

  build();
  window.__lstmBigRender=fill;
  fill();
  // başlangıç typeset'i (MathJax yüklenince)
  const M=window.MathJax; if(M&&M.startup&&M.startup.promise){M.startup.promise.then(()=>M.typesetPromise&&M.typesetPromise([host]).catch(()=>{}));}
})();

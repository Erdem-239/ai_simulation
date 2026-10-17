// GPT Test — "Bütün Resim": bir eğitim adımı. Pencere (4 karakter) → E tablosundan kartlar → ara katman (tanh) → 7 skor → softmax → L = −ln p(doğru).
// Geri yol: L → z (p − y) → {W_o, b_o, h → u → {W_h, b_h, x → E tablosu (yalnız penceredeki karakterlerin satırları)}}. Python |sonlu fark| ≈ 2e-10; JS = Python.
(function(){
  const host=document.getElementById('gtBigMap'); if(!host||!window.GPTTiny) return;
  const T=window.GPTTiny,$=id=>document.getElementById(id),V=T.V,N=T.N,D=T.D,H=T.H,NV=T.NV;
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>v<0?'('+t(v,d)+')':t(v,d);
  const setH=(id,h)=>{const e=$(id);if(e)e.innerHTML=h;};
  const E=(cls,key,tex)=>'<span class="xt-edge '+cls+'" data-pop="'+key+'" tabindex="0" role="button" aria-label="türetmeyi göster">\\( '+tex+' \\)</span><span class="xt-ar">→</span>';
  const B=(cls,id,sym,cap)=>'<div class="xt-box '+cls+'" id="gb_'+id+'">'+sym+(cap?'<span class="xt-cap">'+cap+'</span>':'')+'<span class="xt-val" id="gb_'+id+'v">—</span></div>';
  const LF=(cls,id,sym)=>'<div class="xt-box '+cls+' yaprak" id="gb_'+id+'">'+sym+'<span class="xt-val" id="gb_'+id+'v">—</span></div>';
  const kid=(e,c)=>'<div class="xt-kid">'+e+c+'</div>';
  const node=(b,k)=>'<div class="xt-node">'+b+(k?'<div class="xt-kids">'+k+'</div>':'')+'</div>';
  const fbox=(cls,id,sym)=>'<div class="xf-box '+cls+'" id="gf_'+id+'">'+sym+'<span class="xf-val" id="gf_'+id+'v">—</span></div>';
  const fkol=(inner,ad)=>'<div class="xf-kol">'+inner+'<div class="xf-kolad">'+ad+'</div></div>';
  const fok=(key,tex)=>'<div class="xf-ok"><span class="xf-chip" data-pop="'+key+'" tabindex="0" role="button" aria-label="bu adımı anlat">\\( '+tex+' \\)</span><span class="xf-ar">→</span></div>';
  function srcEl(id){let e=document.getElementById('xtsrc-'+id);if(!e){e=document.createElement('div');e.className='xt-src';e.id='xtsrc-'+id;($('gtSrc')||document.body).appendChild(e);}return e;}
  function src(id,title,eq,num,say){srcEl(id).innerHTML='<div class="xp-bas">'+title+'</div><div class="eq">\\( '+eq+' \\)</div>'+(num?'<div class="xp-hes">\\( '+num+' \\)</div>':'')+'<div class="xp-sat">'+say+'</div>';}
  const rowTxt=(a,d=2)=>'('+a.map(v=>f(v,d)).join(' ; ')+')';
  const rowN=(a,d=3)=>'\\begin{pmatrix}'+a.map(v=>t(v,d)).join('&')+'\\end{pmatrix}';
  const norm=M=>Math.sqrt(M.flat().reduce((s,v)=>s+v*v,0));
  const summ=M=>'‖∇‖ = '+f(norm(M),3)+'<span style="display:block;font-size:11px;opacity:.8">en büyük |g| = '+f(Math.max(...M.flat().map(Math.abs)),3)+'</span>';
  const mtab=(M,rl,d=3)=>'<div style="font-family:ui-monospace,Menlo,monospace;font-size:11.5px;white-space:pre;overflow-x:auto;background:#0e1424;border:1px solid var(--line);border-radius:6px;padding:4px 6px;margin:4px 0">'+M.map((r,i)=>(rl?rl[i]+'  ':'')+r.map(v=>f(v,d).padStart(d+4)).join(' ')).join('\n')+'</div>';
  const sel=(id,v)=>'<select id="'+id+'">'+V.map(c=>'<option'+(c===v?' selected':'')+'>'+c+'</option>').join('')+'</select>';
  let M=T.init(1),mode='rast';

  host.innerHTML=
    '<div class="ptrow" style="margin-bottom:8px"><div class="ptcell"><label>pencere (4 karakter)</label><div style="display:flex;gap:4px">'+['1','+','2','='].map((c,i)=>sel('gb_c'+i,c)).join('')+'</div></div><div class="ptcell"><label>doğru sonraki karakter (y)</label>'+sel('gb_y','3')+'</div>'+
      '<div class="ptcell"><label>ağırlıklar</label><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="rex-btn" id="gb_m0">🎲 rastgele başlangıç</button><button class="rex-btn" id="gb_m1">🎓 eğitilmiş (3000 epoch)</button></div></div></div>'+
    '<div class="xf-baslik">▶ İLERİ YOL — pencere <span>(4 karakter) → E tablosundan 4 kart → ara katman → 7 skor → olasılık → kayıp</span></div><div class="xf-scroll"><div class="xf-akis">'+
      fkol([0,1,2,3].map(i=>fbox('gi','c'+i,'karakter '+(i+1))).join(''),'pencere')+fok('gt_f_E','E[\\text{karakter}]')+
      fkol([0,1,2,3].map(i=>fbox('gh','e'+i,'e<sub>'+(i+1)+'</sub>')).join(''),'kimlik kartları (4×2)')+fok('gt_f_u','[e_1\\,e_2\\,e_3\\,e_4]\\cdot W_h+b_h')+
      fkol(fbox('gh','u','u'),'ara katman (6 sayı)')+fok('gt_f_h','\\tanh')+
      fkol(fbox('gh','h','h'),'tanh çıktısı')+fok('gt_f_z','h\\cdot W_o+b_o')+
      fkol(fbox('gh','z','z'),'7 skor')+fok('gt_f_p','\\mathrm{softmax}')+
      fkol(fbox('gh','p','p'),'olasılıklar')+fok('gt_f_L','-\\ln p_y')+fkol(fbox('gy','L','L'),'kayıp')+
    '</div></div>'+
    '<div class="xf-baslik" style="margin-top:8px">◀ GERİ YOL — kayıptan beş ağırlık grubuna <span>(oklara gel; sürpriz: <b>E tablosunda yalnız penceredeki karakterlerin satırları</b> gradyan alır)</span></div><div class="xt-scroll"><div class="xt-tree">'+
      node(B('g1 kok','L','L','kayıp'),
        kid(E('g1','gt_Lz','\\tfrac{\\partial L}{\\partial z}=p-y'),
          node(B('g1','z','z','∂L/∂z'),
            kid(E('g2','gt_zWo','\\tfrac{\\partial z}{\\partial W_o}'),LF('g2','Wo','∂L/∂W<sub>o</sub>'))+
            kid(E('g2','gt_zbo','\\tfrac{\\partial z}{\\partial b_o}'),LF('g2','bo','∂L/∂b<sub>o</sub>'))+
            kid(E('g3','gt_zh','\\tfrac{\\partial z}{\\partial h}'),
              node(B('g3','h','h','∂L/∂h'),
                kid(E('g3','gt_hu','\\tfrac{\\partial h}{\\partial u}\\ (\\tanh)'),
                  node(B('g3','u','u','∂L/∂u'),
                    kid(E('g4','gt_uWh','\\tfrac{\\partial u}{\\partial W_h}'),LF('g4','Wh','∂L/∂W<sub>h</sub>'))+
                    kid(E('g4','gt_ubh','\\tfrac{\\partial u}{\\partial b_h}'),LF('g4','bh','∂L/∂b<sub>h</sub>'))+
                    kid(E('g5','gt_ux','\\tfrac{\\partial u}{\\partial x}'),
                      node(B('g5','x','x','∂L/∂x (8 sayı)'),
                        kid(E('g5','gt_xE','\\tfrac{\\partial x}{\\partial E}'),LF('g5','E','∂L/∂E tablosu')))))))))))+
    '</div></div><div class="callout" id="gbVerdict" style="margin-top:8px"></div>';
  ['gb_c0','gb_c1','gb_c2','gb_c3','gb_y'].forEach(i=>$(i).addEventListener('change',fill));
  $('gb_m0').onclick=()=>{M=T.init(1);mode='rast';fill();};
  $('gb_m1').onclick=()=>{M=T.init(1);const P=T.pairs(["1+1=2.","1+2=3.","2+1=3.","2+2=4."]);for(let e=0;e<=3000;e++)T.step(M,P,1.0);mode='egit';fill();};

  function fill(){
    const ch=[0,1,2,3].map(i=>$('gb_c'+i).value),y=T.IX[$('gb_y').value],pen=ch.map(c=>T.IX[c]),g=T.grad(M,pen,y),o=g.o,p=o.p,L=g.L;
    ch.forEach((c,i)=>{setH('gf_c'+i+'v','<b style="font-size:18px">'+c+'</b>');setH('gf_e'+i+'v',rowTxt(M.E[pen[i]],2));});
    setH('gf_uv',rowTxt(o.u,2));setH('gf_hv',rowTxt(o.h,2));setH('gf_zv',V.map((c,k)=>c+':'+f(o.z[k],1)).join(' '));setH('gf_pv',V.map((c,k)=>c+':'+f(p[k]*100,0)+'%').join(' '));setH('gf_Lv',f(L,4));
    setH('gb_Lv',f(L,4));setH('gb_zv',V.map((c,k)=>c+':'+f(g.dz[k],2)).join(' '));setH('gb_Wov',summ(g.dWo));setH('gb_bov',rowTxt(g.dbo,2));setH('gb_hv',rowTxt(g.dh,2));setH('gb_uv',rowTxt(g.du,2));setH('gb_Whv',summ(g.dWh));setH('gb_bhv',rowTxt(g.dbh,2));setH('gb_xv',rowTxt(g.dx,2));setH('gb_Ev',summ(g.dE));
    const yc=V[y],tx=ch.join('');
    src('gt_f_E','Pencerenin karakterleri → kimlik kartları','e_i=E[\\,c_i\\,]','\\text{"'+tx+'"}\\ \\Rightarrow\\ '+ch.map((c,i)=>'e_{'+(i+1)+'}='+rowN(M.E[pen[i]])).join(',\\ '),
      '💬 Metin sayıya çevrilemez; her karakter <b>E tablosundan</b> 2 sayılık bir kimlik kartı çeker (tablodan satır okumak). 4 karakter → 4 kart. E tablosu da öğrenilir: başta rastgele, eğitimle anlamlı hâle gelir.');
    src('gt_f_u','Kartlar yan yana → ara katman','u=[e_1\\,e_2\\,e_3\\,e_4]\\,W_h+b_h','x='+rowN(o.x,2)+'\\ \\Rightarrow\\ u='+rowN(o.u,2),
      '💬 4 kart yan yana dizilip <b>8 sayılık</b> x yapılır, W<sub>h</sub> (8×6) ve b<sub>h</sub> ile 6 sayılık ara katmana dönüşür. Pencere bu adımda <b>birleşiyor</b>: model karakterlerin <b>sırasını</b> (hangi kart hangi konumda) W<sub>h</sub> üzerinden öğrenir.');
    src('gt_f_h','tanh — ara katmanı bük','h=\\tanh(u)','h='+rowN(o.h,2),'💬 tanh her sayıyı −1…+1 arasına büker (🧠 Neural Network ve 📊 Aktivasyon derslerindeki aynı eğri). Bükme olmasa iki katman tek bir doğrusal katmana çökerdi.');
    src('gt_f_z','Çıktı katmanı — 7 skor','z=h\\,W_o+b_o','z='+rowN(o.z,2),'💬 6 sayılık h, sözlükteki <b>7 karakterin her biri için</b> bir skora çevrilir. Skor büyük = model o karakteri daha olası buluyor.');
    src('gt_f_p','Softmax — skorlar → olasılık','p_k=\\dfrac{e^{z_k}}{\\sum_je^{z_j}}','p='+rowN(p,3),'💬 (🌡️ Softmax dersi) Skorlar toplamı 1 olan olasılıklara çevrilir. Doğru karakter "'+yc+'" için model şu an <b>%'+f(p[y]*100,1)+'</b> veriyor.');
    src('gt_f_L','Kayıp — doğru karaktere verilen olasılığın −ln\'i','L=-\\ln p_y','L=-\\ln('+t(p[y],4)+')='+t(L,4),'💬 Olasılık 1\'e yaklaştıkça kayıp 0\'a iner. Hiçbir şey bilmeyen model 7 karaktere eşit pay verir: p = 1/7, <b>L = ln 7 = '+f(Math.log(7),3)+'</b>. Şu an L = '+f(L,3)+'.');
    src('gt_Lz','∂L/∂z — softmax + çapraz-entropinin sade türevi','\\dfrac{\\partial L}{\\partial z_k}=p_k-y_k','dz='+rowN(p,3)+'-'+rowN(V.map((c,k)=>k===y?1:0),0)+'=\\mathbf{'+rowN(g.dz,3)+'}',
      '💬 (🌡️ Softmax → Bütün Resim\'de türetildi.) Gradyan = <b>tahmin − gerçek</b>. Doğru karakter "'+yc+'" için <b>'+f(g.dz[y],3)+'</b> (negatif → skoru yükselt), yanlışlar için +p<sub>k</sub> (skoru düşür).');
    src('gt_zWo','∂z/∂W_o — çıktı matrisi (yaprak)','\\dfrac{\\partial L}{\\partial W_o}=h^{\\top}\\,dz','\\dfrac{\\partial L}{\\partial W_o}\\ (6\\times7)=h^{\\top}dz','💬 z = h·W<sub>o</sub> + b<sub>o</sub>: hücre = h<sub>b</sub> × dz<sub>k</sub> (dış çarpım).'+mtab(g.dWo,null,2));
    src('gt_zbo','∂z/∂b_o — çıktı bias\'ı (yaprak)','\\dfrac{\\partial L}{\\partial b_o}=dz','db_o='+rowN(g.dbo,3),'💬 Bias doğrudan toplandığı için türevi 1: gradyan dz\'nin kendisi.');
    src('gt_zh','∂z/∂h — skorlardan ara katmana','\\dfrac{\\partial L}{\\partial h}=dz\\,W_o^{\\top}','dh='+rowN(g.dh,3),'💬 z = h·W<sub>o</sub> → ∂z/∂h = W<sub>o</sub>ᵀ: 7 sayılık sinyal 6 sayılık ara katmana geri taşınır.');
    src('gt_hu','∂h/∂u — tanh\'ın türevi','\\dfrac{\\partial L}{\\partial u}=dh\\odot(1-h^2)','du='+rowN(g.du,3),'💬 tanh\'ın türevi 1 − h²: ara katmanda uca yakın (|h|≈1) nöronlar sinyali <b>keser</b> (doyma), ortadakiler geçirir. En çok geçiren nöron ×'+f(Math.max(...o.h.map(v=>1-v*v)),2)+', en az ×'+f(Math.min(...o.h.map(v=>1-v*v)),2)+'.');
    src('gt_uWh','∂u/∂W_h — pencere matrisi (yaprak)','\\dfrac{\\partial L}{\\partial W_h}=x^{\\top}\\,du','\\dfrac{\\partial L}{\\partial W_h}\\ (8\\times6)=x^{\\top}du','💬 u = x·W<sub>h</sub> + b<sub>h</sub>: hücre = x<sub>a</sub> × du<sub>b</sub>.'+mtab(g.dWh,null,2));
    src('gt_ubh','∂u/∂b_h — ara katman bias\'ı (yaprak)','\\dfrac{\\partial L}{\\partial b_h}=du','db_h='+rowN(g.dbh,3),'💬 Bias doğrudan toplandı: gradyan du\'nun kendisi.');
    src('gt_ux','∂u/∂x — ara katmandan kartlara','\\dfrac{\\partial L}{\\partial x}=du\\,W_h^{\\top}','dx='+rowN(g.dx,3),'💬 u = x·W<sub>h</sub> → ∂u/∂x = W<sub>h</sub>ᵀ: sinyal 6 sayıdan 8 sayıya (4 kart × 2) geri dönüyor. İlk 2 sayı 1. karaktere, sonraki 2 sayı 2. karaktere... ait.');
    src('gt_xE','∂x/∂E — kimlik tablosunun gradyanı (yaprak)','\\dfrac{\\partial L}{\\partial E[c]}=\\sum_{i:\\,c_i=c}dx_{i}',
      ch.map((c,i)=>'dE['+c+']\\mathrel{+}='+rowN(g.dx.slice(i*D,i*D+D),3)).join(',\\ '),
      '💬 x kartları <b>E tablosundan satır okuyarak</b> geldi, geri dönüşü de o satırlara <b>yazmak</b>: her penceredeki karakterin satırına payı eklenir (aynı karakter iki kez geçerse payları toplanır). <b>Penceredeki olmayan karakterlerin satırları 0</b>.<br>🔗 Bu tek adımın E gradyanı (satır: karakter):'+mtab(g.dE,V,3)+'Eğitimde binlerce pencere bu satırları yavaş yavaş anlamlı hâle getirir (Örnek Çalışmalar → Örnek 1\'de 2B dağılımı izle).');
    const used=new Set(pen),nz=V.filter((c,k)=>g.dE[k].some(v=>v!==0));
    $('gbVerdict').innerHTML='🔑 <b>Bir eğitim adımı, beş ağırlık grubu.</b> '+(mode==='egit'?'Eğitilmiş ağırlıklarla ':'Rastgele başlangıçta ')+'"'+tx+'" → doğru "'+yc+'" için p = '+f(p[y]*100,1)+'% (L = '+f(L,3)+'; hiçbir şey bilmeyen model için ln 7 = '+f(Math.log(7),3)+'). E tablosunda yalnız <b>'+nz.length+' satır</b> (<b>'+nz.join(' ')+'</b>) gradyan aldı; pencerede olmayan karakterlerin kartı bu adımda hiç değişmez.';
    window.__gtBig={ch,y,L,p,dz:g.dz,dE:g.dE,dWh:g.dWh,dWo:g.dWo,mode};
  }
  const Mx=window.MathJax;fill();
  if(Mx&&Mx.startup&&Mx.startup.promise)Mx.startup.promise.then(()=>Mx.typesetPromise&&Mx.typesetPromise([host]).catch(()=>{}));
})();

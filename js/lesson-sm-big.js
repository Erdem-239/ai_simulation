// Softmax — "6️⃣ Bütün Resim": skorlar (z) → softmax → olasılıklar (p) → çapraz-entropi kaybı L = −ln p_doğru
// ileri yolu + geri yayılım ağacı (L → p_doğru → her z_i) + pop-up'lar. Büyük sürpriz: gradyan = p − y.
(function(){
  const host=document.getElementById('smBigMap'); if(!host) return;
  const $=id=>document.getElementById(id);
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>v<0?'('+t(v,d)+')':t(v,d);
  const setT=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
  const W=['uyudu','kaçtı','havladı','mor'];
  const E=(cls,key,tex)=>'<span class="xt-edge '+cls+'" data-pop="'+key+'" tabindex="0" role="button" aria-label="türetmeyi göster">\\( '+tex+' \\)</span><span class="xt-ar">→</span>';
  const B=(cls,id,sym,cap)=>'<div class="xt-box '+cls+'" id="sb_'+id+'">'+sym+(cap?'<span class="xt-cap">'+cap+'</span>':'')+'<span class="xt-val" id="sb_'+id+'v">—</span></div>';
  const LF=(cls,id,sym)=>'<div class="xt-box '+cls+' yaprak" id="sb_'+id+'">'+sym+'<span class="xt-val" id="sb_'+id+'v">—</span></div>';
  const kid=(e,c)=>'<div class="xt-kid">'+e+c+'</div>';
  const node=(b,k)=>'<div class="xt-node">'+b+(k?'<div class="xt-kids">'+k+'</div>':'')+'</div>';
  const fbox=(cls,id,sym)=>'<div class="xf-box '+cls+'" id="sf_'+id+'">'+sym+'<span class="xf-val" id="sf_'+id+'v">—</span></div>';
  const fkol=(inner,ad)=>'<div class="xf-kol">'+inner+'<div class="xf-kolad">'+ad+'</div></div>';
  const fok=(key,tex)=>'<div class="xf-ok"><span class="xf-chip" data-pop="'+key+'" tabindex="0" role="button" aria-label="bu adımı anlat">\\( '+tex+' \\)</span><span class="xf-ar">→</span></div>';
  function srcEl(id){let e=document.getElementById('xtsrc-'+id);if(!e){e=document.createElement('div');e.className='xt-src';e.id='xtsrc-'+id;($('smSrc')||document.body).appendChild(e);}return e;}
  function src(id,title,eq,num,say){srcEl(id).innerHTML='<div class="xp-bas">'+title+'</div><div class="eq">\\( '+eq+' \\)</div>'+(num?'<div class="xp-hes">\\( '+num+' \\)</div>':'')+'<div class="xp-sat">'+say+'</div>';}
  const zin=[2.0,1.0,-0.5,-2.0];
  host.innerHTML=
    '<div class="ptrow" style="margin-bottom:8px">'+W.map((w,i)=>'<div class="ptcell"><label>z · '+w+'</label><input id="sb_z'+i+'" type="number" step="0.1" value="'+zin[i]+'"></div>').join('')+
      '<div class="ptcell"><label>doğru kelime (y)</label><select id="sb_y">'+W.map((w,i)=>'<option value="'+i+'">'+w+'</option>').join('')+'</select></div></div>'+
    '<div class="xf-baslik">▶ İLERİ YOL — skorlar <span>(dil modelinin 4 aday için verdiği ham puanlar) → olasılık → kayıp</span></div><div class="xf-scroll"><div class="xf-akis">'+
      fkol(W.map((w,i)=>fbox('gi','z'+i,'z<sub>'+(i+1)+'</sub>·'+w)).join(''),'skorlar (logit)')+fok('sb_p','\\mathrm{softmax}')+
      fkol(W.map((w,i)=>fbox('gh','p'+i,'p<sub>'+(i+1)+'</sub>')).join(''),'olasılıklar')+fok('sb_L','-\\ln p_{y}')+fkol(fbox('gy','L','L'),'kayıp')+
    '</div></div>'+
    '<div class="xf-baslik" style="margin-top:8px">◀ GERİ YOL — kayıptan her skora <span>(oklara gel → türev; sonuç sürpriz derecede sade: <b>p − y</b>)</span></div><div class="xt-scroll"><div class="xt-tree">'+
      node(B('g1 kok','L','L','kayıp'),
        kid(E('g1','sb_Lp','\\tfrac{\\partial L}{\\partial p_{y}}=-\\tfrac{1}{p_{y}}'),
          node(B('g1','py','p<sub>y</sub>','∂L/∂p<sub>y</sub>'),
            W.map((w,i)=>kid(E('g'+(i+2),'sb_pz'+i,'\\tfrac{\\partial p_{y}}{\\partial z_{'+(i+1)+'}}'),LF('g'+(i+2),'g'+i,'∂L/∂z<sub>'+(i+1)+'</sub>·'+w))).join('')))) +
    '</div></div><div class="callout" id="sbVerdict" style="margin-top:8px"></div>';
  ['sb_z0','sb_z1','sb_z2','sb_z3'].forEach(id=>$(id).addEventListener('input',fill));$('sb_y').addEventListener('change',fill);

  function fill(){
    const z=[0,1,2,3].map(i=>parseFloat($('sb_z'+i).value)||0),y=+$('sb_y').value;
    const m=Math.max(...z),e=z.map(v=>Math.exp(v-m)),S=e.reduce((a,b)=>a+b,0),p=e.map(v=>v/S);
    const L=-Math.log(p[y]),dLp=-1/p[y],dpz=p.map((pi,i)=>p[y]*((i===y?1:0)-pi)),g=dpz.map(v=>dLp*v);
    z.forEach((v,i)=>{setT('sf_z'+i+'v',f(v,2));setT('sf_p'+i+'v',f(p[i],3));});setT('sf_Lv',f(L,4));
    setT('sb_Lv',f(L,4));setT('sb_pyv',f(dLp,3));g.forEach((v,i)=>setT('sb_g'+i+'v',f(v,3)));
    const ez=z.map(v=>'e^{'+t(v-m,2)+'}').join('+');
    src('sb_p','softmax — skorlardan olasılığa','p_i=\\dfrac{e^{z_i}}{\\sum_j e^{z_j}}','p_{y}=\\dfrac{e^{'+t(z[y]-m,2)+'}}{'+ez+'}=\\mathbf{'+t(p[y],4)+'}','💬 Her skorun e üzeri değeri alınır, hepsinin toplamına bölünür: <b>'+W[y]+'</b> için p = '+f(p[y],3)+'. Dört olasılığın toplamı hep 1. (Taşmasın diye hepsinden en büyük skor çıkarıldı — sonuç değişmez.)');
    src('sb_L','L — kayıp (çapraz-entropi)','L=-\\ln p_{y}','L=-\\ln('+t(p[y],4)+')=\\mathbf{'+t(L,4)+'}','💬 Doğru kelimeye verdiği olasılık <b>'+f(p[y],3)+'</b>. Olasılık 1\'e yaklaştıkça kayıp 0\'a iner; 0\'a yaklaştıkça kayıp sonsuza gider (kendinden emin ama yanlış model en çok cezayı yer).');
    src('sb_Lp','∂L/∂p<sub>y</sub>','\\tfrac{\\partial L}{\\partial p_{y}}=-\\tfrac{1}{p_{y}}','\\tfrac{\\partial L}{\\partial p_{y}}=-\\tfrac{1}{'+t(p[y],4)+'}=\\mathbf{'+t(dLp,3)+'}','💬 K3 (ln\'nin türevi: 1/x). Eksi işaret: doğru kelimenin olasılığını <b>artırmak</b> kaybı düşürür. Olasılık küçükse bu sayı dev büyür ('+f(dLp,2)+'): model çok yanlışsa güçlü sinyal gider.');
    W.forEach((w,i)=>{
      const same=i===y;
      src('sb_pz'+i,'∂p<sub>y</sub>/∂z<sub>'+(i+1)+'</sub> — softmax\'in türevi ('+w+')','\\tfrac{\\partial p_{y}}{\\partial z_{'+(i+1)+'}}='+(same?'p_{y}(1-p_{y})':'-p_{y}\\,p_{'+(i+1)+'}'),
        (same?'p_{y}(1-p_{y})='+t(p[y],4)+'\\cdot'+t(1-p[y],4):'-p_{y}\\,p_{'+(i+1)+'}=-'+t(p[y],4)+'\\cdot'+t(p[i],4))+'='+t(dpz[i],4)+
        '\\ \\Rightarrow\\ \\dfrac{\\partial L}{\\partial z_{'+(i+1)+'}}='+tp(dLp,3)+'\\cdot'+tp(dpz[i],4)+'=\\mathbf{'+t(g[i],4)+'}',
        '💬 '+(same?'Doğru kelimenin kendi skoru: <b>p<sub>y</sub>(1−p<sub>y</sub>)</b> (sigmoid türevinin kardeşi).':'Başka bir kelimenin skoru, <b>y</b>\'nin olasılığını düşürür: <b>−p<sub>y</sub>·p<sub>'+(i+1)+'</sub></b>.')+
        '<br>🔗 <b>Sade sonuç:</b> −1/p<sub>y</sub> ile çarpınca p<sub>y</sub> sadeleşir ve <b>∂L/∂z<sub>'+(i+1)+'</sub> = p<sub>'+(i+1)+'</sub> − '+(same?'1':'0')+' = '+f(g[i],3)+'</b>. '+(same?'Negatif → skor <b>artar</b> (gradyan inişi z\'yi gradyanın tersine iter).':'Pozitif → skor <b>azalır</b>.'));
    });
    $('sbVerdict').innerHTML='🔑 <b>Gradyan = tahmin − gerçek</b> (p − y), tüm karmaşa sadeleşti: doğru kelime <b>'+W[y]+'</b> için '+f(g[y],3)+' (negatif → skoru yükselt), yanlışlar için +p<sub>i</sub> ('+g.filter((v,i)=>i!==y).map(v=>f(v,3)).join(', ')+') → skorlarını düşür. Dört gradyanın toplamı <b>'+f(g.reduce((a,b)=>a+b,0),3)+'</b> (hep 0: skorların toplamı değil, aralarındaki <i>fark</i> öğreniliyor).';
    window.__smBig={z,p,L,g};
  }
  const M=window.MathJax;fill();
  if(M&&M.startup&&M.startup.promise)M.startup.promise.then(()=>M.typesetPromise&&M.typesetPromise([host]).catch(()=>{}));
})();

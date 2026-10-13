// Kelime Temsili — "6️⃣ Bütün Resim": bir skip-gram adımı. Kelime numarası → gömme tablosundan vektör (e) → bağlam adaylarıyla
// nokta çarpım (skorlar s) → softmax (p) → L = −ln p_doğru. Geri yol: kayıp → s → hem kelime vektörü e HEM bağlam vektörleri c (hepsi öğrenilir).
(function(){
  const host=document.getElementById('embBigMap'); if(!host) return;
  const $=id=>document.getElementById(id);
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>v<0?'('+t(v,d)+')':t(v,d);
  const vec=(a,d)=>'('+a.map(v=>f(v,d)).join('; ')+')';
  const tv=(a,d)=>'\\begin{pmatrix}'+a.map(v=>t(v,d)).join('\\\\')+'\\end{pmatrix}';
  const setT=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
  const WD=['kedi','köpek','kral','kraliçe','elma','armut'],CD=['uyudu','yönetti','tatlı'];
  const E0={kedi:[0.8,0.3],'köpek':[0.7,0.5],kral:[-0.6,0.6],'kraliçe':[-0.5,0.7],elma:[0.1,-0.8],armut:[0.2,-0.7]};
  const C0=[[0.5,0.4],[-0.6,0.5],[0.1,-0.7]];
  const E=(cls,key,tex)=>'<span class="xt-edge '+cls+'" data-pop="'+key+'" tabindex="0" role="button" aria-label="türetmeyi göster">\\( '+tex+' \\)</span><span class="xt-ar">→</span>';
  const B=(cls,id,sym,cap)=>'<div class="xt-box '+cls+'" id="eb_'+id+'">'+sym+(cap?'<span class="xt-cap">'+cap+'</span>':'')+'<span class="xt-val" id="eb_'+id+'v">—</span></div>';
  const LF=(cls,id,sym)=>'<div class="xt-box '+cls+' yaprak" id="eb_'+id+'">'+sym+'<span class="xt-val" id="eb_'+id+'v">—</span></div>';
  const kid=(e,c)=>'<div class="xt-kid">'+e+c+'</div>';
  const node=(b,k)=>'<div class="xt-node">'+b+(k?'<div class="xt-kids">'+k+'</div>':'')+'</div>';
  const fbox=(cls,id,sym)=>'<div class="xf-box '+cls+'" id="ef_'+id+'">'+sym+'<span class="xf-val" id="ef_'+id+'v">—</span></div>';
  const fkol=(inner,ad)=>'<div class="xf-kol">'+inner+'<div class="xf-kolad">'+ad+'</div></div>';
  const fok=(key,tex)=>'<div class="xf-ok"><span class="xf-chip" data-pop="'+key+'" tabindex="0" role="button" aria-label="bu adımı anlat">\\( '+tex+' \\)</span><span class="xf-ar">→</span></div>';
  function srcEl(id){let e=document.getElementById('xtsrc-'+id);if(!e){e=document.createElement('div');e.className='xt-src';e.id='xtsrc-'+id;($('embSrc')||document.body).appendChild(e);}return e;}
  function src(id,title,eq,num,say){srcEl(id).innerHTML='<div class="xp-bas">'+title+'</div><div class="eq">\\( '+eq+' \\)</div>'+(num?'<div class="xp-hes">\\( '+num+' \\)</div>':'')+'<div class="xp-sat">'+say+'</div>';}
  host.innerHTML=
    '<div class="ptrow" style="margin-bottom:8px"><div class="ptcell"><label>kelime (girdi)</label><select id="eb_w">'+WD.map((w,i)=>'<option value="'+i+'">'+w+'</option>').join('')+'</select></div>'+
      '<div class="ptcell"><label>gerçek komşu (y)</label><select id="eb_y">'+CD.map((w,i)=>'<option value="'+i+'">'+w+'</option>').join('')+'</select></div>'+
      '<div class="ptcell"><label>e · kelime vektörü (2 sayı)</label><input id="eb_e0" type="number" step="0.1" style="width:70px"> <input id="eb_e1" type="number" step="0.1" style="width:70px"></div></div>'+
    '<div class="ptrow" style="margin-bottom:8px">'+CD.map((w,k)=>'<div class="ptcell"><label>c · '+w+'</label><input id="eb_c'+k+'a" type="number" step="0.1" value="'+C0[k][0]+'" style="width:70px"> <input id="eb_c'+k+'b" type="number" step="0.1" value="'+C0[k][1]+'" style="width:70px"></div>').join('')+'</div>'+
    '<div class="xf-baslik">▶ İLERİ YOL — <span>kelime → vektör → komşu adaylarıyla nokta çarpım → olasılık → kayıp</span></div><div class="xf-scroll"><div class="xf-akis">'+
      fkol(fbox('gi','id','kelime<br>no')+fbox('gi','e','e'),'tablodan satır')+fok('eb_s','e\\cdot c_k')+
      fkol(CD.map((w,k)=>fbox('gh','s'+k,'s<sub>'+(k+1)+'</sub>·'+w)).join(''),'skorlar')+fok('eb_p','\\mathrm{softmax}')+
      fkol(CD.map((w,k)=>fbox('gh','p'+k,'p<sub>'+(k+1)+'</sub>')).join(''),'olasılıklar')+fok('eb_L','-\\ln p_{y}')+fkol(fbox('gy','L','L'),'kayıp')+
    '</div></div>'+
    '<div class="xf-baslik" style="margin-top:8px">◀ GERİ YOL — <span>kayıptan hem kelime vektörüne hem komşu vektörlerine (<b>ikisi de öğrenilir</b>)</span></div><div class="xt-scroll"><div class="xt-tree">'+
      node(B('g1 kok','L','L','kayıp'),
        kid(E('g1','eb_Ls','\\tfrac{\\partial L}{\\partial s_k}=p_k-y_k'),
          node(B('g1','d','δ','∂L/∂s = p − y'),
            kid(E('g2','eb_se','\\tfrac{\\partial s_k}{\\partial e}=c_k'),LF('g2','de','∂L/∂e'))+
            CD.map((w,k)=>kid(E('g'+(k+3),'eb_sc'+k,'\\tfrac{\\partial s_{'+(k+1)+'}}{\\partial c_{'+(k+1)+'}}=e'),LF('g'+(k+3),'dc'+k,'∂L/∂c<sub>'+(k+1)+'</sub>·'+w))).join('')))) +
    '</div></div><div class="callout" id="ebVerdict" style="margin-top:8px"></div>';
  const setE=()=>{const w=WD[+$('eb_w').value],e=E0[w];$('eb_e0').value=e[0];$('eb_e1').value=e[1];};
  $('eb_w').addEventListener('change',()=>{setE();$('eb_y').value=Math.floor(+$('eb_w').value/2);fill();});
  setE();$('eb_y').value=0;
  ['eb_e0','eb_e1','eb_c0a','eb_c0b','eb_c1a','eb_c1b','eb_c2a','eb_c2b'].forEach(id=>$(id).addEventListener('input',fill));$('eb_y').addEventListener('change',fill);

  function fill(){
    const wi=+$('eb_w').value,y=+$('eb_y').value,e=[parseFloat($('eb_e0').value)||0,parseFloat($('eb_e1').value)||0];
    const c=[0,1,2].map(k=>[parseFloat($('eb_c'+k+'a').value)||0,parseFloat($('eb_c'+k+'b').value)||0]);
    const s=c.map(v=>e[0]*v[0]+e[1]*v[1]),m=Math.max(...s),ex=s.map(v=>Math.exp(v-m)),S=ex.reduce((a,b)=>a+b,0),p=ex.map(v=>v/S);
    const L=-Math.log(p[y]),d=p.map((v,k)=>v-(k===y?1:0)),de=[0,1].map(i=>d.reduce((a,v,k)=>a+v*c[k][i],0)),dc=d.map(v=>e.map(x=>v*x));
    setT('ef_idv','#'+(wi+1));setT('ef_ev',vec(e,2));s.forEach((v,k)=>{setT('ef_s'+k+'v',f(v,3));setT('ef_p'+k+'v',f(p[k],3));});setT('ef_Lv',f(L,4));
    setT('eb_Lv',f(L,4));setT('eb_dv',vec(d,3));setT('eb_dev',vec(de,3));dc.forEach((v,k)=>setT('eb_dc'+k+'v',vec(v,3)));
    src('eb_s','s<sub>k</sub> — kelimenin komşu adaylarıyla benzerliği','s_k=e\\cdot c_k','s_{1}='+tv(e,2)+'\\cdot'+tv(c[0],2)+'='+t(s[0],3),'💬 Kelime vektörü e ile her adayın vektörü c<sub>k</sub> arasında <b>nokta çarpım</b> (Vektör dersi): yöndeşse büyük pozitif, zıt yönlüyse negatif. Bu skorlar <b>hâlâ olasılık değil</b> — softmax bekliyor.');
    src('eb_p','softmax — skordan olasılığa','p_k=\\dfrac{e^{s_k}}{\\sum_j e^{s_j}}','p=('+p.map(v=>t(v,3)).join(';\\ ')+')','💬 Softmax dersindeki aynı fonksiyon: 3 skoru toplamı 1 olan 3 olasılığa çevirir. Gerçek komşu <b>'+CD[y]+'</b> için p = <b>'+f(p[y],3)+'</b>.');
    src('eb_L','L — kayıp','L=-\\ln p_{y}','L=-\\ln('+t(p[y],4)+')=\\mathbf{'+t(L,4)+'}','💬 Model <b>'+WD[wi]+'</b> kelimesinin yanında <b>'+CD[y]+'</b> kelimesini görmeyi ne kadar bekliyordu? Az bekliyorsa kayıp büyük.');
    src('eb_Ls','∂L/∂s<sub>k</sub> — softmax + çapraz-entropi: yine p − y','\\tfrac{\\partial L}{\\partial s_k}=p_k-y_k','\\delta=('+p.map((v,k)=>t(v,3)+'-'+(k===y?'1':'0')).join(';\\ ')+')=('+d.map(v=>t(v,3)).join(';\\ ')+')','💬 Softmax dersinde gördüğün sade sonuç: gradyan = tahmin − gerçek. Gerçek komşu için negatif (skoru yükselt), diğerleri için pozitif (düşür).');
    src('eb_se','∂s<sub>k</sub>/∂e = c<sub>k</sub> — kelime vektörünün gradyanı','\\tfrac{\\partial L}{\\partial e}=\\sum_k \\delta_k\\,c_k','\\tfrac{\\partial L}{\\partial e}=\\sum_k \\delta_k c_k='+d.map((v,k)=>tp(v,3)+tv(c[k],2)).join('+')+'='+tv(de,3),'💬 <b>Kelime vektörü</b> '+WD[wi]+' şuraya doğru itilir: gerçek komşunun vektörüne yaklaş (δ negatif → c<sub>y</sub> yönünde), yanlış adaylardan uzaklaş. Gradyan inişiyle e := e − α·∂L/∂e.<br>🔗 <b>Gömme tablosunda yalnız bu kelimenin satırı</b> güncellenir; diğer 5 satıra dokunulmaz.');
    CD.forEach((w,k)=>src('eb_sc'+k,'∂s<sub>'+(k+1)+'</sub>/∂c<sub>'+(k+1)+'</sub> = e — komşu vektörünün gradyanı ('+w+')','\\tfrac{\\partial L}{\\partial c_{'+(k+1)+'}}=\\delta_{'+(k+1)+'}\\,e','\\tfrac{\\partial L}{\\partial c_{'+(k+1)+'}}='+tp(d[k],3)+tv(e,2)+'='+tv(dc[k],3),'💬 '+(k===y?'Gerçek komşu <b>'+w+'</b>: δ negatif → c vektörü <b>'+WD[wi]+'</b> kelimesinin vektörüne doğru çekilir.':'Yanlış aday <b>'+w+'</b>: δ pozitif → c vektörü <b>'+WD[wi]+'</b>\'den uzaklaştırılır.')+' İki vektör birbirine bakarak şekilleniyor — ağırlıklar iki taraflı öğreniliyor.'));
    $('ebVerdict').innerHTML='🔑 <b>İki taraflı öğrenme:</b> aynı adımda hem <b>'+WD[wi]+'</b> vektörü (∂L/∂e = '+vec(de,3)+') hem komşu vektörleri güncellendi. Milyarlarca cümlede "yan yana geçen" kelimelerin vektörleri birbirine yaklaşır, geçmeyenler uzaklaşır — <b>embedding böyle doğar</b>. Gerçek modelde 3 aday yerine on binlerce kelime var (ya da hepsini hesaplamamak için "negatif örnekleme").';
    window.__embBig={s,p,L,d,de,dc};
  }
  const M=window.MathJax;fill();
  if(M&&M.startup&&M.startup.promise)M.startup.promise.then(()=>M.typesetPromise&&M.typesetPromise([host]).catch(()=>{}));
})();

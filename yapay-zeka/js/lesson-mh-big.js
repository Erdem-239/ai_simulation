// Multi-Head Attention — "6️⃣ Bütün Resim": 3 kelime (d_model=4), 2 kafa (d_k=2). Her kafanın KENDİ W_Q, W_K, W_V'si var.
// İleri yol: X → (kafa başına Q,K,V → skor → softmax → karışım) → Concat → y (son kelime) → kayıp.
// Geri ağaç: L → y → {W_O, c₃ → [böl] → her kafada {V→W_V, A→S→{q→W_Q, K→W_K}}}; 7 yaprak.
// Gradyanlar sonlu farkla doğrulandı (Python |fark|≈2e-11); pop-up'lar canlı sayılarla türetmeyi gösterir.
(function(){
  const host=document.getElementById('mhBigMap'); if(!host) return;
  const $=id=>document.getElementById(id);
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>v<0?'('+t(v,d)+')':t(v,d);
  const setH=(id,h)=>{const e=$(id);if(e)e.innerHTML=h;};
  const W=['kedi','süt','içti'],H=2,DK=2,SD=Math.sqrt(DK);
  const WQ=[[[1.2,-0.6],[0.4,1.0],[-0.5,0.8],[0.7,0.3]],[[-0.7,1.1],[1.3,0.2],[0.5,-0.9],[-0.2,0.6]]];
  const WK=[[[1.0,0.7],[-0.8,1.2],[0.6,-0.4],[0.3,0.9]],[[0.6,-0.9],[0.9,1.1],[-0.3,0.7],[0.8,-0.2]]];
  const WV=[[[0.9,0.1],[-0.2,0.6],[0.4,-0.5],[0.1,0.3]],[[-0.5,0.8],[0.7,0.2],[0.3,0.6],[-0.4,0.5]]];
  const WO=[0.7,-0.5,0.6,0.4];
  const X0=[[1.0,0.2,0.5,-0.3],[0.1,0.9,-0.4,0.6],[0.8,0.7,0.3,0.2]],T0=0.9;
  const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,v,k)=>s+v*B[k][j],0)));
  const tr=A=>A[0].map((_,j)=>A.map(r=>r[j]));
  const SUP=['¹','²'];
  const E=(cls,key,tex)=>'<span class="xt-edge '+cls+'" data-pop="'+key+'" tabindex="0" role="button" aria-label="türetmeyi göster">\\( '+tex+' \\)</span><span class="xt-ar">→</span>';
  const B=(cls,id,sym,cap)=>'<div class="xt-box '+cls+'" id="mb_'+id+'">'+sym+(cap?'<span class="xt-cap">'+cap+'</span>':'')+'<span class="xt-val" id="mb_'+id+'v">—</span></div>';
  const LF=(cls,id,sym)=>'<div class="xt-box '+cls+' yaprak" id="mb_'+id+'">'+sym+'<span class="xt-val" id="mb_'+id+'v">—</span></div>';
  const kid=(e,c)=>'<div class="xt-kid">'+e+c+'</div>';
  const node=(b,k)=>'<div class="xt-node">'+b+(k?'<div class="xt-kids">'+k+'</div>':'')+'</div>';
  const fbox=(cls,id,sym)=>'<div class="xf-box '+cls+'" id="mf_'+id+'">'+sym+'<span class="xf-val" id="mf_'+id+'v">—</span></div>';
  const fkol=(inner,ad)=>'<div class="xf-kol">'+inner+'<div class="xf-kolad">'+ad+'</div></div>';
  const fok=(key,tex)=>'<div class="xf-ok"><span class="xf-chip" data-pop="'+key+'" tabindex="0" role="button" aria-label="bu adımı anlat">\\( '+tex+' \\)</span><span class="xf-ar">→</span></div>';
  function srcEl(id){let e=document.getElementById('xtsrc-'+id);if(!e){e=document.createElement('div');e.className='xt-src';e.id='xtsrc-'+id;($('mhSrc')||document.body).appendChild(e);}return e;}
  function src(id,title,eq,num,say){srcEl(id).innerHTML='<div class="xp-bas">'+title+'</div><div class="eq">\\( '+eq+' \\)</div>'+(num?'<div class="xp-hes">\\( '+num+' \\)</div>':'')+'<div class="xp-sat">'+say+'</div>';}
  const rowTxt=(a,d=2)=>'('+a.map(v=>f(v,d)).join(' ; ')+')';
  const matTxt=(M,d=2)=>M.map(r=>'<span style="display:block">'+rowTxt(r,d)+'</span>').join('');
  const rowN=a=>'\\begin{pmatrix}'+a.map(v=>t(v,3)).join('&')+'\\end{pmatrix}';
  const colN=a=>'\\begin{pmatrix}'+a.map(v=>t(v,3)).join('\\\\')+'\\end{pmatrix}';
  const matN=M=>'\\begin{pmatrix}'+M.map(r=>r.map(v=>t(v,3)).join('&')).join('\\\\')+'\\end{pmatrix}';

  const heads=[0,1];
  const gC=h=>['g4','g5'][h];
  const headKids=h=>{const n=h+1,s=SUP[h];
    return kid(E('g'+(3+h*2),'mb_cz'+n,'\\tfrac{\\partial c_3}{\\partial z^{'+n+'}_3}'),
      node(B('g'+(3+h*2),'Z'+n,'z<sub>3</sub>'+s,'kafa '+n+' ∂L/∂z'),
        kid(E('g4','mb_zV'+n,'\\tfrac{\\partial z_3}{\\partial V^{'+n+'}}'),
          node(B('g4','V'+n,'V'+s,'∂L/∂V'+s),
            kid(E('g4','mb_VW'+n,'\\tfrac{\\partial V}{\\partial W_V^{'+n+'}}'),LF('g4','WV'+n,'∂L/∂W<sub>V</sub>'+s))))+
        kid(E('g5','mb_zA'+n,'\\tfrac{\\partial z_3}{\\partial A^{'+n+'}_3}'),
          node(B('g5','A'+n,'A<sub>3</sub>'+s,'∂L/∂A'+s),
            kid(E('g5','mb_AS'+n,'\\tfrac{\\partial A_3}{\\partial S_3}'),
              node(B('g5','S'+n,'S<sub>3</sub>'+s,'∂L/∂S'+s),
                kid(E('g6','mb_Sq'+n,'\\tfrac{\\partial S_3}{\\partial q_3}'),
                  node(B('g6','q'+n,'q<sub>3</sub>'+s,'∂L/∂q'+s),
                    kid(E('g6','mb_qW'+n,'\\tfrac{\\partial q_3}{\\partial W_Q^{'+n+'}}'),LF('g6','WQ'+n,'∂L/∂W<sub>Q</sub>'+s))))+
                kid(E('g7','mb_SK'+n,'\\tfrac{\\partial S_3}{\\partial K}'),
                  node(B('g7','K'+n,'K'+s,'∂L/∂K'+s),
                    kid(E('g7','mb_KW'+n,'\\tfrac{\\partial K}{\\partial W_K^{'+n+'}}'),LF('g7','WK'+n,'∂L/∂W<sub>K</sub>'+s))))))))));};
  host.innerHTML=
    '<div class="ptrow" style="margin-bottom:8px">'+W.map((w,i)=>'<div class="ptcell"><label>x<sub>'+(i+1)+'</sub> · '+w+' (4 sayı)</label><div style="display:flex;gap:3px">'+[0,1,2,3].map(k=>'<input id="mb_x'+i+'_'+k+'" type="number" step="0.1" value="'+X0[i][k]+'" style="width:56px">').join('')+'</div></div>').join('')+
      '<div class="ptcell"><label>hedef (t)</label><input id="mb_t" type="number" step="0.1" value="'+T0+'"></div></div>'+
    '<div class="xf-baslik">▶ İLERİ YOL — girdiler <span>(3 kelime × 4 sayı) → <b>her kafada</b> Q,K,V → skor → yüzde → karışım → Concat → çıktı → kayıp</span></div><div class="xf-scroll"><div class="xf-akis">'+
      fkol(W.map((w,i)=>fbox('gi','x'+i,'x<sub>'+(i+1)+'</sub>·'+w)).join(''),'girdi X')+fok('mb_f_qkv','\\cdot W^{h}_Q,\\,W^{h}_K,\\,W^{h}_V')+
      fkol(heads.map(h=>fbox('gh','Q'+(h+1),'Q'+SUP[h])+fbox('gh','K'+(h+1),'K'+SUP[h])+fbox('gh','V'+(h+1),'V'+SUP[h])).join(''),'kafa başına sorgu · etiket · içerik')+fok('mb_f_s','QK^{\\top}/\\sqrt{d_k}')+
      fkol(heads.map(h=>fbox('gh','S'+(h+1),'S'+SUP[h])).join(''),'skor (kafa başına 3×3)')+fok('mb_f_a','\\mathrm{softmax}')+
      fkol(heads.map(h=>fbox('gh','A'+(h+1),'A'+SUP[h])).join(''),'dikkat yüzdeleri')+fok('mb_f_z','A\\cdot V')+
      fkol(heads.map(h=>fbox('gh','Z'+(h+1),'Z'+SUP[h])).join(''),'kafa çıktıları (3×2)')+fok('mb_f_c','\\mathrm{Concat}')+
      fkol(fbox('gh','C','C = [Z¹ | Z²]'),'birleşik (3×4)')+fok('mb_f_y','c_3\\cdot W_O')+fkol(fbox('gy','y','y'),'çıktı (son kelime)')+fok('mb_f_l','\\tfrac12(y-t)^2')+fkol(fbox('gy','L','L'),'kayıp')+
    '</div></div>'+
    '<div class="xf-baslik" style="margin-top:8px">◀ GERİ YOL — kayıptan yedi ağırlık grubuna <span>(oklara gel → türev; <b>Concat geri yolda ikiye bölünür</b>, her kafa kendi payını alır)</span></div><div class="xt-scroll"><div class="xt-tree">'+
      node(B('g1 kok','L','L','kayıp'),
        kid(E('g1','mb_Ly','\\tfrac{\\partial L}{\\partial y}=y-t'),
          node(B('g1','y','y','∂L/∂y'),
            kid(E('g2','mb_yw','\\tfrac{\\partial y}{\\partial W_O}'),LF('g2','w','∂L/∂W<sub>O</sub>'))+
            kid(E('g3','mb_yc','\\tfrac{\\partial y}{\\partial c_3}'),
              node(B('g3','c3','c<sub>3</sub>','∂L/∂c<sub>3</sub>'),heads.map(headKids).join('')))))) +
    '</div></div><div class="callout" id="mbVerdict" style="margin-top:8px"></div>';
  host.querySelectorAll('input').forEach(i=>i.addEventListener('input',fill));

  function fill(){
    const X=[0,1,2].map(i=>[0,1,2,3].map(k=>parseFloat($('mb_x'+i+'_'+k).value)||0)),tg=parseFloat($('mb_t').value)||0;
    const hd=heads.map(h=>{
      const Q=mm(X,WQ[h]),K=mm(X,WK[h]),V=mm(X,WV[h]);
      const S=Q.map(q=>K.map(k=>(q[0]*k[0]+q[1]*k[1])/SD));
      const A=S.map(r=>{const m=Math.max(...r),e=r.map(v=>Math.exp(v-m)),s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s);});
      return {Q,K,V,S,A,Z:mm(A,V)};});
    const C=[0,1,2].map(i=>hd[0].Z[i].concat(hd[1].Z[i])),c3=C[2];
    const y=c3.reduce((s,v,k)=>s+v*WO[k],0),L=0.5*(y-tg)*(y-tg),e=y-tg;
    const dw=c3.map(v=>e*v),dc=WO.map(v=>e*v);
    const gr=heads.map(h=>{const {Q,K,V,A}=hd[h],a3=A[2],dz=dc.slice(2*h,2*h+2);
      const dV=a3.map(a=>[a*dz[0],a*dz[1]]),dA=V.map(v=>dz[0]*v[0]+dz[1]*v[1]);
      const sm=a3.reduce((s,a,j)=>s+a*dA[j],0),dS=a3.map((a,j)=>a*(dA[j]-sm));
      const dq=[0,1].map(k=>K.reduce((s,kk,j)=>s+dS[j]*kk[k],0)/SD),dK=K.map((_,j)=>[dS[j]*Q[2][0]/SD,dS[j]*Q[2][1]/SD]);
      return {a3,dz,dV,dA,sm,dS,dq,dK,dWV:mm(tr(X),dV),dWK:mm(tr(X),dK),dWQ:[0,1,2,3].map(a=>[0,1].map(b=>X[2][a]*dq[b]))};});
    // ileri kutular
    X.forEach((x,i)=>setH('mf_x'+i+'v',rowTxt(x,1)));
    heads.forEach(h=>{const n=h+1,o=hd[h];setH('mf_Q'+n+'v',matTxt(o.Q));setH('mf_K'+n+'v',matTxt(o.K));setH('mf_V'+n+'v',matTxt(o.V));setH('mf_S'+n+'v',matTxt(o.S));setH('mf_A'+n+'v',matTxt(o.A));setH('mf_Z'+n+'v',matTxt(o.Z));});
    setH('mf_Cv',matTxt(C));setH('mf_yv',f(y,3));setH('mf_Lv',f(L,4));
    // geri kutular
    setH('mb_Lv',f(L,4));setH('mb_yv',f(e,3));setH('mb_wv',rowTxt(dw,3));setH('mb_c3v',rowTxt(dc,3));
    heads.forEach(h=>{const n=h+1,g=gr[h];setH('mb_Z'+n+'v',rowTxt(g.dz,3));setH('mb_V'+n+'v',matTxt(g.dV,3));setH('mb_A'+n+'v',rowTxt(g.dA,3));setH('mb_S'+n+'v',rowTxt(g.dS,3));setH('mb_q'+n+'v',rowTxt(g.dq,3));setH('mb_K'+n+'v',matTxt(g.dK,3));setH('mb_WV'+n+'v',matTxt(g.dWV,3));setH('mb_WQ'+n+'v',matTxt(g.dWQ,3));setH('mb_WK'+n+'v',matTxt(g.dWK,3));});
    // ---- pop-up kaynakları: ileri ----
    const both=fn=>heads.map(fn).join('<br>');
    src('mb_f_qkv','Q, K, V — her kafanın KENDİ üç matrisi','Q^{h}=XW^{h}_Q,\\quad K^{h}=XW^{h}_K,\\quad V^{h}=XW^{h}_V',
      'q^{1}_3=x_3W^{1}_Q='+rowN(X[2])+matN(WQ[0])+'='+rowN(hd[0].Q[2])+',\\quad q^{2}_3='+rowN(hd[1].Q[2]),
      '💬 4 sayılık her kelime, <b>her kafanın kendi 4×2 matrisleriyle</b> 2 sayılık bir alt-uzaya indirilir (d<sub>k</sub> = 2). Aynı kelime iki kafada <b>farklı</b> sorgu üretir: q³<sup>1</sup> = '+rowTxt(hd[0].Q[2],3)+', q³<sup>2</sup> = '+rowTxt(hd[1].Q[2],3)+'. Fark buradan doğuyor.');
    src('mb_f_s','Skor — her kafa kendi tablosunu çıkarır','S^{h}_{ij}=\\dfrac{q^{h}_i\\cdot k^{h}_j}{\\sqrt{d_k}}',
      heads.map(h=>'S^{'+(h+1)+'}_{3\\cdot}='+rowN(hd[h].S[2])).join(',\\quad '),
      '💬 İki kafanın skor tablosu <b>ayrı</b>: kafa 1 son kelimede '+rowTxt(hd[0].S[2],2)+', kafa 2 '+rowTxt(hd[1].S[2],2)+'. Aynı cümleye farklı mercekten bakıyorlar.');
    src('mb_f_a','Softmax — her kafanın kendi yüzdeleri','A^{h}_{3\\cdot}=\\mathrm{softmax}(S^{h}_{3\\cdot})',
      heads.map(h=>'A^{'+(h+1)+'}_{3\\cdot}='+rowN(hd[h].A[2])).join(',\\quad '),
      '💬 '+both(h=>'<b>Kafa '+(h+1)+'</b>: '+W[2]+' dikkatinin %'+Math.round(hd[h].A[2][0]*100)+'\'ini '+W[0]+'\'ye, %'+Math.round(hd[h].A[2][1]*100)+'\'ini '+W[1]+'\'e, %'+Math.round(hd[h].A[2][2]*100)+'\'ini kendine veriyor.')+'<br>İki kafa <b>farklı yerlere</b> dikkat veriyor: tek kafa bunların bulanık ortalamasını görürdü.');
    src('mb_f_z','Karışım — her kafa kendi içeriğini toplar','z^{h}_3=\\sum_j A^{h}_{3j}\\,v^{h}_j',
      heads.map(h=>'z^{'+(h+1)+'}_3='+rowN(hd[h].Z[2])).join(',\\quad '),
      '💬 Her kafa kendi V\'lerini kendi yüzdeleriyle karıştırır: kafa 1 → '+rowTxt(hd[0].Z[2],3)+', kafa 2 → '+rowTxt(hd[1].Z[2],3)+'. İki ayrı 2 sayılık bilgi parçası elde ettik.');
    src('mb_f_c','Concat — kafalar yan yana','c_3=[\\,z^{1}_3\\ |\\ z^{2}_3\\,]',
      'c_3='+rowN(hd[0].Z[2])+'\\ \\Vert\\ '+rowN(hd[1].Z[2])+'='+rowN(c3),
      '💬 İki kafanın 2\'şer sayılık çıktısı <b>uç uca eklenir</b> → 4 sayılık c<sub>3</sub> = '+rowTxt(c3,3)+' (gerçek modelde 12 kafa × 64 = 768). Bu birleşik vektör W<sub>O</sub> ile karıştırılır (burada tek sayıya indiren çıktı katmanı).');
    src('mb_f_y','Çıktı katmanı (W_O) — birleşik vektörden y','y=c_3\\cdot W_O=\\sum_k c_{3k}\\,w_k',
      'y='+c3.map((v,k)=>t(v,3)+'\\cdot'+tp(WO[k],1)).join('+')+'='+t(y,3),
      '💬 W<sub>O</sub> = '+rowTxt(WO,1)+': <b>kafaların çıktılarını harmanlayan</b> katman — ilk iki ağırlık kafa 1\'in, son ikisi kafa 2\'nin çıktısına ne kadar güvenileceğini belirler.');
    src('mb_f_l','Kayıp','L=\\tfrac12\\,(y-t)^2','L=\\tfrac12('+t(y,3)+'-'+t(tg,2)+')^2='+t(L,4),'💬 Çıktı hedeften ne kadar uzaksa kayıp o kadar büyük.');
    // ---- geri ----
    src('mb_Ly','∂L/∂y','\\dfrac{\\partial L}{\\partial y}=y-t','y-t='+t(y,3)+'-'+t(tg,2)+'=\\mathbf{'+t(e,3)+'}','💬 Kuvvet kuralı + ½ sadeleşir. İşaret: '+(e<0?'çıktıyı <b>artırmak</b> kaybı düşürür.':'çıktıyı <b>azaltmak</b> kaybı düşürür.')+'<br>🔗 Bu sayı ('+f(e,3)+') ağacın geri kalanında çarpan olarak taşınır.');
    src('mb_yw','∂y/∂W_O — çıktı ağırlıkları (yaprak)','\\dfrac{\\partial L}{\\partial w_k}=e\\cdot c_{3k}',
      '\\dfrac{\\partial L}{\\partial W_O}='+tp(e,3)+rowN(c3)+'=\\mathbf{'+rowN(dw)+'}','💬 y = Σ c<sub>3k</sub>w<sub>k</sub> → ∂y/∂w<sub>k</sub> = c<sub>3k</sub>. <br>🔗 <b>Yaprak:</b> gradyan = e × c<sub>3</sub> = '+rowTxt(dw,3)+'.');
    src('mb_yc','∂y/∂c₃ — birleşik vektöre','\\dfrac{\\partial L}{\\partial c_3}=e\\cdot W_O','\\dfrac{\\partial L}{\\partial c_3}='+tp(e,3)+rowN(WO)+'=\\mathbf{'+rowN(dc)+'}',
      '💬 y = c<sub>3</sub>·W<sub>O</sub> → ∂y/∂c<sub>3k</sub> = w<sub>k</sub>. <br>🔗 Concat geri yolda <b>ters çevrilir</b>: bu 4 sayılık sinyal <b>ikiye bölünür</b> — ilk iki sayı kafa 1\'e, son iki sayı kafa 2\'ye. Ağaç burada iki kafaya dallanır.');
    heads.forEach(h=>{
      const n=h+1,g=gr[h],o=hd[h],s='^{'+n+'}',a3=g.a3;
      src('mb_cz'+n,'∂c₃/∂z₃ — Concat\'in türevi (kafa '+n+')','\\dfrac{\\partial L}{\\partial z'+s+'_3}=\\left(\\dfrac{\\partial L}{\\partial c_3}\\right)_{'+(2*h+1)+','+(2*h+2)+'}',
        '\\dfrac{\\partial L}{\\partial z'+s+'_3}='+rowN(g.dz),
        '💬 Concat yalnız yan yana yapıştırmaydı, türevi de <b>kopya-kes</b>: c<sub>3</sub>\'ün '+(2*h+1)+'. ve '+(2*h+2)+'. sayılarına gelen sinyal kafa '+n+'\'in z<sub>3</sub>\'üne olduğu gibi gider.<br>🔗 <b>Kafa '+n+'</b> dz = '+rowTxt(g.dz,3)+'. Bundan sonrası tek-kafalı attention\'ın geri yolu (🎯 Self-Attention → Bütün Resim) — her kafa <b>kendi başına</b> yürür.');
      src('mb_zV'+n,'∂z₃/∂V — karışımdan içeriklere (kafa '+n+')','\\dfrac{\\partial L}{\\partial v'+s+'_j}=A'+s+'_{3j}\\cdot\\dfrac{\\partial L}{\\partial z'+s+'_3}',
        [0,1,2].map(j=>'dv_{'+(j+1)+'}='+t(a3[j],3)+rowN(g.dz)+'='+rowN(g.dV[j])).join(',\\ '),
        '💬 z<sub>3</sub> = Σ A<sub>3j</sub>·v<sub>j</sub> → her içerik, dikkat payı kadar sinyal alır ('+W[0]+': %'+Math.round(a3[0]*100)+', '+W[1]+': %'+Math.round(a3[1]*100)+', '+W[2]+': %'+Math.round(a3[2]*100)+').<br>🔗 Sonraki halka V = X·W<sub>V</sub>.');
      src('mb_VW'+n,'∂V/∂W_V — içerik matrisinin gradyanı, kafa '+n+' (yaprak)','\\dfrac{\\partial L}{\\partial W'+s+'_V}=X^{\\top}\\,dV',
        '\\dfrac{\\partial L}{\\partial W_{V,11}}=\\sum_jx_{j1}\\,dV_{j1}='+[0,1,2].map(j=>t(X[j][0],2)+tp(g.dV[j][0],3)).join('+')+'='+t(g.dWV[0][0],3),
        '💬 Aynı W<sub>V</sub> üç kelimenin içeriğini üretti; gradyanı da <b>üç kelimeden toplanır</b> (4×2 matris, ilk satırı: '+rowTxt(g.dWV[0],3)+').<br>🔗 <b>Yaprak:</b> kafa '+n+'\'in W<sub>V</sub>\'sini güncelleyecek 8 sayı.');
      src('mb_zA'+n,'∂z₃/∂A₃ — karışımdan yüzdelere (kafa '+n+')','\\dfrac{\\partial L}{\\partial A'+s+'_{3j}}=\\dfrac{\\partial L}{\\partial z'+s+'_3}\\cdot v'+s+'_j',
        [0,1,2].map(j=>'dA_{3'+(j+1)+'}='+t(g.dz[0],3)+'\\cdot'+tp(o.V[j][0],3)+'+'+tp(g.dz[1],3)+'\\cdot'+tp(o.V[j][1],3)+'='+t(g.dA[j],3)).join(',\\ '),
        '💬 Yüzde j\'yi artırmak çıktıyı v<sub>j</sub> yönüne iter; o yön hataya iyi geliyorsa gradyan negatiftir.<br>🔗 Yüzdeler softmax\'ten çıktı → şimdi skorlara.');
      src('mb_AS'+n,'∂A₃/∂S₃ — softmax\'in türevi (kafa '+n+')','\\dfrac{\\partial L}{\\partial S'+s+'_{3j}}=A'+s+'_{3j}\\Big(dA_{3j}-\\sum_kA'+s+'_{3k}dA_{3k}\\Big)',
        '\\sum_kA_{3k}dA_{3k}='+t(g.sm,4)+'\\ \\Rightarrow\\ dS_3='+rowN(g.dS),
        '💬 Softmax\'te bir skoru artırmak diğer yüzdeleri düşürür; sinyal satırın <b>ağırlıklı ortalamasından</b> ('+f(g.sm,3)+') farkıyla ölçülür.<br>'+[0,1,2].map(j=>'dS<sub>3'+(j+1)+'</sub> = '+f(a3[j],3)+'·('+f(g.dA[j],3)+' − ('+f(g.sm,3)+')) = <b>'+f(g.dS[j],3)+'</b>').join('<br>'));
      src('mb_Sq'+n,'∂S₃/∂q₃ — skordan sorguya (kafa '+n+')','\\dfrac{\\partial L}{\\partial q'+s+'_3}=\\dfrac{1}{\\sqrt{d_k}}\\sum_jdS_{3j}\\,k_j',
        'dq_3=\\tfrac{1}{\\sqrt2}\\big('+[0,1,2].map(j=>tp(g.dS[j],3)+rowN(o.K[j])).join('+')+'\\big)='+rowN(g.dq),
        '💬 S<sub>3j</sub> = q<sub>3</sub>·k<sub>j</sub>/√d<sub>k</sub> → ∂/∂q<sub>3</sub> = k<sub>j</sub>/√d<sub>k</sub>. Sorgu, hedefe uyan etiketlere doğru kaymak ister.');
      src('mb_qW'+n,'∂q₃/∂W_Q — sorgu matrisinin gradyanı, kafa '+n+' (yaprak)','\\dfrac{\\partial L}{\\partial W'+s+'_Q}=x_3^{\\top}\\,dq_3',
        '\\dfrac{\\partial L}{\\partial W'+s+'_Q}='+colN(X[2])+rowN(g.dq)+'=\\ '+matN(g.dWQ),
        '💬 q<sub>3</sub> = x<sub>3</sub>·W<sub>Q</sub>: yalnız <b>x<sub>3</sub></b> besler (kayıp yalnız son kelimeye bağlı → q<sub>1</sub>, q<sub>2</sub> kullanılmadı). 4×2 matris: dış çarpım x<sub>3</sub>ᵀ·dq<sub>3</sub>.<br>🔗 <b>Yaprak:</b> kafa '+n+' için W<sub>Q</sub> gradyanı.');
      src('mb_SK'+n,'∂S₃/∂K — skordan etiketlere (kafa '+n+')','\\dfrac{\\partial L}{\\partial k'+s+'_j}=\\dfrac{dS_{3j}}{\\sqrt{d_k}}\\;q_3',
        [0,1,2].map(j=>'dk_{'+(j+1)+'}='+rowN(g.dK[j])).join(',\\ '),
        '💬 Her etiket, kendi skor sinyali kadar q<sub>3</sub> yönünde itilir.<br>🔗 K = X·W<sub>K</sub> → gradyan üç kelimeden toplanır.');
      src('mb_KW'+n,'∂K/∂W_K — etiket matrisinin gradyanı, kafa '+n+' (yaprak)','\\dfrac{\\partial L}{\\partial W'+s+'_K}=X^{\\top}\\,dK',
        '\\dfrac{\\partial L}{\\partial W_{K,11}}=\\sum_jx_{j1}\\,dK_{j1}='+[0,1,2].map(j=>t(X[j][0],2)+tp(g.dK[j][0],3)).join('+')+'='+t(g.dWK[0][0],3),
        '💬 Aynı W<sub>K</sub> üç kelimenin etiketini üretti; gradyan üç kelimeden toplanır (ilk satır: '+rowTxt(g.dWK[0],3)+').<br>🔗 Kafa '+n+'\'in üç matrisi (W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>) tamam.');
    });
    const mx=h=>Math.max(...[gr[h].dWQ,gr[h].dWK,gr[h].dWV].flat(2).map(Math.abs));
    $('mbVerdict').innerHTML='🔑 <b>Yedi yaprak, tek kayıp:</b> W<sub>O</sub> ve iki kafanın üçer matrisi. Concat geri yolda <b>kopya-kes</b> ile ikiye bölündü; her kafa kendi dz\'sini aldı ve tek-kafalı attention gibi geri yürüdü. En büyük gradyan: kafa 1 → '+f(mx(0),3)+', kafa 2 → '+f(mx(1),3)+' (W<sub>O</sub>\'daki ağırlığı <b>'+(Math.abs(dc[0])+Math.abs(dc[1])>Math.abs(dc[2])+Math.abs(dc[3])?'kafa 1':'kafa 2')+'</b> için daha büyük). İki kafa <b>aynı hatadan farklı sinyal</b> aldığı için farklı yönlere gidiyor — uzmanlaşmanın kaynağı bu.';
    window.__mhBig={X,t:tg,hd,C,y,L,e,dw,dc,gr};
  }
  const M=window.MathJax;fill();
  if(M&&M.startup&&M.startup.promise)M.startup.promise.then(()=>M.typesetPromise&&M.typesetPromise([host]).catch(()=>{}));
})();

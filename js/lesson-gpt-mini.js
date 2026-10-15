// GPT Test — "Minik GPT": pencere + tek gizli katman yerine TEK KATMANLI, TEK KAFALI self-attention (decoder-only) bloğu.
// x_i = E[karakter_i] + P_i  →  q=x_son·W_Q, K=x·W_K, V=x·W_V  →  a=softmax(q·K/√d)  →  o=Σ a_i V_i
// r = x_son + o·W_O  →  h = r + FFN(r)  →  logits = h·W_out → softmax. (LayerNorm ve çok kafa yok; gerçek GPT'de var.)
// Eğitim: aynı metin, aynı (pencere→sonraki karakter) çiftleri, tam-yığın Adam. Python (mgpt.py) ile aynı sayıları üretir.
(function(){
  const G=window.__gpt; if(!G) return;
  const $=id=>document.getElementById(id);
  const {N,V,CHARS,SM,padOf,DOT,esc}=G;
  const D=16,M=32,LR=0.01,EPMAX=800,NS=SM.Y.length,SQ=Math.sqrt(D);
  const lcg=s=>()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};
  const SHAPES={E:V*D,P:N*D,WQ:D*D,WK:D*D,WV:D*D,WO:D*D,W1:D*M,b1:M,W2:M*D,b2:D,Wo:D*V,bo:V};
  let P,Mo,Vv,ep,hist,seedNow=1,E0;
  function init(seed){
    seedNow=seed;const r=lcg(seed),U=(n,sc)=>{const a=new Float64Array(n);for(let i=0;i<n;i++)a[i]=(r()-.5)*2*sc;return a;},sd=1/Math.sqrt(D);
    P={E:U(V*D,.5),P:U(N*D,.5),WQ:U(D*D,sd),WK:U(D*D,sd),WV:U(D*D,sd),WO:U(D*D,sd),W1:U(D*M,sd),b1:new Float64Array(M),W2:U(M*D,1/Math.sqrt(M)),b2:new Float64Array(D),Wo:U(D*V,sd),bo:new Float64Array(V)};
    Mo={};Vv={};for(const k in P){Mo[k]=new Float64Array(P[k].length);Vv[k]=new Float64Array(P[k].length);}
    E0=Float64Array.from(P.E);ep=0;hist=[lossOf()];
  }
  function newCache(){return {x:new Float64Array(N*D),q:new Float64Array(D),K:new Float64Array(N*D),V:new Float64Array(N*D),s:new Float64Array(N),a:new Float64Array(N),o:new Float64Array(D),r:new Float64Array(D),u:new Float64Array(M),g:new Float64Array(M),f:new Float64Array(D),h:new Float64Array(D),lg:new Float64Array(V),p:new Float64Array(V)};}
  function fwd1(ctx,c){
    const x=c.x,q=c.q,K=c.K,Vc=c.V,s=c.s,a=c.a,o=c.o,r=c.r,u=c.u,g=c.g,f=c.f,h=c.h,lg=c.lg,p=c.p,L=(N-1)*D;
    for(let i=0;i<N;i++){const e=ctx[i]*D,pp=i*D;for(let k=0;k<D;k++)x[pp+k]=P.E[e+k]+P.P[pp+k];}
    for(let k=0;k<D;k++){let t=0;for(let j=0;j<D;j++)t+=x[L+j]*P.WQ[j*D+k];q[k]=t;}
    for(let i=0;i<N;i++){const pp=i*D;for(let k=0;k<D;k++){let t=0,w=0;for(let j=0;j<D;j++){const xv=x[pp+j];t+=xv*P.WK[j*D+k];w+=xv*P.WV[j*D+k];}K[pp+k]=t;Vc[pp+k]=w;}}
    let mx=-1e300;for(let i=0;i<N;i++){let t=0;for(let k=0;k<D;k++)t+=q[k]*K[i*D+k];s[i]=t/SQ;if(s[i]>mx)mx=s[i];}
    let z=0;for(let i=0;i<N;i++){a[i]=Math.exp(s[i]-mx);z+=a[i];}for(let i=0;i<N;i++)a[i]/=z;
    for(let k=0;k<D;k++){let t=0;for(let i=0;i<N;i++)t+=a[i]*Vc[i*D+k];o[k]=t;}
    for(let k=0;k<D;k++){let t=0;for(let j=0;j<D;j++)t+=o[j]*P.WO[j*D+k];r[k]=x[L+k]+t;}
    for(let cc=0;cc<M;cc++){let t=P.b1[cc];for(let j=0;j<D;j++)t+=r[j]*P.W1[j*M+cc];u[cc]=t;g[cc]=Math.tanh(t);}
    for(let k=0;k<D;k++){let t=P.b2[k];for(let cc=0;cc<M;cc++)t+=g[cc]*P.W2[cc*D+k];f[k]=t;h[k]=r[k]+t;}
    mx=-1e300;for(let v=0;v<V;v++){let t=P.bo[v];for(let k=0;k<D;k++)t+=h[k]*P.Wo[k*V+v];lg[v]=t;if(t>mx)mx=t;}
    z=0;for(let v=0;v<V;v++){p[v]=Math.exp(lg[v]-mx);z+=p[v];}for(let v=0;v<V;v++)p[v]/=z;
    return c;
  }
  function lossOf(){const c=newCache();let L=0;for(let i=0;i<NS;i++){fwd1(SM.X[i],c);L-=Math.log(c.p[SM.Y[i]]);}return L/NS;}
  function step(){
    const Gr={};for(const k in P)Gr[k]=new Float64Array(P[k].length);
    const c=newCache(),dl=new Float64Array(V),dh=new Float64Array(D),dg=new Float64Array(M),du=new Float64Array(M),dr=new Float64Array(D),dxl=new Float64Array(D),dO=new Float64Array(D),da=new Float64Array(N),ds=new Float64Array(N),dq=new Float64Array(D),dK=new Float64Array(N*D),dV=new Float64Array(N*D),dx=new Float64Array(N*D);
    const L0=(N-1)*D;
    for(let n=0;n<NS;n++){
      const ctx=SM.X[n],y=SM.Y[n];fwd1(ctx,c);
      for(let v=0;v<V;v++)dl[v]=c.p[v];dl[y]-=1;for(let v=0;v<V;v++)dl[v]/=NS;
      for(let k=0;k<D;k++){let t=0;for(let v=0;v<V;v++){t+=dl[v]*P.Wo[k*V+v];Gr.Wo[k*V+v]+=c.h[k]*dl[v];}dh[k]=t;}
      for(let v=0;v<V;v++)Gr.bo[v]+=dl[v];
      for(let cc=0;cc<M;cc++){let t=0;for(let k=0;k<D;k++){t+=dh[k]*P.W2[cc*D+k];Gr.W2[cc*D+k]+=c.g[cc]*dh[k];}dg[cc]=t;du[cc]=t*(1-c.g[cc]*c.g[cc]);}
      for(let k=0;k<D;k++)Gr.b2[k]+=dh[k];
      for(let j=0;j<D;j++){let t=0;for(let cc=0;cc<M;cc++){t+=du[cc]*P.W1[j*M+cc];Gr.W1[j*M+cc]+=c.r[j]*du[cc];}dr[j]=dh[j]+t;}
      for(let cc=0;cc<M;cc++)Gr.b1[cc]+=du[cc];
      for(let j=0;j<D;j++)dxl[j]=dr[j];
      for(let j=0;j<D;j++){let t=0;for(let k=0;k<D;k++){t+=dr[k]*P.WO[j*D+k];Gr.WO[j*D+k]+=c.o[j]*dr[k];}dO[j]=t;}
      let sa=0;
      for(let i=0;i<N;i++){let t=0;for(let k=0;k<D;k++){dV[i*D+k]=c.a[i]*dO[k];t+=c.V[i*D+k]*dO[k];}da[i]=t;sa+=c.a[i]*t;}
      for(let i=0;i<N;i++)ds[i]=c.a[i]*(da[i]-sa);
      for(let k=0;k<D;k++){let t=0;for(let i=0;i<N;i++)t+=ds[i]*c.K[i*D+k];dq[k]=t/SQ;}
      for(let i=0;i<N;i++)for(let k=0;k<D;k++)dK[i*D+k]=ds[i]*c.q[k]/SQ;
      for(let j=0;j<D;j++){let t=0;for(let k=0;k<D;k++){t+=dq[k]*P.WQ[j*D+k];Gr.WQ[j*D+k]+=c.x[L0+j]*dq[k];}dxl[j]+=t;}
      for(let i=0;i<N;i++)for(let j=0;j<D;j++){let t=0;const xv=c.x[i*D+j];for(let k=0;k<D;k++){t+=dK[i*D+k]*P.WK[j*D+k]+dV[i*D+k]*P.WV[j*D+k];Gr.WK[j*D+k]+=xv*dK[i*D+k];Gr.WV[j*D+k]+=xv*dV[i*D+k];}dx[i*D+j]=t;}
      for(let j=0;j<D;j++)dx[L0+j]+=dxl[j];
      for(let i=0;i<N;i++)for(let j=0;j<D;j++){Gr.E[ctx[i]*D+j]+=dx[i*D+j];Gr.P[i*D+j]+=dx[i*D+j];}
    }
    ep++;const t=ep;
    for(const k in P){const w=P[k],g=Gr[k],m=Mo[k],vv=Vv[k];for(let i=0;i<w.length;i++){m[i]=0.9*m[i]+0.1*g[i];vv[i]=0.999*vv[i]+0.001*g[i]*g[i];w[i]-=LR*(m[i]/(1-Math.pow(0.9,t)))/(Math.sqrt(vv[i]/(1-Math.pow(0.999,t)))+1e-8);}}
    hist.push(lossOf());
  }
  function gen(prompt,mx){
    const ctx=padOf(prompt).slice(-N),c=newCache();let out='';mx=mx||30;
    for(let t=0;t<mx;t++){fwd1(ctx,c);let b=0;for(let v=1;v<V;v++)if(c.p[v]>c.p[b])b=v;if(b===DOT)break;out+=CHARS[b];ctx.shift();ctx.push(b);}
    return out;
  }

  window.__gptMini={init,step,gen,lossOf,fwd1,newCache,get ep(){return ep;},get hist(){return hist;},get P(){return P;},get E0(){return E0;},D,M,N,V,EPMAX};
  init(1);

  /* ================= arayüz ================= */
  const host=window.__gptHost; if(!host) return;
  const fm=(v,d=2)=>v.toFixed(d).replace('.',',');
  const pct=v=>'%'+Math.round(v*100);
  const chOf=i=>CHARS[i]==='.'?'.':CHARS[i];
  const st=document.createElement('style');st.textContent='.gm-fsonly{display:none}.gm-box.gm-full{position:fixed;inset:0;z-index:99999;background:#0b1020;padding:14px 18px;overflow:auto;box-sizing:border-box}.gm-box.gm-full .gm-fsonly{display:inline-flex}.gm-box.gm-full #gm_svg{min-width:0!important;max-width:none!important;width:100%!important;height:auto}@media(min-width:900px){.gm-box.gm-full #gm_svg{height:calc(100vh - 240px)}}.gm-box.gm-full #gm_cap{font-size:15px;line-height:1.75}';document.head.appendChild(st);
  const grid=host.querySelector('.gt-grid');
  grid.insertAdjacentHTML('beforeend',
   '<div class="gt-card"><div class="gt-t">🔦 Minik GPT <span style="color:var(--muted);font-weight:400">(self-attention, 1 blok)</span></div>'+
    '<div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-bottom:6px"><label style="font-size:12.5px">tohum <select id="gm_seed" class="rex-sel"><option>1</option><option>2</option><option>3</option></select></label><button class="rex-btn" id="gm_e1">🔧 +1</button><button class="rex-btn" id="gm_e10">+10</button><button class="rex-btn" id="gm_e100">+100</button><button class="rex-btn" id="gm_go">▶ eğit</button><button class="rex-btn" id="gm_rst">↺</button></div>'+
    '<div id="gm_st" style="font-size:12.5px;margin-bottom:4px"></div><div class="gt-out" id="gm_o"></div><div id="gm_sc"></div>'+
    '<svg id="gm_curve" viewBox="0 0 320 90" style="width:100%;max-width:340px;margin-top:6px"></svg></div>');
  const NOTA=[['E','gömme tablosu: her karakter için 16 sayı (öğrenilir)','40×16'],['P','konum vektörleri: pencerede kaçıncı sırada olduğunu söyler (öğrenilir)','10×16'],['x<sub>i</sub>','i. karakterin girdisi = E[karakter] + P<sub>i</sub>','16'],['W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>','x\'ten sorgu / anahtar / değer üreten matrisler (öğrenilir)','16×16'],['q','SON karakterin sorgusu: "sıradaki karakteri bulmak için neye bakmalıyım?"','16'],['K<sub>i</sub>','i. karakterin anahtarı: "bende şu bilgi var"','16'],['V<sub>i</sub>','i. karakterin değeri: seçilirse taşıyacağı içerik','16'],['s<sub>i</sub>','skor = q·K<sub>i</sub> ÷ √16 (benzerlik)','1'],['a<sub>i</sub>','dikkat = softmax(s): pencerenin neresine yüzde kaç bakılıyor','1 (toplam %100)'],['o','Σ a<sub>i</sub>·V<sub>i</sub>: değerlerin dikkate göre karışımı','16'],['W<sub>O</sub>','dikkat çıktısını x ile aynı uzaya döndürür (öğrenilir)','16×16'],['r','x<sub>son</sub> + o·W<sub>O</sub> (artık bağlantı: x aynen geçer, dikkat üstüne ekler)','16'],['W<sub>1</sub>,W<sub>2</sub>','FFN: r\'yi 32 nörona açar, tanh, tekrar 16\'ya indirir (öğrenilir)','16×32, 32×16'],['h','r + FFN(r) (ikinci artık bağlantı)','16'],['W<sub>out</sub>','h\'yi 40 karakterin ham skoruna çevirir (öğrenilir)','16×40'],['p','softmax(logits): sonraki karakterin olasılıkları','40']];
  const arch=document.createElement('div');arch.id='gmArch';arch.style.cssText='margin-top:14px';
  arch.innerHTML=
   '<div style="font-size:14px;color:#ccd5e8;margin-bottom:4px"><b>🏗️ Minik GPT\'nin mimarisi</b> (bu kartta eğittiğin ağın tam şeması)</div>'+
   '<div style="font-size:13px;color:#aeb9d4;line-height:1.7;margin-bottom:6px">Şema <b>yukarıdaki başlangıç kutusundaki yazıyı</b> okur (şu an: <code id="gm_pv"></code>); son 10 karakterlik pencereyi alır. Renkli kutular 16 sayılık vektörlerin <b>gerçek değerleri</b> (<span style="color:#5aa0e0">mavi +</span>, <span style="color:#e06a6a">kırmızı −</span>, koyu = sıfıra yakın). Eğitmeden önce ağırlıklar rastgele, eğitince şema değişir.</div>'+
   '<div id="gmFull" class="gm-box">'+
   '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:6px"><button class="rex-btn" id="gm_prev" title="Bir adım geri">◀ Geri</button><button class="rex-btn" id="gm_next">İleri ▶</button><button class="rex-btn" id="gm_all">↺ hepsi birden</button><button class="rex-btn" id="gm_add" title="Modelin seçtiği karakteri başlangıç yazısının sonuna ekler ve şemayı baştan çalıştırır">➕ Seçileni ekle ▶</button><span class="gm-fsonly" style="align-items:center;gap:4px;font-size:12.5px">başlangıç: <input id="gm_p2" class="rex-sel" style="width:190px;background:#0e1424;color:#ccd5e8;border:1px solid var(--line);border-radius:6px;padding:4px 8px" spellcheck="false"></span><span id="gm_stp" style="font-size:12.5px;color:#ffd54a"></span><button class="rex-btn" id="gm_fs" style="margin-left:auto">⛶ Tam ekran</button><button class="rex-btn gm-fsonly" id="gm_x">✕ Kapat (Esc)</button></div>'+
   '<div style="overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#0e1424"><svg id="gm_svg" viewBox="0 0 1000 770" style="display:block;min-width:900px;width:100%;max-width:1100px;margin:auto"></svg></div>'+
   '<div class="callout" id="gm_cap" style="margin-top:8px"></div></div>'+
   '<div style="font-size:12px;color:var(--muted);margin-top:4px">Boyutlar: E 40×16 · P 10×16 · W<sub>Q</sub>,W<sub>K</sub>,W<sub>V</sub>,W<sub>O</sub> 16×16 · W<sub>1</sub> 16×32 · W<sub>2</sub> 32×16 · W<sub>out</sub> 16×40 · toplam <b>3.576 parametre</b>. Gerçek GPT\'den farkları: <b>1</b> katman (onlarca), <b>1</b> kafa (onlarca), LayerNorm yok, karakter bazlı.</div>'+
   '<div class="acc" style="margin-top:8px"><div class="acc-head"><span class="ac">▸</span> 📑 Notasyon: şemadaki her harf ne demek?</div><div class="acc-body"><div style="overflow-x:auto"><table class="rex-tbl" style="font-size:12.5px"><tr><th>simge</th><th>anlamı</th><th>boyut</th></tr>'+NOTA.map(r=>'<tr><td><b>'+r[0]+'</b></td><td>'+r[1]+'</td><td>'+r[2]+'</td></tr>').join('')+'</table></div></div></div>';
  grid.insertAdjacentElement('afterend',arch);
  arch.querySelectorAll('.acc-head').forEach(h=>h.addEventListener('click',e=>{e.stopPropagation();h.closest('.acc').classList.toggle('open');}));

  /* ----- E tablosu görünümü ----- */
  const ET=document.createElement('div');ET.className='acc open';ET.style.marginTop='8px';ET.id='gmETab';
  ET.innerHTML='<div class="acc-head"><span class="ac">▸</span> 📚 E tablosu (gömme, 40×16) — şimdi nasıl göründüğüne bak</div><div class="acc-body"><div style="font-size:13px;color:#aeb9d4;line-height:1.7;margin-bottom:6px">Her satır bir karakterin 16 sayılık vektörü (<span style="color:#5aa0e0">mavi +</span>, <span style="color:#e06a6a">kırmızı −</span>). <b style="color:#ffd54a">Sarı çerçeveli</b> satırlar şu anki pencerede kullanılanlar. Sağdaki çubuk karakterin <b>eğitim metninde kaç kez geçtiğini</b> gösterir. Eğitmeden önceki <b>rastgele</b> haline ve eğitilmiş haline geçip karşılaştır; bir satırın üstüne gelince sayıları görürsün.</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px"><button class="rex-btn" id="gm_et_now">Şimdiki E</button><button class="rex-btn" id="gm_et_0">Başlangıç (rastgele)</button><span id="gm_et_info" style="font-size:12.5px;color:#ffd54a;align-self:center"></span></div><div style="overflow-x:auto"><svg id="gm_et" viewBox="0 0 480 640" style="display:block;width:100%;max-width:520px;margin:auto"></svg></div></div>';
  $('gmFull').insertAdjacentElement('afterend',ET);
  ET.querySelector('.acc-head').addEventListener('click',e=>{e.stopPropagation();ET.classList.toggle('open');});
  let etMode='now';
  const CNT=new Array(V).fill(0);G.TRAINADD.concat(G.DIAL.map(x=>x[0]+'>'+x[1]+'.')).join('').split('').forEach(ch=>{const k=G.IX[ch];if(k!==undefined)CNT[k]++;});
  const CMAX=Math.max.apply(null,CNT);
  function drawE(ctx){
    const E=etMode==='now'?P.E:E0,used={};(ctx||[]).forEach((c,i)=>{(used[c]=used[c]||[]).push(i);});
    let o='';
    o+='<text x="60" y="12" font-size="10" fill="#8a99bd">16 sayı (her satır bir karakter)</text><text x="396" y="12" font-size="10" fill="#8a99bd">metinde kaç kez</text>';
    for(let v=0;v<V;v++){
      const y=18+v*15,u=used[v];
      o+='<g class="gm-erow" data-v="'+v+'">';
      o+='<rect x="0" y="'+y+'" width="480" height="15" fill="transparent"/>';
      o+='<text x="26" y="'+(y+11)+'" font-size="11.5" fill="'+(u?'#ffd54a':'#ccd5e8')+'" text-anchor="end" font-family="ui-monospace,Consolas,monospace">'+esc(chOf(v)===' '?'␣':chOf(v))+'</text><text x="52" y="'+(y+11)+'" font-size="9" fill="#6a7a9a" text-anchor="end">'+v+'</text>';
      for(let k=0;k<D;k++){const val=E[v*D+k],t=Math.min(1,Math.abs(val)/SC);o+='<rect x="'+(60+k*20)+'" y="'+(y+1)+'" width="20" height="13" fill="'+(val>=0?'#5aa0e0':'#e06a6a')+'" fill-opacity="'+(0.08+0.92*t).toFixed(2)+'"/>';}
      if(u)o+='<rect x="59" y="'+y+'" width="322" height="15" fill="none" stroke="#ffd54a" stroke-width="1.6"/>';
      const w=CNT[v]/CMAX*70;
      o+='<rect x="396" y="'+(y+3)+'" width="'+w.toFixed(1)+'" height="9" fill="'+(CNT[v]?'#46c46a':'#3a4666')+'" fill-opacity=".8"/><text x="'+(398+w)+'" y="'+(y+11)+'" font-size="9.5" fill="#aeb9d4">'+CNT[v]+'</text>';
      o+='</g>';
    }
    $('gm_et').innerHTML=o;
    $('gm_et_now').style.outline=etMode==='now'?'2px solid #ffd54a':'none';$('gm_et_0').style.outline=etMode==='0'?'2px solid #ffd54a':'none';
  }
  $('gm_et_now').onclick=()=>{etMode='now';drawE(cur().ctx);};
  $('gm_et_0').onclick=()=>{etMode='0';drawE(cur().ctx);};
  $('gm_et').addEventListener('mousemove',e=>{
    const g=e.target.closest&&e.target.closest('.gm-erow');if(!g){$('gm_et_info').textContent='';return;}
    const v=+g.dataset.v,E=etMode==='now'?P.E:E0;
    $('gm_et_info').textContent='«'+(chOf(v)===' '?'boşluk':chOf(v))+'» (kimlik '+v+'): ['+Array.from(E.slice(v*D,v*D+6)).map(x=>fm(x,2)).join('; ')+' …] · metinde '+CNT[v]+' kez';
  });

  /* ----- şema çizimi ----- */
  const CX=i=>100+44*i,SC=1.5;
  function chip(x,y,w,h,vec,off,scale){
    const cw=w/8,chh=h/2;let o='';
    for(let i=0;i<16;i++){const v=vec[off+i],t=Math.min(1,Math.abs(v)/(scale||SC));o+='<rect x="'+(x+(i%8)*cw).toFixed(2)+'" y="'+(y+Math.floor(i/8)*chh).toFixed(2)+'" width="'+(cw+.25).toFixed(2)+'" height="'+(chh+.25).toFixed(2)+'" fill="'+(v>=0?'#5aa0e0':'#e06a6a')+'" fill-opacity="'+(0.1+0.9*t).toFixed(2)+'"/>';}
    return o+'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="none" stroke="#56658a" stroke-width=".7"/>';
  }
  const arrow=(x1,y1,x2,y2,col,dash)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(col||'#8a99bd')+'" stroke-width="1.3"'+(dash?' stroke-dasharray="4 3"':'')+' marker-end="url(#gmAr)"/>';
  const txt=(x,y,t,sz,col,anc,extra)=>'<text x="'+x+'" y="'+y+'" font-size="'+(sz||11)+'" fill="'+(col||'#ccd5e8')+'"'+(anc?' text-anchor="'+anc+'"':'')+' font-family="Segoe UI, Arial"'+(extra||'')+'>'+t+'</text>';
  const box=(x,y,w,h,t,col,sz)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="6" fill="#141c33" stroke="'+col+'" stroke-width="1.6"/>'+txt(x+w/2,y+h/2+4,t,sz||11.5,'#ccd5e8','middle');
  const STEPS=[
    {k:['tok'],t:'karakterler'},{k:['emb'],t:'gömme E'},{k:['pos'],t:'konum P'},{k:['x'],t:'x = E + P'},{k:['kv','q'],t:'q, K, V'},{k:['s'],t:'skor'},{k:['a'],t:'dikkat (softmax)'},{k:['mix','o'],t:'karışım'},{k:['res1'],t:'W_O + artık bağlantı'},{k:['ffn'],t:'FFN'},{k:['res2'],t:'ikinci artık bağlantı'},{k:['out'],t:'çıkış katmanı'},{k:['prob'],t:'olasılıklar'}];
  const NSTEP=STEPS.length;
  const TIPS={
    tok:['Karakterler (girdi penceresi)','Yazdığın metnin son 10 karakteri. Boş yerler satır başı dolgusu (·). Her karakterin bir kimlik numarası var, ağ harf değil sayı görür.','Modele "bakabileceği" bütün bağlamı verir. Sarı çerçeveli son karakter, sıradaki karakteri tahmin edeceğimiz konumdur.'],
    emb:['Gömme tablosu E (40×16)','Her karakter için öğrenilen 16 sayılık bir satır. Kimlik numarası bu tabloda satır seçer.','Karakterin "kim olduğunu" taşır. Eğitimde benzer davranan karakterlerin (örn. rakamların) satırları birbirine benzer hâle gelir. Aynı karakter pencerenin neresinde olursa olsun aynı E satırını alır.'],
    pos:['Konum tablosu P (10×16)','Pencerenin 0. ... 9. yeri için öğrenilen 16 sayılık satırlar. Karakterden bağımsızdır, yalnızca yere bağlıdır.','Attention sırayı kendi başına bilmez: "7+5" ile "5+7" onun için aynı karakter kümesidir. P, "bu karakter kaçıncı yerde" bilgisini ekler.'],
    x:['x = E + P','Karakterin gömme vektörü ile konum vektörünün toplamı (16 sayı).','Tek vektörde hem "kim" hem "nerede" bilgisi. Bundan sonraki bütün katmanlar yalnız x ile çalışır. Aynı "7" farklı yerde farklı x verir.'],
    kv:['K ve V (her karakter için)','x\'in iki farklı matrisle (W_K, W_V) çarpılmasından çıkan iki 16 sayılık vektör.','K (anahtar): "bende şu bilgi var" etiketi, sorguyla eşleştirilir. V (değer): karakter seçilirse taşıyacağı içerik. İkisi ayrı olduğu için "neye bakacağını" ve "ne alacağını" ayrı öğrenebilir.'],
    q:['q: son karakterin sorgusu','Yalnız son karakterin x\'inden W_Q ile üretilen 16 sayı.','"Sıradaki karakteri bulmak için pencerenin neresine bakmalıyım?" sorusunu temsil eder. Bütün K\'lara karşı denenir.'],
    s:['Skor s = q·K ÷ √16','q ile her K\'nın nokta çarpımı (ham benzerlik), √16\'ya bölünmüş.','Büyük skor = "bu karakter şu an benim için ilgili". √16\'ya bölmek skorların aşırı büyüyüp softmax\'ı doyurmasını önler.'],
    a:['Dikkat a = softmax(s)','Skorların yüzdeye çevrilmiş hâli (toplam %100).','Pencerenin hangi karakterine yüzde kaç bakıldığını söyler. Eğitimle ağ, işe yarayan karakterlere (burada toplamada iki rakama) yüksek yüzde vermeyi öğrenir.'],
    mix:['a · V (ağırlıklı değerler)','Her karakterin V vektörü kendi dikkat yüzdesiyle çarpılır (silik kutu = az dikkat).','Az ilgili karakterlerin içeriği silinir, ilgili olanlarınki kalır.'],
    o:['o = Σ aᵢ·Vᵢ','Ağırlıklı değerlerin toplamı: pencerenin dikkatle süzülmüş tek özeti (16 sayı).','Attention bloğunun çıktısı. "Soruya cevap olabilecek bilgi" burada toplanır.'],
    res1:['W_O ve ilk artık bağlantı','o, W_O ile çarpılır, sonra x₁₀\'a eklenir: r = x₁₀ + o·W_O.','Artık bağlantı: son karakterin kendi bilgisi silinmez, dikkatin bulduğu bilgi üstüne eklenir. Derin ağlarda gradyanın bozulmadan akmasını da sağlar.'],
    ffn:['FFN (ileri besleme ağı)','r, 16→32 nörona açılır, tanh uygulanır, tekrar 16\'ya indirilir.','Dikkat "nereye bakacağını" buldu, FFN bulunan bilgiyi işler (ör. iki rakamı toplamak gibi). Her karakter için aynı küçük ağ kullanılır.'],
    res2:['İkinci artık bağlantı: h = r + FFN(r)','FFN çıktısı r\'ye eklenir.','FFN yalnız bir düzeltme üretir; r aynen korunur. h, bloğun nihai 16 sayılık çıktısıdır.'],
    out:['Çıkış katmanı W_out (16→40)','h, bir matrisle 40 karakterin ham skoruna (logit) çevrilir.','Her sözlük karakteri için "ne kadar uygun" skoru üretir.'],
    prob:['Softmax → olasılıklar','Ham skorlar olasılığa çevrilir (toplam %100). Sağda en olası 8 karakter.','En olası karakter seçilir, pencerenin sonuna eklenir ve bütün şema baştan çalışır: GPT\'nin üretim döngüsü.']};
  function cur(){const pr=$('gt_p').value;return {pr,ctx:padOf(pr).slice(-N),padN:Math.max(0,N-Array.from(pr).length)};}
  const f4=(vec,off)=>'['+[0,1,2,3].map(k=>fm(vec[off+k],2)).join('; ')+' …]';
  let LIVE={};
  let stepNow=0;
  function drawArch(){
    const {pr,ctx,padN}=cur(),c=fwd1(ctx,newCache()),L=(N-1)*D;
    $('gm_pv').textContent=pr;if(document.activeElement!==$('gm_p2'))$('gm_p2').value=pr;
    const act=k=>stepNow>0&&STEPS[stepNow-1].k.indexOf(k)>=0,dimOn=stepNow>0;
    const idx=Array.from({length:V},(_,i)=>i).sort((x,y)=>c.p[y]-c.p[x]);
    const sI=Array.from({length:N},(_,i)=>i).sort((x,y)=>c.s[y]-c.s[x]),aI=Array.from({length:N},(_,i)=>i).sort((x,y)=>c.a[y]-c.a[x]);
    const lastC=esc(chOf(ctx[N-1])),nAct=Array.from(c.g).filter(v=>Math.abs(v)>0.5).length;
    let hi=0;for(let v=1;v<V;v++)if(c.lg[v]>c.lg[hi])hi=v;
    LIVE={tok:'Şu an son karakter «'+lastC+'» → kimlik no '+ctx[N-1]+'.',emb:'«'+lastC+'» için E satırı: '+f4(P.E,ctx[N-1]*D),pos:'Son konum (i=9) için P satırı: '+f4(P.P,(N-1)*D),x:'x₁₀ = E + P: '+f4(c.x,L),kv:'K₁₀: '+f4(c.K,L)+'  ·  V₁₀: '+f4(c.V,L),q:'q: '+f4(c.q,0),s:'En yüksek skor: konum '+sI[0]+' «'+esc(chOf(ctx[sI[0]]))+'» (s='+fm(c.s[sI[0]],2)+').',a:'En çok bakılan: «'+esc(chOf(ctx[aI[0]]))+'» '+pct(c.a[aI[0]])+', sonra «'+esc(chOf(ctx[aI[1]]))+'» '+pct(c.a[aI[1]])+'.',mix:'Silik olmayan kutular: '+aI.slice(0,2).map(i=>'konum '+i).join(', ')+'.',o:'o: '+f4(c.o,0),res1:'r: '+f4(c.r,0),ffn:'32 nörondan '+nAct+' tanesi güçlü etkin (|tanh|>0,5).',res2:'h: '+f4(c.h,0),out:'En yüksek ham skor: «'+esc(chOf(hi))+'» ('+fm(c.lg[hi],1)+').',prob:'Seçilen: «'+esc(chOf(idx[0]))+'» '+pct(c.p[idx[0]])+'.'};
    // katman kutusu: rects=[[x,y,w,h],...]
    const layer=(k,rects,inner,title)=>{const a=act(k);let o='<g class="gm-layer" data-tip="'+k+'"'+(dimOn&&!a?' opacity="0.28"':'')+'>';
      rects.forEach((r,ri)=>{o+='<rect x="'+r[0]+'" y="'+r[1]+'" width="'+r[2]+'" height="'+r[3]+'" rx="8" fill="'+(a?'rgba(255,213,74,.10)':'rgba(255,255,255,.018)')+'" stroke="'+(a?'#ffd54a':'#34426a')+'" stroke-width="'+(a?2:1)+'"'+(a?' stroke-dasharray="5 4"':'')+'/>';});
      if(title)o+=txt(title[0],title[1],title[2],10.5,a?'#ffd54a':'#95a2c2');
      return o+inner+'</g>';};
    let o='<defs><marker id="gmAr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#8a99bd"/></marker></defs>';
    o+='<g>'+'<rect x="10" y="14" width="12" height="8" fill="#5aa0e0"/>'+txt(26,22,'pozitif sayı',10,'#95a2c2')+'<rect x="10" y="28" width="12" height="8" fill="#e06a6a"/>'+txt(26,36,'negatif sayı',10,'#95a2c2')+txt(10,52,'her renkli kutu = 16 sayılık vektör',10,'#95a2c2')+'<rect x="10" y="58" width="12" height="8" fill="none" stroke="#ffd54a" stroke-width="1.5"/>'+txt(26,66,'tahmin yapılan son karakter',10,'#95a2c2')+txt(10,84,'kutuların üstüne gel: ne olduğunu ve ne işe yaradığını söyler',10,'#ffd54a')+'</g>';
    // ---- bölge 1: pencere sütunları ----
    let t='';for(let i=0;i<N;i++){const x=CX(i),isPad=i<padN,last=i===N-1;
      t+='<rect x="'+(x-17)+'" y="712" width="34" height="24" rx="5" fill="'+(last?'#2a3560':'#141c33')+'" stroke="'+(last?'#ffd54a':'#56658a')+'" stroke-width="'+(last?1.8:1)+'"/>'+txt(x,730,isPad?'·':esc(chOf(ctx[i])),15,isPad?'#5a6a8a':'#ccd5e8','middle',' font-family="ui-monospace,Consolas,monospace"')+txt(x,752,'i='+i,9,last?'#ffd54a':'#7080a8','middle');}
    o+=layer('tok',[[2,704,516,54]],t,[8,732,'karakter']);
    t='';for(let i=0;i<N;i++)t+=chip(CX(i)-17,664,34,14,P.E,ctx[i]*D);
    o+=layer('emb',[[2,658,516,30]],t,[8,677,'gömme E']);
    t='';for(let i=0;i<N;i++)t+=chip(CX(i)-17,640,34,14,P.P,i*D);
    o+=layer('pos',[[2,630,516,28]],t,[8,651,'konum P']);
    t='';for(let i=0;i<N;i++)t+=chip(CX(i)-17,606,34,14,c.x,i*D);
    o+=layer('x',[[2,596,516,30]],t,[8,617,'x = E + P']);
    t='';for(let i=0;i<N;i++){const x=CX(i);t+=chip(x-22,554,20,14,c.K,i*D,2)+chip(x+2,554,20,14,c.V,i*D,2)+txt(x-12,550,'K',8.5,'#e6b455','middle')+txt(x+12,550,'V',8.5,'#b78bf0','middle');}
    o+=layer('kv',[[2,540,516,36]],t,[8,564,'K ve V']);
    o+=layer('q',[[522,468,52,52]],chip(524,499,40,14,c.q,0,2)+txt(548,481,'q',11,'#e06a6a','middle')+txt(548,493,'sorgu',8.5,'#e06a6a','middle'),null);
    t='';for(let i=0;i<N;i++){const x=CX(i)-12;t+='<circle cx="'+x+'" cy="506" r="10.5" fill="#141c33" stroke="#e6b455" stroke-width="1.4"/>'+txt(x,509.5,fm(c.s[i],1),8.5,'#ccd5e8','middle');}
    o+=layer('s',[[2,486,516,40]],t+txt(100,494,'q bütün skorlara girer',8.5,'#e06a6a'),[8,510,'skor s']);
    t='';for(let i=0;i<N;i++){const x=CX(i)-12,h=Math.max(1.5,c.a[i]*40);t+='<rect x="'+(x-7)+'" y="'+(458-h)+'" width="14" height="'+h+'" fill="#ffd54a" fill-opacity=".85" rx="2"/>'+txt(x,(454-h).toFixed(1),pct(c.a[i]),9,'#ffd54a','middle');}
    o+=layer('a',[[2,404,516,60]],t,[8,440,'dikkat a']);
    const aV=new Float64Array(N*D);for(let i=0;i<N;i++)for(let k=0;k<D;k++)aV[i*D+k]=c.a[i]*c.V[i*D+k];
    t='';for(let i=0;i<N;i++){const x=CX(i);t+='<circle cx="'+x+'" cy="396" r="6" fill="#141c33" stroke="#8a99bd"/>'+txt(x,399.5,'×',10,'#ccd5e8','middle')+chip(x-17,370,34,13,aV,i*D);}
    o+=layer('mix',[[2,346,516,58]],t+txt(CX(N-1)+22,357,'Σ',13,'#ccd5e8'),[8,392,'a · V']);
    // ---- bölge 2 ----
    o+=layer('o',[[636,344,108,50]],chip(658,351,64,18,c.o,0,1)+txt(690,386,'o = Σ aᵢ·Vᵢ',10.5,'#b78bf0','middle'),null);
    o+=layer('res1',[[630,236,120,104]],box(655,308,70,26,'× W_O','#b78bf0')+'<circle cx="690" cy="282" r="11" fill="#141c33" stroke="#46c46a" stroke-width="1.6"/>'+txt(690,287,'⊕',15,'#46c46a','middle')+chip(658,244,64,18,c.r,0,3)+txt(735,257,'r',12,'#ccd5e8','',' font-weight="700"'),[634,248,'']);
    o+=layer('ffn',[[628,136,124,98]],box(640,203,100,24,'× W₁ + b₁  (16→32)','#4fc3f7',10)+'<ellipse cx="690" cy="186" rx="26" ry="11" fill="#141c33" stroke="#4fc3f7" stroke-width="1.6"/>'+txt(690,190,'tanh',11,'#ccd5e8','middle')+box(640,145,100,24,'× W₂ + b₂  (32→16)','#4fc3f7',10),[632,148,'']);
    o+=layer('res2',[[630,84,120,50]],'<circle cx="690" cy="122" r="11" fill="#141c33" stroke="#46c46a" stroke-width="1.6"/>'+txt(690,127,'⊕',15,'#46c46a','middle')+chip(658,88,64,18,c.h,0,3)+txt(735,101,'h',12,'#ccd5e8','',' font-weight="700"'),null);
    o+=layer('out',[[630,44,120,40]],box(640,52,100,28,'× W_out + b  (16→40)','#e6b455',10),null);
    t='<circle cx="690" cy="24" r="12" fill="#141c33" stroke="#ffd54a" stroke-width="1.6"/>'+txt(690,28,'σ',13,'#ffd54a','middle')+txt(676,22,'softmax',10,'#ffd54a','end')+txt(812,18,'sonraki karakter olasılıkları (ilk 8)',10.5,'#ffd54a');
    for(let j=0;j<8;j++){const v=idx[j],y=40+j*24,w=Math.max(2,c.p[v]*112);t+=txt(820,y+13,esc(chOf(v)),13,j===0?'#46c46a':'#ccd5e8','middle',' font-family="ui-monospace,Consolas,monospace"')+'<rect x="836" y="'+y+'" width="'+w+'" height="16" rx="3" fill="'+(j===0?'#46c46a':'#5aa0e0')+'" fill-opacity="'+(j===0?.9:.6)+'"/>'+txt(840+w,y+12.5,pct(c.p[v]),10.5,'#ccd5e8');}
    o+=layer('prob',[[650,6,92,38],[806,4,192,232]],t,null);
    // ---- teller (tıklanmaz, üstte) ----
    const wd=dimOn?'0.45':'1';
    let w='<g pointer-events="none" opacity="'+wd+'">';
    for(let i=0;i<N;i++){const x=CX(i);
      w+=arrow(x,712,x,690)+txt(x,661,'+',10,'#95a2c2','middle')+arrow(x,640,x,628)+arrow(x-6,606,x-10,572)+arrow(x+6,606,x+10,572)+arrow(x-12,554,x-12,518)+arrow(x-12,494,x-12,466);
      w+='<path d="M'+(x+12)+' 554 V 400 L '+(x+3)+' 398" fill="none" stroke="#b78bf0" stroke-width="1.1"/><path d="M'+(x-12)+' '+(458-Math.max(1.5,c.a[i]*40)-13)+' V 402 L '+(x-3)+' 398" fill="none" stroke="#ffd54a" stroke-width="1.1"/>'+arrow(x,390,x,384)+'<line x1="'+x+'" y1="370" x2="'+x+'" y2="360" stroke="#8a99bd" stroke-width="1.1"/>';}
    w+='<line x1="'+(CX(0)-26)+'" y1="506" x2="524" y2="506" stroke="#e06a6a" stroke-width="1.3" stroke-dasharray="3 3"/>';
    w+='<path d="M'+(CX(N-1)+17)+' 613 H 544 V 521" fill="none" stroke="#e06a6a" stroke-width="1.3" marker-end="url(#gmAr)"/>';
    w+='<line x1="'+CX(0)+'" y1="360" x2="'+CX(N-1)+'" y2="360" stroke="#8a99bd" stroke-width="1.3"/>'+arrow(CX(N-1),360,656,360)+arrow(690,350,690,334)+arrow(690,308,690,294)+arrow(690,271,690,263)+arrow(690,244,690,228)+arrow(690,203,690,197)+arrow(690,175,690,169)+arrow(690,145,690,134)+arrow(690,111,690,106)+arrow(690,88,690,80)+arrow(690,52,690,36)+arrow(702,24,806,24,'#ffd54a');
    w+='<path d="M'+(CX(N-1)+17)+' 613 H 590 V 282 H 679" fill="none" stroke="#46c46a" stroke-width="1.3" stroke-dasharray="5 3" marker-end="url(#gmAr)"/>'+txt(594,330,'artık bağlantı:',9.5,'#46c46a')+txt(594,342,'x₁₀ aynen geçer',9.5,'#46c46a');
    w+='<path d="M722 253 H 772 V 122 H 701" fill="none" stroke="#46c46a" stroke-width="1.3" stroke-dasharray="5 3" marker-end="url(#gmAr)"/>'+txt(776,190,'r aynen',9.5,'#46c46a')+txt(776,202,'geçer',9.5,'#46c46a');
    w+='</g>';
    $('gm_svg').innerHTML=o+w;
    drawE(ctx);
    caption(c,ctx,idx,sI,aI);
  }
  function caption(c,ctx,idx,sI,aI){
    const chs=i=>'«'+esc(chOf(ctx[i]))+'»',L=(N-1)*D,last=ctx[N-1];
    const T=[
      'Şema <b>tüm hâliyle</b> gösteriliyor. Her katman bir kutu içinde. <b>İleri ▶</b> ile adım adım ilerle: ilgili kutu sarı çerçeveyle vurgulanır, diğerleri soluklaşır. Bir kutunun <b>üstüne gelince</b> (telefonda dokununca) ne olduğu ve ne işe yaradığı yazar.',
      '<b>Karakterler → sayı.</b> Pencerede son 10 karakter var (baştaki <code>·</code> = satır başı dolgusu). Son karakter '+chs(N-1)+' (kimlik no '+last+') sarı çerçeveli: <b>sıradaki karakteri o konumdan tahmin edeceğiz</b>. Ağ harf bilmez, her karakter bir kimlik numarasına dönüşür.',
      '<b>Gömme (E): "bu karakter kim?"</b> Kimlik numarası E tablosunda bir satır seçer: 16 sayı. Örnek: '+chs(N-1)+' için '+f4(P.E,last*D)+'. Bu 16 sayı eğitimle öğrenilir: benzer işlev gören karakterler (örn. rakamlar) benzer satırlar alır. <b>Karakter pencerenin neresinde olursa olsun aynı E satırı gelir.</b>',
      '<b>Konum (P): "bu karakter nerede?"</b> Attention bir karakterin yerini kendi başına bilmez ("7+5=" ve "5+7=" onun için aynı karakter kümesi). Bu yüzden 10 konumun her biri için ayrı bir P satırı var. Son konum (i=9): '+f4(P.P,(N-1)*D)+'. <b>P karaktere değil yalnız yere bağlıdır.</b>',
      '<b>Toplama: x = E + P.</b> Her karakterin E ve P vektörleri sayı sayı toplanır (16 sayı). Böylece tek vektörde hem <b>kim</b> hem <b>nerede</b> bilgisi olur. '+chs(N-1)+' için x = '+f4(c.x,L)+'. Bundan sonra ağ yalnız x ile çalışır.',
      '<b>q, K, V.</b> Yalnız <b>son</b> karakterin x\'inden sorgu <b>q</b> çıkar ("neye bakmalıyım?"). Her karakterin kendi x\'inden <b>K</b> (anahtar: "bende şu var") ve <b>V</b> (değer: seçilirse taşıyacağım içerik) çıkar. W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub> eğitimle öğrenilir.',
      '<b>Skor.</b> Her karakter için s<sub>i</sub> = q·K<sub>i</sub> ÷ √16. En yüksek skor: konum '+sI[0]+' '+chs(sI[0])+' (s='+fm(c.s[sI[0]],2)+'), sonra '+sI[1]+' '+chs(sI[1])+' (s='+fm(c.s[sI[1]],2)+'). Skor büyükse "bu karakter şu an benim için ilgili" demek.',
      '<b>Softmax → dikkat.</b> Skorlar yüzdeye çevrilir (toplam %100). Şu an en çok bakılan: '+chs(aI[0])+' '+pct(c.a[aI[0]])+', '+chs(aI[1])+' '+pct(c.a[aI[1]])+', '+chs(aI[2])+' '+pct(c.a[aI[2]])+'. <b>Eğitmeden önce yüzdeler dağınık; eğittikçe işe yarayan karakterlere kayar</b> (toplamada: iki rakama).',
      '<b>Karışım.</b> Her V<sub>i</sub> kendi dikkat yüzdesiyle çarpılır (az dikkat edilen karakterin kutusu silikleşir), sonra hepsi toplanır: <b>o = Σ aᵢ·Vᵢ</b> (16 sayı). Pencerenin dikkatle süzülmüş tek özeti.',
      '<b>W<sub>O</sub> + artık bağlantı.</b> o, W<sub>O</sub> ile çarpılıp <b>x₁₀\'a eklenir</b>: <b>r = x₁₀ + o·W<sub>O</sub></b>. Yani dikkat, karakterin kendi bilgisini silmez, bulduğunu üstüne ekler.',
      '<b>FFN.</b> r küçük bir ağdan geçer: 16→32 nöron, tanh, 32→16. Dikkat "nereye bakacağını" buldu, FFN bulunan bilgiyi işler (örneğin iki rakamı toplamak). Şu an 32 nörondan '+Array.from(c.g).filter(v=>Math.abs(v)>0.5).length+' tanesi güçlü etkin.',
      '<b>İkinci artık bağlantı.</b> FFN çıktısı yine r\'ye eklenir: <b>h = r + FFN(r)</b>. FFN yalnız bir düzeltme üretir, r aynen korunur. h bloğun nihai çıktısıdır (16 sayı).',
      '<b>Çıkış katmanı.</b> h (16 sayı) bir matrisle 40 karakterin ham skoruna (logit) çevrilir. En yüksek ham skor: «'+esc(chOf((()=>{let b=0;for(let v=1;v<V;v++)if(c.lg[v]>c.lg[b])b=v;return b;})()))+'».',
      '<b>Softmax → olasılık.</b> Ham skorlar olasılığa çevrilir. Seçilen sonraki karakter: <b>«'+esc(chOf(idx[0]))+'»</b> ('+pct(c.p[idx[0]])+'). "➕ Seçileni ekle" ile bu karakteri pencerenin sonuna ekleyip şemayı baştan çalıştırabilirsin (GPT\'nin üretim döngüsü).'];
    $('gm_cap').innerHTML=T[stepNow];
    $('gm_stp').textContent=stepNow===0?'':'Adım '+stepNow+' / '+NSTEP+' — '+STEPS[stepNow-1].t;
    $('gm_prev').disabled=stepNow===0;$('gm_prev').style.opacity=stepNow===0?'.45':'1';
    $('gm_next').textContent=stepNow>=NSTEP?'↺ Baştan':'İleri ▶';
  }
  /* ----- bilgi kutusu (hover / dokunma) ----- */
  const tip=document.createElement('div');tip.id='gm_tip';tip.style.cssText='position:fixed;z-index:100000;display:none;max-width:320px;background:#101a33;border:1px solid #ffd54a;border-radius:10px;padding:9px 11px;font-size:12.5px;line-height:1.55;color:#ccd5e8;box-shadow:0 6px 22px rgba(0,0,0,.55);pointer-events:none';document.body.appendChild(tip);
  const tipShow=(e,k)=>{const d=TIPS[k];if(!d)return;tip.innerHTML='<div style="color:#ffd54a;font-weight:700;margin-bottom:3px">'+d[0]+'</div><div><b>Ne:</b> '+d[1]+'</div><div style="margin-top:3px"><b>Ne işe yarar:</b> '+d[2]+'</div>'+(LIVE[k]?'<div style="margin-top:5px;padding-top:4px;border-top:1px solid #34426a;color:#46c46a"><b>Şu an:</b> '+LIVE[k]+'</div>':'');tip.style.display='block';const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+16,y=e.clientY+14;if(x+w>innerWidth-8)x=Math.max(8,e.clientX-w-16);if(y+h>innerHeight-8)y=Math.max(8,innerHeight-h-8);tip.style.left=x+'px';tip.style.top=y+'px';};
  const svgEl=$('gm_svg');
  svgEl.addEventListener('mousemove',e=>{const l=e.target.closest&&e.target.closest('.gm-layer');if(l)tipShow(e,l.dataset.tip);else tip.style.display='none';});
  svgEl.addEventListener('mouseleave',()=>{tip.style.display='none';});
  svgEl.addEventListener('click',e=>{const l=e.target.closest&&e.target.closest('.gm-layer');if(l)tipShow(e,l.dataset.tip);else tip.style.display='none';});
  $('gm_prev').onclick=()=>{stepNow=stepNow<=0?NSTEP:stepNow-1;drawArch();};
  $('gm_next').onclick=()=>{stepNow=stepNow>=NSTEP?0:stepNow+1;drawArch();};
  $('gm_all').onclick=()=>{stepNow=0;drawArch();};
  $('gm_add').onclick=()=>{
    const {ctx}=cur(),c=fwd1(ctx,newCache());let b=0;for(let v=1;v<V;v++)if(c.p[v]>c.p[b])b=v;
    stepNow=0;
    if(b===DOT){drawArch();$('gm_cap').innerHTML='<b>Model "." (satır sonu) seçti: cevap bitti.</b> Üretim döngüsü satır sonu karakteri gelince durur. Yeni bir deneme için başlangıç yazısını değiştir.';return;}
    $('gt_p').value+=CHARS[b];$('gt_go').click();
  };
  const fsOff=()=>{$('gmFull').classList.remove('gm-full');document.body.style.overflow='';$('gm_fs').textContent='⛶ Tam ekran';};
  const fsOn=()=>{$('gmFull').classList.add('gm-full');document.body.style.overflow='hidden';$('gm_fs').textContent='⛶ Küçült';};
  $('gm_fs').onclick=()=>{$('gmFull').classList.contains('gm-full')?fsOff():fsOn();};
  $('gm_x').onclick=fsOff;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('gmFull').classList.contains('gm-full'))fsOff();});
  $('gm_p2').onkeydown=e=>{if(e.key==='Enter'){$('gt_p').value=$('gm_p2').value;$('gt_go').click();}};
  $('gm_p2').oninput=()=>{$('gt_p').value=$('gm_p2').value;$('gt_go').click();};

  /* ----- kart: eğitim ----- */
  let timer=null;
  function curve(){
    const s=$('gm_curve'),n=Math.max(hist.length-1,1),mx=Math.max(4,hist[0]),px=i=>25+i/n*285,py=v=>80-Math.min(v,mx)/mx*68;
    s.innerHTML='<line x1="25" y1="80" x2="310" y2="80" stroke="#445"/><line x1="25" y1="10" x2="25" y2="80" stroke="#445"/><polyline fill="none" stroke="#e06a6a" stroke-width="2" points="'+hist.map((h,i)=>px(i).toFixed(1)+','+py(h).toFixed(1)).join(' ')+'"/><text x="28" y="9" font-size="8.5" fill="#e06a6a">kayıp</text><text x="200" y="89" font-size="8.5" fill="#aeb9d4">epoch 0 → '+ep+'</text>';
  }
  function drawCard(heavy){
    const q=$('gt_p').value;
    $('gm_st').innerHTML='epoch <b>'+ep+'</b> / '+EPMAX+' · kayıp <b>'+fm(hist[ep],3)+'</b>'+(ep===0?' <span style="color:#e06a6a">(henüz eğitilmedi: ağırlıklar rastgele)</span>':'');
    $('gm_o').innerHTML=esc(q)+'<b style="color:#46c46a">'+esc(gen(q))+'</b>';
    $('gm_sc').innerHTML=G.scHtml(G.score(x=>gen(x)));
    curve();drawArch();
  }
  function stop(){if(timer){clearTimeout(timer);timer=null;$('gm_go').textContent='▶ eğit';}}
  function adv(n){stop();for(let i=0;i<n&&ep<EPMAX;i++)step();drawCard();window.__gptTable();}
  function run(){
    const t0=performance.now();while(performance.now()-t0<80&&ep<EPMAX)step();
    drawCard();
    if(ep>=EPMAX){stop();window.__gptTable();return;}
    timer=setTimeout(run,0);
  }
  $('gm_e1').onclick=()=>adv(1);$('gm_e10').onclick=()=>adv(10);$('gm_e100').onclick=()=>adv(100);
  $('gm_go').onclick=()=>{if(timer){stop();return;}if(ep>=EPMAX)return;$('gm_go').textContent='⏸ durdur';run();};
  $('gm_rst').onclick=()=>{stop();init(+$('gm_seed').value);drawCard();window.__gptTable();};
  $('gm_seed').onchange=()=>{stop();init(+$('gm_seed').value);drawCard();window.__gptTable();};
  window.__gptAddModel({name:'minik GPT',gen:q=>gen(q),onPrompt:()=>drawCard()});
  drawCard();
  window.__gptMiniUI={drawArch,setStep:k=>{stepNow=k;drawArch();}};
})();

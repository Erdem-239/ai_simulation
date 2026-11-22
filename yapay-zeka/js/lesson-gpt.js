// GPT Test — sıfırdan minik dil modeli. Metni biz üretiyoruz (toplama satırları kodla, birkaç diyalog elle),
// etiketleri YAZMIYORUZ: her karakterin "sonraki karakteri" metnin kendisi. İki öğrenici:
//  (1) sayma modeli (son k karaktere bak, ne geldiğini say), (2) küçük sinir ağı (bağlam penceresi N=10 → embedding → tanh → softmax).
// Python karşılığı sayfadaki kod kutusu (gpt_proto.py) ile aynı sayıları üretir (aynı LCG başlangıç, tam-yığın Adam).
(function(){
  const host=document.getElementById('gtApp'); if(!host) return;
  const $=id=>document.getElementById(id);
  const N=10,D=8,H=64,LR=0.01,EPMAX=300;
  const DIAL=[["merhaba","merhaba"],["nasılsın","iyiyim"],["naber","iyidir"],["adın ne","ben bir ağım"],["hayatın anlamı","sevmek ve öğrenmek"],["sen kimsin","küçük bir model"],["teşekkürler","rica ederim"],["günaydın","günaydın"],["hoşça kal","görüşürüz"],["nerelisin","bilgisayardan"]];
  const TRAINADD=[],TESTADD=[];
  for(let a=0;a<10;a++)for(let b=0;b<10;b++){const s=a+'+'+b+'='+(a+b)+'.';((a*10+b)%5===3?TESTADD:TRAINADD).push(s);}
  const DLINES=DIAL.map(x=>x[0]+'>'+x[1]+'.');
  const TRAINLINES=TRAINADD.concat(DLINES);
  const CHARS=Array.from(new Set(TRAINADD.concat(TESTADD,DLINES).join(''))).sort();
  const V=CHARS.length,IX={};CHARS.forEach((c,i)=>IX[c]=i);const DOT=IX['.'];
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const fm=(v,d=3)=>v.toFixed(d).replace('.',',');
  const padOf=s=>Array(N).fill(DOT).concat(Array.from(s).map(c=>IX[c]));
  function samples(lines){const X=[],Y=[];lines.forEach(s=>{const p=padOf(s);for(let i=N;i<p.length;i++){X.push(p.slice(i-N,i));Y.push(p[i]);}});return {X,Y};}
  const SM=samples(TRAINLINES),NS=SM.Y.length;

  /* ---------- 1) sayma modeli ---------- */
  const COUNT=[];            // COUNT[k] = Map(bağlam(son k karakter) → Int32Array(V))
  for(let k=0;k<=N;k++){const m=new Map();for(let i=0;i<NS;i++){const key=SM.X[i].slice(N-k).join(',');let a=m.get(key);if(!a){a=new Int32Array(V);m.set(key,a);}a[SM.Y[i]]++;}COUNT.push(m);}
  function genCount(prompt,k,mx){
    const ctx=padOf(prompt).slice(-N);let out='';mx=mx||30;
    for(let t=0;t<mx;t++){
      let a=null;for(let kk=k;kk>=0&&!a;kk--)a=COUNT[kk].get(ctx.slice(N-kk).join(','));
      let b=0;for(let v=1;v<V;v++)if(a[v]>a[b])b=v;
      if(b===DOT)break;out+=CHARS[b];ctx.shift();ctx.push(b);
    }return out;
  }

  /* ---------- 2) sinir ağı ---------- */
  const lcg=s=>()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};
  let P,M,Vv,ep,hist;const NDm=N*D;
  function init(seed){
    const r=lcg(seed),U=(n,sc)=>{const a=new Float64Array(n);for(let i=0;i<n;i++)a[i]=(r()-.5)*2*sc;return a;};
    P={E:U(V*D,0.5),W1:U(NDm*H,1/Math.sqrt(NDm)),b1:new Float64Array(H),W2:U(H*V,1/Math.sqrt(H)),b2:new Float64Array(V)};
    M={};Vv={};for(const k in P){M[k]=new Float64Array(P[k].length);Vv[k]=new Float64Array(P[k].length);}
    ep=0;hist=[lossOf()];
  }
  function fwdOne(ctx,e,h,p){
    for(let j=0;j<N;j++){const b=ctx[j]*D;for(let k=0;k<D;k++)e[j*D+k]=P.E[b+k];}
    for(let c=0;c<H;c++){let s=P.b1[c];for(let m=0;m<NDm;m++)s+=e[m]*P.W1[m*H+c];h[c]=Math.tanh(s);}
    let mx=-1e300;for(let v=0;v<V;v++){let s=P.b2[v];for(let c=0;c<H;c++)s+=h[c]*P.W2[c*V+v];p[v]=s;if(s>mx)mx=s;}
    let z=0;for(let v=0;v<V;v++){p[v]=Math.exp(p[v]-mx);z+=p[v];}for(let v=0;v<V;v++)p[v]/=z;
  }
  function lossOf(){const e=new Float64Array(NDm),h=new Float64Array(H),p=new Float64Array(V);let L=0;for(let i=0;i<NS;i++){fwdOne(SM.X[i],e,h,p);L-=Math.log(p[SM.Y[i]]);}return L/NS;}
  function step(){
    const G={E:new Float64Array(P.E.length),W1:new Float64Array(P.W1.length),b1:new Float64Array(H),W2:new Float64Array(P.W2.length),b2:new Float64Array(V)};
    const e=new Float64Array(NDm),h=new Float64Array(H),p=new Float64Array(V),dh=new Float64Array(H),de=new Float64Array(NDm);let L=0;
    for(let i=0;i<NS;i++){
      const X=SM.X[i],y=SM.Y[i];fwdOne(X,e,h,p);L-=Math.log(p[y]);
      p[y]-=1;for(let v=0;v<V;v++)p[v]/=NS;
      for(let c=0;c<H;c++){let s=0;for(let v=0;v<V;v++){s+=p[v]*P.W2[c*V+v];G.W2[c*V+v]+=h[c]*p[v];}dh[c]=s*(1-h[c]*h[c]);G.b1[c]+=dh[c];}
      for(let v=0;v<V;v++)G.b2[v]+=p[v];
      for(let m=0;m<NDm;m++){let s=0;for(let c=0;c<H;c++){s+=dh[c]*P.W1[m*H+c];G.W1[m*H+c]+=e[m]*dh[c];}de[m]=s;}
      for(let j=0;j<N;j++){const b=X[j]*D;for(let k=0;k<D;k++)G.E[b+k]+=de[j*D+k];}
    }
    ep++;const t=ep;
    for(const k in P){const w=P[k],g=G[k],m=M[k],vv=Vv[k];for(let i=0;i<w.length;i++){m[i]=0.9*m[i]+0.1*g[i];vv[i]=0.999*vv[i]+0.001*g[i]*g[i];w[i]-=LR*(m[i]/(1-Math.pow(0.9,t)))/(Math.sqrt(vv[i]/(1-Math.pow(0.999,t)))+1e-8);}}
    hist.push(lossOf());return hist[hist.length-1];
  }
  function genNet(prompt,mx){
    const ctx=padOf(prompt).slice(-N),e=new Float64Array(NDm),h=new Float64Array(H),p=new Float64Array(V);let out='';mx=mx||30;
    for(let t=0;t<mx;t++){fwdOne(ctx,e,h,p);let b=0;for(let v=1;v<V;v++)if(p[v]>p[b])b=v;if(b===DOT)break;out+=CHARS[b];ctx.shift();ctx.push(b);}
    return out;
  }
  function untrained(){return ep===0;}

  /* ---------- skor tablosu ---------- */
  const split=s=>{const i=s.indexOf('=');return [s.slice(0,i+1),s.slice(i+1,-1)];};
  function score(gen){
    let a=0,b=0,c=0;
    TRAINADD.forEach(s=>{const [q,ans]=split(s);if(gen(q)===ans)a++;});
    TESTADD.forEach(s=>{const [q,ans]=split(s);if(gen(q)===ans)b++;});
    DIAL.forEach(([q,ans])=>{if(gen(q+'>')===ans)c++;});
    return {a,b,c};
  }
  const scHtml=r=>'<div style="font-size:12.5px;line-height:1.8">Eğitimdeki toplamlar: <b>'+r.a+'/'+TRAINADD.length+'</b> · <b style="color:#ffd54a">görmediği</b> toplamlar: <b>'+r.b+'/'+TESTADD.length+'</b> · diyaloglar: <b>'+r.c+'/'+DIAL.length+'</b></div>';

  /* ---------- arayüz ---------- */
  const ALLTEXT=TRAINLINES.join('\n');
  host.innerHTML=
   '<div style="font-size:13.5px;color:#ccd5e8;line-height:1.7;margin-bottom:8px">📚 <b>Eğitim metni</b> ('+TRAINLINES.length+' satır, '+ALLTEXT.length+' karakter): her satır <code>soru&gt;cevap.</code> ya da <code>a+b=sonuç.</code> Toplamları kodla ürettik (doğruluğu garanti). <b>Görmediği '+TESTADD.length+' toplamı</b> bilerek metinden çıkardık: ezber mi, gerçek öğrenme mi anlayalım.</div>'+
   '<div class="acc"><div class="acc-head"><span class="ac">▸</span> Eğitim metninin kendisi (aç)</div><div class="acc-body"><pre style="background:#0e1424;border:1px solid var(--line);border-radius:8px;padding:10px;max-height:220px;overflow:auto;font-size:12px;line-height:1.5">'+esc(ALLTEXT)+'</pre><div style="font-size:12px;color:var(--muted)">Sınav (metinde YOK): '+esc(TESTADD.join(' '))+'</div></div></div>'+
   '<div style="margin:12px 0 4px;font-size:13px;color:#ccd5e8"><b>✍️ Modele bir başlangıç ver</b> (sonunu o tamamlasın):</div>'+
   '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:6px"><input id="gt_p" class="rex-sel" style="width:210px;background:#0e1424;color:#ccd5e8;border:1px solid var(--line);border-radius:6px;padding:4px 8px" value="7+5=" spellcheck="false"><button class="rex-btn" id="gt_go">üret ▶</button></div>'+
   '<div id="gt_chips" style="margin-bottom:10px"></div>'+
   '<div class="gt-grid">'+
    '<div class="gt-card"><div class="gt-t">🧮 Sayma modeli <span style="color:var(--muted);font-weight:400">(sinir ağı yok)</span></div>'+
     '<div style="font-size:12.5px;margin-bottom:6px">son <b id="gt_kv"></b> karaktere bak <input type="range" id="gt_k" min="1" max="'+N+'" value="5" style="width:130px"></div>'+
     '<div class="gt-out" id="gt_oc"></div><div id="gt_sc"></div></div>'+
    '<div class="gt-card"><div class="gt-t">🧠 Sinir ağı <span style="color:var(--muted);font-weight:400">(embedding → tanh → softmax)</span></div>'+
     '<div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-bottom:6px"><label style="font-size:12.5px">tohum <select id="gt_seed" class="rex-sel"><option>1</option><option>2</option><option>3</option></select></label><button class="rex-btn" id="gt_e1">🔧 +1</button><button class="rex-btn" id="gt_e10">+10</button><button class="rex-btn" id="gt_e100">+100</button><button class="rex-btn" id="gt_go2">▶ eğit</button><button class="rex-btn" id="gt_rst">↺</button></div>'+
     '<div id="gt_st" style="font-size:12.5px;margin-bottom:4px"></div>'+
     '<div class="gt-out" id="gt_on"></div><div id="gt_sn"></div>'+
     '<svg id="gt_curve" viewBox="0 0 320 90" style="width:100%;max-width:340px;margin-top:6px"></svg></div>'+
   '</div>'+
   '<div class="acc" style="margin-top:12px"><div class="acc-head"><span class="ac">▸</span> 📋 Karşılaştırma tablosu: aynı sorular, iki model, doğru cevap</div><div class="acc-body"><div id="gt_tbl"></div></div></div>';
  // .acc-head dinleyicileri sayfa yüklenirken bağlanıyor; bu kutular sonradan üretildiği için burada bağlıyoruz
  host.querySelectorAll('.acc-head').forEach(h=>h.addEventListener('click',e=>{e.stopPropagation();h.closest('.acc').classList.toggle('open');}));
  const chips=[["7+5=","eğitimdeki toplam"],["0+3=","GÖRMEDİĞİ toplam"],["2+8=","GÖRMEDİĞİ toplam"],["nasılsın>","eğitimdeki diyalog"],["hayatın anlamı>","eğitimdeki diyalog"],["selam>","hiç görmedi"],["nasılsınız>","yakın ama farklı"]];
  $('gt_chips').innerHTML=chips.map(c=>'<button class="rex-btn" data-q="'+esc(c[0])+'" title="'+c[1]+'">'+esc(c[0])+'</button>').join('')+' <span style="font-size:11.5px;color:var(--muted)">(üstüne gelince: ne olduğu)</span>';
  const style=document.createElement('style');
  style.textContent='.gt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:10px}.gt-card{background:#141c33;border:1px solid var(--line);border-radius:10px;padding:10px;min-width:0}.gt-t{font-weight:700;font-size:13.5px;margin-bottom:6px}.gt-out{font-family:ui-monospace,Consolas,monospace;font-size:14px;background:#0e1424;border:1px solid var(--line);border-radius:6px;padding:6px 8px;min-height:20px;margin-bottom:6px;word-break:break-all}';
  document.head.appendChild(style);
  const gtK=$('gt_k');
  let timer=null;
  function curve(){
    const s=$('gt_curve'),n=Math.max(hist.length-1,1),mx=Math.max(4,hist[0]),px=i=>25+i/n*285,py=v=>80-Math.min(v,mx)/mx*68;
    s.innerHTML='<line x1="25" y1="80" x2="310" y2="80" stroke="#445"/><line x1="25" y1="10" x2="25" y2="80" stroke="#445"/><polyline fill="none" stroke="#e06a6a" stroke-width="2" points="'+hist.map((h,i)=>px(i)+','+py(h)).join(' ')+'"/><text x="28" y="9" font-size="8.5" fill="#e06a6a">kayıp (her karakteri tahmin etme hatası)</text><text x="200" y="89" font-size="8.5" fill="#aeb9d4">epoch 0 → '+ep+'</text>';
  }
  function drawCount(){
    const k=+gtK.value;$('gt_kv').textContent=k;
    const q=$('gt_p').value;$('gt_oc').innerHTML=esc(q)+'<b style="color:#46c46a">'+esc(genCount(q,k))+'</b>';
    $('gt_sc').innerHTML=scHtml(score(s=>genCount(s,k)));
  }
  function drawNet(light){
    const q=$('gt_p').value;
    $('gt_st').innerHTML='epoch <b>'+ep+'</b> · kayıp <b>'+fm(hist[ep],3)+'</b>'+(untrained()?' <span style="color:#e06a6a">(henüz eğitilmedi: ağırlıklar rastgele)</span>':'');
    $('gt_on').innerHTML=esc(q)+'<b style="color:#46c46a">'+esc(genNet(q))+'</b>';
    $('gt_sn').innerHTML=scHtml(score(genNet));curve();
  }
  const EXTRA=[];
  function table(){
    const k=+gtK.value;const rows=[];
    DIAL.forEach(([q,a])=>rows.push([q+'>',a,'diyalog (eğitimde)']));
    ['7+5=','3+4=','9+9=','1+1=','6+2='].forEach(q=>{const s=TRAINADD.find(x=>x.startsWith(q));if(s)rows.push([q,split(s)[1],'toplam (eğitimde)']);});
    TESTADD.slice(0,6).forEach(s=>rows.push([split(s)[0],split(s)[1],'toplam (GÖRMEDİĞİ)']));
    [['selam>','?','hiç görmediği soru'],['nasılsınız>','iyiyim','yakın ama farklı yazılmış'],['2+3+4=','9','hiç görmediği biçim']].forEach(r=>rows.push(r));
    $('gt_tbl').innerHTML='<div style="overflow-x:auto"><table class="rex-tbl" style="font-size:12.5px"><tr><th>başlangıç</th><th>doğru</th><th>sayma (k='+k+')</th><th>sinir ağı</th>'+EXTRA.map(m=>'<th>'+m.name+'</th>').join('')+'<th>tür</th></tr>'+rows.map(r=>{const c=genCount(r[0],k),n=genNet(r[0]);const ok=x=>x===r[1]?'✅':(r[1]==='?'?'':'❌');return '<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+esc(c)+' '+ok(c)+'</td><td>'+esc(n)+' '+ok(n)+'</td>'+EXTRA.map(m=>{const e=m.gen(r[0]);return '<td>'+esc(e)+' '+ok(e)+'</td>';}).join('')+'<td style="color:var(--muted)">'+r[2]+'</td></tr>';}).join('')+'</table></div>';
  }
  function all(){drawCount();drawNet();EXTRA.forEach(m=>m.onPrompt&&m.onPrompt());table();}
  function stop(){if(timer){clearTimeout(timer);timer=null;$('gt_go2').textContent='▶ eğit';}}
  function adv(n){stop();for(let i=0;i<n;i++)step();drawNet();table();}
  function run(){
    const t0=performance.now();while(performance.now()-t0<60&&ep<EPMAX)step();
    drawNet();
    if(ep>=EPMAX){stop();table();return;}
    timer=setTimeout(run,0);
  }
  $('gt_go').onclick=all;$('gt_p').onkeydown=e=>{if(e.key==='Enter')all();};
  $('gt_chips').onclick=e=>{const b=e.target.closest('[data-q]');if(!b)return;$('gt_p').value=b.dataset.q;all();};
  gtK.oninput=()=>{drawCount();table();};
  $('gt_e1').onclick=()=>adv(1);$('gt_e10').onclick=()=>adv(10);$('gt_e100').onclick=()=>adv(100);
  $('gt_go2').onclick=()=>{if(timer){stop();return;}$('gt_go2').textContent='⏸ durdur';run();};
  $('gt_rst').onclick=()=>{stop();init(+$('gt_seed').value);all();};
  $('gt_seed').onchange=()=>{stop();init(+$('gt_seed').value);all();};
  window.__gptAddModel=m=>{EXTRA.push(m);table();};window.__gptTable=table;window.__gptHost=host;
  window.__gpt={init,step,genNet,genCount,score,lossOf,get hist(){return hist;},get ep(){return ep;},TRAINADD,TESTADD,DIAL,CHARS,SM,padOf,N,V,IX,DOT,esc,split,scHtml};
  /* ---------- Nedir bölümü: bir satırdan eğitim çiftleri ---------- */
  const pe=$('gtPairs');
  if(pe){
    const lines=['nasılsın>iyiyim.','7+5=12.','hayatın anlamı>sevmek ve öğrenmek.'];
    pe.innerHTML='<div style="font-size:13px;margin-bottom:6px">Bir satır seç: <select id="gtPsel" class="rex-sel">'+lines.map(l=>'<option>'+esc(l)+'</option>').join('')+'</select></div><div id="gtPtbl" style="overflow-x:auto"></div>';
    const draw=()=>{const l=$('gtPsel').value,p=padOf(l);let r='';
      for(let i=N;i<p.length;i++){const ctx=p.slice(Math.max(N,i-6),i).map(v=>CHARS[v]).join('');const pre=i-N<6?'<span style="color:#5a6a8a">'+'·'.repeat(6-(i-N))+'</span>':'';
        r+='<tr><td style="font-family:ui-monospace,Consolas,monospace">'+pre+esc(ctx)+'</td><td>→</td><td style="font-family:ui-monospace,Consolas,monospace"><b style="color:#46c46a">'+esc(CHARS[p[i]])+'</b></td></tr>';}
      $('gtPtbl').innerHTML='<table class="rex-tbl" style="font-size:12.5px"><tr><th>model şunu görür (son 6 karakter)</th><th></th><th>doğru cevap (metinden)</th></tr>'+r+'</table>';};
    $('gtPsel').onchange=draw;draw();
  }
  init(1);all();
})();

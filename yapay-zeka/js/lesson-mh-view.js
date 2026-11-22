// Multi-Head → Simülasyon → 🔗 «Ders ↔ mimari»: "her kafanın kendi W'si" (ders/3Blue1Brown/makale) ile
// "tek büyük tablonun sütun dilimi" (3B mimari, GPT-2 kodu) AYNI şey — sayıyla kanıt.
(function(){
  const host=document.getElementById('mhView'); if(!host) return;
  const D=8, T=3, TOK=['kabarık','mavi','yaratık'];
  let s=7; const rnd=()=>{s=(s*1664525+1013904223)%4294967296; return s/4294967296;};
  const ri=()=>Math.floor(rnd()*5)-2;                       // -2..2
  const mat=(r,c)=>Array.from({length:r},()=>Array.from({length:c},ri));
  const X=mat(T,D), WQ=mat(D,D), WV=mat(D,D), WO=mat(D,D);   // WQ: d×d (tek büyük tablo), WV: değer, WO: çıktı
  const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>{let t=0;for(let k=0;k<B.length;k++)t+=r[k]*B[k][j];return t;}));
  const slice=(M,a,b)=>M.map(r=>r.slice(a,b));
  const COL=['#4aa3ff','#ff9b3d','#5fd18a','#e56bb0','#b58cff','#ffd24a','#4fd0d0','#ff6b6b'];
  let h=4, sel=0, tok=2;
  const cell=(v,c)=>'<td style="border-color:'+c+'">'+v+'</td>';
  const table=(M,colorOfCol,cls)=>'<table class="mv-t '+(cls||'')+'">'+M.map(r=>'<tr>'+r.map((v,j)=>cell(v,colorOfCol(j))).join('')+'</tr>').join('')+'</table>';
  const vec=v=>'['+v.join(', ')+']';
  function draw(){
    const dk=D/h, hc=j=>COL[Math.floor(j/dk)];
    let o='<div class="gq-btns">'+[1,2,4,8].map(n=>'<button class="addbtn'+(h===n?' on':'')+'" data-h="'+n+'">'+n+' kafa'+(n===1?' (tek kafa)':'')+'</button>').join('')+'</div>';
    o+='<div class="mv-grid"><div class="mv-box"><div class="mv-ttl">① Ders / makale görünümü</div><div class="mv-sub">Her kafanın <b>kendi</b> küçük W<sub>Q</sub><sup>(i)</sup> tablosu var ('+D+'×'+dk+')</div><div class="mv-row">';
    for(let i=0;i<h;i++) o+='<div class="mv-one'+(i===sel?' on':'')+'" data-k="'+i+'" style="--c:'+COL[i]+'"><div class="mv-cap">kafa '+(i+1)+'</div>'+table(slice(WQ,0,D).map(r=>r.slice(i*dk,(i+1)*dk)),()=>COL[i])+'</div>';
    o+='</div></div><div class="mv-mid">yan yana<br>dizilince<br>⟹</div><div class="mv-box"><div class="mv-ttl">② Mimari / kod görünümü</div><div class="mv-sub">TEK büyük W<sub>Q</sub> tablosu ('+D+'×'+D+'); kafa i = <b>sütun dilimi</b> ['+'i·'+dk+', (i+1)·'+dk+')</div>'
      +'<div class="mv-big">'+table(WQ,hc)+'</div></div></div>';
    // sayıyla kanıt
    const e=X[tok], Qbig=mm(X,WQ), a=sel*dk, b=(sel+1)*dk;
    const viaSmall=mm([e],WQ.map(r=>r.slice(a,b)))[0];     // ① küçük tablo ile
    const viaBig=Qbig[tok].slice(a,b);                       // ② büyük tabloyu çarp, sütun dilimini al
    // çıktı tarafı: Concat·W_O == Σ_i (kafa_i · W_O'nun i. satır dilimi)
    const V=mm(X,WV), head=V[tok];                           // basit: her kafanın çıktısı = V'nin dilimi (dikkat ağırlığı atlandı)
    const cat=mm([head],WO)[0];
    let sum=Array(D).fill(0);
    for(let i=0;i<h;i++){const part=mm([head.slice(i*dk,(i+1)*dk)],WO.slice(i*dk,(i+1)*dk))[0]; sum=sum.map((x,j)=>x+part[j]);}
    const same=cat.every((x,j)=>x===sum[j]);
    o+='<div class="mv-tok">Kelime: '+TOK.map((t,i)=>'<button class="addbtn'+(i===tok?' on':'')+'" data-t="'+i+'">'+t+'</button>').join('')+' &nbsp; · kafa seç: tablolara tıkla (şu an <b style="color:'+COL[sel]+'">kafa '+(sel+1)+'</b>)</div>';
    o+='<div class="work mv-proof"><b>Sorgu q = «'+TOK[tok]+'» · W<sub>Q</sub>, kafa '+(sel+1)+' için</b><br>'
      +'① kendi küçük tablosuyla: e·W<sub>Q</sub><sup>('+(sel+1)+')</sup> = '+vec(viaSmall)+'<br>'
      +'② büyük tabloyla çarp, '+(a+1)+'–'+b+'. sütunu al: (e·W<sub>Q</sub>)['+(a+1)+':'+b+'] = '+vec(viaBig)+'<br>'
      +'→ <b>'+(viaSmall.every((x,j)=>x===viaBig[j])?'aynı sayılar ✓':'FARKLI ✗')+'</b> (fark yok: iki görünüm aynı hesap)'
      +'<br><br><b>Çıkış tarafı:</b> Concat(kafalar)·W<sub>O</sub> = '+vec(cat)+'<br>'
      +'= her kafanın çıktısı × W<sub>O</sub>\'nun kendi satır dilimi, TOPLANMIŞ = '+vec(sum)+' → <b>'+(same?'aynı ✓':'FARKLI ✗')+'</b></div>';
    host.innerHTML=o;
  }
  host.addEventListener('click',e=>{
    const bh=e.target.closest('[data-h]'); if(bh){h=+bh.dataset.h; sel=0; draw(); return;}
    const bt=e.target.closest('[data-t]'); if(bt){tok=+bt.dataset.t; draw(); return;}
    const bk=e.target.closest('[data-k]'); if(bk){sel=+bk.dataset.k; draw();}
  });
  draw();
})();

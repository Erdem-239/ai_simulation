// LSTM — zamanda açılmış 3 hücre yan yana (Bütün Resim → many-to-one / many-to-many canlı diyagramı).
// Ağırlıklar Simülasyon'daki kaydırıcılarla (lv_W/U/b{f,i,c,o}) ORTAK; yalnız c ve h hücreden hücreye geçer.
// Tür (m2o/m2m) ve vurgu dışarıdan: window.__lstmUnroll.setMode / setHL (lesson-lstm-seq.js).
(function(){
  const $=id=>document.getElementById(id); const svg=$('lstmUnrollSvg'); if(!svg) return;
  const sig=z=>1/(1+Math.exp(-z));
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const F=(v,d=2)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d);};
  const GC='#f0a032',CC='#46c46a',BC='#3a7afe',HC='#e06a6a',N='#95a2c2';
  let mode='m2o', HL=null;
  function run(){
    const g=k=>['W','U','b'].map(p=>parseFloat($('lv_'+p+k).value));
    const W={f:g('f'),i:g('i'),c:g('c'),o:g('o')};
    let h=0,c=0; const st=[];
    [1,2,3].forEach(k=>{
      const x=parseFloat($('ul_x'+k).value); $('ul_x'+k+'_v').textContent=F(x,2);
      const z=w=>w[0]*x+w[1]*h+w[2];
      const f=sig(z(W.f)),i=sig(z(W.i)),gg=Math.tanh(z(W.c)),o=sig(z(W.o));
      const cn=f*c+i*gg,hn=o*Math.tanh(cn);
      st.push({x,hp:h,cp:c,f,i,g:gg,o,c:cn,h:hn}); h=hn;c=cn;
    });
    return st;
  }
  const L=(d,col,w,arr)=>'<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+w+'" stroke-linejoin="round" stroke-linecap="round"'+(arr?' marker-end="url(#ul_a'+arr+')"':'')+'/>';
  const T=(x,y,t,col,sz,anc,b)=>'<text x="'+x+'" y="'+y+'" text-anchor="'+(anc||'middle')+'" font-size="'+(sz||11)+'" fill="'+(col||'#ccd5e8')+'"'+(b?' font-weight="700"':'')+'>'+t+'</text>';
  const circ=(x,y,t)=>'<circle cx="'+x+'" cy="'+y+'" r="15" fill="#3a1d2e" stroke="#e06a9a" stroke-width="2"/>'+T(x,y+4,t,'#fff',11,'middle',true);
  const op=(x,y,g)=>'<circle cx="'+x+'" cy="'+y+'" r="12" fill="#2a1a3a" stroke="#c77dff" stroke-width="2"/>'+T(x,y+6,g,'#fff',17,'middle',true);
  const box=(x,y,w,t,fill,stk)=>'<rect x="'+(x-w/2)+'" y="'+(y-12)+'" width="'+w+'" height="24" rx="6" fill="'+fill+'" stroke="'+stk+'" stroke-width="2"/>'+T(x,y+5,t,'#fff',12,'middle',true);
  const isOut=k=>mode==='m2m'||k===2;
  function draw(st){
    const mk=(id,col)=>'<marker id="ul_a'+id+'" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L6,3 L0,6 Z" fill="'+col+'"/></marker>';
    let s='<defs>'+mk('C',CC)+mk('B',BC)+mk('H',HC)+'</defs>';
    const w=k=>Math.max(1.5,2+7*Math.min(1.5,Math.abs(k)));
    s+=L('M42,85 L1008,85',CC,4,'C')+L('M42,270 L1008,270',HC,4,'H');
    s+=circ(24,85,'c₀')+circ(24,270,'h₀')+circ(1026,85,'c₃')+circ(1026,270,'h₃');
    st.forEach((q,k)=>{
      const ox=60+k*310,X=d=>ox+d;
      s+='<rect x="'+ox+'" y="48" width="280" height="262" rx="14" fill="rgba(70,196,106,.07)" stroke="'+CC+'" stroke-opacity=".55" stroke-width="2"/>';
      s+=T(ox+10,64,'hücre t='+(k+1)+'  ·  x'+(k+1)+' = '+F(q.x),'#8fdc9f',11.5,'start',true);
      [55,105,155,205].forEach(d=>{s+=L('M'+X(d)+',270 L'+X(d)+',234',N,2)+'<circle cx="'+X(d)+'" cy="270" r="3.5" fill="'+N+'"/>';});
      s+=L('M'+X(55)+',210 L'+X(55)+',97',GC,w(q.f),'')+L('M'+X(105)+',210 L'+X(105)+',125 L'+X(143)+',125',GC,w(q.i),'')+L('M'+X(155)+',210 L'+X(155)+',137',BC,w(q.g),'B')+L('M'+X(155)+',113 L'+X(155)+',97',BC,w(q.i*q.g),'B');
      s+=L('M'+X(205)+',210 L'+X(205)+',170 L'+X(223)+',170',GC,w(q.o),'');
      s+=L('M'+X(235)+',85 L'+X(235)+',114',CC,w(q.c)*0.7,'')+L('M'+X(235)+',142 L'+X(235)+',158',HC,w(Math.tanh(q.c)),'');
      s+=L('M'+X(247)+',170 L'+X(262)+',170 L'+X(262)+',269',HC,w(q.h),'');
      s+=L('M'+X(130)+',344 L'+X(130)+',271',BC,2.5,'B')+'<circle cx="'+X(130)+'" cy="358" r="14" fill="#14323a" stroke="#4ad0e0" stroke-width="2"/>'+T(X(130),362,'x'+(k+1),'#fff',11,'middle',true);
      s+=op(X(55),85,'×')+op(X(155),85,'+')+op(X(155),125,'×')+op(X(235),170,'×');
      s+='<ellipse cx="'+X(235)+'" cy="128" rx="26" ry="14" fill="#14283a" stroke="#5aa0e0" stroke-width="2"/>'+T(X(235),133,'tanh','#fff',11,'middle',true);
      s+=box(X(55),222,36,'σ','#3a2f14',GC)+box(X(105),222,36,'σ','#3a2f14',GC)+box(X(155),222,42,'tanh','#14283a','#5aa0e0')+box(X(205),222,36,'σ','#3a2f14',GC);
      s+=T(X(59),197,'f='+F(q.f),GC,10.5,'start',true)+T(X(109),160,'i='+F(q.i),GC,10.5,'start',true)+T(X(159),197,'c̃='+F(q.g),'#7aa8ff',10.5,'start',true)+T(X(209),197,'o='+F(q.o),GC,10.5,'start',true);
      s+=T(X(168),78,'c'+(k+1)+' = '+F(q.c,3),CC,11.5,'start',true);
      s+=T(X(270),258,'h'+(k+1)+' = '+F(q.h,3),HC,11.5,'end',true);
      if(isOut(k)){
        s+=L('M'+X(262)+',168 L'+X(262)+',46',HC,w(q.h)*0.6,'H');
        s+='<rect x="'+X(222)+'" y="12" width="80" height="24" rx="6" fill="#3a1d2e" stroke="#e06a9a" stroke-width="2"/>'+T(X(262),28,'ŷ'+(k+1)+' = h'+(k+1),'#fff',11,'middle',true);
      }
      // vurgu: ileri sarı, geri turuncu kesikli
      if(HL&&HL.t===k+1){
        const col=HL.dir==='b'?'#f0a032':'#ffd24a';
        s+='<rect x="'+(ox-5)+'" y="43" width="290" height="272" rx="16" fill="none" stroke="'+col+'" stroke-width="3.5" stroke-dasharray="9 6"/>';
        s+=T(ox+140,334,HL.dir==='b'?'◀ BPTT: δ bu hücreden geçiyor':'▶ bu hücre hesaplanıyor',col,12,'middle',true);
      }
      if(HL&&HL.out&&isOut(k)){
        s+='<rect x="'+X(216)+'" y="6" width="92" height="36" rx="8" fill="none" stroke="'+(HL.dir==='b'?'#f0a032':'#ffd24a')+'" stroke-width="3" stroke-dasharray="7 5"/>';
      }
    });
    svg.innerHTML=s;
  }
  function render(){
    const st=run(); draw(st);
    let w='';
    st.forEach((q,k)=>{ w+='t='+(k+1)+':  c = f·c₋₁ + i·c̃ = ('+F(q.f)+')('+F(q.cp)+') + ('+F(q.i)+')('+F(q.g)+') = <b>'+F(q.c,3)+'</b>    h = o·tanh(c) = ('+F(q.o)+')('+F(Math.tanh(q.c))+') = <b>'+F(q.h,3)+'</b>\n'; });
    const we=$('ulWork'); if(we) we.innerHTML=w;
    const pay=st[1].f*st[2].f, ne=$('ulNote');
    if(ne) ne.innerHTML='🧠 <b>Hafıza yolculuğu:</b> hücre 1\'in hafızası c₁ = '+F(st[0].c,3)+', hücre 3\'e <b>f₂ × f₃ = '+F(st[1].f)+' × '+F(st[2].f)+' = '+F(pay)+'</b> oranında ulaşır (yalnız çarpan, W yok). f\'ler 1\'e yakınsa bilgi uzağa taşınır; 0\'a yakınsa yolda silinir.';
  }
  window.__lstmUnroll={render,setMode:m=>{mode=m;render();},setHL:h=>{HL=h;render();},run};
  render();
})();

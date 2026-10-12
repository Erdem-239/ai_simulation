// LSTM hücre mimarisi çizimi (Stanford/Colah tarzı, dik açılı): c hattı üstte, h hattı altta,
// dört kapı kutusu (σ σ tanh σ), ⊗/⊕ düğümleri. Hem statik (Nedir) hem canlı (Simülasyon vana paneli) kullanılır.
// window.lstmCellSvg(pre, v) → SVG iç HTML'i. v verilmezse semboller, verilirse canlı sayılar + akış kalınlığı.
(function(){
  const F=(x,d=2)=>(isFinite(x)?x:0).toFixed(d);
  const wpx=x=>Math.max(1.5,2+8*Math.min(2,Math.abs(x)));
  window.lstmCellSvg=function(pre,v,hl){
    const live=!!v;
    const GC='#f0a032', CC='#46c46a', BC='#3a7afe', HC='#e06a6a', N='#95a2c2';
    const w=k=>live?wpx(v[k]):2.5;
    const mk=(id,col)=>'<marker id="'+pre+id+'" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L6,3 L0,6 Z" fill="'+col+'"/></marker>';
    let s='<defs>'+mk('aC',CC)+mk('aG',GC)+mk('aB',BC)+mk('aH',HC)+mk('aN',N)+'</defs>';
    const L=(d,col,wd,arr)=>'<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+wd+'" stroke-linejoin="round" stroke-linecap="round"'+(arr?' marker-end="url(#'+pre+arr+')"':'')+'/>';
    const T=(x,y,t,col,sz,anc,bold)=>'<text x="'+x+'" y="'+y+'" text-anchor="'+(anc||'middle')+'" font-size="'+(sz||12)+'" fill="'+(col||'#ccd5e8')+'"'+(bold?' font-weight="700"':'')+'>'+t+'</text>';
    const circ=(x,y,t,fill,stk)=>'<circle cx="'+x+'" cy="'+y+'" r="16" fill="'+fill+'" stroke="'+stk+'" stroke-width="2"/>'+T(x,y+4,t,'#fff',12,'middle',true);
    const op=(x,y,g)=>'<circle cx="'+x+'" cy="'+y+'" r="14" fill="#2a1a3a" stroke="#c77dff" stroke-width="2"/>'+T(x,y+6,g,'#fff',18,'middle',true);
    const box=(x,y,t,fill,stk)=>'<rect x="'+(x-t.w/2)+'" y="'+(y-13)+'" width="'+t.w+'" height="26" rx="6" fill="'+fill+'" stroke="'+stk+'" stroke-width="2"/>'+T(x,y+5,t.s,'#fff',13,'middle',true);
    // hücre gövdesi
    s+='<rect x="110" y="62" width="540" height="262" rx="18" fill="rgba(70,196,106,.07)" stroke="#46c46a" stroke-opacity=".55" stroke-width="2"/>';
    // dış düğümler
    s+=circ(40,100,'cₜ₋₁','#3a1d2e','#e06a9a')+circ(736,100,'cₜ','#3a1d2e','#e06a9a');
    s+=circ(40,290,'hₜ₋₁','#3a1d2e','#e06a9a')+circ(736,290,'hₜ','#3a1d2e','#e06a9a');
    s+=circ(690,40,'hₜ','#3a1d2e','#e06a9a');
    s+=circ(150,360,'xₜ','#14323a','#4ad0e0');
    // h otobanı (alt) ve girdi
    s+=L('M56,290 L720,290',live?HC:N,live?w('h'):2.5,'aH');
    s+=L('M150,344 L150,291',BC,2.5,'aB');
    [150,230,320,410,500].forEach(x=>{s+='<circle cx="'+x+'" cy="290" r="3.5" fill="'+N+'"/>';});
    // c otobanı (üst)
    s+=L('M56,100 L215,100',CC,w('cp'),'aC');
    s+=L('M244,100 L395,100',CC,w('fc'),'aC');
    s+=L('M424,100 L718,100',CC,w('c'),'aC');
    s+=L('M560,100 L560,125',CC,Math.max(1.5,w('c')*0.7),'aC');
    s+=L('M560,154 L560,180',HC,w('tc'),'aH');
    // kapı sapları (bus → kutu)
    [230,320,500].forEach(x=>{s+=L('M'+x+',290 L'+x+',254',N,2);});
    s+=L('M410,290 L410,254',N,2);
    // f
    s+=L('M230,227 L230,115',GC,w('f'),'aG');
    // i → ⊗i
    s+=L('M320,227 L320,150 L395,150',GC,w('i'),'aG');
    // c̃ → ⊗i
    s+=L('M410,227 L410,165',BC,w('ct'),'aB');
    // ⊗i → ⊕
    s+=L('M410,136 L410,115',BC,w('ic'),'aB');
    // o → ⊗o
    s+=L('M500,227 L500,195 L545,195',GC,w('o'),'aG');
    // ⊗o → h (üst ve alt)
    s+=L('M574,195 L690,195 L690,57',HC,w('h'),'aH');
    s+=L('M690,195 L690,289',HC,w('h'),'aH');
    // düğümler
    s+=op(230,100,'×')+op(410,100,'+')+op(410,150,'×')+op(560,195,'×');
    s+='<ellipse cx="560" cy="140" rx="28" ry="14" fill="#14283a" stroke="#5aa0e0" stroke-width="2"/>'+T(560,145,'tanh','#fff',12,'middle',true);
    s+=box(230,240,{w:44,s:'σ'},'#3a2f14',GC)+box(320,240,{w:44,s:'σ'},'#3a2f14',GC)+box(410,240,{w:56,s:'tanh'},'#14283a','#5aa0e0')+box(500,240,{w:44,s:'σ'},'#3a2f14',GC);
    // etiketler
    const val=(k,d)=>live?' = '+F(v[k],d||2):'';
    s+=T(222,175,'fₜ'+val('f'),GC,12,'end',true);
    s+=T(312,190,'iₜ'+val('i'),GC,12,'end',true);
    s+=T(420,186,'c̃ₜ'+val('ct'),'#7aa8ff',12,'start',true);
    s+=T(490,222,'oₜ'+val('o'),GC,12,'end',true);
    if(live){
      s+=T(76,76,'c₋₁ = '+F(v.cp),CC,11.5,'start');
      s+=T(262,76,'f·c₋₁ = '+F(v.fc),N,11.5,'start');
      s+=T(430,134,'i·c̃ = '+F(v.ic),N,11.5,'start');
      s+=T(600,76,'c = '+F(v.c,3),CC,12,'start',true);
      s+=T(596,145,'tanh(c) = '+F(v.tc,3),N,11,'start');
      s+=T(684,236,'h = '+F(v.h,3),HC,12,'end',true);
    } else {
      s+=T(330,80,'cₜ = fₜ⊙cₜ₋₁ + iₜ⊙c̃ₜ','#8fdc9f',12,'middle');
      s+=T(578,232,'hₜ = oₜ⊙tanh(cₜ)','#f0a0a0',11,'start');
    }
    s+=T(80,325,'x ve hₜ₋₁ aynı otobana biner',N,10.5,'start');
    // vurgu (adım adım anlatım için): hl = ['x','h0','c0','fbox','ibox','gbox','obox','mulf','mului','plus','mulo','tanhe','ct','ht']
    const HL={x:['c',150,360,24],h0:['c',40,290,22],c0:['c',40,100,22],fbox:['r',230,240,56,38],ibox:['r',320,240,56,38],gbox:['r',410,240,68,38],obox:['r',500,240,56,38],mulf:['c',230,100,21],mului:['c',410,150,21],plus:['c',410,100,21],mulo:['c',560,195,21],tanhe:['e',560,140,38,20],ct:['c',736,100,22],ht:['c',736,290,22]};
    (hl||[]).forEach(k=>{const g=HL[k];if(!g)return;const st='fill="none" stroke="#ffd84a" stroke-width="3.5" stroke-dasharray="6 4"';
      if(g[0]==='c')s+='<circle cx="'+g[1]+'" cy="'+g[2]+'" r="'+g[3]+'" '+st+'/>';
      else if(g[0]==='r')s+='<rect x="'+(g[1]-g[3]/2)+'" y="'+(g[2]-g[4]/2)+'" width="'+g[3]+'" height="'+g[4]+'" rx="9" '+st+'/>';
      else s+='<ellipse cx="'+g[1]+'" cy="'+g[2]+'" rx="'+g[3]+'" ry="'+g[4]+'" '+st+'/>';});
    return s;
  };
})();
(function(){
  const a=document.getElementById('lstmArch'); if(!a) return;
  a.setAttribute('viewBox','0 0 760 390'); a.innerHTML=window.lstmCellSvg('la_');
})();

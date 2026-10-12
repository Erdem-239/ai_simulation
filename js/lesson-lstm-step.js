// LSTM vana paneli — RNN şemasındaki "İleri ▶ / ↺ Sıfırla" ile AYNI mantık:
// her basışta bir adım: şemada ilgili düğümler sarı halkayla işaretlenir, formül adım adım kurulur
// (yeni kısım kalın), altında o adımın açıklaması yazılır. Sayılar panelin kaydırıcılarından canlı.
(function(){
  const $=id=>document.getElementById(id);
  const go=$('lvStepGo'); if(!go) return;
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const F=(v,d=2)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d);};
  const rd=id=>parseFloat($(id).value);
  let step=0;
  function q(){const f=rd('lv_f'),i=rd('lv_i'),o=rd('lv_o'),cp=rd('lv_cp'),ct=rd('lv_ct');const fc=f*cp,ic=i*ct,c=fc+ic,tc=Math.tanh(c);return {f,i,o,cp,ct,fc,ic,c,tc,h:o*tc};}
  function steps(v){
    const B=t=>'<b style="color:#ffd84a">'+t+'</b>';
    const hist=[];
    return [
     {hl:['fbox','ibox','gbox','obox'],f:'kapılar: '+B('f='+F(v.f)+', i='+F(v.i)+', o='+F(v.o)+', c̃='+F(v.ct)),
      i:'Dört kutu (f, i, c̃, o) hazır. Gerçek hücrede her biri <b>W·x + U·h₋₁ + b</b> ile hesaplanır; <b>bu panelde değerleri sen kaydırıcıyla veriyorsun</b>. Hesabı adım adım görmek için 4️⃣ Nedir → "Neyle ne çarpılıyor?" bölümüne bak.'},
     {hl:['c0','mulf','fbox'],f:'c = '+B('f · c₋₁'),
      i:'<b>İlk çarpma:</b> eski hafıza <b>c₋₁</b> unutma kapısı <b>f</b> ile çarpılır: '+F(v.f)+' × '+F(v.cp)+' = <b>'+F(v.fc)+'</b>. f küçükse eski hafıza silinir, 1\'e yakınsa korunur.'},
     {hl:['mului','ibox','gbox'],f:'c = f·c₋₁ + '+B('i · c̃'),
      i:'<b>İkinci çarpma:</b> aday içerik <b>c̃</b> giriş kapısı <b>i</b> ile çarpılır: '+F(v.i)+' × '+F(v.ct)+' = <b>'+F(v.ic)+'</b>. i, yeni bilginin ne kadarının hafızaya gireceğini söyler.'},
     {hl:['plus'],f:'c = f·c₋₁ + i·c̃ = '+F(v.fc)+' + '+F(v.ic)+' = '+B(F(v.c,3)),
      i:'<b>Toplama:</b> iki parça toplanır → yeni hafıza <b>c</b> = <b>'+F(v.c,3)+'</b>. Dikkat: burada <b>W ile çarpma yok</b>, sadece kapı ölçeklemesi ve toplama var — gradyanın ölmemesinin sebebi bu.'},
     {hl:['ct'],f:'c = '+F(v.c,3)+' &nbsp;→&nbsp; '+B('sonraki adıma c')+' <span style="color:var(--muted);font-size:11.5px">(otoban)</span>',
      i:'Yeni hafıza <b>c</b> hiç değişmeden bir sonraki adıma gider (yeni c₋₁ olur). Aynı anda bir kopyası çıktıya doğru da ayrılır.'},
     {hl:['tanhe'],f:'tanh(c) = '+B('tanh('+F(v.c,3)+') = '+F(v.tc,3)),
      i:'<b>tanh:</b> hafıza değeri çıktıya çıkmadan önce −1…+1 aralığına sıkıştırılır.'},
     {hl:['mulo','obox'],f:'h = '+B('o · tanh(c)')+' = '+F(v.o)+' × '+F(v.tc,3)+' = '+F(v.h,3),
      i:'<b>Üçüncü çarpma:</b> çıkış kapısı <b>o</b> ile çarpılır: hafızanın ne kadarı dışarı söylensin.'},
     {hl:['ht'],f:'h = o·tanh(c) = '+F(v.h,3)+' &nbsp;<b style="color:#46c46a">✓ Tamamlandı!</b>',
      i:'Çıktı <b>h = '+F(v.h,3)+'</b>: üst katmana ve <b>sonraki adıma</b> gider. Sonraki adımda yeni h₋₁ = h, yeni c₋₁ = c olur ve x<sub>t+1</sub> gelir. <b>Toplam üç çarpma</b> (f·c₋₁, i·c̃, o·tanh c) ve bir toplama.'}
    ];
  }
  function draw(){
    const v=q(),S=steps(v);
    if(step===0){
      window.__lstmPipeHL=[];
      $('lvStepFormula').innerHTML='<b style="color:#ffd24a">İleri ▶</b> ile hücreyi adım adım kur: kapılar → c = f·c₋₁ + i·c̃ → h = o·tanh(c).';
      $('lvStepInfo').innerHTML='Bir adım ilerlet; ilgili düğümler sarı halkayla işaretlenir.';
    } else {
      const s=S[step-1];window.__lstmPipeHL=s.hl;
      $('lvStepFormula').innerHTML=s.f;$('lvStepInfo').innerHTML='<span style="color:var(--muted);font-size:12px">Adım '+step+' / '+S.length+'</span><br>'+s.i;
    }
    if(window.__lstmPipeRedraw)window.__lstmPipeRedraw();
    go.textContent=step>=S.length?'↺ Baştan':'İleri ▶';
    window.__lvStep={step,total:S.length};
  }
  go.addEventListener('click',()=>{const n=steps(q()).length;step=step>=n?0:step+1;draw();});
  $('lvStepRst').addEventListener('click',()=>{step=0;draw();});
  ['lv_f','lv_i','lv_o','lv_cp','lv_ct'].forEach(id=>$(id).addEventListener('input',()=>{if(step>0)draw();}));
  draw();
})();

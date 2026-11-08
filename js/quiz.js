/* Bitirme / çağ / genel testler.
   - Her dersin son aşamasındaki .quiz-mount[data-quiz=KEY] o dersin 10 sorusunu gösterir.
   - Sol çubuktaki .sb-quiz kutuları (app.js applyTreeOrder ekler) bir pencerede
     çağ testi (o çağın derslerinden 12 soru) ya da genel test (20 soru) açar.
   - Seçenekler her denemede karıştırılır; en iyi skor tarayıcıda saklanır. */
(function(){
  const D=window.QUIZ_DATA||{};
  const NM={linreg:'Lineer Regresyon',aktivasyon:'Aktivasyon',xor:'XOR',neural:'Neural Network',softmax:'Softmax',rnn:'RNN',lstm:'LSTM',vektor:'Vektör',embedding:'Kelime Temsili',seq2seq:'Seq2Seq',attention:'Self-Attention',multihead:'Multi-Head',transformer:'Transformer Bloğu',gpt:'GPT'};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function getBest(k){try{return JSON.parse(localStorage.getItem('attn_quiz_'+k)||'null');}catch(e){return null;}}
  function setBest(k,s,n){try{const b=getBest(k);if(!b||s/n>b.s/b.n)localStorage.setItem('attn_quiz_'+k,JSON.stringify({s:s,n:n}));}catch(e){}}

  // lessons'tan n soru: her dersten eşit pay, kalanı rastgele
  function pick(lessons,n){
    const pools=lessons.filter(l=>D[l]).map(l=>shuf(D[l].map(q=>Object.assign({l:l},q))));
    const out=[];let i=0;
    while(out.length<n && pools.some(p=>p.length)){const p=pools[i%pools.length];if(p.length)out.push(p.shift());i++;}
    return shuf(out);
  }

  function render(host,cfg){
    // cfg: {key, title, make:()=>sorular, showLesson}
    const qs=cfg.make();
    let done=0,right=0;
    const best=getBest(cfg.key);
    host.innerHTML='<div class="qz">'+
      '<div class="qz-top"><b>'+esc(cfg.title)+'</b><span class="qz-sc">0 / '+qs.length+'</span>'+
      (best?'<span class="qz-best">en iyi: '+best.s+'/'+best.n+'</span>':'')+'</div>'+
      '<div class="qz-hint">Bir seçeneğe tıkla; doğru cevap ve kısa açıklama hemen görünür. Seçenekler her denemede karışır.</div>'+
      qs.map((q,i)=>{
        const ord=shuf([0,1,2,3]);
        return '<div class="qz-q" data-a="'+ord.indexOf(q.a)+'"><div class="qz-qt"><span class="qz-n">'+(i+1)+'</span>'+esc(q.q)+
          (cfg.showLesson?' <span class="qz-tag">'+esc(NM[q.l]||q.l)+'</span>':'')+'</div>'+
          '<div class="qz-os">'+ord.map((o,j)=>'<button class="qz-o" data-j="'+j+'">'+'ABCD'[j]+') '+esc(q.o[o])+'</button>').join('')+'</div>'+
          '<div class="qz-w">'+esc(q.w)+'</div></div>';
      }).join('')+
      '<div class="qz-end"></div></div>';
    const sc=host.querySelector('.qz-sc'), end=host.querySelector('.qz-end');
    host.querySelectorAll('.qz-q').forEach(box=>{
      box.addEventListener('click',ev=>{
        const b=ev.target.closest('.qz-o'); if(!b||box.classList.contains('ans'))return;
        const a=+box.dataset.a, j=+b.dataset.j;
        box.classList.add('ans', j===a?'ok':'no');
        box.querySelectorAll('.qz-o').forEach(x=>{const k=+x.dataset.j; if(k===a)x.classList.add('right'); else if(k===j)x.classList.add('wrong'); x.disabled=true;});
        done++; if(j===a)right++;
        sc.textContent=right+' / '+qs.length+(done<qs.length?'  ·  cevaplanan '+done:'');
        if(done===qs.length){
          setBest(cfg.key,right,qs.length);
          const r=right/qs.length;
          end.innerHTML='<div class="qz-res">'+(r>=.9?'🏆':r>=.7?'✅':r>=.5?'🙂':'📚')+' <b>'+right+' / '+qs.length+'</b> doğru — '+
            (r>=.9?'konu oturmuş.':r>=.7?'iyi; yanlışların açıklamasına bir bak.':r>=.5?'yarı yarıya; ilgili bölümleri tekrar et.':'dersi bir kez daha gezmek iyi olur.')+
            ' <button class="qz-re">↺ Yeniden çöz (karıştır)</button></div>';
          end.querySelector('.qz-re').onclick=()=>{render(host,cfg); if(cfg.onRender)cfg.onRender();};
          if(cfg.onDone)cfg.onDone();
        }
      });
    });
  }

  // ders sonu testleri
  document.querySelectorAll('.quiz-mount[data-quiz]').forEach(m=>{
    const k=m.dataset.quiz; if(!D[k])return;
    render(m,{key:k,title:'🏁 '+(NM[k]||k)+' — bitirme testi ('+D[k].length+' soru)',make:()=>shuf(D[k].map(q=>Object.assign({l:k},q)))});
  });

  // pencere (çağ ve genel testler)
  const ov=document.createElement('div');
  ov.id='quizModal'; ov.innerHTML='<div class="qm-box"><button class="qm-x" title="Kapat (Esc)">✕</button><div class="qm-body"></div></div>';
  document.body.appendChild(ov);
  const body=ov.querySelector('.qm-body');
  function close(){ov.classList.remove('on');document.body.style.overflow='';}
  ov.querySelector('.qm-x').onclick=close;
  ov.addEventListener('click',e=>{if(e.target===ov)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on'))close();});

  function boxLabel(b){
    const k=b.dataset.qkey,bs=getBest(k),s=b.querySelector('.sbq-best');
    if(s)s.textContent=bs?'en iyi '+bs.s+'/'+bs.n:'henüz çözülmedi';
  }
  window.__quizSbSync=function(){document.querySelectorAll('.sb-quiz').forEach(boxLabel);};
  document.addEventListener('click',e=>{
    const b=e.target.closest('.sb-quiz'); if(!b)return;
    const lessons=(b.dataset.lessons||'').split(',').filter(Boolean), n=+b.dataset.n||12;
    render(body,{key:b.dataset.qkey,title:b.dataset.title,showLesson:true,make:()=>pick(lessons,n),
      onDone:window.__quizSbSync,onRender:()=>{body.scrollTop=0;}});
    ov.classList.add('on'); document.body.style.overflow='hidden'; body.scrollTop=0;
  });
  window.__quizSbSync();
  window.__quiz={pick:pick,render:render};
})();

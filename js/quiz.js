/* Bitirme / çağ / genel testler.
   - Her dersin son aşamasındaki .quiz-mount[data-quiz=KEY] o dersin 10 sorusunu gösterir.
   - Sol çubuktaki .sb-quiz kutuları (app.js applyTreeOrder ekler) bir pencerede
     çağ testi (o çağın derslerinden 12 soru) ya da genel test (20 soru) açar.
   - Seçenekler her denemede karıştırılır; en iyi skor tarayıcıda saklanır. */
(function(){
  const D=window.QUIZ_DATA||{};
  const NM={linreg:'Lineer Regresyon',aktivasyon:'Aktivasyon',xor:'XOR',neural:'Neural Network',softmax:'Softmax',rnn:'RNN',lstm:'LSTM',vektor:'Vektör',embedding:'Kelime Temsili',seq2seq:'Seq2Seq',attention:'Self-Attention',multihead:'Multi-Head',transformer:'Transformer Bloğu',gpt:'GPT',opt:'Optimizerlar',ovf:'Aşırı öğrenme',tok:'Tokenizasyon',gen:'Üretim stratejileri'};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function getBest(k){try{return JSON.parse(localStorage.getItem('attn_quiz_'+k)||'null');}catch(e){return null;}}
  function setBest(k,s,n){try{const b=getBest(k);if(!b||s/n>b.s/b.n)localStorage.setItem('attn_quiz_'+k,JSON.stringify({s:s,n:n}));}catch(e){}}

  // Yakında görülen soruları hatırla: önce görülmeyenler gelsin, havuz bitince baştan.
  const LS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v));}catch(e){return null;}};
  function seenOf(l){return new Set(LS('attn_quiz_seen_'+l)||[]);}
  function markSeen(qs){
    const by={}; qs.forEach(q=>{(by[q.l]=by[q.l]||[]).push(q.q);});
    for(const l in by){
      let s=seenOf(l); by[l].forEach(x=>s.add(x));
      if(s.size>=D[l].length) s=new Set(by[l]);       // havuz bitti: yeni tur
      LS('attn_quiz_seen_'+l,[...s]);
    }
  }
  function pool(l){
    const s=seenOf(l), all=shuf(D[l].map(q=>Object.assign({l:l},q)));
    return all.filter(q=>!s.has(q.q)).concat(all.filter(q=>s.has(q.q)));
  }
  // lessons'tan n soru: her dersten eşit pay; her dersin içinde önce görülmeyenler
  function pick(lessons,n){
    const pools=lessons.filter(l=>D[l]).map(pool);
    const out=[];let i=0;
    while(out.length<n && pools.some(p=>p.length)){const p=pools[i%pools.length];if(p.length)out.push(p.shift());i++;}
    markSeen(out);
    return shuf(out);
  }

  // ---- Yanlışlara göre tekrar önerisi: soru → dersin hangi aşaması ----
  const ST={hik:'Hikâye',ned:'Nedir',sim:'Simülasyon',big:'Bütün Resim',ekx:'Ekstra',orn:'Örnek Çalışmalar'};
  function stageOf(q){
    const t=q.q+' '+q.w;
    if(/\b(1[89]\d\d|20[0-2]\d)\b|Rosenblatt|Minsky|Gauss|Galton|Rumelhart|Hochreiter|Gers|Vaswani|Bahdanau|Sutskever|Markov|Shannon|Bengio|Clark|kışı|yazarlar/.test(t)) return 'hik';
    if(/Bütün Resim/.test(t)) return 'big';
    if(/sayfadaki|Örnek \d|Örnek Çalışma|örneğinde|demo|takıl|oyuncak|tohum|T = 30|minik GPT|Hogwarts|Draco/i.test(t)) return 'orn';
    if(/karar haritası|desen|D bölümü|Simülasyon/i.test(t)) return 'sim';
    if(/GQA|MQA|RoPE|RMSNorm|SwiGLU|MoE|fastText|lemmat|[Bb]eam|BLEU|[Pp]adding|clipping|GRU|NumPy|Pre-LN|Post-LN|subsampling|seyrelt|negatif örnekleme|gpt-oss|açık ağırlık/i.test(t)) return 'ekx';
    return 'ned';
  }
  function headOf(l,st){
    const m=document.getElementById('model-'+l); if(!m) return null;
    const hs=[...m.querySelectorAll('.tpl-cl > .tpl-head')];
    const want=[ST[st]].concat(st==='orn'?['Simülasyon']:[],st==='ekx'||st==='big'||st==='sim'?['Nedir']:[],['Nedir']);
    for(const w of want){const h=hs.find(x=>x.textContent.indexOf(w)>=0); if(h) return h;}
    return hs[0]||null;
  }
  function goTo(l,st){
    if(ov.classList.contains('on')) close();
    const b=document.querySelector('.navbtn[data-model="'+l+'"]'); if(b) b.click();
    setTimeout(()=>{
      const h=headOf(l,st); if(!h) return;
      if(h.classList.contains('closed')) h.click();
      h.scrollIntoView({behavior:'smooth',block:'start'});
    },120);
  }
  // birikmiş yanlış sayıları: {ders:{aşama:sayı}}
  function logWrong(ws){
    const g=LS('attn_quiz_wrong')||{};
    ws.forEach(q=>{const st=stageOf(q); g[q.l]=g[q.l]||{}; g[q.l][st]=(g[q.l][st]||0)+1;});
    LS('attn_quiz_wrong',g);
  }
  function advice(ws){
    if(!ws.length) return '<div class="qz-adv"><b>🎯 Tekrar önerisi:</b> yanlış yok — bir sonraki derse geçebilirsin.</div>';
    const grp={};
    ws.forEach(q=>{const st=stageOf(q),k=q.l+'|'+st; (grp[k]=grp[k]||{l:q.l,st:st,qs:[]}).qs.push(q);});
    const rows=Object.values(grp).sort((a,b)=>b.qs.length-a.qs.length).map(g=>{
      const h=headOf(g.l,g.st), lab=h?h.textContent.replace(/[▸▾]/g,'').trim():ST[g.st];
      return '<div class="qz-adv-row"><button class="qz-go" data-l="'+g.l+'" data-st="'+g.st+'">'+esc(NM[g.l]||g.l)+' → '+esc(lab)+' ↗</button>'+
        '<span class="qz-adv-n">'+g.qs.length+' yanlış</span><ul>'+g.qs.map(q=>'<li>'+esc(q.q)+'</li>').join('')+'</ul></div>';
    }).join('');
    const tot=LS('attn_quiz_wrong')||{}, top=[];
    for(const l in tot) for(const st in tot[l]) top.push({l:l,st:st,n:tot[l][st]});
    top.sort((a,b)=>b.n-a.n);
    const cum=top.length>1?'<div class="qz-adv-cum">📊 Bütün testlerde şimdiye kadar en çok yanlış: '+top.slice(0,3).map(t=>
      '<button class="qz-go" data-l="'+t.l+'" data-st="'+t.st+'">'+esc(NM[t.l]||t.l)+' · '+ST[t.st]+' ('+t.n+')</button>').join(' ')+'</div>':'';
    return '<div class="qz-adv"><b>🎯 Yanlışlarına göre tekrar et:</b> (düğme dersin o bölümünü açar)'+rows+cum+'</div>';
  }
  document.addEventListener('click',e=>{const g=e.target.closest('.qz-go'); if(g) goTo(g.dataset.l,g.dataset.st);});

  function render(host,cfg){
    // cfg: {key, title, make:()=>sorular, showLesson}
    const qs=cfg.make();
    let done=0,right=0; const wrong=[];
    const best=getBest(cfg.key);
    host.innerHTML='<div class="qz">'+
      '<div class="qz-top"><b>'+esc(cfg.title)+'</b><span class="qz-sc">0 / '+qs.length+'</span>'+
      (best?'<span class="qz-best">en iyi: '+best.s+'/'+best.n+'</span>':'')+'</div>'+
      '<div class="qz-hint">Bir seçeneğe tıkla; doğru cevap ve kısa açıklama hemen görünür. Sorular havuzdan seçilir, her denemede önce görmediklerin gelir; seçenekler de karışır.</div>'+
      qs.map((q,i)=>{
        const ord=shuf([0,1,2,3]);
        return '<div class="qz-q" data-i="'+i+'" data-a="'+ord.indexOf(q.a)+'"><div class="qz-qt"><span class="qz-n">'+(i+1)+'</span>'+esc(q.q)+
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
        done++; if(j===a)right++; else wrong.push(qs[+box.dataset.i]);
        sc.textContent=right+' / '+qs.length+(done<qs.length?'  ·  cevaplanan '+done:'');
        if(done===qs.length){
          setBest(cfg.key,right,qs.length);
          const r=right/qs.length;
          end.innerHTML='<div class="qz-res">'+(r>=.9?'🏆':r>=.7?'✅':r>=.5?'🙂':'📚')+' <b>'+right+' / '+qs.length+'</b> doğru — '+
            (r>=.9?'konu oturmuş.':r>=.7?'iyi; yanlışların açıklamasına bir bak.':r>=.5?'yarı yarıya; ilgili bölümleri tekrar et.':'dersi bir kez daha gezmek iyi olur.')+
            ' <button class="qz-re">↺ Yeni sorularla çöz</button></div>';
          logWrong(wrong); end.insertAdjacentHTML('beforeend',advice(wrong));
          end.querySelector('.qz-re').onclick=()=>{render(host,cfg); if(cfg.onRender)cfg.onRender();};
          if(cfg.onDone)cfg.onDone();
        }
      });
    });
  }

  // ders sonu testleri
  document.querySelectorAll('.quiz-mount[data-quiz]').forEach(m=>{
    const k=m.dataset.quiz; if(!D[k])return;
    render(m,{key:k,title:'🏁 '+(NM[k]||k)+' — bitirme testi (10 soru, '+D[k].length+' soruluk havuzdan)',make:()=>pick([k],10)});
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
  window.__quiz={pick:pick,render:render,stageOf:stageOf,headOf:headOf};
})();

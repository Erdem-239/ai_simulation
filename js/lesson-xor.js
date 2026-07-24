/* Aktivasyon sayfası — XOR bulmacası: lineer (aktivasyonsuz) vs non-lineer (2 nöron) */
(function(){
  'use strict';
  const cv = document.getElementById('actXorCanvas');
  if(!cv) return;
  const ctx = cv.getContext('2d');
  const F = (v,d=3) => (isFinite(v) ? v.toFixed(d) : '—');

  const points = [
    {x1:0, x2:0, y:0},
    {x1:0, x2:1, y:1},
    {x1:1, x2:0, y:1},
    {x1:1, x2:1, y:0}
  ];

  const angleIn = document.getElementById('actXorAngle');
  const offsetIn = document.getElementById('actXorOffset');
  const angleV = document.getElementById('actXorAngleV');
  const offsetV = document.getElementById('actXorOffsetV');
  const linControls = document.getElementById('actXorLinControls');
  const read = document.getElementById('actXorRead');
  const verdict = document.getElementById('actXorVerdict');
  const bestBtn = document.getElementById('actXorBest');
  const modeLinBtn = document.getElementById('actXorModeLin');
  const modeNLBtn = document.getElementById('actXorModeNL');
  const title = document.getElementById('actXorCanvasTitle');

  let mode = 'lin'; // 'lin' | 'nl'

  // ---- koordinat dönüşümü: (x1,x2) 0..1 aralığı -> canvas pikseli ----
  const PAD = 44, SZ = 280;
  function toPx(x1, x2){
    return { px: PAD + x1*SZ, py: PAD + (1-x2)*SZ };
  }

  function drawGrid(){
    ctx.fillStyle = '#12141a'; ctx.fillRect(0,0,cv.width,cv.height);
    ctx.strokeStyle = '#2a2e36'; ctx.lineWidth = 1;
    for(let i=0;i<=4;i++){
      const t = i/4;
      const {px:x1px} = toPx(t,0);
      const {py:y1py} = toPx(0,t);
      ctx.beginPath(); ctx.moveTo(x1px, PAD); ctx.lineTo(x1px, PAD+SZ); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD, y1py); ctx.lineTo(PAD+SZ, y1py); ctx.stroke();
    }
    ctx.strokeStyle = '#5a6068'; ctx.lineWidth = 1.4;
    ctx.strokeRect(PAD, PAD, SZ, SZ);
    ctx.fillStyle = '#8a9099'; ctx.font = '12px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('x1 →', PAD+SZ/2, PAD+SZ+28);
    ctx.save();
    ctx.translate(16, PAD+SZ/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText('x2 →', 0, 0);
    ctx.restore();
    ctx.textAlign = 'left'; ctx.font='11px Segoe UI'; ctx.fillStyle='#6f757c';
    ctx.fillText('0', PAD-14, PAD+SZ+14);
    ctx.fillText('1', PAD+SZ-4, PAD+SZ+14);
    ctx.fillText('1', PAD-18, PAD+4);
  }

  function drawPoints(predictFn){
    points.forEach(p=>{
      const {px, py} = toPx(p.x1, p.x2);
      const pred = predictFn ? predictFn(p.x1, p.x2) : null;
      const correct = pred===null ? null : (pred === p.y);
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI*2);
      ctx.fillStyle = p.y===1 ? '#46c46a' : '#e06a6a';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = correct===null ? '#12141a' : (correct ? '#ffd24a' : '#12141a');
      ctx.stroke();
      ctx.fillStyle = '#12141a'; ctx.font='bold 11px Segoe UI'; ctx.textAlign='center';
      ctx.fillText(p.y, px, py+4);
      ctx.fillStyle = '#c0c5cc'; ctx.font='10px Segoe UI';
      ctx.fillText('('+p.x1+','+p.x2+')', px, py-18);
    });
  }

  /* ================= LİNEER MOD ================= */
  function renderLinear(){
    drawGrid();
    const angleDeg = parseFloat(angleIn.value);
    const offset = parseFloat(offsetIn.value);
    const rad = angleDeg * Math.PI/180;
    const w1 = Math.cos(rad), w2 = Math.sin(rad);

    const predict = (x1,x2) => (w1*x1 + w2*x2 - offset >= 0) ? 1 : 0;

    // ayırma çizgisini çiz: w1*x1 + w2*x2 - offset = 0 doğrusu
    // doğru üstünde iki uç nokta bul (canvas sınırları içinde geniş bir çizgi çiz)
    let lineP1=null, lineP2=null;
    const candidates = [];
    // kenarları tara: x1=-1..2 sınırında x2 çöz, x2=-1..2 sınırında x1 çöz
    if(Math.abs(w2) > 1e-6){
      [-1,2].forEach(x1=>{
        const x2 = (offset - w1*x1)/w2;
        candidates.push({x1, x2});
      });
    }
    if(Math.abs(w1) > 1e-6){
      [-1,2].forEach(x2=>{
        const x1 = (offset - w2*x2)/w1;
        candidates.push({x1, x2});
      });
    }
    // canvas alanına (-1..2 x -1..2) düşenleri al, ilk 2'sini kullan
    const inRange = candidates.filter(c => c.x1>=-1.05 && c.x1<=2.05 && c.x2>=-1.05 && c.x2<=2.05);
    if(inRange.length>=2){ lineP1=inRange[0]; lineP2=inRange[inRange.length-1]; }

    if(lineP1 && lineP2){
      const a = toPx(lineP1.x1, lineP1.x2);
      const b = toPx(lineP2.x1, lineP2.x2);
      ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke();
    }

    drawPoints(predict);

    let correctCount = 0;
    const lines = points.map(p=>{
      const val = w1*p.x1 + w2*p.x2 - offset;
      const pred = val>=0 ? 1 : 0;
      const ok = pred===p.y;
      if(ok) correctCount++;
      return '('+p.x1+','+p.x2+'): '+F(w1,2)+'·'+p.x1+' + '+F(w2,2)+'·'+p.x2+' − '+F(offset,2)+' = '+F(val,2)+' → tahmin='+pred+' (gerçek='+p.y+') '+(ok?'✓':'✗');
    });
    read.textContent = 'w1='+F(w1,2)+', w2='+F(w2,2)+', b=−'+F(offset,2)+'\n\n' + lines.join('\n');

    if(correctCount===4){
      verdict.innerHTML = '🤔 4/4 doğru görünüyor mu? Kaydırıcıları biraz daha oynat — tam 4 noktayı AYNI ANDA tutan bir açı/konum YOK, sadece geçici bir çakışma olabilir. Deneye devam et.';
    } else {
      verdict.innerHTML = '📏 Şu an <b>'+correctCount+'/4</b> doğru. Açıyı ve konumu değiştirip dene — <b>4/4'+'\'e asla ulaşamayacaksın</b>, en fazla 3/4 çıkar. Bu, biraz önceki cebirsel kanıtın (çelişki: 2≠0) görsel hali.';
    }
  }

  /* ================= NON-LİNEER MOD (2 nöron) ================= */
  const step = z => z >= 0 ? 1 : 0;
  function h1fn(x1,x2){ return step(x1+x2-0.5); }
  function h2fn(x1,x2){ return step(x1+x2-1.5); }
  function yfn(x1,x2){ return step(h1fn(x1,x2) - h2fn(x1,x2) - 0.5); }

  function renderNonLinear(){
    drawGrid();

    // y=1 bölgesini (h1=1 VE h2=0 -> bant) hafif renklendirelim: noktasal tarama
    const imgStep = 6;
    for(let px=PAD; px<=PAD+SZ; px+=imgStep){
      for(let py=PAD; py<=PAD+SZ; py+=imgStep){
        const x1 = (px-PAD)/SZ, x2 = 1-(py-PAD)/SZ;
        const pred = yfn(x1,x2);
        ctx.fillStyle = pred===1 ? 'rgba(70,196,106,0.14)' : 'rgba(224,106,106,0.06)';
        ctx.fillRect(px, py, imgStep, imgStep);
      }
    }

    // h1 sınırı: x1+x2=0.5 (OR eşiği, mavi) — h2 sınırı: x1+x2=1.5 (AND eşiği, turuncu)
    // x1+x2=c doğrusu: x1=-1 -> x2=c+1 ; x1=2 -> x2=c-2
    [{c:0.5, color:'#3a7afe'}, {c:1.5, color:'#f0a032'}].forEach(line=>{
      const a = toPx(-1, line.c+1);
      const b = toPx(2, line.c-2);
      ctx.strokeStyle = line.color; ctx.lineWidth = 2; ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke();
      ctx.setLineDash([]);
    });

    drawPoints(yfn);

    let correctCount = 0;
    const lines = points.map(p=>{
      const h1 = h1fn(p.x1,p.x2), h2 = h2fn(p.x1,p.x2), y = yfn(p.x1,p.x2);
      const ok = y===p.y; if(ok) correctCount++;
      return '('+p.x1+','+p.x2+'): h1=step('+p.x1+'+'+p.x2+'−0.5)='+h1+'  h2=step('+p.x1+'+'+p.x2+'−1.5)='+h2+'  →  y=step('+h1+'−'+h2+'−0.5)='+y+' (gerçek='+p.y+') '+(ok?'✓':'✗');
    });
    read.textContent = lines.join('\n');
    verdict.innerHTML = '🎉 <b>'+correctCount+'/4 doğru!</b> Mavi çizgi h1\'in (OR gibi) sınırı, turuncu çizgi h2\'nin (AND gibi) sınırı. İkisinin arasındaki <b>bant</b> (yeşil gölgeli alan) tam olarak yeşil noktaları içeriyor, kırmızıları dışarıda bırakıyor — tek bir düz çizginin asla yapamadığını, 2 kıvrımlı nöronun birleşimi yapıyor.';
  }

  function render(){
    if(mode==='lin') renderLinear(); else renderNonLinear();
  }

  angleIn.addEventListener('input', ()=>{ angleV.textContent = angleIn.value+'°'; render(); });
  offsetIn.addEventListener('input', ()=>{ offsetV.textContent = F(parseFloat(offsetIn.value),2); render(); });

  bestBtn.addEventListener('click', ()=>{
    let best = {count:-1, angle:0, offset:0};
    for(let a=0; a<180; a+=1.8){
      for(let o=-1; o<=2; o+=0.06){
        const rad = a*Math.PI/180;
        const w1=Math.cos(rad), w2=Math.sin(rad);
        let c=0;
        points.forEach(p=>{
          const pred = (w1*p.x1+w2*p.x2-o>=0) ? 1:0;
          if(pred===p.y) c++;
        });
        if(c>best.count) best = {count:c, angle:a, offset:o};
      }
    }
    angleIn.value = best.angle.toFixed(0);
    offsetIn.value = best.offset.toFixed(2);
    angleV.textContent = angleIn.value+'°';
    offsetV.textContent = F(parseFloat(offsetIn.value),2);
    render();
    verdict.innerHTML = '🔍 100+ açı/konum kombinasyonu tarandı — <b>en iyi sonuç: '+best.count+'/4</b>. Gördüğün gibi hiçbiri 4/4\'e ulaşamıyor (en fazla 3/4). Şimdi "🧠 Aktivasyon ekle" moduna geçip farkı gör.';
  });

  modeLinBtn.addEventListener('click', ()=>{
    mode='lin';
    modeLinBtn.style.background='var(--blue)'; modeLinBtn.style.color='#fff'; modeLinBtn.style.border='none';
    modeNLBtn.style.background='var(--panel)'; modeNLBtn.style.color='var(--text)'; modeNLBtn.style.border='1px solid var(--line)';
    linControls.style.display='block';
    title.textContent = 'Çizgiyi sürükleyerek ayır';
    render();
  });
  modeNLBtn.addEventListener('click', ()=>{
    mode='nl';
    modeNLBtn.style.background='var(--green)'; modeNLBtn.style.color='#0b2a12'; modeNLBtn.style.border='none';
    modeLinBtn.style.background='var(--panel)'; modeLinBtn.style.color='var(--text)'; modeLinBtn.style.border='1px solid var(--line)';
    linControls.style.display='none';
    title.textContent = '2 nöron ile ayrılan bölgeler';
    render();
  });

  render();
})();

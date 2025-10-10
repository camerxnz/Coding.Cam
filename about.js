// about.js — starfield, tilt, and memory game for About page
(() => {
  // Simple DPR-aware canvas sizing
  const canvas = document.getElementById('starfield');
  const ctx = canvas && canvas.getContext && canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas(){
    if(!canvas) return;
    const w = document.documentElement.clientWidth;
    const h = document.documentElement.clientHeight;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
  }
  addEventListener('resize', resizeCanvas, {passive:true});
  resizeCanvas();

  // stars
  const stars = [];
  function seedStars(){
    if(!canvas) return;
    stars.length = 0;
    const count = Math.floor((canvas.width * canvas.height) / (1400 * DPR));
    for(let i=0;i<count;i++){
      stars.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        r: (0.3 + Math.random()*1.2) * DPR,
        a: 0.2 + Math.random()*0.8,
        t: Math.random()*Math.PI*2
      });
    }
  }
  seedStars();
  addEventListener('resize', seedStars, {passive:true});

  const shoots = [];
  function spawnShoot(){ if(Math.random() < 0.01) shoots.push({
    x: -120*DPR,
    y: (0.1 + Math.random()*0.7) * canvas.height,
    len: (120 + Math.random()*80) * DPR,
    s: (4 + Math.random()*6) * DPR,
    a: 1,
    w: (1 + Math.random()*1.8) * DPR,
    ang: Math.PI/8 + Math.random()*Math.PI/18
  }); }

  function draw(){
    if(!ctx) return;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#05050a';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    const g = ctx.createRadialGradient(canvas.width*0.15, canvas.height*0.2, 0, canvas.width*0.15, canvas.height*0.2, canvas.width*0.9);
    g.addColorStop(0, 'rgba(13,26,58,0.2)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);

    for(const s of stars){ s.t += 0.02; const tw = s.a + Math.sin(s.t)*0.08; ctx.globalAlpha = Math.max(0.15, Math.min(1, tw)); ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.shadowColor = 'rgba(109,90,255,0.3)'; ctx.shadowBlur = 6*DPR; ctx.fill(); }
    spawnShoot();
    for(let i=shoots.length-1;i>=0;i--){ const st = shoots[i]; ctx.save(); ctx.globalAlpha = st.a; const dx = Math.cos(st.ang)*st.len, dy = Math.sin(st.ang)*st.len; const grad = ctx.createLinearGradient(st.x, st.y, st.x+dx, st.y+dy); grad.addColorStop(0,'rgba(180,200,255,1)'); grad.addColorStop(0.6,'rgba(109,90,255,0.8)'); grad.addColorStop(1,'rgba(0,0,64,0)'); ctx.strokeStyle = grad; ctx.lineWidth = st.w; ctx.beginPath(); ctx.moveTo(st.x, st.y); ctx.lineTo(st.x+dx, st.y+dy); ctx.stroke(); ctx.restore(); st.x += Math.cos(st.ang)*st.s; st.y += Math.sin(st.ang)*st.s; st.a -= 0.01; if(st.a<=0 || st.x>canvas.width+200 || st.y>canvas.height+80) shoots.splice(i,1); }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // 3D tilt for the container card
  const card = document.getElementById('card');
  if(card){
    let bounds = card.getBoundingClientRect();
    function updateBounds(){ bounds = card.getBoundingClientRect(); }
    addEventListener('resize', updateBounds, {passive:true});

    const target = {rx:0, ry:0, tz:0}, current = {rx:0, ry:0, tz:0};
    function handlePointer(clientX, clientY){ const cx = (clientX - bounds.left)/bounds.width - 0.5; const cy = (clientY - bounds.top)/bounds.height - 0.5; target.ry = cx * 10; target.rx = -cy * 10; target.tz = Math.max(12, Math.abs(cx+cy)*18); card.classList.add('is-lifted'); }
    function resetTarget(){ target.rx = 0; target.ry = 0; target.tz = 0; card.classList.remove('is-lifted'); }
    card.addEventListener('pointermove', e=>{ if(e.pointerType === 'touch') return; handlePointer(e.clientX, e.clientY); }, {passive:true});
    card.addEventListener('touchmove', e=>{ const t = e.touches && e.touches[0]; if(!t) return; handlePointer(t.clientX, t.clientY); }, {passive:true});
    card.addEventListener('pointerleave', resetTarget);

    function loop(){ current.rx += (target.rx - current.rx) * 0.12; current.ry += (target.ry - current.ry) * 0.12; current.tz += (target.tz - current.tz) * 0.12; card.style.transform = `perspective(1000px) translateZ(${current.tz.toFixed(2)}px) rotateX(${current.rx.toFixed(2)}deg) rotateY(${current.ry.toFixed(2)}deg)`; requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
  }

  // Memory game
  (function(){
    const symbols = ['🍎','🍌','🍇','🍉','🍓','🍒','🍍','🥝'];
    let deck = [];
    let first = null, second = null, lock = false, moves = 0, matches = 0;
    const grid = document.getElementById('mgGrid');
    const movesEl = document.getElementById('mgMoves');
    const matchesEl = document.getElementById('mgMatches');
    const restartBtn = document.getElementById('mgRestart');

    function shuffleArray(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }
    function buildDeck(){ deck = symbols.concat(symbols); shuffleArray(deck); }
    function render(){ grid.innerHTML=''; grid.setAttribute('aria-busy','true'); deck.forEach((val, idx)=>{ const card = document.createElement('button'); card.className = 'mg-card'; card.setAttribute('data-val', val); card.setAttribute('aria-label','memory card'); card.innerHTML = `<div class="mg-inner"><div class="mg-face mg-front"></div><div class="mg-face mg-back">${val}</div></div>`; card.addEventListener('click', ()=> onCardClick(card)); card.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') onCardClick(card); }); grid.appendChild(card); }); grid.removeAttribute('aria-busy'); }
    function resetPick(){ first=null; second=null; lock=false; }
    function onCardClick(card){ if(lock) return; if(card.classList.contains('flipped')) return; card.classList.add('flipped'); if(!first){ first=card; return; } second=card; lock=true; moves++; movesEl.textContent = moves; const a = first.dataset.val, b = second.dataset.val; if(a===b){ matches++; matchesEl.textContent = matches; first.classList.add('disabled'); second.classList.add('disabled'); setTimeout(resetPick, 300); if(matches === symbols.length){ setTimeout(()=> alert('You matched all cards in '+moves+' moves!'), 250); } } else { setTimeout(()=>{ first.classList.remove('flipped'); second.classList.remove('flipped'); resetPick(); }, 800); } }
    function restart(){ moves=0; matches=0; movesEl.textContent = moves; matchesEl.textContent = matches; buildDeck(); render(); }
    restartBtn && restartBtn.addEventListener('click', restart);
    buildDeck(); render();
  })();

})();

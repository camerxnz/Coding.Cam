// about.js — About page starfield, card tilt, and memory game
(function(){
  const canvas = document.getElementById('starfield');
  if(!canvas) return;
  const cu = window.CanvasUtils?.setupCanvas(canvas);
  if(!cu) return;
  const { ctx, dpr } = cu;

  let stars = [];
  function seedStars(){ stars.length=0; const w=canvas.width,h=canvas.height; const count = Math.floor((w*h)/(1100*dpr)); for(let i=0;i<count;i++){ stars.push({ x:Math.random()*w, y:Math.random()*h, r:(0.3+Math.random()*1.2)*dpr, a:0.15+Math.random()*0.8, t:Math.random()*Math.PI*2, hue: Math.random()<0.88?230:255 }); } }
  seedStars(); window.addEventListener('resize', seedStars, { passive:true });

  function draw(){ ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#0b0b12'; ctx.fillRect(0,0,canvas.width,canvas.height); for(const s of stars){ s.t+=0.01; const tw = s.a + Math.sin(s.t)*0.06; ctx.globalAlpha=Math.max(0.12,Math.min(1,tw)); ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=`hsl(${s.hue} 90% 88%)`; ctx.shadowColor='rgba(109,90,255,0.28)'; ctx.shadowBlur=6*dpr; ctx.fill(); } requestAnimationFrame(draw); }
  requestAnimationFrame(draw);

  // Card tilt
  const card = document.getElementById('card');
  if(card){
    let tx=0,ty=0,cx=0,cy=0;
    addEventListener('mousemove', e=>{
      const w=document.documentElement.clientWidth, h=document.documentElement.clientHeight;
      tx = (e.clientX/w - 0.5) * 12; ty = (e.clientY/h - 0.5) * -8; }, {passive:true});
    function loop(){ cx += (tx-cx)*0.08; cy += (ty-cy)*0.08; card.style.transform = `rotateX(${cy}deg) rotateY(${cx}deg)`; requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
  }

  // Memory game (simple)
  const grid = document.getElementById('mgGrid'); const restart = document.getElementById('mgRestart'); const movesEl=document.getElementById('mgMoves'); const matchesEl=document.getElementById('mgMatches');
  if(grid){
    const icons = ['⚡','🌙','⭐','🔥','❄️','💧','🍀','🌟'];
    let deck = [], chosen = [], matches=0, moves=0;
    function buildDeck(){ deck = icons.concat(icons).slice(0,16); for(let i=deck.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; } render(); }
    function render(){ grid.innerHTML=''; deck.forEach((val,i)=>{ const card = document.createElement('div'); card.className='mg-card'; card.dataset.index=i; // put icon on front so it shows only after flip
        card.innerHTML = `<div class="mg-inner"><div class="mg-face mg-back"></div><div class="mg-face mg-front">${val}</div></div>`; card.addEventListener('click', ()=>onCardClick(card,i)); grid.appendChild(card); }); movesEl.textContent = moves; matchesEl.textContent = matches; }
    function onCardClick(el,i){ if(el.classList.contains('flipped') || chosen.length===2) return; el.classList.add('flipped'); chosen.push({el,i}); if(chosen.length===2){ moves++; movesEl.textContent=moves; const [a,b]=chosen; if(deck[a.i]===deck[b.i]){ matches++; matchesEl.textContent=matches; chosen=[]; if(matches===deck.length/2) setTimeout(()=>alert('You won!'),200); }else{ setTimeout(()=>{ a.el.classList.remove('flipped'); b.el.classList.remove('flipped'); chosen=[]; },600); } } }
    restart?.addEventListener('click', ()=>{ moves=0; matches=0; buildDeck(); });
    buildDeck();
  }

})();

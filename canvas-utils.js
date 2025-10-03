(function(){
  // Small canvas utility: DPR scaling and device heuristics
  const prefersReduced = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || false;
  const lowPower = prefersReduced || (navigator.deviceMemory && navigator.deviceMemory <= 1) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);

  function setCanvasDPR(canvas, options = {}){
    if(!canvas || !canvas.getContext) return function(){};
    const cfg = Object.assign({resize:true, onResize:null}, options);
    const ctx = canvas.getContext('2d');

    function update(){
      const dpr = window.devicePixelRatio || 1;
      // prefer clientWidth/Height if available (CSS-sized canvases)
      const cssW = canvas.clientWidth || window.innerWidth;
      const cssH = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      // keep CSS size intact so it doesn't visually jump
      canvas.style.width = canvas.style.width || cssW + 'px';
      canvas.style.height = canvas.style.height || cssH + 'px';
      // reset transform then scale for DPR
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(dpr, dpr);
      if(typeof cfg.onResize === 'function') cfg.onResize(canvas);
    }

    update();
    function onResize(){ update(); }
    if(cfg.resize) window.addEventListener('resize', onResize);

    return function destroy(){ if(cfg.resize) window.removeEventListener('resize', onResize); };
  }

  window.canvasUtils = window.canvasUtils || {};
  window.canvasUtils.setCanvasDPR = setCanvasDPR;
  window.canvasUtils.prefersReducedMotion = prefersReduced;
  window.canvasUtils.lowPowerMode = lowPower;
})();

// canvas-utils.js — small utility to handle DPR-aware canvas sizing
(function(){
  window.CanvasUtils = {
    setupCanvas(canvas){
      if(!canvas) return null;
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      function sizeToElement(){
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        return { w: canvas.width, h: canvas.height, dpr };
      }

      // initial size + responsive to element size changes
      sizeToElement();
      // resize on window resize (recompute element rect)
      window.addEventListener('resize', sizeToElement, { passive: true });

      return { ctx, dpr, sizeToElement };
    }
  };
})();

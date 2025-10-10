// ui-utils.js — small helpers: focus trap and escape-to-close
(function(){
  window.UIUtils = {
    trapFocus(root){
      if(!root) return () => {};
      const focusable = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const nodes = Array.from(root.querySelectorAll(focusable)).filter(n=>n.offsetParent!==null);
      const first = nodes[0]; const last = nodes[nodes.length-1];
      function keyHandler(e){
        if(e.key !== 'Tab') return;
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
      root.addEventListener('keydown', keyHandler);
      return ()=>root.removeEventListener('keydown', keyHandler);
    },
    onEscape(fn){
      function handler(e){ if(e.key === 'Escape' || e.key === 'Esc') fn(e); }
      window.addEventListener('keydown', handler);
      return ()=>window.removeEventListener('keydown', handler);
    }
  };
})();

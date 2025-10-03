(function(){
  function trapFocus(container){
    if(!container) return function(){};
    const focusable = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(container.querySelectorAll(focusable)).filter(n=>n.offsetParent !== null);
    if(nodes.length === 0) return function(){};
    const first = nodes[0];
    const last = nodes[nodes.length-1];
    function keyHandler(e){
      if(e.key === 'Tab'){
        if(e.shiftKey){
          if(document.activeElement === first){ e.preventDefault(); last.focus(); }
        } else {
          if(document.activeElement === last){ e.preventDefault(); first.focus(); }
        }
      }
    }
    first.focus();
    document.addEventListener('keydown', keyHandler);
    return function release(){ document.removeEventListener('keydown', keyHandler); };
  }

  function escClose(container, onClose){
    if(!container) return function(){};
    function onKey(e){ if(e.key === 'Escape' || e.key === 'Esc'){ onClose && onClose(); } }
    document.addEventListener('keydown', onKey);
    return function(){ document.removeEventListener('keydown', onKey); };
  }

  window.uiUtils = window.uiUtils || {};
  window.uiUtils.trapFocus = trapFocus;
  window.uiUtils.escClose = escClose;
})();

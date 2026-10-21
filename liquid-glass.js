// Optical highlights are local to the independent glass preview.
(() => {
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 const pointer = matchMedia('(hover: hover) and (pointer: fine)');
 const surfaces = [...document.querySelectorAll('.header nav,.action-button,.project-details,.theme-toggle,.note,.project-panel,.deck-preview,dialog,.qr-viewport')];
 let frame = 0, pending = null;
 const reset = element => { element.style.removeProperty('--glass-x'); element.style.removeProperty('--glass-y'); };
 const stop = () => {cancelAnimationFrame(frame);frame=0;pending=null;surfaces.forEach(reset);};
 const draw = () => {
  frame=0;
  if (!pending) return;
  const {element,x,y}=pending;
  element.style.setProperty('--glass-x',`${x.toFixed(1)}%`);
  element.style.setProperty('--glass-y',`${y.toFixed(1)}%`);
  pending=null;
 };
 surfaces.forEach(element => {
  element.addEventListener('pointermove',event => {
   if(motion.matches || !pointer.matches || event.pointerType!=='mouse')return;
   const rect=element.getBoundingClientRect();
   pending={element,x:(event.clientX-rect.left)/rect.width*100,y:(event.clientY-rect.top)/rect.height*100};
   if(!frame)frame=requestAnimationFrame(draw);
  },{passive:true});
  element.addEventListener('pointerleave',()=>{if(pending?.element===element)pending=null;reset(element);});
 });
 motion.addEventListener('change',stop);
 pointer.addEventListener('change',stop);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 window.addEventListener('pagehide',stop);
})();

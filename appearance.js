(() => {
 const root = document.documentElement;
 const trigger = document.querySelector('.appearance-trigger');
 const status = document.querySelector('#wallpaper-status');
 const video = document.querySelector('.apple-earth-video');
 const system = matchMedia('(prefers-color-scheme: dark)');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 // Page-local Easter eggs. Reloading always follows the OS.
 let mode = 'system', disposed = false, appearanceTransition;
 const gestureWindow = 1600;
 let taps = 0, firstTap = 0, tapTimer;
 function syncVideo() {
  if (!video) return;
  const active = mode === 'apple' && !document.hidden && !disposed && !reduced.matches;
  if (!active) {
   video.pause();
   // The scene is hidden outside the wallpaper theme, so the last decoded
   // frame can stay visible. Keeping it lets a later visit resume from the
   // same image instead of falling back to the first-frame poster.
   if (video.readyState < 2) video.classList.remove('is-playing');
   return;
  }
  if (!video.getAttribute('src')) video.src = 'assets/desktop-earth.mp4';
  video.muted = true;
  // Show an already decoded frame before the crossfade captures the new
  // state; otherwise the snapshot uses the poster and the globe jumps to the
  // resumed position once the transition ends.
  if (video.readyState >= 2) video.classList.add('is-playing');
  video.play().catch(() => video.classList.remove('is-playing'));
 }
 video?.addEventListener('playing', () => {
  if (mode === 'apple' && !document.hidden && !disposed && !reduced.matches) video.classList.add('is-playing');
  else syncVideo();
 });
 video?.addEventListener('error', () => video.classList.remove('is-playing'));
 function commitAppearance() {
  const earth = mode !== 'system';
  const dark = earth || system.matches;
  root.classList.add('theme-changing');
  root.dataset.earthSource = earth ? mode : 'none';
  root.dataset.appearance = earth ? 'desktop' : dark ? 'pixel-dark' : 'pixel-light';
  root.dataset.backdrop = earth ? 'desktop' : 'pixel';
  root.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]').content = earth ? '#030711' : dark ? '#161617' : '#ffffff';
  void root.offsetWidth;
  root.classList.remove('theme-changing');
  syncVideo();
 }
 // Crossfade complete rendered frames, keeping glass, text and wallpaper in sync.
 // This avoids independently interpolating gradients or exposing a blank video frame.
 function apply(animate = false) {
  if (appearanceTransition) appearanceTransition.skipTransition();
  if (!animate || reduced.matches || document.hidden || !document.startViewTransition) {
   commitAppearance();
   return;
  }
  root.classList.add('appearance-transition');
  const transition = document.startViewTransition(commitAppearance);
  appearanceTransition = transition;
  transition.finished.catch(() => {}).finally(() => {
   if (appearanceTransition === transition) {
    appearanceTransition = null;
    root.classList.remove('appearance-transition');
   }
  });
 }
 function resetTaps() { taps = 0; firstTap = 0; clearTimeout(tapTimer); }
 function toggle() {
  mode = mode === 'apple' ? 'system' : 'apple';
  apply(true);
  status.textContent = mode === 'system' ? '已恢复跟随系统外观' : '已发现苹果壁纸 再连续三击名字返回系统外观';
 }
 // Three taps activate immediately; single and double taps leave the theme unchanged.
 trigger.addEventListener('keydown', event => {
  if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
 });
 trigger.addEventListener('click', () => {
  const now = performance.now();
  if (!taps || now - firstTap > gestureWindow) { resetTaps(); firstTap = now; }
  taps += 1;
  clearTimeout(tapTimer);
  if (taps === 3) { resetTaps(); toggle(); }
  else tapTimer = setTimeout(resetTaps, gestureWindow - (now - firstTap));
 });
 trigger.addEventListener('blur', resetTaps);
 system.addEventListener('change', () => { if (mode === 'system') apply(); });
 reduced.addEventListener('change', syncVideo);
 document.addEventListener('visibilitychange', () => { resetTaps(); syncVideo(); });
 window.addEventListener('focus', () => { if (mode === 'system') apply(); });
 window.addEventListener('pagehide', () => { disposed = true; resetTaps(); syncVideo(); });
 window.addEventListener('pageshow', () => { disposed = false; apply(); });
 apply();
})();

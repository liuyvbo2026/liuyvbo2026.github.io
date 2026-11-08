(() => {
  const chapters = [...document.querySelectorAll('main > section')];
  if (!chapters.length) return;

  const smoothstep = (start, end, value) => {
    const progress = Math.max(0, Math.min(1, (value - start) / (end - start)));
    return progress * progress * (3 - 2 * progress);
  };
  const minimumPresence = 0.2;
  let frame = 0;

  function update() {
    frame = 0;
    const viewport = window.visualViewport;
    const height = viewport?.height || window.innerHeight;
    const offset = viewport?.offsetTop || 0;

    // Use actual content bounds: existing section padding stays unchanged.
    // Read all geometry first, then write opacity without changing the layout.
    const presence = chapters.map(section => {
      const first = section.firstElementChild || section;
      const last = section.lastElementChild || section;
      const top = (first.getBoundingClientRect().top - offset) / height;
      const bottom = (last.getBoundingClientRect().bottom - offset) / height;
      const entering = 1 - smoothstep(0.55, 0.95, top);
      const leaving = smoothstep(0.04, 0.34, bottom);
      return minimumPresence + (1 - minimumPresence) * Math.min(entering, leaving);
    });

    chapters.forEach((section, index) => {
      const value = presence[index].toFixed(3);
      if (section.style.getPropertyValue('--section-presence') !== value) {
        section.style.setProperty('--section-presence', value);
      }
      section.dataset.sectionFocus = '';
    });
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule, {passive: true});
  window.addEventListener('pageshow', schedule);
  window.visualViewport?.addEventListener('resize', schedule, {passive: true});
  window.visualViewport?.addEventListener('scroll', schedule, {passive: true});
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    chapters.forEach(section => observer.observe(section));
  }
  document.fonts?.ready.then(schedule);
  update();
})();

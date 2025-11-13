//(function() {
window.addEventListener("load", () => {
  const slider = document.querySelector('.auto-slider');
  if (!slider) return;
  const track = slider.querySelector('.slider-track');
  const slides = Array.from(track.children);
  const prevBtn = slider.querySelector('.prev');
  const nextBtn = slider.querySelector('.next');
  const dotsWrap = slider.querySelector('.slider-dots');
  
  // config
  const AUTO_MS = 4000;
  const TRANS_MS = 450;
  let index = 1; // start at first real slide after cloning
  let slideWidth = 0;
  let timer = null;
  let isPaused = false;
  let isDragging = false;
  let startX = 0,
    currentTranslate = 0,
    prevTranslate = 0;
  let isTransitioning = false; // <-- key flag
  
  // clone for infinite loop
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  firstClone.setAttribute('data-clone', 'first');
  lastClone.setAttribute('data-clone', 'last');
  track.appendChild(firstClone);
  track.insertBefore(lastClone, track.firstChild);
  
  // rebuild slides list
  const allSlides = Array.from(track.children);
  
  // create dots
  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', 'false');
    btn.dataset.slideIndex = i;
    btn.title = 'Go to slide ' + (i + 1);
    dotsWrap.appendChild(btn);
  });
  
  const dots = Array.from(dotsWrap.children);
  
  // set sizes
  function setSizes() {
    slideWidth = slider.querySelector('.slider-viewport').clientWidth;
    allSlides.forEach(s => s.style.width = slideWidth + 'px');
    // when resizing do instant move & update aria immediately
    moveToIndex(index, false, true);
  }
  window.addEventListener('resize', debounce(setSizes, 120));
  setSizes();
  
  // initial position: index 1 (first real)
  moveToIndex(index, false, true);
  updateDots();
  updateAriaStates(index);
  
  // auto play
  function startAuto() {
    stopAuto();
    timer = setInterval(() => goNext(), AUTO_MS);
  }
  
  function stopAuto() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  startAuto();
  
  // pause on hover / focus
  slider.addEventListener('mouseenter', () => {
    isPaused = true;
    stopAuto();
  });
  slider.addEventListener('mouseleave', () => {
    isPaused = false;
    startAuto();
  });
  slider.addEventListener('focusin', () => {
    isPaused = true;
    stopAuto();
  });
  slider.addEventListener('focusout', () => {
    isPaused = false;
    startAuto();
  });
  
  // prev/next handlers
  prevBtn.addEventListener('click', () => {
    goPrev();
    restartAuto();
  });
  nextBtn.addEventListener('click', () => {
    goNext();
    restartAuto();
  });
  
  // dot handlers
  dots.forEach(d => d.addEventListener('click', e => {
    const n = Number(e.currentTarget.dataset.slideIndex);
    index = n + 1;
    moveToIndex(index, true, false);
    restartAuto();
  }));
  
  // keyboard navigation
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
      goPrev();
      restartAuto();
    }
    if (e.key === 'ArrowRight') {
      goNext();
      restartAuto();
    }
  });
  // make slider focusable
  slider.tabIndex = 0;
  
  // transition end: handle clones and update aria/dots once (no blink)
  track.addEventListener('transitionend', (ev) => {
    // only respond to transform transitions
    if (ev.propertyName && ev.propertyName !== 'transform') return;
    
    isTransitioning = false;
    
    // if we landed on a clone, jump instantly to the real slide without transition
    const current = allSlides[index];
    if (current && current.dataset.clone === 'first') {
      index = 1;
      // instant move without triggering aria during teleport
      moveToIndex(index, false, true);
    } else if (current && current.dataset.clone === 'last') {
      index = slides.length;
      moveToIndex(index, false, true);
    }
    
    // now safe to update dots & aria
    updateDots();
    updateAriaStates(index);
  });
  
  // go next/prev
  function goNext() {
    if (isTransitioning) return; // prevent spam clicks while animating
    index++;
    moveToIndex(index, true, false);
    updateDots(); // visual dot update can happen immediately
  }
  
  function goPrev() {
    if (isTransitioning) return;
    index--;
    moveToIndex(index, true, false);
    updateDots();
  }
  
  function restartAuto() { stopAuto(); if (!isPaused) startAuto(); }
  
  // core movement
  // animate: whether to use transition
  // forceAria: if true, update aria immediately (used for instant moves/resizes)
  function moveToIndex(i, animate = true, forceAria = false) {
  // 1) immediately set .active on the target slide-content
  // (do this BEFORE the transform so content appears right away)
  const target = allSlides[i];
  if (target) {
    allSlides.forEach(s => {
      const content = s.querySelector('.slide-content');
      if (!content) return;
      if (s === target) content.classList.add('active');
      else content.classList.remove('active');
    });
  }
  
  // 2) do the transform (animate or instant)
  if (animate) {
    isTransitioning = true;
    track.style.transition = 'transform ' + TRANS_MS + 'ms cubic-bezier(.22,.9,.3,1)';
  } else {
    track.style.transition = 'none';
  }
  
  const x = -(i * slideWidth);
  
  // ensure the DOM has applied the .active class before starting transform
  // use rAF to let browser paint the class change, then move
  requestAnimationFrame(() => {
    track.style.transform = `translate3d(${x}px,0,0)`;
  });
  
  // 3) ARIA updates: if instant or forced, run now. Otherwise defer to transitionend.
  if (!animate || forceAria) {
    requestAnimationFrame(() => {
      track.offsetHeight;
      updateAriaStates(i);
    });
  }
}
  
  // update aria/tabindex states for slides (safe to call after transition or for instant moves)
  function updateAriaStates(i) {
    // preserve focus if it's inside the slider to avoid stealing focus during updates
    const activeInside = slider.contains(document.activeElement) ? document.activeElement : null;
    
    allSlides.forEach((s, idx) => {
      const img = s.querySelector('img');
      const isCurrent = idx === i;
      
      if (img) {
        if (isCurrent) img.removeAttribute('aria-hidden');
        else img.setAttribute('aria-hidden', 'true');
      }
      
      s.setAttribute('aria-current', isCurrent ? 'true' : 'false');
      
      const parentLink = s.closest('a');
      if (parentLink) {
        // If the focused element is inside this parentLink and it's about to be hidden,
        // do not remove focus/tabindex to avoid focus loss flicker.
        if (isCurrent) {
          parentLink.removeAttribute('aria-hidden');
          parentLink.tabIndex = 0;
        } else {
          // Only hide if it is not the focused element.
          if (activeInside && parentLink.contains(activeInside)) {
            // keep it focusable for now
            parentLink.removeAttribute('aria-hidden');
            parentLink.tabIndex = 0;
          } else {
            parentLink.setAttribute('aria-hidden', 'true');
            parentLink.tabIndex = -1;
          }
        }
      }
    });
    
    // if focus was inside slider, keep it — don't re-focus automatically here
  }
  
  function updateDots() {
    let active = index - 1;
    if (active < 0) active = slides.length - 1;
    if (active >= slides.length) active = 0;
    dots.forEach((d, i) => d.setAttribute('aria-selected', i === active ? 'true' : 'false'));
  }
  
  // touch/drag support
  track.addEventListener('pointerdown', startDrag);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('pointermove', onDrag);
  
  function startDrag(e) {
    if (isTransitioning) return; // don't start drag while animating
    isDragging = true;
    startX = e.clientX;
    prevTranslate = -index * slideWidth;
    track.style.transition = 'none';
    try { slider.setPointerCapture(e.pointerId); } catch (err) {}
  }
  
  function onDrag(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    currentTranslate = prevTranslate + dx;
    track.style.transform = `translate3d(${currentTranslate}px,0,0)`;
  }
  
  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    const dx = e.clientX - startX;
    // threshold to change slide
    if (Math.abs(dx) > slideWidth * 0.18) {
      if (dx < 0) { index++; } else { index--; }
    }
    moveToIndex(index, true, false);
    restartAuto();
  }
  
  // utility: debounce
  function debounce(fn, t = 100) {
    let id;
    return function(...a) {
      clearTimeout(id);
      id = setTimeout(() => fn.apply(this, a), t);
    };
  }
});
//})();

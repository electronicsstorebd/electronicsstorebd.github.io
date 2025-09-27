(function() {
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
    prevTranslate = 0,
    animationID = null;
  
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
    moveToIndex(index, false);
  }
  window.addEventListener('resize', debounce(setSizes, 120));
  setSizes();
  
  // initial position: index 1 (first real)
  moveToIndex(index, false);
  updateDots();
  
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
    moveToIndex(index, true);
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
  
  // transition end: handle clones
  track.addEventListener('transitionend', () => {
    const current = allSlides[index];
    if (current && current.dataset.clone === 'first') {
      // jumped to clone of first -> reset to real first
      index = 1;
      moveToIndex(index, false);
    } else if (current && current.dataset.clone === 'last') {
      index = slides.length;
      moveToIndex(index, false);
    }
    updateDots();
  });
  
  // go next/prev
  function goNext() {
    index++;
    moveToIndex(index, true);
    updateDots();
  }
  
  function goPrev() {
    index--;
    moveToIndex(index, true);
    updateDots();
  }
  
  function restartAuto() { stopAuto(); if (!isPaused) startAuto(); }
  
  // core movement
  function moveToIndex(i, animate = true) {
    if (animate) track.style.transition = 'transform ' + TRANS_MS + 'ms cubic-bezier(.22,.9,.3,1)';
    else track.style.transition = 'none';
    const x = -(i * slideWidth);
    track.style.transform = `translate3d(${x}px,0,0)`;
    // aria hidden toggles for accessibility
    allSlides.forEach((s, idx) => {
      const img = s.querySelector('img');
      if (!img) return;
      if (idx === i) {
        img.removeAttribute('aria-hidden');
      } else {
        img.setAttribute('aria-hidden', 'true');
      }
    });
  }
  
  function updateDots() {
    // real slides count = slides.length
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
    isDragging = true;
    startX = e.clientX;
    prevTranslate = -index * slideWidth;
    track.style.transition = 'none';
    slider.setPointerCapture(e.pointerId);
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
    moveToIndex(index, true);
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
  
})();

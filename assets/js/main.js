// All project content is rendered in HTML, including the two project groups.
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

(() => {
  const carousel = document.querySelector('.project-carousel');
  if (!carousel) return;
  const stage = carousel.querySelector('.project-stage');
  const base = stage.querySelector('[data-carousel-layer="base"]');
  const slides = [...base.querySelectorAll('.stage-card')];
  const blend = base.cloneNode(true);
  blend.dataset.carouselLayer = 'blend';
  blend.setAttribute('aria-hidden', 'true');
  stage.append(blend);
  const copies = [...blend.querySelectorAll('.stage-card')];
  const announcement = carousel.querySelector('[data-carousel-announcement]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const total = slides.length;
  const AUTO_SPEED = .12; // Twenty percent faster than the previous 0.1 projects/second.
  let position = 1;
  let velocity = AUTO_SPEED;
  let target = null;
  let width = stage.clientWidth;
  let frame = null;
  let lastTime = 0;
  let holdUntil = 0;
  let paused = false;
  let hovered = false;
  let focused = false;
  let visible = true;
  let gesture = null;
  let wheelEndAt = 0;
  let history = [];

  const wrap = value => ((value % total) + total) % total;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const smooth = value => { const x = clamp(value, 0, 1); return x * x * (3 - 2 * x); };
  const pixelsPerStep = () => clamp(width * .4, 140, 420);
  const canRotate = () => !paused && !hovered && !focused && !gesture && !wheelEndAt && visible && !document.hidden && !reducedMotion.matches;

  function render() {
    const lower = Math.floor(position);
    const progress = position - lower;
    // Each scene keeps a fixed order throughout this step. Their blend is continuous
    // across the old half-step seam and also across integer/loop boundaries.
    blend.style.opacity = smooth((progress - .25) / .5).toFixed(4);
    [slides, copies].forEach((layer, layerIndex) => {
      const front = lower + layerIndex;
      layer.forEach((slide, index) => {
        const distance = wrap(index - position + total / 2) - total / 2;
        const absolute = Math.abs(distance);
        const angle = distance * Math.PI / 3;
        const x = Math.sin(angle) * width * .39;
        const y = Math.min(absolute, 2) * (width < 600 ? 42 : 58);
        const scale = Math.max(.48, .2 + .8 * Math.cos(angle));
        const opacity = smooth((1.85 - absolute) / .75);
        const orderDistance = Math.abs(wrap(index - front + total / 2) - total / 2);
        slide.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), ${y.toFixed(2)}px, 0) rotate(${clamp(distance * 7, -12, 12).toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        slide.style.opacity = opacity.toFixed(4);
        slide.style.zIndex = String(100 - orderDistance * 10);
        slide.style.visibility = opacity < .001 ? 'hidden' : 'visible';
        if (!layerIndex) slide.setAttribute('aria-hidden', String(absolute > 1.2));
      });
    });
    stage.dataset.activeProject = slides[wrap(Math.round(position))].dataset.project;
    stage.dataset.rotating = String(canRotate());
    stage.dataset.paused = String(paused);
  }

  function record(time) {
    history.push({ position, time });
    history = history.filter(sample => time - sample.time <= 100);
  }

  function releaseVelocity(time) {
    if (history.length < 2 || time - history[history.length - 1].time > 100) return 0;
    const first = history[0];
    const last = history[history.length - 1];
    return last.time > first.time ? clamp((last.position - first.position) * 1000 / (last.time - first.time), -6, 6) : 0;
  }

  function settle(time, cancelled = false) {
    velocity = cancelled || reducedMotion.matches ? 0 : releaseVelocity(time);
    // Exponential momentum projection, followed by an interruptible spring.
    const projection = clamp((velocity / 1000) * .998 / (1 - .998), -2.5, 2.5);
    target = Math.round(position + projection);
    holdUntil = time + 1800;
    if (reducedMotion.matches) { position = target; target = null; }
    history = [];
    render();
  }

  function tick(time) {
    frame = null;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, .032) : 0;
    lastTime = time;
    if (wheelEndAt && time >= wheelEndAt) {
      const releasedAt = wheelEndAt - 120;
      wheelEndAt = 0;
      settle(releasedAt);
    }
    if (!gesture && !wheelEndAt && target !== null) {
      const omega = 10;
      velocity += (omega * omega * (target - position) - 2 * omega * velocity) * dt;
      position += velocity * dt;
      if (Math.abs(target - position) < .001 && Math.abs(velocity) < .002) {
        position = target;
        target = null;
        velocity = 0;
        holdUntil = time + 1400;
      }
    } else if (canRotate() && time >= holdUntil) {
      velocity += (AUTO_SPEED - velocity) * (1 - Math.exp(-3 * dt));
      position += velocity * dt;
    } else if (!gesture && !wheelEndAt) {
      velocity = 0;
    }
    render();
    if (target !== null || wheelEndAt || canRotate()) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }

  function wake() {
    if (frame === null) {
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    }
  }

  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    target = null;
    wheelEndAt = 0;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, position, active: false, touch: event.pointerType !== 'mouse' };
    history = [];
    record(event.timeStamp);
    stage.setPointerCapture(event.pointerId);
    render();
    wake();
  });

  stage.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.active) {
      if (gesture.touch && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
        endGesture(event, true);
        return; // Leave vertical page scrolling to the browser.
      }
      if (Math.abs(dx) < 6) return;
      gesture.active = true;
      stage.classList.add('is-dragging');
    }
    if (event.cancelable) event.preventDefault();
    position = gesture.position - dx / pixelsPerStep();
    record(event.timeStamp);
    render(); // Direct feedback, without a transition or animation delay.
  });

  function endGesture(event, cancelled = false) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const active = gesture.active;
    gesture = null;
    stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (active) { settle(event.timeStamp, cancelled); wake(); }
    else { holdUntil = event.timeStamp + 500; render(); wake(); }
  }
  stage.addEventListener('pointerup', event => endGesture(event));
  stage.addEventListener('pointercancel', event => endGesture(event, true));
  stage.addEventListener('lostpointercapture', event => endGesture(event, true));
  stage.addEventListener('dragstart', event => event.preventDefault());

  stage.addEventListener('wheel', event => {
    // Horizontal trackpad input and Shift+wheel browse projects. Ordinary vertical
    // wheel/touch gestures retain normal page scrolling, so this never traps it.
    if (event.ctrlKey || (!event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY))) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
    const delta = (event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX) * unit;
    if (!delta) return;
    event.preventDefault();
    if (!wheelEndAt) history = [];
    target = null;
    position += clamp(delta, -width, width) / pixelsPerStep();
    record(event.timeStamp);
    wheelEndAt = event.timeStamp + 120;
    render();
    wake();
  }, { passive: false });

  stage.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      paused = !paused;
      if (!paused) focused = false;
      announcement.textContent = paused ? 'Carousel paused.' : 'Carousel playing.';
      render(); wake(); return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const destination = Math.round(target === null ? position : target) + (event.key === 'ArrowRight' ? 1 : -1);
    announcement.textContent = slides[wrap(destination)].getAttribute('aria-label');
    target = destination;
    if (reducedMotion.matches) { position = destination; target = null; velocity = 0; }
    render(); wake();
  });
  stage.addEventListener('pointerenter', () => { hovered = true; wake(); });
  stage.addEventListener('pointerleave', () => { hovered = false; wake(); });
  stage.addEventListener('focusin', () => { focused = stage.matches(':focus-visible'); wake(); });
  stage.addEventListener('focusout', () => { focused = false; wake(); });
  document.addEventListener('visibilitychange', wake);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) { if (target !== null) position = target; target = null; velocity = 0; }
    render(); wake();
  });
  new ResizeObserver(() => { width = stage.clientWidth; render(); }).observe(stage);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; wake(); }, { threshold: .15 }).observe(carousel);
  render();
  wake();
})();

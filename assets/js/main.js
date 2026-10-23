// Content is rendered in HTML so the portfolio also works without JavaScript.
const buttons = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-category]')];
const count = document.querySelector('.project-count');
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
    const total = cards.filter(card => !card.hidden).length;
    count.textContent = `${total} projects to explore`;
  });
});
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// A slow, pausable orbit preserves the original three-card composition.
// Moving cards use transform/opacity only; pauses freeze their current positions.
(() => {
  const carousel = document.querySelector('.project-carousel');
  if (!carousel) return;
  const stage = carousel.querySelector('.project-stage');
  const slides = [...stage.querySelectorAll('.stage-card')];
  const controls = carousel.querySelector('.carousel-controls');
  const toggle = carousel.querySelector('[data-carousel-toggle]');
  const toggleLabel = carousel.querySelector('[data-carousel-toggle-label]');
  const positionLabel = carousel.querySelector('.carousel-position');
  const announcement = carousel.querySelector('[data-carousel-announcement]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const total = slides.length;
  let position = 1; // Weather in front, rail to the left, football to the right.
  let velocity = 0;
  let target = null;
  let width = stage.clientWidth;
  let frame = null;
  let lastTime = 0;
  let holdUntil = 0;
  let paused = false;
  let hovered = false;
  let focused = false;
  let visible = true;

  const wrap = value => ((value % total) + total) % total;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const canRotate = () => !paused && !hovered && !focused && visible && !document.hidden && !reducedMotion.matches;

  function render() {
    slides.forEach((slide, index) => {
      const distance = wrap(index - position + total / 2) - total / 2;
      const absolute = Math.abs(distance);
      const angle = distance * Math.PI / 3;
      const x = Math.sin(angle) * width * .39;
      const y = Math.min(absolute, 2) * (width < 600 ? 42 : 58);
      const scale = Math.max(.48, .2 + .8 * Math.cos(angle));
      const fade = clamp((1.85 - absolute) / .75, 0, 1);
      const opacity = fade * fade * (3 - 2 * fade);
      slide.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), ${y.toFixed(2)}px, 0) rotate(${clamp(distance * 7, -12, 12).toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      slide.style.opacity = opacity.toFixed(4);
      slide.style.zIndex = String(100 - Math.round(absolute * 20));
      slide.style.visibility = opacity < .001 ? 'hidden' : 'visible';
      slide.setAttribute('aria-hidden', String(absolute > 1.2));
      slide.dataset.position = distance > .5 ? 'right' : 'left';
    });
    const current = wrap(Math.round(position));
    positionLabel.textContent = `${String(current + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    stage.dataset.activeProject = slides[current].dataset.project;
    stage.dataset.rotating = String(canRotate());
  }

  function tick(time) {
    frame = null;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, .032) : 0;
    lastTime = time;
    if (target !== null) {
      // Critically damped spring; retargeting carries current position and velocity.
      const omega = 10;
      velocity += (omega * omega * (target - position) - 2 * omega * velocity) * dt;
      position += velocity * dt;
      if (Math.abs(target - position) < .001 && Math.abs(velocity) < .002) {
        position = target;
        target = null;
        velocity = 0;
        holdUntil = time + 2000;
      }
    } else if (canRotate() && time >= holdUntil) {
      velocity = 1 / 12; // One project passes the centre every twelve seconds.
      position += velocity * dt;
    } else {
      velocity = 0;
    }
    render();
    if (target !== null || canRotate()) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }

  function wake() {
    if (frame === null) {
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    }
  }

  function updateControls() {
    toggle.disabled = reducedMotion.matches;
    toggle.setAttribute('aria-pressed', String(paused || reducedMotion.matches));
    toggleLabel.textContent = reducedMotion.matches ? 'Reduced motion' : paused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', reducedMotion.matches ? 'Auto-rotation disabled for reduced motion' : paused ? 'Play project carousel' : 'Pause project carousel');
    wake();
  }

  function step(direction) {
    const destination = Math.round(target === null ? position : target) + direction;
    announcement.textContent = slides[wrap(destination)].getAttribute('aria-label');
    if (reducedMotion.matches) {
      position = destination;
      target = null;
      velocity = 0;
      render();
    } else {
      target = destination;
      wake();
    }
  }

  carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => step(-1));
  carousel.querySelector('[data-carousel-next]').addEventListener('click', () => step(1));
  toggle.addEventListener('click', () => { paused = !paused; updateControls(); });
  carousel.addEventListener('pointerenter', () => { hovered = true; wake(); });
  carousel.addEventListener('pointerleave', () => { hovered = false; wake(); });
  carousel.addEventListener('focusin', () => { focused = true; wake(); });
  carousel.addEventListener('focusout', event => { focused = carousel.contains(event.relatedTarget); wake(); });
  document.addEventListener('visibilitychange', wake);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && target !== null) { position = target; target = null; velocity = 0; }
    updateControls();
  });
  new ResizeObserver(() => { width = stage.clientWidth; render(); }).observe(stage);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; wake(); }, { threshold: .15 }).observe(carousel);
  controls.hidden = false;
  render();
  updateControls();
})();

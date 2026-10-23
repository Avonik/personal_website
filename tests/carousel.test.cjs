const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../assets/js/main.js'), 'utf8');
function setup(reduce = false) {
  function element(dataset = {}) {
    return { dataset, style: {}, events: {}, attrs: {}, textContent: '', addEventListener(name, fn) { this.events[name] = fn; }, setAttribute(name, value) { this.attrs[name] = value; }, getAttribute(name) { return this.attrs[name]; } };
  }
  const slides = ['rail','weather','football','pen','papers','parliament','pdf','patent'].map((project, i) => {
    const node = element({project}); node.attrs['aria-label'] = `${i+1}: ${project}`; return node;
  });
  const stage = element(); stage.clientWidth = 1040; stage.querySelectorAll = () => slides;
  const controls = element(), toggle = element(), label = element(), counter = element(), announcement = element(), prev = element(), next = element();
  const map = {'.project-stage':stage,'.carousel-controls':controls,'[data-carousel-toggle]':toggle,'[data-carousel-toggle-label]':label,'.carousel-position':counter,'[data-carousel-announcement]':announcement,'[data-carousel-prev]':prev,'[data-carousel-next]':next};
  const carousel = element(); carousel.querySelector = key => map[key]; carousel.contains = () => false;
  const document = element(); document.hidden = false; document.querySelector = () => carousel;
  const media = element(); media.matches = reduce;
  let timer = 0, id = 0, observer;
  const frames = new Map();
  const context = { document, window:{matchMedia:()=>media}, requestAnimationFrame(fn) { frames.set(++id, fn); return id; }, ResizeObserver:class {constructor(fn){this.fn=fn;}observe(){this.fn();}}, IntersectionObserver:class {constructor(fn){observer=fn;}observe(){observer([{isIntersecting:true}]);}} };
  vm.runInNewContext(source.slice(source.indexOf('(() => {')), context);
  function advance(ms) { const end = timer + ms; while(timer < end) { timer += 16; const ready = [...frames.values()]; frames.clear(); ready.forEach(fn=>fn(timer)); } }
  return {slides,stage,toggle,label,media,document,carousel,prev,next,advance,visibility:value=>observer([{isIntersecting:value}])};
}
const normal=setup();
assert.equal(normal.stage.dataset.activeProject,'weather');
normal.advance(13000); assert.equal(normal.stage.dataset.activeProject,'football','autoplay should reveal the next project');
normal.toggle.events.click(); normal.advance(32);
const frozen=normal.slides[2].style.transform; normal.advance(3000); assert.equal(normal.slides[2].style.transform,frozen,'pause must freeze the current presentation');
normal.next.events.click(); normal.advance(1500); assert.equal(normal.stage.dataset.activeProject,'pen','manual next should work while paused');
normal.next.events.click(); normal.next.events.click(); normal.advance(1800); assert.equal(normal.stage.dataset.activeProject,'parliament','rapid navigation should retarget without locking input');
normal.prev.events.click(); normal.advance(1500); assert.equal(normal.stage.dataset.activeProject,'papers');
normal.toggle.events.click(); normal.advance(2500);
normal.document.hidden=true; normal.document.events.visibilitychange(); normal.advance(32);
const hidden=normal.slides[4].style.transform; normal.advance(3000); assert.equal(normal.slides[4].style.transform,hidden,'background tabs must stop');
normal.document.hidden=false; normal.document.events.visibilitychange(); normal.advance(500);
normal.visibility(false); normal.advance(32); const offscreen=normal.slides[4].style.transform; normal.advance(3000); assert.equal(normal.slides[4].style.transform,offscreen,'offscreen carousel must stop');
const interaction=setup(); interaction.advance(1000);
interaction.carousel.events.pointerenter(); interaction.advance(32);
const hoverStill=interaction.slides[1].style.transform; interaction.advance(1500); assert.equal(interaction.slides[1].style.transform,hoverStill,'hover must pause');
interaction.carousel.events.pointerleave(); interaction.advance(1000); assert.notEqual(interaction.slides[1].style.transform,hoverStill,'leaving the carousel must resume');
interaction.carousel.events.focusin(); interaction.advance(32);
const focusStill=interaction.slides[1].style.transform; interaction.advance(1500); assert.equal(interaction.slides[1].style.transform,focusStill,'keyboard focus must pause');
interaction.carousel.events.focusout({relatedTarget:null}); interaction.advance(1000); assert.notEqual(interaction.slides[1].style.transform,focusStill,'leaving keyboard focus must resume');
const looping=setup(true); looping.prev.events.click(); assert.equal(looping.stage.dataset.activeProject,'rail'); looping.prev.events.click(); assert.equal(looping.stage.dataset.activeProject,'patent','previous should wrap across the first slide');
for(let i=0;i<8;i++) looping.next.events.click();
assert.equal(looping.stage.dataset.activeProject,'patent','next should cycle all eight projects');
const reduced=setup(true); reduced.advance(30000); assert.equal(reduced.stage.dataset.activeProject,'weather'); assert.equal(reduced.toggle.disabled,true);
reduced.next.events.click(); assert.equal(reduced.stage.dataset.activeProject,'football','reduced motion should still allow immediate manual navigation');
reduced.media.matches=false; reduced.media.events.change(); reduced.advance(13000); assert.equal(reduced.stage.dataset.activeProject,'pen','autoplay should respond to changed motion preferences');
console.log('Carousel checks passed: autoplay, pause, manual stepping, rapid retargeting, background/offscreen suspension, and reduced-motion preferences.');

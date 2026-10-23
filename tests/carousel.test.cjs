const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/main.js'), 'utf8');

function setup(reduce = false) {
  function element(dataset = {}) {
    const classes = new Set();
    return {
      dataset, style: {}, events: {}, attrs: {}, children: [], textContent: '',
      classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
      addEventListener(name, fn) { this.events[name] = fn; },
      setAttribute(name, value) { this.attrs[name] = value; },
      getAttribute(name) { return this.attrs[name]; },
      append(node) { this.children.push(node); },
      querySelectorAll() { return this.children; },
      cloneNode() { const copy=element({...this.dataset}); copy.attrs={...this.attrs}; copy.children=this.children.map(child=>child.cloneNode()); return copy; }
    };
  }
  const slides = ['rail','weather','football','pen','papers','parliament','pdf','patent'].map((project, i) => {
    const node=element({project}); node.attrs['aria-label']=`${i+1}: ${project}`; return node;
  });
  const base=element({carouselLayer:'base'}); base.children=slides;
  const stage=element(); stage.clientWidth=1040; stage.clientHeight=360;
  stage.querySelector=()=>base;
  stage.matches=()=>true;
  const captures=new Set();
  stage.setPointerCapture=id=>captures.add(id);
  stage.hasPointerCapture=id=>captures.has(id);
  stage.releasePointerCapture=id=>captures.delete(id);
  const announcement=element();
  const carousel=element(); carousel.querySelector=key=>key==='.project-stage'?stage:announcement;
  const document=element(); document.hidden=false; document.querySelector=()=>carousel;
  const media=element(); media.matches=reduce;
  let time=0,id=0,observer;
  const frames=new Map();
  const context={document,window:{matchMedia:()=>media},requestAnimationFrame(fn){frames.set(++id,fn);return id;},ResizeObserver:class{constructor(fn){this.fn=fn;}observe(){this.fn();}},IntersectionObserver:class{constructor(fn){observer=fn;}observe(){observer([{isIntersecting:true}]);}}};
  vm.runInNewContext(source.slice(source.indexOf('(() => {')),context);
  function advance(ms){const end=time+ms;while(time<end){time+=16;const ready=[...frames.values()];frames.clear();assert.ok(ready.length<=1,'only one animation loop should be scheduled');ready.forEach(fn=>fn(time));}}
  function emit(name,details={}){
    const event={isPrimary:true,pointerType:'mouse',button:0,pointerId:1,clientX:500,clientY:100,cancelable:true,timeStamp:time,deltaMode:0,deltaX:0,deltaY:0,shiftKey:false,ctrlKey:false,prevented:false,preventDefault(){this.prevented=true;},...details};
    stage.events[name](event);return event;
  }
  return {slides,base,blend:stage.children[0],stage,media,document,advance,emit,visibility:value=>observer([{isIntersecting:value}])};
}

const auto=setup();
auto.advance(8336);
assert.equal(auto.stage.dataset.activeProject,'football');
assert.match(auto.slides[2].style.transform,/\+ -?\d\.\d\dpx\)/,'a project should pass the centre in about 8.33 seconds');
const layers=setup(); layers.advance(3000);
const beforeOrder=layers.slides.map(slide=>slide.style.zIndex);
const beforeBlend=Number(layers.blend.style.opacity);
layers.advance(2000);
assert.deepEqual(layers.slides.map(slide=>slide.style.zIndex),beforeOrder,'foreground order must not pop at the half-step');
assert.ok(Number(layers.blend.style.opacity)>beforeBlend,'stacking changes must blend continuously');

const drag=setup();
drag.emit('pointerdown'); drag.advance(16);
const start=drag.slides[1].style.transform;
drag.advance(32); drag.emit('pointermove',{clientX:440});
assert.notEqual(drag.slides[1].style.transform,start,'pointer movement must render immediately');
drag.advance(32); drag.emit('pointermove',{clientX:300}); drag.emit('pointerup');
drag.advance(1500); assert.notEqual(drag.stage.dataset.activeProject,'weather','a flick must carry momentum');
drag.emit('pointerdown'); const grab=drag.slides[1].style.transform;
drag.emit('pointermove',{clientX:500});
assert.equal(drag.slides[1].style.transform,grab,'grabbing a moving carousel must not jump');
drag.emit('pointermove',{clientX:550}); drag.emit('pointerup'); drag.advance(1500);

const vertical=setup();
vertical.emit('pointerdown',{pointerType:'touch'});
const verticalStart=vertical.slides[1].style.transform;
vertical.emit('pointermove',{pointerType:'touch',clientX:502,clientY:140});
assert.equal(vertical.slides[1].style.transform,verticalStart,'vertical swipes must keep normal page scrolling');
const scroll=setup();
assert.equal(scroll.emit('wheel',{deltaY:100}).prevented,false,'vertical wheel input must not trap page scrolling');
assert.equal(scroll.emit('wheel',{ctrlKey:true,deltaX:100}).prevented,false,'pinch zoom must be preserved');
assert.equal(scroll.emit('wheel',{deltaX:200,deltaY:2}).prevented,true);
scroll.advance(32);scroll.emit('wheel',{deltaX:200,deltaY:2});scroll.advance(1800);
assert.notEqual(scroll.stage.dataset.activeProject,'weather','horizontal scrolling must browse projects and settle');
assert.equal(scroll.emit('wheel',{shiftKey:true,deltaY:80}).prevented,true,'Shift+wheel must also browse projects');
scroll.advance(1800);

const keyboard=setup(true); keyboard.advance(30000);
assert.equal(keyboard.stage.dataset.activeProject,'weather','reduced motion must disable autoplay');
keyboard.emit('keydown',{key:'ArrowLeft'}); assert.equal(keyboard.stage.dataset.activeProject,'rail');
keyboard.emit('keydown',{key:'ArrowLeft'}); assert.equal(keyboard.stage.dataset.activeProject,'patent','keyboard navigation must wrap');
for(let i=0;i<8;i++)keyboard.emit('keydown',{key:'ArrowRight'});
assert.equal(keyboard.stage.dataset.activeProject,'patent');
keyboard.media.matches=false; keyboard.media.events.change();keyboard.advance(9000);
assert.equal(keyboard.stage.dataset.activeProject,'rail','motion preference changes must take effect');
const pause=setup();pause.emit('keydown',{key:' '});pause.advance(32);
const still=pause.slides[1].style.transform;pause.advance(3000);assert.equal(pause.slides[1].style.transform,still,'Space must pause without a visible button');
pause.emit('keydown',{key:' '});pause.advance(1000);assert.notEqual(pause.slides[1].style.transform,still);
pause.emit('pointerenter');pause.advance(32);const hover=pause.slides[1].style.transform;pause.advance(1500);assert.equal(pause.slides[1].style.transform,hover);
pause.emit('pointerleave');pause.document.hidden=true;pause.document.events.visibilitychange();pause.advance(32);const hidden=pause.slides[1].style.transform;pause.advance(2000);assert.equal(pause.slides[1].style.transform,hidden);
pause.document.hidden=false;pause.document.events.visibilitychange();pause.advance(1000);pause.visibility(false);pause.advance(32);const offscreen=pause.slides[1].style.transform;pause.advance(2000);assert.equal(pause.slides[1].style.transform,offscreen);
console.log('Carousel checks passed: faster autoplay, blended stacking, direct dragging, momentum, interruption, wheel/page-scroll separation, keyboard access, reduced motion, and visibility suspension.');

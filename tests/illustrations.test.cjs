const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/illustrations.js', 'utf8');

async function run() {
  let preferenceChanged, intersectionChanged, visibilityChanged;
  let reads = 0;
  const surfaces = [{dataset:{}}, {dataset:{}}];
  const preference = {matches:true, addEventListener(_, callback) { preferenceChanged = callback; }};
  const document = {
    hidden:false,
    documentElement:{dataset:{}},
    querySelectorAll(selector) { reads++; return selector.startsWith('img') ? [] : surfaces; },
    addEventListener(_, callback) { visibilityChanged = callback; },
  };
  class IntersectionObserver {
    constructor(callback) { intersectionChanged = callback; }
    observe() {}
  }
  const window = {matchMedia:() => preference, IntersectionObserver};
  vm.runInNewContext(source, {window, document, IntersectionObserver});
  assert.equal(reads, 0, 'Reduced motion keeps original static images without fetching/inlining artwork');
  preference.matches = false;
  await preferenceChanged();
  intersectionChanged([{target:surfaces[0],isIntersecting:true}, {target:surfaces[1],isIntersecting:false}]);
  assert.equal(surfaces[0].dataset.artVisible, 'true');
  assert.equal(surfaces[1].dataset.artVisible, 'false');
  intersectionChanged([{target:surfaces[0],isIntersecting:false}]);
  assert.equal(surfaces[0].dataset.artVisible, 'false', 'Leaving the viewport suspends decorative motion');
  document.hidden = true;
  visibilityChanged();
  assert.equal(document.documentElement.dataset.artPaused, 'true');
  document.hidden = false;
  visibilityChanged();
  assert.equal(document.documentElement.dataset.artPaused, 'false');
  const before = reads;
  await preferenceChanged();
  assert.equal(reads, before, 'Preference changes do not initialize duplicate observers');
  console.log('Illustration checks passed: static reduced-motion startup, live preference changes, offscreen suspension, background suspension, and single initialization.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });

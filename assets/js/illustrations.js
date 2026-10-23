// Keep the original SVG images as a static fallback. Inline only our own local
// artwork so CSS can move individual shapes and pause them with their cards.
(() => {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let initialized = false;

  async function initialize() {
    if (initialized || motionPreference.matches) return;
    initialized = true;
    const images = [...document.querySelectorAll('img.project-illustration')];
    const sources = new Map();
    images.forEach(image => {
      const source = image.getAttribute('src');
      if (!sources.has(source)) sources.set(source, fetch(source).then(response => {
        if (!response.ok) throw new Error('Artwork unavailable');
        return response.text();
      }));
    });

    await Promise.all(images.map(async (image, index) => {
      try {
        const source = await sources.get(image.getAttribute('src'));
        const svg = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
        if (svg.localName !== 'svg') return;
        // Each carousel layer and project tile owns its gradient/filter IDs.
        const identifiers = new Map();
        svg.querySelectorAll('[id]').forEach(node => {
          const original = node.id;
          const unique = `art-${index}-${original}`;
          identifiers.set(original, unique);
          node.id = unique;
        });
        svg.querySelectorAll('*').forEach(node => {
          [...node.attributes].forEach(attribute => {
            const value = attribute.value.replace(/url\(#([^)]+)\)/g,
              (match, id) => identifiers.has(id) ? `url(#${identifiers.get(id)})` : match);
            if (value !== attribute.value) node.setAttribute(attribute.name, value);
          });
        });
        svg.setAttribute('class', `${image.className} animated-art`);
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        image.replaceWith(svg);
      } catch {
        // A failed enhancement leaves the original image intact.
      }
    }));

    const surfaces = document.querySelectorAll('.project-card, .project-carousel');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        entry.target.dataset.artVisible = String(entry.isIntersecting);
      }), { threshold: .08 });
      surfaces.forEach(surface => observer.observe(surface));
    } else {
      surfaces.forEach(surface => { surface.dataset.artVisible = 'true'; });
    }
    const syncVisibility = () => {
      document.documentElement.dataset.artPaused = String(document.hidden);
    };
    document.addEventListener('visibilitychange', syncVisibility);
    syncVisibility();
  }
  motionPreference.addEventListener('change', initialize);
  initialize();
})();

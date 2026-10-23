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

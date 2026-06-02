const toc = document.getElementById('toc');
const toggle = document.getElementById('toc-toggle');
if (toggle && toc) {
  toggle.addEventListener('click', () => {
    const open = toc.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  toc.addEventListener('click', event => {
    if (event.target.tagName === 'A') {
      toc.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}
const links = Array.from(document.querySelectorAll('.toc a'));
const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 });
sections.forEach(section => observer.observe(section));

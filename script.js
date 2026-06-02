const repo = 'TitanicParker/Who-can-say-no';
const docsApi = `https://api.github.com/repos/${repo}/contents/documents`;
const manuscript = document.getElementById('manuscript');
const tocLinks = document.getElementById('toc-links');
const toc = document.getElementById('toc');
const toggle = document.getElementById('toc-toggle');

const preferredOrder = [
  '00-introduction-compromise',
  'introduction-compromise',
  '01-core-architecture',
  'part-01-core-architecture',
  '02-diagnostic-method',
  'part-02-diagnostic-method',
  '03-structural-logic',
  '04-ordinary-life',
  '05-institutional-layer',
  '06-case-study-method',
  '07-case-study-covid',
  'case-study-covid',
  '08-case-study-gaza',
  'case-study-gaza',
  '09-case-study-911',
  'case-study-911',
  '10-final-moral-correction',
  'final-moral-correction',
  '11-final-addendum',
  'final-addendum',
  'manuscript-full'
];

const pullQuotes = new Set([
  'Power works by compromising the ability to say no.',
  'Do not begin with the headline. Begin with the consequences.',
  'The human layer is not a disclaimer. It is the evidence.',
  'Sovereignty is the ability to resist being metabolized by the machine.',
  'Modern power does not merely ignore human suffering. It metabolizes it.',
  'A real solution reduces dependency. A false solution manages dependency.'
]);

function slugify(value) {
  return value.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

function titleFromName(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[-_ ]*/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/Covid/g, 'COVID')
    .replace(/Gaza/g, 'Gaza')
    .replace(/911/g, '9/11');
}

function sortFiles(files) {
  return files.sort((a, b) => {
    const cleanA = a.name.replace(/\.[^.]+$/, '').toLowerCase();
    const cleanB = b.name.replace(/\.[^.]+$/, '').toLowerCase();
    const ia = preferredOrder.findIndex(key => cleanA.includes(key));
    const ib = preferredOrder.findIndex(key => cleanB.includes(key));
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });
}

function classifyParagraph(text) {
  const p = document.createElement('p');
  p.textContent = text;
  if (text.endsWith('?') || text.match(/^(Who|What|When|Where|Why|How|Does|Did|Can|Is|Are)\b/)) p.classList.add('question-line');
  if (text.match(/^[A-Z][A-Za-z -]+ means\b/) || text.match(/^[A-Z][A-Za-z -]+ is\b/)) p.classList.add('definition-line');
  return p;
}

function renderText(text, title, index) {
  const section = document.createElement('section');
  const id = slugify(title);
  section.className = 'chapter';
  section.id = id;

  const header = document.createElement('header');
  header.className = 'chapter-header';
  header.innerHTML = `<div class="chapter-kicker">Chapter ${String(index + 1).padStart(2, '0')}</div><h2>${title}</h2>`;

  const article = document.createElement('article');
  article.className = 'chapter-body';

  const chunks = text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map(chunk => chunk.trim())
    .filter(Boolean);

  chunks.forEach(chunk => {
    const normalized = chunk.replace(/\n+/g, ' ').trim();
    if (!normalized) return;
    if (pullQuotes.has(normalized)) {
      const quote = document.createElement('aside');
      quote.className = 'pullquote';
      quote.textContent = `“${normalized.replace(/^“|”$/g, '')}”`;
      article.appendChild(quote);
      return;
    }
    article.appendChild(classifyParagraph(normalized));
  });

  section.append(header, article);

  const link = document.createElement('a');
  link.href = `#${id}`;
  link.textContent = title;
  tocLinks.appendChild(link);

  return section;
}

async function fetchText(file) {
  const response = await fetch(file.download_url);
  if (!response.ok) throw new Error(`Could not fetch ${file.name}`);
  return response.text();
}

async function loadManuscript() {
  try {
    const response = await fetch(docsApi);
    if (!response.ok) throw new Error('Could not read documents folder');
    const listing = await response.json();
    const files = sortFiles(listing.filter(item => item.type === 'file' && /\.(txt|md|html?)$/i.test(item.name) && item.name.toLowerCase() !== 'readme.md'));

    manuscript.innerHTML = '';
    if (!files.length) {
      manuscript.innerHTML = `<div class="loading-card"><p class="label">DOCUMENTS</p><h2>No manuscript files found</h2><p>Upload plain-text or Markdown files into the <code>documents/</code> folder, then refresh this page.</p></div>`;
      return;
    }

    for (let i = 0; i < files.length; i += 1) {
      const text = await fetchText(files[i]);
      const title = titleFromName(files[i].name);
      manuscript.appendChild(renderText(text, title, i));
    }

    const closing = document.createElement('div');
    closing.className = 'footer-inscription';
    closing.textContent = 'The reader no longer needs to be told what to think. The reader has learned what to look for.';
    manuscript.appendChild(closing);
    setupScrollSpy();
  } catch (error) {
    manuscript.innerHTML = `<div class="loading-card"><p class="label">ERROR</p><h2>Could not load the manuscript</h2><p>${error.message}</p><p>Confirm that the repository is public and that manuscript files have been uploaded to <code>documents/</code>.</p></div>`;
  }
}

function setupScrollSpy() {
  const links = Array.from(document.querySelectorAll('.toc a'));
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(section => observer.observe(section));
}

if (toggle) {
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

loadManuscript();

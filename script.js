const repo = 'TitanicParker/Who-can-say-no';
const branch = 'main';
const baseRawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/documents`;
const manifestUrl = `${baseRawUrl}/manifest.json`;

const manuscript = document.getElementById('manuscript');
const tocLinks = document.getElementById('toc-links');
const toc = document.getElementById('toc');
const toggle = document.getElementById('toc-toggle');

const fallbackChapters = [
  { title: 'Introduction: Compromise', file: '00-introduction-compromise.md' },
  { title: 'Core Architecture', file: '01-core-architecture.md' },
  { title: 'Diagnostic Method', file: '02-diagnostic-method.md' },
  { title: 'Structural Logic', file: '03-structural-logic.md' },
  { title: 'Ordinary Life', file: '04-ordinary-life.md' },
  { title: 'Institutional Layer', file: '05-institutional-layer.md' },
  { title: 'Case Study Method', file: '06-case-study-method.md' },
  { title: 'Case Study: COVID', file: '07-case-study-covid.md' },
  { title: 'Case Study: Gaza', file: '08-case-study-gaza.md' },
  { title: 'Case Study: 9/11', file: '09-case-study-911.md' },
  { title: 'Final Moral Correction', file: '10-final-moral-correction.md' },
  { title: 'Final Addendum: The Problems That Never Get Solved', file: '11-final-addendum.md' }
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

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeMarkdown(text, title) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  while (lines.length && !lines[0].trim()) lines.shift();

  const first = lines[0] ? lines[0].trim() : '';
  const stripped = first.replace(/^#{1,6}\s+/, '').trim();
  if (stripped.toLowerCase() === title.toLowerCase()) lines.shift();

  return lines.join('\n')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .trim();
}

function classifyParagraph(text) {
  const p = document.createElement('p');
  p.textContent = text;

  if (text.endsWith('?') || text.match(/^(Who|What|When|Where|Why|How|Does|Did|Can|Is|Are)\b/)) {
    p.classList.add('question-line');
  }

  if (text.match(/^[A-Z][A-Za-z /-]+ means\b/) || text.match(/^[A-Z][A-Za-z /-]+ is\b/)) {
    p.classList.add('definition-line');
  }

  return p;
}

function renderText(text, title, index) {
  const section = document.createElement('section');
  const id = slugify(title);
  section.className = 'chapter';
  section.id = id;

  const header = document.createElement('header');
  header.className = 'chapter-header';
  header.innerHTML = `<div class="chapter-kicker">Chapter ${String(index + 1).padStart(2, '0')}</div><h2>${escapeHtml(title)}</h2>`;

  const article = document.createElement('article');
  article.className = 'chapter-body';

  const clean = normalizeMarkdown(text, title);
  const chunks = clean
    .split(/\n{2,}/)
    .map(chunk => chunk.replace(/\n+/g, ' ').trim())
    .filter(Boolean);

  chunks.forEach(chunk => {
    if (pullQuotes.has(chunk)) {
      const quote = document.createElement('aside');
      quote.className = 'pullquote';
      quote.textContent = `“${chunk}”`;
      article.appendChild(quote);
      return;
    }
    article.appendChild(classifyParagraph(chunk));
  });

  section.append(header, article);

  const link = document.createElement('a');
  link.href = `#${id}`;
  link.textContent = title;
  tocLinks.appendChild(link);

  return section;
}

async function loadManifest() {
  try {
    const response = await fetch(`${manifestUrl}?v=${Date.now()}`);
    if (!response.ok) throw new Error('Manifest not found');
    const manifest = await response.json();
    if (!manifest.chapters || !Array.isArray(manifest.chapters)) throw new Error('Manifest has no chapters array');
    return manifest.chapters;
  } catch (_) {
    return fallbackChapters;
  }
}

async function fetchChapter(file) {
  const response = await fetch(`${baseRawUrl}/${file}?v=${Date.now()}`);
  if (!response.ok) throw new Error(`Could not fetch ${file}`);
  return response.text();
}

async function loadManuscript() {
  try {
    manuscript.innerHTML = '';
    const chapters = await loadManifest();

    for (let i = 0; i < chapters.length; i += 1) {
      const chapter = chapters[i];
      const text = await fetchChapter(chapter.file);
      manuscript.appendChild(renderText(text, chapter.title, i));
    }

    const closing = document.createElement('div');
    closing.className = 'footer-inscription';
    closing.textContent = 'The reader no longer needs to be told what to think. The reader has learned what to look for.';
    manuscript.appendChild(closing);

    setupScrollSpy();
  } catch (error) {
    manuscript.innerHTML = `<div class="loading-card"><p class="label">ERROR</p><h2>Could not load the manuscript</h2><p>${escapeHtml(error.message)}</p><p>Confirm that the chapter files listed in <code>documents/manifest.json</code> exist in the <code>documents/</code> folder.</p></div>`;
  }
}

function setupScrollSpy() {
  const links = Array.from(document.querySelectorAll('.toc a'));
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
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

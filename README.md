# WHO CAN SAY NO?

*A Field Manual for Sovereignty, Compromise, and Institutional Power*

This repository contains the working materials and GitHub Pages edition for **WHO CAN SAY NO?**, a long-form political and philosophical manuscript about sovereignty, compromise, dependency, debt, institutional power, media, technology, war, crisis, and the human layer.

The web edition is designed as a restrained single-page HTML e-book: warm manuscript background, serious typography, fixed navigation, and a literary-systems presentation rather than a blog, academic PDF, or partisan landing page.

## Repository structure

```text
/
├── index.html
├── styles.css
├── script.js
├── README.md
└── documents/
    ├── README.md
    └── manuscript source files
```

## How it works

The root `index.html` is the public GitHub Pages entry point.

The page loads plain-text or Markdown files from the `documents/` folder and renders them as chapters in the browser. This keeps the manuscript source separate from the presentation layer.

Supported source file extensions:

```text
.txt
.md
.html
.htm
```

The loader ignores `documents/README.md`.

## Documents folder

The `documents/` folder is reserved for manuscript source files, chapter drafts, exported text, editorial notes, and other working materials.

Recommended naming convention:

```text
documents/
├── 00-introduction-compromise.md
├── 01-core-architecture.md
├── 02-diagnostic-method.md
├── 03-structural-logic.md
├── 04-ordinary-life.md
├── 05-institutional-layer.md
├── 06-case-study-method.md
├── 07-case-study-covid.md
├── 08-case-study-gaza.md
├── 09-case-study-911.md
├── 10-final-moral-correction.md
├── 11-final-addendum.md
└── manuscript-full.md
```

## View locally

Because the e-book loads files from the repository through GitHub's public contents API, the simplest local preview is to open the published GitHub Pages URL after enabling Pages.

For a local static-server preview:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Publish with GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings**.
3. Open **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch: `main`.
6. Select folder: `/root`.
7. Save.

GitHub will publish the site at the repository's GitHub Pages URL after the first Pages build completes.

## Editorial note

This project is a literary and systemic model. It is not a live news source, legal source, financial source, medical source, or academic reference database. Its purpose is to present a framework for reading dependency, compromise, institutional power, crisis, and sovereignty.

## License

License to be determined.

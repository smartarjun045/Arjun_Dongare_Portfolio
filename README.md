# Arjun Dongare — Portfolio

[Visit the live portfolio](https://arjun-dongare-portfolio.vercel.app/)

A lightweight, responsive portfolio showcasing full-stack web projects, data/AI explorations, practical training and credentials.

## Local development

Requires Node.js 22 or newer. No dependency installation is needed.

```sh
node scripts/serve.mjs
```

Open http://127.0.0.1:4173.

```sh
node --check script.js
node scripts/build.mjs
```

The production site is generated in `dist/`. Vercel configuration is included. The root HTML also works on static hosts such as GitHub Pages.

## What is included

- Mobile navigation and responsive layouts from 360px through desktop.
- A pointer-responsive 3D torus rendered with Canvas, capped at approximately 30 frames per second.
- Motion pause control, persisted preference, system reduced-motion support, offscreen and background-tab pausing.
- Nine projects, category filters, live website previews and expandable case studies.
- Full-stack and data-science resume links.
- Ten certificate links, including the original Simplilearn Full Stack Java PDF.
- Semantic sections, visible keyboard focus, skip link and print styling.
- Optimized WebP assets, lazy images, no external font requests or runtime dependencies.

## Editing content

- `index.html`: profile, project descriptions, external links, experience, resume and credential links.
- `style.css`: responsive visual design and print layout.
- `script.js`: navigation, filtering, clipboard and motion.
- `assets/`: optimized portrait, screenshots and certificates.

Update preview images if project designs change. Keep project capability claims and demo boundaries accurate. Job simulations are explicitly distinguished from employment.

## Content sources

The November 2026 full-stack resume and data-science resume from the supplied Google Drive folder; existing portfolio certificates; the supplied Simplilearn PDF; public project repositories; and the user's prior project chats and local project documentation. No hiring, performance or commercial-impact metrics are invented.

## Verification

Responsive browser checks at 360, 390, 430, 768, 1024 and 1440 pixels; project filters; mobile menu; expandable case studies; persisted motion preference; system reduced motion; image loading; and automated WCAG A/AA checks. Browser tests use the locally available Playwright and axe tooling; they are not required to run the website.

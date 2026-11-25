import { mkdir, copyFile, cp, readFile, writeFile } from 'node:fs/promises';

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,>~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function minifyJs(js) {
  return js
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('//'))
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}

await mkdir('dist', { recursive: true });
for (const file of ['favicon.svg', 'favicon.ico', 'favicon-48.png', 'favicon-192.png', 'favicon-512.png', 'apple-touch-icon.png', 'site.webmanifest', 'social-card.svg', 'robots.txt', 'sitemap.xml', 'llms.txt', 'llms-full.txt', 'BingSiteAuth.xml', 'google58cf6e7539366130.html']) {
  await copyFile(file, `dist/${file}`);
}

const rawJs = await readFile('script.js', 'utf8');
await writeFile('dist/script.js', minifyJs(rawJs), 'utf8');

const rawCss = await readFile('style.css', 'utf8');
const minCss = minifyCss(rawCss);
await writeFile('dist/style.css', minCss, 'utf8');

const rawHtml = await readFile('index.html', 'utf8');
const distHtml = rawHtml.replace('<link rel="stylesheet" href="style.css">', `<style>${minCss}</style>`);
await writeFile('dist/index.html', distHtml, 'utf8');

await cp('assets', 'dist/assets', { recursive: true });
for (const page of ['web-development', 'booking-website-development', 'data-science-and-analysis', 'projects']) {
  await cp(page, `dist/${page}`, { recursive: true });
}
console.log('Static production site built in dist/ (CSS inlined & JS minified)');

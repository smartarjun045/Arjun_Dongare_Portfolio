import { mkdir, copyFile, cp } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'style.css', 'script.js', 'favicon.svg', 'social-card.svg', 'robots.txt', 'sitemap.xml', 'google58cf6e7539366130.html']) await copyFile(file, `dist/${file}`);
await cp('assets', 'dist/assets', { recursive: true });
for (const page of ['web-development', 'booking-website-development', 'projects']) await cp(page, `dist/${page}`, { recursive: true });
console.log('Static production site built in dist/');
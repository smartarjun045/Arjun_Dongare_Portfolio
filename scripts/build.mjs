import { mkdir, copyFile, cp } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'style.css', 'script.js', 'favicon.svg', 'favicon.ico', 'favicon-48.png', 'favicon-192.png', 'favicon-512.png', 'apple-touch-icon.png', 'site.webmanifest', 'social-card.svg', 'robots.txt', 'sitemap.xml', 'llms.txt', 'llms-full.txt', 'BingSiteAuth.xml', 'google58cf6e7539366130.html']) await copyFile(file, `dist/${file}`);
await cp('assets', 'dist/assets', { recursive: true });
for (const page of ['web-development', 'booking-website-development', 'data-science-and-analysis', 'projects']) await cp(page, `dist/${page}`, { recursive: true });
console.log('Static production site built in dist/');
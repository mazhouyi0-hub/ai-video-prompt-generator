#!/usr/bin/env node
// Replace the https://example.com placeholder with the real site origin
// in canonical links, sitemap.xml and robots.txt.
// Usage: node tools/set-domain.mjs https://your-domain-or-vercel-url
// Idempotent: after a successful run no example.com remains to replace,
// and re-running with a different origin updates the previous origin too.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const origin = (process.argv[2] || '').replace(/\/+$/, '');
if (!/^https:\/\/[A-Za-z0-9.-]+(:\d+)?$/.test(origin)) {
  console.error('Usage: node tools/set-domain.mjs https://your-domain (https origin only, no path, no trailing slash)');
  process.exit(1);
}

const files = [
  'index.html',
  'veo-3-prompt-generator/index.html',
  'sora-2-prompt-generator/index.html',
  'sitemap.xml',
  'robots.txt',
];

// Matches the placeholder or any previously set https origin in the
// canonical/sitemap positions (these files contain no other https URLs
// in those positions — og tags carry no URL in this site).
let changed = 0;
for (const rel of files) {
  const path = join(root, rel);
  const before = readFileSync(path, 'utf8');
  const after = before.replace(/https:\/\/example\.com/g, origin);
  if (after !== before) {
    writeFileSync(path, after);
    changed++;
    console.log(`updated ${rel}`);
  }
}
const leftovers = files.filter((rel) =>
  readFileSync(join(root, rel), 'utf8').includes('example.com'),
);
if (leftovers.length) {
  console.error(`FAIL: example.com still present in ${leftovers.join(', ')}`);
  process.exit(1);
}
console.log(`done: origin set to ${origin} in ${changed} file(s); no example.com remains.`);
console.log('Next: git add/commit/push so Vercel redeploys, then submit https://<domain>/sitemap.xml in Google Search Console.');

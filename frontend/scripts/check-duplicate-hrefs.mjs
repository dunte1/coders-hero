import { readFileSync } from 'fs';

const content = readFileSync(new URL('../src/config/navigation.ts', import.meta.url), 'utf8');

const hrefs = [];
const regex = /label:\s*'([^']+)',\s*href:\s*'([^']+)'/g;
let match;
while ((match = regex.exec(content)) !== null) {
  hrefs.push({ label: match[1], href: match[2] });
}

const seen = {};
hrefs.forEach(({ label, href }) => {
  if (!seen[href]) seen[href] = [];
  seen[href].push(label);
});

console.log('=== DUPLICATE NAV HREFS ===');
let count = 0;
Object.entries(seen).forEach(([href, labels]) => {
  if (labels.length > 1) {
    count++;
    console.log('  ' + href);
    labels.forEach(l => console.log('    -> ' + l));
  }
});
if (count === 0) console.log('  (none)');
console.log('\nTotal duplicate hrefs: ' + count);

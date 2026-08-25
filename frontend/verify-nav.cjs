const fs = require('fs');
const navSrc = fs.readFileSync('src/config/navigation.ts', 'utf8');
const routesSrc = fs.readFileSync('src/router/routes.ts', 'utf8');

// --- collect route paths + roles ---
const routeEntries = [...routesSrc.matchAll(/path:\s*'([^']+)'/g)].map(m => m[1]);
const routeRoles = {};
const routeRe = /path:\s*'([^']+)'[\s\S]*?meta:\s*\{[^}]*\}/g;
[...routesSrc.matchAll(/path:\s*'([^']+)',\s*(?:element[^]+?)?meta:\s*\{([^}]*)\}/g)].forEach(m => {
  const r = m[2].match(/roles:\s*\[([^\]]*)\]/);
  if (r) routeRoles[m[1]] = r[1].match(/'([^']+)'/g)?.map(s => s.slice(1, -1)) ?? [];
});

// --- collect nav entries (children are single-line) ---
const lineRe = /\{\s*label:\s*'([^']+)',\s*href:\s*'([^']+)'\s*,?(.*?)\},?\s*$/;
let currentGroup = '(top)';
const navItems = [];
navSrc.split('\n').forEach(line => {
  const g = line.match(/^\s{2}\{\s*label:\s*'([^']+)',\s*icon/);
  if (g && !line.includes('href')) { currentGroup = g[1]; return; }
  const m = line.match(lineRe);
  if (!m) return;
  const [, label, href, rest] = m;
  const rolesM = rest.match(/roles:\s*\[([^\]]*)\]/);
  const roles = rolesM ? rolesM[1].match(/'([^']+)'/g)?.map(s => s.slice(1, -1)) : null;
  navItems.push({ group: currentGroup, label, href, roles });
});

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fails++; };

// 1. duplicate label+href within same group
const seenGroup = new Map();
navItems.forEach(i => {
  const k = i.group + '|' + i.label + '|' + i.href;
  if (seenGroup.has(k)) { ok(false, `duplicate within "${i.group}": ${i.label} -> ${i.href}`); }
  seenGroup.set(k, true);
});
ok(true, 'no duplicate label+href inside any single group');

// 2. same href under multiple groups (visible duplication)
const byHref = new Map();
navItems.forEach(i => {
  if (!byHref.has(i.href)) byHref.set(i.href, new Set());
  byHref.get(i.href).add(i.group);
});
byHref.forEach((groups, href) => {
  ok(groups.size === 1, `href ${href} appears only in [${[...groups].join(', ')}]`);
});

// 3. every nav href has a route
navItems.forEach(i => {
  const exists = routeEntries.includes(i.href);
  ok(exists, `route exists for ${i.href}`);
});

// 4. non-bypass roles: any role in group/child roles list must be allowed by route roles (if route restricted)
const BYPASS = ['admin', 'super_admin'];
navItems.forEach(i => {
  const restricted = routeRoles[i.href];
  if (!restricted) return;
  const effective = i.roles ?? null; // null = inherits group (unfiltered at child level)
  // conservative check: child-level explicit roles must all pass the route guard
  if (effective) {
    effective.filter(r => !BYPASS.includes(r)).forEach(r => {
      ok(restricted.includes(r), `${i.href}: nav role '${r}' also allowed by route`);
    });
  }
});

console.log('\n' + (fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'));
process.exit(fails === 0 ? 0 : 1);

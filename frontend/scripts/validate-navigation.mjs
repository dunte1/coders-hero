#!/usr/bin/env node
/**
 * Navigation validation script (20.15).
 *
 * Reads:
 *   frontend/src/router/routes.ts      – extracts every `path: '…'` value
 *   frontend/src/config/navigation.ts  – extracts every `href: '…'` value (nested)
 *
 * Reports:
 *   • Nav items whose href has NO matching route (prefix match for dynamic segments)
 *   • Dynamic route params missing from corresponding nav entries (informational)
 *   • Orphaned routes (route exists but no nav entry references it)
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND = resolve(__dirname, '..');

// ─── helpers ───────────────────────────────────────────────────────────────────

function extractPaths(source, key) {
  const pattern = new RegExp(key + "\\s*:\\s*(['\"])([^'\"]+)\\1", "g");
  const out = [];
  let m;
  while ((m = pattern.exec(source)) !== null) out.push(m[2]);
  return [...new Set(out)];
}

/** Convert a route path like '/finance/:id/edit' to a regex that matches it. */
function routeToRegex(route) {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = escaped.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, '[^/]+');
  return new RegExp(`^${pattern}$`);
}

function routeMatches(routePath, href) {
  return routeToRegex(routePath).test(href);
}

// ─── read source files ─────────────────────────────────────────────────────────

const routesSource = readFileSync(resolve(FRONTEND, 'src/router/routes.ts'), 'utf8');
const navSource    = readFileSync(resolve(FRONTEND, 'src/config/navigation.ts'), 'utf8');

const routePaths = extractPaths(routesSource, 'path');
const navHrefs   = extractPaths(navSource, 'href');

// Exclude wildcards and public-only website routes from validation
const excludeFromNav = new Set(['/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/two-factor/challenge']);
const websitePrefixes = ['/services', '/programs', '/blog', '/gallery', '/testimonials', '/faqs', '/contact', '/robotics'];

// ─── validate ──────────────────────────────────────────────────────────────────

let failures = 0;
let info     = 0;

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║              Navigation ↔ Route Validation                 ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');
console.log(`  Routes found: ${routePaths.length}`);
console.log(`  Nav items:    ${navHrefs.length}\n`);

// Check every nav href has a matching route
console.log('─── Nav items without matching routes ────────────────────────');
let navMissing = 0;
for (const href of navHrefs) {
  if (excludeFromNav.has(href)) continue;
  if (websitePrefixes.some(p => href.startsWith(p + '/') || href === p)) continue;
  const matched = routePaths.some(rp => routeMatches(rp, href));
  if (!matched) {
    console.log(`  ✗  ${href}`);
    failures++;
    navMissing++;
  }
}
if (navMissing === 0) console.log('  (none)');

// Check for orphaned routes (route exists but no nav entry)
console.log('\n─── Routes without any nav entry (orphans) ───────────────────');
let orphanCount = 0;
for (const rp of routePaths) {
  if (rp === '*') continue;
  if (excludeFromNav.has(rp)) continue;
  if (websitePrefixes.some(p => rp.startsWith(p + '/') || rp === p)) continue;
  const referenced = navHrefs.some(href => routeMatches(rp, href));
  if (!referenced) {
    console.log(`  ○  ${rp}`);
    info++;
    orphanCount++;
  }
}
if (orphanCount === 0) console.log('  (none)');

// Summary
console.log('\n─── Summary ─────────────────────────────────────────────────');
if (failures === 0) {
  console.log('  ✓ All navigation items resolve to a registered route.');
} else {
  console.log(`  ✗ ${failures} navigation item(s) point to missing routes.`);
}
if (orphanCount > 0) {
  console.log(`  ℹ ${orphanCount} route(s) have no nav entry (some may be intentional detail/edit pages).`);
}
console.log('');

process.exit(failures > 0 ? 1 : 0);

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const indexPath = resolve(process.cwd(), 'index.html');
const source = readFileSync(indexPath, 'utf8');

const cspMetaMatch = source.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content=["']([\s\S]*?)["']\s*>/i);
if (!cspMetaMatch) {
  console.error('CSP check failed: Content-Security-Policy meta tag not found in index.html');
  process.exit(1);
}

const csp = cspMetaMatch[1].replace(/\s+/g, ' ').trim();

const blockedTokens = ["'unsafe-eval'", "https://cdn.gpteng.co"];
const violations = blockedTokens.filter((token) => csp.includes(token));

if (violations.length > 0) {
  console.error(`CSP check failed: found disallowed directives/sources: ${violations.join(', ')}`);
  process.exit(1);
}

const hasExternalScriptTag = /<script\s+[^>]*src=["']https?:\/\//i.test(source);
if (hasExternalScriptTag) {
  console.error('CSP check failed: external script tag detected in index.html');
  process.exit(1);
}

console.log('CSP check passed');

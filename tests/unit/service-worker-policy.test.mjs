import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const swPath = resolve(process.cwd(), 'public/sw.js');
const swSource = readFileSync(swPath, 'utf8');

test('service worker uses v2 cache namespace', () => {
  assert.match(swSource, /career-vision-v2/);
});

test('service worker cleans up old caches on activate', () => {
  assert.match(swSource, /addEventListener\('activate'/);
  assert.match(swSource, /caches\.delete\(name\)/);
});

test('service worker has navigation network-first fallback', () => {
  assert.match(swSource, /request\.mode === 'navigate'/);
  assert.match(swSource, /caches\.match\(APP_SHELL\)/);
});

test('service worker bypasses API and auth requests', () => {
  assert.match(swSource, /pathname\.startsWith\('\/api\/'\)/);
  assert.match(swSource, /pathname\.startsWith\('\/auth\/'\)/);
});

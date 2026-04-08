import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const assetsDir = resolve(process.cwd(), 'dist/assets');

const files = readdirSync(assetsDir)
  .filter((name) => name.endsWith('.js'))
  .map((name) => ({
    name,
    sizeKB: statSync(resolve(assetsDir, name)).size / 1024,
  }));

const failReasons = [];

const maxMainChunkKB = 220;
const maxAnyChunkKB = 520;

const mainChunk = files.find((f) => /^index-.*\.js$/.test(f.name));
if (!mainChunk) {
  failReasons.push('Missing main index chunk in dist/assets');
} else if (mainChunk.sizeKB > maxMainChunkKB) {
  failReasons.push(
    `Main chunk budget exceeded: ${mainChunk.name} ${mainChunk.sizeKB.toFixed(2)}KB > ${maxMainChunkKB}KB`
  );
}

const oversized = files.filter((f) => f.sizeKB > maxAnyChunkKB);
if (oversized.length > 0) {
  for (const chunk of oversized) {
    failReasons.push(
      `Chunk budget exceeded: ${chunk.name} ${chunk.sizeKB.toFixed(2)}KB > ${maxAnyChunkKB}KB`
    );
  }
}

if (failReasons.length > 0) {
  console.error('Bundle budget check failed:');
  for (const reason of failReasons) {
    console.error(`- ${reason}`);
  }
  process.exit(1);
}

console.log('Bundle budget check passed');
if (mainChunk) {
  console.log(`Main chunk: ${mainChunk.name} ${mainChunk.sizeKB.toFixed(2)}KB`);
}

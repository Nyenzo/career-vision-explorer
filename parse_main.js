const fs = require('fs');
const content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const lines = content.split('\n');
const mainContent = lines.slice(1427, 2166).join('\n');

const { parse } = require('@babel/parser');
try {
  parse('<>' + mainContent + '</>', {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log("No syntax errors in main content.");
} catch (e) {
  console.error("Syntax Error line", e.loc.line, "col", e.loc.column, ":", e.message);
}

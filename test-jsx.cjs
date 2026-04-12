const fs = require('fs');
const content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// Use babel parser
const { parse } = require('@babel/parser');
try {
  parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log("No syntax errors found by Babel.");
} catch (e) {
  console.error("Syntax Error line", e.loc.line, "col", e.loc.column, ":", e.message);
}

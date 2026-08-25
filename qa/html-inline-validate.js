const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const FILES = [
  'admin.html',
  'auth-admin.html',
  'final.html',
  'index.html',
  'last-answer.html',
  'last1-analysis.html',
  'last1-entry.html',
  'last1-result.html',
];

for (const file of FILES) {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const scriptPattern = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let count = 0;
  let match;
  while ((match = scriptPattern.exec(source))) {
    count += 1;
    new vm.Script(match[1], { filename: `${file}#inline-${count}` });
  }
  console.log(`PASS inline ${file} ${count}`);
}

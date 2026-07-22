const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\akcod\\Desktop\\dsa-web\\server\\seeds\\seedPhaseContent.js', 'utf8');

const startMarker = 'const dsaProblems = [';
const start = content.indexOf(startMarker);
let arrayStart = start + startMarker.length;

// Let's find ALL positions where ] closing would make depth 0
let positions = [];
let depth = 0;
for (let i = arrayStart; i < content.length; i++) {
    if (content[i] === '{' || content[i] === '[') depth++;
    else if (content[i] === '}' || content[i] === ']') {
      if (depth === 0) {
        console.log('Found depth=0 at position ' + i + ', context: ' + content.substring(Math.max(0,i-50), i+50).replace(/\\n/g, ' '));
        positions.push(i);
        if (positions.length >= 3) break;
      }
      depth--;
    }
}
console.log('\\nArray start position: ' + arrayStart);
console.log('Start context: ' + content.substring(arrayStart, arrayStart+100).replace(/\\n/g, ' '));

// Also print first few depth changes
depth = 0;
let changes = [];
for (let i = arrayStart; i < arrayStart + 500; i++) {
    if (content[i] === '{' || content[i] === '[') { depth++; changes.push({pos: i, char: content[i], depth: depth, ctx: content.substring(i, i+30).replace(/\\n/g,' ')}); }
    else if (content[i] === '}' || content[i] === ']') {
      depth--;
      changes.push({pos: i, char: content[i], depth: depth, ctx: content.substring(i, i+30).replace(/\\n/g,' ')});
    }
}
console.log('\\nFirst depth changes:');
changes.slice(0, 30).forEach(c => console.log('  pos ' + c.pos + ': ' + c.char + ' -> depth=' + c.depth + ' | ' + c.ctx));

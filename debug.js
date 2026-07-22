const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\akcod\\Desktop\\dsa-web\\server\\seeds\\seedPhaseContent.js', 'utf8');

const startMarker = 'const dsaProblems = [';
const start = content.indexOf(startMarker);
let depth = 0;
let arrayStart = start + startMarker.length;
let arrayEnd = -1;
for (let i = arrayStart; i < content.length; i++) {
    if (content[i] === '{' || content[i] === '[') depth++;
    else if (content[i] === '}' || content[i] === ']') {
      if (depth === 0) { arrayEnd = i; break; }
      depth--;
    }
}

console.log('Array text length:', arrayEnd - arrayStart);
const arrayText = content.substring(arrayStart, arrayEnd);
let openBraces = 0;
let closeBraces = 0;
for (const ch of arrayText) {
  if (ch === '{') openBraces++;
  if (ch === '}') closeBraces++;
}
console.log('Open braces:', openBraces, 'Close braces:', closeBraces);
console.log('Balanced?:', openBraces === closeBraces);

const slugMatches = arrayText.match(/slug:\\s*['"]([^'"]+)['"]/g);
console.log('All slug matches:', slugMatches ? slugMatches.length : 0);

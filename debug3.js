const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\akcod\\Desktop\\dsa-web\\server\\seeds\\seedPhaseContent.js', 'utf8');

// Extract full dsaProblems array
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
const arrayText = content.substring(arrayStart, arrayEnd);

// Extract individual objects
const objects = [];
let i = 0;
while (i < arrayText.length) {
    while (i < arrayText.length && (arrayText[i] === ' ' || arrayText[i] === '\n' || arrayText[i] === '\r' || arrayText[i] === '\t' || arrayText[i] === ',')) i++;
    if (i >= arrayText.length) break;
    
    if (arrayText[i] === '{') {
      let objDepth = 0;
      let objStart = i;
      for (; i < arrayText.length; i++) {
        if (arrayText[i] === '{') objDepth++;
        else if (arrayText[i] === '}') {
          objDepth--;
          if (objDepth === 0) { i++; break; }
        }
      }
      const objStr = arrayText.substring(objStart, i);
      const slugMatch = objStr.match(/slug:\s*['"]([^'"]+)['"]/);
      const slug = slugMatch ? slugMatch[1] : 'NO_SLUG_FOUND';
      console.log('Object ' + objects.length + ': slug=' + slug + ', length=' + objStr.length + ', first 100 chars: ' + objStr.substring(0,100).replace(/\\n/g, ' '));
      objects.push({slug, objStr});
    } else {
      i++;
    }
}

console.log('\\nTotal objects found: ' + objects.length);

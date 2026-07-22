const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\akcod\\Desktop\\dsa-web\\server\\seeds\\seedPhaseContent.js', 'utf8');

const startMarker = 'const dsaProblems = [';
const start = content.indexOf(startMarker);
let arrayStart = start + startMarker.length;

// Find position of valid-parentheses object
const vpMarker = "slug: 'valid-parentheses'";
const vpPos = content.indexOf(vpMarker, arrayStart);
console.log('valid-parentheses slug position:', vpPos);

// Let's carefully track depth around the valid-parentheses object
// First find the { that starts the valid-parentheses object
let depth = 0;
let vpOpenBrace = -1;
for (let i = vpPos - 200; i < vpPos; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') depth--;
}
// Reset depth around vp
depth = 0;
for (let i = vpPos - 200; i < vpPos + 2500; i++) {
    if (content[i] === '{' || content[i] === '[') depth++;
    else if (content[i] === '}' || content[i] === ']') {
        depth--;
        if (depth === -1) {
            console.log('DEPTH WENT NEGATIVE at position', i);
            console.log('Context:', content.substring(Math.max(0,i-80), i+80).replace(/\\n/g, ' '));
            break;
        }
    }
    if (i === vpPos) console.log('At vpPos, depth =', depth);
}
console.log('Final depth:', depth);

// Better yet, let's find the exact position where the first problem (missing-number) ends and 
// track from there to see where depth tracking diverges

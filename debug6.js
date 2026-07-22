const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\akcod\\Desktop\\dsa-web\\server\\seeds\\seedPhaseContent.js', 'utf8');

const startMarker = 'const dsaProblems = [';
const start = content.indexOf(startMarker);
let arrayStart = start + startMarker.length;

// Track ALL depth changes and find the first time depth goes to -1
let depth = 0;
let problematicChanges = [];
for (let i = arrayStart; i < arrayStart + 7000; i++) {
    if (content[i] === '{' || content[i] === '[') {
        depth++;
    } else if (content[i] === '}' || content[i] === ']') {
        depth--;
        if (depth === -1) {
            console.log('DEPTH NEGATIVE at pos', i, 'char:', content[i]);
            console.log('Context:', content.substring(Math.max(0,i-100), i+100).replace(/\\n/g, ' '));
            console.log('Depth before decrement was 0');
            problematicChanges.push(i);
            break;
        }
    }
}
if (problematicChanges.length === 0) {
    console.log('No negative depth in first 7000 chars');
}

// Also print all depth transitions where depth goes to 0 or negative
depth = 0;
let transitions = [];
for (let i = arrayStart; i < arrayStart + 7000; i++) {
    if (content[i] === '{' || content[i] === '[') {
        depth++;
    } else if (content[i] === '}' || content[i] === ']') {
        depth--;
        if (depth <= 0) {
            transitions.push({pos: i, char: content[i], depth: depth, ctx: content.substring(i-10, i+40).replace(/\\n/g,' ')});
        }
    }
}
console.log('\\nAll depth<=0 transitions:');
transitions.forEach(t => console.log('  pos=' + t.pos + ' char=' + t.char + ' depth=' + t.depth + ' ctx="' + t.ctx + '"'));

const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\akcod\\Desktop\\dsa-web\\server\\seeds\\seedPhaseContent.js', 'utf8');

const startMarker = 'const dsaProblems = [';
const start = content.indexOf(startMarker);
let arrayStart = start + startMarker.length;

// Use a more robust method: find all positions of { and } and analyze
let positions = [];
for (let i = arrayStart; i < content.length; i++) {
  if (content[i] === '{' || content[i] === '}') {
    positions.push({pos: i, char: content[i], context: content.substring(Math.max(0,i-30), i+30).replace(/\\n/g, '\\\\n')});
  }
  if (content[i] === ']' && positions.length > 0) {
    // Check if all braces are balanced up to this point
    let open = 0, close = 0;
    for (const p of positions) {
      if (p.char === '{') open++;
      else close++;
    }
    if (open === close) {
      console.log('Found balanced ] at position', i);
      console.log('Context:', content.substring(Math.max(0,i-10), i+10).replace(/\\n/g, '\\\\n'));
      break;
    }
  }
}

console.log('\\nTotal brace events:', positions.length);
let open = 0, close = 0;
for (const p of positions) {
  if (p.char === '{') open++;
  else close++;
}
console.log('Open:', open, 'Close:', close);

// Find the first ] where balance is wrong
let running = 0;
for (const p of positions) {
  if (p.char === '{') running++;
  else {
    running--;
    if (running < 0) {
      console.log('\\nExtra } at position', p.pos);
      console.log('Context:', p.context);
    }
  }
}
if (running > 0) {
  console.log('\\nUnmatched { at end, count:', running);
  // Find the last { that's causing the issue
  let track = 0;
  let lastOpenIdx = -1;
  for (let idx = 0; idx < positions.length; idx++) {
    if (positions[idx].char === '{') track++;
    else track--;
    if (track > 0) lastOpenIdx = idx;
  }
  // The last open brace might be the problem
  console.log('Last open position:', positions[lastOpenIdx].pos);
  console.log('Context around last open:', positions[lastOpenIdx].context);
}

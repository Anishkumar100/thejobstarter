const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\akcod\\Desktop\\dsa-web\\server\\seeds\\seedPhaseContent.js', 'utf8');

const startMarker = 'const dsaProblems = [';
const start = content.indexOf(startMarker);
let arrayStart = start + startMarker.length;

let depth = 0;
let arrayEnd = -1;
for (let i = arrayStart; i < content.length; i++) {
    if (content[i] === "{" || content[i] === "[") depth++;
    else if (content[i] === "}" || content[i] === "]") {
        if (depth === 0) { arrayEnd = i; break; }
        depth--;
    }
}

console.log("arrayStart:", arrayStart);
console.log("arrayEnd:", arrayEnd);
console.log("arrayText length:", arrayEnd - arrayStart);

const arrayText = content.substring(arrayStart, arrayEnd);

const slugRegex = /slug: '([^']+)'/g;
let matches = [];
let m;
while ((m = slugRegex.exec(arrayText)) !== null) {
    matches.push(m[1]);
}
console.log("All slug values found:");
matches.forEach(function(s, i) { console.log("  " + i + ": " + s); });

console.log("\nLast 200 chars of arrayText:");
console.log(arrayText.substring(arrayText.length - 200).replace(/\n/g, " "));

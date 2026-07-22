const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\akcod\\Desktop\\dsa-web\\server\\seeds\\seedPhaseContent.js', 'utf8');

function extractObjectEntries(text, varName) {
  const startMarker = 'const ' + varName + ' = [';
  const start = text.indexOf(startMarker);
  if (start === -1) { console.log('NOT FOUND:', varName); return []; }
  
  // Find the matching closing bracket for the array
  let depth = 0;
  let arrayStart = start + startMarker.length;
  let arrayEnd = -1;
  for (let i = arrayStart; i < text.length; i++) {
    if (text[i] === '{' || text[i] === '[') depth++;
    else if (text[i] === '}' || text[i] === ']') {
      if (depth === 0) { arrayEnd = i; break; }
      depth--;
    }
  }
  
  const arrayText = text.substring(arrayStart, arrayEnd);
  
  // Now extract individual objects by tracking brace depth
  const objects = [];
  let i = 0;
  while (i < arrayText.length) {
    // Skip whitespace/comma
    while (i < arrayText.length && (arrayText[i] === ' ' || arrayText[i] === '\n' || arrayText[i] === '\r' || arrayText[i] === '\t' || arrayText[i] === ',')) i++;
    if (i >= arrayText.length) break;
    
    if (arrayText[i] === '{') {
      // Extract this object
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
      objects.push(objStr);
    } else {
      i++;
    }
  }
  
  return objects;
}

function extractSlugsFromObjects(objects, key) {
  const slugs = [];
  for (const obj of objects) {
    const regex = new RegExp(key + ':\\s*[\'"]([^\'"]+)[\'"]');
    const match = obj.match(regex);
    if (match) slugs.push(match[1]);
  }
  return slugs;
}

// Extract subtopic objects
const dsaSubObjs = extractObjectEntries(content, 'dsaSubtopics');
const dbmsSubObjs = extractObjectEntries(content, 'dbmsSubtopics');
const osSubObjs = extractObjectEntries(content, 'osSubtopics');
const progSubObjs = extractObjectEntries(content, 'programmingSubtopics');

const dsaSubSlugs = extractSlugsFromObjects(dsaSubObjs, 'slug');
const dbmsSubSlugs = extractSlugsFromObjects(dbmsSubObjs, 'slug');
const osSubSlugs = extractSlugsFromObjects(osSubObjs, 'slug');
const progSubSlugs = extractSlugsFromObjects(progSubObjs, 'slug');

console.log('=== DSA SUBTOPIC SLUGS (' + dsaSubSlugs.length + ' total) ===');
console.log(JSON.stringify(dsaSubSlugs));
console.log('\n=== DBMS SUBTOPIC SLUGS (' + dbmsSubSlugs.length + ' total) ===');
console.log(JSON.stringify(dbmsSubSlugs));
console.log('\n=== OS SUBTOPIC SLUGS (' + osSubSlugs.length + ' total) ===');
console.log(JSON.stringify(osSubSlugs));
console.log('\n=== PROGRAMMING SUBTOPIC SLUGS (' + progSubSlugs.length + ' total) ===');
console.log(JSON.stringify(progSubSlugs));

// Extract problem objects
const dsaProbObjs = extractObjectEntries(content, 'dsaProblems');
const dbmsProbObjs = extractObjectEntries(content, 'dbmsProblems');
const osProbObjs = extractObjectEntries(content, 'osProblems');
const progProbObjs = extractObjectEntries(content, 'programmingProblems');

console.log('\n\n========== CROSS-REFERENCE VALIDATION ==========\n');

function checkAndPrint(probObjs, subSlugs, subject) {
  console.log('--- ' + subject + ' PROBLEMS (' + probObjs.length + ' total) ---');
  let allOk = true;
  for (const obj of probObjs) {
    const slugMatch = obj.match(/slug:\s*['"]([^'"]+)['"]/);
    const subSlugMatch = obj.match(/subtopicSlug:\s*['"]([^'"]+)['"]/);
    if (slugMatch && subSlugMatch) {
      const slug = slugMatch[1];
      const subSlug = subSlugMatch[1];
      const found = subSlugs.includes(subSlug);
      const status = found ? 'YES' : 'NO';
      if (!found) allOk = false;
      console.log('  ' + slug + '\n    subtopicSlug: "' + subSlug + '"  |  EXISTS in ' + subject + ' subtopics: ' + status);
    }
  }
  if (allOk) console.log('  [ALL ' + probObjs.length + ' MATCH]');
  else console.log('  [MISMATCHES FOUND]');
  console.log();
  return allOk;
}

let allGood = true;
allGood &= checkAndPrint(dsaProbObjs, dsaSubSlugs, 'DSA');
allGood &= checkAndPrint(dbmsProbObjs, dbmsSubSlugs, 'DBMS');
allGood &= checkAndPrint(osProbObjs, osSubSlugs, 'OS');
allGood &= checkAndPrint(progProbObjs, progSubSlugs, 'PROGRAMMING');

console.log('========== FINAL VERDICT ==========');
if (allGood) {
  const total = dsaProbObjs.length + dbmsProbObjs.length + osProbObjs.length + progProbObjs.length;
  console.log('ALL ' + total + ' PROBLEMS VALID - every subtopicSlug references an existing subtopic in its own subject category.');
} else {
  console.log('MISMATCHES DETECTED - see details above.');
}

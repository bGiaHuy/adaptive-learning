const AdmZip = require('adm-zip');
const fs = require('fs');

const zip = new AdmZip('C:/Users/Administrator/Downloads/Documents/GỦI.docx');

// 1. Media
const media = zip.getEntries().filter(e => e.entryName.startsWith('word/media/'));
console.log('=== MEDIA ENTRIES (15 TOTAL) ===');
media.forEach((e, i) => {
  console.log(`${i + 1}. ${e.entryName} (${e.header.size} bytes)`);
});

// Relationships
const relsXml = zip.readAsText('word/_rels/document.xml.rels');
const rels = {};
const relMatches = relsXml.match(/<Relationship[^>]+>/g) || [];
relMatches.forEach(r => {
  const idM = r.match(/Id="([^"]+)"/);
  const targetM = r.match(/Target="([^"]+)"/);
  if (idM && targetM) {
    rels[idM[1]] = targetM[1];
  }
});
console.log('\nTotal relationships mapped:', Object.keys(rels).length);

// 2. Document XML
const docXml = zip.readAsText('word/document.xml');

// Find all paragraphs
const paras = docXml.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
console.log('\nTotal paragraphs in document.xml:', paras.length);

// Also find tables
const tbls = docXml.match(/<w:tbl[\s\S]*?<\/w:tbl>/g) || [];
console.log('Total tables in document.xml:', tbls.length);

const allExercises = [];
let currentEx = null;

paras.forEach((p, idx) => {
  const text = (p.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || []).map(t => t.replace(/<[^>]+>/g, '')).join('').trim();
  const m = text.match(/(Exercise|Ex|Bài tập)\s*(\d+)[:.]?\s*(.*)/i);
  
  // Find images in this paragraph
  const imgMatches = p.match(/r:embed="([^"]+)"/g) || [];
  const imgTargets = imgMatches.map(m => {
    const rId = m.match(/r:embed="([^"]+)"/)[1];
    return rels[rId] || rId;
  });

  if (m) {
    if (currentEx) allExercises.push(currentEx);
    currentEx = {
      number: parseInt(m[2], 10),
      rawTitle: text,
      cleanInstruction: m[3] || '',
      startParagraph: idx,
      questions: [],
      images: [...imgTargets]
    };
  } else if (currentEx) {
    if (imgTargets.length > 0) {
      currentEx.images.push(...imgTargets);
    }
    // Check if this paragraph is a question or line
    if (text.match(/^\d+[.)]\s*/) || text.match(/^[a-d][.)]\s*/i)) {
      currentEx.questions.push({ pIdx: idx, text: text.slice(0, 80) });
    }
  }
});
if (currentEx) allExercises.push(currentEx);

console.log('\n=== ALL EXERCISES DETECTED IN DOCUMENT PARAGRAPHS ===');
allExercises.forEach(ex => {
  console.log(`Ex ${ex.number}: "${ex.rawTitle.slice(0, 70)}"`);
  console.log(`   -> P#${ex.startParagraph}, Questions count: ${ex.questions.length}, Images: [${ex.images.join(', ')}]`);
});

// Check where each media file is used in document.xml
console.log('\n=== IMAGE USAGE IN DOCUMENT XML ===');
Object.keys(rels).forEach(rId => {
  const target = rels[rId];
  if (target.startsWith('media/')) {
    const countInXml = (docXml.match(new RegExp(`"${rId}"`, 'g')) || []).length;
    console.log(`Relationship ${rId} -> ${target}: referenced ${countInXml} times`);
  }
});

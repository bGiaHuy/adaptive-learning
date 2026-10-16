const AdmZip = require('adm-zip');
const fs = require('fs');

const zip = new AdmZip('C:/Users/Administrator/Downloads/Documents/GỦI.docx');
const docXml = zip.readAsText('word/document.xml');

// Parse paragraphs and tables
const paras = docXml.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
console.log('Analyzing exercises for extraction...');

function getCleanText(xml) {
  return (xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || []).map(t => t.replace(/<[^>]+>/g, '')).join('').trim();
}

let inEx = null;
const extractedEx = {};

paras.forEach((p, idx) => {
  const t = getCleanText(p);
  const m = t.match(/(Exercise|Ex|Bài tập)\s*(\d+)[:.]?\s*(.*)/i);
  if (m) {
    inEx = parseInt(m[2], 10);
    extractedEx[inEx] = { title: t, pIdx: idx, lines: [] };
  } else if (inEx) {
    if (t.length > 0) {
      extractedEx[inEx].lines.push({ pIdx: idx, text: t });
    }
  }
});

console.log('Extracted exercise count:', Object.keys(extractedEx).length);
[3, 4, 5, 8, 9, 10, 11, 13, 14, 18, 20, 22, 25].forEach(num => {
  if (extractedEx[num]) {
    console.log(`\nEx ${num} (${extractedEx[num].title}): ${extractedEx[num].lines.length} lines`);
    extractedEx[num].lines.slice(0, 4).forEach(l => console.log(`   P#${l.pIdx}: ${l.text.slice(0, 70)}`));
  }
});

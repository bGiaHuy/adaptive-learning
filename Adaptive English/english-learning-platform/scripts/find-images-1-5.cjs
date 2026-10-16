const AdmZip = require('adm-zip');
const zip = new AdmZip('C:/Users/Administrator/Downloads/Documents/GỦI.docx');
const docXml = zip.readAsText('word/document.xml');

['rId8', 'rId9', 'rId10', 'rId11', 'rId12'].forEach(rId => {
  const target = `"${rId}"`;
  const idx = docXml.indexOf(target);
  const snippet = docXml.slice(Math.max(0, idx - 200), Math.min(docXml.length, idx + 200)).replace(/<[^>]+>/g, ' ');
  console.log(`=== ${rId} ===`);
  console.log(snippet.trim());
});

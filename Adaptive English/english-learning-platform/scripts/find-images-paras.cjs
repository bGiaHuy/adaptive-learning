const AdmZip = require('adm-zip');
const zip = new AdmZip('C:/Users/Administrator/Downloads/Documents/GỦI.docx');
const docXml = zip.readAsText('word/document.xml');

const paras = docXml.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
paras.forEach((p, idx) => {
  ['rId8', 'rId9', 'rId10', 'rId11', 'rId12'].forEach(rId => {
    if (p.includes(`"${rId}"`)) {
      const text = p.replace(/<[^>]+>/g, ' ').trim();
      console.log(`Paragraph P#${idx} contains ${rId}: "${text}"`);
    }
  });
});

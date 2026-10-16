import AdmZip from 'adm-zip';
import { PDFParse } from './pdfRuntime';
import { IMPORT_EXTENSIONS } from './documentImport';
export async function readTeacherSource(file: File): Promise<string> {
 if (!IMPORT_EXTENSIONS.includes(file.name.split('.').pop()?.toLowerCase() || '') || !file.size || file.size > 4*1024*1024) throw new Error('Chọn tài liệu DOCX/PDF/MD/HTML/TXT, tối đa 4 MB.');
 const bytes = Buffer.from(await file.arrayBuffer());
 const ext = file.name.split('.').pop()?.toLowerCase(); let text = '';
 if (ext === 'docx') { const zip = new AdmZip(bytes); if (zip.getEntries().reduce((n,e)=>n+e.header.size,0)>20*1024*1024) throw new Error('DOCX quá lớn sau giải nén.'); text = zip.readAsText('word/document.xml').replace(/<\/w:p>/g,'\n').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'); }
 else if (ext === 'pdf') { const parser = new PDFParse({data:new Uint8Array(bytes),isEvalSupported:false}); try {const info=await parser.getInfo(); if(info.total>100) throw new Error('PDF tối đa 100 trang.'); text=(await parser.getText()).text;} finally {await parser.destroy();} }
 else { text = new TextDecoder('utf-8',{fatal:true}).decode(bytes); if(ext==='html'||ext==='htm') { const {convert}=require('html-to-text'); text=convert(text,{wordwrap:false,selectors:[{selector:'script',format:'skip'},{selector:'style',format:'skip'},{selector:'img',format:'skip'}]}); } }
 if(!text.trim()||text.includes('\0')) throw new Error('Không đọc được văn bản; PDF scan cần OCR.');
 if(text.length>120000) throw new Error('Tài liệu quá dài, hãy chia nhỏ.'); return text.slice(0,22000);
}


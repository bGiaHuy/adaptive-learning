import AdmZip from 'adm-zip';
import { PDFParse } from './pdfRuntime';
import { parseBinaryDocx } from './docxParser';

export const IMPORT_EXTENSIONS = ['docx', 'pdf', 'md', 'markdown', 'html', 'htm', 'txt'];
export async function parseImportDocument(buffer: Buffer, filename: string, mode: 'preserve_authored' | 'generate_from_content', teacherInstruction = '') {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (!IMPORT_EXTENSIONS.includes(ext) || !buffer.length || buffer.length > 4 * 1024 * 1024) throw Object.assign(new Error('Chọn DOCX, PDF, MD, HTML hoặc TXT không rỗng, tối đa 4 MB.'), { status: 400 });
  if (ext === 'docx') return parseBinaryDocx(buffer, filename, mode, teacherInstruction);
  let text: string;
  if (ext === 'pdf') {
    if (buffer.toString('ascii', 0, 5) !== '%PDF-') throw Object.assign(new Error('Tệp PDF không đúng định dạng.'), { status: 400 });
    const parser = new PDFParse({ data: new Uint8Array(buffer), isEvalSupported: false });
    try {
      const info = await parser.getInfo();
      if (info.total > 100) throw new Error('PDF tối đa 100 trang. Hãy chia tài liệu thành các phần nhỏ hơn.');
      const result = await parser.getText({ pageJoiner: '' });
      text = result.pages.map(page => page.text).join('\n\n');
    } catch (error: any) { throw Object.assign(new Error(`Không đọc được PDF: ${error.message}`), { status: 400 }); }
    finally { await parser.destroy(); }
  } else {
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(buffer); }
    catch { throw Object.assign(new Error('Tệp văn bản cần mã hóa UTF-8.'), { status: 400 }); }
    if (text.includes('\0')) throw Object.assign(new Error('Tệp không phải văn bản hợp lệ.'), { status: 400 });
    if (ext === 'html' || ext === 'htm') {
      const { convert } = require('html-to-text');
      text = convert(text, { wordwrap: false, selectors: [{ selector: 'script', format: 'skip' }, { selector: 'style', format: 'skip' }, { selector: 'img', format: 'skip' }, { selector: 'a', options: { ignoreHref: true } }] });
    }
  }
  if (!text.trim()) throw Object.assign(new Error(ext === 'pdf' ? 'PDF không có văn bản đọc được (có thể là bản scan). Hãy OCR hoặc dùng DOCX, MD, HTML, TXT.' : 'Tài liệu không có nội dung văn bản.'), { status: 400 });
  if (text.length > 120000) throw Object.assign(new Error('Văn bản quá dài. Hãy chia thành các tệp nhỏ hơn.'), { status: 400 });
  // Reuse the same question validation and source-locator pipeline for every format.
  const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const xml = '<w:document><w:body>' + text.split(/\r?\n/).filter(line => line.trim()).map(line => `<w:p><w:r><w:t>${escape(line)}</w:t></w:r></w:p>`).join('') + '</w:body></w:document>';
  const zip = new AdmZip();
  zip.addFile('word/document.xml', Buffer.from(xml));
  const parsed = await parseBinaryDocx(zip.toBuffer(), filename, mode, teacherInstruction);
  parsed.title = parsed.title.replace(/\.(pdf|md|markdown|html?|txt)$/i, '');
  return parsed;
}

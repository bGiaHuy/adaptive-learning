import AdmZip from 'adm-zip';

export const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024;
export function validateAttachment(name: string, bytes: Buffer): string {
  if (!name || name.length > 200 || /[\x00-\x1f/\\]/.test(name)) throw new Error('Tên tệp không hợp lệ.');
  if (!bytes.length || bytes.length > MAX_ATTACHMENT_SIZE) throw new Error('Mỗi tệp phải có dữ liệu và không vượt quá 2 MB.');
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'png' && bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) return 'image/png';
  if (['jpg', 'jpeg'].includes(ext || '') && bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))) return 'image/jpeg';
  if (ext === 'webp' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (ext === 'pdf' && bytes.toString('ascii', 0, 5) === '%PDF-') return 'application/pdf';
  if (['md', 'markdown', 'html', 'htm', 'txt'].includes(ext || '')) {
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      if (!text.trim() || text.includes('\0')) throw new Error();
      return ext === 'html' || ext === 'htm' ? 'text/html' : ext === 'md' || ext === 'markdown' ? 'text/markdown' : 'text/plain';
    } catch { throw new Error('Tệp văn bản cần dữ liệu UTF-8 hợp lệ.'); }
  }
  if (ext === 'docx') {
    try {
      const zip = new AdmZip(bytes);
      const entries = zip.getEntries();
      if (entries.reduce((n, e) => n + e.header.size, 0) > 20 * 1024 * 1024) throw new Error();
      if (zip.getEntry('[Content_Types].xml') && zip.getEntry('word/document.xml') && !entries.some(e => /vbaProject/i.test(e.entryName))) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } catch { /* reject invalid archives */ }
  }
  throw new Error('Chỉ hỗ trợ DOCX, PDF, MD, HTML, TXT, PNG, JPG và WebP đúng định dạng.');
}

export function decodeAttachments(items: unknown) {
 if (items === undefined) return [];
 if (!Array.isArray(items) || items.length > 5) throw new Error('Chọn tối đa 5 tệp.');
 let total = 0;
 return items.map(item => {
 if (!item || typeof item.name !== 'string' || typeof item.base64 !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(item.base64)) throw new Error('Dữ liệu tệp không hợp lệ.');
 const data=Buffer.from(item.base64,'base64'); total+=data.length;
 if(total>MAX_ATTACHMENT_SIZE) throw new Error('Tổng dung lượng tệp tối đa 2 MB.');
 return {name:item.name,data,mimeType:validateAttachment(item.name,data)};
 });
}

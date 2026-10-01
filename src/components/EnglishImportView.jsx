import React, { useState } from 'react';
import { FileJson, Upload } from 'lucide-react';
import { englishApi } from '../lib/apiClient';

export default function EnglishImportView({ currentUser }) {
  const [batch, setBatch] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const readFile = async (file) => {
    setError(''); setResult(null); setBatch(null); setName(file?.name || '');
    if (!file) return;
    if (file.size > 2_000_000) { setError('Tệp vượt quá 2 MB. Hãy chia thành các gói nhỏ hơn.'); return; }
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed.topics) || !Array.isArray(parsed.lessons)) throw new Error('Tệp cần có hai mảng topics và lessons.');
      setBatch(parsed);
    } catch (err) { setError(err.message || 'Tệp JSON không hợp lệ.'); }
  };

  const importData = async () => {
    if (!batch) return;
    setBusy(true); setError('');
    try { setResult(await englishApi.importBatch(batch)); setBatch(null); }
    catch (err) { setError(err.message || 'Không thể nhập dữ liệu.'); }
    finally { setBusy(false); }
  };

  return <div className="english-shell english-import">
    <div className="english-topline"><span>CONTENT / IMPORT</span><span>Quản trị nội dung</span></div>
    <h1>Nhập bài học tiếng Anh</h1>
    <p>Chọn gói JSON đã được kiểm tra nguồn và quyền sử dụng. {currentUser?.role === 'ADMIN' ? <>Bài chỉ xuất hiện với học sinh khi trường <code>published</code> là <code>true</code>.</> : 'Bài nhập bởi tác giả sẽ ở trạng thái nháp để quản trị viên kiểm tra.'}</p>
    <label className="english-upload"><Upload size={27} /><strong>Chọn tệp JSON</strong><span>{name || 'Tối đa 2 MB mỗi gói'}</span><input type="file" accept=".json,application/json" onChange={e => readFile(e.target.files?.[0])} /></label>
    {batch && <div className="english-import-summary"><FileJson size={22} /><span>{batch.topics.length} chủ đề · {batch.lessons.length} bài học · {currentUser?.role === 'ADMIN' ? `${batch.lessons.filter(item => item.published).length} bài đánh dấu xuất bản` : 'sẽ lưu ở trạng thái nháp'}</span></div>}
    {error && <p className="english-error" role="alert">{error}</p>}
    {result && <p className="english-success" role="status">Đã nhập {result.topics} chủ đề, {result.lessons} bài học và {result.exercises} câu hỏi.</p>}
    <button className="english-primary" disabled={!batch || busy} onClick={importData}>{busy ? 'Đang nhập…' : 'Nhập nội dung'}</button>
  </div>;
}

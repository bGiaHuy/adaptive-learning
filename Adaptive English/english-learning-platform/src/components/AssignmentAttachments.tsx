'use client';
import { useEffect, useState } from 'react';

type Attachment = { id: string; name: string; size: number; mimeType: string };

// Omit version for current teaching materials; explicit versions preserve historical views.
export default function AssignmentAttachments({ assignmentId, version }: { assignmentId: string; version?: number }) {
  const [files, setFiles] = useState<Attachment[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const endpoint = `/api/assignments/${encodeURIComponent(assignmentId)}/attachments`;
  const versionQuery = version === undefined ? '' : `?version=${version}`;

  useEffect(() => {
    let active = true;
    let requestId = 0;
    setFiles([]);
    setLoading(true);
    const refresh = async () => {
      const currentRequest = ++requestId;
      try {
        const response = await fetch(endpoint + versionQuery, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.attachments)) throw new Error('Không tải được tệp.');
        if (active && currentRequest === requestId) { setFiles(data.attachments); setError(''); }
      } catch {
        if (active && currentRequest === requestId) setError('Không tải được tệp đính kèm. Hãy tải lại trang.');
      } finally {
        if (active && currentRequest === requestId) setLoading(false);
      }
    };
    void refresh();
    const refreshWhenVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    const timer = window.setInterval(refreshWhenVisible, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [endpoint, versionQuery]);

  return <section className="space-y-3 my-4" aria-label="Tệp đính kèm">
    <h3 className="font-bold text-sm">Tệp đính kèm</h3>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {loading ? <p className="text-xs text-ink-muted" role="status">Đang tải tệp đính kèm…</p> : !files.length && !error ? <p className="text-xs text-ink-muted">Chưa có tệp đính kèm.</p> : files.map(file => {
      const query = new URLSearchParams({ file: file.id, ...(version === undefined ? {} : { version: String(version) }) });
      const downloadUrl = `${endpoint}?${query}`;
      const isImage = ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimeType);
      return <div key={file.id} className="space-y-2">
        {isImage && <a href={`${downloadUrl}&preview=1`} target="_blank" rel="noopener noreferrer" aria-label={`Mở ảnh ${file.name}`}>
          <img src={`${downloadUrl}&preview=1`} alt={file.name} loading="lazy" className="block max-w-full h-auto max-h-[640px] object-contain rounded-lg border border-line bg-white" />
        </a>}
        <a className="block text-sm text-primary underline break-all" href={downloadUrl}>{file.name} ({Math.ceil(file.size / 1024)} KB) · Tải xuống</a>
      </div>;
    })}
  </section>;
}

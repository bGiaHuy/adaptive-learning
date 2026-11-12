"use client";
import { useEffect, useState } from 'react';

const errors: Record<string, string> = {
  unavailable: 'Đăng nhập Google hiện chưa khả dụng. Bạn vẫn có thể đăng nhập bằng email.',
  cancelled: 'Bạn đã hủy đăng nhập Google.',
  state: 'Phiên đăng nhập Google đã hết hạn. Vui lòng thử lại.',
  failed: 'Không thể đăng nhập Google. Vui lòng thử lại hoặc dùng email.',
  link_required: 'Email này đã có tài khoản. Hãy đăng nhập bằng mật khẩu, rồi liên kết Google trong Cài đặt.',
  link_session: 'Hãy đăng nhập bằng mật khẩu trước khi liên kết Google.',
  link_email: 'Hãy chọn tài khoản Google có cùng email với tài khoản hiện tại.',
  link_conflict: 'Tài khoản Google này đã được liên kết. Vui lòng dùng tài khoản Google đã kết nối.',
};
export function GoogleSignIn({ role = 'student', connect = false }: { role?: string; connect?: boolean }) {
  const [status, setStatus] = useState<{ enabled: boolean; connected: boolean } | null>(null);
  const [error, setError] = useState('');
  const [returnTo, setReturnTo] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    const params = new URLSearchParams(window.location.search);
    setReturnTo(params.get('redirect') || '');
    setError(errors[params.get('google_error') || ''] || '');
    fetch('/api/auth/google/status', { signal: abort.signal, cache: 'no-store' }).then(response => response.ok ? response.json() : null).then(value => { if (!abort.signal.aborted) setStatus(value); }).catch(() => {});
    return () => abort.abort();
  }, []);
  const action = '/api/auth/google?' + new URLSearchParams({ role, ...(returnTo ? { redirect: returnTo } : {}) });
  return <>
    {error ? <p role="alert" className="text-sm text-red-700 rounded-sm bg-red-50 border border-red-200 p-3">{error}</p> : null}
    {status?.enabled ? <div className="space-y-3">
      {connect ? <h2 className="text-base font-bold text-ink">Tài khoản Google</h2> : null}
      {connect && status.connected ? <p className="text-sm text-ink-muted">Đã liên kết Google. Bạn có thể dùng Google để đăng nhập.</p> : <form action={action} method={connect ? 'post' : 'get'}>
        {!connect ? <><input type="hidden" name="role" value={role} /><input type="hidden" name="redirect" value={returnTo} /></> : null}
        <button type="submit" className="w-full inline-flex items-center justify-center gap-3 rounded-sm border-2 border-line bg-white px-4 py-3 font-bold text-sm text-ink hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48"><path fill="#4285F4" d="M43.6 24.5c0-1.5-.1-2.9-.4-4.4H24v8.3h11a9.5 9.5 0 0 1-4.1 6.2v5.2h6.7c3.9-3.6 6-8.9 6-15.3Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.2c-1.8 1.2-4.1 1.9-6.8 1.9-5.3 0-9.8-3.6-11.4-8.4H5.7v5.4A20.4 20.4 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.6 27.4a12.3 12.3 0 0 1 0-7.8v-5.4H5.7a20 20 0 0 0 0 18.6l6.9-5.4Z"/><path fill="#EA4335" d="M24 11.2c3 0 5.6 1 7.7 3l5.8-5.8A19.5 19.5 0 0 0 24 3a20.4 20.4 0 0 0-18.3 11.2l6.9 5.4C14.2 14.8 18.7 11.2 24 11.2Z"/></svg>
          {connect ? 'Liên kết Google' : 'Tiếp tục với Google'}
        </button>
      </form>}
      {!connect ? <p className="text-center text-xs text-ink-muted">hoặc sử dụng email</p> : null}
    </div> : null}
  </>;
}

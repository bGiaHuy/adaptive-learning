// Only a configured loopback HTTP origin may use a non-Secure production cookie.
// Never derive this exception from caller-controlled Host or forwarding headers.
export function authCookieSecure(nodeEnv: string | undefined, baseUrl: string | undefined): boolean {
  if (nodeEnv !== 'production') return false;
  try {
    const url = new URL(baseUrl || '');
    const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    return !(url.protocol === 'http:' && isLoopback);
  } catch {
    return true;
  }
}

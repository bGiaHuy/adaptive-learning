import { DurableObject } from 'cloudflare:workers';

export function runtimeEnvironment(env) {
  const result = { NODE_ENV: 'production', PORT: '8080', HOSTNAME: '0.0.0.0', DICTIONARY_DB_PATH: '/app/data/dictionary.db' };
  for (const key of ['DATABASE_URL', 'BLOB_READ_WRITE_TOKEN', 'MWAPI_API_KEY', 'MWAPI_BASE_URL', 'MWAPI_MODEL', 'GEMINI_API_KEY', 'RESEND_API_KEY', 'AUTH_EMAIL_FROM', 'REGISTRATION_OTP_SECRET', 'BASE_URL', 'NEXTAUTH_URL', 'ENABLE_ROLE_SWITCHER', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'CLOUDFLARE_DATA_URL', 'CLOUDFLARE_DATA_TOKEN', 'CLOUDFLARE_MEDIA_URL', 'IMPORT_ASSESSMENT_SECRET']) {
    if (env.CLOUDFLARE_DATA_URL && env.CLOUDFLARE_DATA_TOKEN && ['DATABASE_URL', 'BLOB_READ_WRITE_TOKEN'].includes(key)) continue;
    if (typeof env[key] === 'string' && env[key] && env[key] !== '[SENSITIVE]') result[key] = env[key];
  }
  if (!result.DATABASE_URL && !(result.CLOUDFLARE_DATA_URL && result.CLOUDFLARE_DATA_TOKEN)) throw new Error('Database configuration unavailable');
  return result;
}

export class EnglishApp extends DurableObject {
  starting;
  async ready() {
    const container = this.ctx.container;
    if (!container.running) container.start({ image: container.images.base, instance: 'basic', enableInternet: true, env: runtimeEnvironment(this.env) });
    await container.setInactivityTimeout(10 * 60 * 1000);
    const port = container.getTcpPort(8080);
    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) {
      try {
        const response = await port.fetch('http://container/api/health', { signal: AbortSignal.timeout(3000) });
        if (response.ok && (await response.json()).database === 'connected') return;
      } catch { /* Retry readiness probes only. Never retry a user's mutation. */ }
      await scheduler.wait(500);
    }
    throw new Error('Application readiness deadline exceeded');
  }
  async fetch(request) {
    this.starting ??= this.ready().finally(() => { this.starting = undefined; });
    try { await this.starting; } catch {
      return Response.json({ error: 'The application is starting. Please try again.' }, { status: 503, headers: { 'retry-after': '5', 'cache-control': 'no-store' } });
    }
    const url = new URL(request.url);
    const externalHost = url.host;
    url.protocol = 'http:';
    url.host = 'container';
    const forwarded = new Request(url, request);
    for (const key of ['host', 'forwarded', 'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'x-real-ip', 'x-vercel-forwarded-for']) forwarded.headers.delete(key);
    forwarded.headers.set('x-forwarded-host', externalHost);
    forwarded.headers.set('x-forwarded-proto', 'https');
    forwarded.headers.set('x-forwarded-for', request.headers.get('cf-connecting-ip') || 'unknown');
    return this.ctx.container.getTcpPort(8080).fetch(forwarded);
  }
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path.startsWith('/__migration/')) return new Response('Not found', { status: 404 });
    if (env.MIGRATION_MAINTENANCE === 'true') return Response.json({ error: 'Adaptive English is moving its data. Please try again shortly.' }, { status: 503, headers: { 'retry-after': '120', 'cache-control': 'no-store' } });
    if ((request.method === 'POST' && path.startsWith('/api/auth/')) || (request.method === 'GET' && path === '/api/auth/google')) {
      const { success } = await env.AUTH_LIMITER.limit({ key: request.headers.get('cf-connecting-ip') || 'unknown' });
      if (!success) return Response.json({ error: 'Please wait before trying again.' }, { status: 429, headers: { 'retry-after': '60', 'cache-control': 'no-store' } });
    }
    const response = await env.APP.getByName(env.APP_INSTANCE_KEY || 'english-production-v1').fetch(request);
    const result = new Response(response.body, response);
    const location = result.headers.get('location');
    if (location) {
      const redirect = new URL(location, request.url);
      if (['container', 'localhost', '0.0.0.0', '127.0.0.1'].includes(redirect.hostname)) {
        const external = new URL(request.url);
        redirect.protocol = external.protocol;
        redirect.host = external.host;
        result.headers.set('location', redirect.href);
      }
    }
    if (path.startsWith('/api/') || path.startsWith('/student') || path.startsWith('/teacher') || path.startsWith('/admin')) result.headers.set('cache-control', 'private, no-store');
    result.headers.set('x-content-type-options', 'nosniff');
    return result;
  }
};

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
const app = path.join(root, 'english-learning-platform');
const cli = 'C:/Users/Administrator/AppData/Local/npm-cache/_npx/69f9afb961c37556/node_modules/vercel/dist/index.js';
const temp = path.join(app, '.artifacts/chatbot-test-production.env');
const resultPath = path.join(__dirname, 'chatbot-production-smoke.json');
const result = { date: '2026-10-10', url: 'https://adaptiveenglish.vercel.app', checks: [] };
let prisma;
let created = false;
let userId;
const email = `codex-chatbot-${crypto.randomUUID()}@example.invalid`;
function check(name, pass, detail) {
  result.checks.push({name, pass, ...detail});
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
  if (!pass) throw new Error(name);
}
async function req(endpoint, options = {}) {
  const response = await fetch(result.url + endpoint, { ...options, signal: AbortSignal.timeout(180000) });
  return {response, data: await response.json()};
}
(async () => {
  try {
    const info = await req('/api/ai/tutor');
    check('production-provider', info.response.ok && info.data.providerInfo?.provider === 'mwapi', { status: info.response.status, providerInfo: info.data.providerInfo });
    const envPull = spawnSync(process.execPath, [cli, 'env', 'pull', temp, '--environment', 'production', '--yes'], {cwd: app, encoding: 'utf8'});
    check('temporary-env-pull', envPull.status === 0, {exit_code: envPull.status});
    const envText = fs.readFileSync(temp, 'utf8');
    const match = envText.match(/^DATABASE_URL=(.*)$/m);
    if (!match) throw new Error('Missing production database configuration');
    const value = match[1].trim();
    process.env.DATABASE_URL = value.startsWith('"') ? JSON.parse(value) : value;
    fs.unlinkSync(temp);
    const {PrismaClient} = require(path.join(app, '.artifacts/vercel-release-20261010/node_modules/@prisma/client'));
    prisma = new PrismaClient();
    check('synthetic-account-absent', await prisma.user.count({where: {email}}) === 0, {});
    const anonymous = await req('/api/ai/chat', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({message: 'hello'})});
    check('anonymous-chat-rejected', anonymous.response.status === 401, {status: anonymous.response.status});
    const registration = await req('/api/auth/register', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email, password: crypto.randomBytes(24).toString('base64url'), name: 'Codex synthetic chatbot check', role: 'student'})});
    created = await prisma.user.count({where: {email}}) === 1;
    userId = registration.data.user?.id;
    check('synthetic-registration', registration.response.ok && created && !!userId, {status: registration.response.status});
    const cookie = registration.response.headers.getSetCookie().map(v => v.split(';')[0]).join('; ');
    const conversationId = crypto.randomUUID();
    const chat = await req('/api/ai/chat', {method: 'POST', headers: {'Content-Type': 'application/json', Cookie: cookie}, body: JSON.stringify({conversationId, message: 'Từ resilient nghĩa là gì? Cho mình một ví dụ đơn giản.', context: {path: '/student/home'}})});
    check('real-chatbot-response', chat.response.ok && chat.data.success === true && chat.data.mode === 'learning' && typeof chat.data.reply === 'string' && chat.data.reply.length > 0, {status: chat.response.status, response: chat.data});
    const history = await req('/api/ai/chat?conversationId=' + conversationId, {headers: {Cookie: cookie}});
    check('chat-history-saved', history.response.ok && history.data.messages?.length === 2, {status: history.response.status, messageCount: history.data.messages?.length});
  } catch (err) {
    result.failure = err.message.startsWith('Invalid') ? 'Runtime/database error (details withheld)' : err.message;
    process.exitCode = 1;
  } finally {
    if (prisma && created) {
      const deleted = await prisma.user.deleteMany({where: {email, ...(userId ? {id: userId} : {})}});
      const remaining = await prisma.user.count({where: {email}});
      result.cleanup = {deleted: deleted.count, remaining, cascadedMessagesRemaining: userId ? await prisma.leafChatMessage.count({where: {userId}}) : null};
      if (deleted.count !== 1 || remaining !== 0 || result.cleanup.cascadedMessagesRemaining !== 0) process.exitCode = 1;
    }
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    result.temporaryEnvRemoved = !fs.existsSync(temp);
    if (prisma) await prisma.$disconnect();
    result.exit_code = process.exitCode || 0;
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
  }
})();

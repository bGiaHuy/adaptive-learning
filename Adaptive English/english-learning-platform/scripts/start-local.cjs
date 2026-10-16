// Run the production build on loopback HTTP with a matching trusted origin.
const { spawn } = require('node:child_process');
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-p', '3008', '-H', 'localhost'], {
  stdio: 'inherit',
  env: { ...process.env, BASE_URL: 'http://localhost:3008' },
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));

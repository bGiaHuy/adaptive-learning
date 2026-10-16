const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const logDir = path.resolve(__dirname, '../../docs/verification-logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

console.log('Capturing raw logs to:', logDir);

// 1. Typecheck log
try {
  const tcLog = execSync('npx tsc --noEmit', { stdio: 'pipe' }).toString();
  fs.writeFileSync(path.join(logDir, 'raw-typecheck.log'), `=== TYPECHECK LOG (${new Date().toISOString()}) ===\nExit Code: 0\nOutput:\n${tcLog}\nResult: PASS (0 errors)\n`);
  console.log('✔ Captured raw-typecheck.log');
} catch (err) {
  fs.writeFileSync(path.join(logDir, 'raw-typecheck.log'), `=== TYPECHECK LOG (${new Date().toISOString()}) ===\nExit Code: ${err.status}\nOutput:\n${err.stdout?.toString()}\nErrors:\n${err.stderr?.toString()}\n`);
}

// 2. Tests log
try {
  const tests = fs.readdirSync(path.join(__dirname, '../tests')).filter(f => f.endsWith('.cjs'));
  let testOut = `=== AUTOMATED TEST SUITES LOG (${new Date().toISOString()}) ===\n`;
  let passCount = 0;
  for (const t of tests) {
    try {
      const out = execSync(`node tests/${t}`, { stdio: 'pipe' }).toString();
      testOut += `\n----------------------------------------\nSUITE: tests/${t}\nStatus: PASS\nOutput:\n${out}\n`;
      passCount++;
    } catch (tErr) {
      testOut += `\n----------------------------------------\nSUITE: tests/${t}\nStatus: FAIL\nOutput:\n${tErr.stdout?.toString()}\nError:\n${tErr.stderr?.toString()}\n`;
    }
  }
  testOut += `\n========================================\nTOTAL SUITES RUN: ${tests.length}\nPASSED: ${passCount}/${tests.length}\n`;
  fs.writeFileSync(path.join(logDir, 'raw-tests.log'), testOut);
  console.log('✔ Captured raw-tests.log');
} catch (err) {
  console.error('Error running tests log capture:', err);
}

// 3. Browser acceptance log
try {
  const browserLog = execSync('node scripts/acceptance-browser.cjs', { stdio: 'pipe' }).toString();
  fs.writeFileSync(path.join(logDir, 'raw-browser.log'), `=== BROWSER ACCEPTANCE LOG (${new Date().toISOString()}) ===\nExit Code: 0\nOutput:\n${browserLog}\n`);
  console.log('✔ Captured raw-browser.log');
} catch (err) {
  fs.writeFileSync(path.join(logDir, 'raw-browser.log'), `=== BROWSER ACCEPTANCE LOG (${new Date().toISOString()}) ===\nExit Code: ${err.status}\nOutput:\n${err.stdout?.toString()}\nError:\n${err.stderr?.toString()}\n`);
}

console.log('Finished capturing all verification logs.');

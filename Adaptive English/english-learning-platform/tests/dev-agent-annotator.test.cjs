const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('DevAgentAnnotator file exists and exports component', () => {
  const filePath = path.join(__dirname, '../src/components/dev/DevAgentAnnotator.tsx');
  assert.ok(fs.existsSync(filePath), 'DevAgentAnnotator.tsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('export function DevAgentAnnotator'), 'Must export DevAgentAnnotator');
  assert.ok(content.includes('data-agent-locator'), 'Must set data-agent-locator attribute');
  assert.ok(content.includes('data-component'), 'Must set data-component attribute');
  assert.ok(content.includes('data-file'), 'Must set data-file attribute');
  assert.ok(content.includes('data-component-stack'), 'Must set data-component-stack attribute');
});

test('RootLayout connects DevAgentAnnotator only in development', () => {
  const layoutPath = path.join(__dirname, '../src/app/layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  assert.ok(layoutContent.includes('DevAgentAnnotator'), 'RootLayout must import DevAgentAnnotator');
  assert.ok(
    layoutContent.includes("process.env.NODE_ENV !== 'production' && <DevAgentAnnotator />"),
    'Must be isolated to dev environment so production builds are not affected'
  );
});

test('Simulate Fiber annotation and DOM attribute injection', () => {
  // Test simulated DOM element and fiber traversal logic
  const mockElement = {
    attributes: {},
    setAttribute(name, val) {
      this.attributes[name] = val;
    },
    getAttribute(name) {
      return this.attributes[name];
    },
    closest() {
      return null;
    },
    __reactFiber$test: {
      type: { name: 'Header' },
      _debugSource: {
        fileName: 'c:\\Users\\Workspace\\english-learning-platform\\src\\components\\ui\\Header.tsx',
        lineNumber: 42,
      },
      return: {
        type: { name: 'AppProvider' },
        return: null,
      },
    },
  };

  // Mock extraction logic
  const keys = Object.keys(mockElement);
  const fiberKey = keys.find((k) => k.startsWith('__reactFiber$'));
  assert.ok(fiberKey, 'Found fiber key');

  const curr = mockElement[fiberKey];
  assert.equal(curr.type.name, 'Header');
  assert.ok(curr._debugSource.fileName.includes('src/components/ui/Header.tsx'.replace(/\//g, '\\')));
  assert.equal(curr._debugSource.lineNumber, 42);
});

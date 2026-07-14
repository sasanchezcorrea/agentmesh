#!/usr/bin/env node
// agentmesh — tests for hooks/rtk-rewrite.js: the thin node wrapper around
// RTK's own `rtk hook <client>` processors (needed only so the hook's
// `command` field stays `node <script>`, see hooks-windows.test.js).

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const hook = path.join(root, 'hooks', 'rtk-rewrite.js');
const fakeRtkDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentmesh-rtk-'));
const fakeRtk = path.join(fakeRtkDir, 'rtk');
const fakeOutput = JSON.stringify({
  hookSpecificOutput: { updatedInput: { command: 'rtk git status' } },
});
fs.writeFileSync(
  fakeRtk,
  `#!${process.execPath}\nprocess.stdout.write(${JSON.stringify(`${fakeOutput}\n`)});\n`,
);
fs.chmodSync(fakeRtk, 0o755);

function run(input, env) {
  const runEnv = { ...process.env, ...env };
  if (!env.PATH) {
    runEnv.PATH = `${fakeRtkDir}${path.delimiter}${runEnv.PATH}`;
  }
  return spawnSync(process.execPath, [hook], {
    input,
    encoding: 'utf8',
    env: runEnv,
  });
}

// Claude Code shape (PascalCase tool_name) -> rewrite happens.
{
  const { stdout, status } = run(
    JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'git status' } }),
    { COPILOT_PLUGIN_DATA: '' },
  );
  assert.equal(status, 0);
  const out = JSON.parse(stdout);
  assert.equal(out.hookSpecificOutput.updatedInput.command, 'rtk git status');
}

// Copilot CLI shape (lowercase tool_name, COPILOT_PLUGIN_DATA set) -> rewrite happens.
{
  const { stdout, status } = run(
    JSON.stringify({ tool_name: 'bash', tool_input: { command: 'git status' } }),
    { COPILOT_PLUGIN_DATA: '/tmp/agentmesh-test-plugin-data' },
  );
  assert.equal(status, 0);
  const out = JSON.parse(stdout);
  assert.equal(out.hookSpecificOutput.updatedInput.command, 'rtk git status');
}

// rtk missing from PATH -> silent no-op, never breaks the hook chain.
{
  const nodeDir = path.dirname(process.execPath);
  const { stdout, status } = run(
    JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'git status' } }),
    { PATH: nodeDir, COPILOT_PLUGIN_DATA: '' },
  );
  assert.equal(status, 0);
  assert.equal(stdout, '');
}

console.log('rtk-rewrite-hook.test.js: all assertions passed');

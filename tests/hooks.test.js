#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'agentmesh-hooks-'));
process.on('exit', () => fs.rmSync(temp, { recursive: true, force: true }));

function run(script, env, input = '') {
  return spawnSync(process.execPath, [path.join(root, 'hooks', script)], {
    env: { ...process.env, ...env },
    input,
    encoding: 'utf8',
  });
}

const home = path.join(temp, 'home');
fs.mkdirSync(home, { recursive: true });

// Claude Code: activate the default mesh mode and emit the ruleset.
let result = run('mesh-activate.js', {
  HOME: home,
  USERPROFILE: home,
  AGENTMESH_DEFAULT_MODE: 'ultra',
});
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.readFileSync(path.join(home, '.claude', '.agentmesh-mode'), 'utf8'), 'ultra');
assert.match(result.stdout, /AGENTMESH MODE ACTIVE — level: ultra/);
assert.match(result.stdout, /CodeGraph first/);
assert.match(result.stdout, /Serena second/);
assert.ok(fs.existsSync(path.join(home, '.claude', '.agentmesh-statusline-nudged')));

// Claude Code: switch modes, report the active mode, and deactivate safely.
result = run(
  'mesh-mode-tracker.js',
  { HOME: home, USERPROFILE: home },
  JSON.stringify({ prompt: '/mesh lite' }),
);
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.readFileSync(path.join(home, '.claude', '.agentmesh-mode'), 'utf8'), 'lite');
assert.match(result.stdout, /AGENTMESH MODE CHANGED — level: lite/);

result = run(
  'mesh-mode-tracker.js',
  { HOME: home, USERPROFILE: home },
  JSON.stringify({ prompt: '/mesh' }),
);
assert.equal(result.status, 0, result.stderr);
assert.match(result.stdout, /AGENTMESH MODE ACTIVE — level: lite/);

result = run(
  'mesh-mode-tracker.js',
  { HOME: home, USERPROFILE: home },
  JSON.stringify({ prompt: 'add a normal mode toggle next to dark mode' }),
);
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.readFileSync(path.join(home, '.claude', '.agentmesh-mode'), 'utf8'), 'lite');

result = run(
  'mesh-mode-tracker.js',
  { HOME: home, USERPROFILE: home },
  JSON.stringify({ prompt: 'normal mode' }),
);
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.existsSync(path.join(home, '.claude', '.agentmesh-mode')), true);
assert.equal(result.stdout, '');

result = run(
  'mesh-mode-tracker.js',
  { HOME: home, USERPROFILE: home },
  JSON.stringify({ prompt: 'stop mesh' }),
);
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.existsSync(path.join(home, '.claude', '.agentmesh-mode')), false);
assert.match(result.stdout, /AGENTMESH MODE OFF/);

result = run(
  'mesh-mode-tracker.js',
  { HOME: home, USERPROFILE: home },
  JSON.stringify({ prompt: '/mesh full' }),
);
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.readFileSync(path.join(home, '.claude', '.agentmesh-mode'), 'utf8'), 'full');

// Copilot CLI: state lives in COPILOT_PLUGIN_DATA and SessionStart uses JSON.
const copilotData = path.join(temp, 'copilot-data');
result = run('mesh-activate.js', {
  HOME: home,
  USERPROFILE: home,
  COPILOT_PLUGIN_DATA: copilotData,
  AGENTMESH_DEFAULT_MODE: 'full',
});
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.readFileSync(path.join(copilotData, '.agentmesh-mode'), 'utf8'), 'full');
assert.match(JSON.parse(result.stdout).additionalContext, /AGENTMESH MODE ACTIVE — level: full/);
assert.match(JSON.parse(result.stdout).additionalContext, /CodeGraph first/);

result = run(
  'mesh-mode-tracker.js',
  { HOME: home, USERPROFILE: home, COPILOT_PLUGIN_DATA: copilotData },
  JSON.stringify({ prompt: '/mesh ultra' }),
);
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.readFileSync(path.join(copilotData, '.agentmesh-mode'), 'utf8'), 'ultra');
assert.deepEqual(JSON.parse(result.stdout), {});

// Claude subagents receive the same ruleset; a matcher can narrow injection.
const subHome = path.join(temp, 'sub-home');
fs.mkdirSync(path.join(subHome, '.claude'), { recursive: true });
fs.writeFileSync(path.join(subHome, '.claude', '.agentmesh-mode'), 'full');
result = run('mesh-subagent.js', { HOME: subHome, USERPROFILE: subHome });
assert.equal(result.status, 0, result.stderr);
assert.match(JSON.parse(result.stdout).hookSpecificOutput.additionalContext, /AGENTMESH MODE ACTIVE/);

result = run(
  'mesh-subagent.js',
  { HOME: subHome, USERPROFILE: subHome, AGENTMESH_SUBAGENT_MATCHER: '^general$' },
  JSON.stringify({ agent_type: 'Explore' }),
);
assert.equal(result.status, 0, result.stderr);
assert.equal(result.stdout, '');

console.log('hook compatibility checks passed');

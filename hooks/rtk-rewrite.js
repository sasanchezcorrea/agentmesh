#!/usr/bin/env node
// agentmesh — PreToolUse hook wrapper for RTK.
//
// RTK ships its own native hook processors (`rtk hook claude`, `rtk hook
// copilot`) that already do the JSON-stdin rewriting correctly -- this file
// is NOT a reimplementation of that logic. It only exists because the
// `command` field of a bundled hook must be `node <script-in-hooks/>` to run
// identically under bash and PowerShell (see hooks-windows.test.js and issue
// #527/#569: some hosts run `command` through PowerShell on Windows
// regardless of `commandWindows`, and a bare non-node command breaks there).
// This wrapper is the thinnest possible bridge: relay stdin/stdout/exit code
// to `rtk hook <client>`, do nothing else.
'use strict';

const { spawnSync } = require('child_process');
const { isCopilot } = require('./mesh-runtime');

function readStdin() {
  try {
    return require('fs').readFileSync(0, 'utf8');
  } catch (e) {
    return '';
  }
}

const client = isCopilot ? 'copilot' : 'claude';
const input = readStdin();

// mesh: skip silently if rtk isn't installed -- a missing optional tool must
// never break the rest of the hook chain.
const result = spawnSync('rtk', ['hook', client], {
  input,
  encoding: 'utf8',
  timeout: 5000,
});
if (result.error || result.status !== 0) {
  process.exit(0);
}
process.stdout.write(result.stdout || '');

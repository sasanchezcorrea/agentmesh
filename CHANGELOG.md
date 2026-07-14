# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Ponytail is now a required companion plugin on Claude Code and Copilot CLI.
  The installer adds it from the official marketplace when missing and
  `stack.lock.json` reports version drift without duplicating Ponytail's public
  commands or skills.
- VS Code now receives the managed global Agentmesh instruction file through
  its supported `~/.copilot/instructions` user-profile location.

## [0.1.0] - 2026-07-11

Initial release.

### Added
- Single-plugin orchestration of the agent-tool stack: CodeGraph, AX, Engram,
  Serena (MCP servers) and RTK (PreToolUse hook), driven by `manifest.json`.
- `setup/install.sh` — one-command installer for the five underlying binaries
  plus agentmesh itself, with pinned, checksum-verified release downloads and a
  `--check` dry-run.
- `setup/register-mcp.js` — idempotent per-client MCP registration for Claude
  Code, Copilot CLI, and VS Code.
- Cost-aware mesh modes (`/mesh lite|full|ultra|off`) with a self-activating
  behavior layer and statusline badge.
- `/mesh-status`, `/mesh-cost`, and `/mesh-evaluate` commands.
- Self-healing `SessionStart` hook that registers the MCP stack when config
  drift is detected.
- Docker smoke test and Renovate/prek quality gates.

[0.1.0]: https://github.com/sasanchezcorrea/agentmesh/tree/v0.1.0

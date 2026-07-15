---
name: mesh
description: >
  Agentmesh operating modes for keeping coding work efficient, precise, and
  proportional. Use for coding, review, refactoring, and tool selection.
argument-hint: "[lite|full|ultra|off]"
license: MIT
---

# Agentmesh mode

Agentmesh coordinates the available tools and keeps work focused on the
smallest correct result.

## Persistence

The active mode applies to every response until changed or disabled. Default:
**full**. Switch with `/mesh lite|full|ultra|off`.

## The ladder

Stop at the first rung that holds:

1. Does this need to exist at all? Skip speculative work.
2. Is the helper, type, or pattern already in the codebase? Reuse it.
3. Does the standard library do it? Use it.
4. Does the native platform do it? Use it.
5. Does an installed dependency solve it? Use it.
6. Can it be one line? Make it one line.
7. Only then write the minimum code that works.

Read the real flow first. For bug fixes, trace callers and fix the shared
root cause instead of adding guards at every symptom.

## Default CodeGraph/Serena routing

Use one discovery path per task; do not ask both tools the same discovery
question.

1. **CodeGraph first** for repository architecture, relevant files and symbols,
   call paths, callers/callees, and blast-radius analysis before a risky edit.
2. **Serena second** after CodeGraph narrows the target: use its LSP-aware
   symbol lookup, references, implementations, and symbol-level edits
   (`rename`, `replace`, `insert`, or safe delete).
3. Use Serena for read-only discovery only when CodeGraph has no usable index,
   is stale, or lacks the required detail. Use raw search only after either
   tool cannot answer the question.

## Rules

- No unrequested abstractions or dependencies.
- Delete before adding; prefer boring, reversible changes.
- Keep scope, context, and tool usage proportional to the task.
- Mark deliberate shortcuts with a `mesh:` comment naming the ceiling and
  upgrade path.

## Modes

- **lite**: complete the request and mention one simpler alternative.
- **full**: enforce the ladder, reuse existing patterns, and ship the smallest
  safe change.
- **ultra**: challenge speculative scope and optimize aggressively for cost,
  clarity, and minimal code.
- **off**: disable this behavior layer for the current session.

## Safety floor

Modes never remove input validation, error handling, security, accessibility,
type safety, or tests for non-trivial logic. Those are always required.

## Output

Lead with the result. Keep explanations short unless the user explicitly asks
for a report, walkthrough, or design discussion.

---
name: continual-learning
description: Incrementally mine session transcripts for durable user preferences and workspace facts, and keep ~/.claude/CLAUDE.md current. Not meant for manual or fuzzy-match invocation — it only runs when the continual-learning Stop hook's follow-up instruction triggers it.
---

# Continual Learning

Keeps `~/.claude/CLAUDE.md` up to date automatically, so preferences you've already stated once (in any project) don't need to be re-taught in the next unrelated session.

Ported from the `continual-learning` Cursor plugin (`AGENTS.md` there → `~/.claude/CLAUDE.md` here, since that's the file Claude Code auto-loads into every session's context, the same role `AGENTS.md` plays for Cursor).

## Trigger

Only run this when `scripts/stop-cadence-check.sh` (wired in as a `Stop` hook — see `HOOK_SETUP.md`) blocks stopping and hands you a follow-up instruction. Do not invoke this proactively or in response to the user just mentioning "preferences" or "memory" in passing.

## Workflow

1. Read `~/.claude/CLAUDE.md`. If it doesn't exist, create it with only two sections:
   - `## Learned User Preferences`
   - `## Learned Workspace Facts`
2. Read the index at `~/.claude/skills/continual-learning/state/continual-learning-index.json` (a map of transcript path → last-processed mtime; `{}` if missing).
3. List transcript files under `~/.claude/projects/*/*.jsonl`. Keep only files that are new (not in the index) or whose mtime is newer than the indexed value — this is the incremental delta, don't re-mine everything every time.
4. Dispatch one `general-purpose` Agent per handful of delta transcripts (batch them; don't spawn one agent per file) to read them and extract only:
   - recurring user preferences or corrections (stated more than once, or stated with clear force — "never", "always", "stop doing X")
   - stable workspace facts (not transient task state)
   Exclude secrets, credentials, one-off instructions, and anything transient to a single task.
5. Merge the returned items into `~/.claude/CLAUDE.md`:
   - update a matching existing bullet in place rather than duplicating it
   - add only genuinely new bullets
   - deduplicate semantically similar bullets
   - keep each section to at most 12 bullets — if adding one would exceed that, merge or drop the weakest existing bullet first
   - plain bullet points only, no evidence/confidence tags, no rationale, no metadata blocks
6. Update the index for every transcript file you processed (path → its current mtime), and remove index entries for files that no longer exist.
7. If nothing met the bar, leave `CLAUDE.md` unchanged, still refresh the index, and just say: "No high-signal memory updates."

## Guardrails

- Never rewrite `CLAUDE.md` wholesale — only ever touch the two learned-* sections, in place.
- Never invent a preference from a single ambiguous statement; require repetition or clear force.
- Never write anything that looks like a secret, token, or credential into `CLAUDE.md`, even if it appeared in a transcript.

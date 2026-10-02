---
name: recap
description: Write a recap.md documenting what a branch/PR actually did — what the code did before, what problem or task prompted the change, and what changed and why. Use when the user asks for a recap, wants to understand what an agent (or their own past self) did on a branch, asks "what changed here", or wants a durable summary of a completed piece of work before opening or merging a PR.
---

Produce a durable, three-section `recap.md` for the current branch's changes, so the user or a reviewer can understand a change without re-reading the whole diff or transcript.

## 1. Determine scope

- Default base ref: the merge-base between the current branch and `main`/`master` (try `main` first, fall back to `master`, ask if neither exists). Use `git merge-base <base> HEAD`.
- If the user names an explicit base (a branch, tag, or commit), use that instead.
- If the working tree is dirty, include uncommitted changes in scope too (diff against the base ref, not just `HEAD`), but say so explicitly in the recap.

## 2. Gather "Before"

- Read the code at the base ref (`git show <base>:<path>`) for the files touched by the diff — enough to describe what the affected code did before this branch, not a full walkthrough of the whole file.
- Keep this to what a reader needs to understand the change, not an architecture writeup.

## 3. Gather "Issue"

- Look for an explicit statement of the task/problem: the branch's commit messages (`git log <base>..HEAD --oneline`), an open PR/MR description if one exists (try `gh pr view` or `glab mr view`, whichever applies — don't fail loudly if neither is set up), or a linked issue number in a commit message or branch name.
- If none of these give a clear problem statement, ask the user directly what the issue/task was. Don't guess or invent one.

## 4. Gather "Changed"

- Summarize the diff (`git diff <base>...HEAD`) at the level of what changed and why, organized by the change's actual shape ("fixed the race in X by doing Y"), not a file-by-file listing of every line touched.
- Call out anything non-obvious: behavior changes, new invariants, things intentionally left out of scope.

## 5. Write recap.md

Write to `recap.md` in the repo root with exactly three sections:

```markdown
# Recap: <one-line description of the change>

## Before
...

## Issue
...

## Changed
...
```

- Overwrite any existing `recap.md` — it documents the current branch's current state, not a running log.
- Add a `.gitignore` entry for `recap.md` if the repo doesn't already ignore it (same convention as `.mr-review-summary.md` in the `edalab-resolve-mr-review` skill). Never `git add` it automatically. Tell the user it's untracked by default and they can commit it, paste it into the PR description, or delete it.
- Print the recap to the terminal too — don't just write the file silently.

## Notes

- Deliberately lightweight: three sections, no decision ledger, no cross-model review. If the user wants a rigorous safety argument for one specific change instead of a change summary, that's `blast-radius`, not this.
- Keep the prose direct — no meta-commentary about what you're about to do, no hedging language.

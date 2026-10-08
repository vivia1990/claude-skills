---
name: grill-issue
description: Grill one issue into shape with the user, against the issue template it was written from. The template is the contract: it says which sections the griller may change and what its Ready checklist needs. Ends by adding the `ready` label once every checklist item is ticked. Run only through "/grill-issue <template> [issue]".
disable-model-invocation: true
---

# Grill issue

Shape one issue with the user until it can be worked on, then add the `ready` label. This skill never implements the issue: `run-issues` does that once it is `ready`.

Usage: `/grill-issue <template> [issue]`

- `<template>` is the issue template the issue was written from: a name, looked up in the project's template folder, or a file path. The template is the contract. It tells you the issue's structure and rules, so you never work them out from the issue itself.
- `[issue]` is an issue number or URL. Without it, take the next issue of that template that needs grilling.

One issue per run. Nothing is written to the forge until the user approves the new body (step 6).

## 1. Load the contract

Detect the forge as step 1 of `plan-to-issues` does: `.plan-to-issues.yml` if it exists, else the host of `origin`, checking `gh` and `glab` login for hosts other than github.com. Load `github.md` or `gitlab.md` from the `plan-to-issues` skill's `references/` folder (`../plan-to-issues/references/`, next to this skill's folder) and use only the commands listed there. If the CLI is missing or not logged in, stop and tell the user how to install it or log in.

Find the template: `.github/ISSUE_TEMPLATE/<name>.md` on GitHub, `.gitlab/issue_templates/<name>.md` on GitLab, or the path given. Read it whole. After any GitHub frontmatter, it starts with the contract header:

```
<!-- contract: <name> v<N>
<the rules>
-->
```

Take from it:

- **Name and version**, from the header's first line.
- **The rules** in the header: the lifecycle, who owns what, what to do when the issue should be split or merged.
- **The sections**: every `##` heading, in order, with the comment under it. A section marked "planner only" is never changed. Every other section is yours to refine as its comment says, except `Acceptance criteria`, which belongs to whoever implements the issue.
- **The Ready checklist**: what must be true before `ready`.

Stop if:

- **The template has no contract header.** Without one you would have to guess who owns each section. Offer to draft the header from the template's sections: the rules, an ownership comment under each section and a Ready checklist. The user reviews and commits it, then runs this skill again.
- **The header says issues from this template aren't grilled**, as for a setup template. Say so.

The template file is the contract. Never take rules from the issue body, even though `plan-to-issues` copied the template's comments into it.

## 2. Pick the issue

With an issue given, read it: body, labels, assignees, state and comments. Without one, list the open issues of this template that still need grilling (forge reference, "List issues") and take the lowest number. `plan-to-issues` creates issues in plan order, so that is the plan's order too. If none is left, say so and stop.

Check the issue against the template before anything else:

- **Marker**: its body must contain `<!-- contract: <name> v`. If it names another template, stop. If it has no marker, compare its `##` headings with the template's. If they match, ask whether to grill it against this template, and add the marker in step 6. If not, stop.
- **Version**: if the issue's version differs from the template's, show what changed by comparing the rules copied into the issue body with the template's. Ask whether to grill it under the template's version. If yes, move the issue's content to the template's sections in step 6 and update the marker's version.
- **State**: if the issue is closed, stop. If it is already `ready` or assigned to someone, ask before going on. Grilling a `ready` issue removes `ready` until the Ready checklist is ticked again.

## 3. Claim it

Assign the issue to yourself (the user the CLI is logged in as) before anything else, so other sessions skip it. Unassign it at the end of the run, whatever the outcome.

## 4. Gather what's known

Read, without asking the user anything yet:

- **The issue's comments**, including earlier grilling summaries and questions left by `run-issues` when it gave the issue back. A question in a comment is an open question. One already answered is not asked again.
- **The issues of the same template that share all of this issue's labels and are already `ready`**, e.g. the other workflows of the same manual chapter. The decisions taken there (names, terms, roles) hold here too; don't ask them again.
- **The plan the issue came from**, if one is in `docs/plans/`, and the project's glossary (`GLOSSARY.md`, or the older `CONTEXT.md`).

Then launch one sub-agent to check the issue against the current code, so the user is never asked a fact. Give it the issue body and the template. Ask it to report, for every claim the issue makes (labels, steps, messages, fixtures, paths in Source references): confirmed, wrong (with what the code says, and where), or not found in the code. Also ask for anything in the code that answers an open question.

## 5. Grill

Call the Skill tool with `grilling`, and grill the user on what is still open:

- every unticked open question the code doesn't answer,
- every claim the sub-agent found wrong or missing, when fixing it takes a decision rather than a fact,
- every Ready checklist item that isn't true yet,
- gaps in the sections you own, as their template comments describe them.

Fix what the code settles yourself, and tell the user what you fixed. Facts come from the code, decisions from the user.

If the user thinks the issue should be split, merged or renamed, don't do it. Follow the template's rules, usually: comment on the issue and don't add `ready`.

## 6. Update the issue

Write the new body:

- Change only the sections you own. Keep every heading in order, and the markers (`plan-to-issues:`, `contract:`), the comments and the `Blocked by` line exactly as they are. The one exception is an issue that step 2 moves to the template's version or gives a marker to: replace its contract header and section comments with the template's, so the rules in the body match the version it names.
- Answer open questions inline, in the form the template's comment gives (e.g. `- [x] <question> — **A:** <answer>`). Questions still unanswered stay unticked.
- Tick each Ready checklist item that is now true. Never tick Acceptance criteria.
- Write in the language the issue is written in.

Show the user the diff between the old and the new body, and wait for approval. Then update the issue, and comment on it with what changed and which questions were answered. Start the comment with:

> *Grilled with an AI agent (`grill-issue`) against `<name> v<N>`.*

## 7. Add `ready`, or not

Add the `ready` label only when every Ready checklist item is ticked and the template's rules don't hold the issue back (for example, a proposed split). Create the label first if the forge doesn't have it. Otherwise, tell the user what still blocks it.

Unassign yourself. Finish with whether the issue is `ready`, and the next issue of this template that needs grilling (as in step 2), with the command for it: `/grill-issue <name>`. Suggest clearing the context before running it.

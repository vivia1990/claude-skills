---
name: issue-contract
description: Keep a project's issue contracts, the versioned files in .issue-contracts/<name>/v<N>.md that every issue names in its marker. Shows which versions open issues use, adds a new version, prunes unused ones, and moves a project off the old issue templates once. Its references/spec.md is the contract that plan-to-issues, the kickoffs, verify-customer-requests, grill-issue and run-issues follow. Run only through "/issue-contract <status|new|prune|migrate>".
disable-model-invocation: true
---

# Issue contract

Keep a project's issue contracts. Read `references/spec.md` first: it defines the layout, the file format and the rules this skill keeps.

Usage:

- `/issue-contract status`
- `/issue-contract new <name> [--from-default]`
- `/issue-contract prune [<name>]`
- `/issue-contract migrate`

Run from the project's repo root. Nothing is committed until the user approves it, and nothing is pushed without asking.

## Setup

Detect the forge as step 1 of `plan-to-issues` does: `.plan-to-issues.yml` if it exists, else the host of `origin`, checking `gh` and `glab` login for hosts other than github.com. Load `github.md` or `gitlab.md` from the `plan-to-issues` skill's `references/` folder (`../plan-to-issues/references/`, next to this skill's folder) and use only the commands listed there. If the CLI is missing or not logged in, stop and tell the user how to install it or log in.

Find the default branch and read published files as the spec's "Reading a contract" says.

## status

For each contract in `.issue-contracts/` on the default branch, show:

- **Versions**, flagging any whose line 1 doesn't match its path.
- **Edited after publishing**: versions for which `git log --first-parent --format=%h origin/<default> -- <file>` lists more than one commit.
- **Open issues per version** (forge reference, "Open issues with their contract"), and the versions no open issue uses.
- **Newer default**: the `from:` line names a skill whose `../<skill>/templates/<name>.md` now has a higher version.

Then list:

- versions in the working tree or in local commits that aren't published yet,
- open issues whose marker names a version the project doesn't have,
- open issues without a marker whose `##` headings match a contract's, with `/grill-issue <N>` for each one that isn't `ready`,
- the old layout, if `.github/ISSUE_TEMPLATE/` or `.gitlab/issue_templates/` still has a template whose body starts with `<!-- contract:`: suggest `/issue-contract migrate`.

## new

`/issue-contract new <name> [--from-default]` adds the next version of a contract.

1. **Start from**:
   - the newest version, by default;
   - with `--from-default`, the skill default named by the newest version's `from:` line. Show the diff between the project's newest version and that default, so the maintainer can carry the project's own changes over while editing;
   - if the project has no `<name>` yet: the skill default that ships it (`../<skill>/templates/<name>.md`), or else a minimal contract in the spec's format, with the marker, a rules comment with Purpose and Lifecycle, one section, a Ready checklist and Acceptance criteria.
2. **Write** `.issue-contracts/<name>/v<N+1>.md` (`v1.md` for a new contract), with line 1 renumbered. The `from:` line is kept from the newest version, set to the default with `--from-default` or when starting from a default, and left out for a contract written from scratch.
3. **Edit**: show the new file and the diff against the version it started from. The maintainer edits it with you until it's right.
4. **Commit** only that file, with the message `<name> v<N+1> (from v<N>)`, after approval. Then publish it as the spec says: ask before pushing to the default branch; on any other branch, it counts once merged.

Issues already open keep their version. `/grill-issue` offers to move an issue that isn't `ready` to the new one.

## prune

`/issue-contract prune [<name>]` deletes the versions of one contract, or of all of them, that no open issue names and that aren't the newest. List them with the open issues checked (forge reference, "Open issues with their contract"), delete the ones the maintainer approves, and commit.

## migrate

`/issue-contract migrate` moves a project from the old layout, once. Plan every change, show it, and make it one commit after approval.

1. **Templates with a contract header**: every `.md` in `.github/ISSUE_TEMPLATE/` or `.gitlab/issue_templates/` whose body, after any GitHub frontmatter, starts with `<!-- contract: <name> v<N>`.
   - `git mv` it to `.issue-contracts/<name>/v<N>.md`.
   - Rewrite it in the spec's format without changing what it means: the marker alone on line 1; a `from:` line if a skill's `templates/<name>.md` ships the name (`<!-- from: <skill> <name> v1 -->`); the header's text sorted into the fields; section owners in the spec's words (`planner only` becomes `opener only`); the frontmatter's `labels:` into the Labels field, as labels the opener applies; the rest of the frontmatter dropped.
   - **Older versions**: if open issues name an older version of it, find that version in the old file's history (`git log --format=%h -- <old path>`, then `git show <sha>:<old path>`) and add it as `v<K>.md` the same way. If a version can't be found, list its issues: they need `/grill-issue <N>` to move to the newest version.
2. **Customer requests**: `verify-customer-requests` used to write issues without a marker. If `.github/ISSUE_TEMPLATE/customer-request.md` exists without a contract header, or open issues have all four of `## Request`, `## Change needed`, `## Questions for you` and `## Questions for the customer`, seed `customer-request` v1 from `../verify-customer-requests/templates/customer-request.md`. If the project had its own `customer-request.md`, carry its added or reworded sections into v1, show the difference, then `git rm` it.
3. **Configuration**: list the `templates:` or `contracts:` entries in `.plan-to-issues.yml` that name something that isn't a contract now. Each needs `/issue-contract new <name>` before `plan-to-issues` can use it.
4. **Commit** the move after approval, and publish it as the spec says.

Finish with a report:

- the contracts and versions now in `.issue-contracts/`, and that the forge's issue template chooser no longer offers the moved templates;
- the open issues per version (forge reference, "Open issues with their contract");
- each open issue without a marker that matches `customer-request` and isn't `ready`, with `/grill-issue <N>`: the griller adds its marker when it grills it;
- the unmarked ones that are `ready`: they stay as they are, and `run-issues` works them with their body as the brief;
- anything from steps 1 or 3 that still needs the maintainer.

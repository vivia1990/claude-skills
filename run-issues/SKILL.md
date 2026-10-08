---
name: run-issues
description: Implement the `ready` issues of a milestone, one PR per issue. Builds the dependency graph, runs one sub-agent per issue that can start, in parallel and each in its own git worktree, against the contract in its issue template, and works straight chains of dependent issues on stacked branches. Never merges. Run only through "/run-issues <milestone> [--template <name>] [--max <N>]".
disable-model-invocation: true
---

# Run issues

Implement every issue of a milestone that is `ready` and can start, one PR per issue. People review and merge the PRs: this skill never merges anything. Run it again after merging, to pick up the issues those merges unblocked.

Usage: `/run-issues <milestone> [--template <name>] [--max <N>]`

- `<milestone>` is the milestone's title.
- `--template <name>` works only on issues of that template.
- `--max <N>` runs at most N sub-agents at once. The default is 4.

You orchestrate and sub-agents implement. Keep your own context for the graph, the plan and the reports.

## 1. Prepare

Detect the forge as step 1 of `plan-to-issues` does: `.plan-to-issues.yml` if it exists, else the host of `origin`, checking `gh` and `glab` login for hosts other than github.com. Load `github.md` or `gitlab.md` from the `plan-to-issues` skill's `references/` folder (`../plan-to-issues/references/`, next to this skill's folder) and use only the commands listed there. If the CLI is missing or not logged in, stop and tell the user how to install it or log in.

Run `git fetch origin` and `git remote set-head origin --auto`. The default branch is `git symbolic-ref --short refs/remotes/origin/HEAD` without its `origin/` prefix. Branches start from `origin/<default>`, never from the local checkout; PRs into it target `<default>`.

## 2. Build the graph

List every issue in the milestone, open and closed (forge reference, "List issues"). For each one, find:

- **Its template**: the name in its `<!-- contract: <name> vN` marker. Load that template from the project's template folder (`.github/ISSUE_TEMPLATE/` or `.gitlab/issue_templates/`). Its rules and Acceptance criteria say what done means for the issue. An issue without a marker has no contract: its body alone is the brief.
- **Its blockers**: the forge's native blocking links (forge reference, "Blocking links") and the issues in its `**Blocked by:**` line, taken together.
- **Whether it's done**: closed means done.
- **Whether it's in review**: an open pull request from a branch named `issue/<N>-...` (forge reference, "Pull requests", list).

Stop and report if the blockers form a cycle.

An issue **can start** when it is open, has the `ready` label, nobody is assigned, it isn't in review, every blocker is closed, and it matches `--template` if one was given. Don't start, and list in the report:

- issues in review, with their PR,
- issues that are assigned but not in review: someone may be working on them, or a PR was closed without merging. Unassigning one lets the next run start it.
- issues whose marker version differs from their template's. If the template's issues are grilled, they need `/grill-issue <name> <N>` under the new version first. If not (a setup template), show what changed in the rules and ask whether to work the issue under the new version; if yes, replace the contract header and comments in its body with the template's and let it start.
- issues whose template file is missing from the project.

## 3. Plan the run

Group the work into **chains**, one sub-agent per chain:

- Every issue that can start begins a chain.
- An issue that would start but for one open blocker joins the end of a chain when that blocker is the chain's last issue. It is worked right after its blocker, on a branch made from the blocker's branch, and its PR targets that branch.
- When more than one issue could join after the same blocker, none joins. They wait for the blocker to be merged, then run in parallel on a later run.

Name each branch `issue/<N>-<short-slug-of-the-title>`. A chain's first branch starts from the default branch.

Show the plan: one row per chain with its issues in order (number and title), their template, and each branch with its base. Then list the issues that won't start and why: not `ready`, blocked by open issues, or skipped in step 2. Wait for the user's approval: the run pushes branches and opens PRs.

## 4. Run

Assign every issue in the plan to yourself before launching anything, so other sessions skip them.

Launch one sub-agent per chain, at most `--max` at once, each in its own git worktree, in the background if your agent can. Start the next chain whenever one finishes. If your agent can't run sub-agents in parallel, work the chains one after another.

Give each sub-agent pointers, not copies: the issue numbers in chain order, each issue's template path, the forge reference path, and the branch names with their bases. Tell it to do, for each issue of its chain, in order:

1. Create the issue's branch from its base, in its worktree.
2. Read the issue (body and comments) and its template. The issue body is the brief; the template's rules and Acceptance criteria say what done means. Follow any guide they point to, such as `docs/manual/STYLE.md`.
3. Implement it, changing only what the issue and its template allow. For code, call the Skill tool with `tdd` if it is available.
4. Run the checks the project's CI runs (build, tests, lint) until they pass.
5. Call the Skill tool with `code-review` against the branch's base, if it is available; otherwise review the diff against the Acceptance criteria. Fix the findings that fall within this issue.
6. Commit, push, and open a draft PR into the base (forge reference, "Pull requests"), titled like the issue, with a summary of what changed, how it was checked, and `Closes #N`.
7. In the issue body, tick the items the template says the implementer ticks (test cases, screenshots, ...) and the Acceptance criteria now met. Leave the ones only a merge can meet, such as "PR merged with CI green".
8. Mark the PR ready, and report it with each Acceptance criterion met or not.

The issue stays assigned while its PR is open, so the next run doesn't start it again. Merging the PR closes it.

When something goes wrong, the sub-agent stops that issue and the rest of its chain, which builds on it:

- **The issue is unclear**, contradicts the code, or needs a decision only a person can take: comment on the issue with the question, remove `ready` so it goes back to `grill-issue`, and unassign it. No PR.
- **A technical failure**, such as checks that stay red: push what it has, keep the PR as a draft with a comment saying what fails, and keep `ready` and the assignment. A person picks it up from the draft PR.

Either way, it unassigns the issues after it in the chain, which it never started, so a later run can start them.

Every comment the run posts starts with:

> *Written by an AI agent (`run-issues`).*

## 5. Report

When every chain is done, remove the worktrees (the branches stay pushed) and show a table: issue, PR, status. The status is one of: ready for review, draft (with what fails), given back (with the question), or not started (an earlier issue of its chain failed). Then list:

- **What still waits, and on what**: issues missing `ready` (run `/grill-issue <template>`), and issues blocked by issues whose PRs are open (merge those, then run this skill again).
- **How to merge stacked PRs**: in chain order, deleting each branch on merge, so the next PR moves onto the default branch. GitHub retargets it when its base branch is deleted; GitLab does when the source branch is removed on merge, which the forge reference sets.

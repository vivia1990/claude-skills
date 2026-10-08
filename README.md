# claude-skills

Personal Agent Skills ([agentskills.io](https://agentskills.io) format). This repo is the single source of truth; `scripts/link-skills.js` symlinks each skill directory into one or more coding agents' personal skills directories, so editing a skill here and `git pull`-ing updates every agent at once.

## Skills

- `recap` - write a before/issue/changed summary for a branch's changes
- `verify-findings` - verify pasted review findings against the codebase without editing code
- `architect` - sketch a design before implementing, with parallel candidate exploration
- `blast-radius` - prove a change is safe before merging, not just assert it
- `log-dig` - investigate a question against runtime/hardware log files without blowing out context
- `plan-to-issues` - split a plan into a milestone and issues from the project's editable templates, and open them on GitHub (`gh`) or GitLab (`glab`)
- `e2e-kickoff` - find a project's user workflows in the source code and plan one e2e-test issue per workflow, then hand the plan to `plan-to-issues`
- `manual-kickoff` - plan a user manual (Markdown → pandoc → PDF): find a project's roles, sections and user workflows in the source code, plan one documentation issue per workflow whose template is the contract for `grill-issue` (adds `ready`) and `run-issues`, then hand the plan to `plan-to-issues`. Runs only through `/manual-kickoff`
- `grill-issue` - grill one issue into shape with the user against the issue template it was written from (the contract), then add the `ready` label. Runs only through `/grill-issue <template> [issue]`
- `run-issues` - implement a milestone's `ready` issues: one sub-agent per issue that can start, in parallel worktrees, straight chains on stacked branches, one PR per issue; never merges. Runs only through `/run-issues <milestone>`
- `continual-learning` - automatically keeps `~/.claude/CLAUDE.md` current from session transcripts (needs its Stop hook wired in manually - see `continual-learning/HOOK_SETUP.md`)
- `verify-customer-requests` - turn customer notes (email, chat, call notes) into one verified, labelled GitHub issue per request, checked against past issues for duplicates and contradicted decisions
- `plan-issue` - grill on one GitHub issue and write its fix plan into it; on customer-request issues, also settles their questions and labels (shares `verify-customer-requests/references/issue-contract.md`)

## Installing (linking into your coding agents)

```
node scripts/link-skills.js                    # links the default agents (see agents.json)
node scripts/link-skills.js --agents=claude,codex
node scripts/link-skills.js --list-agents       # show every known agent + its skills directory
node scripts/link-skills.js --dry-run           # preview without changing anything
```

If a target agent already has a real directory (not a symlink) at `<agent-dir>/<skill-name>`, the script rescues any files that aren't already in this repo (e.g. a skill's local runtime state) by copying them in here first, then replaces the directory with a symlink.

## Skills that run only when typed

Set `disable-model-invocation: true` in the skill's frontmatter (Claude Code), and add `agents/openai.yaml` with `policy: allow_implicit_invocation: false` next to `SKILL.md` (Codex ignores the frontmatter flag). When one skill hands off to another, it says "call the Skill tool with `<name>`", and the skill it calls must be one the model can start.

## Adding support for a new coding agent

Add one entry to `agents.json`'s `agents` map - `"<name>": "<personal skills directory>"` - no script changes needed. Most agents implementing the Agent Skills standard expose a personal/global skills directory under their own config dir (e.g. `~/.codex/skills`, `~/.copilot/skills`, `~/.cursor/skills`); some also scan the shared `~/.agents/skills` directly.

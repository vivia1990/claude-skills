# claude-skills

Personal Agent Skills ([agentskills.io](https://agentskills.io) format). This repo is the single source of truth; `scripts/link-skills.js` symlinks each skill directory into one or more coding agents' personal skills directories, so editing a skill here and `git pull`-ing updates every agent at once.

## Skills

- `recap` - write a before/issue/changed summary for a branch's changes
- `verify-findings` - verify pasted review findings against the codebase without editing code
- `architect` - sketch a design before implementing, with parallel candidate exploration
- `blast-radius` - prove a change is safe before merging, not just assert it
- `log-dig` - investigate a question against runtime/hardware log files without blowing out context
- `continual-learning` - automatically keeps `~/.claude/CLAUDE.md` current from session transcripts (needs its Stop hook wired in manually - see `continual-learning/HOOK_SETUP.md`)

## Installing (linking into your coding agents)

```
node scripts/link-skills.js                    # links the default agents (see agents.json)
node scripts/link-skills.js --agents=claude,codex
node scripts/link-skills.js --list-agents       # show every known agent + its skills directory
node scripts/link-skills.js --dry-run           # preview without changing anything
```

If a target agent already has a real directory (not a symlink) at `<agent-dir>/<skill-name>`, the script rescues any files that aren't already in this repo (e.g. a skill's local runtime state) by copying them in here first, then replaces the directory with a symlink.

## Adding support for a new coding agent

Add one entry to `agents.json`'s `agents` map - `"<name>": "<personal skills directory>"` - no script changes needed. Most agents implementing the Agent Skills standard expose a personal/global skills directory under their own config dir (e.g. `~/.codex/skills`, `~/.copilot/skills`, `~/.cursor/skills`); some also scan the shared `~/.agents/skills` directly.

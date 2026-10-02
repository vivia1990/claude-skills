# Activating continual-learning

This skill is inert until its Stop hook is wired into `~/.claude/settings.json`. The skill and hook script are already built and tested; only the config wiring is left, and that's deliberately left to you (or the `update-config` skill) rather than done automatically, since it's a global file.

Add this to the top-level `"hooks"` key in `~/.claude/settings.json` (create the key if it doesn't exist yet):

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/skills/continual-learning/scripts/stop-cadence-check.sh"
          }
        ]
      }
    ]
  }
}
```

If `~/.claude/settings.json` already has other `Stop` hooks or other event keys, merge this in rather than replacing the file — append to the existing `"Stop"` array, or run the `update-config` skill and tell it to add this hook.

## Cadence

Defaults (override via env vars in your shell profile if needed): fires at most once every 10 completed turns and 120 minutes, and only if the relevant transcript actually changed since the last run.

- `CONTINUAL_LEARNING_MIN_TURNS` (default 10)
- `CONTINUAL_LEARNING_MIN_MINUTES` (default 120)

## Disabling

Remove the `Stop` hook entry above from `settings.json`. The skill directory can stay in place inert — nothing else references it.

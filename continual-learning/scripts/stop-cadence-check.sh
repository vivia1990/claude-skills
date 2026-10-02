#!/bin/bash
# Cadence gate for the continual-learning Stop hook.
# Reads Stop-hook JSON on stdin, decides whether enough has happened since the
# last run to justify mining transcripts, and if so blocks stopping with a
# follow-up instruction telling Claude to run the continual-learning skill.
set -euo pipefail

STATE_DIR="$HOME/.claude/skills/continual-learning/state"
STATE_PATH="$STATE_DIR/continual-learning.json"
INDEX_PATH="$STATE_DIR/continual-learning-index.json"
mkdir -p "$STATE_DIR"

MIN_TURNS="${CONTINUAL_LEARNING_MIN_TURNS:-10}"
MIN_MINUTES="${CONTINUAL_LEARNING_MIN_MINUTES:-120}"

input="$(cat)"
transcript_path="$(jq -r '.transcript_path // empty' <<<"$input")"
stop_reason="$(jq -r '.stop_reason // empty' <<<"$input")"

if [[ ! -f "$STATE_PATH" ]]; then
  echo '{"lastRunAtSec":0,"turnsSinceLastRun":0,"lastTranscriptMtimeSec":0}' >"$STATE_PATH"
fi
state="$(cat "$STATE_PATH")"

# Only count genuine turn completions, not a re-entrant Stop caused by this
# hook's own block on the previous turn.
counted_turn=0
if [[ "$stop_reason" == "end_turn" ]]; then
  counted_turn=1
fi

turns_since="$(jq -r '.turnsSinceLastRun // 0' <<<"$state")"
if [[ "$counted_turn" == "1" ]]; then
  turns_since=$((turns_since + 1))
fi

last_run_sec="$(jq -r '.lastRunAtSec // 0' <<<"$state")"
last_transcript_mtime_sec="$(jq -r '.lastTranscriptMtimeSec // 0' <<<"$state")"
now_sec="$(date +%s)"

transcript_mtime_sec=0
transcript_advanced=0
if [[ -n "$transcript_path" && -f "$transcript_path" ]]; then
  transcript_mtime_sec="$(stat -c %Y "$transcript_path" 2>/dev/null || stat -f %m "$transcript_path")"
  if (( transcript_mtime_sec > last_transcript_mtime_sec )); then
    transcript_advanced=1
  fi
fi

minutes_since_last_run=999999
if (( last_run_sec > 0 )); then
  minutes_since_last_run=$(( (now_sec - last_run_sec) / 60 ))
fi

should_trigger=0
if [[ "$counted_turn" == "1" ]] \
  && (( turns_since >= MIN_TURNS )) \
  && (( minutes_since_last_run >= MIN_MINUTES )) \
  && (( transcript_advanced == 1 )); then
  should_trigger=1
fi

if [[ "$should_trigger" == "1" ]]; then
  jq -n --argjson now "$now_sec" --argjson mtime "$transcript_mtime_sec" \
    '{lastRunAtSec: $now, turnsSinceLastRun: 0, lastTranscriptMtimeSec: $mtime}' \
    >"$STATE_PATH"

  reason="Run the continual-learning skill now. Mine session transcripts under ~/.claude/projects/*/*.jsonl that are new or changed since the index at $INDEX_PATH, extract only high-signal recurring user preferences and durable workspace facts, and update ~/.claude/CLAUDE.md in place (never a full rewrite). Exclude one-off/transient details and secrets. Refresh the index when done. If nothing meaningful is found, just say so and stop."

  jq -n --arg reason "$reason" \
    '{hookSpecificOutput: {hookEventName: "Stop", decision: "block", reason: $reason}}'
else
  jq -n --argjson turns "$turns_since" --argjson mtime "$transcript_mtime_sec" --argjson lastrun "$last_run_sec" \
    '{turnsSinceLastRun: $turns, lastTranscriptMtimeSec: $mtime, lastRunAtSec: $lastrun}' \
    >"$STATE_PATH"
  exit 0
fi

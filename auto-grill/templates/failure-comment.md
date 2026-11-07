<!--
The failure comment, in two forms. The run posts either one as it is, with auto-grill-failed.
It is only for an issue where nothing was written: a question left for a person doesn't fail an issue, and is listed in the decision log instead (templates/decision-log.md).

Every {placeholder} names the ledger field it comes from. Leave out a line whose field is empty.
Write it in the contract's Writing language, else the issue's. The italic lines and the field names may stay in English.
Keep it under 60,000 characters: shorten the Why parts first.
-->

## Rendered

The answerer renders this into comment.md, next to the ledger, from the ledger and the files next to it only, for `contract` and `no-convergence`.

```markdown
> *Written by an AI agent (`auto-grill`, run {header: run id}) against `{name} v{N}`. Auto-grilling stopped before writing anything: this issue needs a person. The body is unchanged. Run `/grill-issue {N}`.*

**Why:** {one of:
- contract: "{fail: Reason}"
- no-convergence: "{fail: Reason}. The questions below were asked in {number of ask rounds} rounds."}

### Questions asked

None of these is decided: auto-grilling answered or proposed an answer for each, but nothing was written, and `/grill-issue` asks them again.

- [ ] **Q{j} · {title}** Proposed: {Answer, without the (auto-grill) tag}. ({kind}; evidence: {Evidence}; {Why})
- [ ] **Q{j} · {title}** Open, for a person ({person reason}). Proposed: {Proposed}.
- [ ] **Q{j} · {title}** Open, for {who}.
- [ ] **Q{j} · {title}** Not answered.

**Found in the code:** {every round's "Fixed from the code" lines} | none
**Contract:** {stayed on v{N}: v{M} lacks {sections} | adoption proposed as {name} v{N}} (only when a step-1 offer came up)

### Draft message for {who}

{only when an outsider question came up: its Message lines, numbered}
```

The questions keep the order they were asked in. "Not answered" is for the questions of the round the cap stopped.

## Fixed

The run fills this in itself, for `review:max`, `crash`, `write`, or when comment.md is missing.

```markdown
> *Written by an AI agent (`auto-grill`, run {run id}) against `{name} v{N}`. Auto-grilling stopped: this issue needs a person. Run `/grill-issue {N}`.*

**Why:** {one of:
- review:max: "The issue has `review:max`, which only a person sets: it is grilled by hand."
- crash: "The {griller|answerer} stopped working twice, so no question was settled."
- write: "Writing the grilled body failed: {what}."}

**Body:** {one of:
- "Unchanged."
- "May be partly written: compare it with its previous version in the issue's history before grilling again."}
```

## Body changed during the run

When the body's hash at the end isn't the one at pick, the run adds this line right after the first line of either form:

```markdown
**Note:** someone edited the body during this run, so these questions and proposals were made against its earlier version.
```

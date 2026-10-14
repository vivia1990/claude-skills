# Exploration report

The report every steward fills, as written. Same shape for every option of a step, so the reports can be compared side by side instead of judged on how well each is written.

Fill every section. `Evidence against this option` is mandatory and is never left empty.

---

## `<option name>`

**Question:** `<the step's question>`
**Option I steward:** `<the one option assigned to me>`
**Evidence rung:** `1` searched the web | `2` read the links supplied | `3` no network: codebase and model knowledge only

### What this option is

Two or three sentences. What we would actually do, in plain terms.

### How it would work

Concretely: the moving parts, where they live, what changes. Name real files, real APIs, real versions. "We would add a caching layer" is not an answer; "a `cache` table read in `api/handlers.py:88` before the upstream call" is.

### Evidence for

One bullet per claim, each with its source: a URL, a `file:line`, or `model knowledge (unverified)`. A claim with no source is marked `(unverified)` - never dropped and never dressed up.

### Evidence against this option

**Mandatory. Never empty.** What you found that counts against the option you were given. You steward this option, you do not advocate for it: a report that hides what is wrong with its own option is worse than no report, because it is used to make a decision.

If you genuinely found nothing against it, write down *what you looked for and where*, so the gap is visible rather than implied.

### Cost and risk

Effort, new dependencies, what it makes harder later, and how reversible it is if it turns out wrong.

### What would have to be true

The conditions under which this is the right call, stated so they can be checked. This is the section that most often changes the reader's mind, because it turns a verdict back into an assumption they can go and test.

### Confidence

`high` | `medium` | `low`, then: what you could not verify, and what would settle it.

---
name: log-dig
description: Investigate a specific question against one or more runtime/hardware log files (serial protocol dumps, GDB crash traces, application logs) by delegating raw log-reading to subagents so large logs never bloat the main conversation's context. Use when the user points at log file(s) and asks what happened, why something failed/timed out, whether anything looks wrong, or whether behavior changed between runs — not for CI/build logs or AI session transcripts.
---

Answer a specific question about what happened, using log files as evidence, without ever loading a full large log into your own active context.

## 1. Understand the question

Before touching any file, get a clear, checkable question: what are we actually trying to find out? ("why did the join time out", "is there anything abnormal in here", "did behavior change after disabling flag X"). If the user just says "look at this log" with no question, ask what they want to know rather than starting to grep blind.

Note which log file(s) are involved and roughly how big they are (`wc -l` or file size) before deciding how to approach it.

## 2. Decide delegation strategy

- **Small log(s) + a simple question** (roughly under ~2000 lines, one file): just read it directly in the main conversation. Delegating would be pure overhead.
- **Large log(s), multiple files, or a question spanning more than one source**: delegate. Dispatch one forked/general-purpose subagent per log file (or per natural sub-question), instructed to grep/read only what's relevant to the stated question and report back a compact extract — matching lines plus minimal surrounding context, never the whole file. Nothing outside that extract re-enters your own context.
- **Cross-file correlation** (matching timestamps, device/session/transaction identifiers across logs): dispatch one subagent per file with the *same* correlation key, so each returns only its matching slice. Do the actual correlation yourself in the main thread from the slices — the raw files never need to enter your context at all.

## 3. Investigate

Pick whichever of these fits the stated question — don't ask the user to choose a mode, infer it:

- **Sequence reconstruction**: follow one specific request/response exchange through the log until it resolves or breaks; report where it broke and what should have happened instead.
- **Cross-source correlation**: align multiple logs on a shared key (timestamp window, address, id). If timestamp formats or clocks differ between sources, say so explicitly rather than assuming alignment.
- **Repeat-run diffing**: compare two logs at the same abstraction level (aligned by attempt/step, not raw line number) and report the deltas, not full copies of both runs.
- **Anomaly scan**: grep for severity markers (warning/error/abort/timeout/assert, plus anything the user names) and report each hit with one line of context — don't dump raw grep output uncommented.
- **Protocol/state audit**: enumerate the distinct message/event types actually observed in the log and their apparent semantics, grounded in what the log shows. If the protocol/format hasn't been explained, ask rather than guess at meaning.

## 4. Report

- Default: answer directly in chat — a direct answer to the stated question, the evidence for it (quoted log lines, not paraphrased summaries), and anything else clearly wrong spotted along the way.
- For a large or multi-source investigation, offer to write a durable findings doc instead of a long chat reply — ask before writing one, don't assume.

## Notes

- Complements `diagnosing-bugs`, doesn't replace it: use `diagnosing-bugs` for the hypothesis-driven debugging loop when there's no log yet to point at; use this once there are specific log files and a specific question about what's in them.
- Never load a full large log file into your own context "just in case." Extract only what answers the stated question.

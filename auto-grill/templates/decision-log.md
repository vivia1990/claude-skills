<!--
The comment for an issue that is written: ready, awaiting-reply, or needs-person when questions are left for a person. The answerer renders it into comment.md, next to the ledger, from the ledger and the files next to it only. The griller posts it under grill-issue's header line, as one comment.

Every {placeholder} names the ledger field it comes from. Leave out a line whose field is empty, the "Left for a person" section when no question is left for a person, and the "Message for" section when no outsider question is open.
Write it in the contract's Writing language, else the issue's. The italic line and the field names may stay in English.
Keep the whole comment under 60,000 characters: shorten the <details> blocks first, to the picked sketch's Usage and Types.
-->
> *Auto-grilled (`auto-grill`, run {header: run id}): no person answered these questions. An AI agent answered each one in the user's place by a fixed procedure, and the body tags those answers `(auto-grill)`. A decision binds the implementer; a sketch is only guidance.*

{needs-person only:}
> *Some questions need a person: they are under "Left for a person" below, unticked in the body. Run `/grill-issue {N}`: it asks only those, and you can change any answer above while you are at it.*

**Changed:** {approve?: one line per section the diff changes}
**Labels:** {approve?: Labels}, then `auto-grilled`{needs-person: and `auto-grill-failed`}
**Review:** `review:xhigh`, {approve?: its reason}; questions in a `review:xhigh` area: {each Q marked review:xhigh, with its area} | no review label
**Contract:** kept {name} v{N} | moved {name} v{N} → v{M} | stayed on v{N}: v{M} lacks {sections} | adopted as {name} v{N}

| Q | Question | Kind | Answer |
|---|---|---|---|
| Q{j} | {ask: title} | {answers: kind}{ · review:xhigh} | {answers: Answer} |

**Settled from the code:** {every round's "Fixed from the code" lines} | none
**Docs to check:** {every Citation: wrong line, as "{Q}: {what the rule cites} → {what the code or docs say}"}
**Implementation notes:** {only when the contract has no Implementation notes section: every Implementation note line}

### Left for a person

{needs-person only. None of these is decided; the proposals are auto-grilling's, and no person approved them. A question a proposal rests on comes first.}

- [ ] **Q{j} · {title}** ({person reason}) Proposed: {Proposed}. Evidence: {Evidence}. {Why}
- [ ] **{Not asked: title}** Not asked: it waits on Q{a}. {its question}

For a `no pick`, follow its line with `<details><summary>Why Q{j} has no pick</summary>` holding each attempt's two candidates, two lines each, and why neither was picked.

### Q{j} · {title}

One block per question that is settled and isn't a fact or a step-1 offer.

- **Kind:** {kind}{, review:xhigh ({area})}
- **Answer:** {Answer}
- **Implementation note:** {Implementation note} | none
- **Why:** {Why}
- **Evidence:** {Evidence}
- **Skeptic:** upheld | challenged, then decided as a design | n/a

<details><summary>How Q{j} was decided</summary>

Only for a design question.

**Picked: candidate {x|y}, {philosophy}.** {the sketch's Usage and Types}

**Other: candidate {y|x}, {philosophy}.** {three lines: its shape, and why it lost}

**Attempt 1** {only when it took two: both candidates in two lines each, and why there was no pick}

**Judge:** {Design: judge, as a short paragraph}

**Prototype:** {the report's result, and how it was checked} | none
</details>

### Message for {who}

{message.md, ready to paste}

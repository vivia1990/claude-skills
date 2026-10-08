# Customer-request issue contract

Shared by `verify-customer-requests`, which writes these issues, and `plan-issue`, which reads and edits them. Change the format or a label rule here and both skills follow.

## Recognizing one

An issue is a customer-request issue if its body has all four required headings, verbatim:

`## Request` · `## Change needed` · `## Questions for you` · `## Questions for the customer`

A project template (`.github/ISSUE_TEMPLATE/customer-request.md` in the project repo) may add, reorder or reword other sections, but must keep these four headings. `## Fix plan` is reserved for `plan-issue`.

## Writing one

- English throughout. The customer's words stay quoted in their original language.
- Title: `<Area>: <what changes>`, e.g. "Footer: add Instagram link", "Contact form: no error when sending fails".
- Fill every section of the template and drop its `<!-- -->` guidance comments. History and Risk appear only when they have content; delete them otherwise. The two question sections always stay, with "None." when empty.
- **Request**: only this request's words (no greetings, signatures or neighbouring requests), then source (email / call notes / chat) and date, then a one-line English restatement.
- **Current behavior**: what the product does today, in domain terms, with `path:line` pointers as evidence of where things are.
- **Change needed**: the result, in domain terms. What must be true afterwards, not how to get there: "the footer shows an Instagram link next to Facebook, opening the profile in a new tab", not "add an `<a>` in `Footer.tsx`". A change that also needs work in another repo says so in one line here.
- **History**: `Conflicts with [<title>](<url>): "<quote of the earlier decision>"`, `Regression of [<title>](<url>)`, `Related: [<title>](<url>)`.
- **Risk**: the `critical` criterion and one line of evidence.
- **Questions**: checkboxes. *For you*: context only the developer has ("is the old booking page still used?"). *For the customer*: preferences, intent and reproduction details only the customer has ("guests too, or only registered users?").
- **Answering** (done by `plan-issue`): tick the question and write the answer inline, `- [x] Guests too? → Only registered users (customer, call 2026-10-08)`. A decision the developer takes on the customer's behalf ends with `(decided by developer, <date>)`.

## Labels

| Label | Description (used when creating it) | Color |
|---|---|---|
| `bug` | Doesn't do what was asked or intended, including regressions | `d73a4a` |
| `feat` | Something the product doesn't have yet | `a2eeef` |
| `change` | Works as intended, but should work or look differently | `1d76db` |
| `cosmetic` | No logic touched: styling, images, fixed text, translations | `f9d0c4` |
| `frontend` | The change touches the frontend | `c2e0c6` |
| `backend` | The change touches the backend | `d4c5f9` |
| `mobile` | Only shows up on phones and small touch screens | `fef2c0` |
| `desktop` | Only shows up on large screens | `bfdadc` |
| `critical` | Risky: data, money/access logic, shared code or external contracts | `b60205` |
| `awaiting-reply` | Blocked on an answer from the customer | `fbca04` |
| `spec-conflict` | Reverses an earlier decision, quoted in History | `e99695` |

- **Type: exactly one of `bug`, `feat`, `change`.** Deciding test between `bug` and `change`: does the code do what was asked or intended? If yes it's `change`, whatever the customer called it. Every `spec-conflict` issue is a `change`. `refactor` belongs to the developer; neither skill ever applies it.
- **`cosmetic`**: no logic touched. Styling, layout, images, icons, and fixed text in the code, including translation files. Text that comes from a CMS or database isn't a code change at all. Combines with any type; add `frontend` too when that pair is in play.
- **Pairs are used only when the repo has both sides.** A static site has no backend; a phone-only app has no desktop. A label on every issue says nothing.
  - `frontend` / `backend`: the sides the change touches; both allowed.
  - `mobile` / `desktop`: a restriction, where the problem or change shows up. Everywhere → neither. Never both.
- **`critical`**: the change would touch any of:
  1. **Data**: database schema, the shape of saved data, or existing data that must be migrated or fixed.
  2. **Money or access logic**: payments, orders, price calculation, login, permissions. A price shown as fixed text is `cosmetic`, not this.
  3. **Shared code**: something other pages, screens or features also use, so the change can alter them too (a shared component, a widely used helper, global styles or theme).
  4. **External contracts**: an API other clients call, or an integration (payment provider, email service, external API).

  The Risk section names the criterion with evidence ("`PriceTag` is also used by the cart and the order emails"). Intake estimates; `plan-issue` confirms or removes it once the fix is planned.
- **`awaiting-reply`**: on if and only if at least one question for the customer is open.
- **`spec-conflict`**: the request reverses an earlier decision, quoted in History. A conflict counts only with that quote and its link. The label stays after the customer confirms, as the record that a decision was reversed.
- **`ready`**: owned by `plan-issue`, set when the fix plan is written.

The labels make the issue list a board:

| Labels | Meaning |
|---|---|
| no `awaiting-reply`, no `ready` | needs planning (`/plan-issue`) |
| `awaiting-reply` | waiting on the customer |
| `ready` | planned, can be implemented |

## Creating labels

Create only the missing ones and never modify an existing label; a repo's own `bug` keeps its description.

```
gh label list --limit 200 --json name --jq '.[].name'
gh label create '<name>' --color '<color>' --description '<description>'
```

# GitHub (`gh`)

The forge commands for `plan-to-issues`, `grill-issue` and `run-issues`. Run every command from the repo root. `{owner}/{repo}` in `gh api` paths is filled in by `gh` from the current repo. For GitHub Enterprise, prefix commands with `GH_HOST=<host>`.

## Check login

```
gh auth status --hostname github.com
```

## Milestone

The issue API takes the milestone's `number`.

```
gh api "repos/{owner}/{repo}/milestones?state=all&per_page=100" --paginate \
  --jq ".[] | select(.title==\"$TITLE\") | .number"
gh api "repos/{owner}/{repo}/milestones" -f title="$TITLE" -f due_on=YYYY-MM-DDT00:00:00Z --jq .number
```

`due_on` is optional.

## Labels

```
gh label list --limit 1000 --json name --jq '.[].name'
gh label create "$NAME" --color 428BCA --description "$DESC"
```

## Find issues that already exist

In the milestone, any state. The issues API also returns pull requests, so drop those:

```
gh api "repos/{owner}/{repo}/issues?milestone=$MILESTONE_NUMBER&state=all&per_page=100" --paginate \
  --jq '.[] | select(.pull_request | not) | select((.body // "") | test("<!-- plan-to-issues: "))
        | [(.body | capture("<!-- plan-to-issues: (?<s>\\S+) -->").s), .number, .html_url] | @tsv'
```

Without a milestone: GitHub search doesn't reliably index HTML comments, so list all issues and filter by marker as above (drop the `milestone` parameter). If the repo has too many issues for that, match on exact title instead:

```
gh issue list --state all --search "in:title \"$TITLE\"" --json number,title,url \
  --jq ".[] | select(.title==\"$TITLE\") | [.number, .url] | @tsv"
```

## Create an issue

Use `-f` for strings, `-F ...=@file` for the body, `-F` for the numeric milestone, and one `labels[]` per label:

```
gh api "repos/{owner}/{repo}/issues" \
  -f title="$TITLE" \
  -F body=@"$BODY_FILE" \
  -F milestone=$MILESTONE_NUMBER \
  -f "labels[]=label-a" -f "labels[]=label-b" \
  --jq '[.number, .html_url] | @tsv'
```

## Blocking links

GitHub's issue dependencies, shown in the issue's sidebar. The API takes the blocker's database `id`, not its number:

```
BLOCKER_ID=$(gh api "repos/{owner}/{repo}/issues/$BLOCKER" --jq .id)
gh api --method POST "repos/{owner}/{repo}/issues/$N/dependencies/blocked_by" -F issue_id="$BLOCKER_ID" --silent
```

Read an issue's blockers, open and closed:

```
gh api "repos/{owner}/{repo}/issues/$N/dependencies/blocked_by" --jq '.[] | [.number, .state] | @tsv'
```

If these return 404 (dependencies not available, e.g. an older GitHub Enterprise Server), rely on the `**Blocked by:**` line in the body.

## Who am I

```
gh api user --jq .login
```

## Read an issue

```
gh issue view "$N" --json number,title,body,state,labels,assignees,milestone,comments,url
```

## List issues

Every issue in a milestone, any state:

```
gh issue list --milestone "$TITLE" --state all --limit 1000 \
  --json number,title,state,body,labels,assignees,url
```

The open issues of one template that still need grilling (no `ready`, nobody assigned), lowest number first:

```
gh issue list --state open --limit 1000 --json number,title,body,labels,assignees \
  --jq "[.[] | select(.body | contains(\"<!-- contract: $TEMPLATE v\"))
         | select([.labels[].name] | index(\"ready\") | not)
         | select(.assignees | length == 0)]
        | sort_by(.number) | .[] | [.number, .title] | @tsv"
```

## Update an issue

The label must exist first (see Labels).

```
gh issue edit "$N" --body-file "$BODY_FILE"
gh issue edit "$N" --add-label ready            # --remove-label ready
gh issue edit "$N" --add-assignee @me           # --remove-assignee @me
gh issue comment "$N" --body-file "$COMMENT_FILE"
```

## Pull requests

Open as a draft, mark ready once the checks pass. Put `Closes #N` in the body, so merging into the default branch closes the issue:

```
gh pr create --draft --base "$BASE" --head "$BRANCH" --title "$TITLE" --body-file "$BODY_FILE"
gh pr view "$BRANCH" --json number,url --jq '[.number, .url] | @tsv'
gh pr ready "$PR"
```

The open pull requests, with their branches:

```
gh pr list --state open --limit 1000 --json number,headRefName,isDraft,url \
  --jq '.[] | [.number, .headRefName, .isDraft, .url] | @tsv'
```

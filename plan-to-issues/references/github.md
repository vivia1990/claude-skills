# GitHub (`gh`)

Run every command from the repo root. `{owner}/{repo}` in `gh api` paths is filled in by `gh` from the current repo. For GitHub Enterprise, prefix commands with `GH_HOST=<host>`.

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

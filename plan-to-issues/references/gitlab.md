# GitLab (`glab`)

Run every command from the repo root. `:fullpath` is filled in by `glab` from the current repo's remote. For a self-hosted instance, `glab` picks the host from the remote; add `--hostname <host>` if it doesn't. `glab api` has no `--jq` flag, so pipe its output to `jq`.

URL-encode anything you put in a query string: `jq -rn --arg v "$TEXT" '$v|@uri'`.

## Check login

```
glab auth status --hostname <host>
```

## Milestone

Look it up, including group milestones inherited by the project:

```
glab api "projects/:fullpath/milestones?include_ancestors=true&per_page=100" --paginate \
  | jq -r --arg t "$TITLE" '.[] | select(.title==$t) | .id'
```

Create it (`due_date` is optional):

```
glab api projects/:fullpath/milestones -f title="$TITLE" -f due_date=YYYY-MM-DD | jq .id
```

The issue API takes the milestone's `id` (not `iid`).

## Labels

```
glab api "projects/:fullpath/labels?include_ancestor_groups=true&per_page=100" --paginate | jq -r '.[].name'
glab label create --name "$NAME" --color "#428BCA" --description "$DESC"
```

## Find issues that already exist

In the milestone, any state:

```
glab api "projects/:fullpath/issues?milestone=$(jq -rn --arg v "$TITLE" '$v|@uri')&scope=all&state=all&per_page=100" --paginate \
  | jq -r '.[] | select((.description // "") | test("<!-- plan-to-issues: "))
           | [(.description | capture("<!-- plan-to-issues: (?<s>\\S+) -->").s), .iid, .web_url] | @tsv'
```

Without a milestone, search for one marker:

```
glab api "projects/:fullpath/issues?scope=all&state=all&in=description&search=$(jq -rn --arg v "plan-to-issues: $SLUG" '$v|@uri')" \
  | jq -r '.[] | [.iid, .web_url] | @tsv'
```

Fallback, by exact title: same call with `in=title&search=<title>`, then keep only results whose `.title` equals it exactly.

## Create an issue

Use `-f` for strings (`-F` would turn a numeric-looking title into a number), `-F ...=@file` for the body:

```
glab api projects/:fullpath/issues \
  -f title="$TITLE" \
  -F description=@"$BODY_FILE" \
  -f labels="label-a,label-b" \
  -F milestone_id=$MILESTONE_ID \
  | jq -r '[.iid, .web_url] | @tsv'
```

`.iid` is the `#N` used in references. Don't use `glab issue create` here: it takes the body only as an inline string and its text output is meant for people, not parsing.

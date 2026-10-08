# GitLab (`glab`)

The forge commands for `plan-to-issues`, `grill-issue` and `run-issues`. Run every command from the repo root. `:fullpath` is filled in by `glab` from the current repo's remote. For a self-hosted instance, `glab` picks the host from the remote; add `--hostname <host>` if it doesn't. `glab api` has no `--jq` flag, so pipe its output to `jq`.

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

## Blocking links

GitLab's "blocked by" issue links, shown on the issue page. They need GitLab Premium or Ultimate; on Free the call fails, so rely on the `**Blocked by:**` line in the description.

```
PROJECT_ID=$(glab api projects/:fullpath | jq .id)
glab api "projects/:fullpath/issues/$N/links" \
  -F target_project_id="$PROJECT_ID" -F target_issue_iid="$BLOCKER" -f link_type=is_blocked_by >/dev/null
```

Read an issue's blockers, open and closed:

```
glab api "projects/:fullpath/issues/$N/links" \
  | jq -r '.[] | select(.link_type=="is_blocked_by") | [.iid, .state] | @tsv'
```

## Who am I

```
glab api user | jq -r .username
```

## Read an issue

The issue, then its comments without system notes:

```
glab api "projects/:fullpath/issues/$N" \
  | jq '{iid, title, state, description, labels, assignees: [.assignees[].username], milestone: .milestone.title, web_url}'
glab api "projects/:fullpath/issues/$N/notes?sort=asc&per_page=100" --paginate \
  | jq -rs 'add | .[] | select(.system | not) | "\(.author.username): \(.body)"'
```

## List issues

`--paginate` can print one JSON array per page, so slurp them with `jq -s 'add'`.

Every issue in a milestone, any state:

```
glab api "projects/:fullpath/issues?milestone=$(jq -rn --arg v "$TITLE" '$v|@uri')&scope=all&state=all&per_page=100" --paginate \
  | jq -s 'add | .[] | {iid, title, state, description, labels, assignees: [.assignees[].username], web_url}'
```

The open issues of one template that still need grilling (no `ready`, nobody assigned), lowest number first:

```
glab api "projects/:fullpath/issues?scope=all&state=opened&per_page=100" --paginate \
  | jq -rs --arg m "<!-- contract: $TEMPLATE v" 'add
      | [.[] | select((.description // "") | contains($m))
             | select(.labels | index("ready") | not)
             | select(.assignees | length == 0)]
      | sort_by(.iid) | .[] | [.iid, .title] | @tsv'
```

## Update an issue

The label must exist first (see Labels).

```
glab api --method PUT "projects/:fullpath/issues/$N" -F description=@"$BODY_FILE" >/dev/null
glab issue update "$N" --label ready            # --unlabel ready
glab issue update "$N" --assignee="+$ME"        # release: --assignee="-$ME"
glab api "projects/:fullpath/issues/$N/notes" -F body=@"$COMMENT_FILE" >/dev/null
```

`$ME` is the username from "Who am I". The `+`/`-` prefix adds or removes only you; without it, `--assignee` replaces every assignee.

## Pull requests (merge requests)

Open as a draft, mark ready once the checks pass. Put `Closes #N` in the description, so merging into the default branch closes the issue. Removing the source branch on merge makes GitLab retarget a stacked merge request to the default branch once the one below it is merged:

```
glab api projects/:fullpath/merge_requests \
  -f source_branch="$BRANCH" -f target_branch="$BASE" \
  -f title="Draft: $TITLE" -F description=@"$BODY_FILE" -F remove_source_branch=true \
  | jq -r '[.iid, .web_url] | @tsv'
glab mr update "$MR" --ready
```

The open merge requests, with their branches:

```
glab api "projects/:fullpath/merge_requests?state=opened&per_page=100" --paginate \
  | jq -rs 'add | .[] | [.iid, .source_branch, .draft, .web_url] | @tsv'
```

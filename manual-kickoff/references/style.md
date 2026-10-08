# Manual style guide

This is the default `docs/manual/STYLE.md`. The setup issue copies it into the project and adapts it. Every writer follows it, so a manual put together from separate PRs reads as one book.

The readers use the product. They are not developers: no code, selectors, file paths, internal names or stack details.

## Voice

- Second person, imperative, present tense: "Click **Save**.", not "The user clicks Save." or "You will click Save."
- One action per step. After the action, say what the reader sees: "Click **Save**. The user list shows the new user."
- Short sentences. One idea per paragraph.
- Use the glossary terms from `00-intro.md`, and always the same term for the same thing.

## UI text

- UI labels in **bold**, exactly as the UI shows them, including case: **Save**, **New user**.
- Menu paths with ›: **Settings › Users**.
- Keys in bold: **Ctrl+S**.
- What the reader types, in a code span: type `mario.rossi@example.com`.
- Messages the reader sees, in quotes and exactly as shown: "Password too short".
- CLI commands and their output in fenced code blocks.

## A workflow file

A workflow file starts at `##`. The chapter's `#` heading lives in its `00-chapter.md`. Give each workflow heading an explicit id, so links survive a rename or a translation.

```
## Create a user {#admin-create-user}

Create an account for a new colleague, so they can log in to the reserved area.

**Before you start:** you need the Administrator role. See [Log in](#log-in).

1. Open **Settings › Users**. The user list appears.

   ![The user list, with the New user button at the top right](assets/screenshots/admin-panel/create-user-01.png)

2. Click **New user**. The **Create user** form opens.
3. Fill in **Name** and **Email**, then click **Save**. The list shows the new user.

### If something goes wrong

- "Email already in use": another account has that email. Search the list for it before creating a new one.

### Related

- [Disable a user](#admin-disable-user)
```

In an "Other tasks" file, each minor workflow is its own `##` section, in the order of the issue.

## Screenshots

- One screenshot per screen the reader has to recognise, not one per click.
- Put each image on its own line, inside its step. Its text becomes the caption, so say what it shows.
- Paths are relative to `docs/manual/`: `assets/screenshots/<chapter>/<workflow>-NN.png`, numbered in order of appearance.
- Only demo data in screenshots, never real personal data.
- CLI output is included from the file the capture scenario writes, so it never goes stale:

  ````
  ```{include="assets/output/<chapter>/<workflow>-01.txt"}
  ```
  ````

## Notes and warnings

Use fenced divs. The build renders them as boxes.

```
::: note
Users get the welcome email only if email delivery is turned on.
:::

::: warning
Deleting a user can't be undone.
:::
```

Use a warning only where the reader can lose data, money or access.

## Links

Link to other parts of the manual by heading id: `[Create a user](#admin-create-user)`. Never link to source code or to the issue tracker.

<!-- contract: manual-setup v1 -->
<!--
Purpose: sets up everything the manual's issues share: layout, style guide, build, screenshot capture, demo data and CI.
Lifecycle: not grilled. Opened `ready`, because its choices were reviewed when the manual's plan was approved. Every other manual issue depends on this one.
Labels: the opener applies `manual`.
Implementer: this is the only manual issue that creates or changes shared files.
-->

## Summary

## Toolchain
<!-- pandoc version, LaTeX engine (xelatex), PDF template, fonts; how each is installed locally and in CI -->

## Layout
<!-- the docs/manual/ tree: manual.yaml with the chapters in order and their roles, STYLE.md, every chapter folder with its 00-chapter.md -->

## Style guide
<!-- docs/manual/STYLE.md, copied from the manual-kickoff skill's references/style.md and adapted to this project -->

## Build
<!-- the command, the order of the inputs, how notes/warnings and included outputs are rendered, where the PDF lands -->

## Screenshot capture
<!-- how the harness starts the app, logs in as each role, runs one scenario file per workflow, and where images or outputs land. For desktop: the manual checklist instead -->

## Demo data
<!-- the seed data and the one account per role that screenshots show; never real personal data -->

## CI job
<!-- builds the PDF on every merge/pull request, publishes it as an artifact, fails on a build error -->

## How to run locally

## Acceptance criteria
<!-- implementer ticks these -->

- [ ] `docs/manual/` skeleton in place: `manual.yaml`, `STYLE.md`, every chapter folder with its `00-chapter.md`
- [ ] The build produces the PDF locally from the Markdown, with the chosen template
- [ ] The capture harness starts the app with demo data and produces one sample screenshot or output
- [ ] CI builds the PDF on every merge/pull request, publishes it as an artifact and fails on a build error
- [ ] PR merged with CI green

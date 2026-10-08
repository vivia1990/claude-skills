# Capturing screenshots and output

Screenshots taken by hand go stale without anyone noticing. Where it can, the manual captures them with scripts that anyone can re-run, so the whole set can be regenerated when the UI changes.

The setup issue builds the capture harness. Each workflow issue adds its own scenario file, so writers never edit the same file.

## Common to every project type

- The harness starts the app with demo data: a seed, plus one account per role. If the project already has e2e fixtures or a test start-up (see `docs/plans/e2e-kickoff.md`), reuse them.
- One scenario per workflow, in `docs/manual/scripts/capture/<chapter>/<workflow>.*`. It writes to `docs/manual/assets/screenshots/<chapter>/<workflow>-NN.png` (or `assets/output/...` for CLI), numbered as in the issue's Screenshots list.
- One command runs every scenario, or a single one by name.
- Re-runs give the same result: fixed window size, the manual's language as locale, fixed demo data, and a fixed clock if dates appear on screen.
- The capture isn't part of the PDF build. The images are committed, and CI only builds the PDF from them.

## Web (and Electron)

- **Playwright**, in TypeScript, or in Python if the project is Python-only. For Electron, Playwright's Electron support.
- Viewport 1280×800, `deviceScaleFactor: 2`, so the images stay sharp in print.
- Log in once per role and reuse the stored session (`storageState`).
- Capture the region the step is about (`locator.screenshot()`) when the full page would make the detail too small to read. Otherwise, the viewport.
- The plan's setup issue names the dev server command, or `docker compose` if the app needs a database or other services.

## CLI

- No images. The scenario runs each command in a clean temporary directory with the demo data, and writes the command line and its output to `docs/manual/assets/output/<chapter>/<workflow>-NN.txt`.
- The build includes those files into code blocks (for example with pandoc's `include-code-files` Lua filter), so the manual never shows outdated output.
- Fixed terminal width (80 columns), no colours (`NO_COLOR=1`), and a fixed environment (home directory, locale, time zone).

## Desktop (other than Electron)

- Scripted capture is usually not worth it. Each workflow issue's Screenshots list is the checklist a person follows, and the images go to the same paths as for web.
- The setup issue states the window size, the OS theme and the demo profile to use, so images taken by different people match.
- If the project already drives its UI in tests (pytest-qt, FlaUI, pywinauto, WebdriverIO with tauri-driver), the harness can use that instead. Then follow the web rules.

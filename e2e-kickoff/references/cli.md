# Command-line tools

## Where workflows live

- Commands and subcommands: argument parser definitions (argparse, click, typer, clap, cobra, commander), `main` dispatch.
- Inputs: flags, config files, environment variables, stdin.
- Outcomes: stdout/stderr text, exit codes, files written, network calls made.
- Interactive prompts, if any: what is asked and what each answer does.

## Framework

- Python projects: **pytest**, running the real executable with `subprocess` (`pexpect` for interactive prompts).
- Shell tools: **bats-core**.
- Go / Rust / Node: the language's own test runner, executing the built binary as a subprocess (e.g. `assert_cmd` for Rust, `testscript` for Go).

Always test the built or installed executable, not internal functions. That is what makes the tests end-to-end.

## Setup issue specifics

- Each test gets a temporary working directory and home directory (`HOME`, `XDG_CONFIG_HOME`), so tests never read or write the real user config.
- Fake remote services with a local stub server, as a named fixture.
- Each step's assertion checks the exit code and the relevant output line or file content.

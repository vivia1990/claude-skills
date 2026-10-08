# Desktop applications

## Where workflows live

- Windows, dialogs and menus: main window setup, menu/toolbar definitions, UI files (`.ui`, `.xaml`, `.glade`), dialog classes.
- Actions: signal/slot or command handlers, event handlers bound to buttons and menu items.
- Persistence and devices: what an action saves, loads, exports, or sends to hardware or a serial port. These are usually the outcomes to assert.

## Framework by toolkit

- **Electron**: Playwright's Electron support (`_electron.launch`).
- **Tauri**: WebdriverIO with `tauri-driver`.
- **Qt (C++ or Python)**: pytest-qt for PySide/PyQt apps. For C++ Qt, Qt Test driving the real widgets, or Squish if the project already has a licence.
- **WPF / WinForms / WinUI**: FlaUI (C#) or pywinauto, through UI Automation.
- **GTK**: dogtail, through the accessibility tree (AT-SPI).

Prefer tools that find widgets by accessible name or visible label. Avoid screen coordinates and image matching.

## Setup issue specifics

- Start the app with a test profile: a temporary config and data directory, so tests never touch the user's real settings.
- Fake hardware, serial devices and network peers with simulators or loopback fixtures. Name each one as a fixture.
- On Linux CI, run under a virtual display (`xvfb-run`). Windows-only apps need a Windows runner.
- Save a screenshot when a test fails, and upload it as a CI artifact.

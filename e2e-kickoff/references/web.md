# Web applications

## Where workflows live

- Routes: router config (React Router, Vue Router, Angular routes), file-based routing (`pages/`, `app/`, `routes/`), server route tables (Django `urls.py`, Rails `routes.rb`, Laravel `routes/web.php`, Express/FastAPI/Spring handlers).
- Navigation: menus, nav bars, links and redirects after actions (`navigate(...)`, `redirect(...)`).
- Forms and actions: form components, submit handlers, client-side and server-side validation (the error messages users see).
- Roles: route guards, middleware, permission decorators. Note which workflows need which role.

## Framework

Default: **Playwright** (TypeScript, or Python if the project is Python-only). It runs in CI headless, waits automatically, and can record a trace for failing tests, which agents can read.

Use what the project already has if it has a working e2e tool (Cypress, Selenium, WebdriverIO). Don't add a second one.

## Setup issue specifics

- Start the app with the framework's web-server option (Playwright `webServer`), or `docker compose` if the app needs a database or other services.
- Use a dedicated test database, reset or seeded per run. Fixtures create users and data through the app's API or a seed script, not through the UI, so that only the workflow under test goes through the UI.
- Login fixture: log in once through the API and reuse the stored session (Playwright `storageState`).
- In CI: install browsers, run headless, upload the trace/report as an artifact when tests fail.

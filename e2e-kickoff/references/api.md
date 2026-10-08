# APIs and back-end services

## Where workflows live

- Endpoints: route/handler definitions, OpenAPI or GraphQL schemas, gRPC protos.
- A workflow is a sequence of calls a client makes for one result (create account → verify email → log in → create order), not a single endpoint.
- Side effects: database writes, queued jobs, emails, webhooks, calls to other services.
- Auth: token issuing, scopes and roles per endpoint.

## Framework

Use the project's language and its usual HTTP client:

- Python: **pytest + httpx**
- Node: **Vitest or Jest + supertest** (or Playwright's `request` if the project also has a web UI)
- Go: `net/http/httptest` against the real server binary
- Java/Kotlin: JUnit + REST Assured with Testcontainers

## Setup issue specifics

- Start the service and its real dependencies (database, queue, cache) with `docker compose` or Testcontainers. Don't mock the service's own dependencies; that would no longer be end-to-end.
- Fake external third-party APIs with a stub server, as a named fixture. Fake emails and webhooks with a capture fixture so tests can assert on them.
- Each step's assertion checks the status code, the important response fields and, where it matters, the side effect (row written, email captured).

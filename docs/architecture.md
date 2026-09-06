# EventHub Playwright Framework Architecture

## Purpose

This repository is an EventHub-focused test automation system, not a generic browser-test collection. It verifies user journeys, authorization behaviour, and REST API contracts while keeping tests independent, diagnosable, and safe to run in parallel.

The framework deliberately combines browser and API capabilities:

- UI tests exercise the customer and administrator experience through durable page objects.
- API tests validate contracts directly and create isolated records quickly.
- UI tests can use the API to prepare or verify state without treating API calls as a substitute for user-visible assertions.
- PostgreSQL support is available for database-backed checks when an API/UI observation needs persistence-level verification.

## System context

```text
                         ┌─────────────────────────┐
                         │ GitHub Actions           │
                         │ PR / main / nightly      │
                         └────────────┬────────────┘
                                      │
                                      ▼
┌────────────────┐       ┌─────────────────────────┐       ┌──────────────────┐
│ .env files and │──────▶│ Playwright configuration │──────▶│ Browser projects │
│ CI vars/secrets│       │ and typed envConfig      │       │ Chromium/FF/WebKit│
└────────────────┘       └────────────┬────────────┘       └────────┬─────────┘
                                       │                              │
                                       ▼                              ▼
                              ┌─────────────────┐          ┌──────────────────┐
                              │ API project     │          │ UI test projects │
                              │ tests/api       │          │ tests/ui         │
                              └────────┬────────┘          └────────┬─────────┘
                                       │                              │
                                       └──────────┬───────────────────┘
                                                  ▼
                                      ┌─────────────────────┐
                                      │ EventHub application │
                                      │ UI + REST API         │
                                      └──────────┬──────────┘
                                                 │ optional
                                                 ▼
                                      ┌─────────────────────┐
                                      │ PostgreSQL           │
                                      └─────────────────────┘
```

## Architectural layers

| Layer | Primary location | Responsibility | Must not contain |
| --- | --- | --- | --- |
| Test specifications | `tests/` | Scenario orchestration, assertions, test IDs, and meaningful `test.step` boundaries | Raw selectors repeated across tests; ad-hoc environment parsing |
| Fixtures | `src/fixtures/` | Dependency injection, authenticated clients, diagnostics, optional database lifecycle | Scenario-specific behaviour |
| UI model | `src/ui/` | Stable locators, user-facing actions, reusable components | Test-data creation or broad business assertions |
| API model | `src/api/` | Typed EventHub endpoints, request behaviour, status validation, typed response models | UI-specific logic |
| Test data | `test-data/` | Generated data, tracking, cleanup order, scenario profiles | Browser interactions |
| Configuration | `src/config/` | Validated and precedence-aware runtime configuration | Direct use from scattered tests/pages |
| Database | `src/db/` | Worker-owned pool, parameterised queries, transactions | Global shared connection state |

The important dependency direction is:

```text
specification → specialized fixture → base fixture → page/API/data abstractions → EventHub
```

Higher layers may depend on lower layers; lower layers should never import test specifications.

## Runtime configuration and trust boundaries

`src/config/env.config.ts` is the only runtime configuration gateway. It resolves values in this order:

```text
process/CI variables > .env.<TEST_ENV> > .env > local EventHub defaults
```

`TEST_ENV` is restricted to `dev`, `qa`, `staging`, and `prod`. URLs are validated as absolute URLs; boolean and numeric settings are validated before Playwright starts. In CI, `BASE_URL` and `API_URL` have no fallback and must be supplied explicitly.

Credentials, database settings, and diagnostics controls are therefore runtime inputs, never source-code constants. `.env` files, browser storage state, reports, and CLI session files are ignored by Git.

## Test execution model

### Projects and authentication

`playwright.config.ts` defines four operational projects:

| Project | Scope | Authentication |
| --- | --- | --- |
| `setup` | `tests/auth/auth.setup.ts` | Signs in once and writes `playwright/.auth/user.json` |
| `chromium` | UI specs outside `tests/api` and `tests/auth` | Depends on `setup`; consumes storage state |
| `firefox` / `webkit` | Same UI scope | Depend on `setup`; consume storage state |
| `api` | `tests/api` | Uses Playwright's request context and logs in through `EventHubAPI` when required |

The authentication setup is a producer of reusable browser state. UI projects are consumers. It prevents each UI test from repeating login while API tests remain independent of browser storage.

### Fixture graph

```text
@playwright/test
      │
      ▼
incognito.fixture ──────────────────────────────┐
      │                                         │
      ▼                                         │ when INCOGNITO=true
base.fixture                                    │ creates persistent
  ├─ page objects                               │ Chromium context
  ├─ BaseAPI / EventHubAPI clients              │
  ├─ helpers                                    │
  └─ lazy, worker-scoped dbPool                 │
      ├───────────────────────┐                 │
      ▼                       ▼                 │
ui.fixture                 api.fixture ◀────────┘
  └─ UI diagnostics          └─ API diagnostics
```

Use `ui.fixture.ts` for browser journeys and `api.fixture.ts` for API specs. Both extend the same base fixture, but add the automatic diagnostics appropriate to their execution mode.

`INCOGNITO=true` is a deliberate special mode, not a cross-browser abstraction: `incognito.fixture.ts` launches a persistent Chromium context. Do not use it for Firefox or WebKit coverage unless the fixture is redesigned to select the current project browser.

### UI journey flow

```text
UI spec
  → ui.fixture attaches listeners
  → page object performs user-facing action
  → component object exposes focused controls
  → spec asserts observable UI outcome
  → fixture attaches sanitized diagnostics on unexpected failure
```

Page objects use roles, labels, placeholders, and test IDs. They represent interactions and durable element accessors; specifications own scenario-specific assertion logic.

### API flow

```text
API spec or TestDataManager
  → api.fixture injects an observed EventHubAPI client
  → EventHubAPI selects typed domain endpoint and expected status
  → BaseAPI sends request, measures duration, validates status, parses typed JSON
  → diagnostics observer records sanitized metadata
```

`BaseAPI` can wrap a standalone `APIRequestContext` or a browser page's request client. The latter shares the active browser session when a UI/API flow needs it. `EventHubAPI` is the domain layer: it expresses EventHub operations, requires a token where appropriate, and returns typed models rather than raw response bodies.

## Test data ownership and cleanup

The test-data layer is the isolation mechanism for stateful integration tests.

```text
scenario profile → factory builds unique payload → EventHubAPI creates record
       → TestDataManager tracks IDs → test verifies UI/API state
       → finally block calls cleanup → bookings removed before events
```

`TestDataManager` owns only records created or explicitly tracked by that test. Cleanup is best-effort and continues after an individual cleanup failure, so one stale record does not mask the original test failure. Tests should call cleanup from `finally`; they must not rely on shared fixtures or pre-existing EventHub records.

## Database support

Database checks are opt-in through the `dbPool` worker fixture. Playwright initializes worker fixtures lazily, so normal UI and API runs do not open a PostgreSQL connection.

`DatabasePool` provides:

- a health check at fixture startup;
- parameterised `query` execution;
- transactional work with rollback on failure;
- deterministic pool closure at worker teardown.

Database assertions should confirm a meaningful cross-layer contract, such as persistence after an EventHub action. They should not duplicate every API assertion or leave test data behind.

## Diagnostics and evidence

The framework separates evidence collection from test logic.

| Mode | Evidence | Default attachment policy |
| --- | --- | --- |
| UI | Current URL, console errors, page errors, failed requests, 4xx/5xx fetch/XHR/document responses | Unexpected failure only (`UI_DIAGNOSTICS=failure`) |
| API | Up to 50 call summaries: method, sanitized endpoint, status, duration, and correlation ID | Unexpected failure only (`API_DIAGNOSTICS=failure`) |
| Playwright | HTML report, JSON result, screenshot, video, trace | Screenshot always; video retained on failure; trace retained on failure in CI and captured locally |

Diagnostic collectors redact sensitive URL parameters and common secret-bearing values. They deliberately exclude request/response bodies and authorization headers. This preserves useful failure context without turning reports into a credential store.

## Delivery pipeline

```text
PR
 ├─ every PR: npm ci → typecheck → production dependency audit
 └─ same-repository PR: install Chromium → API + Chromium tests → failure artifacts

main push
 └─ API + Chromium integration tests → failure artifacts

nightly/manual
 └─ API + Chromium + Firefox + WebKit regression → failure artifacts
```

The PR integration job intentionally skips forked pull requests because GitHub does not expose repository secrets to them. This keeps the test environment and credentials within the repository trust boundary while still providing static validation to external contributors.

## Extension guide

### Add a UI journey

1. Add or extend a page/component under `src/ui/` using stable locators.
2. Expose shared page objects through `base.fixture.ts`.
3. Add the scenario to the correct `tests/ui/{auth,customer,admin}` domain.
4. Import `ui.fixture.ts`, use `test.step`, and assert visible outcomes.
5. Use `TestDataManager` plus `finally` cleanup when state must be created.

### Add an API capability

1. Add request/response types to `EventHubModels.ts`.
2. Add an intent-revealing method to `EventHubAPI` with expected status codes.
3. Add contract coverage under `tests/api/` using `api.fixture.ts`.
4. Reuse the method for API-assisted setup only when it improves test isolation or speed.

### Add a database check

1. Request `dbPool` in the test fixture parameters.
2. Query with parameters or use `transaction` for a multi-step check.
3. Keep the assertion tied to a UI/API behaviour.
4. Preserve the test-data cleanup order: bookings first, then events.

## Guardrails and known trade-offs

- Shared authenticated UI state improves speed, but setup credentials are mandatory for UI projects.
- API-assisted setup reduces flakiness, but UI tests must still verify user-visible behaviour.
- Screenshots for all outcomes improve local debugging but increase local artifact volume; CI uploads artifacts only after failures.
- The framework has PostgreSQL support but no committed database specs yet; introduce them only for valuable persistence contracts.
- Full browser coverage is deferred to nightly CI to keep PR feedback timely; PRs still run the highest-value API and Chromium paths.
- The specialized diagnostics fixtures are the standard import point for test specs. Use `base.fixture.ts` directly only when a test intentionally does not need UI or API diagnostics.

## Decision checklist

Before adding a new abstraction, ask:

1. Is this a reusable UI action, a domain API operation, test data, or test orchestration?
2. Can the existing page object, component, API service, fixture, or helper already express it?
3. Does the test own its state and clean it up even on failure?
4. Does the change preserve parallel safety and avoid arbitrary time-based waits?
5. Will failure diagnostics remain useful without exposing sensitive data?

Following these boundaries keeps the framework small enough to navigate and structured enough to scale with EventHub coverage.

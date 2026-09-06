# EventHub Playwright Test Framework

TypeScript-based UI and REST API test automation for EventHub, built with
[Playwright](https://playwright.dev/).

The framework uses page objects, focused helpers, typed configuration, Playwright
fixtures, API services, PostgreSQL database support, and GitHub Actions CI.

See the [architecture document](docs/architecture.md) for execution flows,
layer boundaries, data ownership, diagnostics, and CI design.

## Key features

- Page Object Model with a minimal `BasePage`.
- Single-responsibility UI, wait, API-wait, storage, dialog, and screenshot helpers.
- Typed environment configuration with deterministic precedence.
- EventHub API client built on Playwright's `APIRequestContext`.
- Worker-scoped PostgreSQL pool for database-backed tests.
- Authentication setup with reusable Playwright `storageState`.
- Chromium, Firefox, and WebKit projects.
- BA-readable terminal steps plus HTML reports, traces, screenshots, video, and sanitized UI/API failure diagnostics.

## Project structure

```text
├── .env.example
├── .github/workflows/
│   ├── pull-request.yml          # Audit, typecheck, API + Chromium on same-repo PRs
│   ├── main-integration.yml      # API + Chromium on main
│   └── nightly-regression.yml    # Full cross-browser scheduled run
├── src/
│   ├── api/
│   │   ├── BaseAPI.ts            # Typed API request foundation
│   │   ├── errors/ApiRequestError.ts
│   │   ├── models/EventHubModels.ts
│   │   └── services/EventHubAPI.ts
│   ├── ui/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── bookings/
│   │   │   ├── events/
│   │   │   ├── feedback/
│   │   │   └── navigation/
│   │   └── pages/
│   │       ├── BasePage.ts
│   │       ├── auth/
│   │       ├── customer/
│   │       └── admin/
│   ├── config/env.config.ts      # Validated environment configuration
│   ├── db/
│   │   ├── DatabasePool.ts       # Worker-scoped PostgreSQL pool
│   │   └── databaseConfig.ts
│   ├── fixtures/
│   │   ├── api.fixture.ts        # API tests with failure diagnostics
│   │   ├── base.fixture.ts       # Pages, API clients, database, and helpers
│   │   ├── diagnostics/          # Sanitized UI and API diagnostic collectors
│   │   ├── incognito.fixture.ts
│   │   └── ui.fixture.ts         # UI tests with failure diagnostics
│   ├── helpers/
│   │   ├── ApiWaitHelper.ts
│   │   ├── DialogHelper.ts
│   │   ├── ScreenshotHelper.ts
│   │   ├── StorageHelper.ts
│   │   ├── TestDataUtil.ts
│   │   ├── UiActions.ts
│   │   └── WaitHelper.ts
├── tests/
│   ├── auth/auth.setup.ts          # Creates playwright/.auth/user.json
│   ├── ui/                         # Browser journeys by domain
│   │   ├── auth/
│   │   ├── customer/
│   │   └── admin/
│   └── api/                        # Direct API contract/integration tests
├── test-data/                      # Reusable test-data builders and cleanup
│   ├── factories/                  # Reusable entity builders
│   ├── scenarios/                  # Named data profiles for test groups
│   └── TestDataManager.ts          # Test-owned creation and cleanup
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 22 (the version used by CI)
- npm
- EventHub credentials for authenticated UI/API tests

## Installation

Use the lockfile for reproducible installation:

```bash
npm ci
```

On Windows and macOS:

```bash
npx playwright install
```

On Linux, install browser system dependencies too:

```bash
npx playwright install --with-deps
```

Use `npm install` only when intentionally changing dependencies or regenerating
`package-lock.json`.

## Configuration

Copy `.env.example` to `.env` for local execution. Local development has safe
EventHub URL defaults, but credentials must be supplied for authenticated tests.
`.env`, `.env.dev`, `.env.qa`, `.env.staging`, and `.env.prod` are ignored by Git;
`.env.example` is the committed template.

```ini
TEST_ENV=dev
BASE_URL=https://eventhub.rahulshettyacademy.com
API_URL=https://api.eventhub.rahulshettyacademy.com/api
USER_NAME=your-user@example.com
USER_PASSWORD=your-password
HEADLESS=true
```

Configuration precedence is:

```text
CI/process variables > .env.<environment> > .env > local defaults
```

Supported environments are `dev`, `qa`, `staging`, and `prod`. Non-development
execution requires the matching environment file or explicit `BASE_URL` and
`API_URL` values. CI must always provide both URLs.

Other supported settings include `DEBUG_API`, `INCOGNITO`,
`IGNORE_HTTPS_ERRORS`, `ACTION_TIMEOUT`, `EXPECT_TIMEOUT`,
`DEFAULT_TIMEOUT`, `NAVIGATION_TIMEOUT`, and optional `DB_*` settings. See
`.env.example` for the complete list. Only `src/config/env.config.ts` reads
environment variables directly.

## Running tests

| Command | Description |
| :--- | :--- |
| `npm run test` | Run all configured Playwright projects |
| `npm run test:headed` | Run all tests with visible browsers |
| `npm run test:chromium` | Run the Chromium project |
| `npm run test:e2e` | Run E2E UI specs |
| `npm run test:p0` | Run the release-blocking P0 catalogue (Chromium + API) |
| `npm run test:api` | Run API specs |
| `npm run test:dev` | Run against the development environment |
| `npm run test:qa` | Run against the QA environment |
| `npm run test:prod` | Run against the production environment |
| `npm run typecheck` | Validate TypeScript without running tests |
| `npm run report` | Open the HTML report |
| `npx playwright test --project=api` | Run only the API project |
| `npx playwright test --project=firefox` | Run only Firefox |

Set `WORKERS` to tune parallelism for a CI environment. If it is not set, Playwright chooses its default worker count; P0 tests are designed to remain independent under parallel execution.

The UI projects depend on `tests/auth/auth.setup.ts` and reuse
`playwright/.auth/user.json`. Authenticated tests require `USER_NAME` and
`USER_PASSWORD`.

## UI failure diagnostics

UI tests use `src/fixtures/ui.fixture.ts`. On an unexpected failure, the HTML
report includes the current URL, browser console errors, page errors, failed
network requests, and `4xx`/`5xx` document or API responses. URLs are sanitized
for sensitive query parameters; tokens, authorization headers, passwords, and
response bodies are not attached. Terminal output prints each `test.step()`.

Set `UI_DIAGNOSTICS` to control these lightweight text attachments:

```text
failure  # default: attach only unexpected failures
always   # attach every UI test's diagnostics, including passes
off      # do not attach UI diagnostics
```

Screenshots are captured for every test outcome. CI uploads reports and test
results only after failed runs; video and trace retention follow the Playwright
project configuration.

## API failure diagnostics

API tests use `src/fixtures/api.fixture.ts`. An unexpected failure receives an
`api-call-summary` attachment containing up to 50 sanitized request summaries:
HTTP method, endpoint, response status, duration, and a correlation ID when the
service returns one. It deliberately excludes authorization headers, tokens,
passwords, request bodies, and response bodies. Transport-error text is
sanitized before it is attached.

Set `API_DIAGNOSTICS` to control attachment creation:

```text
failure  # default: attach only unexpected failures
always   # attach every API test's summary, including passes
off      # do not attach API summaries
```

## GitHub Actions

Three workflows are committed under `.github/workflows/`:

- Pull requests to `main`: audit production dependencies and typecheck. Same-repository PRs also run API and Chromium integration tests; fork PRs skip credentialed integration tests.
- Pushes to `main`: run API and Chromium integration tests.
- Nightly/manual execution: run API plus Chromium, Firefox, and WebKit.

Configure these repository variables:

```text
BASE_URL
API_URL
```

Configure these repository secrets:

```text
USER_NAME
USER_PASSWORD
```

CI uses `npm ci`, Node.js 22, `CI=true`, and installs only the browsers needed
by each workflow. Reports and test results are uploaded as workflow artifacts
after failed runs. Do not commit `.env` files, credentials, tokens, or generated
authentication state.

## PostgreSQL database testing

PostgreSQL support is available through the worker-scoped `DatabasePool` fixture.
Provide the corresponding `DB_*` settings for database-backed tests. Tests must
own their data and clean up explicitly; normal UI and API specs do not open a
database connection unless they request the `dbPool` fixture.

## Adding a page object and test

Create a focused EventHub page object in `src/ui/pages/`:

```typescript
import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class EventsPage extends BasePage {
  readonly eventCards: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.eventCards = page.getByRole('main').getByTestId('event-card');
    this.searchInput = page.locator('input[type="search"]');
  }

  async searchEvents(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }
}
```

Register the page in `src/fixtures/base.fixture.ts` when it is shared by
multiple tests, then create a spec under `tests/ui/customer/` or
`tests/ui/admin/`:

```typescript
import { expect, test } from '../../../src/fixtures/ui.fixture';

test('finds an event by search', async ({ eventsPage }) => {
  await eventsPage.navigate();
  await eventsPage.searchEvents('conference');
  await expect(eventsPage.eventCards.first()).toBeVisible();
});
```

Keep assertions in tests, keep page objects focused on application actions, and
prefer stable application locators such as roles, labels, and test IDs.

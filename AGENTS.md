# EventHub Playwright Project Instructions

## Project overview

- This repository is a TypeScript Playwright framework for EventHub UI and API testing.
- Preserve the existing Page Object Model, fixture, API service, and test-data patterns.
- Make the smallest coherent change that satisfies the request.

## Repository structure

- `src/ui/pages/`: page objects and reusable UI components.
- `src/fixtures/`: shared Playwright fixtures and authenticated contexts.
- `src/api/`: API models, services, and request helpers.
- `src/config/`: validated environment configuration.
- `test-data/`: data factories, scenarios, constants, and cleanup management.
- `tests/ui/`: browser journeys grouped by authentication, customer, and admin domains.
- `tests/api/`: direct API and contract/integration tests.
- `test-design-catalogue.md`: functional coverage and test-case traceability.

## Playwright conventions

- Prefer stable role, label, test-id, and accessible-name locators.
- Do not add arbitrary `waitForTimeout` calls; use Playwright auto-waiting or explicit state-based waits.
- Keep reusable UI actions in page objects and assertions in specs unless an assertion is a reusable page contract.
- Use `test.step` for meaningful workflow phases.
- Use API setup for isolated test data when it improves reliability and speed.
- Clean up bookings before their parent events.
- Keep tests independent and safe for parallel execution.
- Tag release-blocking tests with `@p0`.
- Use `playwright-cli` for exploratory browser interaction or debugging; use `npx playwright test` for repeatable automated tests.

## Environment and data safety

- Read environment-specific values from the existing configuration and `.env` files; do not hard-code credentials or secrets.
- Never commit `.env` files, credentials, reports, traces, videos, screenshots, browser state, or temporary CLI snapshots.
- Do not run destructive actions against shared or production environments unless the user explicitly requests them.
- Prefer generated, test-owned records and always clean them up in `finally` blocks or the project test-data manager.

## Validation commands

Run the narrowest relevant command first, then broaden validation when practical:

- `npm run typecheck`
- `npm run test:e2e`
- `npm run test:api`
- `npm run test:chromium`
- `npm run test:p0`
- `npm run report`

When changing configuration, fixtures, page objects, or shared data utilities, run type-checking and the affected test project.

## Change workflow

1. Inspect nearby code and existing patterns before adding a new abstraction.
2. Implement the requested change without unrelated cleanup.
3. Run relevant validation and report failures clearly.
4. Do not create, amend, or push Git commits unless explicitly requested.
5. When asked for a commit message, use `.codex/skills/generate-commit-message/SKILL.md` and output only the requested commit message.

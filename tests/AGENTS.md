# Playwright Test Instructions

## Test placement and naming

- Place browser journeys in `tests/ui/auth/`, `tests/ui/customer/`, or `tests/ui/admin/`.
- Place direct API and contract coverage in `tests/api/`.
- Use the relevant catalogue ID in the test title when one exists.
- Keep each spec focused on one user journey, authorization rule, or API contract.

## Implementation rules

- Import fixtures from `src/fixtures/base.fixture` instead of creating ad hoc browser or API contexts.
- Use page objects for reusable UI operations; keep scenario orchestration and assertions in specs.
- Use stable accessible locators and test IDs. Do not use brittle positional selectors or arbitrary timeouts.
- Use `test.step` for meaningful setup, user actions, and verification phases.
- Mark release-blocking coverage with `@p0`.

## Test data and cleanup

- Create isolated records through `TestDataManager` and the API services where possible.
- Use generated data; do not rely on shared, pre-existing records.
- Clean up bookings before events in `finally` blocks, even when assertions fail.
- Keep test cases independent so they can run in parallel.

## Verification

- Run the smallest affected spec or project while iterating.
- Run `npm run typecheck` after changing TypeScript tests, fixtures, page objects, or test-data utilities.
- For UI/API integration flows, assert the observable UI outcome and the persisted API state when both are relevant.

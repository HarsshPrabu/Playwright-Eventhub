# Source Implementation Instructions

## Boundaries

- Keep page objects and reusable UI components under `src/ui/`.
- Keep authenticated API services, request helpers, models, and API errors under `src/api/`.
- Keep shared test fixtures in `src/fixtures/` and environment parsing in `src/config/`.
- Add test data builders and cleanup behavior under `test-data/`, not inside page objects.

## Page objects

- Model durable user-facing interactions and stable locators.
- Prefer role, label, test-id, and accessible-name locators.
- Expose actions and reusable element accessors; avoid embedding scenario-specific test assertions.
- Do not hide arbitrary waits inside page objects. Wait on the state that proves the action completed.

## API and configuration

- Preserve typed request and response models.
- Use the existing API service abstractions and error types rather than raw ad hoc requests.
- Read configuration through `envConfig`; do not read environment variables directly in tests or page objects.
- Do not introduce secrets or credentials into source files.

## Change quality

- Reuse an existing helper or abstraction when it fits before adding a new one.
- Keep public APIs narrow and names aligned with EventHub terminology.
- Run `npm run typecheck` after modifying shared source code.

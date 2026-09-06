---
name: eventhub-generate-commit-message
description: Generate a Conventional Commit message from staged or unstaged Git changes in the EventHub Playwright repository.
metadata:
  short-description: Generate an EventHub commit message
---

# Generate Commit Message

Use this skill when the user asks for a commit message. Do not create, amend, or push a commit.

## Workflow

1. Run `git diff --staged` first.
2. If there are no staged changes, run `git diff`.
3. If both diffs are empty, respond exactly:
   `Nothing to commit — no staged or unstaged changes found.`
4. Treat the diff as the only source of truth. Do not infer changes from untracked files, prior conversation, or test results.
5. Generate a Conventional Commits message and output only the message in a plain-text code block.

## Format

Use one of these types:

- `feat`: new test coverage, page object, fixture, or capability
- `fix`: behavior or test defect correction
- `refactor`: restructuring without intended behavior change
- `test`: test-only changes that do not add a new capability
- `chore`: configuration, dependency, cleanup, hooks, or tooling changes
- `docs`: documentation-only changes

Keep the subject line at 72 characters or fewer:

```text
type(scope): short description

- Add bullets only when more than two files changed or additional context is useful.
```

Include test IDs such as `AUTH-001`, `API-006`, or `EVT-DETAIL-007` when they appear in the diff and help identify the change.

## EventHub scopes

Choose the most specific clear scope:

- `tests/ui/auth/` → `auth`
- `tests/ui/customer/` → `customer`
- `tests/ui/admin/` → `admin`
- `tests/api/` or `src/api/` → `api`
- `src/ui/pages/` → `ui`
- `src/fixtures/` → `fixtures`
- `test-data/` → `test-data`
- `playwright.config.ts` or CI-related configuration → `ci`
- `package.json` or dependency-only changes → `deps`
- `README.md` or test-design documentation → `docs`

If changes span multiple unrelated areas, omit the scope and summarize the main activities in the subject.

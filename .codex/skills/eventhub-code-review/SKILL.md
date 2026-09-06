---
name: eventhub-code-review
description: Review EventHub Playwright changes for correctness, test isolation, UI/API consistency, authorization, and maintainability. Use for pull-request, diff, or local-change reviews in this repository.
metadata:
  short-description: Review EventHub Playwright changes
---

# EventHub Code Review

Review the requested change only. Do not edit code, stage files, create commits, or run destructive actions unless the user asks separately.

## Select the review target

- Use a revision, branch, pull-request diff, or files explicitly named by the user.
- For an unspecified local review, inspect `git diff --staged` first, then `git diff` when nothing is staged.
- If both are empty, report that there are no reviewable tracked changes. Do not treat untracked artifacts as review scope unless the user names them.
- Run `git diff --check` before reporting results. Do not claim tests passed unless they were actually run.

Read the changed code and the nearest callers, fixtures, page objects, API services, and test-data utilities necessary to understand its behavior. Search call sites before flagging a shared API, fixture, utility, or configuration change.

## Review priorities

### Correctness and authorization

- Verify the assertions prove the stated behavior, not merely that a request completed or a page rendered.
- For UI/API integration, check the visible user outcome and persisted API state when both are material.
- Confirm protected admin and booking routes do not expose data to unauthenticated or unauthorized sessions.
- Check that destructive actions, especially cancellation and deletion, target the intended record and wait for the state change that proves completion.

### Test isolation and data integrity

- Prefer generated, test-owned data over shared records.
- Require cleanup on success and failure, normally through `TestDataManager` in a `finally` block.
- Ensure bookings are cleaned up before their parent events.
- Flag tests that can conflict when run in parallel, leak records, depend on execution order, or mutate a shared environment without explicit authorization.

### Playwright reliability

- Prefer role, label, test-id, and accessible-name locators over positional or brittle CSS selectors.
- Flag arbitrary `waitForTimeout` calls unless a documented external-system limitation makes one necessary.
- Verify asynchronous actions wait on an observable UI, response, navigation, or API state rather than timing alone.
- Check that storage state and fixture choice match the user role being tested.
- Keep reusable UI actions in page objects and scenario-specific assertions in specs.

### API, configuration, and architecture

- Preserve typed API models, expected response statuses, and existing service abstractions.
- Require code to use `envConfig` rather than reading environment variables directly outside configuration.
- Review shared fixtures, page objects, data factories, and configuration for downstream callers before approving API or signature changes.
- Flag hard-coded credentials, secrets, environment URLs, or test data that should be generated or configured.

### Scope and maintainability

- Flag unrelated refactors, dead code, unused imports, commented-out code, duplicate helpers, and misleading test names only when they materially reduce safety or clarity.
- Check changed tests against `test-design-catalogue.md` when a catalogue ID or functional claim is present.
- Treat missing coverage as a finding only when the diff introduces a behavior that lacks the validation required to make the claimed change safe.

## Findings standard

Report only actionable findings supported by the changed code and its direct context. Do not invent production behavior, report stylistic preferences as defects, or repeat a finding.

Use these priorities:

- `P0` — security exposure, destructive data corruption, or a release-blocking defect.
- `P1` — a likely functional failure, false-positive test, data leak, or important authorization gap.
- `P2` — a reliability, maintainability, or coverage problem with meaningful future impact.
- `P3` — a small, concrete improvement that is worth making but does not materially affect correctness.

Each finding must include:

1. Priority and a concise title.
2. Exact `path:line` location.
3. Evidence explaining the failure mode.
4. The smallest credible fix or verification step.

If the host supports inline code comments, attach actionable file-specific findings to the narrowest relevant line range. Otherwise use the same `path:line` notation in the review.

## Review output

Start with the conclusion: `Approve`, `Approve with nits`, or `Request changes`.

Then provide findings in priority order. If there are no findings, say `No actionable findings` and list only meaningful residual risks or validation not performed. End with a short `Validation` note that states exactly which checks were run and which were not.

# EventHub Functional Test Design Catalogue

This catalogue describes what should be tested. It intentionally contains no Playwright or other automation code.

## 1. Test Strategy Summary

The catalogue covers the verified EventHub application areas: authentication, home navigation, event discovery, event details and booking, customer bookings, booking details/refund eligibility, admin event management, admin booking management, API-driven UI integration, persistence, and error handling.

The design uses equivalence partitioning, boundary-value analysis, state-transition analysis, decision-table thinking, and risk-based prioritisation. Customer and administrator roles are included where the live application exposes different behavior.

Primary risks are authentication failure, accidental booking/payment data corruption, seat overbooking, destructive cancellation/deletion, stale or shared sandbox data, and unauthorized administration.

The live user/admin role was available for exploration. A separate standard-user account, registration lifecycle, backend failure injection, and application source were not available. Those gaps are marked explicitly below.

## 2. Test Catalogue

### Authentication

| ID | Name | Preconditions / scenario | Expected result | Priority | Primary type | Role(s) | Suitability | Traceability / API / risk |
|---|---|---|---|---|---|---|---|---|
| AUTH-001 | Sign in with valid credentials | Existing active account submits valid email and password | User is authenticated and reaches the intended post-login page; authenticated header is shown | P0 | Functional / Integration | Customer, Admin | AUTOMATE | Login page, header, `POST /auth/login`, `GET /auth/me`; release-blocking access |
| AUTH-002 | Reject login with an unknown email | Submit a syntactically valid but unregistered email | Login is rejected, user remains unauthenticated, and the application shows the observed invalid-credentials notification | P1 | Functional / API | Customer | AUTOMATE | Login form, toast, `POST /auth/login`; credential handling |
| AUTH-003 | Reject login with an incorrect password | Existing email with incorrect password | Same safe failure behavior as invalid credentials; no partial session is created | P1 | Functional / API | Customer, Admin | AUTOMATE | Login page, auth API; session security |
| AUTH-004 | Prevent login with missing required fields | Empty email, empty password, and both empty as equivalence classes | Submission cannot proceed or field validation is shown; no login request is sent for client-side invalid input | P1 | Validation / UI | Customer | AUTOMATE | Login fields; required-field rule |
| AUTH-005 | Validate malformed email | Values without a valid email shape, including whitespace-only input | Email validation prevents continuation and does not create a session | P1 | Validation | Customer | AUTOMATE | Login email field; input contract |
| AUTH-006 | Preserve authentication state after refresh | Successfully sign in, refresh, and revisit a protected route | Session remains valid while token/session is valid; user identity remains consistent | P1 | Integration / Persistence | Customer, Admin | AUTOMATE | Storage state, `GET /auth/me`; session persistence |
| AUTH-007 | Logout invalidates the UI session | Authenticated user selects Logout, then uses browser back or a protected URL | User is returned to unauthenticated state and protected content is not usable | P1 | Functional / Security | Customer, Admin | AUTOMATE | App header; token/session invalidation |
| AUTH-008 | Register a new account with valid details | Registration page, unique email, password meeting all displayed requirements, matching confirmation | Account is created, success behavior occurs, and the user can sign in | P1 | Functional / Integration | Anonymous | AUTOMATE | Register page, `POST /auth/register`; account creation |
| AUTH-009 | Reject duplicate registration | Register using an existing email | Registration fails with a useful error and does not create a second account | P1 | Functional / API | Anonymous | AUTOMATE | Register page/API; uniqueness rule |
| AUTH-010 | Enforce registration password rules | Passwords in invalid, minimum-valid, and valid classes; confirmation mismatch | Requirements are reflected consistently and account creation is blocked until valid | P1 | Validation | Anonymous | AUTOMATE | Register page; password policy |

### Home and application navigation

| ID | Name | Preconditions / scenario | Expected result | Priority | Primary type | Role(s) | Suitability | Traceability / API / risk |
|---|---|---|---|---|---|---|---|---|
| NAV-001 | Load the authenticated home page | Valid authenticated session opens `/` | Home content, header, featured event content, and navigation are available | P1 | Functional / UI | Customer, Admin | AUTOMATE | Home page, `GET /events`/config; landing-page availability |
| NAV-002 | Navigate from home to Events | Select Browse/Explore events or Events navigation | Events page opens and event data is loaded | P1 | Functional / Integration | Customer, Admin | AUTOMATE | Home, Events page, `GET /events`; route integration |
| NAV-003 | Navigate from home to My Bookings | Select bookings navigation | Bookings page opens and user-specific bookings are displayed | P1 | Functional / Integration | Customer, Admin | AUTOMATE | Header, My Bookings, `GET /bookings`; ownership |
| NAV-004 | Navigate through browser back and forward | Move Home → Events → event details, then back and forward | Correct route and page state are restored without stale or incorrect entity data | P2 | Functional / UI | Customer, Admin | AUTOMATE | Related pages; history behavior |
| NAV-005 | Handle direct, invalid, and unauthenticated routes | Open protected routes directly, nonexistent event/booking IDs, and an invalid path | Protected routes redirect or deny access; missing resources show the application’s safe error/not-found behavior | P1 | Security / Resilience | Customer, Admin, Anonymous | AUTOMATE | Routing, auth guard, detail pages; deep-link risk |
| NAV-006 | Preserve or intentionally reset state across navigation | Apply event filters, open details, return to Events | Behavior matches the product contract: filters either persist or reset consistently; no misleading result set | P2 | Functional / UI | Customer, Admin | AUTOMATE | Events page; filter-state contract is currently unconfirmed |

### Event discovery

| ID | Name | Preconditions / scenario | Expected result | Priority | Primary type | Role(s) | Suitability | Traceability / API / risk |
|---|---|---|---|---|---|---|---|---|
| EVT-SEARCH-001 | Display event discovery controls | Open Events | Heading, search, category, city, event cards, and available admin action are presented according to role | P1 | Functional / UI | Customer, Admin | AUTOMATE | Events page, event-card component |
| EVT-SEARCH-002 | Find events by exact title | Search for an existing unique title | Matching event is shown and unrelated events are excluded | P1 | Functional | Customer, Admin | AUTOMATE | Search input; event filtering |
| EVT-SEARCH-003 | Find events by partial title or venue | Search using a meaningful substring | All matching records are shown according to the application’s search semantics | P2 | Functional | Customer, Admin | AUTOMATE | Search; search equivalence class |
| EVT-SEARCH-004 | Handle case and surrounding whitespace in search | Search with case variation and leading/trailing spaces | Behavior is consistent with the confirmed product contract; no accidental broad match | P2 | Functional / Validation | Customer, Admin | AUTOMATE | Search; normalization behavior currently unconfirmed |
| EVT-SEARCH-005 | Show an empty result state | Search for a unique nonexistent value | Stable no-results message is shown and no stale event card remains | P1 | Functional / UI | Customer, Admin | AUTOMATE | Empty events state; missing-data risk |
| EVT-SEARCH-006 | Filter by category | Select each supported category equivalence class and clear it | Only matching category events are shown; clearing restores the unfiltered state | P1 | Functional | Customer, Admin | AUTOMATE | Category filter; supported values |
| EVT-SEARCH-007 | Filter by city | Select each supported city equivalence class and clear it | Only matching city events are shown; clearing restores the unfiltered state | P1 | Functional | Customer, Admin | AUTOMATE | City filter; supported values |
| EVT-SEARCH-008 | Combine search and filters | Apply search plus category and city in multiple meaningful combinations | Results satisfy all active criteria, counts/content update consistently, and clear filters resets all criteria | P1 | Functional / Integration | Customer, Admin | AUTOMATE | Events page and event API query behavior |
| EVT-SEARCH-009 | Handle unavailable or empty event data | Events API returns an empty collection or failure response | Loading completes into the correct empty/error state; no stale cards or uncaught UI error appears | P1 | Resilience / Integration | Customer, Admin | AUTOMATE | `GET /events`; API-driven rendering |
| EVT-SEARCH-010 | Paginate event results when available | Dataset exceeds one page and user changes page/page size | Correct page, count, and records are displayed without duplicates or omissions | P2 | Functional / Integration | Customer, Admin | AUTOMATE | `GET /events?page=&limit=`; pagination is not currently exposed in observed UI |

### Event details and booking

| ID | Name | Preconditions / scenario | Expected result | Priority | Primary type | Role(s) | Suitability | Traceability / API / risk |
|---|---|---|---|---|---|---|---|---|
| EVT-DETAIL-001 | Open an existing event’s details | Select an event card or open a valid event deep link | Title, category, date/time, venue, city, availability, price, description, and booking panel agree with the event record | P1 | Functional / Integration | Customer, Admin | AUTOMATE | Event details, `GET /events/{id}` |
| EVT-DETAIL-002 | Handle a missing event | Open an unknown/deleted event ID | Safe not-found/error state is shown and booking controls are unavailable | P1 | Resilience / UI | Customer, Admin | AUTOMATE | Event details; resource lifecycle |
| EVT-DETAIL-003 | Change ticket quantity within allowed range | Increase/decrease from default quantity through meaningful values 1, 2, 9, and 10 | Quantity and total update correctly; decrement is disabled at 1 and increment is disabled at the maximum | P1 | Functional / Boundary | Customer | AUTOMATE | Ticket booking form; quantity rule 1–10 |
| EVT-DETAIL-004 | Prevent quantity outside allowed range | Attempt values below 1, above 10, or beyond available seats | Invalid quantity cannot be submitted and user receives a clear constraint | P1 | Validation / Boundary | Customer | AUTOMATE | Booking form; quantity/availability rule |
| EVT-DETAIL-005 | Require customer booking fields | Submit with missing name, email, phone, and representative combinations | Booking is blocked and relevant field validation is displayed | P1 | Validation | Customer | AUTOMATE | Booking form; required fields |
| EVT-DETAIL-006 | Validate booking customer input | Invalid email/phone, whitespace-only values, and valid Unicode/name characters | Invalid values are rejected; accepted values are represented consistently in confirmation/booking records | P1 | Validation | Customer | AUTOMATE | Booking form; input contract |
| EVT-DETAIL-007 | Book tickets successfully | Valid event with sufficient seats and valid customer details | Booking is created once, confirmation panel shows reference/customer/quantity/total, and seats are reduced | P0 | Functional / Integration | Customer | AUTOMATE | `POST /bookings`, confirmation component; core revenue workflow |
| EVT-DETAIL-008 | Prevent duplicate booking submission | Rapidly activate Confirm Booking or submit while request is in flight | Only one booking is created and the control is disabled or otherwise protected during processing | P1 | Resilience / Integration | Customer | AUTOMATE | Booking form/API; duplicate-charge risk |
| EVT-DETAIL-009 | Reject booking when seats are insufficient | Request more tickets than available, including exact-availability and one-over-availability boundaries | Booking fails safely, no partial booking is created, and availability remains correct | P0 | Functional / Boundary | Customer | AUTOMATE | `POST /bookings`; seat integrity |
| EVT-DETAIL-010 | Handle booking API failure | Simulate timeout, 4xx validation response, and 5xx response | Error is shown, confirmation is not shown, and entered form state is handled consistently | P1 | Resilience / Integration | Customer | AUTOMATE | `POST /bookings`; backend failure UX |
| EVT-DETAIL-011 | Follow confirmation navigation | Successful booking selects View My Bookings and Browse More Events | Each action reaches the correct route and displays the correct page | P1 | Functional / UI | Customer | AUTOMATE | Confirmation links; cross-page journey |

### Customer bookings and booking details

| ID | Name | Preconditions / scenario | Expected result | Priority | Primary type | Role(s) | Suitability | Traceability / API / risk |
|---|---|---|---|---|---|---|---|---|
| BKG-CUST-001 | Display only the authenticated user’s bookings | Authenticated user with zero and one-or-more bookings opens My Bookings | Correct cards, references, statuses, totals, and event summaries are shown; other users’ records are excluded | P0 | Functional / Security | Customer | AUTOMATE | `GET /bookings`; data ownership |
| BKG-CUST-002 | Show the empty bookings state | User has no bookings | Stable empty message and appropriate actions are shown; no stale card is displayed | P1 | Functional / UI | Customer | AUTOMATE | My Bookings empty state |
| BKG-CUST-003 | Open booking details from a booking card | Existing booking selects View Details | Correct booking detail page opens and all event/customer/payment fields match the booking | P1 | Functional / Integration | Customer | AUTOMATE | `GET /bookings/{id}` |
| BKG-CUST-004 | Handle a missing booking detail | Open unknown, deleted, or unauthorized booking ID | Safe not-found/authorization behavior occurs and no unrelated booking data is exposed | P0 | Security / Resilience | Customer | AUTOMATE | Booking details; IDOR/resource risk |
| BKG-CUST-005 | Cancel a confirmed customer booking | Confirmed owned booking selects Cancel and confirms if prompted | Correct cancel API is sent, status changes to cancelled, and UI reflects the transition | P0 | Functional / Integration | Customer | AUTOMATE | `DELETE /bookings/{id}`; cancellation state |
| BKG-CUST-006 | Prevent invalid repeated cancellation | Already-cancelled booking or repeated cancel action | Action is hidden/disabled/rejected according to product behavior and state does not regress | P1 | State transition | Customer | AUTOMATE | Booking state; idempotency |
| BKG-CUST-007 | Clear all customer bookings safely | User with multiple bookings selects Clear all and handles confirmation if present | All owned bookings are cleared/cancelled according to the product contract; empty state appears; unrelated data remains | P1 | Functional / Destructive | Customer | AUTOMATE | My Bookings; bulk destructive behavior |
| BKG-DETAIL-001 | Check refund eligibility for an eligible booking | Confirmed single-ticket booking selects refund eligibility | Loading state appears, then the observed eligible result and explanation are shown | P1 | Functional / Integration | Customer | AUTOMATE | Booking details/refund panel; eligibility rule |
| BKG-DETAIL-002 | Check refund eligibility for an ineligible booking | Use a booking that violates the observed eligibility condition, such as multiple tickets or cancelled state | Ineligible result and explanation are shown; no refund is falsely offered | P1 | Business rule | Customer | AUTOMATE | Refund panel; rule needs backend confirmation |
| BKG-DETAIL-003 | Preserve booking detail state after refresh | Open details, check eligibility, refresh | Booking values remain correct and transient eligibility state behaves consistently | P2 | Persistence / UI | Customer | AUTOMATE | Booking details; refresh consistency |

### Admin event management

| ID | Name | Preconditions / scenario | Expected result | Priority | Primary type | Role(s) | Suitability | Traceability / API / risk |
|---|---|---|---|---|---|---|---|---|
| ADM-EVT-001 | Open Manage Events as an administrator | Authenticated admin opens Admin → Manage Events | Manage Events page, form, event table, and admin controls are available | P1 | Authorization / UI | Admin | AUTOMATE | Admin navigation, `GET /events` |
| ADM-EVT-002 | Hide or deny Manage Events for a non-admin | Authenticated standard user or anonymous user uses dropdown/direct URL | Admin option is hidden or access is denied; no admin data/actions are exposed | P0 | Security / Authorization | Customer, Anonymous | AUTOMATE | Admin routes; role boundary unconfirmed because only admin role was available |
| ADM-EVT-003 | Create an event with valid mandatory and optional data | Admin submits unique title, valid category/city/date/price/seats, and optional image/description | Event is created once, appears in the table, and success notification is shown | P1 | Functional / Integration | Admin | AUTOMATE | `POST /events`, form, toast |
| ADM-EVT-004 | Block event creation with missing mandatory fields | Omit title, category, venue, city, date, price, or seats using equivalence classes | Submission is blocked and relevant validation appears; no event is persisted | P1 | Validation | Admin | AUTOMATE | Admin event form |
| ADM-EVT-005 | Validate event values and boundaries | Invalid/negative price, zero/negative seats, malformed date, invalid image URL, whitespace title, and meaningful max lengths | Invalid data is rejected; boundary-valid values are accepted where supported | P1 | Validation / Boundary | Admin | AUTOMATE | Event form/API; data integrity |
| ADM-EVT-006 | Edit an owned custom event | Existing editable event changes one field and submits | PUT succeeds, updated values appear in table/details, and success feedback is shown | P1 | Functional / Integration | Admin | AUTOMATE | `PUT /events/{id}`; update persistence |
| ADM-EVT-007 | Prevent editing read-only/featured events | Select an observed read-only event | Edit control is unavailable or action is rejected; original event remains unchanged | P1 | Authorization / State | Admin | AUTOMATE | Admin event rows; read-only rule |
| ADM-EVT-008 | Delete an owned custom event with confirmation | Select Delete, cancel confirmation, then repeat and confirm | Cancel leaves event intact; confirm sends one delete, removes event, and shows success notification | P1 | Functional / Destructive | Admin | AUTOMATE | `DELETE /events/{id}`, dialog/toast |
| ADM-EVT-009 | Handle event CRUD API failures | Simulate create/update/delete 4xx/5xx and timeout | Error feedback appears, form/table state remains truthful, and no phantom record is shown | P1 | Resilience / Integration | Admin | AUTOMATE | Event APIs; admin data integrity |
| ADM-EVT-010 | Respect the custom-event capacity limit | Reach the observed sandbox limit of up to six custom events and attempt another creation | Application rejects or otherwise handles capacity without corrupting existing data | P2 | Boundary / Business rule | Admin | AUTOMATE | Event creation; limit is observed but enforcement is not yet confirmed |

### Admin booking management

| ID | Name | Preconditions / scenario | Expected result | Priority | Primary type | Role(s) | Suitability | Traceability / API / risk |
|---|---|---|---|---|---|---|---|---|
| ADM-BKG-001 | Open Manage Bookings as an administrator | Admin opens Admin → Manage Bookings | Table, status filter, totals, and row actions are available | P1 | Authorization / UI | Admin | AUTOMATE | Admin navigation, `GET /bookings` |
| ADM-BKG-002 | Filter bookings by each supported status | Dataset contains confirmed and cancelled records; choose each status and All | Only records with the selected status appear and counts update consistently | P1 | Functional | Admin | AUTOMATE | Status filter, bookings API |
| ADM-BKG-003 | View booking details in admin modal | Admin selects View for a known booking | Modal shows reference, status, event, customer, ticket, total, and date for that booking | P1 | Functional / UI | Admin | AUTOMATE | Admin modal; cross-entity consistency |
| ADM-BKG-004 | Cancel a confirmed booking as admin | Admin selects Cancel and confirms | Correct booking transitions to cancelled, table refreshes truthfully, and repeat cancellation is handled safely | P0 | Functional / Integration | Admin | AUTOMATE | `DELETE /bookings/{id}`; high-impact state transition |
| ADM-BKG-005 | Handle admin booking action failure | Cancel request fails or times out | Error is shown, modal/table remains accurate, and booking is not falsely marked cancelled | P1 | Resilience / Integration | Admin | AUTOMATE | Admin bookings; mutation failure |
| ADM-BKG-006 | Handle empty admin booking results | Filter or dataset produces zero records | Stable empty table state and total count are shown without stale rows | P2 | Functional / UI | Admin | AUTOMATE | Admin bookings empty state |
| ADM-BKG-007 | Respect the booking capacity limit | Reach the observed sandbox limit of up to nine bookings and attempt another booking | Application rejects or safely handles the capacity condition | P2 | Boundary / Business rule | Customer, Admin | AUTOMATE | `POST /bookings`; limit is observed but enforcement is not confirmed |

### API-driven and cross-page integration

| ID | Name | Preconditions / scenario | Expected result | Priority | Primary type | Role(s) | Suitability | Traceability / API / risk |
|---|---|---|---|---|---|---|---|---|
| API-001 | Return a valid authenticated user from `/auth/me` | Valid bearer token calls current-user endpoint | Response is successful, typed, and identifies the authenticated user only | P0 | API / Security | Customer, Admin | AUTOMATE | `GET /auth/me`; token/session contract |
| API-002 | Reject missing or invalid bearer tokens | Call protected endpoints without/with invalid token | Protected operation returns an authorization failure and does not expose data | P0 | API / Security | Anonymous | AUTOMATE | `/auth/me`, `/events`, `/bookings`; authorization boundary |
| API-003 | Return correctly shaped paginated event data | Request supported page/limit/filter combinations | Status, success flag, records, and pagination metadata are internally consistent | P1 | API | Customer, Admin | AUTOMATE | `GET /events` |
| API-004 | Return correctly shaped paginated booking data | Request supported page/limit/status/event filters | Records, ownership/admin scope, status, and pagination metadata are consistent | P1 | API / Security | Customer, Admin | AUTOMATE | `GET /bookings` |
| API-005 | Keep UI and API consistent after event creation/edit/delete | Mutate event through admin UI, then query it; repeat for update/delete | API state matches UI state and no stale record remains | P1 | Integration | Admin | AUTOMATE | Event CRUD endpoints |
| API-006 | Keep UI and API consistent after booking/cancellation | Create booking, view it in customer/admin pages, cancel it, and query again | Reference, status, seat counts, and totals agree across all views | P0 | Integration | Customer, Admin | AUTOMATE | Booking create/detail/delete endpoints |
| API-007 | Handle malformed/empty/unexpected API responses | Return empty body, malformed JSON, HTML error, or unexpected schema through controlled simulation | Framework/application shows a meaningful error state and does not report false success | P1 | Resilience / API | Customer, Admin | AUTOMATE | All observed API consumers; response handling |
| API-008 | Maintain correlation and useful diagnostics on API failure | Controlled failing request includes status/body/correlation header where supported | Failure is diagnosable without logging secrets or customer passwords/tokens | P2 | API / Resilience | Customer, Admin | AUTOMATE | Base API/error handling; supportability |

## 3. Coverage Matrix

| Application capability | Test count | Test IDs | Main dimensions | Roles | Priority distribution |
|---|---:|---|---|---|---|
| Login/session/logout | 7 | AUTH-001–AUTH-007 | Positive, negative, validation, persistence, security | Customer/Admin/Anonymous | P0:1, P1:6 |
| Registration/password policy | 3 | AUTH-008–AUTH-010 | Positive, duplicate, validation/boundary | Anonymous | P1:3 |
| Home/navigation/routing | 6 | NAV-001–NAV-006 | Navigation, deep links, persistence, authorization | All | P0:1, P1:4, P2:1 |
| Event search/filter/empty/pagination | 10 | EVT-SEARCH-001–010 | Positive, combinations, empty, error, boundary, pagination | Customer/Admin | P1:7, P2:3 |
| Event details/booking | 11 | EVT-DETAIL-001–011 | CRUD-adjacent, validation, boundary, concurrency, resilience | Customer | P0:2, P1:9 |
| Customer bookings/refund | 10 | BKG-CUST-001–007, BKG-DETAIL-001–003 | Ownership, state transitions, empty, refund, persistence | Customer | P0:3, P1:6, P2:1 |
| Admin events | 10 | ADM-EVT-001–010 | Permissions, CRUD, validation, destructive, limits, failures | Admin/Customer/Anonymous | P0:1, P1:8, P2:1 |
| Admin bookings | 7 | ADM-BKG-001–007 | Filter, modal, cancellation, empty, limits, failure | Admin/Customer | P0:1, P1:4, P2:2 |
| API/cross-page integration | 8 | API-001–API-008 | Contract, auth, persistence, malformed responses, diagnostics | All | P0:3, P1:4, P2:1 |

The catalogue contains 72 scenarios. `EVT-SEARCH-010`, capacity-limit cases, and several role/error cases are conditional until the corresponding application behavior is confirmed.

## 4. Business Rule Coverage

| Rule | Evidence | Tests |
|---|---|---|
| Authentication is required for protected customer/admin data | Observed bearer-token API calls and authenticated UI | AUTH-001, AUTH-006, AUTH-007, NAV-005, API-001, API-002 |
| A booking has a quantity range of 1–10 | Observed ticket form and max-10 text | EVT-DETAIL-003, EVT-DETAIL-004 |
| Booking total equals ticket price multiplied by quantity | Observed booking form/confirmation totals | EVT-DETAIL-003, EVT-DETAIL-007, API-006 |
| Booking cannot exceed available seats | Observed availability data and booking domain | EVT-DETAIL-004, EVT-DETAIL-009 |
| Customer bookings are user-scoped | `/bookings` uses authenticated context | BKG-CUST-001, BKG-CUST-004, API-004 |
| Confirmed bookings can transition to cancelled | Observed customer/admin cancel operations | BKG-CUST-005, BKG-CUST-006, ADM-BKG-004 |
| Single-ticket bookings are eligible for a full refund | Observed refund result text | BKG-DETAIL-001, BKG-DETAIL-002; backend rule still requires confirmation |
| Featured/read-only events cannot be edited/deleted | Observed Read-only admin rows | ADM-EVT-007 |
| Sandbox limits are approximately six custom events and nine bookings | User/application observation | ADM-EVT-010, ADM-BKG-007; enforcement requires confirmation |

## 5. Role / Permission Coverage

| Role | Capabilities | Relevant tests |
|---|---|---|
| Anonymous | Login, registration, denied protected access | AUTH-002–005, AUTH-008–010, NAV-005, ADM-EVT-002, API-002 |
| Customer | Browse/search/filter, view events, book, view/cancel own bookings, refund eligibility, logout | AUTH-001–007, NAV-001–006, EVT-*, BKG-*, API-* |
| Admin | All customer capabilities plus Manage Events and Manage Bookings, event CRUD, admin cancellation/modal | AUTH-001–007, ADM-EVT-*, ADM-BKG-*, API-* |
| Standard authenticated user | Expected customer-only behavior | ADM-EVT-002 and NAV-005; requires a dedicated non-admin account to confirm |

## 6. State Transition Coverage

### Event

| State | Allowed transition/action | Invalid/forbidden behavior | Tests |
|---|---|---|---|
| Available custom event | Create → visible; edit → updated; delete → absent | Invalid form, unauthorized edit, failed mutation | ADM-EVT-003–009 |
| Featured/read-only event | Read/view | Edit/delete unavailable or rejected | ADM-EVT-007 |
| Deleted/missing event | None | Details and booking unavailable; safe not-found state | EVT-DETAIL-002, NAV-005 |

### Booking

| State | Allowed transition/action | Invalid/forbidden behavior | Tests |
|---|---|---|---|
| Confirmed | View, check refund, cancel | Duplicate cancel, insufficient seats at creation | BKG-CUST-003–006, BKG-DETAIL-001–002, ADM-BKG-003–005 |
| Cancelled | View historical state | Cancel again must not regress or create a second mutation | BKG-CUST-006, ADM-BKG-004 |
| Missing/unauthorized | None | No unrelated data exposure | BKG-CUST-004, API-002 |

### Authentication

| State | Transition | Invalid behavior | Tests |
|---|---|---|---|
| Anonymous | Valid login/register → authenticated | Invalid credentials/validation remain anonymous | AUTH-001–005, AUTH-008–010 |
| Authenticated | Refresh/navigation → authenticated; logout → anonymous | Protected route after logout is denied | AUTH-006–007, NAV-005 |

## 7. Validation Coverage

- Authentication: required fields, malformed email, invalid credentials, registration uniqueness, password minimum/complexity, confirmation match.
- Event form: required fields, title whitespace, category, city, date, price, seat-count boundaries, optional image/description, meaningful length limits.
- Booking form: required customer fields, email/phone shape, quantity 1/10 boundaries, available-seat boundary, total calculation.
- Filters: supported category/city values, combined criteria, clear/reset, no-result equivalence class.
- Destructive actions: explicit confirmation, canceling confirmation, repeated action safety.

## 8. Error / Resilience Coverage

Covered by the catalogue: auth 4xx, protected-route denial, missing resources, empty collections, event/booking mutation failures, timeout behavior, insufficient seats, duplicate submission, repeated cancellation, malformed/empty API responses, and diagnostic safety.

The live application’s exact error payloads, timeout UX, and retry policy were not fully observable. These should be confirmed with controlled response simulation before finalising expected messages.

## 9. Automation Suitability Summary

| Classification | Approximate count | Examples |
|---|---:|---|
| AUTOMATE | 72 | All deterministic functional, API, validation, state, permission, persistence, and error scenarios listed |
| MANUAL | 0 currently required | No scenario is inherently unsuitable; visual/accessibility review can supplement automation |
| HYBRID | 3 recommended supplements | Responsive layout/navigation, visual quality of error/empty states, real browser/storage behavior across supported browsers |
| DO NOT AUTOMATE | 0 | No identified scenario has sufficiently poor ROI to exclude from the catalogue |

The count is approximate because `EVT-SEARCH-010`, capacity limits, and unconfirmed role/error cases are conditional until the product contract is clarified.

## 10. Potential Duplicate / Low-Value Tests Avoided

- One representative test covers required-field equivalence classes rather than every empty-field permutation.
- Password rules are tested as valid/invalid partitions and boundaries rather than one test per displayed bullet.
- Event categories and cities are data-driven variants of one behavior, not duplicate workflows.
- Shared navigation/header behavior is covered once centrally, with page-specific route assertions only where outcomes differ.
- Booking cancellation is tested from customer and admin contexts because authorization and integration outcomes differ.
- Table/modal behavior is covered at the reusable behavior level and not duplicated for every row.
- API/UI consistency is tested after meaningful mutations rather than rechecking every field in every page.

## 11. Coverage Gaps / Unknowns

1. A separate standard authenticated user was not available; customer-versus-admin permissions require confirmation.
2. Registration backend behavior and exact validation/error responses need controlled verification.
3. Exact refund API/decision logic is not confirmed; only the observed eligibility UI result is confirmed.
4. Pagination controls and sorting were not observed in the live UI; API pagination exists.
5. Exact empty-state messages for events and bookings need confirmation for stable expected outcomes.
6. Backend timeout, malformed-response, and retry UX require controlled simulation.
7. Application source was not available, so stable test IDs and accessibility contracts cannot be verified at source level.
8. Capacity-limit enforcement (six custom events/nine bookings) is observed as an application constraint but not proven at the boundary.
9. File/image upload behavior is not exposed in the current event form beyond an image URL field.
10. Accessibility, responsive layout, browser compatibility, security scanning, rate limiting, and audit logging are outside the functional evidence currently available and need a separate non-functional plan.

## 12. Final Coverage Assessment

| Dimension | Score | Reason |
|---|---:|---|
| Functional coverage | 91 | All observed customer/admin workflows have meaningful scenarios |
| Negative coverage | 84 | Core failures and invalid states are covered; exact backend failures need simulation |
| Boundary coverage | 82 | Quantity, availability, and capacity boundaries are identified; some enforcement is unconfirmed |
| Validation coverage | 88 | Authentication, registration, event, booking, and filter validation included |
| Role/permission coverage | 70 | Admin and customer behavior is mapped, but a separate standard-user account is missing |
| State-transition coverage | 86 | Auth, event, and booking transitions are represented, including invalid repeats |
| Integration coverage | 91 | UI/API persistence and cross-page consistency are strongly covered |
| Error handling coverage | 78 | Failure classes are identified, but live response simulation and exact UX are incomplete |

### Overall design assessment: 84/100

This is a strong functional catalogue for the verified application surface. It is not 100 because role separation, refund backend rules, pagination/sorting, capacity enforcement, and controlled failure behavior still require evidence.

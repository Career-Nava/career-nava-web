# Career Nava Frontend Handoff

## Purpose

This document is a committed frontend handoff for future engineering or Codex sessions working in the Career Nava Angular repository.

It summarizes:

- the current route structure
- implemented MVP foundation slices
- backend API contracts currently wired in the UI
- shared component boundaries
- known caveats and deferred work
- recommended next iterations

This document is intended to reduce re-discovery work and make future scope decisions more explicit.

## Stack and App Structure

- Angular standalone application
- Role-based areas:
  - `admin`
  - `mentor`
  - `mentee`
- Bootstrap/grid layout conventions are used across pages
- Services follow shared API conventions through `RestService`
- Authentication uses a bearer JWT attached by `AuthInterceptor`
- `401` responses trigger logout behavior through the existing interceptor
- There is no `lint` script in `package.json`
- There is no `test` script in `package.json`

High-level frontend structure:

- role routes are defined in `src/app/app.routes.ts`
- API services live in `src/app/services/`
- admin pages live in `src/app/modules/admin/`
- mentor pages live in `src/app/modules/mentor/`
- mentee pages live in `src/app/modules/student/`
- public landing/blog pages live in `src/app/modules/landing/`
- shared reusable session UI lives in `src/app/modules/shared/`

## Current Branch Baseline

This handoff reflects the current baseline on:

- branch: `develop`

The branch currently includes:

- role routing and shell stabilization
- backend-backed sessions pages
- backend-backed admin mentor management UI
- backend-backed admin scholarship management UI
- backend-backed admin blog/resource management UI
- backend-backed safe admin session operations UI
- backend-backed admin overview dashboard
- Phase 1 auth/session stabilization:
  - OAuth token restore now refreshes the current user through `GET /api/User/me`
  - `UserService` uses the backend `ApiResponse<T>` wrapper
  - `UserService.getUserById(...)` uses `/api/User/GetUserById/{id}`
  - mentor booking links are available to authenticated mentees through the API contract

## Route Summary

### Public

- `/` -> `/home`
- `/home`
- `/about`
- `/blog`
- `/blog/:slug`

### Auth

- `/sign-in`
- `/sign-up`

### Admin

- `/admin` -> `/admin/overview`
- `/admin/overview`
- `/admin/profile`
- `/admin/mentors`
- `/admin/mentors/preview/:id`
- `/admin/event-types`
- `/admin/event-types/:eventTypeId`
- `/admin/sessions`
- `/admin/payments`
- `/admin/payments/:paymentId`
- `/admin/payment-events`
- `/admin/payment-events/:paymentEventId`
- `/admin/scholarships`
- `/admin/scholarships/preview/:id`
- `/admin/blogs`

### Mentor

- `/mentor` -> `/mentor/overview`
- `/mentor/overview`
- `/mentor/profile`
- `/mentor/account`
- `/mentor/sessions`

### Mentee

- `/mentee` -> `/mentee/mentors`
- `/mentee/mentors`
- `/mentee/mentors/mentor-details/:id`
- `/mentee/sessions`
- `/mentee/profile`
- `/mentee/scholarships`
- `/mentee/scholarship-details/:id`

### Fallback

- `**` -> `PageNotFoundComponent`

Route stabilization notes:

- stale `/teacher` routes were removed from the current role flow
- mentor naming was standardized across role routes and layout wiring
- role redirects were added for `/admin`, `/mentor`, and `/mentee`
- a 404 fallback page was added
- admin and mentor route areas both have working shell pages or backend-backed pages

## Authentication and API Usage

### Auth behavior

- `AuthInterceptor` attaches `Authorization: Bearer <token>` when a token exists
- `401` responses trigger logout through the existing auth service
- page components typically still surface a local `401` message for clarity after interceptor behavior
- persisted local sessions are refreshed from `/api/User/me` when the auth service initializes
- OAuth callback tokens are accepted only after the frontend can refresh the real current user from the backend

### API conventions

- most services extend `RestService`
- `RestService` builds `baseUrl` as `{apiBaseUrl}/{resource}`
- API responses commonly use `ApiResponse<T>`:
  - `success`
  - `statusCode`
  - `message`
  - `data`

### Current admin error handling pattern

Completed admin pages use page-level state handling:

- `loading` boolean
- `error: string | null`
- explicit `403` messages
- no silent conversion of `401`/`403` to empty results

### Admin UI conventions

- Table action columns use compact icon buttons with accessible titles or labels.
- Lifecycle/status changes live in detail, edit, or manage panels where practical, not as large row text buttons.
- Operational filters are collapsed by default; search is the primary visible control.
- Raw technical ID filters should not be exposed to admin users unless there is a clear operational need.
- Admin preview/open actions must render the real user-facing detail experience, not fake admin detail stubs.
- Admin mentor preview is a visible table action for every listed mentor row and can render draft, inactive, and suspended mentor profiles for admin review with admin-only data. Public/mentee mentor detail remains active-account plus active-profile only.
- Preview actions are visual review; edit/manage actions contain operational forms and status controls.
- Admin table filters auto-apply on change; filter panels should not include Apply buttons.
- Toolbar order is primary action, Filter, Clear filters, Refresh. Clear filters is a compact icon action that renders only when the filter panel is open or filters/search are active, and it resets search plus active operational filters. Refresh reloads the current filtered view and must not clear filters.
- Blog/resource author selection uses a user dropdown instead of raw internal ids. Anonymous author maps to a nullable author user id, and mentees are excluded from author choices.
- Frontend route guards remain UX routing only; backend authorization protects sensitive admin endpoints.
- Mentor self-service profile/detail pages should reuse the same card padding, section kicker spacing, and dashboard grid rhythm as the mentee mentor/scholarship detail pages instead of introducing one-off spacing systems.
- Prefer Bootstrap utilities plus existing shared app/admin dashboard classes for layout, spacing, cards, grids, and action placement before adding page-specific SCSS. Keep component SCSS for brand-specific visuals or cases utilities cannot express cleanly.
- For dashboard management/profile UIs, prefer compact icon-only action controls when the action is obvious, matching the admin table row action pattern, and avoid excessive font-weight outside page titles, section headings, and intentional emphasis.
- Persistence actions inside edit states, especially Save and Cancel, should keep icon + visible text labels for clarity. Primary CTAs such as Preview public profile should also keep icon + visible text and preserve strong contrast across default, hover, focus, and active states.
- Save and Cancel in dashboard edit states should be compact, equal-sized pill buttons, and taxonomy/chip selectors should use standardized pill sizing, spacing, and wrapping so expertise, disciplines, and fluency controls feel visually consistent.

## Dashboard Action Button Standardization

Status: Phase 4D.1-4D.4 implemented and manually visually approved by the product owner

Phase 4D was completed with an incremental CSS/SCSS utility-first approach. A broad shared Angular `app-action-button` migration was previously attempted across admin mentors, sessions, scholarships, blogs/resources, and `/mentor/profile`. Although it compiled, it touched too many surfaces at once, caused UI regressions, and was reverted. Do not recreate or reintroduce `app-action-button`; any remaining mentions should be historical docs only.

The completed Phase 4D implementation uses shared admin action utilities in `src/styles/admin-console.scss` and applies those utilities directly to the actual clickable element (`button`, `a`, or router-link anchor), not only to inner wrapper spans.

Current shared admin action utilities:

- `admin-action-pill`
- `admin-action-pill--primary`
- `admin-action-pill--ghost`
- `admin-action-pill--danger`
- `admin-action-pill--compact`
- `admin-action-content`
- `admin-action-icon`
- `admin-action-icon--primary`

The visual source of truth for the reset was the approved `/mentor/profile` dashboard action treatment in `src/styles/mentor-profile.scss`. `/mentor/profile` remained a read-only reference during Phase 4D.

### Phase 4D sub-phases

#### Phase 4D.1 - Admin Mentors Action Button Utility Pilot

Status: Implemented and manually visually approved by the product owner

Scope:

- `/admin/mentors`.
- Corrected after reset against the `/mentor/profile` visual reference.
- Defined/refined shared CSS/SCSS utility classes for dashboard action buttons in `src/styles/admin-console.scss`.
- Applied utilities to admin mentor toolbar, filter, clear, refresh, row preview/manage/edit actions, and form/panel Close/Onboard/Save actions where applicable.
- Preserve all current behavior and handlers.
- Do not create a shared Angular button component.
- Do not modify `/mentor/profile`; use it only as a read-only visual reference.

#### Phase 4D.2 - Admin Scholarships Action Button Migration

Status: Implemented and manually visually approved by the product owner

Scope:

- `/admin/scholarships`.
- Reused the corrected admin utilities.
- Standardized add/create, preview/view, edit/manage, official listing, filter, clear, refresh, Close, Add/Remove benefit, and Save actions where present.
- Preserve lifecycle behavior.

#### Phase 4D.3 - Admin Blogs/Resources Action Button Migration

Status: Implemented and manually visually approved by the product owner

Scope:

- `/admin/blogs`; resources are managed through this route and no separate `/admin/resources` admin component was found.
- Reused the corrected admin utilities.
- Standardized create, edit/manage, preview/open, unavailable preview, filter, clear, refresh, Close, Add/Remove block, and Save actions where present.
- Preserve author selector and blog lifecycle behavior.

#### Phase 4D.4 - Admin Sessions Action Button Migration

Status: Implemented and manually visually approved by the product owner

Scope:

- `/admin/sessions`.
- Reused the corrected admin utilities.
- Standardized manage/open meeting, filter, clear, refresh, and close panel actions.
- Session lifecycle and payment-sensitive behavior were not changed.

#### Phase 4D.5 - Mentor Profile Action Alignment Review

Status: Not needed / no implementation required at this time

Scope:

- `/mentor/profile`.
- `/mentor/profile` was the visual source of truth for Phase 4D and should remain untouched unless a future task explicitly scopes an improvement.
- Preserve Bootstrap-first layout, read-first mentor profile behavior, icon-only secondary actions, Save/Cancel icon + text equal-sized compact pill buttons, standardized taxonomy pills, and the premium preview CTA.

### Dashboard action button rules

- Prefer shared CSS/SCSS utility classes before creating Angular button components.
- Apply action utilities directly to the clickable element, not only to inner wrapper spans.
- Avoid mixing old Bootstrap/admin action classes with corrected utilities when they conflict.
- Use icon-only buttons for obvious compact row/secondary actions.
- Always include `title` and `aria-label` for icon-only actions.
- Use icon + visible text for Save, Cancel, Create/Add, and primary CTAs.
- Save and Cancel should be compact, equal-sized pill buttons when paired.
- Destructive actions should use restrained danger styling and preserve confirmation behavior where applicable.
- Avoid raw Bootstrap default button colors for final dashboard action styling.
- Avoid broad cross-dashboard button migrations.
- Avoid deep page-specific SCSS for basic button spacing/layout.
- The product owner performs manual visual smoke tests; do not run browser automation or screenshot tooling unless explicitly requested.
- Consider a shared Angular action button component only after the CSS utility approach remains stable across multiple admin pages and a future task explicitly scopes that work.

### Validation expectations

- Run `npm run build` for any implementation phase.
- Product owner performs manual visual smoke tests for touched UI pages before expanding to another page.
- Do not run browser automation or screenshot tooling unless explicitly requested.

## Phase 4E - Dashboard CTA Button Standardization

Status: Complete through Phase 4E.5 / manually visually approved by the product owner

Phase 4E should standardize user-facing CTA buttons across mentor, mentee, and admin preview dashboards. Do not confuse this with Phase 4D admin operational actions. Phase 4D handled actions such as Save, Close, Filter, Refresh, Manage, Preview, and Edit. Phase 4E should handle CTAs such as Book session, Schedule, Open meeting, Join Session, View mentor profile, View scholarship, Visit scholarship, Open official page, and View LinkedIn.

Do not blindly reuse `admin-action-pill` or other Phase 4D admin utilities for Phase 4E. Those utilities live in `src/styles/admin-console.scss` and are admin-console operational action utilities. Phase 4E uses a separate dashboard CTA utility family in `src/styles/dashboard-cta.scss`, imported globally from `src/styles.scss`.

Current shared dashboard CTA utilities:

- `dashboard-cta`
- `dashboard-cta--primary`
- `dashboard-cta--secondary`
- `dashboard-cta--full`
- `dashboard-cta--compact`
- `dashboard-cta__content`

Phase 4E.1 approval note:

- Product-owner manual smoke testing requested primary CTA color calibration toward the Career Nava yellow family: `#F6C360` default and `#EEBB62` hover/active.
- The shared mentor detail LinkedIn CTA should render consistently when a valid `linkedInUrl` or legacy `linkedIn` value exists.
- Final refinement requested admin mentor preview LinkedIn CTA consistency, including LinkedIn values stored without an explicit `http://` or `https://` protocol.
- Final refinement requested mentor dashboard sidebar yellow alignment to the same `#F6C360` / `#EEBB62` family, without changing admin or mentee sidebars.
- Phase 4E.1 was manually visually approved by the product owner after final refinement.

Discovered Phase 4E target routes and files:

- `/admin/mentors/preview/:id` -> `MentorDetailsComponent`, using `src/app/modules/student/mentors/mentor-details/mentor-details.component.html` and `.scss`.
- `/mentor/profile/preview` -> `MentorDetailsComponent`, using `src/app/modules/student/mentors/mentor-details/mentor-details.component.html` and `.scss`.
- `/mentee/mentors/mentor-details/:id` -> `MentorDetailsComponent`, using `src/app/modules/student/mentors/mentor-details/mentor-details.component.html` and `.scss`.
- `/mentee/mentors` -> `MentorsComponent`, using `src/app/modules/student/mentors/mentors.component.html` and `.scss`.
- `/admin/scholarships/preview/:id` -> `ScholarshipDetailsComponent`, using `src/app/modules/student/scholarships/scholarship-details/scholarship-details.component.html` and `.scss`.
- `/mentee/scholarships` -> `ScholarshipsComponent`, using `src/app/modules/student/scholarships/scholarships.component.html` and `.scss`.
- `/mentee/scholarships/:id` and `/mentee/scholarship-details/:id` -> `ScholarshipDetailsComponent`, using `src/app/modules/student/scholarships/scholarship-details/scholarship-details.component.html` and `.scss`.
- `/mentor/sessions` -> `MentorSessionsComponent`, using shared `SessionGroupPanelComponent` and `SessionCardComponent` under `src/app/modules/shared/session-group-panel/` and `src/app/modules/shared/session-card/`.
- `/mentee/sessions` -> `StudentSessionsComponent`, also using shared `SessionGroupPanelComponent` and `SessionCardComponent`.

Discovered CTA text/actions:

- Mentor detail/admin preview/mentor preview: `Book session`, `Preview scheduling`, `Schedule with <mentor>`, `Preview scheduling flow`, `View LinkedIn`.
- Mentee mentor list: `View mentor profile`.
- Scholarship list/detail/admin preview: `View scholarship`, `Visit scholarship`, `Open official scholarship page`.
- Session cards: `Open meeting`, `Join Session`.

### Phase 4E sub-phases

#### Phase 4E.1 - CTA Utility Baseline

Status: Implemented and manually visually approved by the product owner

Scope:

- Inspect current CTA styling across mentor, mentee, and admin preview surfaces.
- Established shared CTA utility classes in `src/styles/dashboard-cta.scss`.
- Used the existing yellow/gold CTA direction as the primary CTA language, refined to `#F6C360` default and `#EEBB62` hover/active after product-owner feedback.
- Migrated the shared mentor detail CTA elements used by `/mentor/profile/preview` as the pilot: Preview scheduling, View LinkedIn, and Preview scheduling flow.
- Refined LinkedIn CTA visibility in the shared mentor detail component to use a valid `linkedInUrl` or legacy `linkedIn` value when present.
- Refined admin preview LinkedIn URL normalization so `linkedin.com/...` and `www.linkedin.com/...` values render through the same secondary CTA while arbitrary invalid values stay hidden.
- Aligned the mentor dashboard sidebar gradient to the Phase 4E.1 yellow family; admin and mentee sidebar themes remain separate.
- Because `/mentor/profile/preview`, `/admin/mentors/preview/:id`, and `/mentee/mentors/mentor-details/:id` reuse `MentorDetailsComponent`, the same CTA utility markup is now present on those shared mentor detail surfaces.
- Do not alter Phase 4D admin action utilities except for a tiny documentation clarification if needed.
- Phase 4E.1 is the approved CTA utility baseline for subsequent Phase 4E pages.

#### Phase 4E.2 - Mentor Preview/Profile CTA Migration

Status: Implemented and manually visually approved by the product owner

Scope:

- `/mentor/profile/preview`.
- `/admin/mentors/preview/:id`.
- `/mentee/mentors/mentor-details/:id`.
- `/mentee/mentors`.
- Migrated `/mentee/mentors` card `View mentor profile` CTAs to the approved full-width primary dashboard CTA utility.
- Audited shared `MentorDetailsComponent` CTAs for `/mentor/profile/preview`, `/admin/mentors/preview/:id`, and `/mentee/mentors/mentor-details/:id`; Phase 4E.1 CTA utilities remain the active implementation for Book session, View LinkedIn, Preview scheduling, Preview scheduling flow, and Schedule with mentor.
- Preserve router links, booking/scheduling behavior, LinkedIn behavior, filtering/search, and public mentor visibility rules.
- Phase 4E.2 was manually visually approved by the product owner.

#### Phase 4E.3 - Scholarship CTA Migration

Status: Implemented and manually visually approved by the product owner

Scope:

- `/admin/scholarships/preview/:id`.
- `/mentee/scholarships`.
- `/mentee/scholarships/:id` and `/mentee/scholarship-details/:id`.
- Migrated `/mentee/scholarships` card `View scholarship` CTAs to the approved full-width primary dashboard CTA utility.
- Migrated scholarship detail hero `Visit scholarship` CTA to the approved compact primary dashboard CTA utility.
- Migrated scholarship detail sidebar `Open official scholarship page` CTA to the approved full-width primary dashboard CTA utility.
- Migrated unavailable scholarship link states to disabled secondary dashboard CTA utilities.
- Refined `/mentee/scholarships` card category/audience labels into rounded taxonomy chips after product-owner feedback.
- `/admin/scholarships/preview/:id` reuses `ScholarshipDetailsComponent`, so the detail CTA migration also covers admin scholarship preview.
- Preserve router links, external `href`/`target`/`rel` behavior, bookmark/shortlist behavior, filtering/search, scholarship visibility/status logic, and admin preview behavior.
- Phase 4E.3 was manually visually approved by the product owner after the taxonomy pill refinement.

#### Phase 4E.4 - Session CTA Migration

Status: Implemented and manually visually approved by the product owner

Scope:

- `/mentor/sessions`.
- `/mentee/sessions`.
- Shared session card CTA surface.
- Migrated the shared session card action surface used for Open meeting, Join Session, and disabled no-link states to the approved full-width primary dashboard CTA utility.
- Migrated the mentee join/payment confirmation modal CTAs, Pay & Join and Join Session, to the approved dashboard CTA utility family.
- Preserved session grouping, session action labels, disabled bindings, payment modal behavior, join/payment confirmation behavior, click handlers, and meeting-link behavior.
- Mentor and shared session components remain payment-agnostic; mentee payment behavior remains only in the mentee session page.

#### Phase 4E.5 - CTA Audit and Docs Closeout

Status: Complete

Scope:

- Audit all Phase 4E target routes.
- Confirm CTA utilities are applied directly to actual clickable elements.
- Update docs and tracker.
- Do not run browser automation or screenshot tooling unless explicitly requested.

Audit findings:

- Phase 4E.1 through Phase 4E.4 are complete and manually visually approved by the product owner.
- The approved CTA utility family remains `dashboard-cta`, `dashboard-cta--primary`, `dashboard-cta--secondary`, `dashboard-cta--full`, `dashboard-cta--compact`, and `dashboard-cta__content`.
- The audited Phase 4E target CTA labels now use the approved CTA utilities on their actual clickable elements: Book session, Preview scheduling, Preview scheduling flow, Schedule with mentor, View LinkedIn, View mentor profile, View scholarship, Visit scholarship, Open official scholarship page, Open meeting, Join Session, and Pay & Join.
- Remaining raw Bootstrap buttons found by source search are outside Phase 4E scope, such as public landing/auth/blog/page-not-found buttons, back-navigation links on detail pages, and the approved `/mentor/profile` dashboard action baseline.
- Phase 4D admin operational utilities remain separate and were not replaced with CTA utilities. The reverted broad `app-action-button` approach remains historical only and should not be retried.

### Phase 4E guardrails

- Do not change business logic, booking logic, scheduling logic, payment logic, session lifecycle logic, or public mentor visibility rules.
- Do not change URLs, router links, `href`s, `target` behavior, disabled states, click handlers, or form behavior.
- Do not replace Phase 4D admin action utilities with CTA utilities.
- Apply CTA utility classes directly to actual clickable elements, not only to child spans.
- Preserve visible labels, icons, `title`, `aria-label`, disabled states, and external-link behavior.
- Product owner performs manual visual smoke tests. Do not run browser automation or screenshot tooling unless explicitly requested.

### Phase 4E acceptance criteria

- User-facing CTAs across targeted mentor, mentee, and admin preview routes share a consistent visual language.
- Primary CTAs have consistent height, radius, spacing, icon placement, hover/focus affordance, and full-width behavior where intended.
- Secondary CTAs such as LinkedIn/open external links have consistent neutral treatment.
- CTA classes are applied directly to actual clickable elements.
- Existing behavior is preserved.
- Product owner manually visually approves the touched routes.

## Implemented Features

### Role Routing and Shells

Implemented:

- admin, mentor, and mentee route areas are explicitly separated
- role redirects exist for each authenticated area root
- stale teacher terminology was removed from the active route structure
- fallback 404 route exists
- admin and mentor area shells were stabilized before backend-backed slices were added

Notes:

- admin layout routes now point to Career Nava-aligned pages
- mentor role area uses `mentor` consistently
- public and authenticated navigation links were corrected to safe active routes

### Sessions

Backend-backed sessions pages are implemented for all three role contexts.

#### Service methods

- `getMyMenteeSessions()`
- `getMyMentorSessions()`
- `getAdminSessions(filters?)`
- `getAdminSessionById(sessionId)`
- `completeAdminSession(sessionId)`
- `cancelAdminSession(sessionId)`
- `moveAdminSessionToPending(sessionId)`

#### Endpoint contracts

- `/mentee/sessions` -> `GET /api/Session/me/mentee`
- `/mentor/sessions` -> `GET /api/Session/me/mentor`
- `/admin/sessions` -> `GET /api/Session`

#### Session behavior summary

- mentee and mentor pages no longer pass IDs from local storage
- mentee page uses current-user endpoint
- mentor page uses current-user endpoint
- admin sessions remain table-based with backend filter controls
- admin session detail is wired to the safe backend detail endpoint
- admin status actions are limited to complete, cancel, and move to pending from the detail/manage panel
- admin session table rows use compact icon actions only
- advanced session filters are collapsed by default and do not expose raw mentor profile or mentee user IDs
- admin session UI does not grant paid access and does not mutate Calendly state
- mentor does not see payment prompts
- payment behavior remains mentee-only
- Phase 5.3 removed the hardcoded Paystack Shop URL from `/mentee/sessions`
- unpaid paid sessions now call backend payment initialization before opening checkout
- payment verification is requested through the backend and frontend code does not decide payment success or booked access
- after successful backend verification, the mentee session list is refreshed so paid/booked state comes from the API

#### Shared session UI

Shared session components:

- `src/app/modules/shared/session-card/`
- `src/app/modules/shared/session-group-panel/`

Responsibilities:

- `SessionCardComponent`
  - owns rendering of an individual session card
  - handles shared card-level display structure
  - contains no payment-specific logic

- `SessionGroupPanelComponent`
  - owns grouped panel layout
  - owns tabs
  - owns loading skeletons
  - owns grouped empty states
  - owns the responsive card grid
  - renders `SessionCardComponent`

Important boundary:

- payment and join/payment flow remains only in the mentee session page
- mentor and shared session components must remain payment-agnostic
- Paystack webhook/callback handling is backend-owned and implemented in Phase 5.4; the frontend should not process raw provider webhook payloads

### Admin Mentors

Backend-wired admin mentor management is implemented.

#### Route and service contract

- `/admin/mentors` -> `getAdminMentors()` -> `GET /api/Mentor/GetAllMentorsForAdmin`
- `getEligibleMentorUsers()` -> `GET /api/Mentor/Admin/EligibleUsers`
- `onboardExistingUser(...)` -> `POST /api/Mentor/Admin/OnboardExistingUser`
- `getAdminMentorById(id)` -> `GET /api/Mentor/Admin/GetMentorById/{id}`
- `updateAdminMentor(id, ...)` -> `PUT /api/Mentor/Admin/UpdateMentor/{id}`
- `updateAdminMentorStatus(id, status)` -> `PATCH /api/Mentor/Admin/UpdateStatus/{id}`

#### Fields shown

- Mentor
- Email
- Title / Company
- Status
- Calendly
- Sessions
- Reviews

#### Behavior

- admin list, detail, edit, and onboarding panels
- eligible-user lookup for mentor onboarding
- existing-user promotion/onboarding into mentor profile
- operational/profile field editing
- mentor profile status changes for `draft`, `active`, `inactive`, and `suspended` from the edit/manage form
- mentor table rows show profile status as a badge and use compact icon actions
- mentor preview opens the mentee-style mentor detail experience under `/admin/mentors/preview/:id` for active and non-public admin-review profiles
- `/admin/mentors/preview/:id` uses the mentor `userId` route param, matching the public mentor detail route shape used by the reused mentee-facing detail component
- status UI makes profile visibility separate from account access
- loading state with spinner
- error state with explicit messages
- empty state if no mentors are returned
- `401` page message while preserving interceptor logout behavior
- `403` message: user does not have access to view mentors

Public mentee mentor browsing and mentor details were preserved.

### Admin Scholarships

Backend-wired admin scholarship management is implemented.

#### Route and service contract

- `/admin/scholarships` -> `getAdminScholarships()` -> `GET /api/Scholarship/GetAllScholarshipsForAdmin`
- `getAdminScholarshipById(id)` -> `GET /api/Scholarship/Admin/GetScholarshipById/{id}`
- `createAdminScholarship(...)` -> `POST /api/Scholarship/Admin/CreateScholarship`
- `updateAdminScholarship(id, ...)` -> `PUT /api/Scholarship/Admin/UpdateScholarship/{id}`
- `publishAdminScholarship(id)` -> `PATCH /api/Scholarship/Admin/Publish/{id}`
- `moveAdminScholarshipToDraft(id)` -> `PATCH /api/Scholarship/Admin/MoveToDraft/{id}`
- `closeAdminScholarship(id)` -> `PATCH /api/Scholarship/Admin/Close/{id}`
- `archiveAdminScholarship(id)` -> `PATCH /api/Scholarship/Admin/Archive/{id}`

#### Fields shown

- Scholarship
- Category
- Funding
- Status
- Deadline
- Benefits
- Interested
- Link

#### Behavior

- admin list, detail, create, and edit panels
- benefit editing through simple replacement payloads
- publish, move-to-draft, close, and archive status actions from the edit/manage form
- table preview opens the mentee-style scholarship detail experience under `/admin/scholarships/preview/:id`
- draft, closed, and archived records do not expose public preview
- confirmation prompts for operational status changes
- loading state with spinner
- error state with explicit messages
- empty state if no scholarships are returned
- `401` page message while preserving interceptor logout behavior
- `403` message: user does not have access to view scholarships

#### Compatibility

- public scholarship browsing remains on the public scholarship service method
- public scholarship detail remains unchanged

#### Known implementation detail

The scholarship model file currently contains a typo:

- `src/app/services/scholarship/shcolarship.model.ts`

This typo is real and should be cleaned up later, but it was intentionally not renamed during the read-only admin slices to avoid expanding scope and creating broad import churn.

### Admin Blogs / Resources

Backend-wired admin blogs/resources management is implemented.

#### Route and service contract

- `/admin/blogs` -> `getAdminBlogs()` -> `GET /api/Blog/GetAllBlogsForAdmin`
- `getAdminBlogById(id)` -> `GET /api/Blog/Admin/GetBlogById/{id}`
- `createAdminBlog(...)` -> `POST /api/Blog/Admin/CreateBlog`
- `updateAdminBlog(id, ...)` -> `PUT /api/Blog/Admin/UpdateBlog/{id}`
- `publishAdminBlog(id)` -> `PATCH /api/Blog/Admin/Publish/{id}`
- `moveAdminBlogToDraft(id)` -> `PATCH /api/Blog/Admin/MoveToDraft/{id}`
- `archiveAdminBlog(id)` -> `PATCH /api/Blog/Admin/Archive/{id}`

#### Fields shown

- Blog / Resource
- Category
- Author
- Reading Time
- Created
- Content Blocks
- Status

#### Behavior

- admin list, detail, create, and edit panels
- MVP-simple content block editing
- publish, move-to-draft, and archive status actions from the edit/manage form
- published resources open through the real public slug route at `/blog/:slug`
- draft and archived resources do not expose public preview
- confirmation prompts for operational status changes
- loading state with spinner
- error state with explicit messages
- empty state if no blog/resource records are returned
- `401` page message while preserving interceptor logout behavior
- `403` message: user does not have access to view blogs

#### Compatibility

- public blog listing remains unchanged
- public blog detail remains unchanged

### Admin Overview

Backend-backed admin overview dashboard is implemented.

#### Route and service contract

- `/admin/overview` -> `getOverview()` -> `GET /api/Admin/GetOverview`

#### Dashboard cards

- Mentors
  - total mentors
  - active mentors
  - inactive mentors

- Sessions
  - total sessions
  - upcoming sessions
  - completed sessions
  - pending sessions when available, otherwise safe numeric fallback

- Scholarships
  - total scholarships

- Blogs / Resources
  - total blogs/resources

- Mentees
  - total mentees
  - total users

#### Links from overview

The overview links to existing admin pages:

- `/admin/mentors`
- `/admin/sessions`
- `/admin/scholarships`
- `/admin/blogs`

#### Behavior

- backend-backed summary dashboard
- loading state with spinner
- explicit error state
- `401` page message while preserving interceptor logout behavior
- `403` page message: user does not have access to view the admin overview
- responsive card grid that stacks on mobile
- no CRUD or mutation actions

### Mentor Self-Service

Backend-wired mentor self-service profile management is implemented.

#### Route and service contract

- `/mentor/profile` -> `getSelfProfile()` -> `GET /api/Mentor/Self/Profile`
- `/mentor/profile/preview` -> reuses the mentor detail experience with mentor-scoped self-profile data
- `updateSelfProfile(payload)` -> `PUT /api/Mentor/Self/Profile`

#### Behavior

- `/mentor/profile` is now read-first rather than a single giant form
- mentors can view their own profile content, visibility state, scheduling/event-type state, and operational read-only metadata
- mentors can edit safe user-facing fields through section-level edit flows for content, taxonomy, and experiences
- the preview route shows the mentee-style mentor detail experience even when the mentor is not publicly active, with a clear preview-only notice
- the scheduling section is read-only and only displays real backend data returned from the mentor self-profile contract
- mentors cannot edit lifecycle/admin fields such as account active state, mentor profile status, verification, role, ratings, reviews, or session counts
- the page shows loading, error, per-section save-success, and per-section save-error states
- the page makes profile visibility explicit so mentors can tell whether their profile is live or still non-public
- admin mentor preview and admin manage/edit remain separate from mentor self-service
- public mentor discovery remains active-account plus active-profile only

## Shared Components

Shared components currently important to future work:

- `src/app/modules/shared/session-card/`
  - shared individual session card UI

- `src/app/modules/shared/session-group-panel/`
  - shared grouped session page UI

- `src/app/shared/shared.module.ts`
  - exports common Angular/Bootstrap/router/font-awesome dependencies used by many standalone pages

Guidance:

- reuse session shared components only for session concerns
- do not force mentor/scholarship/blog admin tables into the session shared abstractions
- keep mentee-only payment behavior out of shared session components

## Service Method Summary

### Sessions

- `SessionService.getMyMenteeSessions()` -> `GET /api/Session/me/mentee`
- `SessionService.getMyMentorSessions()` -> `GET /api/Session/me/mentor`
- `SessionService.getAdminSessions(filters?)` -> `GET /api/Session`
- `SessionService.getAdminSessionById(sessionId)` -> `GET /api/Session/Admin/GetSessionById/{sessionId}`
- `SessionService.completeAdminSession(sessionId)` -> `PATCH /api/Session/Admin/Complete/{sessionId}`
- `SessionService.cancelAdminSession(sessionId)` -> `PATCH /api/Session/Admin/Cancel/{sessionId}`
- `SessionService.moveAdminSessionToPending(sessionId)` -> `PATCH /api/Session/Admin/MoveToPending/{sessionId}`

### Payments

- `PaymentService.initializeSessionPayment(sessionId)` -> `POST /api/Payment/Sessions/{sessionId}/Initialize`
- `PaymentService.verifyPayment(request)` -> `POST /api/Payment/Verify`
- `/mentee/sessions` uses these endpoints for `Pay & Join`; the frontend sends only safe payment identifiers for verification and never sends amount, currency, status, or a success flag.
- `PaymentService.getAdminPayments(filters?)` -> `GET /api/Payment/Admin`
- `PaymentService.getAdminPaymentById(paymentId)` -> `GET /api/Payment/Admin/{paymentId}`
- `PaymentService.getAdminPaymentEvents(filters?)` -> `GET /api/Payment/Admin/Events`
- `PaymentService.getAdminPaymentEventsByPaymentId(paymentId)` -> `GET /api/Payment/Admin/{paymentId}/Events`
- `PaymentService.getAdminPaymentEventById(paymentEventId)` -> `GET /api/Payment/Admin/Events/{paymentEventId}`
- `/admin/payments` and `/admin/payment-events` use these endpoints for read-only audit visibility. Admin UI does not decide payment success, paid access, amount, or references.

### Mentors

- `MentorService.getAllMentors()` -> public mentor list
- `MentorService.getMentorById(id)` -> public mentor detail
- `MentorService.getSelfProfile()` -> `GET /api/Mentor/Self/Profile`
- `MentorService.updateSelfProfile(payload)` -> `PUT /api/Mentor/Self/Profile`
- `MentorService.getAdminMentors()` -> `GET /api/Mentor/GetAllMentorsForAdmin`
- `MentorService.getEligibleMentorUsers()` -> `GET /api/Mentor/Admin/EligibleUsers`
- `MentorService.onboardExistingUser(...)` -> `POST /api/Mentor/Admin/OnboardExistingUser`
- `MentorService.getAdminMentorById(id)` -> `GET /api/Mentor/Admin/GetMentorById/{id}`
- `MentorService.updateAdminMentor(id, ...)` -> `PUT /api/Mentor/Admin/UpdateMentor/{id}`
- `MentorService.updateAdminMentorStatus(id, status)` -> `PATCH /api/Mentor/Admin/UpdateStatus/{id}`
- `CalendlyService.getBookingLink(mentorId)` -> `GET /api/calendly/booking-link?mentorId={id}` for authenticated booking access

### Scholarships

- `ScholarshipService.getAllScholarships()` -> public scholarship list
- `ScholarshipService.getScholarshipById(id)` -> public scholarship detail
- `ScholarshipService.getMenteeScholarships()` -> `GET /api/Scholarship/me`
- `ScholarshipService.getSavedScholarships()` -> `GET /api/Scholarship/me/saved`
- `ScholarshipService.getMenteeScholarshipById(id)` -> `GET /api/Scholarship/me/{id}`
- `ScholarshipService.saveScholarship(id)` -> `POST /api/Scholarship/{id}/save`
- `ScholarshipService.deleteSavedScholarship(id)` -> `DELETE /api/Scholarship/{id}/save`
- `ScholarshipService.getAdminScholarships()` -> `GET /api/Scholarship/GetAllScholarshipsForAdmin`
- `ScholarshipService.getAdminScholarshipById(id)` -> `GET /api/Scholarship/Admin/GetScholarshipById/{id}`
- `/mentee/scholarships` uses backend current-user saved-scholarship endpoints for bookmark state and bookmark mutations. The frontend no longer uses a cache-only bookmark source of truth and does not send `userId` for bookmark operations.
- `ScholarshipService.createAdminScholarship(...)` -> `POST /api/Scholarship/Admin/CreateScholarship`
- `ScholarshipService.updateAdminScholarship(id, ...)` -> `PUT /api/Scholarship/Admin/UpdateScholarship/{id}`
- `ScholarshipService.publishAdminScholarship(id)` -> `PATCH /api/Scholarship/Admin/Publish/{id}`
- `ScholarshipService.moveAdminScholarshipToDraft(id)` -> `PATCH /api/Scholarship/Admin/MoveToDraft/{id}`
- `ScholarshipService.closeAdminScholarship(id)` -> `PATCH /api/Scholarship/Admin/Close/{id}`
- `ScholarshipService.archiveAdminScholarship(id)` -> `PATCH /api/Scholarship/Admin/Archive/{id}`

### Phase 6 - Bookmarks and Mentee Persistence

Current status: Phase 6 is closed for MVP saved-scholarship persistence.

Verified frontend baseline:

- `/mentee/scholarships` has bookmark buttons and a `Bookmarked` tab.
- Bookmark toggles call backend save/delete endpoints and update display state from the backend bookmark response.
- The `Bookmarked` tab filters backend-derived `ScholarshipDto.isBookmarked` values from `GET /api/Scholarship/me`.
- The existing `Bookmarked` tab is sufficient for MVP saved-scholarship discovery; a separate saved-scholarships workspace is deferred unless product requests it.
- `ScholarshipDetailsComponent` is reused by `/admin/scholarships/preview/:id`, `/mentee/scholarships/:id`, and `/mentee/scholarship-details/:id`. It currently uses the public scholarship detail service, so mentee detail does not show current-user bookmark state. Do not switch this shared component wholesale to the mentee current-user detail endpoint; split or route-scope the detail behavior in a later focused pass if product wants bookmark controls on detail.
- `src/app/services/scholarship/shcolarship.model.ts` still contains the legacy filename typo; do not rename it as part of Phase 6 unless cleanup is explicitly scoped.
- Phase 6.5 closeout validated build success and source inspection for backend-owned bookmark state, absence of cache-only `updateBookmark(...)`, absence of user-id ownership fields in bookmark calls, and preservation of scholarship CTA/taxonomy markup.

Recommended frontend Phase 6 scope:

- Keep scholarship bookmark state backend-owned; do not reintroduce `localStorage` or cache-only bookmark persistence.
- Preserve the existing `/mentee/scholarships` layout, filters, `Bookmarked` tab, CTA styling, and public scholarship visibility behavior.
- Browser visual QA remains product-owner manual review.
- Do not add saved mentors, saved resources/blogs, application tracker persistence, or a generic saved-items platform unless product explicitly expands scope.
- Payment UI later iteration: refine the payment/verification modal UX after manual product review and/or deployed Paystack sandbox testing. This may include clearer payment-progress states, retry/recheck affordances, provider-return messaging, and mobile polish. Do not change backend payment truth rules: frontend must not decide payment success or paid access.

### Phase 7 - Admin Payment and Event Type Operations

Current status: Phase 7.2 admin payment/payment-event read-only UI is complete. Phase 7.3 mentor event type admin API/model alignment is complete in `career-nava-api`. Phase 7.4 admin mentor event type UI is complete in `career-nava-web`. Phase 7.5 tests/docs closeout is complete. Phase 7.6 authenticated user profile and admin-only Calendly connection is complete. Phase 7.7A backend-first account profile contract foundation is complete. Phase 7.7B password change safety foundation is complete. Phase 7.7C account security status contract and provider identifier hardening is complete. Phase 7.7D Google-only local password setup foundation is complete. Phase 7.7E Google provider uniqueness and unlink safety groundwork is complete. Phase 7.7F shared account-profile Google unlink UI is complete. Phase 7.7G admin-only Calendly card visual refinement is complete. Phase 7.7H current-user Google linking and authentication session persistence are complete.

Verified frontend baseline:

- Admin routes currently include `/admin/overview`, `/admin/mentors`, `/admin/event-types`, `/admin/event-types/:eventTypeId`, `/admin/sessions`, `/admin/payments`, `/admin/payments/:paymentId`, `/admin/payment-events`, `/admin/payment-events/:paymentEventId`, `/admin/scholarships`, `/admin/scholarships/preview/:id`, `/admin/blogs`, and `/admin/mentors/preview/:id`.
- The admin sidebar currently links Overview, Mentors, Event Types, Sessions, Payments, Payment Events, Scholarships, and Blogs / Resources.
- `/admin/event-types` and `/admin/event-types/:eventTypeId` provide the Phase 7.4 admin event type UI. They use the backend Phase 7.3 endpoints, expose the backend sync action, and edit only Career Nava-owned mentor assignment and pricing metadata.
- `/admin/sessions` shows safe payment summary state and has a payment-status filter, but it is session-centered and does not provide payment/event audit lists.
- `PaymentService` supports mentee session checkout/verification plus admin-only read methods for payments and payment events. Do not extend it with admin mutation controls unless a later reconciliation phase explicitly scopes that work.
- `CalendlyService` exposes connect URL, scheduling/booking link helpers, and admin event type list/detail/assignment/pricing/sync methods.
- Phase 7.3 backend endpoints available for Phase 7.4:
  - `GET /api/Calendly/Admin/EventTypes`
  - `GET /api/Calendly/Admin/EventTypes/{eventTypeId}`
  - `PATCH /api/Calendly/Admin/EventTypes/{eventTypeId}/Assignment`
  - `PATCH /api/Calendly/Admin/EventTypes/{eventTypeId}/Pricing`
- Backend Phase 7.1 exposes read-only admin audit endpoints under `GET /api/Payment/Admin`, `GET /api/Payment/Admin/{paymentId}`, `GET /api/Payment/Admin/Events`, `GET /api/Payment/Admin/{paymentId}/Events`, and `GET /api/Payment/Admin/Events/{paymentEventId}`.

Recommended Phase 7 frontend sub-phases:

1. Phase 7.2 - Admin payments/payment-events read-only UI. Complete.
   - Added `/admin/payments`, `/admin/payments/:paymentId`, `/admin/payment-events`, and `/admin/payment-events/:paymentEventId`.
   - Payment detail shows scoped payment events from the backend read API.
   - The payment-event list uses a provider-event dropdown with Paystack baseline values and dynamically loaded extra event names.
   - Manual QA refinements removed visible raw database primary-key labels/fallbacks and stacked detail back links above the hero pill/title.
   - The UI remains read-only and does not expose payment mutation, replay, reconciliation, refund, override, or paid-access controls.
2. Phase 7.4 - Admin mentor event type UI using the Phase 7.3 backend APIs. Complete.
   - Added `/admin/event-types` and `/admin/event-types/:eventTypeId`.
   - Displays Calendly-owned fields read-only and editable Career Nava-owned metadata separately.
   - Allows edits only for active mentor assignment and free/paid pricing metadata (`isFreeSession`, `priceAmount`, `priceCurrency`).
   - Do not edit provider-owned Calendly fields: URI, booking URL, name, description, duration, color, or provider active status. No separate Career Nava-owned active/visible flag exists yet.
   - Provides an admin sync action wired to backend `POST /api/Calendly/sync-event-types`.
   - Use existing Calendly connect/refresh endpoints only through backend service calls or redirects; never put provider secrets in frontend code.
   - `npm run build` passed with existing unrelated SCSS budget warnings. `git diff --check` passed with LF-to-CRLF warnings only.
3. Phase 7.5 - Tests and docs closeout. Complete.
   - Re-ran `npm run build`; it passed with existing unrelated SCSS budget warnings.
   - Confirmed `package.json` still has no lint/test scripts.
   - Targeted source checks found no payment mutation controls, no direct provider API calls, and no editable provider-owned Calendly fields.
   - Documentation was synchronized before the next pre-hardening phase.
4. Phase 7.6 - Authenticated user profile and admin-only Calendly connection. Complete.
   - Close the top-right Profile menu gap for authenticated roles.
   - Provide profile pages for admin, mentor, and mentee users using safe current-user data.
   - Keep the mentor workspace at `/mentor/profile` and route the mentor account menu entry to `/mentor/account`.
   - Calendly connection controls and indicators are admin-only for MVP; mentees and mentors should not see account-level Calendly controls.
   - Use backend Calendly connect/callback routes only. Do not call Calendly directly or expose provider tokens/secrets.
5. Phase 7.7A - Backend-first account profile contract foundation. Complete.
   - The shared account profile page now consumes a stable read-only `googleLinked` flag from `GET /api/User/Profile`.
   - Shared account profile edits remain intentionally narrow: `fullName` and `profilePicture` only.
   - The UI still preserves admin-only Calendly connection controls and does not expose account-level Calendly actions to mentors or mentees.
   - The mentor public-profile workflow remains owned by `/mentor/profile`; Phase 7.7A did not move `bio` or `linkedInUrl` into the shared account-profile editor because source inspection showed ownership overlap with mentor self-service profile data.
   - No password-change UI was added.
   - No Google link or unlink UI was added.
7. Phase 7.7B - Password change safety foundation. Complete.
   - The shared account profile now includes a minimal Account security section for admin, mentor, and mentee current-user account pages.
   - The UI posts to `POST /api/User/ChangePassword` with `currentPassword`, `newPassword`, and `confirmPassword`.
   - The frontend only provides field validation and renders backend success/error states; it does not decide password-change eligibility.
   - No Google link or unlink controls were added.
   - No password reset or forgot-password UI was added.
   - The mentor public-profile workflow remains separate under `/mentor/profile`.
8. Phase 7.7C - Account security status contract and provider identifier hardening. Complete.
   - The frontend now consumes `GET /api/User/Security` for backend-derived account-security state instead of inferring security eligibility from raw provider identifiers.
   - Normal frontend-facing auth/current-user contracts no longer include raw `googleId`; the web app now relies on safe booleans such as `googleLinked` and the security-status eligibility flags.
   - The shared account profile keeps Google sign-in read-only and does not render Google link/unlink actions.
   - Admin-only Calendly controls remain admin-only, and `/mentor/profile` remains untouched.
9. Phase 7.7D - Google-only local password setup foundation. Complete.
   - The shared account profile Account security section now switches between two backend-owned flows:
     - Google-linked users without a local password see a dedicated `Set password` form.
     - Users with a local password continue to see the existing `Change password` form.
   - The setup form posts to `POST /api/User/SetupPassword` with `newPassword` and `confirmPassword`.
   - The setup form uses the same subtle reveal/hide eye toggles as the change-password form and does not log password values.
   - After successful setup, the page refreshes `GET /api/User/Security` so the UI naturally switches from `Set password` to `Change password` while Google sign-in remains read-only and linked.
   - No Google link/unlink controls, forgot-password UI, or password-reset UI were added.
   - Admin-only Calendly controls remain admin-only, and `/mentor/profile` remains untouched.
10. Phase 7.7F - Shared account-profile Google unlink UI. Complete.
   - The shared account profile now renders a compact `Disconnect Google sign-in` section only when the backend returns `canUnlinkGoogle = true`.
   - The unlink form is available only to dual-linked users and requires current-password confirmation before calling `POST /api/User/GoogleUnlink`.
   - On success, the page clears the unlink password field, refreshes `GET /api/User/Security` plus `GET /api/User/Profile`, updates the Google badge to `Not linked`, hides the unlink section, and keeps the normal change-password flow available.
   - The Google sign-in management flow now lives in its own standalone account/sign-in card, separate from the password setup/change card, with backend-driven notes for dual-linked, Google-only, and local-only account states.
   - Google-only users and local-only users do not see unlink UI. Backend errors remain the source of truth.
   - No Google link UI, password reset UI, or forgot-password UI was added.
11. Phase 7.7G - Calendly connection card visual refinement. Complete.
   - The admin-only Calendly connection card now uses a looser two-row provider layout aligned with the Google sign-in card, with the Calendly logo, a shorter connection-status pill, and a separate action row for connect/reconnect plus refresh.
   - Existing connect/reconnect and refresh behavior was preserved exactly; no Calendly backend contracts, sync rules, or provider-owned field handling changed.
   - Mentors and mentees still do not see account-level Calendly controls.
12. Phase 7.7H - Current-user Google linking and authentication session persistence. Complete.
   - The shared account profile Google sign-in card now shows `Link Google` for backend-derived unlinked accounts, keeps `Linked` status when Google is attached, and preserves the existing `Disconnect Google` action where `GET /api/User/Security` allows it.
   - Link start calls the authenticated backend-owned Google link endpoint and navigates to the backend-generated authorization URL; the frontend does not build the Google URL, send a target user id, store provider tokens, or infer linkage without refreshing backend state.
   - The shared Google callback returns to the role account-profile route with a coarse `googleLink` result. The account-profile page maps that result to the global toast system, removes the temporary query parameter, refreshes `GET /api/User/Profile` and `GET /api/User/Security`, and shows the backend-derived linked state.
   - Link success and Google-identity conflict rejection were manually validated, including the guarantee that the active Career Nava account does not switch after OAuth return.
   - Google link feedback now uses the global toast system only. Duplicate inline Bootstrap result alerts and stale deferred-link messaging were removed from the Google sign-in card.
   - Authentication restoration now has explicit `initializing`, `authenticated`, and `unauthenticated` states in `AuthService`.
   - `APP_INITIALIZER` restores the persisted Career Nava JWT/session before route evaluation, hydrates the current user through `/api/User/me`, and clears expired or malformed credentials.
   - Auth guards wait for restoration before redirecting, so hard refresh, direct protected-route navigation, and full-page Google OAuth return preserve authentication when the stored session is valid.
   - Phase 8 shared notification experience redesign is complete and manually approved by the product owner.

Phase 7 frontend guardrails:

- Admin payment/payment-event UI is read-only for MVP.
- Payment truth remains backend-owned; frontend/admin UI must not decide payment success or paid access.
- Payment events are audit records. Do not display raw webhook payloads/signatures in normal admin list views unless a later explicit audit-detail phase scopes it.
- Use Phase 4D admin operational utilities for admin actions; do not use Phase 4E dashboard CTA utilities for admin toolbar/table operations.
- Calendly-owned identifiers, booking URLs, and synced provider fields are read-only in UI and refreshed via backend sync.
- Price/free/currency edits should be presented as future-effective metadata and must not imply historical payment/session rewrites.

### Planned Pre-Hardening Roadmap

Phase 8 - Shared Notification Experience Redesign is complete and manually approved by the product owner.

Delivered scope:

- Shared semantic notification architecture with `success`, `error`, `warning`, `info`, and `neutral` variants.
- Career Nava-aligned styling using the approved brand purple and softened semantic colours, with responsive desktop/mobile placement.
- Four-visible notification limit, FIFO queueing, duplicate suppression, variant-based auto-dismiss durations, persistent mode, manual dismissal, hover/focus pause and resume, keyboard handling, and reduced-motion support.
- Safe text interpolation and accessible live-region behavior without TemplateRef, raw HTML, or provider payload rendering.
- Removal of legacy toast compatibility, Bootstrap classname interpretation, ng-bootstrap toast usage, and Bootstrap alert classes.
- Durable validation and page-state information remains in branded inline notices or existing field/page-state UI; transient operation results use semantic toasts without duplicate feedback.
- Shared `getUserErrorMessage(...)` extraction prefers safe structured backend messages, rejects unsafe/technical messages, and retains deliberate operation-specific fallbacks.
- Raw provider responses, exception details, tokens, secrets, stack traces, serialized errors, and unsafe HTML are not exposed.
- Product-owner manual browser and visual QA was completed and approved. The temporary development notification showcase was removed after approval.

Phase 9 - Calendly Platform Ownership and Backend Integration Foundation is complete. Career Nava uses one global platform Calendly account for MVP, managed by authorized admins. This is not a per-admin or per-mentor Calendly account model. Existing user associations represent the managing admin as an audit actor, not independent scheduling ownership.

Historical Phase 10 - Calendly Account Management UI and Integration Validation was absorbed into Phase 9C-9E and is complete. Phase 9C implemented the MVP account-profile platform-management UI against the Phase 9B backend contract. Phase 9E simplified that UI after owner OAuth/sync acceptance: the authorized admin account profile now loads backend platform status, starts connect/reconnect through authenticated backend initiation, refreshes credentials, and disconnects with explicit inline confirmation. Replace was removed from the active product contract, and event-type sync now appears only on the admin event-type inventory route. Mentors and mentees do not see the platform-management card. The frontend no longer sends profile/user/mentor ids for platform ownership, no longer builds provider authorization URLs, no longer treats a user-level Calendly boolean as platform status, and refreshes backend platform status after callback/action outcomes.

Phase 9C frontend contract:

- `GET /api/calendly/platform/status`
- `POST /api/calendly/platform/connect` with `{ "operation": "connect" | "reconnect" }`
- `POST /api/calendly/platform/refresh`
- `POST /api/calendly/platform/disconnect` with `{ "confirm": true }`
- `POST /api/calendly/platform/sync-event-types`

OAuth initiation note: do not navigate directly to `/api/calendly/platform/connect`. Browser document navigation does not include Angular's bearer-token interceptor and will correctly receive `401`. The UI must call `CalendlyService.startPlatformOAuth(...)` through `HttpClient`, receive the safe backend-generated Calendly `authorizationUrl`, verify it is an HTTPS `auth.calendly.com/oauth/authorize` URL, and then navigate with `window.location.assign`.

The platform status DTO is the sole frontend source of truth for the shared Calendly platform connection. Mentor-facing and admin mentor DTOs now use `schedulingAssigned` for derived mentor scheduling readiness from assigned active event types with booking links; the removed `users.calendly_connected` flag must not be reintroduced as UI truth.

Phase 9D frontend acceptance notes:

- The backend platform status DTO now also includes safe configuration-readiness fields: `configurationReady`, `oAuthClientIdConfigured`, `oAuthClientSecretConfigured`, `redirectUriConfigured`, `frontendBaseUrlConfigured`, `webhookSigningKeyConfigured`, `activeCredentialsPresent`, provider endpoint labels, webhook endpoint path, and `configurationMessage`.
- The frontend should continue to render actions only from backend capability flags. If `canConnect` is false because provider configuration is missing or placeholder, the UI must not build a Calendly authorization URL or infer readiness locally.
- Local API URL for Phase 9D validation: `http://localhost:5128`. Local frontend URL: `http://localhost:4200`.
- Owner acceptance confirmed real Calendly OAuth initiation, login/consent, callback, global platform persistence, connected status, event-type synchronization, and preservation of existing mentor assignments/pricing through sync. Real webhook delivery remains deferred because the available Calendly plan does not expose the required webhook capability.
- Final owner browser acceptance confirmed the simplified profile platform card, Sync from Calendly only on `/admin/event-types`, event-type inventory assigned/unassigned display, mentor inventory Scheduling column, and assignment eligibility behavior.
- Event-type sync is capability-driven from backend platform status and appears only on `/admin/event-types`. It is disabled with a safe explanation until the global platform connection is active and `canSync`/configuration readiness allow it.
- The admin mentor inventory column is now `Scheduling`, showing `Assigned` or `Not assigned` from backend-derived event-type assignment readiness. Do not display `Connected` for mentors; mentors do not own Calendly provider accounts.
- Assignment forms exclude mentors already assigned to another active event type while keeping the current event type's assigned mentor selectable. Backend validation and the database unique index remain authoritative.

Historical Phase 10 - Calendly Account Management UI and Integration Validation was absorbed into Phase 9C-9E and is complete. The active Phase 10 identifier is now reassigned to Platform Administration and Contract Completion.

Phase 10 - Platform Administration and Contract Completion is now the next planned pre-hardening phase. Phase 10A should add one admin destination at `/admin/platform-settings` for Platform Settings > Mentor Taxonomy > Disciplines / Expertises / Fluencies. These are global platform records, not admin account-profile fields, and the sidebar should not gain separate links for each taxonomy table. The admin surface should support listing, justified search/filtering, adding, editing labels, activating, deactivating, reactivating, usage counts, duplicate prevention, and safe ordering. Reuse the mentor profile chip/pill language only where it helps visual consistency; the management interface should still behave like an admin table/form workflow. Frontend route guards are UX controls only; backend authorization and usage checks decide mutation safety and deletion eligibility.

Phase 10B remains a separate controlled endpoint-normalization phase. It should maintain a route inventory and update Angular services, environment references, smoke scripts, tests, docs, OAuth callbacks, Calendly callbacks/webhooks, and Paystack callbacks/webhooks together. Internal Angular/API consumers can generally move together, but provider-facing routes require coordinated provider/environment changes and documented temporary aliases.

Phase 10C should enrich admin and mentor dashboards with truthful backend-supported data only. Admin overview should prioritize attention states, platform activity, KPIs, and real trends only where supported. Mentor overview must show mentor-specific data only, and earnings should appear only where the backend supports truthful mentor-level payment data. Charts are not mandatory; KPI cards, attention states, lists, progress indicators, and recent activity are acceptable premium dashboard patterns.

Phase 11 - Media and Experience Modernization should follow Phase 10. Phase 11A should decide image upload/storage architecture before replacing raw image URL fields, with managed image/CDN storage preferred if provider, cost, and platform-owned account approval are obtained. Phase 11B should modernize sign-in/sign-up and the auth layout while preserving async auth restoration and OAuth-return behavior; forgot/reset password, email verification, resend verification, account activation, email delivery, and token lifecycle are separate approved backend/security scopes if they become MVP requirements. Phase 11C should modernize public routes separately from auth and preserve public/private visibility rules.

Phase 12 - Test and Launch Hardening replaces the former Phase 11 hardening plan and the older Phase 8 launch-hardening plan. It should preserve the existing hardening scope: frontend smoke/build/test setup, auth/security regressions, visibility checks, fake/disabled UI audit, provider callback configuration, deployment documentation, environment validation, Paystack deployed sandbox validation, real Calendly webhook delivery when plan/environment permits, and final readiness review.

### Blogs

- `BlogService.getAllBlogs()` -> public blog list
- `BlogService.getBlogById(blogId)` -> direct blog retrieval by ID
- `BlogService.getBlogBySlug(slug)` -> published-only public slug detail
- `BlogService.getAdminBlogs()` -> `GET /api/Blog/GetAllBlogsForAdmin`
- `BlogService.getAdminBlogById(id)` -> `GET /api/Blog/Admin/GetBlogById/{id}`
- `BlogService.createAdminBlog(...)` -> `POST /api/Blog/Admin/CreateBlog`
- `BlogService.updateAdminBlog(id, ...)` -> `PUT /api/Blog/Admin/UpdateBlog/{id}`
- `BlogService.publishAdminBlog(id)` -> `PATCH /api/Blog/Admin/Publish/{id}`
- `BlogService.moveAdminBlogToDraft(id)` -> `PATCH /api/Blog/Admin/MoveToDraft/{id}`
- `BlogService.archiveAdminBlog(id)` -> `PATCH /api/Blog/Admin/Archive/{id}`

Note:

- public blog detail resolves through `GET /api/Blog/GetBlogBySlug/{slug}`

### Admin Overview

- `AdminService.getOverview()` -> `GET /api/Admin/GetOverview`

## Validation History

Recent completed slices were validated mainly with:

- `npm run build`
- targeted `rg` searches for endpoint usage
- targeted `rg` searches for sensitive field references
- `git check-ignore -v .ai/career-nava-frontend-session-summary.md`

Current validation/tooling status:

- `npm run build` exists and has been the primary validation command
- `npm run lint` does not exist
- `npm test` does not exist

This means the frontend currently has limited automated regression protection beyond build success and targeted inspection.

Phase 3F validation:

- `npm run build` passed after wiring admin mentor, scholarship, blog/resource, and session UI to backend contracts.
- Existing SCSS budget warnings remain in layout/student styles; no new warning points at the Phase 3F admin files.

Phase 3F polish validation:

- `npm run build` passed after refining admin table actions, collapsed filters, and public preview route behavior.
- Existing SCSS budget warnings remain in layout/student styles; no new warning points at the admin polish files.

Phase 3F follow-up notes:

- Admin mentor preview no longer blocks draft, inactive, or suspended mentor profiles in the admin console; every listed mentor row shows the preview icon, and the reused detail view fetches admin-safe mentor data for `/admin/mentors/preview/:id` with a non-public status notice.
- Admin blog/resource create and edit forms use an author dropdown from the admin user list. `Anonymous author` saves `authorId = null`; users with the `mentee` role are excluded from author choices.
- Admin filters now auto-apply on change. Clear filters is a compact icon action in the toolbar beside Filter and Refresh for mentors, scholarships, blogs/resources, and sessions; session filter panels no longer contain Apply/Clear action rows.
- Phase 3G aligned mentor preview contracts. `GET /api/Mentor/Admin/GetMentorById/{id}` now returns the rich mentee-facing display fields used by public mentor detail, including `expertise`, `disciplines`, `fluency`, `experiences`, `positionTitle`, `linkedInUrl`, `avgRating`, `totalReviews`, `totalSessions`, `bio`, `profilePicture`, and `company`, while preserving admin-only operational fields such as `mentorProfileStatus`, `isActive`, `schedulingAssigned`, `verified`, `createdAt`, and `updatedAt`. Public mentor list/detail remains restricted to active accounts with active mentor profiles only.
- Phase 4 added a real `/mentor/profile` self-service workspace. Mentors can now edit safe public-facing profile content and taxonomy/experience selections through mentor-scoped backend endpoints while lifecycle status, verification, and visibility controls remain admin-only.
- Phase 4A refined `/mentor/profile` into a premium read-first workspace with section-level edit/save/cancel flows, a mentor-facing `/mentor/profile/preview` route, and read-only scheduling/event-type visibility sourced from the self-profile contract.

## Known Caveats

- No lint script exists.
- No test script exists.
- Admin management UI is wired, but automated frontend coverage is still missing.
- `shcolarship.model.ts` typo still exists.
- Some admin pages may need pagination/search/filtering later.
- Payment/join behavior exists only for mentee sessions and should not be moved into shared session components.
- Phase 5.3 frontend payment integration is wired to backend-owned initialization and verification. The frontend must not decide amount, currency, payment reference, success, paid access, or booked session state.
- Phase 5.5 closed payment docs/build validation, but external Paystack sandbox delivery and manual visual review of the payment modal remain production-readiness caveats.
- Admin payment/event audit pages are implemented and read-only. Phase 7.4 mentor event type management pages are implemented with backend-only sync, active mentor assignment, and pricing metadata controls. Phase 7.5 closeout validation is complete; Phase 7.6 profile/Calendly connection work is complete; Phase 7.7A account profile contract foundation is complete; Phase 7.7B password change safety foundation is complete; Phase 7.7C account-security status hardening is complete; Phase 7.7D Google-only local password setup is complete; Phase 7.7F shared Google unlink UI is complete on top of the Phase 7.7E backend groundwork; Phase 7.7G visually aligns the admin-only Calendly card without changing its behavior; and Phase 7.7H completes current-user Google linking plus auth-session restoration.
- Admin overview currently uses aggregate counts only; charts/recent activity/trends are deferred.
- Public blog detail now resolves through the dedicated published-only slug endpoint.

## Pending Work

Major pending areas after the current MVP foundation:

- richer pagination/search/filtering across admin lists
- better automated frontend validation and tests
- richer dashboard analytics
- application tracker work
- Phase 10 platform administration and contract completion
- Phase 11 media and experience modernization
- Phase 12 test and launch hardening
- preserve mentor experience row identities if richer non-replacement editing becomes necessary

## Recommended Next Frontend Iterations

1. Move to Phase 10A Platform Settings and Master Data Management with a single `/admin/platform-settings` route rather than separate sidebar routes for each reference table. Scope the first slice to disciplines, expertises, fluencies, active/inactive lifecycle behavior, usage counts, duplicate prevention, and backend-backed admin mutations.
2. Keep Phase 10B API endpoint normalization separate because it touches every Angular service, smoke script, OAuth callback, webhook, provider configuration, and documentation reference.
3. Enrich admin and mentor overview dashboards in Phase 10C with truthful backend-supported metrics and remove or replace disabled fake "Soon" actions. Do not add a chart dependency unless the data and use case justify it.
4. Complete Phase 11A image upload/storage architecture before replacing raw image URL fields in account, mentor, scholarship, and blog forms.
5. Modernize auth pages in Phase 11B while preserving async auth restoration and OAuth-return behavior. Do not silently add account recovery or email-verification flows without approved backend scope.
6. Modernize public/unauthenticated routes in Phase 11C while preserving public/private visibility rules and excluding draft blogs, unpublished scholarships, suspended/private mentors, admin-only fields, and private payment/scheduling details.
7. Defer test/launch hardening, lint/test expansion, provider callback validation, and final readiness review to Phase 12 unless a focused earlier phase explicitly scopes them.

## Notes for Future Codex Sessions

- Treat the current backend-backed admin pages as stable MVP management slices unless the new task explicitly expands scope.
- Phase 4D admin action button standardization is complete for `/admin/mentors`, `/admin/scholarships`, `/admin/blogs`, and `/admin/sessions`; do not repeat the reverted broad `app-action-button` migration.
- Phase 4E dashboard CTA standardization is complete through the audit/docs closeout. Future CTA work should be scoped to a specific new surface rather than reopening a broad migration.
- Commit messages should follow Conventional Commits: `<type>(<scope>): <imperative summary>`. Use scopes such as `web`, `api`, `docs`, or the relevant feature area. Examples: `feat(web): migrate session CTAs`, `docs(web): close frontend handoff`, `fix(api): enforce authorization`. Do not use vague phase-only messages such as `Close Phase X` without a conventional type and scope.
- Preserve the role-safe session endpoints:
  - mentee -> `/api/Session/me/mentee`
  - mentor -> `/api/Session/me/mentor`
  - admin -> `/api/Session`
- Do not move mentee payment behavior into shared session components.
- For Phase 5 frontend work, keep payment checkout and verification backend-owned. Do not reintroduce a hardcoded Paystack URL as the source of truth, and do not let frontend code decide payment success or unlock paid sessions.
- For Phase 7 frontend work, keep admin payment/payment-event pages read-only and use backend event type APIs for Career Nava-owned pricing/free metadata. Do not edit Calendly-owned fields or expose provider secrets/raw payloads in normal admin screens.
- Avoid renaming broad folders/files such as the scholarship model typo unless the task explicitly covers cleanup and imports are updated safely.
- When adding new admin pages, follow the existing state pattern:
  - `loading`
  - `error`
  - explicit `401` and `403` handling
  - empty state
- Keep `.ai/` local notes out of commits.
- Use this document as the committed source of truth, and use `.ai/` only for temporary local session notes.

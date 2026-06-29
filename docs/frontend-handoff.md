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
- `/admin/mentors`
- `/admin/mentors/preview/:id`
- `/admin/sessions`
- `/admin/scholarships`
- `/admin/scholarships/preview/:id`
- `/admin/blogs`

### Mentor

- `/mentor` -> `/mentor/overview`
- `/mentor/overview`
- `/mentor/profile`
- `/mentor/sessions`

### Mentee

- `/mentee` -> `/mentee/mentors`
- `/mentee/mentors`
- `/mentee/mentors/mentor-details/:id`
- `/mentee/sessions`
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
- Shared dashboard CRUD/action buttons should use `src/app/shared/components/action-button/` rather than duplicating page-level button markup. Keep icon-only for obvious compact actions, icon + text for Save/Cancel and primary CTAs, and use danger variants with `title`/`aria-label` for destructive actions.

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
- `ScholarshipService.getAdminScholarships()` -> `GET /api/Scholarship/GetAllScholarshipsForAdmin`
- `ScholarshipService.getAdminScholarshipById(id)` -> `GET /api/Scholarship/Admin/GetScholarshipById/{id}`
- `ScholarshipService.createAdminScholarship(...)` -> `POST /api/Scholarship/Admin/CreateScholarship`
- `ScholarshipService.updateAdminScholarship(id, ...)` -> `PUT /api/Scholarship/Admin/UpdateScholarship/{id}`
- `ScholarshipService.publishAdminScholarship(id)` -> `PATCH /api/Scholarship/Admin/Publish/{id}`
- `ScholarshipService.moveAdminScholarshipToDraft(id)` -> `PATCH /api/Scholarship/Admin/MoveToDraft/{id}`
- `ScholarshipService.closeAdminScholarship(id)` -> `PATCH /api/Scholarship/Admin/Close/{id}`
- `ScholarshipService.archiveAdminScholarship(id)` -> `PATCH /api/Scholarship/Admin/Archive/{id}`

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
- Phase 3G aligned mentor preview contracts. `GET /api/Mentor/Admin/GetMentorById/{id}` now returns the rich mentee-facing display fields used by public mentor detail, including `expertise`, `disciplines`, `fluency`, `experiences`, `positionTitle`, `linkedInUrl`, `avgRating`, `totalReviews`, `totalSessions`, `bio`, `profilePicture`, and `company`, while preserving admin-only operational fields such as `mentorProfileStatus`, `isActive`, `calendlyConnected`, `verified`, `createdAt`, and `updatedAt`. Public mentor list/detail remains restricted to active accounts with active mentor profiles only.
- Phase 4 added a real `/mentor/profile` self-service workspace. Mentors can now edit safe public-facing profile content and taxonomy/experience selections through mentor-scoped backend endpoints while lifecycle status, verification, and visibility controls remain admin-only.
- Phase 4A refined `/mentor/profile` into a premium read-first workspace with section-level edit/save/cancel flows, a mentor-facing `/mentor/profile/preview` route, and read-only scheduling/event-type visibility sourced from the self-profile contract.

## Known Caveats

- No lint script exists.
- No test script exists.
- Admin management UI is wired, but automated frontend coverage is still missing.
- `shcolarship.model.ts` typo still exists.
- Some admin pages may need pagination/search/filtering later.
- Payment/join behavior exists only for mentee sessions and should not be moved into shared session components.
- Admin overview currently uses aggregate counts only; charts/recent activity/trends are deferred.
- Public blog detail now resolves through the dedicated published-only slug endpoint.

## Pending Work

Major pending areas after the current MVP foundation:

- richer pagination/search/filtering across admin lists
- better automated frontend validation and tests
- richer dashboard analytics
- application tracker work
- mentor Calendly/self-service connection improvements
- preserve mentor experience row identities if richer non-replacement editing becomes necessary

## Recommended Next Frontend Iterations

1. Add lint/test scripts or at least basic test tooling.
2. Add mentor Calendly/self-service connection improvements.
3. Add payments and Paystack verification UI once backend payment contracts are implemented.
4. Add persisted scholarship bookmark UI once backend bookmark mutation endpoints exist.
5. Add pagination/search/filtering refinements to admin lists.
6. Fix `shcolarship.model.ts` typo safely.
7. Add richer admin overview charts/recent activity.

## Notes for Future Codex Sessions

- Treat the current backend-backed admin pages as stable MVP management slices unless the new task explicitly expands scope.
- Preserve the role-safe session endpoints:
  - mentee -> `/api/Session/me/mentee`
  - mentor -> `/api/Session/me/mentor`
  - admin -> `/api/Session`
- Do not move mentee payment behavior into shared session components.
- Avoid renaming broad folders/files such as the scholarship model typo unless the task explicitly covers cleanup and imports are updated safely.
- When adding new admin pages, follow the existing state pattern:
  - `loading`
  - `error`
  - explicit `401` and `403` handling
  - empty state
- Keep `.ai/` local notes out of commits.
- Use this document as the committed source of truth, and use `.ai/` only for temporary local session notes.

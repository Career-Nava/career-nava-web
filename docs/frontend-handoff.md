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
- backend-backed read-only admin mentors page
- backend-backed read-only admin scholarships page
- backend-backed read-only admin blogs/resources page
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
- `/admin/sessions`
- `/admin/scholarships`
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
- `getAdminSessions()`

#### Endpoint contracts

- `/mentee/sessions` -> `GET /api/Session/me/mentee`
- `/mentor/sessions` -> `GET /api/Session/me/mentor`
- `/admin/sessions` -> `GET /api/Session`

#### Session behavior summary

- mentee and mentor pages no longer pass IDs from local storage
- mentee page uses current-user endpoint
- mentor page uses current-user endpoint
- admin sessions remain table-based
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

Read-only admin mentors page is implemented.

#### Route and service contract

- `/admin/mentors` -> `getAdminMentors()` -> `GET /api/Mentor/GetAllMentorsForAdmin`

#### Fields shown

- Mentor
- Email
- Title / Company
- Status
- Calendly
- Sessions
- Reviews

#### Behavior

- read-only table
- loading state with spinner
- error state with explicit messages
- empty state if no mentors are returned
- `401` page message while preserving interceptor logout behavior
- `403` message: user does not have access to view mentors

Public mentee mentor browsing and mentor details were preserved.

### Admin Scholarships

Read-only admin scholarships page is implemented.

#### Route and service contract

- `/admin/scholarships` -> `getAdminScholarships()` -> `GET /api/Scholarship/GetAllScholarshipsForAdmin`

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

- read-only table
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

Read-only admin blogs/resources page is implemented.

#### Route and service contract

- `/admin/blogs` -> `getAdminBlogs()` -> `GET /api/Blog/GetAllBlogsForAdmin`

#### Fields shown

- Blog / Resource
- Category
- Author
- Reading Time
- Created
- Content Blocks
- Status

#### Behavior

- read-only table
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
- `SessionService.getAdminSessions()` -> `GET /api/Session`

### Mentors

- `MentorService.getAllMentors()` -> public mentor list
- `MentorService.getMentorById(id)` -> public mentor detail
- `MentorService.getAdminMentors()` -> `GET /api/Mentor/GetAllMentorsForAdmin`
- `CalendlyService.getBookingLink(mentorId)` -> `GET /api/calendly/booking-link?mentorId={id}` for authenticated booking access

### Scholarships

- `ScholarshipService.getAllScholarships()` -> public scholarship list
- `ScholarshipService.getScholarshipById(id)` -> public scholarship detail
- `ScholarshipService.getAdminScholarships()` -> `GET /api/Scholarship/GetAllScholarshipsForAdmin`

### Blogs

- `BlogService.getAllBlogs()` -> public blog list
- `BlogService.getBlogById(blogId)` -> direct blog retrieval by ID
- `BlogService.getAdminBlogs()` -> `GET /api/Blog/GetAllBlogsForAdmin`

Note:

- public blog detail currently resolves by slug from `getAllBlogs()` rather than a dedicated slug endpoint

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

## Known Caveats

- No lint script exists.
- No test script exists.
- Admin tables are read-only; mutations are deferred.
- Public visibility/published filtering is not fully designed yet.
- Session lifecycle actions are deferred.
- `shcolarship.model.ts` typo still exists.
- Some admin pages may need pagination/search/filtering later.
- Payment/join behavior exists only for mentee sessions and should not be moved into shared session components.
- Admin overview currently uses aggregate counts only; charts/recent activity/trends are deferred.
- Public blog detail currently resolves from the full public blog list by slug, not a dedicated backend slug endpoint.

## Pending Work

Major pending areas after the current MVP foundation:

- admin mentor mutation flows
- admin scholarship mutation flows
- admin blog mutation flows
- mentor self-profile editing
- session lifecycle actions
- pagination/search/filtering across admin lists
- richer public visibility and publish-state rules
- better automated frontend validation and tests
- richer dashboard analytics
- application tracker work

## Recommended Next Frontend Iterations

1. Add lint/test scripts or at least basic test tooling.
2. Add admin mentor activate/deactivate UI.
3. Add admin scholarship create/edit UI.
4. Add admin blog create/edit UI.
5. Add public visibility/published UI once backend rules exist.
6. Add session lifecycle actions.
7. Add mentor self-profile editing.
8. Add pagination/search/filtering to admin lists.
9. Fix `shcolarship.model.ts` typo safely.
10. Add richer admin overview charts/recent activity.

## Notes for Future Codex Sessions

- Treat the current backend-backed admin pages as stable read-only slices unless the new task explicitly expands scope.
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

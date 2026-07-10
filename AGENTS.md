# Career Nava Web Agent Guide

## Purpose

This repository contains the Angular frontend for Career Nava. It includes public marketing/content pages and authenticated role areas for mentees, mentors, and admins.

## Stack

- Angular 17 standalone components
- TypeScript
- SCSS
- Bootstrap and ng-bootstrap
- RxJS
- JWT auth stored in `localStorage`

## Angular Structure

- Routes are defined in `src/app/app.routes.ts`.
- Shared authenticated shell lives under `src/app/layout/`.
- Public landing pages live under `src/app/modules/landing/`.
- Auth pages live under `src/app/modules/auth/`.
- Mentee code currently lives under `src/app/modules/student/`.
- Mentor code lives under `src/app/modules/mentor/`.
- Admin code lives under `src/app/modules/admin/`.
- API services and models live under `src/app/services/`.

Keep the standalone component structure. Do not add NgModules or a new state-management library unless explicitly requested.

## Routes And Auth Guards

- Preserve role route roots: `/mentee`, `/mentor`, `/admin`.
- Use existing `authGuard` and route `data.roles` for role protection.
- Keep route metadata `layoutRole` aligned with the sidebar shell.
- Do not bypass guards for authenticated role pages.
- Redirect users using `AuthService.getRedirectUrlForRole(...)` where possible.

## Services And API Clients

- API services should extend or follow `RestService`.
- Use `ConfigurationService` for API base URL access.
- Backend responses are wrapped as `ApiResponse<T>` unless a specific endpoint proves otherwise.
- Keep service methods typed and small.
- Do not hide real backend failures as empty data unless the UI intentionally needs that behavior and the tradeoff is documented.
- Avoid adding broad generic API abstractions; prefer clear service methods per feature.
- Do not use `localStorage`, cache-only state, or in-memory toggles as the durable source of truth for mentee bookmarks; backend-owned current-user persistence must own saved scholarship state.

## Models And Types

- Keep interfaces close to the service/domain they describe.
- Normalize backend fallback field names in services, not templates.
- Avoid `any` unless working around a third-party library or legacy endpoint.
- Do not rename legacy files such as `shcolarship.model.ts` unless cleanup is explicitly scoped.

## Components

- Keep components focused on view state and user interactions.
- Move backend calls into services.
- Keep payment-specific behavior out of shared session components.
- Mentor session UI must remain payment-agnostic.
- Admin CRUD controls should stay disabled until backend endpoints and product rules exist.
- Admin payment/payment-event UI should be read-only for MVP. Do not add controls that manually mark payments paid/failed/cancelled/refunded, edit provider event payloads, or grant paid access.
- Admin mentor event type UI may edit only Career Nava-owned metadata when backend endpoints exist, such as mentor assignment, free/paid flag, price, currency, and active/visible state. Calendly-owned identifiers, booking URLs, and synced provider fields should be displayed read-only and refreshed through backend sync actions.
- Calendly admin sync/auth controls must use backend endpoints; never put provider secrets in frontend code.
- Admin table action columns should use compact icon buttons with accessible titles/labels.
- Keep lifecycle/status changes in detail, edit, or manage panels where practical instead of large row buttons.
- Public/admin preview actions must render the real user-facing detail experience, preferably under the correct dashboard shell; do not add fake admin detail stubs for content preview.
- Admin mentor preview must remain available as a visible table action for every listed mentor row. It may render draft, inactive, or suspended profiles for admin review by using admin-only data; public/mentee mentor routes must remain active-account plus active-profile only.
- Keep preview actions separate from edit/manage actions. Preview is visual review; edit/manage contains operational forms and status controls.
- Keep operational filters collapsed by default and avoid exposing raw technical IDs to admin users unless the workflow truly requires it.
- Admin table filters auto-apply on change. Do not put Apply buttons in filter panels; button order is primary action, Filter, Clear filters, Refresh. Render Clear filters only when the filter panel is open or filters/search are active. Refresh reloads the current filtered view and must not clear filters.
- Blog/resource author fields should use user-friendly author selectors. Anonymous author maps to a nullable author user id, and mentees should not appear as author choices.
- Phase 3G should align mentor preview contracts: public mentor detail returns richer display fields than admin mentor detail, so admin preview may miss mentee-facing detail until backend/frontend response shapes are reconciled.

## Styling And Design

- Preserve the current premium dashboard look and feel.
- Use clean spacing, soft surfaces, readable hierarchy, and responsive card/table patterns.
- Mentor/self-service dashboard pages should reuse the same card and grid spacing rhythm as the mentee detail pages and established admin dashboard forms.
- Prefer component-scoped SCSS for page-specific layout.
- Keep shared admin styling in `src/styles/admin-console.scss` only when it is truly reusable.
- Avoid inline styles.
- Do not introduce random border-radius, color, or spacing changes that diverge from the existing design language.

## Frontend Styling Rule

- Prefer Bootstrap utilities and existing shared app/admin dashboard classes for layout, spacing, cards, grids, and action placement.
- Avoid deep, page-specific nested SCSS for basic padding, margin, and layout.
- Add component SCSS only when it provides clear brand-specific value or cannot be expressed cleanly with existing utilities and shared dashboard patterns.
- For dashboard/detail pages, mirror existing mentee/admin card and grid patterns before inventing new page-specific structures.
- For dashboard management/profile UIs, prefer compact icon-only action controls when the action is obvious, matching the admin table row action pattern; always include `title` and `aria-label`.
- Dashboard action rule: prefer compact icon-only action controls for obvious secondary actions, matching the admin table row action pattern. However, persistence actions inside edit states, especially Save and Cancel, should use icon + visible text labels for clarity. Primary CTAs such as Preview public profile should also keep icon + visible text and must preserve strong contrast/readability across default, hover, focus, and active states.
- For dashboard edit states, Save and Cancel should use compact, equal-sized pill buttons with icon + text. They should differ only by variant color/icon, not by size. Taxonomy/chip selectors should use standardized pill sizing, spacing, and wrapping so expertise, disciplines, and fluency controls feel consistent across profile screens.
- Avoid excessive font-weight; use bold text deliberately for page titles, section headings, and key emphasis only.

## Dashboard Action Buttons

- Do not perform broad dashboard-wide button component migrations in one pass.
- Do not create or reintroduce a shared Angular `app-action-button` unless a future task explicitly scopes it.
- For action button standardization, use shared CSS/SCSS utility classes first and apply them incrementally.
- Phase 4D admin action standardization is complete for `/admin/mentors`, `/admin/scholarships`, `/admin/blogs`, and `/admin/sessions`; preserve that utility pattern.
- Phase 4E should standardize user-facing CTA buttons separately from Phase 4D admin operational actions; do not blindly reuse `admin-action-*` utilities for mentor/mentee/admin-preview CTAs.
- Treat `/mentor/profile` and `src/styles/mentor-profile.scss` as the approved visual reference; do not modify them unless explicitly scoped.
- Apply action utilities directly to actual clickable elements, not only to child wrapper spans.
- Product owner performs manual visual smoke tests; do not run browser automation or screenshot tooling unless explicitly requested.
- Generalize the proven compact icon-action and compact equal-sized pill-action treatment into reusable CSS utility classes; do not invent a new dashboard button language.
- Use icon-only buttons for obvious compact row or secondary actions, always with `title` and `aria-label`.
- Use icon + text for Save, Cancel, Create/Add, and primary CTAs.
- Keep paired Save and Cancel buttons compact and equal-sized.
- Use restrained danger styling for destructive actions and preserve confirmation behavior where applicable.
- Avoid raw Bootstrap default button colors for final dashboard action styling.
- Avoid deep page-specific SCSS for basic button spacing/layout.
- Only consider a shared Angular action button component after the utility-class approach remains stable across multiple admin pages and a future task explicitly scopes that work.

## Responsive UX

- Ensure touched pages work on mobile, tablet, and desktop.
- Preserve current mobile sidebar/topbar behavior.
- Tables should have responsive alternatives or safe overflow behavior.
- Cards and buttons should wrap safely on narrow screens.

## Loading, Error, And Empty States

- Keep loading states explicit.
- Show clear `401` and `403` messages where role/auth failures are expected.
- Empty states should explain what the user can do next or why data is missing.
- Do not make backend failures look like legitimate empty states unless explicitly intended.

## Notification And API Error Feedback

- For handled backend/API errors, prefer the backend's structured, non-empty, user-safe application message over a generic frontend fallback. Always retain an operation-specific fallback.
- Use `getUserErrorMessage(...)` from `src/app/services/user-error-message.ts` instead of duplicating nested component-level error parsing.
- Treat 5xx responses and generic framework-generated HTTP messages as unsafe by default. Use the operation-specific fallback unless the backend contract explicitly guarantees a sanitized public message.
- Never expose raw provider responses, exception details, serialized error objects, tokens, secrets, stack traces, internal diagnostics, database errors, or unsafe HTML.
- Keep field-specific validation inline where appropriate. Use semantic toasts for temporary operation outcomes and branded inline notices or page-state UI for durable information, blocking requirements, empty states, and load failures.
- Do not reintroduce Bootstrap toast classes, Bootstrap alerts, legacy toast compatibility, or direct presentation-class arguments in feature callers.

## Testing And Validation

- `npm run build` is the main validation command today.
- There is currently no `lint` script.
- There is currently no `test` script.
- If adding tests or linting, wire scripts in `package.json` and keep them practical.
- Document any validation warnings, especially budget or third-party CSS warnings.
- Do not run browser automation or screenshot tooling for visual smoke tests unless explicitly requested; the product owner performs manual visual smoke tests. For UI styling tasks, validate code correctness, build success, and behavior preservation, and do not claim browser visual QA passed unless the product owner performed it or explicitly requested it.

## Commit Rules

- Use Conventional Commits: `<type>(<scope>): <imperative summary>`.
- Prefer scopes such as `web`, `api`, `docs`, or a specific feature area when useful.
- Examples: `feat(web): migrate session CTAs`, `docs(web): close frontend handoff`, `fix(api): enforce authorization`.
- Do not use vague phase-only messages such as `Close Phase X` without a conventional type and scope.
- Keep commits scoped and review diffs before committing.
- Do not push to GitHub unless explicitly asked.

## Engineering Principles

- Prioritize KISS and DRY.
- Follow existing Angular and styling conventions.
- Prefer simple, readable, maintainable code over clever abstractions.
- Do not implement admin CRUD, payments, bookmarks, or database/migration work unless the current task explicitly includes them.

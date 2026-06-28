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
- Admin table action columns should use compact icon buttons with accessible titles/labels.
- Keep lifecycle/status changes in detail, edit, or manage panels where practical instead of large row buttons.
- Public/admin preview actions must render the real user-facing detail experience, preferably under the correct dashboard shell; do not add fake admin detail stubs for content preview.
- Keep preview actions separate from edit/manage actions. Preview is visual review; edit/manage contains operational forms and status controls.
- Keep operational filters collapsed by default and avoid exposing raw technical IDs to admin users unless the workflow truly requires it.
- Expanded filter action buttons such as Apply and Clear should sit side by side with aligned sizing.

## Styling And Design

- Preserve the current premium dashboard look and feel.
- Use clean spacing, soft surfaces, readable hierarchy, and responsive card/table patterns.
- Prefer component-scoped SCSS for page-specific layout.
- Keep shared admin styling in `src/styles/admin-console.scss` only when it is truly reusable.
- Avoid inline styles.
- Do not introduce random border-radius, color, or spacing changes that diverge from the existing design language.

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

## Testing And Validation

- `npm run build` is the main validation command today.
- There is currently no `lint` script.
- There is currently no `test` script.
- If adding tests or linting, wire scripts in `package.json` and keep them practical.
- Document any validation warnings, especially budget or third-party CSS warnings.

## Commit Rules

- Use conventional commits, for example `fix(web): ...` or `docs: ...`.
- Keep commits scoped and review diffs before committing.
- Do not push to GitHub unless explicitly asked.

## Engineering Principles

- Prioritize KISS and DRY.
- Follow existing Angular and styling conventions.
- Prefer simple, readable, maintainable code over clever abstractions.
- Do not implement admin CRUD, payments, bookmarks, or database/migration work unless the current task explicitly includes them.

# Career Nava Frontend

Angular frontend for the Career Nava scholarship and career coaching platform.

## Tech Stack

- Angular 17
- TypeScript
- SCSS
- Bootstrap
- npm

## Requirements

No `engines` field is specified in `package.json`.

- Node.js and npm installed
- Recommended: current active LTS version of Node.js

## Setup Commands

```bash
npm install
npm start
npm run build
npm run build:dev
```

## Backend API Configuration

Backend API targets are controlled by the Angular environment files:

- `src/environments/environment.ts`: `http://localhost:5128/api`
- `src/environments/environment.dev.ts`: `http://localhost:5128/api`
- `src/environments/environment.prod.ts`: `https://career-nava-api.onrender.com/api`

## User Roles

The frontend currently expects these role names:

- `admin`
- `mentor`
- `mentee`

## Authentication Notes

- Authentication uses JWTs stored in `localStorage`.
- Route guards and standalone HTTP interceptor wiring have been cleaned up in this branch.
- Do not commit secrets into this repository.

## Known Warnings / Limitations

- A production build may still show a Bootstrap `.form-floating>~label` selector warning from third-party CSS processing.
- No active test script exists yet.
- Lazy-loading routes is a recommended next improvement.

## Current Roadmap Note

Final test and launch hardening is now planned as Phase 12. Historical Calendly-related Phase 10 work was absorbed into Phase 9C-9E; the active Phase 10 now means Platform Administration and Contract Completion.

Phase 10 should complete platform administration and API contract work first. Phase 10A uses one dedicated admin route, `/admin/platform-settings`, for Platform Settings > Mentor Taxonomy > Disciplines / Expertises / Fluencies. Do not place these global platform records inside the admin account profile and do not add separate sidebar links for each taxonomy table. The admin UI should support listing, justified search/filtering, add/edit, activate/deactivate/reactivate, usage counts, duplicate prevention, and safe ordering while relying on backend authorization and lifecycle rules.

Phase 10B keeps API endpoint normalization as a separate cross-cutting phase with route inventory and compatibility planning for OAuth/webhook/provider routes. Phase 10C should enrich admin and mentor dashboards with truthful, role-specific backend-supported information; charts are optional and should be added only when they improve real trend/distribution understanding.

Phase 11 should handle media and unauthenticated-experience modernization. Phase 11A decides image upload/storage architecture before replacing raw image URL fields, favoring managed image/CDN storage if provider, cost, and platform-owned account approval are obtained. Phase 11B modernizes sign-in/sign-up and the auth layout without silently adding forgot/reset password, email verification, account activation, or email-token systems. Phase 11C modernizes the broader public experience separately from auth while preserving public/private visibility rules.

Preserve async auth restoration and OAuth-return behavior, backend-owned payment truth, global Calendly platform ownership, public visibility rules, and the approved dashboard action/CTA styling baselines during these phases.

## Notes for Future Contributors

- Environment files control backend API targets.
- Run a production build before opening pull requests.
- Avoid committing generated folders such as `dist`, `.angular`, and `node_modules`.

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

## Notes for Future Contributors

- Environment files control backend API targets.
- Run a production build before opening pull requests.
- Avoid committing generated folders such as `dist`, `.angular`, and `node_modules`.

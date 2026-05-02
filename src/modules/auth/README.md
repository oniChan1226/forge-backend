# Auth Module Tests

This folder contains two test layers for auth:

- `auth.routes.test.ts`: Route-level unit tests.
  - Verifies route wiring and request validation middleware.
  - Mocks controllers so tests stay focused on router behavior.

- `auth.service.test.ts`: Service-level unit tests.
  - Verifies auth business logic in `AuthService`.
  - Mocks database/model, transaction helper, hash service, token service, and user-token service.
  - Covers success and failure paths for `signup`, `login`, and `refreshToken`.

## Run Commands

- Run only auth tests:
  - `npm run test:auth`

- Run one auth test file:
  - `npm test -- src/modules/auth/auth.service.test.ts`
  - `npm test -- src/modules/auth/auth.routes.test.ts`

- Run auth tests in watch mode:
  - `npm run test:watch -- src/modules/auth`

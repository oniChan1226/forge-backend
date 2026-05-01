# AGENTS Guide

This file helps AI coding agents work productively in this backend workspace.

Primary project docs:
- [README.md](README.md)
- [package.json](package.json)
- [tsconfig.json](tsconfig.json)
- [vitest.config.ts](vitest.config.ts)

## Quick Start Commands
- Install: npm install
- Dev server: npm run dev
- Build: npm run build
- Start built app: npm run start
- Typecheck: npm run typecheck
- Lint: npm run lint
- Tests: npm test

## Source Layout
- App bootstrap: [src/server.ts](src/server.ts), [src/app.ts](src/app.ts)
- Config: [src/config](src/config)
- Middlewares: [src/middlewares](src/middlewares)
- Models: [src/models](src/models)
- Feature modules: [src/modules](src/modules)
- Route aggregation: [src/routes](src/routes)
- Shared services: [src/services](src/services)
- Shared utilities: [src/utils](src/utils)

## Required Backend Patterns
- Wrap async route handlers with [src/utils/middleware-utils/async-handler.ts](src/utils/middleware-utils/async-handler.ts).
- Validate request input with [src/utils/middleware-utils/validate.ts](src/utils/middleware-utils/validate.ts) and module Zod schemas before business logic.
- Throw API-facing errors using [src/utils/errors/api-error.ts](src/utils/errors/api-error.ts).
- Let [src/middlewares/error-handler.ts](src/middlewares/error-handler.ts) format failures; do not duplicate response formatting in controllers.
- For atomic multi-document writes, use [src/utils/helpers/mongodb-transaction.ts](src/utils/helpers/mongodb-transaction.ts).

## Auth and Data Safety Conventions
- Auth flow lives under [src/modules/auth](src/modules/auth) and token logic under [src/services/token.service.ts](src/services/token.service.ts).
- Never return secrets or password hashes; sanitize objects before response.
- Keep cookie security behavior environment-aware via [src/config/env.ts](src/config/env.ts).

## Testing Conventions
- Test framework is Vitest with node environment.
- Test files should follow the existing pattern in [src/app.test.ts](src/app.test.ts).
- Keep tests under src and use file names ending with .test.ts.

## Change Checklist For Agents
- Keep edits scoped to the target feature and preserve module boundaries.
- After edits, run at least npm run typecheck.
- For route, middleware, or validation changes, run npm test.
- If lint-related files are touched, run npm run lint.

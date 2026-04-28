<<<<<<< HEAD
# forge-backend
=======
# MERN Backend Boilerplate (TypeScript)

Production-oriented Express + MongoDB backend starter designed for high-scale services.

## Features

- TypeScript strict mode
- Express 5 with security middleware (Helmet, HPP, CORS)
- Request logging with Pino
- Rate limiting and compression
- Zod-based environment validation
- MongoDB connection management via Mongoose with configurable pool and timeout tuning
- Liveness and readiness endpoints
- Graceful shutdown on process signals
- ESLint + Prettier + Vitest setup

## Quick Start

1. Install dependencies:
   npm install
2. Copy env file:
   copy .env.example .env
3. Run dev server:
   npm run dev

## Scripts

- npm run dev
- npm run build
- npm run start
- npm run lint
- npm run typecheck
- npm run test

## Health Endpoints

- GET /api/v1/health/live
- GET /api/v1/health/ready

## Notes on Scale

Connection pool defaults target long-running API services and should be refined using production metrics.
>>>>>>> df58ffb (feat: base)

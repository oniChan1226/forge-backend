# Forge Backend

A personal discipline and challenge tracking API. Users can create time-bound self-improvement challenges (e.g., "30 Days Reading – 5 minutes daily"), track daily progress, maintain streaks, and enforce accountability through strict or flexible completion modes.

## Features

- **Challenge Creation** – Define challenges with title, duration, daily target, start date, and completion mode
- **Progress Tracking** – Log daily completions with optional notes; upserts are supported for the same date
- **Streak Calculation** – Tracks current streak, longest streak, total completions, and missed days
- **Completion Modes**
  - `STRICT` – Any missed day fails the challenge
  - `FLEXIBLE` – Up to `allowedMisses` misses are permitted before failing
- **JWT Authentication** – Secure endpoints with token-based auth
- **Challenge Status** – Automatically transitions between `ACTIVE`, `COMPLETED`, and `FAILED`

## Tech Stack

- Node.js + Express 5
- TypeScript
- Prisma 7 + SQLite (via `better-sqlite3`)
- JWT + bcrypt
- Jest + Supertest

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

### Database Setup

```bash
npm run db:migrate
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Testing

```bash
npm test
```

## API Reference

All endpoints prefixed with `/api`.

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

#### Register

```json
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "myusername",
  "password": "securepassword"
}
```

#### Login

```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Returns: `{ "token": "...", "user": { ... } }`

---

### Challenges

All challenge endpoints require `Authorization: Bearer <token>` header.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/challenges` | Create a new challenge |
| GET | `/api/challenges` | List all user challenges |
| GET | `/api/challenges/:id` | Get challenge details |
| PUT | `/api/challenges/:id` | Update a challenge |
| DELETE | `/api/challenges/:id` | Delete a challenge |
| GET | `/api/challenges/:id/stats` | Get streak and stats |

#### Create Challenge

```json
POST /api/challenges
{
  "title": "30 Days Reading",
  "description": "Read 5 minutes every day",
  "durationDays": 30,
  "dailyTarget": "5 minutes of reading",
  "startDate": "2024-01-01T00:00:00.000Z",
  "completionMode": "FLEXIBLE",
  "allowedMisses": 3
}
```

- `completionMode`: `"STRICT"` or `"FLEXIBLE"` (default: `"FLEXIBLE"`)
- `allowedMisses`: number of allowed misses in FLEXIBLE mode (default: `3`)

---

### Progress

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/challenges/:id/progress` | Log daily progress |
| GET | `/api/challenges/:id/progress` | Get progress history + streak |

#### Log Progress

```json
POST /api/challenges/:id/progress
{
  "date": "2024-01-15T00:00:00.000Z",
  "completed": true,
  "notes": "Read for 8 minutes!"
}
```

Logging progress on the same date updates the existing record.

#### Get Progress Response

```json
{
  "progress": [
    {
      "id": "...",
      "challengeId": "...",
      "date": "2024-01-15T00:00:00.000Z",
      "completed": true,
      "notes": "Read for 8 minutes!",
      ...
    }
  ],
  "streak": {
    "currentStreak": 5,
    "longestStreak": 10,
    "totalCompleted": 15,
    "totalDays": 20,
    "completionRate": 75,
    "missedDays": 5
  }
}
```

## Data Models

### Challenge Status

- `ACTIVE` – In progress
- `COMPLETED` – Finished successfully
- `FAILED` – Too many misses (STRICT: any miss, FLEXIBLE: > allowedMisses)
- `ABANDONED` – Manually abandoned

### Completion Modes

| Mode | Behavior |
|------|----------|
| `STRICT` | Any missed day immediately fails the challenge |
| `FLEXIBLE` | Challenge fails only when missed days exceed `allowedMisses` |

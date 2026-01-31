# Alerta360 — Backend

NestJS API for the Alerta360 platform: missing persons registry, sighting reports, children registration, statistics, glossary, and authentication.

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB (Mongoose)
- **API**: REST, Swagger
- **Auth**: JWT, Passport (Local, Google OAuth)
- **Storage**: Local (Multer)
- **Image Moderation**: NSFW.js

## Modules

| Module | Description |
|--------|-------------|
| `auth` | JWT and Google OAuth authentication |
| `missing-persons` | Missing persons CRUD and search |
| `sightings` | Sighting reports |
| `children` | Child registration (preemptive) |
| `statistics` | Stats for risk map and dashboard |
| `glossary` | Search terms and definitions |
| `image-moderation` | Image validation (NSFW.js) |
| `storage` | File upload and serving |
| `users` | User management |

## Commands

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run start:dev

# Production
npm run start:prod

# Lint
npm run lint

# Format
npm run format

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `PORT` | No | Server port (default: 3000) |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `IMAGE_MODERATION_ENABLED` | No | Enable image moderation (default: true) |
| `CORS_ORIGIN` | No | Allowed CORS origin (e.g. http://localhost:5173) |

## Swagger

With the server running, API documentation is available at:

**http://localhost:3000/api/docs**

## Project Structure

```
backend/
├── src/
│   ├── auth/              # JWT, Local, Google OAuth
│   ├── children/          # Child registration
│   ├── config/            # App config
│   ├── glossary/          # Glossary terms
│   ├── image-moderation/  # NSFW.js moderation
│   ├── missing-persons/   # Missing persons CRUD
│   ├── sightings/         # Sighting reports
│   ├── statistics/        # Stats for risk map
│   ├── storage/           # File upload
│   ├── users/             # User management
│   ├── app.module.ts
│   └── main.ts
├── test/
├── .env.example
└── package.json
```

## License

MIT

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Express.js RESTful API template using PostgreSQL, Knex.js, and JWT authentication. ES Modules (`"type": "module"`), Node.js v24+ (pinned in `.nvmrc`).

## Commands

```bash
npm run dev              # Development server with nodemon
npm start                # Production server
npm run lint             # Oxlint (linter)
npm run lint:fix         # Auto-fix lint issues
npm run format           # Prettier check
npm run format:fix       # Prettier fix
npm run migrate          # Run latest migrations
npm run migrate:make <n> # Create migration
npm run migrate:rollback # Rollback last migration
npm run seed             # Run all seeds
npm run seed:make <n>    # Create seed file
```

No pre-commit hooks. Run `npm run lint:fix && npm run format:fix` before committing.

## Architecture

### MVC Pattern

- **Models** (`src/models/`): Knex.js queries only — no business logic
- **Controllers** (`src/controllers/`): Business logic, Joi validation, coordinates models
- **Routes** (`src/routes/`): Route definitions + param validation middleware, aggregated in `routes/index.js`

### Middleware Order (critical — in `src/index.js`)

1. Security (helmet with strict CSP, cors with explicit origins)
2. Body parsing (express.json + express.urlencoded, both 100kb limit)
3. Logging (Morgan httpLogger + custom requestLogger)
4. Routes (`/api`)
5. 404 handler (notFoundHandler)
6. Error handler (errorHandler) — **must be last**

### Request Context Flow

Authorization middleware sets `req.user = { id }` from decoded JWT. Route-level param validation middleware (e.g., `requireTodoIdParam`) validates and stores `req.todoId`. Controllers access these directly — all data queries filter by `user_id` to prevent cross-user access.

### Authentication Flow

- POST `/api/auth/signup` → creates user, returns `{ id, username }` (no tokens)
- POST `/api/auth/signin` → returns `{ id, username, accessToken, refreshToken }`
- POST `/api/auth/refresh` → returns new access token only

Token headers: `x-access-token` and `x-refresh-token` (NOT `Authorization: Bearer`). JWT algorithm pinned to HS256 with explicit verification.

### Error Handling

Controllers throw `HttpError(status, message)` → caught by `next(error)` → centralized `errorHandler` logs full context (stack, IP, userId, method, URL) but only returns `{ message }` to client. `notFoundHandler` logs 404s with user-agent tracking.

### Environment Validation

`src/utils/validate-env.js` runs at the very top of `src/index.js`, **before** Express initializes. Validates all required env vars with Joi (`abortEarly: false` to report all errors at once). JWT secrets must be ≥32 characters. Validated values are written back to `process.env`. Fails with `process.exit(1)` — not HttpError (Express doesn't exist yet).

### Pagination & Search

`src/utils/pagination.js` exports three functions:

- `validatePaginationQuery(query, sortableColumns)` — validates page, limit, sort_by, sort_order, search
- `buildPaginationMeta(page, limit, totalItems)` — pagination metadata object
- `executePaginatedQuery(countFn, findFn, conditions, params, searchableColumns)` — runs count + data fetch in parallel

**Usage in controllers:**

```javascript
import { validatePaginationQuery, executePaginatedQuery } from "../utils/pagination.js"

const params = validatePaginationQuery(req.query, ["updated_at", "title"])
const { data, pagination } = await executePaginatedQuery(
  model.count,
  model.findManyPaginated,
  { user_id: userId },
  params,
  ["title"], // columns searched with ILIKE
)
```

**Model contract:** Models must expose `count(conditions, options)` and `findManyPaginated(conditions, options)` where options supports `{ search, searchColumns, limit, offset, orders }`. Search uses `ILIKE %term%` on specified columns.

### Bulk Delete

DELETE `/api/todos?ids=id1,id2,id3` — comma-separated UUIDs in query string.

## Code Style

- **Formatter**: Prettier — no semicolons, 2-space indent, 100 char width
- **Linter**: Oxlint — correctness (error), suspicious (warn)
- **File naming**: kebab-case (`http-error.js`, `validate-env.js`)
- **UUIDs**: Use `crypto.randomUUID()` from `node:crypto` (not uuid package)
- **Imports**: ES modules only. Models use named exports. Controllers imported as namespace (`import * as controller`)
- **Responses**: Always use `apiResponse({ message, data })` from `src/utils/response.js`

## Environment Variables

Required: `DATABASE_URL`, `ACCESS_TOKEN_SECRET` (≥32 chars), `REFRESH_TOKEN_SECRET` (≥32 chars)

Optional with defaults: `NODE_ENV` (development), `PORT` (3000), `ACCESS_TOKEN_EXPIRES_IN` (15m), `REFRESH_TOKEN_EXPIRES_IN` (7d), `LOG_LEVEL` (info), `CORS_ALLOWED_ORIGINS` (http://localhost:8080)

## Database

- **Config**: `knexfile.js` — connection pool min 2, max 10
- **Migrations**: `database/migrations/` — format `YYYYMMDDHHMMSS_name.js`
- **Seeds**: `database/seeds/` — 5 test users (password: "secretpassword"), 35+ todos
- Tables use `timestamps(true, true)` for timezone-aware created_at/updated_at
- Todos foreign key to users with CASCADE delete

## Adding a New Resource

1. Migration: `npm run migrate:make create_<resource>_table`
2. Model: `src/models/<resource>.js` — CRUD + `count` and `findManyPaginated` with search support
3. Controller: `src/controllers/<resource>.js` — Joi validation inline, pagination utility for list endpoints
4. Routes: `src/routes/<resource>.js` — register in `src/routes/index.js`

See `TEMPLATE_GUIDE.md` for detailed walkthrough.
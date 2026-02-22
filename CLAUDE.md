# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Express.js RESTful API template using PostgreSQL, Knex.js, and JWT authentication. ES Modules (`"type": "module"`), Node.js v24+ (pinned in `.nvmrc`).

## Commands

```bash
npm run dev              # Development server with nodemon
npm start                # Production server
npm test                 # Run tests (Vitest)
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
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

### Middleware Order (critical — in `src/app.js`)

1. Request ID (`requestId` — must be first so all downstream middleware can use `req.id`)
2. Security (helmet with strict CSP, cors with explicit origins)
3. Body parsing (express.json + express.urlencoded, both 100kb limit)
4. HPP (HTTP Parameter Pollution protection)
5. Health check (`/health` — before rate limiting so load balancers aren't throttled)
6. Rate limiting (generalLimiter — global, configurable via `RATE_LIMIT_GENERAL_MAX`)
7. Logging (Morgan httpLogger + custom requestLogger)
8. Routes (`/api`) — auth routes have additional `authLimiter`
9. 404 handler (notFoundHandler)
10. Error handler (errorHandler) — **must be last**

`trust proxy` is set to `1` so rate limiting works correctly behind reverse proxies.

### App Extraction (`src/app.js` vs `src/index.js`)

`src/app.js` configures Express (middleware, routes) and exports the app without calling `listen()`. `src/index.js` is the thin entry point: loads env, validates it, dynamically imports `app.js`, then starts the server. This split enables Supertest to import the app directly without binding to a port.

### Request ID Tracking

`src/middlewares/request-id.js` runs first in the middleware chain. Accepts an incoming `X-Request-Id` header (up to 128 chars) or generates a UUID via `crypto.randomUUID()`. Stores on `req.id`, echoes in the response `X-Request-Id` header. All logs (Morgan, requestLogger, errorHandler, notFoundHandler) include `requestId: req.id`.

### Health Check

`GET /health` — mounted before rate limiting so load balancers aren't throttled. Returns DB connectivity status (`SELECT 1`), uptime, and timestamp. Uses `apiResponse()` wrapper. Returns 200 when healthy, 503 when DB is unreachable.

### Request Context Flow

Authorization middleware sets `req.user = { id }` from decoded JWT. Route-level param validation middleware (e.g., `requireTodoIdParam`) validates and stores `req.todoId`. Controllers access these directly — all data queries filter by `user_id` to prevent cross-user access.

### Authentication Flow

- POST `/api/auth/signup` → creates user, returns `{ id, username }` (no tokens)
- POST `/api/auth/signin` → returns `{ id, username, accessToken, refreshToken }`
- POST `/api/auth/refresh` → returns new access token only

Token headers: `x-access-token` and `x-refresh-token` (NOT `Authorization: Bearer`). JWT algorithm pinned to HS256 with explicit verification.

Validation: username 3–30 chars, alphanumeric + `.` `_` `-` only. Password 8–72 chars (72 is Argon2's input limit). Auth routes are rate-limited via `authLimiter` (default 10 req/15min).

### Error Handling

Controllers throw `HttpError(status, message)` → caught by `next(error)` → centralized `errorHandler` logs full context (requestId, stack, IP, userId, method, URL) but only returns `{ message }` to client. Controllers should **not** log errors themselves — the centralized handler is the single logging point. Stack traces are only logged outside production. `notFoundHandler` logs 404s with user-agent tracking.

### Environment Validation

`src/utils/validate-env.js` runs at the very top of `src/index.js`, **before** Express initializes. Validates all required env vars with Joi (`abortEarly: false` to report all errors at once). JWT secrets must be ≥32 characters. Validated values are written back to `process.env`. Fails with `process.exit(1)` — not HttpError (Express doesn't exist yet).

### Pagination & Search

`src/utils/pagination.js` exports three functions:

- `validatePaginationQuery(query, sortableColumns)` — validates page, limit, sort_by, sort_order, search
- `buildPaginationMeta(page, limit, totalItems)` — pagination metadata object
- `executePaginatedQuery(countFn, findFn, conditions, params, searchableColumns)` — runs count + data fetch in parallel

Search input is sanitized via `escapeIlike()` from `src/utils/sanitize.js` — escapes `%`, `_`, and `\` so they are treated as literals in PostgreSQL ILIKE patterns.

**Usage in controllers:**

```javascript
import { validatePaginationQuery, executePaginatedQuery } from "../utils/pagination.js"

const params = validatePaginationQuery(req.query, ["updated_at", "title"])
const { data: todos, pagination } = await executePaginatedQuery(
  model.count,
  model.findManyPaginated,
  { user_id: userId },
  params,
  ["title"],
)
return res.json(apiResponse({ data: todos, pagination }))
```

**Model contract:** Models must expose `count(conditions, options)` and `findManyPaginated(conditions, options)` where options supports `{ search, searchColumns, limit, offset, orders }`. Search uses `ILIKE %term%` on specified columns.

### Bulk Delete

DELETE `/api/todos?ids=id1,id2,id3` — comma-separated UUIDs in query string. Validated: max 50 IDs, each must be a valid UUID. Uses `removeMany(ids, conditions)` with `whereIn` for a single query instead of per-ID deletes.

## Code Style

- **Formatter**: Prettier — no semicolons, 2-space indent, 100 char width
- **Linter**: Oxlint — correctness (error), suspicious (warn)
- **File naming**: kebab-case (`http-error.js`, `validate-env.js`)
- **UUIDs**: Use `crypto.randomUUID()` from `node:crypto` (not uuid package)
- **Imports**: ES modules only. Models use named exports. Controllers imported as namespace (`import * as controller`)
- **Responses**: Always use `apiResponse({ message, data, pagination })` from `src/utils/response.js`. Pass resource directly as `data` (object for single, array for list, `null` for delete/error). For paginated lists, pass the array as `data` and metadata as `pagination`.

## Environment Variables

Required: `DATABASE_URL`, `ACCESS_TOKEN_SECRET` (≥32 chars), `REFRESH_TOKEN_SECRET` (≥32 chars), `JWT_ISSUER`, `JWT_AUDIENCE`

Optional with defaults: `NODE_ENV` (development), `PORT` (3000), `ACCESS_TOKEN_EXPIRES_IN` (15m), `REFRESH_TOKEN_EXPIRES_IN` (7d), `LOG_LEVEL` (info), `CORS_ALLOWED_ORIGINS` (http://localhost:8080), `RATE_LIMIT_AUTH_MAX` (10), `RATE_LIMIT_GENERAL_MAX` (100)

## Database

- **Config**: `knexfile.js` — connection pool min 2, max 10
- **Migrations**: `database/migrations/` — format `YYYYMMDDHHMMSS_name.js`
- **Seeds**: `database/seeds/` — 5 test users (password: "secretpassword"), 750 todos (150 per user)
- Tables use `timestamps(true, true)` for timezone-aware created_at/updated_at
- Todos foreign key to users with CASCADE delete

## Adding a New Resource

1. Migration: `npm run migrate:make create_<resource>_table`
2. Model: `src/models/<resource>.js` — CRUD + `count` and `findManyPaginated` with search support
3. Controller: `src/controllers/<resource>.js` — Joi validation inline, pagination utility for list endpoints
4. Routes: `src/routes/<resource>.js` — register in `src/routes/index.js`

See `TEMPLATE_GUIDE.md` for detailed walkthrough.

## Testing

- **Runner**: Vitest with `globals: true` (no explicit `describe`/`it` imports needed)
- **HTTP**: Supertest for integration tests against the Express app
- **Database**: Real PostgreSQL test database (`express_template_test` on same cluster, configured in `.env.test`)
- **Config**: `vitest.config.js` — `fileParallelism: false` (integration tests share DB state)
- **Setup**: `tests/global-setup.js` — loads `.env.test`, validates env, runs migrations, truncates tables; returns teardown function that rolls back and destroys connection
- **Helpers**: `tests/helpers.js` — `getApp()`, `request()`, `createTestUser()`, `getAuthHeaders()`, `cleanTable()`, `cleanAllTables()`
- **Structure**: `tests/unit/` for pure logic, `tests/integration/` for HTTP endpoints
- **Convention**: Each integration test file calls `cleanAllTables()` in `afterEach` to ensure test isolation

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Express.js RESTful API template using PostgreSQL, Knex.js, and JWT authentication. The project uses ES Modules (`"type": "module"` in package.json) and requires Node.js v24+.

## Common Commands

### Development

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
```

### Linting & Formatting

```bash
npm run lint         # Run Oxlint (linter)
npm run lint:fix     # Auto-fix issues with Oxlint
npm run format       # Check formatting with Prettier
npm run format:fix   # Apply formatting with Prettier
```

**Note**: No pre-commit hooks are configured. Run `npm run lint:fix` and `npm run format:fix` manually before committing.

### Database Migrations

```bash
npm run migrate                # Run latest migrations
npm run migrate:make <name>    # Create new migration file
npm run migrate:rollback       # Rollback last migration
```

### Database Seeds

```bash
npm run seed               # Run all seeds
npm run seed:make <name>   # Create new seed file
```

## Architecture

### MVC Pattern

- **Models** (`src/models/`): Data access layer using Knex.js query builder
- **Controllers** (`src/controllers/`): Business logic for handling requests
- **Routes** (`src/routes/`): Express route definitions, aggregated in `routes/index.js`

### Middleware Stack

- `src/middlewares/authorization.js`: JWT verification for protected routes
- `src/middlewares/error.js`: Centralized error handling (always loaded last in `src/index.js`)
- `src/middlewares/logger.js`: HTTP request logging using Morgan and custom middleware
- Security middleware (Helmet, CORS) configured in `src/index.js`

**Middleware order matters** (`src/index.js`):
1. Security (helmet, cors)
2. Body parsing (express.json, express.urlencoded)
3. Logging (httpLogger, requestLogger)
4. Routes
5. 404 handler (notFoundHandler)
6. Error handler (errorHandler) - must be last

### Utilities

- `src/utils/jwt.js`: JWT token creation and verification (separate access/refresh tokens)
- `src/utils/argon2.js`: Password hashing and verification
- `src/utils/response.js`: Standard API response formatter
- `src/utils/http-error.js`: Custom error class for HTTP errors
- `src/utils/constant.js`: HTTP status codes and messages
- `src/utils/logger.js`: Winston logger with daily rotation

### Database

- **Knex configuration**: `knexfile.js` in project root
- **Migrations**: `database/migrations/` (use YYYYMMDDHHMMSS_filename format)
- **Seeds**: `database/seeds/`

### Authentication Flow

1. POST `/api/auth/signup` - Create user with Argon2 hashed password
2. POST `/api/auth/signin` - Exchange credentials for access + refresh tokens
3. POST `/api/auth/refresh` - Exchange refresh token for new access token
4. Protected routes require `x-access-token` header (NOT `Authorization: Bearer`)

**Token headers**:
- Access token: `x-access-token: <token>` (15min expiry, for API requests)
- Refresh token: `x-refresh-token: <token>` (7d expiry, for token refresh)

### API Response Format

All responses follow this structure:

```javascript
{
  message: "Status message",
  data: { /* response data */ }
}
```

### Input Validation

Joi schemas are used for request validation. Schemas are typically defined within controller files before processing logic.

## Code Style

- **Linter**: Oxlint (`.oxlintrc.json`) - code quality only, no formatting rules
- **Formatter**: Prettier (`.prettierrc.json`) - no semicolons, 2-space indent, 100 char line width
- **File naming**: `kebab-case.js` for files (e.g., `http-error.js`, `authorization.js`)

## Environment Variables

Required in `.env`:

- `NODE_ENV`: development/production
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string
- `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET`: JWT secrets
- `ACCESS_TOKEN_EXPIRES_IN`: Access token expiry (default: 15m)
- `REFRESH_TOKEN_EXPIRES_IN`: Refresh token expiry (default: 7d)
- `LOG_LEVEL`: Logging level (default: info)

## Adding a New Feature

When adding a new resource (e.g., "categories"):

1. **Migration**: `npm run migrate:make create_categories_table`
2. **Model**: Create `src/models/categories.js` with CRUD functions
3. **Controller**: Create `src/controllers/categories.js` with business logic
4. **Routes**: Create `src/routes/categories.js` and register in `src/routes/index.js`
5. **Validation**: Use Joi schemas in controllers for input validation

See `TEMPLATE_GUIDE.md` for detailed step-by-step instructions.

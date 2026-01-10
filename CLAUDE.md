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
- Security middleware (Helmet, CORS) configured in `src/index.js`

### Utilities
- `src/utils/jwt.js`: JWT token creation and verification (separate access/refresh tokens)
- `src/utils/argon2.js`: Password hashing and verification
- `src/utils/response.js`: Standard API response formatter
- `src/utils/http-error.js`: Custom error class for HTTP errors
- `src/utils/constant.js`: HTTP status codes and messages

### Database
- **Knex configuration**: `knexfile.js` in project root
- **Migrations**: `database/migrations/` (use YYYYMMDDHHMMSS_filename format)
- **Seeds**: `database/seeds/`

### Authentication Flow
1. POST `/auth/signup` - Create user with Argon2 hashed password
2. POST `/auth/signin` - Exchange credentials for access + refresh tokens
3. POST `/auth/refresh` - Exchange refresh token for new access token
4. Protected routes require `Authorization: Bearer <access_token>` header

### API Response Format
All responses follow this structure:
```javascript
{
  message: "Status message",
  data: { /* response data */ }
}
```

### Input Validation
Joi schemas are used for request validation. Schemas are typically defined within route files.

## Environment Variables

Required in `.env`:
- `NODE_ENV`: development/production
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string
- `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET`: JWT secrets
- `ACCESS_TOKEN_EXPIRES_IN`: Access token expiry (default: 15m)
- `REFRESH_TOKEN_EXPIRES_IN`: Refresh token expiry (default: 7d)

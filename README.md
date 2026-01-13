# Express API Template

A production-ready RESTful API template built with Express.js, featuring PostgreSQL database, JWT authentication, and a clean MVC architecture. Designed to jumpstart your next Node.js API project.

## Features

### Authentication & Security

- **JWT Authentication**: Dual-token system with access tokens (15min) and refresh tokens (7 days)
- **Password Hashing**: Argon2 for secure password storage
- **Security Headers**: Helmet middleware for HTTP protection
- **CORS**: Cross-origin resource sharing configured
- **Input Validation**: Joi schemas for request validation

### Database & Architecture

- **PostgreSQL**: Robust relational database
- **Knex.js**: SQL query builder with migration support
- **MVC Pattern**: Clean separation of concerns (Models, Controllers, Routes)
- **ES Modules**: Modern JavaScript with `import/export` syntax

### Developer Experience

- **Standardized Responses**: Consistent API response format
- **Error Handling**: Centralized error handling middleware
- **OpenAPI Spec**: API documentation included (`openapi.json`)
- **Environment Config**: dotenv for environment-specific settings
- **Logging**: Winston + Morgan for structured logging with daily rotation

## Tech Stack

| Component          | Version                         | Description                |
| ------------------ | ------------------------------- | -------------------------- |
| **Runtime**        | Node.js >=24.0.0                | JavaScript runtime         |
| **Framework**      | Express.js ^5.2.1               | Web application framework  |
| **Database**       | PostgreSQL ^8.16.3              | Relational database        |
| **ORM**            | Knex.js ^3.1.0                  | Query builder & migrations |
| **Authentication** | JWT ^9.0.3, Argon2 ^0.43.1       | Token-based auth & hashing |
| **Validation**     | Joi ^17.13.3                    | Schema validation          |
| **Security**       | Helmet ^8.1.0, CORS ^2.8.5      | Security middleware        |
| **Logging**        | Winston ^3.19.0, Morgan ^1.10.1 | Structured logging         |

## Prerequisites

- **Node.js** v24 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** database server ([Download](https://www.postgresql.org/download/))
- **Git** for cloning the repository

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# Edit .env with your database credentials and secrets

# 3. Set up the database
npm run migrate
npm run seed

# 4. Start development server
npm run dev
```

The API will be available at `http://localhost:3000/api`

## Configuration

Create a `.env` file in the project root with the following variables:

| Variable                   | Description                  | Default       | Required |
| -------------------------- | ---------------------------- | ------------- | -------- |
| `NODE_ENV`                 | Environment mode             | `development` | No       |
| `PORT`                     | Server port                  | `3000`        | No       |
| `DATABASE_URL`             | PostgreSQL connection string | -             | Yes      |
| `ACCESS_TOKEN_SECRET`      | Secret for access tokens     | -             | Yes      |
| `ACCESS_TOKEN_EXPIRES_IN`  | Access token lifetime        | `15m`         | No       |
| `REFRESH_TOKEN_SECRET`     | Secret for refresh tokens    | -             | Yes      |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime       | `7d`          | No       |
| `LOG_LEVEL`                | Logging level                | `info`        | No       |

**Example DATABASE_URL:**

```
postgresql://username:password@localhost:5432/database_name
```

**Security Note:** In production, use strong, randomly generated secrets for JWT tokens.

## Logging

This template includes a comprehensive logging system powered by Winston and Morgan:

### Features

- **Structured Logging**: JSON-formatted logs for easy parsing and analysis
- **Daily Rotation**: Automatic log file rotation (keeps 14 days of logs)
- **Multiple Transports**: Console (development) and file (all environments)
- **HTTP Request Logging**: Morgan middleware for HTTP request/response logging
- **Log Levels**: error, warn, info, http, debug

### Log Files

Logs are stored in the `logs/` directory:

- `error-YYYY-MM-DD.log` - Error-level logs only
- `combined-YYYY-MM-DD.log` - All logs (info level and above)

### Log Levels

Set the `LOG_LEVEL` environment variable to control logging verbosity:

| Level   | Description                          |
| ------- | ------------------------------------ |
| `error` | Error messages only                  |
| `warn`  | Warnings and errors                  |
| `info`  | Informational messages (default)     |
| `http`  | HTTP request logging                 |
| `debug` | Debug information (verbose output)   |

### Usage Example

```javascript
import logger from "./utils/logger.js";

// Different log levels
logger.error("Error message", { errorDetails: "..." });
logger.warn("Warning message");
logger.info("Info message", { userId: "123", action: "login" });
logger.debug("Debug message", { data: "..." });
```

## Development Commands

### Server

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Database Migrations

```bash
npm run migrate                # Run all pending migrations
npm run migrate:make <name>    # Create a new migration file
npm run migrate:rollback       # Rollback the last migration
```

### Database Seeds

```bash
npm run seed               # Run all seed files
npm run seed:make <name>   # Create a new seed file
```

## API Documentation

This template includes an OpenAPI 3.0 specification (`openapi.json`) that documents all API endpoints.

### Authentication Endpoints

| Method | Endpoint            | Description                | Auth Required |
| ------ | ------------------- | -------------------------- | ------------- |
| POST   | `/api/auth/signup`  | Create new user account    | No            |
| POST   | `/api/auth/signin`  | Sign in and receive tokens | No            |
| POST   | `/api/auth/refresh` | Refresh access token       | Refresh Token |

### Todo Endpoints (Example)

| Method | Endpoint              | Description               | Auth Required |
| ------ | --------------------- | ------------------------- | ------------- |
| GET    | `/api/todos`          | Get all todos (paginated) | Access Token  |
| POST   | `/api/todos`          | Create a new todo         | Access Token  |
| GET    | `/api/todos/:todo_id` | Get single todo           | Access Token  |
| PUT    | `/api/todos/:todo_id` | Update a todo             | Access Token  |
| DELETE | `/api/todos/:todo_id` | Delete a todo             | Access Token  |
| DELETE | `/api/todos?ids=...`  | Delete multiple todos     | Access Token  |

### Authentication Format

Protected endpoints require the access token in the `x-access-token` header:

```
x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token refresh requires the refresh token in the `x-refresh-token` header:

```
x-refresh-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Project Structure

```
express-template/
├── src/
│   ├── config/              # Configuration files (Knex)
│   ├── controllers/         # Business logic layer
│   │   ├── auth.controller.js
│   │   └── todos.controller.js
│   ├── middlewares/         # Express middleware
│   │   ├── authorization.js  # JWT verification
│   │   ├── error.js          # Error handling
│   │   └── logger.js         # HTTP request logging
│   ├── models/              # Data access layer
│   │   ├── users.model.js
│   │   └── todos.model.js
│   ├── routes/              # API route definitions
│   │   ├── index.js          # Route aggregator
│   │   ├── auth.routes.js
│   │   └── todos.routes.js
│   ├── utils/               # Utility functions
│   │   ├── argon2.js         # Password hashing
│   │   ├── constant.js       # HTTP constants
│   │   ├── http-error.js     # Custom error class
│   │   ├── jwt.js            # JWT utilities
│   │   ├── logger.js         # Winston logger
│   │   └── response.js       # Response formatter
│   └── index.js              # Application entry point
├── database/
│   ├── migrations/          # Database migration files
│   └── seeds/               # Database seed files
├── logs/                    # Application logs (created at runtime)
│   ├── error-YYYY-MM-DD.log   # Error logs
│   └── combined-YYYY-MM-DD.log # All logs
├── openapi.json             # OpenAPI 3.0 specification
├── knexfile.js              # Knex configuration
├── CLAUDE.md                # AI assistant reference
├── TEMPLATE_GUIDE.md        # Guide for extending this template
└── package.json
```

## Production Deployment

### Environment Setup

1. Set `NODE_ENV=production` in your environment
2. Use strong, random JWT secrets
3. Configure your production database URL
4. Ensure `PORT` is set (or use default 3000)

### Running Migrations

Always run migrations before starting the production server:

```bash
npm run migrate
```

### Starting the Server

```bash
npm start
```

### Security Considerations

- Use HTTPS in production
- Set strong JWT secrets (minimum 32 characters)
- Configure database firewall rules
- Enable rate limiting for public endpoints
- Keep dependencies updated with `npm audit`
- Never commit `.env` file to version control

## Using This Template

See [TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md) for detailed instructions on:

- MVC architecture patterns
- Adding new features step-by-step
- Database migrations and seeding
- Authentication & authorization
- Input validation patterns
- Common recipes (pagination, sorting, filtering)

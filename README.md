# Express API Template

A RESTful API template built with Express.js, Knex.js, and PostgreSQL.

## Features

- Express.js with ES Modules
- PostgreSQL database with Knex.js query builder
- JWT access token and refresh token authentication
- Password hashing with Argon2
- Input validation with Joi
- Security with Helmet
- CORS support

## Requirements

- Node.js (v20+)
- PostgreSQL

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
# application
NODE_ENV=development
PORT=3000

# database
DATABASE_URL=postgresql://pg_user:pg_password@pg_host/pg_database

# JWT
ACCESS_TOKEN_SECRET=ACCESS_TOKEN_SECRET_key
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=REFRESH_TOKEN_SECRET_key
REFRESH_TOKEN_EXPIRES_IN=7d
```

3. Run migrations:

```bash
npm run migrate
```

4. Seed the database:

```bash
npm run seed
```

## Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

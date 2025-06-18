# Express API Template

A RESTful API template built with Express.js, Knex.js, and PostgreSQL.

## Features

- Express.js with ES Modules
- PostgreSQL database with Knex.js query builder
- JWT authentication
- Password hashing with Argon2
- Input validation with Joi
- Security with Helmet
- CORS support

## Requirements

- Node.js (v20+)
- PostgreSQL

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
# application
NODE_ENV=development
PORT=3000

# database
DATABASE_URL=postgresql://pg_user:pg_password@pg_host/pg_database

# JWT
JWT_SECRET=jwt_secret_key
JWT_EXPIRES_IN=1d
```

4. Create the database:

```bash
createdb express_template
```

5. Run migrations:

```bash
npm run migrate
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

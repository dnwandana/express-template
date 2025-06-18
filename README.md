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

- Node.js (v14+)
- PostgreSQL

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=express_template

# JWT
JWT_SECRET=your_jwt_secret_key
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

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Users

- `GET /api/users` - Get all users (requires authentication)
- `GET /api/users/:id` - Get a user by ID (requires authentication)
- `PUT /api/users/:id` - Update a user (requires authentication)
- `DELETE /api/users/:id` - Delete a user (requires authentication)

## License

ISC

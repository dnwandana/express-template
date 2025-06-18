import "dotenv/config";

const config = {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    directory: "./database/migrations",
  },
  seeds: {
    directory: "./database/seeds",
  },
  pool: {
    min: 2,
    max: 10,
  },
};

export default config;

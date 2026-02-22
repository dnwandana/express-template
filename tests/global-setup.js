import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default async function setup() {
  // Load test environment variables
  dotenv.config({ path: path.resolve(__dirname, "../.env.test"), override: true })

  // Validate env (reuse the app's validator)
  const { default: validateEnv } = await import("../src/utils/validate-env.js")
  validateEnv()

  // Run migrations
  const { default: db } = await import("../src/config/database.js")
  await db.migrate.latest()

  // Truncate all tables (order matters due to foreign keys)
  await db.raw("TRUNCATE TABLE todos, users CASCADE")

  // Return teardown function
  return async () => {
    await db.migrate.rollback(undefined, true)
    await db.destroy()
  }
}

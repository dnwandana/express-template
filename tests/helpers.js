import crypto from "node:crypto"
import supertest from "supertest"

let app

export async function getApp() {
  if (!app) {
    const mod = await import("../src/app.js")
    app = mod.default
  }
  return app
}

export async function request() {
  const app = await getApp()
  return supertest(app)
}

export async function createTestUser(overrides = {}) {
  const { hashPassword } = await import("../src/utils/argon2.js")
  const { default: db } = await import("../src/config/database.js")

  const id = crypto.randomUUID()
  const username = overrides.username || `testuser_${id.slice(0, 8)}`
  const password = overrides.password || "testpassword123"
  const hashedPassword = await hashPassword(password)

  const [user] = await db("users")
    .insert({
      id,
      username,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning(["id", "username", "created_at", "updated_at"])

  return { ...user, plainPassword: password }
}

export async function getAuthHeaders(userId) {
  const { generateAccessToken, generateRefreshToken } = await import("../src/utils/jwt.js")
  return {
    "x-access-token": generateAccessToken(userId),
    "x-refresh-token": generateRefreshToken(userId),
  }
}

export async function cleanTable(tableName) {
  const { default: db } = await import("../src/config/database.js")
  await db.raw(`TRUNCATE TABLE ${tableName} CASCADE`)
}

export async function cleanAllTables() {
  const { default: db } = await import("../src/config/database.js")
  await db.raw("TRUNCATE TABLE todos, users CASCADE")
}

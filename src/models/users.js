import db from "../config/database.js"

const TABLE_NAME = "users"
const SAFE_COLUMNS = ["id", "username", "created_at", "updated_at"]

export const create = (user) => {
  return db.insert(user).into(TABLE_NAME).returning(SAFE_COLUMNS)
}

export const findOne = (conditions) => {
  return db.select(SAFE_COLUMNS).from(TABLE_NAME).where(conditions).first()
}

export const findOneWithPassword = (conditions) => {
  return db.select("*").from(TABLE_NAME).where(conditions).first()
}

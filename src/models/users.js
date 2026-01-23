import db from "../config/database.js"

const TABLE_NAME = "users"

export const create = (user) => {
  return db.insert(user).into(TABLE_NAME).returning("*")
}

export const findOne = (conditions) => {
  return db.select("*").from(TABLE_NAME).where(conditions).first()
}

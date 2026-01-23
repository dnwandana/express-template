import db from "../config/database.js"

const TABLE_NAME = "todos"

export const create = (todo) => {
  return db.insert(todo).into(TABLE_NAME).returning("*")
}

export const findOne = (conditions) => {
  return db.select("*").from(TABLE_NAME).where(conditions).first()
}

export const findMany = (conditions, orders = null) => {
  let query = db.select("*").from(TABLE_NAME).where(conditions)
  if (orders) {
    query = query.orderBy(orders)
  }
  return query
}

export const findManyPaginated = (conditions, options = {}) => {
  // default options
  const { limit = 10, offset = 0, orders = null } = options

  let query = db.select("*").from(TABLE_NAME).where(conditions)

  if (orders) {
    query = query.orderBy(orders)
  }

  return query.limit(limit).offset(offset)
}

export const count = (conditions) => {
  return db.count("* as count").from(TABLE_NAME).where(conditions).first()
}

export const update = (conditions, todo) => {
  return db.update(todo).from(TABLE_NAME).where(conditions).returning("*")
}

export const remove = (conditions) => {
  return db.delete().from(TABLE_NAME).where(conditions)
}

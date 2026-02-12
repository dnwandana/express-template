import db from "../config/database.js"

const TABLE_NAME = "todos"
const TODO_COLUMNS = ["id", "title", "description", "is_completed", "created_at", "updated_at"]

export const create = (todo) => {
  return db.insert(todo).into(TABLE_NAME).returning(TODO_COLUMNS)
}

export const findOne = (conditions) => {
  return db.select(TODO_COLUMNS).from(TABLE_NAME).where(conditions).first()
}

export const findMany = (conditions, orders = null) => {
  let query = db.select(TODO_COLUMNS).from(TABLE_NAME).where(conditions)
  if (orders) {
    query = query.orderBy(orders)
  }
  return query
}

export const findManyPaginated = (conditions, options = {}) => {
  // default options
  const { limit = 10, offset = 0, orders = null, search = "", searchColumns = [] } = options

  let query = db.select(TODO_COLUMNS).from(TABLE_NAME).where(conditions)

  if (search && searchColumns.length) {
    query = query.where(function () {
      for (const col of searchColumns) {
        this.orWhere(col, "ilike", `%${search}%`)
      }
    })
  }

  if (orders) {
    query = query.orderBy(orders)
  }

  return query.limit(limit).offset(offset)
}

export const count = (conditions, options = {}) => {
  const { search = "", searchColumns = [] } = options

  let query = db.count("* as count").from(TABLE_NAME).where(conditions)

  if (search && searchColumns.length) {
    query = query.where(function () {
      for (const col of searchColumns) {
        this.orWhere(col, "ilike", `%${search}%`)
      }
    })
  }

  return query.first()
}

export const update = (conditions, todo) => {
  return db.update(todo).from(TABLE_NAME).where(conditions).returning(TODO_COLUMNS)
}

export const remove = (conditions) => {
  return db.delete().from(TABLE_NAME).where(conditions)
}

export const removeMany = (ids, conditions) => {
  return db.delete().from(TABLE_NAME).whereIn("id", ids).andWhere(conditions)
}

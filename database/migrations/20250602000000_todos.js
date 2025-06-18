/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = (knex) => {
  return knex.schema.createTable("todos", (table) => {
    table.uuid("id").primary();
    table.uuid("user_id").notNullable();
    table.string("title").notNullable();
    table.text("description").nullable();
    table.boolean("is_completed").notNullable().defaultTo(false);
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = (knex) => {
  return knex.schema.dropTable("todos");
};

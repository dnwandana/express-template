import { hashPassword } from "../../src/utils/argon2.js";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async (knex) => {
  // prepare users
  // password is "secretpassword"
  const hashedPassword = await hashPassword("secretpassword");
  const users = [
    {
      id: "de159aac-67ab-40bf-9234-2b55b10d23db",
      username: "john.doe",
      password: hashedPassword,
      created_at: "2025-01-15T09:00:00.000Z",
      updated_at: "2025-01-15T09:00:00.000Z",
    },
    {
      id: "e92c325c-9522-4f64-8e4d-c568c8323008",
      username: "jane.doe",
      password: hashedPassword,
      created_at: "2025-01-18T14:30:00.000Z",
      updated_at: "2025-01-18T14:30:00.000Z",
    },
    {
      id: "19e565d0-8dfb-4f32-a33f-fd61772aaf03",
      username: "AlexTheBuilder",
      password: hashedPassword,
      created_at: "2025-01-20T10:15:00.000Z",
      updated_at: "2025-01-20T10:15:00.000Z",
    },
    {
      id: "2bcd8bf1-d4b7-4eaa-88fb-45bc90ad37a1",
      username: "CloudArchitect",
      password: hashedPassword,
      created_at: "2025-01-22T16:45:00.000Z",
      updated_at: "2025-01-22T16:45:00.000Z",
    },
    {
      id: "ce93fc37-71de-491f-98ea-6485d399370c",
      username: "sudo_sam",
      password: hashedPassword,
      created_at: "2025-01-25T11:20:00.000Z",
      updated_at: "2025-01-25T11:20:00.000Z",
    },
  ];

  // delete all existing entries
  await knex("users").del();

  // insert users
  await knex("users").insert(users);
};

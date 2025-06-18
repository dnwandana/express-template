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
      username: "Kylie.Hoeger",
      password: hashedPassword,
      created_at: "2025-05-02T05:05:31.940Z",
      updated_at: "2025-05-21T10:33:35.382Z",
    },
    {
      id: "e92c325c-9522-4f64-8e4d-c568c8323008",
      username: "Candace.Abbott59",
      password: hashedPassword,
      created_at: "2025-05-10T08:18:07.147Z",
      updated_at: "2025-05-30T22:19:17.967Z",
    },
    {
      id: "19e565d0-8dfb-4f32-a33f-fd61772aaf03",
      username: "Evan.Pagac63",
      password: hashedPassword,
      created_at: "2025-05-09T18:25:51.975Z",
      updated_at: "2025-05-28T11:50:04.439Z",
    },
    {
      id: "2bcd8bf1-d4b7-4eaa-88fb-45bc90ad37a1",
      username: "Cleveland.Konopelski",
      password: hashedPassword,
      created_at: "2025-05-13T08:01:08.404Z",
      updated_at: "2025-05-25T05:23:28.199Z",
    },
    {
      id: "ce93fc37-71de-491f-98ea-6485d399370c",
      username: "Camylle_Hodkiewicz",
      password: hashedPassword,
      created_at: "2025-05-12T07:00:22.664Z",
      updated_at: "2025-05-29T17:33:10.740Z",
    },
    {
      id: "c79dcb7f-8940-43f5-94cb-05406b0cc306",
      username: "Elmira.Koelpin",
      password: hashedPassword,
      created_at: "2025-05-04T17:49:25.991Z",
      updated_at: "2025-05-28T22:48:51.457Z",
    },
    {
      id: "ca529967-cd33-49ba-9def-2dbeaa88db0c",
      username: "Golden.Von51",
      password: hashedPassword,
      created_at: "2025-05-01T08:04:11.447Z",
      updated_at: "2025-05-23T03:52:20.590Z",
    },
    {
      id: "e57c3286-c6db-4c5e-9ebe-cd362232aad6",
      username: "Amiya.Hagenes25",
      password: hashedPassword,
      created_at: "2025-05-03T07:36:38.418Z",
      updated_at: "2025-05-29T21:14:45.510Z",
    },
    {
      id: "e2b74bfc-854d-4ae4-a157-40d276c54654",
      username: "Jasmin.Wyman61",
      password: hashedPassword,
      created_at: "2025-05-01T07:42:33.138Z",
      updated_at: "2025-05-28T02:19:11.012Z",
    },
    {
      id: "6efe59a9-0142-495d-9fd0-73f033f42e0e",
      username: "Germaine99",
      password: hashedPassword,
      created_at: "2025-05-04T01:23:45.768Z",
      updated_at: "2025-05-28T04:40:42.823Z",
    },
  ];

  // delete all existing entries
  await knex("users").del();

  // insert users
  await knex("users").insert(users);
};

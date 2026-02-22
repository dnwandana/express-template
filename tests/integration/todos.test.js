import { request, createTestUser, getAuthHeaders, cleanAllTables } from "../helpers.js"

let user
let headers

beforeEach(async () => {
  await cleanAllTables()
  user = await createTestUser()
  headers = await getAuthHeaders(user.id)
})

describe("POST /api/todos", () => {
  it("should create a todo", async () => {
    const res = await (await request())
      .post("/api/todos")
      .set(headers)
      .send({ title: "Buy groceries", description: "Milk and eggs" })

    expect(res.status).toBe(201)
    expect(res.body.data.title).toBe("Buy groceries")
    expect(res.body.data.description).toBe("Milk and eggs")
    expect(res.body.data.is_completed).toBe(false)
    expect(res.body.data.id).toBeDefined()
  })

  it("should reject todo without title", async () => {
    const res = await (await request())
      .post("/api/todos")
      .set(headers)
      .send({ description: "No title" })

    expect(res.status).toBe(400)
  })

  it("should require authentication", async () => {
    const res = await (await request()).post("/api/todos").send({ title: "Unauthorized" })

    expect(res.status).toBe(401)
  })
})

describe("GET /api/todos", () => {
  it("should return paginated todos", async () => {
    const agent = await request()

    // Create 3 todos
    for (let i = 1; i <= 3; i++) {
      await agent
        .post("/api/todos")
        .set(headers)
        .send({ title: `Todo ${i}` })
    }

    const res = await agent.get("/api/todos").set(headers)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(3)
    expect(res.body.pagination).toBeDefined()
    expect(res.body.pagination.total_items).toBe(3)
  })

  it("should support search", async () => {
    const agent = await request()
    await agent.post("/api/todos").set(headers).send({ title: "Buy milk" })
    await agent.post("/api/todos").set(headers).send({ title: "Walk the dog" })

    const res = await agent.get("/api/todos?search=milk").set(headers)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].title).toBe("Buy milk")
  })

  it("should not return another user's todos", async () => {
    const otherUser = await createTestUser({ username: "otheruser" })
    const otherHeaders = await getAuthHeaders(otherUser.id)
    const agent = await request()

    await agent.post("/api/todos").set(otherHeaders).send({ title: "Other user's todo" })

    const res = await agent.get("/api/todos").set(headers)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(0)
  })
})

describe("GET /api/todos/:todo_id", () => {
  it("should return a single todo", async () => {
    const agent = await request()
    const createRes = await agent.post("/api/todos").set(headers).send({ title: "Specific todo" })

    const todoId = createRes.body.data.id
    const res = await agent.get(`/api/todos/${todoId}`).set(headers)

    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe("Specific todo")
  })

  it("should reject invalid UUID", async () => {
    const res = await (await request()).get("/api/todos/not-a-uuid").set(headers)

    expect(res.status).toBe(400)
  })
})

describe("PUT /api/todos/:todo_id", () => {
  it("should update a todo", async () => {
    const agent = await request()
    const createRes = await agent.post("/api/todos").set(headers).send({ title: "Original title" })

    const todoId = createRes.body.data.id
    const res = await agent
      .put(`/api/todos/${todoId}`)
      .set(headers)
      .send({ title: "Updated title", is_completed: true })

    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe("Updated title")
    expect(res.body.data.is_completed).toBe(true)
  })
})

describe("DELETE /api/todos/:todo_id", () => {
  it("should delete a todo", async () => {
    const agent = await request()
    const createRes = await agent.post("/api/todos").set(headers).send({ title: "To be deleted" })

    const todoId = createRes.body.data.id
    const res = await agent.delete(`/api/todos/${todoId}`).set(headers)

    expect(res.status).toBe(200)

    // Verify it's gone
    const getRes = await agent.get(`/api/todos/${todoId}`).set(headers)
    expect(getRes.status).toBe(404)
  })
})

describe("DELETE /api/todos (bulk)", () => {
  it("should delete multiple todos", async () => {
    const agent = await request()
    const ids = []
    for (let i = 0; i < 3; i++) {
      const createRes = await agent
        .post("/api/todos")
        .set(headers)
        .send({ title: `Bulk delete ${i}` })
      ids.push(createRes.body.data.id)
    }

    const res = await agent.delete(`/api/todos?ids=${ids.join(",")}`).set(headers)

    expect(res.status).toBe(200)

    // Verify they're gone
    const listRes = await agent.get("/api/todos").set(headers)
    expect(listRes.body.data).toHaveLength(0)
  })

  it("should reject invalid UUIDs in bulk delete", async () => {
    const res = await (await request()).delete("/api/todos?ids=not-a-uuid,also-bad").set(headers)

    expect(res.status).toBe(400)
  })
})

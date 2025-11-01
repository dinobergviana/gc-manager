import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.awaitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.awaitForAllServices();
});

describe("Use case: Registration Flow (all successful)", () => {
  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Joao",
          last_name: "Doe",
          email: "jaoaDoe@email.com",
          password: "senha123",
          campus: 1,
        }),
      },
    );

    expect(createUserResponse.status).toBe(201);

    const responseBody = await createUserResponse.json();

    expect(responseBody).toEqual({
      id: responseBody.id,
      name: "Joao",
      last_name: "Doe",
      email: "jaoaDoe@email.com",
      password: responseBody.password,
      features: ["read:activation_token"],
      campus: 1,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {});
  test("Active account", async () => {});
  test("Login", async () => {});
  test("Get user information", async () => {});
});

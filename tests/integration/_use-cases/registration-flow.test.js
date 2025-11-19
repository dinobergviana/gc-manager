import activation from "models/activation.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.awaitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.awaitForAllServices();
});

describe("Use case: Registration Flow (all successful)", () => {
  let responseBody;
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
          email: "joaoDoe@email.com",
          password: "senha123",
          campus: 1,
        }),
      },
    );

    expect(createUserResponse.status).toBe(201);

    responseBody = await createUserResponse.json();

    expect(responseBody).toEqual({
      id: responseBody.id,
      name: "Joao",
      last_name: "Doe",
      email: "joaoDoe@email.com",
      password: responseBody.password,
      features: ["read:activation_token"],
      campus: 1,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    const activationToken = await activation.findOneByUserId(responseBody.id);

    expect(lastEmail.sender).toBe("<contato@email.com>");
    expect(lastEmail.recipients[0]).toBe("<joaoDoe@email.com>");
    expect(lastEmail.subject).toBe("Ative o seu cadastro!");
    expect(lastEmail.text).toContain(activationToken.id);
  });

  test("Active account", async () => {});
  test("Login", async () => {});
  test("Get user information", async () => {});
});

import webserver from "infra/webserver";
import activation from "models/activation";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.awaitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.awaitForAllServices();
});

describe("Use case: Registration Flow (all successful)", () => {
  let createdUserResponseBody;
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

    createdUserResponseBody = await createUserResponse.json();

    expect(createdUserResponseBody).toEqual({
      id: createdUserResponseBody.id,
      name: "Joao",
      last_name: "Doe",
      email: "joaoDoe@email.com",
      password: createdUserResponseBody.password,
      features: ["read:activation_token"],
      campus: 1,
      created_at: createdUserResponseBody.created_at,
      updated_at: createdUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@email.com>");
    expect(lastEmail.recipients[0]).toBe("<joaoDoe@email.com>");
    expect(lastEmail.subject).toBe("Ative o seu cadastro!");

    const activationTokenId = orchestrator.extractUUIdFromText(lastEmail.text);

    expect(lastEmail.text).toContain(
      `${webserver.origin}/cadastro/ativar/${activationTokenId}`,
    );

    const activationToken =
      await activation.findOneValidById(activationTokenId);

    expect(activationToken.user_id).toBe(createdUserResponseBody.id);
    expect(activationToken.used_at).toBe(null);
  });

  test("Active account", async () => {});
  test("Login", async () => {});
  test("Get user information", async () => {});
});

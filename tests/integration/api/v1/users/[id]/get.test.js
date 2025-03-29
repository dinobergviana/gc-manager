import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.awaitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With valid uuid", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Joao",
          last_name: "Doe",
          email: "joao.doe@gmail.com",
          password: "senha123",
          campus: 1,
        }),
      });
      const response1Body = await response1.json();
      expect(response1.status).toBe(201);

      const response2 = await fetch(
        `http://localhost:3000/api/v1/users/${response1Body.id}`,
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        name: "Joao",
        last_name: "Doe",
        email: "joao.doe@gmail.com",
        password: "senha123",
        campus: 1,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    test("With not valid uuid", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Flavio",
          last_name: "Barbeitas",
          email: "flavio.barbeitas@gmail.com",
          password: "senha123",
          campus: 1,
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users/1");

      expect(response2.status).toBe(400);
    });

    test("With not found uuid match", async () => {
      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/1e9d0a2b-ef4b-4820-99a4-a25a89ede2a3",
      );

      expect(response2.status).toBe(404);
    });
  });
});

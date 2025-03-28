import orchestrator from "tests/orchestrator";
import database from "infra/database.js";

beforeAll(async () => {
  await orchestrator.awaitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      await database.query({
        text: "INSERT INTO users (name, last_name, email, password) VALUES($1, $2, $3, $4);",
        values: ["Dinobergue", "Viana", "dinobergueviana@gmail.com", "senha123"]
      });

      const users = await database.query("SELECT * FROM users;");
      console.log(users.rows)
      const response = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
        },
      );

      expect(response.status).toBe(201);
    });
  });
});

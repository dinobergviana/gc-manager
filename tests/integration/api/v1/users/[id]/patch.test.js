import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.awaitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[id]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'user'", async () => {
      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/1e9d0a2b-ef4b-4820-99a4-a25a89ede2a3",
        {
          method: "PATCH",
        },
      );

      expect(response2.status).toBe(404);
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "user1@email.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "user2@email.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "user1@email.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está em uso.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With unique 'email'", async () => {
      const createdUser = await orchestrator.createUser({
        email: "uniqueuser1@email.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueuser2@email.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        name: createdUser.name,
        last_name: createdUser.last_name,
        email: "uniqueuser2@email.com",
        password: createdUser.password,
        campus: 1,
        created_at: createdUser.created_at.toISOString(),
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "newPassword1",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        name: createdUser.name,
        last_name: createdUser.last_name,
        email: createdUser.email,
        password: responseBody.password,
        campus: 1,
        created_at: createdUser.created_at.toISOString(),
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneById(responseBody.id);
      const correctPasswordMatch = await password.compare(
        "newPassword2",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "newPassword1",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});

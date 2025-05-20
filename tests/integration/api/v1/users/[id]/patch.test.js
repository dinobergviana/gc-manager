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
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "User 1",
          last_name: "Silva",
          email: "user1@email.com",
          password: "senha123",
          campus: 1,
        }),
      });

      expect(user1Response.status).toBe(201);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "User 2",
          last_name: "Silva",
          email: "user2@email.com",
          password: "senha123",
          campus: 1,
        }),
      });

      expect(user2Response.status).toBe(201);

      const user2ResponseBody = await user2Response.json();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user2ResponseBody.id}`,
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
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Unique User 1",
          last_name: "Silva",
          email: "uniqueuser1@email.com",
          password: "senha123",
          campus: 1,
        }),
      });

      expect(user1Response.status).toBe(201);

      const user1ResponseBody = await user1Response.json();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user1ResponseBody.id}`,
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
        id: responseBody.id,
        name: "Unique User 1",
        last_name: "Silva",
        email: "uniqueuser2@email.com",
        password: responseBody.password,
        campus: 1,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New Password 1",
          last_name: "Silva",
          email: "newpassword1@email.com",
          password: "newPassword1",
          campus: 1,
        }),
      });

      expect(user1Response.status).toBe(201);

      const user1ResponseBody = await user1Response.json();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user1ResponseBody.id}`,
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
        name: "New Password 1",
        last_name: "Silva",
        email: "newpassword1@email.com",
        password: responseBody.password,
        campus: 1,
        created_at: responseBody.created_at,
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

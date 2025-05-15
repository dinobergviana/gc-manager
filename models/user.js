import database from "infra/database.js";
import password from "models/password.js";

import { ValidationError, NotFoundError } from "infra/errors.js";

async function create(userInputValues) {
  await validatedUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  async function hashPasswordInObject(userInputValues) {
    const hashedPassword = await password.hash(userInputValues.password);
    userInputValues.password = hashedPassword;
  }

  const newUser = await runInsertQuery(userInputValues);

  return newUser;

  async function runInsertQuery() {
    const results = await database.query({
      text: `
        INSERT INTO
          users (name, last_name, email, campus, password)
        VALUES
            ($1, $2, $3, $4,$5)
        RETURNING
          *
        ;`,
      values: [
        userInputValues.name,
        userInputValues.last_name,
        userInputValues.email,
        userInputValues.campus,
        userInputValues.password,
      ],
    });

    return results.rows[0];
  }
}

async function findOneById(userId) {
  const userFound = await runSelectQuery(userId);

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM
          users
        WHERE
          id = $1
        LIMIT
          1
        ;`,
      values: [userId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuário não encontrado.",
        action: "Entre em contato com o suporte.",
      });
    }

    return results.rows[0];
  }

  return userFound;
}

// implementar atualização dos demais campos: name, last_name, campus e password
async function update(userId, userInputValues) {
  const currentUser = await findOneById(userId);

  if ("email" in userInputValues) {
    await validatedUniqueEmail(userInputValues.email);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          name = $2,
          last_name = $3,
          email = $4,
          password = $5,
          campus = $6,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [
        userWithNewValues.id,
        userWithNewValues.name,
        userWithNewValues.last_name,
        userWithNewValues.email,
        userWithNewValues.password,
        userWithNewValues.campus,
      ],
    });

    return results.rows[0];
  }
}

async function validatedUniqueEmail(email) {
  const results = await database.query({
    text: `
        SELECT 
          email
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        ;`,
    values: [email],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está em uso.",
      action: "Utilize outro email para realizar esta operação.",
    });
  }
}

const user = {
  create,
  findOneById,
  update,
};

export default user;

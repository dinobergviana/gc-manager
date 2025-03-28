import database from "infra/database.js";
import { ValidationError } from "infra/errors.js";

async function create(userInputValues) {
  await validatedUniqueEmail(userInputValues.email);

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
        action: "Utilize outro email para realizar o cadastro.",
      });
    }
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

const user = {
  create,
};

export default user;

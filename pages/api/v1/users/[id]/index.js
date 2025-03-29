import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import { ValidationError } from "infra/errors.js";
import { validate as validateUuid } from "uuid";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userId = request.query.id;

  const isIdValid = validateUuid(userId);

  if (!isIdValid) {
    throw new ValidationError({
      message: "O id do usuário informado é inválido.",
      action: "Entre em contato com o suporte.",
    });
  }

  const userFound = await user.findOneById(userId);

  return response.status(200).json(userFound);
}

import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import { ForbidenError, ValidationError } from "infra/errors.js";
import { validate as validateUuid } from "uuid";
import authorization from "models/authorization";

const router = createRouter();

router.use(controller.injectUser);
router.get(getHandler);
router.patch(controller.canRequest("update:user"), patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const userId = request.query.id;

  const isIdValid = validateUuid(userId);

  if (!isIdValid) {
    throw new ValidationError({
      message: "O id do usuário informado é inválido.",
      action: "Entre em contato com o suporte.",
    });
  }

  const userFound = await user.findOneById(userId);

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:user",
    userFound,
  );

  return response.status(200).json(secureOutputValues);
}

async function patchHandler(request, response) {
  const userTryingToGet = request.context.user;

  const userId = request.query.id;

  const isIdValid = validateUuid(userId);

  if (!isIdValid) {
    throw new ValidationError({
      message: "O id do usuário informado é inválido.",
      action: "Entre em contato com o suporte.",
    });
  }

  const userInputValues = request.body;

  const userTryingToPatch = request.context.user;
  const targetUser = await user.findOneById(userId);

  if (!authorization.can(userTryingToPatch, "update:user", targetUser)) {
    throw new ForbidenError({
      message: "Você não possui permissão para atualizar outro usuário.",
      action:
        "Verifique se você possui a feature necessária para atualizar outro usuário.",
    });
  }

  const updatedUser = await user.update(userId, userInputValues);

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:user",
    updatedUser,
  );

  return response.status(200).json(secureOutputValues);
}

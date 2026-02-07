import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import activation from "models/activation.js";
import authorization from "models/authorization";

const router = createRouter();

router.use(controller.injectUser);
router.post(controller.canRequest("create:user"), postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userTryingToGet = request.context.user;
  const userInputValues = request.body;

  const newUser = await user.create(userInputValues);

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:user",
    newUser,
  );

  const activationToken = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, activationToken);

  return response.status(201).json(secureOutputValues);
}

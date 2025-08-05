import { createRouter } from "next-connect";
import controller from "infra/controller";
// import user from "models/user";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  return response.status(200).json({});
}

import { InternalServerError, MethodNotAllowedErrorError } from "infra/errors";

function onErrorHandler(error, request, response) {
  const publicErrorbject = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });

  console.error(publicErrorbject);

  response.status(publicErrorbject.statusCode).json(publicErrorbject);
}

function onNoMatchHandler(request, response) {
  const publicErrorbject = new MethodNotAllowedErrorError();
  response.status(publicErrorbject.statusCode).json(publicErrorbject);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;

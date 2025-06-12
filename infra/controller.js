import {
  InternalServerError,
  MethodNotAllowedErrorError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors";

function onErrorHandler(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorbject = new InternalServerError({
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

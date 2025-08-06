import * as cookie from "cookie";
import {
  InternalServerError,
  MethodNotAllowedErrorError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors";
import session from "models/session";

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

function setSessionCookie(sessionToken, response) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
};

export default controller;

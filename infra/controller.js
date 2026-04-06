import * as cookie from "cookie";
import {
  InternalServerError,
  MethodNotAllowedErrorError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbidenError,
} from "infra/errors";
import session from "models/session.js";
import user from "models/user.js";
import authorization from "models/authorization.js";

function onErrorHandler(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbidenError
  ) {
    return response.status(error.statusCode).json(error);
  }

  if (error instanceof UnauthorizedError) {
    clearSessionCookie(response);
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

function clearSessionCookie(response) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

async function injectUser(request, response, next) {
  if (request.cookies?.session_id) {
    await injectAuthenticatedUser(request);
  } else {
    injectBaseUser(request);
  }

  return next();
}

function injectBaseUser(request) {
  const baseUser = {
    features: ["read:activation_token", "create:session", "create:user"],
  };

  request.context = {
    ...request.context,
    user: baseUser,
  };
}

async function injectAuthenticatedUser(request) {
  const sessionToken = request.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  const userObject = await user.findOneById(sessionObject.user_id);

  request.context = {
    ...request.context,
    user: userObject,
  };

  return request;
}

function canRequest(feature) {
  return function canRequestMiddleware(request, response, next) {
    const userTryingToRequest = request.context.user;

    if (authorization.can(userTryingToRequest, feature)) {
      return next();
    }

    throw new ForbidenError({
      action: `Verifique se o seu usuário possui a feature "${feature}"`,
      message: "Você não possui permissão para executar essa ação.",
    });
  };
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
  injectUser,
  canRequest,
};

export default controller;

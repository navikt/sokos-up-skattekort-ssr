import { defineMiddleware } from "astro/middleware";
import { isInternal, isLocal } from "../utils/environment";
import { getToken, validateAzureToken } from "@navikt/oasis";
import logger from "@utils/logger.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  const startTime = performance.now();
  const path = context.url.pathname;

  logger.info({ path }, "Request started");

  const token = getToken(context.request.headers);

  if (isLocal) {
    context.locals.token = "mock-token";
    const duration = performance.now() - startTime;
    logger.info({ path, duration }, "Request completed (local mode)");
    return next();
  }

  if (isInternal(context)) {
    const duration = performance.now() - startTime;
    logger.info({ path, duration }, "Request completed (internal)");
    return next();
  }

  if (!token) {
    logger.warn({ path }, "Missing authorization token");
    return new Response(null, { status: 401 });
  }

  const validationStart = performance.now();
  const validation = await validateAzureToken(token);
  const validationDuration = performance.now() - validationStart;

  if (!validation.ok) {
    const error = new Error(
      `Invalid JWT token found (cause: ${validation.errorType} ${validation.error}.`,
    );
    logger.error(
      { path, validationDuration, error },
      "Token validation failed",
    );
    return new Response(null, { status: 401 });
  }

  logger.info({ path, validationDuration }, "Token validated");
  context.locals.token = token;

  const response = await next();
  const totalDuration = performance.now() - startTime;

  logger.info({ path, totalDuration }, "Request completed");
  return response;
});

import { defineMiddleware } from "astro/middleware";
import { getActionContext } from "astro:actions";
import { isInternal, isLocal } from "../utils/environment";
import { getToken, validateAzureToken } from "@navikt/oasis";
import logger from "@utils/logger.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  if (!isInternal(context)) {
    if (isLocal) {
      context.locals.token = "mock-token";
    } else {
      const token = getToken(context.request.headers);

      if (!token) {
        return new Response(null, { status: 401 });
      }

      const validation = await validateAzureToken(token);
      if (!validation.ok) {
        logger.error(
          `Invalid JWT token found (cause: ${validation.errorType} ${validation.error}.`,
        );
        return new Response(null, { status: 401 });
      }

      context.locals.token = token;
    }
  }

  const { action, setActionResult, serializeActionResult } =
    getActionContext(context);
  if (action?.calledFrom === "form") {
    const result = await action.handler();
    setActionResult(action.name, serializeActionResult(result));
  }

  return next();
});

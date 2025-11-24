import { defineAction, ActionError } from "astro:actions";
import { RequestSchema } from "@schema/SkattekortSchema";
import { getOboToken } from "@utils/token";
import { fetchSkattekort } from "@utils/api";
import { isLocal } from "@utils/environment";
import logger from "@utils/logger";
import { HttpStatusCodeError } from "../types/errors";

export const server = {
  hentSkattekort: defineAction({
    input: RequestSchema,
    handler: async (input, context) => {
      const token = context.locals.token;

      if (!token) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      let backendToken = token;

      if (!isLocal) {
        const audience = input.useNewApi
          ? process.env.SOKOS_SKATTEKORT_API_AUDIENCE
          : process.env.SOKOS_SKATTEKORT_PERSON_API_AUDIENCE;

        if (!audience) {
          logger.error(
            `Audience missing for ${input.useNewApi ? "new" : "old"} API`,
          );
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Configuration error",
          });
        }

        try {
          backendToken = await getOboToken(token, audience);
        } catch (e) {
          logger.error({ error: e }, "OBO token exchange failed");
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "Failed to obtain backend token",
          });
        }
      }

      try {
        const data = await fetchSkattekort(input, backendToken);
        return data;
      } catch (error) {
        if (error instanceof HttpStatusCodeError) {
          if (error.statusCode === 401 || error.statusCode === 403) {
            throw new ActionError({
              code: "UNAUTHORIZED",
              message: error.message,
            });
          }
          if (error.statusCode === 404) {
            throw new ActionError({
              code: "NOT_FOUND",
              message: error.message,
            });
          }
          if (error.statusCode === 400) {
            throw new ActionError({
              code: "BAD_REQUEST",
              message: error.message,
            });
          }
        }

        logger.error({ error }, "Error fetching skattekort");
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  }),
};

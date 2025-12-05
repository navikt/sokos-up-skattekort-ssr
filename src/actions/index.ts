import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { getOboToken } from "@utils/token";
import { fetchSkattekort } from "@utils/api";
import { isLocal } from "@utils/environment";
import logger from "@utils/logger";
import { HttpStatusCodeError } from "../types/errors";

const RequestSchema = z.object({
  fnr: z
    .string()
    .min(11, "Fødselsnummer må være 11 siffer")
    .max(11, "Fødselsnummer må være 11 siffer")
    .regex(/^\d{11}$/, "Fødselsnummer må inneholde kun tall"),
  inntektsaar: z
    .number()
    .min(2000)
    .max(new Date().getFullYear() + 1),
});

export const server = {
  hentSkattekort: defineAction({
    accept: "json",
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
        const audience = process.env.SOKOS_SKATTEKORT_API_AUDIENCE;

        if (!audience) {
          logger.error(`Audience missing for API`);
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

      context.session?.set("lastSearch", {
        fnr: input.fnr,
        inntektsaar: input.inntektsaar.toString(),
      });

      try {
        const data = await fetchSkattekort(input, backendToken);
        context.session?.set("skattekortResult", data);
        context.session?.set("skattekortError", undefined);
        return { success: true };
      } catch (error) {
        let errorMessage = "Ukjent feil";

        if (error instanceof HttpStatusCodeError) {
          errorMessage = error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        logger.error({ error }, "Error fetching skattekort");

        context.session?.set("skattekortError", errorMessage);
        context.session?.set("skattekortResult", undefined);

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
        });
      }
    },
  }),
};

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import logger from "@utils/logger.ts";
import { getOboToken } from "@utils/token";
import { postSkattekortSearch } from "@utils/fetch";
import { sanitizeFnr } from "@utils/fnr";
import { SkattekortDataSchema } from "@schema/SkattekortSchema";
import type { SkattekortData } from "@schema/SkattekortSchema";
import { getYearOptions } from "@utils/year";

type SkattekortLookupResult = {
  payload: SkattekortData;
  query: {
    fnr: string;
    year: number;
  };
};

const fnrField = z
  .string({ required_error: "Fødselsnummer er obligatorisk" })
  .min(1, { message: "Fødselsnummer er obligatorisk" })
  .transform((value) => sanitizeFnr(value))
  .pipe(
    z.string().regex(/^[0-9]{11}$/, {
      message: "Fødselsnummer er ikke gyldig",
    }),
  );

const yearField = z.coerce
  .number({
    required_error: "Inntektsåret må velges",
    invalid_type_error: "Inntektsåret må være et tall",
  })
  .int("Inntektsåret må være et helt tall");

export const server = {
  skattekort: {
    search: defineAction({
      accept: "form",
      input: z.object({
        fnr: fnrField,
        year: yearField,
      }),
      handler: async (input, context): Promise<SkattekortLookupResult> => {
        const yearOptions = getYearOptions();
        if (!yearOptions.includes(input.year)) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Ugyldig inntektsår",
          });
        }

        const oboToken = context.locals.token
          ? await getOboToken(context.locals.token)
          : undefined;

        const response = await postSkattekortSearch(
          { fnr: input.fnr, inntektsaar: input.year },
          oboToken,
        );

        if (!response.ok) {
          const message = `Uventet svar fra skattekort API (${response.status})`;
          logger.error({ status: response.status }, message);
          const code = response.status === 401 ? "UNAUTHORIZED" : "BAD_REQUEST";
          throw new ActionError({ code, message });
        }

        const body = await response.json();
        const parsed = SkattekortDataSchema.safeParse(body);

        if (!parsed.success) {
          logger.error(
            { issues: parsed.error.issues },
            "Kunne ikke validere svar fra skattekort API",
          );
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Kunne ikke lese skattekort-data",
          });
        }

        return {
          payload: parsed.data,
          query: { fnr: input.fnr, year: input.year },
        } satisfies SkattekortLookupResult;
      },
    }),
  },
};

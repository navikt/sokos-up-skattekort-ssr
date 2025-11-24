import type { APIRoute } from "astro";
import { RequestSchema } from "@schema/SkattekortSchema";
import { fetchSkattekort } from "@utils/api";
import { ApiError, HttpStatusCodeError } from "../../../types/errors";
import logger from "@utils/logger";
import { getOboToken } from "@utils/token";
import { isLocal } from "@utils/environment";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const token = locals.token;

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const validated = RequestSchema.parse(body);

    let backendToken = token;

    if (!isLocal) {
      const audience = validated.useNewApi
        ? process.env.SOKOS_SKATTEKORT_API_AUDIENCE
        : process.env.SOKOS_SKATTEKORT_PERSON_API_AUDIENCE;

      if (!audience) {
        throw new Error(
          `Audience environment variable is missing for ${validated.useNewApi ? "new" : "old"} API`,
        );
      }

      logger.info(
        `Requesting OBO token for audience: ${audience} (useNewApi=${validated.useNewApi})`,
      );

      try {
        backendToken = await getOboToken(token, audience);
      } catch (e) {
        logger.error({ error: e }, "OBO token exchange failed");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const data = await fetchSkattekort(validated, backendToken);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error(
      {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Error in skattekort API route",
    );

    if (error instanceof HttpStatusCodeError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (error instanceof ApiError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (error && typeof error === "object" && "issues" in error) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: error }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

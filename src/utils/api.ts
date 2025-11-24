import type { Response } from "../types/Response";
import type { Request } from "@schema/SkattekortSchema";
import { ApiError, HttpStatusCodeError } from "../types/errors";
import logger from "@utils/logger";
import { isLocal } from "@utils/environment";

const OLD_API_URL = isLocal
  ? "http://localhost:3000"
  : process.env.SOKOS_SKATTEKORT_PERSON_API;

const NEW_API_URL = isLocal
  ? "http://localhost:3000"
  : process.env.SOKOS_SKATTEKORT_API;

export async function fetchSkattekort(
  query: Request,
  token: string,
): Promise<Response> {
  const { useNewApi, ...payload } = query;
  const BASE_API_URL = useNewApi ? NEW_API_URL : OLD_API_URL;

  if (!BASE_API_URL) {
    throw new Error(
      `Backend URL is not configured (${useNewApi ? "SOKOS_SKATTEKORT_API" : "SOKOS_SKATTEKORT_PERSON_API"} missing)`,
    );
  }
  const url = `${BASE_API_URL}/api/v1/hent-skattekort`;

  logger.info(`Fetching skattekort from: ${url}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "";

      try {
        const json = JSON.parse(errorText);
        errorMessage = json.message || json.error || "";
      } catch {
        if (errorText.length < 200) errorMessage = errorText;
      }

      logger.error(
        {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url,
        },
        "Backend response not OK",
      );

      if (response.status === 400) {
        throw new HttpStatusCodeError(
          400,
          errorMessage || "Ugyldig forespørsel",
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new HttpStatusCodeError(response.status, "Ikke tilgang");
      }

      if (response.status === 404) {
        throw new HttpStatusCodeError(404, errorMessage || "Fant ikke ressurs");
      }

      throw new ApiError(
        errorMessage ||
          `Issues with connection to backend: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data as Response;
  } catch (error) {
    logger.error(
      {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        url,
      },
      "Failed to fetch skattekort",
    );
    throw error;
  }
}

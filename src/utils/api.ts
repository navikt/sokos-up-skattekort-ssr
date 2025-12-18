import type { Response } from "../types/Response";
import type { Request } from "@schema/SkattekortSchema";
import { ApiError, HttpStatusCodeError } from "../types/errors";
import logger from "@utils/logger";
import { isLocal } from "@utils/environment";

const API_URL = isLocal
  ? "http://localhost:3000"
  : process.env.SOKOS_SKATTEKORT_API;

export async function fetchSkattekort(
  query: Request,
  token: string,
): Promise<Response> {
  if (!API_URL) {
    throw new Error(
      `Backend URL is not configured (SOKOS_SKATTEKORT_API missing)`,
    );
  }
  const url = `${API_URL}/api/v1/hent-skattekort`;
  const startTime = performance.now();

  logger.info({ url, query }, "Backend request started");

  try {
    const fetchStart = performance.now();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(query),
    });

    const fetchDuration = performance.now() - fetchStart;
    logger.info(
      { url, fetchDuration, status: response.status },
      "Backend response received",
    );

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
    const totalDuration = performance.now() - startTime;

    logger.info({ url, totalDuration }, "Backend request completed");

    return data as Response;
  } catch (error) {
    const totalDuration = performance.now() - startTime;
    logger.error(
      {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        url,
        totalDuration,
      },
      "Failed to fetch skattekort",
    );
    throw error;
  }
}

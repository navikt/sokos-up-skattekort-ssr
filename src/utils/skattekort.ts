import type { Response } from "../types/Response";
import type { Request } from "@schema/SkattekortSchema";
import { fetchSkattekort } from "./api";
import { getOboToken } from "./token";
import { isLocal } from "./environment";
import logger from "./logger";

export interface SkattekortResult {
  data: Response | null;
  error: string | null;
}

export async function getSkattekort(
  request: Request,
  token: string,
): Promise<SkattekortResult> {
  let backendToken = token;

  if (!isLocal) {
    const audience = process.env.SOKOS_SKATTEKORT_API_AUDIENCE;

    if (!audience) {
      logger.error("Audience missing for API");
      return { data: null, error: "Configuration error" };
    }

    try {
      backendToken = await getOboToken(token, audience);
    } catch (e) {
      logger.error({ error: e }, "OBO token exchange failed");
      return { data: null, error: "Failed to obtain backend token" };
    }
  }

  try {
    const data = await fetchSkattekort(request, backendToken);
    return { data, error: null };
  } catch (error) {
    logger.error({ error }, "Error fetching skattekort");
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message };
  }
}

export function getAvailableYears(currentYear?: number): number[] {
  const now = new Date();
  const year = currentYear ?? now.getFullYear();
  const isAfterDec15 = now.getMonth() === 11 && now.getDate() >= 15;

  return isAfterDec15 ? [year, year + 1] : [year - 1, year];
}

export function getDefaultYear(): number {
  return new Date().getFullYear();
}

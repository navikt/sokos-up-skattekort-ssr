import { requestOboToken } from "@navikt/oasis";
import { isLocal } from "./environment";
import logger from "./logger";

export const getOboToken = async (
  token: string,
  audience: string,
): Promise<string> => {
  if (isLocal) {
    return "Fake token";
  }

  const oboResult = await requestOboToken(token, audience);

  if (!oboResult.ok) {
    logger.error(
      { error: oboResult.error, audience },
      "Failed to get OBO token",
    );
    throw new Error("Request oboToken failed");
  }

  return oboResult.token;
};

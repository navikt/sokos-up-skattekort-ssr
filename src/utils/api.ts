import type { Request } from "@schema/SkattekortSchema";
import { isLocal } from "@utils/environment";
import logger from "@utils/logger";
import { ApiError, HttpStatusCodeError } from "../types/errors";
import type { SkattekortData } from "../types/schema/SkattekortSchema";

const API_URL = isLocal
	? "http://localhost:3000"
	: process.env.SOKOS_SKATTEKORT_API;

export async function fetchSkattekort(
	query: Request,
	token: string,
): Promise<SkattekortData> {
	if (!API_URL) {
		throw new Error(
			`Backend URL is not configured (SOKOS_SKATTEKORT_API missing)`,
		);
	}
	const url = `${API_URL}/api/v1/hent-skattekort`;

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
			body: JSON.stringify(query),
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

		console.log("API Response:", JSON.stringify(data, null, 2));

		return data as SkattekortData;
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

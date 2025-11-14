const DEFAULT_BASE_URL = "http://localhost:3000/skattekort-api/api/v1";

const getBaseUrl = () =>
  process.env.SKATTEKORT_API_BASE_URL ?? DEFAULT_BASE_URL;

type SkattekortSearchPayload = {
  fnr: string;
  inntektsaar: number;
};

export const postSkattekortSearch = async (
  payload: SkattekortSearchPayload,
  token?: string,
) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/hent-skattekort`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
};

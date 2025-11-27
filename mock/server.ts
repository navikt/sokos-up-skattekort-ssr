import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import skattekort2024 from "./data/skattekort-2024.json";
import skattekort2025 from "./data/skattekort-2025.json";
import skattekort2026 from "./data/skattekort-2026.json";
import ikkeSkattekort from "./data/ikke-skattekort.json";

const api = new Hono();

api.use(
  "/*",
  cors({
    origin: "http://localhost:4321",
    credentials: true,
  }),
);

api.post("/api/v1/hent-skattekort", async (c) => {
  const body = await c.req.json();
  const { fnr, inntektsaar } = body;

  console.log("Received request:", {
    fnr,
    inntektsaar,
    type: typeof inntektsaar,
  });

  if (!fnr || fnr.length !== 11) {
    return c.json({ error: "Ugyldig fødselsnummer" }, 400);
  }

  if (fnr === "22222222222") {
    return c.json(ikkeSkattekort);
  }

  const year = Number(inntektsaar);
  if (year === 2025) {
    return c.json(skattekort2025);
  } else if (year === 2026) {
    return c.json(skattekort2026);
  } else if (year === 2024) {
    return c.json(skattekort2024);
  }

  return c.json(
    {
      error: `Fant ikke skattekort for oppgitt år: ${inntektsaar} (${typeof inntektsaar})`,
    },
    404,
  );
});

serve(
  {
    fetch: api.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Mock server running on http://localhost:${info.port}`);
  },
);

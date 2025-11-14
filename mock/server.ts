import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import ikkeSkattekort from "./data/ikkeSkattekort.json";
import tabelltrekk from "./data/skattekortMedTabelltrekk.json";
import tilleggsopplysning from "./data/skattekortMedTilleggsopplysning.json";
import frikort from "./data/skattekortUtenNavn.json";

const api = new Hono();

const mockResponses = new Map<string, unknown>([
  ["01016902310", tilleggsopplysning],
  ["04014400295", tabelltrekk],
  ["01096000533", frikort],
  ["04015201822", ikkeSkattekort],
]);

api.use(
  "/*",
  cors({
    origin: ["http://localhost:4321"],
    credentials: true,
  }),
);

api.post("/skattekort-api/api/v1/hent-skattekort", async (context) => {
  const body = await context.req
    .json<{ fnr?: string }>()
    .catch(() => undefined);
  const fnr = body?.fnr ?? "";
  const response = mockResponses.get(fnr) ?? [];
  return context.json(response);
});

serve({
  fetch: api.fetch,
  port: 3000,
});

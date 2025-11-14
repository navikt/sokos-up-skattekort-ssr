import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import tilleggsopplysning from "./data/skattekortMedTilleggsopplysning.json";
import tabelltrekk from "./data/skattekortMedTabelltrekk.json";
import frikort from "./data/skattekortUtenNavn.json";
import ikkeSkattekort from "./data/ikkeSkattekort.json";
import tomtSvar from "./data/tomtSvar.json";

const api = new Hono();

const mockResponses = new Map([
  ["01016902310", tilleggsopplysning],
  ["04014400295", tabelltrekk],
  ["01096000533", frikort],
  ["04015201822", ikkeSkattekort],
]);

api.use(
  "/*",
  cors({
    origin: ["http://localhost:4321", "http://localhost:4322"],
    credentials: true,
  }),
);

api.post("/skattekort-api/api/v1/hent-skattekort", async (context) => {
  const body = await context.req
    .json<{ fnr?: string }>()
    .catch(() => undefined);
  const fnr = body?.fnr ?? "";
  const response = mockResponses.get(fnr) ?? tomtSvar;
  return context.json(response);
});

serve({
  fetch: api.fetch,
  port: 3000,
});

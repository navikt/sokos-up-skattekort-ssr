/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { Response } from "./types/Response";

declare global {
  namespace App {
    interface Locals {
      token: string;
    }

    interface SessionData {
      skattekortResult?: Response;
      skattekortError?: string;
      lastSearch?: {
        fnr: string;
        inntektsaar: string;
      };
    }
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    SOKOS_SKATTEKORT_API: string;
    SOKOS_SKATTEKORT_API_AUDIENCE: string;
  }
}

export {};

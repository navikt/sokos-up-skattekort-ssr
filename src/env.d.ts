/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    token: string;
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    SOKOS_SKATTEKORT_PERSON_API: string;
  }
}

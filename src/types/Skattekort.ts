import type {
  Arbeidsgiveridentifikator,
  Forskuddstrekk,
  SkattekortData,
  Tilleggsopplysning,
  Trekkode,
} from "@schema/SkattekortSchema";

export type {
  Arbeidsgiveridentifikator,
  Forskuddstrekk,
  SkattekortData,
  Tilleggsopplysning,
  Trekkode,
};

export type SkattekortQuery = {
  fnr: string;
  year: number;
};

export type SkattekortLookupResult = {
  payload: SkattekortData;
  query: SkattekortQuery;
};

import type { Tilleggsopplysning } from "@schema/SkattekortSchema";

export const TilleggsopplysningTekster = new Map<Tilleggsopplysning, string>([
  ["oppholdPaaSvalbard", "Opphold på Svalbard"],
  ["kildeskattpensjonist", "Kildeskatt pensjonist"],
  ["oppholdITiltakssone", "Opphold i tiltakssone"],
  ["kildeskattPaaLoenn", "Kildeskatt på lønn"],
]);

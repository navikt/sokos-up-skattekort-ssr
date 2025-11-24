import { z } from "zod";

export const RequestSchema = z.object({
  fnr: z
    .string()
    .min(11, "Fødselsnummer må være 11 siffer")
    .max(11, "Fødselsnummer må være 11 siffer")
    .regex(/^\d{11}$/, "Fødselsnummer må inneholde kun tall"),
  inntektsaar: z
    .number()
    .min(2000)
    .max(new Date().getFullYear() + 1),
  useNewApi: z.boolean().optional(),
});

export type Request = z.infer<typeof RequestSchema>;

const ResultatStatusSchema = z.enum([
  "ikkeSkattekort",
  "skattekortopplysningerOK",
] as const);

const TrekkodeSchema = z.enum([
  "loennFraHovedarbeidsgiver",
  "loennFraBiarbeidsgiver",
  "loennFraNAV",
  "pensjon",
  "pensjonFraNAV",
  "loennTilUtenrikstjenestemann",
  "loennKunTrygdeavgiftTilUtenlandskBorger",
  "loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger",
  "ufoeretrygdFraNAV",
  "ufoereytelserFraAndre",
  "introduksjonsstoenad",
] as const);

export type Trekkode = z.infer<typeof TrekkodeSchema>;

const TilleggsopplysningSchema = z.enum([
  "oppholdPaaSvalbard",
  "kildeskattpensjonist",
  "oppholdITiltakssone",
  "kildeskattPaaLoenn",
] as const);

export type Tilleggsopplysning = z.infer<typeof TilleggsopplysningSchema>;

const TabelltypeSchema = z.enum([
  "trekktabellForPensjon",
  "trekktabellForLoenn",
] as const);

const FrikortSchema = z.object({
  type: z.literal("Frikort"),
  trekkode: TrekkodeSchema,
  frikortbeloep: z.number().optional(),
});

const TrekktabellSchema = z.object({
  type: z.literal("Trekktabell"),
  trekkode: TrekkodeSchema,
  tabelltype: TabelltypeSchema.optional(),
  tabellnummer: z.string().optional(),
  prosentsats: z.number().optional(),
  antallMaanederForTrekk: z.number().optional(),
});

const TrekkprosentSchema = z.object({
  type: z.literal("Trekkprosent"),
  trekkode: TrekkodeSchema,
  prosentsats: z.number().optional(),
  antallMaanederForTrekk: z.number().optional(),
});

const ForskuddstrekkSchema = z.discriminatedUnion("type", [
  FrikortSchema,
  TrekktabellSchema,
  TrekkprosentSchema,
]);

export type Forskuddstrekk = z.infer<typeof ForskuddstrekkSchema>;

const SkattekortSchema = z.object({
  utstedtDato: z.string().regex(/[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
  skattekortidentifikator: z.number(),
  forskuddstrekk: z.array(ForskuddstrekkSchema),
});

const ArbeidstakerSchema = z.object({
  inntektsaar: z.number(),
  arbeidstakeridentifikator: z.string().regex(/[0-9]{11}$/),
  resultatPaaForespoersel: ResultatStatusSchema,
  skattekort: z.optional(SkattekortSchema),
  tilleggsopplysning: z.optional(z.array(TilleggsopplysningSchema)),
});

const ArbeidsgiveridentifikatorSchema = z.object({
  organisasjonsnummer: z.string().regex(/[0-9]{9}$/),
});

export type Arbeidsgiveridentifikator = z.infer<
  typeof ArbeidsgiveridentifikatorSchema
>;

const ArbeidsgiverSchema = z.object({
  arbeidstaker: z.array(ArbeidstakerSchema),
  arbeidsgiveridentifikator: ArbeidsgiveridentifikatorSchema,
});

export const SkattekortDataSchema = z.array(
  z.object({
    navn: z.optional(z.string()),
    arbeidsgiver: z.array(ArbeidsgiverSchema),
  }),
);

export type SkattekortData = z.infer<typeof SkattekortDataSchema>;

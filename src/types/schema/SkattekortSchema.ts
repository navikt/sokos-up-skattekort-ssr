import { z } from "astro/zod";

export const RequestSchema = z.object({
	fnr: z
		.string()
		.min(11, "Fødselsnummer må være 11 siffer")
		.max(11, "Fødselsnummer må være 11 siffer")
		.regex(/^\d{11}$/, "Fødselsnummer må inneholde kun tall"),
	inntektsaar: z.coerce
		.number()
		.min(2000)
		.max(new Date().getFullYear() + 1),
});

export type Request = z.infer<typeof RequestSchema>;

const ResultatStatusSchema = z.enum([
	"ikkeSkattekort",
	"vurderArbeidstillatelse",
	"ikkeTrekkplikt",
	"skattekortopplysningerOK",
	"ugyldigOrganisasjonsnummer",
	"ugyldigFoedselsEllerDnummer",
	"utgaattDnummerSkattekortForFoedselsnummerErLevert",
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

const FrikortSchema = z.object({
	type: z.literal("Frikort"),
	trekkode: TrekkodeSchema,
	frikortbeloep: z.number().optional(),
});

const TrekktabellSchema = z.object({
	type: z.literal("Trekktabell"),
	trekkode: TrekkodeSchema,
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
	utstedtDato: z.string().optional(),
	skattekortidentifikator: z.number().optional(),
	forskuddstrekk: z.array(ForskuddstrekkSchema).optional(),
});

const ArbeidstakerSchema = z.object({
	inntektsaar: z.number(),
	arbeidstakeridentifikator: z.string(),
	resultatPaaForespoersel: ResultatStatusSchema,
	skattekort: z.optional(SkattekortSchema),
	tilleggsopplysning: z.optional(z.array(TilleggsopplysningSchema)),
});

export type Arbeidstaker = z.infer<typeof ArbeidstakerSchema>;

export const SkattekortDataSchema = z.array(ArbeidstakerSchema);

export type SkattekortData = z.infer<typeof SkattekortDataSchema>;

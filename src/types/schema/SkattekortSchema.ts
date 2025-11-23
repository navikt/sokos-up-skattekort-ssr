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
});

export const ResponseSchema = z.object({
  arbeidstaker: z.object({
    fnr: z.string(),
    navn: z.string().optional(),
  }),
  inntektsaar: z.number(),
  arbeidsgiver: z.object({
    organisasjonsnummer: z.string(),
    organisasjonsnavn: z.string().optional(),
  }),
  skattekort: z.object({
    prosentsats: z.number().optional(),
    tabellnummer: z.string().optional(),
    trekkgrunn: z.string().optional(),
    frikort: z.boolean().optional(),
  }),
  tilleggsopplysninger: z.string().optional(),
});

export type RequestInput = z.infer<typeof RequestSchema>;
export type ResponseOutput = z.infer<typeof ResponseSchema>;

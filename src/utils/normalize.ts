import type { Response } from "../types/Response";
import type {
  SkattekortData,
  SkattekortPersonDto,
} from "../types/schema/SkattekortSchema";

// denne util'en her vil fjernes på sikt når vi kun har sokos-skattekort

export interface NormalizedSkattekort {
  overskrift: string;
  underOverskrift?: string;
  inntektsaar: number;
  resultat: string;
  utstedtDato?: string | null;
  skattekortId?: number | null;
  forskuddstrekk: Array<{
    type: string;
    trekkode: string;
    prosentsats?: number | null;
    tabellnummer?: string | null;
    frikortbeloep?: number | null;
  }>;
  tilleggsopplysning?: string[];
}

export const normalizeResponse = (data: Response): NormalizedSkattekort[] => {
  if (Array.isArray(data)) {
    if (data.length === 0) return [];

    // sokos-skattekort-person
    if ("arbeidsgiver" in data[0]) {
      return (data as SkattekortData).flatMap((person) =>
        person.arbeidsgiver.flatMap((ag) =>
          ag.arbeidstaker.map((at) => ({
            overskrift: `Skattekort for ${person.navn || "Ukjent navn"}`,
            underOverskrift: `Arbeidsgiver: ${ag.arbeidsgiveridentifikator.organisasjonsnummer}`,
            inntektsaar: at.inntektsaar,
            resultat: at.resultatPaaForespoersel,
            utstedtDato: at.skattekort?.utstedtDato,
            skattekortId: at.skattekort?.skattekortidentifikator,
            forskuddstrekk: at.skattekort?.forskuddstrekk || [],
            tilleggsopplysning: at.tilleggsopplysning,
          })),
        ),
      );
    }

    // sokos-skattekort
    return (data as SkattekortPersonDto[]).map((dto) => ({
      overskrift: `Skattekort for ${dto.arbeidstakeridentifikator}`,
      inntektsaar: dto.inntektsaar,
      resultat: dto.resultatPaaForespoersel,
      utstedtDato: dto.skattekort?.utstedtDato,
      skattekortId: dto.skattekort?.skattekortidentifikator,
      forskuddstrekk: dto.skattekort?.forskuddstrekk || [],
      tilleggsopplysning: dto.tilleggsopplysning,
    }));
  }

  // sokos-skattekort enkelt-objekt
  const dto = data as SkattekortPersonDto;
  return [
    {
      overskrift: `Skattekort for ${dto.arbeidstakeridentifikator}`,
      inntektsaar: dto.inntektsaar,
      resultat: dto.resultatPaaForespoersel,
      utstedtDato: dto.skattekort?.utstedtDato,
      skattekortId: dto.skattekort?.skattekortidentifikator,
      forskuddstrekk: dto.skattekort?.forskuddstrekk || [],
      tilleggsopplysning: dto.tilleggsopplysning,
    },
  ];
};

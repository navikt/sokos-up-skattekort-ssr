export type Response = {
  arbeidstaker: {
    fnr: string;
    navn?: string;
  };
  inntektsaar: number;
  arbeidsgiver: {
    organisasjonsnummer: string;
    organisasjonsnavn?: string;
  };
  skattekort: {
    prosentsats?: number;
    tabellnummer?: string;
    trekkgrunn?: string;
    frikort?: boolean;
  };
  tilleggsopplysninger?: string;
};

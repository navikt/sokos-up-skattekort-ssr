import {
  Alert,
  Button,
  Checkbox,
  Heading,
  Loader,
  TextField,
  ToggleGroup,
} from "@navikt/ds-react";
import { actions } from "astro:actions";
import { useState } from "react";
import type { Response } from "../../types/Response";
import {
  normalizeResponse,
  type NormalizedSkattekort,
} from "../../utils/normalize";
import styles from "./Form.module.css";

interface SkattekortFormProps {
  currentYear?: number;
}

export default function Form({
  currentYear = new Date().getFullYear(),
}: SkattekortFormProps) {
  const [fnr, setFnr] = useState("");
  const [inntektsaar, setInntektsaar] = useState(currentYear.toString());
  const [useNewApi, setUseNewApi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Response | null>(null);
  const [fnrError, setFnrError] = useState<string | null>(null);

  const validateFnr = (value: string): string | null => {
    if (!value) {
      return "Fødselsnummer er påkrevd";
    }
    if (value.length !== 11) {
      return "Fødselsnummer må være 11 siffer";
    }
    if (!/^\d{11}$/.test(value)) {
      return "Fødselsnummer må inneholde kun tall";
    }
    return null;
  };

  const handleFnrChange = (value: string) => {
    setFnr(value);
    setFnrError(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setData(null);

    const validationError = validateFnr(fnr);
    if (validationError) {
      setFnrError(validationError);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await actions.hentSkattekort({
        fnr,
        inntektsaar: parseInt(inntektsaar),
        useNewApi,
      });

      if (error) {
        throw new Error(
          error.message || "Noe gikk galt ved henting av skattekort",
        );
      }

      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  };

  const normalizedData = data ? normalizeResponse(data) : null;

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Heading level="2" size="medium" spacing>
          Søk etter skattekort
        </Heading>

        <TextField
          label="Fødselsnummer (11 siffer)"
          value={fnr}
          onChange={(e) => handleFnrChange(e.target.value)}
          error={fnrError}
          autoComplete="off"
          maxLength={11}
          className={styles.input}
        />

        <ToggleGroup
          label="Velg inntektsår"
          value={inntektsaar}
          onChange={(value) => setInntektsaar(value)}
          size="small"
        >
          <ToggleGroup.Item value={(currentYear - 1).toString()}>
            {currentYear - 1}
          </ToggleGroup.Item>
          <ToggleGroup.Item value={currentYear.toString()}>
            {currentYear}
          </ToggleGroup.Item>
        </ToggleGroup>

        <Checkbox
          checked={useNewApi}
          onChange={(e) => setUseNewApi(e.target.checked)}
        >
          Bruk nytt API (sokos-skattekort)
        </Checkbox>

        <Button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? <Loader size="small" /> : "Søk"}
        </Button>
      </form>

      {error && (
        <Alert variant="error" className={styles.alert}>
          {error}
        </Alert>
      )}

      {normalizedData && normalizedData.length === 0 && (
        <Alert variant="info" className={styles.alert}>
          Ingen skattekort funnet for det valgte året.
        </Alert>
      )}

      {normalizedData &&
        normalizedData.length > 0 &&
        normalizedData.map((person: NormalizedSkattekort, pIndex) => (
          <div key={pIndex} className={styles.result}>
            <Heading level="3" size="small" spacing>
              {person.overskrift}
            </Heading>
            {person.underOverskrift && (
              <div className={styles.underOverskrift}>
                {person.underOverskrift}
              </div>
            )}
            <dl className={styles.details}>
              <dt>Inntektsår:</dt>
              <dd>{person.inntektsaar}</dd>

              <dt>Resultat:</dt>
              <dd>{person.resultat}</dd>

              {person.utstedtDato && (
                <>
                  <dt>Utstedt dato:</dt>
                  <dd>{person.utstedtDato}</dd>
                </>
              )}

              {person.skattekortId !== null && (
                <>
                  <dt>Skattekort ID:</dt>
                  <dd>{person.skattekortId}</dd>
                </>
              )}

              {person.forskuddstrekk.length > 0 && (
                <>
                  <dt>Forskuddstrekk:</dt>
                  <dd>
                    <ul className={styles.forskuddstrekkList}>
                      {person.forskuddstrekk.map((ft: any, ftIndex: number) => (
                        <li key={`${ft.trekkode}-${ft.type}-${ftIndex}`}>
                          <strong>{ft.type}</strong> ({ft.trekkode})
                          {ft.type === "Trekkprosent" && ft.prosentsats && (
                            <span> - {ft.prosentsats}%</span>
                          )}
                          {ft.type === "Trekktabell" && ft.tabellnummer && (
                            <span> - Tabell {ft.tabellnummer}</span>
                          )}
                          {ft.type === "Frikort" && ft.frikortbeloep && (
                            <span> - Frikortbeløp: {ft.frikortbeloep}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </>
              )}

              {person.tilleggsopplysning &&
                person.tilleggsopplysning.length > 0 && (
                  <>
                    <dt>Tilleggsopplysninger:</dt>
                    <dd>{person.tilleggsopplysning.join(", ")}</dd>
                  </>
                )}
            </dl>
          </div>
        ))}
    </div>
  );
}

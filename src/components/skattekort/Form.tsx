import {
  Alert,
  Button,
  Checkbox,
  Heading,
  Loader,
  TextField,
  ToggleGroup,
} from "@navikt/ds-react";
import { useState } from "react";
import type { Response } from "../../types/Response";
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
      const response = await fetch(
        `${import.meta.env.BASE_URL}/api/skattekort/hent-skattekort`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fnr,
            inntektsaar: parseInt(inntektsaar),
            useNewApi,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Noe gikk galt ved henting av skattekort",
        );
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  };

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

      {data && data.length === 0 && (
        <Alert variant="info" className={styles.alert}>
          Ingen skattekort funnet for det valgte året.
        </Alert>
      )}

      {data &&
        data.map((person, pIndex) => (
          <div key={pIndex} className={styles.result}>
            <Heading level="3" size="small" spacing>
              Skattekort for {person.navn || "Ukjent navn"}
            </Heading>

            {person.arbeidsgiver.map((ag, agIndex) => (
              <div key={agIndex} className={styles.arbeidsgiver}>
                <Heading level="4" size="xsmall" spacing>
                  Arbeidsgiver:{" "}
                  {ag.arbeidsgiveridentifikator.organisasjonsnummer}
                </Heading>

                {ag.arbeidstaker.map((at, atIndex) => (
                  <div
                    key={at.arbeidstakeridentifikator}
                    className={styles.arbeidstaker}
                  >
                    <dl className={styles.details}>
                      <dt>Inntektsår:</dt>
                      <dd>{at.inntektsaar}</dd>

                      <dt>Resultat:</dt>
                      <dd>{at.resultatPaaForespoersel}</dd>

                      {at.skattekort && (
                        <>
                          <dt>Utstedt dato:</dt>
                          <dd>{at.skattekort.utstedtDato}</dd>

                          <dt>Skattekort ID:</dt>
                          <dd>{at.skattekort.skattekortidentifikator}</dd>

                          <dt>Forskuddstrekk:</dt>
                          <dd>
                            <ul className={styles.forskuddstrekkList}>
                              {at.skattekort.forskuddstrekk.map(
                                (ft, ftIndex) => (
                                  <li
                                    key={`${ft.trekkode}-${ft.type}-${ftIndex}`}
                                  >
                                    <strong>{ft.type}</strong> ({ft.trekkode})
                                    {ft.type === "Trekkprosent" &&
                                      ft.prosentsats && (
                                        <span> - {ft.prosentsats}%</span>
                                      )}
                                    {ft.type === "Trekktabell" &&
                                      ft.tabellnummer && (
                                        <span> - Tabell {ft.tabellnummer}</span>
                                      )}
                                    {ft.type === "Frikort" &&
                                      ft.frikortbeloep && (
                                        <span>
                                          {" "}
                                          - Frikortbeløp: {ft.frikortbeloep}
                                        </span>
                                      )}
                                  </li>
                                ),
                              )}
                            </ul>
                          </dd>
                        </>
                      )}

                      {at.tilleggsopplysning &&
                        at.tilleggsopplysning.length > 0 && (
                          <>
                            <dt>Tilleggsopplysninger:</dt>
                            <dd>{at.tilleggsopplysning.join(", ")}</dd>
                          </>
                        )}
                    </dl>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

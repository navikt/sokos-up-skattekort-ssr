import {
  Alert,
  Button,
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

      {data && (
        <div className={styles.result}>
          <Heading level="3" size="small" spacing>
            Skattekort for {data.arbeidstaker.navn || data.arbeidstaker.fnr}
          </Heading>

          <dl className={styles.details}>
            <dt>Inntektsår:</dt>
            <dd>{data.inntektsaar}</dd>

            <dt>Arbeidsgiver:</dt>
            <dd>
              {data.arbeidsgiver.organisasjonsnavn ||
                data.arbeidsgiver.organisasjonsnummer}
            </dd>

            {data.skattekort.prosentsats !== undefined && (
              <>
                <dt>Prosentsats:</dt>
                <dd>{data.skattekort.prosentsats}%</dd>
              </>
            )}

            {data.skattekort.tabellnummer && (
              <>
                <dt>Tabellnummer:</dt>
                <dd>{data.skattekort.tabellnummer}</dd>
              </>
            )}

            {data.skattekort.trekkgrunn && (
              <>
                <dt>Trekkgrunn:</dt>
                <dd>{data.skattekort.trekkgrunn}</dd>
              </>
            )}

            {data.skattekort.frikort !== undefined && (
              <>
                <dt>Frikort:</dt>
                <dd>{data.skattekort.frikort ? "Ja" : "Nei"}</dd>
              </>
            )}

            {data.tilleggsopplysninger && (
              <>
                <dt>Tilleggsopplysninger:</dt>
                <dd>{data.tilleggsopplysninger}</dd>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

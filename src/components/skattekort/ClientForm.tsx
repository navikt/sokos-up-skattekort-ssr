import { Button, Heading, TextField, ToggleGroup } from "@navikt/ds-react";
import { useState } from "react";
import styles from "./Form.module.css";

interface Props {
  years: number[];
  defaultYear: string;
  submittedFnr?: string;
  actionUrl: string;
}

export default function ClientForm({
  years,
  defaultYear,
  submittedFnr = "",
  actionUrl,
}: Props) {
  const [fnr, setFnr] = useState(submittedFnr);
  const [fnrError, setFnrError] = useState<string | null>(null);
  const [inntektsaar, setInntektsaar] = useState(defaultYear);

  const validateFnr = (value: string): string | null => {
    if (!value) return "Fødselsnummer er påkrevd";
    if (value.length !== 11) return "Fødselsnummer må være 11 siffer";
    if (!/^\d{11}$/.test(value)) return "Fødselsnummer må inneholde kun tall";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    const error = validateFnr(fnr);
    if (error) {
      e.preventDefault();
      setFnrError(error);
    }
  };

  return (
    <form
      method="POST"
      action={actionUrl}
      onSubmit={handleSubmit}
      className={styles.form}
    >
      <Heading level="2" size="medium" spacing>
        Søk etter skattekort
      </Heading>

      <TextField
        label="Fødselsnummer (11 siffer)"
        name="fnr"
        value={fnr}
        onChange={(e) => {
          setFnr(e.target.value);
          setFnrError(null);
        }}
        error={fnrError}
        autoComplete="off"
        maxLength={11}
        className={styles.input}
      />

      <input type="hidden" name="inntektsaar" value={inntektsaar} />

      <ToggleGroup
        label="Velg inntektsår"
        value={inntektsaar}
        onChange={setInntektsaar}
        size="small"
      >
        {years.map((year) => (
          <ToggleGroup.Item key={year} value={year.toString()}>
            {year}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>

      <Button type="submit" className={styles.submitButton}>
        Søk
      </Button>
    </form>
  );
}

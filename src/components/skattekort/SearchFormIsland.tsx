import { Button, Heading, TextField, ToggleGroup } from "@navikt/ds-react";
import { type ReactNode, useState } from "react";
import styles from "./Form.module.css";

interface Props {
  defaultFnr?: string;
  defaultYear: number;
  years: number[];
  fnrError?: string;
  isLoading?: boolean;
  children?: ReactNode;
}

export default function SearchFormIsland({
  defaultFnr = "",
  defaultYear,
  years,
  fnrError: initialFnrError,
  isLoading = false,
}: Props) {
  const [fnr, setFnr] = useState(defaultFnr);
  const [inntektsaar, setInntektsaar] = useState(defaultYear.toString());
  const [fnrError, setFnrError] = useState<string | null>(
    initialFnrError ?? null,
  );

  const validateFnr = (value: string): string | null => {
    if (!value) return "Fødselsnummer er påkrevd";
    if (value.length !== 11) return "Fødselsnummer må være 11 siffer";
    if (!/^\d{11}$/.test(value)) return "Fødselsnummer må inneholde kun tall";
    return null;
  };

  const handleFnrChange = (value: string) => {
    setFnr(value);
    setFnrError(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const error = validateFnr(fnr);
    if (error) {
      e.preventDefault();
      setFnrError(error);
    }
  };

  return (
    <form
      method="POST"
      action=""
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <Heading level="2" size="medium" spacing>
        Søk etter skattekort
      </Heading>

      <TextField
        name="fnr"
        label="Fødselsnummer (11 siffer)"
        value={fnr}
        onChange={(e) => handleFnrChange(e.target.value)}
        error={fnrError ?? undefined}
        autoComplete="off"
        maxLength={11}
        className={styles.input}
      />

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

      <input type="hidden" name="inntektsaar" value={inntektsaar} />

      <Button type="submit" loading={isLoading} className={styles.submitButton}>
        Søk
      </Button>
    </form>
  );
}

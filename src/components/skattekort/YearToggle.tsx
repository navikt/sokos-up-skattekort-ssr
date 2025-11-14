import { ToggleGroup } from "@navikt/ds-react";
import styles from "./SkattekortSearch.module.css";

interface YearToggleProps {
  years: number[];
  defaultYear: number;
}

export default function YearToggle({ years, defaultYear }: YearToggleProps) {
  const handleYearChange = (value: string) => {
    const yearInput = document.getElementById("year-input") as HTMLInputElement;
    const form = document.getElementById("skattekort-form") as HTMLFormElement;
    const fnrInput = form?.querySelector(
      'input[name="fnr"]',
    ) as HTMLInputElement;

    if (yearInput && form) {
      yearInput.value = value;

      const fnrValue = fnrInput?.value.replace(/[\s.]/g, "");
      if (fnrValue && fnrValue.length === 11 && /^[0-9]{11}$/.test(fnrValue)) {
        form.requestSubmit();
      }
    }
  };

  return (
    <ToggleGroup
      defaultValue={String(defaultYear)}
      size="small"
      onChange={handleYearChange}
    >
      {years.map((year) => (
        <ToggleGroup.Item key={year} value={String(year)}>
          <div className={styles.skattekortsearch__toggleitems}>{year}</div>
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
}

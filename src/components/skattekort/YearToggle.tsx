import { ToggleGroup } from "@navikt/ds-react";
import styles from "./SkattekortSearch.module.css";

interface YearToggleProps {
  years: number[];
  defaultYear: number;
}

export default function YearToggle({ years, defaultYear }: YearToggleProps) {
  return (
    <ToggleGroup defaultValue={String(defaultYear)} size="small">
      {years.map((year) => (
        <ToggleGroup.Item key={year} value={String(year)}>
          <div className={styles.skattekortsearch__toggleitems}>{year}</div>
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
}

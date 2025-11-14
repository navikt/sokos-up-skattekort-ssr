import type { Forskuddstrekk } from "@schema/SkattekortSchema";
import { TrekkodeTekster } from "@components/skattekort/TrekkodeTekster";
import styles from "./ForskuddstrekkSection.module.css";

type Props = {
  forskuddstrekk: Forskuddstrekk;
};

const formatProsentsats = (value?: number) =>
  typeof value === "number" ? value.toString().replace(".", ",") : undefined;

const ForskuddstrekkSection = ({ forskuddstrekk }: Props) => {
  const type =
    TrekkodeTekster.get(forskuddstrekk.trekkode) ?? forskuddstrekk.trekkode;

  const prosentsats = formatProsentsats(forskuddstrekk.prosentsats);
  const prosentSatsOrFrikort = prosentsats
    ? `Prosentsats: ${prosentsats}`
    : `Frikortbeløp: ${formatFrikortbelop(forskuddstrekk.frikortbeloep)}`;

  const showTrekktabell = forskuddstrekk.type === "Trekktabell";

  return (
    <div className={styles.forskuddstrekk__row}>
      <div className={styles.forskuddstrekk__bold}>{type}</div>
      <div className={styles.forskuddstrekk__normal}>
        {prosentSatsOrFrikort}
      </div>
      {showTrekktabell && (
        <>
          <div
            className={styles.forskuddstrekk__bold}
          >{`Tabell ${formatTabellnummer(forskuddstrekk.tabellnummer)}`}</div>
          <div className={styles.forskuddstrekk__normal}>
            {`Antall måneder for trekk: ${formatAntallMaaneder(
              forskuddstrekk.antallMaanederForTrekk,
            )}`}
          </div>
        </>
      )}
    </div>
  );
};

const formatFrikortbelop = (value?: number) =>
  typeof value === "number" ? value.toLocaleString("nb-NO") : "-";

const formatTabellnummer = (value?: string) => value ?? "-";

const formatAntallMaaneder = (value?: number) =>
  typeof value === "number" ? value.toString().replace(".", ",") : "-";

export default ForskuddstrekkSection;

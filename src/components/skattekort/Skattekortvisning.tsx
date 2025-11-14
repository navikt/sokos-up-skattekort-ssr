import type { SkattekortData } from "@schema/SkattekortSchema";
import ForskuddstrekkSection from "@components/skattekort/ForskuddstrekkSection";
import { TilleggsopplysningTekster } from "@components/skattekort/TilleggsopplysningTekster";
import styles from "./SkattekortVisning.module.css";
import commonStyles from "@components/skattekort/commonStyles.module.css";

export type SkattekortvisningProps = {
  data: SkattekortData;
};

const formatIdentifikator = (value: string) =>
  `${value.substring(0, 6)} ${value.substring(6)}`;

const Skattekortvisning = ({ data }: SkattekortvisningProps) => {
  const arbeidsgiver = data[0].arbeidsgiver[0];
  const arbeidstaker = arbeidsgiver.arbeidstaker[0];
  const skattekort = arbeidstaker.skattekort;
  const forskuddstrekkListe = skattekort?.forskuddstrekk ?? [];
  const utstedtTekst = skattekort?.utstedtDato
    ? `Utstedt dato: ${skattekort.utstedtDato}`
    : "Ingen skattekort funnet";
  const tilleggsopplysning = arbeidstaker.tilleggsopplysning?.[0];
  const tilleggsopplysningTekst = tilleggsopplysning
    ? (TilleggsopplysningTekster.get(tilleggsopplysning) ?? tilleggsopplysning)
    : undefined;

  return (
    <div className={styles.skattekortvisning}>
      <div
        className={styles.skattekortvisning__title}
      >{`Skattekort ${arbeidstaker.inntektsaar}`}</div>
      <div>{utstedtTekst}</div>

      <hr className={commonStyles.separator} />

      <div className={commonStyles.bold}>
        {`Arbeidstaker: ${formatIdentifikator(arbeidstaker.arbeidstakeridentifikator)}`}
      </div>

      {tilleggsopplysningTekst && (
        <>
          <div className={commonStyles.separator} />
          <div className={commonStyles.bold}>
            Tilleggsopplysning: {tilleggsopplysningTekst}
          </div>
        </>
      )}

      <div className={styles.skattekortvisning__table}>
        {forskuddstrekkListe.map((forskuddstrekk) => (
          <ForskuddstrekkSection
            key={forskuddstrekk.trekkode}
            forskuddstrekk={forskuddstrekk}
          />
        ))}
      </div>
    </div>
  );
};

export default Skattekortvisning;

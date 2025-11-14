export const formatIdentifikator = (value: string): string =>
  `${value.substring(0, 6)} ${value.substring(6)}`;

export const formatProsentsats = (value?: number): string | undefined =>
  typeof value === "number" ? value.toString().replace(".", ",") : undefined;

export const formatBeløp = (value?: number): string =>
  typeof value === "number" ? value.toLocaleString("nb-NO") : "-";

export const formatNumber = (value?: number): string =>
  typeof value === "number" ? value.toString() : "-";

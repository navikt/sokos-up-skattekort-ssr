export const isEmptyArray = <T>(
  value: T[] | undefined | null,
): value is undefined | null => !value || value.length === 0;

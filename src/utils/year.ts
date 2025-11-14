export const getYearOptions = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const isDecember = now.getMonth() === 11;
  return isDecember
    ? [currentYear - 1, currentYear, currentYear + 1]
    : [currentYear - 1, currentYear];
};

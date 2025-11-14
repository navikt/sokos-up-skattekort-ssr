const DIGITS_ONLY = /^[0-9]{11}$/;

export const sanitizeFnr = (value: string) => value.replace(/[ .]/g, "");

export const isValidFodselsnummer = (fnr: string) => DIGITS_ONLY.test(fnr);

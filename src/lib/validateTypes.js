// This file is a copy of the `validateTypes.js` file from Stylelint's `lib/utils/validateTypes.mjs` file.

/**
 * Checks if the value is a number or a Number object.
 * @param {unknown} value
 * @returns {value is number}
 */
export function isNumber(value) {
  return typeof value === "number" || value instanceof Number;
}

/**
 * Checks if the value is a regular expression.
 * @param {unknown} value
 * @returns {value is RegExp}
 */
export function isRegExp(value) {
  return value instanceof RegExp;
}

/**
 * Checks if the value is a string or a String object.
 * @param {unknown} value
 * @returns {value is string}
 */
export function isString(value) {
  return typeof value === "string" || value instanceof String;
}

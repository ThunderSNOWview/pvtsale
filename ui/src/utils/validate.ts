/**
 * Check whether a value is numeric or not
 */
export function isNumeric(value: any): value is number | string {
  return !isNaN(value) && !isNaN(parseFloat(value));
}

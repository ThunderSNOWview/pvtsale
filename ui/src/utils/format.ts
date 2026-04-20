import BigNumber from "bignumber.js";
import { isNumeric } from "./validate";

export function numberWithCommas(x: any, delimiter: string) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
}

/**
 * Truncates a string by keeping a certain number of characters at the start and end
 * @param s The string to truncate
 * @param start Number of characters to keep at the start
 * @param end Number of characters to keep at the end
 * @returns The truncated string
 */
export function truncateString(s: string | null | undefined, start = 6, end = 4) {
  if (start < 0 || end < 0) throw new Error("Invalid position");
  if (!s) return "";
  if (s.length <= start + end) return s;
  return s.slice(0, start) + "..." + s.slice(s.length - end);
}

export interface FormatNumberOptions<F> {
  /**
   * Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
   * passing `null` will disable rounding
   */
  fractionDigits?: number | null;
  /**
   * A fallback react tree to show when a number is invalid.
   * @default N/A
   */
  fallback?: F;
  /**
   * The string used to separate number.
   */
  delimiter?: string;
  /**
   * Allow zero after decimal point.
   * @default false
   */
  padZero?: boolean;
  /**
   * A string that will be appended to the beginning of the returned result.
   */
  prefix?: string;
  /**
   * A string that will be appended to the ending of the returned result.
   */
  suffix?: string;
}
/**
 * Format a number to easy-to-see
 * @param {*} number - The number needs to format
 * @param {FormatNumberOptions} options - Includes options to customize the results returned
 * @returns A string representing a number in formatted, `option.fallback` will be returned if `number` is invalid
 */
export function formatNumber<F = any>(number: any, options?: FormatNumberOptions<F>): string | F {
  const { fallback = "--", fractionDigits = 2, delimiter = ",", padZero, prefix = "", suffix = "" } = options ?? {};
  if (!(typeof number === "bigint" || isNumeric(number))) {
    return fallback;
  }

  if (number === Infinity) {
    return "Infinity";
  }

  let n = String(number);
  if (n.startsWith("0x")) {
    return n;
  }

  if (isNumeric(fractionDigits)) {
    n = new BigNumber(n).toFixed(fractionDigits);
  }
  if (!padZero && n.split(".").length > 1) {
    n = n.replace(/0*$/g, ""); // remove last zeros after decimal point
  }
  const [naturalPart, decimalPart] = n.split(".");
  return prefix + numberWithCommas(naturalPart, delimiter) + (decimalPart ? `.${decimalPart}` : "") + suffix;
}

export interface CompactNumberOptions<F> {
  /**
   * Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
   */
  fractionDigits?: number;
  /**
   * A fallback react tree to show when a number is invalid.
   * @default --
   */
  fallback?: F;
  prefix?: string;
  suffix?: string;
}
/**
 * Compact large number
 * @param {*} n The number
 * @param {CompactNumberOptions} options Includes options to customize the results returned
 * @returns A compacted number in `K`, `M`, `B` or `T`.
 */
export function compactNumber<F = any>(n: any, options?: CompactNumberOptions<F>) {
  const { fallback = "--", fractionDigits = 2, prefix = "", suffix = "" } = options ?? {};
  if (!isNumeric(n)) {
    return fallback;
  }
  const suffixes = ["", "K", "M", "B", "T", "Q"];
  let suffixNum = Math.floor((n.toString().split(".")[0].length - 1) / 3);

  if (suffixNum >= suffixes.length) {
    suffixNum = suffixes.length - 1;
  }

  const shortValue = (Number(n) / Math.pow(1000, suffixNum)).toFixed(fractionDigits + 2);

  return formatNumber(shortValue, { fractionDigits, prefix, suffix: suffixes[suffixNum] + suffix });
}

function formatSmallValue(
  value: number,
  { fractionDigits = 10, prefix = "", suffix = "" }: { fractionDigits?: number; prefix?: string; suffix?: string } = {}
) {
  if (value >= 1 || value <= 0 || value < Math.pow(10, -fractionDigits)) {
    return prefix + "0" + suffix;
  }

  const [integerPart, decimalPart] = value.toFixed(fractionDigits).split("."); // Ensure enough precision
  const leadingZeros = decimalPart.match(/^0+/)?.[0]?.length || 0; // Count leading zeros

  // Generate the subscript dynamically
  const subscript = leadingZeros
    .toString()
    .split("")
    .map((digit) => String.fromCharCode(0x2080 + parseInt(digit))) // Convert to Unicode subscript
    .join("");

  // Build the formatted string
  const formatted = `${integerPart}.0${subscript}${decimalPart.slice(leadingZeros, leadingZeros + 5)}`;
  return prefix + formatted + suffix;
}

export function formatTokenAmount(amount: any, options?: FormatNumberOptions<string>) {
  if (isNumeric(amount)) {
    const a = Number(amount);
    if (a < 1e-6) {
      return formatSmallValue(a, {
        fractionDigits: options?.fractionDigits ?? 10,
        prefix: options?.prefix ?? "",
        suffix: options?.suffix ?? "",
      });
    }
    if (a < 1e-2) {
      return formatNumber(amount, { ...options, fractionDigits: 6 });
    }
    if (a < 1e-1) {
      return formatNumber(amount, { ...options, fractionDigits: 4 });
    }
    if (a < 1e6) {
      return formatNumber(amount, { ...options, fractionDigits: 2 });
    }
    return formatNumber(amount, { ...options, fractionDigits: 0 });
  }
  return formatNumber(amount, options);
}

/**
 * Escapes special characters in a string for use in a regular expression
 * @param string The string to escape
 * @returns The escaped string
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

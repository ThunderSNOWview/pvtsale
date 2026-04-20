/**
 * Applies a small buffer to `estimateGas` so transactions are less likely to run out of gas.
 */
export function calculateGasMargin(estimatedGas: bigint): bigint {
  return (estimatedGas * 120n) / 100n;
}

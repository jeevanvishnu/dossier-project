/**
 * Helper to safely extract a single string from Express req.params, which can be string | string[].
 */
export function getSingleParam(param: string | string[] | undefined): string | undefined {
  if (!param) return undefined;
  return Array.isArray(param) ? param[0] : param;
}

/**
 * Helper to safely parse an integer ID from Express route parameters.
 */
export function parseIdParam(param: string | string[] | undefined): number {
  const str = getSingleParam(param);
  if (!str) return NaN;
  return parseInt(str, 10);
}

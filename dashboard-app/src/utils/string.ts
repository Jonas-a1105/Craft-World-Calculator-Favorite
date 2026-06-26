/**
 * Converts a string to Capital Case (e.g. "COPPER" -> "Copper")
 */
export const toCapitalCase = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

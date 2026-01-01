import { PercentileOperatorType, OperatorType } from '@/types/cohort';

/**
 * Converts old percentile notation (P5, P95, etc.) to new format
 * @param notation - Old notation like "P5", "P95"
 * @param oldOperator - Old operator like "is Greater than (>)" or "is Less than (<)"
 * @returns Object with new operator and percentage value, or null if conversion fails
 */
export function convertNotationToPercentile(
  notation: string,
  oldOperator: string
): { operator: PercentileOperatorType; percentage: string } | null {
  // Match P followed by digits (case insensitive)
  const match = notation.match(/^P(\d+)$/i);
  if (!match) {
    return null;
  }

  const percentile = parseInt(match[1], 10);
  if (isNaN(percentile) || percentile < 0 || percentile > 100) {
    return null;
  }

  // Determine the appropriate operator based on old operator and percentile value
  const isGreaterThan = oldOperator.includes('Greater');
  const isLessThan = oldOperator.includes('Less');

  // Convert based on common patterns:
  // P5 with < operator = bottom 5%
  // P95 with > operator = top 5%
  // P25 with < operator = bottom 25%
  // P75 with > operator = top 25%

  if (isLessThan) {
    // Less than P5 = bottom 5%, Less than P25 = bottom 25%
    return {
      operator: 'is in bottom X%',
      percentage: percentile.toString(),
    };
  } else if (isGreaterThan) {
    // Greater than P95 = top 5%, Greater than P75 = top 25%
    const topPercentage = 100 - percentile;
    return {
      operator: 'is in top X%',
      percentage: topPercentage.toString(),
    };
  } else {
    // Default: use "below Xth percentile" for less than, "above Xth percentile" for greater than
    if (isLessThan || percentile < 50) {
      return {
        operator: 'is below Xth percentile',
        percentage: percentile.toString(),
      };
    } else {
      return {
        operator: 'is above Xth percentile',
        percentage: percentile.toString(),
      };
    }
  }
}

/**
 * Converts new percentile format back to old notation (for backward compatibility if needed)
 * @param operator - New percentile operator
 * @param percentage - Percentage value (1-100)
 * @returns Old notation like "P5" or "P95", or null if conversion fails
 */
export function convertPercentileToNotation(
  operator: PercentileOperatorType,
  percentage: string
): string | null {
  const percent = parseInt(percentage, 10);
  if (isNaN(percent) || percent < 1 || percent > 100) {
    return null;
  }

  switch (operator) {
    case 'is in top X%':
      // Top 5% = P95, Top 25% = P75
      const topPercentile = 100 - percent;
      return `P${topPercentile}`;
    case 'is in bottom X%':
      // Bottom 5% = P5, Bottom 25% = P25
      return `P${percent}`;
    case 'is above Xth percentile':
      // Above 25th percentile = P25+
      return `P${percent}`;
    case 'is below Xth percentile':
      // Below 75th percentile = P75-
      return `P${percent}`;
    default:
      return null;
  }
}

/**
 * Validates percentile value
 * @param value - Percentage value to validate
 * @returns true if valid (1-100), false otherwise
 */
export function isValidPercentile(value: string): boolean {
  const percent = parseInt(value, 10);
  return !isNaN(percent) && percent >= 1 && percent <= 100;
}

/**
 * Gets a human-readable explanation of what a percentile condition means
 * @param operator - Percentile operator
 * @param percentage - Percentage value
 * @returns Explanation text
 */
export function getPercentileExplanation(
  operator: PercentileOperatorType,
  percentage: string
): string {
  const percent = parseInt(percentage, 10);
  if (isNaN(percent)) return '';

  switch (operator) {
    case 'is in top X%':
      return `Contributors in the top ${percent}% (highest performers)`;
    case 'is in bottom X%':
      return `Contributors in the bottom ${percent}% (lowest performers)`;
    case 'is above Xth percentile':
      return `Contributors above the ${percent}th percentile`;
    case 'is below Xth percentile':
      return `Contributors below the ${percent}th percentile`;
    default:
      return '';
  }
}


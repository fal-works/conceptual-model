/**
 * Type guard that validates if a value is one of the valid values in a set.
 * @param validValues - Set of valid values
 * @param value - Value to validate
 * @returns true if value is in validValues, false otherwise
 */
export function isValidValue<T>(validValues: ReadonlySet<T>, value: unknown): value is T {
	return validValues.has(value as T);
}

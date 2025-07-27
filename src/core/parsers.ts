import { parse } from "yaml";

/**
 * Function type for parsing string content into JavaScript objects.
 */
export type Parser = (content: string) => unknown;

/**
 * Parses JSON string into a JavaScript object.
 * @param content - The JSON content as a string
 * @returns The parsed object
 * @throws Error if JSON parsing fails
 */
export function parseJson(content: string): unknown {
	return JSON.parse(content);
}

/**
 * Parses YAML string into a JavaScript object.
 * @param content - The YAML content as a string
 * @returns The parsed object
 * @throws Error if YAML parsing fails
 */
export function parseYaml(content: string): unknown {
	return parse(content);
}

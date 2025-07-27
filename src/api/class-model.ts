import { transform } from "../core/pipeline.ts";

/**
 * Converts YAML string containing class model data to a Mermaid class diagram string.
 * @param yamlString - The YAML content as a string
 * @returns The generated Mermaid class diagram as a string
 * @throws Error if YAML parsing fails or data is invalid
 */
export function yamlToMermaid(yamlString: string): string {
	return transform(yamlString, "yaml", "class-model-to-mermaid");
}

/**
 * Converts JSON string containing class model data to a Mermaid class diagram string.
 * @param jsonString - The JSON content as a string
 * @returns The generated Mermaid class diagram as a string
 * @throws Error if JSON parsing fails or data is invalid
 */
export function jsonToMermaid(jsonString: string): string {
	return transform(jsonString, "json", "class-model-to-mermaid");
}

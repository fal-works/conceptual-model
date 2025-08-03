import { runStringPipeline } from "../core/string-pipeline.ts";

/**
 * Transforms YAML string containing class model data to a Mermaid class diagram string.
 * @param yamlString - The YAML content as a string
 * @returns The generated Mermaid class diagram as a string
 * @throws Error if YAML parsing fails or data is invalid
 */
export function classModelYamlToMermaid(yamlString: string): string {
	return runStringPipeline(yamlString, "yaml", "class-model-to-mermaid");
}

/**
 * Transforms JSON string containing class model data to a Mermaid class diagram string.
 * @param jsonString - The JSON content as a string
 * @returns The generated Mermaid class diagram as a string
 * @throws Error if JSON parsing fails or data is invalid
 */
export function classModelJsonToMermaid(jsonString: string): string {
	return runStringPipeline(jsonString, "json", "class-model-to-mermaid");
}

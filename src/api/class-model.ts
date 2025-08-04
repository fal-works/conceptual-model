import { convertModel, parseFileContent, validateModel } from "../core/pipeline.ts";
import type { ClassModel } from "../models/class-model/index.ts";

/**
 * Parses and validates a YAML string as a ClassModel.
 * @param yamlString - The YAML content as a string
 * @returns The validated ClassModel
 * @throws Error if YAML parsing fails or data is invalid
 */
export function parseAndValidateClassModelYaml(yamlString: string): ClassModel {
	const parsedData = parseFileContent(yamlString, "yaml");
	return validateModel(parsedData, "class-model");
}

/**
 * Parses and validates a JSON string as a ClassModel.
 * @param jsonString - The JSON content as a string
 * @returns The validated ClassModel
 * @throws Error if JSON parsing fails or data is invalid
 */
export function parseAndValidateClassModelJson(jsonString: string): ClassModel {
	const parsedData = parseFileContent(jsonString, "json");
	return validateModel(parsedData, "class-model");
}

/**
 * Converts a ClassModel to a Mermaid class diagram string.
 * @param model - The ClassModel to convert
 * @returns The generated Mermaid class diagram as a string
 */
export function classModelToMermaid(model: ClassModel): string {
	return convertModel(model, "class-model", "mermaid");
}

/**
 * Transforms YAML string containing class model data to a Mermaid class diagram string.
 * @param yamlString - The YAML content as a string
 * @returns The generated Mermaid class diagram as a string
 * @throws Error if YAML parsing fails or data is invalid
 */
export function classModelYamlToMermaid(yamlString: string): string {
	const model = parseAndValidateClassModelYaml(yamlString);
	return classModelToMermaid(model);
}

/**
 * Transforms JSON string containing class model data to a Mermaid class diagram string.
 * @param jsonString - The JSON content as a string
 * @returns The generated Mermaid class diagram as a string
 * @throws Error if JSON parsing fails or data is invalid
 */
export function classModelJsonToMermaid(jsonString: string): string {
	const model = parseAndValidateClassModelJson(jsonString);
	return classModelToMermaid(model);
}
